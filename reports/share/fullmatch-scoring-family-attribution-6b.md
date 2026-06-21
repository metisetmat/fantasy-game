# Full-Match Scoring Family Attribution 6B

Sprint 6B makes official scoring events explainable by family. It classifies the existing score_change events into SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL, PENALTY_SHOT, or explicit UNKNOWN without changing scoring values, caps, official events, or batch/live boundaries.

## Summary
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

## Scoring Events By Family
| Family | Events | Points |
| --- | ---: | ---: |
| SHOT_GOAL | 15 | 45 |
| TRY_TOUCHDOWN | 0 | 0 |
| CONVERSION_GOAL | 0 | 0 |
| DROP_GOAL | 0 | 0 |
| PENALTY_SHOT | 0 | 0 |
| UNKNOWN | 0 | 0 |

## Unknown Attribution Audit
| Event | Team | Points | Reason | Warning codes |
| --- | --- | ---: | --- | --- |
| none | none | 0 | none | none |

## 6A To 6B Cleanup
- legacy 6A UNKNOWN scoring event count: 15
- 6B UNKNOWN scoring event count: 0
- UNKNOWN reduced versus 6A: true
- scoring events by family no longer all UNKNOWN: true
- scoring points by family no longer all UNKNOWN: true

## Guardrails
- scoring constants unchanged: true
- score cap applied: false
- post-hoc score rewrite false
- scoring events deleted false
- scoring events rewritten false
- forced opponent score false
- batch/live separation preserved true
- MatchBonusEvent unchanged true
- persistence not used for attribution
- SQLite not used as source of score economy
- FULL_MATCH_BATCH_ECONOMY remains only global economy proof
- single-run limitation true

## Recommendation
- CONFIRM_SCORING_FAMILY_ATTRIBUTION_AND_RECHECK_ROUTE_ECONOMY

Trace validation status: PASS.
