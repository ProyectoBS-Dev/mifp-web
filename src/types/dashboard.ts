// ============================================
// Tipos para el Dashboard Grid
// ============================================

import type { Layout } from 'react-grid-layout'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarClock,
  Video,
  Calendar,
  BookOpen,
  StickyNote,
  Newspaper,
  GraduationCap,
} from 'lucide-react'

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
  icon: LucideIcon
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
    icon: BarChart3,
    description: 'Tu progreso académico'
  },
  {
    id: 'pacs',
    type: 'pacs',
    title: 'Próximas PACs',
    icon: CalendarClock,
    description: 'Fechas de entrega'
  },
  {
    id: 'vts',
    type: 'vts',
    title: 'Próximas VTs',
    icon: Video,
    description: 'Videoconferencias'
  },
  {
    id: 'calendar',
    type: 'calendar',
    title: 'Calendario',
    icon: Calendar,
    description: 'Vista mensual'
  },
  {
    id: 'resources',
    type: 'resources',
    title: 'Recursos',
    icon: BookOpen,
    description: 'Material de estudio'
  },
  {
    id: 'notes',
    type: 'notes',
    title: 'Notas rápidas',
    icon: StickyNote,
    description: 'Tus apuntes'
  },
  {
    id: 'news',
    type: 'news',
    title: 'Blog',
    icon: Newspaper,
    description: 'Últimas noticias'
  },
  {
    id: 'grades',
    type: 'grades',
    title: 'Mis Notas',
    icon: GraduationCap,
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

// ============================================
// Utilidades para derivar layouts responsivos
// ============================================

/**
 * Ordena widgets por posición (izquierda→derecha, arriba→abajo)
 * para mantener coherencia visual entre breakpoints
 */
export function sortWidgetsByPosition(layout: DashboardLayoutItem[]): string[] {
  return [...layout]
    .sort((a, b) => {
      // Primero por fila (y), luego por columna (x)
      if (a.y !== b.y) return a.y - b.y
      return a.x - b.x
    })
    .map(item => item.i)
}

/**
 * Limpia propiedades innecesarias del layout antes de guardar
 * (react-grid-layout añade 'moved', 'static', etc.)
 * Solo guarda las propiedades esenciales para reconstruir el layout
 */
export function cleanLayoutForSave(layout: DashboardLayoutItem[]): DashboardLayoutItem[] {
  return layout.map(item => {
    // Solo incluir propiedades que tienen valor
    const cleaned: DashboardLayoutItem = {
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }
    // Solo añadir minW/minH si tienen valor definido
    if (item.minW !== undefined) cleaned.minW = item.minW
    if (item.minH !== undefined) cleaned.minH = item.minH
    return cleaned
  })
}

/**
 * Deriva un layout responsivo a partir del orden de widgets del layout principal
 * @param widgetOrder - Array de IDs de widgets en el orden deseado
 * @param baseLayout - Layout base con las dimensiones para ese breakpoint
 * @param cols - Número de columnas para ese breakpoint
 */
export function deriveResponsiveLayout(
  widgetOrder: string[],
  baseLayout: DashboardLayoutItem[],
  cols: number
): DashboardLayoutItem[] {
  const result: DashboardLayoutItem[] = []
  let currentY = 0

  for (const widgetId of widgetOrder) {
    const baseItem = baseLayout.find(item => item.i === widgetId)
    if (!baseItem) continue
    
    result.push({
      i: widgetId,
      x: 0, // Siempre empieza en x=0 para móvil (una columna)
      y: currentY,
      w: cols, // Ancho completo en layouts pequeños
      h: baseItem.h,
      minW: Math.min(baseItem.minW || 2, cols),
      minH: baseItem.minH || 2,
    })
    
    currentY += baseItem.h
  }

  return result
}

/**
 * Genera todos los layouts responsivos basándose en el layout principal (lg/xl)
 */
export function generateResponsiveLayouts(mainLayout: DashboardLayoutItem[]): {
  xl: DashboardLayoutItem[]
  lg: DashboardLayoutItem[]
  md: DashboardLayoutItem[]
  sm: DashboardLayoutItem[]
  xs: DashboardLayoutItem[]
} {
  const widgetOrder = sortWidgetsByPosition(mainLayout)
  
  return {
    xl: mainLayout,
    lg: mainLayout,
    md: deriveResponsiveLayout(widgetOrder, DEFAULT_LAYOUT_MD, 10),
    sm: deriveResponsiveLayout(widgetOrder, DEFAULT_LAYOUT_SM, 6),
    xs: deriveResponsiveLayout(widgetOrder, DEFAULT_LAYOUT_XS, 4),
  }
}
