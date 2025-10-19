import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock NavBar
vi.mock('../components/NavBar', () => ({
  default: () => <nav>Nav</nav>,
}))

import Contact from '../pages/Contact'

// Helper to render with a router, check links
const renderPage = () =>
  render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>
  )

describe('Contact page', () => {
  it('renders hero heading and tagline', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 1, name: /contact us/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('img', { name: /swapstop logo - hero/i })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/have questions, feedback, or need support\?/i)
    ).toBeInTheDocument()
  })

  it('shows Email, Phone, and Address tiles with correct links', () => {
    renderPage()

    // Email
    const emailLink = screen.getByRole('link', { name: /email/i })
    expect(screen.getByText(/stopswap@outlook\.com/i)).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:StopSwap@outlook.com')

    // Phone
    const phoneLink = screen.getByRole('link', { name: /\+1 \(800\) 555-1234/i })
    expect(phoneLink).toHaveAttribute('href', 'tel:+18005551234')

    // Address
    const addressLink = screen.getByRole('link', { name: /address/i })
    expect(addressLink).toHaveAttribute(
      'href',
      expect.stringContaining('https://www.google.com/maps/search/?api=1&query=800+N+State+College+Blvd')
    )
    expect(addressLink).toHaveAttribute('target', '_blank')
    expect(addressLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('renders the contact form inputs and submit button', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/write your message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  describe('form submission', () => {
    const originalLocation = window.location

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '', assign: vi.fn(), replace: vi.fn(), reload: vi.fn() },
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      })
    })

    // Mock Contact Form
    it('builds a mailto: URL with encoded subject/body and sets window.location.href', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByPlaceholderText(/enter your name/i), 'Juan Cisneros')
      await user.type(screen.getByPlaceholderText(/enter your email/i), 'juan@example.com')
      await user.type(screen.getByPlaceholderText(/write your message/i), 'Hello SwapStop!')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      const expectedSubject = encodeURIComponent('Message from SwapStop Contact Form')
      const expectedBody = encodeURIComponent(
        `Name: Juan Cisneros\nEmail: juan@example.com\n\nMessage:\nHello SwapStop!`
      )

      expect(window.location.href).toBe(
        `mailto:StopSwap@outlook.com?subject=${expectedSubject}&body=${expectedBody}`
      )
    })
  })

  it('renders footer with the current year', () => {
    renderPage()
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(`${year}.*SwapStop`, 'i'))).toBeInTheDocument()
  })
})
