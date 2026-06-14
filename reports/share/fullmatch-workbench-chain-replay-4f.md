# FullMatch Workbench Chain Replay 4F

Sprint 4F validates that Coach Report V0 is not generic. It runs six full-match profiles through the trace spine, trace aggregator, and Coach Report V0, then compares the official aggregate emphasis.

## Compact Summary
- profile count: 6
- profile IDs: high_press_profile, low_block_profile, fast_transition_profile, power_contact_profile, strong_goalkeeper_profile, late_fatigue_profile
- baseline profile: high_press_profile
- profile variation detected: YES
- report variation detected: YES
- changed cards by profile: high_press_profile=none; low_block_profile=official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint; fast_transition_profile=official_danger_zones, official_recoveries, official_recurring_causes, official_coach_watchpoint; power_contact_profile=official_recoveries, official_recurring_causes; strong_goalkeeper_profile=official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes, official_coach_watchpoint; late_fatigue_profile=official_danger_zones, official_pressure_losses, official_recoveries, official_recurring_causes
- expected signals: high_press_profile=missing: pressure_forced_error, fatigue_drop; low_block_profile=present; fast_transition_profile=missing: speed_advantage, line_broken; power_contact_profile=missing: power_advantage, fatigue_drop; strong_goalkeeper_profile=present; late_fatigue_profile=missing: fatigue_drop, fatigue_generated

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
- fullmatch-trace-validation-4f.md
- validation.fullmatch-workbench-chain-replay-4f.md
