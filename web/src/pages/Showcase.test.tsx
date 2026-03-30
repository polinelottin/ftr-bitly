import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import Showcase from './Showcase'

describe('Showcase', () => {
  it('should render component showcase heading', () => {
    render(<Showcase />)
    expect(screen.getByText(/component showcase/i)).toBeInTheDocument()
  })

  it('should render buttons section', () => {
    render(<Showcase />)
    const buttonsHeading = screen.getAllByText(/buttons/i)
    expect(buttonsHeading.length).toBeGreaterThan(0)
  })

  it('should render primary buttons', () => {
    render(<Showcase />)
    expect(screen.getByText(/primary variant/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /primary button/i })).toBeInTheDocument()
  })

  it('should render secondary buttons', () => {
    render(<Showcase />)
    expect(screen.getByText(/secondary variant/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /secondary button/i })).toBeInTheDocument()
  })

  it('should render inputs section', () => {
    render(<Showcase />)
    expect(screen.getByText(/inputs/i)).toBeInTheDocument()
  })

  it('should render form example section', () => {
    render(<Showcase />)
    expect(screen.getByText(/form example/i)).toBeInTheDocument()
  })

  it('should render all input variations', () => {
    render(<Showcase />)
    const urlInputs = screen.getAllByLabelText(/url/i)
    expect(urlInputs.length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('should render disabled buttons', () => {
    render(<Showcase />)
    const disabledButtons = screen.getAllByRole('button', { name: /disabled/i })
    expect(disabledButtons.length).toBeGreaterThan(0)
  })

  it('should render buttons with icons', () => {
    render(<Showcase />)
    const copyButtons = screen.getAllByRole('button', { name: /copy/i })
    expect(copyButtons.length).toBeGreaterThan(0)
    const downloadButtons = screen.getAllByRole('button', { name: /download/i })
    expect(downloadButtons.length).toBeGreaterThan(0)
  })

  it('should have correct container classes', () => {
    render(<Showcase />)
    const container = screen.getByText(/component showcase/i).closest('.min-h-screen')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('min-h-screen')
  })
})
