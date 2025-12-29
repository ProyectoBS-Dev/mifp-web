-- ============================================
-- 🗄️ Migración: Tabla recursos_asignaturas
-- ============================================
-- Permite asociar múltiples asignaturas a un recurso
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla intermedia (many-to-many)
CREATE TABLE IF NOT EXISTS recursos_asignaturas (
  recurso_id UUID NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
  asignatura_id UUID NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
  PRIMARY KEY (recurso_id, asignatura_id)
);

-- 2. Migrar datos existentes de recursos.asignatura_id
INSERT INTO recursos_asignaturas (recurso_id, asignatura_id)
SELECT id, asignatura_id 
FROM recursos 
WHERE asignatura_id IS NOT NULL 
  AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- 3. Crear índices para mejorar performance en JOINs
CREATE INDEX IF NOT EXISTS idx_recursos_asignaturas_recurso 
  ON recursos_asignaturas(recurso_id);
CREATE INDEX IF NOT EXISTS idx_recursos_asignaturas_asignatura 
  ON recursos_asignaturas(asignatura_id);

-- 4. Verificar migración (ejecutar esto después de verificar los datos)
-- SELECT 
--   r.titulo,
--   array_agg(a.nombre) as asignaturas
-- FROM recursos r
-- LEFT JOIN recursos_asignaturas ra ON r.id = ra.recurso_id
-- LEFT JOIN asignaturas a ON ra.asignatura_id = a.id
-- WHERE r.deleted_at IS NULL
-- GROUP BY r.id, r.titulo;

-- 5. DESPUÉS de verificar que la migración funcionó correctamente,
--    ejecutar este comando para eliminar la columna antigua:
-- ALTER TABLE recursos DROP COLUMN asignatura_id;

-- ============================================
-- 🔒 Políticas RLS para recursos_asignaturas
-- ============================================
-- Ejecutar después de crear la tabla

-- 1. Habilitar RLS
ALTER TABLE recursos_asignaturas ENABLE ROW LEVEL SECURITY;

-- 2. Política SELECT: Todos los usuarios autenticados pueden leer
CREATE POLICY "recursos_asignaturas_select_policy"
ON recursos_asignaturas
FOR SELECT
TO authenticated
USING (true);

-- 3. Política INSERT: Solo admins pueden insertar
CREATE POLICY "recursos_asignaturas_insert_policy"
ON recursos_asignaturas
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 4. Política DELETE: Solo admins pueden eliminar
CREATE POLICY "recursos_asignaturas_delete_policy"
ON recursos_asignaturas
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 5. Política UPDATE: Solo admins pueden actualizar (por si acaso)
CREATE POLICY "recursos_asignaturas_update_policy"
ON recursos_asignaturas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
