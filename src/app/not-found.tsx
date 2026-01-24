import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '404 - Página no encontrada',
    description: 'La página que buscas no existe. Vuelve al inicio de MiFP, tu compañero de estudios FP.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function NotFound() {
    return (
        <main className="min-h-screen relative overflow-hidden bg-background">
            {/* Background gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-vt-green/10 via-transparent to-vt-blue/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

            {/* Glow effects */}
            <div className="absolute top-1/4 left-[10%] w-32 h-32 bg-vt-green/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-[10%] w-40 h-40 bg-vt-blue/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vt-purple/10 rounded-full blur-[100px]" />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
                {/* Owl mascot with glow */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 bg-vt-green/30 rounded-full blur-3xl" />
                    </div>
                    <Image
                        src="/images/owl_404.png"
                        alt="Búho buscando la página perdida"
                        width={280}
                        height={280}
                        className="relative z-10 drop-shadow-2xl"
                        priority
                    />
                </div>

                {/* Text content */}
                <div className="text-center max-w-md">
                    {/* 404 with gradient */}
                    <h1 className="text-7xl sm:text-8xl font-bold mb-5">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-vt-green to-vt-blue">
                            404
                        </span>
                    </h1>

                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                        ¡Ups! Lo que buscas ha volado...
                    </h2>

                    <p className="text-muted-foreground mb-8">
                        Nuestro búho está buscando, pero mientras tanto puedes.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild size="lg" className="w-full sm:w-auto bg-vt-green hover:bg-vt-green/90 text-slate-950 shadow-lg shadow-vt-green/30">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Ir al inicio
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto bg-background/80 backdrop-blur-sm border"
                        >
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver atrás
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Footer hint */}
                <p className="absolute bottom-8 text-sm text-muted-foreground">
                    <Link href="/" className="font-medium text-vt-green hover:underline">MiFP</Link>
                    {' '}— Tu compañero de estudios FP.
                </p>
            </div>
        </main>
    )
}
