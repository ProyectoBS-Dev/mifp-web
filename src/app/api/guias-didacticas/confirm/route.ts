import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { gdConfirmSchema, formatZodErrors } from '@/lib/validation/schemas'
import {
  GD_BUCKET,
  GD_MAX_FILE_SIZE,
  gdPathPrefix,
  getSemestreActivo,
  isPDF,
  reserveGDSlot,
} from '@/lib/gd-upload'

/**
 * Valida un PDF ya subido a Storage y crea el registro de la GD.
 *
 * Es el único punto donde el archivo pasa a existir para la aplicación, así que
 * aquí se comprueba el contenido real (magic bytes y tamaño leídos de Storage,
 * no lo que declare el navegador). Si algo no cuadra, el archivo se borra y no
 * queda registro.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, rateLimiters?.user || null)
  if (rateLimitError) return rateLimitError

  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  let path: string | undefined

  try {
    const parseResult = gdConfirmSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { asignatura_id: asignaturaId } = parseResult.data
    path = parseResult.data.path

    const semestre = await getSemestreActivo(adminClient)
    if (!semestre) {
      return NextResponse.json({ error: 'No hay semestre activo' }, { status: 400 })
    }

    // El path lo generó `upload-url` con este prefijo, así que un usuario solo
    // puede confirmar su propia subida y nunca otro objeto del bucket
    const expectedPrefix = gdPathPrefix({
      asignaturaId,
      semestreId: semestre.id,
      userId: user.id,
    })

    if (!path.startsWith(expectedPrefix) || path.includes('/')) {
      return NextResponse.json({ error: 'Archivo no válido' }, { status: 400 })
    }

    // Otro usuario puede haber subido la GD de esta asignatura entre la petición
    // de la URL firmada y esta confirmación
    const conflicto = await reserveGDSlot(adminClient, asignaturaId, semestre.id)
    if (conflicto) {
      await adminClient.storage.from(GD_BUCKET).remove([path])
      return NextResponse.json({ error: conflicto }, { status: 400 })
    }

    const { data: file, error: downloadError } = await adminClient.storage
      .from(GD_BUCKET)
      .download(path)

    if (downloadError || !file) {
      console.error('Error downloading uploaded GD:', downloadError)
      return NextResponse.json({ error: 'No se encontró el archivo subido' }, { status: 400 })
    }

    if (file.size > GD_MAX_FILE_SIZE) {
      await adminClient.storage.from(GD_BUCKET).remove([path])
      return NextResponse.json({ error: 'El archivo excede 10MB' }, { status: 400 })
    }

    if (!isPDF(await file.arrayBuffer())) {
      await adminClient.storage.from(GD_BUCKET).remove([path])
      return NextResponse.json({ error: 'El archivo no es un PDF válido' }, { status: 400 })
    }

    const { error: insertError } = await adminClient
      .from('guias_didacticas')
      .insert({
        asignatura_id: asignaturaId,
        semestre_id: semestre.id,
        subido_por: user.id,
        archivo_path: path,
        estado: 'pendiente',
        procesada: false,
      })

    if (insertError) {
      await adminClient.storage.from(GD_BUCKET).remove([path])
      console.error('DB insert error:', insertError)
      return NextResponse.json(
        { error: `Error al registrar GD: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[GD confirm] Error:', error)
    if (path) await adminClient.storage.from(GD_BUCKET).remove([path])
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
