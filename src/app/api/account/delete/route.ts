// ============================================
// ⚠️ API Route: /api/account/delete
// ============================================
// Endpoint para eliminar la cuenta del usuario autenticado.
// CRÍTICO: Rate limiting + CSRF + Audit logging

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'
import { withCsrfProtection } from '@/lib/csrf'
import { logAuditEvent } from '@/lib/audit'

export async function DELETE(request: NextRequest) {
  // Rate limiting (critical: 5 req/min)
  const rateLimitError = await withRateLimit(request, rateLimiters?.critical || null)
  if (rateLimitError) return rateLimitError

  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar la cuenta' },
        { status: 500 }
      )
    }

    // Audit logging DESPUÉS del delete (solo se registra si el borrado fue exitoso)
    await logAuditEvent({
      action: 'account.delete',
      userId: user.id,
      resourceType: 'user',
      resourceId: user.id,
      metadata: { email: user.email },
    }, request)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Account Delete] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
