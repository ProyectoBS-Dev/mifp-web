import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { EnlaceForm } from '@/components/admin/EnlaceForm'

export const metadata: Metadata = {
  title: 'Editar Recurso | Admin MiFP',
  description: 'Editar un recurso de estudio',
}

interface PageProps {
  params: Promise<{ id: string }>
}

interface RecursoData {
  id: string
  tipo: string
  titulo: string
  descripcion: string | null
  url: string | null
  asignatura_id: string | null
}

async function getRecurso(id: string): Promise<RecursoData | null> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('recursos')
    .select('id, tipo, titulo, descripcion, url, asignatura_id')
    .eq('id', id)
    .is('deleted_at', null) // Solo si no está eliminado
    .single()

  if (error || !data) {
    return null
  }

  return data as RecursoData
}

export default async function EditarRecursoPage({ params }: PageProps) {
  const { id } = await params
  const recurso = await getRecurso(id)

  if (!recurso) {
    notFound()
  }

  // Solo se pueden editar enlaces
  if (recurso.tipo !== 'enlace') {
    redirect('/admin/recursos')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/admin/recursos">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a recursos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">✏️ Editar Enlace</h1>
        <p className="text-muted-foreground">
          Modifica los datos del enlace
        </p>
      </div>

      {/* Formulario */}
      <EnlaceForm 
        mode="edit" 
        recurso={{
          id: recurso.id,
          titulo: recurso.titulo,
          descripcion: recurso.descripcion,
          url: recurso.url,
          asignatura_id: recurso.asignatura_id,
        }} 
      />
    </div>
  )
}

