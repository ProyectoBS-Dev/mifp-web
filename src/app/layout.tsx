import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import './globals.css'

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
})

export const metadata: Metadata = {
  title: 'MiFP - Tu compañero de estudios',
  description: 'Plataforma de gestión académica para estudiantes de FP en ILERNA',
  keywords: ['FP', 'ILERNA', 'DAM', 'DAW', 'estudiantes', 'gestión académica'],
  authors: [{ name: 'MiFP Team' }],
  openGraph: {
    title: 'MiFP - Tu compañero de estudios',
    description: 'Plataforma de gestión académica para estudiantes de FP en ILERNA',
    type: 'website',
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
        {children}
      </body>
    </html>
  )
}
