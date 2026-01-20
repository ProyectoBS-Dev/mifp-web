// ============================================
// 📚 Tipos para Recursos (Cloudflare R2 + Supabase)
// ============================================

export type RecursoTipo = 'pdf' | 'enlace' | 'podcast'

/**
 * Recurso almacenado en Supabase (metadatos)
 * Los archivos PDF y podcast están en Cloudflare R2
 */
export interface Recurso {
  id: string
  tipo: RecursoTipo
  titulo: string
  descripcion: string | null
  url: string | null           // Para enlaces externos
  archivo_path: string | null  // Path en Cloudflare R2 (pdf/podcast)
  duracion: number | null      // Para podcasts (segundos)
  asignaturas?: {
    id: string
    nombre: string
    codigo: string
  }[]
  created_by: string | null
  created_at: string
}

/**
 * Metadatos JSON que acompaña a cada archivo en Cloudflare R2
 * Ejemplo: clean-code-ep1.mp3 → clean-code-ep1.json
 * Soporta tanto asignatura_id (string) como asignatura_ids (array) para backwards compatibility
 */
export interface RecursoMetadataJSON {
  titulo: string
  descripcion?: string
  asignatura_id?: string        // Backwards compatible: single ID
  asignatura_ids?: string[]     // New: multiple IDs
  duracion?: number             // Solo para podcasts (segundos)
}

/**
 * Archivo encontrado en Cloudflare R2
 */
export interface R2File {
  key: string
  size: number
  lastModified: Date
  metadata?: RecursoMetadataJSON
}

/**
 * Resultado de la sincronización
 */
export interface SyncResult {
  inserted: number
  softDeleted: number
  errors: string[]
  details: {
    insertedFiles: string[]
    deletedPaths: string[]
  }
}

/**
 * Configuración de buckets en Cloudflare R2
 */
export const R2_BUCKETS = {
  podcasts: 'mifp-podcasts',
  pdfs: 'mifp-pdfs',
} as const

export type R2BucketName = keyof typeof R2_BUCKETS

/**
 * Mapeo de tipo de recurso a bucket
 */
export const TIPO_TO_BUCKET: Record<'pdf' | 'podcast', R2BucketName> = {
  pdf: 'pdfs',
  podcast: 'podcasts',
}

/**
 * Extensiones de archivo por tipo
 */
export const FILE_EXTENSIONS: Record<'pdf' | 'podcast', string> = {
  pdf: '.pdf',
  podcast: '.mp3',
}

/**
 * Iconos por tipo de recurso (para UI)
 */
export const RECURSO_ICONS: Record<RecursoTipo, string> = {
  pdf: '📄',
  enlace: '🔗',
  podcast: '🎧',
}

/**
 * Parsea duración de MM:SS a segundos
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  return parseInt(duration) || 0
}

