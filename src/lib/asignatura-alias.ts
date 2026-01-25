// ============================================
// 📚 Alias de Asignaturas
// ============================================
// Mapeo de nombres largos de asignaturas a alias cortos
// para mostrar en interfaces con espacio limitado

/**
 * Mapa de nombres completos a alias
 * Facilmente modificable para agregar nuevos alias
 */
const ASIGNATURA_ALIASES: Record<string, string> = {
  'Lenguajes de marcas y sistemas de gestión': 'Lenguajes de marcas',
  'Sostenibilidad aplicada al sistema productivo': 'Sostenibilidad',
  'Itinerario personal para la empleabilidad I': 'IPE I',
  'Itinerario personal para la empleabilidad II': 'IPE II',
  'Proyecto de desarrollo de aplicaciones': 'Proyecto',
  'Digitalización aplicada a los sectores productivos': 'Digitalización',
  'Desarrollo web en entorno cliente A': 'Desarrollo cliente A',
  'Desarrollo web en entorno servidor B': 'Desarrollo servidor B',
  'Programación multimedia y disp. móviles B': 'Programación B',
  'Diseño de interfaces WEB': 'Interfaces web',
}

/**
 * Obtiene el alias de una asignatura
 * Si no tiene alias definido, retorna el nombre original
 * 
 * @param nombreCompleto - Nombre completo de la asignatura
 * @returns Alias corto o nombre completo si no tiene alias
 * 
 * @example
 * getAsignaturaAlias('Lenguajes de marcas y sistemas de gestión')
 * // Returns: 'Lenguajes de marcas'
 * 
 * getAsignaturaAlias('Programación')
 * // Returns: 'Programación'
 */
export function getAsignaturaAlias(nombreCompleto: string): string {
  return ASIGNATURA_ALIASES[nombreCompleto] || nombreCompleto
}

/**
 * Verifica si una asignatura tiene un alias definido
 * 
 * @param nombreCompleto - Nombre completo de la asignatura
 * @returns true si tiene alias, false si no
 */
export function hasAsignaturaAlias(nombreCompleto: string): boolean {
  return nombreCompleto in ASIGNATURA_ALIASES
}

/**
 * Obtiene todos los nombres completos que tienen alias definido
 * Útil para debugging o auditoría
 */
export function getAsignaturasWithAlias(): string[] {
  return Object.keys(ASIGNATURA_ALIASES)
}
