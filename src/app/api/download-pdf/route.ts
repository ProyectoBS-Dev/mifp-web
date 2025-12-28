'use server'

// ============================================
// 📥 API Route para descargar PDFs desde R2
// ============================================
// Proxy que evita problemas de CORS al descargar desde Cloudflare R2

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'documento.pdf'

  if (!url) {
    return NextResponse.json(
      { error: 'URL del PDF no proporcionada' },
      { status: 400 }
    )
  }

  try {
    // Validar que la URL es de nuestro bucket R2
    const allowedDomains = [
      'pub-bcdb8d6166ed4e9fae5a9258681bafaf',  // Prefijo de tu bucket R2 público
    ]
    
    const urlObj = new URL(url)
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    )

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'URL no permitida' },
        { status: 403 }
      )
    }

    // Fetch del PDF desde R2 (server-side, sin restricciones CORS)
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener el archivo' },
        { status: response.status }
      )
    }

    const blob = await response.blob()

    // Devolver el PDF con headers correctos para descarga
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error en download-pdf proxy:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
