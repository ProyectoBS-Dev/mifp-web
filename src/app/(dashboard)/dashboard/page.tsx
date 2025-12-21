import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardGrid } from '@/components/dashboard'
import { GDMissingBanner } from '@/components/guias-didacticas'
import type { DashboardLayoutItem } from '@/types/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard | MiFP',
  description: 'Tu panel de control personalizado',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Obtener layout guardado del usuario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: layoutData } = await (supabase as any)
    .from('user_grid_layout')
    .select('layout_config')
    .eq('user_id', user.id)
    .single()

  // Verificar que el layout tenga elementos, si no, usar undefined para que use el default
  const savedLayout = layoutData?.layout_config?.length > 0 
    ? (layoutData.layout_config as DashboardLayoutItem[]) 
    : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Tu panel de control personalizado. Arrastra y redimensiona los widgets.
        </p>
      </div>
      
      {/* Banner si faltan GDs */}
      <GDMissingBanner />
      
      <DashboardGrid userId={user.id} initialLayout={savedLayout} />
    </div>
  )
}
