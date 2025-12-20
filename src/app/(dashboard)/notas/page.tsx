import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notas | MiFP',
  description: 'Gestiona tus calificaciones',
}

export default function NotasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notas</h1>
        <p className="text-muted-foreground">
          Seguimiento de tus calificaciones por asignatura
        </p>
      </div>
      
      {/* Placeholder */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="font-semibold text-lg">Próximamente</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Aquí podrás ver y gestionar todas tus calificaciones de PACs, VTs y exámenes 
          organizadas por asignatura.
        </p>
      </div>
    </div>
  )
}
