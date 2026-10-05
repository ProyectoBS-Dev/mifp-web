'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Download, Loader2, RotateCcw, Trash2, Undo2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { readErrorMessage } from '@/lib/http'

const MANAGE_URL = '/api/admin/guias-didacticas/manage'

// ─────────────────────────────────────────────────────────────────────────────
// Reset (Desbloquear / Devolver a pendiente)
// ─────────────────────────────────────────────────────────────────────────────

interface GDResetButtonProps {
  gdId: string
  label?: string
  size?: 'default' | 'sm'
  variant?: 'default' | 'outline' | 'secondary'
  /** Se llama tras el reset; por defecto se refresca la ruta actual */
  onDone?: () => void
}

/**
 * Devuelve a `pendiente` una GD sin currículo cargado (extracción atascada,
 * rechazada, datos extraídos descartados). No borra nada: el servidor se niega
 * si hay RAs, PACs o VTs.
 */
export function GDResetButton({
  gdId,
  label = 'Devolver a pendiente',
  size = 'sm',
  variant = 'outline',
  onDone,
}: GDResetButtonProps) {
  const router = useRouter()
  const { csrfHeaders } = useCsrfToken()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(MANAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify({ action: 'reset', gdId }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'No se pudo devolver la GD a pendiente'))
      }

      if (onDone) onDone()
      else router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button type="button" size={size} variant={variant} onClick={handleClick} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4 mr-2" />
        )}
        {label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Deshacer / Eliminar (diálogo compartido)
// ─────────────────────────────────────────────────────────────────────────────

type DangerAction = 'undo' | 'purge'

interface Impact {
  datos_estructurales?: { ras?: number; pacs?: number; vts?: number }
  datos_usuario?: {
    usuarios_afectados?: number
    usuarios_con_notas?: number
    registros_user_pacs?: number
    registros_user_vts?: number
    registros_user_examenes?: number
  }
}

interface ManageResult {
  backupId: string | null
  orphanPath: string | null
}

const ACTION_COPY: Record<DangerAction, { title: string; confirm: string; description: string }> = {
  undo: {
    title: 'Deshacer la GD',
    confirm: 'Deshacer y volver a pendiente',
    description:
      'Se borran los RAs, PACs y VTs de esta asignatura y los datos que los usuarios hayan registrado sobre ellos. La GD y su PDF se conservan y vuelve a «Pendiente».',
  },
  purge: {
    title: 'Eliminar la GD',
    confirm: 'Eliminar GD y datos',
    description:
      'Se borran los RAs, PACs y VTs de esta asignatura, los datos de usuario asociados y el PDF. Para volver a tenerla habrá que subirla de nuevo.',
  },
}

interface GDManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: DangerAction
  gdId: string
  asignaturaNombre: string
  asignaturaCodigo: string
}

function GDManageDialog({
  open,
  onOpenChange,
  action,
  gdId,
  asignaturaNombre,
  asignaturaCodigo,
}: GDManageDialogProps) {
  const router = useRouter()
  const { csrfToken } = useCsrfToken()
  const copy = ACTION_COPY[action]

  const [impact, setImpact] = useState<Impact | null>(null)
  const [isLoadingImpact, setIsLoadingImpact] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [confirmCode, setConfirmCode] = useState('')
  const [force, setForce] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManageResult | null>(null)

  const callManage = useCallback(
    async (payload: Record<string, unknown>) => {
      const response = await fetch(MANAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({ action, gdId, ...payload }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'No se pudo completar la operación'))
      }
      return (await response.json()) as {
        audit?: Impact
        backupId?: string | null
        orphanPath?: string | null
      }
    },
    [action, gdId, csrfToken]
  )

  // Al abrir, calcula el impacto (dry-run) antes de permitir confirmar nada
  useEffect(() => {
    // Sin token CSRF el servidor rechazaría la petición: se espera a tenerlo
    if (!open || !csrfToken) return

    let cancelled = false
    setImpact(null)
    setError(null)
    setResult(null)
    setConfirmCode('')
    setForce(false)
    setIsLoadingImpact(true)

    callManage({ dryRun: true })
      .then(data => {
        if (!cancelled) setImpact(data.audit ?? {})
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingImpact(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, csrfToken, callManage])

  const usersWithGrades = impact?.datos_usuario?.usuarios_con_notas ?? 0
  const codeMatches = confirmCode.trim().toLowerCase() === asignaturaCodigo.trim().toLowerCase()
  const canConfirm =
    !!impact && codeMatches && (usersWithGrades === 0 || force) && !isExecuting

  const handleExecute = async () => {
    setIsExecuting(true)
    setError(null)

    try {
      const data = await callManage({ dryRun: false, force, confirmCode })
      setResult({ backupId: data.backupId ?? null, orphanPath: data.orphanPath ?? null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    if (result) {
      // Tras eliminar la ficha ya no existe: se vuelve al listado
      if (action === 'purge') router.push('/admin/guias-didacticas')
      else router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={isExecuting ? undefined : handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {asignaturaNombre} ({asignaturaCodigo})
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <Alert variant="success">
              <AlertTitle>Hecho</AlertTitle>
              <AlertDescription>
                {action === 'undo'
                  ? 'La GD ha vuelto a «Pendiente».'
                  : 'La GD y sus datos se han eliminado.'}
              </AlertDescription>
            </Alert>

            {result.backupId && (
              <Button asChild variant="outline" className="w-full">
                <a href={`/api/admin/guias-didacticas/backups/${result.backupId}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar backup (JSON)
                </a>
              </Button>
            )}

            {result.orphanPath && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>PDF sin borrar</AlertTitle>
                <AlertDescription>
                  No se pudo borrar el archivo de Storage. Bórralo a mano desde el dashboard:
                  <code className="block mt-1 break-all text-xs">{result.orphanPath}</code>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{copy.description}</p>

            {isLoadingImpact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculando el impacto…
              </div>
            )}

            {impact && (
              <div className="rounded-lg border p-3 text-sm space-y-1">
                <p className="font-medium">Se borrará:</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>
                    {impact.datos_estructurales?.ras ?? 0} RAs, {impact.datos_estructurales?.pacs ?? 0} PACs
                    y {impact.datos_estructurales?.vts ?? 0} VTs
                  </li>
                  <li>
                    Datos de {impact.datos_usuario?.usuarios_afectados ?? 0} usuario(s):{' '}
                    {impact.datos_usuario?.registros_user_pacs ?? 0} PACs,{' '}
                    {impact.datos_usuario?.registros_user_vts ?? 0} VTs y{' '}
                    {impact.datos_usuario?.registros_user_examenes ?? 0} notas de examen
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Se borran <strong>todas</strong> las VTs de la asignatura, también las creadas a mano.
                  Antes se guarda un backup que podrás descargar.
                </p>
              </div>
            )}

            {impact && usersWithGrades > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{usersWithGrades} usuario(s) con notas registradas</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Perderán sus notas de esta asignatura (quedan solo en el backup).</p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="gd-force"
                      checked={force}
                      onCheckedChange={checked => setForce(checked === true)}
                    />
                    <Label htmlFor="gd-force" className="text-sm cursor-pointer">
                      Entiendo que se perderán esas notas
                    </Label>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {impact && (
              <div className="space-y-2">
                <Label htmlFor="gd-confirm-code">
                  Escribe el código de la asignatura (<strong>{asignaturaCodigo}</strong>) para confirmar
                </Label>
                <Input
                  id="gd-confirm-code"
                  value={confirmCode}
                  onChange={event => setConfirmCode(event.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isExecuting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleExecute} disabled={!canConfirm}>
                {isExecuting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {copy.confirm}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Zona de peligro de la ficha
// ─────────────────────────────────────────────────────────────────────────────

interface GDDangerZoneProps {
  gdId: string
  asignaturaNombre: string
  asignaturaCodigo: string
  /** `true` si la GD ya está en «Pendiente» sin currículo: no hay nada que deshacer */
  canUndo: boolean
}

/**
 * Acciones destructivas de una GD (Deshacer / Eliminar). Ambas hacen primero un
 * dry-run, piden el código de la asignatura y generan un backup descargable.
 */
export function GDDangerZone({
  gdId,
  asignaturaNombre,
  asignaturaCodigo,
  canUndo,
}: GDDangerZoneProps) {
  const [action, setAction] = useState<DangerAction | null>(null)

  return (
    <>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Acciones para corregir una GD mal cargada. Siempre generan un backup descargable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {canUndo && (
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAction('undo')}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Deshacer (volver a pendiente)
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => setAction('purge')}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar GD y datos
          </Button>
        </CardContent>
      </Card>

      {action && (
        <GDManageDialog
          open
          onOpenChange={open => {
            if (!open) setAction(null)
          }}
          action={action}
          gdId={gdId}
          asignaturaNombre={asignaturaNombre}
          asignaturaCodigo={asignaturaCodigo}
        />
      )}
    </>
  )
}
