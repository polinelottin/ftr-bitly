# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm versão específica (compatível com lockfile v9)
RUN npm install -g pnpm@9

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências (inclui dev para TypeScript, tsup e typecheck)
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Typecheck + bundle ESM para dist/ (entrada: dist/server.js)
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

# Porta padrão alinhada a env.PORT (3333); sobrescreva com -e PORT em runtime
EXPOSE 3333

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
