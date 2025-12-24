// types/vts.ts

export interface VTItem {
  id: string
  userVtId: string
  numero: number
  titulo: string
  fecha_programada: string
  hora_inicio: string | null
  duracion_minutos: number
  enlace_grabacion?: string | null
  vista: boolean
}

export interface VTsByAsignatura {
  asignatura: {
    id: string
    nombre: string
    codigo: string
  }
  vts: VTItem[]
  progreso: {
    total: number
    vistas: number
    porcentaje: number
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}
