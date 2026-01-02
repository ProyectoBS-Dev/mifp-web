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
  MonitorSmartphoneIcon,
  MessageCircle,
  HelpCircle,
  Coins,
  Calculator,
  Shield,
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
            {/* Notice Banner - GitHub Style */}
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-vt-green/10 dark:bg-vt-green/20 border border-vt-green/20 dark:border-vt-green/30 hover:bg-vt-green/15 dark:hover:bg-vt-green/25 transition-all mb-6"
            >
              <span className="text-lg">🚀</span>
              <span className="text-sm font-medium text-foreground">
                V1.0.0 - Presentamos MiFP - conoce más en nuestro Blog de noticias y novedades
              </span>
              <ArrowRight className="h-4 w-4 text-vt-green group-hover:translate-x-0.5 transition-transform" />
            </Link>

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

      {/* Feature Showcase */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background gradient - adapts to theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-vt-blue/20 dark:bg-vt-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-vt-green/15 dark:bg-vt-green/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
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
                  {/* Screenshot container with glow */}
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border bg-background">
                    {/* Dashboard preview */}
                    <Image
                      src="/images/dashboard_preview.png"
                      alt="Dashboard de MiFP"
                      width={600}
                      height={400}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  {/* Decorative glow behind screenshot */}
                  <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-vt-green/20 via-vt-blue/20 to-vt-blue-light/20 rounded-2xl blur-2xl opacity-60" />
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid - 6 Feature Cards */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">

            {/* Card 1 - PACs (Grande - ocupa 2 filas) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-green/50 transition-all lg:row-span-2">
              <div className="h-full flex flex-col">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-green/10 mb-4">
                  <FileText className="h-6 w-6 text-vt-green" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Gestión de PACs</h4>
                <p className="text-sm text-muted-foreground flex-1">
                  Controla tus tareas pendientes, fechas de entrega y progreso. Nunca olvides una entrega.
                </p>
                {/* Preview placeholder */}
                <div className="mt-4 rounded-lg border bg-muted/30 overflow-hidden flex-1 min-h-[120px] flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Preview PACs</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Calendario (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-blue/50 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-blue/10 mb-4">
                <Calendar className="h-6 w-6 text-vt-blue" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Calendario Integrado</h4>
              <p className="text-sm text-muted-foreground">
                Visualiza videotutorías, entregas y exámenes en un calendario personalizado.
              </p>
            </div>

            {/* Card 3 - Notas (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-yellow/50 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-yellow/10 mb-4">
                <BarChart3 className="h-6 w-6 text-vt-yellow-dark" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Seguimiento de Notas</h4>
              <p className="text-sm text-muted-foreground">
                Calcula tu nota final automáticamente según los criterios de evaluación oficiales.
              </p>
            </div>

            {/* Card 4 - Recursos (Grande - ocupa 2 columnas en lg) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-purple/50 transition-all lg:col-span-2">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-purple/10 shrink-0">
                  <BookOpen className="h-6 w-6 text-vt-purple" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Recursos de Estudio</h4>
                  <p className="text-sm text-muted-foreground">
                    Accede a materiales organizados por asignatura: PDFs, podcasts, enlaces útiles.
                  </p>
                </div>
                {/* Preview placeholder */}
                <div className="hidden md:flex rounded-lg border bg-muted/30 overflow-hidden w-32 h-20 items-center justify-center shrink-0">
                  <p className="text-xs text-muted-foreground">Preview</p>
                </div>
              </div>
            </div>

            {/* Card 5 - Notificaciones (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-red/50 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vt-red/10 mb-4">
                <Bell className="h-6 w-6 text-vt-red" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Notificaciones</h4>
              <p className="text-sm text-muted-foreground">
                Recibe alertas de entregas próximas, nuevos recursos y comunicados importantes.
              </p>
            </div>

            {/* Card 6 - Dashboard (Normal) */}
            <div className="group relative rounded-xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all lg:col-span-2">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Dashboard Personal</h4>
                  <p className="text-sm text-muted-foreground">
                    Un panel de control personalizable con los widgets que más necesitas.
                  </p>
                </div>
                {/* Preview placeholder */}
                <div className="hidden md:flex rounded-lg border bg-muted/30 overflow-hidden w-32 h-20 items-center justify-center shrink-0">
                  <p className="text-xs text-muted-foreground">Preview</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-24 sm:py-32 bg-muted/30">
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
      </section> */}

      {/* How it works */}
      <section className="py-24 sm:py-32">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vt-green to-vt-blue mb-6 mx-auto">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
        </div>
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
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vt-green to-vt-blue mb-6">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Todo lo que necesitas saber sobre MiFP
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-4 bg-background">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-vt-green/10 shrink-0">
                      <Coins className="w-4 h-4 text-vt-green" />
                    </span>
                    <span className="font-medium">¿Es gratis?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-11 text-muted-foreground">
                  Sí, MiFP es completamente gratis. Es un proyecto creado por estudiantes de FP de Grado Superior de iLERNA Online y para estudiantes de FP.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-4 bg-background">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-vt-blue/10 shrink-0">
                      <GraduationCap className="w-4 h-4 text-vt-blue" />
                    </span>
                    <span className="font-medium">¿Solo funciona para ILERNA?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-11 text-muted-foreground">
                  Actualmente está optimizado para estudiantes de ILERNA Online, con el sistema de evaluación específico (PACs, VTs, exámenes). Aunque puede adaptarse a otros centros.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-4 bg-background">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-vt-purple/10 shrink-0">
                      <BookOpen className="w-4 h-4 text-vt-purple" />
                    </span>
                    <span className="font-medium">¿Qué grados están disponibles?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-11 text-muted-foreground">
                  Actualmente soportamos DAM (Desarrollo de Aplicaciones Multiplataforma) y DAW (Desarrollo de Aplicaciones Web), con todas sus asignaturas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-4 bg-background">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-vt-yellow/10 shrink-0">
                      <Calculator className="w-4 h-4 text-vt-yellow" />
                    </span>
                    <span className="font-medium">¿Cómo calcula las notas?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-11 text-muted-foreground">
                  Utilizamos el sistema oficial de evaluación de ILERNA: PACs (interactivas y desarrollo), Videotutorías y Examen Final, con los pesos correspondientes de cada Resultado de Aprendizaje (RA) establecidos en la Guía Didáctica.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-4 bg-background">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-vt-red/10 shrink-0">
                      <Shield className="w-4 h-4 text-vt-red" />
                    </span>
                    <span className="font-medium">¿Mis datos están seguros?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-11 text-muted-foreground">
                  Sí, utilizamos Supabase con encriptación y Row Level Security (RLS). Tus datos son privados y solo tú puedes acceder a ellos.
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
          {/* Mascot Image */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/mifp_mascot.png"
              alt="MiFP Mascot"
              width={200}
              height={200}
              className="object-contain drop-shadow-lg"
            />
          </div>
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
          <div className="flex flex-col md:flex-row md:justify-center gap-8 md:gap-16 lg:gap-24">
            {/* Logo & Description */}
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold gradient-text">MiFP</span>
              </Link>
              <p className="text-sm text-muted-foreground">
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
              ~/Dev desarrollado por estudiantes de FP - © MiFP.
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
