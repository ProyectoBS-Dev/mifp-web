'use client'

import { useState } from 'react'
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
  /** Si true, muestra solo el icono sin texto (texto en sr-only) */
  iconOnly?: boolean
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Componente reutilizable para sidebars colapsables en móvil.
 * 
 * Wrappea Sheet de shadcn/ui con:
 * - Botón trigger customizable con icono
 * - Cierre automático al hacer click en Links y botones
 * - Opción de mantener abierto con data-close-sidebar="false"
 * - Accesibilidad built-in
 * 
 * Para elementos que NO deben cerrar el Sheet (ej. collapsibles),
 * añadir data-close-sidebar="false" al elemento.
 * 
 * @example
 * ```tsx
 * // Uso básico - cierra automáticamente al click
 * <CollapsibleSidebar icon={Menu} label="Menú">
 *   <nav>
 *     <Link href="/dashboard">Dashboard</Link>
 *     <Link href="/notas">Notas</Link>
 *   </nav>
 * </CollapsibleSidebar>
 * 
 * // Con collapsibles que NO deben cerrar
 * <CollapsibleSidebar icon={Filter} label="Filtros">
 *   <button data-close-sidebar="false">Expandir categoría</button>
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
  iconOnly = false
}: CollapsibleSidebarProps) {
  // Estado interno (solo si no está controlado externamente)
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Determinar si el estado es controlado o no
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  // Handler para clicks dentro del contenido
  const handleContentClick = (e: React.MouseEvent) => {
    // Buscar el elemento interactivo clickeado
    const target = e.target as HTMLElement
    const interactiveElement = target.closest('button, a, [role="button"], [role="link"]')
    
    // Si no hay elemento interactivo, no hacer nada
    if (!interactiveElement) return
    
    // Verificar si el elemento tiene data-close-sidebar="false"
    const shouldStayOpen = interactiveElement.getAttribute('data-close-sidebar') === 'false'
    
    // Solo cerrar si el elemento NO tiene la marca de "no cerrar"
    if (!shouldStayOpen) {
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={iconOnly ? "ghost" : "outline"}
          size={iconOnly ? "icon" : "sm"}
          className={className}
        >
          <Icon className={iconOnly ? "h-5 w-5" : "h-4 w-4 mr-2"} />
          {iconOnly ? (
            <span className="sr-only">{label}</span>
          ) : (
            label
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-80 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>
            {description || `Menú de navegación ${label.toLowerCase()}`}
          </SheetDescription>
        </SheetHeader>
        {/* Wrapper para detectar clicks en elementos interactivos */}
        <div onClick={handleContentClick}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
