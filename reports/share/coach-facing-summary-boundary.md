# Coach-Facing Summary Boundary

Micro-sprint 2P-Fix finishes the boundary between typed technical evidence and visible coach narrative.

## What Leaked Before
- Key moment summaries could expose technical context such as `Final danger LOW`, `Score context 0-0`, `Plan influence`, `Adapter influence`, and `Scoring summary converted`.
- Those strings remain useful for internal diagnostics, but they do not belong in visible coach paragraphs.

## Boundary Rule
- Visible key moments use evidence facts or clean event-type fallback summaries.
- Visible warning cards use type-specific French coach summaries.
- Technical summaries, warning types, evidence IDs, event IDs, and raw diagnostic markers remain inside internal or collapsible details.

## Preserved Canonical Contract
- `MatchReport.evidenceFacts` remains typed and reusable.
- `MatchReport.warnings` remains typed and keeps technical summaries.
- `MatchReport.reportMeta` remains the source for report scope.
- The HTML renderer formats typed data; it does not decide global scoring economy validity.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.
- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.

## Recommendations
- CONFIRM_COACH_FACING_SUMMARY_BOUNDARY
- CONFIRM_TECHNICAL_DETAILS_INTERNAL_ONLY
- CONFIRM_CANONICAL_MATCHREPORT_CONTRACT_PRESERVED
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_50_MATCH_ECONOMY_REFERENCE
- PREPARE_TRUE_SEGMENT_STATE_INTEGRATION
- PREPARE_DEEPER_TACTICAL_PLAN_INFLUENCE
