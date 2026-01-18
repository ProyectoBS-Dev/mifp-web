'use client'

import { useState, useEffect } from 'react'
import { Calculator, History } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotasCalculator } from '@/components/notas'
import { NotasSimplificado } from '@/components/notas/NotasSimplificado'
import { HistorialView } from '@/components/notas/HistorialView'
import { SemesterSelector } from '@/components/semester/SemesterSelector'
import { SemesterGeneratorModal } from '@/components/semester/SemesterGeneratorModal'
import { useUserSemesters, useSemestreActivo } from '@/hooks/useUserSemesters'

// Set page title (client component can't use metadata export)
const PAGE_TITLE = 'Notas | MiFP'

export default function NotasPage() {
  const { data: semestres } = useUserSemesters()
  const { data: semestreActivo } = useSemestreActivo()

  const [selectedSemestreId, setSelectedSemestreId] = useState<string | null>(null)
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false)

  // Set page title on mount
  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  // Semestre seleccionado o activo por defecto
  const currentSemestreId = selectedSemestreId || semestreActivo?.id || null
  const currentSemestre = semestres?.find(s => s.id === currentSemestreId)
  const isActiveSemestre = currentSemestre?.activo ?? true

  const handleSemestreCreated = (semestreId: string) => {
    setSelectedSemestreId(semestreId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notas</h1>
        <p className="text-muted-foreground">
          Calcula y gestiona tus calificaciones por asignatura
        </p>
      </div>

      <Tabs defaultValue="semestre" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="semestre" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Asignaturas del semestre
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial del grado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semestre" className="space-y-6">
          {/* Selector de semestre */}
          <div className="flex items-center gap-3">
            <SemesterSelector
              value={currentSemestreId}
              onChange={setSelectedSemestreId}
              onAddPrevious={() => setIsSemesterModalOpen(true)}
            />
          </div>

          {/* Contenido según semestre */}
          {isActiveSemestre ? (
            // Semestre activo: calculadora completa
            <NotasCalculator />
          ) : (
            // Semestre inactivo: vista simplificada
            currentSemestreId && currentSemestre && (
              <NotasSimplificado
                semestreId={currentSemestreId}
                semestreNombre={currentSemestre.nombre}
              />
            )
          )}
        </TabsContent>

        <TabsContent value="historial">
          <HistorialView />
        </TabsContent>
      </Tabs>

      {/* Modal para añadir semestre anterior */}
      <SemesterGeneratorModal
        open={isSemesterModalOpen}
        onOpenChange={setIsSemesterModalOpen}
        onSemestreCreated={handleSemestreCreated}
      />
    </div>
  )
}
