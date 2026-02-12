const { test, expect } = require('@playwright/test')

test.describe('Blog deletion', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')

    await request.post('http://localhost:3003/api/users', {
      data: { name: 'Creator User', username: 'creator', password: 'secret' }
    })

    await request.post('http://localhost:3003/api/users', {
      data: { name: 'Other User', username: 'other', password: 'secret' }
    })

    await page.goto('http://localhost:5173')
  })

  test('blog creator can delete their blog', async ({ page }) => {
  const inputs = page.getByRole('textbox')
  await inputs.nth(0).fill('creator')
  await inputs.nth(1).fill('secret')
  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByText(/Creator User logged in successfully/i)).toBeVisible()

  await page.getByRole('button', { name: /new blog/i }).click()
  await page.getByRole('textbox', { name: 'Title' }).fill('Deletable Blog')
  await page.getByRole('textbox', { name: 'Author' }).fill('Playwright')
  await page.getByRole('textbox', { name: 'URL' }).fill('https://playwright.dev')
  await page.getByRole('button', { name: /create/i }).click()

  const blog = page.locator('div', { hasText: /^Deletable Blog\b/ }).first()
  await expect(blog).toBeVisible()

  const viewButton = blog.getByRole('button', { name: /view/i })
  if (await viewButton.isVisible()) {
    await viewButton.click()
  }

  page.on('dialog', dialog => dialog.accept())

  const deleteButton = blog.getByRole('button', { name: /delete/i })
  await expect(deleteButton).toBeVisible()
  await deleteButton.click()

  await expect(blog).not.toBeVisible()
})

  test('only creator sees the delete button', async ({ page }) => {
    const inputs = page.getByRole('textbox')
    await inputs.nth(0).fill('creator')
    await inputs.nth(1).fill('secret')
    await page.getByRole('button', { name: /login/i }).click()
    await page.getByRole('button', { name: /new blog/i }).click()
    await page.getByRole('textbox', { name: 'Title' }).fill('Private Blog')
    await page.getByRole('textbox', { name: 'Author' }).fill('Playwright')
    await page.getByRole('textbox', { name: 'URL' }).fill('https://playwright.dev')
    await page.getByRole('button', { name: /create/i }).click()
    await page.getByRole('button', { name: /logout/i }).click()

    await inputs.nth(0).fill('other')
    await inputs.nth(1).fill('secret')
    await page.getByRole('button', { name: /login/i }).click()

    const blog = page.getByText('Private Blog').locator('xpath=ancestor::div[1]')
    const viewButton = blog.getByRole('button', { name: /view/i })
    if (await viewButton.isVisible()) await viewButton.click()

    const deleteButton = blog.getByRole('button', { name: /remove/i })
    await expect(deleteButton).not.toBeVisible()
  })
})
