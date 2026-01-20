import { db } from '@/infra/db'
import { sql } from 'drizzle-orm'

/**
 * Limpa todas as tabelas do banco de dados.
 * 
 * Esta função deve ser chamada no `afterEach` dos testes para garantir
 * que nenhum dado persista entre os testes.
 */
export async function cleanDatabase(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE links RESTART IDENTITY CASCADE`)
}