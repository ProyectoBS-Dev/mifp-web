'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Filter,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReactionBar, type ReactionType, type ReactionCounts } from './ReactionBar'
import { LoginPromptModal } from './LoginPromptModal'
import { useNoticias, type NoticiaConMeta, type NoticiaCategoria } from '@/hooks/useNoticias'
import { useMultipleReactions } from '@/hooks/useReactions'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_CONFIG: Record<NoticiaCategoria, { label: string; color: string; bgColor: string }> = {
  comunicado: { label: 'COMUNICADO', color: 'text-white', bgColor: 'bg-vt-blue' },
  recurso: { label: 'RECURSO', color: 'text-white', bgColor: 'bg-vt-green' },
  evento: { label: 'EVENTO', color: 'text-white', bgColor: 'bg-vt-purple' },
  general: { label: 'GENERAL', color: 'text-white', bgColor: 'bg-vt-gray-dark-2' },
}

interface NewsCardProps {
  news: NoticiaConMeta
  reactionCounts: ReactionCounts
  userReaction: ReactionType | null
  onReact: (noticiaId: string, type: ReactionType) => void
}

function NewsCard({ news, reactionCounts, userReaction, onReact }: NewsCardProps) {
  const category = CATEGORY_CONFIG[news.categoria]
  const autorNombre = news.autor?.full_name || news.autor?.email?.split('@')[0] || 'Equipo MiFP'
  const autorInicial = news.autor?.full_name?.charAt(0) || 'M'

  return (
    <article className="group bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Imagen con categoría */}
      <div className="relative h-48 overflow-hidden">
        {news.imagen_url ? (
          <Image
            src={news.imagen_url}
            alt={news.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-6xl opacity-30">📰</span>
          </div>
        )}

        {/* Badge categoría */}
        <span className={cn(
          'absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide',
          category.bgColor,
          category.color
        )}>
          {category.label}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Autor y fecha */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={news.autor?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {autorInicial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {autorNombre}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(news.created_at)}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${news.id}`}>
            {news.titulo}
          </Link>
        </h3>

        {/* Extracto */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {news.extracto}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Link
            href={`/blog/${news.id}`}
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Leer más
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Reacciones */}
          <ReactionBar
            noticiaId={news.id}
            counts={reactionCounts}
            userReaction={userReaction}
            onReact={onReact}
            size="sm"
          />
        </div>
      </div>
    </article>
  )
}

export function NewsFeed() {
  const [filter, setFilter] = useState<NoticiaCategoria | 'all'>('all')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { noticias, isLoading } = useNoticias(filter === 'all' ? undefined : filter)

  // Obtener IDs de noticias para cargar reacciones
  const noticiaIds = noticias.map(n => n.id)
  const { reactionsByNoticia } = useMultipleReactions(noticiaIds)

  const supabase = createClient()
  const queryClient = useQueryClient()

  // Verificar si hay usuario autenticado
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 60000 * 5,
  })

  // Mutación para reaccionar
  const reactMutation = useMutation({
    mutationFn: async ({ noticiaId, type }: { noticiaId: string; type: ReactionType }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Verificar si ya tiene una reacción
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from('noticia_reacciones')
        .select('id, tipo_reaccion')
        .eq('noticia_id', noticiaId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        if (existing.tipo_reaccion === type) {
          // Toggle off
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('noticia_reacciones')
            .delete()
            .eq('id', existing.id)
        } else {
          // Cambiar tipo
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('noticia_reacciones')
            .update({ tipo_reaccion: type })
            .eq('id', existing.id)
        }
      } else {
        // Nueva reacción
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('noticia_reacciones')
          .insert({
            noticia_id: noticiaId,
            user_id: user.id,
            tipo_reaccion: type,
          })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', 'multiple'] })
    },
  })

  const handleReact = useCallback((noticiaId: string, type: ReactionType) => {
    // Si no hay usuario autenticado, mostrar modal de login
    if (!currentUser) {
      setShowLoginModal(true)
      return
    }
    reactMutation.mutate({ noticiaId, type })
  }, [reactMutation, currentUser])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtro */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {noticias.length} {noticias.length === 1 ? 'publicación' : 'publicaciones'}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {filter === 'all' ? 'Todas' : CATEGORY_CONFIG[filter]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('all')}>
              Todas las categorías
            </DropdownMenuItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setFilter(key as NoticiaCategoria)}>
                <span className={cn('w-2 h-2 rounded-full mr-2', config.bgColor)} />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {noticias.map((item) => {
          const reactions = reactionsByNoticia[item.id] || {
            counts: { like: 0, love: 0, clap: 0, fire: 0, thinking: 0 },
            userReaction: null,
          }

          return (
            <NewsCard
              key={item.id}
              news={item}
              reactionCounts={reactions.counts}
              userReaction={reactions.userReaction}
              onReact={handleReact}
            />
          )
        })}
      </div>

      {noticias.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'No hay publicaciones aún'
              : 'No hay publicaciones en esta categoría'}
          </p>
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

