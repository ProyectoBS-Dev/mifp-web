'use client'

import { useMemo } from 'react'
import { Loader2, BookOpen, Award, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useGradeProgress, type AsignaturaDetalle } from '@/hooks/useGradeProgress'

// ============================================
// TIPOS
// ============================================

interface SemestreGroup {
    semestre: string
    asignaturas: AsignaturaDetalle[]
}

// ============================================
// UTILIDADES
// ============================================

function getGradeColor(nota: number | null) {
    if (nota === null) return 'text-muted-foreground'
    if (nota >= 9) return 'text-emerald-600 dark:text-emerald-400'
    if (nota >= 7) return 'text-emerald-600 dark:text-emerald-400'
    if (nota >= 5) return 'text-blue-600 dark:text-blue-400'
    return 'text-red-600 dark:text-red-400'
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
                aprobada ? 'bg-emerald-500' : 'bg-red-500'
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
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
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
                            <p className={cn('text-3xl font-bold', getGradeColor(data.nota_media))}>
                                {data.nota_media?.toFixed(2) ?? '-'}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Aprobadas</p>
                            <p className="text-3xl font-bold text-emerald-600">
                                {data.asignaturas_aprobadas}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Suspensas</p>
                            <p className="text-3xl font-bold text-red-600">
                                {data.asignaturas_suspensas}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Pendientes</p>
                            <p className="text-3xl font-bold text-muted-foreground">
                                {data.asignaturas_pendientes}
                            </p>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progreso del grado</span>
                            <span className="font-medium">
                                {data.asignaturas_aprobadas}/{data.total_asignaturas} ({data.progreso_porcentaje}%)
                            </span>
                        </div>
                        <Progress value={data.progreso_porcentaje} className="h-3" />
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
                                        {group.asignaturas.map((asig) => (
                                            <div
                                                key={asig.asignatura_id}
                                                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <EstadoIndicador 
                                                    aprobada={asig.aprobada} 
                                                    pendiente={asig.ultima_nota === null}
                                                />
                                                <span className="font-medium flex-1 truncate">
                                                    {asig.asignatura_nombre}
                                                </span>
                                                {asig.num_convocatorias > 1 && (
                                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                                        {asig.num_convocatorias}ª conv.
                                                    </Badge>
                                                )}
                                                <span className={cn(
                                                    'font-bold text-right min-w-[3rem]',
                                                    getGradeColor(asig.ultima_nota)
                                                )}>
                                                    {asig.ultima_nota?.toFixed(2) ?? '—'}
                                                </span>
                                            </div>
                                        ))}
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
