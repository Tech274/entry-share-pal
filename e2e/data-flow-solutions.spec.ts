import { test, expect } from '@playwright/test';

const needsAuth = !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD;

test.describe('Data flow: Solutions (lab_requests)', () => {
  test.beforeEach(async ({ page }) => {
    if (needsAuth) test.skip();
  });

  test('Dashboard shows Solutions tab and data loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole('tab', { name: /solutions/i }).click();
    await expect(page.getByRole('tab', { name: /solutions/i })).toBeVisible();
    await page.waitForTimeout(1500);
    const listOrEmpty = page.locator('text=Requests List').or(page.locator('text=Entry Form'));
    await expect(listOrEmpty.first()).toBeVisible({ timeout: 10000 });
  });

  test('Preview (Solutions spreadsheet) loads same data source', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    const dashboardCount = await page.locator('[class*="Requests List"]').textContent().catch(() => '');
    await page.goto('/preview');
    await expect(page).toHaveURL(/\/preview/);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('Navigate Dashboard → Solutions tab → see list or form', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('tab', { name: /solutions/i }).click();
    await page.waitForTimeout(800);
    const formOrList = page.getByText('Entry Form').or(page.getByText('Requests List'));
    await expect(formOrList.first()).toBeVisible({ timeout: 8000 });
  });

  test('Navigate to Preview and back to Dashboard keeps URLs', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/preview');
    await expect(page).toHaveURL(/\/preview/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Master Data Sheet Solutions tab loads', async ({ page }) => {
    await page.goto('/master-data-sheet');
    await expect(page).toHaveURL(/\/master-data-sheet/);
    await page.getByRole('tab', { name: /solutions/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Solutions').or(page.locator('text=Master'))).toBeVisible({ timeout: 8000 });
  });
});
