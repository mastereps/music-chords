import { expect, test } from '@playwright/test';

test('viewer can open and transpose a published chord sheet', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Title, artist, tag, category').fill('Open the Eyes');
  await page.getByRole('link', { name: /Open the Eyes of My Heart/i }).click();

  await expect(page.getByText('Current key E')).toBeVisible();
  await page.getByRole('button', { name: 'Transpose +' }).click();
  await expect(page.getByText('Current key F')).toBeVisible();
});

test('admin can log in and open the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('Admin123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Song management' })).toBeVisible();
});
