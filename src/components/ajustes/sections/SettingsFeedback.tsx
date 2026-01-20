'use client'

import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SettingsFeedback() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tu opinión nos ayuda a mejorar MiFP
        </p>
      </div>

      <div className="p-6 rounded-lg bg-muted/50 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium mb-2">Comparte tus sugerencias</p>
        <p className="text-sm text-muted-foreground mb-4">
          Próximamente podrás enviarnos tus ideas y sugerencias para mejorar la plataforma.
        </p>
        <Button disabled>
          Próximamente
        </Button>
      </div>
    </div>
  )
}
