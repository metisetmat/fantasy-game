# FullMatch Workbench Chain Replay 3K

Sprint 3K adds a controlled route resolution sandbox behind the opt-in workbench_chain_replay_experimental flag. The sandbox resolves the baseline and override routes from the real isolated replay into isolated-only route outcome fields. It never creates official MatchEvents, never mutates official score or scoring events, never drives production route resolution, and cannot claim global economy proof.

## Sprint 3K Summary
- default runFullMatch mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental.
- real isolated replay status: available.
- controlled route resolution sandbox status: available.
- controlled route resolution sandbox origin: real_isolated_segment_replay.
- baseline candidate: chain-context-safe-recycle-pv.
- baseline action: SAFE_RECYCLE.
- baseline receiver: control-pivot.
- baseline zone: Z2-HSL.
- baseline route resolves: true.
- baseline outcome: safe_retention.
- baseline resulting carrier: control-pivot.
- baseline resulting zone: Z2-HSL.
- baseline defensive pressure: 31.
- baseline reception quality: 86.
- baseline turnover risk: 12.
- baseline danger probability: 18.
- baseline scoring opportunity probability: 5.
- override candidate: chain-context-forward-progress-sh.
- override action: FORWARD_PROGRESS.
- override receiver: control-space-hunter.
- override zone: Z4-HSR.
- override route resolves: true.
- override outcome: dangerous_progression.
- override resulting carrier: control-space-hunter.
- override resulting zone: Z4-HSR.
- override defensive pressure: 58.
- override reception quality: 72.
- override turnover risk: 34.
- override danger probability: 64.
- override scoring opportunity probability: 24.
- override danger probability is greater than baseline danger probability: YES.
- selection divergence observed: true.
- carrier divergence observed: true.
- zone progression divergence observed: true.
- danger creation divergence observed: true.
- scoring opportunity divergence observed: false.
- sandbox scoring event divergence observed: false.
- sandbox score divergence observed: false.
- sandboxAppliedOnlyInIsolatedResolution: true.
- sandboxAppliedToNormalLiveSelection: false.
- rejected closed candidate count: 1.
- rejected unavailable candidate count: 1.

## Isolation And Mutation Guardrails
- sandbox results are isolated-only: true.
- sandbox results are official MatchEvents: false.
- sandbox events injected into official timeline count: 0.
- official score mutation count: 0.
- official scoring event mutation count: 0.
- production scoring event creation count: 0.
- production route resolution mutation count: 0.
- global route success mutation count: 0.
- global economy claim count: 0.
- sandbox can mutate official score: false.
- sandbox can mutate official scoring events: false.
- sandbox can create production scoring events: false.
- sandbox can mutate production route resolution: false.
- sandbox can mutate global route success rates: false.
- sandbox can claim global economy: false.

## Default Versus Experimental
- default sandbox tag count: 0.
- experimental sandbox tag count: greater than 0.
- default and experimental official score signatures remain equal for now: YES.
- default and experimental official scoring event counts remain equal: YES.
- default and experimental official score_change totals remain equal: YES.
- no sandbox result is inserted as an official MatchEvent: YES.
- normal full-match remains segment_harness by default.
- FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Evidence And Coach Copy
- evidence category: WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX.
- evidence facts added: YES.
- coach diagnosis mentions controlled route resolution sandbox: YES.
- stale coach wording status: absent.
- coach copy does not claim production chain-driven full-match.

## Scoring Guardrails
- SHOT_GOAL remains 3.
- TRY_TOUCHDOWN remains 5.
- CONVERSION_GOAL remains 2.
- DROP_GOAL remains 2.
- PENALTY_SHOT remains inactive.
- official score remains derived only from official score_change consequences.
- no production scoring events deleted or capped.
- MatchBonusEvent unchanged.
- batch/live separation preserved.

## Recommendation
- CONFIRM_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX.
- CONFIRM_SANDBOX_RESULTS_ARE_ISOLATED_ONLY.
- CONFIRM_SANDBOX_RESULTS_ARE_NOT_OFFICIAL_MATCH_EVENTS.
- CONFIRM_SANDBOX_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION.
- CONFIRM_SANDBOX_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.
- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.
- KEEP_SCORING_VALUES_UNCHANGED.
- KEEP_50_MATCH_ECONOMY_REFERENCE.
- PREPARE_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_TO_SANDBOX_SCORING_OPPORTUNITY_MODEL.
