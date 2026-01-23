'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface GDValidationFormProps {
  gdId: string
  asignaturaId: string
  semestreId: string
}

const RECHAZO_MOTIVOS = [
  'El archivo no es una Guía Didáctica válida',
  'El archivo corresponde a otro semestre',
  'El archivo está corrupto o ilegible',
  'La asignatura no coincide',
  'Otro motivo',
]

export function GDValidationForm({ gdId, asignaturaId, semestreId }: GDValidationFormProps) {
  const router = useRouter()
  const [isExtracting, setIsExtracting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rechazoMotivo, setRechazoMotivo] = useState('')
  const [rechazoOtro, setRechazoOtro] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleExtract = async () => {
    setIsExtracting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/guias-didacticas/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gdId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al extraer datos')
      }

      // Recargar la página para ver los datos extraídos
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleValidate = async () => {
    setIsValidating(true)
    setError(null)

    try {
      const supabase = createClient()

      // Marcar como validada
      const { error: updateError } = await supabase
        .from('guias_didacticas')
        .update({
          estado: 'validada',
          procesada: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gdId)

      if (updateError) throw updateError

      router.push('/admin/guias-didacticas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar')
    } finally {
      setIsValidating(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    setError(null)

    try {
      const supabase = createClient()
      const motivo = rechazoMotivo === 'Otro motivo' ? rechazoOtro : rechazoMotivo

      // Marcar como rechazada
      const { error: updateError } = await supabase
        .from('guias_didacticas')
        .update({
          estado: 'rechazada',
          motivo_rechazo: motivo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gdId)

      if (updateError) throw updateError

      router.push('/admin/guias-didacticas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-vt-red/10 text-vt-red text-sm">
          {error}
        </div>
      )}

      {/* Botón extraer datos con OpenAI */}
      <Button
        onClick={handleExtract}
        disabled={isExtracting}
        variant="outline"
        className="w-full"
      >
        {isExtracting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Extrayendo datos...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Extraer Datos (OpenAI)
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        🤖 Usa GPT-4o-mini para extraer RAs, PACs y VTs automáticamente.
        Después podrás revisar y validar los datos extraídos.
      </p>

      <div className="border-t pt-4 space-y-3">
        {/* Botón validar */}
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Validar GD
        </Button>

        {/* Botón rechazar */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar GD
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Rechazar Guía Didáctica</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marcará la GD como rechazada. El usuario será notificado.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Motivo del rechazo *</Label>
                <Select value={rechazoMotivo} onValueChange={setRechazoMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RECHAZO_MOTIVOS.map((motivo) => (
                      <SelectItem key={motivo} value={motivo}>
                        {motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {rechazoMotivo === 'Otro motivo' && (
                <div className="space-y-2">
                  <Label>Especifica el motivo</Label>
                  <Textarea
                    value={rechazoOtro}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRechazoOtro(e.target.value)}
                    placeholder="Describe el motivo del rechazo..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={!rechazoMotivo || isRejecting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirmar Rechazo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
