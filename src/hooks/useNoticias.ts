'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { htmlToPlainText, extractExtracto } from '@/lib/text-utils'
import { useCsrfToken } from '@/hooks/useCsrfToken'

// Re-export del cliente para uso interno del hook
const getSupabase = () => createClient()

export interface Noticia {
  id: string
  slug: string
  titulo: string
  contenido: string
  imagen_url: string | null
  autor_id: string | null
  publicada: boolean | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  autor?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

export type NoticiaCategoria = 'comunicado' | 'recurso' | 'evento' | 'general'

// Extraer categoría del contenido (primera línea con formato [CATEGORIA])
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

// Re-exportar utilidades de texto para uso en otros archivos
export { htmlToPlainText, extractExtracto }

export interface NoticiaConMeta extends Noticia {
  categoria: NoticiaCategoria
  extracto: string
}

// Hook para obtener todas las noticias publicadas
export function useNoticias(filter?: NoticiaCategoria) {
  const supabase = getSupabase()

  const { data: noticias = [], isLoading, error } = useQuery({
    queryKey: ['noticias', filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          autor:users!autor_id(id, full_name, email, avatar_url)
        `)
        .eq('publicada', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching noticias:', error)
        throw error
      }

      // Añadir metadata
      const noticiasConMeta: NoticiaConMeta[] = (data || []).map((n: Noticia) => ({
        ...n,
        categoria: extractCategoria(n.contenido),
        extracto: extractExtracto(n.contenido),
      }))

      // Filtrar por categoría si se especifica
      if (filter) {
        return noticiasConMeta.filter(n => n.categoria === filter)
      }

      return noticiasConMeta
    },
    staleTime: 60000, // 1 minuto
  })

  return { noticias, isLoading, error }
}

// Hook para obtener una noticia por ID
export function useNoticia(id: string) {
  const supabase = getSupabase()

  const { data: noticia, isLoading, error } = useQuery({
    queryKey: ['noticia', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          autor:users!autor_id(id, full_name, email, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching noticia:', error)
        throw error
      }

      if (!data) return null

      return {
        ...data,
        categoria: extractCategoria(data.contenido),
        extracto: extractExtracto(data.contenido),
      } as NoticiaConMeta
    },
    enabled: !!id,
  })

  return { noticia, isLoading, error }
}

// Hook para crear/editar noticias (admin/editor)
// Usa API routes para evitar recursión en políticas RLS de noticias + users
export function useNoticiasMutation() {
  const queryClient = useQueryClient()
  const { csrfHeaders } = useCsrfToken()

  const createNoticia = useMutation({
    mutationFn: async (data: {
      titulo: string
      slug: string
      contenido: string
      imagen_url?: string | null
      publicada?: boolean
    }) => {
      // Usar API route para bypass RLS (evita recursión infinita)
      const response = await fetch('/api/admin/noticias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la noticia')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })

  const updateNoticia = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      titulo?: string
      slug?: string
      contenido?: string
      imagen_url?: string | null
      publicada?: boolean
    }) => {
      // Usar API route para bypass RLS (evita recursión infinita)
      const response = await fetch(`/api/admin/noticias?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la noticia')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      queryClient.invalidateQueries({ queryKey: ['noticia', variables.id] })
    },
  })

  const deleteNoticia = useMutation({
    mutationFn: async (id: string) => {
      // Usar API route para bypass RLS
      const response = await fetch(`/api/admin/noticias?id=${id}`, {
        method: 'DELETE',
        headers: { ...csrfHeaders },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })

  return {
    createNoticia,
    updateNoticia,
    deleteNoticia,
  }
}
