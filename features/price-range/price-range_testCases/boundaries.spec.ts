// spec: features/price-range/price-range-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { collectAllProducts, readRange, waitForListToSettle } from './price-range-helpers';

// Exact PR3 boundaries cannot be reached via the UI (integer slider, decimal prices); see
// "Known limitations" in the plan. This test covers the nearest observable case with live data.
test.describe('Boundaries and inclusivity (PR3)', () => {
  test('[PR3] A product just above the max is excluded until the max reaches it', async ({ page }) => {
    // Test data: Random Orbit Sander costs $100.79, just above the default max of 100.
    const productJustAboveMax = 'Random Orbit Sander';

    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);

    // 1. Load home page (max 100). Collect all prices.
    const { maxHandle, max: initialMax } = await readRange(page);
    expect(initialMax).toBe(100);
    await waitForListToSettle(page);
    let products = await collectAllProducts(page);

    // PR2/PR3: the list shows products, every price is <= 100, so the $100.79 product is hidden
    expect(products, 'the product list must not be empty').not.toHaveLength(0);
    for (const p of products) {
      expect(p.price).toBeLessThanOrEqual(100);
    }
    expect(products.map((p) => p.name)).not.toContain(productJustAboveMax);

    // 2. Press ArrowRight on the max handle once (max 101) and wait for refresh.
    await maxHandle.click();
    await page.keyboard.press('ArrowRight');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '101');
    await waitForListToSettle(page);
    products = await collectAllProducts(page);

    // PR2/PR3: every price is <= 101, and the $100.79 product (now inside the range) is shown
    expect(products, 'the product list must not be empty').not.toHaveLength(0);
    for (const p of products) {
      expect(p.price).toBeLessThanOrEqual(101);
    }
    expect(products.map((p) => p.name)).toContain(productJustAboveMax);
  });
});
