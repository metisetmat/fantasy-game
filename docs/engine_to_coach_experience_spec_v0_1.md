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
