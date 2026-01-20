import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { eq } from 'drizzle-orm'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { LinkNotFound } from './errors/link-not-found'

export async function getLinkByShortUrl(
  shortUrl: string
): Promise<Either<LinkNotFound, { id: string; originalUrl: string; shortUrl: string; accessCount: number; createdAt: Date }>> {
  const decodedShortUrl = decodeURIComponent(shortUrl)

  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.shortUrl, decodedShortUrl))
    .limit(1)

  if (!link) {
    return makeLeft(new LinkNotFound())
  }

  return makeRight({
    id: link.id,
    originalUrl: link.originalUrl,
    shortUrl: link.shortUrl,
    accessCount: link.accessCount,
    createdAt: link.createdAt,
  })
}
