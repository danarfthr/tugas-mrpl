import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
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
    await page.goto('/login');
  });

  test('should display login form correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sistem Informasi Terpadu');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error when username is empty', async ({ page }) => {
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-danger')).toContainText('Username dan Password wajib diisi');
  });

  test('should show error when password is empty', async ({ page }) => {
    await page.fill('#username', 'guru_budi');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-danger')).toContainText('Username dan Password wajib diisi');
  });

  test('should show error on failed login with invalid credentials', async ({ page }) => {
    // Mock 401 error for invalid credentials
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', message: 'Kredensial tidak valid' })
      });
    });
    await page.fill('#username', 'invalid_user');
    await page.fill('#password', 'wrong_password');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-danger')).toBeVisible();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.fill('#username', 'guru_budi');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
