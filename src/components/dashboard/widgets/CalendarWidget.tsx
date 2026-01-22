'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, GraduationCap, Calendar as CalendarIcon, Clock, FileText, Pin, Video } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendarEvents'
import type { CalendarEvent, EventoTipo, CreateEventoInput } from '@/types/calendario'
import { eventColors, eventIcons, eventLabels } from '@/types/calendario'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      const day = event.start.getDate()
      const eventMonth = event.start.getMonth()
      const eventYear = event.start.getFullYear()
      
      if (eventMonth === month && eventYear === year) {
        const existing = map.get(day) || []
        map.set(day, [...existing, event])
      }
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

  const handleDayClick = (day: number) => {
    const dayEvents = eventsByDay.get(day) || []
    if (dayEvents.length === 1) {
      // Si solo hay un evento, abrirlo directamente
      setSelectedEvent(dayEvents[0])
    } else if (dayEvents.length > 1) {
      // Si hay múltiples eventos, mostrar selector de día
      setSelectedDay(new Date(year, month, day))
    } else {
      // Si no hay eventos, abrir modal de crear
      setSelectedDay(new Date(year, month, day))
      setShowCreateModal(true)
    }
  }

  const handleCreateClick = () => {
    setSelectedDay(new Date())
    setShowCreateModal(true)
  }

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
      <div className="flex-1 border border-border/40 rounded-md overflow-hidden">
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

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {isLoading ? (
            <div className="col-span-7 flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            days.map((day, index) => {
              const dayEvents = day ? eventsByDay.get(day) || [] : []
              const isToday = isCurrentMonth && day === todayDate
              const hasEvents = dayEvents.length > 0
              // Calcular si es fin de semana basándose en posición en la fila (0-6)
              const colPosition = index % 7
              const isWeekend = colPosition >= 5 // Sábado (5) y Domingo (6)
              const isLastCol = colPosition === 6
              const rowIndex = Math.floor(index / 7)
              const totalRows = Math.ceil(days.length / 7)
              const isLastRow = rowIndex === totalRows - 1

              return (
                <button
                  key={index}
                  onClick={() => day && handleDayClick(day)}
                  disabled={!day}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center text-xs relative transition-colors',
                    !isLastCol && 'border-r border-border/20',
                    !isLastRow && 'border-b border-border/20',
                    day && 'hover:bg-muted/60 cursor-pointer',
                    isToday && 'bg-primary text-primary-foreground font-bold hover:bg-primary/90',
                    isWeekend && !isToday && day && 'bg-muted/10',
                    !day && 'bg-transparent cursor-default'
                  )}
                >
                  {day && (
                    <>
                      <span>{day}</span>
                      
                      {/* Indicadores de eventos */}
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <span
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+</span>
                          )}
                        </div>
                      )}
                    </>
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
      />

      {/* Modal selector de día (múltiples eventos) */}
      <DayEventsModal
        date={selectedDay}
        events={selectedDay ? events?.filter(e => isSameDay(e.start, selectedDay)) || [] : []}
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

      {/* Modal crear evento */}
      <CreateEventModal
        isOpen={showCreateModal}
        initialDate={selectedDay}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedDay(null)
        }}
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
}

function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const deleteEvent = useDeleteCalendarEvent()
  
  if (!event) return null

  const canDelete = event.source === 'manual'

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
              {format(event.start, "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>

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

function DayEventsModal({ date, events, onSelectEvent, onCreateEvent, onClose, isOpen }: DayEventsModalProps) {
  if (!date || events.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(date, "d 'de' MMMM", { locale: es })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2 overflow-y-auto max-h-[50vh] pr-1">
          {events.map((event) => (
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
                </p>
                {!event.allDay && (
                  <p className="text-xs text-muted-foreground">
                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                  </p>
                )}
              </div>
            </button>
          ))}
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
// Modal: Crear evento personal
// ============================================
interface CreateEventModalProps {
  isOpen: boolean
  initialDate: Date | null
  onClose: () => void
}

function CreateEventModal({ isOpen, initialDate, onClose }: CreateEventModalProps) {
  const createEvent = useCreateCalendarEvent()
  
  const [formData, setFormData] = useState<{
    titulo: string
    descripcion: string
    tipo: EventoTipo
    fecha: string
    hora: string
    todo_el_dia: boolean
  }>({
    titulo: '',
    descripcion: '',
    tipo: 'custom',
    fecha: format(initialDate || new Date(), 'yyyy-MM-dd'),
    hora: '12:00',
    todo_el_dia: true,
  })

  // Resetear form cuando se abre/cierra
  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'custom',
      fecha: format(initialDate || new Date(), 'yyyy-MM-dd'),
      hora: '12:00',
      todo_el_dia: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim()) return

    const fechaBase = new Date(formData.fecha)
    if (!formData.todo_el_dia) {
      const [hours, minutes] = formData.hora.split(':').map(Number)
      fechaBase.setHours(hours, minutes, 0, 0)
    }

    const input: CreateEventoInput = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      tipo: formData.tipo,
      fecha_inicio: fechaBase,
      todo_el_dia: formData.todo_el_dia,
    }

    try {
      await createEvent.mutateAsync(input)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error al crear evento:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Nuevo evento
          </DialogTitle>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>
            
            {!formData.todo_el_dia && (
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                />
              </div>
            )}
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
            <Button type="submit" disabled={createEvent.isPending || !formData.titulo.trim()}>
              {createEvent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Crear evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
