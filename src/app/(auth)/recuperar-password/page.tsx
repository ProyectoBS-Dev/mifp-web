import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Recupera el acceso a tu cuenta de MiFP',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Ingresa tu email y te enviaremos un enlace para restablecerla
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Recordaste tu contraseña?{' '}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}
