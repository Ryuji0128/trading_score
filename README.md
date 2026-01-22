# MLB Trading Card Database (Topps NOW)

MLBトレーディングカード（Topps NOW）のデータベースアプリケーション。

## 概要

Topps NOW カードの情報を管理・閲覧するためのフルスタックアプリケーション。
- **フロントエンド**: Next.js 15 (App Router) + React 19 + MUI
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
# http://localhost:80 (Nginx経由)
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

### カードデータ管理

- Topps NOW カード情報の登録・編集・削除
- 選手・チーム情報との連携
- 発行日（release_date）の自動取得

### データスクレイピング

Topps公式サイトからカード情報を自動取得するDjango管理コマンド:

```bash
# Topps NOW アーカイブからカード情報をスクレイピング
docker compose exec django python manage.py toppsNow_archive --max-cards 100

# 商品URLを生成
docker compose exec django python manage.py generate_product_urls

# 発行日をスクレイピング
docker compose exec django python manage.py scrape_release_dates --limit 100 --delay 5
```

### MLB Stats API 連携

MLB公式API（MLB-StatsAPI）を使用して選手成績・試合情報を取得:

```bash
# 選手名からMLB Player IDを取得・紐付け
docker compose exec django python manage.py sync_mlb_players --limit 0

# 選手の打撃・投球成績を取得
docker compose exec django python manage.py fetch_player_stats --season 2025 --limit 0

# カードの試合日からMLB Game IDを取得・紐付け
docker compose exec django python manage.py fetch_game_ids --limit 0
```

### 共通オプション

```bash
#   --dry-run   実際に保存せず確認のみ
#   --limit N   処理するカード数（0で全件）
#   --force     既存データも上書き
#   --delay N   リクエスト間隔（秒）
```

## 開発コマンド

```bash
# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f django

# Djangoマイグレーション作成
docker compose exec django python manage.py makemigrations

# Djangoマイグレーション適用
docker compose exec django python manage.py migrate

# Django管理シェル
docker compose exec django python manage.py shell

# コンテナ再ビルド
docker compose up -d --build
```

## ディレクトリ構成

```
trading_score/
├── docker-compose.yml
├── nginx/
│   └── default.conf.template
├── mysql/
│   └── data/                   # MySQLデータ（gitignore）
├── django/
│   ├── Dockerfile
│   ├── .env
│   ├── manage.py
│   ├── config/                 # Django設定
│   ├── api/
│   │   ├── models.py           # データモデル
│   │   ├── views.py            # APIエンドポイント
│   │   ├── serializers.py
│   │   └── management/
│   │       └── commands/       # 管理コマンド
│   │           ├── toppsNow_archive.py
│   │           ├── scrape_release_dates.py
│   │           └── ...
│   └── json/                   # 初期データ
└── next/
    ├── Dockerfile
    ├── .env
    └── src/
        ├── app/                # ページ
        │   └── topps-now/
        └── components/
```

## データモデル

### ToppsCard（カード）

| フィールド | 型 | 説明 |
|-----------|------|------|
| topps_set | FK | カードセット |
| player | FK | 選手 |
| team | FK | チーム |
| card_number | CharField | カード番号 |
| title | CharField | タイトル |
| total_print | Integer | 発行枚数 |
| image_url | CharField | 画像URL |
| product_url | CharField | Topps商品ページURL（短） |
| product_url_long | CharField | Topps商品ページURL（長） |
| release_date | DateField | 発行日 |
| mlb_game_id | Integer | MLB Game ID（試合ページへのリンク用） |

### Player（選手）

| フィールド | 型 | 説明 |
|-----------|------|------|
| full_name | CharField | 氏名 |
| first_name | CharField | 名 |
| last_name | CharField | 姓 |
| team | FK | 所属チーム |
| jersey_number | Integer | 背番号 |
| position | CharField | ポジション |
| mlb_player_id | Integer | MLB Stats API 選手ID |

### PlayerStats（選手成績）

| フィールド | 型 | 説明 |
|-----------|------|------|
| player | FK | 選手 |
| season | Integer | シーズン年 |
| stat_type | CharField | 成績タイプ（hitting/pitching） |
| games | Integer | 試合数 |
| batting_avg | Decimal | 打率 |
| home_runs | Integer | 本塁打 |
| rbi | Integer | 打点 |
| era | Decimal | 防御率 |
| wins | Integer | 勝利数 |
| strikeouts | Integer | 奪三振 |
| ... | | その他多数の成績フィールド |

### 関連モデル

- **ToppsSet**: カードセット（年度・シリーズ）
- **Team**: MLBチーム（30チーム、mlb_team_id連携）
- **ToppsCardVariant**: カードバリエーション（パラレル等）

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/topps-cards/ | カード一覧取得 |
| GET | /api/topps-cards/{id}/ | カード詳細取得 |
| GET | /api/players/{id}/ | 選手詳細取得（成績含む） |
| GET | /api/mlb/game/ | MLB Game ID取得（team_id, date指定） |

## 技術スタック

### フロントエンド
- TypeScript
- React 19
- Next.js 15 (App Router)
- MUI (Material UI)

### バックエンド
- Python 3.11
- Django 5.0
- Django REST Framework
- Selenium（スクレイピング用）

### データベース
- MySQL 8.0

### インフラ
- Docker / Docker Compose
- Nginx

## 注意事項

- スクレイピングはToppsサイトのCloudflare対策のため、各リクエスト間に待機時間を設けています
- 大量のカードを処理する場合は時間がかかります（1件あたり約7秒）
