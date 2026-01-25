import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

/**
 * API Route para enviar notificaciones broadcast a todos los usuarios
 * POST /api/admin/notifications/broadcast
 * Body: { tipo: 'sistema', titulo: string, mensaje: string }
 */
export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación y rol admin
        const auth = await verifyAdmin()
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        // Obtener datos del body
        const body = await request.json()
        const { tipo, titulo, mensaje } = body

        if (!titulo) {
            return NextResponse.json(
                { error: 'El título es requerido' },
                { status: 400 }
            )
        }

        // Usar cliente admin para bypass de RLS
        const adminClient = createAdminClient()

        // Obtener todos los usuarios
        const { data: users, error: usersError } = await adminClient
            .from('users')
            .select('id')

        if (usersError) {
            console.error('Error obteniendo usuarios:', usersError)
            throw usersError
        }

        if (!users || users.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: 'No hay usuarios registrados'
            })
        }

        // Crear notificaciones para todos los usuarios
        const notifications = users.map(u => ({
            user_id: u.id,
            tipo: tipo || 'sistema',
            titulo,
            mensaje: mensaje || null,
            leida: false,
            data: null
        }))

        const { error: insertError } = await adminClient
            .from('notificaciones')
            .insert(notifications)

        if (insertError) {
            console.error('Error insertando notificaciones:', insertError)
            throw insertError
        }

        return NextResponse.json({
            success: true,
            count: users.length,
            message: `Notificación enviada a ${users.length} usuarios`
        })

    } catch (error) {
        console.error('Error en broadcast notification:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
