'use client'

import { Clock, Heart, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  titulo: string
  extracto: string
  fecha: string
  reacciones: number
  comentarios: number
  destacada: boolean
}

function NewsCard({ news }: { news: NewsItem }) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
        news.destacada && 'border-vt-green/50 bg-vt-green/5'
      )}
    >
      {news.destacada && (
        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-vt-green/20 text-vt-green rounded-full mb-2">
          Destacada
        </span>
      )}
      <h4 className="text-sm font-semibold line-clamp-1">{news.titulo}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
        {news.extracto}
      </p>
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {news.fecha}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {news.reacciones}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {news.comentarios}
        </span>
      </div>
    </div>
  )
}

export function NewsWidget() {
  // TODO: Conectar con datos reales de Supabase (noticias tabla)
  const news: NewsItem[] = [
    {
      id: '1',
      titulo: 'Nuevas fechas de exámenes publicadas',
      extracto:
        'Se han actualizado las fechas para los exámenes del primer semestre. Revisa el calendario.',
      fecha: '19 Dic',
      reacciones: 24,
      comentarios: 5,
      destacada: true,
    },
    {
      id: '2',
      titulo: 'Recursos actualizados de Programación',
      extracto:
        'Se han añadido nuevos PDFs y ejercicios para el tema 5 de Programación.',
      fecha: '18 Dic',
      reacciones: 12,
      comentarios: 2,
      destacada: false,
    },
    {
      id: '3',
      titulo: 'Consejos para aprobar Base de Datos',
      extracto:
        'Un profesor comparte tips y recomendaciones para el examen de BBDD.',
      fecha: '15 Dic',
      reacciones: 45,
      comentarios: 8,
      destacada: false,
    },
  ]

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No hay novedades</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  )
}
