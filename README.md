#瀬田製作所 ホームページ



## 概要

瀬田製作所のホームページプロジェクト。[Next.js 15](https://nextjs.org/)をベースに構築し、App Routerを採用。React、MUIを中心としたフロントエンド技術を使用。

## 目次

- [クイックスタート](#クイックスタート)
- [Docker環境の構成](#docker環境の構成)
- [環境変数の設定](#環境変数の設定)
- [開発コマンド](#開発コマンド)
- [本番デプロイ](#本番デプロイ)
- [主要技術スタック](#主要技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [開発ルール](#開発ルール)
- [DB運用](#db運用)
- [その他設定](#その他設定)

## クイックスタート

### 必要条件

- Docker
- Docker Compose

### セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/Ryuji0128/seta-hp.git
cd seta-hp

# 2. 環境変数ファイルを配置
cp next/.env.example next/.env
# .envファイルを編集して必要な値を設定

# 3. Docker環境を起動
docker compose up -d

# 4. ブラウザでアクセス
# http://localhost:80 (Nginx経由)
# http://localhost:2999 (Next.js直接)
```

### 停止

```bash
docker compose down
```

## Docker環境の構成

| サービス | コンテナ名 | ポート | 説明 |
|---------|-----------|--------|------|
| next | next_app | 2999:3000 | Next.jsアプリケーション |
| mysql | mysql_db | 3306 | MySQL 8.0 データベース |
| nginx | nginx_proxy | 80:80 | リバースプロキシ |

### アーキテクチャ

```
[ブラウザ] → [nginx:80] → [next:3000] → [mysql:3306]
```

## 環境変数の設定

`next/.env`ファイルに以下を設定：

```env
# 認証
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:2999

# データベース
DATABASE_URL=mysql://app_user:app_pass@mysql:3306/app_db

# Google OAuth（オプション）
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

## 開発コマンド

```bash
# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f        # 全コンテナ
docker compose logs -f next   # Next.jsのみ

# コンテナ再ビルド（Dockerfile変更時）
docker compose up -d --build

# Prismaマイグレーション
docker compose exec next npx prisma migrate dev

# Prismaクライアント再生成
docker compose exec next npx prisma generate

# コンテナ内でシェル実行
docker compose exec next sh
```

## 本番デプロイ

GitHub Actionsによる自動デプロイ：

1. `develop` → `main` へのPRをマージ
2. 自動的にテスト実行
3. テスト成功後、本番サーバーへSSHデプロイ

### 手動デプロイ

```bash
ssh your-server
cd ~/seta-hp
git pull origin main
docker compose up -d --build
docker compose exec next npx prisma migrate deploy
```

## 主要技術スタック

### フロントエンド
- TypeScript
- React 19
- Next.js 15 (App Router)
- MUI (Material UI)
- Tailwind CSS
- Framer Motion

### バックエンド
- Next.js API Routes
- Prisma ORM
- Auth.js (NextAuth)
- MySQL 8.0

### インフラ
- Docker / Docker Compose
- Nginx
- GitHub Actions (CI/CD)
- Google Cloud Platform (本番)

## ディレクトリ構成

```
seta-hp/
├── docker-compose.yml      # Docker Compose設定
├── nginx/
│   └── default.conf        # Nginx設定
├── mysql/
│   └── data/               # MySQLデータ（gitignore）
└── next/
    ├── Dockerfile          # Next.jsコンテナ設定
    ├── .env                # 環境変数（gitignore）
    ├── .env.example        # 環境変数テンプレート
    ├── prisma/
    │   ├── schema.prisma   # DBスキーマ定義
    │   └── migrations/     # マイグレーション履歴
    └── src/
        ├── app/            # ページ・APIルート
        ├── components/     # 共通コンポーネント
        ├── lib/            # ユーティリティ
        └── theme/          # MUIテーマ設定
```

## 開発ルール

### ブランチ運用

- `main` - 本番環境
- `develop` - 開発統合ブランチ
- `feature/*` - 新機能開発
- `fix/*` - バグ修正

### ブランチ命名規則

```
feature/0034_create-top-page
fix/0035_login-error
```

### プルリクエスト

1. `develop`から作業ブランチを作成
2. 実装・コミット
3. `develop`へPR作成
4. レビュー後マージ
5. `develop` → `main`へPRでリリース

## DB運用

### スキーマ変更時

```bash
# 1. schema.prismaを編集

# 2. マイグレーション作成
docker compose exec next npx prisma migrate dev --name your_migration_name

# 3. クライアント再生成（自動で実行されるが念のため）
docker compose exec next npx prisma generate
```

### トラブルシューティング

```bash
# Prismaキャッシュクリア
docker compose exec next sh -c "rm -rf node_modules/.prisma && npx prisma generate"

# DB接続確認
docker compose exec mysql mysql -u app_user -papp_pass app_db
```

## その他設定

### Azure MSAL（問い合わせメール）

MS 365との連携設定は別途ドキュメント参照。

### reCAPTCHA v3

問い合わせフォームのスパム対策として導入。

### Sitemap

`next-sitemap`で自動生成。Google Search Consoleに登録済み。

## ライセンス

このプロジェクトは瀬田製作所に帰属します。
