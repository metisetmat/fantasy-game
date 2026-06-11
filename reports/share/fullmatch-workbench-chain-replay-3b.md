# FullMatch Workbench Chain Replay 3B

Sprint 3B converts the experimental segment-1 chain context into bounded diagnostic route candidate influence behind the opt-in workbench_chain_replay_experimental flag. This is shadow ranking only: it does not mutate score, scoring events, production route selection, or route success rates.

## Sprint 3B Summary
- Visual chain replay: validated.
- Experimental full-match chain consumption: validated.
- Experimental segment context influence: validated.
- Experimental route candidate influence: diagnostic-only.
- Normal full-match: still segment_harness by default.
- Scoring economy: unchanged and still validated only by batch/full-match economy.

## Full-Match Mode Status
- default full-match mode: segment_harness.
- experimental full-match mode: workbench_chain_replay_experimental.
- experimental mode active by default: NO.
- normal full-match chain-driven claim status: NO.

## Experimental Chain Consumption
- chain consumption status: consumed.
- consumed chain id: sequence-1-multi-action-chain.
- consumed segment: segment-1.
- consumed step count: 3.
- visual step count: 3.
- synthetic step count: 0.
- hybrid step count: 0.
- spatial selection step count: 3.
- actor preservation count: 3.
- receiver preservation count: 3.
- action type preservation count: 3.
- before state preservation count: 3.
- after state preservation count: 3.
- final propagated carrier: control-space-hunter.
- final propagated zone: Z4-HSR.
- mismatch warnings: 0.

## Experimental Segment Context Influence
- chain segment context status: available.
- segment context source: workbench_chain_consumption.
- segment context attached to: segment-1.
- segment context final carrier: control-space-hunter.
- segment context final zone: Z4-HSR.
- segment context consumed steps: 3.
- segment context spatial steps: 3.
- segment context confidence: medium.
- segment context diagnosticOnly: true.
- segment context can mutate score: false.
- segment context can mutate scoring events: false.
- experimental chain context tags present in timeline: YES.
- default chain context tags present in timeline: NO.

## Experimental Route Candidate Influence
- route candidate influence status: available.
- route candidate influence scope: diagnostic_shadow_ranking.
- route candidate influence source segment: segment-1.
- route candidate influence source chain: sequence-1-multi-action-chain.
- route candidate influence final carrier: control-space-hunter.
- route candidate influence final zone: Z4-HSR.
- candidate count: 4.
- influenced candidate count: 2.
- positive delta count: 1.
- negative delta count: 1.
- illegal candidate boost blocked count: 1.
- unavailable candidate boost blocked count: 1.
- diagnostic selection before: chain-context-safe-recycle-pv.
- diagnostic selection after: chain-context-forward-progress-sh.
- diagnostic selection changed: true.
- route candidate influence diagnosticOnly: true.
- route candidate influence can mutate score: false.
- route candidate influence can mutate scoring events: false.
- route candidate influence can drive production selection: false.
- closed candidates remain selectable after influence: NO.
- unavailable candidates remain selectable after influence: NO.

## Default vs Experimental Signature
- default chain consumption count: 0.
- experimental chain consumption count: 1.
- default chain context tag count: 0.
- experimental chain context tag count: greater than 0.
- default route candidate influence tag count: 0.
- experimental route candidate influence tag count: greater than 0.
- experimental influenced candidate count: greater than 0.
- default and experimental score signatures remain equal for now: YES.
- default and experimental scoring event counts remain equal: YES.
- default and experimental score_change totals remain equal: YES.
- default and experimental timeline event counts remain equal: YES.
- score mutation count: 0.
- scoring events mutation count: 0.
- final score remains derived only from score_change consequences.

## Diagnostics And Coach Visibility
- experimental report limitations include FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1.
- experimental report limitations include FULLMATCH_CHAIN_SEGMENT_CONTEXT_ATTACHED_TO_SEGMENT_1.
- experimental report limitations include FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DIAGNOSTIC_ONLY.
- experimental report limitations include FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_DRIVE_PRODUCTION_SELECTION.
- experimental report limitations include FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_OVERRIDE_CLOSED_OR_UNAVAILABLE.
- experimental report evidence includes WORKBENCH_CHAIN_CONSUMPTION.
- experimental report evidence includes WORKBENCH_CHAIN_SEGMENT_CONTEXT.
- experimental report evidence includes WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE.
- chain consumption is tagged diagnostic_only_chain_consumption.
- chain segment context is tagged chain_context_diagnostic_only.
- route candidate influence is tagged route_candidate_influence_diagnostic_only.
- coach diagnosis mentions route candidate influence with control-space-hunter at Z4-HSR.
- prototype fallback status: enabled and observable, but not used to hide replay mismatch.

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
- CONFIRM_EXPERIMENTAL_CHAIN_CONTEXT_TO_ROUTE_CANDIDATE_INFLUENCE
- CONFIRM_ROUTE_CANDIDATE_INFLUENCE_IS_DIAGNOSTIC_ONLY
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_BLOCKED
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_NO_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_EXPERIMENTAL_CHAIN_CONTEXT_TO_SHADOW_ROUTE_SELECTION
