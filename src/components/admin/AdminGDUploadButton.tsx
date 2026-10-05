'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GDUploadModal } from '@/components/guias-didacticas/GDUploadModal'
import type { AsignaturaSinGD } from '@/hooks/useMissingGDs'

interface AdminGDUploadButtonProps {
  /** Asignaturas del semestre activo sin GD activa, de cualquier grado */
  asignaturas: AsignaturaSinGD[]
}

/**
 * Permite a un admin subir la GD de cualquier asignatura del semestre activo,
 * sin tenerla asignada en su perfil. Reutiliza el modal de subida de usuario:
 * los endpoints de subida no exigen estar matriculado.
 */
export function AdminGDUploadButton({ asignaturas }: AdminGDUploadButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={asignaturas.length === 0}>
        <Upload className="h-4 w-4 mr-2" />
        Subir GD
      </Button>

      <GDUploadModal
        open={open}
        onOpenChange={setOpen}
        asignaturas={asignaturas}
        onUploaded={() => router.refresh()}
      />
    </>
  )
}
