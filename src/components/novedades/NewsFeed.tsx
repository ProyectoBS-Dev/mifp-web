'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Heart, 
  Eye,
  ArrowRight,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Category = 'comunicado' | 'recurso' | 'evento' | 'general'

interface NewsItem {
  id: string
  titulo: string
  contenido: string
  extracto: string
  imagen?: string
  autor: {
    nombre: string
    avatar?: string
    username?: string
  }
  fecha: string
  categoria: Category
  vistas: number
  likes: number
  userLiked: boolean
}

const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bgColor: string }> = {
  comunicado: { label: 'COMUNICADO', color: 'text-white', bgColor: 'bg-vt-blue' },
  recurso: { label: 'RECURSO', color: 'text-white', bgColor: 'bg-vt-green' },
  evento: { label: 'EVENTO', color: 'text-white', bgColor: 'bg-vt-purple' },
  general: { label: 'GENERAL', color: 'text-white', bgColor: 'bg-vt-gray-dark-2' },
}

// Mock data con imágenes placeholder
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    titulo: 'Nuevas fechas de exámenes publicadas',
    contenido: `Se han actualizado las fechas para los exámenes del primer semestre...`,
    extracto: 'Se han actualizado las fechas para los exámenes del primer semestre. Revisa el calendario y asegúrate de tener todas las fechas marcadas.',
    imagen: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
    autor: {
      nombre: 'Coordinación',
      username: 'coord',
    },
    fecha: '2025-12-19',
    categoria: 'comunicado',
    vistas: 124,
    likes: 12,
    userLiked: false,
  },
  {
    id: '2',
    titulo: 'Construyendo un Blog Fullstack con Express y Next.js',
    contenido: `El mundo del desarrollo web está en constante evolución...`,
    extracto: 'El mundo del desarrollo web está en constante evolución. Descubre cómo crear una aplicación moderna con las últimas tecnologías.',
    imagen: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    autor: {
      nombre: 'Prof. García',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Garcia',
      username: 'profgarcia',
    },
    fecha: '2025-12-18',
    categoria: 'recurso',
    vistas: 256,
    likes: 34,
    userLiked: true,
  },
  {
    id: '3',
    titulo: 'De Comercial a Programadora: La Importancia del Enfoque',
    contenido: `Durante toda mi vida, me he dedicado al apasionante mundo de las ventas...`,
    extracto: 'Durante toda mi vida, me he dedicado al apasionante mundo de las ventas y la gestión comercial. Ahora comparto mi experiencia.',
    imagen: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    autor: {
      nombre: 'María López',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      username: 'marialopez',
    },
    fecha: '2025-12-15',
    categoria: 'general',
    vistas: 189,
    likes: 28,
    userLiked: false,
  },
  {
    id: '4',
    titulo: 'Webinar: Preparación para las prácticas de empresa',
    contenido: `¡No te lo pierdas! El próximo miércoles tendremos un webinar especial...`,
    extracto: 'Webinar sobre preparación para prácticas de empresa el 27 de Diciembre. Inscríbete en el campus virtual.',
    imagen: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&h=400&fit=crop',
    autor: {
      nombre: 'Orientación',
      username: 'orientacion',
    },
    fecha: '2025-12-14',
    categoria: 'evento',
    vistas: 156,
    likes: 45,
    userLiked: false,
  },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface NewsCardProps {
  news: NewsItem
  onLike: (newsId: string) => void
}

function NewsCard({ news, onLike }: NewsCardProps) {
  const category = CATEGORY_CONFIG[news.categoria]

  return (
    <article className="group bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Imagen con categoría */}
      <div className="relative h-48 overflow-hidden">
        {news.imagen ? (
          <Image
            src={news.imagen}
            alt={news.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        
        {/* Badge categoría */}
        <span className={cn(
          'absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide',
          category.bgColor,
          category.color
        )}>
          {category.label}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Autor y fecha */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={news.autor.avatar} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {news.autor.nombre[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {news.autor.nombre}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(news.fecha)}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2 group-hover:underline">
          <Link href={`/posts/${news.id}`}>
            {news.titulo}
          </Link>
        </h3>

        {/* Extracto */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {news.extracto}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Link 
            href={`/posts/${news.id}`}
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Leer más
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {news.vistas}
            </span>
            <button
              onClick={() => onLike(news.id)}
              className={cn(
                'flex items-center gap-1 transition-colors',
                news.userLiked ? 'text-vt-red' : 'hover:text-vt-red'
              )}
            >
              <Heart className={cn('h-4 w-4', news.userLiked && 'fill-current')} />
              {news.likes}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS)
  const [filter, setFilter] = useState<string>('all')

  const handleLike = (newsId: string) => {
    setNews((prev) =>
      prev.map((item) => {
        if (item.id !== newsId) return item
        return {
          ...item,
          likes: item.userLiked ? item.likes - 1 : item.likes + 1,
          userLiked: !item.userLiked,
        }
      })
    )
  }

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter((n) => n.categoria === filter)

  return (
    <div className="space-y-6">
      {/* Header con filtro */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredNews.length} {filteredNews.length === 1 ? 'publicación' : 'publicaciones'}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {filter === 'all' ? 'Todas' : CATEGORY_CONFIG[filter as Category]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('all')}>
              Todas las categorías
            </DropdownMenuItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setFilter(key)}>
                <span className={cn('w-2 h-2 rounded-full mr-2', config.bgColor)} />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <NewsCard
            key={item.id}
            news={item}
            onLike={handleLike}
          />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay publicaciones en esta categoría</p>
        </div>
      )}
    </div>
  )
}
