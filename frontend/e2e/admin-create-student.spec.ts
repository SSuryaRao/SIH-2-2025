import { test, expect } from '@playwright/test'

test.describe('Admin Creating New Student', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard.*admin.*/)

    // Navigate to students page
    await page.getByRole('link', { name: /students/i }).click()
    await expect(page).toHaveURL(/.*students.*/)
  })

  test('should display students page with add button', async ({ page }) => {
    // Check for students page elements
    await expect(page.getByText(/students/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add.*student|new.*student/i })).toBeVisible()
  })

  test('should open student form modal when add button is clicked', async ({ page }) => {
    // Click add student button
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Check if modal is open
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/add.*new.*student/i)).toBeVisible()

    // Check for form sections
    await expect(page.getByText(/personal.*information/i)).toBeVisible()
    await expect(page.getByText(/address.*information/i)).toBeVisible()
    await expect(page.getByText(/academic.*information/i)).toBeVisible()
  })

  test('should show validation errors for required fields', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Try to submit empty form
    await page.getByRole('button', { name: /add.*student/i }).click()

    // Check for validation errors
    await expect(page.getByText(/name.*required|name.*must.*be/i)).toBeVisible()
    await expect(page.getByText(/email.*required|please.*enter.*email/i)).toBeVisible()
    await expect(page.getByText(/phone.*required|phone.*must.*be/i)).toBeVisible()
  })

  test('should successfully create a new student with valid data', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Fill personal information
    await page.getByLabel(/full.*name|name/i).fill('John Doe Test')
    await page.getByLabel(/email/i).fill('johntest@example.com')
    await page.getByLabel(/phone/i).fill('1234567890')
    await page.getByLabel(/date.*of.*birth/i).fill('2000-01-15')

    // Select gender
    await page.getByRole('combobox', { name: /gender/i }).click()
    await page.getByRole('option', { name: /male/i }).click()

    // Fill address information
    await page.getByLabel(/permanent.*address/i).fill('123 Main St, City, State 12345')
    await page.getByLabel(/current.*address/i).fill('456 College Ave, Campus, State 54321')

    // Fill academic information
    await page.getByLabel(/roll.*number/i).fill('CS2024001')

    // Select course
    await page.getByRole('combobox', { name: /course/i }).click()
    await page.getByRole('option', { name: /b\.tech/i }).click()

    // Select branch
    await page.getByRole('combobox', { name: /branch/i }).click()
    await page.getByRole('option', { name: /computer.*science/i }).click()

    // Select semester
    await page.getByRole('combobox', { name: /semester/i }).click()
    await page.getByRole('option', { name: /1/i }).click()

    // Select year
    await page.getByRole('combobox', { name: /year/i }).click()
    await page.getByRole('option', { name: /year.*1/i }).click()

    // Set admission date
    await page.getByLabel(/admission.*date/i).fill('2024-01-01')

    // Submit form
    await page.getByRole('button', { name: /add.*student/i }).click()

    // Check for success message
    await expect(page.getByText(/student.*created.*successfully|student.*added/i)).toBeVisible()

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // New student should appear in the list
    await expect(page.getByText('John Doe Test')).toBeVisible()
    await expect(page.getByText('johntest@example.com')).toBeVisible()
    await expect(page.getByText('CS2024001')).toBeVisible()
  })

  test('should handle duplicate email validation', async ({ page }) => {
    // Try to create student with existing email
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Fill form with duplicate email
    await page.getByLabel(/full.*name/i).fill('Jane Doe')
    await page.getByLabel(/email/i).fill('existing@example.com') // Assuming this exists
    await page.getByLabel(/phone/i).fill('9876543210')
    await page.getByLabel(/date.*of.*birth/i).fill('2001-05-20')

    // Fill required fields quickly
    await page.getByRole('combobox', { name: /gender/i }).click()
    await page.getByRole('option', { name: /female/i }).click()

    await page.getByLabel(/permanent.*address/i).fill('Address')
    await page.getByLabel(/current.*address/i).fill('Address')
    await page.getByLabel(/roll.*number/i).fill('CS2024002')

    await page.getByRole('combobox', { name: /course/i }).click()
    await page.getByRole('option', { name: /b\.tech/i }).click()

    await page.getByRole('combobox', { name: /branch/i }).click()
    await page.getByRole('option', { name: /computer.*science/i }).click()

    await page.getByRole('combobox', { name: /semester/i }).click()
    await page.getByRole('option', { name: /1/i }).click()

    await page.getByRole('combobox', { name: /year/i }).click()
    await page.getByRole('option', { name: /year.*1/i }).click()

    await page.getByLabel(/admission.*date/i).fill('2024-01-01')

    // Submit form
    await page.getByRole('button', { name: /add.*student/i }).click()

    // Should show error for duplicate email
    await expect(page.getByText(/email.*already.*exists|duplicate.*email/i)).toBeVisible()
  })

  test('should handle duplicate roll number validation', async ({ page }) => {
    // Similar test for duplicate roll number
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Fill form with duplicate roll number
    await page.getByLabel(/full.*name/i).fill('Bob Smith')
    await page.getByLabel(/email/i).fill('bob@example.com')
    await page.getByLabel(/phone/i).fill('5555555555')
    await page.getByLabel(/roll.*number/i).fill('EXISTING001') // Assuming this exists

    // Fill other required fields
    await page.getByLabel(/date.*of.*birth/i).fill('1999-12-10')
    await page.getByRole('combobox', { name: /gender/i }).click()
    await page.getByRole('option', { name: /male/i }).click()

    await page.getByLabel(/permanent.*address/i).fill('Address')
    await page.getByLabel(/current.*address/i).fill('Address')

    await page.getByRole('combobox', { name: /course/i }).click()
    await page.getByRole('option', { name: /b\.tech/i }).click()

    await page.getByRole('combobox', { name: /branch/i }).click()
    await page.getByRole('option', { name: /computer.*science/i }).click()

    await page.getByRole('combobox', { name: /semester/i }).click()
    await page.getByRole('option', { name: /1/i }).click()

    await page.getByRole('combobox', { name: /year/i }).click()
    await page.getByRole('option', { name: /year.*1/i }).click()

    await page.getByLabel(/admission.*date/i).fill('2024-01-01')

    // Submit form
    await page.getByRole('button', { name: /add.*student/i }).click()

    // Should show error for duplicate roll number
    await expect(page.getByText(/roll.*number.*already.*exists|duplicate.*roll/i)).toBeVisible()
  })

  test('should allow canceling student creation', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Fill some data
    await page.getByLabel(/full.*name/i).fill('Cancel Test')

    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click()

    // Modal should close without saving
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Student should not be created
    await expect(page.getByText('Cancel Test')).not.toBeVisible()
  })

  test('should show loading state during student creation', async ({ page }) => {
    // Intercept API to delay response
    await page.route('**/api/students', route => {
      setTimeout(() => route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { id: '123' } })
      }), 2000)
    })

    // Fill and submit form
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Fill minimum required fields quickly
    await page.getByLabel(/full.*name/i).fill('Loading Test')
    await page.getByLabel(/email/i).fill('loading@test.com')
    await page.getByLabel(/phone/i).fill('1111111111')
    await page.getByLabel(/date.*of.*birth/i).fill('2000-01-01')
    await page.getByRole('combobox', { name: /gender/i }).click()
    await page.getByRole('option', { name: /male/i }).click()
    await page.getByLabel(/permanent.*address/i).fill('Address')
    await page.getByLabel(/current.*address/i).fill('Address')
    await page.getByLabel(/roll.*number/i).fill('LT001')
    await page.getByRole('combobox', { name: /course/i }).click()
    await page.getByRole('option', { name: /b\.tech/i }).click()
    await page.getByRole('combobox', { name: /branch/i }).click()
    await page.getByRole('option', { name: /computer.*science/i }).click()
    await page.getByRole('combobox', { name: /semester/i }).click()
    await page.getByRole('option', { name: /1/i }).click()
    await page.getByRole('combobox', { name: /year/i }).click()
    await page.getByRole('option', { name: /year.*1/i }).click()
    await page.getByLabel(/admission.*date/i).fill('2024-01-01')

    // Submit and check for loading state
    await page.getByRole('button', { name: /add.*student/i }).click()

    // Should show loading state
    await expect(page.getByRole('button', { name: /adding|loading/i })).toBeVisible()

    // Button should be disabled
    await expect(page.getByRole('button', { name: /adding|loading/i })).toBeDisabled()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/full.*name/i).click() // Trigger validation

    // Should show email format error
    await expect(page.getByText(/please.*enter.*valid.*email|email.*address.*invalid/i)).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    await page.getByRole('button', { name: /add.*student|new.*student/i }).click()

    // Enter invalid phone
    await page.getByLabel(/phone/i).fill('123')
    await page.getByLabel(/full.*name/i).click() // Trigger validation

    // Should show phone format error
    await expect(page.getByText(/phone.*must.*be.*10.*digits|invalid.*phone/i)).toBeVisible()
  })
})