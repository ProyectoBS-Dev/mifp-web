import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  FileText,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Noticias - Admin',
  description: 'Gestión de noticias y blog',
}

interface Noticia {
  id: string
  titulo: string
  contenido: string
  imagen_url: string | null
  publicada: boolean
  created_at: string
  autor: {
    full_name: string | null
    email: string
  } | null
}

async function getNoticias(): Promise<Noticia[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('noticias')
    .select(`
      id, titulo, contenido, imagen_url, publicada, created_at,
      autor:users!autor_id(full_name, email)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return data || []
}

async function getStats() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: total } = await (supabase as any)
    .from('noticias')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: publicadas } = await (supabase as any)
    .from('noticias')
    .select('*', { count: 'exact', head: true })
    .eq('publicada', true)
    .is('deleted_at', null)

  return {
    total: total || 0,
    publicadas: publicadas || 0,
    borradores: (total || 0) - (publicadas || 0),
  }
}

export default async function NoticiasAdminPage() {
  const noticias = await getNoticias()
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
          <h1 className="text-2xl font-bold tracking-tight">📰 Noticias</h1>
          <p className="text-muted-foreground">
            Gestiona las publicaciones del blog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/noticias/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva noticia
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Publicadas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.publicadas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Borradores</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.borradores}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de noticias */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las noticias</CardTitle>
        </CardHeader>
        <CardContent>
          {noticias.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay noticias aún</p>
              <Button asChild className="mt-4">
                <Link href="/admin/noticias/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear la primera noticia
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {noticias.map((noticia) => (
                <div
                  key={noticia.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{noticia.titulo}</h3>
                      <Badge
                        variant={noticia.publicada ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {noticia.publicada ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Publicada
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Borrador
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {noticia.contenido
                        .replace(/^\[(\w+)\]\s*/i, '')
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 100)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por {noticia.autor?.full_name || noticia.autor?.email} • {formatDistanceToNow(new Date(noticia.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/noticias/${noticia.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/blog/${noticia.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
