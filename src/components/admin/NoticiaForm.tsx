'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useNoticiasMutation, type Noticia } from '@/hooks/useNoticias'
import { ImageDropzone } from './ImageDropzone'
import { RichTextEditor } from './RichTextEditor'

const CATEGORIAS = [
  { value: 'comunicado', label: '📢 Comunicado' },
  { value: 'recurso', label: '📚 Recurso' },
  { value: 'evento', label: '📅 Evento' },
  { value: 'general', label: '📰 General' },
]

interface NoticiaFormProps {
  noticia?: Noticia
  isEditing?: boolean
}

export function NoticiaForm({ noticia, isEditing = false }: NoticiaFormProps) {
  const router = useRouter()
  const { createNoticia, updateNoticia, deleteNoticia } = useNoticiasMutation()

  // Extraer categoría del contenido si existe
  const extractCategoria = (contenido: string) => {
    const match = contenido?.match(/^\[(\w+)\]/i)
    return match ? match[1].toLowerCase() : 'general'
  }

  // Limpiar contenido de categoría y convertir markdown a HTML si es necesario
  const cleanContenido = (contenido: string) => {
    let clean = contenido?.replace(/^\[(\w+)\]\s*/i, '') || ''
    // Si el contenido parece markdown (no tiene tags HTML), dejarlo como está
    // El editor puede manejar texto plano
    if (!clean.includes('<')) {
      // Convertir markdown básico a HTML
      clean = clean
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
      if (!clean.startsWith('<')) {
        clean = '<p>' + clean + '</p>'
      }
    }
    return clean
  }

  const [titulo, setTitulo] = useState(noticia?.titulo || '')
  const [contenido, setContenido] = useState(cleanContenido(noticia?.contenido || ''))
  const [categoria, setCategoria] = useState(extractCategoria(noticia?.contenido || ''))
  const [imagenUrl, setImagenUrl] = useState<string | null>(noticia?.imagen_url || null)
  const [publicada, setPublicada] = useState(noticia?.publicada ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!titulo.trim()) {
      alert('El título es obligatorio')
      return
    }
    
    if (!contenido.trim() || contenido === '<p></p>') {
      alert('El contenido es obligatorio')
      return
    }

    setIsSubmitting(true)

    try {
      // Añadir categoría al inicio del contenido
      const contenidoConCategoria = `[${categoria.toUpperCase()}]\n\n${contenido}`

      if (isEditing && noticia) {
        await updateNoticia.mutateAsync({
          id: noticia.id,
          titulo,
          contenido: contenidoConCategoria,
          imagen_url: imagenUrl || undefined,
          publicada,
        })
      } else {
        await createNoticia.mutateAsync({
          titulo,
          contenido: contenidoConCategoria,
          imagen_url: imagenUrl || undefined,
          publicada,
        })
      }

      router.push('/admin/noticias')
      router.refresh()
    } catch (error) {
      console.error('Error saving noticia:', error)
      alert('Error al guardar la noticia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!noticia) return
    setIsDeleting(true)

    try {
      await deleteNoticia.mutateAsync(noticia.id)
      router.push('/admin/noticias')
      router.refresh()
    } catch (error) {
      console.error('Error deleting noticia:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la noticia')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contenido</CardTitle>
          <CardDescription>
            Información principal de la noticia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Escribe un título llamativo..."
              required
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contenido con Editor WYSIWYG */}
          <div className="space-y-2">
            <Label>Contenido *</Label>
            <RichTextEditor
              value={contenido}
              onChange={setContenido}
              placeholder="Escribe el contenido de la noticia..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagen destacada</CardTitle>
          <CardDescription>
            Sube una imagen para la noticia (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageDropzone
            value={imagenUrl || undefined}
            onChange={setImagenUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publicación</CardTitle>
          <CardDescription>
            Opciones de visibilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="publicada">Publicar ahora</Label>
              <p className="text-sm text-muted-foreground">
                {publicada 
                  ? 'La noticia será visible para todos los usuarios' 
                  : 'La noticia se guardará como borrador'}
              </p>
            </div>
            <Switch
              id="publicada"
              checked={publicada}
              onCheckedChange={setPublicada}
            />
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <div>
          {isEditing && noticia && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar noticia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La noticia será eliminada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/admin/noticias')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Guardar cambios' : 'Crear noticia'}
          </Button>
        </div>
      </div>
    </form>
  )
}
