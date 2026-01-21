import { api } from '@/config/api'
import type { CreateLinkRequest, CreateLinkResponse, Link, ListLinksResponse } from '@/types/link'

export async function createLink(data: CreateLinkRequest): Promise<CreateLinkResponse> {
  const response = await fetch(`${api.baseURL}${api.endpoints.links}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao criar link' }))
    throw new Error(error.message || 'Erro ao criar link')
  }

  return response.json()
}

export async function deleteLink(shortUrl: string): Promise<void> {
  const response = await fetch(`${api.baseURL}${api.endpoints.linkByShortUrl(shortUrl)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    let errorMessage = 'Erro ao deletar link'
    try {
      const error = await response.json()
      errorMessage = error.message || errorMessage
    } catch {
      // Se não conseguir fazer parse do JSON, usar a mensagem padrão
      if (response.status === 404) {
        errorMessage = 'Link não encontrado'
      } else if (response.status === 500) {
        errorMessage = 'Erro interno do servidor'
      }
    }
    throw new Error(errorMessage)
  }
  
  // Status 204 (No Content) - sucesso, não há body para processar
}

export async function getLinkByShortUrl(shortUrl: string): Promise<Link> {
  const response = await fetch(`${api.baseURL}${api.endpoints.linkByShortUrl(shortUrl)}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Link não encontrado' }))
    throw new Error(error.message || 'Link não encontrado')
  }

  return response.json()
}

export async function listLinks(page = 1, limit = 10): Promise<ListLinksResponse> {
  const response = await fetch(
    `${api.baseURL}${api.endpoints.links}?page=${page}&limit=${limit}`,
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao listar links' }))
    throw new Error(error.message || 'Erro ao listar links')
  }

  return response.json()
}

export async function incrementAccess(shortUrl: string): Promise<void> {
  const response = await fetch(`${api.baseURL}${api.endpoints.incrementAccess(shortUrl)}`, {
    method: 'PATCH',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao incrementar acesso' }))
    throw new Error(error.message || 'Erro ao incrementar acesso')
  }
}

export async function exportLinks(): Promise<Blob> {
  const response = await fetch(`${api.baseURL}${api.endpoints.export}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao exportar links' }))
    throw new Error(error.message || 'Erro ao exportar links')
  }

  return response.blob()
}
