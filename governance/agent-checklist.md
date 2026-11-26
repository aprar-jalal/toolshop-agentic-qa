# Agent readiness checklist – toolshop-agentic-qa

## 👤 Ownership
- [ ] Does each agent (planner, generator, healer) have a named human owner? (e.g. aprar)
- [ ] Dose each agent mark the thing he did (healer:fixed line 41)
- [ ] Dose each agent ask for aprovel after each output and say's aproval from e.g. aprar
- [ ] Dose the agent stop when aprar says kill the operation?


## 🌍 Scope & data
- [ ] Do the agents run only against the test site, never a production site?
- [ ] Does the agent use only test card data?
- [ ] do the agent heal the failed test and move it as a hidden bug to production

## ✋ Control (changes & review)
- [ ] Do all agent changes go through a PR into main, with the merge-report check required?
- [ ] Do all agent check the requremnt before fixing faild test
- [ ] Is every agent PR reviewed by a human before merge?
- [ ] Is the agent fixed with 3 runs maximum

## 📝 Audit (logging)
- [ ] Is every agent run logged with time, agent, action, reason and result?
- [ ] Is every agent fix logged with time, agent, action, reason and result?
- [ ] Can the agent fix the logges? or modify it ?
- [ ]

## 🩹 Healer-specific
- [ ] Does the healer change locators only, never assertions or expected values?
- [ ] Does the healer check the requirement (oracle) before any fix?
- [ ] Does the healer stop and ask a human when a fix would change expected behavior?
- [ ] Does every heal show a before/after diff and the reason?