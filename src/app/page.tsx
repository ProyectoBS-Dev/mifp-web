import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowUpRightIcon } from 'lucide-react'
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
  BadgeCheck,
  TabletSmartphone,
  MonitorSmartphoneIcon,
  Palette,
  Smartphone,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import {
  HeroParallax,
  HeroTabs,
  FAQSection,
  HowItWorks,
  AnimatedDashboard,
  PacsIllustration,
  CalendarIllustration,
  NotasIllustration,
  RecursosIllustration,
  NotificacionesIllustration,
  DashboardIllustration,
} from '@/components/landing'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default async function LandingPage() {
  // Check if user is logged in - redirect to dashboard if so
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-vt-blue/20 bg-vt-blue/20 backdrop-blur supports-[backdrop-filter]:bg-vt-blue/20">
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

      {/* Hero Section - uses semantic background color */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-vt-blue-light/20 via-background to-background dark:from-slate-900/50 dark:via-background dark:to-background">
        {/* Parallax Background */}
        <HeroParallax />
        
        {/* Content - z-10 to appear above background */}
        <div className="relative z-10 container mx-auto px-4 pt-16 pb-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Notice Banner */}
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border border-vt-blue/50 dark:border-white/50 hover:bg-vt-gray/10 dark:hover:bg-white/10 transition-all mb-8"
            >
              <span className="text-lg"><Rocket className="h-5 w-5 text-vt-blue" /></span>
              <span className="text-sm text-vt-blue font-bold font-mono dark:text-slate-700">
                V1.0.0 - <span className="text-vt-green">Presentamos MiFP</span>
              </span>
              <ArrowRight className="h-4 w-4 text-vt-blue group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-slate-900 dark:text-white">
              Tu compañero de estudios{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vt-green to-vt-blue">FP</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-8 text-slate-400 dark:text-slate-700">
              Gestiona tus PACs, videotutorías, recursos y notas de forma sencilla.
              Organiza tu tiempo y mejora tu rendimiento académico.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-vt-green hover:bg-vt-green/90 text-slate-950">
                <Link href="/registro">
                  Crear cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-background/80 backdrop-blur-sm">
                <Link href="/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-vt-blue/30 pt-8">
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-500 dark:text-slate-700"><TabletSmartphone className="h-6 w-6" />DAM</div>
                <div className="text-sm text-slate-400 dark:text-slate-700 text-center">Multiplataforma</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-500 dark:text-slate-700"><MonitorSmartphoneIcon className="h-6 w-6" />DAW</div>
                <div className="text-sm text-slate-400 dark:text-slate-700 text-center">Web</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-500 dark:text-slate-700"><BadgeCheck className="h-6 w-6" />100%</div>
                <div className="text-sm text-slate-400 dark:text-slate-700 text-center">Gratis</div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview with Tabs */}
          <HeroTabs />
        </div>

        {/* Wave divider - uses semantic background color */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] z-20">
          <svg 
            className="relative block w-full h-[80px] md:h-[120px]" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z" 
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Feature Showcase */}
      <ScrollReveal delay={0.2}>
        <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background gradient - adapts to theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/50" />

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-vt-blue/20 dark:bg-vt-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-vt-green/15 dark:bg-vt-green/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vt-green to-vt-blue mb-6">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
              Todo tu FP en un solo lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un dashboard personalizado que te muestra exactamente lo que necesitas para aprobar tus asignaturas.
            </p>
          </div>

          {/* Main Feature Card */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="relative rounded-2xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute -top-20 right-1/4 w-[500px] h-[300px] bg-vt-green/20 dark:bg-vt-blue/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
                {/* Left content */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vt-green/10 text-vt-green text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-green"></span>
                    </span>
                    Dashboard Personal
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Tu centro de control académico.{' '}
                    <span className="text-muted-foreground">
                      Visualiza PACs pendientes, próximas videotutorías y tu progreso en tiempo real.
                    </span>
                  </h3>

                  <Button asChild variant="link" className="p-0 h-auto text-vt-green hover:text-vt-green/80">
                    <Link href="/registro">
                      Acceder al Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Right - Dashboard preview */}
                <div className="relative">
                  {/* Animated Dashboard */}
                  <AnimatedDashboard />
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid - 6 Feature Cards */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(160px,auto)]">

            {/* Card 1 - PACs (Grande - ocupa 2 filas) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-green/50 transition-all lg:row-span-2">
              <div className="h-full flex flex-col">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-green/10 mb-3">
                  <FileText className="h-6 w-6 text-vt-green" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Gestión de PACs</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Controla tus tareas pendientes, fechas de entrega y progreso. Nunca olvides una entrega.
                </p>
                {/* Illustration - subida */}
                <div className="flex-1 flex items-center justify-center min-h-[100px]">
                  <PacsIllustration />
                </div>
                {/* Stats mini - bajadas */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="rounded-lg bg-vt-green/5 p-3 border border-vt-green/10">
                    <div className="text-2xl font-bold text-vt-green">8</div>
                    <div className="text-xs text-muted-foreground">Pendientes</div>
                  </div>
                  <div className="rounded-lg bg-vt-green/5 p-3 border border-vt-green/10">
                    <div className="text-2xl font-bold text-vt-green">5</div>
                    <div className="text-xs text-muted-foreground">Esta semana</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Calendario (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-blue/50 transition-all flex flex-col">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-blue/10 mb-3">
                <Calendar className="h-6 w-6 text-vt-blue" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Calendario Integrado</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Visualiza videotutorías, entregas y exámenes en un calendario personalizado.
              </p>
              {/* Illustration */}
              <div className="mt-auto flex items-end justify-center pt-2">
                <CalendarIllustration />
              </div>
            </div>

            {/* Card 3 - Notas (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-yellow/50 transition-all flex flex-col">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-yellow/10 mb-3">
                <BarChart3 className="h-6 w-6 text-vt-yellow-dark" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Seguimiento de Notas</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Calcula tu nota final automáticamente según los criterios de evaluación oficiales.
              </p>
              {/* Illustration */}
              <div className="mt-auto flex items-end justify-center pt-2">
                <NotasIllustration />
              </div>
            </div>

            {/* Card 4 - Recursos (Grande - ocupa 2 columnas en lg) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-purple/50 transition-all lg:col-span-2">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-purple/10 shrink-0">
                  <BookOpen className="h-6 w-6 text-vt-purple" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Recursos de Estudio</h4>
                  <p className="text-sm text-muted-foreground">
                    Accede a materiales organizados por asignatura: PDFs, podcasts, enlaces útiles.
                  </p>
                </div>
                {/* Illustration */}
                <div className="flex items-center justify-center shrink-0 w-full md:w-auto">
                  <RecursosIllustration />
                </div>
              </div>
            </div>

            {/* Card 5 - Notificaciones (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-red/50 transition-all flex flex-col">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-red/10 mb-3">
                <Bell className="h-6 w-6 text-vt-red" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Notificaciones</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Recibe alertas de entregas próximas, nuevos recursos y comunicados importantes.
              </p>
              {/* Illustration */}
              <div className="mt-auto flex items-end justify-center pt-2">
                <NotificacionesIllustration />
              </div>
            </div>

            {/* Card 6 - Dashboard (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all lg:col-span-2">
              <div className="flex flex-col h-full">
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">Dashboard Personal</h4>
                    <p className="text-sm text-muted-foreground">
                      Un panel de control personalizable con los widgets que más necesitas.
                    </p>
                  </div>
                  {/* Illustration */}
                  <div className="flex items-center justify-center shrink-0 w-full md:w-auto">
                    <DashboardIllustration />
                  </div>
                </div>
                {/* Mini badges - grid 2x2 */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">6</div>
                    <div className="text-xs text-muted-foreground">Widgets activos</div>
                  </div>
                  <div className="rounded-lg bg-vt-green/5 p-3 border border-vt-green/10">
                    <div className="text-sm font-semibold text-vt-green flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-green"></span>
                      </span>
                      En tiempo real
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Datos actualizados</div>
                  </div>
                  <div className="rounded-lg bg-vt-blue/5 p-3 border border-vt-blue/10">
                    <div className="text-sm font-semibold text-vt-blue flex items-center gap-1.5">
                      <Palette className="h-4 w-4" />
                      100%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Personalizable</div>
                  </div>
                  <div className="rounded-lg bg-vt-purple/5 p-3 border border-vt-purple/10">
                    <div className="text-sm font-semibold text-vt-purple flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4" />
                      Multi
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Dispositivo</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* How it works */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal delay={0.1}>
        <FAQSection />
      </ScrollReveal>

      {/* CTA Section - Premium */}
      <ScrollReveal delay={0.2}>
        <section className="py-24 sm:py-30 relative overflow-hidden">
          {/* Background gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-vt-green/10 via-transparent to-vt-blue/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
          
          {/* Decorative floating elements */}
          <div className="absolute top-1/4 left-[10%] w-32 h-32 bg-vt-green/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-[10%] w-40 h-40 bg-vt-blue/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vt-purple/10 rounded-full blur-[100px]" />
          
          <div className="container mx-auto px-4 text-center relative">
            {/* Mascot Image with glow */}
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-vt-green/30 rounded-full blur-3xl" />
              </div>
              <Image
                src="/images/owl_cta.webp"
                alt="MiFP Mascot"
                width={400}
                height={400}
                className="object-contain drop-shadow-2xl relative z-10"
              />
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              ¿Listo para organizar tus estudios?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Únete a la comunidad de estudiantes de FP que ya están mejorando su rendimiento académico.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="shadow-lg shadow-vt-green/30 hover:shadow-vt-green/50 transition-shadow">
                <Link href="/registro">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-background/80 backdrop-blur-sm">
                <Link href="/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
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
    </main>
  )
}