'use client'

import { useState, useMemo, memo } from 'react'
import { ChevronRight, FileText, Link as LinkIcon, Headphones, CheckSquare, Video, FolderOpen, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getAsignaturaAlias } from '@/lib/asignatura-alias'
import { useRecursosFavoritos } from '@/hooks/useRecursosFavoritos'
import type { RecursoTipo, RecursoTipoUI } from '@/types/recursos'

// ============================================
// TIPOS
// ============================================

interface AsignaturaWithCounts {
  id: string
  nombre: string
  codigo: string
  grado_nombre: string
  grado_codigo: string
  count: number
}

interface RecursosSidebarContentProps {
  asignaturas: AsignaturaWithCounts[]
  selectedAsignaturaId: string | null
  selectedTipo: RecursoTipoUI | null
  onSelectAsignatura: (id: string | null) => void
  onSelectTipo: (tipo: RecursoTipoUI | null) => void
  counts: {
    pdf: number
    enlace: number
    podcast: number
    video: number
    test: number
    total: number
  }
}

// ============================================
// CONSTANTES
// ============================================

const TIPO_CONFIG: Record<Exclude<RecursoTipoUI, 'todos' | 'favoritos'>, {
  icon: typeof FileText
  label: string
  color: string
}> = {
  pdf: {
    icon: FileText,
    label: 'PDFs',
    color: 'text-vt-red'
  },
  enlace: {
    icon: LinkIcon,
    label: 'Enlaces',
    color: 'text-vt-blue'
  },
  podcast: {
    icon: Headphones,
    label: 'Podcasts',
    color: 'text-vt-purple'
  },
  video: {
    icon: Video,
    label: 'Videos',
    color: 'text-vt-yellow'
  },
  test: {
    icon: CheckSquare,
    label: 'Tests',
    color: 'text-vt-green'
  }
}

// ============================================
// COMPONENTE PURO (sin clases de visibilidad)
// ============================================

/**
 * Contenido puro del sidebar de recursos, sin clases de visibilidad.
 * Se reutiliza tanto en desktop (via RecursosSidebar) como en mobile (via CollapsibleSidebar).
 */
export const RecursosSidebarContent = memo(function RecursosSidebarContent({
  asignaturas,
  selectedAsignaturaId,
  selectedTipo,
  onSelectAsignatura,
  onSelectTipo,
  counts
}: RecursosSidebarContentProps) {
  // Obtener favoritos
  const { data: favoritos = [], isLoading: isLoadingFavoritos } = useRecursosFavoritos()

  // Agrupar asignaturas por grado
  const asignaturasPorGrado = asignaturas.reduce((acc, asig) => {
    const grado = asig.grado_codigo || asig.grado_nombre
    if (!acc[grado]) {
      acc[grado] = []
    }
    acc[grado].push(asig)
    return acc
  }, {} as Record<string, AsignaturaWithCounts[]>)

  // Estado de colapsables - COLLAPSED POR DEFECTO
  const initialGradosAbiertos = useMemo(() => {
    return Object.keys(asignaturasPorGrado).reduce((acc, grado) => {
      acc[grado] = false  // ← CERRADOS POR DEFECTO
      return acc
    }, {} as Record<string, boolean>)
  }, [asignaturasPorGrado])

  const [gradosAbiertos, setGradosAbiertos] = useState(initialGradosAbiertos)

  const toggleGrado = (grado: string) => {
    setGradosAbiertos(prev => ({ ...prev, [grado]: !prev[grado] }))
  }

  return (
    <TooltipProvider>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Todos los recursos */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
            Categorías
          </h3>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-between text-sm h-9',
              selectedAsignaturaId === null && selectedTipo === null &&
                'bg-primary/10 text-primary font-medium'
            )}
            onClick={() => {
              onSelectAsignatura(null)
              onSelectTipo(null)
            }}
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Todos los recursos
            </span>
            <Badge color="gray" colorStyle="soft" className="text-xs">
              {counts.total}
            </Badge>
          </Button>
        </div>

        {/* Por Asignatura */}
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
            Por Asignatura
          </h3>
          {Object.entries(asignaturasPorGrado).map(([grado, asigs]) => (
            <Collapsible
              key={grado}
              open={gradosAbiertos[grado]}
              onOpenChange={() => toggleGrado(grado)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sm h-9 px-2"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        gradosAbiertos[grado] && 'rotate-90'
                      )}
                    />
                    {grado}
                  </span>
                  <Badge color="gray" colorStyle="soft" className="text-xs">
                    {asigs.reduce((sum, a) => sum + a.count, 0)}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-1 mt-1">
                {asigs.map((asig) => {
                  const alias = getAsignaturaAlias(asig.nombre)
                  const showTooltip = alias !== asig.nombre

                  return (
                    <Tooltip key={asig.id} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            'w-full justify-between text-sm h-8 px-2',
                            selectedAsignaturaId === asig.id &&
                              'bg-primary/10 text-primary font-medium border-l-2 border-l-primary'
                          )}
                          onClick={() => {
                            onSelectAsignatura(asig.id)
                            onSelectTipo(null)
                          }}
                        >
                          <span className="truncate text-left flex-1">
                            {alias}
                          </span>
                          {asig.count > 0 && (
                            <Badge color="gray" colorStyle="soft" className="text-xs ml-1">
                              {asig.count}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {showTooltip && (
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">{asig.nombre}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Por Tipo */}
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
            Por Tipo
          </h3>
          {Object.entries(TIPO_CONFIG).map(([tipo, config]) => {
            const Icon = config.icon
            const count = counts[tipo as keyof typeof counts] || 0
            
            return (
              <Button
                key={tipo}
                variant="ghost"
                className={cn(
                  'w-full justify-between text-sm h-9 px-2',
                  selectedTipo === tipo &&
                    'bg-primary/10 text-primary font-medium border-l-2 border-l-primary'
                )}
                onClick={() => {
                  onSelectAsignatura(null)
                  onSelectTipo(tipo as RecursoTipo)
                }}
              >
                <span className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', config.color)} />
                  {config.label}
                </span>
                <Badge color="gray" colorStyle="soft" className="text-xs">
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>

        {/* Favoritos */}
        {!isLoadingFavoritos && favoritos.length > 0 && (
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
              Favoritos
            </h3>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between text-sm h-9 px-2',
                selectedTipo === 'favoritos' &&
                  'bg-primary/10 text-primary font-medium border-l-2 border-l-primary'
              )}
              onClick={() => {
                onSelectAsignatura(null)
                onSelectTipo('favoritos' as RecursoTipo)
              }}
            >
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-vt-yellow fill-current" />
                Mis Favoritos
              </span>
              <Badge color="gray" colorStyle="soft" className="text-xs">
                {favoritos.length}
              </Badge>
            </Button>
          </div>
        )}
      </nav>
    </TooltipProvider>
  )
})
