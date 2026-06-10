# Bundle: bundle__docs.md

Generated for Sprint 2N - Segment Diversity + Fatigue Propagation + Key Moment Diversity. Source files are bundled by domain for compact ChatGPT review.

## File: docs/audits/engine_to_coach_gap_analysis_v0_1.md

```md
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
```

## File: docs/engine_to_coach_experience_spec_v0_1.md

```md
# Fantasy Game — Engine-to-Coach Experience Spec v0.1

## 0. Intent

This document defines the product and technical contract between the match engine and the coach-facing experience.

The match engine remains the core priority, but the game will only become compelling if the engine produces visible, understandable and actionable outputs. The purpose of this spec is to ensure that every important engine output can be transformed into a coach decision, a learning moment, an emotional moment, or a progression loop.

## 1. Product thesis

The game is not just a simulation. It is a coach experience.

The player should feel:

> “I built this team. I understood what happened. I know what to try next.”

The engine must therefore produce more than a final score. It must produce evidence.

### Core loop

```text
Build team
→ Prepare match
→ Watch / simulate match
→ Understand result
→ Improve team
→ Prepare next opponent
```

### Two priorities

1. **Finalize a performant, coherent and explainable match engine.**
2. **Build the coach experience that exposes the engine’s depth through tools, visuals, reports and progression systems.**

Priority 2 must be designed alongside Priority 1. It should not wait until the engine is “finished”.

## 2. Design principles

### 2.1 The engine must be observable

The engine should be headless, deterministic when seeded, and decoupled from UI. But it must also be built with observability from day one.

Every important outcome should be traceable through:

- the players involved;
- the zone involved;
- the tactical context;
- the fatigue context;
- the action type;
- the outcome;
- the consequence;
- the confidence level of the interpretation.

### 2.2 The UX must be action-oriented

The coach-facing experience should not display stats for the sake of stats. Each visible signal should help the player answer one of these questions:

1. What happened?
2. Why did it happen?
3. Which player or collective mechanism caused it?
4. What can I change?
5. What should I train or build next?

### 2.3 The assistant coach should guide, not solve

The assistant coach should explain patterns and propose options, but it should not give a single perfect answer. The game must preserve discovery, debate, experimentation and theorycraft.

### 2.4 The player should learn the sport progressively

Because the sport is fictional, the UX must teach the game through feedback loops:

- simple feedback after early matches;
- deeper tactical analysis as the player progresses;
- optional advanced analytics for expert players.

### 2.5 Emotional attachment matters

The game should make players care about their squad. Therefore, the engine should create player-level moments:

- decisive try;
- heroic defensive stop;
- late fatigue mistake;
- goalkeeper rescue;
- impact substitute;
- recurring duo synergy;
- rivalry with an opponent.

## 3. Engine-to-UX contract

The match engine must expose a structured data contract.

### 3.1 MatchInput

Represents everything the engine needs before kickoff.

```ts
interface MatchInput {
  matchId: string;
  seed: string;
  homeTeam: TeamSnapshot;
  awayTeam: TeamSnapshot;
  homePlan: TacticalPlan;
  awayPlan: TacticalPlan;
  matchContext: MatchContext;
  ruleset: RulesetConfig;
}
```

### 3.2 TeamSnapshot

```ts
interface TeamSnapshot {
  teamId: string;
  name: string;
  roster: PlayerSnapshot[];
  starters: string[];
  bench: string[];
  captainId?: string;
  primaryKickerId?: string;
  primaryDropTakerId?: string;
  goalkeeperId: string;
  teamIdentity?: TeamIdentity;
}
```

### 3.3 PlayerSnapshot

```ts
interface PlayerSnapshot {
  playerId: string;
  name: string;
  role: PlayerRole;
  attributes: PlayerAttributes;
  traits: PlayerTrait[];
  currentCondition: number; // 0-100
  mentalFreshness: number; // 0-100
  chemistryLinks?: ChemistryLink[];
}
```

### 3.4 TacticalPlan

```ts
interface TacticalPlan {
  attackingIntent: AttackingIntent;
  defensiveIntent: DefensiveIntent;
  transitionIntent: TransitionIntent;
  tempo: 'slow' | 'balanced' | 'fast';
  riskLevel: 'low' | 'medium' | 'high';
  targetZones: ZoneId[];
  scoringBias: ScoringBias;
  pressingIntensity: number; // 0-100
  defensiveLineHeight: number; // 0-100
  widthUsage: number; // 0-100
  restDefensePriority: number; // 0-100
}
```

### 3.5 MatchContext

```ts
interface MatchContext {
  competitionType: 'friendly' | 'league' | 'cup' | 'playoff';
  matchImportance: number; // 0-100
  weather?: WeatherCondition;
  pitch?: PitchCondition;
  crowdPressure?: number; // 0-100
}
```

### 3.6 MatchEvent

The central unit of visibility.

```ts
interface MatchEvent {
  eventId: string;
  matchId: string;
  timestamp: MatchTimestamp;
  phase: MatchPhase;
  sequenceId: string;
  teamId: string;
  opponentTeamId: string;
  eventType: MatchEventType;
  zone: ZoneId;
  subZone?: SubZoneId;
  primaryPlayerId?: string;
  secondaryPlayerId?: string;
  opposingPlayerId?: string;
  tacticalContext: TacticalContextSnapshot;
  fatigueContext: FatigueContextSnapshot;
  outcome: EventOutcome;
  consequences: EventConsequence[];
  tags: EventTag[];
  narrativeWeight: number; // 0-100
}
```

### 3.7 MatchSnapshot

Used by the Match Center UI.

```ts
interface MatchSnapshot {
  matchId: string;
  currentMinute: number;
  score: ScoreState;
  phase: MatchPhase;
  possessionTeamId: string;
  ballZone: ZoneId;
  momentum: MomentumState;
  teamStates: TeamRuntimeState[];
  lastEvents: MatchEvent[];
  activeWarnings: CoachWarning[];
}
```

### 3.8 MatchReport

Used after the match.

```ts
interface MatchReport {
  matchId: string;
  score: ScoreState;
  timeline: MatchEvent[];
  teamStats: TeamMatchStats[];
  playerStats: PlayerMatchStats[];
  zoneStats: ZoneStats[];
  fatigueReport: FatigueReport;
  tacticalReport: TacticalReport;
  keyMoments: KeyMoment[];
  coachInsights: CoachInsight[];
  suggestedFocus: TrainingFocusSuggestion[];
}
```

### 3.9 CoachInsight

The bridge between data and decision.

```ts
interface CoachInsight {
  insightId: string;
  type:
    | 'strength'
    | 'weakness'
    | 'tactical_success'
    | 'tactical_failure'
    | 'fatigue_warning'
    | 'player_spotlight'
    | 'synergy_detected'
    | 'opponent_exploit'
    | 'training_recommendation';
  title: string;
  summary: string;
  evidence: InsightEvidence[];
  affectedPlayers: string[];
  affectedZones: ZoneId[];
  confidence: 'low' | 'medium' | 'high';
  recommendedActions: CoachActionSuggestion[];
}
```

## 4. Data maturity pipeline

The engine should not jump directly from event to recommendation. It should pass through interpretation layers.

| Level | Name | Example |
|---|---|---|
| L0 | Raw event | Pass failed in right channel at 54’ |
| L1 | Normalized fact | 6 failed progressions on right channel |
| L2 | Pattern | Right-side buildup struggled under pressure |
| L3 | Coach insight | Your right distributor lacked support when pressed |
| L4 | Action suggestion | Add a support runner, lower tempo, or train passing under pressure |

This layered structure prevents false explanations and keeps the assistant coach honest.

## 5. Event taxonomy

### 5.1 Structural events

- Kickoff
- Half start
- End of period
- Substitution
- Tactical shift
- Injury pause

### 5.2 Possession events

- Gain possession
- Lose possession
- Retain under pressure
- Turnover
- Interception
- Recovery

### 5.3 Progression by hand

- Short pass
- Long pass
- Offload
- Carry
- Support run
- Line break
- Failed handling
- Knock-on equivalent

### 5.4 Progression by foot

- Territorial kick
- Cross-field kick
- Chip kick
- Clearance kick
- Drop attempt
- Shot at goal
- Kick recovered
- Kick lost

### 5.5 Duel and contact

- Tackle won
- Tackle broken
- Contact dominant
- Contact absorbed
- Ruck / contest won
- Ruck / contest lost
- Aerial duel won
- Aerial duel lost

### 5.6 Scoring events

- Try
- Goal
- Drop
- Conversion attempt
- Conversion scored
- Conversion missed
- Penalty shot scored
- Penalty shot missed

### 5.7 Defensive events

- Defensive line holds
- Defensive line broken
- Cover tackle
- Goalkeeper save
- Goalkeeper catch
- Goalkeeper rebound
- Last-line stop
- Forced error

### 5.8 Fatigue and error events

- Late defensive reaction
- Poor technical execution
- Cognitive lapse
- Bad positioning
- Slow recovery run
- Goalkeeper concentration error

### 5.9 Discipline events

- Foul
- Advantage
- Penalty conceded
- Warning
- Yellow card
- Red card

## 6. Coach-facing screens

## 6.1 Team Builder

### Purpose

Help the player build a coherent team, not just a collection of high-rated players.

### Core components

1. **Budget allocation panel**
   - total points spent;
   - remaining budget;
   - warning when the squad is unbalanced.

2. **Role matrix**
   - goalkeeper;
   - distributors;
   - carriers;
   - finishers;
   - defenders;
   - kickers;
   - support / link players.

3. **Team identity card**
   - “Fast transition team”;
   - “Power contact team”;
   - “Territorial kicking team”;
   - “Balanced possession team”;
   - “Defensive control team”.

4. **Balance meters**
   - speed;
   - power;
   - endurance;
   - technique;
   - tactical intelligence;
   - kicking;
   - defensive reliability;
   - goalkeeper reliability.

5. **Weakness detector**
   - no reliable kicker;
   - no late-game endurance;
   - weak right-side defense;
   - fragile goalkeeper concentration;
   - too many high-fatigue profiles.

6. **Synergy graph**
   - distributor ↔ runner;
   - kicker ↔ chaser;
   - carrier ↔ support runner;
   - goalkeeper ↔ outlet players;
   - defensive leader ↔ compact block.

### Example UX copy

```text
Your team is extremely dangerous in transition, but your high-intensity profiles may collapse after 60 minutes. Consider adding one endurance-heavy support player or lowering your pressing intensity.
```

## 6.2 Match Preparation

### Purpose

Help the player choose a plan before the match.

### Core components

1. **Opponent snapshot**
   - identity;
   - strengths;
   - weaknesses;
   - likely style.

2. **Match-up board**
   - your right attack vs their left defense;
   - your goalkeeper vs their long-shot/drop threat;
   - your carriers vs their contact defenders;
   - your press vs their passing under pressure.

3. **Plan editor**
   - attack preference;
   - defensive block;
   - transition behavior;
   - tempo;
   - risk;
   - pressing;
   - target zones;
   - scoring priority.

4. **Risk forecast**
   - expected fatigue cost;
   - foul risk;
   - turnover risk;
   - vulnerability to counterattack;
   - goalkeeper exposure.

5. **Assistant coach advice**
   - one conservative plan;
   - one aggressive plan;
   - one exploit-based plan.

### Example UX copy

```text
BLITZ struggles when forced to defend wide after two or more phases. A width-first plan could create line breaks, but it will increase your turnover risk if your passers are tired.
```

## 6.3 Match Center

### Purpose

Make the match readable, tense and alive without requiring 3D.

### Core components

1. **Scoreboard**
   - score;
   - time;
   - phase;
   - possession.

2. **Live ticker**
   - high-level events only by default;
   - expandable detail for expert users.

3. **2D territory map**
   - current ball zone;
   - pressure zones;
   - repeated attacks;
   - defensive stress.

4. **Momentum graph**
   - possession quality;
   - territorial pressure;
   - scoring threat.

5. **Fatigue strips**
   - visible at team level;
   - player-level detail partly hidden or estimated if needed for game balance.

6. **Coach alerts**
   - “Your right side is under pressure”;
   - “Your pressing intensity is dropping”;
   - “The opponent is targeting your goalkeeper with long shots.”

### Example live sequence

```text
54’ — CONTROL insists on the right channel.
The distributor attracts pressure and releases the outside runner.
BLITZ is late to cover after three high-intensity defensive sequences.
Line break. Try for CONTROL.
```

## 6.4 Post-Match Report

### Purpose

Turn the result into learning and emotional payoff.

### Core sections

1. **Narrative summary**
   - story of the match;
   - tone adapted to win/loss/draw.

2. **Three reasons for the result**
   - tactical;
   - physical/fatigue;
   - player/synergy.

3. **Key moments**
   - scoring moments;
   - turnovers;
   - defensive stops;
   - fatigue collapse;
   - goalkeeper actions.

4. **Zone analysis**
   - where the team dominated;
   - where it suffered;
   - territory gained/lost.

5. **Player analysis**
   - MVP;
   - impact substitute;
   - under-pressure player;
   - hidden contributor.

6. **Tactical diagnosis**
   - what worked;
   - what failed;
   - whether the plan matched the roster.

7. **Training suggestions**
   - one short-term adjustment;
   - one medium-term build priority;
   - one tactical experiment.

### Example post-match insight

```text
Your high press worked for 42 minutes, creating 5 turnovers and one try. After that, your two fastest defenders dropped below effective intensity and BLITZ attacked the space behind them three times. You may need either a lower press intensity or more endurance in your wide defenders.
```

## 6.5 Training & Progression Center

### Purpose

Close the loop after the report.

### Core components

1. **Team development goals**
   - improve wide defense;
   - improve passing under pressure;
   - improve kicking game;
   - improve late-game endurance;
   - stabilize goalkeeper concentration.

2. **Weekly training plan**
   - physical;
   - technical;
   - tactical;
   - defensive;
   - attacking;
   - recovery.

3. **Fatigue management**
   - expected recovery;
   - risk of overload;
   - players needing rest.

4. **Progression visualization**
   - attribute growth;
   - trait unlocks;
   - chemistry improvements;
   - role mastery.

5. **Assistant recommendations**
   - based on the last match;
   - based on next opponent;
   - based on long-term identity.

## 7. Metrics and analytics to expose

## 7.1 Team stats

### Basic

- score;
- possession;
- territory;
- shots / drops / attempts;
- tries;
- goals;
- turnovers;
- fouls;
- cards.

### Tactical

- entries into danger zones;
- progression success by zone;
- right/left/center attack share;
- defensive stops by zone;
- transition attacks created;
- rest defense failures;
- high press recoveries;
- block compactness score.

### Fatigue

- average condition by period;
- high-intensity load;
- late-match error count;
- fatigue-related turnovers;
- fatigue-related defensive delays;
- goalkeeper mental fatigue events.

### Synergy

- successful duo actions;
- distributor-to-runner chains;
- kicker-to-chaser recoveries;
- carrier-to-support continuations;
- defensive leader stabilization events.

## 7.2 Player stats

### Universal

- minutes;
- condition start/end;
- actions involved;
- successful actions;
- mistakes;
- contribution score;
- pressure score.

### Role-specific

**Goalkeeper**
- saves;
- handling errors;
- relaunch quality;
- positioning quality;
- late concentration events.

**Distributor**
- passes under pressure;
- line-breaking passes;
- bad decisions;
- tempo control.

**Carrier**
- carries;
- metres gained;
- contact wins;
- offloads;
- turnovers conceded.

**Defender**
- tackles;
- missed tackles;
- cover actions;
- forced errors;
- spacing reliability.

**Kicker / sniper**
- kicks attempted;
- territory gained;
- drops attempted/scored;
- conversions;
- long-range threat.

## 8. Insight generation rules

### 8.1 No unsupported claims

An insight must include evidence. The assistant should not say:

```text
You lost because your tactics were bad.
```

It should say:

```text
Your high press created 4 recoveries before minute 40, but also caused 7 late defensive delays after minute 55. The same channel conceded two scoring chances.
```

### 8.2 Confidence levels

Each insight should have a confidence level:

- **High**: repeated pattern with strong data.
- **Medium**: plausible pattern with enough signals.
- **Low**: weak signal, framed as hypothesis.

### 8.3 Recommendations should offer options

Bad:

```text
Train endurance.
```

Better:

```text
You have three options: lower your press, rotate your wide defenders earlier, or train endurance for your high-intensity players.
```

### 8.4 Explain trade-offs

Every recommendation should include the cost.

Example:

```text
Lowering your press will reduce fatigue risk, but you may recover fewer balls high up the field.
```

## 9. Coach Assistant levels

### Level 1 — Beginner

- simplified advice;
- fewer stats;
- clear recommendations;
- explanations of rules.

### Level 2 — Intermediate

- tactical diagnosis;
- match-up analysis;
- training options;
- more visible metrics.

### Level 3 — Expert

- advanced analytics;
- thresholds;
- full event log;
- custom comparison;
- tactical experiments.

## 10. Roadmap

## Phase 0 — Contract and cleanup

### Goal

Make sure the engine and UX are designed together.

### Tasks

1. Update the GDD to reflect the current target team structure.
2. Define official player roles.
3. Define official player attributes.
4. Define scoring rules.
5. Define `MatchEvent`.
6. Define `MatchSnapshot`.
7. Define `MatchReport`.
8. Define `CoachInsight`.
9. Add seed-based deterministic simulation.
10. Add a dev-only raw event viewer.

### Acceptance criteria

- A simulated match produces a valid event log.
- The event log can be replayed in chronological order.
- Each scoring event can be traced to prior events.
- The UI can display score, timeline and basic stats from the report.

## Phase 1 — Match Engine V1

### Goal

Simulate a full match with credible scoring, events and stats.

### Tasks

1. Zone model.
2. Possession model.
3. Action resolution by zone.
4. Player-vs-player and unit-vs-unit duels.
5. Basic fatigue.
6. Goalkeeper-specific logic.
7. Fouls and penalties.
8. Scoring: try, goal, drop, conversion.
9. Team stats.
10. Player stats.

### Acceptance criteria

- Results vary but remain plausible.
- Stronger teams win more often but not always.
- Fatigue affects late-game events.
- Different team identities produce different match shapes.

## Phase 2 — First visible coach experience

### Goal

Make the engine visible and understandable.

### Tasks

1. Basic Team Builder.
2. Basic Match Preparation page.
3. Match Center with live ticker and 2D zone map.
4. Post-Match Report V1.
5. Coach Insights V1.
6. Training suggestions V1.

### Acceptance criteria

- A player can understand why a match was won or lost.
- A player can identify at least one useful adjustment for the next match.
- The report highlights key players and key moments.

## Phase 3 — Advanced fatigue and anti-meta systems

### Goal

Make roster construction and tactical choices matter deeply.

### Tasks

1. Physical fatigue.
2. Technical fatigue.
3. Cognitive fatigue.
4. Goalkeeper mental fatigue.
5. Collective fatigue.
6. Weather and pitch effects.
7. Style-specific fatigue costs.
8. Anti-dominant-strategy tests.

### Acceptance criteria

- High press cannot dominate without trade-offs.
- Pure speed teams have clear weaknesses.
- Pure power teams have clear weaknesses.
- Goalkeeper fatigue creates late-match risk without feeling random.

## Phase 4 — Tactical depth

### Goal

Give the coach meaningful levers.

### Tasks

1. Offensive plans.
2. Defensive plans.
3. Transition plans.
4. Target zones.
5. Scoring bias.
6. Match-up board.
7. Opponent scouting.
8. Plan comparison.

### Acceptance criteria

- Different plans create visible match differences.
- The coach can exploit an opponent weakness.
- The post-match report evaluates the chosen plan.

## Phase 5 — Traits, synergies and identity

### Goal

Make teams and players memorable.

### Tasks

1. Automatic trait generation.
2. Trait badges.
3. Synergy detection.
4. Team identity label.
5. Chemistry links.
6. Player role mastery.
7. Narrative moments tied to traits.

### Acceptance criteria

- Players can describe their team identity.
- Certain player pairs become emotionally meaningful.
- Traits are visible in match events and reports.

## Phase 6 — Progression systems

### Goal

Turn match learning into long-term retention.

### Tasks

1. Weekly training.
2. Recovery planning.
3. Attribute progression.
4. Trait unlocks.
5. Staff / assistant layer.
6. Development goals.
7. Long-term fatigue and form.

### Acceptance criteria

- Post-match diagnostics influence training.
- Training choices have visible consequences.
- Players feel their squad evolves over time.

## Phase 7 — Social and scale

### Goal

Create community, rivalry and retention.

### Tasks

1. Private leagues.
2. Match report sharing.
3. Rivalry history.
4. Records and awards.
5. Season recap.
6. Coach profile.
7. Divisions.
8. Transfer market.

### Acceptance criteria

- Players discuss tactics outside the game.
- Reports are shareable and understandable.
- Rivalries create recurring emotional stakes.

## 11. Immediate backlog

### Must do now

1. Update the GDD with the current team format.
2. Create the `MatchEvent` schema.
3. Create the `MatchReport` schema.
4. Create the first event taxonomy.
5. Create the first zone model.
6. Implement deterministic match seeds.
7. Add raw event log output.
8. Create a basic report renderer.
9. Create a first Team Builder balance panel.
10. Create a first assistant insight generator from simple rules.

### Should do soon

1. Add fatigue categories.
2. Add goalkeeper-specific cognitive model.
3. Add tactical plans.
4. Add heatmap / territory map.
5. Add synergy detection.
6. Add training suggestions.

### Not now

1. Full transfer market.
2. Staff economy.
3. Deep career mode.
4. Stadium / infrastructure.
5. Full 3D match visualization.

## 12. Product risks

### Risk 1 — Black box engine

If the engine gives only a score and stats, players will feel the result is random.

**Mitigation:** event log, key moments, causal insights, replayable timeline.

### Risk 2 — Overwhelming analytics

If the UI shows too many metrics too soon, casual players will bounce.

**Mitigation:** progressive disclosure: beginner, intermediate, expert layers.

### Risk 3 — False explanations

If the assistant invents causes, trust collapses.

**Mitigation:** every insight must carry evidence and confidence.

### Risk 4 — Solved meta

If one strategy dominates, the game loses depth.

**Mitigation:** fatigue, environment, matchups, hidden information, trade-offs.

### Risk 5 — Weak emotional attachment

If players are just stat blocks, the game becomes a spreadsheet.

**Mitigation:** traits, moments, rivalries, progression, narrative reports.

## 13. Definition of success

A match is successful if the player can answer:

1. What was my plan?
2. What happened?
3. Why did it happen?
4. Which players mattered?
5. What should I change next?

A season is successful if the player can say:

1. My team has an identity.
2. My players have stories.
3. My choices had consequences.
4. I want to test a new plan next week.
```
