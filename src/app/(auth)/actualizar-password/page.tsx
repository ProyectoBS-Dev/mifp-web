import { Metadata } from 'next'
import Link from 'next/link'
import { UpdatePasswordForm } from '@/components/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Actualizar contraseña',
  description: 'Crea una nueva contraseña para tu cuenta de MiFP',
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
