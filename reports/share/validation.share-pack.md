# Share Pack Validation

Status: PASS

## Counts
- share pack mode: MINIMAL_REVIEW
- current sprint: Sprint 6L - Goalkeeper Secure & Reset Break Specificity
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
- PASS: current sprint is Sprint 6L - Sprint 6L - Goalkeeper Secure & Reset Break Specificity
- PASS: previous sprint leftovers are 0 - 0
- PASS: README is Sprint 6L oriented - README current
- PASS: 6L report included - 6L doc included
- PASS: 6L validation is PASS - 6L validation current
- PASS: batch match count visible - 50 matches visible
- PASS: baseline 6K metrics are visible - 6K baseline visible
- PASS: goalkeeper secure break metrics measured - goalkeeper secure metrics visible
- PASS: goalkeeper safe possession measured - safe possession visible
- PASS: post-score reset specificity measured - reset specificity visible
- PASS: dominance decay metrics clarified - dominance decay clarified
- PASS: no misleading dominanceDecayApplicationRate wording - uses ratio/coverage wording
- PASS: dominance chain gains preserved - dominance preservation visible
- PASS: density calibration preserved - density preserved
- PASS: team opportunity balance preserved or surfaced - team balance visible
- PASS: route family diversity preserved - route diversity preserved
- PASS: TRY/DROP/CONVERSION remain available - non-shot preserved
- PASS: CONTINUATION remains available - continuation preserved
- PASS: score from score_change all runs - score_change source all runs
- PASS: official path connected all runs - official path all runs
- PASS: calibration applied all runs - calibrations all runs
- PASS: no score rewrite/deletion/forced score - guardrails false
- PASS: scoring constants unchanged - scoring constants visible
- PASS: MatchBonusEvent unchanged - MatchBonusEvent separated
- PASS: batch/live separation preserved - batch/live PASS
- PASS: persistence and SQLite not used for scoring - persistence/SQLite false
- PASS: no UNKNOWN scoring family - UNKNOWN blocked
- PASS: no PENALTY_SHOT leakage - PENALTY blocked
- PASS: no contradictory healthy warning - healthy warning guarded
- PASS: coach product contains goalkeeper secure reset section - product 6L visible
- PASS: coach export contains goalkeeper secure reset section - export 6L visible
- PASS: coach export avoids forbidden 6L wording - forbidden wording absent
- PASS: bundle includes 6L source files - 6L source bundled
- PASS: explicit exhaustive test command available - test:all visible
- PASS: recommendation visible - 6L recommendation visible

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
- fullmatch-goalkeeper-secure-reset-break-specificity-6l.md
- manifest.md
- package.json
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- tsconfig.json
- validation.fullmatch-goalkeeper-secure-reset-break-specificity-6l.md
- validation.share-pack.md
