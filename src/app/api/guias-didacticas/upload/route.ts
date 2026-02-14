import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { uuidSchema } from '@/lib/validation/schemas'

// Validar Magic Bytes del PDF
function isPDF(buffer: ArrayBuffer): boolean {
  const arr = new Uint8Array(buffer.slice(0, 5))
  const header = String.fromCharCode(...arr)
  return header === '%PDF-'
}

// Mensajes de error descriptivos por estado de GD
const ESTADO_MESSAGES: Record<string, string> = {
  pendiente: 'Ya existe una GD pendiente de revisión para esta asignatura',
  extrayendo: 'Ya existe una GD en proceso de extracción para esta asignatura',
  extraida: 'Ya existe una GD con datos extraídos pendientes de validación para esta asignatura',
  validada: 'Ya existe una GD validada para esta asignatura en este semestre',
}

export async function POST(request: NextRequest) {
  // Rate limiting (user: 60 req/min)
  const rateLimitError = await withRateLimit(request, rateLimiters?.user || null)
  if (rateLimitError) return rateLimitError

  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  // Verificar autenticación
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // Validar Content-Type del request
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type debe ser multipart/form-data' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const asignaturaId = formData.get('asignatura_id') as string

    if (!file || !asignaturaId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Validar UUID con Zod
    const uuidResult = uuidSchema.safeParse(asignaturaId)
    if (!uuidResult.success) {
      return NextResponse.json({ error: 'ID de asignatura inválido' }, { status: 400 })
    }

    // Validar extensión del archivo
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 })
    }

    // Validar tamaño (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede 10MB' }, { status: 400 })
    }

    // Validar Magic Bytes
    const buffer = await file.arrayBuffer()
    if (!isPDF(buffer)) {
      return NextResponse.json({ error: 'El archivo no es un PDF válido' }, { status: 400 })
    }

    // Obtener semestre activo
    const { data: semestre } = await supabase
      .from('semestres')
      .select('id')
      .eq('activo', true)
      .single()

    if (!semestre) {
      return NextResponse.json({ error: 'No hay semestre activo' }, { status: 400 })
    }

    // Usar admin client para verificar GDs existentes (bypass RLS para ver soft-deleted)
    const adminClient = createAdminClient()

    const { data: existingGDs } = await adminClient
      .from('guias_didacticas')
      .select('id, estado, deleted_at')
      .eq('asignatura_id', asignaturaId)
      .eq('semestre_id', semestre.id)

    if (existingGDs && existingGDs.length > 0) {
      // Separar GDs activas, rechazadas y soft-deleted
      const activeGDs = existingGDs.filter(g => !g.deleted_at && g.estado !== 'rechazada')
      const rejectedGDs = existingGDs.filter(g => !g.deleted_at && g.estado === 'rechazada')
      const softDeletedGDs = existingGDs.filter(g => g.deleted_at)

      // Si hay GDs activas (pendiente/extrayendo/extraida/validada) → bloquear
      if (activeGDs.length > 0) {
        const msg = ESTADO_MESSAGES[activeGDs[0].estado] || 'Ya existe una GD activa para esta asignatura'
        return NextResponse.json({ error: msg }, { status: 400 })
      }

      // Soft-delete GDs rechazadas para permitir re-subida
      if (rejectedGDs.length > 0) {
        const { error: softDeleteError } = await adminClient
          .from('guias_didacticas')
          .update({ deleted_at: new Date().toISOString() })
          .in('id', rejectedGDs.map(g => g.id))

        if (softDeleteError) {
          console.error('Error soft-deleting rejected GDs:', softDeleteError)
          return NextResponse.json({ error: 'Error al procesar la GD rechazada anterior' }, { status: 500 })
        }
      }

      // Hard-delete GDs que ya están soft-deleted (evitar colisión con unique constraint)
      if (softDeletedGDs.length > 0) {
        const { error: hardDeleteError } = await adminClient
          .from('guias_didacticas')
          .delete()
          .in('id', softDeletedGDs.map(g => g.id))

        if (hardDeleteError) {
          console.error('Error hard-deleting soft-deleted GDs:', hardDeleteError)
          // No bloquear: el partial unique index permitirá el INSERT igualmente
        }
      }
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${asignaturaId}_${semestre.id}_${timestamp}_${sanitizedName}`

    // Subir a Storage
    const { error: uploadError } = await supabase.storage
      .from('guias-didacticas')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
    }

    // Crear registro en BD (usar admin client para bypass de RLS)
    const { error: insertError } = await adminClient
      .from('guias_didacticas')
      .insert({
        asignatura_id: asignaturaId,
        semestre_id: semestre.id,
        subido_por: user.id,
        archivo_path: fileName,
        estado: 'pendiente',
        procesada: false
      })

    if (insertError) {
      // Rollback: eliminar archivo
      await supabase.storage.from('guias-didacticas').remove([fileName])
      console.error('DB insert error:', insertError)
      return NextResponse.json(
        { error: `Error al registrar GD: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
