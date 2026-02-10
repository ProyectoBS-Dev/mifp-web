import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { broadcastNotificationSchema, formatZodErrors } from '@/lib/validation/schemas'
import { z } from 'zod'

/**
 * API Route para enviar notificaciones broadcast a todos los usuarios
 * POST /api/admin/notifications/broadcast
 * Body: { tipo: 'sistema', titulo: string, mensaje: string }
 */
export async function POST(request: NextRequest) {
    // ✅ CRÍTICO: Rate limit muy restrictivo (5 req/min)
    const rateLimitError = await withRateLimit(request, rateLimiters?.critical || null)
    if (rateLimitError) return rateLimitError

    // ✅ CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
        // Verificar autenticación y rol admin
        const auth = await verifyAdmin()
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        // Obtener datos del body
        const body = await request.json()
        
        // ✅ Validación estricta con Zod
        const parseResult = broadcastNotificationSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
        }

        const { tipo, titulo, mensaje } = parseResult.data

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
        // ✅ NO exponer detalles internos
        console.error('[Broadcast Notifications] Error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(formatZodErrors(error), { status: 400 })
        }
        
        return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 })
    }
}
