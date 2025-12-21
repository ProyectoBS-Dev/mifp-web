'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GDDropzoneProps {
  file: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function GDDropzone({ file, onFileSelect, onFileRemove }: GDDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_SIZE,
    multiple: false,
  })

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (file) {
    return (
      <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onFileRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="text-sm">
        {isDragActive ? (
          <span className="text-primary font-medium">Suelta el archivo aquí</span>
        ) : (
          <>
            📄 Arrastra el PDF aquí o{' '}
            <span className="text-primary font-medium">selecciona archivo</span>
          </>
        )}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Formatos: PDF • Tamaño máximo: 10MB
      </p>
      
      {fileRejections.length > 0 && (
        <p className="text-xs text-red-500 mt-2">
          {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  )
}
