# FullMatch Workbench Chain Replay 4B

Sprint 4B converts the multi-scenario coach test plan into a coach-facing Selection Preview. The preview is visible only in the experimental coach report and remains non-applied, local, and non-official.

## Modes

- default mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental remains opt-in only.
- default report: no Plan de test coach section and no Prévisualisation de sélection section.
- experimental report: Plan de test coach section visible after the sandbox decision panel.
- experimental report: Prévisualisation de sélection section visible after the coach test plan.

## Coach Test Plan

- coach test plan status: available.
- test count: 3.
- test IDs: support_around_z4_hsr, second_ball_occupation, strong_goalkeeper_fallback.
- support test linked scenario: batch-scenario-better-attacking-support.
- second-ball test linked scenario: batch-scenario-better-attacking-rebound-pressure.
- goalkeeper fallback linked scenario: batch-scenario-stronger-goalkeeper.

## Selection Preview

- selection preview status: available.
- preview origin: multi_scenario_coach_test_plan.
- preview count: 3.
- preview IDs: support_near_z4_hsr, second_ball_presence, strong_goalkeeper_response.
- linked test IDs: support_around_z4_hsr, second_ball_occupation, strong_goalkeeper_fallback.
- linked scenario IDs: batch-scenario-better-attacking-support, batch-scenario-better-attacking-rebound-pressure, batch-scenario-stronger-goalkeeper.

### Soutien proche autour de Z4-HSR

- linked coach test: support_around_z4_hsr.
- suggested role/profile: support runner / mobile lock / hook link / playmaker support.
- useful attributes: anticipation, handling, off-ball support, stamina.
- expected benefit: reduce isolated-shot risk and offer immediate continuation after progression.
- trade-off: more attacking support can expose rest-defense if the ball is lost or parried.
- observation signal: progression leads to controlled continuity rather than adverse recovery.

### Présence sur second ballon

- linked coach test: second_ball_occupation.
- suggested role/profile: rebound chaser / pressure forward / high work-rate runner.
- useful attributes: anticipation, aggression, reaction, acceleration, balance.
- expected benefit: turn a parried shot into a second action instead of a clean BLITZ recovery.
- trade-off: rebound pressure can increase fatigue and open transition if recovery fails.
- observation signal: second-chance pressure rises without disorganizing defensive structure.

### Réponse face à un gardien fort

- linked coach test: strong_goalkeeper_fallback.
- suggested role/profile: safer continuity option / secondary playmaker / support receiver / rest-defense anchor.
- useful attributes: decision-making, positioning, composure, tactical discipline.
- expected benefit: avoid depending only on a direct shot and prepare safe continuation after a save.
- trade-off: a safer plan B can reduce immediate threat but stabilize the sequence.
- observation signal: the team keeps useful structure after a goalkeeper save instead of conceding recovery.

## Guardrails

- preview only: true.
- official truth: false.
- can change lineup: false.
- can change starters: false.
- can change bench: false.
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

- CONFIRM_COACH_TEST_PLAN_TO_SELECTION_PREVIEW.
- CONFIRM_PREVIEW_REMAINS_NON_APPLIED.
- CONFIRM_NO_LINEUP_MUTATION.
- CONFIRM_NO_LIVE_SELECTION_DRIVER.
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER.
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.
- PREPARE_SELECTION_PREVIEW_TO_TACTICAL_TRADEOFF_PANEL.
