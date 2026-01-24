import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import { QueryProvider } from '@/providers/QueryProvider'
import './globals.css'

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mifp.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'MiFP - Tu compañero de estudios de FP',
    template: '%s | MiFP',
  },
  description: 'Plataforma de gestión académica para estudiantes de Formación Profesional en ILERNA. Gestiona tus PACs, videotutorías, notas y más.',
  keywords: ['FP', 'ILERNA', 'DAM', 'DAW', 'estudiantes', 'gestión académica', 'formación profesional', 'ciclos formativos', 'PACs', 'videotutorías'],
  authors: [{ name: 'MiFP Team' }],
  creator: 'MiFP',
  publisher: 'MiFP',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'MiFP - Tu compañero de estudios de FP',
    description: 'Plataforma de gestión académica para estudiantes de Formación Profesional en ILERNA',
    url: baseUrl,
    siteName: 'MiFP',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/images/og-image.png`, // Crear esta imagen: 1200x630px
        width: 1200,
        height: 630,
        alt: 'MiFP - Tu compañero de estudios de FP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiFP - Tu compañero de estudios de FP',
    description: 'Plataforma de gestión académica para estudiantes de FP en ILERNA',
    images: [`${baseUrl}/images/og-image.png`],
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
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
