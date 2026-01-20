import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { eq, sql } from 'drizzle-orm'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { LinkNotFound } from './errors/link-not-found'

export async function incrementAccessCount(
  shortUrl: string
): Promise<Either<LinkNotFound, { id: string; originalUrl: string; shortUrl: string; accessCount: number; updatedAt: Date }>> {
  const decodedShortUrl = decodeURIComponent(shortUrl)

  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.shortUrl, decodedShortUrl))
    .limit(1)

  if (!link) {
    return makeLeft(new LinkNotFound())
  }

  const [updatedLink] = await db
    .update(links)
    .set({
      accessCount: sql`${links.accessCount} + 1`,
      updatedAt: sql`now()`,
    })
    .where(eq(links.shortUrl, decodedShortUrl))
    .returning()

  return makeRight({
    id: updatedLink.id,
    originalUrl: updatedLink.originalUrl,
    shortUrl: updatedLink.shortUrl,
    accessCount: updatedLink.accessCount,
    updatedAt: updatedLink.updatedAt,
  })
}
