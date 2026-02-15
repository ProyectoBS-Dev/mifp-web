// Tipos para el sistema de notificaciones

import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Video, Newspaper, Settings, FileUp } from 'lucide-react'

export type NotificationType =
  | 'pac_vencimiento'  // PAC próxima a vencer (24h, 48h)
  | 'vt_recordatorio'  // VT en X horas
  | 'noticia_nueva'    // Nueva noticia/post publicado
  | 'sistema'          // Actualizaciones de la app
  | 'gd_subida'        // Nueva GD subida (SOLO para admins)

export interface Notification {
  id: string
  user_id: string
  tipo: NotificationType
  titulo: string
  mensaje: string | null
  leida: boolean
  data: NotificationData | null
  created_at: string
}

// Datos adicionales según el tipo de notificación
export interface NotificationData {
  // Para pac_vencimiento
  pac_id?: string
  pac_titulo?: string
  asignatura_nombre?: string
  fecha_limite?: string
  horas_restantes?: number

  // Para vt_recordatorio
  vt_id?: string
  vt_titulo?: string
  fecha_programada?: string
  hora_inicio?: string
  zoom_link?: string
  zoom_passcode?: string

  // Para noticia_nueva
  noticia_id?: string
  noticia_slug?: string  // URL amigable del post
  noticia_titulo?: string
  imagen_url?: string

  // Para gd_subida (admins)
  guia_id?: string
  asignatura_id?: string
  subido_por?: string
  subido_por_nombre?: string
}

// Preferencias de notificaciones del usuario
export interface NotificationSettings {
  pac_vencimiento: boolean
  vt_recordatorio: boolean
  noticia_nueva: boolean
  sistema: boolean
  gd_subida: boolean // Solo relevante para admins
}

// Notificaciones agrupadas por tipo para la UI
export interface GroupedNotifications {
  tipo: NotificationType
  label: string
  icon: LucideIcon
  count: number
  notifications: Notification[]
}

// Filtros disponibles en el centro de notificaciones
export type NotificationFilter = 'all' | NotificationType

// Configuración de iconos y labels por tipo
export const NOTIFICATION_CONFIG: Record<NotificationType, { label: string; icon: LucideIcon; color: string }> = {
  pac_vencimiento: {
    label: 'PACs',
    icon: ClipboardList,
    color: 'text-vt-orange/50',
  },
  vt_recordatorio: {
    label: 'Videotutorías',
    icon: Video,
    color: 'text-vt-blue/50',
  },
  noticia_nueva: {
    label: 'Noticias',
    icon: Newspaper,
    color: 'text-vt-gray/50',
  },
  sistema: {
    label: 'Sistema',
    icon: Settings,
    color: 'text-vt-green/50',
  },
  gd_subida: {
    label: 'Guías Didácticas',
    icon: FileUp,
    color: 'text-vt-red/50',
  },
}

