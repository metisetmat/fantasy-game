# Sprint 3O Share Pack

This compact review pack covers the attribute-driven shot resolution sandbox generated from the sandbox scoring-event resolution model behind the opt-in route selection flag.

## Review order
1. `validation.share-pack.md` confirms that the pack is current and below the 20-file limit.
2. `fullmatch-workbench-chain-replay-3o.md` explains the attribute-driven shot resolution sandbox, baseline-versus-override outcome, shooter/goalkeeper attributes, adjusted shot quality, goalkeeper quality, and guardrails.
3. `validation.fullmatch-workbench-chain-replay-3o.md` validates opt-in behavior, attribute-driven outcome, official score mutation guards, official scoring event mutation guards, production scoring-event creation guards, route-success mutation guards, global-economy guardrails, and source-of-truth checks.
4. `coach-report.default.html` and `coach-report.experimental.html` compare the default segment harness with the opt-in experimental report.
5. `bundle__simulation.md` contains the chain from replay through attribute-driven shot resolution sandbox and all related tests.

## Guardrail reminder
Sprint 3O does not change scoring values, official ScoringEvents, MatchBonusEvent, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.