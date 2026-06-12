# FullMatch Workbench Chain Replay 3Q

Sprint 3Q adds a Rebound & Second Chance Sandbox after the goalkeeper response model, behind the opt-in workbench_chain_replay_experimental flag. It asks what happens after the PARRIED_SAVE / safe_deflection result without creating official MatchEvents, production ScoringEvents, official possession changes, official score changes, production route-resolution changes, route-success-rate changes, or global economy claims.

## Default Mode
- default mode: segment_harness
- workbench_chain_replay_experimental: opt-in only
- default rebound second chance tag count: 0
- default report has no rebound second chance tags.

## Experimental Mode
- goalkeeper response model status: available
- rebound second chance model status: available
- model origin: goalkeeper_response_model_sandbox
- segment scope: segment-1 only
- evidence category: WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX

## Baseline Rebound State
- baseline response type: NOT_APPLICABLE
- baseline rebound outcome: NO_REBOUND
- baseline ball loose state: none
- baseline second chance created: false
- baseline sandbox match event created: false
- baseline sandbox scoring event created: false
- baseline sandbox score delta: 0

## Override Rebound State
- override shooter id: control-space-hunter
- override goalkeeper id: blitz-goalkeeper-free-safety
- override target zone: Z4-HSR
- override goalkeeper response type: PARRIED_SAVE
- override source rebound state: safe_deflection
- shot quality faced: 53
- goalkeeper response score: 65
- save margin: 12
- handling score: 78
- rebound control score: 73
- concentration score: 68
- mental fatigue impact: 8
- attacking proximity score: 61
- defensive recovery score: 77
- rebound danger score: 4
- second chance probability: 4
- override rebound outcome: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE
- override ball loose state: safe_area
- override recovery team candidate: goalkeeper_team
- override next sandbox possession candidate: goalkeeper_team
- override second chance created: false

## Divergence Observed
- rebound outcome divergence observed: true
- ball loose state divergence observed: true
- recovery team divergence observed: true
- second chance probability observed: true
- second chance creation divergence observed: false
- sandbox scoring event divergence observed: false
- sandbox score divergence observed: false

## Guardrails
- sandbox match event created count: 0
- sandbox scoring event created count: 0
- sandbox score delta total: 0
- official possession mutation count: 0
- modelAppliedOnlyInSandbox: true
- modelAppliedToNormalLiveSelection: false
- rejected closed candidate count: 1
- rejected unavailable candidate count: 1
- sandbox rebound injected into official timeline count: 0
- official score mutation count: 0
- official scoring event mutation count: 0
- production scoring event creation count: 0
- production route resolution mutation count: 0
- global route success mutation count: 0
- global economy claim count: 0

## Official Signature
- default vs experimental official score signature: equal
- default vs experimental official scoring event count: equal
- default vs experimental official score_change total: equal
- normal full-match is not production chain-driven.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Coach Diagnosis
- coach diagnosis status: rebound / second chance sandbox mentioned
- coach copy wording status: no stale production wording
- scoring guardrail status: PASS
- source-of-truth status: PASS
- explicit exhaustive test command status: npm run test:all

## Recommendation
- CONFIRM_GOALKEEPER_RESPONSE_MODEL_TO_REBOUND_SECOND_CHANCE_SANDBOX
- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_IS_ISOLATED_ONLY
- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_IS_NOT_AN_OFFICIAL_MATCH_EVENT
- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS
- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_DOES_NOT_MUTATE_OFFICIAL_POSSESSION
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_REBOUND_SECOND_CHANCE_SANDBOX_TO_MULTI_ACTION_CONTINUATION_SANDBOX
