import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CurrentUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'estudiante' | 'moderador' | 'editor' | null
}

/**
 * Hook alternativo sin React Query - fetch directo
 * Usar solo si useCurrentUser tiene problemas de caché
 */
export function useCurrentUserDirect() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const supabase = createClient()
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

    fetchUser()

    return () => {
      isMounted = false
    }
  }, []) // Solo al montar

  return { user, isLoading, error }
}
