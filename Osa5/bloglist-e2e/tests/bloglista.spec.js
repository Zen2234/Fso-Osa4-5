const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown by default', async ({ page }) => {
    const inputs = page.getByRole('textbox')
    await expect(inputs.nth(0)).toBeVisible()
    await expect(inputs.nth(1)).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      const inputs = page.getByRole('textbox')
      await inputs.nth(0).fill('mluukkai')
      await inputs.nth(1).fill('salainen')
      await page.getByRole('button', { name: /login/i }).click()
      await expect(page.getByText('Matti Luukkainen logged in successfully')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      const inputs = page.getByRole('textbox')
      await inputs.nth(0).fill('mluukkai')
      await inputs.nth(1).fill('väärä salasana')
      await page.getByRole('button', { name: /login/i }).click()

      const error = page.locator('text=Wrong username or password')
      await expect(error).toBeVisible()
      await expect(page.locator('text=Matti Luukkainen logged in')).not.toBeVisible()
    })
  })
})
