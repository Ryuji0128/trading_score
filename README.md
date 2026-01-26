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
| nginx | nginx_proxy | 80:80 | リバースプロキシ |

### アーキテクチャ

```
[ブラウザ] → [nginx:80] → [next:3000] (フロントエンド)
                       → [django:8000/api] (API)
                              ↓
                         [mysql:3306]
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
│   └── default.conf.template
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

## 注意事項

- スクレイピングはToppsサイトのCloudflare対策のため、各リクエスト間に待機時間を設けています
- 大量のカードを処理する場合は時間がかかります（1件あたり約7秒）
- `.env` ファイルを変更した場合、`docker restart` ではなく `docker compose up -d` で再作成が必要です
