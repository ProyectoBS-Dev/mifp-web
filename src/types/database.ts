// Tipos generados de Supabase
// Para generar tipos actualizados:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'estudiante' | 'moderador' | 'editor'
          grado_id: string | null
          onboarding_completed: boolean
          notification_settings: Json
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'estudiante' | 'moderador' | 'editor'
          grado_id?: string | null
          onboarding_completed?: boolean
          notification_settings?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'estudiante' | 'moderador' | 'editor'
          grado_id?: string | null
          onboarding_completed?: boolean
          notification_settings?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      grados: {
        Row: {
          id: string
          nombre: string
          codigo: 'DAM' | 'DAW'
          descripcion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          codigo: 'DAM' | 'DAW'
          descripcion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          codigo?: 'DAM' | 'DAW'
          descripcion?: string | null
          created_at?: string
        }
      }
      semestres: {
        Row: {
          id: string
          nombre: string
          fecha_inicio: string
          fecha_fin: string
          año_academico: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          fecha_inicio: string
          fecha_fin: string
          año_academico: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          fecha_inicio?: string
          fecha_fin?: string
          año_academico?: string
          activo?: boolean
          created_at?: string
        }
      }
      asignaturas: {
        Row: {
          id: string
          grado_id: string
          nombre: string
          codigo: string
          semestre_recomendado: number | null
          descripcion: string | null
          horas: number | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          grado_id: string
          nombre: string
          codigo: string
          semestre_recomendado?: number | null
          descripcion?: string | null
          horas?: number | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          grado_id?: string
          nombre?: string
          codigo?: string
          semestre_recomendado?: number | null
          descripcion?: string | null
          horas?: number | null
          created_at?: string
          deleted_at?: string | null
        }
      }
      user_asignaturas: {
        Row: {
          id: string
          user_id: string
          asignatura_id: string
          semestre_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asignatura_id: string
          semestre_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asignatura_id?: string
          semestre_id?: string
          created_at?: string
        }
      }
      user_grid_layout: {
        Row: {
          id: string
          user_id: string
          layout_config: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          layout_config?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          layout_config?: Json
          updated_at?: string
        }
      }
      // TODO: Añadir el resto de tablas cuando se necesiten
    }
    Enums: {
      user_role: 'admin' | 'estudiante' | 'moderador' | 'editor'
      grado_tipo: 'DAM' | 'DAW'
      recurso_tipo: 'pdf' | 'enlace' | 'podcast'
      notificacion_tipo: 'pac_nueva' | 'pac_vencimiento' | 'vt_recordatorio' | 'comunicado' | 'sistema' | 'gd_subida'
      evento_tipo: 'pac' | 'vt' | 'examen' | 'custom'
      reaccion_tipo: 'like' | 'love' | 'clap' | 'fire' | 'thinking'
      pac_tipo: 'interactiva' | 'desarrollo'
      gd_estado: 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'
    }
  }
}

// Helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
