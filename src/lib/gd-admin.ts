import type { createAdminClient } from '@/lib/supabase/admin'

// Este módulo se importa también desde componentes cliente (constantes y
// helpers puros), así que no puede tener imports de runtime del servidor: el
// admin client entra como parámetro y solo se importa su tipo.
type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Tiempo tras el cual una GD en `extrayendo` se considera atascada.
 * Coincide con el `maxDuration` (90 s) de `/api/admin/guias-didacticas/extract`:
 * pasado ese tiempo la función de Vercel ya no puede seguir ejecutándose.
 */
export const GD_EXTRACTING_STALE_MS = 90_000

/** Estados desde los que se puede rechazar una GD */
export const GD_REJECTABLE_STATES = ['pendiente', 'extrayendo', 'extraida'] as const

export interface CurriculumCounts {
  ras: number
  pacs: number
  vts: number
  total: number
}

/**
 * Cuenta las filas curriculares de una asignatura y semestre.
 *
 * Es el único criterio de "GD vacía": una GD está vacía si no hay filas en
 * `asignatura_ras`, `asignatura_pacs` ni `asignatura_vts`. No se usa
 * `datos_extraidos`, porque una validada puede tener JSON y cero filas.
 *
 * Lanza si alguna consulta falla: tratar un error como "0 filas" permitiría
 * resetear una GD que sí tiene currículo.
 */
export async function countCurriculum(
  adminClient: AdminClient,
  asignaturaId: string,
  semestreId: string
): Promise<CurriculumCounts> {
  const count = (table: 'asignatura_ras' | 'asignatura_pacs' | 'asignatura_vts') =>
    adminClient
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('asignatura_id', asignaturaId)
      .eq('semestre_id', semestreId)

  const [ras, pacs, vts] = await Promise.all([
    count('asignatura_ras'),
    count('asignatura_pacs'),
    count('asignatura_vts'),
  ])

  const failed = ras.error ?? pacs.error ?? vts.error
  if (failed) throw new Error(`No se pudo contar el currículo: ${failed.message}`)

  const counts = { ras: ras.count ?? 0, pacs: pacs.count ?? 0, vts: vts.count ?? 0 }
  return { ...counts, total: counts.ras + counts.pacs + counts.vts }
}

/**
 * Indica si una GD en `extrayendo` lleva más tiempo del que puede durar una
 * extracción real (y por tanto se puede desbloquear).
 */
export function isExtractionStale(updatedAt: string | null, now: number = Date.now()): boolean {
  if (!updatedAt) return true
  return now - new Date(updatedAt).getTime() > GD_EXTRACTING_STALE_MS
}
