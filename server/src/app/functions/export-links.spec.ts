import { isRight, unwrapEither } from '@/infra/shared/either'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const orderBy = vi.fn()

vi.mock('@/infra/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: orderBy,
      })),
    })),
  },
}))

describe('exportLinks', () => {
  beforeEach(() => {
    orderBy.mockReset()
  })

  test('retorna só o cabeçalho quando não há links', async () => {
    orderBy.mockResolvedValueOnce([])
    const { exportLinks } = await import('@/app/functions/export-links')
    const result = await exportLinks()
    expect(isRight(result)).toBe(true)
    const { csvContent, filename } = unwrapEither(result)
    expect(csvContent).toBe('originalUrl,shortUrl,accessCount,createdAt\n')
    expect(filename).toMatch(/^links-export-\d+-[a-f0-9]{8}\.csv$/)
  })

  test('gera linhas CSV com aspas duplas escapadas na URL original', async () => {
    orderBy.mockResolvedValueOnce([
      {
        originalUrl: 'https://example.com/path?x="y"',
        shortUrl: 'csv-quote-test',
        accessCount: 3,
        createdAt: new Date('2024-01-15T12:00:00.000Z'),
      },
    ])
    const { exportLinks } = await import('@/app/functions/export-links')
    const result = await exportLinks()
    const { csvContent } = unwrapEither(result)

    expect(csvContent.trim().split('\n')).toEqual([
      'originalUrl,shortUrl,accessCount,createdAt',
      '"https://example.com/path?x=""y""","csv-quote-test",3,2024-01-15T12:00:00.000Z',
    ])
  })

  test('preserva ordem retornada pelo banco (já ordenado por createdAt desc)', async () => {
    orderBy.mockResolvedValueOnce([
      {
        originalUrl: 'https://newer.example',
        shortUrl: 'newer',
        accessCount: 0,
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
      },
      {
        originalUrl: 'https://older.example',
        shortUrl: 'older',
        accessCount: 0,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
      },
    ])
    const { exportLinks } = await import('@/app/functions/export-links')
    const { csvContent } = unwrapEither(await exportLinks())
    const lines = csvContent.trim().split('\n')
    expect(lines[1]).toContain('https://newer.example')
    expect(lines[2]).toContain('https://older.example')
  })
})
