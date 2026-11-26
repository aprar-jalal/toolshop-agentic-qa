# Price Range Filter Test Plan

## Application Overview

Test plan for the Price Range slider (left sidebar, home page) of Toolshop at https://practicesoftwaretesting.com. Oracle: specs/requirements/price-range.md (PR1-PR6) and specs/requirements/general.md (requirements are the source of truth; app disagreement = BUG; assertions derive from requirements; healer may change locators only).

Scope: only scenarios that verify PR1-PR6. Category and brand filters appear only in combination with the price range (PR6). Sort, search, pagination-only, eco-friendly and accessibility checks are out of scope for this feature.

Assertion rule: every `expect` is derived from a requirement, e.g. "every shown price is within [min, max]" (PR2), "a product priced exactly at min/max is shown" (PR3), "min <= max" (PR4), "the no-results message is shown" (PR5), "every shown product matches all active filters" (PR6). Do not assert product counts, totals, page counts or the highest/lowest shown price. Product names and prices in this plan are examples of test data only, used to pick useful ranges.

Seed: seed.spec.ts (page.goto('https://practicesoftwaretesting.com'), title matches /Toolshop/). Every scenario starts from a fresh load of the home page (no filters, no sort, no search).

Exploration notes (background for test authors, never oracles):
- Slider is ngx-slider; handles are role=slider with aria-label "ngx-slider" (min) and "ngx-slider-max" (max); use getByRole('slider',{name:'ngx-slider',exact:true}) because a non-exact name matches both. Scale 0..200, integer steps; ArrowLeft/Right = 1, PageUp/PageDown = 20 (10% of scale), Home/End = scale ends. Floating labels show current min/max (and "min - max" bubble). Read the current values from aria-valuenow.
- On load the slider shows 1 and 100. Catalog prices observed from 3.55 to 178.20. Products above 100 (examples): 100.79 Random Orbit Sander, 119.24 Cordless Drill 18V, 125.23 Cordless Drill 20V, 172.52 Wooden Workbench, 178.20 Workbench with Drawers. Prices are non-integer while slider values are integers, so exact-equality boundaries (PR3) cannot be hit by the slider alone; use API-response interception (page.route on api.practicesoftwaretesting.com/products) to inject a product priced exactly at min/max.
- Product cards: [data-test=product-price], [data-test=product-name]; empty state: [data-test=no-results] with text "There are no products found."; pagination: .pagination (results span several pages, so collect prices across all pages before asserting). Category checkboxes data-test=category-<id> (e.g. Drill = category-01M8BVMY0MCP04P92M81B8706W), brand checkboxes data-test=brand-<id> (MightyCraft = brand-01M8BVMXHZB1XBDGY1YK3V9TBM).
- Timing: the list updates asynchronously after a handle moves (debounced). Tests must wait for the products API response / list change before asserting; asserting immediately reads stale results. Do not treat this as a defect by itself; see scenario 5.6.

Observed discrepancies / suspected defects (see inline per scenario):
1. (Observation, possible PR4 ambiguity) Pressing ArrowRight/End on the min handle when min == max does not block the min handle; it pushes the max handle up with it (e.g. 100,100 -> ArrowRight -> 100,101; End on min at 100 moved max to 200). Final state always has min <= max so PR4 is satisfied; recorded as behavior to confirm, not a confirmed defect.
2. (Observation vs PR1 wording) Default slider is 1..100 on a 0..200 scale, so the default view hides products priced above 100. PR1 only requires that the list match the displayed range, which holds. Tests assert list == displayed range, not list == whole catalog.
3. No confirmed contradiction of PR1-PR6 was found by exploration. Scenarios below are written from the requirements so any regression/defect will fail them.

## Core set

Generate these first. Together they cover each requirement at least once.

| # | Scenario | Requirement |
|---|---|---|
| 1 | 1.2. [PR1] Initial product list contains only products within the displayed default range | PR1 |
| 2 | 2.1. [PR2] Moving the max handle down narrows results (keyboard) | PR2 |
| 3 | 2.2. [PR2] Moving the min handle up narrows results | PR2 |
| 4 | 3.1. [PR3] Product at the exact max price is shown (mocked data) | PR3 |
| 5 | 3.2. [PR3] Product at the exact min price is shown (mocked data) | PR3 |
| 6 | 4.2. [PR4] Min stepped past max one step at a time | PR4 |
| 7 | 4.3. [PR4] Max handle cannot go below the min handle | PR4 |
| 8 | 5.1. [PR5] Empty range shows a 'no products found' message | PR5 |
| 9 | 6.1. [PR6] Category filter combined with the default price range | PR6 |
| 10 | 6.5. [PR6] Brand filter combined with the price range | PR6 |

## Test Scenarios

### 1. Default state (PR1)

**Seed:** `seed.spec.ts`

#### 1.1. [PR1] Slider shows a minimum and maximum value on load

**File:** `features/price-range/default-state.spec.ts`

**Steps:**
  1. Run seed: open https://practicesoftwaretesting.com and wait for the product list to render.
    - expect: Sidebar contains a 'Price Range' heading and a slider with two handles (min and max).
    - expect: Both handles show a numeric value (e.g. 1 and 100).

#### 1.2. [PR1] Initial product list contains only products within the displayed default range

**File:** `features/price-range/default-state.spec.ts`

**Steps:**
  1. Load the home page; read the min and max values shown by the slider (aria-valuenow of both handles).
    - expect: Both values are read successfully.
  2. Collect all prices across every pagination page (click through pages 1..N).
    - expect: Every price p satisfies min <= p <= max for the displayed values (e.g. Random Orbit Sander $100.79 is outside the default range and must not appear).

#### 1.3. [PR1] Reload shows a range and the list matches it

**File:** `features/price-range/default-state.spec.ts`

**Steps:**
  1. Change the range to about 50..150, then reload the page.
    - expect: Slider shows a minimum and maximum value.
  2. Collect all prices across every page.
    - expect: Every price is within the range now displayed by the slider.

### 2. Filtering by range (PR2)

**Seed:** `seed.spec.ts`

#### 2.1. [PR2] Moving the max handle down narrows results (keyboard)

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Load the home page. Focus the max handle (name 'ngx-slider-max') and press PageDown 4 times (max from 100 to 20).
    - expect: Max handle value is 20.
  2. Wait for the product list to update and collect prices across all pages.
    - expect: Every price is within [min, 20] (e.g. Bolt Cutters $48.41 is out of range and must not appear).

#### 2.2. [PR2] Moving the min handle up narrows results

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Load the home page. Focus the min handle (getByRole slider name 'ngx-slider', exact) and press PageUp 2 times (min 1 to about 41).
    - expect: Min handle value has increased.
  2. Wait for list refresh and collect all prices.
    - expect: Every price is within [new min, max] (e.g. Pliers $12.01 is out of range and must not appear).

#### 2.3. [PR2] Raising the max handle to the scale end keeps every price in range

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Load the home page. Focus the max handle and press End.
    - expect: Max handle value is 200.
  2. Wait for refresh and collect all prices across pages.
    - expect: Every price is within [min, 200] (the range now includes test-data products above 100, e.g. Cordless Drill 18V $119.24).

#### 2.4. [PR2] Both handles at the scale extremes keep every price in range

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Press Home on the min handle and End on the max handle. Wait for refresh and collect prices across all pages.
    - expect: Handle values are 0 and 200; every price is within [0, 200].

#### 2.5. [PR2] Narrow mid-range window shows only products in the window

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Load home page. Set max to 200 (End), then min to 100 (ArrowRight/PageUp until the value is 100), then max to 101.
    - expect: Handle values are 100 and 101.
  2. Wait for refresh and read results.
    - expect: Every shown price is within [100, 101] (test data: Random Orbit Sander $100.79 lies in this window).

#### 2.6. [PR2] Dragging a handle with the mouse updates the list

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Load home page. Drag the max handle with the mouse (mouse down/move/up) to roughly the middle of the track.
    - expect: Max handle value decreases.
  2. Wait for refresh and collect prices.
    - expect: Every price is within [min, new max].

#### 2.7. [PR2] Rapid successive handle movements settle on the final range

**File:** `features/price-range/filter-range.spec.ts`

**Steps:**
  1. Load home page. Focus max handle and press ArrowLeft 30 times quickly, then wait for network idle.
    - expect: Max handle value is 70.
  2. Read the final product list after the last products API response.
    - expect: Every price is within [min, 70], i.e. the list matches the final range, not an intermediate one. If stale results persist, report as suspected defect against PR2.

### 3. Boundaries and inclusivity (PR3)

**Seed:** `seed.spec.ts`

#### 3.1. [PR3] Product at the exact max price is shown (mocked data)

**File:** `features/price-range/boundaries.spec.ts`

**Steps:**
  1. Before load, use page.route to intercept products API calls and, in the response, ensure a product priced exactly 100.00 exists (modify an item price), honoring the request's between=price,1,100 filter in the mock if needed. Load the home page (default max 100).
    - expect: The product priced exactly 100.00 is shown (inclusive upper bound).

#### 3.2. [PR3] Product at the exact min price is shown (mocked data)

**File:** `features/price-range/boundaries.spec.ts`

**Steps:**
  1. Intercept the products API to include a product priced exactly 1.00 and load the home page (default min 1).
    - expect: The product priced exactly 1.00 is shown (inclusive lower bound).

#### 3.3. [PR3] A product just above the max is excluded until the max reaches it (live data)

**File:** `features/price-range/boundaries.spec.ts`

**Steps:**
  1. Load home page (max 100). Collect all prices.
    - expect: Every price is <= 100 (test data: Random Orbit Sander $100.79 is just above, so it must not appear).
  2. Press ArrowRight on the max handle once (max 101) and wait for refresh.
    - expect: Every price is <= 101 and Random Orbit Sander ($100.79, now inside the range) is shown.

#### 3.4. [PR3] Min at the scale minimum (0) keeps every price in range

**File:** `features/price-range/boundaries.spec.ts`

**Steps:**
  1. Load home page. Focus min handle and press Home (min 0). Wait for refresh.
    - expect: Min handle value is 0; every price is within [0, max] (test data: the cheapest product, Washers $3.55, falls inside).

#### 3.5. [PR3] Max at the scale maximum (200) keeps every price in range

**File:** `features/price-range/boundaries.spec.ts`

**Steps:**
  1. Load home page. Focus max handle and press End. Wait for refresh and collect prices across all pages.
    - expect: Max handle value is 200; every price is within [min, 200] (test data: the most expensive product, Workbench with Drawers $178.20, falls inside).

### 4. Min never above max (PR4)

**Seed:** `seed.spec.ts`

#### 4.1. [PR4] Min handle cannot be pushed above the max handle (keyboard End)

**File:** `features/price-range/min-max-constraint.spec.ts`

**Steps:**
  1. Load home page (1..100). Focus the min handle and press End.
    - expect: Min value <= max value. Note: the app pushes max up rather than clamping; assert only the invariant min <= max.

#### 4.2. [PR4] Min stepped past max one step at a time

**File:** `features/price-range/min-max-constraint.spec.ts`

**Steps:**
  1. Load home page. Press ArrowRight on the min handle until it equals the max (99 times from 1..100).
    - expect: Min value <= max value.
  2. Press ArrowRight once more on the min handle.
    - expect: Min value <= max value. Any state with min > max fails PR4.

#### 4.3. [PR4] Max handle cannot go below the min handle

**File:** `features/price-range/min-max-constraint.spec.ts`

**Steps:**
  1. Load home page. Focus max handle and press Home.
    - expect: Min value <= max value.

#### 4.4. [PR4] Mouse drag of the min handle beyond the max handle

**File:** `features/price-range/min-max-constraint.spec.ts`

**Steps:**
  1. Load home page. Drag the min handle far right, past the max handle position.
    - expect: Min value <= max value; every shown price is within the displayed [min, max].

### 5. No results (PR5)

**Seed:** `seed.spec.ts`

#### 5.1. [PR5] Empty range shows a 'no products found' message

**File:** `features/price-range/no-results.spec.ts`

**Steps:**
  1. Load home page. Set min = max = 100 (min handle ArrowRight x99; test data has no product priced exactly 100). Wait for the products API response.
    - expect: [data-test=no-results] is visible with text 'There are no products found.'
    - expect: No product cards are displayed; sidebar and layout remain intact (no broken or empty container).

#### 5.2. [PR5] Widening the range recovers from no results

**File:** `features/price-range/no-results.spec.ts`

**Steps:**
  1. From the no-results state (100..100), focus the max handle and press End.
    - expect: The no-results message disappears and every shown price is within [100, 200] (test data: e.g. Random Orbit Sander $100.79 lies in this range).

#### 5.3. [PR5] Range inside a catalog price gap shows no products

**File:** `features/price-range/no-results.spec.ts`

**Steps:**
  1. Load home page; set range to min 130, max 160 (test data: no product priced in this gap between $125.23 and $172.52).
    - expect: The no-results message is shown with intact layout.

#### 5.4. [PR5] Both handles at 0 show no products

**File:** `features/price-range/no-results.spec.ts`

**Steps:**
  1. Press Home on the max handle so max = 0 with min = 0 (test data: no product priced 0).
    - expect: The no-results message is shown with intact layout.

#### 5.5. [PR5] Both handles at 200 show no products

**File:** `features/price-range/no-results.spec.ts`

**Steps:**
  1. Press End on the max handle, then End on the min handle (test data: no product priced 200).
    - expect: Handle values are 200 and 200; the no-results message is shown with intact layout.

#### 5.6. [PR5] Stale results never remain after the range becomes empty

**File:** `features/price-range/no-results.spec.ts`

**Steps:**
  1. Set min = max = 100 and wait only for the products API response for that final range, then assert.
    - expect: The no-results message is shown. If earlier results are still visible after that response has arrived, report as a suspected defect against PR5/PR2. (Observed once transiently before the debounce completed; waiting produced the correct empty state.)

### 6. Combination with category and brand filters (PR6)

**Seed:** `seed.spec.ts`

#### 6.1. [PR6] Category filter combined with the default price range

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. Load home page; check category 'Drill' (data-test category-01M8BVMY0MCP04P92M81B8706W). Wait for refresh.
    - expect: Every shown product is a Drill product and its price is within [min, max] (test data: Cordless Drill 18V $119.24 is a Drill outside the default range and must not appear).

#### 6.2. [PR6] Category combined with a widened range

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. With 'Drill' checked, focus max handle and press End. Wait for refresh.
    - expect: Every shown product is a Drill product and its price is within [min, 200].

#### 6.3. [PR6] Category combined with a raised min handle

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. With 'Drill' checked and max 200, press PageUp on the min handle 6 times (min about 120). Wait for refresh.
    - expect: Every shown product is a Drill product and its price is within [min, max] (test data: Cordless Drill 20V $125.23 lies in range).

#### 6.4. [PR6] Category combined with a range above all its products shows no results

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. Load home page; check category 'Drill'; set max to 200 and min to about 130 (test data: no Drill product is priced above $125.23).
    - expect: The no-results message is displayed with intact layout.

#### 6.5. [PR6] Brand filter combined with the price range

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. Load home page; check brand 'MightyCraft Hardware'; set max to 200.
    - expect: Every shown product is MightyCraft Hardware and its price is within [min, 200].
  2. Reduce max to 100.
    - expect: Every shown product is MightyCraft Hardware and its price is within [min, 100].

#### 6.6. [PR6] Category, brand and price range together

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. Check category 'Drill' and brand 'MightyCraft Hardware' with a wide range (0..200) (test data: all Drill products are ForgeFlex).
    - expect: Every shown product matches ALL active filters; with this test data the no-results message is shown.

#### 6.7. [PR6] Unchecking a category keeps the price range applied

**File:** `features/price-range/combined-filters.spec.ts`

**Steps:**
  1. Check 'Drill', set max 200 and min about 50, then uncheck 'Drill'.
    - expect: Slider still shows the chosen range; every shown price is within it.
