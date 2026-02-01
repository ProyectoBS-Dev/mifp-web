'use client'

// ============================================
// 📄 PDFPreviewModal - Visor de PDF tipo Google Drive
// ============================================
// Modal para visualizar y descargar PDFs

import { useState, useCallback } from 'react'
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Recurso } from '@/types/recursos'

interface PDFPreviewModalProps {
  recurso: Recurso | null
  onClose: () => void
}

export function PDFPreviewModal({ recurso, onClose }: PDFPreviewModalProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // URL del PDF (viene de Cloudflare R2 vía url en la DB)
  const pdfUrl = recurso?.url

  // Zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }, [])

  // Zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }, [])

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    setZoom(100)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  // Download PDF (usando API proxy para evitar CORS)
  const handleDownload = useCallback(async () => {
    if (!pdfUrl || !recurso) return

    try {
      const proxyUrl = `/api/download-pdf?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(recurso.titulo + '.pdf')}`
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        throw new Error('Error en la descarga')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recurso.titulo}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error descargando PDF:', err)
      setError('Error descargando el archivo')
    }
  }, [pdfUrl, recurso])

  // Open in new tab
  const handleOpenExternal = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    }
  }, [pdfUrl])

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false)
    setError('Error cargando el PDF')
  }, [])

  if (!recurso) return null

  return (
    <Dialog open={!!recurso} onOpenChange={() => onClose()}>
      <DialogContent 
        className={cn(
          'flex flex-col p-0 gap-0 [&>button]:hidden',
          isFullscreen 
            ? 'max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none' 
            : 'max-w-4xl w-[90vw] h-[85vh]'
        )}
      >
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <DialogTitle className="text-base font-medium truncate">
                📄 {recurso.titulo}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {recurso.asignaturas && recurso.asignaturas.length > 0
                  ? recurso.asignaturas[0].nombre
                  : 'Vista previa del archivo PDF'}
              </DialogDescription>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1">
              {/* Zoom controls */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleResetZoom}
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* Open external */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleOpenExternal}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              {/* Download */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Close - alineado en la toolbar */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-muted/50 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando PDF...</span>
              </div>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleOpenExternal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir en nueva pestaña
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div 
              className="w-full h-full flex items-start justify-center p-4"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0 bg-white shadow-lg rounded"
                title={recurso.titulo}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">PDF no disponible</p>
            </div>
          )}
        </div>

        {/* Footer con descripción */}
        {recurso.descripcion && (
          <div className="px-4 py-2 border-t bg-muted/30 flex-shrink-0">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {recurso.descripcion}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

