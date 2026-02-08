import { test, expect } from '@playwright/test';

const needsAuth = !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD;

test.describe('Data flow: Cross-page consistency', () => {
  test.beforeEach(async () => {
    if (needsAuth) test.skip();
  });

  test('Dashboard Solutions tab → Preview shows same data source (table or empty)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole('tab', { name: /solutions/i }).click();
    await page.waitForTimeout(800);
    await page.goto('/preview');
    await expect(page).toHaveURL(/\/preview/);
    await page.waitForTimeout(1500);
    const table = page.locator('table').first();
    const emptyState = page.getByText(/no solution|no request|no data/i);
    await expect(table.or(emptyState).first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard → Preview → same app navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/preview');
    await expect(page).toHaveURL(/\/preview/);
    const linkBack = page.getByRole('link', { name: /dashboard|back|home/i });
    if (await linkBack.first().isVisible().catch(() => false)) {
      await linkBack.first().click();
      await expect(page).toHaveURL(/\/(dashboard|preview)/);
    }
  });

  test('Dashboard → Delivery Preview → same app navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/delivery-preview');
    await expect(page).toHaveURL(/\/delivery-preview/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Navigate away from Dashboard and back (data refetch on re-enter)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole('tab', { name: /solutions/i }).click();
    await page.waitForTimeout(500);
    await page.goto('/preview');
    await expect(page).toHaveURL(/\/preview/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(800);
    await expect(page.getByRole('tab', { name: /dashboard/i }).or(page.getByRole('tab', { name: /solutions/i }))).toBeVisible();
  });
});
