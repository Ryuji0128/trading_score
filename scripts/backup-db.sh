#!/bin/bash
# Database Backup Script for trading_score

set -e

BACKUP_DIR="/home/$(whoami)/backups/mysql"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/trading_score_$TIMESTAMP.sql.gz"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo "$(date): Starting database backup..."

# Dump database from Docker container
docker exec mysql_db mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" app_db | gzip > "$BACKUP_FILE"

echo "$(date): Backup created: $BACKUP_FILE"

# Remove old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "$(date): Old backups cleaned up (retention: $RETENTION_DAYS days)"
echo "$(date): Backup completed successfully"
