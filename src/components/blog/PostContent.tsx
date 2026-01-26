'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Share2, Sparkles, UserPlus } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ReactionBar, type ReactionType } from './ReactionBar'
import { LoginPromptModal } from './LoginPromptModal'
import { useReactions } from '@/hooks/useReactions'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { NoticiaConMeta } from '@/hooks/useNoticias'
import DOMPurify from 'isomorphic-dompurify'

// Configuración de sanitización
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'del', 'ins',
    'ul', 'ol', 'li',
    'a', 'code', 'pre', 'blockquote', 'br', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'class'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/)/i,
  ALLOW_DATA_ATTR: false,
}

// Función de sanitización segura (funciona en SSR y cliente)
function sanitizeHTML(html: string, options?: { allowedTags?: string[], allowedAttr?: string[] }): string {
  return DOMPurify.sanitize(html, {
    ...SANITIZE_CONFIG,
    ...(options?.allowedTags && { ALLOWED_TAGS: options.allowedTags }),
    ...(options?.allowedAttr && { ALLOWED_ATTR: options.allowedAttr }),
  })
}

// Renderizar contenido (HTML del editor o markdown legacy)
function RenderContent({ content }: { content: string }) {
  // Quitar tag de categoría si existe
  const cleanContent = content.replace(/^\[(\w+)\]\s*/i, '').trim()

  // ✅ SIEMPRE SANITIZAR antes de renderizar HTML
  const sanitizedContent = useMemo(() => sanitizeHTML(cleanContent), [cleanContent])

  // Si contiene tags HTML, renderizar con sanitización
  if (cleanContent.includes('<p>') || cleanContent.includes('<h2>') || cleanContent.includes('<ul>')) {
    return (
      <div
        className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:border-b prose-headings:pb-2 prose-headings:mt-8 prose-headings:mb-4
          prose-p:text-foreground/90 prose-p:leading-relaxed
          prose-li:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
                {items.map((item, j) => {
                  // ✅ Sanitizar cada item antes de renderizar
                  const processedItem = item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  const sanitizedItem = sanitizeHTML(processedItem, {
                    allowedTags: ['strong', 'em'],
                    allowedAttr: [],
                  })
                  return (
                    <li key={j} className="text-foreground/90">
                      <span dangerouslySetInnerHTML={{ __html: sanitizedItem }} />
                    </li>
                  )
                })}
              </ul>
            )
          }
          if (/^\d+\./.test(paragraph)) {
            const items = paragraph.split('\n').filter((line) => /^\d+\./.test(line))
            return (
              <ol key={i} className="list-decimal list-inside space-y-1 my-4">
                {items.map((item, j) => {
                  // ✅ Sanitizar cada item antes de renderizar
                  const processedItem = item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  const sanitizedItem = sanitizeHTML(processedItem, {
                    allowedTags: ['strong', 'em'],
                    allowedAttr: [],
                  })
                  return (
                    <li key={j} className="text-foreground/90">
                      <span dangerouslySetInnerHTML={{ __html: sanitizedItem }} />
                    </li>
                  )
                })}
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
  prevPost?: { slug: string; titulo: string } | null
  nextPost?: { slug: string; titulo: string } | null
}

export function PostContent({ post, prevPost, nextPost }: PostContentProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { counts, userReaction, react } = useReactions(post.id)
  const autorNombre = post.autor?.full_name || post.autor?.email?.split('@')[0] || 'Equipo MiFP'
  const autorInicial = post.autor?.full_name?.charAt(0) || 'M'

  const supabase = createClient()

  // Verificar si hay usuario autenticado
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 60000 * 5,
  })

  const handleReact = (type: ReactionType) => {
    if (!currentUser) {
      setShowLoginModal(true)
      return
    }
    react(type)
  }

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
            unoptimized={post.imagen_url.toLowerCase().endsWith('.gif')}
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
                {autorInicial}
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
                  href={`/blog/${nextPost.slug}`}
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
                  href={`/blog/${prevPost.slug}`}
                  className="text-sm text-primary hover:underline line-clamp-2"
                >
                  {prevPost.titulo}
                </Link>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Link
              href="/blog"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
          </div>
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
              onReact={(_, type) => handleReact(type)}
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
                <Link href={`/blog/${prevPost.slug}`} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Link>
              </Button>
            )}
            {nextPost && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/blog/${nextPost.slug}`} className="gap-1">
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* CTA para usuarios no autenticados */}
      {!currentUser && (
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">¿Te ha gustado este artículo?</h3>
              <p className="text-muted-foreground">
                Regístrate gratis para acceder a todas las herramientas de MiFP:
                gestión de PACs, videotutorías, notas y mucho más.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/registro">
                  <UserPlus className="h-5 w-5" />
                  Crear cuenta gratis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de login para reacciones */}
      <LoginPromptModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </div>
  )
}

