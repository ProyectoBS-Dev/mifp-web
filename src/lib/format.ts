import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea minutos a string legible (para VTs)
 * @example formatMinutes(90) → "1h 30min"
 * @example formatMinutes(null) → "--"
 */
export function formatMinutes(minutes: number | null): string {
    if (minutes === null || minutes === undefined) return '--'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Formatea segundos a MM:SS (para podcasts)
 * @example formatSeconds(332) → "5:32"
 * @example formatSeconds(null) → "--:--"
 */
export function formatSeconds(seconds: number | null): string {
    if (seconds === null || seconds === undefined) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formatea fecha con date-fns
 * @param style Formato de salida:
 *   - 'short' = "20 ene 2026" (día + mes corto + año)
 *   - 'long' = "20 de enero de 2026" (día + mes largo + año)
 *   - 'day-month' = "20 ene" (solo día + mes corto, para fechas próximas)
 *   - 'full' = "20 de enero de 2026" (completo con preposiciones)
 */
export function formatDate(
    dateString: string,
    style: 'short' | 'long' | 'day-month' | 'full' = 'short'
): string {
    const date = new Date(dateString)
    const formatMap: Record<typeof style, string> = {
        'short': "d MMM yyyy",
        'long': "d 'de' MMMM 'de' yyyy",
        'day-month': "d MMM",
        'full': "d 'de' MMMM 'de' yyyy"
    }
    return format(date, formatMap[style], { locale: es })
}

/**
 * Formatea tiempo relativo con date-fns
 * @example formatTimeAgo("2026-01-17") → "hace 3 días"
 */
export function formatTimeAgo(dateString: string): string {
    return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
    })
}
