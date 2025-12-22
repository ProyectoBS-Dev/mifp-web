'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, parseISO, addMinutes } from 'date-fns'
import type { CalendarEvent, CreateEventoInput } from '@/types/calendario'
import { eventColors } from '@/types/calendario'

/**
 * Hook para obtener todos los eventos del calendario del usuario
 * Combina: PACs + VTs del semestre activo + Eventos personales
 */
export function useCalendarEvents(currentDate: Date) {
  const supabase = createClient()
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  return useQuery({
    queryKey: ['calendar-events', monthStart.toISOString()],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const events: CalendarEvent[] = []

      // 1. PACs del usuario (semestre activo)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pacs } = await (supabase as any)
        .from('user_asignatura_pacs')
        .select(`
          id,
          pac:asignatura_pacs(
            id, titulo, fecha_limite,
            asignatura:asignaturas(nombre, codigo)
          ),
          user_asignatura:user_asignaturas!inner(
            semestre:semestres!inner(activo)
          )
        `)
        .eq('user_asignatura.semestre.activo', true)

      pacs?.forEach((item: {
        id: string
        pac: {
          id: string
          titulo: string
          fecha_limite: string
          asignatura: { nombre: string; codigo: string }
        }
      }) => {
        if (!item.pac?.fecha_limite) return
        
        const fecha = parseISO(item.pac.fecha_limite)
        // Filtrar por mes actual
        if (fecha < monthStart || fecha > monthEnd) return

        events.push({
          id: `pac-${item.pac.id}`,
          title: item.pac.titulo,
          start: fecha,
          end: fecha,
          allDay: true,
          type: 'pac',
          color: eventColors.pac,
          asignatura: item.pac.asignatura,
          source: 'pac',
          sourceId: item.pac.id,
        })
      })

      // 2. VTs del usuario (semestre activo)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: vts } = await (supabase as any)
        .from('user_asignatura_vts')
        .select(`
          id,
          vt:asignatura_vts(
            id, titulo, fecha_programada, hora_inicio, duracion_minutos,
            asignatura:asignaturas(nombre, codigo)
          ),
          user_asignatura:user_asignaturas!inner(
            semestre:semestres!inner(activo)
          )
        `)
        .eq('user_asignatura.semestre.activo', true)

      vts?.forEach((item: {
        id: string
        vt: {
          id: string
          titulo: string
          fecha_programada: string
          hora_inicio: string
          duracion_minutos: number
          asignatura: { nombre: string; codigo: string }
        }
      }) => {
        if (!item.vt?.fecha_programada) return
        
        const fecha = parseISO(item.vt.fecha_programada)
        // Filtrar por mes actual
        if (fecha < monthStart || fecha > monthEnd) return

        // Parsear hora_inicio (formato "HH:mm:ss" o "HH:mm")
        const [hours, minutes] = (item.vt.hora_inicio || '19:00').split(':').map(Number)
        const start = new Date(fecha)
        start.setHours(hours, minutes, 0, 0)
        const end = addMinutes(start, item.vt.duracion_minutos || 90)

        events.push({
          id: `vt-${item.vt.id}`,
          title: item.vt.titulo,
          start,
          end,
          allDay: false,
          type: 'vt',
          color: eventColors.vt,
          asignatura: item.vt.asignatura,
          source: 'vt',
          sourceId: item.vt.id,
        })
      })

      // 3. Eventos personales del usuario
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: eventosPersonales } = await (supabase as any)
        .from('eventos_calendario')
        .select(`
          id, titulo, descripcion, tipo, 
          fecha_inicio, fecha_fin, todo_el_dia, color,
          asignatura:asignaturas(nombre, codigo)
        `)
        .eq('user_id', user.id)
        .gte('fecha_inicio', monthStart.toISOString())
        .lte('fecha_inicio', monthEnd.toISOString())

      eventosPersonales?.forEach((evento: {
        id: string
        titulo: string
        descripcion: string | null
        tipo: 'pac' | 'vt' | 'examen' | 'custom'
        fecha_inicio: string
        fecha_fin: string | null
        todo_el_dia: boolean
        color: string | null
        asignatura: { nombre: string; codigo: string } | null
      }) => {
        const start = parseISO(evento.fecha_inicio)
        const end = evento.fecha_fin ? parseISO(evento.fecha_fin) : start

        events.push({
          id: `evento-${evento.id}`,
          title: evento.titulo,
          start,
          end,
          allDay: evento.todo_el_dia,
          type: evento.tipo,
          color: evento.color || eventColors[evento.tipo] || eventColors.custom,
          asignatura: evento.asignatura || undefined,
          source: 'manual',
          sourceId: evento.id,
          descripcion: evento.descripcion || undefined,
        })
      })

      // Ordenar por fecha de inicio
      return events.sort((a, b) => a.start.getTime() - b.start.getTime())
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para crear un evento personal en el calendario
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: CreateEventoInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('eventos_calendario')
        .insert({
          user_id: user.id,
          titulo: input.titulo,
          descripcion: input.descripcion,
          tipo: input.tipo,
          fecha_inicio: input.fecha_inicio.toISOString(),
          fecha_fin: input.fecha_fin?.toISOString(),
          todo_el_dia: input.todo_el_dia,
          asignatura_id: input.asignatura_id,
          source: 'manual',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar todas las queries del calendario
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

/**
 * Hook para eliminar un evento personal del calendario
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('eventos_calendario')
        .delete()
        .eq('id', eventId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

