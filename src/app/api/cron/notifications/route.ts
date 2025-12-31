import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    // Verificar autorización
    // En desarrollo: permitir sin auth
    // En producción: verificar CRON_SECRET o similar
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
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
    console.error('Cron notifications error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// También permitir GET para Vercel Cron (que usa GET por defecto)
export async function GET(request: NextRequest) {
  return POST(request)
}

