import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileCard } from '@/components/perfil/ProfileCard'
import { AsignaturasCRUD } from '@/components/perfil/AsignaturasCRUD'

export const metadata: Metadata = {
  title: 'Perfil',
  description: 'Tu perfil de usuario',
}

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Obtener grado si existe
  let grado = null
  if (profile?.grado_id) {
    const { data: gradoData } = await supabase
      .from('grados')
      .select('id, nombre, codigo')
      .eq('id', profile.grado_id)
      .single()
    grado = gradoData
  }

  // Obtener asignaturas del usuario con info de semestre
  const { data: userAsignaturas } = await supabase
    .from('user_asignaturas')
    .select(`
      id,
      asignatura_id,
      semestre_id,
      asignaturas (id, nombre, codigo),
      semestres (id, nombre, codigo, activo)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Obtener todas las asignaturas del grado para el selector
  let availableAsignaturas: { id: string; nombre: string; codigo: string }[] = []
  if (grado) {
    const { data: gradoAsignaturas } = await supabase
      .from('asignaturas')
      .select('id, nombre, codigo')
      .eq('grado_id', (grado as { id: string }).id)
      .order('nombre')

    availableAsignaturas = gradoAsignaturas || []
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Card - Compacto */}
      <ProfileCard
        user={{ id: user.id, email: user.email }}
        profile={profile}
        grado={grado as { id: string; nombre: string; codigo: string } | null}
      />

      {/* Gestión de Asignaturas */}
      {grado ? (
        <AsignaturasCRUD
          userAsignaturas={userAsignaturas || []}
          availableAsignaturas={availableAsignaturas}
          gradoId={(grado as { id: string }).id}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Completa el onboarding para seleccionar tu grado y asignaturas</p>
        </div>
      )}
    </div>
  )
}
