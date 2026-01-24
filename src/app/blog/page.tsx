import { Metadata } from 'next'
import { NewsFeed } from '@/components/blog'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mifp.app'

export const metadata: Metadata = {
  title: 'Blog - Noticias y Recursos para estudiantes de FP',
  description: 'Últimas noticias, comunicados, recursos y guías para estudiantes de Formación Profesional en ILERNA. Mantente al día con todo lo relacionado con DAM, DAW y más ciclos formativos.',
  keywords: ['FP', 'ILERNA', 'DAM', 'DAW', 'formación profesional', 'noticias FP', 'recursos estudiantes', 'ciclos formativos'],
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'Blog - Noticias y Recursos para estudiantes de FP',
    description: 'Últimas noticias, comunicados, recursos y guías para estudiantes de Formación Profesional en ILERNA.',
    url: `${baseUrl}/blog`,
    siteName: 'MiFP',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Noticias y Recursos para estudiantes de FP',
    description: 'Últimas noticias, comunicados, recursos y guías para estudiantes de FP en ILERNA.',
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
}

export default function BlogPage() {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative -mx-4 -mt-6 px-4 pt-14 pb-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-hidden bg-background">
        {/* Patrón de fondo sutil */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Línea de gradiente animada en la parte inferior */}
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
        
        <div className="relative text-center mx-auto">
          {/* Badge decorativo */}
          {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            🤓 Hemos venido a aprobar
          </span> */}
          
          {/* Título */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              MiFP Blog
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Últimas noticias, comunicados y recursos compartidos
          </p>
        </div>
      </div>

      <NewsFeed />
    </div>
  )
}

