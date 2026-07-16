import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostContent } from '@/components/blog/PostContent'
import type { NoticiaConMeta, NoticiaCategoria } from '@/hooks/useNoticias'
import { extractExtracto } from '@/lib/text-utils'

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
  } as NoticiaConMeta
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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post no encontrado' }
  }

  const autorNombre = post.autor?.full_name || post.autor?.email?.split('@')[0] || 'MiFP'

  return {
    title: post.titulo,
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
      images: [{
        url: post.imagen_url || `${baseUrl}/images/og-default.png`,
        width: 1200,
        height: 630,
        alt: post.titulo,
      }],
      locale: 'es_ES',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [autorNombre],
      section: post.categoria,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.titulo,
      description: post.extracto,
      images: [post.imagen_url || `${baseUrl}/images/og-default.png`],
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

  return (
    <>
      {/* JSON-LD Structured Data - Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.titulo,
            description: post.extracto,
            image: post.imagen_url || `${baseUrl}/images/og-default.png`,
            datePublished: post.created_at,
            dateModified: post.updated_at || post.created_at,
            author: {
              '@type': 'Organization',
              name: 'Equipo MiFP',
              url: baseUrl,
            },
            publisher: {
              '@type': 'EducationalOrganization',
              name: 'MiFP',
              logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/images/isotipo.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${baseUrl}/blog/${slug}`,
            },
          }).replace(/</g, '\\u003c'),
        }}
      />
      <PostContent post={post} prevPost={prev} nextPost={next} />
    </>
  )
}
