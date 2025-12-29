#!/usr/bin/env tsx
// ============================================
// 🔄 Script de Sincronización de Recursos
// ============================================
// Sincroniza archivos de Cloudflare R2 con la tabla recursos de Supabase
//
// Uso: pnpm sync-resources
//
// Este script:
// 1. Lista todos los archivos en los buckets de R2 (podcasts y PDFs)
// 2. Lee los metadatos de los archivos .json asociados
// 3. Compara con la tabla recursos de Supabase
// 4. Inserta nuevos registros para archivos que faltan
// 5. Hace soft-delete de registros huérfanos (archivos eliminados de R2)

// Cargar variables de entorno desde .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import type { RecursoMetadataJSON, RecursoTipo, SyncResult } from '../src/types/recursos'

// ============================================
// Configuración
// ============================================

const config = {
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
  buckets: {
    podcasts: {
      name: process.env.CLOUDFLARE_R2_PODCASTS_BUCKET || 'mifp-podcasts',
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL_PODCASTS,
      extension: '.mp3',
      tipo: 'podcast' as RecursoTipo,
    },
    pdfs: {
      name: process.env.CLOUDFLARE_R2_PDFS_BUCKET || 'mifp-pdfs',
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL_PDFS,
      extension: '.pdf',
      tipo: 'pdf' as RecursoTipo,
    },
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
}

// ============================================
// Clientes
// ============================================

function createR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.cloudflare.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.cloudflare.accessKey,
      secretAccessKey: config.cloudflare.secretKey,
    },
  })
}

const supabase = createClient(config.supabase.url, config.supabase.serviceKey)

// ============================================
// Funciones de utilidad
// ============================================

function formatTitle(key: string): string {
  // Extrae el nombre del archivo sin extensión y lo formatea
  // Ejemplo: "clean-code-ep1.mp3" → "Clean Code Ep1"
  return key
    .replace(/\.(mp3|pdf|json)$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
  const icons = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }
  console.log(`${icons[type]} ${message}`)
}

// ============================================
// Funciones de R2
// ============================================

interface R2FileInfo {
  key: string
  size: number
  lastModified: Date
}

async function listR2Files(
  client: S3Client,
  bucket: string,
  extension: string
): Promise<R2FileInfo[]> {
  const response = await client.send(
    new ListObjectsV2Command({ Bucket: bucket })
  )

  if (!response.Contents) {
    return []
  }

  return response.Contents
    .filter((obj) => obj.Key && obj.Key.endsWith(extension) && !obj.Key.endsWith('.json'))
    .map((obj) => ({
      key: obj.Key!,
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
    }))
}

async function getFileMetadata(
  client: S3Client,
  bucket: string,
  fileKey: string
): Promise<RecursoMetadataJSON | null> {
  const jsonKey = fileKey.replace(/\.(mp3|pdf)$/, '.json')

  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: jsonKey })
    )

    if (!response.Body) return null

    const bodyString = await response.Body.transformToString()
    return JSON.parse(bodyString) as RecursoMetadataJSON
  } catch {
    // El archivo JSON no existe
    return null
  }
}

// ============================================
// Función principal de sincronización
// ============================================

async function syncBucket(
  client: S3Client,
  bucketConfig: typeof config.buckets.podcasts
): Promise<SyncResult> {
  const result: SyncResult = {
    inserted: 0,
    softDeleted: 0,
    errors: [],
    details: {
      insertedFiles: [],
      deletedPaths: [],
    },
  }

  log(`\n📁 Sincronizando bucket: ${bucketConfig.name} (${bucketConfig.tipo})`)

  // 1. Listar archivos en R2
  const r2Files = await listR2Files(client, bucketConfig.name, bucketConfig.extension)
  log(`Encontrados ${r2Files.length} archivos en R2`, 'info')

  // 2. Obtener recursos existentes en Supabase (solo los no eliminados)
  const { data: existingResources, error: fetchError } = await supabase
    .from('recursos')
    .select('id, archivo_path, titulo')
    .eq('tipo', bucketConfig.tipo)
    .is('deleted_at', null)

  if (fetchError) {
    result.errors.push(`Error obteniendo recursos existentes: ${fetchError.message}`)
    log(`Error obteniendo recursos: ${fetchError.message}`, 'error')
    return result
  }

  const existingPaths = new Set(existingResources?.map((r) => r.archivo_path) || [])
  const r2Paths = new Set(r2Files.map((f) => f.key))

  // 3. Insertar nuevos archivos
  for (const file of r2Files) {
    if (existingPaths.has(file.key)) {
      continue // Ya existe en DB
    }

    // Obtener metadatos del archivo JSON
    const metadata = await getFileMetadata(client, bucketConfig.name, file.key)

    if (!metadata) {
      log(`${file.key} - Sin archivo .json de metadatos, usando título del nombre`, 'warning')
    }

    // Construir URL pública
    const publicUrl = bucketConfig.publicUrl
      ? `${bucketConfig.publicUrl.replace(/\/$/, '')}/${file.key}`
      : null

    // Parsear asignatura_ids (soporta ambos formatos para backwards compatibility)
    let asignaturaIds: string[] = []
    if (metadata?.asignatura_ids && Array.isArray(metadata.asignatura_ids)) {
      asignaturaIds = metadata.asignatura_ids
    } else if (metadata?.asignatura_id) {
      asignaturaIds = [metadata.asignatura_id]
    }

    // Insertar en Supabase (tabla recursos)
    const { data: insertedRecurso, error: insertError } = await supabase
      .from('recursos')
      .insert({
        tipo: bucketConfig.tipo,
        titulo: metadata?.titulo || formatTitle(file.key),
        descripcion: metadata?.descripcion || null,
        duracion: metadata?.duracion || null,
        url: publicUrl,
        archivo_path: file.key,
      })
      .select('id')
      .single()

    if (insertError) {
      result.errors.push(`Error insertando ${file.key}: ${insertError.message}`)
      log(`Error insertando ${file.key}: ${insertError.message}`, 'error')
      continue
    }

    // Insertar relaciones en recursos_asignaturas
    if (asignaturaIds.length > 0 && insertedRecurso) {
      const asignaturaRelations = asignaturaIds.map((asignaturaId) => ({
        recurso_id: insertedRecurso.id,
        asignatura_id: asignaturaId,
      }))

      const { error: relationError } = await supabase
        .from('recursos_asignaturas')
        .insert(asignaturaRelations)

      if (relationError) {
        result.errors.push(`Error insertando asignaturas para ${file.key}: ${relationError.message}`)
        log(`Error insertando asignaturas para ${file.key}: ${relationError.message}`, 'error')
      } else {
        log(`  → Asociado a ${asignaturaIds.length} asignatura(s)`, 'info')
      }
    }

    result.inserted++
    result.details.insertedFiles.push(file.key)
    log(`Insertado: ${metadata?.titulo || formatTitle(file.key)}`, 'success')
  }

  // 4. Soft-delete de recursos huérfanos (archivos eliminados de R2)
  const orphanResources = existingResources?.filter(
    (r) => r.archivo_path && !r2Paths.has(r.archivo_path)
  ) || []

  if (orphanResources.length > 0) {
    log(`\nEncontrados ${orphanResources.length} recursos huérfanos para soft-delete`, 'warning')

    for (const resource of orphanResources) {
      // Soft delete: marcamos con deleted_at en lugar de eliminar
      const { error: deleteError } = await supabase
        .from('recursos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', resource.id)

      if (deleteError) {
        result.errors.push(`Error soft-delete ${resource.archivo_path}: ${deleteError.message}`)
        log(`Error soft-delete ${resource.titulo}: ${deleteError.message}`, 'error')
      } else {
        result.softDeleted++
        result.details.deletedPaths.push(resource.archivo_path!)
        log(`Soft-deleted: ${resource.titulo} (${resource.archivo_path})`, 'success')
      }
    }
  }

  return result
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  console.log('\n' + '='.repeat(50))
  console.log('🔄 SINCRONIZACIÓN DE RECURSOS')
  console.log('   Cloudflare R2 → Supabase')
  console.log('='.repeat(50))

  // Validar configuración
  const missingVars: string[] = []
  if (!config.cloudflare.accountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID')
  if (!config.cloudflare.accessKey) missingVars.push('CLOUDFLARE_R2_ACCESS_KEY')
  if (!config.cloudflare.secretKey) missingVars.push('CLOUDFLARE_R2_SECRET_KEY')
  if (!config.supabase.url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!config.supabase.serviceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')

  if (missingVars.length > 0) {
    log(`Faltan variables de entorno: ${missingVars.join(', ')}`, 'error')
    process.exit(1)
  }

  const client = createR2Client()
  const totalResult: SyncResult = {
    inserted: 0,
    softDeleted: 0,
    errors: [],
    details: {
      insertedFiles: [],
      deletedPaths: [],
    },
  }

  // Sincronizar cada bucket
  for (const [, bucketConfig] of Object.entries(config.buckets)) {
    const result = await syncBucket(client, bucketConfig)
    totalResult.inserted += result.inserted
    totalResult.softDeleted += result.softDeleted
    totalResult.errors.push(...result.errors)
    totalResult.details.insertedFiles.push(...result.details.insertedFiles)
    totalResult.details.deletedPaths.push(...result.details.deletedPaths)
  }

  // Resumen
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE SINCRONIZACIÓN')
  console.log('='.repeat(50))
  console.log(`✅ Insertados: ${totalResult.inserted}`)
  console.log(`🗑️  Eliminados: ${totalResult.softDeleted}`)
  console.log(`❌ Errores: ${totalResult.errors.length}`)

  if (totalResult.errors.length > 0) {
    console.log('\nErrores encontrados:')
    totalResult.errors.forEach((err) => console.log(`  - ${err}`))
    process.exit(1)
  }

  console.log('\n✨ Sincronización completada exitosamente')
}

// Ejecutar
main().catch((error) => {
  console.error('Error fatal:', error)
  process.exit(1)
})

