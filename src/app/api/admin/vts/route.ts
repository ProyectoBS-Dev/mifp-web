import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { 
  createVTSchema, 
  updateVTSchema, 
  deleteVTSchema,
  formatZodErrors 
} from '@/lib/validation/schemas'
import { z } from 'zod'

// GET - Listar todas las VTs agrupadas por asignatura
export async function GET(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const adminClient = createAdminClient()

    // Obtener semestre activo
    const { data: semestreActivo } = await adminClient
      .from('semestres')
      .select('id, nombre')
      .eq('activo', true)
      .single()

    if (!semestreActivo) {
      return NextResponse.json({ error: 'No hay semestre activo' }, { status: 404 })
    }

    // Obtener VTs del semestre activo agrupadas por asignatura
    const { data: vts, error } = await adminClient
      .from('asignatura_vts')
      .select(`
        id,
        numero,
        titulo,
        fecha_programada,
        hora_inicio,
        hora_fin,
        duracion_minutos,
        zoom_meeting_id,
        zoom_passcode,
        enlace_grabacion,
        created_at,
        updated_at,
        asignatura:asignaturas(id, nombre, codigo)
      `)
      .eq('semestre_id', semestreActivo.id)
      .order('numero', { ascending: true })

    if (error) throw error

    // Agrupar por asignatura
    const vtsByAsignatura = new Map<string, {
      asignatura: { id: string; nombre: string; codigo: string }
      vts: typeof vts
    }>()

    for (const vt of vts || []) {
      if (!vt.asignatura) continue
      
      const key = vt.asignatura.id
      if (!vtsByAsignatura.has(key)) {
        vtsByAsignatura.set(key, {
          asignatura: vt.asignatura,
          vts: []
        })
      }
      vtsByAsignatura.get(key)!.vts.push(vt)
    }

    return NextResponse.json({
      semestre: semestreActivo,
      vtsByAsignatura: Array.from(vtsByAsignatura.values())
    })

  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[VTs GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener videotutorías' }, { status: 500 })
  }
}

// POST - Crear una nueva VT
export async function POST(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    
    // ✅ Validación estricta con Zod
    const parseResult = createVTSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { 
      asignaturaId, 
      semestreId, 
      numero, 
      titulo, 
      fecha_programada, 
      hora_inicio, 
      duracion_minutos, 
      enlace_grabacion 
    } = parseResult.data

    const adminClient = createAdminClient()

    // Preparar hora_inicio (debe ser null si está vacío)
    const horaInicioValue = (typeof hora_inicio === 'string' && hora_inicio.trim() !== '') ? hora_inicio : null

    // Crear la VT
    const { data: newVT, error: insertError } = await adminClient
      .from('asignatura_vts')
      .insert({
        asignatura_id: asignaturaId,
        semestre_id: semestreId,
        numero,
        titulo,
        fecha_programada: fecha_programada || null,
        hora_inicio: horaInicioValue,
        duracion_minutos: duracion_minutos || 90,
        enlace_grabacion: enlace_grabacion || null
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Crear registros user_asignatura_vts para usuarios matriculados
    const { data: userAsignaturas } = await adminClient
      .from('user_asignaturas')
      .select('id')
      .eq('asignatura_id', asignaturaId)
      .eq('semestre_id', semestreId)

    if (userAsignaturas && userAsignaturas.length > 0) {
      const userVtsToInsert = userAsignaturas.map((ua: { id: string }) => ({
        user_asignatura_id: ua.id,
        vt_id: newVT.id
      }))

      await adminClient
        .from('user_asignatura_vts')
        .insert(userVtsToInsert)
    }

    return NextResponse.json({ success: true, vt: newVT })

  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[VTs POST] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al crear videotutoría' }, { status: 500 })
  }
}

// PUT - Actualizar una VT (enlace_grabacion principalmente)
export async function PUT(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    
    // ✅ Validación estricta con Zod
    const parseResult = updateVTSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { vtId, enlace_grabacion, titulo, fecha_programada, hora_inicio, duracion_minutos } = parseResult.data

    const adminClient = createAdminClient()

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {}
    
    if (enlace_grabacion !== undefined) updateData.enlace_grabacion = enlace_grabacion || null
    if (titulo !== undefined) updateData.titulo = titulo
    if (fecha_programada !== undefined) updateData.fecha_programada = fecha_programada || null
    // hora_inicio debe ser null si está vacío (PostgreSQL TIME no acepta cadena vacía)
    if (hora_inicio !== undefined) {
      updateData.hora_inicio = (typeof hora_inicio === 'string' && hora_inicio.trim() !== '') ? hora_inicio : null
    }
    if (duracion_minutos !== undefined) updateData.duracion_minutos = duracion_minutos

    const { data, error } = await adminClient
      .from('asignatura_vts')
      .update(updateData)
      .eq('id', vtId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, vt: data })

  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[VTs PUT] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al actualizar videotutoría' }, { status: 500 })
  }
}

// DELETE - Eliminar una VT
export async function DELETE(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    
    // ✅ Validación estricta con Zod
    const parseResult = deleteVTSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const { vtId } = parseResult.data

    const adminClient = createAdminClient()

    // Primero eliminar los user_asignatura_vts asociados
    await adminClient
      .from('user_asignatura_vts')
      .delete()
      .eq('vt_id', vtId)

    // Luego eliminar la VT
    const { error } = await adminClient
      .from('asignatura_vts')
      .delete()
      .eq('id', vtId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    // ✅ NO exponer detalles internos
    console.error('[VTs DELETE] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error al eliminar videotutoría' }, { status: 500 })
  }
}

