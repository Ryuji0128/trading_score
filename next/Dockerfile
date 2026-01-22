FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 600000

COPY . .
RUN rm -rf .next
RUN npx prisma generate
RUN yarn build

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && yarn start -H 0.0.0.0 -p 3000"
