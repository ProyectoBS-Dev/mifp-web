import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LandingContent } from '@/components/landing'

// SEO: Canonical URL pointing to root - tells Google /home is a duplicate of /
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://mifp.dev/',
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return <LandingContent isLoggedIn={isLoggedIn} />
}
