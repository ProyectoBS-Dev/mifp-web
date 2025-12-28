'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type NivelGamificacion = 'pichon' | 'junior' | 'leyenda' | 'maestro'

export const nivelConfig: Record<NivelGamificacion, { label: string; emoji: string; range: [number, number] }> = {
  pichon: { label: 'Pichón', emoji: '🐣', range: [0, 25] },
  junior: { label: 'Mouredev Junior', emoji: '👨‍💻', range: [26, 50] },
  leyenda: { label: 'Leyenda', emoji: '🔥', range: [51, 75] },
  maestro: { label: 'Maestro', emoji: '🧙‍♂️', range: [76, 100] },
}

function calculateNivel(porcentaje: number): NivelGamificacion {
  if (porcentaje <= 25) return 'pichon'
  if (porcentaje <= 50) return 'junior'
  if (porcentaje <= 75) return 'leyenda'
  return 'maestro'
}

export interface DashboardStats {
  asignaturas: number
  pacsTotal: number
  pacsCompletadas: number
  pacsPendientes: number
  vtsTotal: number
  vtsVistas: number
  vtsPendientes: number
  nivel: NivelGamificacion
  porcentajeTotal: number
}

export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Contar asignaturas del usuario en semestre activo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userAsignaturas } = await (supabase as any)
        .from('user_asignaturas')
        .select(`
          id,
          semestre:semestres!inner(activo)
        `)
        .eq('user_id', user.id)
        .eq('semestre.activo', true)

      const asignaturasCount = userAsignaturas?.length || 0

      // Obtener PACs del usuario
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pacs } = await (supabase as any)
        .from('user_asignatura_pacs')
        .select(`
          id, completada,
          user_asignatura:user_asignaturas!inner(
            semestre:semestres!inner(activo)
          )
        `)
        .eq('user_asignatura.semestre.activo', true)

      const pacsData = pacs || []
      const pacsCompletadas = pacsData.filter((p: { completada: boolean }) => p.completada).length

      // Obtener VTs del usuario
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: vts } = await (supabase as any)
        .from('user_asignatura_vts')
        .select(`
          id, vista,
          user_asignatura:user_asignaturas!inner(
            semestre:semestres!inner(activo)
          )
        `)
        .eq('user_asignatura.semestre.activo', true)

      const vtsData = vts || []
      const vtsVistas = vtsData.filter((v: { vista: boolean }) => v.vista).length

      // Calcular porcentaje total para nivel de gamificación
      const vtsPercent = vtsData.length > 0 ? (vtsVistas / vtsData.length) * 100 : 0
      const pacsPercent = pacsData.length > 0 ? (pacsCompletadas / pacsData.length) * 100 : 0
      const porcentajeTotal = Math.round((vtsPercent + pacsPercent) / 2)

      return {
        asignaturas: asignaturasCount,
        pacsTotal: pacsData.length,
        pacsCompletadas,
        pacsPendientes: pacsData.length - pacsCompletadas,
        vtsTotal: vtsData.length,
        vtsVistas,
        vtsPendientes: vtsData.length - vtsVistas,
        nivel: calculateNivel(porcentajeTotal),
        porcentajeTotal,
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
