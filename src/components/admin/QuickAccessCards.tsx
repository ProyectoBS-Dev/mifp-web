'use client'

import Link from 'next/link'
import {
  FileText,
  Users,
  BookOpen,
  Video,
  Package,
  LucideIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QuickAccessCard {
  title: string
  description: string
  icon: LucideIcon
  href: string
  badge?: number | null
  enabled: boolean
}

interface QuickAccessCardsProps {
  stats: {
    gdsPendientes: number
    asignaturas: number
    usuarios: number
  }
}

export function QuickAccessCards({ stats }: QuickAccessCardsProps) {
  const quickAccessCards: QuickAccessCard[] = [
    {
      title: 'Guías Didácticas',
      description: `${stats.gdsPendientes} pendientes`,
      icon: FileText,
      href: '/admin/guias-didacticas',
      badge: stats.gdsPendientes > 0 ? stats.gdsPendientes : null,
      enabled: true,
    },
    {
      title: 'Asignaturas',
      description: `${stats.asignaturas} registradas`,
      icon: BookOpen,
      href: '#',
      enabled: false,
    },
    {
      title: 'Usuarios',
      description: `${stats.usuarios} registrados`,
      icon: Users,
      href: '#',
      enabled: false,
    },
    {
      title: 'VTs',
      description: 'Próximamente',
      icon: Video,
      href: '#',
      enabled: false,
    },
    {
      title: 'Recursos',
      description: 'Próximamente',
      icon: Package,
      href: '#',
      enabled: false,
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">⚡ Accesos Rápidos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickAccessCards.map((card) => {
          const CardWrapper = card.enabled ? Link : 'div'
          const Icon = card.icon

          return (
            <CardWrapper
              key={card.title}
              href={card.enabled ? card.href : undefined as never}
              className={`group block ${!card.enabled && 'cursor-not-allowed'}`}
            >
              <Card className={`h-full transition-colors ${card.enabled
                  ? 'hover:border-primary/50 hover:bg-muted/50'
                  : 'opacity-60'
                }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-xl ${card.enabled ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                      <Icon className={`h-6 w-6 ${card.enabled ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div>
                      <span className="font-medium text-sm flex items-center gap-2 justify-center">
                        {card.title}
                        {card.badge && (
                          <Badge color="red" className="h-5 px-1.5">
                            {card.badge}
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {card.description}
                      </span>
                    </div>
                    {!card.enabled && (
                      <Badge color="gray" className="text-xs">
                        Próximamente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardWrapper>
          )
        })}
      </div>
    </div>
  )
}
