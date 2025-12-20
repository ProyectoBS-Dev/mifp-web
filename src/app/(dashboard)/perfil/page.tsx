import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Perfil | MiFP',
  description: 'Tu perfil de usuario',
}

export default async function PerfilPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  const userData = profile as {
    full_name: string | null
    email: string
    avatar_url: string | null
    grado_id: string | null
    created_at: string
  } | null

  const getInitials = () => {
    if (userData?.full_name) {
      return userData.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Información de tu cuenta
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Info básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>Tu información básica de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {userData?.full_name || 'Sin nombre'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="grid gap-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miembro desde</span>
                <span>
                  {userData?.created_at 
                    ? new Date(userData.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder para edición */}
        <Card>
          <CardHeader>
            <CardTitle>Editar perfil</CardTitle>
            <CardDescription>Actualiza tu información</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Próximamente podrás editar tu perfil aquí
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
