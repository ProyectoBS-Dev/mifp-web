import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/noticias/[id]/slug
 * Obtiene el slug de una noticia por su ID
 * Usado para resolver URLs antiguas en notificaciones
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('noticias')
      .select('slug')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ slug: data.slug })
  } catch (error) {
    console.error('Error fetching noticia slug:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
