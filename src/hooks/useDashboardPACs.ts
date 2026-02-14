'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PACItem } from '@/types/pacs'

export function useDashboardPACs() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-pacs'],
    queryFn: async (): Promise<PACItem[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Obtener PACs del usuario para el semestre activo
      const { data, error } = await supabase
        .from('user_asignatura_pacs')
        .select(`
          id, completada, nota, fecha_limite_personalizada,
          pac:asignatura_pacs(
            id, numero, titulo, fecha_limite,
            ra:asignatura_ras(numero, titulo),
            asignatura:asignaturas(nombre, codigo)
          ),
          user_asignatura:user_asignaturas!inner(
            semestre:semestres!inner(activo)
          )
        `)
        .eq('user_asignatura.semestre.activo', true)
        .order('pac(fecha_limite)', { ascending: true })

      if (error) {
        console.error('Error fetching PACs:', error)
        return []
      }

      // Transformar los datos al formato esperado
      return (data || []).map((item: {
        id: string
        completada: boolean | null
        nota: number | null
        fecha_limite_personalizada: string | null
        pac: {
          id: string
          numero: number
          titulo: string
          fecha_limite: string | null
          ra: { numero: number; titulo: string } | null
          asignatura: { nombre: string; codigo: string }
        }
      }) => ({
        id: item.pac?.id || '',
        userPacId: item.id,
        numero: item.pac?.numero || 0,
        titulo: item.pac?.titulo || '',
        asignatura: item.pac?.asignatura || { nombre: '', codigo: '' },
        ra: item.pac?.ra || { numero: 0, titulo: '' },
        fecha_limite: item.fecha_limite_personalizada || item.pac?.fecha_limite || '',
        completada: item.completada ?? false,
        nota: item.nota,
      })).filter((pac) => pac.id) // Filtrar PACs sin datos
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

export function useTogglePACCompletada() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userPacId, completada }: { userPacId: string; completada: boolean }) => {
      const { error } = await supabase
        .from('user_asignatura_pacs')
        .update({ completada, updated_at: new Date().toISOString() })
        .eq('id', userPacId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-pacs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
