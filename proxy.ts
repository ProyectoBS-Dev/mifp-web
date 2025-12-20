// ============================================
// 🛡️ Proxy de Protección de Rutas (Next.js 16)
// ============================================
// En Next.js 16, middleware.ts se renombró a proxy.ts
// La función exportada debe llamarse `proxy` (no `middleware`)
// ============================================

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
