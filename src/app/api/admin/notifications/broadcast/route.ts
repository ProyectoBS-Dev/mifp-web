import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * API Route para enviar notificaciones broadcast a todos los usuarios
 * POST /api/admin/notifications/broadcast
 * Body: { tipo: 'sistema', titulo: string, mensaje: string }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        // Verificar que es admin
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        const userProfile = profile as { role: string } | null
        if (userProfile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado. Solo administradores pueden enviar notificaciones broadcast.' },
                { status: 403 }
            )
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
        const supabaseAdmin = createAdminClient()

        // Obtener todos los usuarios
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: users, error: usersError } = await (supabaseAdmin
            .from('users') as any)
            .select('id')

        if (usersError) {
            console.error('Error obteniendo usuarios:', usersError)
            throw usersError
        }

        const usersList = users as Array<{ id: string }> | null
        if (!usersList || usersList.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: 'No hay usuarios registrados'
            })
        }

        // Crear notificaciones para todos los usuarios
        const notifications = usersList.map(u => ({
            user_id: u.id,
            tipo: tipo || 'sistema',
            titulo,
            mensaje: mensaje || null,
            leida: false,
            data: null
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabaseAdmin
            .from('notificaciones') as any)
            .insert(notifications)

        if (insertError) {
            console.error('Error insertando notificaciones:', insertError)
            throw insertError
        }

        return NextResponse.json({
            success: true,
            count: usersList.length,
            message: `Notificación enviada a ${usersList.length} usuarios`
        })

    } catch (error) {
        console.error('Error en broadcast notification:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
