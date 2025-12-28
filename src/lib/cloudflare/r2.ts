// ============================================
// ☁️ Cloudflare R2 Client
// ============================================
// Cliente para interactuar con buckets de Cloudflare R2
// usando la API compatible con S3

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  type _Object,
} from '@aws-sdk/client-s3'
import type { RecursoMetadataJSON, R2File } from '@/types/recursos'

/**
 * Crea un cliente S3 configurado para Cloudflare R2
 */
export function createR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY

  if (!accountId || !accessKey || !secretKey) {
    throw new Error(
      'Faltan variables de entorno de Cloudflare R2. ' +
        'Asegúrate de configurar CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY y CLOUDFLARE_R2_SECRET_KEY'
    )
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  })
}

/**
 * Lista todos los archivos en un bucket de R2
 * @param bucket Nombre del bucket
 * @param extension Extensión de archivo a filtrar (ej: '.mp3', '.pdf')
 */
export async function listR2Files(
  bucket: string,
  extension: string
): Promise<R2File[]> {
  const client = createR2Client()

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
    })
  )

  if (!response.Contents) {
    return []
  }

  // Filtrar por extensión y excluir archivos .json (metadatos)
  return response.Contents.filter(
    (obj): obj is _Object & { Key: string } =>
      obj.Key !== undefined &&
      obj.Key.endsWith(extension) &&
      !obj.Key.endsWith('.json')
  ).map((obj) => ({
    key: obj.Key,
    size: obj.Size || 0,
    lastModified: obj.LastModified || new Date(),
  }))
}

/**
 * Obtiene los metadatos JSON de un archivo en R2
 * @param bucket Nombre del bucket
 * @param fileKey Key del archivo principal (ej: 'clean-code.mp3')
 * @returns Metadatos o null si no existe el archivo JSON
 */
export async function getR2FileMetadata(
  bucket: string,
  fileKey: string
): Promise<RecursoMetadataJSON | null> {
  const client = createR2Client()

  // Reemplazar extensión por .json
  const jsonKey = fileKey.replace(/\.(mp3|pdf)$/, '.json')

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: jsonKey,
      })
    )

    if (!response.Body) {
      return null
    }

    const bodyString = await response.Body.transformToString()
    return JSON.parse(bodyString) as RecursoMetadataJSON
  } catch (error) {
    // El archivo JSON no existe
    if ((error as { name?: string }).name === 'NoSuchKey') {
      return null
    }
    console.error(`Error obteniendo metadatos para ${fileKey}:`, error)
    return null
  }
}

/**
 * Obtiene la URL pública de un archivo en R2
 * @param bucket Tipo de bucket ('podcasts' | 'pdfs')
 * @param fileKey Key del archivo
 * @returns URL pública del archivo
 */
export function getR2PublicUrl(
  bucketType: 'podcasts' | 'pdfs',
  fileKey: string
): string {
  const publicUrl =
    bucketType === 'podcasts'
      ? process.env.CLOUDFLARE_R2_PUBLIC_URL_PODCASTS
      : process.env.CLOUDFLARE_R2_PUBLIC_URL_PDFS

  if (!publicUrl) {
    throw new Error(
      `No se ha configurado CLOUDFLARE_R2_PUBLIC_URL_${bucketType.toUpperCase()}`
    )
  }

  // Asegurarse de que no haya doble slash
  const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl
  const key = fileKey.startsWith('/') ? fileKey.slice(1) : fileKey

  return `${baseUrl}/${key}`
}

/**
 * Lista archivos en R2 con sus metadatos
 * @param bucket Nombre del bucket
 * @param extension Extensión de archivo
 */
export async function listR2FilesWithMetadata(
  bucket: string,
  extension: string
): Promise<R2File[]> {
  const files = await listR2Files(bucket, extension)

  // Cargar metadatos para cada archivo
  const filesWithMetadata = await Promise.all(
    files.map(async (file) => {
      const metadata = await getR2FileMetadata(bucket, file.key)
      return {
        ...file,
        metadata: metadata || undefined,
      }
    })
  )

  return filesWithMetadata
}

