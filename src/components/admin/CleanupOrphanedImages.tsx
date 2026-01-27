'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface CleanupResult {
  success: boolean
  message: string
  deleted: number
  kept: number
  retentionDays: number | null
}

const RETENTION_OPTIONS = [
  { value: '0', label: 'Eliminar todas (cualquier antigüedad)', danger: true },
  { value: '7', label: 'Más de 7 días', danger: false },
  { value: '14', label: 'Más de 14 días', danger: false },
  { value: '30', label: 'Más de 30 días (recomendado)', danger: false },
  { value: '60', label: 'Más de 60 días', danger: false },
  { value: '90', label: 'Más de 90 días', danger: false },
]

export function CleanupOrphanedImages() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CleanupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retentionDays, setRetentionDays] = useState<string>('30')

  const handleCleanup = async () => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Si es 0, enviar null para eliminar todas
      const daysValue = retentionDays === '0' ? null : parseInt(retentionDays, 10)
      
      const response = await fetch('/api/admin/noticias/cleanup-orphaned-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: daysValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al limpiar imágenes')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar imágenes')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset después de cerrar para limpiar el estado
    setTimeout(() => {
      setResult(null)
      setError(null)
      setRetentionDays('30') // Reset al valor por defecto
    }, 200)
  }

  const selectedOption = RETENTION_OPTIONS.find(o => o.value === retentionDays)
  const isDangerousOption = selectedOption?.danger || false

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar imágenes huérfanas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Limpiar imágenes huérfanas</DialogTitle>
          <DialogDescription>
            Elimina imágenes del storage que no están asociadas a ninguna noticia activa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de antigüedad */}
          <div className="space-y-2">
            <Label htmlFor="retention">Antigüedad mínima para eliminar</Label>
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger id="retention">
                <SelectValue placeholder="Selecciona antigüedad" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className={option.danger ? 'text-destructive' : ''}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning para opción peligrosa */}
          {isDangerousOption && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Esta opción eliminará TODAS las imágenes huérfanas sin importar su antigüedad.
                Las imágenes de noticias recientemente borradas también serán eliminadas y no podrán recuperarse.
              </AlertDescription>
            </Alert>
          )}

          {/* Info normal */}
          {!isDangerousOption && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Información</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Solo se eliminarán las imágenes huérfanas con más de {retentionDays} días de antigüedad.
                Las imágenes más recientes se conservarán por si necesitas recuperar una noticia.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="border-green-200 bg-green-50 text-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Limpieza completada</AlertTitle>
              <AlertDescription className="text-sm space-y-1 mt-2">
                <div className="font-medium">{result.message}</div>
                <div className="text-xs space-y-0.5 mt-2">
                  <div>• {result.deleted} imágenes eliminadas</div>
                  {result.retentionDays !== null && result.kept > 0 && (
                    <div>• {result.kept} imágenes conservadas (menos de {result.retentionDays} días)</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose} variant="outline">
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCleanup}
                disabled={isProcessing}
                variant="destructive"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ejecutar limpieza
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
