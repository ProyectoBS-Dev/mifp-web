'use client'

import { useState } from 'react'
import { AlertTriangle, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { GDUploadModal } from './GDUploadModal'
import { useMissingGDs } from '@/hooks/useMissingGDs'

export function GDMissingBanner() {
  const { data: missingGDs, isLoading } = useMissingGDs()
  const [showModal, setShowModal] = useState(false)

  // No mostrar si está cargando o no hay asignaturas sin GD
  if (isLoading || !missingGDs || missingGDs.length === 0) {
    return null
  }

  const asignaturaNames = missingGDs.map(a => a.nombre).join(', ')

  return (
    <>
      <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="flex items-center justify-between w-full ml-2">
          <div>
            <span className="font-medium text-yellow-600 dark:text-yellow-400">
              ⚠️ Faltan datos de {missingGDs.length} asignatura{missingGDs.length > 1 ? 's' : ''}
            </span>
            <p className="text-sm text-muted-foreground mt-0.5">
              {asignaturaNames}
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Subir GD
          </Button>
        </AlertDescription>
      </Alert>

      <GDUploadModal 
        open={showModal} 
        onOpenChange={setShowModal}
        asignaturas={missingGDs}
      />
    </>
  )
}
