# Full Match Trace Validation 4F

Status: AVAILABLE

## Summary
- default mode: segment_harness
- experimental mode: workbench_chain_replay_experimental
- Match Trace Spine status: available across validation profiles
- Match Trace Aggregator status: available across validation profiles
- Coach Report V0 status: available across validation profiles
- profile count: 6
- profile IDs: high_press_profile, low_block_profile, fast_transition_profile, power_contact_profile, strong_goalkeeper_profile, late_fatigue_profile
- baseline profile: high_press_profile
- profile variation detected: YES
- report variation detected: YES
- diagnostic and sandbox aggregates kept separate: YES
- Selection Preview remains sandbox_only: YES
- Selection Preview confidence not upgraded: YES

## Profile Results
| Profile | Status | Changed cards | Expected signals | Danger zones | Pressure loss zones | Recovery zones | Cause tags | Impact tags |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| high_press_profile | available | none | missing: pressure_forced_error, fatigue_drop | Z3-C, Z5-C, Z5-HSR | none | Z5-C, Z3-C, Z4-HSL | fatigue visible, avantage physique, erreurs provoquÃ©es par la pression, avantage de vitesse | ligne cassÃ©e, possession sÃ©curisÃ©e, impact encore peu lisible, danger crÃ©Ã© |
| low_block_profile | available | official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint | present | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z2-C | rÃ©cupÃ©ration dÃ©fensive, fatigue visible, avantage physique, erreurs provoquÃ©es par la pression | ligne cassÃ©e, possession sÃ©curisÃ©e, impact encore peu lisible, danger crÃ©Ã© |
| fast_transition_profile | available | official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint | missing: speed_advantage, line_broken | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z5-HSL | rÃ©cupÃ©ration dÃ©fensive, fatigue visible, avantage physique, erreurs provoquÃ©es par la pression | ligne cassÃ©e, possession sÃ©curisÃ©e, impact encore peu lisible, danger crÃ©Ã© |
| power_contact_profile | available | official_recoveries, official_recurring_causes | missing: power_advantage, fatigue_drop | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z4-C, Z5-C | fatigue visible, avantage physique, erreurs provoquÃ©es par la pression, avantage de vitesse | ligne cassÃ©e, possession sÃ©curisÃ©e, impact encore peu lisible, danger crÃ©Ã© |
| strong_goalkeeper_profile | available | official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes, official_coach_watchpoint | present | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z4-HSL | rÃ©cupÃ©ration dÃ©fensive, fatigue visible, qualitÃ© du gardien, erreurs provoquÃ©es par la pression | ligne cassÃ©e, possession sÃ©curisÃ©e, impact encore peu lisible, danger crÃ©Ã© |
| late_fatigue_profile | available | official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes | missing: fatigue_drop, fatigue_generated | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z5-HSR | fatigue visible, avantage physique, erreurs provoquÃ©es par la pression, avantage de vitesse | ligne cassÃ©e, possession sÃ©curisÃ©e, impact encore peu lisible, danger crÃ©Ã© |

## Variation Counts
- profiles with changed report cards: 5
- distinct danger zone profiles: 5
- distinct pressure loss profiles: 3
- distinct recovery profiles: 6
- distinct cause tag profiles: 6
- distinct watchpoint profiles: 2

## Guardrails
- score mutation count: 0
- possession mutation count: 0
- production scoring event creation count: 0
- global economy claim count: 0
- scoring constants unchanged: YES
- MatchBonusEvent unchanged: YES
- FULL_MATCH_BATCH_ECONOMY remains only global proof: YES

## Warnings
- high_press_profile: missing expected signal pressure_forced_error
- high_press_profile: missing expected signal fatigue_drop
- fast_transition_profile: missing expected signal speed_advantage
- fast_transition_profile: missing expected signal line_broken
- power_contact_profile: missing expected signal power_advantage
- power_contact_profile: missing expected signal fatigue_drop
- late_fatigue_profile: missing expected signal fatigue_drop
- late_fatigue_profile: missing expected signal fatigue_generated

## Explicit Exhaustive Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- CONFIRM_FULL_MATCH_TRACE_VALIDATION.
- CONFIRM_REPORT_CHANGES_WITH_MATCH_PROFILE.
- CONFIRM_OFFICIAL_AGGREGATES_REMAIN_SOURCE_OF_TRUTH.
- PREPARE_COACH_REPORT_V1_VISUALIZATION.
