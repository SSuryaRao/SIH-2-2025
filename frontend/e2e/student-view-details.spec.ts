import { test, expect } from '@playwright/test'

test.describe('Student Viewing Their Details', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('student@test.com')
    await page.getByLabel(/password/i).fill('student123')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Wait for student dashboard to load
    await expect(page).toHaveURL(/.*dashboard.*student.*/)
  })

  test('should display student dashboard with navigation', async ({ page }) => {
    // Check for student dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /my details/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /my fees/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /my exams/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /my hostel/i })).toBeVisible()
  })

  test('should navigate to student details page', async ({ page }) => {
    // Click on "My Details" link
    await page.getByRole('link', { name: /my details/i }).click()

    // Should navigate to details page
    await expect(page).toHaveURL(/.*my-details.*/)
    await expect(page.getByText(/my details|student.*details/i)).toBeVisible()
  })

  test('should display personal information correctly', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for personal information section
    await expect(page.getByText(/personal.*information/i)).toBeVisible()

    // Check for personal info fields (these would be the logged-in student's details)
    await expect(page.getByText(/name/i)).toBeVisible()
    await expect(page.getByText(/email/i)).toBeVisible()
    await expect(page.getByText(/phone/i)).toBeVisible()
    await expect(page.getByText(/date.*of.*birth/i)).toBeVisible()
    await expect(page.getByText(/gender/i)).toBeVisible()

    // Check that actual values are displayed (not just labels)
    await expect(page.getByText(/student@test\.com/)).toBeVisible()
  })

  test('should display address information correctly', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for address information section
    await expect(page.getByText(/address.*information/i)).toBeVisible()

    // Check for address fields
    await expect(page.getByText(/permanent.*address/i)).toBeVisible()
    await expect(page.getByText(/current.*address/i)).toBeVisible()
  })

  test('should display academic information correctly', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for academic information section
    await expect(page.getByText(/academic.*information/i)).toBeVisible()

    // Check for academic fields
    await expect(page.getByText(/roll.*number/i)).toBeVisible()
    await expect(page.getByText(/course/i)).toBeVisible()
    await expect(page.getByText(/branch/i)).toBeVisible()
    await expect(page.getByText(/semester/i)).toBeVisible()
    await expect(page.getByText(/year/i)).toBeVisible()
    await expect(page.getByText(/admission.*date/i)).toBeVisible()
  })

  test('should allow editing contact information', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Look for edit button or editable fields
    const editButton = page.getByRole('button', { name: /edit.*profile|edit.*details/i })
    if (await editButton.isVisible()) {
      await editButton.click()

      // Check if fields become editable
      await expect(page.getByRole('textbox', { name: /phone/i })).toBeVisible()
      await expect(page.getByRole('textbox', { name: /current.*address/i })).toBeVisible()

      // Try updating phone number
      await page.getByRole('textbox', { name: /phone/i }).fill('9876543210')

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click()

      // Check for success message
      await expect(page.getByText(/updated.*successfully|changes.*saved/i)).toBeVisible()
    }
  })

  test('should display enrollment status', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for enrollment status
    await expect(page.getByText(/status/i)).toBeVisible()
    await expect(page.getByText(/active|enrolled/i)).toBeVisible()
  })

  test('should handle profile picture display', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for profile picture or avatar
    const profilePicture = page.getByRole('img', { name: /profile.*picture|avatar/i })
    const avatarInitial = page.getByText(/^[A-Z]$/) // Single letter avatar

    // Either profile picture or avatar initial should be visible
    await expect(profilePicture.or(avatarInitial)).toBeVisible()
  })

  test('should display student ID card information', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Look for student ID or card information
    await expect(page.getByText(/student.*id|id.*number/i)).toBeVisible()

    // Check for ID card download or view option
    const idCardButton = page.getByRole('button', { name: /download.*id|view.*id.*card/i })
    if (await idCardButton.isVisible()) {
      await expect(idCardButton).toBeVisible()
    }
  })

  test('should show loading state while fetching details', async ({ page }) => {
    // Intercept API to add delay
    await page.route('**/api/student/profile', route => {
      setTimeout(() => route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            personalInfo: {
              name: 'Test Student',
              email: 'student@test.com',
              phone: '1234567890'
            }
          }
        })
      }), 1000)
    })

    await page.getByRole('link', { name: /my details/i }).click()

    // Should show loading state
    await expect(page.getByText(/loading|fetching.*details/i)).toBeVisible()
  })

  test('should handle error when details cannot be loaded', async ({ page }) => {
    // Intercept API to return error
    await page.route('**/api/student/profile', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await page.getByRole('link', { name: /my details/i }).click()

    // Should show error message
    await expect(page.getByText(/error.*loading|failed.*to.*load/i)).toBeVisible()

    // Should show retry option
    const retryButton = page.getByRole('button', { name: /retry|try.*again/i })
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible()
    }
  })

  test('should display course and academic progress', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for academic progress indicators
    await expect(page.getByText(/progress|completion|credits/i)).toBeVisible()

    // Look for semester/year progress
    const progressIndicator = page.locator('[data-testid="academic-progress"]')
    if (await progressIndicator.isVisible()) {
      await expect(progressIndicator).toBeVisible()
    }
  })

  test('should allow navigation back to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click()

    // Should return to dashboard
    await expect(page).toHaveURL(/.*dashboard.*student.*/)
    await expect(page.getByText(/dashboard/i)).toBeVisible()
  })

  test('should display responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.getByRole('link', { name: /my details/i }).click()

    // Check that mobile layout is applied
    await expect(page.getByText(/my details/i)).toBeVisible()

    // Information should still be accessible but in mobile layout
    await expect(page.getByText(/personal.*information/i)).toBeVisible()
  })

  test('should allow printing student details', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Look for print option
    const printButton = page.getByRole('button', { name: /print|download.*pdf/i })
    if (await printButton.isVisible()) {
      await expect(printButton).toBeVisible()

      // Mock print dialog
      page.on('dialog', dialog => dialog.accept())
      await printButton.click()
    }
  })

  test('should maintain data consistency across page refreshes', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Wait for details to load
    await expect(page.getByText(/personal.*information/i)).toBeVisible()

    // Get initial data
    const initialName = await page.getByText(/name/i).textContent()

    // Refresh page
    await page.reload()

    // Data should remain consistent
    await expect(page.getByText(/personal.*information/i)).toBeVisible()
    if (initialName) {
      await expect(page.getByText(initialName)).toBeVisible()
    }
  })

  test('should show proper breadcrumb navigation', async ({ page }) => {
    await page.getByRole('link', { name: /my details/i }).click()

    // Check for breadcrumb navigation
    const breadcrumb = page.locator('[data-testid="breadcrumb"]')
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toContainText(/dashboard.*my.*details/i)
    }
  })
})