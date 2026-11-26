// spec: features/price-range/price-range-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { collectAllProducts, readCategoryAndBrand, readRange, waitForListToSettle } from './price-range-helpers';

test.describe('Combination with category and brand filters (PR6)', () => {
  test('[PR6] Category filter combined with the default price range', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    await readRange(page);
    await waitForListToSettle(page);

    // 1. Load home page; check category 'Drill'. Wait for the refresh.
    await page.getByRole('checkbox', { name: 'Drill', exact: true }).check();
    await waitForListToSettle(page);
    const { min, max } = await readRange(page);
    const products = await collectAllProducts(page);

    // PR6: the list shows products; each is a Drill product (category badge on its detail page)
    // and its price is within [min, max]
    expect(products, 'the product list must not be empty').not.toHaveLength(0);
    for (const product of products) {
      expect(product.price, product.name).toBeGreaterThanOrEqual(min);
      expect(product.price, product.name).toBeLessThanOrEqual(max);
      const { category } = await readCategoryAndBrand(page, product.href!);
      expect(category, product.name).toBe('Drill');
    }
  });

  test('[PR6] Brand filter combined with the price range', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    const { maxHandle } = await readRange(page);
    await waitForListToSettle(page);

    // 1. Load home page; check brand 'MightyCraft Hardware'; set max to 200 (End).
    await page.getByRole('checkbox', { name: 'MightyCraft Hardware' }).check();
    await maxHandle.click();
    await page.keyboard.press('End');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '200');
    await waitForListToSettle(page);
    let range = await readRange(page);
    let products = await collectAllProducts(page);

    // PR6: the list shows products; each is MightyCraft Hardware (brand badge on its detail page)
    // and its price is within [min, 200]
    expect(products, 'the product list must not be empty').not.toHaveLength(0);
    for (const product of products) {
      expect(product.price, product.name).toBeGreaterThanOrEqual(range.min);
      expect(product.price, product.name).toBeLessThanOrEqual(200);
      const { brand } = await readCategoryAndBrand(page, product.href!);
      expect(brand, product.name).toBe('MightyCraft Hardware');
    }

    // 2. Reduce max to 100 (PageDown 5 times, 20 per press).
    await maxHandle.click();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('PageDown');
    }
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '100');
    await waitForListToSettle(page);
    range = await readRange(page);
    products = await collectAllProducts(page);

    // PR6: the list shows products; each is MightyCraft Hardware and its price is within [min, 100]
    expect(products, 'the product list must not be empty').not.toHaveLength(0);
    for (const product of products) {
      expect(product.price, product.name).toBeGreaterThanOrEqual(range.min);
      expect(product.price, product.name).toBeLessThanOrEqual(100);
      const { brand } = await readCategoryAndBrand(page, product.href!);
      expect(brand, product.name).toBe('MightyCraft Hardware');
    }
  });
});
