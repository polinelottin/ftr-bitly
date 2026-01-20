import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { sql, desc } from 'drizzle-orm'
import { type Either, makeRight } from '@/infra/shared/either'

export async function listLinks(
  page: number,
  limit: number
): Promise<Either<never, { links: Array<{ id: string; originalUrl: string; shortUrl: string; accessCount: number; createdAt: Date }>; total: number; page: number; limit: number }>> {
  const offset = (page - 1) * limit

  const linksList = await db
    .select()
    .from(links)
    .orderBy(desc(links.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(links)

  return makeRight({
    links: linksList.map(link => ({
      id: link.id,
      originalUrl: link.originalUrl,
      shortUrl: link.shortUrl,
      accessCount: link.accessCount,
      createdAt: link.createdAt,
    })),
    total: count,
    page,
    limit,
  })
}
