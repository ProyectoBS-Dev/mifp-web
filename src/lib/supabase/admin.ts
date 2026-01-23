import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CLIENT (Bypass RLS)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cliente con service_role key - SOLO usar en server-side
 * ⚠️ NUNCA exponer en el cliente
 * ⚠️ SIEMPRE verificar autenticación y permisos antes de usar
 * 
 * @returns Supabase client con permisos de service_role (bypasea RLS)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE VERIFICATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario está autenticado y tiene rol admin o editor
 * 
 * ⚠️ Usa admin client para evitar recursión infinita en políticas RLS
 * que consultan la tabla users
 * 
 * @returns `{ user, role }` si está autorizado, o `{ error, status }` si no
 * 
 * @example
 * ```ts
 * const auth = await verifyAdminOrEditor()
 * if ('error' in auth) {
 *   return NextResponse.json({ error: auth.error }, { status: auth.status })
 * }
 * // Usar auth.user y auth.role
 * ```
 */
export async function verifyAdminOrEditor() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado', status: 401 as const }
  }

  // Usar admin client para consultar rol (evita recursión RLS)
  const adminClient = createAdminClient()
  const { data: userData } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || !userData.role || !['admin', 'editor'].includes(userData.role)) {
    return { error: 'No autorizado', status: 403 as const }
  }

  return { user, role: userData.role as 'admin' | 'editor' }
}

/**
 * Verifica que el usuario está autenticado y tiene rol admin
 * 
 * @returns `{ user }` si está autorizado, o `{ error, status }` si no
 */
export async function verifyAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado', status: 401 as const }
  }

  const adminClient = createAdminClient()
  const { data: userData } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return { error: 'No autorizado', status: 403 as const }
  }

  return { user, role: 'admin' as const }
}
