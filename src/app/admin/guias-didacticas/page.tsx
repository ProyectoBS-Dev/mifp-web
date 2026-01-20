import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Guías Didácticas - Admin',
  description: 'Gestión de guías didácticas',
}

type GDEstado = 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'

interface GD {
  id: string
  created_at: string
  estado: GDEstado
  procesada: boolean
  archivo_path: string | null
  asignatura: {
    nombre: string
    codigo: string
  } | null
  semestre: {
    nombre: string
  } | null
  uploader: {
    full_name: string | null
    email: string
  } | null
}

const estadoConfig: Record<GDEstado, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', icon: Clock, variant: 'secondary' },
  extrayendo: { label: 'Extrayendo...', icon: AlertCircle, variant: 'outline' },
  extraida: { label: 'Datos Extraídos', icon: CheckCircle2, variant: 'outline' },
  validada: { label: 'Validada', icon: CheckCircle2, variant: 'default' },
  rechazada: { label: 'Rechazada', icon: XCircle, variant: 'destructive' },
}

async function getGDs(): Promise<GD[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('guias_didacticas')
    .select(`
      id, created_at, estado, procesada, archivo_path,
      asignatura:asignaturas(nombre, codigo),
      semestre:semestres(nombre),
      uploader:users!guias_didacticas_subido_por_fkey(full_name, email)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function GuiasDidacticasPage() {
  const gds = await getGDs()

  const pendientes = gds.filter(g => g.estado === 'pendiente')
  const procesadas = gds.filter(g => g.estado !== 'pendiente')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-3xl font-bold text-vt-green">
                {gds.filter(g => g.estado === 'validada').length}
              </p>
              <p className="text-xs text-muted-foreground">Validadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-red">
                {gds.filter(g => g.estado === 'rechazada').length}
              </p>
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

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-vt-yellow" />
              Pendientes de Validación
              <Badge variant="secondary">{pendientes.length}</Badge>
            </CardTitle>
            <CardDescription>
              Estas guías necesitan ser revisadas y validadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendientes.map((gd) => (
                <GDCard key={gd.id} gd={gd} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todas las GDs */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Guías Didácticas</CardTitle>
          <CardDescription>
            Historial completo de guías didácticas subidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay guías didácticas</p>
              <p className="text-sm mt-1">
                Los usuarios pueden subir GDs desde el dashboard
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gds.map((gd) => (
                <GDCard key={gd.id} gd={gd} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GDCard({ gd }: { gd: GD }) {
  const config = estadoConfig[gd.estado]
  const IconComponent = config.icon

  return (
    <Link
      href={`/admin/guias-didacticas/${gd.id}`}
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium group-hover:text-primary transition-colors">
            {gd.asignatura?.nombre || 'Sin asignatura'}
            {gd.asignatura?.codigo && (
              <span className="text-muted-foreground ml-1">
                ({gd.asignatura.codigo})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{gd.uploader?.full_name || gd.uploader?.email || 'Usuario'}</span>
            <span>•</span>
            <span>{gd.semestre?.nombre || 'Sin semestre'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(gd.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </div>
        <Badge variant={config.variant} className="flex items-center gap-1">
          <IconComponent className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>
    </Link>
  )
}
