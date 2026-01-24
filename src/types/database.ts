export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apuntes: {
        Row: {
          archived: boolean | null
          color: string | null
          contenido: string
          created_at: string | null
          id: string
          orden: number | null
          pinned: boolean | null
          titulo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          color?: string | null
          contenido: string
          created_at?: string | null
          id?: string
          orden?: number | null
          pinned?: boolean | null
          titulo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          color?: string | null
          contenido?: string
          created_at?: string | null
          id?: string
          orden?: number | null
          pinned?: boolean | null
          titulo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apuntes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      asignatura_pacs: {
        Row: {
          asignatura_id: string
          created_at: string | null
          descripcion: string | null
          fecha_apertura: string | null
          fecha_limite: string | null
          id: string
          nota_minima: number | null
          numero: number
          numero_en_ra: number | null
          peso_nota: number | null
          ra_id: string | null
          semestre_id: string
          tipo_pac: Database["public"]["Enums"]["pac_tipo"] | null
          titulo: string
        }
        Insert: {
          asignatura_id: string
          created_at?: string | null
          descripcion?: string | null
          fecha_apertura?: string | null
          fecha_limite?: string | null
          id?: string
          nota_minima?: number | null
          numero: number
          numero_en_ra?: number | null
          peso_nota?: number | null
          ra_id?: string | null
          semestre_id: string
          tipo_pac?: Database["public"]["Enums"]["pac_tipo"] | null
          titulo: string
        }
        Update: {
          asignatura_id?: string
          created_at?: string | null
          descripcion?: string | null
          fecha_apertura?: string | null
          fecha_limite?: string | null
          id?: string
          nota_minima?: number | null
          numero?: number
          numero_en_ra?: number | null
          peso_nota?: number | null
          ra_id?: string | null
          semestre_id?: string
          tipo_pac?: Database["public"]["Enums"]["pac_tipo"] | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignatura_pacs_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignatura_pacs_ra_id_fkey"
            columns: ["ra_id"]
            isOneToOne: false
            referencedRelation: "asignatura_ras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignatura_pacs_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
        ]
      }
      asignatura_ras: {
        Row: {
          asignatura_id: string
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          numero: number
          peso_nota: number | null
          semestre_id: string
          titulo: string
        }
        Insert: {
          asignatura_id: string
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          numero: number
          peso_nota?: number | null
          semestre_id: string
          titulo: string
        }
        Update: {
          asignatura_id?: string
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          numero?: number
          peso_nota?: number | null
          semestre_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignatura_ras_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignatura_ras_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
        ]
      }
      asignatura_vts: {
        Row: {
          asignatura_id: string
          created_at: string | null
          duracion_minutos: number | null
          enlace_grabacion: string | null
          fecha_programada: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          numero: number
          semestre_id: string
          titulo: string
          updated_at: string | null
          zoom_meeting_id: string | null
          zoom_passcode: string | null
        }
        Insert: {
          asignatura_id: string
          created_at?: string | null
          duracion_minutos?: number | null
          enlace_grabacion?: string | null
          fecha_programada?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          numero: number
          semestre_id: string
          titulo: string
          updated_at?: string | null
          zoom_meeting_id?: string | null
          zoom_passcode?: string | null
        }
        Update: {
          asignatura_id?: string
          created_at?: string | null
          duracion_minutos?: number | null
          enlace_grabacion?: string | null
          fecha_programada?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          numero?: number
          semestre_id?: string
          titulo?: string
          updated_at?: string | null
          zoom_meeting_id?: string | null
          zoom_passcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asignatura_vts_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignatura_vts_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
        ]
      }
      asignaturas: {
        Row: {
          codigo: string
          created_at: string | null
          deleted_at: string | null
          descripcion: string | null
          grado_id: string
          horas: number | null
          id: string
          nombre: string
          semestre_recomendado: number | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          grado_id: string
          horas?: number | null
          id?: string
          nombre: string
          semestre_recomendado?: number | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          grado_id?: string
          horas?: number | null
          id?: string
          nombre?: string
          semestre_recomendado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asignaturas_grado_id_fkey"
            columns: ["grado_id"]
            isOneToOne: false
            referencedRelation: "grados"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_calendario: {
        Row: {
          asignatura_id: string | null
          color: string | null
          created_at: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          recordatorio: number | null
          source: string | null
          tipo: Database["public"]["Enums"]["evento_tipo"]
          titulo: string
          todo_el_dia: boolean | null
          user_id: string
        }
        Insert: {
          asignatura_id?: string | null
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          recordatorio?: number | null
          source?: string | null
          tipo: Database["public"]["Enums"]["evento_tipo"]
          titulo: string
          todo_el_dia?: boolean | null
          user_id: string
        }
        Update: {
          asignatura_id?: string | null
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          recordatorio?: number | null
          source?: string | null
          tipo?: Database["public"]["Enums"]["evento_tipo"]
          titulo?: string
          todo_el_dia?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_calendario_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      grados: {
        Row: {
          codigo: Database["public"]["Enums"]["grado_tipo"]
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          codigo: Database["public"]["Enums"]["grado_tipo"]
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          codigo?: Database["public"]["Enums"]["grado_tipo"]
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      guias_didacticas: {
        Row: {
          archivo_path: string
          asignatura_id: string
          created_at: string | null
          datos_extraidos: Json | null
          deleted_at: string | null
          estado: Database["public"]["Enums"]["gd_estado"] | null
          id: string
          motivo_rechazo: string | null
          procesada: boolean | null
          semestre_id: string
          subido_por: string | null
          updated_at: string | null
          validada_por: string | null
        }
        Insert: {
          archivo_path: string
          asignatura_id: string
          created_at?: string | null
          datos_extraidos?: Json | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["gd_estado"] | null
          id?: string
          motivo_rechazo?: string | null
          procesada?: boolean | null
          semestre_id: string
          subido_por?: string | null
          updated_at?: string | null
          validada_por?: string | null
        }
        Update: {
          archivo_path?: string
          asignatura_id?: string
          created_at?: string | null
          datos_extraidos?: Json | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["gd_estado"] | null
          id?: string
          motivo_rechazo?: string | null
          procesada?: boolean | null
          semestre_id?: string
          subido_por?: string | null
          updated_at?: string | null
          validada_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guias_didacticas_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guias_didacticas_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guias_didacticas_subido_por_fkey"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guias_didacticas_validada_por_fkey"
            columns: ["validada_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      noticia_reacciones: {
        Row: {
          created_at: string | null
          id: string
          noticia_id: string
          tipo_reaccion: Database["public"]["Enums"]["reaccion_tipo"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          noticia_id: string
          tipo_reaccion: Database["public"]["Enums"]["reaccion_tipo"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          noticia_id?: string
          tipo_reaccion?: Database["public"]["Enums"]["reaccion_tipo"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticia_reacciones_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticia_reacciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias: {
        Row: {
          autor_id: string
          contenido: string
          created_at: string | null
          deleted_at: string | null
          id: string
          imagen_url: string | null
          publicada: boolean | null
          slug: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          autor_id: string
          contenido: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          imagen_url?: string | null
          publicada?: boolean | null
          slug: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string
          contenido?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          imagen_url?: string | null
          publicada?: boolean | null
          slug?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          leida: boolean | null
          mensaje: string | null
          tipo: Database["public"]["Enums"]["notificacion_tipo"]
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          leida?: boolean | null
          mensaje?: string | null
          tipo: Database["public"]["Enums"]["notificacion_tipo"]
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          leida?: boolean | null
          mensaje?: string | null
          tipo?: Database["public"]["Enums"]["notificacion_tipo"]
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos: {
        Row: {
          archivo_path: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          descripcion: string | null
          duracion: number | null
          id: string
          tipo: Database["public"]["Enums"]["recurso_tipo"]
          titulo: string
          url: string | null
        }
        Insert: {
          archivo_path?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          duracion?: number | null
          id?: string
          tipo: Database["public"]["Enums"]["recurso_tipo"]
          titulo: string
          url?: string | null
        }
        Update: {
          archivo_path?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          duracion?: number | null
          id?: string
          tipo?: Database["public"]["Enums"]["recurso_tipo"]
          titulo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_asignaturas: {
        Row: {
          asignatura_id: string
          recurso_id: string
        }
        Insert: {
          asignatura_id: string
          recurso_id: string
        }
        Update: {
          asignatura_id?: string
          recurso_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_asignaturas_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_asignaturas_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
        ]
      }
      semestres: {
        Row: {
          activo: boolean | null
          año_academico: string
          codigo: string
          created_at: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          año_academico: string
          codigo: string
          created_at?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          año_academico?: string
          codigo?: string
          created_at?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      user_asignatura_pacs: {
        Row: {
          comentarios: string | null
          completada: boolean | null
          created_at: string | null
          fecha_entrega: string | null
          fecha_limite_personalizada: string | null
          id: string
          nota: number | null
          pac_id: string
          updated_at: string | null
          user_asignatura_id: string
        }
        Insert: {
          comentarios?: string | null
          completada?: boolean | null
          created_at?: string | null
          fecha_entrega?: string | null
          fecha_limite_personalizada?: string | null
          id?: string
          nota?: number | null
          pac_id: string
          updated_at?: string | null
          user_asignatura_id: string
        }
        Update: {
          comentarios?: string | null
          completada?: boolean | null
          created_at?: string | null
          fecha_entrega?: string | null
          fecha_limite_personalizada?: string | null
          id?: string
          nota?: number | null
          pac_id?: string
          updated_at?: string | null
          user_asignatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_asignatura_pacs_pac_id_fkey"
            columns: ["pac_id"]
            isOneToOne: false
            referencedRelation: "asignatura_pacs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_asignatura_pacs_user_asignatura_id_fkey"
            columns: ["user_asignatura_id"]
            isOneToOne: false
            referencedRelation: "user_asignaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_asignatura_vts: {
        Row: {
          created_at: string | null
          fecha_personalizada: string | null
          hora_personalizada: string | null
          id: string
          user_asignatura_id: string
          vista: boolean | null
          vt_id: string
        }
        Insert: {
          created_at?: string | null
          fecha_personalizada?: string | null
          hora_personalizada?: string | null
          id?: string
          user_asignatura_id: string
          vista?: boolean | null
          vt_id: string
        }
        Update: {
          created_at?: string | null
          fecha_personalizada?: string | null
          hora_personalizada?: string | null
          id?: string
          user_asignatura_id?: string
          vista?: boolean | null
          vt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_asignatura_vts_user_asignatura_id_fkey"
            columns: ["user_asignatura_id"]
            isOneToOne: false
            referencedRelation: "user_asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_asignatura_vts_vt_id_fkey"
            columns: ["vt_id"]
            isOneToOne: false
            referencedRelation: "asignatura_vts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_asignaturas: {
        Row: {
          asignatura_id: string
          created_at: string | null
          id: string
          semestre_id: string
          user_id: string
        }
        Insert: {
          asignatura_id: string
          created_at?: string | null
          id?: string
          semestre_id: string
          user_id: string
        }
        Update: {
          asignatura_id?: string
          created_at?: string | null
          id?: string
          semestre_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_asignaturas_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "asignaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_asignaturas_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_asignaturas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_fct: {
        Row: {
          created_at: string | null
          empresa: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          horas_totales: number | null
          id: string
          nota: number | null
          observaciones: string | null
          tutor_empresa: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          empresa?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          horas_totales?: number | null
          id?: string
          nota?: number | null
          observaciones?: string | null
          tutor_empresa?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          empresa?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          horas_totales?: number | null
          id?: string
          nota?: number | null
          observaciones?: string | null
          tutor_empresa?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_fct_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_grid_layout: {
        Row: {
          id: string
          layout_config: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          layout_config?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          layout_config?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_grid_layout_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notas_examen: {
        Row: {
          aprobada: boolean | null
          convocatoria: number | null
          created_at: string | null
          id: string
          nota_examen: number | null
          nota_final_calculada: number | null
          updated_at: string | null
          user_asignatura_id: string
        }
        Insert: {
          aprobada?: boolean | null
          convocatoria?: number | null
          created_at?: string | null
          id?: string
          nota_examen?: number | null
          nota_final_calculada?: number | null
          updated_at?: string | null
          user_asignatura_id: string
        }
        Update: {
          aprobada?: boolean | null
          convocatoria?: number | null
          created_at?: string | null
          id?: string
          nota_examen?: number | null
          nota_final_calculada?: number | null
          updated_at?: string | null
          user_asignatura_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notas_examen_user_asignatura_id_fkey"
            columns: ["user_asignatura_id"]
            isOneToOne: false
            referencedRelation: "user_asignaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          full_name: string | null
          grado_id: string | null
          id: string
          notification_settings: Json | null
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          full_name?: string | null
          grado_id?: string | null
          id: string
          notification_settings?: Json | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          grado_id?: string | null
          id?: string
          notification_settings?: Json | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_grado_id_fkey"
            columns: ["grado_id"]
            isOneToOne: false
            referencedRelation: "grados"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_nota_grado: { Args: { p_user_id: string }; Returns: Json }
      cleanup_old_notifications: { Args: never; Returns: Json }
      complete_onboarding: {
        Args: {
          p_asignatura_ids: string[]
          p_grado_id: string
          p_semestre_id?: string
        }
        Returns: Json
      }
      crear_semestre_si_no_existe: {
        Args: { p_año_academico: string; p_codigo: string; p_nombre: string }
        Returns: string
      }
      generar_semestres_posibles: { Args: never; Returns: Json }
      generate_pac_reminders: { Args: never; Returns: Json }
      generate_vt_reminders: { Args: never; Returns: Json }
      get_asignaturas_sin_gd: {
        Args: { p_user_id: string }
        Returns: {
          codigo: string
          id: string
          nombre: string
        }[]
      }
      get_notas_completas: {
        Args: { p_semestre_id?: string; p_user_id: string }
        Returns: Json
      }
      get_semestres_usuario: { Args: { p_user_id: string }; Returns: Json }
      insert_gd_data: {
        Args: {
          p_asignatura_id: string
          p_gd_id: string
          p_pacs: Json
          p_ras: Json
          p_semestre_id: string
          p_vts: Json
        }
        Returns: Json
      }
      recalcular_nota_final: {
        Args: { p_user_asignatura_id: string }
        Returns: undefined
      }
      run_all_notification_generators: { Args: never; Returns: Json }
      sync_all_users_pacs_vts: {
        Args: never
        Returns: {
          synced_pacs: number
          synced_vts: number
        }[]
      }
    }
    Enums: {
      evento_tipo: "pac" | "vt" | "examen" | "custom"
      gd_estado:
        | "pendiente"
        | "extrayendo"
        | "extraida"
        | "validada"
        | "rechazada"
      grado_tipo: "DAM" | "DAW"
      notificacion_tipo:
        | "pac_nueva"
        | "pac_vencimiento"
        | "vt_recordatorio"
        | "comunicado"
        | "sistema"
        | "gd_subida"
        | "noticia_nueva"
      pac_tipo: "interactiva" | "desarrollo"
      reaccion_tipo: "like" | "love" | "clap" | "fire" | "thinking"
      recurso_tipo: "pdf" | "enlace" | "podcast"
      user_role: "admin" | "estudiante" | "moderador" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      evento_tipo: ["pac", "vt", "examen", "custom"],
      gd_estado: [
        "pendiente",
        "extrayendo",
        "extraida",
        "validada",
        "rechazada",
      ],
      grado_tipo: ["DAM", "DAW"],
      notificacion_tipo: [
        "pac_nueva",
        "pac_vencimiento",
        "vt_recordatorio",
        "comunicado",
        "sistema",
        "gd_subida",
        "noticia_nueva",
      ],
      pac_tipo: ["interactiva", "desarrollo"],
      reaccion_tipo: ["like", "love", "clap", "fire", "thinking"],
      recurso_tipo: ["pdf", "enlace", "podcast"],
      user_role: ["admin", "estudiante", "moderador", "editor"],
    },
  },
} as const
