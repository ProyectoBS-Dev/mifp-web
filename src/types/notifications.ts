// Tipos para el sistema de notificaciones

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
  icon: string
  count: number
  notifications: Notification[]
}

// Filtros disponibles en el centro de notificaciones
export type NotificationFilter = 'all' | NotificationType

// Configuración de iconos y labels por tipo
export const NOTIFICATION_CONFIG: Record<NotificationType, { label: string; icon: string; color: string }> = {
  pac_vencimiento: {
    label: 'PACs',
    icon: '📋',
    color: 'text-orange-500',
  },
  vt_recordatorio: {
    label: 'Videotutorías',
    icon: '📹',
    color: 'text-blue-500',
  },
  noticia_nueva: {
    label: 'Noticias',
    icon: '📰',
    color: 'text-green-500',
  },
  sistema: {
    label: 'Sistema',
    icon: '⚙️',
    color: 'text-gray-500',
  },
  gd_subida: {
    label: 'Guías Didácticas',
    icon: '📤',
    color: 'text-purple-500',
  },
}

// Helper para formatear tiempo relativo
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'hace unos segundos'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`
}

