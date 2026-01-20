import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { eq } from 'drizzle-orm'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { DuplicateShortUrlError } from './errors/duplicate-short-url'

async function generateUniqueShortUrl(length = 8): Promise<string> {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let shortUrl = ''
  let exists = true

  while (exists) {
    shortUrl = Array.from({ length }, () => {
      return characters[Math.floor(Math.random() * characters.length)]
    }).join('')

    const existingLink = await db
      .select()
      .from(links)
      .where(eq(links.shortUrl, shortUrl))
      .limit(1)

    exists = existingLink.length > 0
  }

  return shortUrl
}

export async function createLink(
  originalUrl: string
): Promise<Either<DuplicateShortUrlError, { id: string; originalUrl: string; shortUrl: string; createdAt: Date }>> {
  try {
    const shortUrl = await generateUniqueShortUrl()

    const [newLink] = await db
      .insert(links)
      .values({
        originalUrl,
        shortUrl,
      })
      .returning()

    return makeRight({
      id: newLink.id,
      originalUrl: newLink.originalUrl,
      shortUrl: newLink.shortUrl,
      createdAt: newLink.createdAt,
    })
  } catch (error: any) {
    if (error.code === '23505' || error.constraint === 'links_short_url_unique') {
      try {
        const shortUrl = await generateUniqueShortUrl()
        const [newLink] = await db
          .insert(links)
          .values({
            originalUrl,
            shortUrl,
          })
          .returning()

        return makeRight({
          id: newLink.id,
          originalUrl: newLink.originalUrl,
          shortUrl: newLink.shortUrl,
          createdAt: newLink.createdAt,
        })
      } catch (retryError: any) {
        if (retryError.code === '23505' || retryError.constraint === 'links_short_url_unique') {
          return makeLeft(new DuplicateShortUrlError())
        }
        throw retryError
      }
    }
    throw error
  }
}
