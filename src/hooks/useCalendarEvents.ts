'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, parseISO, addMinutes } from 'date-fns'
import type { CalendarEvent, CreateEventoInput, UpdateEventoInput } from '@/types/calendario'
import { eventColors } from '@/types/calendario'

/**
 * Hook para obtener todos los eventos del calendario del usuario
 * Combina: PACs + VTs del semestre activo + Eventos personales
 * Respeta fechas personalizadas (overrides) del usuario
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

      // Ejecutar las 3 queries en paralelo
      const [pacsRes, vtsRes, eventosRes] = await Promise.all([
        supabase
          .from('user_asignatura_pacs')
          .select(`
            id,
            fecha_limite_personalizada,
            pac:asignatura_pacs(
              id, titulo, fecha_limite,
              asignatura:asignaturas(nombre, codigo)
            ),
            user_asignatura:user_asignaturas!inner(
              semestre:semestres!inner(activo)
            )
          `)
          .eq('user_asignatura.semestre.activo', true),
        supabase
          .from('user_asignatura_vts')
          .select(`
            id,
            fecha_personalizada,
            hora_personalizada,
            vt:asignatura_vts(
              id, titulo, fecha_programada, hora_inicio, duracion_minutos,
              asignatura:asignaturas(nombre, codigo)
            ),
            user_asignatura:user_asignaturas!inner(
              semestre:semestres!inner(activo)
            )
          `)
          .eq('user_asignatura.semestre.activo', true),
        supabase
          .from('eventos_calendario')
          .select(`
            id, titulo, descripcion, tipo, 
            fecha_inicio, fecha_fin, todo_el_dia, color,
            asignatura:asignaturas(nombre, codigo)
          `)
          .eq('user_id', user.id)
          .gte('fecha_inicio', monthStart.toISOString())
          .lte('fecha_inicio', monthEnd.toISOString()),
      ])

      const events: CalendarEvent[] = []

      // Procesar PACs (con override de fecha)
      pacsRes.data?.forEach((item: {
        id: string
        fecha_limite_personalizada: string | null
        pac: {
          id: string
          titulo: string
          fecha_limite: string | null
          asignatura: { nombre: string; codigo: string }
        }
      }) => {
        const fechaOriginalStr = item.pac?.fecha_limite
        if (!fechaOriginalStr) return

        // Usar fecha personalizada si existe, sino la original
        const hasCustomDate = !!item.fecha_limite_personalizada
        const fechaEfectivaStr = item.fecha_limite_personalizada || fechaOriginalStr
        const fecha = parseISO(fechaEfectivaStr)
        const fechaOriginal = parseISO(fechaOriginalStr)

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
          hasCustomDate,
          originalDate: hasCustomDate ? fechaOriginal : undefined,
          userRecordId: item.id,
        })
      })

      // Procesar VTs (con override de fecha y hora)
      vtsRes.data?.forEach((item: {
        id: string
        fecha_personalizada: string | null
        hora_personalizada: string | null
        vt: {
          id: string
          titulo: string
          fecha_programada: string | null
          hora_inicio: string | null
          duracion_minutos: number | null
          asignatura: { nombre: string; codigo: string }
        }
      }) => {
        const fechaOriginalStr = item.vt?.fecha_programada
        if (!fechaOriginalStr) return

        // Usar fechas/horas personalizadas si existen
        const hasCustomDate = !!(item.fecha_personalizada || item.hora_personalizada)
        const fechaEfectivaStr = item.fecha_personalizada || fechaOriginalStr
        const fecha = parseISO(fechaEfectivaStr)
        const fechaOriginal = parseISO(fechaOriginalStr)

        // Filtrar por mes actual
        if (fecha < monthStart || fecha > monthEnd) return

        // Parsear hora (personalizada o original)
        const horaStr = item.hora_personalizada || item.vt.hora_inicio || '19:00'
        const [hours, minutes] = horaStr.split(':').map(Number)
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
          hasCustomDate,
          originalDate: hasCustomDate ? fechaOriginal : undefined,
          userRecordId: item.id,
        })
      })

      // Procesar eventos personales
      eventosRes.data?.forEach((evento: {
        id: string
        titulo: string
        descripcion: string | null
        tipo: 'pac' | 'vt' | 'examen' | 'custom'
        fecha_inicio: string
        fecha_fin: string | null
        todo_el_dia: boolean | null
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
          allDay: evento.todo_el_dia ?? true,
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

      const { data, error } = await supabase
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
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

/**
 * Hook para actualizar un evento personal del calendario
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: UpdateEventoInput) => {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .update({
          titulo: input.titulo,
          descripcion: input.descripcion,
          tipo: input.tipo,
          fecha_inicio: input.fecha_inicio.toISOString(),
          fecha_fin: input.fecha_fin?.toISOString(),
          todo_el_dia: input.todo_el_dia,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
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
      const { error } = await supabase
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

/**
 * Hook para actualizar/resetear la fecha personalizada de una PAC
 * Pasar null para restaurar la fecha original
 */
export function useUpdatePacDate() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userPacId, fecha }: { userPacId: string; fecha: string | null }) => {
      const { error } = await supabase
        .from('user_asignatura_pacs')
        .update({
          fecha_limite_personalizada: fecha,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userPacId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-pacs'] })
    },
  })
}

/**
 * Hook para actualizar/resetear fecha y hora personalizada de una VT
 * Pasar null para restaurar los valores originales
 */
export function useUpdateVtDate() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userVtId, fecha, hora }: { 
      userVtId: string
      fecha: string | null
      hora: string | null 
    }) => {
      const { error } = await supabase
        .from('user_asignatura_vts')
        .update({
          fecha_personalizada: fecha,
          hora_personalizada: hora,
        })
        .eq('id', userVtId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-vts'] })
    },
  })
}
