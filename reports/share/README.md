# Sprint 6T Share Pack

Current sprint: Sprint 6T - Close Game Distribution Calibration

## Purpose
Review the post-6S close-game and competitive-game distribution proof: margin buckets, score-gap causes, trailing-team response, leading-team runaway control, chain metric consistency, and no-score-manipulation guardrails.

## Primary Files
- fullmatch-close-game-distribution-calibration-6t.md
- validation.fullmatch-close-game-distribution-calibration-6t.md
- coach-report.export.html
- scoring-events-summary.md
- validation.share-pack.md

## Expected Reading Order
1. validation.share-pack.md
2. validation.fullmatch-close-game-distribution-calibration-6t.md
3. fullmatch-close-game-distribution-calibration-6t.md
4. coach-report.export.html
5. bundle__simulation.md and bundle__reports.md for implementation proof

## Guardrails
- No scoring constants changed.
- No score cap, rewrite, deleted event, forced score, forced comeback, or rubber-banding.
- Official score remains derived from score_change events.
- Route family diversity, gate selectivity, goalkeeper secure reset, and post-score reset remain visible.
