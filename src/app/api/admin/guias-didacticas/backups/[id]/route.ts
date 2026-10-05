import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { logAuditEvent } from '@/lib/audit'
import { uuidSchema } from '@/lib/validation/schemas'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/guias-didacticas/backups/[id]
 *
 * Descarga el backup JSON generado por «Deshacer» o «Eliminar». Contiene datos
 * de usuarios (notas), así que solo lo ve un admin y cada descarga queda en el
 * log de auditoría.
 *
 * Para restaurarlo con `restore_user_gd_data` hay que pasarle solo `backup.users`.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = await withRateLimit(request, rateLimiters?.admin || null)
  if (rateLimitError) return rateLimitError

  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data: backup, error } = await adminClient
    .from('gd_backups')
    .select('id, gd_id, asignatura_id, semestre_id, action, audit, backup, created_at')
    .eq('id', id)
    .single()

  if (error || !backup) {
    return NextResponse.json({ error: 'Backup no encontrado' }, { status: 404 })
  }

  await logAuditEvent({
    action: 'gd.backup_download',
    userId: auth.user.id,
    resourceType: 'gd_backup',
    resourceId: backup.id,
    metadata: { gdId: backup.gd_id, backupAction: backup.action },
  }, request)

  const fileName = `gd-backup-${backup.action}-${backup.created_at.slice(0, 10)}-${backup.id.slice(0, 8)}.json`

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}
