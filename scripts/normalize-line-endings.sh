#!/bin/bash

# ============================================
# Normalize Line Endings to LF
# ============================================
# Este script convierte todos los archivos del proyecto a LF (Unix-style)
# y configura Git para mantener esta consistencia

set -e

echo "🔧 Normalizando line endings del proyecto..."
echo ""

# 1. Configurar Git globalmente (solo afecta a este proyecto)
echo "1. Configurando Git local..."
git config core.autocrlf false
git config core.eol lf
echo "   ✅ Git configurado para usar LF"
echo ""

# 2. Guardar cambios actuales (si los hay)
echo "2. Guardando cambios actuales..."
if [[ -n $(git status -s) ]]; then
  echo "   ⚠️  Hay cambios sin commitear. Por favor, commitea o haz stash primero."
  echo "   Ejecuta: git add . && git commit -m 'chore: save changes before line ending normalization'"
  exit 1
fi
echo "   ✅ Working directory limpio"
echo ""

# 3. Eliminar archivos del index de Git
echo "3. Limpiando Git index..."
git rm --cached -r . > /dev/null 2>&1 || true
echo "   ✅ Git index limpio"
echo ""

# 4. Re-normalizar todos los archivos según .gitattributes
echo "4. Re-normalizando archivos..."
git reset --hard
git add --renormalize .
echo "   ✅ Archivos normalizados a LF"
echo ""

# 5. Crear commit de normalización
echo "5. Creando commit de normalización..."
if [[ -n $(git status -s) ]]; then
  git commit -m "chore: normalize line endings to LF

- Add .gitattributes to enforce LF on all platforms
- Add .editorconfig for editor consistency
- Normalize all existing files to LF
- Configure Git to use core.eol=lf

This prevents CRLF/LF conflicts between macOS and Windows developers."
  echo "   ✅ Commit creado"
else
  echo "   ℹ️  No hay cambios para commitear (archivos ya estaban en LF)"
fi
echo ""

echo "=========================================="
echo "✅ ¡Normalización completada!"
echo ""
echo "Próximos pasos:"
echo "1. Hacer push: git push origin $(git branch --show-current)"
echo "2. Notificar al equipo que hagan: git pull --rebase"
echo "3. Ambos deben ejecutar: git config core.autocrlf false"
echo ""
echo "A partir de ahora, todos los archivos usarán LF automáticamente."
echo "=========================================="
