# FullMatch Workbench Chain Replay 3L

Sprint 3L adds a sandbox scoring opportunity model behind the opt-in workbench_chain_replay_experimental flag. It classifies controlled route-resolution sandbox metrics into typed sandbox opportunity signals. These signals are isolated-only: they are not official MatchEvents, do not create production scoring events, do not mutate official score or official scoring events, do not drive production route resolution, and cannot claim global economy proof.

## Sprint 3L Summary
- default runFullMatch mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental.
- controlled route resolution sandbox status: available.
- sandbox scoring opportunity model status: available.
- opportunity model origin: controlled_route_resolution_sandbox.
- baseline candidate: chain-context-safe-recycle-pv.
- baseline action: SAFE_RECYCLE.
- baseline receiver: control-pivot.
- baseline target zone: Z2-HSL.
- baseline route outcome: safe_retention.
- baseline danger probability: 18.
- baseline scoring opportunity probability: 5.
- baseline opportunity type: no_opportunity.
- baseline opportunity family: none.
- baseline opportunity probability: 5.
- baseline opportunity created: false.
- override candidate: chain-context-forward-progress-sh.
- override action: FORWARD_PROGRESS.
- override receiver: control-space-hunter.
- override target zone: Z4-HSR.
- override route outcome: dangerous_progression.
- override danger probability: 64.
- override scoring opportunity probability: 24.
- override opportunity type: half_chance.
- override opportunity family: territorial_danger.
- override opportunity probability: 24.
- override opportunity created: true.
- opportunity type divergence observed: true.
- opportunity family divergence observed: true.
- opportunity probability divergence observed: true.
- opportunity creation divergence observed: true.
- sandbox scoring event divergence observed: false.
- sandbox score divergence observed: false.
- sandbox scoring event created count: 0.
- sandbox score delta total: 0.
- modelAppliedOnlyInSandbox: true.
- modelAppliedToNormalLiveSelection: false.
- rejected closed candidate count: 1.
- rejected unavailable candidate count: 1.
- sandbox opportunity injected into official timeline count: 0.
- official score mutation count: 0.
- official scoring event mutation count: 0.
- production scoring event creation count: 0.
- production route resolution mutation count: 0.
- global route success mutation count: 0.
- global economy claim count: 0.
- default sandbox opportunity tag count: 0.
- experimental sandbox opportunity tag count: greater than 0.
- default and experimental official score signatures remain equal for now: YES.
- default and experimental official scoring event counts remain equal: YES.
- default and experimental official score_change totals remain equal: YES.
- evidence category: WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL.
- evidence facts added: YES.
- coach diagnosis status: mentions sandbox scoring opportunity model.
- stale coach wording status: absent.
- explicit exhaustive test command: npm run test:all.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Isolation Guardrails
- sandbox opportunity results are official MatchEvents: false.
- no sandbox opportunity is inserted as an official MatchEvent: YES.
- sandbox opportunity can mutate official score: false.
- sandbox opportunity can mutate official scoring events: false.
- sandbox opportunity can create production scoring events: false.
- sandbox opportunity can mutate production route resolution: false.
- sandbox opportunity can mutate global route success rates: false.
- sandbox opportunity can claim global economy: false.
- normal full-match is production chain-driven: false.
- workbench_chain_replay_experimental remains opt-in: true.

## Interpretation
The baseline SAFE_RECYCLE remains a possession-retention result with low scoring opportunity probability and is classified as no_opportunity. The override FORWARD_PROGRESS reaches higher danger and scoring-opportunity probability and is classified as half_chance in the territorial_danger family. This is a sandbox signal only; it prepares a later sandbox scoring-event candidate layer without changing live scoring.

## Recommendation
- CONFIRM_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_TO_SANDBOX_SCORING_OPPORTUNITY_MODEL.
- CONFIRM_SANDBOX_OPPORTUNITIES_ARE_ISOLATED_ONLY.
- CONFIRM_SANDBOX_OPPORTUNITIES_ARE_NOT_OFFICIAL_MATCH_EVENTS.
- CONFIRM_SANDBOX_OPPORTUNITY_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.
- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.
- KEEP_SCORING_VALUES_UNCHANGED.
- KEEP_50_MATCH_ECONOMY_REFERENCE.
- PREPARE_SANDBOX_SCORING_OPPORTUNITY_MODEL_TO_SANDBOX_SCORING_EVENT_CANDIDATE.