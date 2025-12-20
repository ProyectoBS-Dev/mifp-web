// ============================================
// Supabase Session Handler para Next.js 16 Proxy
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = ['/', '/login', '/registro']
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/health')
  )

  // Si no hay usuario y la ruta no es pública, redirigir a login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ============================================
  // VERIFICACIÓN DE ONBOARDING (para usuarios autenticados)
  // ============================================
  if (user) {
    // Consultar el estado de onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    // Determinar si completó onboarding:
    // - Si profile existe y onboarding_completed es true → completado
    // - Si profile es null o onboarding_completed es false/null → no completado
    const onboardingCompleted = profile?.onboarding_completed === true

    // Caso 1: Usuario autenticado en /login o /registro
    // → Redirigir a /onboarding si no completó, o a /dashboard si ya completó
    if (pathname === '/login' || pathname === '/registro') {
      const url = request.nextUrl.clone()
      url.pathname = onboardingCompleted ? '/dashboard' : '/onboarding'
      return NextResponse.redirect(url)
    }

    // Caso 2: Usuario en /onboarding
    // → Si ya completó, redirigir a /dashboard
    if (pathname === '/onboarding') {
      if (onboardingCompleted) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
      // Si no completó, permitir acceso a /onboarding
      return supabaseResponse
    }

    // Caso 3: Usuario en rutas protegidas (no públicas, no /onboarding)
    // → Si no completó onboarding, redirigir a /onboarding
    if (!isPublicRoute && !onboardingCompleted) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // ============================================
  // PROTECCIÓN DE RUTAS ADMIN
  // ============================================
  // La verificación de rol admin se hace en el layout de /admin
  // porque el proxy no tiene acceso eficiente a la tabla users sin 
  // hacer múltiples queries

  return supabaseResponse
}
