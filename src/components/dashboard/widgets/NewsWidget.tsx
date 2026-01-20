'use client'

import Link from 'next/link'
import { MessageSquare, ThumbsUp, Heart, Sparkles, Flame, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import { useNoticias, type NoticiaConMeta, type NoticiaCategoria } from '@/hooks/useNoticias'
import { useMultipleReactions } from '@/hooks/useReactions'
import type { ReactionCounts } from '@/components/blog/ReactionBar'

// Colores por categoría (consistente con NewsFeed.tsx)
const CATEGORIA_STYLES: Record<NoticiaCategoria, { bgColor: string; color: string; label: string }> = {
  comunicado: { bgColor: 'bg-vt-blue', color: 'text-white', label: 'COMUNICADO' },
  recurso: { bgColor: 'bg-vt-green', color: 'text-white', label: 'RECURSO' },
  evento: { bgColor: 'bg-vt-purple', color: 'text-white', label: 'EVENTO' },
  general: { bgColor: 'bg-vt-gray-dark-2', color: 'text-white', label: 'GENERAL' },
}

// Componente para mostrar conteo de reacciones (solo lectura)
function ReactionCountsDisplay({ counts }: { counts: ReactionCounts }) {
  const totalReactions = counts.like + counts.love + counts.clap + counts.fire + counts.thinking

  if (totalReactions === 0) return null

  const reactions = [
    { type: 'like', count: counts.like, icon: ThumbsUp, color: 'text-vt-blue' },
    { type: 'love', count: counts.love, icon: Heart, color: 'text-vt-red' },
    { type: 'clap', count: counts.clap, icon: Sparkles, color: 'text-vt-yellow' },
    { type: 'fire', count: counts.fire, icon: Flame, color: 'text-orange-500' },
    { type: 'thinking', count: counts.thinking, icon: Lightbulb, color: 'text-vt-purple' },
  ].filter(r => r.count > 0)

  return (
    <div className="flex items-center gap-2">
      {reactions.map(({ type, count, icon: Icon, color }) => (
        <span key={type} className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Icon className={cn('h-3 w-3', color)} />
          <span>{count}</span>
        </span>
      ))}
    </div>
  )
}

interface NewsCardProps {
  noticia: NoticiaConMeta
  reactionCounts: ReactionCounts
}

function NewsCard({ noticia, reactionCounts }: NewsCardProps) {
  const catStyle = CATEGORIA_STYLES[noticia.categoria]

  return (
    <div className="p-3 rounded-lg border transition-colors hover:bg-muted/50">
      {/* Header: Avatar + Autor + Fecha */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium overflow-hidden">
          {noticia.autor?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={noticia.autor.avatar_url}
              alt={noticia.autor.full_name || 'Avatar'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{noticia.autor?.full_name?.charAt(0) || 'M'}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {noticia.autor?.full_name || 'Equipo MiFP'}
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(noticia.created_at)}
        </span>
      </div>

      {/* Título + Categoría */}
      <div className="flex items-start gap-2 mb-1">
        <h4 className="text-sm font-semibold line-clamp-1 flex-1">{noticia.titulo}</h4>
        <span className={cn(
          'px-2 py-px text-[10px] font-bold tracking-wide rounded-full shrink-0',
          catStyle.bgColor,
          catStyle.color
        )}>
          {catStyle.label}
        </span>
      </div>

      {/* Extracto */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {noticia.extracto}
      </p>

      {/* Footer: Leer más + Reacciones */}
      <div className="flex items-center justify-between">
        <Link
          href={`/blog/${noticia.id}`}
          className="text-xs text-primary hover:underline font-medium"
        >
          Leer más →
        </Link>
        <ReactionCountsDisplay counts={reactionCounts} />
      </div>
    </div>
  )
}

export function NewsWidget() {
  const { noticias, isLoading } = useNoticias()

  // Tomar solo las primeras 3 noticias para el widget
  const displayNoticias = noticias.slice(0, 3)
  const noticiaIds = displayNoticias.map(n => n.id)

  const { reactionsByNoticia } = useMultipleReactions(noticiaIds)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-2">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded mb-1" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (displayNoticias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No hay novedades</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Link Ver todo */}
      <div className="flex justify-end mb-2">
        <Link
          href="/blog"
          className="text-xs text-primary hover:underline font-medium"
        >
          Ver todo →
        </Link>
      </div>

      {/* Lista de noticias */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {displayNoticias.map((noticia) => (
          <NewsCard
            key={noticia.id}
            noticia={noticia}
            reactionCounts={reactionsByNoticia[noticia.id]?.counts || { like: 0, love: 0, clap: 0, fire: 0, thinking: 0 }}
          />
        ))}
      </div>
    </div>
  )
}
