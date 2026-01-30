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

        if (authError) {
          // Si el error es AuthSessionMissingError, simplemente no hay sesión (OK para rutas públicas)
          if (authError.message?.includes('session') || authError.name === 'AuthSessionMissingError') {
            if (isMounted) {
              setUser(null)
              setIsLoading(false)
            }
            return
          }
          throw authError
        }

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

        // Sincronizar avatar_url desde metadatos de OAuth si no está en la BD
        const metaAvatarUrl = authUser.user_metadata?.avatar_url
        const needsAvatarUpdate = metaAvatarUrl && !profile?.avatar_url

        if (needsAvatarUpdate) {
          // Actualizar avatar_url en la BD desde los metadatos de Google/OAuth
          await supabase
            .from('users')
            .update({ avatar_url: metaAvatarUrl })
            .eq('id', authUser.id)
        }

        const userData: CurrentUser = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? metaAvatarUrl ?? null,
          role: profile?.role ?? null,
        }

        if (isMounted) {
          setUser(userData)
          setIsLoading(false)
        }
      } catch (err) {
        // Manejar el error pero no mostrarlo en consola si es solo falta de sesión
        const errorMessage = (err as Error).message || ''
        if (!errorMessage.includes('session') && !errorMessage.includes('AuthSessionMissing')) {
          console.error('Error loading user profile:', err)
        }
        if (isMounted) {
          setUser(null)
          setError(null) // No establecer error para AuthSessionMissing en rutas públicas
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
