import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRightIcon } from 'lucide-react'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

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
            Última actualización: 13 de febrero de 2026
          </p>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Información general</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP es una plataforma gratuita de gestión académica diseñada para estudiantes de Formación Profesional. Al acceder y utilizar esta plataforma, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, te rogamos que no utilices nuestros servicios.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              El uso de MiFP se rige por la legislación española y, en lo que resulte de aplicación, por la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
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
              Eres el único responsable de toda la actividad que ocurra bajo tu cuenta. Al registrarte, confirmas cumplir los requisitos de edad y capacidad legal mencionados.
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
              Todos los contenidos de la plataforma (código fuente, diseño, logotipos, textos e imágenes de la interfaz) son propiedad exclusiva del equipo de MiFP o de sus respectivos titulares y están protegidos por las leyes de propiedad intelectual e industrial.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los <strong>datos académicos</strong> que introduces (tus notas, comentarios y progreso) son de tu propiedad. MiFP solo actúa como depositario para mostrarte la información, y puedes eliminarlos en cualquier momento cerrando tu cuenta.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Contenido de terceros</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP puede mostrar información proveniente de fuentes externas (como fechas de exámenes, PACs o enlaces a videotutorías). Aunque nos esforzamos por mantener esta información actualizada, <strong>no garantizamos su exactitud absoluta</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              MiFP es una herramienta de apoyo; te recomendamos verificar siempre las fechas y datos oficiales en la plataforma de tu centro educativo.
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
              <li>Problemas técnicos fuera de nuestro control (caídas de servidores, fallos de red)</li>
              <li>Actualizaciones de la plataforma</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Intentaremos notificar con antelación cualquier mantenimiento programado siempre que sea posible.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Limitación de responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              El servicio se proporciona &quot;tal cual&quot; (as is) y &quot;según disponibilidad&quot;. En la medida máxima permitida por la ley:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>No garantizamos que el servicio esté libre de errores (bugs)</li>
              <li>No somos responsables de decisiones académicas tomadas en base a la información mostrada en la app, ni de las consecuencias derivadas de la misma (ej. fechas de entrega perdidas, notas erróneas, etc.)</li>
              <li>No somos responsables de los datos introducidos por el usuario, y por lo tanto no nos hacemos responsables de los errores que estos puedan contener</li>
              <li>No nos hacemos responsables de pérdidas de datos por causas ajenas a nuestra voluntad o fuerza mayor</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Proporcionamos una herramienta de apoyo, no sustituye la información oficial de tu centro educativo.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Suspensión y cancelación</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos reservamos el derecho de suspender o cancelar tu cuenta temporal o definitivamente si:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>Incumples estos Términos y Condiciones</li>
              <li>Realizas un uso abusivo, fraudulento o que ponga en riesgo la seguridad de la plataforma</li>
              <li>Tu conducta perjudica a otros usuarios</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Por tu parte, puedes cancelar tu cuenta y borrar tus datos en cualquier momento desde la sección de{' '}
              <Link href="/ajustes" className="text-primary hover:underline">Ajustes</Link>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">10. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos modificar estos Términos ocasionalmente para adaptarlos a cambios legales o nuevas funcionalidades. Los cambios entrarán en vigor desde su publicación en esta página. El uso continuado de la plataforma tras los cambios implica la aceptación de los nuevos términos.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para cambios significativos, se procurará notificar a través de la plataforma, siendo esta página la vía principal de actualización de los términos y condiciones.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">11. Nulidad parcial</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si alguna disposición de estos Términos fuera declarada nula o inaplicable por un tribunal competente, dicha disposición se considerará excluida sin que ello afecte a la validez y exigibilidad de las disposiciones restantes, que seguirán vigentes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">12. Legislación aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos Términos se rigen por la legislación española. Para cualquier controversia 
              derivada del uso de MiFP, las partes se someten a los juzgados y tribunales 
              del domicilio del usuario, conforme a la normativa de consumidores.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">13. Proyecto y desarrollo</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP es una herramienta independiente creada por estudiantes de Formación Profesional como proyecto académico y técnico. <strong>No está afiliada, respaldada ni asociada oficialmente con ningún centro educativo público o privado.</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los nombres y marcas de instituciones educativas que pudieran aparecer se utilizan únicamente con fines descriptivos e informativos bajo el derecho de cita.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">14. Aviso legal e Identificación</h2>
            <p className="text-muted-foreground leading-relaxed">
              En cumplimiento del deber de información de la LSSI y el RGPD, los datos identificativos de los responsables de la plataforma, así como la información de contacto y domicilio, se encuentran detallados en nuestra <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border not-prose">
            <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 text-sm text-muted-foreground font-normal">
              <span>© 2026 MiFP - </span>
              <Link href="/privacidad" className="flex items-center gap-1 hover:text-primary transition-colors">Privacidad<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link>
              <Link href="/blog" className="flex items-center gap-1 hover:text-primary transition-colors">Blog<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link>
              <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">Inicio<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
