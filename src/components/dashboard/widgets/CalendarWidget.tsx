'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface CalendarEvent {
  date: number
  type: 'pac' | 'vt' | 'examen'
}

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Obtener primer día del mes y total de días
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1 // Ajustar para que Lunes sea 0
  
  // TODO: Conectar con eventos reales de Supabase
  const events: CalendarEvent[] = [
    { date: 22, type: 'pac' },
    { date: 20, type: 'vt' },
    { date: 27, type: 'vt' },
    { date: 15, type: 'examen' },
  ]

  const getEventForDay = (day: number) => {
    return events.find((e) => e.date === day)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, index) => {
          const event = day ? getEventForDay(day) : null
          const isToday = isCurrentMonth && day === todayDate

          return (
            <div
              key={index}
              className={cn(
                'aspect-square flex items-center justify-center text-xs rounded-md relative',
                day && 'hover:bg-muted cursor-pointer transition-colors',
                isToday && 'bg-primary text-primary-foreground font-bold',
                !day && 'invisible'
              )}
            >
              {day}
              {event && (
                <span
                  className={cn(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    event.type === 'pac' && 'bg-vt-red',
                    event.type === 'vt' && 'bg-vt-green',
                    event.type === 'examen' && 'bg-vt-yellow'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t text-xs">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-vt-red" />
          <span className="text-muted-foreground">PAC</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-vt-green" />
          <span className="text-muted-foreground">VT</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-vt-yellow" />
          <span className="text-muted-foreground">Examen</span>
        </div>
      </div>
    </div>
  )
}
