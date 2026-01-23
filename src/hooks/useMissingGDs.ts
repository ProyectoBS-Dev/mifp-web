'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface AsignaturaSinGD {
  id: string
  nombre: string
  codigo: string
}

export function useMissingGDs() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['missing-gds'],
    queryFn: async (): Promise<AsignaturaSinGD[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return []
      }

      // 1. Obtener semestre activo
      const { data: semestreActivo, error: semestreError } = await supabase
        .from('semestres')
        .select('id, nombre')
        .eq('activo', true)
        .single()

      if (semestreError || !semestreActivo) {
        return []
      }

      // 2. Obtener asignaturas del usuario en el semestre activo
      const { data: userAsignaturas, error: uaError } = await supabase
        .from('user_asignaturas')
        .select(`
          asignatura_id,
          asignatura:asignaturas(id, nombre, codigo)
        `)
        .eq('user_id', user.id)
        .eq('semestre_id', semestreActivo.id)

      if (uaError || !userAsignaturas || userAsignaturas.length === 0) {
        return []
      }

      // 3. Obtener GDs existentes para estas asignaturas
      const asignaturaIds = userAsignaturas.map((ua: { asignatura_id: string }) => ua.asignatura_id)

      const { data: existingGDs } = await supabase
        .from('guias_didacticas')
        .select('asignatura_id')
        .in('asignatura_id', asignaturaIds)
        .eq('semestre_id', semestreActivo.id)
        .is('deleted_at', null)
        .in('estado', ['pendiente', 'extrayendo', 'extraida', 'validada']) // GDs en proceso o validadas

      const gdsAsignaturaIds = new Set(
        existingGDs?.map((gd: { asignatura_id: string }) => gd.asignatura_id) || []
      )

      // 4. Filtrar asignaturas sin GD
      const asignaturasSinGD = userAsignaturas
        .filter((ua: { asignatura_id: string }) => !gdsAsignaturaIds.has(ua.asignatura_id))
        .map((ua: { asignatura: AsignaturaSinGD }) => ua.asignatura)
        .filter(Boolean)

      return asignaturasSinGD
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
