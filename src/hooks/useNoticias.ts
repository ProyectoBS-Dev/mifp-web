'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Noticia {
  id: string
  titulo: string
  contenido: string
  imagen_url: string | null
  autor_id: string
  publicada: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  autor?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
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

// Convertir HTML a texto plano
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')  // Quitar tags HTML
    .replace(/&nbsp;/g, ' ')   // Reemplazar &nbsp;
    .replace(/&amp;/g, '&')    // Reemplazar &amp;
    .replace(/&lt;/g, '<')     // Reemplazar &lt;
    .replace(/&gt;/g, '>')     // Reemplazar &gt;
    .replace(/\s+/g, ' ')      // Normalizar espacios
    .trim()
}

// Extraer extracto del contenido
function extractExtracto(contenido: string, maxLength = 150): string {
  // Quitar categoría si existe
  let text = contenido.replace(/^\[(\w+)\]\s*/i, '')
  // Quitar markdown headers
  text = text.replace(/^#+\s+/gm, '')
  // Convertir HTML a texto plano
  text = htmlToPlainText(text)
  // Tomar primera parte
  if (text.length > maxLength) {
    return text.slice(0, maxLength).trim() + '...'
  }
  return text.trim()
}

export interface NoticiaConMeta extends Noticia {
  categoria: NoticiaCategoria
  extracto: string
}

// Hook para obtener todas las noticias publicadas
export function useNoticias(filter?: NoticiaCategoria) {
  const supabase = createClient()

  const { data: noticias = [], isLoading, error } = useQuery({
    queryKey: ['noticias', filter],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
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
  const supabase = createClient()

  const { data: noticia, isLoading, error } = useQuery({
    queryKey: ['noticia', id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
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
export function useNoticiasMutation() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const createNoticia = useMutation({
    mutationFn: async (data: {
      titulo: string
      contenido: string
      imagen_url?: string
      publicada?: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: noticia, error } = await (supabase as any)
        .from('noticias')
        .insert({
          titulo: data.titulo,
          contenido: data.contenido,
          imagen_url: data.imagen_url || null,
          autor_id: user.id,
          publicada: data.publicada ?? true,
        })
        .select()
        .single()

      if (error) throw error
      return noticia
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })

  const updateNoticia = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      titulo?: string
      contenido?: string
      imagen_url?: string
      publicada?: boolean
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: noticia, error } = await (supabase as any)
        .from('noticias')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return noticia
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
