import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/cached'
import { ProfileCard } from '@/components/perfil/ProfileCard'
import { AsignaturasCRUD } from '@/components/perfil/AsignaturasCRUD'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { InfoIcon, ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Perfil',
  description: 'Tu perfil de usuario',
}

function DisclaimerCard() {
  return (
    <Alert variant="info">
      <InfoIcon className="h-4 w-4 text-vt-blue" />
      <AlertTitle>¿Cómo uso esta página?</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Aqui podrás agregar las <strong>asignaturas</strong> que estas cursando actualmente y las de semestres pasados. <strong>Selecciona</strong> el semestre deseado, busca la asignatura por nombre o código y agrégala (Añadir asignatura). 
        </p>
        <p>
          En la pestaña <Link href="/notas" className="inline-flex items-center gap-1 text-primary hover:underline">Notas<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link> podrás ver y editar tus notas.
        </p>
      </AlertDescription>
    </Alert>
  )
}

export default async function PerfilPage() {
  // Usar versión cacheada de getUser (reutiliza resultado del layout)
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

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

      {/* Disclaimer */}
      <DisclaimerCard />

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
