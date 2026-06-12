# FullMatch Workbench Chain Replay 3X Validation

Status: PASS
share pack mode: MINIMAL_REVIEW
current sprint: Sprint 3X - Sandbox Decision Evidence Calibration

## Checks
- PASS: default runFullMatch remains segment_harness.
- PASS: experimental mode remains opt-in.
- PASS: sandbox decision panel status is available.
- PASS: sandbox decision evidence calibration status is available.
- PASS: evidence calibration origin is sandbox_decision_panel.
- PASS: evidence score is bounded between 0 and 100.
- PASS: evidence score is in current fixture target band 35-50.
- PASS: confidence is low for current fixture.
- PASS: supporting signal count is visible.
- PASS: limiting signal count is visible.
- PASS: positive and negative evidence weights are visible.
- PASS: no batch confirmation caps confidence.
- PASS: goalkeeper recovery caps confidence.
- PASS: default report has no sandbox decision evidence calibration block.
- PASS: experimental report has sandbox decision evidence calibration block.
- PASS: visible coach text says Confiance faible.
- PASS: visible coach text says piste a tester.
- PASS: visible coach text says not official truth.
- PASS: visible coach text says not global economy proof.
- PASS: sandbox decision evidence calibration is calibrated suggestion only.
- PASS: sandbox decision evidence calibration does not claim official truth.
- PASS: sandbox decision evidence calibration cannot drive coach instruction.
- PASS: sandbox decision evidence calibration cannot drive live selection.
- PASS: sandbox decision evidence calibration cannot drive production route resolution.
- PASS: sandbox decision evidence calibration cannot mutate official timeline.
- PASS: sandbox decision evidence calibration cannot mutate official score.
- PASS: sandbox decision evidence calibration cannot mutate official possession.
- PASS: sandbox decision evidence calibration cannot mutate official scoring events.
- PASS: sandbox decision evidence calibration cannot create production scoring events.
- PASS: sandbox decision evidence calibration cannot claim global economy.
- PASS: scoring constants unchanged.
- PASS: PENALTY_SHOT inactive.
- PASS: no production scoring events deleted or capped.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: 50-match economy remains global reference.
- PASS: explicit exhaustive test command is available.
- PASS: share pack under 20 files.

## Counts
- evidence score: 38
- evidence score minimum expected: 35
- evidence score maximum expected: 50
- confidence: low
- supporting signal count: 6
- limiting signal count: 7
- positive weight total: 48
- negative weight total: 40
- net evidence weight: 8
- default calibration block count: 0
- experimental calibration block count: 1
- official timeline mutation count: 0
- official score mutation count: 0
- official possession mutation count: 0
- official scoring event mutation count: 0
- production scoring event creation count: 0
- global economy claim count: 0

## Recommendation
- CONFIRM_SANDBOX_DECISION_EVIDENCE_CALIBRATION_SUGGESTION_ONLY
- CONFIRM_LOW_CONFIDENCE_FOR_CURRENT_FIXTURE
- CONFIRM_NO_LIVE_SELECTION_DRIVER
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER
- PREPARE_BATCH_CONFIDENCE_CALIBRATION
