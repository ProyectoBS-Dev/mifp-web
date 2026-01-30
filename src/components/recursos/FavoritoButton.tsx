'use client'

import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useIsFavorito, useRecursosFavoritosMutations } from '@/hooks/useRecursosFavoritos'

// ============================================
// COMPONENTE: FavoritoButton
// ============================================

interface FavoritoButtonProps {
  recursoId: string
  variant?: 'default' | 'icon-only'
}

export function FavoritoButton({ recursoId, variant = 'default' }: FavoritoButtonProps) {
  const isFavorito = useIsFavorito(recursoId)
  const { toggleFavorito, isTogglingFavorito } = useRecursosFavoritosMutations()

  const handleToggle = () => {
    toggleFavorito({ recurso_id: recursoId, isFavorito })
  }

  if (variant === 'icon-only') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              disabled={isTogglingFavorito}
              className={cn(
                'h-8 w-8 transition-colors',
                isFavorito && 'text-vt-yellow hover:text-vt-yellow/80'
              )}
            >
              <Star 
                className={cn(
                  'h-4 w-4 transition-all',
                  isFavorito && 'fill-current'
                )} 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isTogglingFavorito}
      className={cn(
        'transition-colors',
        isFavorito && 'border-vt-yellow text-vt-yellow hover:bg-vt-yellow/10'
      )}
    >
      <Star 
        className={cn(
          'h-4 w-4 mr-2 transition-all',
          isFavorito && 'fill-current'
        )} 
      />
      {isFavorito ? 'Favorito' : 'Agregar a favoritos'}
    </Button>
  )
}
