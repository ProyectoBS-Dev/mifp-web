import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Iniciar sesión | MiFP',
  description: 'Inicia sesión en tu cuenta de MiFP',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Inicia sesión para acceder a tu dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al iniciar sesión, aceptas nuestros{' '}
          <Link href="/terminos" className="underline hover:text-primary">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacidad" className="underline hover:text-primary">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  )
}
