#!/bin/bash
set -e

echo "Waiting for MySQL..."
while ! nc -z mysql 3306; do
  sleep 0.1
done
echo "MySQL started"

# 追加の待機時間（MySQLが完全に準備できるまで）
sleep 2

echo "Running migrations..."

# 初回のみマイグレーションファイルを作成
if [ ! -f "/app/api/migrations/0001_initial.py" ]; then
  echo "Creating initial migrations..."
  python manage.py makemigrations api --noinput
fi

python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || true

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000