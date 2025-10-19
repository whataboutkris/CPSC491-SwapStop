import { test, expect } from '@playwright/test'

test.describe('Contact Page', () => {
  test('renders hero + tiles + form', async ({ page }) => {
    await page.goto('/contact')

    // Hero heading
    await expect(page.getByRole('heading', { name: /contact us/i })).toBeVisible()
    // Logo alt text
    await expect(page.getByRole('img', { name: /swapstop logo - hero/i })).toBeVisible()
    // Tagline snippet
    await expect(page.getByText(/have questions, feedback, or need support\?/i)).toBeVisible()

    // Check all tiles (Email / Phone / Address) — link verification
    // Email tile
    const emailLink = page.getByRole('link', { name: /email/i })
    await expect(emailLink).toHaveAttribute('href', 'mailto:StopSwap@outlook.com')
    await expect(page.getByText(/stopswap@outlook\.com/i)).toBeVisible()

    // Phone tile 
    const phoneLink = page.getByRole('link', { name: /\+1 \(800\) 555-1234/i })
    await expect(phoneLink).toHaveAttribute('href', 'tel:+18005551234')

    // Address tile
    const addressLink = page.getByRole('link', { name: /address/i })
    await expect(addressLink).toHaveAttribute(
      'href',
      /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=800\+N\+State\+College\+Blvd/i
    )
    await expect(addressLink).toHaveAttribute('target', '_blank')
    await expect(addressLink).toHaveAttribute('rel', /noopener/i)

    // Contact form fields + submit button
    await expect(page.getByPlaceholder(/enter your name/i)).toBeVisible()
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/write your message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
  })

  test('typing into the contact form works (no mail client open in CI)', async ({ page }) => {
    await page.goto('/contact')

    await page.getByPlaceholder(/enter your name/i).fill('Juan Cisneros')
    await page.getByPlaceholder(/enter your email/i).fill('juan@example.com')
    await page.getByPlaceholder(/write your message/i).fill('Hello SwapStop!')

    // assert fields contain typed text:
    await expect(page.getByPlaceholder(/enter your name/i)).toHaveValue('Juan Cisneros')
    await expect(page.getByPlaceholder(/enter your email/i)).toHaveValue('juan@example.com')
    await expect(page.getByPlaceholder(/write your message/i)).toHaveValue('Hello SwapStop!')
  })
})
