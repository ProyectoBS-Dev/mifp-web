'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, LogIn, UserPlus, Heart } from 'lucide-react'
import { UserNav } from '@/components/layout/UserNav'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { NotificationBell } from '@/components/notifications'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ArrowUpRightIcon } from 'lucide-react'

interface UserData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'estudiante' | 'moderador' | 'editor' | null
}

// Layout público para el blog (sin autenticación requerida)
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // Obtener perfil del usuario
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, avatar_url, role')
          .eq('id', authUser.id)
          .single()

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: (profile as { full_name: string | null } | null)?.full_name || null,
          avatar_url: (profile as { avatar_url: string | null } | null)?.avatar_url || null,
          role: (profile as { role: 'admin' | 'estudiante' | 'moderador' | 'editor' | null } | null)?.role || null,
        })
      }
      setIsLoading(false)
    }

    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-14 items-center">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 mr-6">
            <span className="text-xl font-bold gradient-text">MiFP</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isLoading ? (
              // Skeleton durante la carga
              <>
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </>
            ) : user ? (
              // Navegación para usuarios autenticados
              <UserNav />
            ) : (
              // Navegación para visitantes
              <>
                <Link
                  href="/"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Home className="h-4 w-4" />
                  Inicio
                </Link>
                <Link
                  href="/blog"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === '/blog' || pathname.startsWith('/blog/')
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Newspaper className="h-4 w-4" />
                  Blog
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {isLoading ? (
              // Skeleton durante la carga
              <>
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </>
            ) : (
              <>
                {user ? (
                  // Usuario autenticado
                  <>
                    <NotificationBell />
                    <ThemeToggle />
                    <UserMenu user={user} />
                  </>
                ) : (
                  // Visitante no autenticado
                  <>
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Iniciar sesión
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/registro" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Registrarse
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

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

