'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * Skeleton mientras carga el NotesWidget con TipTap
 */
function NotesWidgetSkeleton() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-xs text-muted-foreground mt-2">Cargando notas...</p>
    </div>
  )
}

/**
 * NotesWidget con dynamic import de TipTap
 * 
 * Beneficio: TipTap (824KB) solo se carga cuando el widget se renderiza,
 * reduciendo el bundle inicial del dashboard en ~250KB gzipped
 */
const NotesWidgetContent = dynamic(
  () => import('./NotesWidget').then(mod => ({ default: mod.NotesWidget })),
  {
    ssr: false,
    loading: () => <NotesWidgetSkeleton />,
  }
)

export function NotesWidget() {
  return <NotesWidgetContent />
}
