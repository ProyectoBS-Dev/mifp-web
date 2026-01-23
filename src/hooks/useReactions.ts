'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReactionType, ReactionCounts } from '@/components/blog/ReactionBar'

interface NoticiaReaction {
  id: string
  noticia_id: string
  user_id: string
  tipo_reaccion: ReactionType
  created_at: string
}

// Hook para obtener y manejar reacciones de una noticia
export function useReactions(noticiaId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Obtener todas las reacciones de la noticia
  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['reactions', noticiaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticia_reacciones')
        .select('*')
        .eq('noticia_id', noticiaId)

      if (error) {
        console.error('Error fetching reactions:', error)
        return []
      }
      return data as NoticiaReaction[]
    },
    staleTime: 30000, // 30 segundos
  })

  // Obtener el usuario actual
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 60000 * 5, // 5 minutos
  })

  // Calcular conteos por tipo
  const counts: ReactionCounts = {
    like: reactions.filter(r => r.tipo_reaccion === 'like').length,
    love: reactions.filter(r => r.tipo_reaccion === 'love').length,
    clap: reactions.filter(r => r.tipo_reaccion === 'clap').length,
    fire: reactions.filter(r => r.tipo_reaccion === 'fire').length,
    thinking: reactions.filter(r => r.tipo_reaccion === 'thinking').length,
  }

  // Encontrar la reacción del usuario actual
  const userReaction = currentUser 
    ? reactions.find(r => r.user_id === currentUser.id)?.tipo_reaccion || null
    : null

  // Mutación para reaccionar
  const reactMutation = useMutation({
    mutationFn: async (type: ReactionType) => {
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      const existingReaction = reactions.find(r => r.user_id === currentUser.id)

      if (existingReaction) {
        if (existingReaction.tipo_reaccion === type) {
          // Si es la misma reacción, eliminarla (toggle off)
          const { error } = await supabase
            .from('noticia_reacciones')
            .delete()
            .eq('id', existingReaction.id)
          
          if (error) throw error
          return { action: 'removed', type }
        } else {
          // Cambiar a otro tipo de reacción
          const { error } = await supabase
            .from('noticia_reacciones')
            .update({ tipo_reaccion: type })
            .eq('id', existingReaction.id)
          
          if (error) throw error
          return { action: 'updated', type }
        }
      } else {
        // Nueva reacción
        const { error } = await supabase
          .from('noticia_reacciones')
          .insert({
            noticia_id: noticiaId,
            user_id: currentUser.id,
            tipo_reaccion: type,
          })
        
        if (error) throw error
        return { action: 'added', type }
      }
    },
    onSuccess: () => {
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reactions', noticiaId] })
    },
    onError: (error) => {
      console.error('Error reacting:', error)
    },
  })

  const react = useCallback((type: ReactionType) => {
    reactMutation.mutate(type)
  }, [reactMutation])

  return {
    counts,
    userReaction,
    isLoading,
    react,
    isReacting: reactMutation.isPending,
  }
}

// Hook para obtener reacciones de múltiples noticias (para el feed)
export function useMultipleReactions(noticiaIds: string[]) {
  const supabase = createClient()

  const { data: allReactions = [], isLoading } = useQuery({
    queryKey: ['reactions', 'multiple', noticiaIds.join(',')],
    queryFn: async () => {
      if (noticiaIds.length === 0) return []

      const { data, error } = await supabase
        .from('noticia_reacciones')
        .select('*')
        .in('noticia_id', noticiaIds)

      if (error) {
        console.error('Error fetching multiple reactions:', error)
        return []
      }
      return data as NoticiaReaction[]
    },
    enabled: noticiaIds.length > 0,
    staleTime: 30000,
  })

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 60000 * 5,
  })

  // Organizar por noticia_id
  const reactionsByNoticia = noticiaIds.reduce((acc, id) => {
    const noticiaReactions = allReactions.filter(r => r.noticia_id === id)
    
    acc[id] = {
      counts: {
        like: noticiaReactions.filter(r => r.tipo_reaccion === 'like').length,
        love: noticiaReactions.filter(r => r.tipo_reaccion === 'love').length,
        clap: noticiaReactions.filter(r => r.tipo_reaccion === 'clap').length,
        fire: noticiaReactions.filter(r => r.tipo_reaccion === 'fire').length,
        thinking: noticiaReactions.filter(r => r.tipo_reaccion === 'thinking').length,
      },
      userReaction: currentUser 
        ? noticiaReactions.find(r => r.user_id === currentUser.id)?.tipo_reaccion || null
        : null,
    }
    return acc
  }, {} as Record<string, { counts: ReactionCounts; userReaction: ReactionType | null }>)

  return {
    reactionsByNoticia,
    isLoading,
  }
}
