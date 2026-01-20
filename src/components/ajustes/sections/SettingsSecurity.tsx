'use client'

import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SettingsSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Seguridad
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona la seguridad de tu cuenta
        </p>
      </div>

      <div className="space-y-3">
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
      </div>
    </div>
  )
}
