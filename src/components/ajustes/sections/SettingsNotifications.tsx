'use client'

import { Bell, Loader2, Check } from 'lucide-react'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface SettingsNotificationsProps {
  userRole?: 'admin' | 'estudiante' | 'moderador' | 'editor'
}

export function SettingsNotifications({ userRole = 'estudiante' }: SettingsNotificationsProps) {
  const { settings, updateSettings, isUpdating } = useNotificationSettings()

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona cómo y cuándo recibes notificaciones
        </p>
      </div>

      <div className="space-y-4">
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
          <Check className="h-3 w-3 text-vt-green" />
          Tus preferencias se guardan automáticamente
        </div>
      </div>
    </div>
  )
}
