# FullMatch Workbench Chain Replay 3J

Sprint 3J adds a real isolated segment replay engine behind the opt-in workbench_chain_replay_experimental flag. The engine generates isolated replay events for the baseline and override paths, compares tactical consequences, and keeps every isolated event out of the official full-match timeline, official score, official scoring events, production route resolution, global route success rates, and global economy proof.

## Sprint 3J Summary
- default runFullMatch mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental.
- controlled replay comparison status: available.
- real isolated replay status: available.
- real isolated replay origin: controlled_segment_replay_comparison.
- baseline candidate: chain-context-safe-recycle-pv.
- baseline action: SAFE_RECYCLE.
- baseline receiver: control-pivot.
- baseline zone: Z2-HSL.
- baseline event count: greater than 0.
- baseline resulting carrier: control-pivot.
- baseline resulting zone: Z2-HSL.
- override candidate: chain-context-forward-progress-sh.
- override action: FORWARD_PROGRESS.
- override receiver: control-space-hunter.
- override zone: Z4-HSR.
- override event count: greater than 0.
- override resulting carrier: control-space-hunter.
- override resulting zone: Z4-HSR.
- selection divergence observed: true.
- possession continuity divergence observed: false.
- carrier divergence observed: true.
- zone progression divergence observed: true.
- danger creation divergence observed: true.
- scoring opportunity divergence observed: false.
- isolated timeline divergence observed: true.
- isolated score divergence observed: false.
- isolated scoring event divergence observed: false.
- replayAppliedOnlyInIsolatedEngine: true.
- replayAppliedToNormalLiveSelection: false.
- rejected closed candidate count: 1.
- rejected unavailable candidate count: 1.

## Isolated Replay Events
- baseline isolated replay events: isolated_route_selection, isolated_possession_update, isolated_zone_progression, isolated_replay_end.
- override isolated replay events: isolated_route_selection, isolated_possession_update, isolated_zone_progression, isolated_danger_signal, isolated_replay_end.
- isolated replay events are experimental-only: true.
- isolated replay events are official MatchEvents: false.
- isolated events injected into official timeline count: 0.
- official score mutation count: 0.
- official scoring event mutation count: 0.
- production scoring event creation count: 0.
- production route resolution mutation count: 0.
- global route success mutation count: 0.
- global economy claim count: 0.

## Chain And Segment Provenance
- consumed chain: sequence-1-multi-action-chain.
- controlled segment replay comparison baseline: chain-context-safe-recycle-pv.
- controlled segment replay comparison override: chain-context-forward-progress-sh.
- real isolated replay baseline: chain-context-safe-recycle-pv.
- real isolated replay override: chain-context-forward-progress-sh.
- WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON evidence is emitted only for the experimental run.
- WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY evidence is emitted only for the experimental run.

## Default Versus Experimental Official Signature
- default real isolated replay tag count: 0.
- experimental real isolated replay tag count: greater than 0.
- default and experimental official score signatures remain equal for now: YES.
- default and experimental official scoring event counts remain equal: YES.
- default and experimental official score_change totals remain equal: YES.
- default and experimental official timeline event counts remain equal: YES.
- no isolated replay event is inserted as an official MatchEvent: YES.

## Guardrails
- real isolated segment replay is experimental: true.
- real isolated segment replay is diagnostic-only: true.
- real isolated replay applies only inside isolated engine: true.
- real isolated replay applies to normal live selection: false.
- real isolated replay can inject events into official timeline: false.
- real isolated replay can mutate official score: false.
- real isolated replay can mutate official scoring events: false.
- real isolated replay can create production scoring events: false.
- real isolated replay can mutate production route resolution: false.
- real isolated replay can mutate global route success rates: false.
- real isolated replay can claim global economy: false.
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
- official final score remains derived only from official score_change consequences.
- production scoring events deleted/capped/rewritten/fabricated: 0.
- MatchBonusEvent unchanged.
- batch/live separation preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Next Recommendations
- CONFIRM_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE
- CONFIRM_REAL_REPLAY_EVENTS_ARE_ISOLATED_ONLY
- CONFIRM_REAL_REPLAY_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS
- CONFIRM_REPLAY_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION
- CONFIRM_REPLAY_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX
