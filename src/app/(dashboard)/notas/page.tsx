import { Metadata } from 'next'
import { NotasCalculator } from '@/components/notas'

export const metadata: Metadata = {
  title: 'Notas | MiFP',
  description: 'Gestiona y calcula tus calificaciones',
}

export default function NotasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notas</h1>
        <p className="text-muted-foreground">
          Calcula y gestiona tus calificaciones por asignatura
        </p>
      </div>
      
      <NotasCalculator />
    </div>
  )
}
