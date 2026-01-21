'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ArrowRight, Loader2, Check, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSemestreActivo } from '@/hooks/useUserSemesters'

// ============================================
// TIPOS
// ============================================

interface Asignatura {
    id: string
    nombre: string
    codigo: string
    semestre_recomendado: number | null
}

interface NewSemesterOnboardingProps {
    userId: string
    gradoId: string
    asignaturas: Asignatura[]
    onComplete?: () => void
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Componente de onboarding para cuando un usuario no tiene asignaturas
 * en el semestre activo actual.
 */
export function NewSemesterOnboarding({
    userId,
    gradoId,
    asignaturas,
    onComplete
}: NewSemesterOnboardingProps) {
    const router = useRouter()
    const supabase = createClient()
    const queryClient = useQueryClient()
    const { data: semestreActivo } = useSemestreActivo()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Toggle selección
    const toggleAsignatura = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    // Seleccionar todas
    const selectAll = () => {
        setSelectedIds(new Set(asignaturas.map(a => a.id)))
    }

    // Deseleccionar todas
    const deselectAll = () => {
        setSelectedIds(new Set())
    }

    // Guardar selección
    const handleSubmit = async () => {
        if (selectedIds.size === 0 || !semestreActivo) return

        setIsLoading(true)
        setError(null)

        try {
            // Crear registros de user_asignaturas
            const inserts = Array.from(selectedIds).map(asignaturaId => ({
                user_id: userId,
                asignatura_id: asignaturaId,
                semestre_id: semestreActivo.id
            }))

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await (supabase
                .from('user_asignaturas') as any)
                .insert(inserts)

            if (insertError) throw insertError

            // Invalidar queries
            queryClient.invalidateQueries({ queryKey: ['user-semesters'] })
            queryClient.invalidateQueries({ queryKey: ['notas'] })
            queryClient.invalidateQueries({ queryKey: ['grade-progress'] })

            // Callback o redirect
            if (onComplete) {
                onComplete()
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar asignaturas')
        } finally {
            setIsLoading(false)
        }
    }

    if (!semestreActivo) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg">No hay semestre activo</p>
                        <p className="text-sm">Contacta con el administrador</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">¡Nuevo semestre!</CardTitle>
                <CardDescription className="text-base">
                    Selecciona las asignaturas que vas a cursar en{' '}
                    <span className="font-medium text-foreground">{semestreActivo.nombre}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Acciones rápidas */}
                <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                        Seleccionar todas
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAll}>
                        Deseleccionar todas
                    </Button>
                </div>

                {/* Lista de asignaturas */}
                <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {asignaturas.map(asig => (
                        <div
                            key={asig.id}
                            className={`
                flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer
                ${selectedIds.has(asig.id)
                                    ? 'bg-primary/5 border-primary'
                                    : 'hover:bg-muted/50'}
              `}
                            onClick={() => toggleAsignatura(asig.id)}
                        >
                            <Checkbox
                                id={asig.id}
                                checked={selectedIds.has(asig.id)}
                                onCheckedChange={() => toggleAsignatura(asig.id)}
                            />
                            <Label htmlFor={asig.id} className="flex-1 cursor-pointer">
                                <p className="font-medium">{asig.nombre}</p>
                                <p className="text-sm text-muted-foreground">{asig.codigo}</p>
                            </Label>
                            {asig.semestre_recomendado && (
                                <Badge color="gray" className="text-xs">
                                    S{asig.semestre_recomendado}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {/* Contador */}
                <p className="text-center text-sm text-muted-foreground">
                    {selectedIds.size} de {asignaturas.length} asignaturas seleccionadas
                </p>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleSubmit}
                    disabled={selectedIds.size === 0 || isLoading}
                    className="w-full"
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            Continuar con {selectedIds.size} asignatura{selectedIds.size !== 1 ? 's' : ''}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
