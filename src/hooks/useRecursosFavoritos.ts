// ============================================
// 📚 Hook useRecursosFavoritos
// ============================================
// Gestiona recursos favoritos del usuario con React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Recurso } from '@/types/recursos'

interface FavoritoRecurso extends Recurso {
  favorito_id: string
  favorito_created_at: string
}

/**
 * Hook para obtener recursos favoritos del usuario
 */
export function useRecursosFavoritos() {
  return useQuery({
    queryKey: ['recursos-favoritos'],
    queryFn: async (): Promise<FavoritoRecurso[]> => {
      const res = await fetch('/api/user/favoritos')
      
      if (!res.ok) {
        throw new Error('Error fetching favoritos')
      }
      
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para gestionar acciones de favoritos (agregar/eliminar)
 */
export function useRecursosFavoritosMutations() {
  const queryClient = useQueryClient()

  // Agregar a favoritos
  const addFavorito = useMutation({
    mutationFn: async (recurso_id: string) => {
      const res = await fetch('/api/user/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurso_id })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error agregando a favoritos')
      }

      return res.json()
    },
    onSuccess: () => {
      // Invalidar cache para refrescar lista
      queryClient.invalidateQueries({ queryKey: ['recursos-favoritos'] })
      queryClient.invalidateQueries({ queryKey: ['recursos'] })
    }
  })

  // Eliminar de favoritos
  const removeFavorito = useMutation({
    mutationFn: async (recurso_id: string) => {
      const res = await fetch(`/api/user/favoritos?recurso_id=${recurso_id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Error eliminando de favoritos')
      }

      return res.json()
    },
    onSuccess: () => {
      // Invalidar cache para refrescar lista
      queryClient.invalidateQueries({ queryKey: ['recursos-favoritos'] })
      queryClient.invalidateQueries({ queryKey: ['recursos'] })
    }
  })

  // Toggle favorito (agregar si no existe, eliminar si existe)
  const toggleFavorito = useMutation({
    mutationFn: async ({ recurso_id, isFavorito }: { recurso_id: string; isFavorito: boolean }) => {
      if (isFavorito) {
        return removeFavorito.mutateAsync(recurso_id)
      } else {
        return addFavorito.mutateAsync(recurso_id)
      }
    },
    onMutate: async ({ recurso_id, isFavorito }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['recursos-favoritos'] })

      // Snapshot del estado anterior
      const previousFavoritos = queryClient.getQueryData(['recursos-favoritos'])

      // Optimistic update
      queryClient.setQueryData<FavoritoRecurso[]>(['recursos-favoritos'], (old) => {
        if (!old) return old

        if (isFavorito) {
          // Eliminar de la lista
          return old.filter(f => f.id !== recurso_id)
        } else {
          // No podemos agregarlo optimísticamente porque necesitaríamos el recurso completo
          // Solo lo hacemos en onSuccess
          return old
        }
      })

      return { previousFavoritos }
    },
    onError: (_err, _variables, context) => {
      // Rollback en caso de error
      if (context?.previousFavoritos) {
        queryClient.setQueryData(['recursos-favoritos'], context.previousFavoritos)
      }
    },
    onSuccess: () => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['recursos-favoritos'] })
      queryClient.invalidateQueries({ queryKey: ['recursos'] })
    }
  })

  return {
    addFavorito: addFavorito.mutate,
    removeFavorito: removeFavorito.mutate,
    toggleFavorito: toggleFavorito.mutate,
    isAddingFavorito: addFavorito.isPending,
    isRemovingFavorito: removeFavorito.isPending,
    isTogglingFavorito: toggleFavorito.isPending
  }
}

/**
 * Hook para verificar si un recurso está en favoritos
 */
export function useIsFavorito(recurso_id: string): boolean {
  const { data: favoritos = [] } = useRecursosFavoritos()
  return favoritos.some(f => f.id === recurso_id)
}
