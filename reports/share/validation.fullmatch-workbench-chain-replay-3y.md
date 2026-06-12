# FullMatch Workbench Chain Replay 3Y Validation

Status: PASS
share pack mode: MINIMAL_REVIEW
current sprint: Sprint 3Y - Batch Confidence Calibration

## Checks
- PASS: default runFullMatch remains segment_harness.
- PASS: experimental mode remains opt-in.
- PASS: sandbox decision evidence calibration remains available.
- PASS: batch confidence calibration status is available.
- PASS: batch confidence calibration origin is sandbox_decision_evidence_calibration.
- PASS: scenario count is at least 6.
- PASS: base scenario is included.
- PASS: better attacking support scenario is included.
- PASS: weak attacking support scenario is included.
- PASS: stronger goalkeeper scenario is included.
- PASS: weaker goalkeeper scenario is included.
- PASS: fatigue variation scenario is included.
- PASS: average evidence score is present.
- PASS: min evidence score is present.
- PASS: max evidence score is present.
- PASS: batch confidence is present.
- PASS: batch confidence is not above medium.
- PASS: recommendation stability is present.
- PASS: best scenario is present.
- PASS: worst scenario is present.
- PASS: local sandbox batch only is true.
- PASS: batch confidence is not official truth.
- PASS: batch confidence cannot drive live selection.
- PASS: batch confidence cannot drive production route resolution.
- PASS: batch confidence cannot mutate official timeline.
- PASS: batch confidence cannot mutate official score.
- PASS: batch confidence cannot mutate official possession.
- PASS: batch confidence cannot mutate official scoring events.
- PASS: batch confidence cannot create production scoring events.
- PASS: batch confidence cannot claim global economy.
- PASS: experimental report contains Confiance multi-scÃ©narios.
- PASS: default report has no experimental batch confidence calibration.
- PASS: coach copy says this remains a test or suggestion.
- PASS: coach copy avoids mandatory wording.
- PASS: coach copy avoids official-truth wording.
- PASS: scoring constants unchanged.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.
- PASS: explicit exhaustive test command is available.

## Counts
- scenario count: 9
- average evidence score: 37
- min evidence score: 20
- max evidence score: 54
- batch confidence: low
- best scenario: batch-scenario-better-attacking-support
- worst scenario: batch-scenario-stronger-goalkeeper
- production scoring event creation count: 0
- global economy claim count: 0

## Recommendation
- CONFIRM_EVIDENCE_CALIBRATION_TO_BATCH_CONFIDENCE_CALIBRATION.
- CONFIRM_LOCAL_SANDBOX_BATCH_ONLY.
- CONFIRM_BATCH_CONFIDENCE_NOT_ABOVE_MEDIUM.
- CONFIRM_NO_LIVE_SELECTION_DRIVER.
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER.
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.
- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN.
