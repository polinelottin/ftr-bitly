function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

function normalizeBaseUrl(raw: string | undefined, fallback: string): string {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return fallback
  }
  return trimTrailingSlash(raw.trim())
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_BACKEND_URL,
  'http://localhost:3333',
)

/** Base URL pública do front (onde `/:shortUrl` resolve o redirect). Usa `VITE_FRONTEND_URL` ou `location.origin`. */
export function getPublicFrontendBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_FRONTEND_URL
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return trimTrailingSlash(fromEnv.trim())
  }
  if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
    const origin = globalThis.location?.origin
    if (origin && origin !== 'null') {
      return origin
    }
  }
  return 'http://localhost:5173'
}

export function shortLinkUrl(shortUrl: string): string {
  return `${getPublicFrontendBaseUrl()}/${shortUrl}`
}

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    links: '/url-shortner',
    linkByShortUrl: (shortUrl: string) => `/url-shortner/${shortUrl}`,
    incrementAccess: (shortUrl: string) => `/url-shortner/${shortUrl}/access`,
    export: '/url-shortner/export',
  },
}
