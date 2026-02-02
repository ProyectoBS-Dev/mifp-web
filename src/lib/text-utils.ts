/**
 * Utilidades para procesamiento de texto
 * Este archivo NO tiene 'use client' para poder ser usado en Server Components
 */

/**
 * Convierte HTML a texto plano, eliminando tags y entities
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')  // Quitar tags HTML
    .replace(/&nbsp;/g, ' ')   // Reemplazar &nbsp;
    .replace(/&amp;/g, '&')    // Reemplazar &amp;
    .replace(/&lt;/g, '<')     // Reemplazar &lt;
    .replace(/&gt;/g, '>')     // Reemplazar &gt;
    .replace(/\s+/g, ' ')      // Normalizar espacios
    .trim()
}

/**
 * Extrae un extracto limpio del contenido de una noticia
 * Elimina categoría, headers markdown y HTML tags
 */
export function extractExtracto(contenido: string, maxLength = 150): string {
  // Quitar categoría si existe
  let text = contenido.replace(/^\[(\w+)\]\s*/i, '')
  // Quitar markdown headers
  text = text.replace(/^#+\s+/gm, '')
  // Convertir HTML a texto plano
  text = htmlToPlainText(text)
  // Tomar primera parte
  if (text.length > maxLength) {
    return text.slice(0, maxLength).trim() + '...'
  }
  return text.trim()
}
