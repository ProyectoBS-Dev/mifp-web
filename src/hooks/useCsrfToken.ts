'use client'

// ============================================
// 🛡️ Hook: useCsrfToken
// ============================================
// Obtiene y cachea un token CSRF para enviar en peticiones de mutación.
// Uso: const { csrfHeaders } = useCsrfToken()
//      fetch('/api/...', { headers: { ...csrfHeaders } })

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseCsrfTokenReturn {
  /** Token CSRF crudo */
  csrfToken: string | null
  /** Headers listos para inyectar en fetch: { 'x-csrf-token': token } */
  csrfHeaders: Record<string, string>
  /** Forzar refresh del token */
  refreshToken: () => Promise<void>
}

export function useCsrfToken(): UseCsrfTokenReturn {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/csrf')
      if (!response.ok) throw new Error('Error fetching CSRF token')
      const data = await response.json()
      setCsrfToken(data.token)
    } catch (error) {
      console.error('[CSRF] Error obteniendo token:', error)
    }
  }, [])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchToken()
    }
  }, [fetchToken])

  // Refresh automático cada 50 minutos (antes de la expiración de 1h)
  useEffect(() => {
    const interval = setInterval(fetchToken, 50 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchToken])

  return {
    csrfToken,
    csrfHeaders: csrfToken ? { 'x-csrf-token': csrfToken } : {},
    refreshToken: fetchToken,
  }
}
