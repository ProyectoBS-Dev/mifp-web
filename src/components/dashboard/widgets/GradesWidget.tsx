'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GradeItem {
  asignatura: string
  codigo: string
  nota: number | null
  tendencia: 'up' | 'down' | 'stable'
}

function getGradeColor(nota: number | null) {
  if (nota === null) return 'text-muted-foreground'
  if (nota >= 9) return 'text-vt-green'
  if (nota >= 7) return 'text-vt-blue'
  if (nota >= 5) return 'text-vt-yellow-dark'
  return 'text-vt-red'
}

function GradeRow({ grade }: { grade: GradeItem }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{grade.asignatura}</p>
        <p className="text-xs text-muted-foreground">{grade.codigo}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-lg font-bold',
            getGradeColor(grade.nota)
          )}
        >
          {grade.nota !== null ? grade.nota.toFixed(1) : '-'}
        </span>
        {grade.nota !== null && (
          <div
            className={cn(
              'p-1 rounded',
              grade.tendencia === 'up' && 'bg-vt-green/10 text-vt-green',
              grade.tendencia === 'down' && 'bg-vt-red/10 text-vt-red',
              grade.tendencia === 'stable' && 'bg-muted text-muted-foreground'
            )}
          >
            {grade.tendencia === 'up' && <TrendingUp className="h-3 w-3" />}
            {grade.tendencia === 'down' && <TrendingDown className="h-3 w-3" />}
            {grade.tendencia === 'stable' && <Minus className="h-3 w-3" />}
          </div>
        )}
      </div>
    </div>
  )
}

export function GradesWidget() {
  // TODO: Conectar con datos reales de Supabase
  const grades: GradeItem[] = [
    {
      asignatura: 'Programación',
      codigo: 'PRO',
      nota: 8.5,
      tendencia: 'up',
    },
    {
      asignatura: 'Base de Datos',
      codigo: 'BBD',
      nota: 7.2,
      tendencia: 'stable',
    },
    {
      asignatura: 'Entornos de Desarrollo',
      codigo: 'EDD',
      nota: 9.1,
      tendencia: 'up',
    },
    {
      asignatura: 'Sistemas Informáticos',
      codigo: 'SIS',
      nota: 6.8,
      tendencia: 'down',
    },
    {
      asignatura: 'Lenguaje de Marcas',
      codigo: 'LLM',
      nota: null,
      tendencia: 'stable',
    },
  ]

  // Calcular media
  const notasValidas = grades.filter((g) => g.nota !== null).map((g) => g.nota as number)
  const media = notasValidas.length > 0
    ? notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
    : null

  return (
    <div className="h-full flex flex-col">
      {/* Media general */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b">
        <span className="text-sm font-medium">Media general</span>
        <span
          className={cn(
            'text-2xl font-bold',
            getGradeColor(media)
          )}
        >
          {media !== null ? media.toFixed(2) : '-'}
        </span>
      </div>

      {/* Lista de notas */}
      <div className="flex-1 overflow-auto">
        {grades.map((grade) => (
          <GradeRow key={grade.codigo} grade={grade} />
        ))}
      </div>
    </div>
  )
}
