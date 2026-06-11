# FullMatch Workbench Chain Replay 3I

Sprint 3I turns the isolated mini-match override experiment into a controlled segment replay comparison behind the opt-in workbench_chain_replay_experimental flag. It compares baseline and override replay paths for segment-1, but remains isolated: it does not apply to normal live selection, official score, official scoring events, production route resolution, global route success rates, or global economy proof.

## Sprint 3I Summary
- default runFullMatch controlled segment replay comparison status: not_available.
- isolated mini-match override experiment status: available.
- controlled segment replay comparison status: available.
- controlled segment replay comparison origin: isolated_minimatch_override_experiment.
- baseline candidate: chain-context-safe-recycle-pv.
- baseline action: SAFE_RECYCLE.
- baseline receiver: control-pivot.
- baseline zone: Z2-HSL.
- override candidate: chain-context-forward-progress-sh.
- override action: FORWARD_PROGRESS.
- override receiver: control-space-hunter.
- override zone: Z4-HSR.
- baseline possession retained: true.
- override possession retained: true.
- baseline resulting zone: Z2-HSL.
- override resulting zone: Z4-HSR.
- selection divergence observed: true.
- possession continuity divergence observed: false.
- zone progression divergence observed: true.
- danger creation divergence observed: true.
- scoring opportunity divergence observed: false.
- timeline divergence observed: true.
- score divergence observed: false.
- scoring event divergence observed: false.
- replayAppliedOnlyInIsolatedComparison: true.
- replayAppliedToNormalLiveSelection: false.
- rejected closed candidate count: 1.
- rejected unavailable candidate count: 1.

## Chain And Segment Provenance
- consumed chain: sequence-1-multi-action-chain.
- final chain carrier: control-space-hunter.
- final chain zone: Z4-HSR.
- route candidate influence selected candidate: chain-context-forward-progress-sh.
- shadow route selection candidate: chain-context-forward-progress-sh.
- controlled segment selection candidate: chain-context-forward-progress-sh.
- SegmentRouteInput candidate: chain-context-forward-progress-sh.
- controlled mini-match route source candidate: chain-context-forward-progress-sh.
- live selection override guard candidate: chain-context-forward-progress-sh.
- isolated mini-match override experiment candidate: chain-context-forward-progress-sh.
- controlled segment replay comparison baseline: chain-context-safe-recycle-pv.
- controlled segment replay comparison override: chain-context-forward-progress-sh.
- WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD evidence is emitted only for the experimental run.
- WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT evidence is emitted only for the experimental run.
- WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON evidence is emitted only for the experimental run.

## Default Versus Experimental Signature
- default isolated mini-match override experiment tag count: 0.
- experimental isolated mini-match override experiment tag count: greater than 0.
- default controlled segment replay comparison tag count: 0.
- experimental controlled segment replay comparison tag count: greater than 0.
- default and experimental score signatures remain equal for now: YES.
- default and experimental scoring event counts remain equal: YES.
- default and experimental score_change totals remain equal: YES.
- normal full-match score mutation count: 0.
- normal full-match scoring events mutation count: 0.
- production scoring event creation count: 0.
- global route success rate mutation count: 0.
- global economy claim count: 0.

## Guardrails
- controlled segment replay comparison is experimental: true.
- controlled segment replay comparison is diagnostic-only: true.
- controlled segment replay comparison applies only inside isolated comparison: true.
- controlled segment replay comparison applies to normal live selection: false.
- controlled segment replay comparison can mutate normal score: false.
- controlled segment replay comparison can mutate normal scoring events: false.
- controlled segment replay comparison can create production scoring events: false.
- controlled segment replay comparison can mutate production route resolution: false.
- controlled segment replay comparison can mutate global route success rates: false.
- controlled segment replay comparison can claim global economy: false.
- CLOSED candidates remain unselectable.
- unavailable candidates remain unselectable.
- normal full-match is not claimed as production chain-driven.
- stale coach wording status: absent.

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
- CONFIRM_ISOLATED_OVERRIDE_EXPERIMENT_TO_CONTROLLED_SEGMENT_REPLAY_COMPARISON
- CONFIRM_REPLAY_COMPARISON_IS_ISOLATED_ONLY
- CONFIRM_REPLAY_COMPARISON_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION
- CONFIRM_REPLAY_COMPARISON_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_NO_NORMAL_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE
