'use client'

import { useRouter } from 'next/navigation'
import { X, ExternalLink, ArrowRight, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import { useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications'
import { NOTIFICATION_CONFIG, type Notification } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void // Cerrar el popover después de acción
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter()
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: deleteNotification } = useDeleteNotification()

  const config = NOTIFICATION_CONFIG[notification.tipo]

  const handleClick = () => {
    if (!notification.leida) {
      markAsRead(notification.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notification.id)
  }

  // Determinar si mostrar botón de "Unirse a VT"
  const showVTAction = notification.tipo === 'vt_recordatorio' && notification.data?.zoom_link

  // Determinar si mostrar botón "Leer más" para noticias
  const showNoticiaAction = notification.tipo === 'noticia_nueva' && notification.data?.noticia_id

  const handleJoinVT = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.data?.zoom_link) {
      window.open(notification.data.zoom_link, '_blank')
      if (!notification.leida) {
        markAsRead(notification.id)
      }
      onClose?.()
    }
  }

  const handleReadNoticia = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Si ya tiene el slug, usarlo directamente
    if (notification.data?.noticia_slug) {
      if (!notification.leida) {
        markAsRead(notification.id)
      }
      onClose?.()
      router.push(`/blog/${notification.data.noticia_slug}`)
      return
    }
    
    // Si solo tiene noticia_id, consultar el slug desde la base de datos
    if (notification.data?.noticia_id) {
      try {
        const response = await fetch(`/api/noticias/${notification.data.noticia_id}/slug`)
        if (response.ok) {
          const { slug } = await response.json()
          if (slug) {
            if (!notification.leida) {
              markAsRead(notification.id)
            }
            onClose?.()
            router.push(`/blog/${slug}`)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching noticia slug:', error)
      }
      // Fallback: ir al blog principal si no se puede resolver
      onClose?.()
      router.push('/blog')
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        notification.leida
          ? 'bg-transparent hover:bg-muted/50'
          : 'bg-primary/5 hover:bg-primary/10'
      )}
    >
      {/* Indicador de no leída */}
      {!notification.leida && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}

      {/* Icono del tipo */}
      <config.icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.color)} />

      {/* Contenido */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn(
          'text-sm leading-tight',
          notification.leida ? 'font-normal' : 'font-medium'
        )}>
          {notification.titulo}
        </p>

        {notification.mensaje && (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {notification.mensaje}
          </p>
        )}

        {/* Info adicional según tipo */}
        {notification.tipo === 'pac_vencimiento' && notification.data?.asignatura_nombre && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            {notification.data.asignatura_nombre}
          </p>
        )}



        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(notification.created_at)}
          </span>

          {/* Acción de Unirse a VT */}
          {showVTAction && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2 gap-1"
              onClick={handleJoinVT}
            >
              <ExternalLink className="h-3 w-3" />
              Unirse
            </Button>
          )}

          {/* Acción de Leer noticia */}
          {showNoticiaAction && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2 gap-1"
              onClick={handleReadNoticia}
            >
              Leer más
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Botón eliminar (visible en hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
        onClick={handleDelete}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Eliminar notificación</span>
      </Button>
    </div>
  )
}

