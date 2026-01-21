'use client'

import { useState, useEffect } from 'react'
import {
  Video,
  ExternalLink,
  Pencil,
  Trash2,
  ChevronDown,
  Clock,
  Link as LinkIcon,
  Check,
  X,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMinutes } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface VTData {
  id: string
  numero: number
  titulo: string
  fecha_programada: string | null
  hora_inicio: string | null
  duracion_minutos: number | null
  enlace_grabacion: string | null
}

interface VTsByAsignatura {
  asignatura: {
    id: string
    nombre: string
    codigo: string
    grado: string
  }
  vts: VTData[]
}

interface VTsAdminListProps {
  vtsByAsignatura: VTsByAsignatura[]
  semestreId: string
}

export function VTsAdminList({ vtsByAsignatura, semestreId }: VTsAdminListProps) {
  const [openAsignaturas, setOpenAsignaturas] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAsignatura, setSelectedAsignatura] = useState<VTsByAsignatura['asignatura'] | null>(null)

  const toggleAsignatura = (id: string) => {
    setOpenAsignaturas(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleCreateVT = (asignatura: VTsByAsignatura['asignatura']) => {
    setSelectedAsignatura(asignatura)
    setShowCreateModal(true)
  }

  return (
    <>
      <div className="space-y-4">
        {vtsByAsignatura.map((grupo) => {
          const conGrabacion = grupo.vts.filter(v => v.enlace_grabacion).length
          const totalVts = grupo.vts.length
          const porcentaje = totalVts > 0 ? Math.round((conGrabacion / totalVts) * 100) : 0

          return (
            <Collapsible
              key={grupo.asignatura.id}
              open={openAsignaturas.includes(grupo.asignatura.id)}
              onOpenChange={() => toggleAsignatura(grupo.asignatura.id)}
            >
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{grupo.asignatura.nombre}</span>
                        <Badge color="gray" colorStyle="outline" className="text-xs">
                          {grupo.asignatura.grado}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          ({grupo.asignatura.codigo})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{totalVts} VT{totalVts !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span className={cn(
                          porcentaje === 100 ? 'text-vt-green' : porcentaje > 0 ? 'text-vt-yellow' : 'text-vt-red'
                        )}>
                          {conGrabacion}/{totalVts} con grabación
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      color={porcentaje === 100 ? 'green' : porcentaje > 0 ? 'yellow' : 'red'}
                    >
                      {porcentaje}%
                    </Badge>
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      openAsignaturas.includes(grupo.asignatura.id) && 'rotate-180'
                    )} />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 ml-4 space-y-2">
                {grupo.vts.map((vt) => (
                  <VTCard key={vt.id} vt={vt} />
                ))}
                {/* Botón para añadir nueva VT */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() => handleCreateVT(grupo.asignatura)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir VT a {grupo.asignatura.nombre}
                </Button>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      {/* Modal para crear nueva VT */}
      {selectedAsignatura && (
        <CreateVTModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          asignatura={selectedAsignatura}
          semestreId={semestreId}
          nextNumero={(vtsByAsignatura.find(g => g.asignatura.id === selectedAsignatura.id)?.vts.length || 0) + 1}
        />
      )}
    </>
  )
}

interface CreateVTModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asignatura: VTsByAsignatura['asignatura']
  semestreId: string
  nextNumero: number
}

function CreateVTModal({ open, onOpenChange, asignatura, semestreId, nextNumero }: CreateVTModalProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    numero: nextNumero,
    titulo: '',
    fecha_programada: '',
    hora_inicio: '',
    duracion_minutos: 90,
    enlace_grabacion: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/vts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asignaturaId: asignatura.id,
          semestreId,
          ...formData,
          fecha_programada: formData.fecha_programada || null,
          hora_inicio: formData.hora_inicio || null,
          enlace_grabacion: formData.enlace_grabacion.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear VT')
      }

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva VT</DialogTitle>
          <DialogDescription>
            Crear videotutoría para {asignatura.nombre} ({asignatura.grado})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                type="number"
                min={1}
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (min)</Label>
              <Input
                id="duracion"
                type="number"
                min={1}
                value={formData.duracion_minutos}
                onChange={(e) => setFormData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) || 90 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Introducción a HTML"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha_programada}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora inicio</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enlace">Enlace grabación (opcional)</Label>
            <Input
              id="enlace"
              value={formData.enlace_grabacion}
              onChange={(e) => setFormData(prev => ({ ...prev, enlace_grabacion: e.target.value }))}
              placeholder="https://ilernaonline.zoom.us/rec/play/..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear VT'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VTCard({ vt }: { vt: VTData }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    titulo: vt.titulo,
    fecha_programada: vt.fecha_programada || '',
    hora_inicio: vt.hora_inicio?.slice(0, 5) || '',
    duracion_minutos: vt.duracion_minutos || 90,
    enlace_grabacion: vt.enlace_grabacion || ''
  })

  // Actualizar formData cuando los props cambien (después de router.refresh())
  useEffect(() => {
    setFormData({
      titulo: vt.titulo,
      fecha_programada: vt.fecha_programada || '',
      hora_inicio: vt.hora_inicio?.slice(0, 5) || '',
      duracion_minutos: vt.duracion_minutos || 90,
      enlace_grabacion: vt.enlace_grabacion || ''
    })
  }, [vt.titulo, vt.fecha_programada, vt.hora_inicio, vt.duracion_minutos, vt.enlace_grabacion])

  const fechaFormateada = vt.fecha_programada
    ? new Date(vt.fecha_programada).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })
    : null

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    const payload = {
      vtId: vt.id,
      titulo: formData.titulo,
      fecha_programada: formData.fecha_programada || null,
      hora_inicio: formData.hora_inicio.trim() || null,
      duracion_minutos: formData.duracion_minutos,
      enlace_grabacion: formData.enlace_grabacion.trim() || null
    }

    try {
      const response = await fetch('/api/admin/vts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/vts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vtId: vt.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsDeleting(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      titulo: vt.titulo,
      fecha_programada: vt.fecha_programada || '',
      hora_inicio: vt.hora_inicio?.slice(0, 5) || '',
      duracion_minutos: vt.duracion_minutos || 90,
      enlace_grabacion: vt.enlace_grabacion || ''
    })
    setIsEditing(false)
    setError(null)
  }

  return (
    <>
      <div className={cn(
        'p-3 rounded-lg border transition-colors',
        vt.enlace_grabacion ? 'bg-green-500/5 border-green-500/30' : 'bg-muted/30'
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    VT {vt.numero} - {vt.titulo}
                  </span>
                  {vt.enlace_grabacion && (
                    <Badge color="green" colorStyle="outline" className="text-xs">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Grabación
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {fechaFormateada && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {fechaFormateada}
                      {vt.hora_inicio && ` • ${vt.hora_inicio.slice(0, 5)}`}
                    </span>
                  )}
                  {!fechaFormateada && !vt.hora_inicio && (
                    <span className="flex items-center gap-1 text-vt-yellow">
                      <Clock className="h-3 w-3" />
                      Sin fecha/hora
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    {formatMinutes(vt.duracion_minutos)}
                  </span>
                </div>

                {vt.enlace_grabacion && (
                  <a
                    href={vt.enlace_grabacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-vt-blue hover:text-vt-blue-light flex items-center gap-1 truncate max-w-[400px]"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{vt.enlace_grabacion}</span>
                  </a>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="text-sm h-8"
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Fecha</Label>
                    <Input
                      type="date"
                      value={formData.fecha_programada}
                      onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
                      className="text-sm h-8"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Hora (HH:MM)</Label>
                    <Input
                      type="text"
                      placeholder="19:30"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                      className="text-sm h-8"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duración (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.duracion_minutos}
                      onChange={(e) => setFormData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) || 90 }))}
                      className="text-sm h-8"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Enlace grabación</Label>
                  <Input
                    value={formData.enlace_grabacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, enlace_grabacion: e.target.value }))}
                    placeholder="https://ilernaonline.zoom.us/rec/play/..."
                    className="text-sm h-8"
                    disabled={isSaving}
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-7 text-xs"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          {!isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
                title="Editar VT"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setIsDeleting(true)}
                title="Eliminar VT"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta VT?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la VT <strong>&quot;{vt.titulo}&quot;</strong> y
              todos los registros de vista de los usuarios. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                'Eliminar VT'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
