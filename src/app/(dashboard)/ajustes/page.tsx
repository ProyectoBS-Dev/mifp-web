import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsPanel } from '@/components/ajustes'

export const metadata: Metadata = {
  title: 'Ajustes',
  description: 'Configura tu cuenta y preferencias',
}

export default async function AjustesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">
          Configura tu cuenta y preferencias
        </p>
      </div>

      <SettingsPanel userEmail={user.email || ''} />
    </div>
  )
}
