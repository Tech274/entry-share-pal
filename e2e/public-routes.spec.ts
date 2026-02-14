import { test, expect } from '@playwright/test';

test.describe('Public routes (no auth required)', () => {
  test('Landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=MakeMyLabs').or(page.locator('h1')).first()).toBeVisible({ timeout: 10000 });
  });

  test('Auth page loads and shows Sign In tab', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveURL('/auth');
    await expect(page.getByRole('tab', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Sign Up' })).toBeVisible();
  });

  test('Submit request page loads (public)', async ({ page }) => {
    await page.goto('/submit-request');
    await expect(page).toHaveURL('/submit-request');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('form').or(page.locator('text=Submit'))).toBeVisible({ timeout: 8000 });
  });

  test('Protected dashboard redirects to auth when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('Protected preview redirects to auth when not logged in', async ({ page }) => {
    await page.goto('/preview');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('Protected delivery-preview redirects to auth when not logged in', async ({ page }) => {
    await page.goto('/delivery-preview');
    await expect(page).toHaveURL(/\/auth/);
  });
});
