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
