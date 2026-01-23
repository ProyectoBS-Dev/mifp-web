// ============================================
// 📚 Hook useRecursos
// ============================================
// Obtiene recursos de estudio desde Supabase
// Filtra por asignaturas en las que el usuario está matriculado
// Los recursos sin asignaturas son visibles para todos

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Recurso, RecursoTipo } from '@/types/recursos'

/**
 * Hook para obtener todos los recursos visibles para el usuario
 * - Recursos sin asignaturas: visibles para todos
 * - Recursos con asignaturas: solo visibles si el usuario está matriculado
 */
export function useRecursos() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recursos'],
    queryFn: async (): Promise<Recurso[]> => {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return []
      }

      // 2. Obtener asignaturas del usuario
      const { data: userAsignaturas } = await supabase
        .from('user_asignaturas')
        .select('asignatura_id')
        .eq('user_id', user.id)

      const userAsignaturaIds = userAsignaturas?.map(ua => ua.asignatura_id) || []

      // 3. Obtener todos los recursos con sus asignaturas
      const { data: recursos, error } = await supabase
        .from('recursos')
        .select(`
          id,
          tipo,
          titulo,
          descripcion,
          url,
          archivo_path,
          duracion,
          created_by,
          created_at,
          recursos_asignaturas(
            asignatura:asignaturas(id, nombre, codigo)
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recursos:', error)
        throw error
      }

      // 4. Transformar y filtrar recursos
      const filteredRecursos = (recursos || [])
        .map((r: { 
          recursos_asignaturas: Array<{ asignatura: { id: string; nombre: string; codigo: string } | null }>;
          [key: string]: unknown 
        }) => {
          // Extraer asignaturas del join
          const asignaturas = r.recursos_asignaturas
            ?.map((ra: { asignatura: { id: string; nombre: string; codigo: string } | null }) => ra.asignatura)
            .filter(Boolean) || []
          
          // Remover el campo anidado
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { recursos_asignaturas, ...rest } = r
          
          return {
            ...rest,
            asignaturas,
          } as Recurso
        })
        .filter((recurso: Recurso) => {
          // Recursos sin asignaturas: visibles para todos
          if (!recurso.asignaturas || recurso.asignaturas.length === 0) {
            return true
          }
          // Recursos con asignaturas: solo si el usuario está matriculado en alguna
          return recurso.asignaturas.some(a => userAsignaturaIds.includes(a.id))
        })

      return filteredRecursos as Recurso[]
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
 * Nota: Este hook obtiene todos sin filtrar por usuario (uso admin)
 */
export function useRecursosByTipo(tipo: RecursoTipo) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recursos', tipo],
    queryFn: async (): Promise<Recurso[]> => {
      const { data, error } = await supabase
        .from('recursos')
        .select(`
          id,
          tipo,
          titulo,
          descripcion,
          url,
          archivo_path,
          duracion,
          created_by,
          created_at,
          recursos_asignaturas(
            asignatura:asignaturas(id, nombre, codigo)
          )
        `)
        .eq('tipo', tipo)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`Error fetching recursos (${tipo}):`, error)
        throw error
      }

      // Transformar datos
      return (data || []).map((r: { 
        recursos_asignaturas: Array<{ asignatura: { id: string; nombre: string; codigo: string } | null }>;
        [key: string]: unknown 
      }) => {
        const asignaturas = r.recursos_asignaturas
          ?.map((ra: { asignatura: { id: string; nombre: string; codigo: string } | null }) => ra.asignatura)
          .filter(Boolean) || []
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { recursos_asignaturas, ...rest } = r
        return { ...rest, asignaturas } as Recurso
      })
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

