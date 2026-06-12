# FullMatch Workbench Chain Replay 3U

Sprint 3U adds an Official Timeline Diff View after the Controlled Segment Sandbox Timeline, behind the opt-in workbench_chain_replay_experimental flag. It reads the official full-match timeline and the baseline/override sandbox timelines, then exposes a read-only comparison proving that sandbox rows are not official MatchEvents, are not inserted into the official MatchReport timeline, and do not mutate official possession, score, scoring events, production route resolution, route-success rates, or global economy evidence.

## Default FullMatch Reference

- default official timeline diff view tag count: 0
- default report has no official timeline diff view tags.
- default full-match remains the normal segmented harness.

## Experimental Official Timeline Diff View

- official timeline diff view model status: available
- model origin: controlled_segment_sandbox_timeline
- evidence category: WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW
- model applied only in sandbox: true
- model applied to normal live selection: false
- diff view is read-only: true

## Official Timeline Snapshot

- official timeline event count before: unchanged
- official timeline event count after: unchanged
- official timeline event count delta: 0
- official scoring event count before: unchanged
- official scoring event count after: unchanged
- official scoring event count delta: 0
- official score before: unchanged
- official score after: unchanged
- official score delta: 0
- official possession changed: false

## Baseline Diff Path

- baseline sandbox-only event count: 9
- baseline final sandbox outcome: none
- baseline official timeline mutation count: 0
- baseline official score mutation count: 0
- baseline official scoring event mutation count: 0
- baseline sandbox events inserted into official timeline count: 0

## Override Diff Path

- override sandbox-only event count: 9
- override final sandbox outcome: secured_by_goalkeeper_team
- override final team candidate: goalkeeper_team
- override final actor candidate: blitz-goalkeeper-free-safety
- override final zone candidate: Z3-HSR
- override official timeline mutation count: 0
- override official score mutation count: 0
- override official scoring event mutation count: 0
- override sandbox events inserted into official timeline count: 0

## Divergence And Isolation

- sandbox outcome divergence observed: true
- sandbox final team divergence observed: true
- sandbox final zone divergence observed: true
- official timeline divergence observed: false
- official possession divergence observed: false
- official score divergence observed: false
- official scoring event divergence observed: false
- official possession mutation count: 0
- production scoring event creation count: 0
- production route resolution mutation count: 0
- global route success mutation count: 0
- global economy claim count: 0
- rejected closed candidate count: 1
- rejected unavailable candidate count: 1

## Source Of Truth Boundary

- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.
- official timeline diff view cannot override live score.
- official timeline diff view cannot override official timeline.
- official timeline diff view cannot override official possession.
- official timeline diff view cannot create production scoring events.
- official timeline diff view cannot mutate MatchBonusEvent.
- official timeline diff view cannot claim global economy.

## Recommendations

- CONFIRM_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_TO_OFFICIAL_TIMELINE_DIFF_VIEW
- CONFIRM_OFFICIAL_TIMELINE_DIFF_VIEW_READ_ONLY
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_OFFICIAL_TIMELINE_DIFF_VIEW_TO_COACH_FACING_TIMELINE_REVIEW
