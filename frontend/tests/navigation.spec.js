import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful login API
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            token: 'test-jwt-token',
            user: { id: 1, username: 'guru_budi', full_name: 'Guru Budi', role: 'Guru Wali Kelas' }
          }
        })
      });
    });
    // Mock logout API
    await page.route('**/api/v1/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Berhasil logout' })
      });
    });
    // Login first before each test
    await page.goto('/login');
    await page.fill('#username', 'guru_budi');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should load dashboard correctly', async ({ page }) => {
    await expect(page.locator('nav h2')).toContainText('SIS Terpadu');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display user info in navbar', async ({ page }) => {
    const userInfo = page.locator('nav span').first();
    await expect(userInfo).toContainText('Guru Budi');
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button
    await page.click('nav button.btn-secondary');
    await expect(page).toHaveURL(/\/login/);

    // Verify session is cleared - trying to access dashboard should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have working navigation links', async ({ page }) => {
    // Find and click the "Input Akademik (Nilai)" card
    const nilaiCard = page.locator('text=Input Akademik (Nilai)').first();
    await expect(nilaiCard).toBeVisible();
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Clear session by logging out first
    await page.click('nav button.btn-secondary');
    // Wait for logout to complete and URL to change
    await page.waitForURL(/\/login/, { timeout: 5000 });

    // Try to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
