import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import type { ExtractedGDData } from '@/types/gd'
import { withCsrfProtection } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  // ✅ CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  // Verificar autenticación y rol admin
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { gdId, datos } = await request.json() as { 
      gdId: string
      datos: ExtractedGDData 
    }

    if (!gdId || !datos) {
      return NextResponse.json({ error: 'gdId y datos requeridos' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Obtener info de la GD
    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select('id, asignatura_id, semestre_id')
      .eq('id', gdId)
      .single()

    if (gdError || !gd) {
      return NextResponse.json({ error: 'GD no encontrada' }, { status: 404 })
    }

    // Usar la función SQL para insertar todos los datos
    const { data: result, error: rpcError } = await adminClient.rpc('insert_gd_data', {
      p_gd_id: gdId,
      p_asignatura_id: gd.asignatura_id,
      p_semestre_id: gd.semestre_id,
      p_ras: datos.ras as unknown as never,
      p_pacs: datos.pacs as unknown as never,
      p_vts: datos.vts as unknown as never
    })

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      // Si la función no existe, hacer inserción manual
      if (rpcError.code === '42883') {
        return await insertDataManually(adminClient, gdId, gd, datos)
      }
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    // Cast del resultado de la RPC
    const rpcResult = result as unknown as { 
      success: boolean
      error?: string
      inserted_ras?: number
      inserted_pacs?: number
      inserted_vts?: number
    }

    if (rpcResult && !rpcResult.success) {
      return NextResponse.json({ error: rpcResult.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      insertedRAs: rpcResult?.inserted_ras || 0,
      insertedPACs: rpcResult?.inserted_pacs || 0,
      insertedVTs: rpcResult?.inserted_vts || 0
    })

  } catch (error) {
    console.error('Validate error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 })
  }
}

// Inserción manual si la función SQL no existe
async function insertDataManually(
  adminClient: ReturnType<typeof createAdminClient>, 
  gdId: string, 
  gd: { asignatura_id: string; semestre_id: string }, 
  datos: ExtractedGDData
) {
  const raIdMap = new Map<number, string>()
  let insertedRAs = 0
  let insertedPACs = 0
  let insertedVTs = 0

  // Helper: extraer número del código del RA (ej: "RA5" → 5, "RA6" → 6)
  const extractRANumber = (codigo: string): number => {
    const match = codigo.match(/\d+/)
    return match ? parseInt(match[0], 10) : 0
  }

  try {
    // 1. Insertar RAs
    for (const ra of datos.ras) {
      const { data: insertedRA, error } = await adminClient
        .from('asignatura_ras')
        .insert({
          asignatura_id: gd.asignatura_id,
          semestre_id: gd.semestre_id,
          numero: ra.numero,
          codigo: ra.codigo,
          titulo: ra.titulo,
          descripcion: ra.descripcion,
          fecha_inicio: ra.fecha_inicio,
          fecha_fin: ra.fecha_fin
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error inserting RA:', error)
        continue
      }

      // FIX: Usar el número del código (RA5 → 5) en vez del número secuencial
      // Esto permite que las PACs con ra_numero: 5 encuentren el RA correcto
      const raNumeroFromCodigo = extractRANumber(ra.codigo)
      raIdMap.set(raNumeroFromCodigo, insertedRA.id)
      insertedRAs++
    }

    // 2. Insertar PACs
    for (const pac of datos.pacs) {
      const raId = raIdMap.get(pac.ra_numero)
      if (!raId) {
        console.warn(`PAC "${pac.titulo}" omitida: RA ${pac.ra_numero} no encontrado en el mapa. RAs disponibles: ${Array.from(raIdMap.keys()).join(', ')}`)
        continue
      }

      const { error } = await adminClient
        .from('asignatura_pacs')
        .insert({
          asignatura_id: gd.asignatura_id,
          semestre_id: gd.semestre_id,
          ra_id: raId,
          numero: pac.numero_global,
          numero_en_ra: pac.numero_en_ra,
          tipo_pac: pac.tipo, // tipo_pac en el schema, no tipo
          titulo: pac.titulo,
          peso_nota: pac.peso_en_ra, // peso_nota en el schema, no peso_en_ra
          fecha_limite: pac.fecha_limite,
          nota_minima: pac.nota_minima || 5
        })

      if (error) {
        console.error('Error inserting PAC:', error)
        continue
      }
      insertedPACs++
    }

    // 3. Insertar VTs
    for (const vt of datos.vts) {
      const { error } = await adminClient
        .from('asignatura_vts')
        .insert({
          asignatura_id: gd.asignatura_id,
          semestre_id: gd.semestre_id,
          numero: vt.numero,
          titulo: vt.titulo,
          fecha_programada: vt.fecha || null,
          // hora_inicio es columna TIME separada, no va concatenada con fecha
          hora_inicio: vt.hora_inicio || null,
          duracion_minutos: vt.duracion_minutos
        })

      if (error) {
        console.error('Error inserting VT:', error)
        continue
      }
      insertedVTs++
    }

    // 4. Actualizar GD como validada
    await adminClient
      .from('guias_didacticas')
      .update({ 
        estado: 'validada',
        procesada: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', gdId)

    // 5. Crear user_asignatura_pacs y user_asignatura_vts para usuarios matriculados
    // Obtener PACs y VTs recién creados
    const { data: newPacs } = await adminClient
      .from('asignatura_pacs')
      .select('id')
      .eq('asignatura_id', gd.asignatura_id)
      .eq('semestre_id', gd.semestre_id)

    const { data: newVts } = await adminClient
      .from('asignatura_vts')
      .select('id')
      .eq('asignatura_id', gd.asignatura_id)
      .eq('semestre_id', gd.semestre_id)

    // Obtener user_asignaturas matriculados (necesitamos el id de user_asignaturas)
    const { data: userAsignaturas } = await adminClient
      .from('user_asignaturas')
      .select('id')
      .eq('asignatura_id', gd.asignatura_id)
      .eq('semestre_id', gd.semestre_id)

    if (userAsignaturas && userAsignaturas.length > 0) {
      // Crear user_asignatura_pacs
      if (newPacs && newPacs.length > 0) {
        const userPacsToInsert = userAsignaturas.flatMap((ua: { id: string }) => 
          newPacs.map((p: { id: string }) => ({
            user_asignatura_id: ua.id,
            pac_id: p.id
          }))
        )
        // Usar insert con ignoreDuplicates en lugar de upsert
        await adminClient
          .from('user_asignatura_pacs')
          .insert(userPacsToInsert)
          .select()
      }

      // Crear user_asignatura_vts
      if (newVts && newVts.length > 0) {
        const userVtsToInsert = userAsignaturas.flatMap((ua: { id: string }) => 
          newVts.map((v: { id: string }) => ({
            user_asignatura_id: ua.id,
            vt_id: v.id
          }))
        )
        await adminClient
          .from('user_asignatura_vts')
          .insert(userVtsToInsert)
          .select()
      }
    }

    return NextResponse.json({ 
      success: true,
      insertedRAs,
      insertedPACs,
      insertedVTs
    })

  } catch (error) {
    console.error('Manual insert error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error al insertar datos' 
    }, { status: 500 })
  }
}
