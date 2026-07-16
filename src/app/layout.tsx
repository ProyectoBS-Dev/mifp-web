import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { QueryProvider } from '@/providers/QueryProvider'
import './globals.css'

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'MiFP - Tu compañero de estudios de FP',
    template: '%s | MiFP',
  },
  description: 'Plataforma de gestión académica para estudiantes de Formación Profesional Online. Gestiona tu progreso y evaluación continua, videotutorías, notas y más.',
  keywords: ['FP', 'ILERNA', 'DAM', 'DAW', 'estudiantes', 'gestión académica', 'formación profesional', 'ciclos formativos', 'PACs', 'videotutorías'],
  authors: [{ name: 'MiFP Team' }],
  creator: 'MiFP',
  publisher: 'MiFP',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'MiFP - Tu compañero de estudios de FP',
    description: 'Plataforma de gestión académica para estudiantes de Formación Profesional Online.',
    url: baseUrl,
    siteName: 'MiFP',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'MiFP - Tu compañero de estudios de FP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiFP - Tu compañero de estudios de FP',
    description: 'Plataforma de gestión académica para estudiantes de FP Online.',
    images: [`${baseUrl}/images/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Añadir verificación de Google Search Console cuando esté disponible
    // google: 'tu-codigo-de-verificacion',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script anti-flash para evitar parpadeo de tema incorrecto */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${onest.variable} font-sans antialiased bg-background text-foreground`}>
        {/* JSON-LD Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'MiFP',
              alternateName: 'Mi Formación Profesional',
              url: baseUrl,
              logo: `${baseUrl}/images/isotipo.png`,
              description: 'Plataforma de gestión académica para estudiantes de Formación Profesional Online. Gestiona tu progreso y evaluación continua, videotutorías, notas y más.',
              foundingDate: '2025',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'ES',
              },
            }).replace(/</g, '\\u003c'),
          }}
        />
        <QueryProvider>
          {children}
        </QueryProvider>
        {/* Vercel Analytics solo en producción */}
        { process.env.NODE_ENV === 'production' && <Analytics /> }
      </body>
    </html>
  )
}
