# MLB Note

個人的にMLBの気になるデータをまとめた個人サイト。

## 概要

Topps NOW カード情報、WBCデータ、MLB順位表・試合結果などを一覧できるフルスタックアプリケーション。

- **フロントエンド**: Next.js 15 (App Router) + React 19 + MUI + SWR
- **バックエンド**: Django REST Framework + MySQL 8.0
- **インフラ**: Docker Compose + Nginx

## クイックスタート

### 必要条件

- Docker
- Docker Compose

### セットアップ

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd trading_score

# 2. 環境変数ファイルを配置
cp next/.env.example next/.env
cp django/.env.example django/.env

# 3. Docker環境を起動
docker compose up -d

# 4. Djangoマイグレーション
docker compose exec django python manage.py migrate

# 5. ブラウザでアクセス
# http://192.168.11.22 (Nginx経由)
```

## Docker環境の構成

| サービス | コンテナ名 | ポート | 説明 |
|---------|-----------|--------|------|
| next | next_app | 2999:3000 | Next.jsフロントエンド |
| django | django_app | 8000 | Django REST API |
| mysql | mysql_db | 3306 | MySQL 8.0 データベース |
| nginx | nginx_proxy | 80, 443 | リバースプロキシ (HTTP/HTTPS) |
| scheduler | scheduler | - | 定期バッチ処理（APScheduler） |
| certbot | certbot | - | SSL証明書自動更新 |

### アーキテクチャ

```
[ブラウザ] → [nginx:80/443] → [next:3000] (フロントエンド)
                           → [django:8000/api] (API)
                                  ↓
                             [mysql:3306]

[scheduler] → [django management commands] → [mysql:3306]
[certbot] → 12時間ごとにSSL証明書の更新チェック
```

## 主要機能

### ページ一覧

| パス | 内容 |
|------|------|
| `/` | TOPページ（ブログ最新記事・最新Toppsカード） |
| `/topps-now` | Topps NOW カード一覧・管理（DataGrid） |
| `/blog` | ブログ記事一覧 |
| `/blog/[id]` | ブログ記事詳細（認証ユーザーのみ編集可） |
| `/wbc` | WBCトーナメントデータ |
| `/games` | 直近7日間のMLB試合結果 |
| `/teams` | MLBチーム一覧 |
| `/teams/[id]` | チーム詳細・ロースター |
| `/stats` | MLB順位表（リーグ・シーズン切替） |
| `/description` | このサイトについて |
| `/contact` | お問い合わせ |
| `/login` | ログイン |

### Topps NOW カード管理

- カード情報の登録・編集（DataGrid上でインライン編集）
- 選手・チーム情報との連携
- 発行日（release_date）の自動取得
- MLB Game IDとの紐付け

### WBC データ

- WBCトーナメント情報の表示
- 出場選手リスト

### ブログ

- 記事の作成・編集（認証ユーザーのみ）
- Markdown対応

### MLB Stats API 連携

MLB公式API（statsapi.mlb.com）からリアルタイムデータを取得:
- 順位表（レギュラーシーズン）
- 直近の試合結果
- チーム一覧・ロースター

## Django管理コマンド

### 初期セットアップ

```bash
# MLBチーム情報の同期（30チーム）
docker compose exec django python manage.py sync_mlb_teams
```

### データ同期

```bash
# Topps NOWカード情報のスクレイピング
docker compose exec django python manage.py toppsNow_archive --max-cards 100

# 選手名→MLB Player ID紐付け
docker compose exec django python manage.py sync_mlb_players --limit 0

# 選手の打撃・投球成績を取得
docker compose exec django python manage.py fetch_player_stats --season 2025 --limit 0

# 選手の国籍を取得
docker compose exec django python manage.py fetch_player_nationality --limit 0

# カードの発行日からMLB Game IDを紐付け
docker compose exec django python manage.py fetch_game_ids --limit 0

# WBCトーナメントデータ取得
docker compose exec django python manage.py fetch_wbc_data

# WBC出場選手の紐付け
docker compose exec django python manage.py fetch_wbc_players
```

### URL管理

```bash
# 商品URLを生成
docker compose exec django python manage.py generate_product_urls

# 全URLを再生成
docker compose exec django python manage.py regenerate_product_urls

# 長いURLを短縮
docker compose exec django python manage.py shorten_product_urls

# 404 URLを修正
docker compose exec django python manage.py fix_broken_urls
```

### スクレイピング

```bash
# カード画像URLを取得
docker compose exec django python manage.py scrape_card_images

# 発行日をスクレイピング
docker compose exec django python manage.py scrape_release_dates --limit 100 --delay 5
```

### メンテナンス

```bash
# タイトル整理
docker compose exec django python manage.py clean_topps_titles

# カード→チーム紐付け
docker compose exec django python manage.py update_card_teams
```

### 共通オプション

```bash
#   --dry-run   実際に保存せず確認のみ
#   --limit N   処理するカード数（0で全件）
#   --force     既存データも上書き
#   --delay N   リクエスト間隔（秒）
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/topps-cards/ | カード一覧取得 |
| GET | /api/topps-cards/{id}/ | カード詳細取得 |
| GET | /api/players/{id}/ | 選手詳細取得（成績含む） |
| GET | /api/teams/ | チーム一覧 |
| GET | /api/blogs/ | ブログ記事一覧 |
| GET | /api/blogs/{id}/ | ブログ記事詳細 |
| GET | /api/wbc-tournaments/ | WBCトーナメント一覧 |
| GET | /api/mlb/game/ | MLB Game ID取得（team_id, date指定） |
| POST | /api/auth/login/ | ログイン（JWT取得） |
| POST | /api/auth/register/ | ユーザー登録 |
| POST | /api/auth/token/refresh/ | トークンリフレッシュ |
| GET | /api/auth/me/ | ログインユーザー情報 |
| POST | /api/inquiries/ | お問い合わせ送信 |

## ディレクトリ構成

```
trading_score/
├── docker-compose.yml
├── nginx/
│   └── default.conf.template    # Nginx設定（HTTPS/レート制限）
├── certbot/
│   ├── conf/                    # SSL証明書（gitignore）
│   └── www/                     # ACME challenge用
├── mysql/
│   └── data/                      # MySQLデータ（gitignore）
├── django/
│   ├── Dockerfile
│   ├── .env
│   ├── manage.py
│   ├── config/                    # Django設定
│   └── api/
│       ├── models.py              # データモデル
│       ├── views.py               # APIエンドポイント
│       ├── serializers.py
│       ├── urls.py
│       └── management/commands/   # 管理コマンド（21個）
└── next/
    ├── Dockerfile
    ├── .env
    └── src/
        ├── app/                   # ページ（App Router）
        │   ├── page.tsx           # TOPページ
        │   ├── layout.tsx         # 共通レイアウト
        │   ├── topps-now/         # Topps NOWカード管理
        │   ├── blog/              # ブログ
        │   ├── wbc/               # WBCデータ
        │   ├── games/             # 試合結果
        │   ├── teams/             # チーム一覧・詳細
        │   ├── stats/             # 順位表
        │   ├── description/       # サイト説明
        │   ├── contact/           # お問い合わせ
        │   └── login/             # ログイン
        ├── components/            # 共通コンポーネント
        │   ├── MLBLayout.tsx      # メインレイアウト
        │   ├── Header.tsx
        │   ├── Footer.tsx
        │   └── MLBSidebar.tsx
        └── lib/                   # 共通ユーティリティ
            ├── constants.ts       # 定数（カラー、表示件数、API URL等）
            ├── auth.ts            # 認証ヘルパー（トークン管理）
            ├── utils.ts           # 日付フォーマット等
            ├── fetcher.ts         # SWR用fetcher関数
            └── types/             # TypeScript型定義
                ├── index.ts
                ├── api.ts
                ├── topps.ts
                ├── wbc.ts
                ├── stats.ts
                └── blog.ts
```

## 技術スタック

### フロントエンド
- TypeScript
- React 19
- Next.js 15 (App Router)
- MUI (Material UI) + MUI X DataGrid
- SWR（データフェッチ・キャッシュ）

### バックエンド
- Python 3.11
- Django 5.0
- Django REST Framework
- Simple JWT（認証）
- Selenium（スクレイピング用）

### データベース
- MySQL 8.0

### インフラ
- Docker / Docker Compose
- Nginx（リバースプロキシ）
- GitHub Actions（CI/CD）

## 本番デプロイ

### GitHub Actions による自動デプロイ

PRがmainにマージされるか、手動でworkflow_dispatchを実行すると自動デプロイが行われます。

### 本番環境のセットアップ

1. **本番サーバーでリポジトリをクローン**
```bash
cd ~
git clone git@github.com:ryuji0128/trading_score.git
cd trading_score
```

2. **環境変数ファイルを作成**

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
DATABASE_URL=mysql://app_user:<パスワード>@mysql:3306/app_db
NEXT_PUBLIC_BASE_URL=https://baseball-now.com
NEXT_PUBLIC_SITE_URL=https://baseball-now.com

STRIPE_SECRET_KEY=<本番用Stripeキー>

CONTACT_TO_EMAIL=info@setaseisakusyo.com
SMTP_HOST=mail1042.onamae.ne.jp
SMTP_PORT=465
SMTP_USER=info@setaseisakusyo.com
SMTP_PASS=<SMTPパスワード>
```

3. **シークレットキー生成**
```bash
# Django SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Next.js AUTH_SECRET
openssl rand -base64 32
```

### GitHub Secrets の設定

リポジトリ → Settings → Secrets and variables → Actions で以下を設定:

| Secret名 | 説明 |
|----------|------|
| `SSH_HOST` | 本番サーバーのIPアドレス |
| `SSH_PORT` | SSHポート（通常22） |
| `SSH_USERNAME` | ログインユーザー名 |
| `SSH_SECRET_KEY` | SSH秘密鍵 |
| `GH_PAT` | GitHub Personal Access Token（packages:read権限） |
| `GH_USERNAME` | GitHubユーザー名 |
| `AUTH_SECRET` | Next.js認証用シークレット |

### SSL証明書のセットアップ（HTTPS）

Let's Encrypt を使用して無料のSSL証明書を取得します。

```bash
# 1. certbot用ディレクトリを作成
mkdir -p certbot/conf certbot/www

# 2. ダミー証明書を作成（Nginx起動用）
mkdir -p certbot/conf/live/baseball-now.com
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
  -keyout certbot/conf/live/baseball-now.com/privkey.pem \
  -out certbot/conf/live/baseball-now.com/fullchain.pem \
  -subj '/CN=localhost'

# 3. 環境変数を設定
export SERVER_NAME=baseball-now.com

# 4. 全サービスを起動
docker compose up -d

# 5. ダミー証明書を削除
sudo rm -rf certbot/conf/live/baseball-now.com

# 6. 本物のSSL証明書を取得
docker compose run --rm --entrypoint "" certbot certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d baseball-now.com

# 7. Nginxを再起動して証明書を適用
docker compose restart nginx

# 8. HTTPS接続を確認
curl -I https://baseball-now.com
```

**証明書の自動更新**: certbotコンテナが12時間ごとに証明書の更新をチェックします。手動での更新は不要です。

### 本番環境の起動

```bash
# 手動起動（初回）
docker compose -f docker-compose.prod.yml up -d

# マイグレーション
docker compose -f docker-compose.prod.yml exec django python manage.py migrate
```

### Docker Compose ファイル

| ファイル | 用途 |
|----------|------|
| `docker-compose.yml` | 開発環境（ローカルビルド） |
| `docker-compose.override.yml` | 開発用オーバーライド（ホットリロード） |
| `docker-compose.prod.yml` | 本番環境（GitHub Container Registryからpull） |

## 開発コマンド

```bash
# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f django

# Djangoマイグレーション
docker compose exec django python manage.py makemigrations
docker compose exec django python manage.py migrate

# コンテナ再ビルド（コード変更後）
docker compose up -d --build

# 環境変数変更後（.env変更時はupで再作成が必要）
docker compose up -d django
```

## セキュリティ

### HTTPS/SSL設定

- **Let's Encrypt**: 無料SSL証明書（自動更新）
- **TLS 1.2/1.3**: 最新のセキュアなプロトコルのみ対応
- **HSTS**: HTTP Strict Transport Security 有効
- **OCSP Stapling**: 証明書検証の高速化

### Nginx セキュリティヘッダー

`nginx/default.conf.template`で以下を設定済み:

| ヘッダー | 説明 |
|---------|------|
| `X-Frame-Options: SAMEORIGIN` | クリックジャッキング対策 |
| `X-Content-Type-Options: nosniff` | MIMEタイプスニッフィング防止 |
| `X-XSS-Protection: 1; mode=block` | XSS攻撃防止 |
| `Referrer-Policy: strict-origin-when-cross-origin` | リファラー制御 |
| `Content-Security-Policy` | CSP（スクリプト・スタイル制御） |
| `server_tokens off` | Nginxバージョン非表示 |

### 不正アクセス対策

- **レート制限**: API・ログイン・一般リクエストに制限を設定
- **不正ホストブロック**: 許可されたドメイン以外からのリクエストを拒否（444応答）
- **ハニーポット**: スキャナーを検知するダミーエンドポイント

### fail2ban

SSH/Nginxへの不正アクセス対策:

```bash
# 設定ファイルをコピー
sudo cp fail2ban/jail.local /etc/fail2ban/
sudo cp fail2ban/filter.d/* /etc/fail2ban/filter.d/

# 再起動
sudo systemctl restart fail2ban

# 状態確認
sudo fail2ban-client status
```

設定内容:
- SSH: 3回失敗で24時間BAN
- Nginx: レート制限違反・ボット検出で1時間BAN

### logwatch

日次ログレポート:

```bash
# 設定ファイルをコピー
sudo cp logwatch/logwatch.conf /etc/logwatch/conf/

# テスト実行
sudo logwatch --output stdout
```

## 運用スクリプト

`scripts/`ディレクトリに運用スクリプトを配置:

| スクリプト | 説明 |
|-----------|------|
| `renew-ssl.sh` | SSL証明書の更新 |
| `backup-db.sh` | DBバックアップ（7日間保持） |
| `monitor.sh` | サービス死活監視 |
| `setup-monitoring.sh` | 監視環境セットアップ |

### 初回セットアップ

```bash
cd ~/trading_score/scripts
./setup-monitoring.sh
```

これにより以下のcronジョブが設定されます:
- SSL更新: 毎日3:00
- DBバックアップ: 毎日2:00
- 死活監視: 5分ごと

### 手動実行

```bash
# SSL証明書更新
./scripts/renew-ssl.sh

# DBバックアップ
./scripts/backup-db.sh

# 死活監視
./scripts/monitor.sh
```

## 注意事項

- スクレイピングはToppsサイトのCloudflare対策のため、各リクエスト間に待機時間を設けています
- 大量のカードを処理する場合は時間がかかります（1件あたり約7秒）
- `.env` ファイルを変更した場合、`docker restart` ではなく `docker compose up -d` で再作成が必要です

## 免責事項・利用規約

### データについて

- 本サイトで公開しているTopps NOWカードのデータは、個人が独自に収集・整理したものです
- **Topps社、MLB、その他公式機関とは一切関係ありません**
- データの正確性・完全性は保証しません
- 最新・正確な情報は各公式サイトをご確認ください

### 商標について

- 「Topps」「Topps NOW」はTopps Company, Inc.の商標です
- 「MLB」「Major League Baseball」はMLB Advanced Media, L.P.の商標です
- その他、本サイトに掲載されている商標は各権利者に帰属します

### 免責

- 本サイトの利用により生じた損害について、運営者は一切の責任を負いません
- 本サイトの内容は予告なく変更・削除される場合があります
