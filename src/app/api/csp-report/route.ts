// ============================================
// 🛡️ CSP Violation Report Endpoint
// ============================================
// Receives Content-Security-Policy violation reports and logs them.
// Used by both report-uri (deprecated) and report-to directives.

import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let report: Record<string, unknown> = {}

    // report-uri sends application/csp-report
    // report-to sends application/reports+json
    if (
      contentType.includes('application/csp-report') ||
      contentType.includes('application/reports+json') ||
      contentType.includes('application/json')
    ) {
      const body = await request.json()
      // report-uri wraps in "csp-report", report-to sends array
      report = body['csp-report'] || body[0]?.body || body
    }

    // Log to audit_logs
    await logAuditEvent({
      action: 'csp.violation',
      userId: 'system',
      resourceType: 'csp',
      metadata: {
        blockedUri: report['blocked-uri'] || report['blockedURL'],
        documentUri: report['document-uri'] || report['documentURL'],
        violatedDirective: report['violated-directive'] || report['effectiveDirective'],
        disposition: report['disposition'],
        originalPolicy: typeof report['original-policy'] === 'string'
          ? report['original-policy'].substring(0, 200) // Truncar para no llenar el log
          : undefined,
      },
    }, request)

    return new NextResponse(null, { status: 204 })
  } catch {
    // Nunca fallar - los reports son fire-and-forget
    return new NextResponse(null, { status: 204 })
  }
}
