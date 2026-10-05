'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Upload, CheckCircle2, XCircle, UploadCloudIcon, BadgeAlertIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GDDropzone } from './GDDropzone'
import type { AsignaturaSinGD } from '@/hooks/useMissingGDs'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { createClient } from '@/lib/supabase/client'
import { GD_BUCKET } from '@/lib/gd-upload'

interface GDUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asignaturas: AsignaturaSinGD[]
  /** Se llama tras una subida confirmada (p. ej. para refrescar un listado del servidor) */
  onUploaded?: () => void
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

/**
 * Extrae el mensaje de error de una respuesta fallida.
 *
 * No toda respuesta de error es JSON: un límite de la plataforma o un proxy
 * responden con texto plano, y hacer `response.json()` a ciegas oculta el error
 * real detrás de un fallo de parseo.
 */
async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.text()

  try {
    const data = JSON.parse(body) as { error?: string }
    if (data.error) return data.error
  } catch {
    // Respuesta no-JSON: se usa el mensaje por estado
  }

  if (response.status === 413) return 'El archivo es demasiado grande'
  if (response.status === 401) return 'Tu sesión ha caducado, vuelve a iniciar sesión'
  return `No se pudo subir la guía (error ${response.status})`
}

export function GDUploadModal({ open, onOpenChange, asignaturas, onUploaded }: GDUploadModalProps) {
  const [selectedAsignatura, setSelectedAsignatura] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const queryClient = useQueryClient()
  const { csrfHeaders } = useCsrfToken()

  const handleSubmit = async () => {
    if (!file || !selectedAsignatura) return

    setUploadState('uploading')
    setErrorMessage('')

    try {
      // El PDF se sube directo a Storage con una URL firmada. Si pasara por la
      // API route chocaría con el límite de 4.5MB del body de una función.
      const urlResponse = await fetch('/api/guias-didacticas/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify({
          asignatura_id: selectedAsignatura,
          file_name: file.name,
          file_size: file.size,
        }),
      })

      if (!urlResponse.ok) {
        throw new Error(await readErrorMessage(urlResponse))
      }

      const { path, token } = (await urlResponse.json()) as { path: string; token: string }

      const { error: storageError } = await createClient()
        .storage
        .from(GD_BUCKET)
        .uploadToSignedUrl(path, token, file, { contentType: 'application/pdf' })

      if (storageError) {
        throw new Error(storageError.message || 'Error al subir el archivo')
      }

      const confirmResponse = await fetch('/api/guias-didacticas/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify({ asignatura_id: selectedAsignatura, path }),
      })

      if (!confirmResponse.ok) {
        throw new Error(await readErrorMessage(confirmResponse))
      }

      setUploadState('success')
      queryClient.invalidateQueries({ queryKey: ['missing-gds'] })
      onUploaded?.()
    } catch (error) {
      setUploadState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleReset = () => {
    setSelectedAsignatura('')
    setFile(null)
    setUploadState('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle><UploadCloudIcon className="inline h-6 w-6 mr-2" /> Subir Guía Didáctica</DialogTitle>
          <DialogDescription>
            Sube la GD de una asignatura para tener actualizada tus PACs y videotutorías.
          </DialogDescription>
        </DialogHeader>

        {uploadState === 'idle' && (
          <div className="space-y-4 min-w-0">
            {/* Selector de asignatura */}
            <div className="space-y-2 min-w-0">
              <Label>Selecciona la asignatura *</Label>
              <Select value={selectedAsignatura} onValueChange={setSelectedAsignatura}>
                <SelectTrigger className="overflow-hidden">
                  <SelectValue placeholder="Seleccionar asignatura..." />
                </SelectTrigger>
                <SelectContent>
                  {asignaturas.map((asig) => (
                    <SelectItem key={asig.id} value={asig.id}>
                      {asig.gradoCodigo ? `${asig.gradoCodigo} · ` : ''}
                      {asig.nombre} ({asig.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dropzone */}
            <div className="space-y-2">
              <Label>Archivo PDF de la Guía Didáctica *</Label>
              <GDDropzone
                file={file}
                onFileSelect={setFile}
                onFileRemove={() => setFile(null)}
              />
            </div>

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
              <p><BadgeAlertIcon className="inline h-4 w-4 mr-2 text-vt-green" /> La GD debe corresponder al semestre actual</p>
              <p><BadgeAlertIcon className="inline h-4 w-4 mr-2 text-vt-green" /> Una vez subida, será validada por un administrador</p>
            </div>

            {/* Botones */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedAsignatura || !file}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir GD
              </Button>
            </div>
          </div>
        )}

        {uploadState === 'uploading' && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="font-medium">Subiendo archivo...</p>
            <p className="text-sm text-muted-foreground mt-1">
              {file?.name}
            </p>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-vt-green mb-4" />
            <p className="font-medium text-vt-green">¡GD subida correctamente!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {asignaturas.find(a => a.id === selectedAsignatura)?.nombre}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Un administrador la revisará pronto.
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <Button variant="outline" onClick={handleReset}>
                Subir otra
              </Button>
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="py-8 text-center">
            <XCircle className="h-12 w-12 mx-auto text-vt-red mb-4" />
            <p className="font-medium text-vt-red">Error al subir</p>
            <p className="text-sm text-muted-foreground mt-1">
              {errorMessage}
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <Button variant="outline" onClick={handleReset}>
                Reintentar
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
