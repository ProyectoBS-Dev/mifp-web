import Image from 'next/image'
import { Clock, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail'

export const metadata: Metadata = {
	title: 'Mantenimiento',
	description: 'MiFP está en mantenimiento. Volvemos pronto con mejoras y nuevas funcionalidades.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function Maintenance() {
	return (
		<main className="min-h-screen relative overflow-hidden bg-background">
			{/* Background gradient layers - matching landing CTA section */}
			<div className="absolute inset-0 bg-gradient-to-br from-vt-green/10 via-transparent to-vt-blue/10" />
			<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

			{/* Decorative floating elements - matching landing */}
			<div className="absolute top-1/4 left-[10%] w-32 h-32 bg-vt-green/20 rounded-full blur-3xl" />
			<div className="absolute bottom-1/4 right-[10%] w-40 h-40 bg-vt-blue/20 rounded-full blur-3xl" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vt-purple/10 rounded-full blur-[100px]" />

			{/* Content */}
			<div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
				<div className="flex flex-col items-center justify-center flex-1 w-full">
					{/* Owl mascot with glow - matching landing CTA */}
					<div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] mb-4 sm:mb-6">
						{/* Glow effect behind mascot */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-vt-green/30 rounded-full blur-3xl" />
						</div>

						{/* Owl Mascot */}
						<Image
							src="/images/owl_maintenance.png"
							alt="Búho de mantenimiento"
							width={320}
							height={320}
							className="relative z-10 drop-shadow-2xl object-contain"
							priority
						/>
					</div>

					{/* Text content */}
					<div className="text-center max-w-2xl w-full px-2">
						{/* Main heading with gradient - matching landing style */}
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-vt-green to-vt-blue">
								Estamos mejorando MiFP
							</span>
						</h1>

						<div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
							<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-vt-green" />
							<h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
								Mantenimiento en curso
							</h2>
						</div>

						<p className="text-base sm:text-lg text-muted-foreground mb-2 sm:mb-3">
							Estamos realizando tareas de mantenimiento para ofrecerte una mejor experiencia.
						</p>
						<p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
							Volveremos pronto con <span className="text-vt-green font-medium">nuevas funcionalidades</span> y{' '}
							<span className="text-vt-blue font-medium">mejoras</span> para ti.
						</p>

					{/* Status indicators */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-vt-green/10 backdrop-blur-sm rounded-full border border-vt-green/20">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-green opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-vt-green"></span>
							</span>
							<span className="text-xs sm:text-sm text-foreground">Actualizando sistema</span>
						</div>
						<div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-vt-blue/10 backdrop-blur-sm rounded-full border border-vt-blue/20">
							<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-vt-blue" />
							<span className="text-xs sm:text-sm text-foreground">Preparando novedades</span>
						</div>
					</div>

					{/* Info box */}
					<div className="max-w-md mx-auto p-4 sm:p-6 bg-gradient-to-br from-vt-green/5 to-vt-blue/5 backdrop-blur-sm rounded-2xl border border-vt-green/10 mb-6 sm:mb-8">
						<p className="text-xs sm:text-sm text-muted-foreground mb-2">
							Si necesitas ayuda urgente, contacta con nosotros:
						</p>
						<ObfuscatedEmail 
							user="contacto" 
							domain="mifp" 
							tld="dev" 
							className="text-sm sm:text-base text-vt-green hover:text-vt-green-light font-medium transition-colors break-all"
						/>
					</div>
				</div>

				{/* Footer - within flow, not absolute */}
				<div className="text-center mt-6 sm:mt-8">
					<p className="text-xs sm:text-sm text-muted-foreground mb-2">
						Gracias por tu paciencia y comprensión
					</p>
					<p className="text-xs text-muted-foreground">
						<span className="font-medium text-vt-green">MiFP</span> — Tu compañero de estudios FP.
					</p>
				</div>
				</div>
			</div>
		</main>
	)
}
