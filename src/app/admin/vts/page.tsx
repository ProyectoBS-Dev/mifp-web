import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Video,
  ArrowLeft,
  LinkIcon,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VTsAdminList } from '@/components/admin/VTsAdminList'

export const metadata: Metadata = {
  title: 'Videotutorías - Admin',
  description: 'Gestión de videotutorías',
}

interface VTData {
  id: string
  numero: number
  titulo: string
  fecha_programada: string | null
  hora_inicio: string | null
  duracion_minutos: number | null
  enlace_grabacion: string | null
  asignatura: {
    id: string
    nombre: string
    codigo: string
    grado: { codigo: string } | null
  } | null
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

async function getVTsData(): Promise<{
  semestre: { id: string; nombre: string } | null
  vtsByAsignatura: VTsByAsignatura[]
  stats: {
    total: number
    conGrabacion: number
    sinGrabacion: number
    asignaturas: number
  }
}> {
  const supabase = await createClient()

  // Obtener semestre activo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: semestreActivo } = await (supabase as any)
    .from('semestres')
    .select('id, nombre')
    .eq('activo', true)
    .single()

  if (!semestreActivo) {
    return {
      semestre: null,
      vtsByAsignatura: [],
      stats: { total: 0, conGrabacion: 0, sinGrabacion: 0, asignaturas: 0 }
    }
  }

  // Obtener VTs del semestre activo con grado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: vts } = await (supabase as any)
    .from('asignatura_vts')
    .select(`
      id,
      numero,
      titulo,
      fecha_programada,
      hora_inicio,
      duracion_minutos,
      enlace_grabacion,
      asignatura:asignaturas(id, nombre, codigo, grado:grados(codigo))
    `)
    .eq('semestre_id', semestreActivo.id)
    .order('numero', { ascending: true })

  // Agrupar por asignatura
  const vtsByAsignatura = new Map<string, VTsByAsignatura>()

  for (const vt of vts || []) {
    if (!vt.asignatura) continue

    const key = vt.asignatura.id
    if (!vtsByAsignatura.has(key)) {
      vtsByAsignatura.set(key, {
        asignatura: {
          id: vt.asignatura.id,
          nombre: vt.asignatura.nombre,
          codigo: vt.asignatura.codigo,
          grado: vt.asignatura.grado?.codigo || 'N/A'
        },
        vts: []
      })
    }
    vtsByAsignatura.get(key)!.vts.push(vt)
  }

  // Calcular stats
  const allVts = vts || []
  const conGrabacion = allVts.filter((v: VTData) => v.enlace_grabacion).length

  return {
    semestre: semestreActivo,
    vtsByAsignatura: Array.from(vtsByAsignatura.values()),
    stats: {
      total: allVts.length,
      conGrabacion,
      sinGrabacion: allVts.length - conGrabacion,
      asignaturas: vtsByAsignatura.size
    }
  }
}

export default async function VTsAdminPage() {
  const { semestre, vtsByAsignatura, stats } = await getVTsData()

  if (!semestre) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay semestre activo configurado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Videotutorías (VTs)</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Gestiona las videotutorías y añade enlaces a las grabaciones.</span>
            <Badge variant="outline">{semestre.nombre}</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total VTs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-green">{stats.conGrabacion}</p>
              <p className="text-xs text-muted-foreground">Con grabación</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-yellow">{stats.sinGrabacion}</p>
              <p className="text-xs text-muted-foreground">Sin grabación</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-vt-blue">{stats.asignaturas}</p>
              <p className="text-xs text-muted-foreground">Asignaturas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info de ayuda */}
      {stats.sinGrabacion > 0 && (
        <Card className="border-vt-yellow/50 bg-vt-yellow/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-vt-yellow" />
              <div>
                <p className="font-medium text-sm">
                  Hay {stats.sinGrabacion} VT{stats.sinGrabacion !== 1 ? 's' : ''} sin enlace de grabación
                </p>
                <p className="text-xs text-muted-foreground">
                  Añade los enlaces de Zoom para que los usuarios puedan ver las grabaciones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de VTs */}
      {vtsByAsignatura.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hay VTs en este semestre</p>
            <p className="text-sm text-muted-foreground mt-1">
              Las VTs se crean automáticamente al validar Guías Didácticas
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              VTs por Asignatura
            </CardTitle>
            <CardDescription>
              Haz clic en una VT para editar su información y añadir el enlace de grabación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VTsAdminList vtsByAsignatura={vtsByAsignatura} semestreId={semestre.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

