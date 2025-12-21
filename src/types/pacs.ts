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

export function getPrioridad(fechaLimite: string): PrioridadPAC {
  const diasRestantes = Math.ceil(
    (new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (diasRestantes <= 7) return 'alta'
  if (diasRestantes <= 14) return 'media'
  return 'normal'
}

export const prioridadConfig = {
  alta: { label: 'Urgente', color: 'text-red-500', bgColor: 'bg-red-500/10', badge: '🔴' },
  media: { label: 'Próxima', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', badge: '🟡' },
  normal: { label: 'Normal', color: 'text-green-500', bgColor: 'bg-green-500/10', badge: '🟢' },
}
