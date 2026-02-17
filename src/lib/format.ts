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

/**
 * Normaliza hora flexible a HH:MM:SS (PostgreSQL TIME)
 * Acepta: "9" → "09:00:00", "9:5" → "09:05:00", "09:00" → "09:00:00"
 * Rechaza horas inválidas (25:00, 12:61, etc.) → null
 */
export function normalizeTimeForDB(time: string | null | undefined): string | null {
  if (!time || typeof time !== 'string') return null
  
  const trimmed = time.trim()
  if (!trimmed) return null
  
  let h: number, m: number
  
  const colonIdx = trimmed.indexOf(':')
  if (colonIdx === -1) {
    // Solo hora: "9", "19"
    h = parseInt(trimmed, 10)
    m = 0
  } else {
    h = parseInt(trimmed.slice(0, colonIdx), 10)
    const minPart = trimmed.slice(colonIdx + 1)
    // Si hay segundos (HH:MM:SS), ignorarlos
    const secondColon = minPart.indexOf(':')
    m = parseInt(secondColon === -1 ? minPart : minPart.slice(0, secondColon), 10)
  }
  
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

/**
 * Formatea hora de PostgreSQL TIME (HH:MM:SS) a formato para input HTML (HH:MM)
 * @example formatTimeForInput("09:00:00") → "09:00"
 * @example formatTimeForInput(null) → ""
 */
export function formatTimeForInput(time: string | null | undefined): string {
  if (!time || typeof time !== 'string') return ''
  
  // Extraer primeros 5 caracteres si tiene formato válido
  return time.length >= 5 && time[2] === ':' ? time.slice(0, 5) : ''
}
