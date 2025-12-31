'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Palette, 
  Bell, 
  Shield, 
  Trash2, 
  Loader2,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Check
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface SettingsPanelProps {
  userEmail: string
  userRole?: 'admin' | 'estudiante' | 'moderador' | 'editor'
}

export function SettingsPanel({ userEmail, userRole = 'estudiante' }: SettingsPanelProps) {
  const router = useRouter()
  const { theme, setTheme, isDark } = useTheme()
  
  // Notification settings - conectado a Supabase
  const { settings, updateSettings, isUpdating } = useNotificationSettings()

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userEmail) {
      setDeleteError('El email no coincide')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar la cuenta')
      }

      // Sign out and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Apariencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza el aspecto de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme selector */}
          <div className="space-y-3">
            <Label>Tema</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  theme === 'light' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">Claro</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  theme === 'dark' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Oscuro</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  theme === 'system' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">Sistema</span>
              </button>
            </div>
          </div>

          {/* Current theme indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">
              Tema actual aplicado
            </span>
            <span className="text-sm font-medium">
              {isDark ? '🌙 Oscuro' : '☀️ Claro'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            Gestiona cómo y cuándo recibes notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios de PACs</Label>
              <p className="text-xs text-muted-foreground">
                Recibe avisos antes de las fechas de entrega (24h, 48h)
              </p>
            </div>
            <Switch
              checked={settings.pac_vencimiento}
              onCheckedChange={(checked) =>
                updateSettings({ pac_vencimiento: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios de VTs</Label>
              <p className="text-xs text-muted-foreground">
                Aviso 1 hora antes de cada videotutoría
              </p>
            </div>
            <Switch
              checked={settings.vt_recordatorio}
              onCheckedChange={(checked) =>
                updateSettings({ vt_recordatorio: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nuevas noticias</Label>
              <p className="text-xs text-muted-foreground">
                Cuando se publiquen nuevos posts en el blog
              </p>
            </div>
            <Switch
              checked={settings.noticia_nueva}
              onCheckedChange={(checked) =>
                updateSettings({ noticia_nueva: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Avisos del sistema</Label>
              <p className="text-xs text-muted-foreground">
                Mantenimiento, actualizaciones y novedades de MiFP
              </p>
            </div>
            <Switch
              checked={settings.sistema}
              onCheckedChange={(checked) =>
                updateSettings({ sistema: checked })
              }
            />
          </div>

          {/* Solo mostrar para admins */}
          {userRole === 'admin' && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  📤 Guías Didácticas subidas
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Admin</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cuando un usuario suba una nueva GD pendiente de validación
                </p>
              </div>
              <Switch
                checked={settings.gd_subida}
                onCheckedChange={(checked) =>
                  updateSettings({ gd_subida: checked })
                }
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-green-500" />
            Tus preferencias se guardan automáticamente
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Gestiona la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-sm">Sesiones activas</p>
              <p className="text-xs text-muted-foreground">
                Gestiona tus dispositivos conectados
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-sm">Cambiar contraseña</p>
              <p className="text-xs text-muted-foreground">
                Actualiza tu contraseña de acceso
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-sm">Exportar datos</p>
              <p className="text-xs text-muted-foreground">
                Descarga una copia de tus datos
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona de peligro */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles para tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Eliminar cuenta</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta acción eliminará permanentemente tu cuenta y todos tus datos. 
                  No se puede deshacer.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="mt-3">
                      Eliminar mi cuenta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        ¿Estás seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Esta acción <strong>no se puede deshacer</strong>. Se eliminarán 
                          permanentemente:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Tu perfil y configuración</li>
                          <li>Todas tus notas y calificaciones</li>
                          <li>Tu progreso en las asignaturas</li>
                          <li>Todos tus datos personales</li>
                        </ul>
                        <div className="pt-3">
                          <Label htmlFor="confirmEmail" className="text-foreground">
                            Escribe <strong>{userEmail}</strong> para confirmar:
                          </Label>
                          <Input
                            id="confirmEmail"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="tu@email.com"
                            className="mt-2"
                          />
                          {deleteError && (
                            <p className="text-sm text-destructive mt-2">{deleteError}</p>
                          )}
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setDeleteConfirmation('')
                        setDeleteError(null)
                      }}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault()
                          handleDeleteAccount()
                        }}
                        disabled={isDeleting || deleteConfirmation !== userEmail}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Eliminando...
                          </>
                        ) : (
                          'Eliminar cuenta'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
