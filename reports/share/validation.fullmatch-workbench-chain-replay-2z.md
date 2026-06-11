# FullMatch Workbench Chain Replay 2Z Validation

Status: PASS

## Checks
- PASS: runFullMatch default remains segment_harness.
- PASS: workbench_chain_replay_experimental remains opt-in.
- PASS: default runFullMatch does not consume chain.
- PASS: experimental runFullMatch consumes sequence-1-multi-action-chain.
- PASS: consumed segment is segment-1.
- PASS: consumed chain step count is 3.
- PASS: visual step count is 3.
- PASS: synthetic step count is 0.
- PASS: spatial_candidate_modifier is used for 3/3 consumed steps.
- PASS: selected actor preserved for 3/3 consumed steps.
- PASS: selected receiver preserved for 3/3 consumed steps.
- PASS: selected action type preserved for 3/3 consumed steps.
- PASS: before state preserved for 3/3 consumed steps.
- PASS: after state preserved for 3/3 consumed steps.
- PASS: final propagated carrier is control-space-hunter.
- PASS: final propagated zone is Z4-HSR.
- PASS: fallback does not hide replay mismatch.
- PASS: experimental chain consumption is diagnostic-only.
- PASS: experimental chain consumption does not mutate score.
- PASS: experimental chain consumption does not mutate scoring events.
- PASS: default and experimental score signatures remain equal for now.
- PASS: normal full-match is not falsely claimed as chain-driven.
- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.
- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.
- PASS: scoring constants unchanged.
- PASS: no scoring events deleted or capped.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: 50-match economy preserved.

## Counts
- default chain consumption count: 0
- experimental chain consumption count: 1
- consumed chains: 1
- consumed segments: 1
- consumed steps: 3
- visual workbench steps: 3
- synthetic continuation steps: 0
- hybrid steps: 0
- spatial selection steps: 3
- actor preserved steps: 3
- receiver preserved steps: 3
- action type preserved steps: 3
- before state preserved steps: 3
- after state preserved steps: 3
- mismatch warning types checked: 2
- score mutation count: 0
- scoring event mutation count: 0
- default scoring event count: unchanged
- experimental scoring event count: unchanged
- scoring constants changed: 0
- scoring events deleted or capped: 0
- share file count: 16

## Recommendation
- CONFIRM_EXPERIMENTAL_FULLMATCH_CHAIN_CONSUMPTION
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_CHAIN_CONSUMPTION_DIAGNOSTIC_ONLY
- CONFIRM_NO_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_EXPERIMENTAL_CHAIN_INFLUENCE_ON_SEGMENT_CONTEXT
