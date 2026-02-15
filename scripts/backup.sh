#!/bin/bash

# =============================================================
# Script de Backup Automático - Sistema Logístico
# Hace backup de PostgreSQL y MongoDB
# Uso: bash backup.sh
# Cron sugerido: 0 2 * * * /path/to/backup.sh
# =============================================================

set -e

BACKUP_DIR="./backups/$(date +%Y-%m-%d)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Configuración (sobreescribir con variables de entorno si existen)
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-logistics_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-logistics_pass}"
POSTGRES_DB="${POSTGRES_DB:-logistics_db}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/logistics_tracking}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

echo "========================================"
echo " Backup iniciado: $TIMESTAMP"
echo "========================================"

# ---- PostgreSQL Backup ----
echo "[1/3] Haciendo backup de PostgreSQL..."
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -F c \
  -f "$BACKUP_DIR/postgres_${TIMESTAMP}.dump"

if [ $? -eq 0 ]; then
  echo "  ✔ PostgreSQL backup exitoso: postgres_${TIMESTAMP}.dump"
else
  echo "  ✘ ERROR en backup de PostgreSQL"
  exit 1
fi

# ---- MongoDB Backup ----
echo "[2/3] Haciendo backup de MongoDB..."
mongodump \
  --uri="$MONGO_URI" \
  --out="$BACKUP_DIR/mongo_${TIMESTAMP}" \
  --quiet

if [ $? -eq 0 ]; then
  # Comprimir el directorio
  tar -czf "$BACKUP_DIR/mongo_${TIMESTAMP}.tar.gz" -C "$BACKUP_DIR" "mongo_${TIMESTAMP}"
  rm -rf "$BACKUP_DIR/mongo_${TIMESTAMP}"
  echo "  ✔ MongoDB backup exitoso: mongo_${TIMESTAMP}.tar.gz"
else
  echo "  ✘ ERROR en backup de MongoDB"
  exit 1
fi

# ---- Limpiar backups viejos ----
echo "[3/3] Limpiando backups con más de $KEEP_DAYS días..."
find ./backups -type d -mtime +$KEEP_DAYS -exec rm -rf {} + 2>/dev/null || true
echo "  ✔ Limpieza completada"

echo "========================================"
echo " Backup completado exitosamente"
echo " Ubicación: $BACKUP_DIR"
echo "========================================"
