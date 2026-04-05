# Brev.ly

Aplicação completa de encurtamento de URLs inspirada no Bit.ly, permitindo cadastro, listagem, remoção de links encurtados, geração de relatórios de acessos e redirecionamento correto do link encurtado para o link original.

## 📋 Funcionalidades

- ✅ **Criar links encurtados** - Cadastro de URLs com encurtamento personalizado ou automático
- ✅ **Listar links** - Visualização de todos os links cadastrados com paginação
- ✅ **Deletar links** - Remoção de links encurtados
- ✅ **Redirecionamento** - Redirecionamento automático para a URL original
- ✅ **Contagem de acessos** - Rastreamento de quantas vezes cada link foi acessado
- ✅ **Exportação em CSV** - Geração de relatórios com todos os links e estatísticas
- ✅ **Validação** - Validação de URLs e prevenção de duplicatas

## 🏗️ Estrutura do Projeto

O projeto é dividido em duas partes principais:

```
ftr-bitly/
├── server/          # API Backend (Fastify + TypeScript + PostgreSQL)
└── web/             # Frontend (React + Vite + TypeScript)
```

## 🚀 Tecnologias

### Backend (`server/`)

- **TypeScript** - Linguagem de programação
- **Fastify** - Framework web rápido
- **Drizzle ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Zod** - Validação de schemas
- **Swagger** - Documentação da API

### Frontend (`web/`)

- **TypeScript** - Linguagem de programação
- **React** - Biblioteca JavaScript
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **TailwindCSS** - Estilização
- **Zod** - Validação de schemas

## 📦 Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm ou npm ou yarn
- PostgreSQL (ou Docker para subir o Postgres com `docker compose`)
- Docker com plugin Compose v2 (opcional; comando: `docker compose`, não `docker-compose`)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd ftr-bitly
```

### 2. Instale as dependências do servidor

```bash
cd server
pnpm install
# ou npm install / yarn install
```

### 3. Instale as dependências do frontend

```bash
cd ../web
pnpm install
# ou npm install / yarn install
```

## ⚙️ Configuração

### Backend (`server/`)

Crie um arquivo `.env` na pasta `server/` com as seguintes variáveis:

```env
DATABASE_URL=postgresql://docker:docker@localhost:5432/brevly
CDN_BASE_URL=https://your-cdn-url.com  # Opcional
PORT=3333
```

### Frontend (`web/`)

Crie um arquivo `.env` na pasta `web/` (ou copie de `web/.env.example`):

```env
VITE_BACKEND_URL=http://localhost:3333
VITE_FRONTEND_URL=http://localhost:5173
```

## 🐳 Executando com Docker

### Banco de dados

Na pasta `server/`, execute:

```bash
docker compose up -d
```

Se ainda tiver o binário antigo instalado, o equivalente é `docker-compose up -d` (com hífen).

Isso iniciará um container PostgreSQL na porta 5432.

### Migrations

Após iniciar o banco de dados, execute as migrations:

```bash
cd server
pnpm db:migrate
```

## ▶️ Executando a aplicação

### Backend

Na pasta `server/`:

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3333`
A documentação da API (Swagger) estará disponível em `http://localhost:3333/docs`

### Frontend

Na pasta `web/`:

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📚 Documentação

- [Documentação do Backend](./server/README.md) - Detalhes sobre a API, endpoints e configuração do servidor
- [Documentação do Frontend](./web/README.md) - Detalhes sobre a aplicação web, páginas e estrutura

## 🔌 Endpoints da API

- `POST /url-shortner` - Cria um novo link
- `DELETE /url-shortner/:shortUrl` - Deleta um link
- `GET /url-shortner/:shortUrl` - Obtém informações de um link
- `GET /url-shortner` - Lista todos os links (com paginação via `page` e `limit`)
- `PATCH /url-shortner/:shortUrl/access` - Incrementa o contador de acessos
- `GET /url-shortner/export` - Exporta todos os links em CSV

A documentação completa da API está disponível no Swagger UI em `/docs` quando o servidor estiver rodando.

## 📄 Scripts Disponíveis

### Backend (`server/`)

- `pnpm dev` - Inicia o servidor em modo desenvolvimento
- `pnpm test` - Executa os testes
- `pnpm test:watch` - Executa os testes em modo watch
- `pnpm db:generate` - Gera migrations baseadas nas mudanças do schema
- `pnpm db:migrate` - Executa as migrations do banco de dados
- `pnpm db:studio` - Abre o Drizzle Studio

### Frontend (`web/`)

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Gera o build de produção
- `pnpm preview` - Preview do build de produção
- `pnpm lint` - Executa o linter

## 🧪 Testes

Os testes estão localizados na pasta `server/src/test/` e podem ser executados com:

```bash
cd server
pnpm test
```

## 📝 Licença

ISC
