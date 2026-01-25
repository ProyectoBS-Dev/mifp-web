import { cache } from 'react'
import { createClient } from './server'

/**
 * Versión cacheada de getUser para Server Components.
 * Se ejecuta UNA sola vez por request del servidor.
 * React.cache() memoiza automáticamente durante el render tree.
 * 
 * @returns Usuario autenticado o null
 * 
 * @example
 * ```tsx
 * // En Server Component
 * import { getUser } from '@/lib/supabase/cached'
 * 
 * export default async function Page() {
 *   const user = await getUser()
 *   if (!user) redirect('/login')
 *   // ... resto del componente
 * }
 * ```
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
})
