// ============================================
// 📚 Hook useRecursos
// ============================================
// Obtiene recursos de estudio desde Supabase
// Los archivos están en Cloudflare R2

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Recurso, RecursoTipo } from '@/types/recursos'

/**
 * Hook para obtener todos los recursos
 */
export function useRecursos() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recursos'],
    queryFn: async (): Promise<Recurso[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('recursos')
        .select(`
          id,
          tipo,
          titulo,
          descripcion,
          url,
          archivo_path,
          duracion,
          asignatura_id,
          created_by,
          created_at,
          asignatura:asignaturas(id, nombre, codigo)
        `)
        .is('deleted_at', null) // Solo recursos no eliminados
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recursos:', error)
        throw error
      }

      return (data || []) as Recurso[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

/**
 * Hook para obtener recursos agrupados por tipo
 */
export function useRecursosByType() {
  const { data: recursos, ...rest } = useRecursos()

  const grouped: Record<RecursoTipo, Recurso[]> = {
    pdf: recursos?.filter((r) => r.tipo === 'pdf') || [],
    enlace: recursos?.filter((r) => r.tipo === 'enlace') || [],
    podcast: recursos?.filter((r) => r.tipo === 'podcast') || [],
  }

  return { recursos: grouped, allRecursos: recursos, ...rest }
}

/**
 * Hook para obtener recursos de un tipo específico
 */
export function useRecursosByTipo(tipo: RecursoTipo) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recursos', tipo],
    queryFn: async (): Promise<Recurso[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('recursos')
        .select(`
          id,
          tipo,
          titulo,
          descripcion,
          url,
          archivo_path,
          duracion,
          asignatura_id,
          created_by,
          created_at,
          asignatura:asignaturas(id, nombre, codigo)
        `)
        .eq('tipo', tipo)
        .is('deleted_at', null) // Solo recursos no eliminados
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`Error fetching recursos (${tipo}):`, error)
        throw error
      }

      return (data || []) as Recurso[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

/**
 * Hook para obtener la cuenta de recursos por tipo
 */
export function useRecursosCount() {
  const { recursos, isLoading, error } = useRecursosByType()

  return {
    counts: {
      pdf: recursos.pdf.length,
      enlace: recursos.enlace.length,
      podcast: recursos.podcast.length,
      total: recursos.pdf.length + recursos.enlace.length + recursos.podcast.length,
    },
    isLoading,
    error,
  }
}

