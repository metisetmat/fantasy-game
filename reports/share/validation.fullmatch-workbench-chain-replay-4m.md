# FullMatch Workbench Chain Replay 4M Validation

Status: PASS

## Checks
- PASS: default runFullMatch remains segment_harness.
- PASS: experimental mode remains opt-in.
- PASS: Selection Preview Coach Copy remains available.
- PASS: Selection Preview Profile View status is available.
- PASS: profile card count is 3.
- PASS: support-near-zone profile card is available.
- PASS: second-ball profile card is available.
- PASS: strong-goalkeeper-response profile card is available.
- PASS: role families are visible.
- PASS: useful attributes are visible.
- PASS: why-observe content is visible.
- PASS: official trace support is visible.
- PASS: expected benefit is visible.
- PASS: tactical risk is visible.
- PASS: next-match signal is visible.
- PASS: visible copy uses French role labels.
- PASS: visible copy uses French attribute labels.
- PASS: visible copy hides internal status names.
- PASS: visible copy hides internal role ids.
- PASS: visible copy hides internal attribute ids.
- PASS: visible copy avoids official selection wording.
- PASS: officially-confirmed count is 0.
- PASS: confidence upgrade count is 0.
- PASS: preview remains non-applied.
- PASS: diagnostic aggregates remain separate.
- PASS: sandbox aggregates remain separate.
- PASS: official aggregates are support only.
- PASS: profile view cannot mutate official timeline.
- PASS: profile view cannot mutate official score.
- PASS: profile view cannot mutate official possession.
- PASS: profile view cannot create production scoring events. - 0
- PASS: profile view cannot claim global economy. - 0
- PASS: profile view cannot drive live selection.
- PASS: profile view cannot drive production route resolution.
- PASS: scoring constants unchanged.
- PASS: MatchBonusEvent unchanged.
- PASS: batch/live separation preserved.
- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.
- PASS: explicit exhaustive test command is available. - npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Counts
- profile card count: 3
- role family visible count: 11
- useful attribute visible count: 13
- expected benefit count: 9
- tactical risk count: 9
- next-match signal count: 9
- internal status leak count: 0
- internal role id leak count: 0
- internal attribute id leak count: 0
- forbidden official selection wording count: 0
- officially-confirmed count: 0
- confidence upgrade count: 0
- preview applied count: 0
- lineup mutation count: 0
- live selection driver count: 0
- production route resolution driver count: 0
- production scoring event creation count: 0
- global economy claim count: 0

## Recommendation
- CONFIRM_SELECTION_PREVIEW_PROFILE_VIEW.
- CONFIRM_PROFILE_VIEW_REMAINS_NON_APPLIED.
- PREPARE_REPORT_EXPORT_OR_PLAYER_MATCHUP_VIEW.
