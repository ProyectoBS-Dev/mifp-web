'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, GraduationCap, Calendar as CalendarIcon, Clock, FileText, Pin, Video, Pencil, RotateCcw } from 'lucide-react'
import { format, isSameDay, eachDayOfInterval, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent, useUpdatePacDate, useUpdateVtDate } from '@/hooks/useCalendarEvents'
import type { CalendarEvent, EventoTipo, CreateEventoInput, UpdateEventoInput } from '@/types/calendario'
import { eventColors, eventIcons, eventLabels } from '@/types/calendario'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [editDateEvent, setEditDateEvent] = useState<CalendarEvent | null>(null)
  
  const { data: events, isLoading } = useCalendarEvents(currentDate)
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Obtener primer día del mes y total de días
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1 // Ajustar para que Lunes sea 0

  // Agrupar eventos por día del mes
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    events?.forEach(event => {
      // Para eventos multi-día, poner el punto en cada día del rango
      const rangeStart = startOfDay(event.start)
      const rangeEnd = startOfDay(event.end)
      const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
      
      days.forEach(d => {
        if (d.getMonth() === month && d.getFullYear() === year) {
          const dayNum = d.getDate()
          const existing = map.get(dayNum) || []
          if (!existing.some(e => e.id === event.id)) {
            map.set(dayNum, [...existing, event])
          }
        }
      })
    })
    return map
  }, [events, month, year])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
  const todayDate = today.getDate()

  // Generar días del calendario
  const days = []
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Bug 3 fix: siempre abrir DayEventsModal cuando hay ≥1 evento
  const handleDayClick = (day: number) => {
    const dayEvents = eventsByDay.get(day) || []
    if (dayEvents.length >= 1) {
      // Siempre mostrar selector de día para poder añadir nuevos eventos
      setSelectedDay(new Date(year, month, day))
    } else {
      // Si no hay eventos, abrir modal de crear directamente
      setSelectedDay(new Date(year, month, day))
      setShowCreateModal(true)
    }
  }

  const handleCreateClick = () => {
    setSelectedDay(new Date())
    setShowCreateModal(true)
  }

  // Bug 1 fix: calcular filas dinámicamente
  const totalRows = Math.ceil(days.length / 7)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-0.5 text-xs rounded hover:bg-muted transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <h3 className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </h3>
        
        <button
          onClick={handleCreateClick}
          className="p-1 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          aria-label="Crear evento"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar container with border */}
      <div className="flex-1 border border-border/40 rounded-md overflow-hidden flex flex-col">
        {/* Days header */}
        <div className="grid grid-cols-7 bg-muted/30 border-b border-border/40">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-[10px] font-medium text-muted-foreground py-1.5",
                index < 6 && "border-r border-border/20"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid — Bug 1 fix: dynamic rows instead of aspect-square */}
        <div
          className="grid grid-cols-7 flex-1"
          style={{ gridTemplateRows: `repeat(${totalRows}, 1fr)` }}
        >
          {isLoading ? (
            <div className="col-span-7 flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            days.map((day, index) => {
              const dayEvents = day ? eventsByDay.get(day) || [] : []
              const isToday = isCurrentMonth && day === todayDate
              const hasEvents = dayEvents.length > 0
              const colPosition = index % 7
              const isWeekend = colPosition >= 5
              const isLastCol = colPosition === 6
              const rowIndex = Math.floor(index / 7)
              const isLastRow = rowIndex === totalRows - 1

              return (
                <button
                  key={index}
                  onClick={() => day && handleDayClick(day)}
                  disabled={!day}
                  className={cn(
                    'flex flex-col items-center justify-center text-xs relative transition-colors min-h-0',
                    !isLastCol && 'border-r border-border/20',
                    !isLastRow && 'border-b border-border/20',
                    day && 'hover:bg-muted/60 cursor-pointer',
                    isToday && 'bg-vt-blue/10 text-vt-blue font-bold hover:bg-vt-blue/20',
                    isWeekend && !isToday && day && 'bg-muted/10',
                    !day && 'bg-transparent cursor-default'
                  )}
                >
                  {day && (
                    <div className="flex flex-col items-center">
                      <span>{day}</span>
                      {/* Contenedor fijo para indicadores — siempre reserva espacio (h-2) */}
                      <div className="h-2 flex items-center justify-center gap-0.5">
                        {hasEvents && (
                          <>
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <span
                                key={i}
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: event.color }}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[8px] text-muted-foreground leading-none">+</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t text-[10px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColors.pac }} />
          <span className="text-muted-foreground">PAC</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColors.vt }} />
          <span className="text-muted-foreground">VT</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColors.examen }} />
          <span className="text-muted-foreground">Examen</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColors.custom }} />
          <span className="text-muted-foreground">Personal</span>
        </div>
      </div>

      {/* Modal ver evento */}
      <EventDetailModal 
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(event) => {
          setSelectedEvent(null)
          if (event.source === 'manual') {
            setEditEvent(event)
            setShowCreateModal(true)
          } else {
            setEditDateEvent(event)
          }
        }}
      />

      {/* Modal selector de día (múltiples eventos) */}
      <DayEventsModal
        date={selectedDay}
        events={selectedDay ? events?.filter(e => {
          const dayStart = startOfDay(selectedDay)
          return dayStart >= startOfDay(e.start) && dayStart <= startOfDay(e.end)
        }) || [] : []}
        onSelectEvent={(event) => {
          setSelectedDay(null)
          setSelectedEvent(event)
        }}
        onCreateEvent={() => {
          setShowCreateModal(true)
        }}
        onClose={() => setSelectedDay(null)}
        isOpen={!!selectedDay && !showCreateModal}
      />

      {/* Modal crear/editar evento personal */}
      <CreateEventModal
        isOpen={showCreateModal}
        initialDate={selectedDay}
        editEvent={editEvent}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedDay(null)
          setEditEvent(null)
        }}
      />

      {/* Modal editar fecha PAC/VT */}
      <EditDateModal
        event={editDateEvent}
        onClose={() => setEditDateEvent(null)}
      />
    </div>
  )
}

// ============================================
// Modal: Ver detalle de evento
// ============================================
interface EventDetailModalProps {
  event: CalendarEvent | null
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
}

function EventDetailModal({ event, onClose, onEdit }: EventDetailModalProps) {
  const deleteEvent = useDeleteCalendarEvent()
  
  if (!event) return null

  const canDelete = event.source === 'manual'
  const canEdit = true // Todos los eventos se pueden editar (manual = full edit, pac/vt = edit date)

  const handleDelete = async () => {
    if (!canDelete) return
    
    try {
      await deleteEvent.mutateAsync(event.sourceId)
      onClose()
    } catch (error) {
      console.error('Error al eliminar evento:', error)
    }
  }

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: event.color }}
            />
            {(() => {
              const Icon = eventIcons[event.type]
              return <Icon className="h-4 w-4" />
            })()}
            {event.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalles del evento seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium">{eventLabels[event.type]}</span>
          </div>

          {event.asignatura && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Asignatura:</span>
              <span className="font-medium">{event.asignatura.nombre}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fecha:</span>
            <span className="font-medium">
              {isSameDay(event.start, event.end)
                ? format(event.start, "EEEE, d 'de' MMMM yyyy", { locale: es })
                : `${format(event.start, "d 'de' MMMM", { locale: es })} - ${format(event.end, "d 'de' MMMM yyyy", { locale: es })}`
              }
            </span>
          </div>

          {/* Indicador de fecha personalizada */}
          {event.hasCustomDate && event.originalDate && (
            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-2 rounded flex items-center gap-2">
              <Pencil className="h-3 w-3" />
              Fecha personalizada (original: {format(event.originalDate, "d 'de' MMMM yyyy", { locale: es })})
            </div>
          )}

          {!event.allDay && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Hora:</span>
              <span className="font-medium">
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
              </span>
            </div>
          )}

          {event.descripcion && (
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Descripción:</span>
              </div>
              <p className="mt-1 text-foreground">{event.descripcion}</p>
            </div>
          )}

          {event.type === 'pac' && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
              <Pin className="h-3 w-3" />
              Fecha límite de entrega de la PAC
            </p>
          )}

          {event.type === 'vt' && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
              <Video className="h-3 w-3" />
              Videotutoría en directo
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(event)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              {event.source === 'manual' ? 'Editar' : 'Editar fecha'}
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Modal: Selector de eventos del día
// ============================================
interface DayEventsModalProps {
  date: Date | null
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onCreateEvent: () => void
  onClose: () => void
  isOpen: boolean
}

// Bug 3 fix: quitar early return por events.length === 0
function DayEventsModal({ date, events, onSelectEvent, onCreateEvent, onClose, isOpen }: DayEventsModalProps) {
  if (!date) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(date, "d 'de' MMMM", { locale: es })}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Eventos del día seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 overflow-y-auto max-h-[50vh] pr-1">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay eventos este día
            </p>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
              >
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate flex items-center gap-1">
                    {(() => {
                      const Icon = eventIcons[event.type]
                      return <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    })()}
                    {event.title}
                    {event.hasCustomDate && (
                      <Pencil className="h-2.5 w-2.5 text-amber-500 flex-shrink-0" />
                    )}
                  </p>
                  {!event.allDay && (
                    <p className="text-xs text-muted-foreground">
                      {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCreateEvent}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir evento
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Modal: Crear/Editar evento personal
// ============================================
interface CreateEventModalProps {
  isOpen: boolean
  initialDate: Date | null
  editEvent?: CalendarEvent | null
  onClose: () => void
}

function CreateEventModal({ isOpen, initialDate, editEvent, onClose }: CreateEventModalProps) {
  const createEvent = useCreateCalendarEvent()
  const updateEvent = useUpdateCalendarEvent()
  
  const isEditMode = !!editEvent

  const [formData, setFormData] = useState<{
    titulo: string
    descripcion: string
    tipo: EventoTipo
    fecha_inicio: string
    hora_inicio: string
    fecha_fin: string
    hora_fin: string
    todo_el_dia: boolean
  }>({
    titulo: '',
    descripcion: '',
    tipo: 'custom',
    fecha_inicio: format(initialDate || new Date(), 'yyyy-MM-dd'),
    hora_inicio: '12:00',
    fecha_fin: format(initialDate || new Date(), 'yyyy-MM-dd'),
    hora_fin: '13:00',
    todo_el_dia: true,
  })

  // Bug 2 fix + Edit mode: sync form state when modal opens or props change
  useEffect(() => {
    if (!isOpen) return

    if (editEvent) {
      // Modo edición: precargar formulario con datos del evento
      setFormData({
        titulo: editEvent.title,
        descripcion: editEvent.descripcion || '',
        tipo: editEvent.type,
        fecha_inicio: format(editEvent.start, 'yyyy-MM-dd'),
        hora_inicio: editEvent.allDay ? '12:00' : format(editEvent.start, 'HH:mm'),
        fecha_fin: format(editEvent.end, 'yyyy-MM-dd'),
        hora_fin: editEvent.allDay ? '13:00' : format(editEvent.end, 'HH:mm'),
        todo_el_dia: editEvent.allDay,
      })
    } else if (initialDate) {
      // Modo crear: usar la fecha del día seleccionado
      const fechaStr = format(initialDate, 'yyyy-MM-dd')
      setFormData(prev => ({
        ...prev,
        titulo: '',
        descripcion: '',
        tipo: 'custom',
        fecha_inicio: fechaStr,
        hora_inicio: '12:00',
        fecha_fin: fechaStr,
        hora_fin: '13:00',
        todo_el_dia: true,
      }))
    }
  }, [isOpen, initialDate, editEvent])

  const resetForm = () => {
    const fechaStr = format(initialDate || new Date(), 'yyyy-MM-dd')
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'custom',
      fecha_inicio: fechaStr,
      hora_inicio: '12:00',
      fecha_fin: fechaStr,
      hora_fin: '13:00',
      todo_el_dia: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim()) return

    // Construir fecha_inicio
    const fechaInicio = new Date(formData.fecha_inicio)
    if (!formData.todo_el_dia) {
      const [h, m] = formData.hora_inicio.split(':').map(Number)
      fechaInicio.setHours(h, m, 0, 0)
    }

    // Construir fecha_fin
    const fechaFin = new Date(formData.fecha_fin)
    if (!formData.todo_el_dia) {
      const [hf, mf] = formData.hora_fin.split(':').map(Number)
      fechaFin.setHours(hf, mf, 0, 0)
    }

    try {
      if (isEditMode && editEvent) {
        // Modo edición
        const input: UpdateEventoInput = {
          id: editEvent.sourceId,
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          tipo: formData.tipo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          todo_el_dia: formData.todo_el_dia,
        }
        await updateEvent.mutateAsync(input)
      } else {
        // Modo crear
        const input: CreateEventoInput = {
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          tipo: formData.tipo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          todo_el_dia: formData.todo_el_dia,
        }
        await createEvent.mutateAsync(input)
      }
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error al guardar evento:', error)
    }
  }

  const isPending = isEditMode ? updateEvent.isPending : createEvent.isPending

  // Cuando cambia fecha_inicio, ajustar fecha_fin si es anterior
  const handleFechaInicioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      fecha_inicio: value,
      fecha_fin: prev.fecha_fin < value ? value : prev.fecha_fin,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            {isEditMode ? 'Editar evento' : 'Nuevo evento'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode ? 'Formulario para editar un evento del calendario' : 'Formulario para crear un nuevo evento en el calendario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Estudiar tema 3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de evento</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: EventoTipo) => setFormData(prev => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4" /> Personal
                  </div>
                </SelectItem>
                <SelectItem value="examen">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> Examen
                  </div>
                </SelectItem>
                <SelectItem value="pac">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> PAC (manual)
                  </div>
                </SelectItem>
                <SelectItem value="vt">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" /> VT (manual)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apple Calendar-style: Inicio / Fin rows */}
          <div className="space-y-2 rounded-lg border border-border/60 p-3">
            {/* Fila Inicio */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-12 shrink-0">Inicio:</span>
              <Input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
                className="flex-1"
              />
              {!formData.todo_el_dia && (
                <Input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                  className="w-28"
                />
              )}
            </div>

            {/* Separador */}
            <div className="border-t border-border/40" />

            {/* Fila Fin */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-12 shrink-0">Fin:</span>
              <Input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                min={formData.fecha_inicio}
                className="flex-1"
              />
              {!formData.todo_el_dia && (
                <Input
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_fin: e.target.value }))}
                  className="w-28"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="todo_el_dia"
              checked={formData.todo_el_dia}
              onChange={(e) => setFormData(prev => ({ ...prev, todo_el_dia: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="todo_el_dia" className="text-sm font-normal cursor-pointer">
              Todo el día
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Añade notas o detalles..."
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.titulo.trim()}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : isEditMode ? (
                <Pencil className="h-4 w-4 mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              {isEditMode ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Modal: Editar fecha de PAC/VT
// ============================================
interface EditDateModalProps {
  event: CalendarEvent | null
  onClose: () => void
}

function EditDateModal({ event, onClose }: EditDateModalProps) {
  const updatePacDate = useUpdatePacDate()
  const updateVtDate = useUpdateVtDate()

  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  // Sync form state when event changes
  useEffect(() => {
    if (event) {
      setFecha(format(event.start, 'yyyy-MM-dd'))
      setHora(event.allDay ? '' : format(event.start, 'HH:mm'))
    }
  }, [event])

  if (!event || !event.userRecordId) return null

  const isPac = event.source === 'pac'
  const isVt = event.source === 'vt'
  const isPending = isPac ? updatePacDate.isPending : updateVtDate.isPending

  const handleSave = async () => {
    if (!event.userRecordId) return

    try {
      if (isPac) {
        // Convertir fecha a ISO timestamp
        const fechaISO = new Date(fecha).toISOString()
        await updatePacDate.mutateAsync({
          userPacId: event.userRecordId,
          fecha: fechaISO,
        })
      } else if (isVt) {
        await updateVtDate.mutateAsync({
          userVtId: event.userRecordId,
          fecha: fecha,
          hora: hora || null,
        })
      }
      onClose()
    } catch (error) {
      console.error('Error al actualizar fecha:', error)
    }
  }

  const handleReset = async () => {
    if (!event.userRecordId) return

    try {
      if (isPac) {
        await updatePacDate.mutateAsync({
          userPacId: event.userRecordId,
          fecha: null,
        })
      } else if (isVt) {
        await updateVtDate.mutateAsync({
          userVtId: event.userRecordId,
          fecha: null,
          hora: null,
        })
      }
      onClose()
    } catch (error) {
      console.error('Error al restaurar fecha:', error)
    }
  }

  const originalDateStr = event.hasCustomDate && event.originalDate
    ? format(event.originalDate, "d 'de' MMMM yyyy", { locale: es })
    : format(event.start, "d 'de' MMMM yyyy", { locale: es })

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar fecha
          </DialogTitle>
          <DialogDescription>
            {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Referencia: fecha original */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
            <CalendarIcon className="h-3 w-3" />
            Fecha original: {originalDateStr}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-fecha">Nueva fecha</Label>
            <Input
              id="edit-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {isVt && (
            <div className="space-y-2">
              <Label htmlFor="edit-hora">Nueva hora</Label>
              <Input
                id="edit-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {event.hasCustomDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
              className="text-amber-600 hover:text-amber-700 w-full"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restaurar fecha original
            </Button>
          )}
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending || !fecha}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Pencil className="h-4 w-4 mr-1" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
