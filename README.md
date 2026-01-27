# MLB Note

個人的にMLBの気になるデータをまとめた個人サイト。

**URL**: https://baseball-now.com

## 概要

Topps NOW カード情報、WBCデータ、MLB順位表・試合結果などを一覧できるフルスタックアプリケーション。

| 技術 | 詳細 |
|-----|------|
| フロントエンド | Next.js 15 (App Router) + React 19 + MUI + SWR |
| バックエンド | Django REST Framework + MySQL 8.0 |
| インフラ | Docker Compose + Nginx + Let's Encrypt |

## クイックスタート

```bash
# 1. リポジトリをクローン
git clone git@github.com:ryuji0128/trading_score.git
cd trading_score

# 2. 環境変数ファイルを配置
cp next/.env.example next/.env
cp django/.env.example django/.env

# 3. Docker環境を起動
docker compose up -d

# 4. ブラウザでアクセス
# http://localhost (Nginx経由)
```

## 開発時の注意

### Next.js ビルド

Next.js のビルドは `NODE_ENV=production` で実行する必要があります。
`NODE_ENV=development` でビルドすると、Pages Router 互換コードでエラーが発生します。

```bash
# 開発サーバー起動（NODE_ENV=development）
docker compose exec next yarn dev

# 本番ビルド（NODE_ENV=production が自動設定される）
docker compose exec next yarn build
```

※ `package.json` の `build` スクリプトと `Dockerfile` で `NODE_ENV=production` が設定済みです。

## アーキテクチャ

```
[ブラウザ] → [nginx:80/443] → [next:3000] (フロントエンド)
                           → [django:8000/api] (API)
                                  ↓
                             [mysql:3306]

[scheduler] → 毎日07:00にデータ同期バッチ実行
[certbot] → 12時間ごとにSSL証明書の更新チェック
```

| サービス | 説明 |
|---------|------|
| nginx | リバースプロキシ (HTTP/HTTPS) |
| next | Next.js フロントエンド |
| django | Django REST API |
| mysql | MySQL 8.0 データベース |
| scheduler | 定期バッチ処理（APScheduler） |
| certbot | SSL証明書自動更新 |

## ページ一覧

| パス | 内容 |
|------|------|
| `/` | TOPページ（ブログ最新記事・最新Toppsカード） |
| `/topps-now` | Topps NOW カード一覧（DataGrid） |
| `/blog` | ブログ記事一覧 |
| `/blog/[id]` | ブログ記事詳細 |
| `/wbc` | WBCトーナメントデータ |
| `/games` | 直近7日間のMLB試合結果 |
| `/teams` | MLBチーム一覧 |
| `/teams/[id]` | チーム詳細・ロースター |
| `/stats` | MLB順位表 |
| `/description` | このサイトについて |
| `/contact` | お問い合わせ |
| `/login` | ログイン |

## Django 管理コマンド

### データ同期（日次バッチで自動実行）

```bash
# Topps NOWカード情報のスクレイピング
docker compose exec django python manage.py toppsNow_archive --max-cards 100

# 選手名→MLB Player ID紐付け
docker compose exec django python manage.py sync_mlb_players --limit 0

# 選手の打撃・投球成績を取得
docker compose exec django python manage.py fetch_player_stats --season 2025 --limit 0
```

### 共通オプション

```
--dry-run   実際に保存せず確認のみ
--limit N   処理するカード数（0で全件）
--force     既存データも上書き
--delay N   リクエスト間隔（秒）
```

## 本番デプロイ

### 環境変数

`~/trading_score/.env`:
```bash
MYSQL_ROOT_PASSWORD=<rootパスワード>
MYSQL_DATABASE=app_db
MYSQL_USER=app_user
MYSQL_PASSWORD=<本番用パスワード>
SERVER_NAME=baseball-now.com
```

`~/trading_score/django/.env`:
```bash
SECRET_KEY=<強力なランダム文字列>
DEBUG=False
ALLOWED_HOSTS=baseball-now.com,www.baseball-now.com,django
CORS_ALLOWED_ORIGINS=https://baseball-now.com,https://www.baseball-now.com
DB_ENGINE=django.db.backends.mysql
DB_NAME=app_db
DB_USER=app_user
DB_PASSWORD=<本番用パスワード>
DB_HOST=mysql
DB_PORT=3306
```

`~/trading_score/next/.env`:
```bash
INTERNAL_API_URL=http://django:8000/api
AUTH_SECRET=<本番用シークレット>
NEXTAUTH_URL=https://baseball-now.com
NEXT_PUBLIC_BASE_URL=https://baseball-now.com
```

### SSL証明書のセットアップ（初回のみ）

```bash
# 1. ディレクトリ作成
mkdir -p certbot/conf certbot/www nginx/logs

# 2. ダミー証明書を作成（Nginx起動用）
mkdir -p certbot/conf/live/baseball-now.com
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
  -keyout certbot/conf/live/baseball-now.com/privkey.pem \
  -out certbot/conf/live/baseball-now.com/fullchain.pem \
  -subj '/CN=localhost'

# 3. 全サービスを起動
docker compose -f docker-compose.prod.yml up -d

# 4. ダミー証明書を削除
sudo rm -rf certbot/conf/live/baseball-now.com

# 5. 本物のSSL証明書を取得
docker compose run --rm --entrypoint "" certbot certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email k_ryuji@setaseisakusyo.com \
  --agree-tos --no-eff-email \
  -d baseball-now.com

# 6. Nginxを再起動
docker compose restart nginx
```

### GitHub Actions 自動デプロイ

PRが `main` にマージされると自動デプロイが実行されます。

必要な Secrets:
- `SSH_HOST`, `SSH_PORT`, `SSH_USERNAME`, `SSH_SECRET_KEY`
- `GH_PAT`, `GH_USERNAME`, `AUTH_SECRET`

## セキュリティ

### 実装済みの対策

| 項目 | 内容 |
|------|------|
| HTTPS | Let's Encrypt（TLS 1.2/1.3） |
| セキュリティヘッダー | X-Frame-Options, CSP, HSTS 等 |
| レート制限 | Nginx で API・ログイン制限 |
| 不正ホストブロック | 許可ドメイン以外を拒否（444応答） |
| fail2ban | SSH/Nginx 不正アクセスを自動BAN |

### fail2ban セットアップ

```bash
sudo apt install -y fail2ban
sudo cp fail2ban/jail.local /etc/fail2ban/
sudo cp fail2ban/filter.d/* /etc/fail2ban/filter.d/
sudo systemctl enable fail2ban && sudo systemctl start fail2ban
```

## 運用

### DBバックアップ

```bash
./scripts/backup-db.sh
```

### 監視セットアップ（cron設定）

```bash
./scripts/setup-monitoring.sh
```

設定される cron:
- DBバックアップ: 毎日 02:00
- SSL更新チェック: 毎日 03:00
- 死活監視: 5分ごと

## 免責事項

- 本サイトのデータは個人が独自に収集・整理したものです
- **Topps社、MLB、その他公式機関とは一切関係ありません**
- データの正確性・完全性は保証しません
- 「Topps」「Topps NOW」はTopps Company, Inc.の商標です
- 「MLB」はMLB Advanced Media, L.P.の商標です
