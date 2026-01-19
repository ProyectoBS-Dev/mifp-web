'use client'

import { memo } from 'react'
import { Calculator, History, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { SemesterSelector } from '@/components/semester/SemesterSelector'
import { type FCTData } from '@/hooks/useNotas'

// ============================================
// TIPOS EXPORTADOS (para uso en page.tsx)
// ============================================

export type EstadoAsignatura = 'sin_notas' | 'en_progreso' | 'aprobada' | 'suspensa'

export interface AsignaturaCalculada {
  id: string
  nombre: string
  codigo: string
  estado: EstadoAsignatura
  notaModulo: number | null
  rasCompletados: number
  rasTotal: number
}

interface NotasSidebarProps {
  asignaturasCalculadas: AsignaturaCalculada[]
  fct: FCTData
  selectedAsignaturaId: string | null
  onSelectAsignatura: (id: string | null) => void
  activeTab: 'semestre' | 'historial'
  onTabChange: (tab: 'semestre' | 'historial') => void
  selectedSemestreId: string | null
  onSemestreChange: (id: string) => void
  asignaturasAprobadas: number
  totalAsignaturas: number
}

// ============================================
// COMPONENTE: EstadoIndicador (sin animación pesada)
// ============================================

const EstadoIndicador = memo(function EstadoIndicador({ estado }: { estado: EstadoAsignatura }) {
  const colorClasses = {
    sin_notas: 'bg-gray-400',
    en_progreso: 'bg-amber-500',
    aprobada: 'bg-emerald-500',
    suspensa: 'bg-red-500'
  }

  return (
    <span className="relative flex h-3 w-3 flex-shrink-0">
      <span className={cn(
        'inline-flex rounded-full h-3 w-3',
        colorClasses[estado]
      )} />
    </span>
  )
})

// ============================================
// COMPONENTE: AsignaturaItem (memoizado)
// ============================================

interface AsignaturaItemProps {
  asignatura: AsignaturaCalculada
  isSelected: boolean
  onClick: () => void
}

const AsignaturaItem = memo(function AsignaturaItem({ 
  asignatura, 
  isSelected, 
  onClick 
}: AsignaturaItemProps) {
  const { estado, notaModulo, rasCompletados, rasTotal } = asignatura
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left py-3 px-3 rounded-lg transition-all duration-150',
        'hover:bg-muted/50 hover:scale-[1.01]',
        isSelected && 'bg-muted border-l-2 border-l-primary'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <EstadoIndicador estado={estado} />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{asignatura.nombre}</p>
            <p className="text-xs text-muted-foreground">
              {asignatura.codigo}
              {rasTotal > 0 && ` · ${rasCompletados}/${rasTotal} RAs`}
            </p>
          </div>
        </div>
        <span className={cn(
          'font-semibold text-sm flex-shrink-0',
          notaModulo !== null && notaModulo >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 
          notaModulo !== null && notaModulo < 5 ? 'text-red-600 dark:text-red-400' : 
          'text-muted-foreground'
        )}>
          {notaModulo !== null ? notaModulo.toFixed(2) : '—'}
        </span>
      </div>
    </button>
  )
})

// ============================================
// COMPONENTE: FCTCompacto (memoizado)
// ============================================

interface FCTCompactoProps {
  fct: FCTData
  asignaturasAprobadas: number
  totalAsignaturas: number
}

const FCTCompacto = memo(function FCTCompacto({ 
  fct, 
  asignaturasAprobadas, 
  totalAsignaturas 
}: FCTCompactoProps) {
  const porcentaje = totalAsignaturas > 0
    ? Math.round((asignaturasAprobadas / totalAsignaturas) * 100)
    : 0
  const puedeHacerFCT = porcentaje >= 50
  
  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">FCT</span>
        {fct.nota !== null && (
          <span className="ml-auto font-semibold text-sm text-emerald-600 dark:text-emerald-400">
            {fct.nota.toFixed(1)}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progreso: {asignaturasAprobadas}/{totalAsignaturas} ({porcentaje}%)</span>
          {puedeHacerFCT && <span className="text-emerald-600">✓</span>}
        </div>
        <Progress value={porcentaje} className="h-1.5" />
      </div>
    </div>
  )
})

// ============================================
// COMPONENTE PRINCIPAL (memoizado)
// ============================================

export const NotasSidebar = memo(function NotasSidebar({
  asignaturasCalculadas,
  fct,
  selectedAsignaturaId,
  onSelectAsignatura,
  activeTab,
  onTabChange,
  selectedSemestreId,
  onSemestreChange,
  asignaturasAprobadas,
  totalAsignaturas
}: NotasSidebarProps) {
  return (
    <aside className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 border-r bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Notas
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus calificaciones
        </p>
      </div>
      
      {/* Tabs */}
      <div className="p-4 pb-3">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'semestre' | 'historial')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="semestre" className="flex items-center gap-1.5 text-xs">
              <Calculator className="h-3.5 w-3.5" />
              Semestre
            </TabsTrigger>
            <TabsTrigger value="historial" className="flex items-center gap-1.5 text-xs">
              <History className="h-3.5 w-3.5" />
              Historial
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Selector de Semestre (solo en tab semestre) */}
      {activeTab === 'semestre' && (
        <div className="px-4 pb-3">
          <SemesterSelector
            value={selectedSemestreId}
            onChange={onSemestreChange}
            className="w-full"
          />
        </div>
      )}
      
      {/* Separador */}
      <div className="mx-4 border-t" />
      
      {/* Contenido según tab */}
      {activeTab === 'semestre' && (
        <>
          {/* Lista de Asignaturas */}
          <div className="flex-1 overflow-y-auto p-4 pt-3 scrollbar-hide">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Asignaturas
            </p>
            <div className="space-y-1">
              {asignaturasCalculadas.map((asig) => (
                <AsignaturaItem
                  key={asig.id}
                  asignatura={asig}
                  isSelected={selectedAsignaturaId === asig.id}
                  onClick={() => onSelectAsignatura(
                    selectedAsignaturaId === asig.id ? null : asig.id
                  )}
                />
              ))}
              {asignaturasCalculadas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay asignaturas en este semestre
                </p>
              )}
            </div>
          </div>
          
          {/* FCT Status */}
          {totalAsignaturas > 0 && (
            <>
              <div className="mx-4 border-t" />
              <FCTCompacto
                fct={fct}
                asignaturasAprobadas={asignaturasAprobadas}
                totalAsignaturas={totalAsignaturas}
              />
            </>
          )}
        </>
      )}
      
      {/* Tab Historial: mensaje informativo */}
      {activeTab === 'historial' && (
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Vuelve a la pestaña "Semestre" para ver y gestionar las notas de las asignaturas.
          </p>
        </div>
      )}
    </aside>
  )
})
