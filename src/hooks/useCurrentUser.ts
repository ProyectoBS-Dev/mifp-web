import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CurrentUser } from '@/types/user'

/**
 * Fetches the current authenticated user with profile data
 * @returns User object or null if not authenticated
 */
async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  // Obtener perfil del usuario
  const { data: profile, error } = await supabase
    .from('users')
    .select('full_name, avatar_url, role')
    .eq('id', authUser.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    // Retornar datos básicos del auth user si falla la query
    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: null,
      avatar_url: null,
      role: null,
    }
  }

  return {
    id: authUser.id,
    email: authUser.email || '',
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    role: profile?.role ?? null,
  }
}

/**
 * Hook to get the current authenticated user with caching
 * 
 * Uses React Query to cache the user data for 5 minutes,
 * avoiding redundant queries on navigation.
 * 
 * Includes automatic synchronization with Supabase auth events:
 * - Detects logout in other tabs
 * - Handles token refresh
 * - Updates on profile changes
 * 
 * @example
 * ```tsx
 * const { user, isLoading } = useCurrentUser()
 * 
 * if (isLoading) return <Skeleton />
 * if (!user) return <LoginButton />
 * return <UserProfile user={user} />
 * ```
 */
export function useCurrentUser() {
  const queryClient = useQueryClient()
  
  const { data: user = null, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 0, // Siempre considerar datos stale para forzar refetch
    gcTime: 5 * 60 * 1000, // Mantener en caché 5 minutos
    retry: false, // No reintentar si falla
    refetchOnWindowFocus: false, // No refetch al cambiar de tab
    refetchOnMount: true, // Siempre refetch al montar
    refetchOnReconnect: false, // No refetch al reconectar
  })

  // Sincronización con eventos de autenticación de Supabase
  useEffect(() => {
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Eventos importantes:
      // - SIGNED_IN: Usuario inició sesión
      // - SIGNED_OUT: Usuario cerró sesión
      // - TOKEN_REFRESHED: Token renovado automáticamente
      // - USER_UPDATED: Perfil actualizado
      
      if (event === 'SIGNED_OUT') {
        // Limpiar caché cuando el usuario cierra sesión
        queryClient.setQueryData(['currentUser'], null)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Refetch para obtener datos frescos cuando hay cambios
        refetch()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, refetch])

  return {
    user,
    isLoading: isLoading || isFetching, // Considerar ambos estados
    error,
    refetch,
  }
}
