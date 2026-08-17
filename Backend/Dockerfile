FROM node:22.23.1-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:22.23.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/config/config.cjs ./src/config/config.cjs
COPY --from=builder /app/.sequelizerc ./.sequelizerc

EXPOSE 5000

CMD ["node", "dist/index.js"]