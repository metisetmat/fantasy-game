# Full Match Trace Validation 4G

Status: PASS

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
- profiles with changed report cards: 5
- profiles with expected primary signal: 6
- profiles with accepted fallback signal: 6
- profiles with missing primary signal: 0
- mojibake marker count: 0
- diagnostic and sandbox aggregates kept separate: YES
- Selection Preview remains sandbox_only: YES
- Selection Preview confidence not upgraded: YES

## Profile Signal Calibration
| Profile | Signal status | Changed cards | Expected signals present | Expected signals missing | Accepted fallback signals | Tactical meaning |
| --- | --- | --- | --- | --- | --- | --- |
| high_press_profile | PASS | none | pressure_forced_error, fatigue_drop | none | high_pressure_trace_count, official_pressure_losses, pressing_high, counterpress, fatigue_impact_total, fatigue visible | Le profil pressing haut fait ressortir davantage de pression et de récupérations liées à l'intensité. |
| low_block_profile | PASS | official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint | defensive_recovery | none | recovery_zones_changed, watchpoint_changed, low_block, rest_defense_high | Le bloc bas déplace les récupérations et les vigilances vers une défense plus basse ou plus prudente. |
| fast_transition_profile | PASS | official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint | speed_advantage, line_broken | none | danger_zones_changed, transition_fast_break, tempo_fast, official_danger_zones, progression | Le profil transition rapide fait ressortir davantage de progression, de rupture de ligne ou d'implication des porteurs. |
| power_contact_profile | PASS | official_recoveries, official_recurring_causes | power_advantage, fatigue_drop | none | attacking_direct_pressure, risk_high, direct_pressure, fatigue_impact_total, fatigue visible | Le profil puissance/contact fait ressortir davantage de duels, d'avantage physique ou de progression directe. |
| strong_goalkeeper_profile | PASS | official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes, official_coach_watchpoint | goalkeeper_quality | none | goalkeeper_profile_strong, rebound | Le profil gardien fort fait ressortir la qualité du gardien ou la nécessité de mieux préparer le second ballon. |
| late_fatigue_profile | PASS | official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes | fatigue_drop, fatigue_generated | none | fatigue_impact_total, condition, mental_freshness | Le profil fatigue tardive fait ressortir une baisse de lucidité ou un risque de pertes en fin de séquence. |

## Trace Signature
| Profile | Danger zones | Pressure loss zones | Recovery zones | Cause tags | Impact tags | High pressure traces | Fatigue impact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| high_press_profile | Z3-C, Z5-C, Z5-HSR | none | Z5-C, Z3-C, Z4-HSL | fatigue visible, avantage physique, erreurs provoquées par la pression, avantage de vitesse | ligne cassée, possession sécurisée, impact encore peu lisible, danger créé | 47 | 218 |
| low_block_profile | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z2-C | récupération défensive, fatigue visible, avantage physique, erreurs provoquées par la pression | ligne cassée, possession sécurisée, impact encore peu lisible, danger créé | 47 | 183 |
| fast_transition_profile | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z5-HSL | récupération défensive, fatigue visible, avantage physique, erreurs provoquées par la pression | ligne cassée, possession sécurisée, impact encore peu lisible, danger créé | 47 | 195 |
| power_contact_profile | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z4-C, Z5-C | fatigue visible, avantage physique, erreurs provoquées par la pression, avantage de vitesse | ligne cassée, possession sécurisée, impact encore peu lisible, danger créé | 47 | 196 |
| strong_goalkeeper_profile | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z4-HSL | récupération défensive, fatigue visible, qualité du gardien, erreurs provoquées par la pression | ligne cassée, possession sécurisée, impact encore peu lisible, danger créé | 48 | 185 |
| late_fatigue_profile | Z3-C, Z5-C, Z5-HSR | none | Z3-C, Z5-C, Z5-HSR | fatigue visible, avantage physique, erreurs provoquées par la pression, avantage de vitesse | ligne cassée, possession sécurisée, impact encore peu lisible, danger créé | 40 | 334 |

## Variation Counts
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
- none

## Recommendation
- CONFIRM_PROFILE_SIGNAL_CALIBRATION.
- CONFIRM_ENCODING_FIX.
- CONFIRM_REPORT_CHANGES_WITH_MEANINGFUL_PROFILE_SIGNATURES.
- PREPARE_COACH_REPORT_V1_VISUALIZATION.
