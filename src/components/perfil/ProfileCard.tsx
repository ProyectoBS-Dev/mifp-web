'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, GraduationCap, Calendar, Edit2, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/user'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Tipo compatible con la tabla users de Supabase
interface UserProfile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    grado_id: string | null
    created_at: string | null
    updated_at?: string | null
    deleted_at?: string | null
    role: string | null
    onboarding_completed?: boolean | null
    notification_settings?: unknown
    settings?: unknown
}

interface Grado {
    id: string
    nombre: string
    codigo: string
}

interface ProfileCardProps {
    user: {
        id: string
        email?: string
    }
    profile: UserProfile | null
    grado: Grado | null
}

/**
 * ProfileCard - Versión compacta del perfil para la vista unificada
 * Diseño: Avatar + info en una sola línea, edición inline
 */
export function ProfileCard({ user, profile, grado }: ProfileCardProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [error, setError] = useState<string | null>(null)

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)

        const supabase = createClient()

        try {
            const { data, error: updateError } = await supabase
                .from('users')
                .update({
                    full_name: fullName || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select()

            if (updateError) {
                console.error('Profile update error:', updateError)
                setError('Error al guardar los cambios')
                return
            }
            
            if (!data || data.length === 0) {
                // Esto no debería pasar nunca (user siempre existe por auth)
                console.error('User profile not found:', user.id)
                setError('Error: perfil no encontrado. Cierra sesión y vuelve a entrar.')
                return
            }
            
            setIsEditing(false)
            router.refresh()
        } catch {
            setError('Error inesperado')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="bg-muted/50 rounded-lg shadow-lg border-none">
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {getInitials(fullName, user?.email)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="max-w-xs"
                                />
                                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold truncate">
                                    {profile?.full_name || 'Sin nombre'}
                                </h2>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user?.email}
                            </span>
                        </div>

                        {error && (
                            <p className="text-xs text-destructive mt-1">{error}</p>
                        )}
                    </div>

                    {/* Badges - Grado y fecha de creación */}
                    <div className="flex flex-col items-end gap-1">
                        {grado && (
                            <Badge color="gray" className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {grado.codigo}
                            </Badge>
                        )}
                        {profile?.created_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(profile.created_at).toLocaleDateString('es-ES', {
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
