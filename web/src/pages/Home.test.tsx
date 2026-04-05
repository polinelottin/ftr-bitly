import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import Home from './Home'
import * as api from '@/lib/api'
import type { ListLinksResponse } from '@/types/link'
import * as sonner from 'sonner'

// Mock do sonner (toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock de SVGs
vi.mock('../assets/vectors/Logo.svg', () => ({
  default: 'logo.svg',
}))

// Mock da API
vi.mock('@/lib/api', () => ({
  createLink: vi.fn(),
  listLinks: vi.fn(),
  deleteLink: vi.fn(),
  exportLinks: vi.fn(),
}))

// Mock do navigator.clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
}

// Garantir que o clipboard está disponível no ambiente de teste
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true,
  })
}

// Mock do window.URL.createObjectURL e revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock do document.createElement para o download
const originalCreateElement = document.createElement.bind(document)
const originalAppendChild = document.body.appendChild.bind(document.body)
const originalRemoveChild = document.body.removeChild.bind(document.body)

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClipboard.writeText.mockReset()
    mockClipboard.writeText.mockResolvedValue(undefined)
    // Restaurar createElement original
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild

    // Garantir que o clipboard está disponível
    if (typeof navigator !== 'undefined') {
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true,
      })
    }
  })

  it('should render home page with form', () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    render(<Home />)

    expect(screen.getByText(/novo link/i)).toBeInTheDocument()
    expect(screen.getByText(/meus links/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/link original/i)).toBeInTheDocument()
  })

  it('should display loading state when fetching links', () => {
    vi.mocked(api.listLinks).mockImplementation(
      () => new Promise<ListLinksResponse>(() => { }), // Never resolves
    )

    render(<Home />)

    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it('should display empty state when no links exist', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    render(<Home />)

    await waitFor(() => {
      expect(
        screen.getByText(/ainda não existem links cadastrados/i),
      ).toBeInTheDocument()
    })
  })

  it('should display links when they exist', async () => {
    const mockLinks = [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'test',
        accessCount: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        originalUrl: 'https://google.com',
        shortUrl: 'google',
        accessCount: 10,
        createdAt: new Date().toISOString(),
      },
    ]

    vi.mocked(api.listLinks).mockResolvedValue({
      links: mockLinks,
      total: 2,
      page: 1,
      limit: 100,
    })

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/brev\.ly\/test/i)).toBeInTheDocument()
      expect(screen.getByText(/brev\.ly\/google/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/https:\/\/example\.com/i)).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/google\.com/i)).toBeInTheDocument()
    expect(screen.getByText(/5 acessos/i)).toBeInTheDocument()
    expect(screen.getByText(/10 acessos/i)).toBeInTheDocument()
  })

  it('should create link when form is submitted', async () => {
    const mockLink = {
      id: '1',
      originalUrl: 'https://example.com',
      shortUrl: 'test',
      accessCount: 0,
      createdAt: new Date().toISOString(),
    }

    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    vi.mocked(api.createLink).mockResolvedValue(mockLink)

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByLabelText(/link original/i)).toBeInTheDocument()
    })

    const urlInput = screen.getByLabelText(/link original/i)
    const submitButton = screen.getByRole('button', { name: /salvar link/i })

    await user.type(urlInput, 'example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.createLink).toHaveBeenCalledWith({
        url: 'https://example.com',
        shortUrl: undefined,
      })
    })
  })

  it('should add https:// prefix when URL does not have protocol', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    vi.mocked(api.createLink).mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortUrl: 'test',
      accessCount: 0,
      createdAt: new Date().toISOString(),
    })

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByLabelText(/link original/i)).toBeInTheDocument()
    })

    const urlInput = screen.getByLabelText(/link original/i)
    const submitButton = screen.getByRole('button', { name: /salvar link/i })

    await user.type(urlInput, 'example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.createLink).toHaveBeenCalledWith({
        url: 'https://example.com',
        shortUrl: undefined,
      })
    })
  })

  it('should not submit when custom short URL has invalid characters', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByLabelText(/link original/i)).toBeInTheDocument()
    })

    const urlInput = screen.getByLabelText(/link original/i)
    const shortUrlInput = screen.getByLabelText(/link encurtado/i)
    const submitButton = screen.getByRole('button', { name: /salvar link/i })

    await user.type(urlInput, 'https://example.com')
    await user.type(shortUrlInput, 'bad@url')

    expect(
      screen.getByText(
        /use apenas letras, números, hífens \(-\) e underscores \(_\)\./i,
      ),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    const form = urlInput.closest('form')
    expect(form).toBeTruthy()
    fireEvent.submit(form!)
    expect(api.createLink).not.toHaveBeenCalled()
  })

  it('should create link with custom short URL', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    vi.mocked(api.createLink).mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortUrl: 'custom',
      accessCount: 0,
      createdAt: new Date().toISOString(),
    })

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByLabelText(/link original/i)).toBeInTheDocument()
    })

    const urlInput = screen.getByLabelText(/link original/i)
    const shortUrlInput = screen.getByLabelText(/link encurtado/i)
    const submitButton = screen.getByRole('button', { name: /salvar link/i })

    await user.type(urlInput, 'https://example.com')
    await user.type(shortUrlInput, 'custom')
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.createLink).toHaveBeenCalledWith({
        url: 'https://example.com',
        shortUrl: 'custom',
      })
    })
  })

  it('should disable submit button when URL is empty', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    render(<Home />)

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /salvar link/i })
      expect(submitButton).toBeDisabled()
    })
  })

  it('should delete link when delete button is clicked', async () => {
    const mockLinks = [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'test',
        accessCount: 5,
        createdAt: new Date().toISOString(),
      },
    ]

    vi.mocked(api.listLinks).mockResolvedValue({
      links: mockLinks,
      total: 1,
      page: 1,
      limit: 100,
    })

    vi.mocked(api.deleteLink).mockResolvedValue()

    // Mock do window.confirm
    window.confirm = vi.fn(() => true)

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/brev\.ly\/test/i)).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /deletar link/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'Tem certeza que deseja deletar este link?',
      )
      expect(api.deleteLink).toHaveBeenCalledWith('test')
    })
  })

  it('should not delete link when confirm is cancelled', async () => {
    const mockLinks = [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'test',
        accessCount: 5,
        createdAt: new Date().toISOString(),
      },
    ]

    vi.mocked(api.listLinks).mockResolvedValue({
      links: mockLinks,
      total: 1,
      page: 1,
      limit: 100,
    })

    window.confirm = vi.fn(() => false)

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/brev\.ly\/test/i)).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /deletar link/i })
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(api.deleteLink).not.toHaveBeenCalled()
  })

  it('should copy link to clipboard when copy button is clicked', async () => {
    const mockLinks = [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'test',
        accessCount: 5,
        createdAt: new Date().toISOString(),
      },
    ]

    vi.mocked(api.listLinks).mockResolvedValue({
      links: mockLinks,
      total: 1,
      page: 1,
      limit: 100,
    })

    vi.mocked(sonner.toast.success).mockClear()

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/brev\.ly\/test/i)).toBeInTheDocument()
    })

    const copyButton = screen.getByRole('button', { name: /copiar link/i })
    expect(copyButton).toBeInTheDocument()

    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://brev.ly/test',
      )
    })
    expect(sonner.toast.success).toHaveBeenCalledWith(
      'Link copiado para a área de transferência',
    )
  })

  it('should export links when export button is clicked', async () => {
    const mockLinks = [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'test',
        accessCount: 5,
        createdAt: new Date().toISOString(),
      },
    ]

    vi.mocked(api.listLinks).mockResolvedValue({
      links: mockLinks,
      total: 1,
      page: 1,
      limit: 100,
    })

    const mockBlob = new Blob(['test'], { type: 'text/csv' })
    vi.mocked(api.exportLinks).mockResolvedValue({ blob: mockBlob, filename: 'links.csv' })

    // Resetar o mock do toast
    vi.mocked(sonner.toast.success).mockClear()

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText(/brev\.ly\/test/i)).toBeInTheDocument()
    })

    // Mock do createElement apenas quando necessário (durante o click)
    const mockAnchor = document.createElement('a')
    mockAnchor.click = vi.fn()

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockAnchor
      }
      return originalCreateElement(tagName)
    })

    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    const exportButton = screen.getByRole('button', { name: /baixar csv/i })
    await user.click(exportButton)

    // Verificar que a função de export foi chamada
    await waitFor(() => {
      expect(api.exportLinks).toHaveBeenCalled()
    }, { timeout: 3000 })

    // Verificar que o toast de sucesso foi chamado
    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith('Links exportados com sucesso')
    }, { timeout: 3000 })

    // Verificar que o blob foi criado
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob)

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('should disable export button when no links exist', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    render(<Home />)

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /baixar csv/i })
      expect(exportButton).toBeDisabled()
    })
  })

  it('should clear form after successful link creation', async () => {
    vi.mocked(api.listLinks).mockResolvedValue({
      links: [],
      total: 0,
      page: 1,
      limit: 100,
    })

    vi.mocked(api.createLink).mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortUrl: 'test',
      accessCount: 0,
      createdAt: new Date().toISOString(),
    })

    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByLabelText(/link original/i)).toBeInTheDocument()
    })

    const urlInput = screen.getByLabelText(/link original/i) as HTMLInputElement
    const shortUrlInput = screen.getByLabelText(/link encurtado/i) as HTMLInputElement

    await user.type(urlInput, 'https://example.com')
    await user.type(shortUrlInput, 'custom')

    const submitButton = screen.getByRole('button', { name: /salvar link/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.createLink).toHaveBeenCalled()
    })

    // Aguardar invalidação da query e re-render
    await waitFor(() => {
      expect(urlInput.value).toBe('')
      expect(shortUrlInput.value).toBe('')
    }, { timeout: 3000 })
  })
})
