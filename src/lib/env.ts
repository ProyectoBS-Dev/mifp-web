import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  
  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
  CLOUDFLARE_R2_ACCESS_KEY: z.string().min(1).optional(),
  CLOUDFLARE_R2_SECRET_KEY: z.string().min(1).optional(),
  CLOUDFLARE_R2_PODCASTS_BUCKET: z.string().default('mifp-podcasts'),
  CLOUDFLARE_R2_PDFS_BUCKET: z.string().default('mifp-pdfs'),
  // URL pública del bucket (si está habilitado public access)
  CLOUDFLARE_R2_PUBLIC_URL_PODCASTS: z.string().url().optional(),
  CLOUDFLARE_R2_PUBLIC_URL_PDFS: z.string().url().optional(),
})

// Validate environment variables at build time
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      // Cloudflare R2
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_R2_ACCESS_KEY: process.env.CLOUDFLARE_R2_ACCESS_KEY,
      CLOUDFLARE_R2_SECRET_KEY: process.env.CLOUDFLARE_R2_SECRET_KEY,
      CLOUDFLARE_R2_PODCASTS_BUCKET: process.env.CLOUDFLARE_R2_PODCASTS_BUCKET,
      CLOUDFLARE_R2_PDFS_BUCKET: process.env.CLOUDFLARE_R2_PDFS_BUCKET,
      CLOUDFLARE_R2_PUBLIC_URL_PODCASTS: process.env.CLOUDFLARE_R2_PUBLIC_URL_PODCASTS,
      CLOUDFLARE_R2_PUBLIC_URL_PDFS: process.env.CLOUDFLARE_R2_PUBLIC_URL_PDFS,
    })
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}

export const env = validateEnv()
