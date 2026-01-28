'use client'

import { useMemo } from 'react'
import { ArrowLeft, Calculator, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGradeColor, getGradeBadge } from '@/lib/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotaInput } from '@/components/ui/nota-input'
import {
  type AsignaturaNotas,
  type PAC,
  type RA,
  calcularMediaPACsRA,
  calcularNotaRA,
  calcularNotaModulo,
} from '@/hooks/useNotas'


// ============================================
// TIPOS
// ============================================

interface AsignaturaDetailProps {
  asignatura: AsignaturaNotas
  fctNota: number | null
  onBack: () => void
  onPACNotaSave: (userAsignaturaId: string, pacId: string, nota: number | null) => void
  onExamenNotaSave: (userAsignaturaId: string, nota: number | null) => void
  isPACPending: boolean
  isExamenPending: boolean
  isPACSuccess: boolean
  isExamenSuccess: boolean
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AsignaturaDetail({
  asignatura,
  fctNota,
  onBack,
  onPACNotaSave,
  onExamenNotaSave,
  isPACPending,
  isExamenPending,
  isPACSuccess,
  isExamenSuccess
}: AsignaturaDetailProps) {
  // TODOS LOS HOOKS DEBEN IR PRIMERO (antes de cualquier return condicional)

  // Calcular notas por RA
  const notasRAs = useMemo(() => {
    if (!asignatura.tieneGD) return new Map()

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
    if (!asignatura.tieneGD) return { notaSinFCT: null, notaConFCT: null, todosRAsAprobados: false }

    const notasMap = new Map<string, number>()
    notasRAs.forEach((value, key) => {
      if (value.resultado.notaRA !== null) {
        notasMap.set(key, value.resultado.notaRA)
      }
    })
    return calcularNotaModulo(asignatura.ras, notasMap, fctNota)
  }, [notasRAs, asignatura.ras, asignatura.tieneGD, fctNota])

  // Calcular nota mínima necesaria en examen para aprobar
  const notaMinimaExamen = useMemo(() => {
    if (!asignatura.tieneGD) return null
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

  // Calcular media EC global
  const mediaECGlobal = useMemo(() => {
    if (!asignatura.tieneGD) return null

    const medias = Array.from(notasRAs.values())
      .filter(v => v.resultado.mediaEC !== null)
      .map(v => v.resultado.mediaEC!)
    return medias.length > 0
      ? medias.reduce((a, b) => a + b, 0) / medias.length
      : null
  }, [notasRAs, asignatura.tieneGD])

  // Si no tiene GD, mostrar estado vacío (DESPUÉS de todos los hooks)
  if (!asignatura.tieneGD) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al resumen
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{asignatura.nombre}</span>
              <Badge color="gray">Sin datos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg mb-2">Sin datos de evaluación disponibles</p>
              <p className="text-sm">
                Los datos de PACs y RAs de esta asignatura aún no están disponibles para este semestre.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const badge = getGradeBadge(notaModulo.notaSinFCT)

  return (
    <div className="p-6 space-y-6 overflow-y-auto scrollbar-hide">
      {/* Botón volver */}
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Volver al resumen
      </Button>

      {/* Header de la asignatura */}
      <Card className="bg-gradient-to-r from-vt-blue/5 to-vt-blue/10">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{asignatura.nombre}</h2>
              <p className="text-sm text-muted-foreground">{asignatura.codigo}</p>
            </div>
            <Badge color={badge.color}>{badge.label}</Badge>
          </div>

          {/* Nota grande central */}
          <div className="text-center py-4">
            <p className={cn('text-5xl font-bold', getGradeColor(notaModulo.notaSinFCT))}>
              {notaModulo.notaSinFCT !== null ? notaModulo.notaSinFCT.toFixed(2) : '—'}
            </p>
            {fctNota !== null && notaModulo.notaConFCT !== null && (
              <p className="text-sm text-muted-foreground mt-2">
                Con FCT: {notaModulo.notaConFCT.toFixed(2)} (90% × {notaModulo.notaSinFCT?.toFixed(2)} + 10% × {fctNota.toFixed(1)})
              </p>
            )}
          </div>

          {/* Stats: Media EC y Examen */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-card rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Media Eval. Continua</p>
              <p className={cn('text-xl font-bold', getGradeColor(mediaECGlobal))}>
                {mediaECGlobal !== null ? mediaECGlobal.toFixed(2) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">40% por RA</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Examen Final (PEF)</p>
              <p className={cn('text-xl font-bold', getGradeColor(asignatura.notaExamen))}>
                {asignatura.notaExamen !== null ? asignatura.notaExamen.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">60% por RA</p>
            </div>
          </div>

          {/* Alerta de nota mínima */}
          {notaMinimaExamen !== null && notaMinimaExamen > 0 && (
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg mt-4',
              notaMinimaExamen > 5
                ? 'bg-vt-yellow/10 text-vt-yellow-dark dark:text-vt-yellow-light'
                : 'bg-vt-green/10 text-vt-green-dark dark:text-vt-green-light'
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
        </CardContent>
      </Card>

      {/* RAs con sus PACs */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Resultados de Aprendizaje (RAs)
        </h3>

        {asignatura.ras.map((ra) => {
          const { resultado } = notasRAs.get(ra.id)!
          const pacsDelRA = asignatura.pacs.filter((p) => p.raId === ra.id)

          return (
            <Card key={ra.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">RA{ra.numero}: {ra.titulo}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Peso en módulo: {ra.pesoHoras}% (por horas)
                    </p>
                  </div>
                  <span className={cn('text-lg font-bold', getGradeColor(resultado.notaRA))}>
                    {resultado.notaRA !== null ? resultado.notaRA.toFixed(2) : '—'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Tabla de PACs */}
                <div className="space-y-2">
                  {pacsDelRA.map((pac) => (
                    <div
                      key={pac.id}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          pac.tipo === 'interactiva' ? 'bg-vt-blue' : 'bg-vt-purple'
                        )} />
                        <span className="truncate">{pac.titulo}</span>
                        <Badge 
                          color={pac.tipo === 'interactiva' ? 'gray' : 'gray'} 
                          colorStyle="outline" 
                          size="adjusted" 
                          className="flex-shrink-0">
                          {pac.tipo === 'interactiva' ? 'Interactiva' : 'Desarrollo'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({pac.pesoEnRA}%)
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
                      {resultado.mediaEC?.toFixed(2) ?? '—'} → {resultado.mediaEC !== null
                        ? (resultado.mediaEC * 0.4).toFixed(2)
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Examen (60%):</span>
                    <span>
                      {asignatura.notaExamen?.toFixed(2) ?? '—'} → {asignatura.notaExamen !== null
                        ? (asignatura.notaExamen * 0.6).toFixed(2)
                        : '—'}
                      {asignatura.notaExamen !== null && asignatura.notaExamen < 5 && (
                        <span className="text-vt-red ml-1">(≥5 requerido)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Nota RA{ra.numero}:</span>
                    <span className={resultado.aprobado ? 'text-vt-green' : resultado.notaRA !== null ? 'text-vt-red' : ''}>
                      {resultado.notaRA?.toFixed(2) ?? '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Examen Final */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Examen Final Presencial (PEF)</p>
                <p className="text-xs text-muted-foreground">
                  60% de cada RA · Mínimo 5 para que sume la EC
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
        </CardContent>
      </Card>
    </div>
  )
}
