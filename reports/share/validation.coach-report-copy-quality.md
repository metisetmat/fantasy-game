# Coach Report Copy Quality Validation

Status: PASS

- PASS: coach-report.latest.html exists.
- PASS: coach report contains no mojibake markers.
- PASS: coach report contains Résumé.
- PASS: coach report contains Moments clés.
- PASS: coach report contains Généré depuis le rapport de match typé.
- PASS: coach report contains Action décisive.
- PASS: coach report contains Séquence dangereuse.
- PASS: coach report contains Équipe.
- PASS: coach report contains Événement.
- PASS: visible harness warning uses French coach-facing copy.
- PASS: visible coach report does not expose raw Harness warning copy.
- PASS: visible coach report does not expose FULL_MATCH_HARNESS_SINGLE_RUN.
- PASS: dominated-team no-payoff copy is clean French when applicable.
- PASS: no global scoring incoherence claim.
- PASS: no scoring value change recommendation.
- PASS: no scoring constants changed.
- PASS: no scoring events deleted.
- PASS: no MatchBonusEvent mutation.
- PASS: batch/live separation preserved.

## Counts
- mojibake marker count: 0
- raw harness warning paragraphs in visible report: 0
- raw harness scope enum count in visible report: 0
- share file count: 14

## Recommendation
- CONFIRM_COACH_REPORT_ENCODING_CLEAN
