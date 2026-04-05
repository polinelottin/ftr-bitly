/**
 * Roda antes de cada arquivo de teste. Garante DATABASE_URL antes de importar
 * `@/infra/db` (evita ZodError quando `vitest` roda sem `dotenv -e .env.test`).
 * Preferência: variáveis em `.env.test` ou no ambiente; fallback alinhado ao docker-compose.
 */
const defaultTestDatabaseUrl = 'postgresql://docker:docker@127.0.0.1:5432/brevly'

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = defaultTestDatabaseUrl
}
