import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/user/grid-layout
 * Obtiene el layout del grid del usuario autenticado
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Usar admin client para bypass RLS
    const adminClient = createAdminClient()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient as any)
      .from('user_grid_layout')
      .select('layout_config, updated_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[API grid-layout GET] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      layout_config: data?.layout_config || [],
      updated_at: data?.updated_at 
    })
  } catch (err) {
    console.error('[API grid-layout GET] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * PUT /api/user/grid-layout
 * Actualiza el layout del grid del usuario autenticado
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { layout_config } = body

    if (!Array.isArray(layout_config)) {
      return NextResponse.json({ error: 'layout_config debe ser un array' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient as any)
      .from('user_grid_layout')
      .update({ 
        layout_config: layout_config,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

