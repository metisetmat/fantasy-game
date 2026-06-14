# FullMatch Workbench Chain Replay 4G

Sprint 4G fixes visible encoding issues and calibrates the six validation profiles so their trace signatures are tactically meaningful.

## Compact Summary
- status: PASS
- profile count: 6
- baseline profile: high_press_profile
- profile variation detected: YES
- report variation detected: YES
- changed cards by profile: high_press_profile=none; low_block_profile=official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint; fast_transition_profile=official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint; power_contact_profile=official_recoveries, official_recurring_causes; strong_goalkeeper_profile=official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes, official_coach_watchpoint; late_fatigue_profile=official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes
- signal status by profile: high_press_profile=PASS; low_block_profile=PASS; fast_transition_profile=PASS; power_contact_profile=PASS; strong_goalkeeper_profile=PASS; late_fatigue_profile=PASS
- expected signals present by profile: high_press_profile=pressure_forced_error, fatigue_drop; low_block_profile=defensive_recovery; fast_transition_profile=speed_advantage, line_broken; power_contact_profile=power_advantage, fatigue_drop; strong_goalkeeper_profile=goalkeeper_quality; late_fatigue_profile=fatigue_drop, fatigue_generated
- accepted fallback signals by profile: high_press_profile=high_pressure_trace_count, official_pressure_losses, pressing_high, counterpress, fatigue_impact_total, fatigue visible; low_block_profile=recovery_zones_changed, watchpoint_changed, low_block, rest_defense_high; fast_transition_profile=danger_zones_changed, transition_fast_break, tempo_fast, official_danger_zones, progression; power_contact_profile=attacking_direct_pressure, risk_high, direct_pressure, fatigue_impact_total, fatigue visible; strong_goalkeeper_profile=goalkeeper_profile_strong, rebound; late_fatigue_profile=fatigue_impact_total, condition, mental_freshness
- expected signals missing by profile: high_press_profile=none; low_block_profile=none; fast_transition_profile=none; power_contact_profile=none; strong_goalkeeper_profile=none; late_fatigue_profile=none
- mojibake marker count: 0

## Guardrail Summary
- diagnostic aggregates remain separate.
- sandbox aggregates remain separate.
- Selection Preview remains sandbox_only.
- Selection Preview confidence is not upgraded.
- mutation counts remain zero.
- no production scoring event is created.
- no global economy claim is made.
- scoring constants are unchanged.

## Linked Detail
- fullmatch-trace-validation-4g.md
- validation.fullmatch-workbench-chain-replay-4g.md
