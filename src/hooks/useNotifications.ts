import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Notification, NotificationFilter, GroupedNotifications } from '@/types/notifications'
import { NOTIFICATION_CONFIG } from '@/types/notifications'

const REFETCH_INTERVAL = 10 * 60 * 1000 // 10 minutos en milisegundos

/**
 * Hook principal para obtener notificaciones del usuario
 * Usa polling cada 10 minutos (configurable)
 * 
 * Para cambiar el intervalo de refetch:
 * - Modificar REFETCH_INTERVAL arriba
 * - O pasar opciones al hook: useNotifications({ refetchInterval: 5 * 60 * 1000 })
 */
export function useNotifications(options?: { refetchInterval?: number }) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) // Limitar a las últimas 50
      
      if (error) {
        console.error('Error fetching notifications:', error)
        throw error
      }
      
      return (data || []) as Notification[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar stale
    refetchInterval: options?.refetchInterval ?? REFETCH_INTERVAL,
    refetchOnWindowFocus: true, // Refetch cuando el usuario vuelve a la pestaña
  })
}

/**
 * Hook para obtener el contador de notificaciones no leídas
 */
export function useUnreadCount() {
  const { data: notifications } = useNotifications()
  return notifications?.filter(n => !n.leida).length ?? 0
}

/**
 * Hook para obtener notificaciones agrupadas por tipo
 */
export function useGroupedNotifications(filter: NotificationFilter = 'all') {
  const { data: notifications, ...rest } = useNotifications()
  
  const filtered = filter === 'all' 
    ? notifications 
    : notifications?.filter(n => n.tipo === filter)
  
  // Agrupar por tipo
  const grouped: GroupedNotifications[] = []
  const types = ['pac_vencimiento', 'vt_recordatorio', 'noticia_nueva', 'sistema', 'gd_subida'] as const
  
  for (const tipo of types) {
    const typeNotifications = filtered?.filter(n => n.tipo === tipo) || []
    if (typeNotifications.length > 0) {
      const config = NOTIFICATION_CONFIG[tipo]
      grouped.push({
        tipo,
        label: config.label,
        icon: config.icon,
        count: typeNotifications.length,
        notifications: typeNotifications,
      })
    }
  }
  
  return { grouped, notifications: filtered, ...rest }
}

/**
 * Hook para marcar una notificación como leída
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onMutate: async (notificationId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(['notifications'], 
          previousNotifications.map(n => n.id === notificationId ? { ...n, leida: true } : n)
        )
      }
      
      return { previousNotifications }
    },
    onError: (_err, _notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    },
  })
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user.id)
        .eq('leida', false)
      
      if (error) throw error
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(['notifications'], 
          previousNotifications.map(n => ({ ...n, leida: true }))
        )
      }
      
      return { previousNotifications }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    },
  })
}

/**
 * Hook para eliminar una notificación
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])
      
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.filter(n => n.id !== notificationId)
      )
      
      return { previousNotifications }
    },
    onError: (_err, _notificationId, context) => {
      queryClient.setQueryData(['notifications'], context?.previousNotifications)
    },
  })
}

// Re-exportar NOTIFICATION_CONFIG para uso en componentes
export { NOTIFICATION_CONFIG } from '@/types/notifications'

