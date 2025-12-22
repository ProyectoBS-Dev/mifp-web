import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostContent } from '@/components/novedades/PostContent'
import type { NoticiaConMeta, NoticiaCategoria } from '@/hooks/useNoticias'

// Extraer categoría del contenido
function extractCategoria(contenido: string): NoticiaCategoria {
  const match = contenido.match(/^\[(\w+)\]/i)
  if (match) {
    const cat = match[1].toLowerCase()
    if (['comunicado', 'recurso', 'evento', 'general'].includes(cat)) {
      return cat as NoticiaCategoria
    }
  }
  return 'general'
}

// Extraer extracto del contenido
function extractExtracto(contenido: string, maxLength = 150): string {
  let text = contenido.replace(/^\[(\w+)\]\s*/i, '')
  text = text.replace(/^#+\s+/gm, '')
  if (text.length > maxLength) {
    return text.slice(0, maxLength).trim() + '...'
  }
  return text.trim()
}

async function getPost(id: string): Promise<NoticiaConMeta | null> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('noticias')
    .select(`
      *,
      autor:users!autor_id(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    categoria: extractCategoria(data.contenido),
    extracto: extractExtracto(data.contenido),
  }
}

async function getAdjacentPosts(currentId: string): Promise<{
  prev: { id: string; titulo: string } | null
  next: { id: string; titulo: string } | null
}> {
  const supabase = await createClient()
  
  // Obtener la fecha del post actual
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (supabase as any)
    .from('noticias')
    .select('created_at')
    .eq('id', currentId)
    .single()

  if (!current) {
    return { prev: null, next: null }
  }

  // Post anterior (más antiguo)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prevData } = await (supabase as any)
    .from('noticias')
    .select('id, titulo')
    .eq('publicada', true)
    .is('deleted_at', null)
    .lt('created_at', current.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Post siguiente (más reciente)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: nextData } = await (supabase as any)
    .from('noticias')
    .select('id, titulo')
    .eq('publicada', true)
    .is('deleted_at', null)
    .gt('created_at', current.created_at)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return {
    prev: prevData || null,
    next: nextData || null,
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  
  if (!post) {
    return { title: 'Post no encontrado | MiFP' }
  }

  return {
    title: `${post.titulo} | MiFP`,
    description: post.extracto,
    openGraph: {
      title: post.titulo,
      description: post.extracto,
      images: post.imagen_url ? [post.imagen_url] : undefined,
    },
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  const { prev, next } = await getAdjacentPosts(id)

  return <PostContent post={post} prevPost={prev} nextPost={next} />
}
