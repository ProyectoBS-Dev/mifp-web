import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withCsrfProtection } from '@/lib/csrf'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { logAuditEvent } from '@/lib/audit'
import { rejectGDSchema, formatZodErrors } from '@/lib/validation/schemas'
import { GD_REJECTABLE_STATES, countCurriculum } from '@/lib/gd-admin'

/**
 * Rechaza una GD y avisa al usuario que la subió.
 *
 * Solo se puede rechazar desde `pendiente`, `extrayendo` o `extraida`. Una GD
 * `validada` tiene currículo cargado y pasa por «Deshacer» o «Eliminar»; una
 * `extraida` con filas curriculares tampoco se rechaza directamente.
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
    const parseResult = rejectGDSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { gdId, motivo } = parseResult.data
    const adminClient = createAdminClient()

    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select(`
        id, subido_por, asignatura_id, semestre_id, estado,
        asignatura:asignaturas(nombre)
      `)
      .eq('id', gdId)
      .is('deleted_at', null)
      .single()

    if (gdError || !gd) {
      return NextResponse.json({ error: 'GD no encontrada' }, { status: 404 })
    }

    if (!GD_REJECTABLE_STATES.some(estado => estado === gd.estado)) {
      return NextResponse.json(
        { error: `No se puede rechazar una GD en estado «${gd.estado}»` },
        { status: 409 }
      )
    }

    if (gd.estado === 'extraida') {
      const counts = await countCurriculum(adminClient, gd.asignatura_id, gd.semestre_id)
      if (counts.total > 0) {
        return NextResponse.json(
          { error: 'Esta GD tiene datos cargados. Deshazlos o elimínala desde la ficha.' },
          { status: 409 }
        )
      }
    }

    // El UPDATE repite el guard de estado: si otra acción cambió la GD entre la
    // lectura y aquí, no toca ninguna fila y se responde 409
    const { data: updated, error: updateError } = await adminClient
      .from('guias_didacticas')
      .update({
        estado: 'rechazada',
        motivo_rechazo: motivo,
        error_extraccion: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gdId)
      .in('estado', [...GD_REJECTABLE_STATES])
      .is('deleted_at', null)
      .select('id')

    if (updateError) {
      console.error('[GD reject] Error updating state:', updateError)
      return NextResponse.json({ error: 'Error al rechazar la GD' }, { status: 500 })
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'La GD cambió de estado mientras la rechazabas. Recarga la página.' },
        { status: 409 }
      )
    }

    await logAuditEvent({
      action: 'gd.reject',
      userId: auth.user.id,
      resourceType: 'guia_didactica',
      resourceId: gdId,
      metadata: { estadoAnterior: gd.estado, motivo },
    }, request)

    // La notificación solo se envía si el rechazo se aplicó
    if (gd.subido_por) {
      const asignatura = gd.asignatura as { nombre: string } | null
      const nombreAsig = asignatura?.nombre || 'una asignatura'

      const { error: notifError } = await adminClient
        .from('notificaciones')
        .insert({
          user_id: gd.subido_por,
          tipo: 'sistema',
          titulo: 'Guía Didáctica rechazada',
          mensaje: `Tu GD de ${nombreAsig} ha sido rechazada. Motivo: ${motivo}. Puedes volver a subirla.`,
          data: { guia_id: gdId, asignatura_id: gd.asignatura_id, motivo_rechazo: motivo },
        })

      // No falla la operación si la notificación falla
      if (notifError) console.error('[GD reject] Error creating notification:', notifError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[GD reject] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
