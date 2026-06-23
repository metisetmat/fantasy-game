# Sprint 6P Share Pack

Current sprint: Sprint 6P - Gate Selectivity & Volume Regression Fix

## Purpose
This minimal review pack proves that the 6O earned-danger gate no longer treats negative contexts as positive reasons, and that scoring volume is reduced without changing scoring values or rewriting score events.

## Primary Files
- fullmatch-gate-selectivity-volume-regression-fix-6p.md
- validation.fullmatch-gate-selectivity-volume-regression-fix-6p.md
- coach-report.export.html
- scoring-events-summary.md
- validation.share-pack.md

## What To Check
- earnedDangerRate is reduced from the 6O permissive baseline but remains above zero.
- resetToDangerRate and scoring opportunity volume are reduced.
- LOW_SPACING, IMMEDIATE_AFTER_RESET, POST_SCORE_CONTEXT, and LEADING_TEAM_REATTACK are negative contexts, not positive gate reasons.
- score_change remains the official score source.
- no score caps, post-hoc rewrites, forced scores, event deletions, or MatchBonusEvent changes are used.
- the coach report includes the Selectivite du danger et volume section.

## Commands
- npm run build
- npm run typecheck
- npm run test:contracts
- npm run test:all
- npm run reports:coach
- npm run reports:share
