import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ExtractedGDData } from '@/types/gd'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { extractGDSchema, formatZodErrors } from '@/lib/validation/schemas'
import { z } from 'zod'

// Vercel: timeout de 90 segundos (debe coincidir con Settings > Functions)
export const maxDuration = 90

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
- Las fechas de entrega están en la tabla de "Temporalización de la evaluación continua"

### Sistema de Evaluación de esta escuela de FP Online:
- Evaluación Continua (PACs) = 40% de la nota de cada RA
- Examen Final Global (PEF) = 60% de la nota de cada RA
- Los pesos que extraes de las PACs son DENTRO del 40% de EC, no del total

### VTs (Videotutorías):
- Busca la sección "c. Planificación de las Video-tutorías"
- Extrae: fecha, hora de inicio, duración aproximada
- Las VTs NO son evaluables pero son importantes para el calendario

## FORMATO DE RESPUESTA

Responde SOLO en JSON válido con este formato exacto:

{
  "modulo": {
    "codigo": "M01",
    "nombre": "Sistemas informáticos",
    "ciclo": "DAM/DAW"
  },
  "ras": [
    {
      "numero": 1,
      "codigo": "RA1",
      "titulo": "Evalúa sistemas informáticos identificando sus componentes y características",
      "fecha_inicio": "2025-09-30",
      "fecha_fin": "2025-10-07",
      "contenidos": ["Estructura y componentes de un sistema informático", "Tipos y topologías de redes"]
    }
  ],
  "pacs": [
    {
      "numero_global": 1,
      "ra_numero": 1,
      "numero_en_ra": 1,
      "tipo": "interactiva",
      "titulo": "PAC 1 - RA1",
      "peso_en_ra": 50,
      "fecha_limite": "2025-10-19",
      "nota_minima": 5
    }
  ],
  "vts": [
    {
      "numero": 1,
      "titulo": "Videotutoría 1",
      "fecha": "2025-10-08",
      "hora_inicio": "19:00",
      "duracion_minutos": 90
    }
  ],
  "evaluacion": {
    "peso_evaluacion_continua": 40,
    "peso_examen_final": 60,
    "fecha_revision_pacs": "2025-12-19"
  }
}

## NOTAS IMPORTANTES:
- "numero_global" es el número secuencial de la PAC en todo el módulo (1, 2, 3, 4...)
- "numero_en_ra" es el número de la PAC dentro de su RA (1, 2, generalmente)
- "tipo" debe ser "interactiva" o "desarrollo"
- "peso_en_ra" es el porcentaje DENTRO del RA (ej: si hay 2 PACs, cada una es 50%)
- Si no encuentras un dato, usa null
- Las fechas deben estar en formato ISO: YYYY-MM-DD

Texto de la Guía Didáctica:
---
`

export async function POST(request: NextRequest) {
  // Rate limit para OpenAI (3 req/min para prevenir costos)
  const rateLimitError = await withRateLimit(request, rateLimiters?.openai || null)
  if (rateLimitError) return rateLimitError


  // Verificar autenticación y rol admin
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Variables necesarias para error recovery
  let gdId: string | undefined
  let adminClient: ReturnType<typeof createAdminClient> | undefined

  try {
    const body = await request.json()

    // Validación estricta con Zod
    const parseResult = extractGDSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    gdId = parseResult.data.gdId

    // Verificar que OPENAI_API_KEY existe
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OPENAI_API_KEY no configurada. Añádela a .env.local' 
      }, { status: 500 })
    }

    adminClient = createAdminClient()

    // Obtener la GD
    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select('id, archivo_path, estado, asignatura_id')
      .eq('id', gdId)
      .single()

    if (gdError || !gd) {
      return NextResponse.json({ error: 'GD no encontrada' }, { status: 404 })
    }

    if (!gd.archivo_path) {
      return NextResponse.json({ error: 'GD sin archivo' }, { status: 400 })
    }

    // Actualizar estado a extrayendo
    await adminClient
      .from('guias_didacticas')
      .update({ estado: 'extrayendo' })
      .eq('id', gdId)

    // Descargar PDF de Storage
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('guias-didacticas')
      .download(gd.archivo_path)

    if (downloadError || !fileData) {
      console.error('Error downloading PDF:', downloadError)
      return NextResponse.json({ error: 'Error al descargar PDF' }, { status: 500 })
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await fileData.arrayBuffer())
    let pdfText: string
    
    try {
      // Usar unpdf que está diseñado para funcionar en serverless (Vercel, etc.)
      const { extractText } = await import('unpdf')
      // unpdf requiere Uint8Array, no Buffer
      const uint8Array = new Uint8Array(buffer)
      const { text } = await extractText(uint8Array)
      // unpdf devuelve un array de strings (una por página), las unimos
      pdfText = Array.isArray(text) ? text.join('\n') : text
    } catch (pdfError) {
      console.error('Error parsing PDF with unpdf:', pdfError)
      return NextResponse.json({ error: 'Error al leer el PDF' }, { status: 500 })
    }

    if (!pdfText || pdfText.trim().length < 100) {
      return NextResponse.json({ 
        error: 'El PDF no contiene texto suficiente para extraer' 
      }, { status: 400 })
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

    const responseContent = completion.choices[0]?.message?.content
    
    if (!responseContent) {
      return NextResponse.json({ error: 'OpenAI no devolvió respuesta' }, { status: 500 })
    }

    // Parsear respuesta
    let extractedData: ExtractedGDData
    try {
      extractedData = JSON.parse(responseContent) as ExtractedGDData
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json({ 
        error: 'Error al parsear respuesta de OpenAI' 
      }, { status: 500 })
    }

    // Guardar datos extraídos en la GD
    const { error: updateError } = await adminClient
      .from('guias_didacticas')
      .update({ 
        datos_extraidos: extractedData as unknown as never,
        estado: 'extraida', // Datos extraídos, listo para revisar
        updated_at: new Date().toISOString()
      })
      .eq('id', gdId)

    if (updateError) {
      console.error('Error updating GD:', updateError)
      return NextResponse.json({ error: 'Error al guardar datos' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: extractedData 
    })

  } catch (error) {
    console.error('[Extract GD] Error:', error)
    
    // CRÍTICO: Revertir estado a pendiente para permitir retry
    // Esto funciona porque el AbortController asegura que el error
    // se lanza ANTES de que Vercel mate la función
    if (adminClient && gdId) {
      try {
        await adminClient
          .from('guias_didacticas')
          .update({ 
            estado: 'pendiente',
            updated_at: new Date().toISOString()
          })
          .eq('id', gdId)
        console.log('[Extract GD] Estado revertido a pendiente para gdId:', gdId)
      } catch (revertError) {
        console.error('[Extract GD] Error reverting state:', revertError)
      }
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodErrors(error), { status: 400 })
    }

    // Detectar timeout/abort para dar un mensaje más claro
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message?.includes('timed out') ||
      error.message?.includes('timeout')
    )
    
    return NextResponse.json(
      { error: isTimeout 
        ? 'La extracción tardó demasiado. Inténtalo de nuevo.' 
        : 'Error al procesar la guía didáctica' 
      }, 
      { status: isTimeout ? 504 : 500 }
    )
  }
}
