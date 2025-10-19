import { test, expect } from '@playwright/test'

test.describe('About Page', () => {
  test('direct load renders all key sections', async ({ page }) => {
    await page.goto('/About')

    // Hero
    const hero = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { level: 1, name: /about swapstop/i }) })
    
    await expect(hero.getByRole('img', { name: /swapstop logo/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /about swapstop/i })).toBeVisible()
    await expect(
      page.getByText(/unique e-commerce platform.*second life/i)
    ).toBeVisible()

    // Sections
    await expect(page.getByRole('heading', { level: 2, name: /our mission/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /how swapstop works/i })).toBeVisible()

    // Founders section
    await expect(page.getByRole('heading', { level: 2, name: /meet our founders/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /founder 1/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /founder 2/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /founder 3/i })).toBeVisible()

    await expect(page.getByRole('heading', { level: 3, name: /bryant martinez/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /kristian losenara/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /juan cisneros/i })).toBeVisible()

    // CTA section at bottom
    await expect(page.getByRole('heading', { level: 2, name: /join our community/i })).toBeVisible()
    const contactCta = page.getByRole('link', { name: /contact us/i })
    await expect(contactCta).toBeVisible()
    await expect(contactCta).toHaveAttribute('href', '/contact')

    // Footer year
    const year = new Date().getFullYear().toString()
    await expect(page.locator('footer')).toContainText(year)
    await expect(page.locator('footer')).toContainText(/swapstop/i)
  })

  test('navigate from Landing via Learn More', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /learn more/i }).click()
    await expect(page).toHaveURL(/\/About$/)
    await expect(page.getByRole('heading', { level: 1, name: /about swapstop/i })).toBeVisible()
  })
})
