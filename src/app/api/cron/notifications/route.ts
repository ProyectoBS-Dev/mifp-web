import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'

/**
 * API Route para generar notificaciones automáticas
 * 
 * DESARROLLO: Llamar manualmente via POST /api/cron/notifications
 * PRODUCCIÓN: Conectar a Vercel Cron o similar
 * 
 * Para usar con Vercel Cron, añadir en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/notifications",
 *     "schedule": "* /30 * * * *"  // (sin espacio) Cada 30 minutos
 *   }]
 * }
 */

// Crear cliente Supabase con service_role para bypass de RLS
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    // ✅ SIEMPRE verificar autenticación (no solo en producción)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // ✅ CRON_SECRET es OBLIGATORIO
    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET no configurado')
      return NextResponse.json(
        { error: 'Servicio no disponible' },
        { status: 503 }
      )
    }
    
    // ✅ SIEMPRE verificar token (desarrollo Y producción)
    if (authHeader !== `Bearer ${cronSecret}`) {
      const forwardedFor = request.headers.get('x-forwarded-for')
      const realIp = request.headers.get('x-real-ip')
      const requestIp = forwardedFor?.split(',')[0] || realIp || 'unknown'
      
      console.warn('[CRON] Intento de acceso no autorizado:', {
        ip: requestIp,
        timestamp: new Date().toISOString(),
        hasHeader: !!authHeader,
      })
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // ✅ Rate limit CRÍTICO (5 req/min)
    const rateLimitError = await withRateLimit(
      request,
      rateLimiters?.critical || null,
      'cron-notifications'
    )
    if (rateLimitError) return rateLimitError
    
    const supabase = createServiceClient()
    
    // Ejecutar la función maestra que genera todas las notificaciones
    const { data, error } = await supabase.rpc('run_all_notification_generators')
    
    if (error) {
      console.error('Error generating notifications:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // La función SQL ya retorna un objeto con success, timestamp, results y total_generated
    return NextResponse.json(data)
    
  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[CRON] Error:', error)
    return NextResponse.json({ error: 'Error al generar notificaciones' }, { status: 500 })
  }
}

// También permitir GET para Vercel Cron (que usa GET por defecto)
export async function GET(request: NextRequest) {
  return POST(request)
}

