# FullMatch Workbench Chain Replay 4G Validation

Status: PASS

## Checks
- PASS: default runFullMatch remains segment_harness.
- PASS: experimental mode remains opt-in.
- PASS: MatchTraceEvent spine remains available.
- PASS: Match Trace Aggregator remains available.
- PASS: Coach Report V0 remains available.
- PASS: six validation profiles exist. - 6
- PASS: profile variation is detected.
- PASS: report variation is detected.
- PASS: at least 5 of 6 profiles change Coach Report V0 cards vs baseline. - 5
- PASS: high_press_profile has expected or fallback pressure signal.
- PASS: low_block_profile has expected or fallback defensive signal.
- PASS: fast_transition_profile has expected or fallback speed/progression signal.
- PASS: power_contact_profile has expected or fallback power/contact signal.
- PASS: strong_goalkeeper_profile has expected or fallback goalkeeper signal.
- PASS: late_fatigue_profile has expected or fallback fatigue signal.
- PASS: missing expected signals are explicit.
- PASS: no mojibake in fullmatch-trace-validation-4g.md. - 0
- PASS: no mojibake in workbench replay report. - 0
- PASS: no mojibake in validation report. - 0
- PASS: no mojibake in coach report HTML. - 0
- PASS: diagnostic aggregates remain separate.
- PASS: sandbox aggregates remain separate.
- PASS: Selection Preview remains sandbox_only.
- PASS: Selection Preview confidence is not upgraded.
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
- profiles with expected primary signal: 6
- profiles with accepted fallback signal: 6
- profiles with missing primary signal: 0
- mojibake marker count: 0
- score mutation count: 0
- possession mutation count: 0
- production scoring event creation count: 0
- global economy claim count: 0

## Recommendation
- CONFIRM_PROFILE_SIGNAL_CALIBRATION.
- CONFIRM_ENCODING_FIX.
- CONFIRM_REPORT_CHANGES_WITH_MEANINGFUL_PROFILE_SIGNATURES.
- PREPARE_COACH_REPORT_V1_VISUALIZATION.
