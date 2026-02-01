import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack está habilitado por defecto en dev con --turbopack
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub avatars
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Unsplash images
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // Avatar placeholders
      },
    ],
  },

  // Headers de seguridad (actualizados: 1 Feb 2026)
  async headers() {
    return [
      // Headers globales para todas las rutas
      {
        source: '/(.*)',
        headers: [
          // Protección básica contra XSS y clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          
          // HSTS - Forzar HTTPS (1 año, configuración conservadora)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
          
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          
          // Permissions Policy - Deshabilitar features no utilizadas
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
          },
          
          // Cross-Origin Policies
          {
            key: 'Cross-Origin-Opener-Policy',
            // same-origin-allow-popups: permite OAuth popups (Google, GitHub)
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
          
          // Content Security Policy - Configurado para compatibilidad con proyecto
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Next.js hydration + JSON-LD + Google OAuth (todos los dominios necesarios)
              // Vercel Live (solo en preview): https://vercel.live
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.google.com https://*.googleapis.com https://*.gstatic.com",
              // Estilos: TipTap editor + Framer Motion + Google Fonts + Google OAuth
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.google.com https://*.gstatic.com",
              // Fuentes: Google Fonts + data URIs
              "font-src 'self' https://fonts.gstatic.com data:",
              // Imágenes: Supabase, R2, Google avatars, GitHub avatars, Unsplash, Dicebear
              "img-src 'self' data: https: blob:",
              // Media (audio/video): Supabase Storage y Cloudflare R2
              "media-src 'self' https://*.supabase.co https://*.r2.dev blob: data:",
              // Conexiones: Supabase API, OpenAI, Upstash, Cloudflare R2, Google OAuth
              // Nota: *.r2.dev cubre todos los subdominios de R2 (pub-xxx.r2.dev, etc)
              // Google OAuth: incluye todos los dominios necesarios (*.google.com, *.googleapis.com, *.gstatic.com, *.doubleclick.net)
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://*.upstash.io https://*.r2.dev https://vercel.live https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.doubleclick.net blob: data:",
              // Frames: PDFs de Supabase Storage y Cloudflare R2, Google OAuth
              // Vercel Live (solo en preview): iframe de feedback
              "frame-src 'self' blob: data: https://*.supabase.co https://*.r2.dev https://vercel.live https://*.google.com https://*.gstatic.com",
              // Otros
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      
      // Headers específicos para rutas API
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
