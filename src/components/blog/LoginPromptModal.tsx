'use client'

import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LoginPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function LoginPromptModal({ 
  open, 
  onOpenChange,
  title = '¡Inicia sesión para reaccionar!',
  description = 'Crea una cuenta gratuita para interactuar con el contenido y acceder a todas las herramientas de MiFP.'
}: LoginPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button asChild size="lg" className="w-full gap-2">
            <Link href="/registro">
              <UserPlus className="h-5 w-5" />
              Crear cuenta gratis
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full gap-2">
            <Link href="/login">
              <LogIn className="h-5 w-5" />
              Ya tengo cuenta
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Únete a miles de estudiantes de FP que ya usan MiFP
        </p>
      </DialogContent>
    </Dialog>
  )
}

