// ============================================
// 📚 API Route: /api/recursos
// ============================================
// Endpoints para gestionar recursos

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RecursoTipo } from '@/types/recursos'

/**
 * GET /api/recursos
 * Obtiene todos los recursos
 * Query params: ?tipo=pdf|enlace|podcast
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') as RecursoTipo | null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('recursos')
      .select(`
        id,
        tipo,
        titulo,
        descripcion,
        url,
        archivo_path,
        duracion,
        asignatura_id,
        created_by,
        created_at,
        asignatura:asignaturas(id, nombre, codigo)
      `)
      .is('deleted_at', null) // Solo recursos no eliminados
      .order('created_at', { ascending: false })

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching recursos:', error)
      return NextResponse.json(
        { error: 'Error obteniendo recursos' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en GET /api/recursos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/recursos
 * Crea un nuevo recurso (solo enlaces, los PDF/podcast vienen de sync)
 * Solo para admins
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar rol admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tipo, titulo, descripcion, url, asignatura_id } = body

    // Validar campos requeridos
    if (!tipo || !titulo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: tipo, titulo' },
        { status: 400 }
      )
    }

    // Para enlaces, url es requerido
    if (tipo === 'enlace' && !url) {
      return NextResponse.json(
        { error: 'URL es requerido para enlaces' },
        { status: 400 }
      )
    }

    // Insertar recurso
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('recursos')
      .insert({
        tipo,
        titulo,
        descripcion: descripcion || null,
        url: url || null,
        asignatura_id: asignatura_id || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creando recurso:', error)
      return NextResponse.json(
        { error: 'Error creando recurso' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/recursos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

