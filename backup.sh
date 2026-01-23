#!/bin/bash
# MySQLデータベースバックアップスクリプト
# 使い方: ./backup.sh [--gz]

BACKUP_DIR="$(dirname "$0")/backups"
FILENAME="backup_$(date +%Y%m%d_%H%M%S).sql"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

docker exec mysql_db mysqldump -u root -proot app_db > "$FILEPATH" 2>/dev/null

if [ $? -eq 0 ]; then
    if [ "$1" = "--gz" ]; then
        gzip "$FILEPATH"
        FILEPATH="${FILEPATH}.gz"
    fi
    SIZE=$(du -h "$FILEPATH" | cut -f1)
    echo "バックアップ完了: ${FILEPATH} (${SIZE})"
else
    echo "エラー: バックアップに失敗しました" >&2
    exit 1
fi
