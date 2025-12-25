import { Metadata } from 'next'
import { NewsFeed } from '@/components/blog'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mifp.app'

export const metadata: Metadata = {
  title: 'Blog | MiFP - Noticias y Recursos para estudiantes de FP',
  description: 'Últimas noticias, comunicados, recursos y guías para estudiantes de Formación Profesional en ILERNA. Mantente al día con todo lo relacionado con DAM, DAW y más ciclos formativos.',
  keywords: ['FP', 'ILERNA', 'DAM', 'DAW', 'formación profesional', 'noticias FP', 'recursos estudiantes', 'ciclos formativos'],
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'Blog | MiFP - Noticias y Recursos para estudiantes de FP',
    description: 'Últimas noticias, comunicados, recursos y guías para estudiantes de Formación Profesional en ILERNA.',
    url: `${baseUrl}/blog`,
    siteName: 'MiFP',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | MiFP - Noticias y Recursos para estudiantes de FP',
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">
          Últimas noticias, comunicados y recursos compartidos
        </p>
      </div>
      
      <NewsFeed />
    </div>
  )
}

