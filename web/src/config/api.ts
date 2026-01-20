export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    links: '/url-shortner',
    linkByShortUrl: (shortUrl: string) => `/url-shortner/${shortUrl}`,
    incrementAccess: (shortUrl: string) => `/url-shortner/${shortUrl}/access`,
    export: '/url-shortner/export',
  },
}
