'use client'

import { useState } from 'react'
import { Plus, Calendar, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useSemestresPosibles } from '@/hooks/useUserSemesters'

// ============================================
// TIPOS
// ============================================

interface SemesterGeneratorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSemestreCreated: (semestreId: string, semestreNombre: string) => void
}

// ============================================
// COMPONENTE
// ============================================

export function SemesterGeneratorModal({
    open,
    onOpenChange,
    onSemestreCreated
}: SemesterGeneratorModalProps) {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const { data: semestres, isLoading: loadingSemestres } = useSemestresPosibles()

    const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!selectedCodigo || !semestres) return

        const selected = semestres.find(s => s.codigo === selectedCodigo)
        if (!selected) return

        setIsCreating(true)
        setError(null)

        try {
            const { data: semestreId, error: rpcError } = await supabase.rpc(
                'crear_semestre_si_no_existe',
                {
                    p_codigo: selected.codigo,
                    p_nombre: selected.nombre,
                    p_año_academico: selected.año_academico
                }
            )

            if (rpcError) throw rpcError

            // Invalidar queries
            queryClient.invalidateQueries({ queryKey: ['semestres'] })
            queryClient.invalidateQueries({ queryKey: ['user-semesters'] })
            queryClient.invalidateQueries({ queryKey: ['semestres-posibles'] })

            // Notificar al padre
            onSemestreCreated(semestreId, selected.nombre)
            onOpenChange(false)
            setSelectedCodigo(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear semestre')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Añadir Semestre Anterior
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona un semestre para registrar asignaturas de cursos anteriores.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loadingSemestres ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {semestres?.map((sem) => (
                                <button
                                    key={sem.codigo}
                                    disabled={sem.existe}
                                    onClick={() => !sem.existe && setSelectedCodigo(sem.codigo)}
                                    className={`
                    flex items-center justify-between p-3 rounded-lg border 
                    transition-colors text-left
                    ${sem.existe
                                            ? 'bg-muted/50 opacity-50 cursor-not-allowed'
                                            : selectedCodigo === sem.codigo
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:bg-muted/50 cursor-pointer'
                                        }
                  `}
                                >
                                    <div>
                                        <p className="font-medium">{sem.nombre}</p>
                                        <p className="text-sm text-muted-foreground">{sem.año_academico}</p>
                                    </div>
                                    {sem.existe ? (
                                        <Badge color="yellow">Ya existe</Badge>
                                    ) : selectedCodigo === sem.codigo && (
                                        <Check className="h-5 w-5 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-destructive mt-4">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!selectedCodigo || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Semestre
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
