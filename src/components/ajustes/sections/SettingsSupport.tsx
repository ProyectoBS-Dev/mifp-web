'use client'

import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SettingsSupport() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Soporte
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿Tienes algún problema? Estamos aquí para ayudarte
        </p>
      </div>

      <div className="p-6 rounded-lg bg-muted/50 text-center">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium mb-2">Formulario de contacto</p>
        <p className="text-sm text-muted-foreground mb-4">
          Próximamente podrás contactar con nuestro equipo de soporte directamente desde aquí.
        </p>
        <Button disabled>
          Próximamente
        </Button>
      </div>
    </div>
  )
}
