import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authDir = 'e2e/.auth';
const authFile = path.join(authDir, 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn('E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD not set. Auth-dependent tests will be skipped.');
    fs.mkdirSync(authDir, { recursive: true });
    await page.context().storageState({ path: authFile });
    return;
  }

  await page.goto('/auth');
  await page.getByRole('tab', { name: 'Sign In' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  fs.mkdirSync(authDir, { recursive: true });
  await page.context().storageState({ path: authFile });
});
