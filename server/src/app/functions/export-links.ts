import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { desc } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { type Either, makeRight } from '@/infra/shared/either'

function generateUniqueFilename(): string {
  const timestamp = Date.now()
  const random = randomBytes(4).toString('hex')
  return `links-export-${timestamp}-${random}.csv`
}

export async function exportLinks(): Promise<Either<never, { url: string; filename: string }>> {
  const allLinks = await db
    .select()
    .from(links)
    .orderBy(desc(links.createdAt))

  const csvHeader = 'originalUrl,shortUrl,accessCount,createdAt\n'
  const csvRows = allLinks.map(link => {
    const originalUrl = `"${link.originalUrl.replace(/"/g, '""')}"`
    const shortUrl = `"${link.shortUrl}"`
    const accessCount = link.accessCount
    const createdAt = new Date(link.createdAt).toISOString()
    return `${originalUrl},${shortUrl},${accessCount},${createdAt}`
  }).join('\n')

  const csvContent = csvHeader + csvRows

  const filename = generateUniqueFilename()

  const baseUrl = process.env.CDN_BASE_URL || 'https://cdn.example.com/exports'
  const cdnUrl = `${baseUrl}/${filename}`

  return makeRight({
    url: cdnUrl,
    filename,
  })
}
