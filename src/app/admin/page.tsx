import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuickAccessCards, AdminToolsCard } from '@/components/admin'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Panel Admin',
  description: 'Panel de administración',
}

interface PendingGD {
  id: string
  created_at: string
  asignatura: {
    nombre: string
    codigo: string
  } | null
  uploader: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

async function getPendingGDs(): Promise<PendingGD[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('guias_didacticas')
    .select(`
      id, created_at,
      asignatura:asignaturas(nombre, codigo),
      uploader:users!guias_didacticas_subido_por_fkey(full_name, avatar_url)
    `)
    .eq('estado', 'pendiente')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

async function getStats() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gdsResult, usersResult, asignaturasResult] = await Promise.all([
    (supabase as any)
      .from('guias_didacticas')
      .select('id, estado', { count: 'exact' })
      .is('deleted_at', null),
    (supabase as any)
      .from('users')
      .select('id', { count: 'exact' })
      .is('deleted_at', null),
    (supabase as any)
      .from('asignaturas')
      .select('id', { count: 'exact' })
      .is('deleted_at', null),
  ])

  const gds = gdsResult.data || []
  const pendientes = gds.filter((g: { estado: string }) => g.estado === 'pendiente').length

  return {
    gdsPendientes: pendientes,
    gdsTotal: gds.length,
    usuarios: usersResult.count || 0,
    asignaturas: asignaturasResult.count || 0,
  }
}

export default async function AdminPage() {
  const [pendingGDs, stats] = await Promise.all([
    getPendingGDs(),
    getStats(),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona las guías didácticas, usuarios y contenido de la plataforma.
        </p>
      </div>

      {/* GDs Pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              📋 GDs Pendientes de Validación
              {stats.gdsPendientes > 0 && (
                <Badge variant="destructive">{stats.gdsPendientes}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Guías didácticas subidas por usuarios esperando validación
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/guias-didacticas">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pendingGDs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay GDs pendientes de validación</p>
              <p className="text-sm mt-1">¡Todo al día! 🎉</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pendingGDs.map((gd) => (
                <li key={gd.id}>
                  <Link
                    href={`/admin/guias-didacticas/${gd.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {gd.asignatura?.nombre || 'Sin asignatura'}
                          {gd.asignatura?.codigo && (
                            <span className="text-muted-foreground ml-1">
                              ({gd.asignatura.codigo})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Subido por: {gd.uploader?.full_name || 'Usuario'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(gd.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Accesos rápidos - Client Component */}
      <QuickAccessCards stats={stats} />

      {/* Herramientas de Admin */}
      <AdminToolsCard />

      {/* Nota sobre estadísticas */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p className="text-sm">
            📊 Las estadísticas avanzadas y gráficos estarán disponibles en futuras versiones.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
