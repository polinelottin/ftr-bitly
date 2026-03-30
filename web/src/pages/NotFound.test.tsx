import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import NotFound from './NotFound'

describe('NotFound', () => {
  it('should render 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('should render page not found message', () => {
    render(<NotFound />)
    expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument()
  })

  it('should render description text', () => {
    render(<NotFound />)
    expect(
      screen.getByText(
        /a página que você está procurando não existe ou o link encurtado não foi encontrado/i,
      ),
    ).toBeInTheDocument()
  })

  it('should render link to home page', () => {
    render(<NotFound />)
    const homeLink = screen.getByRole('link', {
      name: /voltar para a página inicial/i,
    })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should have correct heading classes', () => {
    render(<NotFound />)
    const heading = screen.getByText('404')
    expect(heading).toHaveClass('text-6xl', 'font-bold')
  })

  it('should have correct container classes', () => {
    render(<NotFound />)
    const container = screen.getByText('404').closest('.min-h-screen')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('min-h-screen', 'bg-gray-100')
  })
})
