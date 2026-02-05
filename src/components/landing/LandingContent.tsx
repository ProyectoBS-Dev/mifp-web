import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Calendar,
  BarChart3,
  FileText,
  BookOpen,
  Bell,
  ArrowRight,
  UserPlus,
  LogIn,
  Rocket,
  BadgeCheck,
  Eye,
  TabletSmartphone,
  MonitorSmartphoneIcon,
  Palette,
  Smartphone,
  LayoutDashboard,
  GitCompareArrows,
} from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Footer } from '@/components/layout/Footer'
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

interface LandingContentProps {
  isLoggedIn: boolean
}

export function LandingContent({ isLoggedIn }: LandingContentProps) {
  return (
    <main className="min-h-screen">
      {/* Navbar - Conditional based on auth */}
      <nav className="sticky top-0 z-50 w-full border-b border-vt-blue/20 bg-vt-blue/20 backdrop-blur supports-[backdrop-filter]:bg-vt-blue/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-14 items-center justify-between">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold gradient-text">MiFP</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <Button asChild className="gap-1.5 sm:gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Ir al Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="gap-1.5 sm:gap-2">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Iniciar sesión</span>
                  </Link>
                </Button>
                <Button asChild className="gap-1.5 sm:gap-2">
                  <Link href="/registro">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Empezar gratis</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - uses semantic background color */}
      <section className="relative min-h-screen-safe overflow-hidden bg-gradient-to-b from-vt-blue-light/20 via-background to-background dark:from-slate-900/50 dark:via-background dark:to-background">
        {/* Parallax Background */}
        <HeroParallax />

        {/* Content - z-10 to appear above background */}
        <div className="relative z-10 container mx-auto container-mobile pt-12 sm:pt-16 pb-24 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Notice Banner */}
            <Link
              href="/blog/mifp-el-inicio-de-una-nueva-aventura"
              className="group inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border border-vt-blue/50 dark:border-white/50 hover:bg-vt-gray/10 dark:hover:bg-white/10 transition-all mb-8"
            >
              <span className="text-lg">
                <Rocket className="h-5 w-5 text-vt-blue" />
              </span>
              <span className="text-sm text-vt-blue font-bold font-mono dark:text-slate-700">
                V1.0.0 - <span className="text-vt-green">Presentamos MiFP</span>
              </span>
              <ArrowRight className="h-4 w-4 text-vt-blue group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <h1 className="text-3xl xs:text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white">
              Tu compañero de estudios{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vt-green to-vt-blue">
                FP
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-400 dark:text-slate-700">
              Gestiona tus PACs, videotutorías, recursos y notas de forma
              sencilla. Organiza tu tiempo y mejora tu rendimiento académico.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-vt-green hover:bg-vt-green/90 text-slate-950"
                >
                  <Link href="#faqs">
                    Ver preguntas frecuentes
                    <Eye className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-vt-green hover:bg-vt-green/90 text-slate-950"
                  >
                    <Link href="/registro">
                      Crear cuenta
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-background/80 backdrop-blur-sm"
                  >
                    <Link href="/login">Ya tengo cuenta</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-2 xs:gap-4 sm:gap-6 md:gap-8 border-t border-vt-blue/30 pt-6 sm:pt-8">
              <div>
                <div className="flex items-center justify-center gap-1 xs:gap-2 text-xl xs:text-2xl sm:text-3xl font-bold text-slate-500 dark:text-slate-700">
                  <TabletSmartphone className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                  DAM
                </div>
                <div className="text-xs xs:text-sm text-slate-400 dark:text-slate-700 text-center">
                  Multiplataforma
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 xs:gap-2 text-xl xs:text-2xl sm:text-3xl font-bold text-slate-500 dark:text-slate-700">
                  <MonitorSmartphoneIcon className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                  DAW
                </div>
                <div className="text-xs xs:text-sm text-slate-400 dark:text-slate-700 text-center">
                  Web
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 xs:gap-2 text-xl xs:text-2xl sm:text-3xl font-bold text-slate-500 dark:text-slate-700">
                  <BadgeCheck className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                  100%
                </div>
                <div className="text-xs xs:text-sm text-slate-400 dark:text-slate-700 text-center">
                  Gratis
                </div>
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
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[200px] md:w-[600px] md:h-[400px] bg-vt-blue/20 dark:bg-vt-blue/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[200px] h-[150px] md:w-[400px] md:h-[300px] bg-vt-green/15 dark:bg-vt-green/10 rounded-full blur-3xl" />

          <div className="container mx-auto container-mobile relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vt-green to-vt-blue mb-6">
                <GitCompareArrows className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl xs:text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Todo tu FP en un solo lugar
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Un dashboard personalizado que te muestra exactamente lo que
                necesitas para aprobar tus asignaturas.
              </p>
            </div>

            {/* Main Feature Card */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="relative rounded-2xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                {/* Card glow effect */}
                <div className="absolute -top-20 right-1/4 w-[500px] h-[300px] bg-vt-green/20 dark:bg-vt-blue/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative p-6 sm:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                  {/* Left content */}
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vt-green/10 text-vt-green text-sm font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-green"></span>
                      </span>
                      Dashboard Personal
                    </div>

                    <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold">
                      Tu centro de control académico.{' '}
                      <span className="text-muted-foreground">
                        Visualiza PACs pendientes, próximas videotutorías y tu
                        progreso en tiempo real.
                      </span>
                    </h3>

                    <Button
                      asChild
                      variant="link"
                      className="p-0 h-auto text-vt-green hover:text-vt-green/80"
                    >
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
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 auto-rows-[minmax(160px,auto)]">

              {/* Card 1 - PACs (Grande - ocupa 2 filas en lg) */}
              <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 xs:p-5 sm:p-6 hover:border-vt-green/50 transition-all lg:row-span-2 min-w-0">
                <div className="h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-green/10 mb-3">
                    <FileText className="h-6 w-6 text-vt-green" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">
                    Gestión de PACs
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Controla tus tareas pendientes, fechas de entrega y
                    progreso. Nunca olvides una entrega.
                  </p>
                  {/* Illustration - subida */}
                  <div className="flex-1 flex items-center justify-center min-h-[100px]">
                    <PacsIllustration />
                  </div>
                  {/* Stats mini - bajadas */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="rounded-lg bg-vt-green/5 p-3 border border-vt-green/10">
                      <div className="text-2xl font-bold text-vt-green">8</div>
                      <div className="text-xs text-muted-foreground">
                        Pendientes
                      </div>
                    </div>
                    <div className="rounded-lg bg-vt-green/5 p-3 border border-vt-green/10">
                      <div className="text-2xl font-bold text-vt-green">5</div>
                      <div className="text-xs text-muted-foreground">
                        Esta semana
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Calendario (Normal) */}
              <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-blue/50 transition-all flex flex-col">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-blue/10 mb-3">
                  <Calendar className="h-6 w-6 text-vt-blue" />
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  Calendario Integrado
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Visualiza videotutorías, entregas y exámenes en un calendario
                  personalizado.
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
                <h4 className="text-lg font-semibold mb-2">
                  Seguimiento de Notas
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Calcula tu nota final automáticamente según los criterios de
                  evaluación oficiales.
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
                    <h4 className="text-lg font-semibold mb-2">
                      Recursos de Estudio
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Accede a materiales organizados por asignatura: PDFs,
                      podcasts, enlaces útiles.
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
                  Recibe alertas de entregas próximas, nuevos recursos y
                  comunicados importantes.
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
                      <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">
                        Dashboard Personal
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Un panel de control personalizable con los widgets que
                        más necesitas.
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
                      <div className="text-xs text-muted-foreground">
                        Widgets activos
                      </div>
                    </div>
                    <div className="rounded-lg bg-vt-green/5 p-3 border border-vt-green/10">
                      <div className="text-sm font-semibold text-vt-green flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-green opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-green"></span>
                        </span>
                        En tiempo real
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Datos actualizados
                      </div>
                    </div>
                    <div className="rounded-lg bg-vt-blue/5 p-3 border border-vt-blue/10">
                      <div className="text-sm font-semibold text-vt-blue flex items-center gap-1.5">
                        <Palette className="h-4 w-4" />
                        100%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Personalizable
                      </div>
                    </div>
                    <div className="rounded-lg bg-vt-purple/5 p-3 border border-vt-purple/10">
                      <div className="text-sm font-semibold text-vt-purple flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4" />
                        Multi
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Dispositivo
                      </div>
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
        <section className="py-24 sm:py-32 relative overflow-hidden">
          {/* Background gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-vt-green/10 via-transparent to-vt-blue/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

          {/* Decorative floating elements */}
          <div className="absolute top-1/4 left-[10%] w-20 h-20 md:w-32 md:h-32 bg-vt-green/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-[10%] w-24 h-24 md:w-40 md:h-40 bg-vt-blue/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-vt-purple/10 rounded-full blur-[100px]" />

          <div className="container mx-auto container-mobile text-center relative">
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
                className="w-[200px] h-[200px] xs:w-[250px] xs:h-[250px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] object-contain drop-shadow-2xl relative z-10"
              />
            </div>

            <h2 className="text-2xl xs:text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              ¿Listo para organizar tus estudios?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Únete a la comunidad de estudiantes de FP que ya están mejorando
              su rendimiento académico.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg shadow-vt-green/30 hover:shadow-vt-green/50 transition-shadow"
                >
                  <Link href="/dashboard">
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="shadow-lg shadow-vt-green/30 hover:shadow-vt-green/50 transition-shadow"
                  >
                    <Link href="/registro">
                      Crear cuenta gratis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <Link href="/login">Ya tengo cuenta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <Footer />
    </main>
  )
}
