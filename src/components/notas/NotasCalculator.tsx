'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, Calculator, TrendingUp, AlertCircle, Building2, GraduationCap, Loader2, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  useNotas, 
  useSavePACNota, 
  useSaveExamenNota, 
  useSaveFCTNota,
  calcularMediaPACsRA,
  calcularNotaRA,
  calcularNotaModulo,
  type AsignaturaNotas,
  type PAC,
  type RA,
  type FCTData
} from '@/hooks/useNotas'

// ============================================
// UTILIDADES
// ============================================

function getGradeColor(nota: number | null) {
  if (nota === null) return 'text-muted-foreground'
  if (nota >= 9) return 'text-emerald-600 dark:text-emerald-400'
  if (nota >= 7) return 'text-blue-600 dark:text-blue-400'
  if (nota >= 5) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getGradeBadge(nota: number | null) {
  if (nota === null) return { label: 'Sin evaluar', variant: 'secondary' as const }
  if (nota >= 9) return { label: 'Sobresaliente', variant: 'default' as const }
  if (nota >= 7) return { label: 'Notable', variant: 'default' as const }
  if (nota >= 5) return { label: 'Aprobado', variant: 'secondary' as const }
  return { label: 'Suspenso', variant: 'destructive' as const }
}

// ============================================
// HOOK: useDebounce
// ============================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ============================================
// COMPONENTE: NotaInput con auto-save
// ============================================

interface NotaInputProps {
  value: number | null
  onSave: (value: number | null) => void
  isPending?: boolean
  isSuccess?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

function NotaInput({ 
  value, 
  onSave, 
  isPending = false, 
  isSuccess = false,
  disabled = false, 
  className,
  placeholder = '-'
}: NotaInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? '')
  const [showSuccess, setShowSuccess] = useState(false)
  const lastSavedRef = useRef(value)
  
  // Sincronizar con valor externo cuando cambia
  useEffect(() => {
    if (value !== lastSavedRef.current) {
      setLocalValue(value?.toString() ?? '')
      lastSavedRef.current = value
    }
  }, [value])
  
  // Mostrar checkmark cuando se guarda exitosamente
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])
  
  const handleBlur = useCallback(() => {
    const numValue = localValue === '' ? null : parseFloat(localValue)
    
    // Validar rango
    if (numValue !== null && (isNaN(numValue) || numValue < 0 || numValue > 10)) {
      setLocalValue(value?.toString() ?? '')
      return
    }
    
    // Solo guardar si cambió
    if (numValue !== value) {
      lastSavedRef.current = numValue
      onSave(numValue)
    }
  }, [localValue, value, onSave])
  
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        max={10}
        step={0.1}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled || isPending}
        className={cn('text-center', className)}
        placeholder={placeholder}
      />
      {isPending && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
      )}
      {showSuccess && !isPending && (
        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      )}
    </div>
  )
}

// ============================================
// COMPONENTE: AsignaturaCard
// ============================================

interface AsignaturaCardProps {
  asignatura: AsignaturaNotas
  fctNota: number | null
  onPACNotaSave: (userAsignaturaId: string, pacId: string, nota: number | null) => void
  onExamenNotaSave: (userAsignaturaId: string, nota: number | null) => void
  isPACPending: boolean
  isExamenPending: boolean
  isPACSuccess: boolean
  isExamenSuccess: boolean
}

function AsignaturaCard({ 
  asignatura, 
  fctNota,
  onPACNotaSave, 
  onExamenNotaSave,
  isPACPending,
  isExamenPending,
  isPACSuccess,
  isExamenSuccess
}: AsignaturaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calcular notas por RA
  const notasRAs = useMemo(() => {
    const map = new Map<string, { resultado: ReturnType<typeof calcularNotaRA>, ra: RA }>()
    
    asignatura.ras.forEach(ra => {
      const pacsDelRA = asignatura.pacs.filter(p => p.raId === ra.id)
      const resultado = calcularNotaRA(pacsDelRA, asignatura.notaExamen)
      map.set(ra.id, { resultado, ra })
    })
    
    return map
  }, [asignatura])

  // Calcular nota del módulo
  const notaModulo = useMemo(() => {
    const notasMap = new Map<string, number>()
    notasRAs.forEach((value, key) => {
      if (value.resultado.notaRA !== null) {
        notasMap.set(key, value.resultado.notaRA)
      }
    })
    return calcularNotaModulo(asignatura.ras, notasMap, fctNota)
  }, [notasRAs, asignatura.ras, fctNota])

  // Calcular nota mínima necesaria en examen para aprobar
  const notaMinimaExamen = useMemo(() => {
    if (asignatura.notaExamen !== null) return null
    
    let sumaEC = 0
    let countRAs = 0
    
    asignatura.ras.forEach(ra => {
      const pacsDelRA = asignatura.pacs.filter(p => p.raId === ra.id)
      const { media } = calcularMediaPACsRA(pacsDelRA)
      if (media !== null) {
        sumaEC += media
        countRAs++
      }
    })
    
    if (countRAs === 0) return null
    
    const mediaEC = sumaEC / countRAs
    const necesario = (5 - mediaEC * 0.4) / 0.6
    
    return Math.max(0, Math.min(10, necesario))
  }, [asignatura])

  // Si no tiene GD, mostrar estado vacío
  if (!asignatura.tieneGD) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📚 {asignatura.nombre}</span>
            <Badge variant="secondary">Sin datos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">📄 Sin datos de evaluación disponibles</p>
            <p className="text-sm">
              Los datos de PACs y RAs de esta asignatura aún no están disponibles para este semestre.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const badge = getGradeBadge(notaModulo.notaSinFCT)

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-lg">{asignatura.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground">{asignatura.codigo}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <p className={cn('text-2xl font-bold', getGradeColor(notaModulo.notaSinFCT))}>
                {notaModulo.notaSinFCT !== null ? notaModulo.notaSinFCT.toFixed(2) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {fctNota !== null ? 'Con FCT: ' + notaModulo.notaConFCT?.toFixed(2) : 'Sin FCT'}
              </p>
            </div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </div>
        
        <div className="mt-3">
          <Progress 
            value={notaModulo.notaSinFCT !== null ? notaModulo.notaSinFCT * 10 : 0} 
            className="h-2"
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Resumen de notas */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Media Eval. Continua</p>
              <p className={cn('text-xl font-bold', getGradeColor(
                Array.from(notasRAs.values()).reduce((acc, v) => 
                  acc + (v.resultado.mediaEC ?? 0), 0) / notasRAs.size || null
              ))}>
                {(() => {
                  const medias = Array.from(notasRAs.values())
                    .filter(v => v.resultado.mediaEC !== null)
                    .map(v => v.resultado.mediaEC!)
                  return medias.length > 0 
                    ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(2)
                    : '-'
                })()}
              </p>
              <p className="text-xs text-muted-foreground">40% por RA</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Examen Final (PEF)</p>
              <p className={cn('text-xl font-bold', getGradeColor(asignatura.notaExamen))}>
                {asignatura.notaExamen !== null ? asignatura.notaExamen.toFixed(1) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">60% por RA</p>
            </div>
          </div>

          {/* Alerta de nota mínima */}
          {notaMinimaExamen !== null && notaMinimaExamen > 0 && (
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              notaMinimaExamen > 5 
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' 
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            )}>
              {notaMinimaExamen > 5 ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">
                Necesitas un <strong>{notaMinimaExamen.toFixed(2)}</strong> en el examen para aprobar
                {notaMinimaExamen < 5 && ' (ya llevas buena base!)'}
              </p>
            </div>
          )}

          {/* RAs con sus PACs */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Resultados de Aprendizaje (RAs)
            </h4>
            
            {asignatura.ras.map((ra) => {
              const { resultado } = notasRAs.get(ra.id)!
              const pacsDelRA = asignatura.pacs.filter((p) => p.raId === ra.id)
              
              return (
                <div key={ra.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">RA{ra.numero}: {ra.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Peso en módulo: {ra.pesoHoras}% (por horas)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn('text-lg font-bold', getGradeColor(resultado.notaRA))}>
                        {resultado.notaRA !== null ? resultado.notaRA.toFixed(2) : '-'}
                      </span>
                      {resultado.aprobado && <span className="ml-1">✅</span>}
                      {resultado.notaRA !== null && !resultado.aprobado && <span className="ml-1">❌</span>}
                    </div>
                  </div>
                  
                  {/* Tabla de PACs */}
                  <div className="space-y-2 mb-4">
                    {pacsDelRA.map((pac) => (
                      <div 
                        key={pac.id}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            pac.tipo === 'interactiva' ? 'bg-blue-500' : 'bg-purple-500'
                          )} />
                          <span>{pac.titulo}</span>
                          <Badge variant="outline" className="text-xs">
                            {pac.tipo === 'interactiva' ? 'INT' : 'DES'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({pac.pesoEnRA}% del 40% EC)
                          </span>
                        </div>
                        <NotaInput
                          value={pac.nota}
                          onSave={(nota) => onPACNotaSave(asignatura.id, pac.id, nota)}
                          isPending={isPACPending}
                          isSuccess={isPACSuccess}
                          className="w-20 h-8"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Resumen del RA */}
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Media EC (40%):</span>
                      <span>
                        {resultado.mediaEC?.toFixed(2) ?? '-'} → {resultado.mediaEC !== null 
                          ? (resultado.mediaEC * 0.4).toFixed(2) 
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Examen (60%):</span>
                      <span>
                        {asignatura.notaExamen?.toFixed(2) ?? '-'} → {asignatura.notaExamen !== null 
                          ? (asignatura.notaExamen * 0.6).toFixed(2) 
                          : '-'}
                        {asignatura.notaExamen !== null && asignatura.notaExamen < 5 && (
                          <span className="text-red-500 ml-1">(≥5 requerido)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Nota RA{ra.numero}:</span>
                      <span className={resultado.aprobado ? 'text-emerald-600' : 'text-red-600'}>
                        {resultado.notaRA?.toFixed(2) ?? '-'} {resultado.aprobado ? '✅' : resultado.notaRA !== null ? '❌' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Examen Final */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Examen Final Presencial (PEF)</p>
                  <p className="text-xs text-muted-foreground">
                    60% de cada RA • Mínimo 5 para que sume la EC
                  </p>
                </div>
              </div>
              <NotaInput
                value={asignatura.notaExamen}
                onSave={(nota) => onExamenNotaSave(asignatura.id, nota)}
                isPending={isExamenPending}
                isSuccess={isExamenSuccess}
                className="w-24"
                placeholder="Sin nota"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ============================================
// COMPONENTE: FCTSection
// ============================================

interface FCTSectionProps {
  fct: FCTData
  onNotaSave: (value: number | null) => void
  isPending: boolean
  isSuccess: boolean
  asignaturasAprobadas: number
  totalAsignaturas: number
}

function FCTSection({ 
  fct, 
  onNotaSave, 
  isPending,
  isSuccess,
  asignaturasAprobadas, 
  totalAsignaturas 
}: FCTSectionProps) {
  const porcentajeAprobadas = totalAsignaturas > 0 
    ? (asignaturasAprobadas / totalAsignaturas) * 100 
    : 0
  const puedeHacerFCT = porcentajeAprobadas >= 50
  
  return (
    <Card className={cn(
      'border-2',
      puedeHacerFCT ? 'border-emerald-500/30' : 'border-muted'
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <span>FCT - Formación en Centros de Trabajo</span>
          </div>
          <Badge variant={puedeHacerFCT ? 'default' : 'secondary'}>
            {puedeHacerFCT ? 'Disponible' : 'No disponible'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Las prácticas en empresa (FCT) representan el <strong>10%</strong> de la nota final de cada módulo.</p>
          <p className="mt-1">
            Requisito: Tener aprobado al menos el 50% de las asignaturas del grado.
          </p>
        </div>
        
        {/* Progreso hacia FCT */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso hacia FCT</span>
            <span className={porcentajeAprobadas >= 50 ? 'text-emerald-600' : 'text-muted-foreground'}>
              {asignaturasAprobadas}/{totalAsignaturas} asignaturas ({porcentajeAprobadas.toFixed(0)}%)
            </span>
          </div>
          <Progress value={porcentajeAprobadas} className="h-2" />
          {!puedeHacerFCT && totalAsignaturas > 0 && (
            <p className="text-xs text-muted-foreground">
              Te faltan {Math.ceil(totalAsignaturas * 0.5) - asignaturasAprobadas} asignaturas para poder realizar las FCT
            </p>
          )}
        </div>
        
        {/* Input de nota FCT */}
        {puedeHacerFCT && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Nota FCT</p>
              <p className="text-xs text-muted-foreground">
                {fct.empresa ? `Empresa: ${fct.empresa}` : 'Prácticas en empresa (400h)'}
              </p>
            </div>
            <NotaInput
              value={fct.nota}
              onSave={onNotaSave}
              isPending={isPending}
              isSuccess={isSuccess}
              className="w-24"
              placeholder="Sin nota"
            />
          </div>
        )}
        
        {fct.nota !== null && (
          <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              ✅ FCT completada con nota: <strong>{fct.nota.toFixed(1)}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Esta nota se aplicará al 10% de cada módulo
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// COMPONENTE: LoadingSkeleton
// ============================================

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-8 w-16 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-2 w-full mt-3" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function NotasCalculator() {
  // Datos de la BD
  const { data, isLoading, error, refetch } = useNotas()
  
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

  // Calcular estadísticas globales
  const stats = useMemo(() => {
    if (!data?.asignaturas) return { mediaGlobal: null, asignaturasAprobadas: 0, totalAsignaturas: 0 }
    
    let asignaturasAprobadas = 0
    let sumaNotas = 0
    let countNotas = 0
    
    data.asignaturas.forEach(asig => {
      if (!asig.tieneGD) return
      
      const notasMap = new Map<string, number>()
      let todosRAsAprobados = true
      
      asig.ras.forEach(ra => {
        const pacsDelRA = asig.pacs.filter(p => p.raId === ra.id)
        const resultado = calcularNotaRA(pacsDelRA, asig.notaExamen)
        if (resultado.notaRA !== null) {
          notasMap.set(ra.id, resultado.notaRA)
          if (resultado.notaRA < 5) todosRAsAprobados = false
        } else {
          todosRAsAprobados = false
        }
      })
      
      const notaModulo = calcularNotaModulo(asig.ras, notasMap, data.fct.nota)
      
      if (notaModulo.notaSinFCT !== null) {
        sumaNotas += data.fct.nota !== null && notaModulo.notaConFCT !== null 
          ? notaModulo.notaConFCT 
          : notaModulo.notaSinFCT
        countNotas++
        
        if (todosRAsAprobados && asig.notaExamen !== null && asig.notaExamen >= 5) {
          asignaturasAprobadas++
        }
      }
    })
    
    return {
      mediaGlobal: countNotas > 0 ? sumaNotas / countNotas : null,
      asignaturasAprobadas,
      totalAsignaturas: data.asignaturas.filter(a => a.tieneGD).length
    }
  }, [data])

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
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
    )
  }

  // Empty state (no semestre activo)
  if (!data?.semestreActivo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">📅 No hay semestre activo</p>
            <p className="text-sm">
              No se ha configurado un semestre activo en el sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state (no asignaturas)
  if (!data.asignaturas || data.asignaturas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">📚 Sin asignaturas matriculadas</p>
            <p className="text-sm">
              No tienes asignaturas matriculadas en el semestre {data.semestreActivo.nombre}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen global */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Media global {data.fct.nota !== null ? '(con FCT)' : '(sin FCT)'}
              </p>
              <p className={cn('text-4xl font-bold', getGradeColor(stats.mediaGlobal))}>
                {stats.mediaGlobal !== null ? stats.mediaGlobal.toFixed(2) : '-'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.semestreActivo.nombre}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div>
                <p className="text-sm text-muted-foreground">Asignaturas</p>
                <p className="text-2xl font-bold">{stats.totalAsignaturas}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Aprobadas: {stats.asignaturasAprobadas}/{stats.totalAsignaturas}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección FCT */}
      <FCTSection 
        fct={data.fct}
        onNotaSave={handleFCTNotaSave}
        isPending={saveFCTNota.isPending}
        isSuccess={saveFCTNota.isSuccess}
        asignaturasAprobadas={stats.asignaturasAprobadas}
        totalAsignaturas={stats.totalAsignaturas}
      />

      {/* Lista de asignaturas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Asignaturas del semestre ({data.asignaturas.length})
        </h3>
        {data.asignaturas.map((asignatura) => (
          <AsignaturaCard
            key={asignatura.id}
            asignatura={asignatura}
            fctNota={data.fct.nota}
            onPACNotaSave={handlePACNotaSave}
            onExamenNotaSave={handleExamenNotaSave}
            isPACPending={savePACNota.isPending}
            isExamenPending={saveExamenNota.isPending}
            isPACSuccess={savePACNota.isSuccess}
            isExamenSuccess={saveExamenNota.isSuccess}
          />
        ))}
      </div>

      {/* Leyenda */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">Sistema de evaluación ILERNA</h4>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>📐 <strong>Nota por RA</strong> = (Media PACs × 40%) + (Examen × 60%)</p>
            <p>📊 <strong>Nota módulo</strong> = Media ponderada RAs por horas (90%) + FCT (10%)</p>
            <p>⚠️ El examen debe ser ≥5 para que sume la Evaluación Continua</p>
            <p>⚠️ Cada RA debe tener nota ≥5 de forma independiente</p>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> PAC Interactiva
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> PAC Desarrollo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
