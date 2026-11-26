// spec: features/price-range/price-range-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { collectAllPrices, readRange, waitForListToSettle } from './price-range-helpers';

test.describe('Filtering by range (PR2)', () => {
  test('[PR2] Moving the max handle down narrows results (keyboard)', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    const { maxHandle } = await readRange(page);
    await waitForListToSettle(page);

    // 1. Load the home page. Focus the max handle and press PageDown 4 times (max from 100 to 20).
    await maxHandle.click();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('PageDown');
    }
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '20');

    // 2. Wait for the product list to update and collect prices across all pages.
    await waitForListToSettle(page);
    const { min, max } = await readRange(page);
    const allPrices = await collectAllPrices(page);

    // PR2: the list shows products, and every price is >= min and <= max
    expect(allPrices, 'the product list must not be empty').not.toHaveLength(0);
    for (const p of allPrices) {
      expect(p).toBeGreaterThanOrEqual(min);
      expect(p).toBeLessThanOrEqual(max);
    }
  });

  test('[PR2] Moving the min handle up narrows results', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    const { minHandle, min: initialMin } = await readRange(page);
    await waitForListToSettle(page);

    // 1. Load the home page. Focus the min handle and press PageUp 2 times (min 1 to about 41).
    await minHandle.click();
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageUp');
    await expect.poll(async () => Number(await minHandle.getAttribute('aria-valuenow'))).toBeGreaterThan(initialMin);

    // 2. Wait for list refresh and collect all prices.
    await waitForListToSettle(page);
    const { min, max } = await readRange(page);
    const allPrices = await collectAllPrices(page);

    // PR2: the list shows products, and every price is >= new min and <= max
    expect(allPrices, 'the product list must not be empty').not.toHaveLength(0);
    for (const p of allPrices) {
      expect(p).toBeGreaterThanOrEqual(min);
      expect(p).toBeLessThanOrEqual(max);
    }
  });
});
