import { Metadata } from 'next'
import { NewsFeed } from '@/components/novedades'

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
          Últimas noticias, comunicados y recursos compartidos
        </p>
      </div>
      
      <NewsFeed />
    </div>
  )
}
