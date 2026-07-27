# Sprint 8K Share Pack

Current sprint: Sprint 8K - Coach Report Decision Layer & Next-Match Observation Plan

Upload every file in this `reports/share` directory for review. This minimal pack keeps the 8I compact export budget and adds an observation-only decision layer for the next match.

Primary files:
- coach-report.product.html
- coach-report.export.html
- coach-report-decision-layer-next-match-observation-plan-8k.md
- validation.coach-report-decision-layer-next-match-observation-plan-8k.md
- validation.share-pack.md

Recommended review order:
1. coach-report.product.html
2. coach-report.export.html
3. validation.coach-report-decision-layer-next-match-observation-plan-8k.md
4. coach-report-decision-layer-next-match-observation-plan-8k.md
5. validation.share-pack.md

Key invariants:
- The decision layer is a next-match observation grid, not a selection or tactical instruction engine.
- Three decision cards link story, replay, action plan, tactical maps, and prudent trends.
- The export remains compact, below the 900-second hard budget, and ideally below 800 seconds.
- Score, replay, and official story remain backed by score_change events.
- Sandbox, batch, and diagnostics remain separate from official truth.