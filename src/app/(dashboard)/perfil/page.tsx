import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/perfil'

export const metadata: Metadata = {
  title: 'Perfil | MiFP',
  description: 'Tu perfil de usuario',
}

export default async function PerfilPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Obtener perfil del usuario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
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

  // Obtener asignaturas del usuario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userAsignaturas } = await (supabase as any)
    .from('user_asignaturas')
    .select(`
      asignatura_id,
      asignaturas:asignatura_id (
        id,
        nombre,
        codigo
      )
    `)
    .eq('user_id', user.id)

  const asignaturas = (userAsignaturas || [])
    .map((ua: { asignaturas: { id: string; nombre: string; codigo: string } }) => ua.asignaturas)
    .filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Información de tu cuenta y asignaturas
        </p>
      </div>
      
      <ProfileForm 
        user={{ id: user.id, email: user.email }}
        profile={profile as Parameters<typeof ProfileForm>[0]['profile']}
        grado={grado}
        asignaturas={asignaturas}
      />
    </div>
  )
}
