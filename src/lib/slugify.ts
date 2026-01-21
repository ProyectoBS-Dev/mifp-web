/**
 * Genera un slug URL-friendly a partir de un texto.
 * - Convierte a minúsculas
 * - Elimina acentos y caracteres especiales
 * - Reemplaza espacios por guiones
 * - Limita la longitud
 * 
 * @example
 * slugify("¡Bienvenidos a MiFP!") // "bienvenidos-a-mifp"
 * slugify("Cómo preparar el examen de DAM") // "como-preparar-el-examen-de-dam"
 */
export function slugify(text: string, maxLength = 100): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos (á → a, ñ → n)
    .replace(/ñ/g, 'n')              // Caso especial para ñ
    .replace(/[^a-z0-9\s-]/g, '')    // Solo alfanuméricos, espacios y guiones
    .replace(/\s+/g, '-')            // Espacios a guiones
    .replace(/-+/g, '-')             // Múltiples guiones a uno solo
    .replace(/^-|-$/g, '')           // Quitar guiones al inicio/fin
    .slice(0, maxLength)             // Limitar longitud
    .replace(/-$/g, '')              // Quitar guión final si quedó por el slice
}

/**
 * Valida si un slug tiene formato correcto.
 * Solo permite letras minúsculas, números y guiones.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

/**
 * Normaliza un slug editado manualmente.
 * Permite espacios (que se convierten en guiones) para facilitar la edición.
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')             // Espacios a guiones (permite escribir con espacios)
    .replace(/[^a-z0-9-]/g, '')       // Solo alfanuméricos y guiones
    .replace(/-+/g, '-')              // Múltiples guiones a uno
    .replace(/^-|-$/g, '')            // Quitar guiones inicio/fin
    .slice(0, 100)
}
