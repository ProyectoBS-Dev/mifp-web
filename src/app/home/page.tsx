import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LandingContent } from '@/components/landing'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

export const metadata: Metadata = {
  alternates: {
    canonical: `${baseUrl}/`,
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return <LandingContent isLoggedIn={isLoggedIn} />
}
