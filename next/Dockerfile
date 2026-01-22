FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=2048"

# 依存関係のインストール
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 600000 --frozen-lockfile

# アプリケーションコードのコピー
COPY . .

# ビルドキャッシュのクリーンアップ
RUN rm -rf .next

# Next.jsのビルド
RUN yarn build

EXPOSE 3000

# 起動コマンド
CMD ["yarn", "start", "-H", "0.0.0.0", "-p", "3000"]