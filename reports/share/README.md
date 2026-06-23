# Sprint 6N Share Pack

Current sprint: Sprint 6N - Earned Danger Gate & Reset-to-Danger Root Fix

## Purpose
This minimal review pack proves that reset-to-danger now passes through an earned danger gate before becoming a scoring opportunity. It keeps scoring constants, official route diversity, score_change authority, and the 6M baseline visible.

## Primary files
- fullmatch-earned-danger-gate-6n.md
- validation.fullmatch-earned-danger-gate-6n.md
- coach-report.export.html
- coach-report.product.html
- scoring-events-summary.md
- bundle__simulation.md
- bundle__reports.md
- bundle__contracts.md

## Guardrails
- No score cap.
- No post-hoc score rewrite.
- No forced opponent score.
- No scoring-event deletion.
- No MatchBonusEvent mutation.
- Score remains derived from score_change consequences.

## Next Sprint
Review 6N output before Sprint 6O focuses on increasing truly earned danger rather than restoring automatic reset-to-danger.
