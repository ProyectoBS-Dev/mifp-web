'use client'

import { useState } from 'react'
import { ThumbsUp, Heart, Sparkles, Flame, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

// Tipos de reacciones disponibles en la BD
export type ReactionType = 'like' | 'love' | 'clap' | 'fire' | 'thinking'

// Configuración de cada reacción con iconos Lucide
const REACTION_CONFIG: Record<ReactionType, { 
  icon: typeof ThumbsUp
  label: string
  activeColor: string
  activeBg: string
}> = {
  like: { 
    icon: ThumbsUp, 
    label: 'Me gusta', 
    activeColor: 'text-blue-500',
    activeBg: 'bg-blue-500/10'
  },
  love: { 
    icon: Heart, 
    label: 'Me encanta', 
    activeColor: 'text-red-500',
    activeBg: 'bg-red-500/10'
  },
  clap: { 
    icon: Sparkles, 
    label: 'Genial', 
    activeColor: 'text-yellow-500',
    activeBg: 'bg-yellow-500/10'
  },
  fire: { 
    icon: Flame, 
    label: 'Fuego', 
    activeColor: 'text-orange-500',
    activeBg: 'bg-orange-500/10'
  },
  thinking: { 
    icon: Lightbulb, 
    label: 'Interesante', 
    activeColor: 'text-purple-500',
    activeBg: 'bg-purple-500/10'
  },
}

export interface ReactionCounts {
  like: number
  love: number
  clap: number
  fire: number
  thinking: number
}

interface ReactionBarProps {
  noticiaId: string
  counts: ReactionCounts
  userReaction?: ReactionType | null
  onReact: (noticiaId: string, type: ReactionType) => void
  size?: 'sm' | 'md'
  className?: string
}

export function ReactionBar({ 
  noticiaId, 
  counts, 
  userReaction, 
  onReact,
  size = 'sm',
  className 
}: ReactionBarProps) {
  const [hoveredType, setHoveredType] = useState<ReactionType | null>(null)

  const handleReact = (type: ReactionType) => {
    onReact(noticiaId, type)
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5'
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5'
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
        const config = REACTION_CONFIG[type]
        const Icon = config.icon
        const count = counts[type] || 0
        const isActive = userReaction === type
        const isHovered = hoveredType === type

        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            onMouseEnter={() => setHoveredType(type)}
            onMouseLeave={() => setHoveredType(null)}
            title={config.label}
            className={cn(
              'flex items-center rounded-full transition-all duration-200',
              padding,
              gap,
              // Estado base
              'text-muted-foreground',
              // Hover: muestra color
              isHovered && !isActive && cn(config.activeColor, 'bg-muted'),
              // Activo: color completo con fondo
              isActive && cn(config.activeColor, config.activeBg),
              // Si no hay reacciones y no es hover ni activo, más sutil
              count === 0 && !isHovered && !isActive && 'opacity-50 hover:opacity-100'
            )}
          >
            <Icon 
              className={cn(
                iconSize,
                'transition-transform duration-200',
                (isHovered || isActive) && 'scale-110',
                // Rellenar icono cuando está activo
                isActive && 'fill-current'
              )} 
            />
            {count > 0 && (
              <span className={cn(
                'font-medium',
                fontSize,
                isActive && config.activeColor
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Componente simplificado para mostrar solo totales (sin interacción)
interface ReactionCountsDisplayProps {
  counts: ReactionCounts
  className?: string
}

export function ReactionCountsDisplay({ counts, className }: ReactionCountsDisplayProps) {
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0)
  
  if (total === 0) return null

  // Mostrar los iconos de las reacciones que tienen conteo
  const activeReactions = (Object.keys(REACTION_CONFIG) as ReactionType[])
    .filter(type => counts[type] > 0)
    .slice(0, 3)

  return (
    <div className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <span className="flex -space-x-1">
        {activeReactions.map((type) => {
          const Icon = REACTION_CONFIG[type].icon
          return (
            <Icon 
              key={type} 
              className={cn('h-4 w-4', REACTION_CONFIG[type].activeColor)} 
            />
          )
        })}
      </span>
      <span>{total}</span>
    </div>
  )
}
