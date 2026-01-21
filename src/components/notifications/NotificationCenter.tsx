'use client'

import { useState } from 'react'
import { Check, Loader2, Bell, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { 
  useGroupedNotifications, 
  useMarkAllAsRead,
  NOTIFICATION_CONFIG 
} from '@/hooks/useNotifications'
import { NotificationItem } from './NotificationItem'
import type { NotificationFilter as FilterType } from '@/types/notifications'

interface NotificationCenterProps {
  onClose?: () => void
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pac_vencimiento', label: '📋 PACs' },
  { value: 'vt_recordatorio', label: '📹 VTs' },
  { value: 'noticia_nueva', label: '📰 Noticias' },
  { value: 'sistema', label: '⚙️ Sistema' },
  { value: 'gd_subida', label: '📤 GDs' },
]

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const { grouped, notifications, isLoading, isError } = useGroupedNotifications(filter)
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()
  
  const unreadCount = notifications?.filter(n => !n.leida).length ?? 0
  const hasNotifications = notifications && notifications.length > 0
  
  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }
  
  return (
    <div className="flex flex-col w-80 max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Toggle filtros */}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', showFilters && 'bg-muted')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only">Filtros</span>
          </Button>
          
          {/* Marcar todas como leídas */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Leer todas
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtros (colapsable) */}
      {showFilters && (
        <div className="p-2 border-b bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'ghost'}
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Lista de notificaciones */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Error al cargar notificaciones
          </div>
        ) : !hasNotifications ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="p-2">
            {/* Vista agrupada */}
            {grouped.map((group, groupIndex) => (
              <div key={group.tipo}>
                {groupIndex > 0 && <Separator className="my-2" />}
                
                {/* Header del grupo (solo si hay más de un tipo) */}
                {filter === 'all' && grouped.length > 1 && (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                    <span>{group.icon}</span>
                    <span className="font-medium">{group.label}</span>
                    <span className="text-muted-foreground">({group.count})</span>
                  </div>
                )}
                
                {/* Notificaciones del grupo */}
                <div className="space-y-1">
                  {/* Agrupar notificaciones similares */}
                  {renderGroupedNotifications(group.notifications, onClose)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para estado vacío
function EmptyState({ filter }: { filter: FilterType }) {
  const filterLabel = filter === 'all' 
    ? 'notificaciones' 
    : FILTER_OPTIONS.find(f => f.value === filter)?.label.toLowerCase() || 'notificaciones'
  
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="text-4xl mb-3">🔔</div>
      <p className="text-sm text-muted-foreground">
        No tienes {filterLabel} pendientes
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Te avisaremos cuando haya algo nuevo
      </p>
    </div>
  )
}

/**
 * Agrupa notificaciones similares (mismo tipo y asignatura)
 * Si hay más de 3 del mismo tipo, muestra un resumen
 */
function renderGroupedNotifications(
  notifications: import('@/types/notifications').Notification[],
  onClose?: () => void
) {
  // Si hay pocas notificaciones, mostrarlas todas
  if (notifications.length <= 3) {
    return notifications.map(notification => (
      <NotificationItem 
        key={notification.id} 
        notification={notification}
        onClose={onClose}
      />
    ))
  }
  
  // Agrupar por asignatura (si aplica)
  const byAsignatura = new Map<string, typeof notifications>()
  const noAsignatura: typeof notifications = []
  
  for (const n of notifications) {
    const asignaturaId = n.data?.asignatura_nombre || 'sin-asignatura'
    if (n.data?.asignatura_nombre) {
      const existing = byAsignatura.get(asignaturaId) || []
      existing.push(n)
      byAsignatura.set(asignaturaId, existing)
    } else {
      noAsignatura.push(n)
    }
  }
  
  const result: React.ReactNode[] = []
  
  // Mostrar agrupados por asignatura
  byAsignatura.forEach((items, key) => {
    if (items.length > 2) {
      // Mostrar resumen agrupado
      result.push(
        <GroupedSummary 
          key={`group-${key}`}
          notifications={items}
          onClose={onClose}
        />
      )
    } else {
      // Mostrar individualmente
      items.forEach(n => {
        result.push(
          <NotificationItem 
            key={n.id} 
            notification={n}
            onClose={onClose}
          />
        )
      })
    }
  })
  
  // Mostrar las que no tienen asignatura
  noAsignatura.forEach(n => {
    result.push(
      <NotificationItem 
        key={n.id} 
        notification={n}
        onClose={onClose}
      />
    )
  })
  
  return result
}

// Componente para mostrar un resumen agrupado
function GroupedSummary({ 
  notifications,
  onClose 
}: { 
  notifications: import('@/types/notifications').Notification[]
  onClose?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const tipo = notifications[0].tipo
  const config = NOTIFICATION_CONFIG[tipo]
  const asignatura = notifications[0].data?.asignatura_nombre
  const unreadCount = notifications.filter(n => !n.leida).length
  
  if (expanded) {
    return (
      <div className="space-y-1">
        <button 
          onClick={() => setExpanded(false)}
          className="text-xs text-primary hover:underline px-2 py-1"
        >
          ← Colapsar
        </button>
        {notifications.map(n => (
          <NotificationItem 
            key={n.id} 
            notification={n}
            onClose={onClose}
          />
        ))}
      </div>
    )
  }
  
  return (
    <button
      onClick={() => setExpanded(true)}
      className={cn(
        'w-full flex gap-3 p-3 rounded-lg text-left transition-colors',
        unreadCount > 0 
          ? 'bg-primary/5 hover:bg-primary/10' 
          : 'hover:bg-muted/50'
      )}
    >
      <span className="text-xl">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {notifications.length} {config.label.toLowerCase()} pendientes
        </p>
        {asignatura && (
          <p className="text-xs text-muted-foreground">
            📁 {asignatura}
          </p>
        )}
        {unreadCount > 0 && (
          <p className="text-xs text-primary mt-1">
            {unreadCount} sin leer
          </p>
        )}
      </div>
    </button>
  )
}

