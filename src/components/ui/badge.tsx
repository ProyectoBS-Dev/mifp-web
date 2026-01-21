import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge - Componente de badge con colores VT
 * 
 * Usa exclusivamente la paleta de colores VT para consistencia visual.
 * 
 * Colores disponibles:
 *   - green: estados positivos (activo, aprobado, completado)
 *   - blue: información, elementos neutros destacados
 *   - yellow: advertencias, pendientes
 *   - red: errores, urgentes, suspensos
 *   - purple: nuevo, especial, eventos
 *   - gray: inactivo, secundario, deshabilitado
 * 
 * Estilos:
 *   - soft: fondo suave con borde (default)
 *   - solid: fondo sólido
 *   - outline: solo borde
 */

const badgeVariants = cva(
  "inline-flex items-center gap-1 border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default select-none",
  {
    variants: {
      color: {
        green: "",
        yellow: "",
        red: "",
        blue: "",
        purple: "",
        gray: "",
      },
      colorStyle: {
        solid: "",
        soft: "",
        outline: "bg-transparent",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        adjusted: "px-1.5 py-0 text-[10px]",
      },
      rounded: {
        default: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    compoundVariants: [
      // === Solid variants ===
      { color: "green", colorStyle: "solid", className: "border-transparent bg-vt-green text-white hover:bg-vt-green/90" },
      { color: "yellow", colorStyle: "solid", className: "border-transparent bg-vt-yellow text-black hover:bg-vt-yellow/90" },
      { color: "red", colorStyle: "solid", className: "border-transparent bg-vt-red text-white hover:bg-vt-red/90" },
      { color: "blue", colorStyle: "solid", className: "border-transparent bg-vt-blue text-white hover:bg-vt-blue/90" },
      { color: "purple", colorStyle: "solid", className: "border-transparent bg-vt-purple text-white hover:bg-vt-purple/90" },
      { color: "gray", colorStyle: "solid", className: "border-transparent bg-vt-gray-light-1 text-white hover:bg-vt-gray-light-1/90" },

      // === Soft variants (default) ===
      { color: "green", colorStyle: "soft", className: "bg-vt-green/10 text-vt-green border-vt-green/20 hover:bg-vt-green/20" },
      { color: "yellow", colorStyle: "soft", className: "bg-vt-yellow/10 text-vt-yellow-dark dark:text-vt-yellow border-vt-yellow/20 hover:bg-vt-yellow/20" },
      { color: "red", colorStyle: "soft", className: "bg-vt-red/10 text-vt-red border-vt-red/20 hover:bg-vt-red/20" },
      { color: "blue", colorStyle: "soft", className: "bg-vt-blue/10 text-vt-blue border-vt-blue/20 hover:bg-vt-blue/20" },
      { color: "purple", colorStyle: "soft", className: "bg-vt-purple/10 text-vt-purple border-vt-purple/20 hover:bg-vt-purple/20" },
      { color: "gray", colorStyle: "soft", className: "bg-muted text-muted-foreground border-border hover:bg-muted/80" },

      // === Outline variants ===
      { color: "green", colorStyle: "outline", className: "border-vt-green text-vt-green hover:bg-vt-green/10" },
      { color: "yellow", colorStyle: "outline", className: "border-vt-yellow text-vt-yellow-dark dark:text-vt-yellow hover:bg-vt-yellow/10" },
      { color: "red", colorStyle: "outline", className: "border-vt-red text-vt-red hover:bg-vt-red/10" },
      { color: "blue", colorStyle: "outline", className: "border-vt-blue text-vt-blue hover:bg-vt-blue/10" },
      { color: "purple", colorStyle: "outline", className: "border-vt-purple text-vt-purple hover:bg-vt-purple/10" },
      { color: "gray", colorStyle: "outline", className: "border-border text-muted-foreground hover:bg-muted/50" },
    ],
    defaultVariants: {
      color: "gray",
      colorStyle: "soft",
      size: "md",
      rounded: "default",
    },
  }
)

export type BadgeColor = "green" | "yellow" | "red" | "blue" | "purple" | "gray"
export type BadgeColorStyle = "solid" | "soft" | "outline"

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
  VariantProps<typeof badgeVariants> {
  /** Icono opcional a mostrar antes del texto */
  icon?: React.ReactNode
}

function Badge({
  className,
  color = "gray",
  colorStyle = "soft",
  size,
  rounded,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({
          color,
          colorStyle,
          size,
          rounded,
        }),
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0 -ml-0.5">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
