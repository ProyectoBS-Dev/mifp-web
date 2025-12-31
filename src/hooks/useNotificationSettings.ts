import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { NotificationSettings } from '@/types/notifications'

const DEFAULT_SETTINGS: NotificationSettings = {
  pac_vencimiento: true,
  vt_recordatorio: true,
  noticia_nueva: true,
  sistema: false,
  gd_subida: true,
}

/**
 * Hook para obtener y actualizar las preferencias de notificaciones del usuario
 * 
 * Las preferencias se guardan en el campo `notification_settings` de la tabla `users`
 * y se utilizan para:
 * 1. Filtrar qué notificaciones se generan para el usuario (en triggers SQL)
 * 2. Mostrar los switches activados/desactivados en el SettingsPanel
 */
export function useNotificationSettings() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async (): Promise<NotificationSettings> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return DEFAULT_SETTINGS
      
      const { data, error } = await supabase
        .from('users')
        .select('notification_settings')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching notification settings:', error)
        return DEFAULT_SETTINGS
      }
      
      // Merge con defaults para asegurar que todas las keys existen
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settings = (data as any)?.notification_settings as Partial<NotificationSettings> | null
      return {
        ...DEFAULT_SETTINGS,
        ...(settings || {}),
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
  
  const mutation = useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')
      
      // Obtener settings actuales y mergear
      const current = query.data || DEFAULT_SETTINGS
      const newSettings = { ...current, ...settings }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('users')
        .update({ notification_settings: newSettings })
        .eq('id', user.id)
      
      if (error) throw error
      return newSettings
    },
    onMutate: async (newSettings) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification-settings'] })
      
      const previousSettings = queryClient.getQueryData<NotificationSettings>(['notification-settings'])
      
      queryClient.setQueryData<NotificationSettings>(['notification-settings'], (old) => ({
        ...DEFAULT_SETTINGS,
        ...old,
        ...newSettings,
      }))
      
      return { previousSettings }
    },
    onError: (_err, _newSettings, context) => {
      // Rollback on error
      queryClient.setQueryData(['notification-settings'], context?.previousSettings)
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(['notification-settings'], newSettings)
    },
  })
  
  return {
    settings: query.data || DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    isError: query.isError,
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending,
  }
}

