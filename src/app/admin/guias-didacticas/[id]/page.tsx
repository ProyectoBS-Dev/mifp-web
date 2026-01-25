import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { GDValidationForm, ExtractedDataForm } from '@/components/admin'
import type { ExtractedGDData } from '@/types/gd'

export const metadata: Metadata = {
  title: 'Validar GD - Admin',
  description: 'Validación de guía didáctica',
}

interface GDDetail {
  id: string
  created_at: string | null
  estado: 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada' | null
  procesada: boolean | null
  archivo_path: string | null
  motivo_rechazo: string | null
  datos_extraidos: ExtractedGDData | null
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
  const supabase = await createClient()

  const { data } = await supabase
    .from('guias_didacticas')
    .select(`
      id, created_at, estado, procesada, archivo_path, motivo_rechazo, datos_extraidos,
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
    .from('guias-didacticas')
    .createSignedUrl(path, 3600) // URL válida por 1 hora

  return data?.signedUrl || null
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

  const fileUrl = gd.archivo_path ? await getFileUrl(gd.archivo_path) : null

  const estadoConfig = {
    pendiente: { label: 'Pendiente', color: 'yellow' },
    extrayendo: { label: 'Extrayendo...', color: 'blue' },
    extraida: { label: 'Datos Extraídos', color: 'purple' },
    validada: { label: 'Validada', color: 'green' },
    rechazada: { label: 'Rechazada', color: 'red' },
  } as const
  // Usar nullish coalescing para prevenir error si estado es null
  const estadoInfo = estadoConfig[gd.estado ?? 'pendiente']

  return (
    <div className="space-y-6">
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
            Validar Guía Didáctica
          </h1>
          <p className="text-muted-foreground">
            {gd.asignatura?.nombre} ({gd.asignatura?.codigo})
          </p>
        </div>
        <Badge color={estadoInfo.color} size="lg">
          {estadoInfo.label}
        </Badge>
      </div>

      {/* Si hay datos extraídos, mostrar el formulario de edición */}
      {gd.datos_extraidos && gd.estado === 'extraida' ? (
        <div className="space-y-6">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Datos extraídos con OpenAI</p>
                  <p className="text-sm text-muted-foreground">
                    Revisa y edita los datos antes de validar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ExtractedDataForm gdId={gd.id} initialData={gd.datos_extraidos} />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Info y Preview */}
          <div className="md:col-span-2 space-y-6">
            {/* Preview PDF */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Vista Previa del PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fileUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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

            {/* Acciones */}
            {gd.estado === 'pendiente' && !gd.datos_extraidos && (
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                  <CardDescription>
                    Extrae datos con IA o valida manualmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GDValidationForm
                    gdId={gd.id}
                    asignaturaId={gd.asignatura?.id || ''}
                    semestreId={gd.semestre?.id || ''}
                  />
                </CardContent>
              </Card>
            )}

            {gd.estado === 'validada' && (
              <Card className="border-green-500/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-vt-green mx-auto mb-4" />
                    <p className="font-medium text-vt-green">GD Validada</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los datos han sido extraídos y guardados
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {gd.estado === 'rechazada' && (
              <Card className="border-red-500/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-vt-red mx-auto mb-4" />
                    <p className="font-medium text-vt-red">GD Rechazada</p>
                    {gd.motivo_rechazo && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Motivo: {gd.motivo_rechazo}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
