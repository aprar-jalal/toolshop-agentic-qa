import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('https://practicesoftwaretesting.com');   // start every agent session on Toolshop
    await expect(page).toHaveTitle(/Toolshop/);                // make sure the site really loaded
  });
});