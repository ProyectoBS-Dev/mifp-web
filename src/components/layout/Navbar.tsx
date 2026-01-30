'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, Newspaper, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { UserNav } from './UserNav'
import { NotificationBell } from '@/components/notifications'
import { navItems } from './navItems'
import { cn } from '@/lib/utils'

// NavItem type and navItems imported from ./navItems

interface NavbarProps {
  user?: {
    id: string
    email: string
    full_name?: string | null
    avatar_url?: string | null
    role?: 'admin' | 'estudiante' | 'moderador' | 'editor' | null
  } | null
  variant?: 'dashboard' | 'public'
  showPublicNav?: boolean
  isLoading?: boolean
}

export function Navbar({ user, variant = 'dashboard', showPublicNav = true, isLoading = false }: NavbarProps) {
  const pathname = usePathname()
  const isPublic = !user

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur",
      variant === 'dashboard' && "bg-muted/50",
      variant === 'public' && "bg-muted/50"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-14 items-center">
        {/* Mobile menu */}
        {user && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold gradient-text">MiFP</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}

        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 mr-6">
          <span className="text-xl font-bold gradient-text">MiFP</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ) : isPublic && showPublicNav ? (
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
          ) : (
            <UserNav />
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-8 w-14 rounded-full pr-2" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </>
          ) : user ? (
            <>
              <NotificationBell />
              <ThemeToggle />
              <UserMenu user={user} />
            </>
          ) : (
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
        </div>
      </div>
    </header>
  )
}
