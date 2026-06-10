# Tactical Grounding Reconciliation

Sprint 2R reconciles the Sequence 1 Action 1 workbench truth with the mini-match engine and the full-match harness.

## 1. What Sequence 1 Action 1 Proves
- Before action: CONTROL TH carries the ball in Z4-HSL.
- Selected action: TH -> ML.
- Selected action type: SUPPORT_CLUSTER_RECYCLE.
- Selected action subtype: BALL_SIDE_PRESSURE_ESCAPE.
- Tactical target cluster: Z3-C.
- Actual reception zone and ball zone after action: Z3-HSL.
- New carrier: CONTROL ML.
- CONTROL and BLITZ both have before/after role-position truth in the workbench.

## 2. Mini-Match Alignment
- Status: PARTIAL.
- Mini-match can represent selected action semantics, from-zone, target cluster, reception zone, and selected-vs-ranked alternatives in reports.
- Mini-match does not yet consume complete workbench before/after shape truth as an input.
- Mini-match still maps identities through CONTROL/BLITZ prototype role players rather than official roster snapshots.

## 3. Roster-To-Mini-Match Gap
- TeamSnapshot.roster does not yet drive mini-match player positions.
- TeamSnapshot.starters does not yet select active mini-match players.
- PlayerSnapshot.role and visible/derived attributes do not yet drive route ranking.
- TacticalPlan contributes tags and context, but does not fully drive spatial team shape.
- CONTROL/BLITZ prototypes remain dominant.

## 4. Full-Match Harness Gap
- Full-match uses the mini-match harness and segment-state propagation, but it is not yet a workbench replay engine.
- A score such as CONTROL 45 - 0 BLITZ can be warning-worthy without proving scoring values are wrong.
- The mismatch is caused by missing roster-to-spatial-context conversion and missing workbench replay, not by SHOT_GOAL / TRY / DROP point values.

## 5. Why A 45-0 Can Still Happen
- The full-match harness repeats mini-match prototype resolution across segments.
- It does not yet replay visual action truth such as TH -> ML under pressure from the workbench.
- It does not yet convert official player identity, role locations, and after-state team shape into the resolution state.
- Therefore the result is a harness plausibility signal, not a global economy verdict.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_WORKBENCH_TRUTH_FIXTURE
- CONFIRM_MINIMATCH_ALIGNMENT_PARTIAL
- CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_GAP
- CONFIRM_FULLMATCH_NOT_YET_WORKBENCH_GROUNDED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER
- PREPARE_WORKBENCH_REPLAY_ENGINE
