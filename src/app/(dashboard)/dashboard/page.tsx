import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/cached'
import { redirect } from 'next/navigation'
import { DashboardGrid } from '@/components/dashboard'
import { GDMissingBanner } from '@/components/guias-didacticas'
import type { DashboardLayoutItem } from '@/types/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Tu panel de control personalizado',
}

// Forzar renderizado dinámico para que siempre lea el layout actualizado
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Usar versión cacheada de getUser (reutiliza resultado del layout)
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Obtener layout guardado del usuario
  const { data: layoutData } = await supabase
    .from('user_grid_layout')
    .select('layout_config')
    .eq('user_id', user.id)
    .single()

  // Type guard para verificar si layout_config es un array válido
  const savedLayout = layoutData && 
    Array.isArray(layoutData.layout_config) && 
    layoutData.layout_config.length > 0
    ? (layoutData.layout_config as unknown as DashboardLayoutItem[])
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
