// ============================================
// Tipos para el Calendario del Dashboard
// ============================================

import type { LucideIcon } from 'lucide-react'
import { FileText, Video, BookOpen, Pin } from 'lucide-react'

export type EventoTipo = 'pac' | 'vt' | 'examen' | 'custom'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: EventoTipo
  color: string
  asignatura?: {
    nombre: string
    codigo: string
  }
  source: 'pac' | 'vt' | 'manual'
  sourceId: string
  // Campos extra para eventos personales
  descripcion?: string
}

// Colores por tipo de evento (coinciden con la paleta vt-*)
export const eventColors: Record<EventoTipo, string> = {
  pac: '#ed3c50',    // vt-red
  vt: '#42b883',     // vt-green  
  examen: '#ffc517', // vt-yellow
  custom: '#3b8eed', // vt-blue
}

// Iconos por tipo de evento (Lucide React)
export const eventIcons: Record<EventoTipo, LucideIcon> = {
  pac: FileText,
  vt: Video,
  examen: BookOpen,
  custom: Pin,
}

// Labels en español
export const eventLabels: Record<EventoTipo, string> = {
  pac: 'PAC',
  vt: 'Videotutoría',
  examen: 'Examen',
  custom: 'Personal',
}

// Para crear nuevo evento
export interface CreateEventoInput {
  titulo: string
  descripcion?: string
  tipo: EventoTipo
  fecha_inicio: Date
  fecha_fin?: Date
  todo_el_dia: boolean
  asignatura_id?: string
}
