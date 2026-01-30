'use client'

import Link from 'next/link'
import { Heart, ArrowUpRightIcon } from 'lucide-react'
import { Navbar } from '@/components/layout'
import { useCurrentUserDirect } from '@/hooks/useCurrentUserDirect'

// Layout público para el blog (sin autenticación requerida)
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Hook directo sin React Query - más confiable para rutas públicas
  const { user, isLoading } = useCurrentUserDirect()

  return (
    <div className="min-h-screen bg-background">
      {/* Header con Navbar unificado */}
      <Navbar user={user} variant="public" isLoading={isLoading} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {children}
      </main>

      {/* Footer simple */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              ~/Dev desarrollado con <Heart className="h-4 w-4 text-vt-red" /> por estudiantes de FP - © MiFP.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                Inicio
                <ArrowUpRightIcon className="h-4 w-4 opacity-50" />
              </Link>
              {!user && (
                <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                  <ArrowUpRightIcon className="h-4 w-4 opacity-50" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

