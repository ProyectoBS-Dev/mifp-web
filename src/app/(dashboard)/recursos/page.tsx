'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRecursos } from '@/hooks/useRecursos'
import { useRecursosFavoritos } from '@/hooks/useRecursosFavoritos'
import { createClient } from '@/lib/supabase/client'
import {
  RecursosSidebar,
  RecursosHeader,
  RecursosFilters,
  RecursosGrid,
  type SortOption
} from '@/components/recursos'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
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

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function RecursosPage() {
  const supabase = createClient()
  
  // Datos de recursos
  const { data: recursos = [], isLoading, error } = useRecursos()
  
  // Datos de favoritos
  const { data: favoritos = [] } = useRecursosFavoritos()
  const favoritosIds = favoritos.map(f => f.id)
  
  // Estado de asignaturas
  const [asignaturas, setAsignaturas] = useState<AsignaturaWithCounts[]>([])
  
  // Estado de filtros
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<string | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<RecursoTipoUI | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recientes')
  
  // Sheet mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Cargar asignaturas con conteo de recursos
  useEffect(() => {
    async function loadAsignaturas() {
      const { data: asignaturasData } = await supabase
        .from('asignaturas')
        .select(`
          id,
          nombre,
          codigo,
          grados (nombre, codigo)
        `)
        .is('deleted_at', null)
        .order('codigo')

      if (asignaturasData) {
        // Contar recursos por asignatura
        const asignaturasWithCounts: AsignaturaWithCounts[] = asignaturasData.map(
          (asig: {
            id: string
            nombre: string
            codigo: string
            grados: { nombre: string; codigo: string } | null
          }) => {
            const count = recursos.filter((r) =>
              r.asignaturas?.some((a) => a.id === asig.id)
            ).length

            return {
              id: asig.id,
              nombre: asig.nombre,
              codigo: asig.codigo,
              grado_nombre: asig.grados?.nombre || 'Sin grado',
              grado_codigo: asig.grados?.codigo || '',
              count
            }
          }
        )

        setAsignaturas(asignaturasWithCounts)
      }
    }

    if (recursos.length > 0) {
      loadAsignaturas()
    }
  }, [recursos, supabase])

  // Calcular contadores de tipos
  const counts = useMemo(() => {
    const pdf = recursos.filter((r) => r.tipo === 'pdf').length
    const enlace = recursos.filter((r) => r.tipo === 'enlace').length
    const podcast = recursos.filter((r) => r.tipo === 'podcast').length
    
    // Video y Test son subtipos de enlace
    const video = recursos.filter(
      (r) =>
        r.tipo === 'enlace' &&
        (r.descripcion?.toLowerCase().includes('video') ||
          r.titulo.toLowerCase().includes('video') ||
          r.url?.includes('youtube') ||
          r.url?.includes('vimeo'))
    ).length
    
    const test = recursos.filter(
      (r) =>
        r.tipo === 'enlace' &&
        (r.descripcion?.toLowerCase().includes('test') ||
          r.titulo.toLowerCase().includes('test') ||
          r.titulo.toLowerCase().includes('evaluación') ||
          r.titulo.toLowerCase().includes('ejercicio'))
    ).length

    return {
      pdf,
      enlace,
      podcast,
      video,
      test,
      total: recursos.length
    }
  }, [recursos])

  // Componente Sidebar (reutilizable para desktop y mobile)
  const sidebarContent = (
    <RecursosSidebar
      asignaturas={asignaturas}
      selectedAsignaturaId={selectedAsignaturaId}
      selectedTipo={selectedTipo}
      onSelectAsignatura={(id) => {
        setSelectedAsignaturaId(id)
        setMobileMenuOpen(false) // Cerrar en mobile
      }}
      onSelectTipo={(tipo) => {
        setSelectedTipo(tipo)
        setMobileMenuOpen(false) // Cerrar en mobile
      }}
      counts={counts}
    />
  )

  return (
    <div className="flex h-full">
      {/* Sidebar Desktop */}
      {sidebarContent}

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-5xl mx-auto p-6 space-y-6">
          {/* Header con botón mobile */}
          <div className="space-y-4">
            {/* Botón menú mobile */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            </div>

            {/* Header */}
            <RecursosHeader counts={counts} />
          </div>

          {/* Filtros */}
          <RecursosFilters
            searchQuery={searchQuery}
            sortBy={sortBy}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
          />

          {/* Grid de recursos */}
          <RecursosGrid
            recursos={recursos}
            isLoading={isLoading}
            hasError={!!error}
            searchQuery={searchQuery}
            selectedAsignaturaId={selectedAsignaturaId}
            selectedTipo={selectedTipo}
            sortBy={sortBy}
            favoritosIds={favoritosIds}
          />
        </div>
      </main>
    </div>
  )
}
