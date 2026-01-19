import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notas',
  description: 'Calcula y gestiona tus calificaciones por asignatura',
}

export default function NotasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
