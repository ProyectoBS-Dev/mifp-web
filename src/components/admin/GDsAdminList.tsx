'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    AlertTriangle,
    ChevronDown,
    Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { BadgeColor } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { isExtractionStale } from '@/lib/gd-admin'
import { GDResetButton } from './GDManageActions'

type GDEstado = 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'

export interface AdminGD {
    id: string
    created_at: string | null
    updated_at: string | null
    estado: GDEstado | null
    error_extraccion: string | null
    motivo_rechazo: string | null
    /** Validada pero sin RAs, PACs ni VTs cargados: estado inconsistente que hay que revisar */
    sinCurriculo: boolean
    asignatura: {
        nombre: string
        codigo: string
        grado: { codigo: string } | null
    } | null
    semestre: {
        nombre: string
    } | null
    uploader: {
        full_name: string | null
        email: string
    } | null
}

interface GDsByCiclo {
    ciclo: string
    gds: AdminGD[]
}

interface GDsAdminListProps {
    gds: AdminGD[]
    /** Agrupa por ciclo en secciones plegables (por defecto) o muestra una lista plana */
    grouped?: boolean
}

const estadoConfig: Record<GDEstado, { label: string; icon: React.ElementType; color: BadgeColor }> = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'yellow' },
    extrayendo: { label: 'Extrayendo...', icon: AlertCircle, color: 'blue' },
    extraida: { label: 'Por revisar', icon: CheckCircle2, color: 'purple' },
    validada: { label: 'Validada', icon: CheckCircle2, color: 'green' },
    rechazada: { label: 'Rechazada', icon: XCircle, color: 'red' },
}

/** Con extracciones en curso se re-evalúa cada pocos segundos para mostrar «Desbloquear» a los 90 s */
function useNow(active: boolean): number {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        if (!active) return
        const interval = setInterval(() => setNow(Date.now()), 10_000)
        return () => clearInterval(interval)
    }, [active])

    return now
}

export function GDsAdminList({ gds, grouped = true }: GDsAdminListProps) {
    const hasExtracting = gds.some(g => g.estado === 'extrayendo')
    const now = useNow(hasExtracting)

    // Start collapsed by default
    const [openCiclos, setOpenCiclos] = useState<string[]>([])

    const toggleCiclo = (ciclo: string) => {
        setOpenCiclos(prev =>
            prev.includes(ciclo)
                ? prev.filter(c => c !== ciclo)
                : [...prev, ciclo]
        )
    }

    if (gds.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay guías didácticas</p>
                <p className="text-sm mt-1">
                    Los usuarios pueden subir GDs desde el dashboard
                </p>
            </div>
        )
    }

    if (!grouped) {
        return (
            <div className="space-y-2">
                {gds.map(gd => (
                    <GDRow key={gd.id} gd={gd} now={now} />
                ))}
            </div>
        )
    }

    // Group by ciclo
    const gdsByCiclo = new Map<string, GDsByCiclo>()

    for (const gd of gds) {
        const ciclo = gd.asignatura?.grado?.codigo || 'Sin ciclo'
        if (!gdsByCiclo.has(ciclo)) {
            gdsByCiclo.set(ciclo, { ciclo, gds: [] })
        }
        gdsByCiclo.get(ciclo)!.gds.push(gd)
    }

    // Sort ciclos alphabetically
    const sortedCiclos = Array.from(gdsByCiclo.values()).sort((a, b) =>
        a.ciclo.localeCompare(b.ciclo)
    )

    return (
        <div className="space-y-4">
            {sortedCiclos.map((grupo) => {
                const pendientesCount = grupo.gds.filter(g => g.estado === 'pendiente').length
                const porRevisarCount = grupo.gds.filter(g => g.estado === 'extraida').length
                const validadasCount = grupo.gds.filter(g => g.estado === 'validada').length

                return (
                    <Collapsible
                        key={grupo.ciclo}
                        open={openCiclos.includes(grupo.ciclo)}
                        onOpenChange={() => toggleCiclo(grupo.ciclo)}
                    >
                        <CollapsibleTrigger asChild>
                            <button className="flex items-center justify-between w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{grupo.ciclo}</span>
                                            <Badge color="gray" colorStyle="outline" className="text-xs">
                                                {grupo.gds.length} GD{grupo.gds.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            {pendientesCount > 0 && (
                                                <span className="text-vt-yellow">
                                                    {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {porRevisarCount > 0 && (
                                                <span className="text-vt-purple">
                                                    {porRevisarCount} por revisar
                                                </span>
                                            )}
                                            {validadasCount > 0 && (
                                                <span className="text-vt-green">
                                                    {validadasCount} validada{validadasCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    'h-4 w-4 transition-transform duration-200',
                                    openCiclos.includes(grupo.ciclo) && 'rotate-180'
                                )} />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 ml-4 space-y-2">
                            {grupo.gds.map((gd) => (
                                <GDRow key={gd.id} gd={gd} now={now} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                )
            })}
        </div>
    )
}

/**
 * Fila de una GD. No va envuelta en un `<Link>`: lleva botones de acción y un
 * enlace dentro de otro enlace sería HTML inválido.
 */
function GDRow({ gd, now }: { gd: AdminGD; now: number }) {
    const estado = gd.estado ?? 'pendiente'
    const config = estadoConfig[estado]
    const IconComponent = config.icon
    const detailHref = `/admin/guias-didacticas/${gd.id}`

    const extractionStale = estado === 'extrayendo' && isExtractionStale(gd.updated_at, now)
    const canReset = extractionStale || estado === 'rechazada' || (estado === 'validada' && gd.sinCurriculo)

    const detailLabel =
        estado === 'pendiente' ? 'Extraer'
        : estado === 'extraida' ? 'Revisar'
        : 'Ver'

    return (
        <div className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={detailHref}
                            className="font-medium hover:text-primary transition-colors"
                        >
                            {gd.asignatura?.nombre || 'Sin asignatura'}
                        </Link>
                        {gd.asignatura?.grado?.codigo && (
                            <Badge color="gray" colorStyle="outline" className="text-xs">
                                {gd.asignatura.grado.codigo}
                            </Badge>
                        )}
                        {gd.asignatura?.codigo && (
                            <span className="text-muted-foreground text-sm">
                                ({gd.asignatura.codigo})
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{gd.uploader?.full_name || gd.uploader?.email || 'Usuario'}</span>
                        <span>•</span>
                        <span>{gd.semestre?.nombre || 'Sin semestre'}</span>
                        <span>•</span>
                        <span>
                            {formatDistanceToNow(new Date(gd.created_at ?? Date.now()), {
                                addSuffix: true,
                                locale: es,
                            })}
                        </span>
                    </div>
                    {estado === 'pendiente' && gd.error_extraccion && (
                        <p className="flex items-center gap-1 text-xs text-vt-yellow-dark dark:text-vt-yellow mt-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            Última extracción fallida: {gd.error_extraccion}
                        </p>
                    )}
                    {estado === 'rechazada' && gd.motivo_rechazo && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Motivo: {gd.motivo_rechazo}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                {estado === 'validada' && gd.sinCurriculo && (
                    <Badge color="yellow" icon={<AlertTriangle className="h-3 w-3" />}>
                        Sin currículo
                    </Badge>
                )}
                <Badge color={config.color} className="flex items-center gap-1">
                    <IconComponent className="h-3 w-3" />
                    {config.label}
                </Badge>
                {canReset && (
                    <GDResetButton
                        gdId={gd.id}
                        label={extractionStale ? 'Desbloquear' : 'Devolver a pendiente'}
                    />
                )}
                <Button asChild size="sm" variant={estado === 'extraida' || estado === 'pendiente' ? 'default' : 'outline'}>
                    <Link href={detailHref}>
                        <Eye className="h-4 w-4 mr-2" />
                        {detailLabel}
                    </Link>
                </Button>
            </div>
        </div>
    )
}
