# Management Commands

Django管理コマンド一覧。`docker exec django_app python manage.py <command>` で実行する。

---

## 初期セットアップ（初回のみ）

| コマンド | 説明 | 依存 |
|---------|------|------|
| `sync_mlb_teams` | MLB公式APIからチーム情報を同期 | なし |
| `toppsNow_archive` | Topps NOW公式サイトからカード情報をスクレイピング（Selenium使用） | sync_mlb_teams |

## データ同期（定期実行可）

| コマンド | 説明 | 依存 |
|---------|------|------|
| `sync_mlb_players` | 既存Player名からMLB Stats APIでmlb_player_idを取得・保存 | toppsNow_archive |
| `fetch_player_stats` | MLB Stats APIから選手の打撃・投球成績を取得 | sync_mlb_players |
| `fetch_player_nationality` | MLB Stats APIから選手の国籍（出身国）を取得 | sync_mlb_players |
| `fetch_wbc_data` | WBCトーナメント・試合・出場選手データを取得 | なし |
| `fetch_wbc_players` | WBC出場選手とPlayerモデルを紐付け | fetch_wbc_data, sync_mlb_players |
| `fetch_game_ids` | ToppsカードのMLB Game IDを取得 | toppsNow_archive |

## URL管理

| コマンド | 説明 | 依存 |
|---------|------|------|
| `generate_product_urls` | Topps公式商品ページのURLを生成・設定 | toppsNow_archive |
| `regenerate_product_urls` | 全カードのproduct_url/product_url_longを再生成 | toppsNow_archive |
| `shorten_product_urls` | 長いproduct_urlを短いURLに更新 | generate_product_urls |
| `fix_broken_urls` | 404が返るproduct_urlをチェックして修正 | generate_product_urls |

## スクレイピング

| コマンド | 説明 | 依存 |
|---------|------|------|
| `scrape_card_images` | Topps商品ページから画像URLを取得して保存 | generate_product_urls |
| `scrape_release_dates` | Topps商品ページから発行日を取得して保存 | generate_product_urls |

## メンテナンス

| コマンド | 説明 | 依存 |
|---------|------|------|
| `clean_topps_titles` | ToppsCardのタイトルを整理（不要文字削除等） | toppsNow_archive |
| `update_card_teams` | MLB APIから選手情報を取得してカードにチーム紐付け | sync_mlb_players |

## デバッグ用（開発時のみ）

| コマンド | 説明 |
|---------|------|
| `test_selenium` | Selenium/Chromeのインストール確認 |
| `test_shopify_api` | Shopify Products JSON APIのテスト |
| `test_topps_scrape` | Topps NOWスクレイピングテスト（1件のみ取得） |
| `analyze_html` | 保存済みHTMLファイルの解析 |

---

## 推奨実行順序（新規構築時）

```bash
# 1. チーム情報
python manage.py sync_mlb_teams

# 2. カードデータ取得
python manage.py toppsNow_archive

# 3. 選手紐付け
python manage.py sync_mlb_players

# 4. 追加情報取得
python manage.py fetch_player_stats
python manage.py fetch_player_nationality
python manage.py fetch_game_ids

# 5. URL生成とスクレイピング
python manage.py generate_product_urls
python manage.py scrape_release_dates
python manage.py scrape_card_images

# 6. WBCデータ
python manage.py fetch_wbc_data
python manage.py fetch_wbc_players

# 7. メンテナンス
python manage.py clean_topps_titles
python manage.py update_card_teams
```

## オプション

多くのコマンドが以下のオプションをサポート:

- `--dry-run`: 実際には保存せず確認のみ
- `--delay <秒>`: APIリクエスト間の待機時間
- `--year <年>`: 特定年のみ処理
