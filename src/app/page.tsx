import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  GraduationCap,
  Calendar,
  BarChart3,
  FileText,
  BookOpen,
  Bell,
  ArrowRight,
  UserPlus,
  LogIn,
  Heart,
  Rocket,
  TabletSmartphone,
  MonitorSmartphoneIcon
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">MiFP</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="h-5 w-5" />
                Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/registro">
                <UserPlus className="h-5 w-5" />
                Empezar gratis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vt-green/10 via-transparent to-vt-blue/10" />
        <div className="container mx-auto px-4 py-24 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              V1.0.0 - Presentamos MiFP - puedes conocer más en el<Link href="/blog" className="text-primary hover:underline">blog</Link>
              <Link href="/blog" className="text-primary hover:underline">
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Tu compañero de estudios{' '}
              <span className="gradient-text">FP</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground">
              Gestiona tus PACs, videotutorías, recursosy notas de forma sencilla.
              Organiza tu tiempo y mejora tu rendimiento académico.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/registro">
                  Crear cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/login">
                  Ya tengo cuenta</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-8">
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary"><TabletSmartphone className="h-6 w-6" />DAM</div>
                <div className="text-sm text-muted-foreground text-center">Multiplataforma</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary"><MonitorSmartphoneIcon className="h-6 w-6" />DAW</div>
                <div className="text-sm text-muted-foreground text-center">Web</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary"><Rocket className="h-6 w-6" />100%</div>
                <div className="text-sm text-muted-foreground text-center">Gratis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para aprobar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para estudiantes de Formación Profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Gestión de PACs"
              description="Controla tus tareas pendientes, fechas de entrega y progreso. Nunca olvides una entrega."
              color="green"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Calendario Integrado"
              description="Visualiza videotutorías, entregas y exámenes en un calendario personalizado."
              color="blue"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Seguimiento de Notas"
              description="Calcula tu nota final automáticamente según los criterios de evaluación oficiales."
              color="yellow"
            />
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Recursos de Estudio"
              description="Accede a materiales organizados por asignatura: PDFs, podcasts, enlaces útiles."
              color="purple"
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Notificaciones"
              description="Recibe alertas de entregas próximas, nuevos recursos y comunicados importantes."
              color="red"
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Dashboard Personal"
              description="Un panel de control personalizable con los widgets que más necesitas."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comienza en 3 simples pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Crea tu cuenta"
              description="Regístrate con tu email o usa Google/GitHub"
            />
            <StepCard
              number="2"
              title="Selecciona tu grado"
              description="Elige DAM o DAW y las asignaturas que cursas"
            />
            <StepCard
              number="3"
              title="¡Listo!"
              description="Comienza a organizar tus estudios desde tu dashboard"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Es gratis?</AccordionTrigger>
                <AccordionContent>
                  Sí, MiFP es completamente gratis. Es un proyecto creado por estudiantes de FP de Grado Superior de iLERNA Online y para estudiantes de FP.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Solo funciona para ILERNA?</AccordionTrigger>
                <AccordionContent>
                  Actualmente está optimizado para estudiantes de ILERNA Online, con el sistema de
                  evaluación específico (PACs, VTs, exámenes). Aunque puede adaptarse a otros centros.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>¿Qué grados están disponibles?</AccordionTrigger>
                <AccordionContent>
                  Actualmente soportamos DAM (Desarrollo de Aplicaciones Multiplataforma) y
                  DAW (Desarrollo de Aplicaciones Web), con todas sus asignaturas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>¿Cómo calcula las notas?</AccordionTrigger>
                <AccordionContent>
                  Utilizamos el sistema oficial de evaluación de ILERNA: PACs (interactivas y desarrollo),
                  Videotutorías y Examen Final, con los pesos correspondientes de cada Resultado de Aprendizaje (RA) establecidos en la Guía Didáctica de cada asignatura.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>¿Mis datos están seguros?</AccordionTrigger>
                <AccordionContent>
                  Sí, utilizamos Supabase con encriptación y Row Level Security (RLS).
                  Tus datos son privados y solo tú puedes acceder a ellos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-vt-green/20 to-vt-blue/20" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Listo para organizar tus estudios?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Únete a la comunidad de estudiantes de FP que ya están mejorando su rendimiento académico.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/registro">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold gradient-text">MiFP</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                Tu compañero de estudios para FP. Gestiona PACs, videotutorías, recursos y notas
                de forma sencilla.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/registro" className="hover:text-primary">Crear cuenta</Link></li>
                <li><Link href="/login" className="hover:text-primary">Iniciar sesión</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacidad" className="hover:text-primary">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-primary">Términos</Link></li>
                <li><Link href="/about-us" className="hover:text-primary">Sobre nosotros</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              ~/Dev © {new Date().getFullYear()} MiFP. Desarrollado para estudiantes de FP Online.
            </p>
            <TooltipProvider>
              <div className="flex items-center justify-center gap-3">
                <GithubIcon className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">Hecho con</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground font-medium">por:</span>
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
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'green' | 'blue' | 'yellow' | 'purple' | 'red'
}) {
  const colorClasses = {
    green: 'bg-vt-green/10 text-vt-green',
    blue: 'bg-vt-blue/10 text-vt-blue',
    yellow: 'bg-vt-yellow/10 text-vt-yellow-dark',
    purple: 'bg-vt-purple/10 text-vt-purple',
    red: 'bg-vt-red/10 text-vt-red',
  }

  return (
    <div className="relative p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// Ícono de GitHub de Simple Icons (https://simpleicons.org)
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}
