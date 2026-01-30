'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NotasSidebar, type AsignaturaCalculada, type EstadoAsignatura } from '@/components/notas/NotasSidebar'
import { NotasDashboard } from '@/components/notas/NotasDashboard'
import { AsignaturaDetail } from '@/components/notas/AsignaturaDetail'
import { HistorialView } from '@/components/notas/HistorialView'
import { NotasSimplificado } from '@/components/notas/NotasSimplificado'
import { NotasCalculator } from '@/components/notas/NotasCalculator'
import {
  useNotas,
  useSavePACNota,
  useSaveExamenNota,
  useSaveFCTNota,
  calcularNotaRA,
  calcularNotaModulo,
  type AsignaturaNotas,
} from '@/hooks/useNotas'
import { useUserSemesters, useSemestreActivo } from '@/hooks/useUserSemesters'

// ============================================
// COMPONENTE: LoadingSkeleton
// ============================================

function LoadingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar skeleton */}
      <div className="w-[300px] border-r bg-muted/30 p-4 space-y-4 hidden lg:block">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full mt-4" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2 mt-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: MobileView
// ============================================

interface MobileViewProps {
  selectedSemestreId: string | null
  semestreNombre: string
  isActiveSemestre: boolean
}

function MobileView({ selectedSemestreId, semestreNombre, isActiveSemestre }: MobileViewProps) {
  // En mobile, reutilizamos las vistas existentes que ya son responsive
  if (!isActiveSemestre && selectedSemestreId) {
    return (
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus calificaciones
          </p>
        </div>
        <NotasSimplificado
          semestreId={selectedSemestreId}
          semestreNombre={semestreNombre}
        />
      </div>
    )
  }

  // Para el semestre activo, usar la calculadora original que ya es responsive
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">📊 Notas</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus calificaciones
        </p>
      </div>
      <NotasCalculator />
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function NotasPage() {
  // Estados de navegación
  const [activeTab, setActiveTab] = useState<'semestre' | 'historial'>('semestre')
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<string | null>(null)
  const [selectedSemestreId, setSelectedSemestreId] = useState<string | null>(null)

  // Datos de semestres
  const { data: semestres } = useUserSemesters()
  const { data: semestreActivo } = useSemestreActivo()

  // Semestre actual (seleccionado o activo)
  const currentSemestreId = selectedSemestreId || semestreActivo?.id || null
  const currentSemestre = semestres?.find(s => s.id === currentSemestreId)
  const isActiveSemestre = currentSemestre?.activo ?? true

  // Datos de notas
  const { data, isLoading, error, refetch } = useNotas(isActiveSemestre ? undefined : currentSemestreId || undefined)

  // Mutaciones
  const savePACNota = useSavePACNota()
  const saveExamenNota = useSaveExamenNota()
  const saveFCTNota = useSaveFCTNota()

  // Handlers
  const handlePACNotaSave = useCallback((userAsignaturaId: string, pacId: string, nota: number | null) => {
    savePACNota.mutate({ userAsignaturaId, pacId, nota })
  }, [savePACNota])

  const handleExamenNotaSave = useCallback((userAsignaturaId: string, nota: number | null) => {
    saveExamenNota.mutate({ userAsignaturaId, nota })
  }, [saveExamenNota])

  const handleFCTNotaSave = useCallback((nota: number | null) => {
    saveFCTNota.mutate({ nota })
  }, [saveFCTNota])

  // Reset asignatura seleccionada al cambiar de semestre
  useEffect(() => {
    setSelectedAsignaturaId(null)
  }, [currentSemestreId])

  // ============================================
  // CÁLCULOS CENTRALIZADOS (un solo useMemo)
  // ============================================
  const datosCalculados = useMemo(() => {
    if (!data?.asignaturas) {
      return {
        asignaturasCalculadas: [] as AsignaturaCalculada[],
        stats: { 
          media: null as number | null, 
          aprobadas: 0, 
          suspensas: 0, 
          pendientes: 0, 
          total: 0 
        }
      }
    }

    let aprobadas = 0
    let suspensas = 0
    let pendientes = 0
    let sumaNotas = 0
    let countNotas = 0
    const total = data.asignaturas.length

    const asignaturasCalculadas: AsignaturaCalculada[] = data.asignaturas.map(asig => {
      // Si no tiene GD, retornar datos mínimos
      if (!asig.tieneGD) {
        pendientes++
        return {
          id: asig.id,
          nombre: asig.nombre,
          codigo: asig.codigo,
          estado: 'sin_notas' as EstadoAsignatura,
          notaModulo: null,
          rasCompletados: 0,
          rasTotal: 0
        }
      }

      // Calcular notas de cada RA (una sola vez)
      const notasMap = new Map<string, number>()
      let todosRAsAprobados = true
      let rasCompletados = 0

      asig.ras.forEach(ra => {
        const pacsDelRA = asig.pacs.filter(p => p.raId === ra.id)
        const resultado = calcularNotaRA(pacsDelRA, asig.notaExamen)
        if (resultado.notaRA !== null) {
          notasMap.set(ra.id, resultado.notaRA)
          if (resultado.notaRA < 5) {
            todosRAsAprobados = false
          } else {
            rasCompletados++
          }
        } else {
          todosRAsAprobados = false
        }
      })

      // Calcular nota del módulo (con FCT para stats de media)
      const notaModuloResult = calcularNotaModulo(asig.ras, notasMap, data.fct.nota)
      const notaModulo = notaModuloResult.notaSinFCT

      // Determinar estado
      const tieneNotaPAC = asig.pacs.some(p => p.nota !== null)
      const tieneExamen = asig.notaExamen !== null
      
      let estado: EstadoAsignatura = 'sin_notas'
      
      if (!tieneNotaPAC && !tieneExamen) {
        estado = 'sin_notas'
      } else if (!tieneExamen) {
        estado = 'en_progreso'
      } else if (asig.notaFinalCalculada !== null) {
        estado = asig.notaFinalCalculada >= 5 ? 'aprobada' : 'suspensa'
      } else if (notaModulo !== null) {
        const examenAprobado = asig.notaExamen! >= 5
        estado = (examenAprobado && notaModulo >= 5) ? 'aprobada' : 'suspensa'
      } else {
        estado = 'en_progreso'
      }

      // Actualizar estadísticas
      if (notaModulo !== null) {
        // Sumar nota para la media (con FCT si existe)
        sumaNotas += data.fct.nota !== null && notaModuloResult.notaConFCT !== null
          ? notaModuloResult.notaConFCT
          : notaModulo
        countNotas++

        const examenAprobado = asig.notaExamen !== null && asig.notaExamen >= 5
        if (todosRAsAprobados && examenAprobado && notaModulo >= 5) {
          aprobadas++
        } else {
          suspensas++
        }
      } else {
        pendientes++
      }

      return {
        id: asig.id,
        nombre: asig.nombre,
        codigo: asig.codigo,
        estado,
        notaModulo,
        rasCompletados,
        rasTotal: asig.ras.length
      }
    })

    return {
      asignaturasCalculadas,
      stats: { 
        media: countNotas > 0 ? sumaNotas / countNotas : null,
        aprobadas, 
        suspensas,
        pendientes,
        total 
      }
    }
  }, [data])

  // Asignatura seleccionada
  const selectedAsignatura = data?.asignaturas?.find(a => a.id === selectedAsignaturaId) || null

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">Error al cargar las notas</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state (no semestre)
  if (!data?.semestreActivo && !currentSemestreId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg mb-2">📅 No hay semestre activo</p>
              <p className="text-sm">
                No se ha configurado un semestre activo en el sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Para semestres inactivos, usar vista simplificada
  if (!isActiveSemestre && currentSemestreId && currentSemestre) {
    return (
      <div className="p-6">
        <NotasSimplificado
          semestreId={currentSemestreId}
          semestreNombre={currentSemestre.nombre}
        />
      </div>
    )
  }

  // Render principal: Layout Master-Detail
  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden">
        <MobileView
          selectedSemestreId={currentSemestreId}
          semestreNombre={currentSemestre?.nombre || data?.semestreActivo?.nombre || ''}
          isActiveSemestre={isActiveSemestre}
        />
      </div>

      {/* Desktop View: Master-Detail Layout */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <NotasSidebar
          asignaturasCalculadas={datosCalculados.asignaturasCalculadas}
          fct={data?.fct || { id: null, nota: null, empresa: null, fechaInicio: null, fechaFin: null, horasTotales: 400 }}
          selectedAsignaturaId={selectedAsignaturaId}
          onSelectAsignatura={setSelectedAsignaturaId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedSemestreId={currentSemestreId}
          onSemestreChange={setSelectedSemestreId}
          asignaturasAprobadas={datosCalculados.stats.aprobadas}
          totalAsignaturas={datosCalculados.stats.total}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-muted/50 rounded-lg shadow-lg scrollbar-hide">
          {activeTab === 'historial' ? (
            // Vista Historial
            <div className="p-6">
              <HistorialView />
            </div>
          ) : selectedAsignatura ? (
            // Vista Detalle Asignatura
            <AsignaturaDetail
              asignatura={selectedAsignatura}
              fctNota={data?.fct.nota || null}
              onBack={() => setSelectedAsignaturaId(null)}
              onPACNotaSave={handlePACNotaSave}
              onExamenNotaSave={handleExamenNotaSave}
              isPACPending={savePACNota.isPending}
              isExamenPending={saveExamenNota.isPending}
              isPACSuccess={savePACNota.isSuccess}
              isExamenSuccess={saveExamenNota.isSuccess}
            />
          ) : (
            // Vista Dashboard (default)
            <NotasDashboard
              stats={datosCalculados.stats}
              fct={data?.fct || { id: null, nota: null, empresa: null, fechaInicio: null, fechaFin: null, horasTotales: 400 }}
              semestreNombre={data?.semestreActivo?.nombre || ''}
              onFCTNotaSave={handleFCTNotaSave}
              isFCTPending={saveFCTNota.isPending}
              isFCTSuccess={saveFCTNota.isSuccess}
            />
          )}
        </main>
      </div>
    </>
  )
}
