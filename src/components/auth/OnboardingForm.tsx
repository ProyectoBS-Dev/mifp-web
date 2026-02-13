'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type GradoTipo = 'DAM' | 'DAW'

interface Grado {
  id: string
  nombre: string
  codigo: GradoTipo
}

interface Asignatura {
  id: string
  nombre: string
  codigo: string
  semestre_recomendado: number | null
}

type Step = 'grado' | 'asignaturas' | 'confirmacion'

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('grado')
  const [grados, setGrados] = useState<Grado[]>([])
  const [selectedGrado, setSelectedGrado] = useState<Grado | null>(null)
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [selectedAsignaturas, setSelectedAsignaturas] = useState<string[]>([])
  const [semestreActivo, setSemestreActivo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar grados al montar
  useEffect(() => {
    loadGrados()
    loadSemestreActivo()
  }, [])

  const loadGrados = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('grados')
      .select('id, nombre, codigo')
      .order('codigo')

    if (data) {
      setGrados(data as unknown as Grado[])
    }
  }

  const loadSemestreActivo = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('semestres')
      .select('id')
      .eq('activo', true)
      .single()

    if (data) {
      setSemestreActivo((data as unknown as { id: string }).id)
    }
  }

  // Cargar asignaturas cuando se selecciona un grado
  useEffect(() => {
    if (selectedGrado) {
      loadAsignaturas(selectedGrado.id)
    }
  }, [selectedGrado])

  const loadAsignaturas = async (gradoId: string) => {
    const supabase = createClient()
    
    const { data, error: fetchError } = await supabase
      .from('asignaturas')
      .select('id, nombre, codigo, semestre_recomendado')
      .eq('grado_id', gradoId)
      .is('deleted_at', null)
      .order('semestre_recomendado')
      .order('nombre')

    if (fetchError) {
      console.error('Error loading asignaturas:', fetchError)
      setError('Error al cargar las asignaturas')
      return
    }

    setAsignaturas((data as unknown as Asignatura[]) || [])
  }

  const handleGradoSelect = (grado: Grado) => {
    setSelectedGrado(grado)
    setSelectedAsignaturas([])
    setStep('asignaturas')
  }

  const handleAsignaturaToggle = (asignaturaId: string) => {
    setSelectedAsignaturas(prev =>
      prev.includes(asignaturaId)
        ? prev.filter(id => id !== asignaturaId)
        : [...prev, asignaturaId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedGrado || selectedAsignaturas.length === 0) {
      setError('Selecciona al menos una asignatura')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    // Verificar que el usuario está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('No se encontró el usuario. Por favor, vuelve a iniciar sesión.')
      setIsLoading(false)
      return
    }

    // Llamar a la función RPC para completar el onboarding
    // Esta función tiene SECURITY DEFINER y puede hacer INSERT/UPDATE
    const { data, error: rpcError } = await supabase.rpc('complete_onboarding', {
      p_grado_id: selectedGrado.id,
      p_asignatura_ids: selectedAsignaturas,
      p_semestre_id: semestreActivo ?? undefined,
    })

    if (rpcError) {
      console.error('Error en onboarding RPC:', rpcError)
      setError(`Error al guardar tu perfil: ${rpcError.message}`)
      setIsLoading(false)
      return
    }

    // Verificar resultado de la función
    const result = data as { success: boolean; error?: string }
    if (!result?.success) {
      console.error('Error en onboarding:', result?.error)
      setError(`Error al guardar tu perfil: ${result?.error || 'Error desconocido'}`)
      setIsLoading(false)
      return
    }

    // Redirigir al dashboard
    router.push('/dashboard')
    router.refresh()
  }

  // Agrupar asignaturas por semestre
  const asignaturasBySemestre = asignaturas.reduce((acc, asignatura) => {
    const semestre = asignatura.semestre_recomendado || 0
    if (!acc[semestre]) {
      acc[semestre] = []
    }
    acc[semestre].push(asignatura)
    return acc
  }, {} as Record<number, Asignatura[]>)

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${step === 'grado' ? 'bg-primary' : 'bg-primary/30'}`} />
        <div className={`w-8 h-0.5 ${step !== 'grado' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 'asignaturas' ? 'bg-primary' : step === 'confirmacion' ? 'bg-primary/30' : 'bg-muted'}`} />
        <div className={`w-8 h-0.5 ${step === 'confirmacion' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 'confirmacion' ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {/* Step 1: Selección de Grado */}
      {step === 'grado' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">¿Qué grado estás cursando?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Selecciona tu grado para ver las asignaturas disponibles
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {grados.map((grado) => (
              <Card
                key={grado.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedGrado?.id === grado.id ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => handleGradoSelect(grado)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-2xl">{grado.codigo === 'DAM' ? '📱' : '🌐'}</span>
                  </div>
                  <CardTitle className="text-lg">{grado.codigo}</CardTitle>
                  <CardDescription>{grado.nombre}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {grados.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Cargando grados...
            </div>
          )}
        </div>
      )}

      {/* Step 2: Selección de Asignaturas */}
      {step === 'asignaturas' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              Selecciona tus asignaturas
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Marca las asignaturas que estás cursando actualmente
            </p>
          </div>

          {Object.entries(asignaturasBySemestre)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([semestre, asigs]) => (
            <div key={semestre} className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">
                {semestre === '0' ? 'Sin semestre asignado' : `Semestre ${semestre}`}
              </h3>
              <div className="grid gap-2">
                {asigs.map((asignatura) => (
                  <div
                    key={asignatura.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAsignaturas.includes(asignatura.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleAsignaturaToggle(asignatura.id)}
                  >
                    <Checkbox
                      checked={selectedAsignaturas.includes(asignatura.id)}
                    />
                    <div className="flex-1">
                      <Label className="font-medium cursor-pointer">
                        {asignatura.nombre}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {asignatura.codigo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {asignaturas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Cargando asignaturas...
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('grado')}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              onClick={() => setStep('confirmacion')}
              disabled={selectedAsignaturas.length === 0}
              className="flex-1"
            >
              Continuar ({selectedAsignaturas.length} seleccionadas)
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmación */}
      {step === 'confirmacion' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">¡Todo listo!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Revisa tu selección antes de continuar
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Grado</p>
                  <p className="font-medium">{selectedGrado?.codigo} - {selectedGrado?.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Asignaturas ({selectedAsignaturas.length})
                  </p>
                  <ul className="mt-2 space-y-1">
                    {asignaturas
                      .filter(a => selectedAsignaturas.includes(a.id))
                      .map(a => (
                        <li key={a.id} className="text-sm">
                          • {a.nombre}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('asignaturas')}
              disabled={isLoading}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Guardando...' : 'Empezar a usar MiFP'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
