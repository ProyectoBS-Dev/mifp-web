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
        console.log('[useMissingGDs] No user authenticated')
        return []
      }

      // 1. Obtener semestre activo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: semestreActivo, error: semestreError } = await (supabase as any)
        .from('semestres')
        .select('id, nombre')
        .eq('activo', true)
        .single()

      if (semestreError) {
        console.log('[useMissingGDs] Error getting semestre activo:', semestreError.message)
        return []
      }

      if (!semestreActivo) {
        console.log('[useMissingGDs] No hay semestre activo')
        return []
      }

      console.log('[useMissingGDs] Semestre activo:', semestreActivo.nombre)

      // 2. Obtener asignaturas del usuario en el semestre activo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userAsignaturas, error: uaError } = await (supabase as any)
        .from('user_asignaturas')
        .select(`
          asignatura_id,
          asignatura:asignaturas(id, nombre, codigo)
        `)
        .eq('user_id', user.id)
        .eq('semestre_id', semestreActivo.id)

      if (uaError) {
        console.log('[useMissingGDs] Error getting user_asignaturas:', uaError.message)
        return []
      }

      if (!userAsignaturas || userAsignaturas.length === 0) {
        console.log('[useMissingGDs] Usuario no tiene asignaturas matriculadas en semestre activo')
        return []
      }

      console.log('[useMissingGDs] Asignaturas del usuario:', userAsignaturas.length)

      // 3. Obtener GDs existentes para estas asignaturas
      const asignaturaIds = userAsignaturas.map((ua: { asignatura_id: string }) => ua.asignatura_id)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingGDs, error: gdError } = await (supabase as any)
        .from('guias_didacticas')
        .select('asignatura_id')
        .in('asignatura_id', asignaturaIds)
        .eq('semestre_id', semestreActivo.id)
        .is('deleted_at', null)
        .in('estado', ['pendiente', 'extrayendo', 'extraida', 'validada']) // GDs en proceso o validadas

      if (gdError) {
        console.log('[useMissingGDs] Error getting guias_didacticas:', gdError.message)
      }

      const gdsAsignaturaIds = new Set(
        (existingGDs || []).map((gd: { asignatura_id: string }) => gd.asignatura_id)
      )

      console.log('[useMissingGDs] GDs existentes:', gdsAsignaturaIds.size)

      // 4. Filtrar asignaturas sin GD
      const asignaturasSinGD = userAsignaturas
        .filter((ua: { asignatura_id: string }) => !gdsAsignaturaIds.has(ua.asignatura_id))
        .map((ua: { asignatura: AsignaturaSinGD }) => ua.asignatura)
        .filter(Boolean)

      console.log('[useMissingGDs] Asignaturas sin GD:', asignaturasSinGD.length, asignaturasSinGD.map((a: AsignaturaSinGD) => a.nombre))

      return asignaturasSinGD
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
