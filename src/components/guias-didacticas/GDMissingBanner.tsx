'use client'

import { useState } from 'react'
import { Upload, AlertTriangle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
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
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          Faltan datos de {missingGDs.length} asignatura{missingGDs.length > 1 ? 's' : ''}
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between w-full">
          <p className="text-sm text-muted-foreground">
            {asignaturaNames}
          </p>
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
