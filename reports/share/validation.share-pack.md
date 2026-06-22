# Share Pack Validation

Status: PASS

## Counts
- share pack mode: MINIMAL_REVIEW
- current sprint: Sprint 6I - Team Opportunity Balance Calibration
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
- PASS: current sprint is Sprint 6I - Sprint 6I - Team Opportunity Balance Calibration
- PASS: previous sprint leftovers are 0 - 0
- PASS: README is Sprint 6I oriented - README current
- PASS: 6I report included - 6I doc included
- PASS: 6I validation is PASS - 6I validation current
- PASS: batch match count visible - 50 matches visible
- PASS: baseline 6H metrics are visible - 6H baseline visible
- PASS: home/away opportunities measured - home/away opportunities visible
- PASS: home/away scoring measured - home/away scoring visible
- PASS: opportunity balance measured - balance index visible
- PASS: trailing response measured - response measured
- PASS: dominance chain measured - dominance measured
- PASS: density calibration preserved - density preserved
- PASS: route family diversity preserved - route diversity preserved
- PASS: TRY/DROP/CONVERSION remain available - non-shot preserved
- PASS: CONTINUATION remains available - continuation preserved
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
- PASS: coach product contains team opportunity section - product 6I visible
- PASS: coach export contains team opportunity section - export 6I visible
- PASS: coach export avoids forbidden team-balance wording - forbidden wording absent
- PASS: bundle includes 6I source files - 6I source bundled
- PASS: explicit exhaustive test command available - test:all visible
- PASS: recommendation visible - 6I recommendation visible

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
- fullmatch-team-opportunity-balance-calibration-6i.md
- manifest.md
- package.json
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- tsconfig.json
- validation.fullmatch-team-opportunity-balance-calibration-6i.md
- validation.share-pack.md
