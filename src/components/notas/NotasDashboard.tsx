'use client'

import { useState } from 'react'
import { Info, Building2, ChevronDown, ChevronRight, Paperclip, ClipboardPen, ArrowUpRightIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGradeColor } from '@/lib/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { NotaInput } from '@/components/ui/nota-input'
import { type FCTData } from '@/hooks/useNotas'
import Link from 'next/link'

// ============================================
// TIPOS
// ============================================

interface StatsCalculados {
  media: number | null
  aprobadas: number
  suspensas: number
  pendientes: number
  total: number
}

interface NotasDashboardProps {
  stats: StatsCalculados
  fct: FCTData
  semestreNombre: string
  onFCTNotaSave: (nota: number | null) => void
  isFCTPending: boolean
  isFCTSuccess: boolean
}


// ============================================
// COMPONENTE: FCTCard
// ============================================

interface FCTCardProps {
  fct: FCTData
  onNotaSave: (nota: number | null) => void
  isPending: boolean
  isSuccess: boolean
  asignaturasAprobadas: number
  totalAsignaturas: number
}

function FCTCard({
  fct,
  onNotaSave,
  isPending,
  isSuccess,
  asignaturasAprobadas,
  totalAsignaturas
}: FCTCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const porcentaje = totalAsignaturas > 0
    ? (asignaturasAprobadas / totalAsignaturas) * 100
    : 0
  const puedeHacerFCT = porcentaje >= 50

  return (
    <Card className={cn(
      'transition-all',
      puedeHacerFCT ? 'border-emerald-500/30' : ''
    )}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors py-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            FCT - Prácticas
          </CardTitle>
          <div className="flex items-center gap-2">
            {fct.nota !== null && (
              <span className="font-semibold text-vt-green dark:text-vt-green-light">
                {fct.nota.toFixed(1)}
              </span>
            )}
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <div className={cn(
        'overflow-hidden transition-all duration-200',
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      )}>
        <CardContent className="pt-0 space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>10% de la nota final de cada módulo.</p>
            <p className="mt-1">Requisito: ≥50% asignaturas aprobadas.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span className={porcentaje >= 50 ? 'text-vt-green' : 'text-muted-foreground'}>
                {asignaturasAprobadas}/{totalAsignaturas} ({porcentaje.toFixed(0)}%)
              </span>
            </div>
            <Progress value={porcentaje} className="h-2" />
          </div>

          {puedeHacerFCT && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">Nota FCT</p>
                <p className="text-xs text-muted-foreground">
                  {fct.empresa || 'Prácticas (400h)'}
                </p>
              </div>
              <NotaInput
                value={fct.nota}
                onSave={onNotaSave}
                isPending={isPending}
                isSuccess={isSuccess}
                className="w-20"
                placeholder="-"
              />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

// ============================================
// COMPONENTE: SistemaEvaluacionCard
// ============================================

function SistemaEvaluacionCard() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors py-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            Sistema de evaluación
          </CardTitle>
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <div className={cn(
        'overflow-hidden transition-all duration-200',
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      )}>
        <CardContent className="pt-0">
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p><strong>Nota por RA</strong> = (Media PACs × 40%) + (Examen × 60%)</p>
            <p><strong>Nota módulo</strong> = Media ponderada RAs por horas (90%) + FCT (10%)</p>
            <p className="text-muted-foreground/70 text-xs mt-2">El examen debe ser ≥5 para que sume la EC</p>
            <p className="text-muted-foreground/70 text-xs">Cada RA debe tener nota ≥5</p>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-vt-blue" /> PAC Interactiva
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-vt-purple" /> PAC Desarrollo
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

// ============================================
// COMPONENTE: DisclaimerCard
// ============================================

function DisclaimerCard() {
  return (
    <Alert variant="info">
      <Paperclip className="h-4 w-4" />
      <AlertTitle>Información importante sobre los cálculos</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Esta herramienta realiza una <strong>estimación</strong> basada en la información proporcionada. Recuerda que debes <strong>verificar tus notas oficiales</strong> con tu centro educativo.
        </p>
        <p>
          Si tienes alguna duda, consulta nuestros <Link className="text-vt-blue hover:underline" href="/terminos">Términos y Condiciones</Link>.
        </p>
      </AlertDescription>
    </Alert>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function NotasDashboard({
  stats,
  fct,
  semestreNombre,
  onFCTNotaSave,
  isFCTPending,
  isFCTSuccess
}: NotasDashboardProps) {
  const [showCallToAction, setShowCallToAction] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('hideNotasCallToAction') !== 'true'
  })

  // Función para cerrar y guardar la preferencia
  const handleCloseCallToAction = () => {
    localStorage.setItem('hideNotasCallToAction', 'true')
    setShowCallToAction(false)
  }

  const progressPercent = stats.total > 0
    ? Math.round((stats.media ?? 0) * 10)
    : 0

  return (
    <div className="space-y-6">
      {/* Hero: Media del semestre */}
      <Card className="bg-gradient-to-r from-vt-blue/5 to-vt-blue/10">
        <CardContent className="pt-6 pb-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Media del Semestre</p>
            <p className={cn('text-5xl font-bold', getGradeColor(stats.media))}>
              {stats.media !== null ? stats.media.toFixed(2) : '—'}
            </p>
            <p className="text-sm text-muted-foreground">{semestreNombre}</p>
            {stats.media !== null && (
              <div className="max-w-md mx-auto pt-2">
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-vt-green">{stats.aprobadas}</p>
            <p className="text-xs text-muted-foreground">Aprobadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-vt-red">{stats.suspensas}</p>
            <p className="text-xs text-muted-foreground">Suspensas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.pendientes}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Sistema de Evaluación + FCT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SistemaEvaluacionCard />
        <FCTCard
          fct={fct}
          onNotaSave={onFCTNotaSave}
          isPending={isFCTPending}
          isSuccess={isFCTSuccess}
          asignaturasAprobadas={stats.aprobadas}
          totalAsignaturas={stats.total}
        />
      </div>

      {/* Call to action */}
      {showCallToAction && (
        <Card className="relative">
          <button
            onClick={handleCloseCallToAction}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
          <CardContent className="pt-6">
            <div className="text-muted-foreground">
              <p className="flex items-center gap-2 text-md font-semibold mb-3 text-foreground">
                <ClipboardPen className="h-4 w-4 text-muted-foreground" />
                Guía rápida de uso de esta sección
              </p>
              <ul className="text-sm list-disc list-inside space-y-2 text-muted-foreground">
                <li>En la pestaña de <Link href="/perfil" className="inline-flex items-center gap-1 text-primary hover:underline">Perfil<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link> añade y escoge tus asignaturas para cada semestre.</li>
                <li>En esta sección puedes seleccionar el semestre que quieras visualizar (en el menu de la izquierda).</li>
                <li>Editar las notas de cada asignatura (PACs y la nota de Examen Final Presencial).</li>
                <li>En historial podras ver tus notas de semestres anteriores.</li>
                <li><strong>Nota:</strong> el semestre activo es el semestre que se muestra por defecto.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <DisclaimerCard />
    </div>
  )
}
