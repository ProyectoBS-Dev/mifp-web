'use client'

import { useState, useCallback, useEffect } from 'react'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  DEFAULT_WIDGETS,
  DEFAULT_LAYOUT_LG,
  DEFAULT_LAYOUT_MD,
  DEFAULT_LAYOUT_SM,
  DEFAULT_LAYOUT_XS,
  type DashboardLayoutItem,
  type WidgetType,
} from '@/types/dashboard'

// Widgets
import { StatsWidget } from './widgets/StatsWidget'
import { PacsWidget } from './widgets/PacsWidget'
import { VtsWidget } from './widgets/VtsWidget'
import { CalendarWidget } from './widgets/CalendarWidget'
import { ResourcesWidget } from './widgets/ResourcesWidget'
import { NotesWidget } from './widgets/NotesWidget'
import { NewsWidget } from './widgets/NewsWidget'
import { GradesWidget } from './widgets/GradesWidget'

// CSS de react-grid-layout
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface DashboardGridProps {
  userId: string
  initialLayout?: DashboardLayoutItem[]
}

const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType> = {
  stats: StatsWidget,
  pacs: PacsWidget,
  vts: VtsWidget,
  calendar: CalendarWidget,
  resources: ResourcesWidget,
  notes: NotesWidget,
  news: NewsWidget,
  grades: GradesWidget,
}

export function DashboardGrid({ userId, initialLayout }: DashboardGridProps) {
  const [layouts, setLayouts] = useState<Layouts>({
    lg: initialLayout || DEFAULT_LAYOUT_LG,
    md: DEFAULT_LAYOUT_MD,
    sm: DEFAULT_LAYOUT_SM,
    xs: DEFAULT_LAYOUT_XS,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Guardar layout en Supabase
  const saveLayout = useCallback(async (newLayouts: Layouts) => {
    setIsSaving(true)
    const supabase = createClient()
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('user_grid_layout')
        .upsert({
          user_id: userId,
          layout_config: newLayouts.lg,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving layout:', error)
      }
    } catch (err) {
      console.error('Error saving layout:', err)
    } finally {
      setIsSaving(false)
    }
  }, [userId])

  // Manejar cambios de layout
  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      setLayouts(allLayouts)
      
      // Auto-guardar cuando se edita
      if (isEditing) {
        saveLayout(allLayouts)
      }
    },
    [isEditing, saveLayout]
  )

  // Cargar layout guardado
  useEffect(() => {
    if (initialLayout && initialLayout.length > 0) {
      setLayouts(prev => ({
        ...prev,
        lg: initialLayout,
      }))
    }
  }, [initialLayout])

  return (
    <div className="relative">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        {isSaving && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Guardando...
          </span>
        )}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            isEditing
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          {isEditing ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Guardar
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Personalizar
            </>
          )}
        </button>
      </div>

      {/* Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={80}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
      >
        {DEFAULT_WIDGETS.map((widget) => {
          const WidgetComponent = WIDGET_COMPONENTS[widget.type]
          
          return (
            <div
              key={widget.id}
              className={cn(
                'relative rounded-xl border bg-card shadow-sm overflow-hidden',
                'transition-shadow duration-200',
                isEditing && 'ring-2 ring-primary/20 cursor-move hover:shadow-lg'
              )}
            >
              {/* Drag handle */}
              {isEditing && (
                <div className="absolute top-2 right-2 z-10 p-1 rounded bg-muted/80 cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              {/* Widget Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <span className="text-lg">{widget.icon}</span>
                <h3 className="font-semibold text-sm">{widget.title}</h3>
              </div>
              
              {/* Widget Content */}
              <div className="p-4 h-[calc(100%-52px)] overflow-auto">
                <WidgetComponent />
              </div>
            </div>
          )
        })}
      </ResponsiveGridLayout>
    </div>
  )
}
