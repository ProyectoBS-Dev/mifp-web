import { z } from 'zod'
import type { ExtractedGDData, ExtractedPAC, ExtractedRA, ExtractedVT } from '@/types/gd'

/**
 * Validación y comprobaciones de la respuesta del modelo en la extracción de GDs.
 *
 * El modelo puede devolver cualquier cosa (formato raro, datos inventados, o
 * contenido de un PDF que no es una GD). Aquí se valida con Zod y se comprueba
 * que lo extraído aparece de verdad en el texto del PDF.
 */

/** Convierte "3" en 3 y deja el resto igual: el modelo a veces devuelve números como texto */
const toNumber = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value

const looseInt = z.preprocess(toNumber, z.number().int().positive())
const looseNumber = z.preprocess(toNumber, z.number())
const optionalText = z.string().nullish()

const raSchema = z.object({
  numero: looseInt,
  codigo: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: optionalText,
  fecha_inicio: optionalText,
  fecha_fin: optionalText,
  contenidos: z.array(z.string()).nullish(),
})

const pacSchema = z.object({
  numero_global: looseInt,
  ra_numero: looseInt,
  numero_en_ra: looseInt,
  tipo: z.preprocess(
    value => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.enum(['interactiva', 'desarrollo'])
  ),
  titulo: z.string().min(1),
  peso_en_ra: z.preprocess(toNumber, z.number().min(0).max(100)),
  fecha_limite: optionalText,
  nota_minima: z.preprocess(toNumber, z.number().min(0).max(10)).nullish(),
})

const vtSchema = z.object({
  numero: looseInt,
  titulo: z.string().min(1),
  fecha: optionalText,
  hora_inicio: optionalText,
  duracion_minutos: z.preprocess(toNumber, z.number().int().positive()).nullish(),
})

const moduloSchema = z
  .object({
    codigo: optionalText,
    nombre: optionalText,
    ciclo: optionalText,
  })
  .nullish()

const evaluacionSchema = z
  .object({
    peso_evaluacion_continua: looseNumber.nullish(),
    peso_examen_final: looseNumber.nullish(),
    fecha_revision_pacs: optionalText,
  })
  .nullish()

/** Estructura mínima: los arrays se validan elemento a elemento para no perderlo todo por un PAC malformado */
const responseSchema = z.object({
  modulo: moduloSchema,
  ras: z.array(z.unknown()),
  pacs: z.array(z.unknown()).nullish(),
  vts: z.array(z.unknown()).nullish(),
  evaluacion: evaluacionSchema,
})

export class InvalidExtractionResponseError extends Error {}

function parseItems<S extends z.ZodTypeAny>(
  schema: S,
  items: unknown[],
  label: string,
  warnings: string[]
): z.output<S>[] {
  const valid: z.output<S>[] = []
  let discarded = 0

  for (const item of items) {
    const result = schema.safeParse(item)
    if (result.success) valid.push(result.data)
    else discarded++
  }

  if (discarded > 0) {
    warnings.push(`Se descartaron ${discarded} ${label} con formato inválido.`)
  }
  return valid
}

/**
 * Valida la respuesta del modelo y la devuelve como `ExtractedGDData`.
 *
 * Lanza `InvalidExtractionResponseError` si no tiene la estructura esperada o
 * no queda ningún RA válido. Los problemas menores (PACs/VTs descartados) se
 * devuelven como advertencias.
 */
export function parseExtractionResponse(raw: unknown): { data: ExtractedGDData; warnings: string[] } {
  const top = responseSchema.safeParse(raw)
  if (!top.success) {
    throw new InvalidExtractionResponseError('La respuesta de la IA no tiene la estructura esperada')
  }

  const warnings: string[] = []
  const ras: ExtractedRA[] = parseItems(raSchema, top.data.ras, 'RAs', warnings)

  if (ras.length === 0) {
    throw new InvalidExtractionResponseError('La IA no encontró ningún RA válido')
  }

  const pacs: ExtractedPAC[] = parseItems(pacSchema, top.data.pacs ?? [], 'PACs', warnings)
  const vts: ExtractedVT[] = parseItems(vtSchema, top.data.vts ?? [], 'VTs', warnings)

  if (pacs.length === 0) warnings.push('No se extrajo ninguna PAC: revisa la sección de planificación en el PDF.')
  if (vts.length === 0) warnings.push('No se extrajo ninguna VT: revisa la sección de videotutorías en el PDF.')

  const modulo = top.data.modulo
  const evaluacion = top.data.evaluacion

  return {
    data: {
      modulo: {
        codigo: modulo?.codigo ?? '',
        nombre: modulo?.nombre ?? '',
        ciclo: modulo?.ciclo ?? '',
      },
      ras,
      pacs,
      vts,
      evaluacion: {
        // Valores fijos de FP Online cuando el modelo no los devuelve
        peso_evaluacion_continua: evaluacion?.peso_evaluacion_continua ?? 40,
        peso_examen_final: evaluacion?.peso_examen_final ?? 60,
        fecha_revision_pacs: evaluacion?.fecha_revision_pacs ?? null,
      },
    },
    warnings,
  }
}

/**
 * Cuenta cuántos de los RAs devueltos por el modelo aparecen de verdad en el
 * texto del PDF (como «RA1», «RA 2»…), contando cada número una sola vez.
 *
 * Es el filtro contra PDFs que no son una GD: si el modelo «extrae» RAs que el
 * documento no menciona, los ha inventado.
 */
export function countAnchoredRAs(pdfText: string, ras: Pick<ExtractedRA, 'numero'>[]): number {
  const numbers = new Set(ras.map(ra => ra.numero))
  let anchored = 0

  for (const numero of numbers) {
    if (new RegExp(`\\bRA\\s*0*${numero}\\b`, 'i').test(pdfText)) anchored++
  }
  return anchored
}

/** Minúsculas, sin tildes ni signos y con espacios colapsados, para comparar textos del PDF */
function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Cuenta los RAs cuyo título (sus primeras palabras) aparece literalmente en el
 * PDF. Un valor bajo no invalida la extracción —el modelo puede reformular—,
 * pero merece una advertencia al revisar.
 */
export function countLiteralRATitles(pdfText: string, ras: Pick<ExtractedRA, 'titulo'>[]): number {
  const haystack = normalizeForMatch(pdfText)

  return ras.filter(ra => {
    const words = normalizeForMatch(ra.titulo).split(' ').slice(0, 6).join(' ')
    return words.length > 0 && haystack.includes(words)
  }).length
}
