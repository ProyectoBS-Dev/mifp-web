import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GDsAdminList, type AdminGD } from '@/components/admin/GDsAdminList'
import { AdminGDUploadButton } from '@/components/admin/AdminGDUploadButton'
import { countCurriculum } from '@/lib/gd-admin'
import type { AsignaturaSinGD } from '@/hooks/useMissingGDs'

export const metadata: Metadata = {
  title: 'Guías Didácticas - Admin',
  description: 'Gestión de guías didácticas',
}

async function getGDs(): Promise<AdminGD[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('guias_didacticas')
    .select(`
      id, created_at, updated_at, estado, error_extraccion, motivo_rechazo,
      asignatura_id, semestre_id,
      asignatura:asignaturas(nombre, codigo, grado:grados(codigo)),
      semestre:semestres(nombre),
      uploader:users!guias_didacticas_subido_por_fkey(full_name, email)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const gds = data ?? []

  // Una validada sin RAs, PACs ni VTs es un estado inconsistente: se detecta
  // contando filas reales, no mirando `datos_extraidos`
  const validadas = gds.filter(gd => gd.estado === 'validada')
  const sinCurriculoIds = new Set<string>()

  await Promise.all(
    validadas.map(async gd => {
      try {
        const counts = await countCurriculum(supabase, gd.asignatura_id, gd.semestre_id)
        if (counts.total === 0) sinCurriculoIds.add(gd.id)
      } catch (error) {
        console.error('[GDs admin] No se pudo contar el currículo de', gd.id, error)
      }
    })
  )

  return gds.map(gd => ({
    id: gd.id,
    created_at: gd.created_at,
    updated_at: gd.updated_at,
    estado: gd.estado,
    error_extraccion: gd.error_extraccion,
    motivo_rechazo: gd.motivo_rechazo,
    sinCurriculo: sinCurriculoIds.has(gd.id),
    asignatura: gd.asignatura,
    semestre: gd.semestre,
    uploader: gd.uploader,
  }))
}

/**
 * Asignaturas del semestre activo que admiten una GD nueva, de cualquier grado.
 *
 * Una GD rechazada no bloquea: `reserveGDSlot` la reemplaza al subir otra.
 */
async function getAsignaturasSinGD(): Promise<AsignaturaSinGD[]> {
  const supabase = createAdminClient()

  const { data: semestre } = await supabase
    .from('semestres')
    .select('id')
    .eq('activo', true)
    .single()

  if (!semestre) return []

  const [asignaturasResult, gdsResult] = await Promise.all([
    supabase
      .from('asignaturas')
      .select('id, nombre, codigo, grado:grados(codigo)')
      .is('deleted_at', null)
      .order('nombre'),
    supabase
      .from('guias_didacticas')
      .select('asignatura_id')
      .eq('semestre_id', semestre.id)
      .is('deleted_at', null)
      .neq('estado', 'rechazada'),
  ])

  const conGD = new Set((gdsResult.data ?? []).map(gd => gd.asignatura_id))

  return (asignaturasResult.data ?? [])
    .filter(asignatura => !conGD.has(asignatura.id))
    .map(asignatura => ({
      id: asignatura.id,
      nombre: asignatura.nombre,
      codigo: asignatura.codigo,
      gradoCodigo: asignatura.grado?.codigo ?? null,
    }))
    .sort((a, b) =>
      (a.gradoCodigo ?? '').localeCompare(b.gradoCodigo ?? '') || a.nombre.localeCompare(b.nombre)
    )
}

export default async function GuiasDidacticasPage() {
  const [gds, asignaturasSinGD] = await Promise.all([getGDs(), getAsignaturasSinGD()])

  const pendientes = gds.filter(g => g.estado === 'pendiente')
  const porRevisar = gds.filter(g => g.estado === 'extraida')
  const validadas = gds.filter(g => g.estado === 'validada')
  const rechazadas = gds.filter(g => g.estado === 'rechazada')
  const validadasSinCurriculo = validadas.filter(g => g.sinCurriculo)

  // Cola de trabajo: lo que necesita una acción del admin
  const requierenAtencion = gds.filter(
    g =>
      g.estado === 'pendiente' ||
      g.estado === 'extraida' ||
      g.estado === 'extrayendo' ||
      (g.estado === 'validada' && g.sinCurriculo)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Guías Didácticas</h1>
          <p className="text-muted-foreground">
            Gestiona y valida las guías didácticas subidas por los usuarios.
          </p>
        </div>
        <AdminGDUploadButton asignaturas={asignaturasSinGD} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-yellow">{pendientes.length}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-purple">{porRevisar.length}</p>
              <p className="text-xs text-muted-foreground">Por revisar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-green">{validadas.length}</p>
              <p className="text-xs text-muted-foreground">Validadas</p>
              {validadasSinCurriculo.length > 0 && (
                <p className="flex items-center justify-center gap-1 text-xs text-vt-yellow mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {validadasSinCurriculo.length} sin currículo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-red">{rechazadas.length}</p>
              <p className="text-xs text-muted-foreground">Rechazadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{gds.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requieren atención */}
      {requierenAtencion.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-vt-yellow" />
              Requieren atención
              <Badge color="gray">{requierenAtencion.length}</Badge>
            </CardTitle>
            <CardDescription>
              Pendientes de extraer, datos por revisar, extracciones en curso y validadas sin currículo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GDsAdminList gds={requierenAtencion} grouped={false} />
          </CardContent>
        </Card>
      )}

      {/* Todas las GDs */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Guías Didácticas</CardTitle>
          <CardDescription>
            Historial completo de guías didácticas agrupadas por ciclo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GDsAdminList gds={gds} />
        </CardContent>
      </Card>
    </div>
  )
}
