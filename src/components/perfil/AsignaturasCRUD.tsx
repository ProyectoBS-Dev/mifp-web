'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, AlertTriangle, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SemesterSelector } from '@/components/semester/SemesterSelector'
import { useSemestres } from '@/hooks/useUserSemesters'

// ============================================
// TIPOS
// ============================================

interface UserAsignatura {
    id: string
    asignatura_id: string
    semestre_id: string
    asignaturas: {
        id: string
        nombre: string
        codigo: string
    }
    semestres: {
        id: string
        nombre: string
        codigo: string
        activo: boolean | null
    }
}

interface Asignatura {
    id: string
    nombre: string
    codigo: string
}

interface AsignaturasCRUDProps {
    userAsignaturas: UserAsignatura[]
    availableAsignaturas: Asignatura[]
    gradoId: string
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AsignaturasCRUD({
    userAsignaturas: initialUserAsignaturas,
    availableAsignaturas,
}: AsignaturasCRUDProps) {
    const router = useRouter()
    const supabase = createClient()
    const queryClient = useQueryClient()
    const { data: semestres, isLoading: semestresLoading } = useSemestres()

    // Estado
    const [userAsignaturas, setUserAsignaturas] = useState(initialUserAsignaturas)
    const [selectedSemestreId, setSelectedSemestreId] = useState<string | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [asignaturaToDelete, setAsignaturaToDelete] = useState<UserAsignatura | null>(null)
    const [deleteConfirmName, setDeleteConfirmName] = useState('')
    const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Inicializar semestre activo después del mount (evita hydration mismatch)
    useEffect(() => {
        if (semestres && semestres.length > 0 && !selectedSemestreId) {
            const activo = semestres.find(s => s.activo)
            setSelectedSemestreId(activo?.id || semestres[0]?.id || null)
        }
    }, [semestres, selectedSemestreId])

    // Filtrar asignaturas por semestre seleccionado
    const filteredAsignaturas = useMemo(() => {
        if (!selectedSemestreId) return []
        return userAsignaturas.filter(ua => ua.semestre_id === selectedSemestreId)
    }, [userAsignaturas, selectedSemestreId])

    // Asignaturas disponibles para añadir (no matriculadas en este semestre)
    const asignaturasDisponibles = useMemo(() => {
        const matriculadasIds = filteredAsignaturas.map(ua => ua.asignatura_id)
        return availableAsignaturas.filter(a => !matriculadasIds.includes(a.id))
    }, [availableAsignaturas, filteredAsignaturas])

    // Mapear semestres al formato esperado por SemesterSelector
    const semestresParaSelector = useMemo(() => {
        if (!semestres) return undefined
        return semestres.map(s => ({
            id: s.id,
            nombre: s.nombre,
            activo: s.activo,
            num_asignaturas: s.num_asignaturas || 0
        }))
    }, [semestres])

    // Agrupar por semestre para mostrar resumen
    const asignaturasPorSemestre = useMemo(() => {
        const grouped = new Map<string, { semestre: UserAsignatura['semestres'], asignaturas: UserAsignatura[] }>()

        userAsignaturas.forEach(ua => {
            const key = ua.semestre_id
            if (!grouped.has(key)) {
                grouped.set(key, { semestre: ua.semestres, asignaturas: [] })
            }
            grouped.get(key)!.asignaturas.push(ua)
        })

        return Array.from(grouped.values()).sort((a, b) =>
            a.semestre.activo ? -1 : b.semestre.activo ? 1 : 0
        )
    }, [userAsignaturas])

    // Refrescar datos
    const refreshData = async () => {
        const { data } = await supabase
            .from('user_asignaturas')
            .select(`
        id,
        asignatura_id,
        semestre_id,
        asignaturas (id, nombre, codigo),
        semestres (id, nombre, codigo, activo)
      `)
            .order('created_at', { ascending: false })

        if (data) {
            setUserAsignaturas(data as unknown as UserAsignatura[])
        }
        queryClient.invalidateQueries({ queryKey: ['user-semesters'] })
        queryClient.invalidateQueries({ queryKey: ['notas'] })
    }

    // Añadir asignatura
    const handleAdd = async () => {
        if (!selectedAsignaturaId || !selectedSemestreId) return
        setIsLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { error: insertError } = await supabase
                .from('user_asignaturas')
                .insert({
                    user_id: user.id,
                    asignatura_id: selectedAsignaturaId,
                    semestre_id: selectedSemestreId
                })

            if (insertError) {
                if (insertError.code === '23505') {
                    throw new Error('Ya tienes esta asignatura en este semestre')
                }
                throw insertError
            }

            setIsAddModalOpen(false)
            setSelectedAsignaturaId(null)
            await refreshData()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al añadir asignatura')
        } finally {
            setIsLoading(false)
        }
    }

    // Eliminar asignatura (con confirmación)
    const handleDelete = async () => {
        if (!asignaturaToDelete) return
        if (deleteConfirmName !== asignaturaToDelete.asignaturas.nombre) return

        setIsLoading(true)
        setError(null)

        try {
            const { error: deleteError } = await supabase
                .from('user_asignaturas')
                .delete()
                .eq('id', asignaturaToDelete.id)

            if (deleteError) throw deleteError

            setIsDeleteModalOpen(false)
            setAsignaturaToDelete(null)
            setDeleteConfirmName('')
            await refreshData()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar asignatura')
        } finally {
            setIsLoading(false)
        }
    }

    // Abrir modal de eliminación
    const openDeleteModal = (ua: UserAsignatura) => {
        setAsignaturaToDelete(ua)
        setDeleteConfirmName('')
        setIsDeleteModalOpen(true)
    }



    return (
        <div className="space-y-6">
            {/* Selector de semestre y acciones */}
            <div className="flex flex-wrap items-center gap-3">
                <SemesterSelector
                    value={selectedSemestreId}
                    onChange={setSelectedSemestreId}
                    semestres={semestresParaSelector}
                    isLoadingExternal={semestresLoading}
                />

                {selectedSemestreId && asignaturasDisponibles.length > 0 && (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir asignatura
                    </Button>
                )}
            </div>

            {/* Lista de asignaturas del semestre seleccionado */}
            {selectedSemestreId && (
                <Card className="bg-muted/50 rounded-lg shadow-lg border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Asignaturas
                        </CardTitle>
                        <CardDescription>
                            {filteredAsignaturas.length} asignatura{filteredAsignaturas.length !== 1 ? 's' : ''} en este semestre
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredAsignaturas.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No tienes asignaturas en este semestre</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir primera asignatura
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredAsignaturas.map(ua => (
                                    <div
                                        key={ua.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <div>
                                                <p className="font-medium">{ua.asignaturas.nombre}</p>
                                                <p className="text-sm text-muted-foreground">{ua.asignaturas.codigo}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDeleteModal(ua)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Resumen por semestre */}
            {asignaturasPorSemestre.length > 0 && (
                <Card className="bg-muted/50 rounded-lg shadow-lg border-none">
                    <CardHeader>
                        <CardTitle>Resumen por Semestre</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {asignaturasPorSemestre.map(({ semestre, asignaturas }) => (
                                <div
                                    key={semestre.id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{semestre.nombre}</span>
                                        {semestre.activo && (
                                            <Badge className="bg-vt-green/10 text-vt-green border-vt-green/20">
                                                Activo
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge color="gray">
                                        {asignaturas.length} asignatura{asignaturas.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal: Añadir asignatura */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Añadir Asignatura</DialogTitle>
                        <DialogDescription>
                            Selecciona una asignatura para añadir a este semestre
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 min-w-0">
                        <Select value={selectedAsignaturaId || ''} onValueChange={setSelectedAsignaturaId}>
                            <SelectTrigger className="min-w-0">
                                <SelectValue placeholder="Selecciona una asignatura" />
                            </SelectTrigger>
                            <SelectContent>
                                {asignaturasDisponibles.map(a => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.nombre} ({a.codigo})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAdd} disabled={!selectedAsignaturaId || isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Añadir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Confirmar eliminación */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Eliminar Asignatura
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará TODOS los datos asociados a esta asignatura:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Notas de PACs</li>
                            <li>Notas de VTs</li>
                            <li>Notas de examen</li>
                            <li>Registro de asistencia</li>
                        </ul>

                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm font-medium">
                                Para confirmar, escribe el nombre de la asignatura:
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 font-mono">
                                {asignaturaToDelete?.asignaturas.nombre}
                            </p>
                        </div>

                        <Input
                            placeholder="Escribe el nombre exacto..."
                            value={deleteConfirmName}
                            onChange={(e) => setDeleteConfirmName(e.target.value)}
                        />

                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteConfirmName !== asignaturaToDelete?.asignaturas.nombre || isLoading}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Eliminar Permanentemente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    )
}
