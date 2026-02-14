import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withCsrfProtection } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  // Verificar autenticación y rol admin
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { gdId, motivo } = await request.json() as {
      gdId: string
      motivo: string
    }

    if (!gdId || !motivo) {
      return NextResponse.json({ error: 'gdId y motivo requeridos' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Obtener info de la GD para la notificación
    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select(`
        id, subido_por, asignatura_id,
        asignatura:asignaturas(nombre)
      `)
      .eq('id', gdId)
      .single()

    if (gdError || !gd) {
      return NextResponse.json({ error: 'GD no encontrada' }, { status: 404 })
    }

    // Marcar como rechazada
    const { error: updateError } = await adminClient
      .from('guias_didacticas')
      .update({
        estado: 'rechazada',
        motivo_rechazo: motivo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gdId)

    if (updateError) {
      console.error('Error updating GD state:', updateError)
      return NextResponse.json({ error: 'Error al rechazar la GD' }, { status: 500 })
    }

    // Notificar al usuario que subió la GD
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

      if (notifError) {
        console.error('Error creating rejection notification:', notifError)
        // No falla la operación si la notificación falla
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Reject error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error interno'
    }, { status: 500 })
  }
}
