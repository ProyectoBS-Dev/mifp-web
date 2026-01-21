import type { BadgeColor } from '@/components/ui/badge'

/**
 * @deprecated Usar GradeBadgeColor en su lugar
 */
export type GradeBadgeVariant = 'default' | 'secondary' | 'destructive'

export type GradeBadgeColor = BadgeColor

/**
 * Devuelve clases CSS de color según la nota
 */
export function getGradeColor(nota: number | null): string {
    if (nota === null) return 'text-muted-foreground'
    if (nota >= 9) return 'text-vt-green dark:text-vt-green-light'
    if (nota >= 7) return 'text-vt-green dark:text-vt-green-light'
    if (nota >= 5) return 'text-vt-blue dark:text-vt-blue-light'
    return 'text-vt-red dark:text-vt-red-light'
}

/**
 * Devuelve label y color VT para Badge según la nota
 * 
 * Uso: <Badge color={badge.color}>{badge.label}</Badge>
 */
export function getGradeBadge(nota: number | null): {
    label: string
    color: GradeBadgeColor
} {
    if (nota === null) return { label: 'Sin evaluar', color: 'gray' }
    if (nota >= 9) return { label: 'Sobresaliente', color: 'green' }
    if (nota >= 7) return { label: 'Notable', color: 'green' }
    if (nota >= 5) return { label: 'Aprobado', color: 'blue' }
    return { label: 'Suspenso', color: 'red' }
}

/**
 * @deprecated Usar getGradeBadge en su lugar
 * Mantiene compatibilidad con código legado que usa variant
 */
export function getGradeBadgeLegacy(nota: number | null): {
    label: string
    variant: GradeBadgeVariant
} {
    if (nota === null) return { label: 'Sin evaluar', variant: 'secondary' }
    if (nota >= 9) return { label: 'Sobresaliente', variant: 'default' }
    if (nota >= 7) return { label: 'Notable', variant: 'default' }
    if (nota >= 5) return { label: 'Aprobado', variant: 'secondary' }
    return { label: 'Suspenso', variant: 'destructive' }
}
