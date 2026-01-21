'use client'

import { useState, useMemo } from 'react'
import { Calendar, AlertCircle, Loader2, CheckCircle2, ChevronDown, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardPACs, useTogglePACCompletada } from '@/hooks'
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
import type { PACItem } from '@/types/pacs'

// Configuración de prioridad según documentación
import { getPrioridad, prioridadConfig, type PrioridadPAC } from '@/types/pacs'

const PRIORIDAD_CONFIG = prioridadConfig

function PacCard({ pac, onToggle, isPending }: {
  pac: PACItem
  onToggle: () => void
  isPending: boolean
}) {
  const diasRestantes = Math.ceil(
    (new Date(pac.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const prioridad = getPrioridad(pac.fecha_limite)
  const config = PRIORIDAD_CONFIG[prioridad]

  const fechaFormateada = new Date(pac.fecha_limite).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        pac.completada
          ? 'opacity-60 border-border bg-muted/20'
          : cn(config.borderColor, config.bgColor)
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={pac.completada}
          onCheckedChange={onToggle}
          disabled={isPending}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          {/* Título de la PAC (ya incluye PAC y RA) */}
          <p className={cn(
            'text-sm font-semibold truncate',
            pac.completada && 'line-through'
          )}>
            {pac.titulo}
          </p>

          {/* Solo nombre de asignatura */}
          <p className="text-xs text-muted-foreground mt-0.5">
            {pac.asignatura.nombre}
            {/* {pac.ra && (
              <span className="ml-1">
                • RA{pac.ra.numero}: {pac.ra.titulo}
              </span>
            )} */}
          </p>

          {/* Fecha y prioridad (solo si no completada) */}
          {!pac.completada && (
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{fechaFormateada}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className={cn('font-medium', config.color)}>
                {config.badge} {config.label}
                {' • '}
                {diasRestantes <= 0
                  ? 'Vencida'
                  : diasRestantes === 1
                    ? 'Mañana'
                    : `${diasRestantes} días`}
              </span>
            </div>
          )}

          {/* Info de completada */}
          {pac.completada && (
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <CheckCircle2 className="h-3 w-3 text-vt-green" />
              <span className="text-vt-green font-medium">Completada</span>
              {pac.nota !== null && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="font-medium">Nota: {pac.nota}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Icono de alerta para urgentes */}
        {prioridad === 'alta' && !pac.completada && (
          <AlertCircle className="h-4 w-4 text-vt-red flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

export function PacsWidget() {
  const { data: pacs, isLoading } = useDashboardPACs()
  const toggleCompletada = useTogglePACCompletada()
  const [showCompleted, setShowCompleted] = useState(false)
  const [filtroAsignatura, setFiltroAsignatura] = useState<string>('todas')

  // Obtener lista única de asignaturas
  const asignaturas = useMemo(() => {
    if (!pacs) return []
    const uniqueAsignaturas = new Map<string, { codigo: string; nombre: string }>()
    pacs.forEach(pac => {
      if (!uniqueAsignaturas.has(pac.asignatura.codigo)) {
        uniqueAsignaturas.set(pac.asignatura.codigo, pac.asignatura)
      }
    })
    return Array.from(uniqueAsignaturas.values())
  }, [pacs])

  // Filtrar PACs por asignatura
  const pacsFiltradas = useMemo(() => {
    if (!pacs) return []
    if (filtroAsignatura === 'todas') return pacs
    return pacs.filter(pac => pac.asignatura.codigo === filtroAsignatura)
  }, [pacs, filtroAsignatura])

  // Separar pendientes y completadas
  const pendientes = useMemo(() =>
    pacsFiltradas.filter(p => !p.completada),
    [pacsFiltradas]
  )
  const completadas = useMemo(() =>
    pacsFiltradas.filter(p => p.completada),
    [pacsFiltradas]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!pacs || pacs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No hay PACs disponibles
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Sube una Guía Didáctica para ver tus PACs
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con filtros */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
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

      {/* Lista de PACs */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {/* PACs Pendientes */}
        {pendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-vt-green mb-2" />
            <p className="text-sm font-medium text-vt-green">
              {filtroAsignatura !== 'todas'
                ? '¡Todas las PACs de esta asignatura completadas!'
                : '¡Todas las PACs completadas! 🎉'}
            </p>
            {completadas.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {completadas.length} PAC{completadas.length !== 1 ? 's' : ''} entregada{completadas.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          pendientes.map((pac) => (
            <PacCard
              key={pac.userPacId}
              pac={pac}
              onToggle={() => toggleCompletada.mutate({
                userPacId: pac.userPacId,
                completada: !pac.completada
              })}
              isPending={toggleCompletada.isPending}
            />
          ))
        )}

        {/* Sección de PACs Completadas (colapsable) */}
        {completadas.length > 0 && (
          <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between px-2 h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>
                  {showCompleted ? 'Ocultar' : 'Ver'} completadas ({completadas.length})
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
              {completadas.map((pac) => (
                <PacCard
                  key={pac.userPacId}
                  pac={pac}
                  onToggle={() => toggleCompletada.mutate({
                    userPacId: pac.userPacId,
                    completada: !pac.completada
                  })}
                  isPending={toggleCompletada.isPending}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
