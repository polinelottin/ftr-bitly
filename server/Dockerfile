# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm versão específica (compatível com lockfile v9)
RUN npm install -g pnpm@9

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install

# Copiar código fonte
COPY . .

# Build não é necessário já que usamos tsx diretamente, mas podemos validar o TypeScript
RUN pnpm exec tsc --noEmit

# Stage 2: Production
FROM node:20-alpine AS production

# Instalar pnpm versão específica (compatível com lockfile v9)
RUN npm install -g pnpm@9

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar todas as dependências (incluindo dev para tsx)
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# Alterar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["pnpm", "exec", "tsx", "src/infra/http/server.ts"]
