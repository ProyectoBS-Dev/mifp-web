import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/cached'
import { SettingsPanel } from '@/components/ajustes'

export const metadata: Metadata = {
  title: 'Ajustes',
  description: 'Configura tu cuenta y preferencias',
}

export default async function AjustesPage() {
  // Usar versión cacheada de getUser (reutiliza resultado del layout)
  const user = await getUser()

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
