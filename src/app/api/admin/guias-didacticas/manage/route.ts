import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withCsrfProtection } from '@/lib/csrf'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { logAuditEvent } from '@/lib/audit'
import { uuidSchema, formatZodErrors } from '@/lib/validation/schemas'
import { countCurriculum, isExtractionStale } from '@/lib/gd-admin'
import { GD_BUCKET } from '@/lib/gd-upload'

/**
 * Gestión de GDs ya creadas (zona de recuperación del panel de admin):
 *
 * - `reset`: devuelve a `pendiente` una GD sin currículo cargado (extracción
 *   atascada, datos extraídos descartados, rechazo revertido…). No borra nada.
 * - `undo`: borra el currículo y los datos de usuario de la asignatura, hace
 *   backup y deja la GD en `pendiente` conservando el PDF.
 * - `purge`: igual que `undo` pero elimina la GD (soft-delete) y su PDF.
 *
 * `undo` y `purge` pasan por `delete_gd_data`, que hace backup y borrado en la
 * misma transacción. La asignatura y el semestre salen SIEMPRE de la fila de la
 * GD: el cliente solo manda el `gdId`.
 */

const manageSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('reset'),
    gdId: uuidSchema,
  }),
  z.object({
    action: z.enum(['undo', 'purge']),
    gdId: uuidSchema,
    /** `true` (por defecto) solo calcula el impacto; no modifica nada */
    dryRun: z.boolean().default(true),
    /** Necesario si hay usuarios con notas que se perderían */
    force: z.boolean().default(false),
    /** Código de la asignatura, obligatorio al ejecutar de verdad */
    confirmCode: z.string().trim().max(50).optional(),
  }),
])

interface DeleteGDDataResult {
  success: boolean
  error?: string
  mode?: 'dry_run' | 'executed'
  backup_id?: string
  kept_record?: boolean
  audit?: {
    datos_estructurales?: { ras?: number; pacs?: number; vts?: number }
    datos_usuario?: {
      usuarios_afectados?: number
      usuarios_con_notas?: number
      registros_user_pacs?: number
      registros_user_vts?: number
      registros_user_examenes?: number
    }
  }
  deleted?: Record<string, number>
}

const normalizeCode = (value: string) => value.trim().toLowerCase()

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const parseResult = manageSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(formatZodErrors(parseResult.error), { status: 400 })
    }

    const body = parseResult.data
    const adminClient = createAdminClient()

    const { data: gd, error: gdError } = await adminClient
      .from('guias_didacticas')
      .select(`
        id, asignatura_id, semestre_id, estado, updated_at, archivo_path,
        asignatura:asignaturas(codigo)
      `)
      .eq('id', body.gdId)
      .is('deleted_at', null)
      .single()

    if (gdError || !gd) {
      return NextResponse.json({ error: 'GD no encontrada' }, { status: 404 })
    }

    const estado = gd.estado ?? 'pendiente'
    const extractionInFlight = estado === 'extrayendo' && !isExtractionStale(gd.updated_at)

    // ─── RESET ──────────────────────────────────────────────────────────────
    if (body.action === 'reset') {
      if (estado === 'pendiente') {
        return NextResponse.json({ error: 'La GD ya está pendiente' }, { status: 409 })
      }
      if (extractionInFlight) {
        return NextResponse.json(
          { error: 'La extracción sigue en curso. Espera unos segundos antes de desbloquearla.' },
          { status: 409 }
        )
      }

      const counts = await countCurriculum(adminClient, gd.asignatura_id, gd.semestre_id)
      if (counts.total > 0) {
        return NextResponse.json(
          { error: 'Esta GD tiene RAs, PACs o VTs cargados. Usa «Deshacer» para borrarlos con backup.' },
          { status: 409 }
        )
      }

      // El UPDATE repite el estado leído: si cambió entre medias no toca nada
      const { data: updated, error: updateError } = await adminClient
        .from('guias_didacticas')
        .update({
          estado: 'pendiente',
          procesada: false,
          datos_extraidos: null,
          error_extraccion: null,
          motivo_rechazo: null,
          validada_por: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gd.id)
        .eq('estado', estado)
        .is('deleted_at', null)
        .select('id')

      if (updateError) {
        console.error('[GD manage] Error en reset:', updateError)
        return NextResponse.json({ error: 'Error al devolver la GD a pendiente' }, { status: 500 })
      }
      if (!updated || updated.length === 0) {
        return NextResponse.json(
          { error: 'La GD cambió de estado mientras la desbloqueabas. Recarga la página.' },
          { status: 409 }
        )
      }

      await logAuditEvent({
        action: 'gd.reset',
        userId: auth.user.id,
        resourceType: 'guia_didactica',
        resourceId: gd.id,
        metadata: { estadoAnterior: estado },
      }, request)

      return NextResponse.json({ success: true })
    }

    // ─── UNDO / PURGE ───────────────────────────────────────────────────────
    if (extractionInFlight) {
      return NextResponse.json(
        { error: 'La extracción sigue en curso. Espera a que termine o se desbloquee.' },
        { status: 409 }
      )
    }

    const keepRecord = body.action === 'undo'

    // Siempre se calcula antes el impacto en el servidor: no se fía de lo que
    // el cliente creyera ver en su propio dry-run
    const { data: dryData, error: dryError } = await adminClient.rpc('delete_gd_data', {
      p_asignatura_id: gd.asignatura_id,
      p_semestre_id: gd.semestre_id,
      p_force: false,
      p_dry_run: true,
      p_keep_record: keepRecord,
    })

    const dryResult = dryData as unknown as DeleteGDDataResult | null

    if (dryError || !dryResult?.success) {
      console.error('[GD manage] Error en dry-run:', dryError ?? dryResult?.error)
      return NextResponse.json({ error: 'No se pudo calcular el impacto de la operación' }, { status: 500 })
    }

    if (body.dryRun) {
      return NextResponse.json({ success: true, dryRun: true, audit: dryResult.audit })
    }

    // Ejecución real: exige escribir el código de la asignatura
    const asignatura = gd.asignatura as { codigo: string } | null
    if (
      !body.confirmCode ||
      !asignatura?.codigo ||
      normalizeCode(body.confirmCode) !== normalizeCode(asignatura.codigo)
    ) {
      return NextResponse.json(
        { error: 'El código de la asignatura no coincide' },
        { status: 400 }
      )
    }

    const usersWithGrades = dryResult.audit?.datos_usuario?.usuarios_con_notas ?? 0
    if (usersWithGrades > 0 && !body.force) {
      return NextResponse.json(
        {
          error:
            `Hay ${usersWithGrades} usuario(s) con notas registradas que se perderían. ` +
            'Confirma explícitamente para continuar.',
          audit: dryResult.audit,
        },
        { status: 409 }
      )
    }

    const { data: execData, error: execError } = await adminClient.rpc('delete_gd_data', {
      p_asignatura_id: gd.asignatura_id,
      p_semestre_id: gd.semestre_id,
      p_force: body.force,
      p_dry_run: false,
      p_keep_record: keepRecord,
      p_action: body.action,
      p_created_by: auth.user.id,
    })

    const execResult = execData as unknown as DeleteGDDataResult | null

    if (execError || !execResult?.success) {
      console.error('[GD manage] Error ejecutando', body.action, execError ?? execResult?.error)
      const message = execResult?.error ?? ''
      const status = message.includes('Hace falta confirmar') ? 409 : 500
      return NextResponse.json(
        { error: status === 409 ? message : 'Error al ejecutar la operación' },
        { status }
      )
    }

    // El PDF solo se borra al eliminar la GD. Si falla, la GD ya está eliminada
    // y el fichero queda huérfano: se avisa con su ruta en vez de fallar
    let orphanPath: string | null = null
    if (!keepRecord && gd.archivo_path) {
      const { error: removeError } = await adminClient.storage
        .from(GD_BUCKET)
        .remove([gd.archivo_path])

      if (removeError) {
        console.error('[GD manage] No se pudo borrar el PDF:', removeError)
        orphanPath = gd.archivo_path
      }
    }

    // El backup (con datos de usuarios) NO va al log: solo su id y los conteos
    await logAuditEvent({
      action: `gd.${body.action}`,
      userId: auth.user.id,
      resourceType: 'guia_didactica',
      resourceId: gd.id,
      metadata: {
        estadoAnterior: estado,
        backupId: execResult.backup_id ?? null,
        forced: body.force,
        deleted: execResult.deleted ?? {},
        orphanPath,
      },
    }, request)

    return NextResponse.json({
      success: true,
      dryRun: false,
      backupId: execResult.backup_id ?? null,
      deleted: execResult.deleted ?? {},
      orphanPath,
    })
  } catch (error) {
    console.error('[GD manage] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
