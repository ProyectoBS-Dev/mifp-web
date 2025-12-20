'use client'

import { TrendingUp, BookOpen, CheckCircle, Clock } from 'lucide-react'

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
  // TODO: Conectar con datos reales de Supabase
  const stats = {
    asignaturas: 6,
    pacsEntregadas: 12,
    pacsTotal: 18,
    vtsAsistidas: 8,
    mediaActual: 7.5,
  }

  const porcentajePacs = Math.round((stats.pacsEntregadas / stats.pacsTotal) * 100)

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <StatItem
        icon={<BookOpen className="h-4 w-4" />}
        label="Asignaturas"
        value={stats.asignaturas}
      />
      <StatItem
        icon={<CheckCircle className="h-4 w-4" />}
        label="PACs entregadas"
        value={`${stats.pacsEntregadas}/${stats.pacsTotal}`}
        trend={`${porcentajePacs}%`}
        trendUp={porcentajePacs >= 50}
      />
      <StatItem
        icon={<Clock className="h-4 w-4" />}
        label="VTs asistidas"
        value={stats.vtsAsistidas}
      />
      <StatItem
        icon={<TrendingUp className="h-4 w-4" />}
        label="Media actual"
        value={stats.mediaActual.toFixed(1)}
        trend="+0.3"
        trendUp={true}
      />
    </div>
  )
}
