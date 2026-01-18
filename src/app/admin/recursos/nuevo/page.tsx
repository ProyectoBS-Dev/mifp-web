import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnlaceForm } from '@/components/admin/EnlaceForm'

export const metadata: Metadata = {
  title: 'Nuevo Enlace - Admin',
  description: 'Añadir un nuevo enlace a los recursos de estudio',
}

export default function NuevoRecursoPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">🔗 Nuevo Enlace</h1>
        <p className="text-muted-foreground">
          Añade un enlace útil para los estudiantes
        </p>
      </div>

      {/* Formulario */}
      <EnlaceForm mode="create" />
    </div>
  )
}

