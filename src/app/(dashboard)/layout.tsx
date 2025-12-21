import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()
  
  const userData = {
    id: user.id,
    email: user.email || '',
    full_name: (profile as { full_name: string | null } | null)?.full_name || null,
    avatar_url: (profile as { avatar_url: string | null } | null)?.avatar_url || null,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
}
