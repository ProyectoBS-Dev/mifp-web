'use client'

import { Loader2, TrendingUp, BookOpen, Award, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useGradeProgress, type GradeProgressData, type AsignaturaDetalle } from '@/hooks/useGradeProgress'

// ============================================
// COMPONENTE
// ============================================

/**
 * Vista de historial del grado completo.
 * Muestra progreso general, nota media, y detalle por asignatura.
 */
export function HistorialView() {
    const { data, isLoading, error } = useGradeProgress()

    // Obtener color de nota
    const getGradeColor = (nota: number | null) => {
        if (nota === null) return 'text-muted-foreground'
        if (nota >= 9) return 'text-emerald-600 dark:text-emerald-400'
        if (nota >= 7) return 'text-blue-600 dark:text-blue-400'
        if (nota >= 5) return 'text-amber-600 dark:text-amber-400'
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

            {/* Detalle de asignaturas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Detalle por Asignatura
                    </CardTitle>
                    <CardDescription>
                        Historial de todas tus asignaturas calificadas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.detalle && data.detalle.length > 0 ? (
                        <div className="space-y-3">
                            {data.detalle.map((asig: AsignaturaDetalle) => (
                                <div
                                    key={asig.asignatura_id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{asig.asignatura_nombre}</p>
                                            {asig.num_convocatorias > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {asig.num_convocatorias}ª conv.
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={asig.aprobada ? 'default' : 'destructive'}
                                            className={cn(
                                                'text-sm',
                                                asig.aprobada && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            )}
                                        >
                                            {asig.aprobada ? 'Aprobada' : 'Suspensa'}
                                        </Badge>
                                        <span className={cn(
                                            'text-xl font-bold w-12 text-right',
                                            getGradeColor(asig.ultima_nota)
                                        )}>
                                            {asig.ultima_nota?.toFixed(1) ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No hay asignaturas calificadas aún</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
