# Engine-to-Coach Gap Analysis V0.1

## 1. Executive summary

Source of truth: `docs/engine_to_coach_experience_spec_v0_1.md`.

The repository contains a substantial tactical prototype: role fit, player/roster attributes, derived team profiles, spatial/intent systems, sequence resolvers, mini-match simulation, scoring diagnostics, goalkeeper shot-stopping, debug timelines, snapshots, storyboards, and coach-facing Markdown reports. The active simulation path is `runMiniMatch()` in `src/simulation/miniMatch/runMiniMatch.ts`, not the skeletal `FantasyGameEngine` interface in `src/simulation/engine.ts`.

The main Priority 1 gap is contract alignment. The spec asks for stable engine-to-coach contracts named `MatchInput`, `TeamSnapshot`, `PlayerSnapshot`, `TacticalPlan`, `MatchEvent`, `MatchSnapshot`, `MatchReport`, `CoachInsight`, `TacticalDiagnosis`, `TrainingRecommendation`, and `ProgressionSignal`. The codebase has many partial equivalents, but most are either legacy engine state (`TeamState`, `PlayerState`, `MatchState`), mini-match specific (`MiniMatchInput`, `MiniMatchResult`, `MiniMatchSummary`), report-only (`CoachingFeedbackReport`), diagnostic-only (`DebugTimelineReplay`, `UnifiedScoringEventSummary`), or UI/roster oriented (`RoleFitResult`, `RosterRoleFitModel`).

The engine can run headlessly and produce readable evidence, but the output is not yet a single stable `MatchReport` contract. Tests are also uneven: `src/systems/roleFit/roleFitEngine.test.ts` protects role fit strongly, `src/systems/interactions/finishing/finishingOutputTaxonomy.test.ts` protects a narrow wording taxonomy, and many generated validator functions protect reports after `src/index.ts` runs. That is useful, but it is not the same as first-class contract tests for engine input/output invariants.

Priority 1 should therefore focus on creating a canonical contract layer and adapters from the current mini-match engine into that layer, rather than replacing existing tactical systems. The riskiest current inconsistency is that several advanced capabilities exist in local subsystems but are not guaranteed through the public engine API.

## 2. Current engine inventory

| Zone | Files | Current responsibility | Maturity | Visible debt / inconsistency | Spec link |
| --- | --- | --- | --- | --- | --- |
| Public exports | `src/index.ts` | Exports almost every core/model/system/report module; also runs the mini-match demo as a side effect. | Partial | Library import runs `runMiniMatchDemo()` and writes reports, so public API and CLI/report generation are coupled. | Headless engine, stable data contract |
| Engine shell | `src/simulation/engine.ts` | Defines `MatchSetup`, `EngineConfiguration`, `FantasyGameEngine`. | Low | No implementation found here; does not use spec `MatchInput`, `TacticalPlan`, `MatchReport`. | `MatchInput`, engine entry point |
| Active mini-match | `src/simulation/miniMatch/runMiniMatch.ts`, `types.ts`, `createMiniMatchContext.ts`, `selectInitialSequenceContext.ts`, `updateMiniMatchState.ts`, `summarizeMiniMatch.ts` | Runs 1-8 tactical sequences, resolves sequence interactions, updates score/events/continuity/memory/recovery/momentum, returns summary/logs. | Medium-high prototype | Input uses `PrototypeTeamDefinition` and `numberOfSequences`; not official `TeamSnapshot`/`TacticalPlan`/full match duration. Seed is numeric and partially connected. | `MatchInput`, `MatchReport`, full match loop |
| Match loop wrapper | `src/systems/matchLoop/worldState.ts`, `tickEngine.ts`, `simulationConfig.ts`, `deterministicSeed.ts` | Tick/world-state scaffold with deterministic roll, player intent updates, movement/perception refresh, timeline entries. | Partial | Team/spatial/event detection functions are explicitly placeholder; not the active scoring loop. | `MatchSnapshot`, deterministic simulation |
| Legacy match models | `src/models/match.ts`, `team.ts`, `player.ts`, `tactics.ts` | Core state types: `MatchState`, `TeamState`, `PlayerState`, `TacticalInstructions`, `CollectiveProperties`, `TacticalState`. | Partial | Names diverge from spec; `PlayerState.fatigue` uses `accumulatedFatigue`/`freshness`, not `currentCondition`/`mentalFreshness`; no starters/bench/captain/kickers in `TeamState`. | `TeamSnapshot`, `PlayerSnapshot`, `TacticalPlan`, `MatchSnapshot` |
| Roles / archetypes | `src/models/player.ts`, `src/systems/players/roleArchetypes.ts`, `docs/gameplay/role_archetypes.md`, `docs/gameplay/role_behavior_matrix.md` | Defines role enum and behavior/archetype support; includes `GoalkeeperFreeSafety`. | Medium | `PlayerRole` enum has roles not present in `TrueRole` role-fit contract (`LeftAnchor`, `RightAnchor`), while role fit uses display strings. | `PlayerSnapshot.role`, role matrix |
| Player attributes | `src/models/player.ts`, `src/systems/players/visibleAttributes.ts`, `src/systems/players/derived/types.ts`, `formulas.ts`, `docs/gameplay/player_attributes.md` | Visible and derived player attributes; maps visible attributes to legacy attributes. | Medium-high | Two attribute models coexist: legacy `PlayerAttributes` and `VisiblePlayerAttributes`/`DerivedPlayerAttributes`. Spec only names `PlayerAttributes` and traits. | `PlayerSnapshot.attributes`, player stats |
| Rosters / fixtures | `src/data/teams/controlRoster.ts`, `blitzRoster.ts`, validators; `docs/teams/*.md` | CONTROL and BLITZ 10-player rosters with visible/derived attributes and fatigue setup. | Medium | No spec `TeamSnapshot` fixture with starters, bench, goalkeeperId, kickers. Prototype rosters are production-like but team-specific. | `TeamSnapshot`, fixtures |
| Role fit | `src/systems/roleFit/roleFitTypes.ts`, `roleFitEngine.ts`, `roleFitFixtures.ts`, `roleFitEngine.test.ts`; `src/features/roster/*`; `src/components/roster/*` | Computes role fit score, reasons, risks, boosts, penalties, pairings, style fit, fatigue warnings, comparisons. | High for roster feature | Contract uses `testedRole` and intentionally has no public `role` key; spec expects `PlayerSnapshot.role`. It is not yet integrated as a match input/output evidence layer. | `RoleFitResult`, team builder |
| Team shape intent | `src/systems/shape/teamShapeIntentTypes.ts`, `teamShapeIntentResolver.ts`, `teamShapeIntentEvaluator.ts`, `teamShapeIntentGeneralization.ts` | Defines and evaluates team shape intent, rest defense, weak-side risk, pressing synchronization. | Medium | `resolveTeamShapeIntentForSequenceOneActionOne()` is hardcoded to CONTROL/BLITZ and one action; generalization is diagnostic/report oriented. | `TeamShapeIntent`, tactical diagnosis |
| Tactical intent | `src/systems/intent/*`, `src/config/intentConfig.ts` | Player intent lifecycle, priorities, tactical triggers, role profiles, evolution. | Medium | Used by match loop/player states, but official `TacticalPlan` does not exist as a top-level input. | `TacticalPlan`, `MatchSnapshot` |
| Spatial systems | `src/core/zones.ts`, `src/systems/spatial/*`, especially `intention/*`, `dynamicInfluence/*`, `localAdvantage/*` | Abstract zones, BallContext, attacking direction, target selection, weak side, influence/pressure/control/passing-lane fields. | Medium-high | Good tactical primitives, but not normalized into spec `TacticalContextSnapshot` or `ZoneStats`. | `MatchEvent.zone`, `MatchReport.zoneStats` |
| Interactions / sequences | `src/systems/sequences/*`, `src/systems/interactions/buildUp`, `construction`, `transition`, `pressing`, `finishing`, `shared` | Resolves tactical sequence interactions and logs outcomes. | Medium-high | Core MVP interactions exist, but official `MatchEvent` taxonomy is not the central output. | `MatchEvent`, event taxonomy |
| Events | `src/reports/types.ts`, `src/systems/events/types.ts`, event resolvers | `reports/types.ts` defines a compact `MatchEvent`; `systems/events/types.ts` defines `TacticalEventChain`. | Partial | Existing `MatchEvent` has `id`, `tick`, `category`, `involvedRoles`, `result`, `narrative`; spec requires `eventId`, `matchId`, timestamp, phase, sequenceId, opponentTeamId, tactical/fatigue context, outcome, consequences, tags, narrativeWeight. | `MatchEvent` |
| Debug timeline | `src/systems/debugTimeline/timelineEvent.ts`, `timelineRecorder.ts`, `replayValidator.ts`, serializers | Records replayable event-level evidence with world hashes, actors, intents, spatial facts, resolver inputs/outcomes, seed info, report refs. | Medium-high diagnostic | Richer than current `MatchEvent`, but named/debug scoped and not transformed into spec event contract. | Observability, replayable timeline |
| Reports | `src/reports/markdownMiniMatchReport.ts`, `reportHierarchy.ts`, `coaching/*`, `visualization/*`, `storyboard/*`, `workbench/*` | Produces coach summary, tactical evidence, debug report, snapshots/storyboards/workbench. | Medium-high prototype | Outputs Markdown strings and generated files, not stable `MatchReport` JSON. `CoachingFeedbackReport` is narrower than `CoachInsight[]`. | `MatchReport`, `CoachInsight` |
| Coach insights | `src/reports/coaching/types.ts`, `generateCoachingFeedback.ts`, analyzers | Produces `CoachingFeedbackReport` with observed identity, worked/failed/why/levers by team. | Medium | No `CoachInsight` type with evidence, affected players/zones, confidence, recommended actions. | `CoachInsight` |
| Scoring | `src/models/scoring.ts`, `src/systems/scoring/*`, `src/systems/actions/*Shot*`, `try*`, `drop*`, `conversion*` | Multiple scoring routes, unified live scoring stream, batch calibration, scoring balance diagnostics. | Medium-high | `ScoringEvent` is separate from `MatchEvent`; score state hardcodes `CONTROL`/`BLITZ` in `ScoringEventScoreState`. | scoring events, team/player stats |
| Fatigue / condition | `src/models/player.ts`, `src/systems/actions/goalkeeperFatigue*`, `src/systems/structure/recoverySaturation/*`, roster freshness in `controlRoster.ts`/`blitzRoster.ts`, scoring reports | Player freshness, recovery saturation, goalkeeper physical/mental fatigue. | Medium | General player fatigue is partly structural and partly simplified; spec `FatigueContextSnapshot`, `FatigueReport`, `currentCondition`, `mentalFreshness` are missing. Some reports say fatigue remains outside live scoring events. | fatigue context/report |
| Goalkeeper | `PlayerRole.GoalkeeperFreeSafety`, roster `isGoalkeeper`, `src/systems/actions/goalkeeperFatigue*`, `gkShotStopping*`, `src/systems/rules/goalkeeperRules.ts` | GK role, rules, shot stopping, mental/physical readiness, save/catch/deflection/fail outcomes. | Medium | Good subsystem, but not yet a first-class `TeamSnapshot.goalkeeperId`/`PlayerStats`/`MatchEvent` category output. | goalkeeper events/stats |
| Tests | `src/systems/roleFit/roleFitEngine.test.ts`, `src/systems/interactions/finishing/finishingOutputTaxonomy.test.ts`, validators in `src/reports/validation/*` | Role fit fixture assertions; finishing wording guard; report validators executed by `src/index.ts`. | Partial | `npm test` is only `tsc --noEmit`; test files run only if imported or invoked manually. Contract/unit tests for official spec are absent. | Priority 1 test criteria |

## 3. Spec vs existing gap matrix

| Contract spec | Current state | Files | Main gap | Product risk | Priority |
| --- | --- | --- | --- | --- | --- |
| `MatchInput` | Partial under `MiniMatchInput` and `MatchSetup` | `src/simulation/miniMatch/types.ts`, `src/simulation/engine.ts` | No `matchId`, string seed, home/away snapshots, tactical plans, context, ruleset. Uses `teamA`, `teamB`, `numberOfSequences`. | UI/coach tools cannot rely on a stable kickoff payload. | P0 |
| `TeamSnapshot` | Partial under `TeamState`, `PrototypeTeamDefinition`, CONTROL/BLITZ roster files | `src/models/team.ts`, `src/data/prototypeTeams.ts`, `src/data/teams/*.ts` | Missing `roster`, `starters`, `bench`, `captainId`, `primaryKickerId`, `primaryDropTakerId`, `goalkeeperId` in one canonical shape. | Team builder cannot pass a generic team into engine without adapter logic. | P0 |
| `PlayerSnapshot` | Partial under `PlayerState`, roster player types, visible/derived attributes | `src/models/player.ts`, `src/data/teams/*.ts`, `src/systems/players/*` | No canonical `playerId`, `traits`, `currentCondition`, `mentalFreshness`, `chemistryLinks`; two attribute models. | Player progression and coach evidence may fork from match runtime state. | P0 |
| `TacticalPlan` | Partial under `TacticalInstructions`, `PrototypeTeamDefinition`, intent systems | `src/models/tactics.ts`, `src/data/prototypeTeams.ts`, `src/systems/intent/*` | Missing named attack/defense/transition intents, target zones, scoring bias, width usage, rest defense priority. | Coach preparation levers cannot be guaranteed to affect simulation. | P0 |
| `RoleFitResult` | Exists with different semantics | `src/systems/roleFit/roleFitTypes.ts`, `roleFitEngine.ts`, `roleFitEngine.test.ts` | Uses `testedRole`, display-string `TrueRole`, no `role` field by design; not attached to player/team snapshots. | Role fit can remain a roster widget instead of engine evidence. | P1 |
| `TeamShapeIntent` | Exists | `src/systems/shape/teamShapeIntentTypes.ts` | Contract is tactical and useful, but resolver is partly hardcoded/diagnostic. No official link from `TacticalPlan` or `MatchEvent`. | Shape intent may explain demos without governing all match contexts. | P1 |
| `MatchEvent` | Partial, multiple event shapes | `src/reports/types.ts`, `src/systems/events/types.ts`, `src/systems/debugTimeline/timelineEvent.ts`, `src/systems/scoring/scoringEventTypes.ts` | No single central event schema matching spec. Current `DebugTimelineEvent` has evidence but not public; `ScoringEvent` is separate. | Match center/report consumers need bespoke parsers and may miss causal context. | P0 |
| `MatchSnapshot` | Partial under `WorldState`, `WorldStateSummary`, snapshots | `src/systems/matchLoop/worldState.ts`, `src/reports/visualization/tacticalSnapshotTypes.ts` | No exported spec `MatchSnapshot`; active warnings absent; team runtime state differs. | Live match center cannot consume a stable state update. | P1 |
| `MatchReport` | Partial as Markdown/report hierarchy and `MiniMatchSummary` | `src/simulation/miniMatch/types.ts`, `src/reports/markdownMiniMatchReport.ts`, `src/reports/reportHierarchy.ts` | No typed report with timeline/teamStats/playerStats/zoneStats/fatigueReport/tacticalReport/keyMoments/coachInsights/suggestedFocus. | Coach experience depends on generated prose rather than inspectable data. | P0 |
| `CoachInsight` | Partial under `CoachingFeedbackReport` | `src/reports/coaching/types.ts`, `generateCoachingFeedback.ts` | Missing insight id/type/confidence/evidence/affected players/zones/recommended actions. | Assistant coach risks unsupported or non-actionable guidance. | P1 |
| `TacticalDiagnosis` | Partial, not named | `src/reports/coaching/analyzeTeamPatterns.ts`, `analyzeSuccessCauses.ts`, `analyzeFailureCauses.ts`, shape/scoring diagnostics | No canonical type. | Tactical report cannot be reused across report/training/prep screens. | P1 |
| `TrainingRecommendation` | Partial as strings/levers | `src/reports/coaching/types.ts`, `summarizeMiniMatch.ts` | No structured recommendation, trade-off, focus category, affected players, priority. | Training/progression loop has no stable input. | P2 for Priority 1, P0 for Priority 2 |
| `ProgressionSignal` | Absent | Search found no matching contract; progression is out of current engine scope. | No match-to-progression evidence type. | Later progression system may invent its own causality. | P2 |

## 4. Priority 1 readiness assessment

| Item | Status | Evidence | Priority 1 gap |
| --- | --- | --- | --- |
| A. Headless engine | Partiel | `runMiniMatch()` runs without UI; `src/index.ts` generates reports through Node. | Importing public API also executes demo/report writes. Need clean engine entry point. |
| B. Stable data contract | Partiel | Many exported types via `src/index.ts`; strict TS enabled in `tsconfig.json`. | Spec contracts are absent or divergent; no adapter/schema tests. |
| C. Collective coherence | Partiel | `deriveTeamProfileFromRoster()` aggregates support, buildup, compactness, recovery, risk; role fit has risks/pairings. | Synergies/complementarity not unified into team snapshot/report; no anti-meta contract tests. |
| D. Match simulation | Partiel | `runMiniMatch()` resolves sequences and scoring; `tickEngine.ts` has tick wrapper. | Full match loop is still mini-match/sequence bounded; tick event detection is placeholder. |
| E. Event log | Partiel | `DebugTimelineReplay`, `MiniMatchTryEvent`, `ScoringEvent`, tactical logs exist. | No canonical spec `MatchEvent[]` timeline. |
| F. Fatigue | Partiel | `PlayerFatigueState`, roster freshness, recovery saturation, GK fatigue profile. | General fatigue is not yet a typed match report/event context; some fatigue diagnostics are explicitly outside live scoring. |
| G. Tactics | Partiel | Prototype tactical instructions, offensive philosophies, intent lifecycle, shape intent. | No official `TacticalPlan` and no test proving plan levers change match outputs. |
| H. Goalkeeper | Partiel | GK role, fatigue/readiness, shot stopping, rules. | Not elevated to spec snapshot/report/player stats/event taxonomy. |
| I. Raw engine report | Partiel | `coach-summary.latest.md`, `tactical-evidence.latest.md`, `debug-full.latest.md`, debug timeline. | Mostly Markdown/file artifacts, not typed `MatchReport`. |
| J. Tests | Partiel | Role fit fixtures strong; finishing wording narrow; many validators. | `npm test` only typechecks; official contract/invariant/scoring/fatigue/event tests missing. |

## 5. Dangerous inconsistencies

1. `role` vs `testedRole`: `RoleFitInput`/`RoleFitResult` intentionally expose `testedRole` and tests assert no public `role` key in `src/systems/roleFit/roleFitEngine.test.ts`. The spec expects `PlayerSnapshot.role`. This is safe locally but dangerous if `RoleFitResult` is treated as the player contract.

2. Public API side effects: `src/index.ts` exports modules and then calls `runMiniMatchDemo()`. Importing the package as an engine library can write reports and run validations.

3. Multiple player attribute models: `PlayerAttributes` in `src/models/player.ts` differs from `VisiblePlayerAttributes` and `DerivedPlayerAttributes`. `toLegacyPlayerAttributes()` maps between them, but the spec names only `PlayerAttributes`.

4. Fatigue naming split: spec uses `currentCondition` and `mentalFreshness`; legacy `PlayerState` uses `fatigue.accumulatedFatigue` and `freshness`; role fit uses `fatigueState.currentFatigue`, `mentalFatigue`, `lateMatchReliability`; GK fatigue uses physical/mental fatigue and readiness.

5. Team shape hardcoding: `resolveTeamShapeIntentForSequenceOneActionOne()` hardcodes CONTROL/BLITZ sequence-one zones and explanations. `teamShapeIntentGeneralization.ts` generalizes, but still special-cases `dt-s1-a1`.

6. Scoring event team keys: `ScoringEventScoreState` uses `CONTROL` and `BLITZ` fields, which blocks generic team IDs in the official contract.

7. Match event fragmentation: `MatchEvent`, `TacticalEvent`, `DebugTimelineEvent`, `MiniMatchTryEvent`, and `ScoringEvent` each hold different slices of truth. No central event contract guarantees tactical context plus fatigue context plus scoring consequences.

8. Tests are not a real runner: `package.json` sets `"test": "npm run typecheck"`. Test files with thrown assertions are not automatically executed unless separately imported or run.

9. Validators may freeze prose instead of data: `validateCoachSummaryDataBinding()` checks exact lines like `Sequence 1 Action 1 - TH -> ML`. Useful for report guardrails, risky as a primary engine contract.

10. `MatchLoop` placeholder wording is still in runtime timeline: `tickEngine.ts` emits placeholder intent/team/spatial/event detection descriptions. Treat as scaffold, not production event loop.

11. Reports are generated files as source of evidence: many outputs under `reports/` are current-state artifacts, not contract definitions. They are valuable calibration evidence but should not be the only integration surface.

12. Traits/chemistry/progression are documented in the spec but not present in canonical runtime contracts. Mark progression as out of Priority 1 unless the contract reserves evidence fields.

## 6. Recommended implementation roadmap

### Sprint 1 - Contract Alignment

Objective: Define official engine-to-coach TypeScript contracts without changing simulation behavior.

Files probable: `src/contracts/matchContract.ts` or `src/models/engineToCoach.ts`, `src/index.ts`, contract fixtures under `src/contracts/*.test.ts`.

Works:
- Add `MatchInput`, `TeamSnapshot`, `PlayerSnapshot`, `TacticalPlan`, `MatchEvent`, `MatchSnapshot`, `MatchReport`, `CoachInsight`.
- Add supporting types for context, ruleset, event outcome, consequences, insight evidence, recommendation action.
- Keep adapters separate from current mini-match code.
- Split `src/index.ts` library exports from report demo execution.

Tests to add:
- Contract compile test with one CONTROL vs BLITZ fixture.
- Export-surface test ensuring all official contracts are exported.
- No-side-effect import test for public API.

Definition of Done:
- `npm test` runs typecheck plus contract tests.
- Official contract types compile and are exported.
- Importing the package does not run `runMiniMatchDemo()`.

### Sprint 2 - Team Shape Intent / Role Fit Completion

Objective: Connect roster intelligence to official team/player snapshots without weakening existing role-fit fixtures.

Files probable: `src/systems/roleFit/*`, `src/systems/shape/*`, `src/data/teams/*`, new `src/adapters/snapshotAdapters.ts`.

Works:
- Add adapter from roster players to `PlayerSnapshot`.
- Add adapter from prototype team/roster/tactical instructions to `TeamSnapshot`.
- Decide mapping between `TrueRole` and `PlayerRole`.
- Keep `RoleFitResult.testedRole`, but document/adapter-map it to snapshot role context.
- Generalize `TeamShapeIntent` resolver away from sequence-one hardcoding where possible.

Tests to add:
- Role mapping test: every `PlayerRole` used in rosters maps to coach role display.
- Team snapshot fixture test: goalkeeperId exists and matches an `isGoalkeeper` player.
- Shape intent generic context test across at least two sequence/action contexts.

Definition of Done:
- CONTROL and BLITZ can be converted to spec snapshots.
- Role fit remains green.
- Shape intent has a generic path not dependent on `dt-s1-a1`.

### Sprint 3 - Match Engine Contract

Objective: Provide a canonical `runMatch(input: MatchInput): MatchReport` wrapper around current mini-match behavior.

Files probable: `src/simulation/runMatch.ts`, `src/simulation/miniMatch/*`, `src/contracts/*`.

Works:
- Build adapter from `MatchInput` to `MiniMatchInput`.
- Build adapter from `MiniMatchResult` to `MatchReport`.
- Normalize score state by team ID, not CONTROL/BLITZ keys.
- Include raw event timeline, score, summary stats, and report metadata.

Tests to add:
- `runMatch` returns stable report shape.
- Final score equals active scoring events.
- Same seed produces same report signature.

Definition of Done:
- One public engine call accepts spec input and returns typed data.
- Mini-match remains usable internally.
- Report consumers no longer need Markdown parsing.

### Sprint 4 - Zone Model + Possession Loop

Objective: Promote the existing zone/BallContext/continuity work into official event and snapshot state.

Files probable: `src/core/zones.ts`, `src/systems/spatial/intention/*`, `src/systems/ball/*`, `src/systems/matchLoop/*`, `src/simulation/miniMatch/*`.

Works:
- Define `MatchSnapshot` adapter from world/mini-match state.
- Normalize ball zone, possession team, phase, momentum, last events.
- Make target zone selection reason available in `MatchEvent.tacticalContext`.

Tests to add:
- Ball zone contract test against `MatchEvent.zone`.
- Directionality test: same zone move classifies differently by attacking direction.
- Possession continuity test across turnover/recycle.

Definition of Done:
- Every event has a valid zone and possession context.
- Snapshots can be consumed by a future Match Center without debug timeline parsing.

### Sprint 5 - Action Resolution V1

Objective: Convert sequence outcomes into canonical action/event taxonomy.

Files probable: `src/systems/sequences/*`, `src/systems/interactions/*`, `src/systems/events/*`, `src/systems/scoring/*`.

Works:
- Map build-up, construction, transition, pressing, finishing, shot, try, conversion, drop, rebound into `MatchEventType`.
- Attach primary/secondary/opposing players and roles.
- Convert `ScoringEvent` into `MatchEvent.consequences` while keeping scoring diagnostics.

Tests to add:
- Event taxonomy coverage test for MVP interactions.
- Scoring trace test: scoring event references prior tactical events.
- No inactive scoring leakage test.

Definition of Done:
- Match report timeline uses canonical `MatchEvent`.
- Scoring stream and tactical events agree on score consequences.

### Sprint 6 - Fatigue + Goalkeeper Model

Objective: Make fatigue and goalkeeper effects first-class in event/report contracts.

Files probable: `src/models/player.ts`, `src/systems/actions/goalkeeperFatigue*`, `gkShotStopping*`, `src/systems/structure/recoverySaturation/*`, `src/contracts/*`.

Works:
- Define `FatigueContextSnapshot` and `FatigueReport`.
- Map player freshness/recovery saturation/GK readiness into event context.
- Add goalkeeper player stats: saves, handling errors, rebound control, concentration events.
- Ensure pressing intensity and late sequences alter fatigue evidence.

Tests to add:
- High press increases late fatigue/recovery saturation compared to balanced plan.
- GK mental fatigue affects save/catch/spill outcome probabilities.
- Fatigue context appears on all major interaction events.

Definition of Done:
- Fatigue is observable in typed report data.
- GK influence can be traced from attributes/context to event outcome.

### Sprint 7 - Raw Match Report + Coach Evidence

Objective: Produce coach-facing evidence as structured data first, Markdown second.

Files probable: `src/reports/coaching/*`, `src/reports/reportHierarchy.ts`, `src/reports/markdownMiniMatchReport.ts`, `src/contracts/*`.

Works:
- Define `TacticalDiagnosis`, `TrainingRecommendation`, and optional `ProgressionSignal` placeholders.
- Convert `CoachingFeedbackReport` into `CoachInsight[]` with evidence/confidence/actions.
- Generate Markdown from `MatchReport`, not directly from mini-match internals.

Tests to add:
- Every `CoachInsight` has evidence and confidence.
- Recommendations include trade-offs.
- Markdown report references only data present in `MatchReport`.

Definition of Done:
- Post-match report answers what happened, why, players involved, zones involved, and what to try next.
- No unsupported coach claims.

## 7. Critical tests to add

| Test name | Target file | Protects | Why priority |
| --- | --- | --- | --- |
| `engineContractExports.test.ts` | `src/contracts/engineContract.test.ts` | Official contracts exported from public API | Prevents hidden/internal-only contract drift. |
| `matchInputFixtureValidation.test.ts` | `src/contracts/matchInputFixture.test.ts` | CONTROL/BLITZ `MatchInput` completeness | Proves team builder can feed engine. |
| `runMatchDeterminism.test.ts` | `src/simulation/runMatch.test.ts` | Same seed produces same report signature | Required by spec observability. |
| `runMatchSeedVariation.test.ts` | `src/simulation/runMatch.test.ts` | Different seeds produce controlled variation | Avoids fake seed support. |
| `matchEventContract.test.ts` | `src/contracts/matchEvent.test.ts` | Required event fields, zone, teams, outcome, consequences | Central Match Center/report dependency. |
| `scoringEventTrace.test.ts` | `src/systems/scoring/scoringEventTrace.test.ts` | Final score equals active scoring consequences | Prevents score/report contradiction. |
| `teamSnapshotAdapter.test.ts` | `src/adapters/teamSnapshotAdapter.test.ts` | Starters/bench/GK/kickers/roster shape | Stabilizes coach prep/team builder data. |
| `playerSnapshotFatigueMapping.test.ts` | `src/adapters/playerSnapshotAdapter.test.ts` | `currentCondition`, `mentalFreshness` mapping | Prevents fatigue naming drift. |
| `roleFitContractCompatibility.test.ts` | `src/systems/roleFit/roleFitContractCompatibility.test.ts` | `testedRole` compatibility with `PlayerSnapshot.role` | Keeps existing UI contract while enabling engine contract. |
| `teamShapeIntentGenericContext.test.ts` | `src/systems/shape/teamShapeIntentGeneric.test.ts` | Non-`dt-s1-a1` shape evaluation | Prevents one-scenario overfitting. |
| `tacticalPlanInfluence.test.ts` | `src/simulation/tacticalPlanInfluence.test.ts` | Plan levers alter event distributions | Confirms tactics matter. |
| `fatiguePressTradeoff.test.ts` | `src/systems/fatigue/fatiguePressTradeoff.test.ts` | High press increases late fatigue/errors | Core anti-meta behavior. |
| `goalkeeperFatigueShotStopping.test.ts` | `src/systems/actions/goalkeeperFatigue.test.ts` | GK mental fatigue modifies save/catch/spill | Makes GK model product-visible. |
| `coachInsightEvidence.test.ts` | `src/reports/coaching/coachInsightEvidence.test.ts` | Insights require evidence/confidence/actions | Prevents false explanations. |
| `matchReportSchema.test.ts` | `src/contracts/matchReport.test.ts` | Timeline, stats, fatigue, tactical, key moments, insights | Makes `MatchReport` a real integration point. |
| `antiMetaStyleBalance.test.ts` | `src/systems/simulation/antiMetaStyleBalance.test.ts` | No single style dominates across scenarios | Supports long-term game balance. |
| `fixturesDoNotUseGeneratedReports.test.ts` | `src/contracts/fixturePurity.test.ts` | Tests consume typed fixtures, not report prose | Keeps tests from freezing accidental Markdown. |

## 8. Open questions

1. Should the official engine entry point be `runMatch(input: MatchInput): MatchReport`, or should it stream `MatchSnapshot` plus return a final `MatchReport`?

2. Should `PlayerAttributes` in the spec mean visible attributes only, or visible plus derived attributes?

3. Should `TeamSnapshot.starters` be 10 players for the current prototype roster, or is the final on-field count still open?

4. Should `Goalkeeper / Free Safety` remain a display role mapped to `PlayerRole.GoalkeeperFreeSafety`, or should `TrueRole` and `PlayerRole` be unified?

5. Should `ProgressionSignal` be reserved as an empty/future contract now, or omitted until Priority 2/Phase 6?

6. Should Markdown reports remain build artifacts under `reports/`, or should they be generated on demand from typed `MatchReport` data?

7. How generic must V0.1 be beyond CONTROL vs BLITZ? The scoring stream and some reports still assume those two team names.

## 9. Suggested next Codex prompt for Sprint 1

```text
Implement Sprint 1 - Contract Alignment from docs/audits/engine_to_coach_gap_analysis_v0_1.md.

Constraints:
- Do not change simulation behavior.
- Do not refactor tactical systems.
- Add official TypeScript contracts for MatchInput, TeamSnapshot, PlayerSnapshot, TacticalPlan, MatchEvent, MatchSnapshot, MatchReport, CoachInsight, TacticalDiagnosis, TrainingRecommendation, and ProgressionSignal.
- Export those contracts from the public API.
- Split public library import from the report-generating mini-match demo so importing src/index.ts has no side effects.
- Add minimal contract fixtures/tests proving the official contracts compile and are exported.
- Keep existing role fit tests and report validators intact.

Before editing, inspect src/index.ts, src/simulation/engine.ts, src/simulation/miniMatch/types.ts, src/models/*.ts, src/reports/types.ts, src/reports/coaching/types.ts, and src/systems/roleFit/roleFitTypes.ts.
After editing, run npm test and report any remaining gaps.
```
