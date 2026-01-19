'use client'

import { useState, useCallback } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNotas } from '@/hooks/useNotas'

// ============================================
// TIPOS
// ============================================

interface NotasSimplificadoProps {
    semestreId: string
    semestreNombre: string
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Vista simplificada de notas para semestres inactivos.
 * Solo permite introducir la nota final de cada asignatura.
 */
export function NotasSimplificado({ semestreId, semestreNombre }: NotasSimplificadoProps) {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const { data, isLoading, error } = useNotas(semestreId)

    const [savingId, setSavingId] = useState<string | null>(null)
    const [savedId, setSavedId] = useState<string | null>(null)
    const [localNotas, setLocalNotas] = useState<Map<string, string>>(new Map())

    // Guardar nota
    const handleSaveNota = useCallback(async (userAsignaturaId: string, nota: number | null) => {
        setSavingId(userAsignaturaId)

        try {
            // Upsert en user_notas_examen con nota_final_calculada para backfill
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: upsertError } = await (supabase.from('user_notas_examen') as any)
                .upsert({
                    user_asignatura_id: userAsignaturaId,
                    nota_examen: nota,
                    nota_final_calculada: nota,
                    convocatoria: 1,
                    aprobada: nota !== null ? nota >= 5 : null
                }, {
                    onConflict: 'user_asignatura_id,convocatoria'
                })

            if (upsertError) throw upsertError

            // Mostrar checkmark
            setSavedId(userAsignaturaId)
            setTimeout(() => setSavedId(null), 2000)

            // Invalidar queries
            queryClient.invalidateQueries({ queryKey: ['notas', semestreId] })
            queryClient.invalidateQueries({ queryKey: ['grade-progress'] })
        } catch (err) {
            console.error('Error guardando nota:', err)
        } finally {
            setSavingId(null)
        }
    }, [supabase, queryClient, semestreId])

    // Manejar cambio de input
    const handleInputChange = (id: string, value: string) => {
        setLocalNotas(prev => new Map(prev).set(id, value))
    }

    // Manejar blur (guardar)
    const handleBlur = (userAsignaturaId: string, currentNota: number | null) => {
        const localValue = localNotas.get(userAsignaturaId)
        if (localValue === undefined) return

        const newNota = localValue === '' ? null : parseFloat(localValue)

        // Validar
        if (newNota !== null && (isNaN(newNota) || newNota < 0 || newNota > 10)) {
            setLocalNotas(prev => {
                const newMap = new Map(prev)
                newMap.delete(userAsignaturaId)
                return newMap
            })
            return
        }

        // Solo guardar si cambió
        if (newNota !== currentNota) {
            handleSaveNota(userAsignaturaId, newNota)
        }
    }

    // Obtener color de nota
    const getGradeColor = (nota: number | null) => {
        if (nota === null) return 'text-muted-foreground'
        if (nota >= 9) return 'text-emerald-600 dark:text-emerald-400'
        if (nota >= 7) return 'text-emerald-600 dark:text-emerald-400'
        if (nota >= 5) return 'text-blue-600 dark:text-blue-400'
        return 'text-red-600 dark:text-red-400'
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <p className="text-destructive text-center">Error al cargar notas</p>
                </CardContent>
            </Card>
        )
    }

    if (!data?.asignaturas || data.asignaturas.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                        <p className="text-lg mb-2">Sin asignaturas</p>
                        <p className="text-sm">No tienes asignaturas registradas en {semestreNombre}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Notas - {semestreNombre}</span>
                    <Badge variant="secondary">Semestre anterior</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.asignaturas.map(asig => {
                        const localValue = localNotas.get(asig.id)
                        const displayValue = localValue !== undefined
                            ? localValue
                            : (asig.notaExamen?.toString() ?? '')

                        return (
                            <div
                                key={asig.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{asig.nombre}</p>
                                    <p className="text-sm text-muted-foreground">{asig.codigo}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Badge de estado */}
                                    {asig.notaExamen !== null && (
                                        <Badge
                                            variant={asig.notaExamen >= 5 ? 'default' : 'destructive'}
                                            className="text-xs"
                                        >
                                            {asig.notaExamen >= 5 ? 'Aprobada' : 'Suspensa'}
                                        </Badge>
                                    )}

                                    {/* Input de nota */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={10}
                                            step={0.1}
                                            value={displayValue}
                                            onChange={(e) => handleInputChange(asig.id, e.target.value)}
                                            onBlur={() => handleBlur(asig.id, asig.notaExamen)}
                                            className={cn(
                                                'w-20 text-center font-bold',
                                                getGradeColor(asig.notaExamen)
                                            )}
                                            placeholder="-"
                                        />

                                        {savingId === asig.id && (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                        {savedId === asig.id && (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Las notas se guardan automáticamente al salir del campo
                </p>
            </CardContent>
        </Card>
    )
}
