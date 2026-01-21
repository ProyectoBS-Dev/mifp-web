'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    const router = useRouter()
    return (
        <main className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-950">
            {/* Background gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-vt-blue-light/20 to-vt-green/10 dark:from-slate-950 dark:via-vt-blue/10 dark:to-vt-green/5" />

            {/* Glow effects */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-vt-blue/20 dark:bg-vt-blue/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[250px] bg-vt-green/15 dark:bg-vt-green/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-vt-purple/5 rounded-full blur-[150px]" />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
                {/* Owl mascot with glow */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 bg-vt-green/20 rounded-full blur-3xl" />
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

                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        ¡Ups! Página no encontrada
                    </h2>

                    <p className="text-slate-600 mb-8">
                        Parece que esta página se ha ido a estudiar a otra parte.
                        Nuestro búho está buscándola, pero mientras tanto...
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
                            onClick={() => router.back()}
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto bg-white/80  backdrop-blur-sm border-slate-300 dark:border-slate-700"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver atrás
                        </Button>
                    </div>
                </div>

                {/* Footer hint */}
                <p className="absolute bottom-8 text-sm text-slate-500 dark:text-slate-500">
                    <Link href="/" className="font-medium text-vt-green hover:underline">MiFP</Link>
                    {' '}— Tu compañero de estudios FP
                </p>
            </div>
        </main>
    )
}
