import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { Json } from '@/types/database'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { logAuditEvent } from '@/lib/audit'
import { extractGDSchema, formatZodErrors } from '@/lib/validation/schemas'
import { countCurriculum } from '@/lib/gd-admin'
import { GD_BUCKET } from '@/lib/gd-upload'
import {
  InvalidExtractionResponseError,
  countAnchoredRAs,
  countLiteralRATitles,
  parseExtractionResponse,
} from '@/lib/gd-extraction'

// Vercel: timeout de 90 segundos (debe coincidir con Settings > Functions)
export const maxDuration = 90

/** Mínimo de RAs distintos que deben aparecer en el texto del PDF para dar la extracción por buena */
const MIN_ANCHORED_RAS = 2

const EXTRACTION_PROMPT = `
Eres un asistente experto en extraer datos estructurados de Guías Didácticas de FP Online.

## ESTRUCTURA DE UNA GD DE FP ONLINE

Las Guías Didácticas de FP Online tienen esta estructura típica:
1. Introducción con tabla de RAs y fechas
2. Contenidos por RA
3. Estructura del Módulo:
   a. Estructura de los Resultados de Aprendizaje (tablas de pesos)
   b. Planificación de las PACs (fechas de entrega)
   c. Planificación de las Video-tutorías
   d. Planificación de la Prueba Escrita Final
4. Sistema de evaluación

## REGLAS DE EXTRACCIÓN

### RAs (Resultados de Aprendizaje):
- Busca la tabla en "Introducción" con columnas: "Resultados de aprendizaje", "Fecha inicio", "Fecha Fin"
- Los RAs se identifican como "RA1:", "RA2:", etc. seguido de un verbo (Evalúa, Instala, Gestiona...)
- Cada módulo tiene entre 4-10 RAs típicamente
- El peso de cada RA NO está en la GD individual (se calcula por horas del currículo)

### PACs (Pruebas de Evaluación Continua):
- Busca la sección "b. Planificación de las PACs"
- Hay DOS tipos de PACs:
  * "PAC de tipo Interactivo" o "actividades de autoevaluación" (cuestionarios online)
  * "PAC de tipo Desarrollo" (ejercicios prácticos entregables)
- Cada PAC pertenece a un RA específico
- Los pesos de las PACs están en tablas como:
  "PAC 1 (50%)" o "PAC 1 (100%)" dentro del bloque de cada RA
- Las fechas de entrega están en la tabla de "Temporalización de la evaluación continua" en la columna que pone la palabra "entrega"

### Sistema de Evaluación de esta escuela de FP Online:
- Evaluación Continua (PACs) = 40% de la nota de cada RA
- Examen Final Global (PEF) = 60% de la nota de cada RA
- Los pesos que extraes de las PACs son DENTRO del 40% de EC, no del total

### VTs (Videotutorías):
- Busca la sección "c. Planificación de las Video-tutorías"
- Extrae: fecha, hora de inicio, duración aproximada
- Las VTs NO son evaluables pero son importantes para el calendario

## FORMATO DE RESPUESTA

Responde SOLO con un objeto JSON válido que siga esta estructura. Los valores entre
< > describen el tipo de dato esperado; NO son valores de ejemplo y no debes copiarlos:

{
  "modulo": { "codigo": <texto o null>, "nombre": <texto o null>, "ciclo": <texto o null> },
  "ras": [
    {
      "numero": <entero>,
      "codigo": <"RA" seguido del número>,
      "titulo": <texto del RA tal como aparece en el documento>,
      "fecha_inicio": <fecha YYYY-MM-DD o null>,
      "fecha_fin": <fecha YYYY-MM-DD o null>,
      "contenidos": [<texto>]
    }
  ],
  "pacs": [
    {
      "numero_global": <entero>,
      "ra_numero": <entero>,
      "numero_en_ra": <entero>,
      "tipo": <"interactiva" o "desarrollo">,
      "titulo": <texto>,
      "peso_en_ra": <número entre 0 y 100>,
      "fecha_limite": <fecha YYYY-MM-DD o null>,
      "nota_minima": <número o null>
    }
  ],
  "vts": [
    {
      "numero": <entero>,
      "titulo": <texto>,
      "fecha": <fecha YYYY-MM-DD o null>,
      "hora_inicio": <hora HH:MM o null>,
      "duracion_minutos": <entero o null>
    }
  ],
  "evaluacion": {
    "peso_evaluacion_continua": <número o null>,
    "peso_examen_final": <número o null>,
    "fecha_revision_pacs": <fecha YYYY-MM-DD o null>
  }
}

## NOTAS IMPORTANTES:
- Extrae SOLO lo que aparece en el texto. No inventes RAs, PACs ni fechas.
- Si el texto NO es una Guía Didáctica o no encuentras RAs, devuelve "ras": [], "pacs": [] y "vts": []
- "numero_global" es el número secuencial de la PAC en todo el módulo (1, 2, 3, 4...)
- "numero_en_ra" es el número de la PAC dentro de su RA (1, 2, generalmente)
- "peso_en_ra" es el porcentaje DENTRO del RA (ej: si hay 2 PACs, cada una es 50%)
- Si no encuentras un dato, usa null
- Las fechas deben estar en formato ISO: YYYY-MM-DD

Texto de la Guía Didáctica:
---
`

/**
 * Error con el estado HTTP y el mensaje que se enseña al admin. El mensaje es
 * genérico a propósito: se guarda en `error_extraccion` y se muestra en la UI.
 */
class ExtractionError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Devuelve la GD a `pendiente` guardando el motivo, para que no se quede en
 * `extrayendo`. Es la única vía de salida de un fallo: el `WHERE estado =
 * 'extrayendo'` evita pisar una GD que otra acción (desbloqueo, eliminación)
 * ya haya movido mientras tanto.
 */
async function revertToPending(adminClient: AdminClient, gdId: string, message: string) {
  const { error } = await adminClient
    .from('guias_didacticas')
    .update({
      estado: 'pendiente',
      error_extraccion: message,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gdId)
    .eq('estado', 'extrayendo')

  if (error) console.error('[Extract GD] Error revirtiendo a pendiente:', error)
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      error.message.includes('timed out') ||
      error.message.includes('timeout'))
  )
}

export async function POST(request: NextRequest) {
  // Rate limit para OpenAI (3 req/min para prevenir costos)
  const rateLimitError = await withRateLimit(request, rateLimiters?.openai || null)
  if (rateLimitError) return rateLimitError

  // ✅ CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  // Verificar autenticación y rol admin
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const parseResult = extractGDSchema.safeParse(await request.json().catch(() => null))
  if (!parseResult.success) {
    return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
  }

  const { gdId } = parseResult.data

  // Solo se revierte a pendiente si esta ejecución llegó a reclamar la GD
  let claimed = false
  let adminClient: AdminClient | undefined

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new ExtractionError(500, 'OPENAI_API_KEY no configurada. Añádela a .env.local')
    }

    adminClient = createAdminClient()

    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select('id, archivo_path, estado, asignatura_id, semestre_id')
      .eq('id', gdId)
      .is('deleted_at', null)
      .single()

    if (gdError || !gd) {
      throw new ExtractionError(404, 'GD no encontrada')
    }

    if (!gd.archivo_path) {
      throw new ExtractionError(400, 'GD sin archivo')
    }

    // Solo se extrae desde pendiente: reextraer una GD ya extraída, validada o
    // rechazada pisaría datos revisados. Para empezar de nuevo hay que
    // devolverla antes a pendiente desde la ficha.
    if (gd.estado !== 'pendiente') {
      throw new ExtractionError(
        409,
        gd.estado === 'extrayendo'
          ? 'Ya hay una extracción en curso para esta GD'
          : `Solo se puede extraer una GD pendiente (estado actual: ${gd.estado})`
      )
    }

    // Extraer cuando ya hay currículo cargado gastaría tokens para nada: la
    // validación posterior se rechazaría
    const counts = await countCurriculum(adminClient, gd.asignatura_id, gd.semestre_id)
    if (counts.total > 0) {
      throw new ExtractionError(
        409,
        'Esta asignatura ya tiene RAs, PACs o VTs cargados. Usa «Deshacer» antes de extraer de nuevo.'
      )
    }

    // Reclamo atómico: si dos admins pulsan a la vez, solo uno actualiza la fila
    const { data: claimedRows, error: claimError } = await adminClient
      .from('guias_didacticas')
      .update({
        estado: 'extrayendo',
        error_extraccion: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gdId)
      .eq('estado', 'pendiente')
      .is('deleted_at', null)
      .select('id')

    if (claimError) {
      console.error('[Extract GD] Error reclamando la GD:', claimError)
      throw new ExtractionError(500, 'No se pudo iniciar la extracción')
    }
    if (!claimedRows || claimedRows.length === 0) {
      throw new ExtractionError(409, 'La GD cambió de estado antes de empezar. Recarga la página.')
    }
    claimed = true

    // Descargar PDF de Storage
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from(GD_BUCKET)
      .download(gd.archivo_path)

    if (downloadError || !fileData) {
      console.error('[Extract GD] Error descargando el PDF:', downloadError)
      throw new ExtractionError(500, 'No se pudo descargar el PDF')
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await fileData.arrayBuffer())
    let pdfText: string

    try {
      // Usar unpdf que está diseñado para funcionar en serverless (Vercel, etc.)
      const { extractText } = await import('unpdf')
      // unpdf requiere Uint8Array, no Buffer
      const { text } = await extractText(new Uint8Array(buffer))
      // unpdf devuelve un array de strings (una por página), las unimos
      pdfText = Array.isArray(text) ? text.join('\n') : text
    } catch (pdfError) {
      console.error('[Extract GD] Error leyendo el PDF con unpdf:', pdfError)
      throw new ExtractionError(500, 'No se pudo leer el PDF')
    }

    if (!pdfText || pdfText.trim().length < 100) {
      throw new ExtractionError(400, 'El PDF no contiene texto suficiente para extraer')
    }

    // Llamar a OpenAI con AbortController para que el timeout ocurra
    // ANTES de que Vercel mate la función (80s < 90s maxDuration)
    const controller = new AbortController()
    const abortTimeout = setTimeout(() => controller.abort(), 80_000)

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 75_000, // 75s - debe ser menor que maxDuration de Vercel
    })

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente que extrae datos estructurados de Guías Didácticas de FP Online. Responde SOLO con JSON válido.'
          },
          {
            role: 'user',
            content: EXTRACTION_PROMPT + pdfText.slice(0, 15000) + '\n---'
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 4000,
      }, { signal: controller.signal })
    } finally {
      clearTimeout(abortTimeout)
    }

    const choice = completion.choices[0]
    if (!choice?.message?.content) {
      throw new ExtractionError(502, 'La IA no devolvió respuesta')
    }
    if (choice.finish_reason === 'length') {
      throw new ExtractionError(502, 'La respuesta de la IA se cortó antes de terminar. Inténtalo de nuevo.')
    }

    let rawResponse: unknown
    try {
      rawResponse = JSON.parse(choice.message.content)
    } catch (parseError) {
      console.error('[Extract GD] Respuesta de OpenAI no es JSON:', parseError)
      throw new ExtractionError(502, 'La respuesta de la IA no era JSON válido')
    }

    // Validar la forma de la respuesta (en vez de un `as ExtractedGDData` a ciegas)
    let parsed
    try {
      parsed = parseExtractionResponse(rawResponse)
    } catch (validationError) {
      if (validationError instanceof InvalidExtractionResponseError) {
        console.error('[Extract GD] Respuesta inválida:', validationError.message)
        throw new ExtractionError(
          422,
          'No se pudieron extraer RAs del PDF. Comprueba que es una Guía Didáctica.'
        )
      }
      throw validationError
    }

    const { data: extractedData, warnings } = parsed

    // Anclaje: los RAs que devuelve el modelo tienen que aparecer en el PDF. Si
    // no, no es una GD (o el modelo los inventó) y no se guarda nada
    const required = Math.min(MIN_ANCHORED_RAS, extractedData.ras.length)
    const anchored = countAnchoredRAs(pdfText, extractedData.ras)
    if (anchored < required) {
      console.error('[Extract GD] RAs sin anclar en el PDF:', { gdId, anchored, required })
      throw new ExtractionError(
        422,
        'El PDF no parece una Guía Didáctica: los RAs extraídos no aparecen en el documento.'
      )
    }

    // Títulos que no aparecen literalmente: es un aviso, no un rechazo
    const literalTitles = countLiteralRATitles(pdfText, extractedData.ras)
    if (literalTitles < extractedData.ras.length / 2) {
      warnings.push(
        'Los títulos de varios RAs no aparecen literalmente en el PDF. Contrástalos con el documento antes de validar.'
      )
    }

    if (pdfText.length > 15000) {
      warnings.push(
        'El PDF es largo y solo se analizaron los primeros 15.000 caracteres: puede faltar información del final.'
      )
    }

    const datosExtraidos = warnings.length > 0
      ? { ...extractedData, advertencias: warnings }
      : extractedData

    // El UPDATE final repite el guard de estado: si el admin desbloqueó o eliminó
    // la GD mientras se extraía, no se guarda nada
    const { data: savedRows, error: updateError } = await adminClient
      .from('guias_didacticas')
      .update({
        datos_extraidos: datosExtraidos as unknown as Json,
        estado: 'extraida', // Datos extraídos, listo para revisar
        error_extraccion: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gdId)
      .eq('estado', 'extrayendo')
      .is('deleted_at', null)
      .select('id')

    if (updateError) {
      console.error('[Extract GD] Error guardando los datos:', updateError)
      throw new ExtractionError(500, 'No se pudieron guardar los datos extraídos')
    }
    if (!savedRows || savedRows.length === 0) {
      // Otra acción movió la GD: ya no es nuestra y no hay nada que revertir
      claimed = false
      throw new ExtractionError(409, 'La GD cambió de estado mientras se extraía. Recarga la página.')
    }

    await logAuditEvent({
      action: 'gd.extract',
      userId: auth.user.id,
      resourceType: 'guia_didactica',
      resourceId: gdId,
      metadata: {
        ras: extractedData.ras.length,
        pacs: extractedData.pacs.length,
        vts: extractedData.vts.length,
        advertencias: warnings.length,
      },
    }, request)

    return NextResponse.json({
      success: true,
      data: datosExtraidos,
      warnings,
    })
  } catch (error) {
    console.error('[Extract GD] Error:', error)

    const timeout = isTimeoutError(error)
    const status = error instanceof ExtractionError ? error.status : timeout ? 504 : 500
    const message =
      error instanceof ExtractionError
        ? error.message
        : timeout
          ? 'La extracción tardó demasiado. Inténtalo de nuevo.'
          : 'Error al procesar la guía didáctica'

    // Ningún fallo puede dejar la GD en `extrayendo`
    if (claimed && adminClient) {
      await revertToPending(adminClient, gdId, message)
    }

    return NextResponse.json({ error: message }, { status })
  }
}
