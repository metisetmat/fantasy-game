# FullMatch Workbench Chain Replay 2Z

Sprint 2Z wires the visual WorkbenchChain into runFullMatch behind the opt-in workbench_chain_replay_experimental flag. The consumption is diagnostic-only and does not mutate score or scoring events.

## Sprint 2Z Summary
- Visual chain replay: validated.
- Experimental full-match chain consumption: diagnostic-only.
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

## Default vs Experimental Signature
- default chain consumption count: 0.
- experimental chain consumption count: 1.
- default and experimental score signatures remain equal for now: YES.
- score mutation count: 0.
- scoring events mutation count: 0.
- final score remains derived only from score_change consequences.

## Diagnostics And Coach Visibility
- experimental report limitations include FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1.
- experimental report evidence includes WORKBENCH_CHAIN_CONSUMPTION.
- chain consumption is tagged diagnostic_only_chain_consumption.
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
- CONFIRM_EXPERIMENTAL_FULLMATCH_CHAIN_CONSUMPTION
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_CHAIN_CONSUMPTION_DIAGNOSTIC_ONLY
- CONFIRM_NO_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_EXPERIMENTAL_CHAIN_INFLUENCE_ON_SEGMENT_CONTEXT
