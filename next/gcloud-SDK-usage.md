<div align="center">

# gcloud SDK取り扱いメモ
※ MacOS上での手順を記載。　　

</div>
<br>

## 管理者が事前に行うべき設定
1. GCPプロジェクトの作成:  
   [GCPコンソール](https://console.cloud.google.com/) からプロジェクトを作成。
2. GCPプロジェクトの認証情報の取得
3. GCPプロジェクトのサービスアカウントの作成
4. GCPプロジェクトのサービスアカウントのキーの作成、ダウンロード、環境変数設定（必要があれば）
5. チームメンバーのGCPプロジェクトへのアクセス権限付与
   各ユーザーにIAMロールを付与し、GCPプロジェクトへのアクセス権限（閲覧、編集等）を付与:
   この作業によって、gcloud SDKの使用が可能となる。

## gcloud SDKの初期設定、使用開始
1. Python(Ver.3)を事前にインストール。
2. Google Cloud SDK を [公式サイト](https://cloud.google.com/sdk)ドキュメントに沿ってダウンロード。
3. デフォルトプロジェクトの選択:  
   使用する GCP プロジェクト(fusetsu-hp)を選択。
4. デフォルトのリージョンの選択:  
   Compute Engineリソースのロケーションとして、asia-northeast1を選択。
5. その他必要となる設定

## gcloud SDKの運用方法
以下、[公式サイト](https://cloud.google.com/sdk)ドキュメントに従って進行。
1. Google アカウントへのログイン:  
   `gcloud auth login` を実行するとブラウザが自動で起動し、Googleアカウントでの認証作業が求められる。

2. gcloudコマンドの利用:  
   GCPドキュメントを参照し、gcloudコマンドを使用して、GCPリソースの操作を行う。  
   例: gcloud CLI のインストール状況と有効な構成に関する情報
   ```bash
   gcloud info
   ```
   
3. gcloudコマンド利用時のよくあるエラー:   
   
   ***Case 1:***
   ```
   ERROR: (gcloud.app.describe) Please run:
      gcloud auth login
   ```
   この場合、ログアウトされている状態なので、再度ログインが必要。　　　

   ***Case 2:***
   ```
   (gcloud.sql.connect) The required property [project] is not currently set.
   ```
   この場合、gcloud CLI SDKにプロジェクトが設定されていない、若しくはプロジェクトの紐付けが何らかの理由で解除されたため、再度設定が必要。
   ```
   gcloud config set project [project-id]
   // gcloud config list projectを打ってみて、プロジェクトが設定されているか確認
   ```
