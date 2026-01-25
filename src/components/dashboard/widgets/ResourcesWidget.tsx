'use client'

// ============================================
// 📚 ResourcesWidget - Widget de Recursos de Estudio
// ============================================
// Muestra PDFs, enlaces y podcasts organizados en tabs
// - PDFs: Vista previa en modal + descarga
// - Enlaces: Apertura en nueva pestaña
// - Podcasts: Reproductor inline custom

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Link as LinkIcon,
  Headphones,
  ExternalLink,
  Eye,
  Package
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatSeconds } from '@/lib/format'
import { useRecursosByType } from '@/hooks/useRecursos'
import { PodcastPlayer } from '../PodcastPlayer'
import { PDFPreviewModal } from '../PDFPreviewModal'
import { type Recurso, type RecursoTipo } from '@/types/recursos'

// ============================================
// Constantes de estilos
// ============================================

const RESOURCE_COLORS: Record<RecursoTipo, string> = {
  pdf: 'bg-vt-red/10 text-vt-red',
  enlace: 'bg-vt-blue/10 text-vt-blue',
  podcast: 'bg-vt-purple/10 text-vt-purple',
}

const RESOURCE_ICONS: Record<RecursoTipo, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  enlace: <LinkIcon className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
}

// Helper para detectar recursos nuevos (últimas 24h)
function isNew(createdAt: string): boolean {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
  return diffHours < 24
}

// Componente de indicador "Nuevo" (punto pulsante)
function NewIndicator() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-blue-light opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-blue-light"></span>
    </span>
  )
}

// ============================================
// Componentes auxiliares
// ============================================

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ tipo }: { tipo: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
        {tipo === 'PDFs' && <FileText className="h-5 w-5 text-muted-foreground" />}
        {tipo === 'enlaces' && <LinkIcon className="h-5 w-5 text-muted-foreground" />}
        {tipo === 'podcasts' && <Headphones className="h-5 w-5 text-muted-foreground" />}
      </div>
      <p className="text-sm text-muted-foreground">
        No hay {tipo} disponibles
      </p>
    </div>
  )
}

// ============================================
// Tarjeta de PDF
// ============================================

interface PDFCardProps {
  recurso: Recurso
  onPreview: () => void
}

function PDFCard({ recurso, onPreview }: PDFCardProps) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className={cn('p-2 rounded-lg flex-shrink-0', RESOURCE_COLORS.pdf)}>
        {RESOURCE_ICONS.pdf}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isNew(recurso.created_at) && <NewIndicator />}
          <p className="text-sm font-medium truncate">{recurso.titulo}</p>
        </div>
        {recurso.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {recurso.descripcion}
          </p>
        )}
        {recurso.asignaturas && recurso.asignaturas.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            📁 {recurso.asignaturas.length === 1
              ? recurso.asignaturas[0].nombre
              : `${recurso.asignaturas.length} asignaturas`}
          </p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onPreview}
          title="Ver PDF"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Tarjeta de Enlace
// ============================================

function EnlaceCard({ recurso }: { recurso: Recurso }) {
  const domain = recurso.url ? (() => {
    try {
      return new URL(recurso.url).hostname.replace('www.', '')
    } catch {
      return ''
    }
  })() : ''

  return (
    <a
      href={recurso.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className={cn('p-2 rounded-lg flex-shrink-0', RESOURCE_COLORS.enlace)}>
        {RESOURCE_ICONS.enlace}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isNew(recurso.created_at) && <NewIndicator />}
          <p className="text-sm font-medium truncate">{recurso.titulo}</p>
        </div>
        {recurso.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {recurso.descripcion}
          </p>
        )}
        {domain && (
          <p className="text-xs text-muted-foreground mt-0.5">
            🌐 {domain}
          </p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </a>
  )
}

// ============================================
// Tarjeta de Podcast
// ============================================

function PodcastCard({ recurso }: { recurso: Recurso }) {
  return (
    <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors space-y-2">
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg flex-shrink-0', RESOURCE_COLORS.podcast)}>
          {RESOURCE_ICONS.podcast}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isNew(recurso.created_at) && <NewIndicator />}
            <p className="text-sm font-medium truncate flex-1">{recurso.titulo}</p>
            {recurso.duracion && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatSeconds(recurso.duracion)}
              </span>
            )}
          </div>
          {recurso.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {recurso.descripcion}
            </p>
          )}
        </div>
      </div>
      {recurso.url && (
        <PodcastPlayer recurso={recurso} className="pl-10" />
      )}
    </div>
  )
}

// ============================================
// Widget Principal
// ============================================

export function ResourcesWidget() {
  const { recursos, isLoading, error } = useRecursosByType()
  const [previewPDF, setPreviewPDF] = useState<Recurso | null>(null)

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-sm text-destructive">Error cargando recursos</p>
        <p className="text-xs text-muted-foreground mt-1">
          Por favor, intenta de nuevo más tarde
        </p>
      </div>
    )
  }

  // Empty state (no hay recursos de ningún tipo)
  const totalRecursos = recursos.pdf.length + recursos.enlace.length + recursos.podcast.length
  if (totalRecursos === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No hay recursos disponibles
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="pdf" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 h-8 shrink-0">
          <TabsTrigger value="pdf" className="text-xs gap-1 px-2">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">PDFs</span>
            <span className="text-[10px] text-muted-foreground">
              ({recursos.pdf.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="enlace" className="text-xs gap-1 px-2">
            <LinkIcon className="h-3 w-3" />
            <span className="hidden sm:inline">Enlaces</span>
            <span className="text-[10px] text-muted-foreground">
              ({recursos.enlace.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="podcast" className="text-xs gap-1 px-2">
            <Headphones className="h-3 w-3" />
            <span className="hidden sm:inline">Podcasts</span>
            <span className="text-[10px] text-muted-foreground">
              ({recursos.podcast.length})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: PDFs */}
        <TabsContent value="pdf" className="flex-1 overflow-auto mt-2">
          {recursos.pdf.length === 0 ? (
            <EmptyState tipo="PDFs" />
          ) : (
            <div className="space-y-1">
              {recursos.pdf.map((recurso) => (
                <PDFCard
                  key={recurso.id}
                  recurso={recurso}
                  onPreview={() => setPreviewPDF(recurso)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Enlaces */}
        <TabsContent value="enlace" className="flex-1 overflow-auto mt-2">
          {recursos.enlace.length === 0 ? (
            <EmptyState tipo="enlaces" />
          ) : (
            <div className="space-y-1">
              {recursos.enlace.map((recurso) => (
                <EnlaceCard key={recurso.id} recurso={recurso} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Podcasts */}
        <TabsContent value="podcast" className="flex-1 overflow-auto mt-2">
          {recursos.podcast.length === 0 ? (
            <EmptyState tipo="podcasts" />
          ) : (
            <div className="space-y-2">
              {recursos.podcast.map((recurso) => (
                <PodcastCard key={recurso.id} recurso={recurso} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer: Link a recursos completos */}
      <div className="pt-2 mt-2 border-t shrink-0">
        <Link
          href="/recursos"
          className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Package className="h-3 w-3" />
          Ver todos los recursos
        </Link>
      </div>

      {/* Modal de preview de PDF */}
      <PDFPreviewModal
        recurso={previewPDF}
        onClose={() => setPreviewPDF(null)}
      />
    </div>
  )
}
