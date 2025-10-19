import { test, expect } from '@playwright/test'

// runtime errors in CI logs
test.beforeEach(async ({ page }) => {
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()) })
  page.on('pageerror', err => console.error('[pageerror]', err.message))
})

test.describe('Contact Page', () => {
  test('renders hero + tiles + form (via nav)', async ({ page }) => {
    await page.goto('/')                                  // start at home
    await page.getByRole('link', { name: /^contact$/i }).click()
    await expect(page).toHaveURL(/\/contact$/)

    // Hero section
    const hero = page.locator('section').filter({
      has: page.getByRole('heading', { level: 1, name: /contact us/i })
    })

    await expect(hero.getByRole('heading', { level: 1, name: /contact us/i })).toBeVisible()
    await expect(hero.getByText(/have questions, feedback, or need support\?/i)).toBeVisible()

    // Tiles
    const emailLink = page.getByRole('link', { name: /email/i })
    await expect(emailLink).toHaveAttribute('href', 'mailto:StopSwap@outlook.com')
    await expect(page.getByText(/stopswap@outlook\.com/i)).toBeVisible()

    const phoneLink = page.getByRole('link', { name: /\+1 \(800\) 555-1234/i })
    await expect(phoneLink).toHaveAttribute('href', 'tel:+18005551234')

    const addressLink = page.getByRole('link', { name: /address/i })
    await expect(addressLink).toHaveAttribute(
      'href',
      /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=800\+N\+State\+College\+Blvd/i
    )
    await expect(addressLink).toHaveAttribute('target', '_blank')
    await expect(addressLink).toHaveAttribute('rel', /noopener/i)

    // Form fields
    await expect(page.getByPlaceholder(/enter your name/i)).toBeVisible()
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/write your message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
  })

  test('typing into the contact form works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /^contact$/i }).click()
    await expect(page).toHaveURL(/\/contact$/)

    await page.getByPlaceholder(/enter your name/i).fill('Juan Cisneros')
    await page.getByPlaceholder(/enter your email/i).fill('juan@example.com')
    await page.getByPlaceholder(/write your message/i).fill('Hello SwapStop!')

    await expect(page.getByPlaceholder(/enter your name/i)).toHaveValue('Juan Cisneros')
    await expect(page.getByPlaceholder(/enter your email/i)).toHaveValue('juan@example.com')
    await expect(page.getByPlaceholder(/write your message/i)).toHaveValue('Hello SwapStop!')
  })
})
