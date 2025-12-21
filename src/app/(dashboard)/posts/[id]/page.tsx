import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Heart, Eye, Share2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Mock data - TODO: Conectar con Supabase
const MOCK_POSTS = [
  {
    id: '1',
    titulo: 'Nuevas fechas de exámenes publicadas',
    contenido: `Se han actualizado las fechas para los exámenes del primer semestre. Por favor, revisa el calendario académico y asegúrate de tener todas las fechas marcadas.

## Fechas importantes

- **Programación**: 15 de Enero de 2026
- **Base de Datos**: 17 de Enero de 2026
- **Entornos de Desarrollo**: 20 de Enero de 2026
- **Sistemas Informáticos**: 22 de Enero de 2026

## Requisitos para la inscripción

Recuerda que debes estar inscrito en cada convocatoria antes del día **10 de Enero**. Para inscribirte:

1. Accede al campus virtual
2. Ve a la sección "Convocatorias"
3. Selecciona las asignaturas que quieres examinar
4. Confirma tu inscripción

## Recomendaciones

- Planifica tu estudio con antelación
- Revisa los materiales de las VTs
- Practica con ejercicios anteriores
- No dejes todo para el último momento

¡Mucho ánimo a todos! 💪`,
    imagen: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    autor: {
      nombre: 'Coordinación Académica',
      username: 'coordinacion',
      avatar: undefined,
    },
    fecha: '2025-12-19',
    categoria: 'comunicado',
    vistas: 124,
    likes: 12,
  },
  {
    id: '2',
    titulo: 'Construyendo un Blog Fullstack con Express y Next.js',
    contenido: `El mundo del desarrollo web está en constante evolución. Descubre cómo crear una aplicación moderna con las últimas tecnologías.

## Introducción

En este tutorial aprenderás a crear un blog fullstack utilizando Express.js para el backend y Next.js para el frontend. Esta combinación te permite tener lo mejor de ambos mundos.

## Stack tecnológico

- **Backend**: Express.js + Node.js
- **Frontend**: Next.js 14 con App Router
- **Base de datos**: PostgreSQL con Prisma
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS

## Configuración del proyecto

Primero, necesitamos configurar nuestro entorno de desarrollo...

## Conclusión

Este stack es perfecto para proyectos medianos y grandes donde necesitas control total sobre tu backend mientras aprovechas las ventajas de Next.js en el frontend.`,
    imagen: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
    autor: {
      nombre: 'Prof. García',
      username: 'profgarcia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Garcia',
    },
    fecha: '2025-12-18',
    categoria: 'recurso',
    vistas: 256,
    likes: 34,
  },
  {
    id: '3',
    titulo: 'De Comercial a Programadora: La Importancia del Enfoque',
    contenido: `Durante toda mi vida, me he dedicado al apasionante mundo de las ventas y la gestión comercial. Ahora comparto mi experiencia de transición al mundo tech.

## Mi historia

Después de 10 años en el sector comercial, decidí dar un giro a mi carrera...

## Lecciones aprendidas

1. **Nunca es tarde para empezar**: A los 35 años empecé desde cero
2. **El enfoque lo es todo**: Dedica tiempo de calidad al estudio
3. **La comunidad importa**: Rodéate de personas con tus mismos objetivos

## Consejos para quienes están empezando

Si estás pensando en hacer una transición similar, aquí van mis recomendaciones...`,
    imagen: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop',
    autor: {
      nombre: 'María López',
      username: 'marialopez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
    fecha: '2025-12-15',
    categoria: 'general',
    vistas: 189,
    likes: 28,
  },
  {
    id: '4',
    titulo: 'Webinar: Preparación para las prácticas de empresa',
    contenido: `¡No te lo pierdas! El próximo miércoles tendremos un webinar especial sobre cómo prepararte para las prácticas de empresa.

## Detalles del evento

- **Fecha**: 27 de Diciembre de 2025
- **Hora**: 18:00h (España)
- **Duración**: 1 hora + Q&A
- **Plataforma**: Zoom (enlace en el campus)

## Ponentes

Contaremos con ex-alumnos que ya están trabajando en el sector:

- **Carlos Ruiz** - Developer en Google
- **Ana Martín** - Frontend en Spotify
- **Luis García** - Fullstack en startup

## Temas a tratar

1. Cómo preparar tu CV técnico
2. Qué esperan las empresas de un junior
3. Experiencias reales en entrevistas
4. Consejos para destacar

¡Inscríbete en el campus virtual!`,
    imagen: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1200&h=600&fit=crop',
    autor: {
      nombre: 'Orientación Laboral',
      username: 'orientacion',
      avatar: undefined,
    },
    fecha: '2025-12-14',
    categoria: 'evento',
    vistas: 156,
    likes: 45,
  },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getAdjacentPosts(currentId: string) {
  const currentIndex = MOCK_POSTS.findIndex((p) => p.id === currentId)
  return {
    prev: currentIndex > 0 ? MOCK_POSTS[currentIndex - 1] : null,
    next: currentIndex < MOCK_POSTS.length - 1 ? MOCK_POSTS[currentIndex + 1] : null,
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params
  const post = MOCK_POSTS.find((p) => p.id === id)
  
  if (!post) {
    return { title: 'Post no encontrado | MiFP' }
  }

  return {
    title: `${post.titulo} | MiFP`,
    description: post.contenido.slice(0, 160),
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const post = MOCK_POSTS.find((p) => p.id === id)

  if (!post) {
    notFound()
  }

  const { prev, next } = getAdjacentPosts(id)

  // Procesar contenido markdown simple
  const processContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, i) => {
        // Headers
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={i} className="text-xl font-bold mt-8 mb-4 pb-2 border-b">
              {paragraph.replace('## ', '')}
            </h2>
          )
        }
        // Lists
        if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter((line) => line.startsWith('- '))
          return (
            <ul key={i} className="list-disc list-inside space-y-1 my-4">
              {items.map((item, j) => (
                <li key={j} className="text-foreground/90">
                  {item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                </li>
              ))}
            </ul>
          )
        }
        // Numbered lists
        if (/^\d+\./.test(paragraph)) {
          const items = paragraph.split('\n').filter((line) => /^\d+\./.test(line))
          return (
            <ol key={i} className="list-decimal list-inside space-y-1 my-4">
              {items.map((item, j) => (
                <li key={j} className="text-foreground/90">
                  {item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                </li>
              ))}
            </ol>
          )
        }
        // Regular paragraph
        return (
          <p key={i} className="text-foreground/90 leading-relaxed my-4">
            {paragraph}
          </p>
        )
      })
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header con fecha y título */}
      <header className="text-center mb-8">
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(post.fecha)}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {post.titulo}
        </h1>
      </header>

      {/* Imagen destacada */}
      {post.imagen && (
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image
            src={post.imagen}
            alt={post.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Layout de dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Autor */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.autor.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.autor.nombre[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.autor.nombre}</p>
              {post.autor.username && (
                <p className="text-sm text-primary">@{post.autor.username}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            {/* Siguiente artículo */}
            {next && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Siguiente artículo
                </p>
                <Link 
                  href={`/posts/${next.id}`}
                  className="text-sm text-primary hover:underline line-clamp-2"
                >
                  {next.titulo}
                </Link>
              </div>
            )}

            {/* Artículo anterior */}
            {prev && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Artículo anterior
                </p>
                <Link 
                  href={`/posts/${prev.id}`}
                  className="text-sm text-primary hover:underline line-clamp-2"
                >
                  {prev.titulo}
                </Link>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Link 
              href="/novedades"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
          </div>

          {/* Stats */}
          <div className="border-t pt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.vistas} vistas
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post.likes} likes
            </span>
          </div>
        </aside>

        {/* Contenido */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {processContent(post.contenido)}
        </article>
      </div>

      {/* Footer con acciones */}
      <footer className="mt-12 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              Me gusta ({post.likes})
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {prev && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/posts/${prev.id}`} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/posts/${next.id}`} className="gap-1">
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
