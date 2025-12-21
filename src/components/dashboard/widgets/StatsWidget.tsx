'use client'

import { TrendingUp, BookOpen, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useDashboardStats } from '@/hooks'

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
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
        <span
          className={`text-xs font-medium ${
            trendUp ? 'text-vt-green' : 'text-vt-red'
          }`}
        >
          {trend}
        </span>
      )}
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
    <div className="grid grid-cols-2 gap-4 h-full">
      <StatItem
        icon={<BookOpen className="h-4 w-4" />}
        label="Asignaturas"
        value={stats?.asignaturas || 0}
      />
      <StatItem
        icon={<CheckCircle className="h-4 w-4" />}
        label="PACs completadas"
        value={`${stats?.pacsCompletadas || 0}/${stats?.pacsTotal || 0}`}
        trend={stats?.pacsTotal ? `${porcentajePacs}%` : undefined}
        trendUp={porcentajePacs >= 50}
      />
      <StatItem
        icon={<Clock className="h-4 w-4" />}
        label="VTs vistas"
        value={`${stats?.vtsVistas || 0}/${stats?.vtsTotal || 0}`}
      />
      <StatItem
        icon={<TrendingUp className="h-4 w-4" />}
        label="Media actual"
        value={stats?.mediaNotas?.toFixed(1) || '-'}
        trendUp={true}
      />
    </div>
  )
}
