'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface UserSemestre {
    id: string
    nombre: string
    codigo: string
    activo: boolean
    fecha_inicio: string
    num_asignaturas: number
}

// ============================================
// HOOK: useUserSemesters
// Obtiene semestres donde el usuario tiene asignaturas
// ============================================

export function useUserSemesters() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['user-semesters'],
        queryFn: async (): Promise<UserSemestre[]> => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { data, error } = await supabase.rpc('get_semestres_usuario', {
                p_user_id: user.id
            })

            if (error) {
                console.error('Error en get_semestres_usuario:', error)
                throw error
            }

            return (data || []) as unknown as UserSemestre[]
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    })
}

// ============================================
// HOOK: useSemestreActivo
// Obtiene el semestre activo actual
// ============================================

interface SemestreActivo {
    id: string
    nombre: string
    codigo: string
    activo: boolean
}

export function useSemestreActivo() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['semestre-activo'],
        queryFn: async (): Promise<SemestreActivo | null> => {
            const { data, error } = await supabase
                .from('semestres')
                .select('id, nombre, codigo, activo')
                .eq('activo', true)
                .single()

            if (error) {
                console.error('Error obteniendo semestre activo:', error)
                return null
            }

            return data as SemestreActivo
        },
        staleTime: 1000 * 60 * 10, // 10 minutos
    })
}

// ============================================
// HOOK: useSemestres
// Obtiene todos los semestres (para admin y perfil)
// Incluye conteo de asignaturas del usuario
// ============================================

interface Semestre {
    id: string
    nombre: string
    codigo: string
    fecha_inicio: string
    fecha_fin: string
    año_academico: string
    activo: boolean
    created_at: string
    num_asignaturas?: number
}

export function useSemestres() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['semestres'],
        queryFn: async (): Promise<Semestre[]> => {
            const { data: { user } } = await supabase.auth.getUser()
            
            const { data, error } = await supabase
                .from('semestres')
                .select('*')
                .order('fecha_inicio', { ascending: false })

            if (error) throw error
            
            // Si hay usuario autenticado, calcular el conteo de asignaturas
            if (user && data) {
                const semestresConConteo = await Promise.all(
                    data.map(async (semestre) => {
                        const { count } = await supabase
                            .from('user_asignaturas')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', user.id)
                            .eq('semestre_id', semestre.id)
                        
                        return {
                            ...semestre,
                            num_asignaturas: count || 0
                        }
                    })
                )
                return semestresConConteo as Semestre[]
            }
            
            return (data || []) as Semestre[]
        },
        staleTime: 1000 * 60 * 5,
    })
}

// ============================================
// HOOK: useSemestresPosibles
// Genera semestres posibles para backfill
// ============================================

export function useSemestresPosibles() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['semestres-posibles'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('generar_semestres_posibles')

            if (error) {
                console.error('Error en generar_semestres_posibles:', error)
                throw error
            }

            return data as Array<{
                codigo: string
                nombre: string
                año_academico: string
                existe: boolean
            }>
        },
        staleTime: 1000 * 60 * 60, // 1 hora (no cambia frecuentemente)
    })
}
