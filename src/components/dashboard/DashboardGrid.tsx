'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'
import { GripVertical, Maximize2, Minimize2, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_WIDGETS,
  DEFAULT_LAYOUT_LG,
  type DashboardLayoutItem,
  type WidgetType,
  cleanLayoutForSave,
  generateResponsiveLayouts,
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
  userId: string // Se mantiene por compatibilidad, pero la API usa el token
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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DashboardGrid({ userId, initialLayout }: DashboardGridProps) {
  // Determinar el layout inicial (custom o default)
  const baseLayout = initialLayout?.length ? initialLayout : DEFAULT_LAYOUT_LG
  const initialLayouts = generateResponsiveLayouts(baseLayout)

  const [layouts, setLayouts] = useState<Layouts>(initialLayouts)
  const [isEditing, setIsEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [hasChanges, setHasChanges] = useState(false)

  // Ref para el layout actual durante edición (evita problemas de closure)
  const currentLayoutRef = useRef<DashboardLayoutItem[]>(baseLayout)
  // Ref para debounce del auto-guardado
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Guardar layout via API route (bypass RLS)
  const saveLayout = useCallback(async (layoutToSave: DashboardLayoutItem[]) => {
    setSaveStatus('saving')

    try {
      const cleanedLayout = cleanLayoutForSave(layoutToSave)

      const response = await fetch('/api/user/grid-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout_config: cleanedLayout }),
      })

      if (!response.ok) {
        setSaveStatus('error')
        return false
      }

      setSaveStatus('saved')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
      return true
    } catch {
      setSaveStatus('error')
      return false
    }
  }, [])

  // Manejar cambios de layout (durante drag/resize)
  const handleLayoutChange = useCallback(
    (currentLayout: Layout[], allLayouts: Layouts) => {
      setLayouts(allLayouts)

      // Usar currentLayout directamente (layout del breakpoint activo con cambios)
      currentLayoutRef.current = currentLayout as DashboardLayoutItem[]

      if (isEditing) {
        setHasChanges(true)

        // Debounce: auto-guardar después de 1.5 segundos
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
          saveLayout(currentLayoutRef.current)
        }, 1500)
      }
    },
    [isEditing, saveLayout]
  )

  // Manejar clic en botón de personalizar/guardar
  const handleToggleEdit = useCallback(async () => {
    if (isEditing) {
      // Al salir de edición: guardar cambios pendientes inmediatamente
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }

      if (hasChanges) {
        await saveLayout(currentLayoutRef.current)
      }
    }
    setIsEditing(!isEditing)
  }, [isEditing, hasChanges, saveLayout])

  // Resetear al layout por defecto
  const handleResetLayout = useCallback(async () => {
    const defaultLayouts = generateResponsiveLayouts(DEFAULT_LAYOUT_LG)
    setLayouts(defaultLayouts)
    currentLayoutRef.current = DEFAULT_LAYOUT_LG
    await saveLayout(DEFAULT_LAYOUT_LG)
  }, [saveLayout])

  // Inicializar con layout guardado
  useEffect(() => {
    if (initialLayout && initialLayout.length > 0) {
      const responsiveLayouts = generateResponsiveLayouts(initialLayout)
      setLayouts(responsiveLayouts)
      currentLayoutRef.current = initialLayout
    }
  }, [initialLayout])

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative min-w-0 max-w-full">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        {/* Status indicator */}
        {saveStatus === 'saving' && (
          <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
            <span className="h-2 w-2 bg-vt-yellow rounded-full animate-pulse" />
            Guardando...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-vt-green flex items-center gap-1">
            <Check className="h-3 w-3" />
            Guardado
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs text-vt-red">
            Error al guardar
          </span>
        )}

        {/* Reset button (solo en modo edición) */}
        {isEditing && (
          <button
            onClick={handleResetLayout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-muted/50 hover:bg-muted text-muted-foreground"
            title="Restaurar diseño por defecto"
          >
            <RotateCcw className="h-4 w-4" />
            Resetear
          </button>
        )}

        {/* Main toggle button */}
        <button
          onClick={handleToggleEdit}
          disabled={saveStatus === 'saving'}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            isEditing
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80',
            saveStatus === 'saving' && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isEditing ? (
            <>
              <Minimize2 className="h-4 w-4" />
              {hasChanges ? 'Guardar' : 'Listo'}
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
        breakpoints={{ xl: 1536, lg: 1200, md: 996, sm: 768, xs: 0 }}
        cols={{ xl: 12, lg: 12, md: 10, sm: 6, xs: 4 }}
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
                'relative rounded-xl bg-muted/30 shadow-md overflow-hidden',
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
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-vt-blue/5 to-vt-blue/10">
                <widget.icon className="h-5 w-5 text-vt-blue" />
                <h3 className="font-semibold text-sm">{widget.title}</h3>
              </div>

              {/* Widget Content */}
              <div className="p-4 h-[calc(100%-52px)] overflow-hidden flex flex-col bg-muted/30">
                <WidgetComponent />
              </div>
            </div>
          )
        })}
      </ResponsiveGridLayout>
    </div>
  )
}
