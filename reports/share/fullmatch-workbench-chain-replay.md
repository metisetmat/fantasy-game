# FullMatch Workbench Chain Replay

Sprint 2W creates the first controlled WorkbenchChain replay path. The chain is diagnostic/control data, not scoring truth.

## Mandatory Diagnosis
1. Does a WorkbenchChain contract exist? YES.
2. Can sequence-1-action-1 be represented as a chain? YES.
3. Does chain state propagation work? YES: TH -> ML and Z4-HSL -> Z3-HSL are propagated.
4. Does controlled mini-match consume chain steps? YES/PARTIAL: controlled_minimatch uses spatial_candidate_modifier and preserves TH -> ML, while normal full-match is not chain-driven.
5. Does normal full-match consume chains by default? NO.
6. Is prototype fallback still present? YES.
7. Does TH -> ML remain preserved? YES.
8. Did scoring values change? NO.
9. Did scoring events change? NO.
10. What remains next? Multi-action workbench chains and a normal full-match spatial-selection/chain replay feature flag.

## WorkbenchChain Contract
```text
WorkbenchFrame[]
-> WorkbenchChain
-> SpatialMatchContext per frame
-> WorkbenchChainRuntimeState propagation
-> controlled mini-match route selection
-> warning-only full-match evidence
```

## What Was Added
- WorkbenchChain and WorkbenchChainReplayMode contracts.
- sequence-1-action-1-chain fixture.
- WorkbenchChainRuntimeState and state propagation guards.
- replayWorkbenchChain diagnostic_only, controlled_minimatch, and fullmatch_warning_only modes.
- Workbench chain catalog with future extension points.
- Replay seed fields linking the one-step seed to chain replay.
- Full-match grounding diagnostics and evidence facts for chain availability.

## Sequence 1 Action 1 Chain
- chainId: sequence-1-action-1-chain.
- expected possession team: control.
- expected defending team: blitz.
- initial ball carrier: control-tempo-half.
- initial ball zone: Z4-HSL.
- expected action: SUPPORT_CLUSTER_RECYCLE.
- expected receiver/new carrier: control-mobile-lock.
- final expected ball zone: Z3-HSL.
- state propagation warnings for valid fixture: 0.

## Replay Modes
- diagnostic_only: validates chain state propagation and creates no scoring events.
- controlled_minimatch: runs mini-match with spatialContext, candidate_modifier, spatial_candidate_modifier, and routeSelectionWorkbench.
- fullmatch_warning_only: does not alter runFullMatch and only emits limitation evidence.

## Controlled Mini-Match Evidence
- controlled_minimatch uses spatial_candidate_modifier.
- TH -> ML remains preserved for sequence-1-action-1.
- prototype fallback remains enabled.
- CLOSED and NOT_AVAILABLE_NOW route guardrails remain inherited from Sprint 2V.

## Full-Match Status
- WORKBENCH_CHAIN_REPLAY_AVAILABLE is reported.
- WORKBENCH_CHAIN_REPLAY_CONTROLLED_ONLY is reported.
- NORMAL_FULLMATCH_NOT_YET_CHAIN_REPLAY_DRIVEN is reported.
- FULLMATCH_STILL_USES_SEGMENT_HARNESS is reported.
- Normal full-match is not falsely claimed as chain-driven.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_WORKBENCH_CHAIN_REPLAY_V0
- CONFIRM_CHAIN_STATE_PROPAGATION
- CONFIRM_CONTROLLED_MINIMATCH_CHAIN_REPLAY
- CONFIRM_NORMAL_FULLMATCH_NOT_CHAIN_DRIVEN
- CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_MULTI_ACTION_WORKBENCH_CHAIN
- PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG
