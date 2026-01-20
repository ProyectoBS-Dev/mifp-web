export type GradeBadgeVariant = 'default' | 'secondary' | 'destructive'

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
 * Devuelve label y variant para Badge según la nota
 */
export function getGradeBadge(nota: number | null): {
    label: string
    variant: GradeBadgeVariant
} {
    if (nota === null) return { label: 'Sin evaluar', variant: 'secondary' }
    if (nota >= 9) return { label: 'Sobresaliente', variant: 'default' }
    if (nota >= 7) return { label: 'Notable', variant: 'default' }
    if (nota >= 5) return { label: 'Aprobado', variant: 'secondary' }
    return { label: 'Suspenso', variant: 'destructive' }
}
