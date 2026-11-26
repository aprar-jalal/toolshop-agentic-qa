import { expect, type Page } from '@playwright/test';

// UI-only helpers: no API calls, no network interception, no mocks.

/** Parse a displayed price such as "$14.15" into a number. */
export const toPrice = (text: string) => Number(text.replace(/[^0-9.]/g, ''));

export type ListedProduct = { name: string; price: number; href: string | null };

/** Waits until both slider handles have a numeric aria-valuenow (it is briefly null after load) and reads them. */
export async function readRange(page: Page) {
  const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
  const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });
  await expect(minHandle).toHaveAttribute('aria-valuenow', /^\d+$/);
  await expect(maxHandle).toHaveAttribute('aria-valuenow', /^\d+$/);
  return {
    minHandle,
    maxHandle,
    min: Number(await minHandle.getAttribute('aria-valuenow')),
    max: Number(await maxHandle.getAttribute('aria-valuenow')),
  };
}

/**
 * Waits for the product list to refresh: until it shows either products or the no-results message,
 * and its content has not changed for `quietMs`. The app re-renders the list once per handle step,
 * so reading earlier gives an intermediate list. This only synchronises; it makes no requirement check.
 */
export async function waitForListToSettle(page: Page, quietMs = 2000) {
  // No accessible locator for product cards/prices, so data-test is used via getByTestId.
  const names = page.getByTestId('product-name');
  const prices = page.getByTestId('product-price');
  const noResults = page.getByText('There are no products found.');

  const snapshot = async () =>
    [
      ...(await names.allTextContents()),
      ...(await prices.allTextContents()),
      (await noResults.isVisible()) ? 'no-results' : '',
    ].join('|');

  let last = await snapshot();
  let unchangedSince = Date.now();
  await expect
    .poll(
      async () => {
        const now = await snapshot();
        if (now !== last) {
          last = now;
          unchangedSince = Date.now();
        }
        const rendered = (await names.count()) > 0 || (await noResults.isVisible());
        return rendered && Date.now() - unchangedSince >= quietMs;
      },
      { message: 'the product list did not settle', timeout: 20_000, intervals: [200] },
    )
    .toBe(true);
}

/** Reads name, price and link of every listed product across all pagination pages. */
export async function collectAllProducts(page: Page): Promise<ListedProduct[]> {
  // No accessible locator for product cards/prices, so data-test is used via getByTestId.
  const names = page.getByTestId('product-name');
  const prices = page.getByTestId('product-price');

  const readPage = async (): Promise<ListedProduct[]> => {
    const n = await names.count();
    const rows: ListedProduct[] = [];
    for (let i = 0; i < n; i++) {
      const name = names.nth(i);
      rows.push({
        name: (await name.textContent())?.trim() ?? '',
        price: toPrice((await prices.nth(i).textContent()) ?? ''),
        href: await name.evaluate((el) => el.closest('a')?.getAttribute('href') ?? null),
      });
    }
    return rows;
  };

  const all = await readPage();
  // Re-check for the next page button each time: the pagination can still shrink while it catches up
  // with the latest results, so a page count read up front may be out of date.
  for (let i = 2; ; i++) {
    const nextPage = page.getByRole('button', { name: `Page-${i}` });
    if ((await nextPage.count()) === 0) break;
    const previousNames = (await names.allTextContents()).join('|');
    await nextPage.click({ timeout: 5000 });
    await expect.poll(async () => (await names.allTextContents()).join('|')).not.toBe(previousNames);
    all.push(...(await readPage()));
  }
  return all;
}

/** Reads every listed price across all pagination pages. */
export async function collectAllPrices(page: Page): Promise<number[]> {
  return (await collectAllProducts(page)).map((p) => p.price);
}

/** Opens a product's detail page in a new tab and reads its category and brand badges. */
export async function readCategoryAndBrand(page: Page, href: string) {
  const detail = await page.context().newPage();
  try {
    await detail.goto(href);
    // The badges are spans with aria-label "category" / "brand".
    const category = detail.getByLabel('category', { exact: true });
    const brand = detail.getByLabel('brand', { exact: true });
    await expect(category).toBeVisible();
    return {
      category: (await category.textContent())?.trim() ?? '',
      brand: (await brand.textContent())?.trim() ?? '',
    };
  } finally {
    await detail.close();
  }
}
