'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { getGradeColor, getGradeBadge } from '@/lib/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AsignaturaNotas } from '@/hooks/useNotas'

// ============================================
// TIPOS
// ============================================

interface AsignaturaDetailSimplificadoProps {
  asignatura: AsignaturaNotas
  semestreId: string
  onBack: () => void
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Vista de detalle para asignaturas de semestres anteriores (sin GDs).
 * Permite introducir únicamente la nota final de la asignatura.
 */
export function AsignaturaDetailSimplificado({
  asignatura,
  semestreId,
  onBack
}: AsignaturaDetailSimplificadoProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [localNota, setLocalNota] = useState<string | null>(null)

  // Nota actual
  const notaActual = asignatura.notaFinalCalculada

  // Badge según nota
  const badge = getGradeBadge(notaActual)

  // Guardar nota
  const handleSaveNota = useCallback(async (nota: number | null) => {
    setIsSaving(true)

    try {
      // Upsert en user_notas_examen
      const { error: upsertError } = await supabase.from('user_notas_examen')
        .upsert({
          user_asignatura_id: asignatura.id,
          nota_examen: nota,
          nota_final_calculada: nota,
          convocatoria: 1,
          aprobada: nota !== null ? nota >= 5 : null
        }, {
          onConflict: 'user_asignatura_id,convocatoria'
        })

      if (upsertError) throw upsertError

      // Mostrar checkmark
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)

      // Invalidar queries para actualizar sidebar e historial
      queryClient.invalidateQueries({ queryKey: ['notas', semestreId] })
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      queryClient.invalidateQueries({ queryKey: ['grade-progress'] })
      queryClient.invalidateQueries({ queryKey: ['historial'] })
    } catch (err) {
      console.error('Error guardando nota:', err)
    } finally {
      setIsSaving(false)
    }
  }, [supabase, queryClient, semestreId, asignatura.id])

  // Manejar cambio de input
  const handleInputChange = (value: string) => {
    setLocalNota(value)
  }

  // Manejar blur (guardar)
  const handleBlur = () => {
    if (localNota === null || localNota === '') {
      // No editado o vacío: limpiar estado local
      setLocalNota(null)
      return
    }

    const newNota = parseFloat(localNota)

    // Validar
    if (isNaN(newNota) || newNota < 0 || newNota > 10) {
      setLocalNota(null)
      return
    }

    // Solo guardar si cambió
    if (newNota !== notaActual) {
      handleSaveNota(newNota)
    }
    
    // Limpiar local después de guardar
    setLocalNota(null)
  }

  // Manejar tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Volver al resumen
      </Button>

      {/* Card principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{asignatura.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground">{asignatura.codigo}</p>
            </div>
            <Badge color={badge.color}>{badge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nota grande actual */}
          <div className="text-center py-8 border-b">
            <p className="text-sm text-muted-foreground mb-2">Nota Final</p>
            <p className={cn('text-7xl font-bold', getGradeColor(notaActual))}>
              {notaActual !== null ? notaActual.toFixed(2) : '—'}
            </p>
            {notaActual !== null && (
              <p className="text-sm text-muted-foreground mt-3">
                {notaActual >= 5 ? '✓ Aprobada' : '✗ Suspensa'}
              </p>
            )}
          </div>

          {/* Input para nota */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Introduce la nota final</p>
                <p className="text-xs text-muted-foreground">
                  Nota obtenida en esta asignatura durante el semestre
                </p>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={localNota !== null ? localNota : (notaActual ?? '')}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-24 h-10 text-center text-lg font-semibold"
                  placeholder="0.00"
                />
                {isSaving && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {isSaved && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vt-green" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Las notas se guardan automáticamente al salir del campo
            </p>
          </div>

          {/* Info adicional */}
          <div className="text-sm space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge color="gray" colorStyle="outline" size="adjusted">
                Semestre anterior
              </Badge>
              <span className="text-xs">
                Los datos de evaluación continua no están disponibles para semestres pasados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
