#!/usr/bin/env bash
# ==============================================================================
# SNMR FAB INDIA PRIVATE LIMITED - Database Automatic Backup Script (Linux/Docker)
# Schedule with cron: 0 2 * * * /path/to/backup_db.sh >> /var/log/snmr_backup.log 2>&1
# ==============================================================================

set -euo pipefail

export PGUSER="${PGUSER:-hrms_admin}"
export PGPASSWORD="${PGPASSWORD:-hrms_password}"
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5433}"
export PGDATABASE="${PGDATABASE:-hrms_db}"

BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/snmr_hrms_backup_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting PostgreSQL backup for SNMR FAB INDIA..."
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"

# Retention policy: Remove backup archives older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete
echo "[$(date)] Old backups purged (>7 days)."
