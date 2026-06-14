# FullMatch Workbench Chain Replay 4F Validation

Status: PASS

## Checks
- PASS: default runFullMatch remains segment_harness.
- PASS: experimental mode remains opt-in.
- PASS: MatchTraceEvent spine remains available.
- PASS: Match Trace Aggregator remains available.
- PASS: Coach Report V0 remains available.
- PASS: six validation profiles exist. - 6
- PASS: baseline profile exists. - high_press_profile
- PASS: high_press_profile exists.
- PASS: low_block_profile exists.
- PASS: fast_transition_profile exists.
- PASS: power_contact_profile exists.
- PASS: strong_goalkeeper_profile exists.
- PASS: late_fatigue_profile exists.
- PASS: each profile produces trace spine.
- PASS: each profile produces trace aggregator.
- PASS: each profile produces Coach Report V0.
- PASS: profile variation is detected.
- PASS: report variation is detected.
- PASS: at least 4 of 6 profiles change Coach Report V0 cards vs baseline. - 5
- PASS: high press differs from low block.
- PASS: fast transition differs from power/contact.
- PASS: strong goalkeeper differs from baseline.
- PASS: late fatigue differs from baseline.
- PASS: expected signals are reported.
- PASS: missing expected signals are explicit.
- PASS: diagnostic aggregates remain separate.
- PASS: sandbox aggregates remain separate.
- PASS: sandbox does not become official truth.
- PASS: diagnostic does not become official truth.
- PASS: Selection Preview remains sandbox_only.
- PASS: Selection Preview confidence is not upgraded.
- PASS: visible validation copy has no mojibake.
- PASS: validation cannot mutate official timeline.
- PASS: validation cannot mutate official score.
- PASS: validation cannot mutate official possession.
- PASS: validation cannot mutate official scoring events.
- PASS: validation cannot create production scoring events.
- PASS: validation cannot claim global economy.
- PASS: validation cannot drive live selection.
- PASS: validation cannot drive production route resolution.
- PASS: scoring constants unchanged.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.
- PASS: explicit exhaustive test command is available.

## Counts
- profile count: 6
- profiles with changed report cards: 5
- distinct danger zone profiles: 5
- distinct pressure loss profiles: 3
- distinct recovery profiles: 6
- distinct cause tag profiles: 6
- distinct watchpoint profiles: 2
- score mutation count: 0
- possession mutation count: 0
- production scoring event creation count: 0
- global economy claim count: 0

## Recommendation
- CONFIRM_FULL_MATCH_TRACE_VALIDATION.
- CONFIRM_REPORT_CHANGES_WITH_MATCH_PROFILE.
- CONFIRM_OFFICIAL_AGGREGATES_REMAIN_SOURCE_OF_TRUTH.
- PREPARE_COACH_REPORT_V1_VISUALIZATION.
