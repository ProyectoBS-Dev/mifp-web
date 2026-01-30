import type { Database } from './database'

/**
 * Tipos derivados de la tabla users en Supabase
 * 
 * Estos tipos se sincronizan automáticamente con el schema de la BD
 * al regenerar los tipos de Supabase.
 */

// Tipo completo de una fila de la tabla users
export type UserRow = Database['public']['Tables']['users']['Row']

// Enum de roles de usuario
export type UserRole = Database['public']['Enums']['user_role']

/**
 * Interfaz para el usuario actual autenticado
 * 
 * Incluye solo los campos necesarios para la UI, derivados
 * directamente desde los tipos generados de Supabase.
 */
export type CurrentUser = Pick<
  UserRow,
  'id' | 'email' | 'full_name' | 'avatar_url' | 'role'
>

/**
 * Type guard para verificar si un usuario tiene un rol específico
 */
export function hasRole(user: CurrentUser | null, role: UserRole | UserRole[]): boolean {
  if (!user?.role) return false
  return Array.isArray(role) ? role.includes(user.role) : user.role === role
}

/**
 * Type guard para verificar si un usuario es admin o editor
 */
export function isAdminOrEditor(user: CurrentUser | null): boolean {
  return hasRole(user, ['admin', 'editor'])
}
