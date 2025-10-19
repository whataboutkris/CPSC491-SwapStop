
import { test, expect } from '@playwright/test'

// runtime errors into CI logs
test.beforeEach(async ({ page }) => {
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()) })
  page.on('pageerror', err => console.error('[pageerror]', err.message))
})

test.describe('About', () => {
  test('direct load renders all key sections (via nav)', async ({ page }) => {
    await page.goto('/')                                  // start at home
    await page.getByRole('link', { name: /learn more/i }).click()
    await expect(page).toHaveURL(/\/about$/)

    
    await expect(page.getByRole('heading', { level: 1, name: /about swapstop/i })).toBeVisible()

    // assertions
    await expect(page.getByRole('heading', { level: 2, name: /our mission/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /how swapstop works/i })).toBeVisible()
  })
})
