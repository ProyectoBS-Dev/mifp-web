'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Apunte } from '@/types/apuntes'

export function useApuntes() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['apuntes'],
    queryFn: async (): Promise<Apunte[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('apuntes')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      if (error) {
        console.error('Error fetching apuntes:', error)
        return []
      }

      return data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useCreateApunte() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: Partial<Apunte>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Obtener el siguiente orden
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: last } = await (supabase as any)
        .from('apuntes')
        .select('orden')
        .eq('user_id', user.id)
        .order('orden', { ascending: false })
        .limit(1)
        .single()

      const nextOrden = (last?.orden ?? 0) + 1

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('apuntes').insert({
        user_id: user.id,
        titulo: data.titulo || null,
        contenido: data.contenido || '',
        color: data.color || '#FBBF24',
        orden: nextOrden,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apuntes'] })
    },
  })
}

export function useUpdateApunte() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Apunte> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('apuntes')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apuntes'] })
    },
  })
}

export function useDeleteApunte() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('apuntes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apuntes'] })
    },
  })
}
