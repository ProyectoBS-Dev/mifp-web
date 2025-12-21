'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  asignaturas: number
  pacsTotal: number
  pacsCompletadas: number
  pacsPendientes: number
  vtsTotal: number
  vtsVistas: number
  vtsPendientes: number
  mediaNotas: number | null
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
          id, completada, nota,
          user_asignatura:user_asignaturas!inner(
            semestre:semestres!inner(activo)
          )
        `)
        .eq('user_asignatura.semestre.activo', true)

      const pacsData = pacs || []
      const pacsCompletadas = pacsData.filter((p: { completada: boolean }) => p.completada).length
      const notasValidas = pacsData
        .filter((p: { nota: number | null }) => p.nota !== null)
        .map((p: { nota: number }) => p.nota)

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

      // Calcular media de notas
      const mediaNotas = notasValidas.length > 0
        ? notasValidas.reduce((a: number, b: number) => a + b, 0) / notasValidas.length
        : null

      return {
        asignaturas: asignaturasCount,
        pacsTotal: pacsData.length,
        pacsCompletadas,
        pacsPendientes: pacsData.length - pacsCompletadas,
        vtsTotal: vtsData.length,
        vtsVistas,
        vtsPendientes: vtsData.length - vtsVistas,
        mediaNotas: mediaNotas ? Math.round(mediaNotas * 100) / 100 : null,
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
