# FullMatch Workbench Chain Replay 3N

Sprint 3N adds a sandbox scoring event resolution layer behind the opt-in workbench_chain_replay_experimental flag. It resolves the Sprint 3M sandbox scoring-event candidate into an isolated tactical scoring outcome. The resolution remains sandbox-only: it is not an official MatchEvent, does not create production scoring events, does not mutate official score or official scoring events, does not drive production route resolution, and cannot claim global economy proof.

## Sprint 3N Summary
- default runFullMatch mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental.
- controlled route resolution sandbox status: available.
- sandbox scoring opportunity model status: available.
- sandbox scoring event candidate model status: available.
- sandbox scoring event resolution model status: available.
- opportunity model origin: controlled_route_resolution_sandbox.
- scoring event candidate model origin: sandbox_scoring_opportunity_model.
- scoring event resolution model origin: sandbox_scoring_event_candidate.
- baseline candidate: chain-context-safe-recycle-pv.
- baseline action: SAFE_RECYCLE.
- baseline receiver: control-pivot.
- baseline target zone: Z2-HSL.
- baseline route outcome: safe_retention.
- baseline danger probability: 18.
- baseline scoring opportunity probability: 5.
- baseline opportunity type: no_opportunity.
- baseline scoring candidate type: NO_SCORING_EVENT.
- baseline scoring candidate family: none.
- baseline scoring candidate probability: 0.
- baseline conversion probability: 0.
- baseline scoring candidate created: false.
- baseline resolution type: NO_SCORE_ATTEMPT.
- baseline shot attempt created: false.
- baseline shot quality: 0.
- baseline goalkeeper response: not_applicable.
- baseline sandbox scoring event created: false.
- baseline sandbox score delta: 0.
- override candidate: chain-context-forward-progress-sh.
- override action: FORWARD_PROGRESS.
- override receiver: control-space-hunter.
- override target zone: Z4-HSR.
- override route outcome: dangerous_progression.
- override danger probability: 64.
- override scoring opportunity probability: 24.
- override opportunity type: half_chance.
- override scoring candidate type: SHOT_CANDIDATE.
- override scoring candidate family: shot.
- override scoring candidate probability: 24.
- override conversion probability: 14.
- override scoring candidate created: true.
- override resolution type: SHOT_ON_TARGET.
- override shot attempt created: true.
- override shot quality: 44.
- override goalkeeper response: not_evaluated.
- override sandbox scoring event created: false.
- override sandbox score delta: 0.
- scoring resolution type divergence observed: true.
- shot attempt creation divergence observed: true.
- shot quality divergence observed: true.
- goalkeeper response divergence observed: true.
- sandbox scoring event divergence observed: false.
- sandbox score divergence observed: false.
- sandbox scoring event created count: 0.
- sandbox score delta total: 0.
- modelAppliedOnlyInSandbox: true.
- modelAppliedToNormalLiveSelection: false.
- rejected closed candidate count: 1.
- rejected unavailable candidate count: 1.
- sandbox resolution injected into official timeline count: 0.
- official score mutation count: 0.
- official scoring event mutation count: 0.
- production scoring event creation count: 0.
- production route resolution mutation count: 0.
- global route success mutation count: 0.
- global economy claim count: 0.
- default sandbox scoring resolution tag count: 0.
- experimental sandbox scoring resolution tag count: greater than 0.
- default and experimental official score signatures remain equal for now: YES.
- default and experimental official scoring event counts remain equal: YES.
- default and experimental official score_change totals remain equal: YES.
- evidence category: WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION.
- evidence facts added: YES.
- coach diagnosis status: mentions sandbox scoring event resolution model.
- stale coach wording status: absent.
- explicit exhaustive test command: npm run test:all.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Isolation Guardrails
- sandbox scoring resolution results are official MatchEvents: false.
- no sandbox scoring resolution is inserted as an official MatchEvent: YES.
- sandbox scoring resolution can mutate official score: false.
- sandbox scoring resolution can mutate official scoring events: false.
- sandbox scoring resolution can create production scoring events: false.
- sandbox scoring resolution can mutate production route resolution: false.
- sandbox scoring resolution can mutate global route success rates: false.
- sandbox scoring resolution can claim global economy: false.
- normal full-match is production chain-driven: false.
- workbench_chain_replay_experimental remains opt-in: true.

## Interpretation
The baseline SAFE_RECYCLE remains a possession-retention result with no scoring attempt: NO_SCORE_ATTEMPT, shot quality 0, goalkeeper response not_applicable. The override FORWARD_PROGRESS inherits the SHOT_CANDIDATE and resolves as SHOT_ON_TARGET with heuristic shot quality 44 and goalkeeper response not_evaluated. This is a sandbox resolution only; it proves the next layer can resolve a possible scoring outcome without creating one officially.

## Recommendation
- CONFIRM_SANDBOX_SCORING_EVENT_CANDIDATE_TO_SANDBOX_SCORING_EVENT_RESOLUTION.
- CONFIRM_SANDBOX_SCORING_RESOLUTION_IS_ISOLATED_ONLY.
- CONFIRM_SANDBOX_SCORING_RESOLUTION_IS_NOT_AN_OFFICIAL_MATCH_EVENT.
- CONFIRM_SANDBOX_SCORING_RESOLUTION_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.
- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.
- KEEP_SCORING_VALUES_UNCHANGED.
- KEEP_50_MATCH_ECONOMY_REFERENCE.
- PREPARE_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION.