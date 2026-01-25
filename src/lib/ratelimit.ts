import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica si el rate limiting está habilitado
 * En desarrollo, el rate limiting es opcional (requiere Upstash configurado)
 * En producción, el rate limiting es OBLIGATORIO
 */
function isRateLimitEnabled(): boolean {
  const hasCredentials = !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )

  // En producción, si no hay credenciales → ERROR
  if (process.env.NODE_ENV === 'production' && !hasCredentials) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN son obligatorios en producción'
    )
  }

  return hasCredentials
}

/**
 * Crea instancia de Redis para rate limiting
 */
function createRedisClient() {
  if (!isRateLimitEnabled()) {
    return null
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const redis = createRedisClient()

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITERS POR NIVEL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rate limiters por nivel de criticidad
 * 
 * - critical: Endpoints muy sensibles (OpenAI, broadcast, cron)
 * - admin: Endpoints administrativos
 * - user: Endpoints de usuario autenticado
 * - public: Endpoints públicos
 */
export const rateLimiters = redis
  ? {
      // Endpoints críticos: 5 req/min (OpenAI, broadcast, cron)
      critical: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'rl:critical',
      }),

      // Endpoints admin: 20 req/min
      admin: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        analytics: true,
        prefix: 'rl:admin',
      }),

      // Endpoints user: 60 req/min
      user: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
        prefix: 'rl:user',
      }),

      // Endpoints públicos: 30 req/min
      public: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: 'rl:public',
      }),

      // OpenAI endpoints: 3 req/min (más restrictivo por costos)
      openai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 m'),
        analytics: true,
        prefix: 'rl:openai',
      }),
    }
  : null

// ═══════════════════════════════════════════════════════════════════════════════
// WRAPPER DE RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Aplica rate limiting a un API route
 * 
 * @param request - NextRequest del API route
 * @param ratelimiter - Rate limiter a usar
 * @param identifier - Identificador opcional (por defecto usa IP)
 * @returns NextResponse con error 429 si se excede el límite, null si OK
 * 
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const rateLimitError = await withRateLimit(request, rateLimiters.admin)
 *   if (rateLimitError) return rateLimitError
 *   
 *   // ... resto del código
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  ratelimiter: Ratelimit | null,
  identifier?: string
): Promise<NextResponse | null> {
  // Si rate limiting no está habilitado (desarrollo sin Upstash)
  if (!ratelimiter) {
    // En desarrollo solo advertir
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[RateLimit] Rate limiting deshabilitado. Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN'
      )
    }
    return null
  }

  try {
    // Usar IP o identifier custom
    // Next.js no expone request.ip directamente, usar headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const requestIp = forwardedFor?.split(',')[0] || realIp || 'anonymous'
    
    const id = identifier || requestIp

    const { success, limit, reset, remaining } = await ratelimiter.limit(id)

    if (!success) {
      console.warn('[RateLimit] Límite excedido:', {
        id,
        limit,
        remaining,
        reset: new Date(reset).toISOString(),
      })

      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          limit,
          reset: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    return null // Success
  } catch (error) {
    // Si falla el rate limiting, NO bloquear el request
    console.error('[RateLimit] Error:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS ESPECÍFICOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rate limit para autenticación (login/registro)
 * Usa email como identificador para prevenir bypass con múltiples IPs
 */
export async function withAuthRateLimit(
  request: NextRequest,
  email: string
): Promise<NextResponse | null> {
  if (!rateLimiters) return null

  // Limitar por IP Y por email
  const ipLimit = await withRateLimit(request, rateLimiters.public)
  if (ipLimit) return ipLimit

  // 3 intentos por email por minuto
  const emailLimit = await withRateLimit(
    request,
    rateLimiters.critical,
    `auth:${email}`
  )
  if (emailLimit) return emailLimit

  return null
}
