import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()) })
  page.on('pageerror', err => console.error('[pageerror]', err.message))
})

test('Home renders with correct CTAs', async ({ page }) => {
  await page.goto('/') 

  //  heading
  await expect(
    page.getByRole('heading', { name: /revolutionize your trading experience/i })
  ).toBeVisible()

  // check links have the right hrefs
  await expect(page.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register')
  await expect(page.getByRole('link', { name: /learn more/i })).toHaveAttribute('href', '/about')

  // Features section is visible
  await expect(page.getByRole('heading', { name: /why choose swapstop\?/i })).toBeVisible()

  // Footer contains current year + SwapStop
  const year = new Date().getFullYear().toString()
  await expect(page.locator('footer')).toContainText(year)
  await expect(page.locator('footer')).toContainText(/swapstop/i)
})

test('Learn More link navigates to About', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /learn more/i }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole('heading', { name: /about/i })).toBeVisible()
})
