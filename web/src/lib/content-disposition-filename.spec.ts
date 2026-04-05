import { describe, it, expect } from 'vitest'
import { parseFilenameFromContentDisposition } from './content-disposition-filename'

describe('parseFilenameFromContentDisposition', () => {
  it('lê filename entre aspas', () => {
    expect(
      parseFilenameFromContentDisposition(
        'attachment; filename="links-export-1712345678-a1b2c3d4.csv"',
      ),
    ).toBe('links-export-1712345678-a1b2c3d4.csv')
  })

  it('lê filename sem aspas', () => {
    expect(
      parseFilenameFromContentDisposition('attachment; filename=export.csv'),
    ).toBe('export.csv')
  })

  it('lê filename* UTF-8 (RFC 5987)', () => {
    expect(
      parseFilenameFromContentDisposition(
        "attachment; filename*=UTF-8''meu%20arquivo.csv",
      ),
    ).toBe('meu arquivo.csv')
  })

  it('retorna null quando não há filename', () => {
    expect(parseFilenameFromContentDisposition('attachment')).toBeNull()
    expect(parseFilenameFromContentDisposition('')).toBeNull()
  })
})
