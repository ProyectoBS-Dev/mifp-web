import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, verifyAdminOrEditor } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Magic bytes para validar tipos de archivo
const IMAGE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
}

function validateImageSignature(buffer: ArrayBuffer, mimeType: string): boolean {
  const bytes = new Uint8Array(buffer)
  const signature = IMAGE_SIGNATURES[mimeType]
  
  if (!signature) return false
  
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol
    const auth = await verifyAdminOrEditor()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Obtener archivo
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo excede 5MB' }, { status: 400 })
    }

    // Validar tipo MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF' 
      }, { status: 400 })
    }

    // Validar magic bytes
    const arrayBuffer = await file.arrayBuffer()
    if (!validateImageSignature(arrayBuffer, file.type)) {
      return NextResponse.json({ 
        error: 'El archivo no es una imagen válida' 
      }, { status: 400 })
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${auth.user.id}/${fileName}`

    // Subir a Supabase Storage
    const adminClient = createAdminClient()
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('noticias-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
    }

    // Obtener URL pública
    const { data: { publicUrl } } = adminClient.storage
      .from('noticias-images')
      .getPublicUrl(filePath)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: filePath 
    })
  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
