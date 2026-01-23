// ============================================
// 📚 API Route: /api/recursos/[id]
// ============================================
// Endpoints para gestionar un recurso específico

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/recursos/[id]
 * Obtiene un recurso específico
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('recursos')
      .select(`
        id,
        tipo,
        titulo,
        descripcion,
        url,
        archivo_path,
        duracion,
        created_by,
        created_at,
        recursos_asignaturas(
          asignatura:asignaturas(id, nombre, codigo)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Recurso no encontrado' },
          { status: 404 }
        )
      }
      console.error('Error fetching recurso:', error)
      return NextResponse.json(
        { error: 'Error obteniendo recurso' },
        { status: 500 }
      )
    }

    // Transformar datos
    const asignaturas = data.recursos_asignaturas
      ?.map((ra: { asignatura: { id: string; nombre: string; codigo: string } | null }) => ra.asignatura)
      .filter(Boolean) || []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { recursos_asignaturas, ...rest } = data
    const transformed = { ...rest, asignaturas }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error en GET /api/recursos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/recursos/[id]
 * Actualiza un recurso (solo admins)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Verificar autenticación y rol admin
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { titulo, descripcion, url, asignatura_ids } = body

    const adminClient = createAdminClient()

    // Actualizar solo los campos proporcionados del recurso
    const updateData: Record<string, unknown> = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (url !== undefined) updateData.url = url

    // Actualizar recurso si hay campos
    if (Object.keys(updateData).length > 0) {
      const { error } = await adminClient
        .from('recursos')
        .update(updateData)
        .eq('id', id)

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Recurso no encontrado' },
            { status: 404 }
          )
        }
        console.error('Error actualizando recurso:', error)
        return NextResponse.json(
          { error: 'Error actualizando recurso' },
          { status: 500 }
        )
      }
    }

    // Actualizar asignaturas si se proporcionaron
    if (asignatura_ids !== undefined) {
      // Eliminar relaciones existentes
      await adminClient
        .from('recursos_asignaturas')
        .delete()
        .eq('recurso_id', id)

      // Insertar nuevas relaciones
      if (Array.isArray(asignatura_ids) && asignatura_ids.length > 0) {
        const relations = asignatura_ids.map((asignaturaId: string) => ({
          recurso_id: id,
          asignatura_id: asignaturaId,
        }))

        const { error: relationError } = await adminClient
          .from('recursos_asignaturas')
          .insert(relations)

        if (relationError) {
          console.error('Error actualizando asignaturas:', relationError)
        }
      }
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Error en PATCH /api/recursos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/recursos/[id]
 * Soft-delete de un recurso (solo admins)
 * Marca el recurso con deleted_at en lugar de eliminarlo
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Verificar autenticación y rol admin
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Soft delete: marcar con deleted_at en lugar de eliminar
    // Usamos admin client para bypass RLS ya que verificamos permisos manualmente
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient
      .from('recursos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null) // Solo si no está ya eliminado
      .select('id')
      .single()

    if (error) {
      console.error('Error soft-delete recurso:', error)
      return NextResponse.json(
        { error: `Error eliminando recurso: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Recurso no encontrado o ya eliminado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Error en DELETE /api/recursos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

