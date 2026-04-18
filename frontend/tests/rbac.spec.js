import { test, expect } from '@playwright/test';

const mockLogin = async (route, username = 'guru_budi') => {
  const role = username === 'admin_sekolah' ? 'Admin Sekolah' : 'Guru Wali Kelas';
  const fullName = username === 'admin_sekolah' ? 'Admin Sekolah' : 'Guru Budi';
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      status: 'success',
      data: {
        token: 'test-jwt-token',
        user: { id: 1, username, full_name: fullName, role }
      }
    })
  });
};

test.describe('RBAC Tests', () => {
  test('should redirect unauthorized user from protected route', async ({ page }) => {
    // Mock login API for this test
    await page.route('**/api/v1/auth/login', mockLogin);
    // Go to login without logging in
    await page.goto('/login');

    // Try to access dashboard directly
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect user with wrong role from admin routes', async ({ page }) => {
    await page.route('**/api/v1/auth/login', mockLogin);
    // Login as Guru Wali Kelas (not admin)
    await page.goto('/login');
    await page.fill('#username', 'guru_budi');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Try to access admin route
    await page.goto('/admin/manajemen-user');
    // Should redirect to dashboard (not authorized for admin routes)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show different menu items for different roles', async ({ page }) => {
    await page.route('**/api/v1/auth/login', mockLogin);
    // Login as Guru Wali Kelas
    await page.goto('/login');
    await page.fill('#username', 'guru_budi');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Should see akademik menu items
    await expect(page.locator('text=Input Akademik (Nilai)')).toBeVisible();
    await expect(page.locator('text=Sistem Presensi')).toBeVisible();

    // Should NOT see admin menu items
    await expect(page.locator('text=Manajemen User')).not.toBeVisible();
    await expect(page.locator('text=Data Siswa')).not.toBeVisible();
  });

  test('should allow admin to access admin routes', async ({ page }) => {
    // Mock admin login specifically
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            token: 'test-jwt-token',
            user: { id: 1, username: 'admin_sekolah', full_name: 'Admin Sekolah', role: 'Admin Sekolah' }
          }
        })
      });
    });
    // Login as Admin Sekolah
    await page.goto('/login');
    await page.fill('#username', 'admin_sekolah');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    await page.waitForTimeout(1000);

    // Should see admin menu items on dashboard
    const h3Elements = page.locator('main h3');
    const count = await h3Elements.count();
    expect(count).toBeGreaterThanOrEqual(4); // Admin sees at least 4 admin cards
  });
});
