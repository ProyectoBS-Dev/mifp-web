'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ============================================
// TIPOS
// ============================================

export type SortOption = 'recientes' | 'antiguos' | 'alfabetico-az' | 'alfabetico-za'

interface RecursosFiltersProps {
  searchQuery: string
  sortBy: SortOption
  onSearchChange: (query: string) => void
  onSortChange: (sort: SortOption) => void
}

// ============================================
// COMPONENTE
// ============================================

export function RecursosFilters({
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange
}: RecursosFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-recursos"
          name="search"
          type="text"
          placeholder="Buscar recursos por título o descripción..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Ordenar */}
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recientes">Más recientes</SelectItem>
          <SelectItem value="antiguos">Más antiguos</SelectItem>
          <SelectItem value="alfabetico-az">Alfabético A-Z</SelectItem>
          <SelectItem value="alfabetico-za">Alfabético Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
