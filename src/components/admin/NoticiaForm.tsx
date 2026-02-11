'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { slugify, normalizeSlug } from '@/lib/slugify'
import { useCsrfToken } from '@/hooks/useCsrfToken'

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
  const { csrfHeaders } = useCsrfToken()

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
  const [slug, setSlug] = useState(noticia?.slug || '')
  const [slugTouched, setSlugTouched] = useState(!!noticia?.slug) // Si está editando, el slug ya fue definido
  const [contenido, setContenido] = useState(cleanContenido(noticia?.contenido || ''))
  const [categoria, setCategoria] = useState(extractCategoria(noticia?.contenido || ''))
  const [imagenUrl, setImagenUrl] = useState<string | null>(noticia?.imagen_url || null)
  const [publicada, setPublicada] = useState(noticia?.publicada ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [orphanedImages, setOrphanedImages] = useState<string[]>([]) // URLs de imágenes huérfanas a borrar
  const [formError, setFormError] = useState<string | null>(null) // Errores del formulario

  // Auto-generar slug desde título (solo si el usuario no lo ha editado manualmente)
  useEffect(() => {
    if (!slugTouched && titulo) {
      setSlug(slugify(titulo))
    }
  }, [titulo, slugTouched])

  // Handler para cuando el usuario edita el slug manualmente
  const handleSlugChange = useCallback((value: string) => {
    setSlugTouched(true)
    setSlug(normalizeSlug(value))
  }, [])

  // Regenerar slug desde título
  const handleRegenerateSlug = useCallback(() => {
    setSlug(slugify(titulo))
    setSlugTouched(true)
  }, [titulo])

  // ✅ Handler para cuando se elimina/cambia una imagen antes de guardar
  const handlePreviousImageDelete = useCallback((imageUrl: string) => {
    // Solo agregar si no es la imagen original de la noticia (en caso de edición)
    if (!isEditing || imageUrl !== noticia?.imagen_url) {
      setOrphanedImages(prev => [...prev, imageUrl])
    }
  }, [isEditing, noticia?.imagen_url])

  // ✅ Función para borrar imágenes huérfanas del storage
  const deleteOrphanedImages = async (imageUrls: string[]) => {
    if (imageUrls.length === 0) return

    try {
      await Promise.all(
        imageUrls.map(async (url) => {
          const response = await fetch('/api/admin/noticias/delete-image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders },
            body: JSON.stringify({ imageUrl: url }),
          })
          
          if (!response.ok) {
            console.warn(`Failed to delete orphaned image: ${url}`)
          }
        })
      )
    } catch (error) {
      console.error('Error deleting orphaned images:', error)
      // No fallar el guardado de la noticia por esto
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null) // Limpiar error previo
    
    if (!titulo.trim()) {
      setFormError('El título es obligatorio')
      return
    }

    if (titulo.trim().length < 5) {
      setFormError('El título debe tener al menos 5 caracteres')
      return
    }

    if (!slug.trim()) {
      setFormError('El slug (URL) es obligatorio')
      return
    }

    if (slug.trim().length < 3) {
      setFormError('El slug debe tener al menos 3 caracteres')
      return
    }
    
    // Calcular longitud real del contenido (sin HTML y sin categoría)
    const contenidoTexto = contenido.replace(/<[^>]*>/g, '').trim()
    if (!contenidoTexto || contenidoTexto.length < 10) {
      setFormError('El contenido es demasiado corto (mínimo 10 caracteres de texto)')
      return
    }

    setIsSubmitting(true)

    try {
      // ✅ Primero borrar imágenes huérfanas acumuladas
      await deleteOrphanedImages(orphanedImages)

      // Añadir categoría al inicio del contenido
      const contenidoConCategoria = `[${categoria.toUpperCase()}]\n\n${contenido}`

      if (isEditing && noticia) {
        await updateNoticia.mutateAsync({
          id: noticia.id,
          titulo,
          slug,
          contenido: contenidoConCategoria,
          imagen_url: imagenUrl,
          publicada,
        })
      } else {
        await createNoticia.mutateAsync({
          titulo,
          slug,
          contenido: contenidoConCategoria,
          imagen_url: imagenUrl,
          publicada,
        })
      }

      router.push('/admin/noticias')
      router.refresh()
    } catch (error) {
      console.error('Error saving noticia:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la noticia'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!noticia) return
    setIsDeleting(true)
    setFormError(null)

    try {
      await deleteNoticia.mutateAsync(noticia.id)
      router.push('/admin/noticias')
      router.refresh()
    } catch (error) {
      console.error('Error deleting noticia:', error)
      setFormError(error instanceof Error ? error.message : 'Error al eliminar la noticia')
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

          {/* Slug (URL) */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL del artículo *</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  /blog/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="url-del-articulo"
                  className="pl-14"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerateSlug}
                title="Regenerar desde título"
              >
                🔄
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL final: <code className="bg-muted px-1 py-0.5 rounded">/blog/{slug || 'url-del-articulo'}</code>
            </p>
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
            onPreviousImageDelete={handlePreviousImageDelete}
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

      {/* Mensaje de error */}
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

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
