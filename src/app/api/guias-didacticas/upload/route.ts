import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Validar Magic Bytes del PDF
function isPDF(buffer: ArrayBuffer): boolean {
  const arr = new Uint8Array(buffer.slice(0, 5))
  const header = String.fromCharCode(...arr)
  return header === '%PDF-'
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const asignaturaId = formData.get('asignatura_id') as string

    if (!file || !asignaturaId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Validar tamaño (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede 10MB' }, { status: 400 })
    }

    // Validar Magic Bytes
    const buffer = await file.arrayBuffer()
    if (!isPDF(buffer)) {
      return NextResponse.json({ error: 'El archivo no es un PDF válido' }, { status: 400 })
    }

    // Obtener semestre activo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: semestre } = await (supabase as any)
      .from('semestres')
      .select('id')
      .eq('activo', true)
      .single()

    if (!semestre) {
      return NextResponse.json({ error: 'No hay semestre activo' }, { status: 400 })
    }

    const semestreId = (semestre as { id: string }).id

    // Verificar que no exista GD para esta asignatura/semestre
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingGD } = await (supabase as any)
      .from('guias_didacticas')
      .select('id')
      .eq('asignatura_id', asignaturaId)
      .eq('semestre_id', semestreId)
      .is('deleted_at', null)
      .single()

    if (existingGD) {
      return NextResponse.json({ error: 'Ya existe una GD para esta asignatura en este semestre' }, { status: 400 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${asignaturaId}_${semestreId}_${timestamp}_${sanitizedName}`

    // Subir a Storage
    const { error: uploadError } = await supabase.storage
      .from('guias-didacticas')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
    }

    // Crear registro en BD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('guias_didacticas')
      .insert({
        asignatura_id: asignaturaId,
        semestre_id: semestreId,
        subido_por: user.id,
        archivo_path: fileName,
        estado: 'pendiente',
        procesada: false
      })

    if (insertError) {
      // Rollback: eliminar archivo
      await supabase.storage.from('guias-didacticas').remove([fileName])
      console.error('DB insert error:', insertError)
      return NextResponse.json({ error: 'Error al registrar GD' }, { status: 500 })
    }

    // TODO: En el futuro, aquí se puede disparar un trigger/webhook 
    // para notificar a los admins de la nueva GD

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
