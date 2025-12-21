'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, GraduationCap, Calendar, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  grado_id: string | null
  created_at: string
  role: string
}

interface Grado {
  id: string
  nombre: string
  codigo: string
}

interface Asignatura {
  id: string
  nombre: string
  codigo: string
}

interface ProfileFormProps {
  user: {
    id: string
    email?: string
  }
  profile: UserProfile | null
  grado: Grado | null
  asignaturas: Asignatura[]
}

export function ProfileForm({ user, profile, grado, asignaturas }: ProfileFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      // Usar .select() para obtener la fila actualizada y verificar si el update funcionó
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase as any)
        .from('users')
        .update({
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()

      if (updateError) {
        // Error de RLS o de base de datos
        if (updateError.code === '42501' || updateError.message?.includes('policy')) {
          setError('No tienes permisos para actualizar tu perfil. Contacta soporte.')
        } else {
          setError('Error al guardar los cambios')
        }
        console.error('Update error:', updateError)
      } else if (!data || data.length === 0) {
        // El update no afectó ninguna fila - el usuario no existe en la tabla
        // Intentamos crear el registro del perfil
        console.log('Profile not found, attempting to create...')
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName || null,
            onboarding_completed: true, // Si llega aquí ya pasó onboarding
          })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          setError('No se pudo crear tu perfil. Cierra sesión y vuelve a entrar.')
        } else {
          setSuccess(true)
          setIsEditing(false)
          router.refresh()
        }
      } else {
        setSuccess(true)
        setIsEditing(false)
        router.refresh()
      }
    } catch (err) {
      setError('Error inesperado')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Info básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información personal
          </CardTitle>
          <CardDescription>Tu información básica de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar y nombre */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-lg">
                    {profile?.full_name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Datos */}
          <div className="grid gap-3 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Grado</p>
                <p className="text-sm">
                  {grado ? `${grado.nombre} (${grado.codigo})` : 'No seleccionado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Miembro desde</p>
                <p className="text-sm">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-sm text-vt-green">¡Cambios guardados!</p>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFullName(profile?.full_name || '')
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Asignaturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Mis Asignaturas
          </CardTitle>
          <CardDescription>
            Asignaturas en las que estás matriculado este semestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {asignaturas.length > 0 ? (
            <div className="space-y-3">
              {asignaturas.map((asig) => (
                <div
                  key={asig.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{asig.nombre}</p>
                  </div>
                  <Badge variant="secondary">{asig.codigo}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No tienes asignaturas matriculadas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Completa el onboarding para seleccionar tus asignaturas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>📊 Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">
                {asignaturas.length}
              </p>
              <p className="text-xs text-muted-foreground">Asignaturas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-vt-green">0</p>
              <p className="text-xs text-muted-foreground">PACs entregadas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-vt-blue">0</p>
              <p className="text-xs text-muted-foreground">VTs asistidas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-vt-yellow-dark">-</p>
              <p className="text-xs text-muted-foreground">Media actual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
