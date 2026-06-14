# FullMatch Workbench Chain Replay 4C

Sprint 4C introduces the Match Event Trace Spine. It converts official match events, mini-match records, and sandbox replay events into shared MatchTraceEvent rows without mutating official state or production behavior.

## Modes

- default mode: segment_harness.
- experimental mode: workbench_chain_replay_experimental remains opt-in only.
- default report: no Selection Preview and no Colonne de traces de match diagnostic.
- experimental report: Selection Preview remains available and non-applied.
- experimental report: Colonne de traces de match appears as a compact technical diagnostic.

## Selection Preview Trace Backing

- selection preview status: available.
- selection preview trace backing status: sandbox_only.
- selection preview requires match trace spine: true.
- selection preview future trace consumer: true.
- selection preview cannot change lineup, starters, bench, live selection, production route resolution, official score, official possession, official timeline, official scoring events, or global economy proof.

## Match Trace Spine

- match trace spine status: available.
- source adapters: official_match_event, mini_match_record, sandbox_event.
- total trace count: greater than 0 in experimental full-match report.
- official trace count: greater than 0.
- mini-match trace count: greater than 0.
- sandbox trace count: greater than 0 in experimental mode.
- officialTruth true count: official traces only.
- officialTruth false count: mini-match and sandbox diagnostic traces.
- phase coverage: present.
- action type coverage: present.
- cause tag coverage: present.
- impact tag coverage: present.
- coach-visible trace count: present.

## Guardrails

- trace mutation count: 0.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- live selection driver count: 0.
- production route resolution driver count: 0.
- global economy claim count: 0.
- scoring constants unchanged.
- source-of-truth unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Report Rendering

- experimental coach report contains: Colonne de traces de match.
- visible copy: Le moteur commence à produire des traces structurées pour expliquer les actions simulées. Ces traces servent à préparer les futurs rapports coach, mais elles ne modifient pas le match officiel.
- technical counts stay collapsed behind details.
- visible coach copy has no mojibake.
- visible coach copy avoids developer jargon outside details.

## Explicit Exhaustive Test Command

```bash
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
```

## Recommendation

- CONFIRM_MATCH_EVENT_TRACE_SPINE.
- CONFIRM_TRACE_ADAPTERS_DO_NOT_MUTATE_OFFICIAL_STATE.
- CONFIRM_SANDBOX_TRACES_ARE_NOT_OFFICIAL.
- CONFIRM_SELECTION_PREVIEW_REMAINS_SANDBOX_BACKED_UNTIL_TRACE_AGGREGATES.
- PREPARE_MATCH_TRACE_AGGREGATOR.
