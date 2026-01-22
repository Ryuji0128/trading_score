<div align="center">


# GCP App Engine 開発メモ
　　
</div>
<br>

## はじめに
- 基本的には、GCPの各アプリプラットフォームを活用し、瀬田製作所のホームページを構築するが、一部、gcloud SDKを用いる部分も有る


## Google App Engineの設定及びデプロイ
### 参考:
  - [記事1](https://cloud.google.com/appengine/docs/an-overview-of-app-engine?hl=ja)
  - [記事2](https://blog.apar.jp/web/6912/)
  - [記事3](https://blog.g-gen.co.jp/entry/google-app-engine-explained)

### 手順:
- 瀬田製作所ホームページがローカルで動作することを確認
- GCPプロジェクトの作成
- GAE初期設定（言語選択、リージョン選択、）
- gcloud SDKの初期設定
  - 別添ファイル参照: [gcloud-SDK-usage.md](./gcloud-SDK-usage.md)
- app.yamlの作成
  - （今後、インスタンスクラス、スケーリング設定などについて要議論）
- デプロイ及びブラウザでの確認
  ```bash
  gcloud app deploy
  ```
- エラー発生時のデバッグ
  ```bash
  gcloud app deploy --verbosity=debug
  ```


## Google Cloud Buildの設定及びCI/CDパイプライン構築
### 参考:
  - [記事1](https://cloud.google.com/build/docs/automating-builds/create-manage-triggers?hl=ja)
  - [記事2](https://qiita.com/suzuki-navi/items/0373f479f5c6e4d98c80)

### 手順:

<!-- - サービスアカウント作成（デフォルトを用いない場合、Cloud Build関連権限付与と合わせて） -->
- サービスアカウントへの権限付与
  - App Engine及びCloud Buildの両サービスアカウントに対して、App Engine AdminとSecret Manage Accessorのステータスを「有効」 に設定
- cloudbuild.yaml作成
  - 環境変数のうち、NEXT_PUBLIC_で始まるもの（FEで使用する）は、予め、ビルドファイルとして組み込む必要があるため、「代入変数」としてセットし、cloudbuild.yaml内で参照
- GitHubリポジトリを指定して接続
- Githubアカウント内でGoogle Cloud Buildをインストール
- サービスアカウント選択（当面、デフォルトアカウントを使用）
  <!-- - デフォルトのサービスアカウントは幅広い権限が付与されているため、別途作成しアタッチすることも検討 -->
- リポジトリへPushして、CI/CDパイプラインが自動で実行されること及びブラウザで表示されることを確認


## ドメインアクセス設定
※カスタムドメインを設定する場合、通常は、CNAMEレコードを設定することが一般的だが、今回は、Serverless NEG(Network Endpoint Group)を使用し、Aレコードを用いて、IPv4の固定IPアドレスでアクセスできるように設定
<!-- - 結果、IPを用いた不正アクセスを防ぐことができる   -->
  - [記事1](https://cloud.google.com/appengine/docs/standard/mapping-custom-domains?hl=ja)
  - [記事2](https://neightbor.jp/blog/app-engine-custom-domain)
  - [記事3](https://recruit.gmo.jp/engineer/jisedai/blog/gae-domain-loadbalancer/)
### 参考:
  - [記事1](https://cloud.google.com/load-balancing/docs/negs/serverless-neg-concepts?hl=ja)
  - [記事2](https://cloud.google.com/vpc/docs/serverless-vpc-access?hl=ja)
  - [記事3](https://zenn.dev/yyykms123/articles/2021-12-24-gae-ip-restriction)
  - [記事4](https://www.youtube.com/watch?v=0CHDPaOIBks)
### 手順（別途、動画有り）:
- 静的IPアドレスを取得する
  - グローバルを選択
- SSL証明書を取得する
  - ドメイン取得サイトにて、静的IPを用いてAレコードを設定（公式では、設定から48時間で完了）
- ロードバランサを設定する
  - グローバルデプロイ、グローバル外部アプリケーションロードバランサを選択
  - フロントエンド構成
    - プロトコル: HTTPS
    - IPアドレス: 静的IPアドレス
    - SSL証明書: 証明書を選択
    - HTTPSリダイレクト: 有効（この設定により、httpフォワードルールが自動で作成されるので別途作成の必要無し）
  - バックエンド構成
    - Serverless NEGを作成
    - リージョンをasia-northeast1に設定
    - CDN,Cloud Armor設定
- ドメインを用いてアクセスできるか、SSL化されているか確認
- デフォルトドメインからのアクセスを無効化する（https://***.appspot.com）
  - GAEのIngress設定にて、「内部のトラフィックとCloud Load Balancingからのトラフィックを許可する」を選択
  - デフォルトドメインからのアクセスが無効化されているか確認


## セキュリティと環境変数
- Secret Manager を活用し、環境変数をセキュアに管理:
  - 参考: [Secret Manager ドキュメント](https://cloud.google.com/build/docs/securing-builds/use-secrets?hl=ja)
  - ローカルにてビルド環境下でアプリを起動する場合は、事前の設定を済ませておく必要がある
    - envファイルのENVIRONMENTをstagingに設定
    - gcloud auth application-default loginを実行し、アプリケーション認証を実施


## DB設定及び接続
- Cloud SQLにてインスタンスを作成
- AQL admin APIを有効化
- ユーザーを作成し、パスワードを設定
### Cloud Shellを用いて接続する場合
- Cloud Shellにて以下のコマンドを実行
  ```bash
  gcloud sql connect fusetsu-db-sql84 --user=Username --database=Database
  // テストとして、ユーザーに"demo_user"、データベースに"demo"を作成済み
  ```
### ローカルのターミナル及びWorkbenchを用いて接続する場合
- 参考
  - [記事](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy?hl=ja#install-proxy)
- 手順
  - Cloud SQL Auth Proxyをインストールして、起動
  - なお、Path化するにはmvで移動させる
  ```bash
  curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.7.1/cloud-sql-proxy.darwin.amd64
  chmod +x cloud-sql-proxy
  sudo mv cloud-sql-proxy /usr/local/bin/
  ```
  - mysqlがインストールされていなければ、事前にバージョンをインストール
  - （Cloud SQLのバージョン8.4は最新のAuthentication Pluginが採用されているため、ローカルにてmysqlをインストールする場合、9.*等の最新バージョンをインストールすること）[参考]（https://cloud.google.com/sql/docs/mysql/features?hl=ja#mysql-authentication）
  - アプリケーション認証を実施し、Cloud SQL Auth Proxyを起動
  ```bash
  gcloud auth application-default login
  cloud-sql-proxy INSTANCE_CONNECTION_NAME
  // successfully and is ready for new connections!の表示が出たら、別のターミナルを開いて以下のコマンドを実行
  mysql -u DB_USER -p --host 127.0.0.1 --port 3306 --get-server-public-key
  ```
  - Workbenchを用いて接続する場合は、上記同様、gcloudログインとcloud-sql-proxyコマンドを実行の上、Connection MethodにStandard TCP/IPを選択し、Connection Name, Hostname, Port, Username, Passwordを設定して接続([参考](https://cloud.google.com/sql/docs/mysql/admin-tools?hl=ja))
