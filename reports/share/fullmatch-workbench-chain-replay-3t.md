# FullMatch Workbench Chain Replay 3T

Sprint 3T adds a Controlled Segment Sandbox Timeline after the Sandbox Sequence Replay, behind the opt-in workbench_chain_replay_experimental flag. It projects the baseline and override sandbox sequence paths into typed sandbox timeline events without creating official MatchEvents, inserting events into the official MatchReport timeline, mutating official possession, changing official score, creating production ScoringEvents, mutating production route resolution, mutating route-success rates, or claiming global economy proof.

## Default FullMatch Reference

- default controlled segment sandbox timeline tag count: 0
- default report has no controlled segment sandbox timeline tags.
- default full-match remains the normal segmented harness.

## Experimental Controlled Segment Sandbox Timeline

- controlled segment sandbox timeline model status: available
- model origin: sandbox_sequence_replay
- evidence category: WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE
- sandbox timeline created: true
- sandbox timeline separate from official timeline: true
- model applied only in sandbox: true
- model applied to normal live selection: false

## Baseline Timeline Path

- baseline event count: 9
- baseline event types: sandbox_sequence_start > sandbox_baseline_route_reference > sandbox_no_scoring_opportunity > sandbox_no_scoring_event_candidate > sandbox_no_score_attempt > sandbox_no_goalkeeper_response > sandbox_no_rebound > sandbox_no_continuation > sandbox_sequence_end
- baseline final outcome: none

## Override Timeline Path

- override event count: 9
- override event types: sandbox_sequence_start > sandbox_route_resolved > sandbox_opportunity_classified > sandbox_scoring_candidate_created > sandbox_shot_resolved > sandbox_goalkeeper_response > sandbox_rebound_state > sandbox_continuation_action > sandbox_sequence_end
- override route outcome: dangerous_progression
- override opportunity type: half_chance
- override candidate type: SHOT_CANDIDATE
- override shot result: SAVED_BY_GK
- override goalkeeper response: PARRIED_SAVE
- override rebound state: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE
- override ball loose state: safe_area
- override continuation action: GOALKEEPER_TEAM_SECURE_RECOVERY
- override final outcome: secured_by_goalkeeper_team
- override final team candidate: goalkeeper_team
- override final actor candidate: blitz-goalkeeper-free-safety
- override final zone candidate: Z3-HSR

## Divergence And Isolation

- sandbox timeline event count divergence observed: false
- sandbox timeline outcome divergence observed: true
- sandbox timeline final team divergence observed: true
- sandbox timeline final zone divergence observed: true
- official timeline divergence observed: false
- official possession divergence observed: false
- official score divergence observed: false
- official scoring event divergence observed: false
- official timeline event created count: 0
- official timeline mutation count: 0
- official possession mutation count: 0
- official score mutation count: 0
- official scoring event mutation count: 0
- production scoring event creation count: 0
- production route resolution mutation count: 0
- global route success mutation count: 0
- global economy claim count: 0
- rejected closed candidate count: 1
- rejected unavailable candidate count: 1

## Source Of Truth Boundary

- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.
- controlled segment sandbox timeline cannot override live score.
- controlled segment sandbox timeline cannot override official timeline.
- controlled segment sandbox timeline cannot override official possession.
- controlled segment sandbox timeline cannot create production scoring events.
- controlled segment sandbox timeline cannot mutate MatchBonusEvent.

## Recommendations

- CONFIRM_SANDBOX_SEQUENCE_REPLAY_TO_CONTROLLED_SEGMENT_SANDBOX_TIMELINE
- CONFIRM_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_IS_ISOLATED_ONLY
- CONFIRM_SANDBOX_TIMELINE_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS
- CONFIRM_SANDBOX_TIMELINE_IS_SEPARATE_FROM_OFFICIAL_TIMELINE
- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS
- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_MUTATE_OFFICIAL_POSSESSION
- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_MUTATE_OFFICIAL_TIMELINE
- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED_UPSTREAM
- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED
- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_TO_OFFICIAL_TIMELINE_DIFF_VIEW