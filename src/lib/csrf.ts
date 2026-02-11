// ============================================
// 🛡️ CSRF Protection Library
// ============================================
// Double Submit Cookie pattern with HMAC-SHA256 signed tokens.
// Tokens include a timestamp and expire after 1 hour.

import { createHmac, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const CSRF_SECRET = process.env.CSRF_SECRET
const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hora

/**
 * Genera un token CSRF firmado con timestamp
 * Formato: timestamp.randomData.signature
 */
export function generateCsrfToken(): string {
  if (!CSRF_SECRET) {
    throw new Error('CSRF_SECRET no está configurado')
  }

  const timestamp = Date.now().toString()
  const randomData = randomBytes(16).toString('hex')
  const payload = `${timestamp}.${randomData}`
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')

  return `${payload}.${signature}`
}

/**
 * Verifica un token CSRF: firma válida y no expirado
 */
export function verifyCsrfToken(token: string): boolean {
  if (!CSRF_SECRET || !token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [timestamp, randomData, signature] = parts
  
  // Verificar firma
  const payload = `${timestamp}.${randomData}`
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')

  // Comparación timing-safe
  if (signature.length !== expectedSignature.length) return false
  
  let mismatch = 0
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }
  if (mismatch !== 0) return false

  // Verificar expiración
  const tokenTime = parseInt(timestamp, 10)
  if (isNaN(tokenTime)) return false
  if (Date.now() - tokenTime > TOKEN_EXPIRY_MS) return false

  return true
}

/**
 * Helper para API routes: extrae y verifica el token CSRF del header.
 * Retorna NextResponse con error 403 si falla, o null si es válido.
 */
export function withCsrfProtection(request: NextRequest): NextResponse | null {
  const token = request.headers.get('x-csrf-token')

  if (!token || !verifyCsrfToken(token)) {
    return NextResponse.json(
      { error: 'Token CSRF inválido o expirado' },
      { status: 403 }
    )
  }

  return null // Token válido
}
