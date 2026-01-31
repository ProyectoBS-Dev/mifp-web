'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowUpRightIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-center gap-8 md:gap-16 lg:gap-24">
          {/* Logo & Description */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold gradient-text">MiFP</span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Tu compañero de estudios para FP Online. 
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Esta web es una herramienta complementaria de seguimiento de tus estudios en tu centro educativo. 
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="inline-flex items-center gap-1 hover:text-primary">Blog <ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link></li>
              <li><Link href="/registro" className="inline-flex items-center gap-1 hover:text-primary">Crear cuenta <ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link></li>
              <li><Link href="/login" className="inline-flex items-center gap-1 hover:text-primary">Iniciar sesión <ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacidad" className="inline-flex items-center gap-1 hover:text-primary">Privacidad <ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link></li>
              <li><Link href="/terminos" className="inline-flex items-center gap-1 hover:text-primary">Términos <ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link></li>
              <li><Link href="/sobre-nosotros" className="inline-flex items-center gap-1 hover:text-primary">Sobre nosotros <ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <p className="flex items-center gap-2 text-sm text-muted-foreground md:pr-32">
            ~/Dev desarrollado por estudiantes de FP.
          </p>
          <TooltipProvider>
            <div className="flex items-center justify-center gap-3 md:pl-8">
              <span className="text-sm text-muted-foreground font-medium">Hecho con</span>
              <Heart className="h-4 w-4 text-vt-red" />
              <span className="text-sm text-muted-foreground font-medium">por</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link target="_blank" href="https://github.com/benriosdev" className="transition-opacity hover:opacity-60">
                    <Image
                      src="/images/student_boy_nobg_bezel.png"
                      alt="Chico Estudiante"
                      width={46}
                      height={46}
                      className="object-contain"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver perfil de BenriosDev</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link target="_blank" href="https://github.com/SilviaPescador" className="transition-opacity hover:opacity-60">
                    <Image
                      src="/images/student_girl_nobg_bezel.png"
                      alt="Chica Estudiante"
                      width={46}
                      height={46}
                      className="object-contain"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver perfil de Silvia Pescador</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  )
}
