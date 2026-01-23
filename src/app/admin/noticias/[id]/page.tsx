import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { NoticiaForm } from '@/components/admin/NoticiaForm'
import type { Noticia } from '@/hooks/useNoticias'

export const metadata: Metadata = {
  title: 'Editar Noticia - Admin',
  description: 'Editar noticia existente',
}

async function getNoticia(id: string): Promise<Noticia | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditarNoticiaPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const noticia = await getNoticia(id)

  if (!noticia) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/admin/noticias">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a noticias
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">✏️ Editar Noticia</h1>
        <p className="text-muted-foreground">
          Modifica la publicación existente
        </p>
      </div>

      {/* Formulario */}
      <NoticiaForm noticia={noticia} isEditing />
    </div>
  )
}
