// ============================================
// 📚 API Route: /api/user/favoritos
// ============================================
// Endpoints para gestionar recursos favoritos del usuario

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/user/favoritos
 * Obtiene todos los recursos marcados como favoritos por el usuario actual
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener favoritos del usuario con datos completos del recurso
    const { data, error } = await supabase
      .from('user_recursos_favoritos')
      .select(`
        id,
        recurso_id,
        created_at,
        recursos (
          id,
          tipo,
          titulo,
          descripcion,
          url,
          archivo_path,
          duracion,
          created_by,
          created_at,
          recursos_asignaturas(
            asignatura:asignaturas(id, nombre, codigo)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favoritos:', error)
      return NextResponse.json(
        { error: 'Error obteniendo favoritos' },
        { status: 500 }
      )
    }

    // Transformar datos para que coincidan con el tipo Recurso
    const favoritos = (data || []).map((fav) => {
      if (!fav.recursos) return null
      
      const recurso = fav.recursos as {
        id: string
        tipo: string
        titulo: string
        descripcion: string | null
        url: string | null
        archivo_path: string | null
        duracion: number | null
        created_by: string | null
        created_at: string
        recursos_asignaturas: Array<{
          asignatura: { id: string; nombre: string; codigo: string } | null
        }>
      }

      const asignaturas = recurso.recursos_asignaturas
        ?.map((ra) => ra.asignatura)
        .filter(Boolean) || []

      return {
        ...recurso,
        asignaturas,
        favorito_id: fav.id, // ID del favorito para poder eliminarlo
        favorito_created_at: fav.created_at
      }
    }).filter(Boolean)

    return NextResponse.json(favoritos)
  } catch (error) {
    console.error('Error en GET /api/user/favoritos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/favoritos
 * Marca un recurso como favorito
 * Body: { recurso_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recurso_id } = body

    if (!recurso_id) {
      return NextResponse.json(
        { error: 'recurso_id es requerido' },
        { status: 400 }
      )
    }

    // Insertar favorito
    const { data, error } = await supabase
      .from('user_recursos_favoritos')
      .insert({
        user_id: user.id,
        recurso_id
      })
      .select()
      .single()

    if (error) {
      // Error 23505 = violación de constraint único (ya existe)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Este recurso ya está en favoritos' },
          { status: 409 }
        )
      }

      console.error('Error adding favorito:', error)
      return NextResponse.json(
        { error: 'Error agregando a favoritos' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/user/favoritos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/favoritos?recurso_id=xxx
 * Elimina un recurso de favoritos
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const recurso_id = searchParams.get('recurso_id')

    if (!recurso_id) {
      return NextResponse.json(
        { error: 'recurso_id es requerido' },
        { status: 400 }
      )
    }

    // Eliminar favorito
    const { error } = await supabase
      .from('user_recursos_favoritos')
      .delete()
      .eq('user_id', user.id)
      .eq('recurso_id', recurso_id)

    if (error) {
      console.error('Error deleting favorito:', error)
      return NextResponse.json(
        { error: 'Error eliminando de favoritos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/user/favoritos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
