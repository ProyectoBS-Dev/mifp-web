import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout'
import { SemesterOnboardingChecker } from '@/components/auth/SemesterOnboardingChecker'

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

  // Get user profile with grado_id
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, role, grado_id')
    .eq('id', user.id)
    .single()

  const userData = {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || null,
    avatar_url: profile?.avatar_url || null,
    role: profile?.role || null,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Verificar si necesita onboarding de nuevo semestre */}
        <SemesterOnboardingChecker
          userId={user.id}
          gradoId={profile?.grado_id || null}
        />
        {children}
      </main>
    </div>
  )
}
