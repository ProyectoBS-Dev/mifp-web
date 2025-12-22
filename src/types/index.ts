export * from './database'
export * from './calendario'

// Tipos de usuario
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'estudiante' | 'moderador' | 'editor'
  grado_id: string | null
  onboarding_completed: boolean
}

// Tipo para la sesión
export interface Session {
  user: UserProfile | null
  isLoading: boolean
  error: Error | null
}
