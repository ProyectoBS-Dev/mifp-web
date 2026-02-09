'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Provider = 'google' | 'github'

interface OAuthButtonsProps {
  redirectTo?: string
}

export function OAuthButtons({ redirectTo = '/dashboard' }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState<Provider | null>(null)

  const handleOAuthLogin = async (provider: Provider) => {
    setIsLoading(provider)
    
    const supabase = createClient()
    
    // Clear any stale PKCE verifiers or auth state before starting new OAuth flow
    // This prevents "PKCE code verifier not found" errors on retry
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      // Ignore errors from signOut - user might not be logged in
      console.debug('Local signout before OAuth (expected if no session):', error)
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        queryParams: {
          // Force consent screen to ensure clean OAuth flow
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('OAuth error:', error.message)
      setIsLoading(null)
      
      // Show user-friendly error message
      if (error.message.includes('PKCE')) {
        alert('Hubo un problema con la autenticación. Por favor, intenta de nuevo.')
      }
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading !== null}
        onClick={() => handleOAuthLogin('google')}
        className="w-full"
      >
        {isLoading === 'google' ? (
          <LoadingSpinner />
        ) : (
          <GoogleIcon />
        )}
        Continuar con Google
      </Button>
      
      <Button
        variant="outline"
        type="button"
        disabled={isLoading !== null}
        onClick={() => handleOAuthLogin('github')}
        className="w-full"
      >
        {isLoading === 'github' ? (
          <LoadingSpinner />
        ) : (
          <GitHubIcon />
        )}
        Continuar con GitHub
      </Button>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
