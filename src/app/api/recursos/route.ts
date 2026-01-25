// ============================================
// 📚 API Route: /api/recursos
// ============================================
// Endpoints para gestionar recursos

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import type { RecursoTipo } from '@/types/recursos'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { createRecursoSchema, formatZodErrors } from '@/lib/validation/schemas'
import { z } from 'zod'

/**
 * GET /api/recursos
 * Obtiene todos los recursos
 * Query params: ?tipo=pdf|enlace|podcast
 */
export async function GET(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.user || null)
  if (rateLimitError) return rateLimitError

  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') as RecursoTipo | null

    let query = supabase
      .from('recursos')
      .select(`
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
      `)
      .is('deleted_at', null)
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

    // Transformar datos
    const transformed = (data || []).map((r: {
      recursos_asignaturas: Array<{ asignatura: { id: string; nombre: string; codigo: string } | null }>;
      [key: string]: unknown
    }) => {
      const asignaturas = r.recursos_asignaturas
        ?.map((ra) => ra.asignatura)
        .filter(Boolean) || []
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { recursos_asignaturas, ...rest } = r
      return { ...rest, asignaturas }
    })

    return NextResponse.json(transformed)
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
export async function POST(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  try {
    // Verificar autenticación y rol admin
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    
    // ✅ Validación estricta con Zod
    const parseResult = createRecursoSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { tipo, titulo, descripcion, url, asignatura_ids } = parseResult.data

    // Validación adicional: enlaces requieren URL
    if (tipo === 'enlace' && !url) {
      return NextResponse.json(
        { error: 'URL es requerido para enlaces' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Insertar recurso
    const { data, error } = await adminClient
      .from('recursos')
      .insert({
        tipo,
        titulo,
        descripcion: descripcion || null,
        url: url || null,
        created_by: auth.user.id,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creando recurso:', error)
      return NextResponse.json(
        { error: 'Error creando recurso' },
        { status: 500 }
      )
    }

    // Insertar relaciones con asignaturas
    if (asignatura_ids && Array.isArray(asignatura_ids) && asignatura_ids.length > 0) {
      const relations = asignatura_ids.map((asignaturaId: string) => ({
        recurso_id: data.id,
        asignatura_id: asignaturaId,
      }))

      const { error: relationError } = await adminClient
        .from('recursos_asignaturas')
        .insert(relations)

      if (relationError) {
        console.error('Error insertando asignaturas:', relationError)
        // No fallamos, el recurso ya fue creado
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[Recursos POST] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al crear recurso' }, { status: 500 })
  }
}

