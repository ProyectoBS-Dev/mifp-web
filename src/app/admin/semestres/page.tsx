import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SemesterManagement } from '@/components/admin/SemesterManagement'

export const metadata: Metadata = {
    title: 'Gestión de Semestres - Admin',
    description: 'Administración de semestres académicos',
}

export default async function AdminSemestresPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verificar que es admin
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    const userProfile = profile as { role: string } | null
    if (userProfile?.role !== 'admin') {
        redirect('/dashboard')
    }

    // Obtener semestres
    const { data: semestres } = await supabase
        .from('semestres')
        .select('*')
        .order('fecha_inicio', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Semestres</h1>
                <p className="text-muted-foreground">
                    Administra los semestres académicos y ejecuta cambios de semestre
                </p>
            </div>

            <SemesterManagement initialSemestres={semestres || []} />
        </div>
    )
}
