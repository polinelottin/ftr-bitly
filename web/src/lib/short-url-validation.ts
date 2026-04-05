/** Alinhado a `server/src/infra/http/routes/url_shortner.ts` (Zod). */
export const SHORT_URL_MAX_LENGTH = 255

export const SHORT_URL_PATTERN = /^[a-zA-Z0-9_-]+$/

export function getCustomShortUrlValidationMessage(trimmedValue: string): string | null {
  if (trimmedValue.length === 0) {
    return null
  }
  if (trimmedValue.length > SHORT_URL_MAX_LENGTH) {
    return 'O link encurtado deve ter no máximo 255 caracteres.'
  }
  if (!SHORT_URL_PATTERN.test(trimmedValue)) {
    return 'Use apenas letras, números, hífens (-) e underscores (_).'
  }
  return null
}
