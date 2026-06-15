# FullMatch Workbench Chain Replay 4I

Sprint 4I polishes Coach Report V1 into a clearer information hierarchy. It changes report organization only: official V1 reading first, detailed official signals second, experimental hypotheses grouped third, and technical traceability collapsed fourth.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report hides Coach Report V1 hierarchy.

## Experimental Mode
- experimental mode remains opt-in.
- Coach Report V1 Visualization status: available.
- Coach Report V1 Information Hierarchy status: available.
- section count: 4.

## Section Order
1. Ce que le match dit.
2. Signaux officiels détaillés.
3. Hypothèses expérimentales à tester.
4. Détails techniques et traçabilité.

## Hierarchy Guardrails
- official before experimental: true.
- V1 before sandbox: true.
- experimental sections grouped: true.
- technical details collapsed: true.
- repeated guardrail copy reduced: true.
- Selection Preview remains sandbox_only.
- Selection Preview confidence not upgraded.
- diagnostic and sandbox aggregates kept separate.

## Mutation Guardrails
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim count: 0.
- scoring constants unchanged.
- source-of-truth unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
