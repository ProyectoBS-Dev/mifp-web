import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

const DEFAULT_RETENTION_DAYS = 30 // Días por defecto

// POST - Limpiar imágenes huérfanas del storage
export async function POST(request: NextRequest) {
  try {
    // Solo admins pueden ejecutar limpieza masiva
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Obtener parámetros del body
    let retentionDays: number | null = DEFAULT_RETENTION_DAYS
    try {
      const body = await request.json()
      // Si retentionDays es null, eliminar TODAS las huérfanas sin importar antigüedad
      // Si es un número, usar ese valor
      if (body.retentionDays === null) {
        retentionDays = null
      } else if (typeof body.retentionDays === 'number' && body.retentionDays >= 0) {
        retentionDays = body.retentionDays
      }
    } catch {
      // Si no hay body o falla el parse, usar valor por defecto
    }

    const adminClient = createAdminClient()

    // 1. Obtener todas las imágenes del bucket
    const { data: files, error: listError } = await adminClient.storage
      .from('noticias-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (listError) {
      console.error('Error listing storage files:', listError)
      return NextResponse.json({ error: 'Error al listar archivos' }, { status: 500 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        message: 'No hay imágenes en el storage',
        deleted: 0,
        kept: 0,
        retentionDays
      })
    }

    // 2. Obtener todas las URLs de imágenes referenciadas en noticias activas
    const { data: noticias, error: noticiasError } = await adminClient
      .from('noticias')
      .select('imagen_url')
      .not('imagen_url', 'is', null)
      .is('deleted_at', null)

    if (noticiasError) {
      console.error('Error fetching noticias:', noticiasError)
      return NextResponse.json({ error: 'Error al consultar noticias' }, { status: 500 })
    }

    // Extraer solo los paths de las URLs activas
    const activeImagePaths = new Set(
      (noticias || [])
        .map(n => {
          const match = n.imagen_url?.match(/\/noticias-images\/(.+)$/)
          return match ? match[1] : null
        })
        .filter((path): path is string => path !== null)
    )

    // 3. Identificar imágenes huérfanas
    const cutoffDate = retentionDays !== null ? new Date() : null
    if (cutoffDate && retentionDays !== null) {
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    }

    const orphanedImages: string[] = []
    const keptImages: string[] = []

    // Procesar archivos en subcarpetas (estructura: userId/filename.jpg)
    for (const file of files) {
      if (file.name === '.emptyFolderPlaceholder') continue
      
      // Listar archivos en cada carpeta de usuario
      const { data: userFiles } = await adminClient.storage
        .from('noticias-images')
        .list(file.name, { limit: 100 })

      if (!userFiles) continue

      for (const userFile of userFiles) {
        const fullPath = `${file.name}/${userFile.name}`
        
        // Si la imagen NO está en uso
        if (!activeImagePaths.has(fullPath)) {
          // Si retentionDays es null, eliminar TODAS las huérfanas
          if (cutoffDate === null) {
            orphanedImages.push(fullPath)
          } else {
            const fileCreatedAt = new Date(userFile.created_at)
            
            // Solo eliminar si tiene más de retentionDays días
            if (fileCreatedAt < cutoffDate) {
              orphanedImages.push(fullPath)
            } else {
              keptImages.push(fullPath) // Conservar por si se usa pronto
            }
          }
        }
      }
    }

    // 4. Eliminar imágenes huérfanas
    let deletedCount = 0
    if (orphanedImages.length > 0) {
      // Borrar en lotes de 50 (límite de Supabase)
      const batchSize = 50
      for (let i = 0; i < orphanedImages.length; i += batchSize) {
        const batch = orphanedImages.slice(i, i + batchSize)
        const { error: deleteError } = await adminClient.storage
          .from('noticias-images')
          .remove(batch)

        if (deleteError) {
          console.error(`Error deleting batch ${i / batchSize + 1}:`, deleteError)
        } else {
          deletedCount += batch.length
        }
      }
    }

    const retentionLabel = retentionDays === null 
      ? 'todas las huérfanas' 
      : `> ${retentionDays} días`

    return NextResponse.json({
      success: true,
      message: `Limpieza completada: ${deletedCount} imágenes eliminadas (${retentionLabel}), ${keptImages.length} conservadas`,
      deleted: deletedCount,
      kept: keptImages.length,
      retentionDays
    })
  } catch (error) {
    console.error('Cleanup orphaned images error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
