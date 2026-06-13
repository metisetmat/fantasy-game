# FullMatch Workbench Chain Replay 4A

Sprint 4A converts the local sandbox batch confidence result into a coach-facing Multi-Scenario Coach Test Plan. The plan is visible only in the experimental coach report and remains suggestive, local, and non-official.

## Modes

- default mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental remains opt-in only.
- default report: no Plan de test coach section.
- experimental report: Plan de test coach section visible after the sandbox decision panel.

## Batch Confidence Calibration

- batch confidence calibration status: available.
- origin: sandbox_decision_batch_confidence_calibration.
- scenario count: 9.
- average evidence score: 37/100.
- local range: 20-54/100.
- batch confidence: low.
- recommendation stability: mixed.
- best scenario: batch-scenario-better-attacking-support.
- worst scenario: batch-scenario-stronger-goalkeeper.

## Coach Test Plan

- coach test plan status: available.
- test count: 3.
- test IDs: support_around_z4_hsr, second_ball_occupation, strong_goalkeeper_fallback.
- support test linked scenario: batch-scenario-better-attacking-support.
- second-ball test linked scenario: batch-scenario-better-attacking-rebound-pressure.
- goalkeeper fallback linked scenario: batch-scenario-stronger-goalkeeper.
- confidence cap: low / low-medium, never high.

## Coach-Facing Tests

### Renforcer le soutien autour de Z4-HSR

- linked scenario: batch-scenario-better-attacking-support.
- expected positive signal: better continuation after shot / better second-ball presence.
- risk to watch: isolated shot if support arrives late.
- remains unproven: local sandbox signal does not prove the route is superior.

### Mieux occuper le second ballon

- linked scenario: batch-scenario-better-attacking-rebound-pressure.
- expected positive signal: second chance probability improves.
- risk to watch: overcommitting and exposing rest defense.
- remains unproven: safety against defensive transition remains local and unproven.

### Prevoir la reaction au gardien fort

- linked scenario: batch-scenario-stronger-goalkeeper.
- expected positive signal: safer continuation or better pressure after save.
- risk to watch: stronger goalkeeper neutralizes the attack.
- remains unproven: fallback response is a local hypothesis, not an official instruction.

## Guardrails

- suggestion only: true.
- official truth: false.
- can drive coach instruction: false.
- can drive live selection: false.
- can drive production route resolution: false.
- production scoring event creation count: 0.
- global economy claim count: 0.
- official timeline unchanged: true.
- official score unchanged: true.
- official possession unchanged: true.
- official scoring events unchanged: true.
- scoring constants unchanged.
- MatchBonusEvent unchanged.
- batch/live separation preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Visible Coach Copy

- visible coach copy clean: PASS.
- mojibake marker count: 0.
- visible developer jargon count: 0.
- technical tags remain available only behind details.internal-markers.

## Commands

- npm run build
- npm run typecheck
- npm run test:contracts
- npm run test:all
- npm run reports:coach
- npm run reports:share

## Recommendation

- CONFIRM_BATCH_RESULTS_TO_COACH_TEST_PLAN.
- CONFIRM_TEST_PLAN_REMAINS_SUGGESTIVE_ONLY.
- CONFIRM_NO_LIVE_SELECTION_DRIVER.
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER.
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.
- PREPARE_COACH_TEST_PLAN_TO_SELECTION_PREVIEW.
