# ブログ機能セットアップ手順

## 実装内容

superuserのみがブログを投稿・編集・削除できる機能を実装しました。
一般ユーザーはブログの閲覧のみ可能です。

## 変更されたファイル

### バックエンド (Django)
- `django/api/models.py` - Blogモデルに`author`と`published`フィールドを追加
- `django/api/views.py` - BlogViewSetの権限を設定（superuserのみ作成・更新・削除可能）
- `django/api/serializers.py` - BlogSerializerに著者情報を追加

### フロントエンド (Next.js)
- `next/src/app/blog/page.tsx` - ブログ一覧ページ
- `next/src/app/blog/create/page.tsx` - ブログ作成ページ（superuserのみ）
- `next/src/app/blog/[id]/page.tsx` - ブログ詳細ページ
- `next/src/app/blog/[id]/edit/page.tsx` - ブログ編集ページ（superuserのみ）
- `next/src/components/MLBSidebar.tsx` - サイドバーにブログメニューを追加

## マイグレーション実行手順

Dockerコンテナを起動してマイグレーションを実行してください：

```bash
# Dockerコンテナを起動
cd /home/seta/trading_score
docker compose up -d

# マイグレーションファイルを作成
docker compose exec django_app python manage.py makemigrations

# マイグレーションを実行
docker compose exec django_app python manage.py migrate
```

## API エンドポイント

### ブログ一覧取得 (GET)
```
GET /api/blogs/
```
- 権限: 誰でもアクセス可能

### ブログ詳細取得 (GET)
```
GET /api/blogs/{id}/
```
- 権限: 誰でもアクセス可能

### ブログ作成 (POST)
```
POST /api/blogs/
Headers: Authorization: Bearer {access_token}
Body: {
  "title": "ブログタイトル",
  "content": "ブログ本文",
  "image_url": "画像URL（任意）",
  "published": true
}
```
- 権限: superuserのみ
- 著者は自動的に設定されます

### ブログ更新 (PUT)
```
PUT /api/blogs/{id}/
Headers: Authorization: Bearer {access_token}
Body: {
  "title": "更新後のタイトル",
  "content": "更新後の本文",
  "image_url": "画像URL（任意）",
  "published": true
}
```
- 権限: superuserのみ

### ブログ削除 (DELETE)
```
DELETE /api/blogs/{id}/
Headers: Authorization: Bearer {access_token}
```
- 権限: superuserのみ

## フロントエンドの機能

### ブログ一覧ページ (`/blog`)
- すべてのブログをカード形式で表示
- superuserの場合、「新規投稿」ボタンが表示される
- カードをクリックすると詳細ページへ遷移

### ブログ詳細ページ (`/blog/{id}`)
- ブログの全文を表示
- 著者名と投稿日を表示
- superuserの場合、「編集」「削除」ボタンが表示される

### ブログ作成ページ (`/blog/create`)
- superuserのみアクセス可能
- タイトル、画像URL、本文を入力して投稿

### ブログ編集ページ (`/blog/{id}/edit`)
- superuserのみアクセス可能
- 既存のブログ内容を編集

## 権限チェック

フロントエンドでは以下のエンドポイントを使用してユーザーの権限を確認しています：

```
GET /api/auth/me/
Headers: Authorization: Bearer {access_token}
```

レスポンス例：
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "is_superuser": true,
  "role": "ADMIN"
}
```

## 注意事項

1. ブログ投稿にはsuperuser権限が必要です
2. 画像URLは外部URLを想定しています（画像アップロード機能は未実装）
3. マークダウン形式には対応していません（プレーンテキストのみ）
