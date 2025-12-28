'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

// Schema de validación
const enlaceSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  url: z.string().url('Introduce una URL válida'),
  descripcion: z.string().optional(),
  asignatura_id: z.string().optional(),
})

type EnlaceFormData = z.infer<typeof enlaceSchema>

interface Asignatura {
  id: string
  nombre: string
  codigo: string
}

interface EnlaceFormProps {
  recurso?: {
    id: string
    titulo: string
    descripcion: string | null
    url: string | null
    asignatura_id: string | null
  }
  mode: 'create' | 'edit'
}

export function EnlaceForm({ recurso, mode }: EnlaceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(recurso?.url || null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EnlaceFormData>({
    resolver: zodResolver(enlaceSchema),
    defaultValues: {
      titulo: recurso?.titulo || '',
      url: recurso?.url || '',
      descripcion: recurso?.descripcion || '',
      asignatura_id: recurso?.asignatura_id || undefined,
    },
  })

  const watchUrl = watch('url')

  // Cargar asignaturas
  useEffect(() => {
    async function loadAsignaturas() {
      const supabase = createClient()
      const { data } = await supabase
        .from('asignaturas')
        .select('id, nombre, codigo')
        .is('deleted_at', null)
        .order('nombre')

      if (data) {
        setAsignaturas(data)
      }
    }

    loadAsignaturas()
  }, [])

  // Actualizar preview de URL
  useEffect(() => {
    if (watchUrl) {
      try {
        new URL(watchUrl)
        setPreviewUrl(watchUrl)
      } catch {
        setPreviewUrl(null)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [watchUrl])

  const onSubmit = async (data: EnlaceFormData) => {
    setIsSubmitting(true)

    try {
      const url = mode === 'create' 
        ? '/api/recursos' 
        : `/api/recursos/${recurso?.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const body = {
        tipo: 'enlace',
        titulo: data.titulo,
        url: data.url,
        descripcion: data.descripcion || null,
        asignatura_id: data.asignatura_id || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error guardando recurso')
      }

      router.push('/admin/recursos')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error guardando el recurso')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-500" />
            Información del Enlace
          </CardTitle>
          <CardDescription>
            Completa los datos del enlace que quieres añadir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Ej: Tutorial de SQL Joins"
              {...register('titulo')}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">
              URL <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://ejemplo.com/tutorial"
                className="flex-1"
                {...register('url')}
              />
              {previewUrl && (
                <Button type="button" variant="outline" size="icon" asChild>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
            {previewUrl && (
              <p className="text-xs text-muted-foreground">
                🌐 {new URL(previewUrl).hostname}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Breve descripción del contenido del enlace..."
              rows={3}
              {...register('descripcion')}
            />
          </div>

          {/* Asignatura */}
          <div className="space-y-2">
            <Label>Asignatura (opcional)</Label>
            <Select
              value={watch('asignatura_id') || '__none__'}
              onValueChange={(value) => setValue('asignatura_id', value === '__none__' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una asignatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin asignatura</SelectItem>
                {asignaturas.map((asig) => (
                  <SelectItem key={asig.id} value={asig.id}>
                    {asig.codigo} - {asig.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Asocia el enlace a una asignatura específica
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear enlace'
          ) : (
            'Guardar cambios'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

