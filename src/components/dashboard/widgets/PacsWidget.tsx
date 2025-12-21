'use client'

import { Calendar, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardPACs, useTogglePACCompletada } from '@/hooks'
import { Checkbox } from '@/components/ui/checkbox'
import type { PACItem } from '@/types/pacs'

function PacCard({ pac, onToggle, isPending }: { 
  pac: PACItem
  onToggle: () => void
  isPending: boolean 
}) {
  const diasRestantes = Math.ceil(
    (new Date(pac.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const isUrgent = diasRestantes <= 3 && !pac.completada
  const isWarning = diasRestantes <= 7 && diasRestantes > 3 && !pac.completada

  const fechaFormateada = new Date(pac.fecha_limite).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        pac.completada && 'opacity-60',
        isUrgent && 'border-vt-red/50 bg-vt-red/5',
        isWarning && 'border-vt-yellow/50 bg-vt-yellow/5',
        !isUrgent && !isWarning && 'border-border bg-muted/30'
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
          <p className="text-xs font-medium text-muted-foreground truncate">
            {pac.asignatura.nombre}
          </p>
          <p className={cn(
            'text-sm font-semibold truncate',
            pac.completada && 'line-through'
          )}>
            PAC {pac.numero} - {pac.titulo}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{fechaFormateada}</span>
            {!pac.completada && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span
                  className={cn(
                    'font-medium',
                    isUrgent && 'text-vt-red',
                    isWarning && 'text-vt-yellow-dark',
                    !isUrgent && !isWarning && 'text-foreground'
                  )}
                >
                  {diasRestantes <= 0
                    ? 'Vencida'
                    : diasRestantes === 1
                    ? 'Mañana'
                    : `${diasRestantes} días`}
                </span>
              </>
            )}
            {pac.completada && pac.nota !== null && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="font-medium text-vt-green">
                  Nota: {pac.nota}
                </span>
              </>
            )}
          </div>
        </div>
        {isUrgent && !pac.completada && (
          <AlertCircle className="h-4 w-4 text-vt-red flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

export function PacsWidget() {
  const { data: pacs, isLoading } = useDashboardPACs()
  const toggleCompletada = useTogglePACCompletada()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const pendientes = pacs?.filter(p => !p.completada) || []
  const completadas = pacs?.filter(p => p.completada) || []

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

  if (pendientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <CheckCircle2 className="h-8 w-8 text-vt-green mb-2" />
        <p className="text-sm font-medium text-vt-green">
          ¡Todas las PACs completadas! 🎉
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {completadas.length} PAC{completadas.length !== 1 ? 's' : ''} entregada{completadas.length !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-full overflow-y-auto">
      {pendientes.slice(0, 5).map((pac) => (
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
      {pendientes.length > 5 && (
        <p className="text-xs text-center text-muted-foreground">
          +{pendientes.length - 5} PACs más
        </p>
      )}
    </div>
  )
}
