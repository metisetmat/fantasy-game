# FullMatch Workbench Chain Replay 3W

Sprint 3W adds a Sandbox Decision Panel after the coach-facing official timeline versus sandbox review. It turns the sandbox replay evidence into four coach-readable decision blocks while remaining suggestion-only behind the opt-in workbench_chain_replay_experimental flag.

## Sandbox Decision Panel

- sandbox decision panel status: available
- sandbox decision panel origin: coach_facing_timeline_review
- sandbox decision panel block count: 4
- decision block: Enseignement coach
- decision block: Option à tester
- decision block: Risque associé
- decision block: Ce qui reste à prouver
- recommendation: test_support_around_forward_progress
- suggested tactical test: support FORWARD_PROGRESS toward control-space-hunter around Z4-HSR
- associated risk: isolated shot, goalkeeper response, and goalkeeper-team recovery if support arrives late
- still unproven count: 5

## Coach Report Rendering

- default sandbox decision panel tag count: 0
- experimental sandbox decision panel tag count: greater than 0
- experimental coach report contains Panneau de décision sandbox
- experimental coach report contains Enseignement coach
- experimental coach report contains Option à tester
- experimental coach report contains Risque associé
- experimental coach report contains Ce qui reste à prouver
- technical panel tags remain behind details

## Guardrails

- suggestion only: true
- official truth: false
- can drive live selection: false
- can drive production route resolution: false
- official timeline unchanged: true
- official score unchanged: true
- official possession unchanged: true
- official scoring events unchanged: true
- production scoring event creation count: 0
- global economy claim count: 0
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof

## Evidence Categories

- WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW
- WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL

## Source Files

- src/simulation/fullMatch/sandboxDecisionPanel.ts
- src/simulation/fullMatch/sandboxDecisionPanelFromTimelineReview.ts
- src/reports/htmlCoachReport.ts
- src/simulation/runFullMatch.ts

## Recommendations

- CONFIRM_SANDBOX_DECISION_PANEL_SUGGESTION_ONLY
- CONFIRM_NO_LIVE_SELECTION_DRIVER
- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER
- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED
- PREPARE_SANDBOX_DECISION_PANEL_EVIDENCE_CALIBRATION
