import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Novedades | MiFP',
  description: 'Noticias y actualizaciones del campus',
}

export default function NovedadesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novedades</h1>
        <p className="text-muted-foreground">
          Últimas noticias y comunicados
        </p>
      </div>
      
      {/* Placeholder */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">📰</span>
        </div>
        <h3 className="font-semibold text-lg">Próximamente</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Aquí encontrarás todas las noticias, comunicados y actualizaciones 
          importantes del campus virtual.
        </p>
      </div>
    </div>
  )
}
