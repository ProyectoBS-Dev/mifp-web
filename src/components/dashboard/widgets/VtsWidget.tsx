'use client'

import { Video, Clock, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardVTs, useToggleVTVista } from '@/hooks'
import { Checkbox } from '@/components/ui/checkbox'
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
        vt.vista && 'opacity-60',
        esHoy && !vt.vista && 'border-vt-green/50 bg-vt-green/5'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={vt.vista}
          onCheckedChange={onToggle}
          disabled={isPending || esFuturo}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {asignatura}
          </p>
          <p className={cn(
            'text-sm font-semibold truncate',
            vt.vista && 'line-through'
          )}>
            VT {vt.numero} - {vt.titulo}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{fechaFormateada}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-medium">{vt.hora_inicio?.slice(0, 5) || '--:--'}</span>
            {esHoy && !vt.vista && (
              <span className="text-vt-green font-medium ml-1">HOY</span>
            )}
          </div>
        </div>
        {vt.enlace_grabacion && (
          <a
            href={vt.enlace_grabacion}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        )}
      </div>
    </div>
  )
}

export function VtsWidget() {
  const { data: vtsByAsignatura, isLoading } = useDashboardVTs()
  const toggleVista = useToggleVTVista()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Aplanar todas las VTs y ordenar por fecha
  const allVTs = vtsByAsignatura?.flatMap(grupo => 
    grupo.vts.map(vt => ({ ...vt, asignaturaNombre: grupo.asignatura.nombre }))
  ) || []

  const pendientes = allVTs.filter(vt => !vt.vista)
  const totalVTs = allVTs.length
  const vistasCount = allVTs.filter(vt => vt.vista).length
  const porcentaje = totalVTs > 0 ? Math.round((vistasCount / totalVTs) * 100) : 0

  if (totalVTs === 0) {
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

  if (pendientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <CheckCircle2 className="h-8 w-8 text-vt-green mb-2" />
        <p className="text-sm font-medium text-vt-green">
          ¡Todas las VTs vistas! 🎉
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {vistasCount} VT{vistasCount !== 1 ? 's' : ''} completada{vistasCount !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Barra de progreso */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{vistasCount}/{totalVTs} vistas</span>
        <Progress value={porcentaje} className="h-1.5 flex-1" />
        <span className={cn(porcentaje === 100 && 'text-vt-green')}>{porcentaje}%</span>
      </div>

      {/* Lista de VTs pendientes */}
      <div className="space-y-2 max-h-[calc(100%-2rem)] overflow-y-auto">
        {pendientes.slice(0, 4).map((vt) => (
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
        {pendientes.length > 4 && (
          <p className="text-xs text-center text-muted-foreground">
            +{pendientes.length - 4} VTs más
          </p>
        )}
      </div>
    </div>
  )
}
