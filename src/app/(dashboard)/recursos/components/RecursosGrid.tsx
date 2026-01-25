'use client'

import { useMemo } from 'react'
import { RecursoCard } from './RecursoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'
import type { Recurso, RecursoTipo } from '@/types/recursos'
import type { SortOption } from './RecursosFilters'

// ============================================
// TIPOS
// ============================================

interface RecursosGridProps {
  recursos: Recurso[]
  isLoading: boolean
  hasError: boolean
  searchQuery: string
  selectedAsignaturaId: string | null
  selectedTipo: RecursoTipo | 'todos' | 'favoritos' | null
  sortBy: SortOption
  favoritosIds?: string[]
}

// ============================================
// COMPONENTE
// ============================================

export function RecursosGrid({
  recursos,
  isLoading,
  hasError,
  searchQuery,
  selectedAsignaturaId,
  selectedTipo,
  sortBy,
  favoritosIds = []
}: RecursosGridProps) {
  // Filtrar y ordenar recursos
  const filteredRecursos = useMemo(() => {
    let filtered = [...recursos]

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.titulo.toLowerCase().includes(query) ||
          r.descripcion?.toLowerCase().includes(query)
      )
    }

    // Filtro por asignatura
    if (selectedAsignaturaId) {
      filtered = filtered.filter((r) =>
        r.asignaturas?.some((a) => a.id === selectedAsignaturaId)
      )
    }

    // Filtro por favoritos
    if (selectedTipo === 'favoritos') {
      filtered = filtered.filter((r) => favoritosIds.includes(r.id))
    }
    // Filtro por tipo
    else if (selectedTipo && selectedTipo !== 'todos') {
      // Para "video" y "test" necesitamos filtrar enlaces con keywords
      if (selectedTipo === 'video') {
        filtered = filtered.filter(
          (r) =>
            r.tipo === 'enlace' &&
            (r.descripcion?.toLowerCase().includes('video') ||
              r.titulo.toLowerCase().includes('video') ||
              r.url?.includes('youtube') ||
              r.url?.includes('vimeo'))
        )
      } else if (selectedTipo === 'test') {
        filtered = filtered.filter(
          (r) =>
            r.tipo === 'enlace' &&
            (r.descripcion?.toLowerCase().includes('test') ||
              r.titulo.toLowerCase().includes('test') ||
              r.titulo.toLowerCase().includes('evaluación') ||
              r.titulo.toLowerCase().includes('ejercicio'))
        )
      } else {
        filtered = filtered.filter((r) => r.tipo === selectedTipo)
      }
    }

    // Ordenar
    switch (sortBy) {
      case 'recientes':
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'antiguos':
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      case 'alfabetico-az':
        filtered.sort((a, b) => a.titulo.localeCompare(b.titulo))
        break
      case 'alfabetico-za':
        filtered.sort((a, b) => b.titulo.localeCompare(a.titulo))
        break
    }

    return filtered
  }, [recursos, searchQuery, selectedAsignaturaId, selectedTipo, sortBy, favoritosIds])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <EmptyState
        icon={<FileText />}
        title="Error al cargar recursos"
        description="No se pudieron cargar los recursos. Por favor, intenta de nuevo más tarde."
      />
    )
  }

  // Empty state
  if (filteredRecursos.length === 0) {
    const message =
      searchQuery.trim() ||
      selectedAsignaturaId ||
      (selectedTipo && selectedTipo !== 'todos')
        ? 'No se encontraron recursos con los filtros seleccionados'
        : 'No hay recursos disponibles'

    return (
      <EmptyState
        icon={<FileText />}
        title="No hay recursos"
        description={message}
      />
    )
  }

  // Grid de recursos
  return (
    <div className="space-y-4">
      {/* Contador de resultados */}
      <p className="text-sm text-muted-foreground">
        {filteredRecursos.length === recursos.length
          ? `${filteredRecursos.length} recursos disponibles`
          : `${filteredRecursos.length} de ${recursos.length} recursos`}
      </p>

      {/* Grid */}
      <div className="grid gap-4">
        {filteredRecursos.map((recurso) => (
          <RecursoCard key={recurso.id} recurso={recurso} />
        ))}
      </div>
    </div>
  )
}
