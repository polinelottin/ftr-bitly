import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const limit = vi.fn()

vi.mock('@/infra/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit,
        })),
      })),
    })),
  },
}))

describe('getLinkByShortUrl', () => {
  beforeEach(() => {
    limit.mockReset()
  })

  test('retorna LinkNotFound quando não existe', async () => {
    limit.mockResolvedValueOnce([])
    const { getLinkByShortUrl } = await import('./get-link-by-short-url')
    const result = await getLinkByShortUrl('missing')
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toMatchObject({ message: 'Link not found' })
  })

  test('aceita shortUrl codificado (decodeURIComponent)', async () => {
    limit.mockResolvedValueOnce([
      {
        id: '1',
        originalUrl: 'https://x.com',
        shortUrl: 'a b',
        accessCount: 0,
        createdAt: new Date(),
      },
    ])
    const { getLinkByShortUrl } = await import('./get-link-by-short-url')
    const result = await getLinkByShortUrl('a%20b')
    expect(isRight(result)).toBe(true)
    expect(unwrapEither(result)).toMatchObject({ shortUrl: 'a b' })
  })

  test('retorna o link quando encontrado', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z')
    limit.mockResolvedValueOnce([
      {
        id: 'id-1',
        originalUrl: 'https://example.com',
        shortUrl: 'abc',
        accessCount: 5,
        createdAt,
      },
    ])
    const { getLinkByShortUrl } = await import('./get-link-by-short-url')
    const result = await getLinkByShortUrl('abc')
    expect(isRight(result)).toBe(true)
    const link = unwrapEither(result)
    expect(link).toEqual({
      id: 'id-1',
      originalUrl: 'https://example.com',
      shortUrl: 'abc',
      accessCount: 5,
      createdAt,
    })
  })
})
