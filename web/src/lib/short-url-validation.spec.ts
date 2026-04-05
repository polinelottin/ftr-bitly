import { describe, it, expect } from 'vitest'
import {
  getCustomShortUrlValidationMessage,
  SHORT_URL_MAX_LENGTH,
} from './short-url-validation'

describe('getCustomShortUrlValidationMessage', () => {
  it('aceita vazio (campo opcional)', () => {
    expect(getCustomShortUrlValidationMessage('')).toBeNull()
  })

  it('aceita alfanumérico, hífen e underscore', () => {
    expect(getCustomShortUrlValidationMessage('my_custom-url_123')).toBeNull()
  })

  it('rejeita outros caracteres', () => {
    expect(getCustomShortUrlValidationMessage('a@b')).toBe(
      'Use apenas letras, números, hífens (-) e underscores (_).',
    )
    expect(getCustomShortUrlValidationMessage('com espaço')).toBe(
      'Use apenas letras, números, hífens (-) e underscores (_).',
    )
  })

  it('rejeita acima do limite do servidor', () => {
    const tooLong = 'a'.repeat(SHORT_URL_MAX_LENGTH + 1)
    expect(getCustomShortUrlValidationMessage(tooLong)).toBe(
      'O link encurtado deve ter no máximo 255 caracteres.',
    )
  })

  it('aceita exatamente no limite', () => {
    const ok = 'a'.repeat(SHORT_URL_MAX_LENGTH)
    expect(getCustomShortUrlValidationMessage(ok)).toBeNull()
  })
})
