// ============================================
// 📝 Audit Logging Library
// ============================================
// Logs security-relevant events to the audit_logs table in Supabase.
// Uses admin client (service role key) to bypass RLS for inserts.

import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

interface AuditEvent {
  action: string
  userId: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

/**
 * Extrae la IP del cliente desde los headers del request
 */
function getClientIp(request?: NextRequest): string | null {
  if (!request) return null
  
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  )
}

/**
 * Registra un evento de auditoría en la base de datos.
 * No lanza errores - solo loguea a consola si falla.
 */
export async function logAuditEvent(
  event: AuditEvent,
  request?: NextRequest
): Promise<void> {
  try {
    const adminClient = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any).from('audit_logs').insert({
      action: event.action,
      user_id: event.userId,
      resource_type: event.resourceType || null,
      resource_id: event.resourceId || null,
      ip_address: getClientIp(request),
      metadata: event.metadata || {},
    })
  } catch (error) {
    // Nunca fallar por audit logging - solo loguear
    console.error('[Audit] Error registrando evento:', error)
  }
}
