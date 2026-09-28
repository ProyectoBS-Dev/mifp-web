import type { createAdminClient } from '@/lib/supabase/admin'

// Las constantes de este módulo se importan también desde componentes cliente,
// así que no puede tener imports de runtime del servidor: el admin client entra
// como parámetro y solo se importa su tipo.
type AdminClient = ReturnType<typeof createAdminClient>

/** Bucket privado donde viven los PDFs de las Guías Didácticas */
export const GD_BUCKET = 'guias-didacticas'

/** Tamaño máximo de una GD en bytes (15MB) */
export const GD_MAX_FILE_SIZE = 15 * 1024 * 1024

/** Texto de límite para mensajes de UI y validación */
export const GD_MAX_FILE_SIZE_LABEL = '15MB'

/** Mensajes de error descriptivos por estado de GD */
const ESTADO_MESSAGES: Record<string, string> = {
  pendiente: 'Ya existe una GD pendiente de revisión para esta asignatura',
  extrayendo: 'Ya existe una GD en proceso de extracción para esta asignatura',
  extraida: 'Ya existe una GD con datos extraídos pendientes de validación para esta asignatura',
  validada: 'Ya existe una GD validada para esta asignatura en este semestre',
}

/**
 * Construye la ruta del PDF dentro del bucket.
 *
 * El prefijo `asignatura_semestre_usuario` permite localizar los archivos de un
 * intento concreto y es lo que valida el endpoint de confirmación para que un
 * usuario solo pueda registrar la GD que él mismo ha subido.
 */
export function buildGDPath(params: {
  asignaturaId: string
  semestreId: string
  userId: string
  fileName: string
}): string {
  const sanitizedName = params.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${gdPathPrefix(params)}${Date.now()}_${sanitizedName}`
}

/** Prefijo común de todas las rutas de un usuario para una asignatura y semestre */
export function gdPathPrefix(params: {
  asignaturaId: string
  semestreId: string
  userId: string
}): string {
  return `${params.asignaturaId}_${params.semestreId}_${params.userId}_`
}

/**
 * Devuelve el semestre activo, o `null` si no hay ninguno.
 */
export async function getSemestreActivo(adminClient: AdminClient): Promise<{ id: string } | null> {
  const { data } = await adminClient
    .from('semestres')
    .select('id')
    .eq('activo', true)
    .single()

  return data ?? null
}

/**
 * Comprueba si ya hay una GD que bloquee una nueva subida y, si no la hay,
 * libera las que se pueden reemplazar.
 *
 * Una GD rechazada se marca como borrada para permitir volver a intentarlo, y
 * las que ya estaban borradas se eliminan para no chocar con el índice único
 * parcial de `guias_didacticas`.
 *
 * @returns El mensaje de error si la subida debe bloquearse, o `null` si puede continuar
 */
export async function reserveGDSlot(
  adminClient: AdminClient,
  asignaturaId: string,
  semestreId: string
): Promise<string | null> {
  const { data: existingGDs } = await adminClient
    .from('guias_didacticas')
    .select('id, estado, deleted_at')
    .eq('asignatura_id', asignaturaId)
    .eq('semestre_id', semestreId)

  if (!existingGDs || existingGDs.length === 0) return null

  const activeGDs = existingGDs.filter(g => !g.deleted_at && g.estado !== 'rechazada')
  const rejectedGDs = existingGDs.filter(g => !g.deleted_at && g.estado === 'rechazada')
  const softDeletedGDs = existingGDs.filter(g => g.deleted_at)

  if (activeGDs.length > 0) {
    const estado = activeGDs[0].estado ?? ''
    return ESTADO_MESSAGES[estado] || 'Ya existe una GD activa para esta asignatura'
  }

  if (rejectedGDs.length > 0) {
    const { error } = await adminClient
      .from('guias_didacticas')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', rejectedGDs.map(g => g.id))

    if (error) {
      console.error('Error soft-deleting rejected GDs:', error)
      return 'Error al procesar la GD rechazada anterior'
    }
  }

  if (softDeletedGDs.length > 0) {
    const { error } = await adminClient
      .from('guias_didacticas')
      .delete()
      .in('id', softDeletedGDs.map(g => g.id))

    // No bloquear: el índice único parcial permitirá el INSERT igualmente
    if (error) console.error('Error hard-deleting soft-deleted GDs:', error)
  }

  return null
}

/**
 * Borra los PDFs que quedaron en Storage sin registro en `guias_didacticas`.
 *
 * Se producen cuando alguien pide la URL firmada, sube el archivo y no llega a
 * confirmar. Es una limpieza best-effort: si falla, no debe romper la subida.
 */
export async function removeOrphanGDFiles(
  adminClient: AdminClient,
  prefix: string
): Promise<void> {
  try {
    const { data: files } = await adminClient.storage
      .from(GD_BUCKET)
      .list('', { search: prefix, limit: 100 })

    const candidates = (files ?? [])
      .map(f => f.name)
      .filter(name => name.startsWith(prefix))

    if (candidates.length === 0) return

    const { data: registered } = await adminClient
      .from('guias_didacticas')
      .select('archivo_path')
      .in('archivo_path', candidates)

    const registeredPaths = new Set((registered ?? []).map(r => r.archivo_path))
    const orphans = candidates.filter(name => !registeredPaths.has(name))

    if (orphans.length > 0) {
      await adminClient.storage.from(GD_BUCKET).remove(orphans)
    }
  } catch (error) {
    console.error('Error cleaning orphan GD files:', error)
  }
}

/**
 * Valida los magic bytes de un PDF (`%PDF-`).
 */
export function isPDF(buffer: ArrayBuffer): boolean {
  const header = new Uint8Array(buffer.slice(0, 5))
  return String.fromCharCode(...header) === '%PDF-'
}
