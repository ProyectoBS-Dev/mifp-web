import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NoticiaForm } from '@/components/admin/NoticiaForm'

export const metadata: Metadata = {
  title: 'Nueva Noticia - Admin',
  description: 'Crear nueva noticia',
}

export default function NuevaNoticiaPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">✍️ Nueva Noticia</h1>
        <p className="text-muted-foreground">
          Crea una nueva publicación para el blog
        </p>
      </div>

      {/* Formulario */}
      <NoticiaForm />
    </div>
  )
}
