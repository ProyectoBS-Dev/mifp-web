'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Video,
  Calendar,
  Percent,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ExtractedGDData, ExtractedRA, ExtractedPAC, ExtractedVT } from '@/types/gd'
import { useCsrfToken } from '@/hooks/useCsrfToken'

const RECHAZO_MOTIVOS = [
  'El archivo no es una Guía Didáctica válida',
  'El archivo corresponde a otro semestre',
  'El archivo está corrupto o ilegible',
  'La asignatura no coincide',
  'Los datos extraídos son incorrectos',
  'Otro motivo',
]

interface ExtractedDataFormProps {
  gdId: string
  initialData: ExtractedGDData
}

export function ExtractedDataForm({ gdId, initialData }: ExtractedDataFormProps) {
  const router = useRouter()
  const [data, setData] = useState<ExtractedGDData>(initialData)
  const [isValidating, setIsValidating] = useState(false)
  const [isAborting, setIsAborting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rechazoMotivo, setRechazoMotivo] = useState('')
  const [rechazoOtro, setRechazoOtro] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { csrfHeaders } = useCsrfToken()
  const [openSections, setOpenSections] = useState({
    modulo: true,
    ras: true,
    pacs: true,
    vts: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Handlers para RAs
  const updateRA = (index: number, field: keyof ExtractedRA, value: string | number | null) => {
    const newRas = [...data.ras]
    newRas[index] = { ...newRas[index], [field]: value }
    setData({ ...data, ras: newRas })
  }

  const removeRA = (index: number) => {
    const raNumero = data.ras[index].numero
    // También eliminar PACs asociadas a este RA
    const newPacs = data.pacs.filter(p => p.ra_numero !== raNumero)
    setData({
      ...data,
      ras: data.ras.filter((_, i) => i !== index),
      pacs: newPacs
    })
  }

  // Handlers para PACs
  const updatePAC = (index: number, field: keyof ExtractedPAC, value: string | number | null) => {
    const newPacs = [...data.pacs]
    newPacs[index] = { ...newPacs[index], [field]: value }
    setData({ ...data, pacs: newPacs })
  }

  const removePAC = (index: number) => {
    setData({ ...data, pacs: data.pacs.filter((_, i) => i !== index) })
  }

  // Handlers para VTs
  const updateVT = (index: number, field: keyof ExtractedVT, value: string | number | null) => {
    const newVts = [...data.vts]
    newVts[index] = { ...newVts[index], [field]: value }
    setData({ ...data, vts: newVts })
  }

  const removeVT = (index: number) => {
    setData({ ...data, vts: data.vts.filter((_, i) => i !== index) })
  }

  // Validar y guardar
  const handleValidate = async () => {
    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/guias-didacticas/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify({ gdId, datos: data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al validar')
      }

      // Éxito - redirigir a lista
      router.push('/admin/guias-didacticas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsValidating(false)
    }
  }

  // Abortar extracción: devolver a pendiente
  const handleAbort = async () => {
    setIsAborting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('guias_didacticas')
        .update({
          estado: 'pendiente',
          datos_extraidos: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gdId)

      if (updateError) throw updateError

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abortar')
    } finally {
      setIsAborting(false)
    }
  }

  // Rechazar GD
  const handleReject = async () => {
    setIsRejecting(true)
    setError(null)

    try {
      const motivo = rechazoMotivo === 'Otro motivo' ? rechazoOtro : rechazoMotivo

      const response = await fetch('/api/admin/guias-didacticas/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify({ gdId, motivo }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al rechazar')
      }

      router.push('/admin/guias-didacticas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-vt-red/10 border border-vt-red/50 text-vt-red">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{data.ras.length}</span>
              <span className="text-sm text-muted-foreground">RAs</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{data.pacs.length}</span>
              <span className="text-sm text-muted-foreground">PACs</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{data.vts.length}</span>
              <span className="text-sm text-muted-foreground">VTs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulo */}
      <Collapsible open={openSections.modulo} onOpenChange={() => toggleSection('modulo')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <span>📚 Información del Módulo</span>
                {openSections.modulo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label>Código</Label>
                <Input
                  id="modulo-codigo"
                  name="codigo"
                  value={data.modulo.codigo}
                  onChange={(e) => setData({
                    ...data,
                    modulo: { ...data.modulo, codigo: e.target.value }
                  })}
                />
              </div>
              <div className="col-span-2">
                <Label>Nombre</Label>
                <Input
                  id="modulo-nombre"
                  name="nombre"
                  value={data.modulo.nombre}
                  onChange={(e) => setData({
                    ...data,
                    modulo: { ...data.modulo, nombre: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* RAs */}
      <Collapsible open={openSections.ras} onOpenChange={() => toggleSection('ras')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  🎯 Resultados de Aprendizaje
                  <Badge color="gray">{data.ras.length}</Badge>
                </span>
                {openSections.ras ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.ras.map((ra, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge>{ra.codigo}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRA(index)}
                    >
                      <Trash2 className="h-4 w-4 text-vt-red" />
                    </Button>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input
                      id={`ra-titulo-${index}`}
                      name="titulo"
                      value={ra.titulo}
                      onChange={(e) => updateRA(index, 'titulo', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Fecha inicio
                      </Label>
                      <Input
                        id={`ra-fecha-inicio-${index}`}
                        name="fecha_inicio"
                        type="date"
                        value={ra.fecha_inicio || ''}
                        onChange={(e) => updateRA(index, 'fecha_inicio', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Fecha fin
                      </Label>
                      <Input
                        id={`ra-fecha-fin-${index}`}
                        name="fecha_fin"
                        type="date"
                        value={ra.fecha_fin || ''}
                        onChange={(e) => updateRA(index, 'fecha_fin', e.target.value || null)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* PACs */}
      <Collapsible open={openSections.pacs} onOpenChange={() => toggleSection('pacs')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  📝 PACs
                  <Badge color="gray">{data.pacs.length}</Badge>
                </span>
                {openSections.pacs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.pacs.map((pac, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge color="gray" colorStyle="outline">PAC {pac.numero_global}</Badge>
                      <Badge color={pac.tipo === 'interactiva' ? 'blue' : 'purple'}>
                        {pac.tipo}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePAC(index)}
                    >
                      <Trash2 className="h-4 w-4 text-vt-red" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Título</Label>
                      <Input
                        id={`pac-titulo-${index}`}
                        name="titulo"
                        value={pac.titulo}
                        onChange={(e) => updatePAC(index, 'titulo', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>RA asociado</Label>
                      <Select
                        value={String(pac.ra_numero)}
                        onValueChange={(v) => updatePAC(index, 'ra_numero', parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {data.ras.map(ra => (
                            <SelectItem key={ra.numero} value={String(ra.numero)}>
                              {ra.codigo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        <Percent className="h-3 w-3" /> Peso en RA
                      </Label>
                      <Input
                        id={`pac-peso-${index}`}
                        name="peso_en_ra"
                        type="number"
                        min={0}
                        max={100}
                        value={pac.peso_en_ra}
                        onChange={(e) => updatePAC(index, 'peso_en_ra', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Fecha límite
                      </Label>
                      <Input
                        id={`pac-fecha-limite-${index}`}
                        name="fecha_limite"
                        type="date"
                        value={pac.fecha_limite || ''}
                        onChange={(e) => updatePAC(index, 'fecha_limite', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={pac.tipo}
                        onValueChange={(v) => updatePAC(index, 'tipo', v as 'interactiva' | 'desarrollo')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interactiva">Interactiva</SelectItem>
                          <SelectItem value="desarrollo">Desarrollo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* VTs */}
      <Collapsible open={openSections.vts} onOpenChange={() => toggleSection('vts')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  📹 Videotutorías
                  <Badge color="gray">{data.vts.length}</Badge>
                </span>
                {openSections.vts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.vts.map((vt, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge color="gray" colorStyle="outline">VT {vt.numero}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVT(index)}
                    >
                      <Trash2 className="h-4 w-4 text-vt-red" />
                    </Button>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input
                      id={`vt-titulo-${index}`}
                      name="titulo"
                      value={vt.titulo}
                      onChange={(e) => updateVT(index, 'titulo', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Fecha
                      </Label>
                      <Input
                        id={`vt-fecha-${index}`}
                        name="fecha"
                        type="date"
                        value={vt.fecha || ''}
                        onChange={(e) => updateVT(index, 'fecha', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <Label>Hora inicio</Label>
                      <Input
                        id={`vt-hora-inicio-${index}`}
                        name="hora_inicio"
                        type="time"
                        value={vt.hora_inicio || ''}
                        onChange={(e) => updateVT(index, 'hora_inicio', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <Label>Duración (min)</Label>
                      <Input
                        id={`vt-duracion-${index}`}
                        name="duracion_minutos"
                        type="number"
                        min={0}
                        value={vt.duracion_minutos || ''}
                        onChange={(e) => updateVT(index, 'duracion_minutos', parseInt(e.target.value) || null)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Botones de acción */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Abortar: devolver a pendiente */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Devolver a Pendiente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>🔄 Devolver a Pendiente</AlertDialogTitle>
                <AlertDialogDescription>
                  Se borrarán los datos extraídos y la GD volverá al estado pendiente
                  para ser extraída de nuevo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAbort}
                  disabled={isAborting}
                >
                  {isAborting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Rechazar GD */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg">
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar GD
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ Rechazar Guía Didáctica</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción marcará la GD como rechazada. El usuario será notificado.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Motivo del rechazo *</Label>
                  <Select value={rechazoMotivo} onValueChange={setRechazoMotivo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un motivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RECHAZO_MOTIVOS.map((motivo) => (
                        <SelectItem key={motivo} value={motivo}>
                          {motivo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {rechazoMotivo === 'Otro motivo' && (
                  <div className="space-y-2">
                    <Label>Especifica el motivo</Label>
                    <Textarea
                      value={rechazoOtro}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRechazoOtro(e.target.value)}
                      placeholder="Describe el motivo del rechazo..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  disabled={!rechazoMotivo || isRejecting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar Rechazo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Validar y guardar */}
        <Button
          onClick={handleValidate}
          disabled={isValidating || data.ras.length === 0}
          size="lg"
          className="bg-green-600 hover:bg-green-700 shadow-lg"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Validar y Guardar ({data.ras.length} RAs, {data.pacs.length} PACs, {data.vts.length} VTs)
        </Button>
      </div>
    </div>
  )
}
