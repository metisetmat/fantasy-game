# Share Pack Validation

Status: PASS

## Counts
- share pack mode: MINIMAL_REVIEW
- current sprint: Sprint 6T - Close Game Distribution Calibration
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
- PASS: current sprint is Sprint 6T - Sprint 6T - Close Game Distribution Calibration
- PASS: previous sprint leftovers are 0 - 0
- PASS: README is Sprint 6T oriented - README current
- PASS: 6T report included - 6T doc included
- PASS: 6T validation is PASS - 6T validation current
- PASS: batch match count visible - 50 matches visible
- PASS: baseline 6S visible - 6S baseline visible
- PASS: close game metrics visible - distribution metrics visible
- PASS: score gap causes visible - gap causes visible
- PASS: margin and scoreline distributions visible - distributions visible
- PASS: chain metric consistency fixed or documented - chain consistency visible
- PASS: longitudinal close/competitive/blowout visible - longitudinal metrics visible
- PASS: score from score_change all runs - score_change source all runs
- PASS: official path connected all runs - official path all runs
- PASS: no cap/rewrite/delete/forced score - guardrails false
- PASS: no rubber-banding or forced comeback - no forced comeback
- PASS: scoring constants unchanged - scoring constants visible
- PASS: MatchBonusEvent unchanged - MatchBonusEvent separated
- PASS: batch/live separation preserved - batch/live PASS
- PASS: persistence and SQLite not used for scoring - persistence/SQLite false
- PASS: no UNKNOWN scoring family - UNKNOWN blocked
- PASS: no PENALTY_SHOT leakage - PENALTY blocked
- PASS: coach product contains close-game section - product 6T visible
- PASS: coach export contains close-game section - export 6T visible
- PASS: coach export avoids forbidden 6T wording - forbidden wording absent
- PASS: bundle includes 6T source files - 6T source bundled
- PASS: explicit exhaustive test command available - test:all visible
- PASS: recommendation visible - 6T recommendation visible

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
- fullmatch-close-game-distribution-calibration-6t.md
- manifest.md
- package.json
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- tsconfig.json
- validation.fullmatch-close-game-distribution-calibration-6t.md
- validation.share-pack.md
