'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { BadgeColor } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

type GDEstado = 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'

interface GD {
    id: string
    created_at: string | null
    estado: GDEstado | null
    procesada: boolean | null
    archivo_path: string | null
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
    gds: GD[]
}

interface GDsAdminListProps {
    gds: GD[]
    showPendientes?: boolean
}

const estadoConfig: Record<GDEstado, { label: string; icon: React.ElementType; color: BadgeColor }> = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'yellow' },
    extrayendo: { label: 'Extrayendo...', icon: AlertCircle, color: 'blue' },
    extraida: { label: 'Datos Extraídos', icon: CheckCircle2, color: 'blue' },
    validada: { label: 'Validada', icon: CheckCircle2, color: 'green' },
    rechazada: { label: 'Rechazada', icon: XCircle, color: 'red' },
}

export function GDsAdminList({ gds, showPendientes = false }: GDsAdminListProps) {
    // Filter based on showPendientes prop
    const filteredGds = showPendientes
        ? gds.filter(g => g.estado === 'pendiente')
        : gds

    // Group by ciclo
    const gdsByCiclo = new Map<string, GDsByCiclo>()

    for (const gd of filteredGds) {
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

    // Start collapsed by default
    const [openCiclos, setOpenCiclos] = useState<string[]>([])

    const toggleCiclo = (ciclo: string) => {
        setOpenCiclos(prev =>
            prev.includes(ciclo)
                ? prev.filter(c => c !== ciclo)
                : [...prev, ciclo]
        )
    }

    if (filteredGds.length === 0) {
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

    return (
        <div className="space-y-4">
            {sortedCiclos.map((grupo) => {
                const pendientesCount = grupo.gds.filter(g => g.estado === 'pendiente').length
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
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            {pendientesCount > 0 && (
                                                <span className="text-vt-yellow">
                                                    {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {pendientesCount > 0 && validadasCount > 0 && <span>•</span>}
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
                                <GDCard key={gd.id} gd={gd} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                )
            })}
        </div>
    )
}

function GDCard({ gd }: { gd: GD }) {
    const config = estadoConfig[gd.estado ?? 'pendiente']
    const IconComponent = config.icon

    return (
        <Link
            href={`/admin/guias-didacticas/${gd.id}`}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium group-hover:text-primary transition-colors">
                            {gd.asignatura?.nombre || 'Sin asignatura'}
                        </span>
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{gd.uploader?.full_name || gd.uploader?.email || 'Usuario'}</span>
                        <span>•</span>
                        <span>{gd.semestre?.nombre || 'Sin semestre'}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(gd.created_at ?? Date.now()), {
                        addSuffix: true,
                        locale: es,
                    })}
                </div>
                <Badge color={config.color} className="flex items-center gap-1">
                    <IconComponent className="h-3 w-3" />
                    {config.label}
                </Badge>
            </div>
        </Link>
    )
}
