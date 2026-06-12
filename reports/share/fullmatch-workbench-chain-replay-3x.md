# FullMatch Workbench Chain Replay 3X

Sprint 3X adds Sandbox Decision Evidence Calibration on top of the Sandbox Decision Panel. The calibrated score is a coach-facing confidence aid for one isolated sandbox chain; it remains experimental, suggestion-only, and unable to change official match truth.

## Sandbox Decision Evidence Calibration

- sandbox decision panel status: available
- sandbox decision evidence calibration status: available
- origin: sandbox_decision_panel
- evidence score: 38/100
- evidence score target band: 35-50
- confidence: low
- confidence label: Confiance faible
- supporting signal count: 6
- limiting signal count: 7
- positive weight total: 48
- negative weight total: 40
- net evidence weight: 8
- recommendation type: test_support_around_forward_progress
- suggested tactical test: support FORWARD_PROGRESS toward control-space-hunter around Z4-HSR
- associated risk: isolated shot, goalkeeper response, and goalkeeper-team recovery if support arrives late

## Supporting Signals

- dangerous progression: +12
- half-chance created: +8
- SHOT_CANDIDATE created: +8
- adjusted shot quality above 50: +6
- on-target saved state: +8
- concrete tactical test: +6

## Limiting Signals

- shot saved by goalkeeper: -8
- goalkeeper response score 65: -6
- safe defensive rebound: -8
- low second-chance probability: -6
- isolated single chain: -4
- no batch confirmation: -4
- final outcome secured by goalkeeper team: -4
- no batch confirmation caps confidence.
- goalkeeper recovery caps confidence.

## Coach Report Rendering

- default sandbox decision evidence calibration tag count: 0
- experimental sandbox decision evidence calibration block: visible
- experimental coach report contains Niveau de confiance de la suggestion
- experimental coach report contains Confiance faible
- experimental coach report contains Ce qui soutient la suggestion
- experimental coach report contains Ce qui limite la suggestion
- coach copy describes this as a piste a tester
- coach copy says it is not official truth
- coach copy says it is not global economy proof
- technical calibration tags remain behind details

## Guardrails

- calibrated suggestion only: true
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
- default runFullMatch remains segment_harness
- normal live selection remains unchanged
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof

## Evidence Categories

- WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW
- WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL
- WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION

## Source Files

- src/simulation/fullMatch/sandboxDecisionEvidenceCalibration.ts
- src/simulation/fullMatch/calculateSandboxDecisionEvidenceScore.ts
- src/simulation/fullMatch/sandboxDecisionEvidenceCalibrationFromPanel.ts
- src/reports/htmlCoachReport.ts
- src/simulation/runFullMatch.ts

## Validation Commands

- npm.cmd run test:all
- npm.cmd run reports:coach
- npm.cmd run reports:share

## Recommendations

- CONFIRM_SANDBOX_DECISION_EVIDENCE_CALIBRATION_SUGGESTION_ONLY
- CONFIRM_LOW_CONFIDENCE_FOR_CURRENT_FIXTURE
- CONFIRM_NO_LIVE_SELECTION_DRIVER
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED
- PREPARE_BATCH_CONFIDENCE_CALIBRATION
