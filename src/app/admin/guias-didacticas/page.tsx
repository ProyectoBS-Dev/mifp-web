import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Clock,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GDsAdminList } from '@/components/admin/GDsAdminList'

export const metadata: Metadata = {
  title: 'Guías Didácticas - Admin',
  description: 'Gestión de guías didácticas',
}

type GDEstado = 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'

interface GD {
  id: string
  created_at: string | null
  estado: GDEstado | null
  procesada: boolean | null
  archivo_path: string | null
  asignatura: {
    nombre: string
    codigo: string
    grado: { codigo: string } | null
  } | null
  semestre: {
    nombre: string
  } | null
  uploader: {
    full_name: string | null
    email: string
  } | null
}

async function getGDs(): Promise<GD[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('guias_didacticas')
    .select(`
      id, created_at, estado, procesada, archivo_path,
      asignatura:asignaturas(nombre, codigo, grado:grados(codigo)),
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
              <Badge color="gray">{pendientes.length}</Badge>
            </CardTitle>
            <CardDescription>
              Estas guías necesitan ser revisadas y validadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GDsAdminList gds={pendientes} showPendientes />
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
