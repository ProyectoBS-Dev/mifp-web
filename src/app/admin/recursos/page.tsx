import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  FileText,
  Link as LinkIcon,
  Headphones,
  Pencil,
  ArrowLeft,
  ExternalLink,
  CloudOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { DeleteRecursoButton } from '@/components/admin/DeleteRecursoButton'

export const metadata: Metadata = {
  title: 'Recursos - Admin',
  description: 'Gestión de recursos de estudio (PDFs, enlaces, podcasts)',
}

interface Recurso {
  id: string
  tipo: 'pdf' | 'enlace' | 'podcast'
  titulo: string
  descripcion: string | null
  url: string | null
  archivo_path: string | null
  duracion: number | null
  created_at: string
  asignaturas: {
    nombre: string
    codigo: string
  }[]
}

const TIPO_ICONS = {
  pdf: FileText,
  enlace: LinkIcon,
  podcast: Headphones,
}

const TIPO_COLORS = {
  pdf: 'bg-vt-red/10 text-vt-red dark:bg-vt-red/20 dark:text-vt-red-light',
  enlace: 'bg-vt-blue/10 text-vt-blue dark:bg-vt-blue/20 dark:text-vt-blue-light',
  podcast: 'bg-vt-purple/10 text-vt-purple dark:bg-vt-purple/20 dark:text-vt-purple-light',
}

const TIPO_LABELS = {
  pdf: 'PDF',
  enlace: 'Enlace',
  podcast: 'Podcast',
}

async function getRecursos(): Promise<Recurso[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('recursos')
    .select(`
      id, tipo, titulo, descripcion, url, archivo_path, duracion, created_at,
      recursos_asignaturas(
        asignatura:asignaturas(nombre, codigo)
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Transformar datos
  return (data || []).map((r: {
    recursos_asignaturas: Array<{ asignatura: { nombre: string; codigo: string } | null }>;
    [key: string]: unknown
  }) => {
    const asignaturas = r.recursos_asignaturas
      ?.map((ra) => ra.asignatura)
      .filter(Boolean) || []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { recursos_asignaturas, ...rest } = r
    return { ...rest, asignaturas } as Recurso
  })
}

async function getStats() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recursos } = await (supabase as any)
    .from('recursos')
    .select('tipo')
    .is('deleted_at', null) // Solo recursos no eliminados

  const stats = {
    total: recursos?.length || 0,
    pdf: recursos?.filter((r: { tipo: string }) => r.tipo === 'pdf').length || 0,
    enlace: recursos?.filter((r: { tipo: string }) => r.tipo === 'enlace').length || 0,
    podcast: recursos?.filter((r: { tipo: string }) => r.tipo === 'podcast').length || 0,
  }

  return stats
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default async function RecursosAdminPage() {
  const recursos = await getRecursos()
  const stats = await getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al panel
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">📚 Recursos</h1>
          <p className="text-muted-foreground">
            Gestiona los recursos de estudio (PDFs, enlaces y podcasts)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/recursos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo enlace
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> PDFs
            </CardDescription>
            <CardTitle className="text-3xl text-vt-red">{stats.pdf}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" /> Enlaces
            </CardDescription>
            <CardTitle className="text-3xl text-vt-blue">{stats.enlace}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Headphones className="h-3 w-3" /> Podcasts
            </CardDescription>
            <CardTitle className="text-3xl text-vt-purple">{stats.podcast}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Info sobre PDFs y Podcasts */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CloudOff className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">PDFs y Podcasts desde Cloudflare R2</p>
              <p>
                Los recursos de tipo PDF y Podcast se sincronizan automáticamente desde Cloudflare R2.
                Para añadir nuevos, sube los archivos a R2 con su archivo .json de metadatos y ejecuta:
              </p>
              <code className="mt-2 block bg-background px-3 py-2 rounded text-xs font-mono">
                pnpm sync-resources
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de recursos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los recursos</CardTitle>
          <CardDescription>
            Los enlaces se gestionan aquí. Los PDFs y podcasts vienen de Cloudflare R2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recursos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay recursos aún</p>
              <Button asChild className="mt-4">
                <Link href="/admin/recursos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear el primer enlace
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recursos.map((recurso) => {
                const Icon = TIPO_ICONS[recurso.tipo]
                const isEditable = recurso.tipo === 'enlace'

                return (
                  <div
                    key={recurso.id}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${TIPO_COLORS[recurso.tipo]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{recurso.titulo}</h3>
                          <Badge color="gray" colorStyle="outline" className="shrink-0 text-xs">
                            {TIPO_LABELS[recurso.tipo]}
                          </Badge>
                          {recurso.tipo === 'podcast' && recurso.duracion && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(recurso.duracion)}
                            </span>
                          )}
                        </div>
                        {recurso.descripcion && (
                          <p className="text-sm text-muted-foreground truncate">
                            {recurso.descripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {recurso.asignaturas && recurso.asignaturas.length > 0 && (
                            <span>
                              📁 {recurso.asignaturas.length === 1
                                ? recurso.asignaturas[0].nombre
                                : `${recurso.asignaturas.length} asignaturas`}
                            </span>
                          )}
                          {recurso.url && recurso.tipo === 'enlace' && (
                            <span className="truncate max-w-[200px]">
                              🌐 {new URL(recurso.url).hostname}
                            </span>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(recurso.created_at), {
                              addSuffix: true,
                              locale: es
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {recurso.url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={recurso.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {isEditable && (
                        <>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/recursos/${recurso.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteRecursoButton
                            recursoId={recurso.id}
                            recursoTitulo={recurso.titulo}
                          />
                        </>
                      )}
                      {!isEditable && (
                        <span className="text-xs text-muted-foreground px-2">
                          Desde R2
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

