import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN CON ZOD.STRICT()
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para validar UUIDs
 * Uso: validar IDs en query params y path params
 */
export const uuidSchema = z.string().uuid('ID inválido')

/**
 * Schema para validar slugs (URL-safe)
 */
export const slugSchema = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[a-z0-9-]+$/, 'Slug debe contener solo minúsculas, números y guiones')

// ═══════════════════════════════════════════════════════════════════════════════
// NOTICIAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para crear noticia
 * Valida que solo se envíen los campos permitidos
 */
export const createNoticiaSchema = z.object({
  titulo: z.string().min(5, 'Título muy corto').max(200, 'Título muy largo').trim(),
  slug: slugSchema,
  contenido: z.string().min(20, 'Contenido muy corto').trim(),
  // imagen_url: null, undefined, o URL válida
  imagen_url: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url('URL de imagen inválida').nullable().optional()
  ),
  publicada: z.boolean().default(true),
})

/**
 * Schema para actualizar noticia
 * Todos los campos son opcionales
 */
export const updateNoticiaSchema = z.object({
  titulo: z.string().min(5).max(200).trim().optional(),
  slug: slugSchema.optional(),
  contenido: z.string().min(20).trim().optional(),
  // imagen_url: null, undefined, o URL válida
  imagen_url: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url('URL de imagen inválida').nullable().optional()
  ),
  publicada: z.boolean().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEOTUTORÍAS (VTs)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para crear VT
 */
export const createVTSchema = z.object({
  asignaturaId: uuidSchema,
  semestreId: uuidSchema,
  numero: z.number().int().positive('Número debe ser positivo'),
  titulo: z.string().min(3).max(200).trim(),
  fecha_programada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .nullable(),
  hora_inicio: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM:SS)')
    .optional()
    .nullable(),
  duracion_minutos: z
    .number()
    .int()
    .min(30, 'Duración mínima 30 minutos')
    .max(240, 'Duración máxima 240 minutos')
    .default(90),
  enlace_grabacion: z.string().url('URL inválida').optional().nullable(),
})

/**
 * Schema para actualizar VT
 */
export const updateVTSchema = z.object({
  vtId: uuidSchema,
  titulo: z.string().min(3).max(200).trim().optional(),
  fecha_programada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  duracion_minutos: z.number().int().min(30).max(240).optional(),
  enlace_grabacion: z.string().url().optional().nullable(),
})

/**
 * Schema para eliminar VT
 */
export const deleteVTSchema = z.object({
  vtId: uuidSchema,
})

// ═══════════════════════════════════════════════════════════════════════════════
// RECURSOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para crear recurso (enlace)
 */
export const createRecursoSchema = z.object({
  tipo: z.enum(['enlace', 'pdf', 'podcast'], {
    errorMap: () => ({ message: 'Tipo debe ser: enlace, pdf o podcast' }),
  }),
  titulo: z.string().min(3).max(200).trim(),
  descripcion: z.string().max(1000).trim().optional().nullable(),
  url: z.string().url('URL inválida').optional().nullable(),
  asignatura_ids: z.array(uuidSchema).max(20, 'Máximo 20 asignaturas').optional(),
})

/**
 * Schema para actualizar recurso
 */
export const updateRecursoSchema = z.object({
  titulo: z.string().min(3).max(200).trim().optional(),
  descripcion: z.string().max(1000).trim().optional().nullable(),
  url: z.string().url().optional().nullable(),
  asignatura_ids: z.array(uuidSchema).max(20).optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// GRID LAYOUT (Dashboard personalizable)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para actualizar grid layout
 * Limita el número de widgets y valida coordenadas
 */
export const gridLayoutSchema = z.object({
  layout_config: z
    .array(
      z.object({
        i: z.string().max(50, 'ID de widget muy largo'),
        x: z.number().int().min(0).max(11, 'Coordenada X fuera de rango'),
        y: z.number().int().min(0).max(100, 'Coordenada Y fuera de rango'),
        w: z.number().int().min(1).max(12, 'Ancho fuera de rango'),
        h: z.number().int().min(1).max(12, 'Alto fuera de rango'),
      })
    )
    .min(1, 'Debe haber al menos 1 widget')
    .max(50, 'Máximo 50 widgets permitidos'),
})

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para broadcast notification
 * Envío masivo de notificaciones a todos los usuarios
 */
export const broadcastNotificationSchema = z.object({
  tipo: z
    .enum(['sistema', 'comunicado'], {
      errorMap: () => ({ message: 'Tipo debe ser: sistema o comunicado' }),
    })
    .default('sistema'),
  titulo: z.string().min(5, 'Título muy corto').max(100, 'Título muy largo').trim(),
  mensaje: z.string().max(500, 'Mensaje muy largo').trim().optional().nullable(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// GUÍAS DIDÁCTICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para validar datos extraídos de GD
 */
export const validateGDDataSchema = z.object({
  gdId: uuidSchema,
  datos: z.object({
    modulo: z
      .object({
        codigo: z.string().optional(),
        nombre: z.string().optional(),
        ciclo: z.string().optional(),
      })
      .optional(),
    ras: z.array(
      z.object({
        numero: z.number().int().positive(),
        codigo: z.string(),
        titulo: z.string(),
        descripcion: z.string().optional().nullable(),
        fecha_inicio: z.string().optional().nullable(),
        fecha_fin: z.string().optional().nullable(),
      })
    ),
    pacs: z.array(
      z.object({
        numero_global: z.number().int().positive(),
        ra_numero: z.number().int().positive(),
        numero_en_ra: z.number().int().positive(),
        tipo: z.enum(['interactiva', 'desarrollo']),
        titulo: z.string(),
        peso_en_ra: z.number().min(0).max(100),
        fecha_limite: z.string().optional().nullable(),
        nota_minima: z.number().min(0).max(10).optional().nullable(),
      })
    ),
    vts: z.array(
      z.object({
        numero: z.number().int().positive(),
        titulo: z.string(),
        fecha: z.string().optional().nullable(),
        hora_inicio: z.string().optional().nullable(),
        duracion_minutos: z.number().int().positive(),
      })
    ),
    evaluacion: z
      .object({
        peso_evaluacion_continua: z.number().optional(),
        peso_examen_final: z.number().optional(),
        fecha_revision_pacs: z.string().optional().nullable(),
      })
      .optional(),
  }),
})

/**
 * Schema para extract GD (OpenAI)
 */
export const extractGDSchema = z.object({
  gdId: uuidSchema,
})

// ═══════════════════════════════════════════════════════════════════════════════
// FAVORITOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema para agregar favorito
 */
export const addFavoritoSchema = z.object({
  recurso_id: uuidSchema,
})

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Valida y parsea un schema de forma segura
 * Retorna { success: true, data } o { success: false, error }
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data)
}

/**
 * Formatea errores de Zod para respuesta API
 */
export function formatZodErrors(error: z.ZodError) {
  return {
    error: 'Datos inválidos',
    details: error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  }
}
