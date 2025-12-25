// ============================================
// Tipos para el Dashboard Grid
// ============================================

import type { Layout } from 'react-grid-layout'

// Tipos de widgets disponibles
export type WidgetType = 
  | 'stats'
  | 'pacs'
  | 'vts'
  | 'calendar'
  | 'resources'
  | 'notes'
  | 'news'
  | 'grades'

// Configuración de un widget
export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  icon: string
  description?: string
}

// Layout item extendido con el tipo de widget
export interface DashboardLayoutItem extends Layout {
  i: string  // ID del widget (debe coincidir con WidgetConfig.id)
}

// Configuración completa del dashboard
export interface DashboardConfig {
  layouts: {
    lg: DashboardLayoutItem[]
    md: DashboardLayoutItem[]
    sm: DashboardLayoutItem[]
    xs: DashboardLayoutItem[]
  }
  widgets: WidgetConfig[]
}

// Layout guardado en Supabase (formato JSONB)
export type SavedLayout = DashboardLayoutItem[]

// Widgets disponibles por defecto
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'stats',
    type: 'stats',
    title: 'Estadísticas',
    icon: '📊',
    description: 'Tu progreso académico'
  },
  {
    id: 'pacs',
    type: 'pacs',
    title: 'Próximas PACs',
    icon: '📅',
    description: 'Fechas de entrega'
  },
  {
    id: 'vts',
    type: 'vts',
    title: 'Próximas VTs',
    icon: '🎥',
    description: 'Videoconferencias'
  },
  {
    id: 'calendar',
    type: 'calendar',
    title: 'Calendario',
    icon: '📆',
    description: 'Vista mensual'
  },
  {
    id: 'resources',
    type: 'resources',
    title: 'Recursos',
    icon: '📚',
    description: 'Material de estudio'
  },
  {
    id: 'notes',
    type: 'notes',
    title: 'Notas rápidas',
    icon: '📝',
    description: 'Tus apuntes'
  },
  {
    id: 'news',
    type: 'news',
    title: 'Blog',
    icon: '📰',
    description: 'Últimas noticias'
  },
  {
    id: 'grades',
    type: 'grades',
    title: 'Mis Notas',
    icon: '🎯',
    description: 'Calificaciones'
  }
]

// Layout por defecto para pantalla grande (lg)
export const DEFAULT_LAYOUT_LG: DashboardLayoutItem[] = [
  { i: 'calendar', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 3 },
  { i: 'pacs', x: 4, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
  { i: 'vts', x: 8, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
  { i: 'resources', x: 4, y: 4, w: 4, h: 4, minW: 2, minH: 2 },
  { i: 'notes', x: 8, y: 4, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'stats', x: 0, y: 5, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'news', x: 8, y: 7, w: 4, h: 4, minW: 2, minH: 2 },
  { i: 'grades', x: 0, y: 8, w: 8, h: 3, minW: 3, minH: 2 },
]

// Layout para tablet (md)
export const DEFAULT_LAYOUT_MD: DashboardLayoutItem[] = [
  { i: 'stats', x: 0, y: 0, w: 5, h: 2, minW: 2, minH: 2 },
  { i: 'pacs', x: 5, y: 0, w: 5, h: 2, minW: 2, minH: 2 },
  { i: 'vts', x: 0, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
  { i: 'grades', x: 5, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
  { i: 'calendar', x: 0, y: 4, w: 10, h: 4, minW: 3, minH: 3 },
  { i: 'resources', x: 0, y: 8, w: 5, h: 3, minW: 2, minH: 2 },
  { i: 'notes', x: 5, y: 8, w: 5, h: 3, minW: 2, minH: 2 },
  { i: 'news', x: 0, y: 11, w: 10, h: 3, minW: 2, minH: 2 },
]

// Layout para móvil grande (sm)
export const DEFAULT_LAYOUT_SM: DashboardLayoutItem[] = [
  { i: 'stats', x: 0, y: 0, w: 6, h: 2, minW: 2, minH: 2 },
  { i: 'pacs', x: 0, y: 2, w: 6, h: 2, minW: 2, minH: 2 },
  { i: 'vts', x: 0, y: 4, w: 6, h: 2, minW: 2, minH: 2 },
  { i: 'grades', x: 0, y: 6, w: 6, h: 3, minW: 2, minH: 2 },
  { i: 'calendar', x: 0, y: 9, w: 6, h: 4, minW: 3, minH: 3 },
  { i: 'resources', x: 0, y: 13, w: 6, h: 3, minW: 2, minH: 2 },
  { i: 'notes', x: 0, y: 16, w: 6, h: 3, minW: 2, minH: 2 },
  { i: 'news', x: 0, y: 19, w: 6, h: 3, minW: 2, minH: 2 },
]

// Layout para móvil (xs)
export const DEFAULT_LAYOUT_XS: DashboardLayoutItem[] = [
  { i: 'stats', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
  { i: 'pacs', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
  { i: 'vts', x: 0, y: 4, w: 4, h: 2, minW: 2, minH: 2 },
  { i: 'grades', x: 0, y: 6, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'calendar', x: 0, y: 9, w: 4, h: 4, minW: 2, minH: 3 },
  { i: 'resources', x: 0, y: 13, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'notes', x: 0, y: 16, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'news', x: 0, y: 19, w: 4, h: 3, minW: 2, minH: 2 },
]
