/**
 * Types para el sistema de Guías Didácticas
 * Basado en la estructura de ILERNA Online
 */

// ============================================
// Datos Extraídos por OpenAI
// ============================================

export interface ExtractedGDData {
  /** Información del módulo */
  modulo: ExtractedModulo
  /** Resultados de Aprendizaje */
  ras: ExtractedRA[]
  /** PACs (Pruebas de Evaluación Continua) */
  pacs: ExtractedPAC[]
  /** Videotutorías */
  vts: ExtractedVT[]
  /** Datos de evaluación */
  evaluacion: ExtractedEvaluacion
}

export interface ExtractedModulo {
  /** Código del módulo: "M01", "M04A", etc. */
  codigo: string
  /** Nombre completo del módulo */
  nombre: string
  /** Ciclo formativo: "DAM", "DAW", "DAM/DAW" */
  ciclo: string
}

export interface ExtractedRA {
  /** Número del RA: 1, 2, 3... */
  numero: number
  /** Código: "RA1", "RA2" */
  codigo: string
  /** Título/descripción del RA */
  titulo: string
  /** Descripción completa (opcional) */
  descripcion?: string | null
  /** Fecha de inicio (ISO: YYYY-MM-DD) */
  fecha_inicio?: string | null
  /** Fecha fin (ISO: YYYY-MM-DD) */
  fecha_fin?: string | null
  /** Lista de contenidos del RA */
  contenidos?: string[] | null
}

export interface ExtractedPAC {
  /** Número secuencial en el módulo: 1, 2, 3, 4... */
  numero_global: number
  /** Referencia al RA (número): 1, 2, 3... */
  ra_numero: number
  /** Número dentro del RA: 1, 2 */
  numero_en_ra: number
  /** Tipo de PAC */
  tipo: 'interactiva' | 'desarrollo'
  /** Título de la PAC */
  titulo: string
  /** Peso DENTRO del 40% de EC (ej: 50) */
  peso_en_ra: number
  /** Fecha límite (ISO: YYYY-MM-DD) */
  fecha_limite?: string | null
  /** Nota mínima para aprobar (default: 5) */
  nota_minima?: number | null
}

export interface ExtractedVT {
  /** Número de la VT: 1, 2, 3... */
  numero: number
  /** Título de la videotutoría */
  titulo: string
  /** Fecha (ISO: YYYY-MM-DD) */
  fecha?: string | null
  /** Hora de inicio: "19:00" */
  hora_inicio?: string | null
  /** Duración en minutos */
  duracion_minutos?: number | null
}

export interface ExtractedEvaluacion {
  /** Peso de evaluación continua (siempre 40 en ILERNA) */
  peso_evaluacion_continua: number
  /** Peso del examen final (siempre 60 en ILERNA) */
  peso_examen_final: number
  /** Fecha límite para revisión de PACs */
  fecha_revision_pacs?: string | null
}

// ============================================
// Estados del proceso de extracción
// ============================================

export type ExtraccionEstado = 
  | 'sin_extraer'    // Estado inicial
  | 'extrayendo'     // OpenAI procesando
  | 'extraido'       // Datos listos para revisar
  | 'error'          // Error en extracción

export type GDEstado = 
  | 'pendiente'      // Subida, esperando extracción
  | 'extrayendo'     // OpenAI procesando
  | 'extraida'       // Datos extraídos, listos para validar
  | 'validada'       // Datos insertados en BD
  | 'rechazada'      // Rechazada por admin

// ============================================
// Guía Didáctica completa (desde BD)
// ============================================

export interface GuiaDidactica {
  id: string
  asignatura_id: string
  semestre_id: string
  subido_por: string
  archivo_path: string
  estado: GDEstado
  procesada: boolean
  datos_extraidos?: ExtractedGDData | null
  motivo_rechazo?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface GuiaDidacticaConRelaciones extends GuiaDidactica {
  asignatura: {
    id: string
    nombre: string
    codigo: string
  } | null
  semestre: {
    id: string
    nombre: string
  } | null
  uploader: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

// ============================================
// Request/Response types para APIs
// ============================================

export interface ExtractGDRequest {
  gdId: string
}

export interface ExtractGDResponse {
  success: boolean
  data?: ExtractedGDData
  error?: string
}

export interface ValidateGDRequest {
  gdId: string
  datos: ExtractedGDData
}

export interface ValidateGDResponse {
  success: boolean
  insertedRAs?: number
  insertedPACs?: number
  insertedVTs?: number
  error?: string
}
