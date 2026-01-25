import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { gridLayoutSchema, formatZodErrors } from '@/lib/validation/schemas'
import { z } from 'zod'

/**
 * GET /api/user/grid-layout
 * Obtiene el layout del grid del usuario autenticado
 */
export async function GET(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.user || null)
  if (rateLimitError) return rateLimitError

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Usar admin client para bypass RLS
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient
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
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.user || null)
  if (rateLimitError) return rateLimitError

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // ✅ Validación estricta con Zod (máximo 50 widgets)
    const parseResult = gridLayoutSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { layout_config } = parseResult.data

    const adminClient = createAdminClient()

    const { error } = await adminClient
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
  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[Grid Layout] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}

