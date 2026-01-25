import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursos de Estudio',
  description: 'Encuentra PDFs, videos, tests y más materiales compartidos por administradores para tus asignaturas de FP.',
  openGraph: {
    title: 'Recursos de Estudio | MiFP',
    description: 'Accede a materiales de estudio compartidos: PDFs, videos, tests y enlaces útiles para tus asignaturas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos de Estudio | MiFP',
    description: 'Accede a materiales de estudio compartidos: PDFs, videos, tests y enlaces útiles para tus asignaturas.',
  }
}

export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<LayoutSkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}

function LayoutSkeleton() {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block w-64 border-r p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      
      {/* Content skeleton */}
      <main className="flex-1 p-6">
        <Skeleton className="h-12 w-64 mb-4" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </main>
    </div>
  )
}
