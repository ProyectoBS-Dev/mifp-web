import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, verifyAdminOrEditor } from '@/lib/supabase/admin'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { logAuditEvent } from '@/lib/audit'
import { 
  createNoticiaSchema, 
  updateNoticiaSchema, 
  uuidSchema,
  formatZodErrors 
} from '@/lib/validation/schemas'
import { z } from 'zod'

// Extraer el path del archivo desde la URL de Supabase Storage
function extractStoragePath(url: string | null): string | null {
  if (!url) return null
  
  // URL típica: https://xxx.supabase.co/storage/v1/object/public/noticias-images/userId/filename.jpg
  const match = url.match(/\/noticias-images\/(.+)$/)
  return match ? match[1] : null
}

// POST - Crear nueva noticia
export async function POST(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  // ✅ CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const auth = await verifyAdminOrEditor()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    
    // ✅ Validación estricta con Zod
    const parseResult = createNoticiaSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { titulo, slug, contenido, imagen_url, publicada } = parseResult.data

    const adminClient = createAdminClient()

    // Verificar unicidad del slug
    const { data: existingSlug } = await adminClient
      .from('noticias')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (existingSlug) {
      return NextResponse.json({ error: 'Ya existe una noticia con este slug. Por favor, elige otro.' }, { status: 400 })
    }

    const { data: noticia, error: insertError } = await adminClient
      .from('noticias')
      .insert({
        titulo,
        slug,
        contenido,
        imagen_url: imagen_url || null,
        autor_id: auth.user.id,
        publicada: publicada ?? true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating noticia:', insertError)
      return NextResponse.json({ error: 'Error al crear la noticia' }, { status: 500 })
    }

    // ✅ Audit logging
    await logAuditEvent({
      action: 'noticia.create',
      userId: auth.user.id,
      resourceType: 'noticia',
      resourceId: noticia.id,
      metadata: { titulo, slug },
    }, request)

    return NextResponse.json(noticia)
  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[Noticias POST] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al crear la noticia' }, { status: 500 })
  }
}

// PATCH - Actualizar noticia existente
export async function PATCH(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  // ✅ CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const auth = await verifyAdminOrEditor()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id')

    // ✅ Validar UUID
    const idParseResult = uuidSchema.safeParse(rawId)
    if (!idParseResult.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    const id = idParseResult.data

    const body = await request.json()
    
    // ✅ Validación estricta
    const parseResult = updateNoticiaSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { titulo, slug, contenido, imagen_url, publicada } = parseResult.data

    const adminClient = createAdminClient()

    // Verificar que la noticia existe y obtener imagen actual
    const { data: existingNoticia, error: fetchError } = await adminClient
      .from('noticias')
      .select('id, autor_id, imagen_url')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingNoticia) {
      return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 })
    }

    // Editores solo pueden actualizar sus propias noticias
    if (auth.role === 'editor' && existingNoticia.autor_id !== auth.user.id) {
      return NextResponse.json({ error: 'Solo puedes editar tus propias noticias' }, { status: 403 })
    }

    // ✅ Si se está actualizando la imagen, borrar la anterior del storage
    if (imagen_url !== undefined && imagen_url !== existingNoticia.imagen_url) {
      const oldImagePath = extractStoragePath(existingNoticia.imagen_url)
      if (oldImagePath) {
        const { error: deleteError } = await adminClient.storage
          .from('noticias-images')
          .remove([oldImagePath])
        
        if (deleteError) {
          console.warn('Error deleting old image from storage:', deleteError)
          // No fallar si no se puede eliminar la imagen antigua
        }
      }
    }

    // Construir objeto de actualización solo con campos proporcionados
    const updateData: Record<string, unknown> = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (slug !== undefined) {
      // Verificar unicidad del nuevo slug (excepto el actual)
      const { data: existingSlug } = await adminClient
        .from('noticias')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .is('deleted_at', null)
        .single()

      if (existingSlug) {
        return NextResponse.json({ error: 'Ya existe una noticia con este slug. Por favor, elige otro.' }, { status: 400 })
      }
      updateData.slug = slug
    }
    if (contenido !== undefined) updateData.contenido = contenido
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url
    if (publicada !== undefined) updateData.publicada = publicada

    const { data: noticia, error: updateError } = await adminClient
      .from('noticias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating noticia:', updateError)
      return NextResponse.json({ error: 'Error al actualizar la noticia' }, { status: 500 })
    }

    // ✅ Audit logging
    await logAuditEvent({
      action: 'noticia.update',
      userId: auth.user.id,
      resourceType: 'noticia',
      resourceId: id,
      metadata: { 
        updatedFields: Object.keys(updateData),
      },
    }, request)

    return NextResponse.json(noticia)
  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[Noticias PATCH] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al actualizar la noticia' }, { status: 500 })
  }
}

// DELETE - Soft delete de noticia (conservar imagen para recuperación)
export async function DELETE(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  // ✅ CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const auth = await verifyAdminOrEditor()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id')

    // ✅ Validar UUID
    const idParseResult = uuidSchema.safeParse(rawId)
    if (!idParseResult.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    const id = idParseResult.data

    const adminClient = createAdminClient()

    // Verificar que la noticia existe
    const { data: noticia, error: fetchError } = await adminClient
      .from('noticias')
      .select('id, autor_id')
      .eq('id', id)
      .single()

    if (fetchError || !noticia) {
      return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 })
    }

    // Editores solo pueden eliminar sus propias noticias
    if (auth.role === 'editor' && noticia.autor_id !== auth.user.id) {
      return NextResponse.json({ error: 'Solo puedes eliminar tus propias noticias' }, { status: 403 })
    }

    // ✅ Soft delete de la noticia (NO borrar imagen para permitir recuperación)
    // La imagen se limpiará automáticamente después de 30 días si no se restaura
    const { error: deleteError } = await adminClient
      .from('noticias')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting noticia:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }

    // ✅ Audit logging
    await logAuditEvent({
      action: 'noticia.delete',
      userId: auth.user.id,
      resourceType: 'noticia',
      resourceId: id,
    }, request)

    return NextResponse.json({ success: true })
  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[Noticias DELETE] Error:', error)
    return NextResponse.json({ error: 'Error al eliminar la noticia' }, { status: 500 })
  }
}
