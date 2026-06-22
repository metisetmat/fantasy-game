# Share Pack Validation

Status: PASS

## Counts
- share pack mode: MINIMAL_REVIEW
- current sprint: Sprint 6H - Segment Scoring Density Calibration
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
- PASS: current sprint is Sprint 6H - Sprint 6H - Segment Scoring Density Calibration
- PASS: previous sprint leftovers are 0 - 0
- PASS: README is Sprint 6H oriented - README current
- PASS: 6H report included - 6H doc included
- PASS: 6H validation is PASS - 6H validation current
- PASS: batch match count visible - 50 matches visible
- PASS: baseline 6G metrics are visible - 6G baseline visible
- PASS: scoring opportunities per match decrease - opportunities reduced
- PASS: scoring opportunities per segment decrease - segment density reduced
- PASS: danger phases per match decrease - danger reduced
- PASS: averageTotalPoints decreases versus 6G - average points reduced
- PASS: blowout rates decrease versus 6G - blowout reduced
- PASS: neutral/resets/recoveries increase - interruptions increased
- PASS: TRY/DROP/CONVERSION remain available - non-shot preserved
- PASS: CONTINUATION remains available - continuation preserved
- PASS: no rollback to SHOT_ONLY - SHOT_ONLY blocked
- PASS: score from score_change all runs - score_change source all runs
- PASS: official path connected all runs - official path all runs
- PASS: calibration applied all runs - calibrations all runs
- PASS: no score cap/rewrite/deletion/forced score - guardrails false
- PASS: scoring constants unchanged - scoring constants visible
- PASS: MatchBonusEvent unchanged - MatchBonusEvent separated
- PASS: batch/live separation preserved - batch/live PASS
- PASS: persistence and SQLite not used for scoring - persistence/SQLite false
- PASS: no UNKNOWN scoring family - UNKNOWN blocked
- PASS: no PENALTY_SHOT leakage - PENALTY blocked
- PASS: no contradictory healthy warning - healthy warning guarded
- PASS: coach product contains segment density section - product 6H visible
- PASS: coach export contains segment density section - export 6H visible
- PASS: coach export avoids forbidden segment-density wording - forbidden wording absent
- PASS: bundle includes 6H source files - 6H source bundled
- PASS: explicit exhaustive test command available - test:all visible
- PASS: recommendation visible - 6H recommendation visible

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
- fullmatch-segment-scoring-density-calibration-6h.md
- manifest.md
- package.json
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- tsconfig.json
- validation.fullmatch-segment-scoring-density-calibration-6h.md
- validation.share-pack.md
