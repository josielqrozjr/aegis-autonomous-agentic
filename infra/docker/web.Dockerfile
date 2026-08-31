FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/web/package*.json ./
RUN npm ci

COPY apps/web/ .
RUN mkdir -p public && npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# BACKEND_API_URL is set at runtime via Cloud Run env vars
CMD ["node", "server.js"]
