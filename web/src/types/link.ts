export interface Link {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

export interface CreateLinkRequest {
  url: string
  shortUrl?: string
}

export interface CreateLinkResponse {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

export interface ListLinksResponse {
  links: Link[]
  total: number
  page: number
  limit: number
}
