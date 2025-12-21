import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { AdminSidebar } from '@/components/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Verificar rol admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-14 items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver al Dashboard
              </Link>
              <div className="h-4 w-px bg-border" />
              <span className="font-semibold text-primary">🔧 Panel Admin</span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu 
                user={{
                  id: user.id,
                  email: user.email || '',
                  full_name: profile?.full_name,
                  avatar_url: profile?.avatar_url,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Client Component */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
