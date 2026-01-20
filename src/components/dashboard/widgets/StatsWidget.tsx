'use client'

import { BookOpen, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useDashboardStats, nivelConfig, type NivelGamificacion } from '@/hooks'

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  trend?: string
  trendUp?: boolean
}

function StatItem({ icon, label, value, trend, trendUp }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
      {trend && (
        <span className={`text-xs font-medium ${trendUp ? 'text-vt-green' : 'text-vt-red'}`}>
          {trend}
        </span>
      )}
    </div>
  )
}

// Colores pastel por nivel para el anillo de progreso
const nivelColors: Record<NivelGamificacion, string> = {
  pichon: '#fef3c7',    // Amarillo pastel suave
  junior: '#bae6fd',    // Azul cielo suave
  leyenda: '#bbf7d0',   // Verde menta suave (como la imagen)
  maestro: '#e9d5ff',   // Lavanda suave
}

interface NivelRingProps {
  nivel: NivelGamificacion
  porcentaje: number
}

function NivelRing({ nivel, porcentaje }: NivelRingProps) {
  const config = nivelConfig[nivel]
  const color = nivelColors[nivel]

  // SVG circle parameters
  const size = 88
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (porcentaje / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Ring */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle - gris claro */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Emoji en el centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">{config.emoji}</span>
        </div>
      </div>
      {/* Label y porcentaje */}
      <div className="text-center mt-1">
        <p className="text-sm font-semibold">{config.label}</p>
        <p className="text-xs text-muted-foreground">{porcentaje}%</p>
      </div>
    </div>
  )
}

export function StatsWidget() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const porcentajePacs = stats?.pacsTotal
    ? Math.round((stats.pacsCompletadas / stats.pacsTotal) * 100)
    : 0

  return (
    <div className="flex gap-4 h-full">
      {/* Stats en columna izquierda */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        <StatItem
          icon={<BookOpen className="h-4 w-4" />}
          label="Asignaturas"
          value={stats?.asignaturas || 0}
        />
        <StatItem
          icon={<CheckCircle className="h-4 w-4" />}
          label="PACs compl."
          value={
            <>
              {stats?.pacsCompletadas || 0}/{stats?.pacsTotal || 0}{' '}
              <span className="text-xs text-vt-green">{porcentajePacs}%</span>
            </>
          }
        />
        <StatItem
          icon={<Clock className="h-4 w-4" />}
          label="VTs vistas"
          value={`${stats?.vtsVistas || 0}/${stats?.vtsTotal || 0}`}
        />
      </div>
      {/* Anillo de nivel a la derecha */}
      <div className="flex items-center justify-center px-2">
        {stats && (
          <NivelRing
            nivel={stats.nivel}
            porcentaje={stats.porcentajeTotal}
          />
        )}
      </div>
    </div>
  )
}
