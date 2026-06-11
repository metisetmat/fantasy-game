# FullMatch Workbench Chain Replay 3F

Sprint 3F converts the experimental SegmentRouteInput into a controlled mini-match route source for segment-1 behind the opt-in workbench_chain_replay_experimental flag. The source is diagnostic-only: it is visible in timeline tags, evidence, and coach-facing diagnostics, but it cannot mutate score, scoring events, route success rates, production full-match selection, production route resolution, or live mini-match resolution.

## Sprint 3F Summary
- default runFullMatch route source status: not_available.
- experimental controlled mini-match route source status: available.
- controlled mini-match route source origin: segment_route_input.
- controlled route source candidate: chain-context-forward-progress-sh.
- controlled route source action: FORWARD_PROGRESS.
- controlled route source receiver: control-space-hunter.
- controlled route source target zone: Z4-HSR.
- controlled route source source base score: 82.
- controlled route source source influence delta: 5.
- controlled route source source influenced score: 87.
- controlled route source candidate legal: true.
- controlled route source candidate available: true.
- controlled route source rejected closed candidate count: 1.
- controlled route source rejected unavailable candidate count: 1.

## Chain And Segment Provenance
- consumed chain: sequence-1-multi-action-chain.
- final chain carrier: control-space-hunter.
- final chain zone: Z4-HSR.
- route candidate influence selected candidate: chain-context-forward-progress-sh.
- shadow route selection candidate: chain-context-forward-progress-sh.
- controlled segment selection candidate: chain-context-forward-progress-sh.
- SegmentRouteInput candidate: chain-context-forward-progress-sh.
- controlled mini-match route source candidate: chain-context-forward-progress-sh.
- WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE evidence is emitted only for the experimental run.

## Default Versus Experimental Signature
- default controlled mini-match route source tag count: 0.
- experimental controlled mini-match route source tag count: greater than 0.
- default and experimental score signatures remain equal for now: YES.
- default and experimental scoring event counts remain equal: YES.
- default and experimental score_change totals remain equal: YES.
- live mini-match route resolution mutation count: 0.

## Guardrails
- controlled route source can mutate score: false.
- controlled route source can mutate scoring events: false.
- controlled route source can mutate route success rates: false.
- controlled route source can drive production full-match selection: false.
- controlled route source can drive production route resolution: false.
- controlled route source can drive live mini-match resolution: false.
- CLOSED candidates remain unselectable.
- unavailable candidates remain unselectable.
- normal full-match is not claimed as production chain-driven.

## Scoring Guardrails
- SHOT_GOAL = 3.
- TRY_TOUCHDOWN = 5.
- CONVERSION_GOAL = 2.
- DROP_GOAL = 2.
- PENALTY_SHOT inactive.
- final score remains derived only from score_change consequences.
- scoring events deleted/capped/rewritten/fabricated: 0.
- MatchBonusEvent unchanged.
- batch/live separation preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Next Recommendations
- CONFIRM_SEGMENT_ROUTE_INPUT_TO_CONTROLLED_MINIMATCH_ROUTE_SOURCE
- CONFIRM_CONTROLLED_ROUTE_SOURCE_IS_DIAGNOSTIC_ONLY
- CONFIRM_CONTROLLED_ROUTE_SOURCE_DOES_NOT_DRIVE_LIVE_MINIMATCH_RESOLUTION
- CONFIRM_CONTROLLED_ROUTE_SOURCE_DOES_NOT_DRIVE_PRODUCTION_RESOLUTION
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_NO_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_CONTROLLED_MINIMATCH_ROUTE_SOURCE_TO_LIVE_ROUTE_SELECTION_GUARDS
