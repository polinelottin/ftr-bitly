import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { eq } from 'drizzle-orm'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { LinkNotFound } from './errors/link-not-found'

export async function deleteLink(
  shortUrl: string
): Promise<Either<LinkNotFound, { success: true }>> {
  const decodedShortUrl = decodeURIComponent(shortUrl)

  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.shortUrl, decodedShortUrl))
    .limit(1)

  if (!link) {
    return makeLeft(new LinkNotFound())
  }

  await db
    .delete(links)
    .where(eq(links.shortUrl, decodedShortUrl))

  return makeRight({ success: true })
}
