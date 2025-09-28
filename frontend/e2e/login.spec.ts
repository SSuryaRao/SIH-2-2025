import { test, expect } from '@playwright/test'

test.describe('User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test('should display login form', async ({ page }) => {
    // Check if we're redirected to login page or if login form is visible
    await expect(page).toHaveURL(/.*login.*/)

    // Check for login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login')

    // Try to submit without filling fields
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Check for validation errors
    await expect(page.getByText(/email.*required|please enter.*email/i)).toBeVisible()
    await expect(page.getByText(/password.*required|please enter.*password/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')

    // Submit the form
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Check for error message
    await expect(page.getByText(/invalid.*credentials|login.*failed/i)).toBeVisible()
  })

  test('should successfully login with valid admin credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in valid admin credentials (these would be test credentials)
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('admin123')

    // Submit the form
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/.*dashboard.*admin.*/)

    // Check for dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    await expect(page.getByText(/admin/i)).toBeVisible()
  })

  test('should successfully login with valid student credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in valid student credentials
    await page.getByLabel(/email/i).fill('student@test.com')
    await page.getByLabel(/password/i).fill('student123')

    // Submit the form
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Wait for navigation to student dashboard
    await expect(page).toHaveURL(/.*dashboard.*student.*/)

    // Check for student dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    await expect(page.getByText(/my details|my fees|my exams/i)).toBeVisible()
  })

  test('should remember user session', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard.*/)

    // Create a new page in the same context (same session)
    const newPage = await context.newPage()
    await newPage.goto('/')

    // Should be redirected to dashboard, not login
    await expect(newPage).toHaveURL(/.*dashboard.*/)
  })

  test('should redirect to appropriate dashboard based on role', async ({ page }) => {
    // Test staff login
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('staff@test.com')
    await page.getByLabel(/password/i).fill('staff123')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Should redirect to staff dashboard
    await expect(page).toHaveURL(/.*dashboard.*staff.*/)
  })

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login')

    // Fill credentials
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('admin123')

    // Click submit and immediately check for loading state
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Check for loading indicator (spinner or disabled button)
    await expect(page.getByRole('button', { name: /signing in|loading/i })).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail API requests
    await page.route('**/api/auth/**', route => route.abort())

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Should show network error
    await expect(page.getByText(/network.*error|connection.*failed/i)).toBeVisible()
  })

  test('should allow logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    await expect(page).toHaveURL(/.*dashboard.*/)

    // Find and click logout button
    await page.getByRole('button', { name: /logout|sign out/i }).click()

    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/)

    // Should not be able to access dashboard without login
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL(/.*login.*/)
  })
})