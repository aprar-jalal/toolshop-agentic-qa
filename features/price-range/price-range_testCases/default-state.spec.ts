// spec: features/price-range/price-range-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { collectAllPrices, readRange, waitForListToSettle } from './price-range-helpers';

test.describe('Default state (PR1)', () => {
  test('[PR1] Initial product list contains only products within the displayed default range', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);

    // 1. Load the home page; read the min and max values shown by the slider (aria-valuenow of both handles).
    const { min, max } = await readRange(page);

    // 2. Collect all prices across every pagination page (click through pages 1..N).
    await waitForListToSettle(page);
    const allPrices = await collectAllPrices(page);

    // PR1: the list shows products, and every price p satisfies min <= p <= max
    expect(allPrices, 'the product list must not be empty').not.toHaveLength(0);
    for (const p of allPrices) {
      expect(p).toBeGreaterThanOrEqual(min);
      expect(p).toBeLessThanOrEqual(max);
    }
  });
});
