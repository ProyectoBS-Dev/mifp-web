import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { gdUploadUrlSchema, formatZodErrors } from '@/lib/validation/schemas'
import {
  GD_BUCKET,
  buildGDPath,
  gdPathPrefix,
  getSemestreActivo,
  removeOrphanGDFiles,
  reserveGDSlot,
} from '@/lib/gd-upload'

/**
 * Devuelve una URL firmada para que el navegador suba el PDF directamente a
 * Storage.
 *
 * El archivo no pasa por aquí a propósito: el body de una función de Vercel está
 * limitado a 4.5MB y las GDs pueden ser mayores. El PDF se valida de verdad en
 * `/api/guias-didacticas/confirm`, que es quien crea el registro en la BD.
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

  try {
    const parseResult = gdUploadUrlSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { asignatura_id: asignaturaId, file_name: fileName } = parseResult.data

    const adminClient = createAdminClient()

    const semestre = await getSemestreActivo(adminClient)
    if (!semestre) {
      return NextResponse.json({ error: 'No hay semestre activo' }, { status: 400 })
    }

    const conflicto = await reserveGDSlot(adminClient, asignaturaId, semestre.id)
    if (conflicto) {
      return NextResponse.json({ error: conflicto }, { status: 400 })
    }

    const prefix = gdPathPrefix({
      asignaturaId,
      semestreId: semestre.id,
      userId: user.id,
    })

    // Descartar PDFs de intentos anteriores que nunca se confirmaron
    await removeOrphanGDFiles(adminClient, prefix)

    const path = buildGDPath({
      asignaturaId,
      semestreId: semestre.id,
      userId: user.id,
      fileName,
    })

    const { data: signed, error: signedError } = await adminClient.storage
      .from(GD_BUCKET)
      .createSignedUploadUrl(path)

    if (signedError || !signed) {
      console.error('Error creating signed upload URL:', signedError)
      return NextResponse.json({ error: 'No se pudo preparar la subida' }, { status: 500 })
    }

    return NextResponse.json({ path: signed.path, token: signed.token })
  } catch (error) {
    console.error('[GD upload-url] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
