# FullMatch Workbench Chain Replay 4E

Sprint 4E introduces Coach Report V0 from Trace Aggregates. It consumes the Match Trace Aggregator and renders cautious coach-facing cards from official aggregates only.

## Modes

- default mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental remains opt-in only.
- default report: no Coach Report V0 from trace aggregates.
- experimental report: Rapport coach depuis les agrégats officiels appears as a compact V0 section.

## Trace Foundations

- Match Trace Spine status: available.
- Match Trace Aggregator status: available.
- Coach Report Trace V0 status: available.
- report origin: match_trace_aggregator.
- official aggregates are the base of visible coach cards.
- diagnostic aggregates are kept separate.
- sandbox aggregates are kept separate.
- Selection Preview remains sandbox_only.
- Selection Preview confidence is not upgraded.

## Coach Report V0 Cards

- card count: 6.
- card IDs: official_danger_zones, official_pressure_losses, official_recoveries, official_player_involvement, official_recurring_causes, official_coach_watchpoint.
- official danger zones used: present.
- official pressure loss zones used: present.
- official recovery zones used: present.
- official player involvement used: present.
- official cause tags used: present.
- official impact tags used: present.

## Guardrails

- visible cards are based on official aggregates.
- diagnostic aggregates are not used as official truth.
- sandbox aggregates are not used as official truth.
- sandbox aggregates do not raise official confidence.
- diagnostic aggregates do not raise official confidence.
- mutation counts all zero.
- no production scoring event created.
- no live selection driver.
- no production route resolution driver.
- no global economy claim.
- scoring constants unchanged.
- source-of-truth unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Report Rendering

- experimental coach report contains: Rapport coach depuis les agrégats officiels.
- experimental coach report contains: Zones de danger, Pertes sous pression, Récupérations utiles, Joueurs impliqués, Causes récurrentes, Point de vigilance coach.
- visible copy says diagnostics and sandbox stay separated.
- technical counts stay collapsed behind details.
- visible coach copy has no mojibake.
- visible coach copy avoids developer jargon and mandatory wording.

## Explicit Exhaustive Test Command

```bash
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
```

## Recommendation

- CONFIRM_COACH_REPORT_V0_FROM_OFFICIAL_AGGREGATES.
- CONFIRM_DIAGNOSTIC_AND_SANDBOX_REMAIN_SEPARATE.
- CONFIRM_SELECTION_PREVIEW_NOT_UPGRADED.
- PREPARE_FULL_MATCH_TRACE_VALIDATION.
