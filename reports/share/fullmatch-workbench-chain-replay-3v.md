# FullMatch Workbench Chain Replay 3V

Sprint 3V adds a Coach-Facing Timeline Review built from the read-only Official Timeline Diff View, behind the opt-in workbench_chain_replay_experimental flag. It converts the technical diff into a readable coach panel while preserving the official timeline, score, possession, scoring events, production route resolution, scoring constants, MatchBonusEvent, and global economy boundary.

## Default FullMatch Reference

- default coach-facing timeline review tag count: 0
- default report has no experimental timeline review.
- default runFullMatch remains segment_harness.

## Experimental Coach-Facing Timeline Review

- official timeline diff view model status: available
- coach-facing timeline review status: available
- coach-facing timeline review origin: official_timeline_diff_view
- evidence category: WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW
- review block count: 4
- review title: Lecture timeline officielle vs sandbox
- review block: Ce qui s'est passé officiellement
- review block: Ce que le sandbox a rejoué
- review block: Ce qui est différent
- review block: Ce qui n'a pas été modifié
- technical workbench detail moved behind details: true
- coach copy clean: true

## Official State Boundary

- official timeline unchanged: true
- official score unchanged: true
- official possession unchanged: true
- official scoring events unchanged: true
- sandbox events official: false
- sandbox events inserted into official timeline: false
- production scoring event creation count: 0
- global economy claim count: 0
- model applied only in sandbox: true
- model applied to normal live selection: false

## Sandbox Replay Reference

- baseline sandbox-only event count: 9
- override sandbox-only event count: 9
- override final sandbox outcome: secured_by_goalkeeper_team
- override final team candidate: goalkeeper_team
- override final actor candidate: blitz-goalkeeper-free-safety
- override final zone candidate: Z3-HSR

## Source Of Truth Boundary

- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.
- coach-facing timeline review cannot override live score.
- coach-facing timeline review cannot override official timeline.
- coach-facing timeline review cannot override official possession.
- coach-facing timeline review cannot create production scoring events.
- coach-facing timeline review cannot mutate MatchBonusEvent.
- coach-facing timeline review cannot claim global economy.
- scoring constants unchanged: SHOT_GOAL=3, TRY_TOUCHDOWN=5, CONVERSION_GOAL=2, DROP_GOAL=2, PENALTY_SHOT inactive.

## Explicit Exhaustive Test Command

- npm run test:all

## Recommendations

- CONFIRM_OFFICIAL_TIMELINE_DIFF_TO_COACH_FACING_REVIEW
- CONFIRM_SANDBOX_REMAINS_NON_OFFICIAL
- CONFIRM_REPORT_READABILITY_IMPROVED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_DEFAULT_FULLMATCH_UNCHANGED
- PREPARE_COACH_REVIEW_TO_SANDBOX_DECISION_PANEL
