# General requirements (apply to every feature)

Site: https://practicesoftwaretesting.com
Requirements are the source of truth. If the app disagrees, it's a BUG, not a test to change.

- Organization: one feature per folder. Plan → features/<feature>/<feature>-plan.md. Tests → features/<feature>/*.spec.ts.
- Planner: each scenario names the requirement it covers. Include edge and negative cases.
- Generator: assertions come from the requirements, never from what the page currently shows.
- Healer: may change locators only. If a fix changes an expected value, STOP and report a possible bug.