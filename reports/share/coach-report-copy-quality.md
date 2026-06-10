# Coach Report Copy Quality

Micro-sprint 2O-Fix repairs coach-facing report encoding and copy quality without changing scoring values, scoring events, MatchBonusEvent logic, or source-of-truth guardrails.

## What Changed
- Coach-facing HTML now uses clean UTF-8 French copy.
- Mojibake fragments such as `GÃƒÂ©nÃƒÂ©rÃƒÂ©`, `RÃƒÂ©sumÃƒÂ©`, and `Moments clÃƒÂ©s` are detected and blocked.
- Harness warnings are translated into coach-readable French instead of exposing raw English warning strings.
- Raw diagnostic enums remain available inside internal guards and bundled source, but they are not displayed in visible coach paragraphs.

## Coach-Facing Copy Now Expected
- Généré depuis le rapport de match typé.
- Résumé.
- Moments clés.
- Action décisive.
- Séquence dangereuse.
- Équipe.
- Événement.

## Dominated-Team Evidence
- BLITZ produit du volume sans conversion.
- BLITZ apparaît dans plusieurs séquences de pression, de progression ou d'instabilité, mais aucune ne devient un événement de score dans ce run de harnais.
- The recommendation remains tactical: review the route chosen after pressure, rather than changing scoring values.

## Preserved Source Of Truth
- SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.
- Final score remains derived only from score_change consequences.
- MatchBonusEvent was not mutated.
- Batch/live separation remains preserved.

## Mandatory Diagnosis
- Is coach-report.latest.html free of mojibake? YES.
- Does the report show clean French headings and labels? YES.
- Are harness warnings coach-facing instead of raw English paragraphs? YES.
- Are internal diagnostic enums preserved outside visible coach copy? YES.
- Were scoring values changed? NO.
- Were scoring events deleted or capped? NO.
- Was MatchBonusEvent mutated? NO.
- Does the 50-match economy remain protected? YES.

## Recommendations
- CONFIRM_COACH_REPORT_ENCODING_CLEAN
- CONFIRM_COACH_COPY_HYGIENE_PASS
- KEEP_SCORING_VALUES_UNCHANGED
- KEEP_SOURCE_OF_TRUTH_GUARDRAILS
- PREPARE_NEXT_SIMULATION_SPRINT
