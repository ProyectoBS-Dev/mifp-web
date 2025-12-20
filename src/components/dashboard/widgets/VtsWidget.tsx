'use client'

import { Video, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VtItem {
  id: string
  asignatura: string
  tema: string
  fecha: string
  hora: string
  enlace?: string
  esHoy: boolean
}

function VtCard({ vt }: { vt: VtItem }) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        vt.esHoy && 'border-vt-green/50 bg-vt-green/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            vt.esHoy ? 'bg-vt-green/10 text-vt-green' : 'bg-muted text-muted-foreground'
          )}
        >
          <Video className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {vt.asignatura}
          </p>
          <p className="text-sm font-semibold truncate">{vt.tema}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{vt.fecha}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-medium">{vt.hora}</span>
          </div>
        </div>
        {vt.enlace && (
          <a
            href={vt.enlace}
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
  // TODO: Conectar con datos reales de Supabase
  const vts: VtItem[] = [
    {
      id: '1',
      asignatura: 'Programación',
      tema: 'VT 5 - POO Avanzada',
      fecha: '20 Dic',
      hora: '18:00',
      enlace: '#',
      esHoy: true,
    },
    {
      id: '2',
      asignatura: 'Base de Datos',
      tema: 'VT 4 - Normalización',
      fecha: '23 Dic',
      hora: '19:00',
      esHoy: false,
    },
    {
      id: '3',
      asignatura: 'Sistemas',
      tema: 'VT 3 - Redes',
      fecha: '27 Dic',
      hora: '17:00',
      esHoy: false,
    },
  ]

  if (vts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Video className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No tienes VTs programadas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {vts.map((vt) => (
        <VtCard key={vt.id} vt={vt} />
      ))}
    </div>
  )
}
