// spec: features/price-range/price-range-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { readRange, waitForListToSettle } from './price-range-helpers';

test.describe('No results (PR5)', () => {
  test('[PR5] Empty range shows a no-products-found message', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    const { minHandle, min: initialMin, max: initialMax } = await readRange(page);
    await waitForListToSettle(page);

    // 1. Load home page. Set min = max = 100 (min handle ArrowRight x99). Wait for the list for that range.
    await minHandle.click();
    for (let i = 0; i < initialMax - initialMin; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await expect(minHandle).toHaveAttribute('aria-valuenow', String(initialMax));
    await waitForListToSettle(page);

    // PR5: the page shows that no products were found
    await expect(page.getByText('There are no products found.')).toBeVisible();

    // PR5: no broken or empty layout: no product cards, sidebar still intact
    // No accessible locator for product cards, so data-test is used via getByTestId.
    await expect(page.getByTestId('product-name')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Price Range' })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'ngx-slider', exact: true })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'ngx-slider-max' })).toBeVisible();
  });
});
