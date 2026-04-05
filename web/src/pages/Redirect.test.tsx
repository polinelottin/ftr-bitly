import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import Redirect from './Redirect'
import * as api from '@/lib/api'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Mock do sonner (toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock da API
vi.mock('@/lib/api', () => ({
  getLinkByShortUrl: vi.fn(),
  incrementAccess: vi.fn(),
}))

// Mock do window.location.href
const originalLocation = window.location
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, href: '' },
  })
})

describe('Redirect', () => {
  function createWrapper(initialEntries: string[] = ['/test-url']) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/:shortUrl" element={<Redirect />} />
            <Route path="/" element={<Redirect />} />
            <Route path="*" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show redirecting message while loading', () => {
    vi.mocked(api.getLinkByShortUrl).mockImplementation(
      () => new Promise<never>(() => {}), // Never resolves
    )

    render(<div />, { wrapper: createWrapper(['/test-url']) })
    expect(screen.getByText(/redirecionando/i)).toBeInTheDocument()
  })

  it('should redirect to original URL when link is found', async () => {
    const mockLink = {
      id: '1',
      originalUrl: 'https://example.com',
      shortUrl: 'test-url',
      accessCount: 0,
      createdAt: new Date().toISOString(),
    }

    vi.mocked(api.getLinkByShortUrl).mockResolvedValue(mockLink)
    vi.mocked(api.incrementAccess).mockResolvedValue(undefined)

    render(<div />, { wrapper: createWrapper(['/test-url']) })

    await waitFor(() => {
      expect(api.getLinkByShortUrl).toHaveBeenCalledWith('test-url')
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(api.incrementAccess).toHaveBeenCalledWith('test-url')
    }, { timeout: 2000 })

    await waitFor(() => {
      expect(window.location.href).toBeTruthy()
    }, { timeout: 2000 })
  })

  it('should still redirect when incrementAccess fails', async () => {
    const mockLink = {
      id: '1',
      originalUrl: 'https://example.org',
      shortUrl: 'abc',
      accessCount: 0,
      createdAt: new Date().toISOString(),
    }

    vi.mocked(api.getLinkByShortUrl).mockResolvedValue(mockLink)
    vi.mocked(api.incrementAccess).mockRejectedValue(new Error('network'))

    render(<div />, { wrapper: createWrapper(['/abc']) })

    await waitFor(() => {
      expect(api.incrementAccess).toHaveBeenCalledWith('abc')
    })

    await waitFor(() => {
      expect(window.location.href).toBe('https://example.org')
    })
  })

  it('should show not found message when link does not exist', async () => {
    vi.mocked(api.getLinkByShortUrl).mockRejectedValue(
      new Error('Link not found'),
    )

    render(<div />, { wrapper: createWrapper(['/invalid-url']) })

    await waitFor(() => {
      expect(screen.getByText(/link não encontrado/i)).toBeInTheDocument()
    })
  })

  it('should show not found when shortUrl is missing', async () => {
    render(<div />, { wrapper: createWrapper(['/']) })

    await waitFor(() => {
      expect(screen.getByText(/link não encontrado/i)).toBeInTheDocument()
    })
  })

  it('should have link to home page in not found state', async () => {
    vi.mocked(api.getLinkByShortUrl).mockRejectedValue(
      new Error('Link not found'),
    )

    render(<div />, { wrapper: createWrapper(['/invalid-url']) })

    await waitFor(() => {
      expect(screen.getByText(/link não encontrado/i)).toBeInTheDocument()
    })

    const homeLink = screen.getByRole('link', { name: /brev\.ly/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should navigate to home when clicking link', async () => {
    vi.mocked(api.getLinkByShortUrl).mockRejectedValue(
      new Error('Link not found'),
    )

    const user = userEvent.setup()
    render(<div />, { wrapper: createWrapper(['/invalid-url']) })

    await waitFor(() => {
      expect(screen.getByText(/link não encontrado/i)).toBeInTheDocument()
    })

    const homeLink = screen.getByRole('link', { name: /brev\.ly/i })
    await user.click(homeLink)

    expect(homeLink).toHaveAttribute('href', '/')
  })
})
