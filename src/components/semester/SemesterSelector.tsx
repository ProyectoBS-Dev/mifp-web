'use client'

import { ChevronDown, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useUserSemesters, type UserSemestre } from '@/hooks/useUserSemesters'

// ============================================
// TIPOS
// ============================================

// Tipo genérico para semestres (compatible con UserSemestre y Semestre de useSemestres)
interface SemestreBase {
    id: string
    nombre: string
    activo: boolean
    num_asignaturas?: number
}

interface SemesterSelectorProps {
    value: string | null
    onChange: (semestreId: string) => void
    onAddPrevious?: () => void
    className?: string
    showAddButton?: boolean
    /** Si se proporciona, usar esta lista en lugar del hook interno */
    semestres?: SemestreBase[]
    /** Indica si los semestres externos están cargando */
    isLoadingExternal?: boolean
}

// ============================================
// COMPONENTE
// ============================================

export function SemesterSelector({
    value,
    onChange,
    onAddPrevious,
    className,
    showAddButton = false,
    semestres: externalSemestres,
    isLoadingExternal = false
}: SemesterSelectorProps) {
    // Usar hook interno solo si no se proporcionan semestres externos
    const { data: internalSemestres, isLoading: internalLoading } = useUserSemesters()

    // Determinar qué datos usar
    const semestres = externalSemestres ?? internalSemestres
    const isLoading = externalSemestres ? isLoadingExternal : internalLoading

    // Encontrar semestre seleccionado
    const selectedSemestre = semestres?.find(s => s.id === value) ||
        semestres?.find(s => s.activo) ||
        null

    if (isLoading) {
        return (
            <Button variant="outline" disabled className={cn('w-[200px]', className)}>
                <Calendar className="h-4 w-4 mr-2" />
                Cargando...
            </Button>
        )
    }

    if (!semestres || semestres.length === 0) {
        return (
            <Button
                variant="outline"
                className={cn('w-[200px]', className)}
                onClick={onAddPrevious}
            >
                <Plus className="h-4 w-4 mr-2" />
                Añadir semestre
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn('justify-between min-w-[200px]', className)}>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedSemestre?.nombre || 'Seleccionar'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedSemestre?.activo && (
                            <Badge color="blue" colorStyle="soft" className="text-xs">Activo</Badge>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
                {semestres.map((semestre) => (
                    <DropdownMenuItem
                        key={semestre.id}
                        onClick={() => onChange(semestre.id)}
                        className={cn(
                            'flex items-center justify-between',
                            semestre.id === value && 'bg-accent'
                        )}
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{semestre.nombre}</span>
                            <span className="text-xs text-muted-foreground">
                                {semestre.num_asignaturas} asignatura{semestre.num_asignaturas !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {semestre.activo && (
                            <Badge color="blue" colorStyle="soft" className="text-xs">
                                Activo
                            </Badge>
                        )}
                    </DropdownMenuItem>
                ))}

                {showAddButton && onAddPrevious && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onAddPrevious} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Añadir semestre anterior
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
