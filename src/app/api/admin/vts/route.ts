import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET - Listar todas las VTs agrupadas por asignatura
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar rol admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    // Obtener semestre activo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: semestreActivo } = await (supabase as any)
      .from('semestres')
      .select('id, nombre')
      .eq('activo', true)
      .single()

    if (!semestreActivo) {
      return NextResponse.json({ error: 'No hay semestre activo' }, { status: 404 })
    }

    // Obtener VTs del semestre activo agrupadas por asignatura
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: vts, error } = await (supabase as any)
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
    console.error('Error fetching VTs:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 })
  }
}

// POST - Crear una nueva VT
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar rol admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { 
      asignaturaId, 
      semestreId, 
      numero, 
      titulo, 
      fecha_programada, 
      hora_inicio, 
      duracion_minutos, 
      enlace_grabacion 
    } = await request.json()

    if (!asignaturaId || !semestreId || !numero || !titulo) {
      return NextResponse.json({ 
        error: 'asignaturaId, semestreId, numero y titulo son requeridos' 
      }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Preparar hora_inicio (debe ser null si está vacío)
    const horaInicioValue = (typeof hora_inicio === 'string' && hora_inicio.trim() !== '') ? hora_inicio : null

    // Crear la VT
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newVT, error: insertError } = await (adminClient as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userAsignaturas } = await (adminClient as any)
      .from('user_asignaturas')
      .select('id')
      .eq('asignatura_id', asignaturaId)
      .eq('semestre_id', semestreId)

    if (userAsignaturas && userAsignaturas.length > 0) {
      const userVtsToInsert = userAsignaturas.map((ua: { id: string }) => ({
        user_asignatura_id: ua.id,
        vt_id: newVT.id
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('user_asignatura_vts')
        .insert(userVtsToInsert)
    }

    return NextResponse.json({ success: true, vt: newVT })

  } catch (error) {
    console.error('Error creating VT:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 })
  }
}

// PUT - Actualizar una VT (enlace_grabacion principalmente)
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar rol admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { vtId, enlace_grabacion, titulo, fecha_programada, hora_inicio, duracion_minutos } = await request.json()

    if (!vtId) {
      return NextResponse.json({ error: 'vtId requerido' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Construir objeto de actualización
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}
    
    if (enlace_grabacion !== undefined) updateData.enlace_grabacion = enlace_grabacion || null
    if (titulo !== undefined) updateData.titulo = titulo
    if (fecha_programada !== undefined) updateData.fecha_programada = fecha_programada || null
    // hora_inicio debe ser null si está vacío (PostgreSQL TIME no acepta cadena vacía)
    if (hora_inicio !== undefined) {
      updateData.hora_inicio = (typeof hora_inicio === 'string' && hora_inicio.trim() !== '') ? hora_inicio : null
    }
    if (duracion_minutos !== undefined) updateData.duracion_minutos = duracion_minutos

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient as any)
      .from('asignatura_vts')
      .update(updateData)
      .eq('id', vtId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, vt: data })

  } catch (error) {
    console.error('Error updating VT:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 })
  }
}

// DELETE - Eliminar una VT
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar rol admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { vtId } = await request.json()

    if (!vtId) {
      return NextResponse.json({ error: 'vtId requerido' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Primero eliminar los user_asignatura_vts asociados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('user_asignatura_vts')
      .delete()
      .eq('vt_id', vtId)

    // Luego eliminar la VT
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient as any)
      .from('asignatura_vts')
      .delete()
      .eq('id', vtId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting VT:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 })
  }
}

