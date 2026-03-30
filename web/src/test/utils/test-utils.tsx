/* eslint-disable react-refresh/only-export-components */
import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Helper para criar QueryClient para testes
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

// Função customizada de render que inclui providers
function customRender(
  ui: ReactNode,
  options?: RenderOptions,
) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  })
}

// Re-exportar tudo
export * from '@testing-library/react'
export { customRender as render }
