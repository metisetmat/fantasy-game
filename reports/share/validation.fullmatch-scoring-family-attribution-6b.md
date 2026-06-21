# Full-Match Scoring Family Attribution 6B Validation

Status: PASS

## Checks
- PASS: scoring family classifier is available. - SCORING_FAMILY_ATTRIBUTION_6B
- PASS: every official score_change event has a family or explicit UNKNOWN reason. - 15/15
- PASS: attribution coverage is visible. - 100
- PASS: UNKNOWN count reduced versus 6A. - 15 -> 0
- PASS: scoring events by family are not all UNKNOWN. - {"SHOT_GOAL":15,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":0}
- PASS: scoring points by family are not all UNKNOWN. - {"SHOT_GOAL":45,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":0}
- PASS: SHOT_GOAL attribution is populated. - 15/45
- PASS: UNKNOWN reasons are explicit when needed.
- PASS: PENALTY_SHOT remains inactive. - inactive
- PASS: scoring constants unchanged.
- PASS: no score cap.
- PASS: no post-hoc rewrite.
- PASS: no event deletion.
- PASS: no event rewrite.
- PASS: no forced opponent score.
- PASS: batch/live separation preserved.
- PASS: MatchBonusEvent unchanged.
- PASS: persistence not used for attribution.
- PASS: SQLite not used as source of score economy.
- PASS: no invented stats. - 0
- PASS: no global proof claim. - 0
- PASS: no trend proof claim. - 0
- PASS: coach export contains Origine des points.
- PASS: FULL_MATCH_BATCH_ECONOMY remains only global proof.
- PASS: trace validation model remains available. - available
- PASS: explicit exhaustive test command is available. - npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Counts
- status: PASS
- scope: FULL_MATCH_SCORING_FAMILY_SINGLE_RUN
- attribution version: SCORING_FAMILY_ATTRIBUTION_6B
- total scoring event count: 15
- attributed scoring event count: 15
- unknown scoring event count: 0
- legacy unknown scoring event count: 15
- unknown scoring point total: 0
- attribution coverage rate: 100
- scoring events by family: {"SHOT_GOAL":15,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":0}
- scoring points by family: {"SHOT_GOAL":45,"TRY_TOUCHDOWN":0,"CONVERSION_GOAL":0,"DROP_GOAL":0,"PENALTY_SHOT":0,"UNKNOWN":0}
- high confidence count: 15
- medium confidence count: 0
- low confidence count: 0
- family attribution warnings: none
- warning count by code: {"UNKNOWN_SCORING_FAMILY":0,"MISSING_SCORING_ACTION":0,"MISSING_SCORE_CHANGE_POINT_VALUE":0,"FAMILY_POINT_VALUE_MISMATCH":0,"INACTIVE_PENALTY_SHOT_USED":0,"AMBIGUOUS_SCORING_FAMILY":0,"LOW_CONFIDENCE_SCORING_ATTRIBUTION":0,"SCORING_EVENT_WITHOUT_OFFICIAL_CONSEQUENCE":0,"SCORE_CHANGE_WITHOUT_SCORING_FAMILY":0}
- unknown reasons: none
- scoring constants changed: false
- score cap applied: false
- post-hoc rewrite applied: false
- scoring events deleted: false
- scoring events rewritten: false
- forced opponent score applied: false
- official timeline mutation count: 0
- official possession mutation count: 0
- production scoring event creation count: 0
- batch/live separation preserved: true
- MatchBonusEvent changed: false
- persistence used for attribution: false
- SQLite used as score economy source: false
- global economy claim count: 0
- trend proof claim count: 0
- invented statistic count: 0
- single-run only: true
- FULL_MATCH_BATCH_ECONOMY remains only global economy proof: true

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- CONFIRM_SCORING_FAMILY_ATTRIBUTION_AND_RECHECK_ROUTE_ECONOMY
