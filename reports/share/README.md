# Sprint 3Q Share Pack

This compact review pack covers the rebound and second-chance sandbox generated from the goalkeeper response model behind the opt-in route selection flag.

Start with:
1. `00-share-manifest.txt` for copied files, bundle contents, commands, and git status.
2. `fullmatch-workbench-chain-replay-3q.md` explains the rebound second chance model, baseline-versus-override rebound state, loose-ball state, recovery candidate, second-chance probability, and official guardrails.
3. `validation.fullmatch-workbench-chain-replay-3q.md` validates opt-in behavior, rebound fields, official possession mutation guards, official score mutation guards, official scoring event mutation guards, production scoring-event creation guards, route-success mutation guards, global-economy guardrails, and source-of-truth checks.
4. `coach-report.default.html` and `coach-report.experimental.html` compare default and experimental coach-facing outputs.
5. `bundle__simulation.md` contains the chain from replay through rebound second chance sandbox and all related tests.

## Guardrail reminder
Sprint 3Q does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.