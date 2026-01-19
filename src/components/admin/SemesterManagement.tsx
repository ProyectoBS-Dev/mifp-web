'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    Plus,
    Edit2,
    CheckCircle2,
    AlertCircle,
    Send,
    Loader2,
    Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// ============================================
// TIPOS
// ============================================

interface Semestre {
    id: string
    nombre: string
    codigo: string
    fecha_inicio: string
    fecha_fin: string
    año_academico: string
    activo: boolean
    created_at: string
}

interface SemesterManagementProps {
    initialSemestres: Semestre[]
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function SemesterManagement({ initialSemestres }: SemesterManagementProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const supabase = createClient()

    const [semestres, setSemestres] = useState<Semestre[]>(initialSemestres)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Estado para modales
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isNotifyOpen, setIsNotifyOpen] = useState(false)
    const [editingSemestre, setEditingSemestre] = useState<Semestre | null>(null)

    // Estado para formulario de creación con auto-relleno
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState<number>(currentYear)
    const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1)
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        fecha_inicio: '',
        fecha_fin: '',
        año_academico: ''
    })

    // Generar datos del semestre automáticamente
    const generateSemesterData = (year: number, semester: 1 | 2) => ({
        nombre: `${semester}S ${year}-${year + 1}`,
        codigo: `${semester}s${String(year).slice(2)}${String(year + 1).slice(2)}`,
        año_academico: `${year}-${year + 1}`,
        fecha_inicio: semester === 1 ? `${year}-09-01` : `${year + 1}-02-01`,
        fecha_fin: semester === 1 ? `${year + 1}-01-31` : `${year + 1}-06-30`,
    })

    // Auto-rellenar al cambiar año o semestre
    const handleYearChange = (year: number) => {
        setSelectedYear(year)
        setFormData(generateSemesterData(year, selectedSemester))
    }

    const handleSemesterChange = (semester: 1 | 2) => {
        setSelectedSemester(semester)
        setFormData(generateSemesterData(selectedYear, semester))
    }

    // Inicializar formulario cuando se abre el modal
    const openCreateModal = () => {
        setFormData(generateSemesterData(selectedYear, selectedSemester))
        setIsCreateOpen(true)
    }

    // Estado para notificación
    const [notifyData, setNotifyData] = useState({
        titulo: '',
        mensaje: ''
    })

    // Refrescar datos
    const refreshData = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase
            .from('semestres') as any)
            .select('*')
            .order('fecha_inicio', { ascending: false })

        if (data) setSemestres(data as Semestre[])
        queryClient.invalidateQueries({ queryKey: ['semestres'] })
        queryClient.invalidateQueries({ queryKey: ['semestre-activo'] })
    }

    // Crear semestre
    const handleCreate = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await (supabase
                .from('semestres') as any)
                .insert({
                    nombre: formData.nombre,
                    codigo: formData.codigo.toLowerCase(),
                    fecha_inicio: formData.fecha_inicio,
                    fecha_fin: formData.fecha_fin,
                    año_academico: formData.año_academico,
                    activo: false
                })

            if (insertError) throw insertError

            setSuccess('Semestre creado correctamente')
            setIsCreateOpen(false)
            setSelectedYear(currentYear)
            setSelectedSemester(1)
            setFormData({ nombre: '', codigo: '', fecha_inicio: '', fecha_fin: '', año_academico: '' })
            await refreshData()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear semestre')
        } finally {
            setIsLoading(false)
        }
    }

    // Actualizar semestre
    const handleUpdate = async () => {
        if (!editingSemestre) return
        setIsLoading(true)
        setError(null)

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await (supabase
                .from('semestres') as any)
                .update({
                    nombre: formData.nombre,
                    codigo: formData.codigo.toLowerCase(),
                    fecha_inicio: formData.fecha_inicio,
                    fecha_fin: formData.fecha_fin,
                    año_academico: formData.año_academico
                })
                .eq('id', editingSemestre.id)

            if (updateError) throw updateError

            setSuccess('Semestre actualizado correctamente')
            setEditingSemestre(null)
            setFormData({ nombre: '', codigo: '', fecha_inicio: '', fecha_fin: '', año_academico: '' })
            await refreshData()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar semestre')
        } finally {
            setIsLoading(false)
        }
    }

    // Activar semestre (y desactivar el anterior)
    const handleActivate = async (semestre: Semestre) => {
        if (semestre.activo) return
        setIsLoading(true)
        setError(null)

        try {
            // Desactivar todos los semestres
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase
                .from('semestres') as any)
                .update({ activo: false })
                .eq('activo', true)

            // Activar el seleccionado
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: activateError } = await (supabase
                .from('semestres') as any)
                .update({ activo: true })
                .eq('id', semestre.id)

            if (activateError) throw activateError

            setSuccess(`Semestre ${semestre.nombre} activado correctamente`)
            await refreshData()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al activar semestre')
        } finally {
            setIsLoading(false)
        }
    }

    // Enviar notificación a todos los usuarios
    const handleSendNotification = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/admin/notifications/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: 'sistema',
                    titulo: notifyData.titulo,
                    mensaje: notifyData.mensaje
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error al enviar notificación')
            }

            setSuccess(`Notificación enviada a ${result.count} usuarios`)
            setIsNotifyOpen(false)
            setNotifyData({ titulo: '', mensaje: '' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar notificación')
        } finally {
            setIsLoading(false)
        }
    }

    // Abrir edición
    const openEdit = (semestre: Semestre) => {
        setEditingSemestre(semestre)
        setFormData({
            nombre: semestre.nombre,
            codigo: semestre.codigo,
            fecha_inicio: semestre.fecha_inicio,
            fecha_fin: semestre.fecha_fin,
            año_academico: semestre.año_academico
        })
    }

    // Formatear fecha
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            {/* Mensajes */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive">{error}</span>
                </div>
            )}

            {success && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">{success}</span>
                </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Semestre
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Semestre</DialogTitle>
                            <DialogDescription>
                                El nuevo semestre se creará como inactivo. Actívalo cuando esté listo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Selectores de año y semestre */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="select-year">Año Académico</Label>
                                    <select
                                        id="select-year"
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(Number(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i).map(year => (
                                            <option key={year} value={year}>
                                                {year}-{year + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="select-semester">Semestre</Label>
                                    <select
                                        id="select-semester"
                                        value={selectedSemester}
                                        onChange={(e) => handleSemesterChange(Number(e.target.value) as 1 | 2)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value={1}>1º Semestre</option>
                                        <option value={2}>2º Semestre</option>
                                    </select>
                                </div>
                            </div>

                            {/* Preview de nombre y código */}
                            <div className="p-3 rounded-lg bg-muted/50 border">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Nombre: </span>
                                        <span className="font-medium">{formData.nombre}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Código: </span>
                                        <span className="font-mono font-medium">{formData.codigo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fechas editables */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                                    <Input
                                        id="fecha_inicio"
                                        type="date"
                                        value={formData.fecha_inicio}
                                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_fin">Fecha Fin</Label>
                                    <Input
                                        id="fecha_fin"
                                        type="date"
                                        value={formData.fecha_fin}
                                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreate} disabled={isLoading}>
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Crear
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Notificación
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enviar Notificación de Sistema</DialogTitle>
                            <DialogDescription>
                                Esta notificación se enviará a TODOS los usuarios de la aplicación.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="notify-titulo">Título</Label>
                                <Input
                                    id="notify-titulo"
                                    placeholder="🗓️ Nuevo Semestre: 2S 2025-2026"
                                    value={notifyData.titulo}
                                    onChange={(e) => setNotifyData({ ...notifyData, titulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notify-mensaje">Mensaje</Label>
                                <Textarea
                                    id="notify-mensaje"
                                    placeholder="El semestre ha cambiado. Por favor, selecciona tus nuevas asignaturas."
                                    value={notifyData.mensaje}
                                    onChange={(e) => setNotifyData({ ...notifyData, mensaje: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsNotifyOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSendNotification}
                                disabled={isLoading || !notifyData.titulo}
                            >
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Enviar a Todos
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabla de semestres */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Semestres Registrados
                    </CardTitle>
                    <CardDescription>
                        Solo puede haber un semestre activo a la vez
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Año Académico</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {semestres.map((semestre) => (
                                <TableRow key={semestre.id}>
                                    <TableCell className="font-mono">{semestre.codigo}</TableCell>
                                    <TableCell className="font-medium">{semestre.nombre}</TableCell>
                                    <TableCell>{semestre.año_academico}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(semestre.fecha_inicio)} - {formatDate(semestre.fecha_fin)}
                                    </TableCell>
                                    <TableCell>
                                        {semestre.activo ? (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                                Activo
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactivo</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openEdit(semestre)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            {!semestre.activo && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleActivate(semestre)}
                                                    disabled={isLoading}
                                                >
                                                    Activar
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal de edición */}
            <Dialog open={!!editingSemestre} onOpenChange={() => setEditingSemestre(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Semestre</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del semestre {editingSemestre?.nombre}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nombre">Nombre</Label>
                                <Input
                                    id="edit-nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-codigo">Código</Label>
                                <Input
                                    id="edit-codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-año">Año Académico</Label>
                            <Input
                                id="edit-año"
                                value={formData.año_academico}
                                onChange={(e) => setFormData({ ...formData, año_academico: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-inicio">Fecha Inicio</Label>
                                <Input
                                    id="edit-inicio"
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-fin">Fecha Fin</Label>
                                <Input
                                    id="edit-fin"
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSemestre(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
