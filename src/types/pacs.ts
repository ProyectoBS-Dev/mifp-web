// types/pacs.ts

export interface PACItem {
  id: string
  userPacId: string
  numero: number
  titulo: string
  asignatura: {
    nombre: string
    codigo: string
  }
  ra: {
    numero: number
    titulo: string
  }
  fecha_limite: string
  completada: boolean
  nota: number | null
}

export type PrioridadPAC = 'alta' | 'media' | 'normal'

/**
 * Calcula la prioridad de una PAC según su fecha límite
 * - Alta: ≤7 días
 * - Media: 8-14 días
 * - Normal: >14 días
 */
export function getPrioridad(fechaLimite: string): PrioridadPAC {
  const diasRestantes = Math.ceil(
    (new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (diasRestantes <= 7) return 'alta'
  if (diasRestantes <= 14) return 'media'
  return 'normal'
}

export const prioridadConfig = {
  alta: { 
    label: 'Alta', 
    color: 'text-vt-red', 
    bgColor: 'bg-vt-red/10', 
    borderColor: 'border-vt-red/50',
    badge: '🔴' 
  },
  media: { 
    label: 'Media', 
    color: 'text-vt-yellow-dark', 
    bgColor: 'bg-vt-yellow/10', 
    borderColor: 'border-vt-yellow/50',
    badge: '🟡' 
  },
  normal: { 
    label: 'Normal', 
    color: 'text-vt-green', 
    bgColor: 'bg-vt-green/10', 
    borderColor: 'border-vt-green/50',
    badge: '🟢' 
  },
} as const
