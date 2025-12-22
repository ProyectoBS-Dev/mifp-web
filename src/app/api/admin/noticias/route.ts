import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin client con service_role para bypasear RLS
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createAdminClient(supabaseUrl, serviceRoleKey)
}

// Verificar que el usuario es admin o editor
async function verifyAdminOrEditor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado', status: 401 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || !['admin', 'editor'].includes(userData.role)) {
    return { error: 'No autorizado', status: 403 }
  }

  return { user, role: userData.role }
}

// Extraer el path del archivo desde la URL de Supabase Storage
function extractStoragePath(url: string | null): string | null {
  if (!url) return null
  
  // URL típica: https://xxx.supabase.co/storage/v1/object/public/noticias-images/userId/filename.jpg
  const match = url.match(/\/noticias-images\/(.+)$/)
  return match ? match[1] : null
}

// DELETE - Soft delete de noticia + eliminar imagen
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminOrEditor()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const adminClient = getAdminClient()

    // Verificar que la noticia existe y obtener imagen_url
    const { data: noticia, error: fetchError } = await adminClient
      .from('noticias')
      .select('id, autor_id, imagen_url')
      .eq('id', id)
      .single()

    if (fetchError || !noticia) {
      return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 })
    }

    // Editores solo pueden eliminar sus propias noticias
    if (auth.role === 'editor' && noticia.autor_id !== auth.user.id) {
      return NextResponse.json({ error: 'Solo puedes eliminar tus propias noticias' }, { status: 403 })
    }

    // Eliminar imagen del Storage si existe
    const imagePath = extractStoragePath(noticia.imagen_url)
    if (imagePath) {
      const { error: storageError } = await adminClient.storage
        .from('noticias-images')
        .remove([imagePath])
      
      if (storageError) {
        console.warn('Error deleting image from storage:', storageError)
        // No fallar si no se puede eliminar la imagen
      }
    }

    // Soft delete de la noticia
    const { error: deleteError } = await adminClient
      .from('noticias')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting noticia:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete noticia error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
