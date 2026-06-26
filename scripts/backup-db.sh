#!/bin/bash
set -euo pipefail

BACKUP_DIR="/home/site/ai-chatbot/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ai_chat_bot_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "[$(date -Iseconds)] Starting database backup..."

# Ensure postgres container is running
if ! docker ps --format '{{.Names}}' | grep -q '^ai_chat_bot_postgres$'; then
    echo "[$(date -Iseconds)] ERROR: postgres container is not running" >&2
    exit 1
fi

# Dump all databases from the postgres container
docker exec ai_chat_bot_postgres pg_dumpall -U postgres | gzip > "${BACKUP_FILE}"

echo "[$(date -Iseconds)] Backup created: ${BACKUP_FILE}"

# Rotate backups older than RETENTION_DAYS
DELETED=$(find "${BACKUP_DIR}" -type f -name '*.sql.gz' -mtime +${RETENTION_DAYS} -print -delete)
if [ -n "${DELETED}" ]; then
    echo "[$(date -Iseconds)] Rotated old backups:"
    echo "${DELETED}"
else
    echo "[$(date -Iseconds)] No old backups to rotate."
fi

echo "[$(date -Iseconds)] Backup finished."
