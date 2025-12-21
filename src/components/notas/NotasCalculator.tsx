'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Calculator, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

interface RA {
  id: string
  nombre: string
  peso: number // Porcentaje (0-100)
}

interface PAC {
  id: string
  nombre: string
  tipo: 'interactiva' | 'desarrollo'
  raId: string
  nota: number | null
  pesoEnRA: number // Porcentaje del RA que representa esta PAC
}

interface Asignatura {
  id: string
  nombre: string
  codigo: string
  ras: RA[]
  pacs: PAC[]
  vtNota: number | null
  vtPeso: number
  examenNota: number | null
  examenPeso: number
}

// Datos de ejemplo - TODO: Conectar con Supabase
const MOCK_ASIGNATURAS: Asignatura[] = [
  {
    id: '1',
    nombre: 'Programación',
    codigo: 'PRO',
    ras: [
      { id: 'ra1', nombre: 'RA1 - Estructuras de control', peso: 25 },
      { id: 'ra2', nombre: 'RA2 - POO Básica', peso: 25 },
      { id: 'ra3', nombre: 'RA3 - POO Avanzada', peso: 25 },
      { id: 'ra4', nombre: 'RA4 - Colecciones', peso: 25 },
    ],
    pacs: [
      { id: 'pac1', nombre: 'PAC 1 - Interactiva', tipo: 'interactiva', raId: 'ra1', nota: 8.5, pesoEnRA: 40 },
      { id: 'pac2', nombre: 'PAC 1 - Desarrollo', tipo: 'desarrollo', raId: 'ra1', nota: 7.0, pesoEnRA: 60 },
      { id: 'pac3', nombre: 'PAC 2 - Interactiva', tipo: 'interactiva', raId: 'ra2', nota: 9.0, pesoEnRA: 40 },
      { id: 'pac4', nombre: 'PAC 2 - Desarrollo', tipo: 'desarrollo', raId: 'ra2', nota: null, pesoEnRA: 60 },
      { id: 'pac5', nombre: 'PAC 3 - Interactiva', tipo: 'interactiva', raId: 'ra3', nota: null, pesoEnRA: 40 },
      { id: 'pac6', nombre: 'PAC 3 - Desarrollo', tipo: 'desarrollo', raId: 'ra3', nota: null, pesoEnRA: 60 },
    ],
    vtNota: 8.0,
    vtPeso: 10,
    examenNota: null,
    examenPeso: 50,
  },
  {
    id: '2',
    nombre: 'Base de Datos',
    codigo: 'BBD',
    ras: [
      { id: 'ra1', nombre: 'RA1 - Modelo relacional', peso: 30 },
      { id: 'ra2', nombre: 'RA2 - SQL', peso: 40 },
      { id: 'ra3', nombre: 'RA3 - Normalización', peso: 30 },
    ],
    pacs: [
      { id: 'pac1', nombre: 'PAC 1', tipo: 'desarrollo', raId: 'ra1', nota: 7.5, pesoEnRA: 100 },
      { id: 'pac2', nombre: 'PAC 2', tipo: 'desarrollo', raId: 'ra2', nota: 8.0, pesoEnRA: 100 },
      { id: 'pac3', nombre: 'PAC 3', tipo: 'desarrollo', raId: 'ra3', nota: null, pesoEnRA: 100 },
    ],
    vtNota: 7.5,
    vtPeso: 10,
    examenNota: null,
    examenPeso: 50,
  },
]

function getGradeColor(nota: number | null) {
  if (nota === null) return 'text-muted-foreground'
  if (nota >= 9) return 'text-vt-green'
  if (nota >= 7) return 'text-vt-blue'
  if (nota >= 5) return 'text-vt-yellow-dark'
  return 'text-vt-red'
}

// Usado para el Progress component si se necesita personalizar
function _getProgressColor(nota: number | null) {
  if (nota === null) return 'bg-muted'
  if (nota >= 9) return 'bg-vt-green'
  if (nota >= 7) return 'bg-vt-blue'
  if (nota >= 5) return 'bg-vt-yellow'
  return 'bg-vt-red'
}

interface AsignaturaCardProps {
  asignatura: Asignatura
  onNotaChange: (asignaturaId: string, field: string, value: number | null) => void
}

function AsignaturaCard({ asignatura, onNotaChange }: AsignaturaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calcular nota de evaluación continua (PACs por RA)
  const calcularNotaEC = useMemo(() => {
    let totalPonderado = 0
    let pesoTotal = 0

    asignatura.ras.forEach((ra) => {
      const pacsDelRA = asignatura.pacs.filter((p) => p.raId === ra.id)
      let notaRA = 0
      let pesoRATotal = 0

      pacsDelRA.forEach((pac) => {
        if (pac.nota !== null) {
          notaRA += pac.nota * (pac.pesoEnRA / 100)
          pesoRATotal += pac.pesoEnRA
        }
      })

      if (pesoRATotal > 0) {
        // Normalizar si no están todas las PACs
        notaRA = (notaRA / pesoRATotal) * 100
        totalPonderado += notaRA * (ra.peso / 100)
        pesoTotal += ra.peso
      }
    })

    return pesoTotal > 0 ? totalPonderado / (pesoTotal / 100) : null
  }, [asignatura])

  // Calcular nota final estimada
  const calcularNotaFinal = useMemo(() => {
    const notaEC = calcularNotaEC
    const { vtNota, vtPeso, examenNota, examenPeso } = asignatura
    
    // Peso de EC es lo que queda después de VT y Examen
    const ecPeso = 100 - vtPeso - examenPeso

    let total = 0
    let pesoContabilizado = 0

    if (notaEC !== null) {
      total += notaEC * (ecPeso / 100)
      pesoContabilizado += ecPeso
    }

    if (vtNota !== null) {
      total += vtNota * (vtPeso / 100)
      pesoContabilizado += vtPeso
    }

    if (examenNota !== null) {
      total += examenNota * (examenPeso / 100)
      pesoContabilizado += examenPeso
    }

    return pesoContabilizado > 0 ? (total / pesoContabilizado) * 100 : null
  }, [asignatura, calcularNotaEC])

  // Calcular nota mínima necesaria en examen para aprobar
  const notaMinimaExamen = useMemo(() => {
    if (asignatura.examenNota !== null) return null
    
    const notaEC = calcularNotaEC
    const { vtNota, vtPeso, examenPeso } = asignatura
    const ecPeso = 100 - vtPeso - examenPeso
    
    let acumulado = 0
    if (notaEC !== null) acumulado += notaEC * (ecPeso / 100)
    if (vtNota !== null) acumulado += vtNota * (vtPeso / 100)
    
    // Para aprobar (5), necesitamos: acumulado + examen * examenPeso/100 >= 5
    const necesario = (5 - acumulado) / (examenPeso / 100)
    
    return Math.max(0, Math.min(10, necesario))
  }, [asignatura, calcularNotaEC])

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
          <div className="text-right">
            <p className={cn('text-2xl font-bold', getGradeColor(calcularNotaFinal))}>
              {calcularNotaFinal !== null ? calcularNotaFinal.toFixed(2) : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Nota estimada</p>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-3">
          <Progress 
            value={calcularNotaFinal !== null ? calcularNotaFinal * 10 : 0} 
            className="h-2"
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Resumen de notas */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Eval. Continua</p>
              <p className={cn('text-xl font-bold', getGradeColor(calcularNotaEC))}>
                {calcularNotaEC !== null ? calcularNotaEC.toFixed(2) : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">VT ({asignatura.vtPeso}%)</p>
              <p className={cn('text-xl font-bold', getGradeColor(asignatura.vtNota))}>
                {asignatura.vtNota !== null ? asignatura.vtNota.toFixed(1) : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Examen ({asignatura.examenPeso}%)</p>
              <p className={cn('text-xl font-bold', getGradeColor(asignatura.examenNota))}>
                {asignatura.examenNota !== null ? asignatura.examenNota.toFixed(1) : '-'}
              </p>
            </div>
          </div>

          {/* Alerta de nota mínima */}
          {notaMinimaExamen !== null && notaMinimaExamen > 0 && (
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              notaMinimaExamen > 5 ? 'bg-vt-yellow/10 text-vt-yellow-dark' : 'bg-vt-green/10 text-vt-green'
            )}>
              {notaMinimaExamen > 5 ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">
                Necesitas un <strong>{notaMinimaExamen.toFixed(2)}</strong> en el examen para aprobar
              </p>
            </div>
          )}

          {/* PACs por RA */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Evaluación Continua por RA
            </h4>
            
            {asignatura.ras.map((ra) => {
              const pacsDelRA = asignatura.pacs.filter((p) => p.raId === ra.id)
              
              return (
                <div key={ra.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm">{ra.nombre}</p>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {ra.peso}% del total
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {pacsDelRA.map((pac) => (
                      <div 
                        key={pac.id}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            pac.tipo === 'interactiva' ? 'bg-vt-blue' : 'bg-vt-purple'
                          )} />
                          <span>{pac.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            ({pac.pesoEnRA}%)
                          </span>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={pac.nota ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseFloat(e.target.value)
                            onNotaChange(asignatura.id, `pac_${pac.id}`, val)
                          }}
                          className="w-20 h-8 text-center"
                          placeholder="-"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* VT y Examen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                Nota Videotutoría ({asignatura.vtPeso}%)
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={asignatura.vtNota ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value)
                  onNotaChange(asignatura.id, 'vtNota', val)
                }}
                className="w-full"
                placeholder="Sin nota"
              />
            </div>
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                Nota Examen ({asignatura.examenPeso}%)
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={asignatura.examenNota ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value)
                  onNotaChange(asignatura.id, 'examenNota', val)
                }}
                className="w-full"
                placeholder="Sin nota"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function NotasCalculator() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>(MOCK_ASIGNATURAS)

  const handleNotaChange = (asignaturaId: string, field: string, value: number | null) => {
    setAsignaturas((prev) =>
      prev.map((asig) => {
        if (asig.id !== asignaturaId) return asig

        if (field === 'vtNota' || field === 'examenNota') {
          return { ...asig, [field]: value }
        }

        if (field.startsWith('pac_')) {
          const pacId = field.replace('pac_', '')
          return {
            ...asig,
            pacs: asig.pacs.map((pac) =>
              pac.id === pacId ? { ...pac, nota: value } : pac
            ),
          }
        }

        return asig
      })
    )
  }

  // Calcular media global
  const mediaGlobal = useMemo(() => {
    const notasValidas = asignaturas
      .map((asig) => {
        const notaEC = (() => {
          let totalPonderado = 0
          let pesoTotal = 0
          asig.ras.forEach((ra) => {
            const pacsDelRA = asig.pacs.filter((p) => p.raId === ra.id)
            let notaRA = 0
            let pesoRATotal = 0
            pacsDelRA.forEach((pac) => {
              if (pac.nota !== null) {
                notaRA += pac.nota * (pac.pesoEnRA / 100)
                pesoRATotal += pac.pesoEnRA
              }
            })
            if (pesoRATotal > 0) {
              notaRA = (notaRA / pesoRATotal) * 100
              totalPonderado += notaRA * (ra.peso / 100)
              pesoTotal += ra.peso
            }
          })
          return pesoTotal > 0 ? totalPonderado / (pesoTotal / 100) : null
        })()

        const ecPeso = 100 - asig.vtPeso - asig.examenPeso
        let total = 0
        let pesoContabilizado = 0

        if (notaEC !== null) {
          total += notaEC * (ecPeso / 100)
          pesoContabilizado += ecPeso
        }
        if (asig.vtNota !== null) {
          total += asig.vtNota * (asig.vtPeso / 100)
          pesoContabilizado += asig.vtPeso
        }
        if (asig.examenNota !== null) {
          total += asig.examenNota * (asig.examenPeso / 100)
          pesoContabilizado += asig.examenPeso
        }

        return pesoContabilizado > 0 ? (total / pesoContabilizado) * 100 : null
      })
      .filter((n): n is number => n !== null)

    return notasValidas.length > 0
      ? notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
      : null
  }, [asignaturas])

  return (
    <div className="space-y-6">
      {/* Resumen global */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Media global estimada</p>
              <p className={cn('text-4xl font-bold', getGradeColor(mediaGlobal))}>
                {mediaGlobal !== null ? mediaGlobal.toFixed(2) : '-'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Asignaturas</p>
              <p className="text-2xl font-bold">{asignaturas.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de asignaturas */}
      <div className="space-y-4">
        {asignaturas.map((asignatura) => (
          <AsignaturaCard
            key={asignatura.id}
            asignatura={asignatura}
            onNotaChange={handleNotaChange}
          />
        ))}
      </div>
    </div>
  )
}
