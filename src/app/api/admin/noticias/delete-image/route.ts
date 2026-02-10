import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, verifyAdminOrEditor } from '@/lib/supabase/admin'
import { withCsrfProtection } from '@/lib/csrf'

// Extraer el path del archivo desde la URL de Supabase Storage
function extractStoragePath(url: string | null): string | null {
  if (!url) return null
  
  // URL típica: https://xxx.supabase.co/storage/v1/object/public/noticias-images/userId/filename.jpg
  const match = url.match(/\/noticias-images\/(.+)$/)
  return match ? match[1] : null
}

// DELETE - Eliminar imagen individual del storage
export async function DELETE(request: NextRequest) {
  // ✅ CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    // Verificar autenticación y rol
    const auth = await verifyAdminOrEditor()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400 })
    }

    // Extraer path de storage
    const imagePath = extractStoragePath(imageUrl)
    if (!imagePath) {
      return NextResponse.json({ error: 'URL de imagen inválida' }, { status: 400 })
    }

    // Borrar del storage
    const adminClient = createAdminClient()
    const { error: deleteError } = await adminClient.storage
      .from('noticias-images')
      .remove([imagePath])

    if (deleteError) {
      console.error('Error deleting image from storage:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
