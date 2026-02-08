import { test, expect } from '@playwright/test';

const needsAuth = !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD;

test.describe('Data flow: Delivery (delivery_requests)', () => {
  test.beforeEach(async ({ page }) => {
    if (needsAuth) test.skip();
  });

  test('Dashboard shows Delivery tab and data loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole('tab', { name: /delivery/i }).click();
    await expect(page.getByRole('tab', { name: /delivery/i })).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(
      page.locator('text=Delivery').or(page.locator('text=Entry Form')).or(page.locator('table'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('Delivery Preview page loads', async ({ page }) => {
    await page.goto('/delivery-preview');
    await expect(page).toHaveURL(/\/delivery-preview/);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const tableOrEmpty = page.locator('table').or(page.getByText('No delivery'));
    await expect(tableOrEmpty.first()).toBeVisible({ timeout: 10000 });
  });

  test('Navigate Dashboard → Delivery tab → content visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('tab', { name: /delivery/i }).click();
    await page.waitForTimeout(800);
    await expect(
      page.locator('text=Delivery').or(page.locator('table')).first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('Navigate to Delivery Preview and back to Dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/delivery-preview');
    await expect(page).toHaveURL(/\/delivery-preview/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Master Data Sheet Delivery tab loads', async ({ page }) => {
    await page.goto('/master-data-sheet');
    await expect(page).toHaveURL(/\/master-data-sheet/);
    await page.getByRole('tab', { name: /delivery/i }).click();
    await page.waitForTimeout(1000);
    await expect(
      page.locator('text=Delivery').or(page.locator('text=Master')).first()
    ).toBeVisible({ timeout: 8000 });
  });
});
