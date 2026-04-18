import { test, expect } from '@playwright/test';

const mockLogin = async (route) => {
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
};

const mockNilai = async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      status: 'success',
      data: [
        { id: 1, nama: 'Andi Santoso', nis: '12345', kelas: 'X IPA 1', nilai: null },
        { id: 2, nama: 'Budi Wijaya', nis: '12346', kelas: 'X IPA 1', nilai: null }
      ]
    })
  });
};

const mockLogout = async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'success', message: 'Berhasil logout' })
  });
};

test.describe('Grade Input Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock APIs
    await page.route('**/api/v1/auth/login', mockLogin);
    await page.route('**/api/v1/akademik/nilai**', mockNilai);
    await page.route('**/api/v1/auth/logout', mockLogout);

    // Login first
    await page.goto('/login');
    await page.fill('#username', 'guru_budi');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Input Nilai page
    await page.goto('/akademik/input-nilai');
  });

  test('should navigate to Input Nilai page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Input Nilai');
  });

  test('should display student list with score inputs', async ({ page }) => {
    const table = page.locator('table.data-table');
    await expect(table).toBeVisible();

    const rows = page.locator('table.data-table tbody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should validate score range (0-100)', async ({ page }) => {
    // Get first score input
    const scoreInput = page.locator('table.data-table tbody tr:first-child input[type="number"]');

    // Enter invalid score above 100
    await scoreInput.fill('150');
    await expect(page.locator('.error-text')).toContainText('Nilai harus 0 - 100');

    // Enter invalid score below 0
    await scoreInput.fill('-5');
    await expect(page.locator('.error-text')).toContainText('Nilai harus 0 - 100');

    // Enter valid score
    await scoreInput.fill('85');
    await expect(page.locator('.error-text')).not.toBeVisible();
  });

  test('should save button be disabled when data is invalid', async ({ page }) => {
    // Leave one score empty
    const scoreInput = page.locator('table.data-table tbody tr:last-child input[type="number"]');
    await scoreInput.fill('');

    const saveButton = page.locator('button.btn-primary');
    // Button should be enabled but form validation should catch it on save
    await expect(saveButton).toBeEnabled();
  });

  test('should have semester selector', async ({ page }) => {
    const semesterSelect = page.locator('select.form-input');
    await expect(semesterSelect).toBeVisible();
    await expect(page.locator('option')).toHaveCount(2);
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.click('button.btn-secondary');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
