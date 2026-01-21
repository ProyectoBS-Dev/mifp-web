'use client'

import { useState, useMemo } from 'react'
import { Video, Clock, ExternalLink, Loader2, CheckCircle2, ChevronDown, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMinutes } from '@/lib/format'
import { useDashboardVTs, useToggleVTVista } from '@/hooks'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import type { VTItem } from '@/types/vts'

function VtCard({ vt, asignatura, onToggle, isPending }: {
  vt: VTItem
  asignatura: string
  onToggle: () => void
  isPending: boolean
}) {
  const fechaProgramada = new Date(vt.fecha_programada)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fechaProgramada.setHours(0, 0, 0, 0)
  const esHoy = fechaProgramada.getTime() === hoy.getTime()
  const esFuturo = fechaProgramada > hoy

  const fechaFormateada = new Date(vt.fecha_programada).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        vt.vista
          ? 'opacity-60 border-border bg-muted/20'
          : esHoy
            ? 'border-vt-green/50 bg-vt-green/5'
            : 'border-border'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={vt.vista}
          onCheckedChange={onToggle}
          disabled={isPending}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-semibold truncate',
            vt.vista && 'line-through'
          )}>
            VT {vt.numero} - {vt.titulo}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {asignatura}
          </p>

          {/* Fecha y hora (solo si no vista) */}
          {!vt.vista && (
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{fechaFormateada}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-medium">{vt.hora_inicio?.slice(0, 5) || '--:--'}</span>
              {esHoy && (
                <span className="text-vt-green font-medium ml-1">HOY</span>
              )}
              {esFuturo && !esHoy && (
                <span className="text-vt-blue font-medium ml-1">Próxima</span>
              )}
            </div>
          )}

          {/* Info de vista */}
          {vt.vista && (
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <CheckCircle2 className="h-3 w-3 text-vt-green" />
              <span className="text-vt-green font-medium">Vista</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">{formatMinutes(vt.duracion_minutos)}</span>
            </div>
          )}

          {/* Duración (solo si no vista) */}
          {!vt.vista && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Video className="h-3 w-3" />
              <span>{formatMinutes(vt.duracion_minutos)}</span>
            </div>
          )}
        </div>

        {/* Link a grabación */}
        {vt.enlace_grabacion && (
          <a
            href={vt.enlace_grabacion}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
            title="Ver grabación"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-vt-blue" />
          </a>
        )}
      </div>
    </div>
  )
}

export function VtsWidget() {
  const { data: vtsByAsignatura, isLoading } = useDashboardVTs()
  const toggleVista = useToggleVTVista()
  const [showCompleted, setShowCompleted] = useState(false)
  const [filtroAsignatura, setFiltroAsignatura] = useState<string>('todas')

  // Aplanar todas las VTs con info de asignatura
  const allVTs = useMemo(() => {
    return vtsByAsignatura?.flatMap(grupo =>
      grupo.vts.map(vt => ({ ...vt, asignaturaNombre: grupo.asignatura.nombre, asignaturaCodigo: grupo.asignatura.codigo }))
    ) || []
  }, [vtsByAsignatura])

  // Obtener lista única de asignaturas
  const asignaturas = useMemo(() => {
    if (!vtsByAsignatura) return []
    return vtsByAsignatura.map(grupo => ({
      codigo: grupo.asignatura.codigo,
      nombre: grupo.asignatura.nombre
    }))
  }, [vtsByAsignatura])

  // Filtrar VTs por asignatura
  const vtsFiltradas = useMemo(() => {
    if (filtroAsignatura === 'todas') return allVTs
    return allVTs.filter(vt => vt.asignaturaCodigo === filtroAsignatura)
  }, [allVTs, filtroAsignatura])

  // Separar pendientes y vistas
  const pendientes = useMemo(() =>
    vtsFiltradas.filter(vt => !vt.vista).sort((a, b) =>
      new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime()
    ),
    [vtsFiltradas]
  )
  const vistas = useMemo(() =>
    vtsFiltradas.filter(vt => vt.vista).sort((a, b) => b.numero - a.numero),
    [vtsFiltradas]
  )

  // Calcular progreso
  const totalVTs = vtsFiltradas.length
  const vistasCount = vistas.length
  const porcentaje = totalVTs > 0 ? Math.round((vistasCount / totalVTs) * 100) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!vtsByAsignatura || allVTs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Video className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No hay VTs disponibles
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Sube una Guía Didáctica para ver tus VTs
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con filtros y progreso */}
      <div className="space-y-2 mb-3">
        {/* Barra de progreso */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{vistasCount}/{totalVTs} vistas</span>
          <Progress value={porcentaje} className="h-1.5 flex-1" />
          <span className={cn(porcentaje === 100 && 'text-vt-green font-medium')}>{porcentaje}%</span>
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge color="blue" colorStyle="soft" className="flex-shrink-0">
            {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
          </Badge>

          {/* Filtro por asignatura */}
          {asignaturas.length > 1 && (
            <Select value={filtroAsignatura} onValueChange={setFiltroAsignatura}>
              <SelectTrigger className="w-[160px] h-7 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Filtrar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Ver todas</SelectItem>
                {asignaturas.map(asig => (
                  <SelectItem key={asig.codigo} value={asig.codigo}>
                    {asig.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Lista de VTs */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {/* VTs Pendientes */}
        {pendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-vt-green mb-2" />
            <p className="text-sm font-medium text-vt-green">
              {filtroAsignatura !== 'todas'
                ? '¡Todas las VTs de esta asignatura vistas!'
                : '¡Todas las VTs vistas! 🎉'}
            </p>
            {vistas.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {vistas.length} VT{vistas.length !== 1 ? 's' : ''} completada{vistas.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          pendientes.map((vt) => (
            <VtCard
              key={vt.userVtId}
              vt={vt}
              asignatura={vt.asignaturaNombre}
              onToggle={() => toggleVista.mutate({
                userVtId: vt.userVtId,
                vista: !vt.vista
              })}
              isPending={toggleVista.isPending}
            />
          ))
        )}

        {/* Sección de VTs Vistas (colapsable) */}
        {vistas.length > 0 && (
          <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between px-2 h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>
                  {showCompleted ? 'Ocultar' : 'Ver'} vistas ({vistas.length})
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    showCompleted && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {vistas.map((vt) => (
                <VtCard
                  key={vt.userVtId}
                  vt={vt}
                  asignatura={vt.asignaturaNombre}
                  onToggle={() => toggleVista.mutate({
                    userVtId: vt.userVtId,
                    vista: !vt.vista
                  })}
                  isPending={toggleVista.isPending}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
