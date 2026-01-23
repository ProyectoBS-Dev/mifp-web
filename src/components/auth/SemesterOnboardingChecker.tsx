'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSemestreActivo } from '@/hooks/useUserSemesters'
import { NewSemesterOnboarding } from '@/components/auth/NewSemesterOnboarding'

interface Asignatura {
    id: string
    nombre: string
    codigo: string
    semestre_recomendado: number | null
}

interface SemesterOnboardingCheckerProps {
    userId: string
    gradoId: string | null
}

/**
 * Componente que verifica si el usuario tiene asignaturas en el semestre activo
 * Si no tiene, muestra el onboarding de nuevo semestre
 */
export function SemesterOnboardingChecker({ userId, gradoId }: SemesterOnboardingCheckerProps) {
    const { data: semestreActivo, isLoading: loadingSemestre } = useSemestreActivo()
    const [asignaturasEnSemestre, setAsignaturasEnSemestre] = useState<number | null>(null)
    const [gradoAsignaturas, setGradoAsignaturas] = useState<Asignatura[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        if (!userId || !gradoId || !semestreActivo) {
            setIsLoading(false)
            return
        }

        const checkAsignaturas = async () => {
            const supabase = createClient()

            // Verificar si tiene asignaturas en el semestre activo
            const { count, error } = await supabase
                .from('user_asignaturas')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('semestre_id', semestreActivo.id)

            if (error) {
                console.error('Error verificando asignaturas:', error)
                setIsLoading(false)
                return
            }

            setAsignaturasEnSemestre(count || 0)

            // Si no tiene asignaturas, cargar las del grado
            if (count === 0) {
                const { data: asignaturas } = await supabase
                    .from('asignaturas')
                    .select('id, nombre, codigo, semestre_recomendado')
                    .eq('grado_id', gradoId)
                    .order('semestre_recomendado', { ascending: true })
                    .order('nombre', { ascending: true })

                setGradoAsignaturas(asignaturas || [])
                setShowOnboarding(true)
            }

            setIsLoading(false)
        }

        checkAsignaturas()
    }, [userId, gradoId, semestreActivo])

    // No mostrar nada mientras carga
    if (loadingSemestre || isLoading) {
        return null
    }

    // No tiene grado - no mostrar nada
    if (!gradoId) {
        return null
    }

    // No hay semestre activo
    if (!semestreActivo) {
        return null
    }

    // Tiene asignaturas - no mostrar onboarding
    if (asignaturasEnSemestre && asignaturasEnSemestre > 0) {
        return null
    }

    // Mostrar onboarding
    if (showOnboarding && gradoAsignaturas.length > 0) {
        return (
            <div className="mb-8">
                <NewSemesterOnboarding
                    userId={userId}
                    gradoId={gradoId}
                    asignaturas={gradoAsignaturas}
                    onComplete={() => {
                        setShowOnboarding(false)
                        setAsignaturasEnSemestre(1) // Force hide
                        window.location.reload()
                    }}
                />
            </div>
        )
    }

    return null
}
