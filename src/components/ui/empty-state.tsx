import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * EmptyState - Estado vacío reutilizable
 * 
 * Reemplaza patrones duplicados de empty states en:
 * - ResourcesWidget.tsx (EmptyState local)
 * - NewsWidget.tsx (inline empty state)
 * - NotificationCenter.tsx (EmptyState local)
 * - NotasCalculator.tsx (múltiples empty states)
 * - NotasSidebar.tsx (mensaje vacío simple)
 */

const emptyStateVariants = cva(
    "flex flex-col items-center justify-center text-center",
    {
        variants: {
            size: {
                sm: "py-4 px-2 gap-1.5",
                md: "py-8 px-4 gap-2",
                lg: "py-12 px-6 gap-3",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const iconContainerVariants = cva(
    "rounded-full bg-muted flex items-center justify-center text-muted-foreground",
    {
        variants: {
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-14 w-14",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const iconVariants = cva(
    "text-muted-foreground",
    {
        variants: {
            size: {
                sm: "h-4 w-4",
                md: "h-5 w-5",
                lg: "h-7 w-7",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const titleVariants = cva(
    "font-medium text-foreground",
    {
        variants: {
            size: {
                sm: "text-sm",
                md: "text-base",
                lg: "text-lg",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const descriptionVariants = cva(
    "text-muted-foreground",
    {
        variants: {
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

export interface EmptyStateAction {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
}

export interface EmptyStateProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
    /** Icono de Lucide a mostrar */
    icon?: React.ReactNode
    /** Emoji alternativo al icono */
    emoji?: string
    /** Título opcional (más prominente que description) */
    title?: string
    /** Descripción principal del estado vacío */
    description: string
    /** Acción opcional con botón */
    action?: EmptyStateAction
    /** Texto secundario debajo de la descripción */
    hint?: string
}

function EmptyState({
    className,
    size,
    icon,
    emoji,
    title,
    description,
    action,
    hint,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(emptyStateVariants({ size }), className)}
            {...props}
        >
            {/* Icono o Emoji */}
            {(icon || emoji) && (
                emoji ? (
                    <span className={cn(
                        size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-4xl"
                    )}>
                        {emoji}
                    </span>
                ) : (
                    <div className={iconContainerVariants({ size })}>
                        {React.isValidElement(icon)
                            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                                className: cn(
                                    iconVariants({ size }),
                                    (icon as React.ReactElement<{ className?: string }>).props.className
                                )
                            })
                            : icon
                        }
                    </div>
                )
            )}

            {/* Título */}
            {title && (
                <p className={titleVariants({ size })}>
                    {title}
                </p>
            )}

            {/* Descripción */}
            <p className={descriptionVariants({ size })}>
                {description}
            </p>

            {/* Hint/texto secundario */}
            {hint && (
                <p className={cn(descriptionVariants({ size }), "mt-1 opacity-75")}>
                    {hint}
                </p>
            )}

            {/* Acción */}
            {action && (
                <Button
                    variant={action.variant || "outline"}
                    size={size === "sm" ? "sm" : "default"}
                    onClick={action.onClick}
                    className="mt-2"
                >
                    {action.label}
                </Button>
            )}
        </div>
    )
}

export { EmptyState, emptyStateVariants }
