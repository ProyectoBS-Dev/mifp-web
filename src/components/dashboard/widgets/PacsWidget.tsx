'use client'

import { Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PacItem {
  id: string
  asignatura: string
  nombre: string
  fechaEntrega: string
  diasRestantes: number
  tipo: 'interactiva' | 'desarrollo'
}

function PacCard({ pac }: { pac: PacItem }) {
  const isUrgent = pac.diasRestantes <= 3
  const isWarning = pac.diasRestantes <= 7 && pac.diasRestantes > 3

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        isUrgent && 'border-vt-red/50 bg-vt-red/5',
        isWarning && 'border-vt-yellow/50 bg-vt-yellow/5',
        !isUrgent && !isWarning && 'border-border bg-muted/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {pac.asignatura}
          </p>
          <p className="text-sm font-semibold truncate">{pac.nombre}</p>
        </div>
        {isUrgent && (
          <AlertCircle className="h-4 w-4 text-vt-red flex-shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{pac.fechaEntrega}</span>
        <span className="text-muted-foreground/50">•</span>
        <span
          className={cn(
            'font-medium',
            isUrgent && 'text-vt-red',
            isWarning && 'text-vt-yellow-dark',
            !isUrgent && !isWarning && 'text-foreground'
          )}
        >
          {pac.diasRestantes === 0
            ? 'Hoy'
            : pac.diasRestantes === 1
            ? 'Mañana'
            : `${pac.diasRestantes} días`}
        </span>
      </div>
    </div>
  )
}

export function PacsWidget() {
  // TODO: Conectar con datos reales de Supabase
  const pacs: PacItem[] = [
    {
      id: '1',
      asignatura: 'Programación',
      nombre: 'PAC 3 - Arrays y Colecciones',
      fechaEntrega: '22 Dic 2025',
      diasRestantes: 2,
      tipo: 'desarrollo',
    },
    {
      id: '2',
      asignatura: 'Base de Datos',
      nombre: 'PAC 2 - SQL Avanzado',
      fechaEntrega: '27 Dic 2025',
      diasRestantes: 7,
      tipo: 'interactiva',
    },
    {
      id: '3',
      asignatura: 'Entornos',
      nombre: 'PAC 3 - Git y GitHub',
      fechaEntrega: '30 Dic 2025',
      diasRestantes: 10,
      tipo: 'desarrollo',
    },
  ]

  if (pacs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No tienes PACs pendientes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pacs.map((pac) => (
        <PacCard key={pac.id} pac={pac} />
      ))}
    </div>
  )
}
