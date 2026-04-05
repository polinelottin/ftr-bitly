import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const sendMock = vi.fn().mockResolvedValue({})

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: sendMock,
  })),
  PutObjectCommand: vi.fn((input: unknown) => input),
}))

describe('uploadExportedCsvToR2', () => {
  const baseEnv = { ...process.env }

  beforeEach(() => {
    sendMock.mockClear()
    process.env = { ...baseEnv }
    process.env.NODE_ENV = 'test'
    process.env.PORT = '3333'
    process.env.DATABASE_URL = 'postgresql://docker:docker@localhost:5432/bitly'
    process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
    process.env.CLOUDFLARE_ACCESS_KEY_ID = 'test-key-id'
    process.env.CLOUDFLARE_SECRET_ACCESS_KEY = 'test-secret'
    process.env.CLOUDFLARE_BUCKET = 'test-bucket'
    process.env.CLOUDFLARE_PUBLIC_URL = 'https://cdn.example.com'
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...baseEnv }
    vi.resetModules()
  })

  test('envia o CSV e retorna URL pública com prefixo exports/', async () => {
    const { uploadExportedCsvToR2 } = await import('./upload-csv-r2')
    const url = await uploadExportedCsvToR2({
      csvContent: 'a,b\n1,2',
      filename: 'links-export-test.csv',
    })
    expect(url).toBe('https://cdn.example.com/exports/links-export-test.csv')
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  test('isR2CsvExportEnabled retorna true quando todas as variáveis R2 estão definidas', async () => {
    const { isR2CsvExportEnabled } = await import('./upload-csv-r2')
    expect(isR2CsvExportEnabled()).toBe(true)
  })

  test('isR2CsvExportEnabled retorna false sem variáveis Cloudflare', async () => {
    process.env = {
      ...baseEnv,
      NODE_ENV: 'test',
      PORT: '3333',
      DATABASE_URL: 'postgresql://docker:docker@localhost:5432/bitly',
    }
    delete process.env.CLOUDFLARE_ACCOUNT_ID
    delete process.env.CLOUDFLARE_ACCESS_KEY_ID
    delete process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    delete process.env.CLOUDFLARE_BUCKET
    delete process.env.CLOUDFLARE_PUBLIC_URL
    vi.resetModules()

    const { isR2CsvExportEnabled } = await import('./upload-csv-r2')
    expect(isR2CsvExportEnabled()).toBe(false)
  })

  test('normaliza barras finais na URL pública do objeto', async () => {
    process.env.CLOUDFLARE_PUBLIC_URL = 'https://cdn.example.com///'
    vi.resetModules()

    const { uploadExportedCsvToR2 } = await import('./upload-csv-r2')
    const url = await uploadExportedCsvToR2({
      csvContent: 'x',
      filename: 'f.csv',
    })
    expect(url).toBe('https://cdn.example.com/exports/f.csv')
  })
})
