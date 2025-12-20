'use client'

import { FileText, Link as LinkIcon, Headphones, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResourceType = 'pdf' | 'enlace' | 'podcast'

interface Resource {
  id: string
  titulo: string
  asignatura: string
  tipo: ResourceType
  url: string
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  enlace: <LinkIcon className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
}

const RESOURCE_COLORS: Record<ResourceType, string> = {
  pdf: 'bg-vt-red/10 text-vt-red',
  enlace: 'bg-vt-blue/10 text-vt-blue',
  podcast: 'bg-vt-purple/10 text-vt-purple',
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
    >
      <div className={cn('p-2 rounded-lg', RESOURCE_COLORS[resource.tipo])}>
        {RESOURCE_ICONS[resource.tipo]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{resource.titulo}</p>
        <p className="text-xs text-muted-foreground truncate">
          {resource.asignatura}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  )
}

export function ResourcesWidget() {
  // TODO: Conectar con datos reales de Supabase
  const resources: Resource[] = [
    {
      id: '1',
      titulo: 'Guía de POO en Java',
      asignatura: 'Programación',
      tipo: 'pdf',
      url: '#',
    },
    {
      id: '2',
      titulo: 'Tutorial SQL Joins',
      asignatura: 'Base de Datos',
      tipo: 'enlace',
      url: '#',
    },
    {
      id: '3',
      titulo: 'Podcast: Clean Code',
      asignatura: 'Entornos',
      tipo: 'podcast',
      url: '#',
    },
  ]

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No hay recursos disponibles
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
