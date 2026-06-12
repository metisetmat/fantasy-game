# FullMatch Workbench Chain Replay 3Y

Sprint 3Y adds Batch Confidence Calibration for the sandbox coach suggestion. It evaluates the same support-around-Z4-HSR idea across local controlled sandbox scenarios while remaining suggestion-only, non-official, and unable to drive live selection, production route resolution, production scoring events, or global scoring-economy conclusions.

## Batch Confidence Calibration

- default mode: segment_harness
- experimental mode: workbench_chain_replay_experimental
- sandbox decision evidence calibration status: available
- batch confidence calibration status: available
- batch origin: sandbox_decision_evidence_calibration
- recommendation type: test_support_around_forward_progress
- suggested tactical test: support FORWARD_PROGRESS toward control-space-hunter around Z4-HSR
- scenario count: 9
- average evidence score: 37
- min evidence score: 20
- max evidence score: 54
- batch confidence: low
- batch confidence label: confiance faible
- recommendation stability: mixed
- best scenario: batch-scenario-better-attacking-support
- worst scenario: batch-scenario-stronger-goalkeeper
- confidence changed from single-chain: false

## Scenario List

- base: 38/100, low
- better_attacking_support: 54/100, low
- weak_attacking_support: 22/100, very_low
- stronger_goalkeeper: 20/100, very_low
- weaker_goalkeeper: 50/100, low
- fatigued_attacker: 26/100, very_low
- fatigued_goalkeeper: 47/100, low
- higher_defensive_recovery: 28/100, very_low
- better_attacking_rebound_pressure: 51/100, low

## Interpretation

- better support and better attacking rebound pressure improve the suggestion.
- weak support, stronger goalkeeper response, attacking fatigue, and stronger defensive recovery reduce confidence.
- the signal remains useful as a coach test, but it is inconsistent across local scenarios.
- local batch confidence is capped at medium and currently remains low.

## Guardrails

- local sandbox batch only: true
- official truth: false
- can drive coach instruction: false
- can drive live selection: false
- can drive production route resolution: false
- official timeline unchanged: true
- official score unchanged: true
- official possession unchanged: true
- official scoring events unchanged: true
- production scoring event creation count: 0
- global economy claim count: 0
- scoring constants unchanged: true
- source-of-truth unchanged: true
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof

## Coach Report Rendering

- default batch confidence calibration tag count: 0
- experimental coach report contains Confiance multi-scÃ©narios
- experimental coach report contains scenario count
- coach copy says this remains a test or suggestion
- coach copy avoids mandatory wording
- coach copy avoids official-truth overclaim
- coach copy avoids global-economy overclaim

## Evidence Categories

- WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION
- WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION

## Validation Commands

- npm.cmd run test:all
- npm.cmd run reports:coach
- npm.cmd run reports:share

## Recommendations

- CONFIRM_EVIDENCE_CALIBRATION_TO_BATCH_CONFIDENCE_CALIBRATION
- CONFIRM_LOCAL_SANDBOX_BATCH_ONLY
- CONFIRM_BATCH_CONFIDENCE_NOT_ABOVE_MEDIUM
- CONFIRM_NO_LIVE_SELECTION_DRIVER
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED
- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN
