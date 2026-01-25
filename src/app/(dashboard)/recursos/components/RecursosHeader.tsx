'use client'

import { FileText, Link as LinkIcon, Headphones, Video, CheckSquare, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// TIPOS
// ============================================

interface RecursosHeaderProps {
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
// COMPONENTE
// ============================================

export function RecursosHeader({ counts }: RecursosHeaderProps) {
  const stats = [
    {
      label: 'PDFs',
      count: counts.pdf,
      icon: FileText,
      color: 'bg-vt-red/10 text-vt-red border-vt-red/20'
    },
    {
      label: 'Videos',
      count: counts.video,
      icon: Video,
      color: 'bg-vt-yellow/10 text-vt-yellow border-vt-yellow/20'
    },
    {
      label: 'Tests',
      count: counts.test,
      icon: CheckSquare,
      color: 'bg-vt-green/10 text-vt-green border-vt-green/20'
    },
    {
      label: 'Enlaces',
      count: counts.enlace,
      icon: LinkIcon,
      color: 'bg-vt-blue/10 text-vt-blue border-vt-blue/20'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos de Estudio</h1>
          <p className="text-muted-foreground mt-1">
            Encuentra PDFs, videos, tests y más compartidos por los administradores
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={cn(
                'relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md hover:scale-[1.02]',
                stat.color
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.count}</p>
                </div>
                <Icon className="h-8 w-8 opacity-50" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
