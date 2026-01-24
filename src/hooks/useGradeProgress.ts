'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface GradeProgressData {
    nota_media: number | null
    asignaturas_aprobadas: number
    asignaturas_suspensas: number
    asignaturas_pendientes: number
    total_asignaturas: number
    progreso_porcentaje: number
    detalle: AsignaturaDetalle[]
}

export interface AsignaturaDetalle {
    asignatura_id: string
    asignatura_nombre: string
    ultima_nota: number | null
    num_convocatorias: number
    ultimo_semestre: string | null
    aprobada: boolean
}

// ============================================
// HOOK: useGradeProgress
// Calcula el progreso global del grado del usuario
// ============================================

export function useGradeProgress() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['grade-progress'],
        queryFn: async (): Promise<GradeProgressData | null> => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { data, error } = await supabase.rpc('calcular_nota_grado', {
                p_user_id: user.id
            })

            if (error) {
                console.error('Error en calcular_nota_grado:', error)
                throw error
            }

            if (data?.error) {
                console.warn('calcular_nota_grado:', data.error)
                return null
            }

            return data as GradeProgressData
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    })
}
