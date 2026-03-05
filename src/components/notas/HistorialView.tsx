'use client'

import { useMemo } from 'react'
import { Loader2, BookOpen, Award, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGradeColor } from '@/lib/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useGradeProgress, type AsignaturaDetalle } from '@/hooks/useGradeProgress'
import { useNotas, calcularDatosSemestre } from '@/hooks/useNotas'

// ============================================
// TIPOS
// ============================================

interface SemestreGroup {
    semestre: string
    asignaturas: AsignaturaDetalle[]
}

// Componente de indicador de estado
function EstadoIndicador({ aprobada, pendiente }: { aprobada: boolean; pendiente?: boolean }) {
    if (pendiente) {
        return (
            <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400" />
            </span>
        )
    }

    return (
        <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className={cn(
                'relative inline-flex rounded-full h-3 w-3',
                aprobada ? 'bg-vt-green' : 'bg-vt-red'
            )} />
        </span>
    )
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Vista de historial del grado completo.
 * Muestra progreso general, nota media, y detalle por asignatura agrupado por semestre.
 */
export function HistorialView() {
    const { data, isLoading, error } = useGradeProgress()
    // Datos del semestre activo (React Query cache, 0 requests extra)
    const { data: notasActivas } = useNotas()

    // ============================================
    // Override: calcular notas del semestre activo client-side
    // (misma lógica que usa el sidebar)
    // ============================================
    const activeSemestreOverrides = useMemo(() => {
        if (!notasActivas?.asignaturas) return new Map<string, { nota: number | null; enProgreso: boolean; aprobada: boolean }>()

        const { asignaturasCalculadas } = calcularDatosSemestre(
            notasActivas.asignaturas,
            notasActivas.fct.nota
        )

        const map = new Map<string, { nota: number | null; enProgreso: boolean; aprobada: boolean }>()
        notasActivas.asignaturas.forEach((asig, i) => {
            const calc = asignaturasCalculadas[i]
            if (calc && asig.usarCalculoPACs) {
                map.set(asig.asignaturaId, {
                    nota: calc.notaModulo,
                    enProgreso: calc.estado === 'en_progreso' || calc.estado === 'sin_notas',
                    aprobada: calc.estado === 'aprobada'
                })
            }
        })
        return map
    }, [notasActivas])

    // Stats efectivos (recalculados con overrides del semestre activo)
    const effectiveStats = useMemo(() => {
        if (!data) return null
        if (activeSemestreOverrides.size === 0) return data

        let sumaNotas = 0
        let countNotas = 0
        let aprobadas = 0
        let suspensas = 0

        data.detalle.forEach(asig => {
            const override = activeSemestreOverrides.get(asig.asignatura_id)
            const nota = override !== undefined ? override.nota : asig.ultima_nota
            const enProgreso = override !== undefined ? override.enProgreso : false
            const isAprobada = override !== undefined ? override.aprobada : asig.aprobada

            // En progreso → pendiente (no cuenta en media/aprobadas/suspensas)
            if (nota !== null && !enProgreso) {
                sumaNotas += nota
                countNotas++
                if (isAprobada) aprobadas++
                else suspensas++
            }
        })

        return {
            nota_media: countNotas > 0 ? Math.round((sumaNotas / countNotas) * 100) / 100 : null,
            asignaturas_aprobadas: aprobadas,
            asignaturas_suspensas: suspensas,
            asignaturas_pendientes: data.total_asignaturas - aprobadas - suspensas,
            total_asignaturas: data.total_asignaturas,
            progreso_porcentaje: data.total_asignaturas > 0
                ? Math.round((aprobadas / data.total_asignaturas) * 1000) / 10
                : 0
        }
    }, [data, activeSemestreOverrides])

    // Agrupar asignaturas por semestre
    const semestreGroups = useMemo((): SemestreGroup[] => {
        if (!data?.detalle) return []

        const groups = new Map<string, AsignaturaDetalle[]>()

        data.detalle.forEach(asig => {
            const semestre = asig.ultimo_semestre || 'Sin semestre'
            if (!groups.has(semestre)) {
                groups.set(semestre, [])
            }
            groups.get(semestre)!.push(asig)
        })

        // Convertir a array y ordenar por semestre (más reciente primero)
        return Array.from(groups.entries())
            .map(([semestre, asignaturas]) => ({ semestre, asignaturas }))
            .sort((a, b) => b.semestre.localeCompare(a.semestre))
    }, [data?.detalle])

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
                    <div className="text-center text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Error al cargar el historial</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg mb-2">Sin datos de historial</p>
                        <p className="text-sm">Añade asignaturas y notas para ver tu progreso</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Resumen principal */}
            <Card className="bg-gradient-to-r from-vt-blue/5 to-vt-blue/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Progreso del Grado
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Stats principales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Nota Media</p>
                            <p className={cn('text-3xl font-bold', getGradeColor(effectiveStats?.nota_media ?? null))}>
                                {effectiveStats?.nota_media?.toFixed(2) ?? '-'}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Aprobadas</p>
                            <p className="text-3xl font-bold text-vt-green">
                                {effectiveStats?.asignaturas_aprobadas ?? 0}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Suspensas</p>
                            <p className="text-3xl font-bold text-vt-red">
                                {effectiveStats?.asignaturas_suspensas ?? 0}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Pendientes</p>
                            <p className="text-3xl font-bold text-muted-foreground">
                                {effectiveStats?.asignaturas_pendientes ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progreso del grado</span>
                            <span className="font-medium">
                                {effectiveStats?.asignaturas_aprobadas ?? 0}/{effectiveStats?.total_asignaturas ?? 0} ({effectiveStats?.progreso_porcentaje ?? 0}%)
                            </span>
                        </div>
                        <Progress value={effectiveStats?.progreso_porcentaje ?? 0} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Detalle de asignaturas agrupado por semestre */}
            {semestreGroups.length > 0 ? (
                <div className="space-y-6">
                    {semestreGroups.map((group) => (
                        <div key={group.semestre} className="space-y-3">
                            {/* Header del semestre */}
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-sm font-medium text-muted-foreground px-2">
                                    {group.semestre}
                                </span>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            {/* Lista de asignaturas del semestre */}
                            <Card>
                                <CardContent className="pt-4 pb-4">
                                    <div className="space-y-2">
                                        {group.asignaturas.map((asig) => {
                                            const override = activeSemestreOverrides.get(asig.asignatura_id)
                                            const nota = override !== undefined ? override.nota : asig.ultima_nota
                                            const aprobada = override !== undefined ? override.aprobada : asig.aprobada
                                            const pendiente = override !== undefined
                                                ? override.enProgreso
                                                : (asig.ultima_nota === null)

                                            return (
                                                <div
                                                    key={asig.asignatura_id}
                                                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <EstadoIndicador
                                                        aprobada={aprobada}
                                                        pendiente={pendiente && nota === null}
                                                    />
                                                    <span className="font-medium flex-1 truncate">
                                                        {asig.asignatura_nombre}
                                                    </span>
                                                    {asig.num_convocatorias > 1 && (
                                                        <Badge color="gray" colorStyle="outline" className="text-xs flex-shrink-0">
                                                            {asig.num_convocatorias}ª conv.
                                                        </Badge>
                                                    )}
                                                    <span className={cn(
                                                        'font-bold text-right min-w-[3rem]',
                                                        getGradeColor(nota)
                                                    )}>
                                                        {nota?.toFixed(2) ?? '—'}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No hay asignaturas calificadas aún</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
