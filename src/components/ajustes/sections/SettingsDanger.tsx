'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface SettingsDangerProps {
  userEmail: string
}

export function SettingsDanger({ userEmail }: SettingsDangerProps) {
  const router = useRouter()
  const { csrfHeaders } = useCsrfToken()
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userEmail) {
      setDeleteError('El email no coincide')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { ...csrfHeaders },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar la cuenta')
      }

      // Sign out and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-destructive/30">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Zona de peligro
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Acciones irreversibles para tu cuenta
        </p>
      </div>

      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">Eliminar cuenta</p>
            <p className="text-xs text-muted-foreground mt-1">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos. 
              No se puede deshacer.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="mt-3">
                  Eliminar mi cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    ¿Estás seguro?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="text-sm text-muted-foreground space-y-3">
                      <p>
                        Esta acción <strong>no se puede deshacer</strong>. Se eliminarán 
                        permanentemente:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tu perfil y configuración</li>
                        <li>Todas tus notas y calificaciones</li>
                        <li>Tu progreso en las asignaturas</li>
                        <li>Todos tus datos personales</li>
                      </ul>
                      <div className="pt-3">
                        <Label htmlFor="confirmEmail" className="text-foreground">
                          Escribe <strong>{userEmail}</strong> para confirmar:
                        </Label>
                        <Input
                          id="confirmEmail"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="tu@email.com"
                          className="mt-2"
                        />
                        {deleteError && (
                          <p className="text-sm text-destructive mt-2">{deleteError}</p>
                        )}
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setDeleteConfirmation('')
                    setDeleteError(null)
                  }}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteAccount()
                    }}
                    disabled={isDeleting || deleteConfirmation !== userEmail}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar cuenta'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
