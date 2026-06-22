# Share Pack Validation

Status: PASS

## Counts
- share pack mode: MINIMAL_REVIEW
- current sprint: Sprint 6G - Route Family Scoring Rate Calibration
- final file count: 20
- share file count: 20
- minimal allowlist count: 20
- missing expected files: none
- stale share file count: 0
- excluded files found in share: 0
- source files deleted count: 0

## Checks

- PASS: share pack mode is MINIMAL_REVIEW - MINIMAL_REVIEW
- PASS: share file count <= 20 - 20
- PASS: final file count is 20 - 20
- PASS: all expected files are copied - all copied
- PASS: all expected files are listed in manifest - all listed
- PASS: current sprint is Sprint 6G - Sprint 6G - Route Family Scoring Rate Calibration
- PASS: previous sprint leftovers are 0 - 0
- PASS: README is Sprint 6G oriented - README current
- PASS: 6G report included - 6G doc included
- PASS: 6G validation is PASS - 6G validation current
- PASS: batch match count visible - 50 matches visible
- PASS: baseline 6F metrics are visible - 6F baseline visible
- PASS: averageTotalPoints decreases versus 6F - average points reduced
- PASS: scoringEventsPerMatch decreases versus 6F - event count reduced
- PASS: blowout rates decrease versus 6F - blowout reduced
- PASS: conversion success not automatic - conversion measured
- PASS: TRY and DROP remain available - TRY/DROP preserved
- PASS: multiple scoring families remain available - multi-family preserved
- PASS: continuation remains available - continuation preserved
- PASS: no rollback to SHOT_ONLY - SHOT_ONLY blocked
- PASS: CONVERSION only after TRY - conversion guarded
- PASS: score from score_change all runs - score_change source all runs
- PASS: official path connected all runs - official path all runs
- PASS: calibrations applied all runs - calibrations all runs
- PASS: no score cap/rewrite/deletion/forced score - guardrails false
- PASS: scoring constants unchanged - scoring constants visible
- PASS: MatchBonusEvent unchanged - MatchBonusEvent separated
- PASS: batch/live separation preserved - batch/live PASS
- PASS: persistence and SQLite not used for scoring - persistence/SQLite false
- PASS: no UNKNOWN scoring family - UNKNOWN blocked
- PASS: no PENALTY_SHOT leakage - PENALTY blocked
- PASS: coach product contains scoring-rate calibration section - product 6G visible
- PASS: coach export contains scoring-rate calibration section - export 6G visible
- PASS: coach export avoids forbidden scoring-rate wording - forbidden wording absent
- PASS: bundle includes 6G source files - 6G source bundled
- PASS: explicit exhaustive test command available - test:all visible
- PASS: recommendation visible - 6G recommendation visible

## Files

- 00-share-manifest.txt
- README.md
- bundle__contracts.md
- bundle__reports.md
- bundle__simulation.md
- coach-report.default.html
- coach-report.experimental.html
- coach-report.export.html
- coach-report.latest.html
- coach-report.product.html
- fullmatch-route-family-scoring-rate-calibration-6g.md
- manifest.md
- package.json
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- tsconfig.json
- validation.fullmatch-route-family-scoring-rate-calibration-6g.md
- validation.share-pack.md
