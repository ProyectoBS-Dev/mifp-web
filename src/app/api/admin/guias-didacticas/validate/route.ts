import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import type { Json } from '@/types/database'
import { withCsrfProtection } from '@/lib/csrf'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { logAuditEvent } from '@/lib/audit'
import { validateGDDataSchema, formatZodErrors } from '@/lib/validation/schemas'
import { countCurriculum } from '@/lib/gd-admin'

interface InsertGDDataResult {
  success: boolean
  error?: string
  inserted_ras?: number
  inserted_pacs?: number
  inserted_vts?: number
  skipped_pacs?: number
}

/**
 * Fragmentos de los mensajes de guard de `insert_gd_data` y del trigger. Se
 * traducen a 409 (conflicto de estado) en vez de 500, porque no son un fallo
 * del servidor sino una validación que se coló entre la comprobación previa y
 * la RPC (por ejemplo, dos validaciones simultáneas).
 */
const CONFLICT_MESSAGES = [
  'Solo se puede validar',
  'ya tiene RAs o PACs',
  'no existe o está eliminada',
  'no coinciden',
]

/**
 * Valida una GD: inserta RAs, PACs y VTs revisados por el admin y la marca como
 * `validada`.
 *
 * Los guards de verdad (estado `extraida`, sin RAs/PACs previos, GD existente)
 * viven dentro de `insert_gd_data` para que sean atómicos; las comprobaciones de
 * esta ruta solo sirven para responder con un 409 y un mensaje claro.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const parseResult = validateGDDataSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { gdId, datos } = parseResult.data
    const adminClient = createAdminClient()

    // Asignatura y semestre salen siempre de la fila de la GD, nunca del body
    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select('id, asignatura_id, semestre_id, estado')
      .eq('id', gdId)
      .is('deleted_at', null)
      .single()

    if (gdError || !gd) {
      return NextResponse.json({ error: 'GD no encontrada' }, { status: 404 })
    }

    if (gd.estado !== 'extraida') {
      return NextResponse.json(
        { error: 'Solo se puede validar una GD con datos extraídos. Extrae los datos primero.' },
        { status: 409 }
      )
    }

    const counts = await countCurriculum(adminClient, gd.asignatura_id, gd.semestre_id)
    if (counts.ras > 0 || counts.pacs > 0) {
      return NextResponse.json(
        {
          error:
            'Esta asignatura ya tiene RAs o PACs cargados en este semestre. ' +
            'Deshaz los datos existentes desde la ficha antes de validar de nuevo.',
        },
        { status: 409 }
      )
    }

    const { data: result, error: rpcError } = await adminClient.rpc('insert_gd_data', {
      p_gd_id: gd.id,
      p_asignatura_id: gd.asignatura_id,
      p_semestre_id: gd.semestre_id,
      p_ras: datos.ras as unknown as Json,
      p_pacs: datos.pacs as unknown as Json,
      p_vts: datos.vts as unknown as Json,
      p_validada_por: auth.user.id,
    })

    if (rpcError) {
      console.error('[GD validate] RPC error:', rpcError)
      return NextResponse.json({ error: 'Error al guardar los datos de la GD' }, { status: 500 })
    }

    // La RPC no lanza: devuelve { success: false, error } y revierte todo
    const rpcResult = result as unknown as InsertGDDataResult | null

    if (!rpcResult?.success) {
      const message = rpcResult?.error ?? 'Error al guardar los datos de la GD'
      const isConflict = CONFLICT_MESSAGES.some(fragment => message.includes(fragment))
      return NextResponse.json({ error: message }, { status: isConflict ? 409 : 500 })
    }

    await logAuditEvent({
      action: 'gd.validate',
      userId: auth.user.id,
      resourceType: 'guia_didactica',
      resourceId: gd.id,
      metadata: {
        insertedRAs: rpcResult.inserted_ras ?? 0,
        insertedPACs: rpcResult.inserted_pacs ?? 0,
        insertedVTs: rpcResult.inserted_vts ?? 0,
        skippedPACs: rpcResult.skipped_pacs ?? 0,
      },
    }, request)

    return NextResponse.json({
      success: true,
      insertedRAs: rpcResult.inserted_ras ?? 0,
      insertedPACs: rpcResult.inserted_pacs ?? 0,
      insertedVTs: rpcResult.inserted_vts ?? 0,
      skippedPACs: rpcResult.skipped_pacs ?? 0,
    })
  } catch (error) {
    console.error('[GD validate] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
