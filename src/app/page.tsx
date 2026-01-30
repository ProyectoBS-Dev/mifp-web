import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LandingContent } from '@/components/landing'

export default async function LandingPage() {
  // Check if user is logged in - redirect to dashboard if so
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingContent isLoggedIn={false} />
}