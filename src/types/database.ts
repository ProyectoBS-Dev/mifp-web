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
          codigo: string
          fecha_inicio: string
          fecha_fin: string
          año_academico: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          codigo: string
          fecha_inicio: string
          fecha_fin: string
          año_academico: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          codigo?: string
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
      asignatura_ras: {
        Row: {
          id: string
          asignatura_id: string
          semestre_id: string
          numero: number
          codigo: string | null
          titulo: string
          descripcion: string | null
          fecha_inicio: string | null
          fecha_fin: string | null
          peso_nota: number | null
          created_at: string
        }
        Insert: {
          id?: string
          asignatura_id: string
          semestre_id: string
          numero: number
          codigo?: string | null
          titulo: string
          descripcion?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          peso_nota?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          asignatura_id?: string
          semestre_id?: string
          numero?: number
          codigo?: string | null
          titulo?: string
          descripcion?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          peso_nota?: number | null
          created_at?: string
        }
      }
      asignatura_pacs: {
        Row: {
          id: string
          asignatura_id: string
          semestre_id: string
          ra_id: string | null
          numero: number
          numero_en_ra: number | null
          tipo_pac: 'interactiva' | 'desarrollo'
          titulo: string
          descripcion: string | null
          peso_nota: number | null
          nota_minima: number | null
          fecha_apertura: string | null
          fecha_limite: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asignatura_id: string
          semestre_id: string
          ra_id?: string | null
          numero: number
          numero_en_ra?: number | null
          tipo_pac?: 'interactiva' | 'desarrollo'
          titulo: string
          descripcion?: string | null
          peso_nota?: number | null
          nota_minima?: number | null
          fecha_apertura?: string | null
          fecha_limite?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asignatura_id?: string
          semestre_id?: string
          ra_id?: string | null
          numero?: number
          numero_en_ra?: number | null
          tipo_pac?: 'interactiva' | 'desarrollo'
          titulo?: string
          descripcion?: string | null
          peso_nota?: number | null
          nota_minima?: number | null
          fecha_apertura?: string | null
          fecha_limite?: string | null
          created_at?: string
        }
      }
      user_asignatura_pacs: {
        Row: {
          id: string
          user_asignatura_id: string
          pac_id: string
          completada: boolean
          nota: number | null
          fecha_entrega: string | null
          fecha_limite_personalizada: string | null
          comentarios: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_asignatura_id: string
          pac_id: string
          completada?: boolean
          nota?: number | null
          fecha_entrega?: string | null
          fecha_limite_personalizada?: string | null
          comentarios?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_asignatura_id?: string
          pac_id?: string
          completada?: boolean
          nota?: number | null
          fecha_entrega?: string | null
          fecha_limite_personalizada?: string | null
          comentarios?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_notas_examen: {
        Row: {
          id: string
          user_asignatura_id: string
          nota_examen: number | null
          nota_final_calculada: number | null
          aprobada: boolean | null
          convocatoria: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_asignatura_id: string
          nota_examen?: number | null
          nota_final_calculada?: number | null
          aprobada?: boolean | null
          convocatoria?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_asignatura_id?: string
          nota_examen?: number | null
          nota_final_calculada?: number | null
          aprobada?: boolean | null
          convocatoria?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_fct: {
        Row: {
          id: string
          user_id: string
          nota: number | null
          empresa: string | null
          tutor_empresa: string | null
          fecha_inicio: string | null
          fecha_fin: string | null
          horas_totales: number
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nota?: number | null
          empresa?: string | null
          tutor_empresa?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          horas_totales?: number
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nota?: number | null
          empresa?: string | null
          tutor_empresa?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          horas_totales?: number
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guias_didacticas: {
        Row: {
          id: string
          asignatura_id: string
          semestre_id: string
          archivo_path: string
          procesada: boolean
          estado: 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'
          datos_extraidos: Json | null
          subido_por: string | null
          validada_por: string | null
          motivo_rechazo: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          asignatura_id: string
          semestre_id: string
          archivo_path: string
          procesada?: boolean
          estado?: 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'
          datos_extraidos?: Json | null
          subido_por?: string | null
          validada_por?: string | null
          motivo_rechazo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          asignatura_id?: string
          semestre_id?: string
          archivo_path?: string
          procesada?: boolean
          estado?: 'pendiente' | 'extrayendo' | 'extraida' | 'validada' | 'rechazada'
          datos_extraidos?: Json | null
          subido_por?: string | null
          validada_por?: string | null
          motivo_rechazo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
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
