'use client'

import { RecursosSidebarContent } from './RecursosSidebarContent'
import type { RecursoTipoUI } from '@/types/recursos'

// ============================================
// TIPOS
// ============================================

interface AsignaturaWithCounts {
  id: string
  nombre: string
  codigo: string
  grado_nombre: string
  grado_codigo: string
  count: number
}

interface RecursosSidebarProps {
  asignaturas: AsignaturaWithCounts[]
  selectedAsignaturaId: string | null
  selectedTipo: RecursoTipoUI | null
  onSelectAsignatura: (id: string | null) => void
  onSelectTipo: (tipo: RecursoTipoUI | null) => void
  counts: {
    pdf: number
    enlace: number
    podcast: number
    video: number
    test: number
    total: number
  }
}

// ============================================
// COMPONENTE DESKTOP (wrapper con clases de visibilidad)
// ============================================

/**
 * Wrapper del sidebar de recursos para desktop.
 * Renderiza RecursosSidebarContent con clases de visibilidad desktop-only.
 */
export function RecursosSidebar(props: RecursosSidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 flex-col h-[calc(100vh-3.5rem)] sticky top-14">
      <RecursosSidebarContent {...props} />
    </aside>
  )
}
