# FullMatch Workbench Chain Replay 3Z

Sprint 3Z cleans the coach report UX after Sprint 3Y. It fixes visible UTF-8 copy, keeps the sandbox batch confidence block readable, and moves long technical grounding content behind developer details without changing simulation behavior.

## Coach Report Encoding

- UTF-8 status: PASS.
- mojibake marker count: 0.
- experimental coach report contains: Confiance multi-scénarios.
- experimental coach report contains: Confiance faible — 37/100 en moyenne sur 9 scénarios.
- experimental coach report contains: Stabilité.
- default coach report contains no mojibake markers.
- HTML files are written with utf8.

## Visible Coach Copy Cleanup

- visible developer jargon count: 0.
- SegmentRouteInput, selection shadow, read-only, canDrive, production route resolution, scoreMutationCount, and workbench_chain_ are hidden from visible coach copy.
- visible sandbox copy says: Cette piste reste une suggestion sandbox, pas une consigne officielle.
- visible sandbox copy says it does not modify the official timeline, score, possession, or scoring events.
- visible sandbox copy says it is not global economy proof.

## Technical Details Placement

- technical details collapsed status: PASS.
- collapsed technical details count: 2 or more in the experimental report.
- long Ancrage workbench / full-match grounding paragraphs are not shown as main visible cards.
- technical diagnostics remain available inside details.internal-markers.

## Default / Experimental Boundary

- default mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental remains opt-in only.
- default report does not show timeline sandbox review, sandbox decision panel, evidence calibration, or batch confidence.
- experimental report keeps timeline review, decision panel, evidence calibration, and batch confidence sections.

## Guardrails Unchanged

- official timeline unchanged.
- official score unchanged.
- official possession unchanged.
- official scoring events unchanged.
- no production scoring event created.
- no live selection mutation.
- no production route resolution mutation.
- no global economy claim.
- scoring constants unchanged: SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- MatchBonusEvent unchanged.
- batch/live separation preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Tests

- npm.cmd run build
- npm.cmd run typecheck
- npm.cmd run test:contracts
- npm.cmd run test:all
- npm.cmd run reports:coach
- npm.cmd run reports:share

## Recommendation

- CONFIRM_COACH_REPORT_ENCODING_FIXED.
- CONFIRM_VISIBLE_COACH_COPY_CLEAN.
- CONFIRM_TECHNICAL_DETAILS_COLLAPSED.
- CONFIRM_DEFAULT_EXPERIMENTAL_BOUNDARY_PRESERVED.
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.
- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN.
