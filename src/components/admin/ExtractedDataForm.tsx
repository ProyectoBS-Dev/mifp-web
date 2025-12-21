'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle2, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  FileText,
  Video,
  Calendar,
  Percent,
  Trash2,
  Plus
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ExtractedGDData, ExtractedRA, ExtractedPAC, ExtractedVT } from '@/types/gd'

interface ExtractedDataFormProps {
  gdId: string
  initialData: ExtractedGDData
}

export function ExtractedDataForm({ gdId, initialData }: ExtractedDataFormProps) {
  const router = useRouter()
  const [data, setData] = useState<ExtractedGDData>(initialData)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500">
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
                  <Badge variant="secondary">{data.ras.length}</Badge>
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
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input 
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
                  <Badge variant="secondary">{data.pacs.length}</Badge>
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
                      <Badge variant="outline">PAC {pac.numero_global}</Badge>
                      <Badge variant={pac.tipo === 'interactiva' ? 'secondary' : 'default'}>
                        {pac.tipo}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removePAC(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Título</Label>
                      <Input 
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
                  <Badge variant="secondary">{data.vts.length}</Badge>
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
                    <Badge variant="outline">VT {vt.numero}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeVT(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input 
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
                        type="date"
                        value={vt.fecha || ''}
                        onChange={(e) => updateVT(index, 'fecha', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <Label>Hora inicio</Label>
                      <Input 
                        type="time"
                        value={vt.hora_inicio || ''}
                        onChange={(e) => updateVT(index, 'hora_inicio', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <Label>Duración (min)</Label>
                      <Input 
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

      {/* Botón validar */}
      <div className="sticky bottom-4 flex justify-end">
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
