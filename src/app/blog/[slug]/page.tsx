import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostContent } from '@/components/blog/PostContent'
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

async function getPostBySlug(slug: string): Promise<NoticiaConMeta | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('noticias')
    .select(`
      *,
      autor:users!autor_id(id, full_name, email, avatar_url)
    `)
    .eq('slug', slug)
    .eq('publicada', true)
    .is('deleted_at', null)
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

async function getAdjacentPosts(currentSlug: string): Promise<{
  prev: { slug: string; titulo: string } | null
  next: { slug: string; titulo: string } | null
}> {
  const supabase = await createClient()
  
  // Obtener la fecha del post actual
  const { data: current } = await supabase
    .from('noticias')
    .select('created_at')
    .eq('slug', currentSlug)
    .single()

  if (!current) {
    return { prev: null, next: null }
  }

  // Post anterior (más antiguo)
  const { data: prevData } = await supabase
    .from('noticias')
    .select('slug, titulo')
    .eq('publicada', true)
    .is('deleted_at', null)
    .lt('created_at', current.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Post siguiente (más reciente)
  const { data: nextData } = await supabase
    .from('noticias')
    .select('slug, titulo')
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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mifp.app'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post no encontrado | MiFP' }
  }

  const autorNombre = post.autor?.full_name || post.autor?.email?.split('@')[0] || 'MiFP'

  return {
    title: `${post.titulo} | MiFP Blog`,
    description: post.extracto,
    keywords: ['FP', 'ILERNA', 'formación profesional', post.categoria],
    authors: [{ name: autorNombre }],
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    openGraph: {
      title: post.titulo,
      description: post.extracto,
      url: `${baseUrl}/blog/${slug}`,
      siteName: 'MiFP',
      images: post.imagen_url ? [{
        url: post.imagen_url,
        width: 1200,
        height: 630,
        alt: post.titulo,
      }] : undefined,
      locale: 'es_ES',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [autorNombre],
      section: post.categoria,
    },
    twitter: {
      card: post.imagen_url ? 'summary_large_image' : 'summary',
      title: post.titulo,
      description: post.extracto,
      images: post.imagen_url ? [post.imagen_url] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { prev, next } = await getAdjacentPosts(slug)

  return <PostContent post={post} prevPost={prev} nextPost={next} />
}
