import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Download,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { GDValidationForm, ExtractedDataForm, GDDangerZone, GDResetButton } from '@/components/admin'
import { countCurriculum, isExtractionStale } from '@/lib/gd-admin'
import { GD_BUCKET } from '@/lib/gd-upload'
import type { ExtractedGDData } from '@/types/gd'

export const metadata: Metadata = {
  title: 'Revisar GD - Admin',
  description: 'Revisión y gestión de guía didáctica',
}

interface GDDetail {
  id: string
  created_at: string | null
  updated_at: string | null
  estado: 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada' | null
  procesada: boolean | null
  archivo_path: string | null
  motivo_rechazo: string | null
  error_extraccion: string | null
  datos_extraidos: ExtractedGDData | null
  subido_por: string | null
  asignatura_id: string
  semestre_id: string
  asignatura: {
    id: string
    nombre: string
    codigo: string
  } | null
  semestre: {
    id: string
    nombre: string
  } | null
  uploader: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

async function getGD(id: string): Promise<GDDetail | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('guias_didacticas')
    .select(`
      id, created_at, updated_at, estado, procesada, archivo_path, motivo_rechazo, error_extraccion,
      datos_extraidos, subido_por, asignatura_id, semestre_id,
      asignatura:asignaturas(id, nombre, codigo),
      semestre:semestres(id, nombre),
      uploader:users!guias_didacticas_subido_por_fkey(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  // Type assertion para datos_extraidos (Json -> ExtractedGDData)
  return data ? {
    ...data,
    datos_extraidos: data.datos_extraidos as ExtractedGDData | null
  } : null
}

async function getFileUrl(path: string): Promise<string | null> {
  const supabase = await createClient()

  const { data } = await supabase.storage
    .from(GD_BUCKET)
    .createSignedUrl(path, 3600) // URL válida por 1 hora

  return data?.signedUrl || null
}

/** Visor del PDF: se muestra en todos los estados para poder contrastar los datos con el original */
function PdfPanel({ fileUrl, tall = false }: { fileUrl: string | null; tall?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Guía didáctica (PDF)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fileUrl ? (
          <div className="space-y-4">
            <div
              className={
                tall
                  ? 'h-[70vh] xl:h-[calc(100vh-14rem)] bg-muted rounded-lg overflow-hidden'
                  : 'aspect-[3/4] bg-muted rounded-lg overflow-hidden'
              }
            >
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full"
                title="Vista previa de la Guía Didáctica"
              />
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </a>
            </Button>
          </div>
        ) : (
          <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se pudo cargar el archivo</p>
              <p className="text-xs mt-1">Puede haberse eliminado de Storage</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ValidarGDPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gd = await getGD(id)

  if (!gd) {
    notFound()
  }

  const [fileUrl, counts] = await Promise.all([
    gd.archivo_path ? getFileUrl(gd.archivo_path) : Promise.resolve(null),
    countCurriculum(createAdminClient(), gd.asignatura_id, gd.semestre_id),
  ])

  const estado = gd.estado ?? 'pendiente'

  const estadoConfig = {
    pendiente: { label: 'Pendiente', color: 'yellow' },
    extrayendo: { label: 'Extrayendo...', color: 'blue' },
    extraida: { label: 'Datos Extraídos', color: 'purple' },
    validada: { label: 'Validada', color: 'green' },
    rechazada: { label: 'Rechazada', color: 'red' },
  } as const
  const estadoInfo = estadoConfig[estado]

  const extractionInFlight = estado === 'extrayendo' && !isExtractionStale(gd.updated_at)
  const asignaturaNombre = gd.asignatura?.nombre ?? 'Sin asignatura'
  const asignaturaCodigo = gd.asignatura?.codigo ?? ''

  const dangerZone = !extractionInFlight && asignaturaCodigo ? (
    <GDDangerZone
      gdId={gd.id}
      asignaturaNombre={asignaturaNombre}
      asignaturaCodigo={asignaturaCodigo}
      canUndo={counts.total > 0}
    />
  ) : null

  // En la revisión de datos extraídos la página usa todo el ancho disponible
  const isReview = estado === 'extraida' && !!gd.datos_extraidos

  return (
    <div className="space-y-6" data-admin-wide={isReview ? '' : undefined}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/admin/guias-didacticas">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a la lista
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Guía Didáctica
          </h1>
          <p className="text-muted-foreground">
            {asignaturaNombre} ({asignaturaCodigo}) · {gd.semestre?.nombre ?? 'Sin semestre'}
          </p>
        </div>
        <Badge color={estadoInfo.color} size="lg">
          {estadoInfo.label}
        </Badge>
      </div>

      {/* Extraída: formulario de revisión junto al PDF, que sigue visible */}
      {isReview && gd.datos_extraidos ? (
        <div className="grid xl:grid-cols-2 gap-6 xl:gap-10 items-start">
          <div className="space-y-6 order-2 xl:order-1 min-w-0">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Datos extraídos con OpenAI</p>
                    <p className="text-sm text-muted-foreground">
                      Contrasta los datos con el PDF y edítalos antes de validar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {gd.datos_extraidos.advertencias && gd.datos_extraidos.advertencias.length > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Avisos de la extracción</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {gd.datos_extraidos.advertencias.map(aviso => (
                      <li key={aviso}>{aviso}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {counts.total > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Esta asignatura ya tiene datos cargados</AlertTitle>
                <AlertDescription>
                  Hay {counts.ras} RAs, {counts.pacs} PACs y {counts.vts} VTs en este semestre, así que
                  no se podrá validar. Usa «Deshacer» en la zona de peligro para borrarlos con backup.
                </AlertDescription>
              </Alert>
            )}

            <ExtractedDataForm gdId={gd.id} initialData={gd.datos_extraidos} />

            {dangerZone}
          </div>

          <div className="order-1 xl:order-2 xl:sticky xl:top-4 min-w-0">
            <PdfPanel fileUrl={fileUrl} tall />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <PdfPanel fileUrl={fileUrl} />
          </div>

          {/* Sidebar - Info y Acciones */}
          <div className="space-y-6">
            {/* Información */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Asignatura</p>
                    <p className="text-sm font-medium">
                      {gd.asignatura?.nombre || 'No especificada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Semestre</p>
                    <p className="text-sm font-medium">
                      {gd.semestre?.nombre || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Subido por</p>
                    <p className="text-sm font-medium">
                      {gd.uploader?.full_name || gd.uploader?.email || 'Usuario'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de subida</p>
                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(gd.created_at ?? Date.now()), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pendiente: extraer o rechazar */}
            {estado === 'pendiente' && (
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                  <CardDescription>
                    Extrae los datos con IA para poder revisarlos y validarlos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gd.error_extraccion && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>La última extracción falló</AlertTitle>
                      <AlertDescription>{gd.error_extraccion}</AlertDescription>
                    </Alert>
                  )}
                  {counts.total > 0 && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Ya hay datos cargados</AlertTitle>
                      <AlertDescription>
                        Hay {counts.ras} RAs, {counts.pacs} PACs y {counts.vts} VTs para esta asignatura.
                        Usa «Deshacer» antes de extraer y validar de nuevo.
                      </AlertDescription>
                    </Alert>
                  )}
                  <GDValidationForm
                    gdId={gd.id}
                    asignaturaId={gd.asignatura?.id || ''}
                    semestreId={gd.semestre?.id || ''}
                  />
                </CardContent>
              </Card>
            )}

            {/* Extrayendo: en curso o atascada */}
            {estado === 'extrayendo' && (
              <Card className={extractionInFlight ? 'border-vt-blue/50' : 'border-vt-yellow/50'}>
                <CardContent className="pt-6 space-y-4">
                  {extractionInFlight ? (
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 text-vt-blue mx-auto mb-3 animate-spin" />
                      <p className="font-medium">Extracción en curso</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recarga la página en unos segundos.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <AlertTriangle className="h-10 w-10 text-vt-yellow mx-auto mb-3" />
                        <p className="font-medium">Extracción atascada</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Lleva más de 90 s sin terminar. Desbloquéala para volver a intentarlo.
                        </p>
                      </div>
                      <GDResetButton gdId={gd.id} label="Desbloquear" variant="default" />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Extraída sin datos (JSON perdido): se puede volver a empezar */}
            {estado === 'extraida' && !gd.datos_extraidos && (
              <Card className="border-vt-yellow/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <AlertTriangle className="h-10 w-10 text-vt-yellow mx-auto mb-3" />
                    <p className="font-medium">Sin datos extraídos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      La GD figura como extraída pero no hay datos que revisar.
                    </p>
                  </div>
                  <GDResetButton gdId={gd.id} variant="default" />
                </CardContent>
              </Card>
            )}

            {estado === 'validada' && (
              <Card className={counts.total > 0 ? 'border-green-500/50' : 'border-vt-yellow/50'}>
                <CardContent className="pt-6 space-y-4">
                  {counts.total > 0 ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 text-vt-green mx-auto mb-4" />
                      <p className="font-medium text-vt-green">GD Validada</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {counts.ras} RAs · {counts.pacs} PACs · {counts.vts} VTs cargados
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-vt-yellow mx-auto mb-4" />
                        <p className="font-medium">Validada sin currículo</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          No hay RAs, PACs ni VTs para esta asignatura. Devuélvela a pendiente para
                          extraerla y validarla de nuevo.
                        </p>
                      </div>
                      <GDResetButton gdId={gd.id} variant="default" />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {estado === 'rechazada' && (
              <Card className="border-red-500/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-vt-red mx-auto mb-4" />
                    <p className="font-medium text-vt-red">GD Rechazada</p>
                    {gd.motivo_rechazo && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Motivo: {gd.motivo_rechazo}
                      </p>
                    )}
                  </div>
                  <GDResetButton gdId={gd.id} />
                </CardContent>
              </Card>
            )}

            {dangerZone}
          </div>
        </div>
      )}
    </div>
  )
}
