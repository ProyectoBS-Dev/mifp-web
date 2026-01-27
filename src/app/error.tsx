'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, RefreshCcw } from 'lucide-react'

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Log error to console or error reporting service
		console.error('Error 500:', error)
	}, [error])

	return (
		<main className="min-h-screen relative overflow-hidden bg-background">
			{/* Background gradient layers - Red/Yellow theme for errors */}
			<div className="absolute inset-0 bg-gradient-to-br from-vt-red/10 via-transparent to-vt-yellow/10" />
			<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

			{/* Glow effects */}
			<div className="absolute top-1/4 left-[10%] w-32 h-32 bg-vt-red/20 rounded-full blur-3xl animate-pulse-soft" />
			<div className="absolute bottom-1/4 right-[10%] w-40 h-40 bg-vt-yellow/20 rounded-full blur-3xl animate-pulse-soft" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vt-red/10 rounded-full blur-[100px]" />

			{/* Content */}
			<div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-2">
				{/* Owl 500 with glow */}
				<div className="relative w-[280px] h-[280px]">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-48 h-48 bg-vt-red/30 rounded-full blur-3xl animate-pulse-soft" />
					</div>
					<Image
						src="/images/owl_500.png"
						alt="Error 500"
						width={280}
						height={280}
						className="relative z-10 drop-shadow-2xl"
						priority
					/>
				</div>

				{/* Text content */}
				<div className="text-center max-w-md">
					{/* 500 with gradient */}
					<h1 className="text-7xl sm:text-8xl font-bold mb-5">
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-vt-red to-vt-yellow">
							500
						</span>
					</h1>

					<h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
						¡Vaya! vemos llamas en el horizonte...
					</h2>

					<p className="text-muted-foreground mb-8">
						Nuestro búho técnico está intentando resolver el problema.
					</p>

					{/* Error details (only in development) */}
					{process.env.NODE_ENV === 'development' && (
						<details className="mb-8">
							<summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2 text-center">
								Ver detalles técnicos
							</summary>
							<div className="p-4 bg-muted/50 rounded-lg text-xs font-mono text-left break-all mt-2">
								<p className="text-vt-red mb-1">{error.message}</p>
								{error.digest && (
									<p className="text-muted-foreground">
										Digest: {error.digest}
									</p>
								)}
							</div>
						</details>
					)}

					{/* Action buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
						<Button
							onClick={reset}
							size="lg"
							className="w-full sm:w-auto bg-vt-red hover:bg-vt-red/90 text-white shadow-lg shadow-vt-red/30"
						>
							<RefreshCcw className="mr-2 h-4 w-4" />
							Intentar de nuevo
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="w-full sm:w-auto"
						>
							<Link href="/">
								<Home className="mr-2 h-4 w-4" />
								Ir al inicio
							</Link>
						</Button>
					</div>
				</div>

				{/* Footer hint */}
				<p className="mt-12 text-sm text-muted-foreground text-center">
					<Link href="/" className="font-medium text-vt-green hover:underline">
						MiFP
					</Link>
					{' '}— Tu compañero de estudios FP.
				</p>
			</div>
		</main>
	)
}
