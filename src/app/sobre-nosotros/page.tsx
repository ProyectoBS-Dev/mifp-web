import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Navbar, Footer } from '@/components/layout'
import { 
  ArrowRight, 
  UserPlus, 
  LogIn,
  Rocket,
  School,
  Code2,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  BookOpen,
  Sparkles
} from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Sobre Nosotros',
  description: 'Nuestra historia. De estudiantes para estudiantes.',
}

export default async function SobreNosotrosPage() {
  // Verificar si el usuario está autenticado
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si está autenticado, obtener el perfil completo para la Navbar
  let userData = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    userData = {
      id: user.id,
      email: user.email || '',
      full_name: profile?.full_name || null,
      avatar_url: profile?.avatar_url || null,
      role: profile?.role || null,
    }
  }

  return (
    <main className="min-h-screen">
      {/* Navbar condicional: autenticada o pública */}
      {userData ? (
        <Navbar user={userData} />
      ) : (
        <nav className="sticky top-0 z-50 w-full border-b border-vt-blue/20 bg-vt-blue/20 backdrop-blur supports-[backdrop-filter]:bg-vt-blue/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold gradient-text">MiFP</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
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
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section with background gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-vt-blue-light/10 via-background to-background dark:from-slate-900/30 dark:via-background dark:to-background">
        {/* Decorative background blurs */}
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-vt-green/10 dark:bg-vt-green/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-vt-blue/10 dark:bg-vt-blue/5 rounded-full blur-[100px] pointer-events-none" />

        <div className={`relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 ${userData ? 'container max-w-7xl' : 'container max-w-6xl'}`}>
          {/* Version Badge */}
          <ScrollReveal>
            <div className="flex justify-center mb-8">
              <Link
                href="/blog/mifp-el-inicio-de-una-nueva-aventura"
                className="group inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border border-vt-blue/50 dark:border-white/50 hover:bg-vt-gray/10 dark:hover:bg-white/10 transition-all"
              >
                <Rocket className="h-4 w-4 text-vt-blue" />
                <span className="text-xs font-bold text-vt-blue dark:text-slate-700">
                  V1.0.0 — Presentamos Nuestra Historia
                </span>
                <ArrowRight className="h-3 w-3 text-vt-blue group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Hero Title */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col items-center text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                Nuestra Historia
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                De estudiantes para estudiantes. Estamos redefiniendo cómo se vive la Formación Profesional en España.
              </p>
            </div>
          </ScrollReveal>

          {/* Bento Grid */}
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 auto-rows-[220px]">
              
              {/* Card 1 - El Origen (Grande - 2x2) */}
              <div className="md:col-span-2 md:row-span-2 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-10 hover:border-vt-green/50 transition-all overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-vt-green/10 text-vt-green px-3 py-1 rounded-full text-xs font-bold mb-6">
                    <Sparkles className="h-3 w-3" />
                    EL ORIGEN
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight">
                    FP Online &amp; La chispa inicial
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md text-base">
                    Todo comenzó en las aulas virtuales. Dos estudiantes de DAM y DAW online identificaron que la educación técnica necesitaba un puente entre la teoría académica y las exigencias del mercado real.
                  </p>
                </div>
                
                {/* Background icon effect */}
                <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.07] dark:group-hover:opacity-[0.1] transition-opacity">
                  <School className="w-60 h-60 text-foreground" />
                </div>

                {/* Student avatars */}
                <div className="mt-8 relative z-10">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full border-2 border-background bg-gradient-to-br from-vt-green to-vt-blue flex items-center justify-center">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-background bg-gradient-to-br from-vt-blue to-vt-purple flex items-center justify-center">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      +100
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Expertise (Vertical) */}
              <div className="md:col-span-1 md:row-span-2 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 hover:border-vt-blue/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-vt-blue/10 text-vt-blue px-3 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                    <Code2 className="h-3 w-3" />
                    Expertise
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold mb-4">
                    Expertos en DAW/DAM
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Nuestra base es el código. Especialistas en desarrollo web y multiplataforma con enfoque práctico y real.
                  </p>
                </div>
                
                <div className="flex items-center justify-center py-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-vt-blue/10 rounded-2xl flex items-center justify-center">
                      <Code2 className="h-12 w-12 text-vt-blue" />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-vt-green p-2.5 rounded-xl rotate-12 shadow-lg">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Fundador 1 */}
              <div className="md:col-span-1 md:row-span-1 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-green/50 transition-all flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vt-green to-vt-blue shadow-sm ring-1 ring-vt-green/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">B</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Estudiante DAW</h4>
                  <p className="text-muted-foreground text-xs font-medium">CTO &amp; Founder</p>
                  <div className="flex gap-2 mt-2">
                    <div className="w-7 h-7 rounded-lg bg-muted hover:bg-vt-green hover:text-white transition-colors flex items-center justify-center cursor-pointer">
                      <Code2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 - Fundador 2 */}
              <div className="md:col-span-1 md:row-span-1 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 hover:border-vt-purple/50 transition-all flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vt-blue to-vt-purple shadow-sm ring-1 ring-vt-purple/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">S</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Estudiante DAM</h4>
                  <p className="text-muted-foreground text-xs font-medium">CEO &amp; Product</p>
                  <div className="flex gap-2 mt-2">
                    <div className="w-7 h-7 rounded-lg bg-muted hover:bg-vt-purple hover:text-white transition-colors flex items-center justify-center cursor-pointer">
                      <Code2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5 - Misión (Horizontal - 2 columnas) */}
              <div className="md:col-span-2 md:row-span-1 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 hover:border-vt-green/50 transition-all flex items-center justify-between overflow-hidden">
                <div className="relative z-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-vt-green/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-vt-green" />
                    </div>
                    <h3 className="text-xl font-extrabold">Nuestra Misión</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                    Empoderar a cada estudiante con herramientas tecnológicas que conviertan el estudio en una ventaja competitiva inmediata. Gestionamos tus PACs de forma eficiente.
                  </p>
                </div>
                <div className="hidden sm:block opacity-[0.05] dark:opacity-[0.08] group-hover:opacity-[0.1] dark:group-hover:opacity-[0.15] transition-all group-hover:scale-110">
                  <Calendar className="w-20 h-20 text-foreground" />
                </div>
              </div>

              {/* Card 6 - Stat: Mejora de Notas */}
              <div className="md:col-span-1 md:row-span-1 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 hover:border-vt-yellow/50 transition-all flex flex-col justify-center items-center text-center">
                <div className="p-3 bg-vt-yellow/10 rounded-full mb-3">
                  <TrendingUp className="h-8 w-8 text-vt-yellow-dark" />
                </div>
                <p className="text-4xl font-black mb-1">98%</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Mejora de Notas
                </p>
              </div>

              {/* Card 7 - Stat: Seguridad */}
              <div className="md:col-span-1 md:row-span-1 group relative rounded-3xl border bg-card/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 hover:border-vt-green/50 transition-all flex flex-col justify-center items-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-vt-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Shield className="h-10 w-10 mb-3 text-vt-green relative z-10" />
                <p className="text-sm font-bold relative z-10">100% Seguro</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter relative z-10">
                  Privacidad Total
                </p>
              </div>

            </div>
          </ScrollReveal>

          {/* CTA Section */}
          <ScrollReveal delay={0.3}>
            <div className="mt-20 border-t pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="bg-card border shadow-sm p-4 rounded-2xl">
                  <Users className="h-8 w-8 text-vt-green" />
                </div>
                <div>
                  <p className="text-lg font-bold">Únete a nuestra comunidad</p>
                  <p className="text-sm text-muted-foreground">
                    Más de 100 estudiantes ya están mejorando sus resultados.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" asChild size="lg">
                  <Link href="/blog">
                    Visita nuestro blog
                  </Link>
                </Button>
                <Button asChild size="lg" className="shadow-lg shadow-vt-green/30 hover:shadow-vt-green/50 transition-shadow">
                  <Link href="/registro">
                    Empezar ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
