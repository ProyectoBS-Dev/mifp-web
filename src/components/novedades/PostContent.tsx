'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ReactionBar } from './ReactionBar'
import { useReactions } from '@/hooks/useReactions'
import type { NoticiaConMeta } from '@/hooks/useNoticias'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Renderizar contenido (HTML del editor o markdown legacy)
function RenderContent({ content }: { content: string }) {
  // Quitar tag de categoría si existe
  const cleanContent = content.replace(/^\[(\w+)\]\s*/i, '').trim()
  
  // Si contiene tags HTML, renderizar directamente
  if (cleanContent.includes('<p>') || cleanContent.includes('<h2>') || cleanContent.includes('<ul>')) {
    return (
      <div 
        className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:border-b prose-headings:pb-2 prose-headings:mt-8 prose-headings:mb-4
          prose-p:text-foreground/90 prose-p:leading-relaxed
          prose-li:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: cleanContent }} 
      />
    )
  }
  
  // Fallback: procesar como markdown
  return (
    <>
      {cleanContent
        .split('\n\n')
        .map((paragraph, i) => {
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={i} className="text-xl font-bold mt-8 mb-4 pb-2 border-b">
                {paragraph.replace('## ', '')}
              </h2>
            )
          }
          if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
            const items = paragraph.split('\n').filter((line) => line.startsWith('- '))
            return (
              <ul key={i} className="list-disc list-inside space-y-1 my-4">
                {items.map((item, j) => (
                  <li key={j} className="text-foreground/90">
                    <span dangerouslySetInnerHTML={{ 
                      __html: item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </li>
                ))}
              </ul>
            )
          }
          if (/^\d+\./.test(paragraph)) {
            const items = paragraph.split('\n').filter((line) => /^\d+\./.test(line))
            return (
              <ol key={i} className="list-decimal list-inside space-y-1 my-4">
                {items.map((item, j) => (
                  <li key={j} className="text-foreground/90">
                    <span dangerouslySetInnerHTML={{ 
                      __html: item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </li>
                ))}
              </ol>
            )
          }
          return (
            <p key={i} className="text-foreground/90 leading-relaxed my-4">
              {paragraph}
            </p>
          )
        })}
    </>
  )
}

interface PostContentProps {
  post: NoticiaConMeta
  prevPost?: { id: string; titulo: string } | null
  nextPost?: { id: string; titulo: string } | null
}

export function PostContent({ post, prevPost, nextPost }: PostContentProps) {
  const { counts, userReaction, react } = useReactions(post.id)
  const autorNombre = post.autor?.full_name || post.autor?.email?.split('@')[0] || 'Anónimo'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          url: window.location.href,
        })
      } catch {
        // Usuario canceló
      }
    } else {
      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado!')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header con fecha y título */}
      <header className="text-center mb-8">
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(post.created_at)}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {post.titulo}
        </h1>
      </header>

      {/* Imagen destacada */}
      {post.imagen_url && (
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image
            src={post.imagen_url}
            alt={post.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Layout de dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Autor */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.autor?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {autorNombre[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{autorNombre}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            {/* Siguiente artículo */}
            {nextPost && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Siguiente artículo
                </p>
                <Link 
                  href={`/posts/${nextPost.id}`}
                  className="text-sm text-primary hover:underline line-clamp-2"
                >
                  {nextPost.titulo}
                </Link>
              </div>
            )}

            {/* Artículo anterior */}
            {prevPost && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Artículo anterior
                </p>
                <Link 
                  href={`/posts/${prevPost.id}`}
                  className="text-sm text-primary hover:underline line-clamp-2"
                >
                  {prevPost.titulo}
                </Link>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Link 
              href="/novedades"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
          </div>

          {/* Reacciones en sidebar */}
          {/* <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Reacciones
            </p>
            <ReactionBar
              noticiaId={post.id}
              counts={counts}
              userReaction={userReaction}
              onReact={(_, type) => react(type)}
              size="md"
            />
          </div> */}
        </aside>

        {/* Contenido */}
        <article>
          <RenderContent content={post.contenido} />
        </article>
      </div>

      {/* Footer con acciones */}
      <footer className="mt-12 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ReactionBar
              noticiaId={post.id}
              counts={counts}
              userReaction={userReaction}
              onReact={(_, type) => react(type)}
              size="md"
            />
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {prevPost && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/posts/${prevPost.id}`} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Link>
              </Button>
            )}
            {nextPost && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/posts/${nextPost.id}`} className="gap-1">
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
