import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CurrentUser } from '@/types/user'

/**
 * Hook alternativo sin React Query - fetch directo
 * 
 * Usar para rutas públicas donde no necesitas caché agresivo (como blog).
 * Para rutas autenticadas, preferir useCurrentUser con React Query.
 * 
 * Incluye sincronización automática con eventos de auth de Supabase.
 */
export function useCurrentUserDirect() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError) throw authError
        if (!authUser) {
          if (isMounted) {
            setUser(null)
            setIsLoading(false)
          }
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('full_name, avatar_url, role')
          .eq('id', authUser.id)
          .single()

        if (profileError) throw profileError

        const userData: CurrentUser = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          role: profile?.role ?? null,
        }

        if (isMounted) {
          setUser(userData)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error loading user profile:', err)
        if (isMounted) {
          setError(err as Error)
          setIsLoading(false)
        }
      }
    }

    // Fetch inicial
    fetchUser()

    // Sincronización con eventos de autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return
      
      if (event === 'SIGNED_OUT') {
        // Limpiar usuario cuando cierra sesión
        setUser(null)
        setIsLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Refetch cuando hay cambios en la autenticación
        setIsLoading(true)
        fetchUser()
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // Solo al montar

  return { user, isLoading, error }
}
