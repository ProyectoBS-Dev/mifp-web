import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/notas/',
          '/ajustes/',
          '/perfil/',
          '/recursos/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

