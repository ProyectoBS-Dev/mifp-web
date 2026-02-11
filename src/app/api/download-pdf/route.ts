// ============================================
// 📥 API Route: /api/download-pdf
// ============================================
// Proxy para descargar PDFs desde Cloudflare R2.
// Protegido con: Auth + Rate limiting + Validación estricta + Timeout

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, rateLimiters } from '@/lib/ratelimit'

// ✅ Lista de dominios permitidos (igualdad exacta)
const ALLOWED_HOSTNAMES = [
  'pub-bcdb8d6166ed4e9fae5a9258681bafaf.r2.dev',
  'pub-f626a6b255d24b128756ee07c7fe8cdc.r2.dev',
]

const DOWNLOAD_TIMEOUT_MS = 30_000 // 30 segundos

export async function GET(request: NextRequest) {
  // ✅ Rate limiting (user: 60 req/min)
  const rateLimitError = await withRateLimit(request, rateLimiters?.user || null)
  if (rateLimitError) return rateLimitError

  try {
    // ✅ Requiere autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const urlParam = searchParams.get('url')
    const filename = searchParams.get('filename') || 'document.pdf'

    if (!urlParam) {
      return NextResponse.json(
        { error: 'URL del PDF requerida' },
        { status: 400 }
      )
    }

    // ✅ Validación estricta de URL
    let urlObj: URL
    try {
      urlObj = new URL(urlParam)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }

    // ✅ Solo HTTPS
    if (urlObj.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Solo se permiten URLs HTTPS' },
        { status: 400 }
      )
    }

    // ✅ Validación de hostname por igualdad exacta (no .includes())
    const isAllowed = ALLOWED_HOSTNAMES.includes(urlObj.hostname)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Dominio no permitido' },
        { status: 403 }
      )
    }

    // ✅ Timeout de 30 segundos
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS)

    try {
      const response = await fetch(urlParam, {
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Error descargando el archivo' },
          { status: response.status }
        )
      }

      const blob = await response.blob()

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      })
    } catch (error) {
      clearTimeout(timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Timeout descargando el archivo' },
          { status: 504 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('[Download PDF] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
