import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mifp.dev'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y Condiciones de uso de MiFP. Conoce las normas que rigen el uso de nuestra plataforma de gestión académica para estudiantes de FP.',
  alternates: {
    canonical: `${baseUrl}/terminos`,
  },
  openGraph: {
    title: 'Términos y Condiciones | MiFP',
    description: 'Conoce las normas que rigen el uso de MiFP.',
    url: `${baseUrl}/terminos`,
    siteName: 'MiFP',
    images: [{
      url: `${baseUrl}/images/og-default.png`,
      width: 1200,
      height: 630,
      alt: 'MiFP - Términos y Condiciones',
    }],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Términos y Condiciones | MiFP',
    description: 'Conoce las normas de uso de MiFP.',
    images: [`${baseUrl}/images/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative px-4 pt-14 pb-10 sm:px-6 lg:px-8 overflow-hidden bg-background border-b border-border/40">
        {/* Patrón de fondo sutil */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Línea de gradiente en la parte inferior */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #2cb67d 50%, transparent 100%)'
          }}
        />
        
        {/* Glow effect sutil */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(44, 182, 125, 0.15), transparent 70%)'
          }}
        />
        
        <div className="relative max-w-4xl mx-auto">
          {/* Botón volver */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          
          {/* Título */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Términos y Condiciones
            </span>
          </h1>
          
          {/* Fecha de actualización */}
          <p className="text-muted-foreground text-sm">
            Última actualización: 20 de enero de 2026
          </p>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Información general</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP es una plataforma gratuita de gestión académica diseñada para estudiantes de 
              Formación Profesional. Al acceder y utilizar esta plataforma, aceptas estos 
              Términos y Condiciones en su totalidad.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              El uso de MiFP está sujeto a la legislación española, en particular a la 
              Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información 
              y de Comercio Electrónico (LSSI-CE).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Descripción del servicio</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MiFP ofrece las siguientes funcionalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Gestión y seguimiento de calificaciones académicas</li>
              <li>Visualización de PACs (Pruebas de Aprendizaje Continuo) y videotutorías</li>
              <li>Acceso a noticias y recursos educativos</li>
              <li>Personalización según grado y asignaturas matriculadas</li>
              <li>Sistema de notificaciones para fechas importantes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              El servicio se ofrece de forma <strong className="text-foreground">gratuita</strong> y 
              sin compromiso contractual de permanencia.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. Registro y cuenta de usuario</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para utilizar MiFP debes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Ser mayor de 16 años o contar con autorización de tu tutor legal</li>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la confidencialidad de tus credenciales de acceso</li>
              <li>Notificarnos cualquier uso no autorizado de tu cuenta</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Eres responsable de toda la actividad que ocurra bajo tu cuenta.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Uso aceptable</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Al usar MiFP, te comprometes a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Utilizar la plataforma únicamente para fines educativos personales</li>
              <li>No compartir contenido ilegal, ofensivo o que vulnere derechos de terceros</li>
              <li>No intentar acceder a cuentas de otros usuarios</li>
              <li>No realizar ingeniería inversa ni intentar vulnerar la seguridad del sistema</li>
              <li>No utilizar la plataforma para spam o actividades comerciales no autorizadas</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. Propiedad intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los contenidos de MiFP (diseño, código, textos, logotipos, imágenes) son 
              propiedad del equipo de MiFP o de sus respectivos titulares y están protegidos 
              por las leyes de propiedad intelectual.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los datos académicos que introduces (notas, progreso) son de tu propiedad y 
              puedes eliminarlos en cualquier momento desde tu cuenta.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Contenido de terceros</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP puede mostrar información proveniente de fuentes externas (como fechas de 
              PACs o videotutorías). Aunque nos esforzamos por mantener esta información 
              actualizada, no garantizamos su exactitud absoluta.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Te recomendamos verificar siempre las fechas oficiales en la plataforma de 
              tu centro educativo.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Disponibilidad del servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos esforzamos por mantener MiFP disponible 24/7, pero no garantizamos un 
              servicio ininterrumpido. Pueden producirse interrupciones por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>Mantenimiento programado o de emergencia</li>
              <li>Problemas técnicos fuera de nuestro control</li>
              <li>Actualizaciones de la plataforma</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Intentaremos notificar con antelación cualquier mantenimiento programado.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Limitación de responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. En la medida 
              permitida por la ley:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>No garantizamos que el servicio esté libre de errores</li>
              <li>No somos responsables de decisiones académicas basadas en la información mostrada</li>
              <li>No nos hacemos responsables de pérdidas de datos por causas ajenas a nuestra voluntad</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              MiFP es una herramienta de apoyo, no sustituye la información oficial de tu centro educativo.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Suspensión y cancelación</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos reservamos el derecho de suspender o cancelar tu cuenta si:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>Incumples estos Términos y Condiciones</li>
              <li>Realizas un uso abusivo o fraudulento de la plataforma</li>
              <li>Tu conducta perjudica a otros usuarios o al servicio</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Puedes cancelar tu cuenta en cualquier momento desde la sección de{' '}
              <Link href="/ajustes" className="text-primary hover:underline">Ajustes</Link>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">10. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos modificar estos Términos ocasionalmente. Los cambios entrarán en vigor 
              desde su publicación. El uso continuado de la plataforma tras los cambios 
              implica la aceptación de los nuevos términos.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para cambios significativos, te notificaremos a través de la plataforma.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">11. Legislación aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos Términos se rigen por la legislación española. Para cualquier controversia 
              derivada del uso de MiFP, las partes se someten a los juzgados y tribunales 
              del domicilio del usuario, conforme a la normativa de consumidores.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">12. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier consulta sobre estos Términos, puedes contactarnos en{' '}
              <a href="mailto:contacto@mifp.dev" className="text-primary hover:underline">contacto@mifp.dev</a>.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border not-prose">
            <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 text-sm text-muted-foreground font-normal">
              <span>© 2026 MiFP</span>
              <span>·</span>
              <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
              <span>·</span>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
