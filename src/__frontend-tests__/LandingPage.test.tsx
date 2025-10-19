
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect } from 'vitest'

// Mocks to isolate LandingPage, has import paths
vi.mock('../../components/NavBar', () => ({ default: () => <nav>Nav</nav> }))
vi.mock('../../components/ui/button', () => ({
  Button: (p: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => <button {...p} />
}))
vi.mock('../../components/VirtualAssistant', () => ({ default: () => <div role="dialog">Assistant</div> }))

import LandingPage from '../pages/LandingPage'

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )

describe('LandingPage', () => {
  it('renders the hero heading + CTAs and footer year', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /revolutionize your trading experience/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute('href', '/About')
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(`${year}.*SwapStop`, 'i'))).toBeInTheDocument()
  })

  it('renders the features section', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 2, name: /why choose swapstop\?/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /ai-powered trading/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /secure transactions/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /community driven/i })).toBeInTheDocument()
  })
})
