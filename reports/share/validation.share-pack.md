# Share Pack Validation

Status: PASS

## Counts
- share pack mode: MINIMAL_REVIEW
- current sprint: Sprint 6F - Official Route Family Mix Activation / Non-Shot Route Availability
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
- PASS: current sprint is Sprint 6F - Sprint 6F - Official Route Family Mix Activation / Non-Shot Route Availability
- PASS: previous sprint leftovers are 0 - 0
- PASS: README is Sprint 6F oriented - README current
- PASS: 6F report included - 6F doc included
- PASS: 6F validation is PASS - 6F validation current
- PASS: batch match count visible - 50 matches visible
- PASS: TRY route can be available and score - TRY visible
- PASS: DROP route can be available and score - DROP visible
- PASS: CONVERSION only generated after TRY - conversion guarded
- PASS: route family competition can select non-shot - non-shot selected
- PASS: route family competition can select continuation - continuation selected
- PASS: route family mix is no longer 100% SHOT_ONLY - SHOT_ONLY reduced
- PASS: matchesWithTryOrDrop measured above zero - TRY/DROP presence
- PASS: matchesWithMultipleScoringFamilies measured above zero - multi-family
- PASS: shutout and one-sided rates below 100 - rates below 100
- PASS: score from score_change all runs - score_change source all runs
- PASS: official path connected all runs - official path all runs
- PASS: calibrations applied all runs - calibrations all runs
- PASS: no score cap/rewrite/deletion/forced score - guardrails true
- PASS: scoring constants unchanged - scoring constants visible
- PASS: MatchBonusEvent unchanged - MatchBonusEvent separated
- PASS: batch/live separation preserved - batch/live PASS
- PASS: persistence and SQLite not used for scoring - persistence/SQLite false
- PASS: no UNKNOWN scoring family - UNKNOWN blocked
- PASS: no PENALTY_SHOT leakage - PENALTY blocked
- PASS: coach product contains route mix section - product 6F visible
- PASS: coach export contains route mix section - export 6F visible
- PASS: coach export avoids forbidden route-mix wording - forbidden wording absent
- PASS: bundle includes 6F source files - 6F source bundled
- PASS: explicit exhaustive test command available - test:all visible
- PASS: recommendation visible - 6F recommendation visible

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
- fullmatch-route-family-mix-activation-6f.md
- manifest.md
- package.json
- scoring-events-summary.md
- sequence-1-action-1.html
- sequence-1-action-2.html
- sequence-1-action-3.html
- tsconfig.json
- validation.fullmatch-route-family-mix-activation-6f.md
- validation.share-pack.md
