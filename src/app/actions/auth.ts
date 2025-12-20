'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Delete the current user's account
 * This uses the admin client to delete the user from Supabase Auth
 * The ON DELETE CASCADE will handle removing all related data
 */
export async function deleteAccount() {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'No se encontró el usuario' }
  }
  
  // Delete user using admin client
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  
  if (deleteError) {
    console.error('Error deleting user:', deleteError)
    return { error: 'Error al eliminar la cuenta' }
  }
  
  // Sign out and redirect
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get the current user with profile data
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  // Get profile data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return {
    ...user,
    profile,
  }
}
