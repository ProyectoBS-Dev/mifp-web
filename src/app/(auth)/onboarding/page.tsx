import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/auth/OnboardingForm'

export const metadata: Metadata = {
  title: 'Configuración inicial | MiFP',
  description: 'Configura tu perfil y selecciona tus asignaturas',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Verificar si ya completó el onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  
  const onboardingCompleted = (profile as { onboarding_completed: boolean } | null)?.onboarding_completed
  if (onboardingCompleted) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <OnboardingForm />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Podrás cambiar estas opciones más tarde en Ajustes
        </p>
      </div>
    </div>
  )
}
