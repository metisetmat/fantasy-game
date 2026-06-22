# Full-Match Calibration Carryover Reconciliation 6C

Sprint 6C is diagnostic only. It reconciles prior calibration work against the current official full-match scoring path and explains why a single full-match run can still show an extreme SHOT_GOAL-only score without changing scoring values, capping score, deleting events, or rewriting official score_change entries.

## Summary
- status: available
- scope: FULL_MATCH_CALIBRATION_CARRYOVER_SINGLE_RUN
- version: CALIBRATION_CARRYOVER_6C
- official full-match score: 45 - 0
- official full-match scoring events: 15
- official full-match SHOT_GOAL events: 15
- official full-match SHOT_GOAL points: 45
- batch calibration known SHOT_GOAL per match: 2
- batch calibration known conversion rate: 35
- shot difficulty calibration applied in batch: true
- shot difficulty calibration applied in full-match: false
- scoring choice balance applied in batch: true
- scoring choice balance applied in full-match: false
- scoring affordance volume applied in batch: true
- scoring affordance volume applied in full-match: false
- goalkeeper calibration applied in batch: true
- goalkeeper calibration applied in full-match: false
- rebound calibration applied in batch: true
- rebound calibration applied in full-match: false
- fatigue calibration applied in batch: true
- fatigue calibration applied in full-match: false
- route family mix applied in batch: true
- route family mix applied in full-match: false
- full-match uses parallel scoring path: true
- full-match uses legacy shot path: true
- full-match uses fallback route path: true
- full-match uses segment amplification path: true
- primary regression cause: FULLMATCH_PARALLEL_SCORING_PATH
- secondary regression causes: FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION, FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE, FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS, FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED, FULLMATCH_SEGMENT_AMPLIFICATION_RISK
- confidence: high
- carryover matrix rows: 10
- scoring path audit rows: 5
- warnings: FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION, FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE, FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS, FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING, FULLMATCH_SHOT_GOAL_MONO_FAMILY, FULLMATCH_SEGMENT_AMPLIFICATION_RISK, FULLMATCH_PARALLEL_SCORING_PATH, FULLMATCH_LEGACY_SCORING_PATH, FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED, FULLMATCH_DEFENSIVE_RESISTANCE_NOT_APPLIED, FULLMATCH_FATIGUE_OFFENSIVE_PRECISION_NOT_APPLIED, FULLMATCH_DANGER_PHASE_NOT_CONNECTED, CALIBRATION_DIAGNOSTIC_ONLY, GLOBAL_ECONOMY_NOT_PROVEN
- scoring constants changed: false
- score cap applied: false
- post-hoc score rewrite applied: false
- scoring events deleted: false
- scoring events rewritten: false
- forced opponent score applied: false
- official timeline mutation count: 0
- official possession mutation count: 0
- production scoring event creation count: 0
- batch/live separation preserved: true
- MatchBonusEvent changed: false
- persistence used for calibration: false
- SQLite used as score economy source: false
- global economy claim count: 0
- trend proof claim count: 0
- invented statistic count: 0
- single-run only: true
- FULL_MATCH_BATCH_ECONOMY remains only global proof: true
- recommendation: PREPARE_6D_CONNECT_FULLMATCH_TO_VALIDATED_SCORING_CALIBRATIONS

## Calibration Carryover Matrix
| Calibration | Validated | Batch applied | Live applied | Full-match official applied | Gap | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Shot difficulty calibration | true | true | true | false | FULLMATCH_NOT_USING_BATCH_CALIBRATION | Connect the official full-match scoring path to the validated shot difficulty resolver before any scoring-value rebalance. |
| Shot outcome resolution | true | true | true | false | FULLMATCH_PARALLEL_SCORING_PATH | Route official score_change creation through the resolved scoring event source. |
| Shot dominance diagnostic | true | true | false | false | FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING | Keep the diagnosis as a guard and avoid calling this single run balanced. |
| Scoring choice balance | true | true | true | false | FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING | Feed calibrated route-family competition into the official full-match scoring route. |
| Scoring affordance volume | true | true | false | false | FULLMATCH_SEGMENT_AMPLIFICATION_RISK | Apply affordance volume constraints before score_change emission, not after reporting. |
| Goalkeeper shot-stopping impact | true | true | true | false | FULLMATCH_NOT_USING_BATCH_CALIBRATION | Wire goalkeeper outcome pressure into the official full-match shot resolution path. |
| Rebound continuation coherence | true | true | true | false | FULLMATCH_PARALLEL_SCORING_PATH | Make live rebound outcomes gate second scoring events before they become official score_change entries. |
| Scramble/contact contest | true | true | true | false | FULLMATCH_NOT_USING_BATCH_CALIBRATION | Carry defensive resistance into official scoring opportunity resolution. |
| Fatigue impact | true | true | true | false | FULLMATCH_LEGACY_SCORING_PATH | Use fatigue as an input to the official full-match scoring resolver. |
| Danger phase instrumentation | true | true | false | false | FULLMATCH_PARALLEL_SCORING_PATH | Create score_change only from validated danger-phase opportunities. |

## Batch / Live / Full-Match Scoring Path Audit
| Path | Type | Creates score_change | Drives official score | Uses shot difficulty | Uses choice balance | Can claim global economy |
| --- | --- | --- | --- | --- | --- | --- |
| FULL_MATCH_BATCH_ECONOMY | batch | false | false | true | true | true |
| Live scoring event stream | live | true | true | false | false | false |
| Full-match official scoring path | fullmatch | true | true | false | false | false |
| Coach report export | report | false | false | false | false | false |
| Sandbox scoring route | sandbox | false | false | true | true | false |

## Carryover Status
- FULL_MATCH_BATCH_ECONOMY remains the only global reference.
- This single run is a regression surface, not a global calibration proof.
- Official score remains derived from active ScoringEvents only.
- Batch/live separation remains preserved.

## Regression Cause
- primary cause: FULLMATCH_PARALLEL_SCORING_PATH
- secondary causes: FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION, FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE, FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS, FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED, FULLMATCH_SEGMENT_AMPLIFICATION_RISK
- evidence summary: Official full-match output is 45 - 0 with 15 SHOT_GOAL events; historical calibration references exist, but the official full-match score path has not yet carried them over.

## Warnings
- FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION
- FULLMATCH_NOT_USING_SCORING_CHOICE_BALANCE
- FULLMATCH_NOT_USING_AFFORDANCE_VOLUME_CONSTRAINTS
- FULLMATCH_ROUTE_FAMILY_COMPETITION_MISSING
- FULLMATCH_SHOT_GOAL_MONO_FAMILY
- FULLMATCH_SEGMENT_AMPLIFICATION_RISK
- FULLMATCH_PARALLEL_SCORING_PATH
- FULLMATCH_LEGACY_SCORING_PATH
- FULLMATCH_GOALKEEPER_SUPPRESSION_NOT_APPLIED
- FULLMATCH_DEFENSIVE_RESISTANCE_NOT_APPLIED
- FULLMATCH_FATIGUE_OFFENSIVE_PRECISION_NOT_APPLIED
- FULLMATCH_DANGER_PHASE_NOT_CONNECTED
- CALIBRATION_DIAGNOSTIC_ONLY
- GLOBAL_ECONOMY_NOT_PROVEN

## Guardrails
- scoring constants unchanged: true
- score cap applied: false
- post-hoc score rewrite false
- scoring events deleted false
- scoring events rewritten false
- forced opponent score false
- batch/live separation preserved true
- MatchBonusEvent unchanged true
- persistence not used for calibration
- SQLite not used as source of score economy
- no invented statistic
- no trend proof claim
- no global economy claim from this single run

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- PREPARE_6D_CONNECT_FULLMATCH_TO_VALIDATED_SCORING_CALIBRATIONS

Trace validation status: PASS.
