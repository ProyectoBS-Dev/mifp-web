// ============================================
// 🛡️ CSRF Token API Endpoint
// ============================================
// GET /api/csrf - Genera un nuevo token CSRF para el cliente

import { NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

export async function GET() {
  try {
    const token = generateCsrfToken()
    return NextResponse.json({ token })
  } catch {
    console.error('[CSRF] Error generando token')
    return NextResponse.json(
      { error: 'Error generando token de seguridad' },
      { status: 500 }
    )
  }
}
