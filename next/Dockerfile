FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# 依存関係のインストール
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# ソースコードのコピー
COPY . .

# 本番ビルド
ENV NODE_ENV=production
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start", "--hostname", "0.0.0.0", "--port", "3000"]
