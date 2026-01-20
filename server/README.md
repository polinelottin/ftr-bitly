# Brev.ly server

API de encurtamento de URLs inspirada no Bit.ly.

## Requisitos Implementados

- [x] Deve ser possível criar um link
  - [x] Não deve ser possível criar um link com URL encurtada mal formatada
  - [x] Não deve ser possível criar um link com URL encurtada já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio de uma URL encurtada
- [x] Deve ser possível listar todas as URL's cadastradas (com paginação)
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível exportar os links criados em um CSV
  - [x] Deve ser possível acessar o CSV por meio de uma CDN (Amazon S3, Cloudflare R2, etc)
  - [x] Deve ser gerado um nome aleatório e único para o arquivo
  - [x] Deve ser possível realizar a listagem de forma performática
  - [x] O CSV deve ter campos como, URL original, URL encurtada, contagem de acessos e data de criação.

## Stack

- TypeScript
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod (validação de schemas)

## Scripts

- `dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `test` - Executa os testes
- `test:watch` - Executa os testes em modo watch
- `db:generate` - Gera migrations baseadas nas mudanças do schema
- `db:migrate` - Executa as migrations do banco de dados
- `db:studio` - Abre o Drizzle Studio para visualizar o banco de dados

## Docker

O projeto inclui um `Dockerfile` seguindo as boas práticas:

- Multi-stage build
- Usuário não-root para segurança
- Instalação otimizada de dependências

Para construir a imagem:

```bash
docker build -t ftr-brevly-server .
```

Para executar com Docker Compose:

```bash
docker-compose up
```

## Configuração

Certifique-se de configurar as seguintes variáveis de ambiente:

- `DATABASE_URL` - URL de conexão com o PostgreSQL
- `CDN_BASE_URL` - URL base da CDN para armazenar os CSVs exportados (opcional)

## API

A API está documentada através do Swagger UI disponível em `/docs` quando o servidor estiver rodando.

### Endpoints

- `POST /url-shortner` - Cria um novo link
- `DELETE /url-shortner/:shortUrl` - Deleta um link
- `GET /url-shortner/:shortUrl` - Obtém informações de um link
- `GET /url-shortner` - Lista todos os links (com paginação via query params `page` e `limit`)
- `PATCH /url-shortner/:shortUrl/access` - Incrementa o contador de acessos
- `GET /url-shortner/export` - Exporta todos os links em CSV

## CORS

O CORS está habilitado na aplicação, permitindo requisições de qualquer origem (`origin: '*'`).
