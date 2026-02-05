'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import type { LucideIcon } from 'lucide-react'

// ============================================
// TIPOS
// ============================================

export interface CollapsibleSidebarProps {
  /** Icono de lucide-react para el botón trigger */
  icon: LucideIcon
  /** Texto del botón trigger (ej. "Menú", "Filtros") */
  label: string
  /** Contenido del sidebar */
  children: React.ReactNode
  /** Lado desde el cual se desliza el Sheet */
  side?: 'left' | 'right'
  /** Clases CSS adicionales para el trigger button */
  className?: string
  /** Control externo del estado open (opcional) */
  open?: boolean
  /** Callback para control externo del estado (opcional) */
  onOpenChange?: (open: boolean) => void
  /** Descripción para accesibilidad (opcional) */
  description?: string
  /** Callback cuando se hace click en un item del sidebar (para cerrar en escenarios de filtrado) */
  onItemClick?: () => void
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Componente reutilizable para sidebars colapsables en móvil.
 * 
 * Wrappea Sheet de shadcn/ui con:
 * - Botón trigger customizable con icono
 * - Auto-cierre al navegar a nueva ruta (pathname change)
 * - Cierre manual via onItemClick (para filtros en misma ruta)
 * - Accesibilidad built-in
 * 
 * @example
 * ```tsx
 * // Para navegación entre rutas (auto-close por pathname)
 * <CollapsibleSidebar icon={Menu} label="Menú">
 *   <nav>...</nav>
 * </CollapsibleSidebar>
 * 
 * // Para filtros en misma ruta (manual close)
 * <CollapsibleSidebar 
 *   icon={Filter} 
 *   label="Filtros"
 *   onItemClick={() => setOpen(false)}
 * >
 *   <div>...</div>
 * </CollapsibleSidebar>
 * ```
 */
export function CollapsibleSidebar({
  icon: Icon,
  label,
  children,
  side = 'left',
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  description,
  onItemClick
}: CollapsibleSidebarProps) {
  // Estado interno (solo si no está controlado externamente)
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Determinar si el estado es controlado o no
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  // Auto-cerrar al navegar (cambio de pathname)
  const pathname = usePathname()
  
  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  // Handler para clicks dentro del contenido
  const handleContentClick = () => {
    if (onItemClick) {
      onItemClick()
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={className}
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-80 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>
            {description || `Menú de navegación ${label.toLowerCase()}`}
          </SheetDescription>
        </SheetHeader>
        {/* Wrapper para interceptar clicks si hay callback */}
        {onItemClick ? (
          <div onClick={handleContentClick}>
            {children}
          </div>
        ) : (
          children
        )}
      </SheetContent>
    </Sheet>
  )
}
