# FullMatch Workbench Chain Replay 4D

Sprint 4D introduces the Match Trace Aggregator. It turns raw MatchTraceEvent rows into safe, deduplicated aggregate facts while preserving official, diagnostic, and sandbox scope separation.

## Modes

- default mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental remains opt-in only.
- default report: no Selection Preview, no Colonne de traces de match, and no Agregats de traces de match diagnostic.
- experimental report: Selection Preview remains available and non-applied.
- experimental report: Colonne de traces de match and Agregats de traces de match appear as compact diagnostics.

## Selection Preview Continuity

- selection preview status: available.
- selection preview trace backing status: sandbox_only.
- selection preview requires match trace spine: true.
- selection preview future trace consumer: true.
- selection preview confidence not upgraded by aggregator: true.
- Selection Preview remains sandbox-backed. Match Trace Aggregator is the first step toward future trace-backed preview confidence, but no preview confidence is upgraded in this sprint.

## Match Trace Spine

- trace spine status: available.
- source adapters: official_match_event, mini_match_record, sandbox_event.
- officialTruth true count: official traces only.
- officialTruth false count: mini-match and sandbox diagnostic traces.

## Match Trace Aggregator

- aggregator status: available.
- aggregate scopes: official, diagnostic, sandbox.
- source priority: official_match_event > mini_match_record > sandbox_event.
- input trace count: present.
- deduplicated trace count: present.
- duplicate trace count: present.
- official aggregate trace count: present.
- diagnostic aggregate trace count: present.
- sandbox aggregate trace count: present.
- official truth count: official scope only.
- sandbox truth false count: sandbox scope only.
- phase coverage: present.
- action type coverage: present.
- cause tag coverage: present.
- impact tag coverage: present.
- official danger zones: computed.
- pressure loss zones: computed.
- recovery zones: computed.
- player involvement summary: computed.

## Guardrails

- mutation counts all zero.
- no production scoring event created.
- no live selection driver.
- no production route resolution driver.
- no global economy claim.
- scoring constants unchanged.
- source-of-truth unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Report Rendering

- experimental coach report contains: Agrégats de traces de match.
- visible copy explains that official, diagnostic, and sandbox aggregates remain separated to avoid double counts and over-strong conclusions.
- technical counts stay collapsed behind details.
- visible coach copy has no mojibake.
- visible coach copy avoids developer jargon outside details.

## Explicit Exhaustive Test Command

```bash
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
```

## Recommendation

- CONFIRM_MATCH_TRACE_AGGREGATOR.
- CONFIRM_OFFICIAL_DIAGNOSTIC_SANDBOX_SCOPE_SEPARATION.
- CONFIRM_DEDUPLICATION_PRIORITY.
- CONFIRM_SELECTION_PREVIEW_REMAINS_SANDBOX_BACKED.
- PREPARE_COACH_REPORT_V0_FROM_TRACE_AGGREGATES.
