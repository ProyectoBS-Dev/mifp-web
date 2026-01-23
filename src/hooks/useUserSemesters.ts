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

            return (data || []) as UserSemestre[]
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
}

export function useSemestres() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['semestres'],
        queryFn: async (): Promise<Semestre[]> => {
            const { data, error } = await supabase
                .from('semestres')
                .select('*')
                .order('fecha_inicio', { ascending: false })

            if (error) throw error
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
