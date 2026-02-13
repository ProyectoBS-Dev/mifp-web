'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from './OAuthButtons'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Turnstile } from '@/components/ui/Turnstile'

function translateAuthError(message: string): string {
  if (message === 'User already registered') {
    return 'Este email ya está registrado'
  }
  if (message.includes('Password should contain at least one character of each')) {
    return 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial (!@#$%...)'
  }
  return message
}

export function RegisterForm() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken(null)
    setError('Error al verificar CAPTCHA. Por favor, recarga la página.')
  }, [])

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!nombre.trim()) {
      setError('Por favor, ingresa tu nombre')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    if (!captchaToken) {
      setError('Por favor, completa la verificación de seguridad')
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        captchaToken,
        data: {
          name: nombre.trim(),
          full_name: nombre.trim(),
        },
      },
    })

    if (signUpError) {
      setError(translateAuthError(signUpError.message))
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">¡Revisa tu email!</h3>
        <p className="text-muted-foreground text-sm">
          Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
          <br />
          Haz clic en el enlace para activar tu cuenta.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/login')}
          className="mt-4"
        >
          Volver al login
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <OAuthButtons redirectTo="/onboarding" />

      <p className="text-sm text-muted-foreground">
          Al hacer clic en <strong>Google</strong> o <strong>GitHub</strong>, confirmas tener más de 16 años y aceptas nuestros{' '}
          <Link href="/terminos" className="text-primary hover:underline">
            Términos
          </Link>{' '}
          y{' '}
          <Link href="/privacidad" className="text-primary hover:underline">
            Política de Privacidad.
          </Link>
        </p>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O regístrate con email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="given-name"
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Acepto los{' '}
            <Link href="/terminos" className="text-primary hover:underline">
              términos y condiciones,
            </Link>{' '}
            la{' '}
            <Link href="/privacidad" className="text-primary hover:underline">
              política de privacidad
            </Link>
            &nbsp;y confirmo ser mayor de 16 años.
          </label>
        </div>

        <div className="flex justify-center">
          <Turnstile
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onExpire={handleCaptchaExpire}
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !captchaToken} className="w-full">
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline font-medium"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
