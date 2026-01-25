'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Apunte } from '@/types/apuntes'

// Hook para obtener notas activas (no archivadas)
export function useApuntes(includeArchived = false) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['apuntes', { includeArchived }],
    queryFn: async (): Promise<Apunte[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      let query = supabase
        .from('apuntes')
        .select('*')
        .eq('user_id', user.id)

      // Filtrar archivadas si no se incluyen
      if (!includeArchived) {
        query = query.or('archived.is.null,archived.eq.false')
      }

      const { data, error } = await query
        .order('pinned', { ascending: false, nullsFirst: false })
        .order('orden', { ascending: true })

      if (error) {
        console.error('Error fetching apuntes:', error)
        return []
      }

      // Mapear nulls a undefined para coincidir con tipo Apunte
      return (data || []).map(item => ({
        ...item,
        titulo: item.titulo ?? undefined,
        color: item.color ?? '#FBBF24',
        orden: item.orden ?? 0,
        pinned: item.pinned ?? undefined,
        archived: item.archived ?? undefined,
        created_at: item.created_at ?? new Date().toISOString(),
        updated_at: item.updated_at ?? new Date().toISOString(),
      }))
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
      const { data: last } = await supabase
        .from('apuntes')
        .select('orden')
        .eq('user_id', user.id)
        .order('orden', { ascending: false })
        .limit(1)
        .single()

      const nextOrden = (last?.orden ?? 0) + 1

      const { error } = await supabase.from('apuntes').insert({
        user_id: user.id,
        titulo: data.titulo || null,
        contenido: data.contenido || '',
        color: data.color || '#FBBF24',
        orden: nextOrden,
        pinned: data.pinned || false,
        archived: false,
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
      const { error } = await supabase
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
      const { error } = await supabase
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
