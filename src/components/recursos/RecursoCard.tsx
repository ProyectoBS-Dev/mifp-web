'use client'

import { useState } from 'react'
import {
  FileText,
  Link as LinkIcon,
  Headphones,
  ExternalLink,
  Eye,
  Video,
  CheckSquare,
  Folder,
  Globe,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTimeAgo, formatSeconds } from '@/lib/format'
import { getAsignaturaAlias } from '@/lib/asignatura-alias'
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal'
import { PodcastPlayer } from '@/components/dashboard/PodcastPlayer'
import { FavoritoButton } from './FavoritoButton'
import type { Recurso } from '@/types/recursos'

// ============================================
// CONSTANTES
// ============================================

const RESOURCE_COLORS = {
  pdf: 'bg-vt-red/10 text-vt-red border-vt-red/20',
  enlace: 'bg-vt-blue/10 text-vt-blue border-vt-blue/20',
  podcast: 'bg-vt-purple/10 text-vt-purple border-vt-purple/20',
  video: 'bg-vt-yellow/10 text-vt-yellow border-vt-yellow/20',
  test: 'bg-vt-green/10 text-vt-green border-vt-green/20'
}

// Helper para detectar recursos nuevos (últimas 48h)
function isNew(createdAt: string): boolean {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
  return diffHours < 48
}

// Componente de indicador "Nuevo"
function NewIndicator() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-blue opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-blue"></span>
    </span>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface RecursoCardProps {
  recurso: Recurso
}

export function RecursoCard({ recurso }: RecursoCardProps) {
  const [previewPDF, setPreviewPDF] = useState<Recurso | null>(null)

  // Determinar tipo visual (video y test son enlaces con metadata especial)
  const visualType = recurso.tipo === 'enlace' && recurso.descripcion?.toLowerCase().includes('video')
    ? 'video'
    : recurso.tipo === 'enlace' && recurso.descripcion?.toLowerCase().includes('test')
    ? 'test'
    : recurso.tipo

  // Configuración del ícono
  const iconConfig = {
    pdf: { Icon: FileText, label: 'PDF' },
    enlace: { Icon: LinkIcon, label: 'Enlace' },
    podcast: { Icon: Headphones, label: 'Podcast' },
    video: { Icon: Video, label: 'Video' },
    test: { Icon: CheckSquare, label: 'Test' }
  }[visualType]

  const { Icon } = iconConfig
  const colorClass = RESOURCE_COLORS[visualType as keyof typeof RESOURCE_COLORS] || RESOURCE_COLORS.enlace

  return (
    <>
      <div className={cn(
        'rounded-lg border p-4 md:p-5 transition-all hover:shadow-md group relative min-w-0',
        colorClass
      )}>
        {/* Botón de favorito - posición absoluta en esquina superior derecha */}
        <div className="absolute top-3 right-3 z-10">
          <FavoritoButton recursoId={recurso.id} variant="icon-only" />
        </div>

        <div className="flex items-start gap-4 pr-10">
          {/* Ícono */}
          <div className={cn(
            'p-3 rounded-lg flex-shrink-0',
            colorClass
          )}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {/* Título */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isNew(recurso.created_at) && <NewIndicator />}
                <h3 className="font-semibold text-base truncate">
                  {recurso.titulo}
                </h3>
              </div>
              
            </div>

            {/* Descripción */}
            {recurso.descripcion && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {recurso.descripcion}
              </p>
            )}

            {/* Metadata inferior */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
              {recurso.asignaturas && recurso.asignaturas.length > 0 && (
                <span className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {recurso.asignaturas.length === 1
                    ? getAsignaturaAlias(recurso.asignaturas[0].nombre)
                    : `${recurso.asignaturas.length} asignaturas`}
                </span>
              )}
              
              {recurso.tipo === 'enlace' && recurso.url && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {new URL(recurso.url).hostname.replace('www.', '')}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(recurso.created_at)}
              </span>
            </div>

            {/* Acciones según tipo */}
            <RecursoActions
              recurso={recurso}
              visualType={visualType}
              onPreviewPDF={() => setPreviewPDF(recurso)}
            />
          </div>
        </div>
      </div>

      {/* Modal de preview PDF */}
      {recurso.tipo === 'pdf' && (
        <PDFPreviewModal
          recurso={previewPDF}
          onClose={() => setPreviewPDF(null)}
        />
      )}
    </>
  )
}

// ============================================
// COMPONENTE: Acciones por Tipo
// ============================================

interface RecursoActionsProps {
  recurso: Recurso
  visualType: string
  onPreviewPDF: () => void
}

function RecursoActions({ recurso, visualType, onPreviewPDF }: RecursoActionsProps) {
  // PDF: Vista previa + Descargar
  if (recurso.tipo === 'pdf') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviewPDF}
          className="flex-1 sm:flex-none"
        >
          <Eye className="h-4 w-4 mr-2" />
          Vista Previa
        </Button>
        <Button
          variant="default"
          size="sm"
          asChild
          className="flex-1 sm:flex-none"
        >
        </Button>
      </div>
    )
  }

  // Enlace (Video, Test, o genérico): Abrir en nueva pestaña
  if (recurso.tipo === 'enlace' && recurso.url) {
    const label = visualType === 'video' 
      ? 'Ver Video'
      : visualType === 'test'
      ? 'Hacer Test'
      : 'Abrir Enlace'

    return (
      <Button
        variant="default"
        size="sm"
        asChild
      >
        <a
          href={recurso.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {label}
        </a>
      </Button>
    )
  }

  // Podcast: Reproductor inline
  if (recurso.tipo === 'podcast' && recurso.url) {
    return (
      <div className="mt-2">
        <PodcastPlayer recurso={recurso} />
      </div>
    )
  }

  return null
}
