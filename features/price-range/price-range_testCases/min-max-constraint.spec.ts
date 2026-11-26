// spec: features/price-range/price-range-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { readRange } from './price-range-helpers';

test.describe('Min never above max (PR4)', () => {
  test('[PR4] Min stepped past max one step at a time', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    const { minHandle, maxHandle, min: initialMin, max: initialMax } = await readRange(page);

    // 1. Load the home page. Press ArrowRight on the min handle until it equals the max (99 times from 1..100).
    await minHandle.click();
    for (let i = 0; i < initialMax - initialMin; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await expect(minHandle).toHaveAttribute('aria-valuenow', String(initialMax));
    // PR4: min value <= max value
    await expect
      .poll(async () => {
        const min = Number(await minHandle.getAttribute('aria-valuenow'));
        const max = Number(await maxHandle.getAttribute('aria-valuenow'));
        return min <= max;
      })
      .toBe(true);

    // 2. Press ArrowRight once more on the min handle.
    await page.keyboard.press('ArrowRight');
    // PR4: min value <= max value (any state with min > max fails)
    await expect
      .poll(async () => {
        const min = Number(await minHandle.getAttribute('aria-valuenow'));
        const max = Number(await maxHandle.getAttribute('aria-valuenow'));
        return min <= max;
      })
      .toBe(true);
  });

  test('[PR4] Max handle cannot go below the min handle', async ({ page }) => {
    // Seed: open the home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Toolshop/);
    const { minHandle, maxHandle } = await readRange(page);

    // 1. Load the home page. Focus max handle and press Home.
    await maxHandle.click();
    await page.keyboard.press('Home');
    // PR4: min value <= max value
    await expect
      .poll(async () => {
        const min = Number(await minHandle.getAttribute('aria-valuenow'));
        const max = Number(await maxHandle.getAttribute('aria-valuenow'));
        return min <= max;
      })
      .toBe(true);
  });
});
