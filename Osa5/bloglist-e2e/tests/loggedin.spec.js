const { test, expect } = require('@playwright/test')

test.describe('When logged in', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'password'
      }
    })

    await page.goto('http://localhost:5173')

    const inputs = page.getByRole('textbox')
    await inputs.nth(0).fill('testuser')
    await inputs.nth(1).fill('password')
    await page.getByRole('button', { name: /login/i }).click()
    await expect(page.getByText(/Test User logged in successfully/i).first()).toBeVisible()
  })

  test('a new blog can be created', async ({ page }) => {
    await page.getByRole('button', { name: /new blog/i }).click()

    const titleInput = page.getByRole('textbox', { name: 'Title' })
    const authorInput = page.getByRole('textbox', { name: 'Author' })
    const urlInput = page.getByRole('textbox', { name: 'URL' })

    await titleInput.fill('Playwright Test Blog')
    await authorInput.fill('Playwright')
    await urlInput.fill('https://playwright.dev')

    await page.getByRole('button', { name: /create/i }).click()

    await expect(page.getByText('Playwright Test Blog').first()).toBeVisible()
  })

  test('a blog can be liked', async ({ page }) => {
    await page.getByRole('button', { name: /new blog/i }).click()
    const titleInput = page.getByRole('textbox', { name: 'Title' })
    const authorInput = page.getByRole('textbox', { name: 'Author' })
    const urlInput = page.getByRole('textbox', { name: 'URL' })

    await titleInput.fill('Likeable Blog')
    await authorInput.fill('Playwright')
    await urlInput.fill('https://playwright.dev')
    await page.getByRole('button', { name: /create/i }).click()

    const blogLocator = page.locator('text=Likeable Blog').first()
    await expect(blogLocator).toBeVisible()

    const blogContainer = blogLocator.locator('xpath=ancestor::div[1]')

    const viewButton = blogContainer.getByRole('button', { name: /view/i }).first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
    }

    const likeCounter = blogContainer.locator('xpath=.//text()[contains(., "likes")]/parent::*').first()
    await likeCounter.waitFor({ state: 'visible' })
    const initialLikes = parseInt((await likeCounter.textContent()).match(/\d+/)[0])

    const likeButton = blogContainer.getByRole('button', { name: /like/i }).first()
    await likeButton.click()

    await expect(likeCounter).toHaveText(new RegExp(`likes\\s*${initialLikes + 1}`))
  })
})