'use client'

import { useMemo } from 'react'
import { TrendingUp, Loader2, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotas, calcularNotaRA, calcularNotaModulo, calcularMediaPACsRA } from '@/hooks/useNotas'
import Link from 'next/link'

interface GradeItem {
  asignaturaId: string
  asignatura: string
  codigo: string
  nota: number | null
  mediaEC: number | null
  tieneGD: boolean
  todosRAsAprobados: boolean
  examenAprobado: boolean
}

function getGradeColor(nota: number | null) {
  if (nota === null) return 'text-muted-foreground'
  if (nota >= 9) return 'text-emerald-600 dark:text-emerald-400'
  if (nota >= 7) return 'text-emerald-600 dark:text-emerald-400'
  if (nota >= 5) return 'text-blue-600 dark:text-blue-400'
  return 'text-red-600 dark:text-red-400'
}

function getGradeBadge(nota: number | null) {
  if (nota === null) return null
  if (nota >= 5) return { text: '✓', className: 'text-emerald-500' }
  return { text: '✗', className: 'text-red-500' }
}

function GradeRow({ grade }: { grade: GradeItem }) {
  const badge = getGradeBadge(grade.nota)
  
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{grade.asignatura}</p>
        <p className="text-xs text-muted-foreground">{grade.codigo}</p>
      </div>
      <div className="flex items-center gap-2">
        {grade.tieneGD ? (
          <>
            <span
              className={cn(
                'text-lg font-bold',
                getGradeColor(grade.mediaEC)
              )}
            >
              {grade.mediaEC !== null ? grade.mediaEC.toFixed(1) : '-'}
            </span>
            {badge && (
              <span className={cn('text-sm font-bold', badge.className)}>
                {badge.text}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground italic">Sin GD</span>
        )}
      </div>
    </div>
  )
}

export function GradesWidget() {
  const { data, isLoading, error } = useNotas()

  // Calcular notas por asignatura
  const grades = useMemo((): GradeItem[] => {
    if (!data?.asignaturas) return []
    
    return data.asignaturas.map(asig => {
      if (!asig.tieneGD || asig.ras.length === 0) {
        return {
          asignaturaId: asig.asignaturaId,
          asignatura: asig.nombre,
          codigo: asig.codigo,
          nota: null,
          mediaEC: null,
          tieneGD: false,
          todosRAsAprobados: false,
          examenAprobado: false
        }
      }

      // Calcular nota de cada RA y media EC
      const notasMap = new Map<string, number>()
      let todosRAsAprobados = true
      let examenAprobado = asig.notaExamen !== null && asig.notaExamen >= 5
      let sumaMediaEC = 0
      let countMediaEC = 0
      
      asig.ras.forEach(ra => {
        const pacsDelRA = asig.pacs.filter(p => p.raId === ra.id)
        const resultado = calcularNotaRA(pacsDelRA, asig.notaExamen)
        const { media: mediaECRA } = calcularMediaPACsRA(pacsDelRA)
        
        if (resultado.notaRA !== null) {
          notasMap.set(ra.id, resultado.notaRA)
          if (resultado.notaRA < 5) todosRAsAprobados = false
        } else {
          todosRAsAprobados = false
        }
        
        if (mediaECRA !== null) {
          sumaMediaEC += mediaECRA
          countMediaEC++
        }
      })

      // Calcular nota del módulo
      const notaModulo = calcularNotaModulo(asig.ras, notasMap, data.fct.nota)
      const mediaEC = countMediaEC > 0 ? sumaMediaEC / countMediaEC : null

      return {
        asignaturaId: asig.asignaturaId,
        asignatura: asig.nombre,
        codigo: asig.codigo,
        nota: data.fct.nota !== null && notaModulo.notaConFCT !== null 
          ? notaModulo.notaConFCT 
          : notaModulo.notaSinFCT,
        mediaEC,
        tieneGD: true,
        todosRAsAprobados,
        examenAprobado
      }
    })
  }, [data])

  // Calcular media de Evaluación Continua
  const mediaEC = useMemo(() => {
    const mediasValidas = grades
      .filter((g) => g.tieneGD && g.mediaEC !== null)
      .map((g) => g.mediaEC as number)
    
    return mediasValidas.length > 0
      ? mediasValidas.reduce((a, b) => a + b, 0) / mediasValidas.length
      : null
  }, [grades])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-sm text-destructive">Error al cargar</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    )
  }

  // Empty state
  if (!data?.semestreActivo || grades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <GraduationCap className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Sin asignaturas matriculadas
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data?.semestreActivo ? data.semestreActivo.nombre : 'No hay semestre activo'}
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header: Media Eval. Continua */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b shrink-0">
        <div>
          <span className="text-sm font-medium">Media Eval. Continua</span>
          <span className="text-xs text-muted-foreground ml-1">(40% por RA)</span>
        </div>
        <span
          className={cn(
            'text-lg font-bold',
            getGradeColor(mediaEC)
          )}
        >
          {mediaEC !== null ? mediaEC.toFixed(2) : '-'}
        </span>
      </div>

      {/* Lista de notas con scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {grades.map((grade) => (
          <GradeRow key={grade.asignaturaId} grade={grade} />
        ))}
      </div>

      {/* Footer: Link a notas completas */}
      <div className="pt-2 mt-2 border-t shrink-0">
        <Link 
          href="/notas" 
          className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <TrendingUp className="h-3 w-3" />
          Ver detalles completos
        </Link>
      </div>
    </div>
  )
}
