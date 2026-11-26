# Feature: Price range filter (the oracle)

Site: https://practicesoftwaretesting.com (home page, left sidebar "Price Range")
These requirements are the source of truth. If the app disagrees, it's a BUG, not a test to change.

## PR1 – Default

On page load the slider shows a minimum and a maximum value, and the product list shows only products within that range.

## PR2 – Filter by range

Moving either handle updates the product list so that every shown product's price is ≥ min and ≤ max.

## PR3 – Boundaries

A product whose price equals the min or the max IS shown (the range is inclusive).

## PR4 – Min never above max

The minimum handle cannot go above the maximum handle.

## PR5 – No results

If no product is in the range, the page shows that no products were found (no broken or empty layout).

## PR6 – Works with other filters

The price range combines with category/brand filters: shown products match ALL active filters.

## Rules for agents

- Organization: one feature per file. Plan → specs/<feature>-plan.md. Tests → tests/<feature>/\*.spec.ts. Never mix features in one file.
- Planner: each scenario names the requirement it covers (PR1–PR6). Include edge and negative cases.
- Generator: assertions come from these requirements, never from what the page currently shows.
- Healer: may change locators only. If a fix would change an expected value or a requirement check, STOP and report it as a possible bug.
