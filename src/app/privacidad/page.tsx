import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRightIcon } from 'lucide-react'
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mifp.dev'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de Privacidad de MiFP. Conoce cómo recopilamos, usamos y protegemos tus datos personales en nuestra plataforma de gestión académica para estudiantes de FP.',
  alternates: {
    canonical: `${baseUrl}/privacidad`,
  },
  openGraph: {
    title: 'Política de Privacidad | MiFP',
    description: 'Conoce cómo recopilamos, usamos y protegemos tus datos personales en MiFP.',
    url: `${baseUrl}/privacidad`,
    siteName: 'MiFP',
    images: [{
      url: `${baseUrl}/images/og-default.png`,
      width: 1200,
      height: 630,
      alt: 'MiFP - Política de Privacidad',
    }],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Política de Privacidad | MiFP',
    description: 'Conoce cómo protegemos tus datos en MiFP.',
    images: [`${baseUrl}/images/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacidadPage() {
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
              Política de Privacidad
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
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Responsable del tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP es una plataforma de gestión académica para estudiantes de Formación Profesional. 
              El responsable del tratamiento de tus datos personales es el equipo de MiFP.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Datos que recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Recopilamos los siguientes datos cuando utilizas MiFP:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Datos de cuenta:</strong> Email, nombre y avatar (opcional)</li>
              <li><strong className="text-foreground">Datos académicos:</strong> Grado (DAM/DAW), asignaturas matriculadas, notas registradas</li>
              <li><strong className="text-foreground">Preferencias:</strong> Tema de la interfaz, configuración de notificaciones</li>
              <li><strong className="text-foreground">Datos de uso:</strong> Interacciones con la plataforma para mejorar la experiencia</li>
              <li><strong className="text-foreground">Datos de terceros:</strong> Si te registras mediante Google o GitHub, recibimos tu email, nombre y avatar asociados a esas cuentas, conforme a sus propias políticas de privacidad.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. Finalidad del tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos tus datos para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Gestionar tu cuenta y proporcionarte acceso a la plataforma</li>
              <li>Personalizar tu experiencia mostrando información relevante a tu grado y asignaturas</li>
              <li>Enviarte notificaciones sobre PACs, videotutorías y novedades (si las tienes activadas)</li>
              <li>Mejorar nuestros servicios basándonos en el uso general de la plataforma</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Base legal</h2>
            <p className="text-muted-foreground leading-relaxed">
              El tratamiento de tus datos se basa en tu <strong className="text-foreground">consentimiento</strong>, 
              que otorgas al registrarte en la plataforma y aceptar estos términos. Puedes retirar 
              tu consentimiento en cualquier momento eliminando tu cuenta desde la sección de Ajustes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. Destinatarios de los datos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para el funcionamiento de la plataforma, compartimos datos con los siguientes proveedores de servicios:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Supabase:</strong> Almacenamiento de base de datos y autenticación</li>
              <li><strong className="text-foreground">Vercel:</strong> Alojamiento y despliegue de la aplicación</li>
              <li><strong className="text-foreground">Cloudflare:</strong> Proveedor de seguridad y protección contra bots (Turnstile).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Estos proveedores actúan como encargados del tratamiento y están obligados contractualmente 
              a proteger tus datos conforme al RGPD.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Alojamiento de datos y transferencias internacionales</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Base de datos principal:</strong> Tus datos personales (email, notas, progreso) se almacenan físicamente en Irlanda (Región eu-west-1), dentro del Espacio Económico Europeo (EEE), bajo la estricta protección del RGPD.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Alojamiento de la aplicación:</strong> La ejecución del código de MiFP se realiza en servidores de Vercel ubicados mayoritariamente en la Unión Europea (Francia y Alemania).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En los casos donde se realice procesamiento técnico en Reino Unido (región de Londres), nos amparamos en la Decisión de Adecuación de la Comisión Europea (adoptada el 28 de junio de 2021), la cual reconoce que Reino Unido ofrece un nivel de protección de datos equivalente al de la Unión Europea, garantizando la seguridad de tu información.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Conservación de datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conservamos tus datos mientras tu cuenta esté activa. Si decides eliminar tu cuenta, 
              todos tus datos personales serán eliminados permanentemente de nuestros sistemas 
              de forma inmediata.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Tus derechos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Conforme al RGPD, tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Acceso:</strong> Consultar qué datos tenemos sobre ti</li>
              <li><strong className="text-foreground">Rectificación:</strong> Corregir datos inexactos desde tu perfil</li>
              <li><strong className="text-foreground">Supresión:</strong> Eliminar tu cuenta y todos tus datos</li>
              <li><strong className="text-foreground">Portabilidad:</strong> Solicitar una copia de tus datos contactándonos a <ObfuscatedEmail user="contacto" domain="mifp" tld="dev" className="text-primary hover:underline">nuestro correo</ObfuscatedEmail></li>
              <li><strong className="text-foreground">Oposición:</strong> Oponerte a determinados tratamientos</li>
              <li><strong className="text-foreground">Limitación:</strong> Solicitar la limitación del tratamiento en ciertos casos</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Puedes ejercer estos derechos desde la sección de <Link href="/ajustes" className="text-primary hover:underline">Ajustes</Link> de tu cuenta.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Si consideras que el tratamiento de tus datos vulnera la normativa, tienes derecho a presentar 
              una reclamación ante la <strong className="text-foreground">Agencia Española de Protección de Datos (AEPD)</strong> en{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aepd.es</a>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              MiFP utiliza únicamente <strong className="text-foreground">cookies técnicas esenciales</strong> para 
              el funcionamiento de la plataforma:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li><strong className="text-foreground">Sesión:</strong> Para mantener tu sesión iniciada</li>
              <li><strong className="text-foreground">Preferencias:</strong> Para recordar tu tema (claro/oscuro)</li>
              <li><strong className="text-foreground">Seguridad:</strong> Utilizamos Cloudflare Turnstile para proteger el registro contra bots. Esta herramienta puede analizar tu comportamiento de navegación de forma anónima para distinguir humanos de robots, siendo estrictamente necesaria para la seguridad.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              No utilizamos cookies de terceros para publicidad ni seguimiento.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">10. Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Protegemos tus datos mediante:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>Conexiones seguras (HTTPS) en toda la plataforma</li>
              <li>Almacenamiento en servidores de Supabase con encriptación</li>
              <li>Autenticación segura para acceder a tu cuenta</li>
              <li>Acceso restringido a los datos solo al personal autorizado</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">11. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar esta política ocasionalmente. Te notificaremos de cualquier cambio 
              significativo a través de la plataforma. Te recomendamos revisar esta página 
              periódicamente.
            </p>
          </section>

          {/* Footer de la política */}
          <div className="mt-12 pt-8 border-t border-border not-prose">
            <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 text-sm text-muted-foreground font-normal">
              <span>© 2026 MiFP - </span>
              <Link href="/terminos" className="flex items-center gap-1 hover:text-primary transition-colors">Términos<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link>
              <Link href="/blog" className="flex items-center gap-1 hover:text-primary transition-colors">Blog<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link>
              <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">Inicio<ArrowUpRightIcon className="h-4 w-4 opacity-50" /></Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
