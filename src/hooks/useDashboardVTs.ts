'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { VTsByAsignatura, VTItem } from '@/types/vts'

export function useDashboardVTs() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-vts'],
    queryFn: async (): Promise<VTsByAsignatura[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Obtener VTs del usuario agrupadas por asignatura
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('user_asignaturas')
        .select(`
          id,
          asignatura:asignaturas(id, nombre, codigo),
          semestre:semestres!inner(activo),
          user_vts:user_asignatura_vts(
            id, vista,
            vt:asignatura_vts(
              id, numero, titulo, fecha_programada, 
              hora_inicio, duracion_minutos, enlace_grabacion
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('semestre.activo', true)

      if (error) {
        console.error('Error fetching VTs:', error)
        return []
      }

      // Transformar datos al formato esperado
      return (data || []).map((ua: {
        asignatura: { id: string; nombre: string; codigo: string }
        user_vts: Array<{
          id: string
          vista: boolean
          vt: {
            id: string
            numero: number
            titulo: string
            fecha_programada: string
            hora_inicio: string
            duracion_minutos: number
            enlace_grabacion?: string
          }
        }>
      }) => {
        const vts: VTItem[] = (ua.user_vts || [])
          .filter((uv) => uv.vt)
          .map((uv) => ({
            id: uv.vt.id,
            userVtId: uv.id,
            numero: uv.vt.numero,
            titulo: uv.vt.titulo,
            fecha_programada: uv.vt.fecha_programada,
            hora_inicio: uv.vt.hora_inicio,
            duracion_minutos: uv.vt.duracion_minutos,
            enlace_grabacion: uv.vt.enlace_grabacion,
            vista: uv.vista,
          }))
          .sort((a, b) => a.numero - b.numero)

        const vistas = vts.filter(v => v.vista).length

        return {
          asignatura: ua.asignatura,
          vts,
          progreso: {
            total: vts.length,
            vistas,
            porcentaje: vts.length > 0 ? Math.round((vistas / vts.length) * 100) : 0
          }
        }
      }).filter((grupo: VTsByAsignatura) => grupo.asignatura) // Filtrar grupos sin asignatura
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useToggleVTVista() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userVtId, vista }: { userVtId: string; vista: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('user_asignatura_vts')
        .update({ vista, updated_at: new Date().toISOString() })
        .eq('id', userVtId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-vts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
