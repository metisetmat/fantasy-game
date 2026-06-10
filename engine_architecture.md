# ENGINE_ARCHITECTURE.md

# Fantasy Game — Engine Architecture V0.1

# 1. Purpose

This document defines the technical architecture of the Fantasy Game simulation engine.

The goal of V0.1 is NOT to build a full game.

The goal is to build:
- a readable tactical simulation engine;
- capable of producing believable matches;
- generating coherent tactical reports;
- allowing large-scale balancing simulations.

The engine is designed around:
- tactical interactions;
- spatial control;
- fatigue;
- transitions;
- emergent collective behaviors.

---

# 2. Core Philosophy

## 2.1 Tactical simulation, not physical simulation

The engine does NOT simulate:
- continuous movement;
- real-time physics;
- precise coordinates;
- animations.

The engine simulates:
- tactical situations;
- collective structures;
- interactions;
- pressure;
- space occupation;
- decision making.

---

## 2.2 Emergent systems first

The engine should prioritize:
- emergence;
- contextual interactions;
- tactical readability;
- systemic balance.

Avoid:
- hardcoded scripted sequences;
- role-specific hacks;
- unrealistic deterministic logic.

---

## 2.3 Readability over realism

The primary success criteria are:
- readability;
- interpretability;
- tactical credibility;
- emotional coherence.

The engine does NOT need to perfectly simulate reality.

It must produce:
- understandable dynamics;
- recognizable styles;
- believable tactical stories.

---

# 3. Technical Stack

## Official V0.1 Stack

- TypeScript
- Node.js
- JSON data-driven architecture
- Console-first prototype

No frontend required for V0.1.

No database required for V0.1.

---

# 4. High-Level Engine Loop

The engine works as a sequence-based tactical simulation.

Main loop:

```text
match_start
→ sequence_generation
→ interaction_resolution
→ state_updates
→ event_generation
→ next_sequence
→ match_end
```

---

# 5. Match Flow

A match is composed of:
- sequences;
- interactions;
- state transitions.

Example:

```text
Sequence
→ Build-up
→ Pressing
→ Transition
→ Finishing
→ Goal
→ Reset
```

---

# 6. Tactical Tick Philosophy

The engine does NOT simulate every second.

Instead, it simulates:
- tactical moments;
- interaction windows;
- structural evolutions.

A tactical tick represents:
- a decision;
- a pressure phase;
- a structural adjustment;
- an interaction outcome.

---

# 7. Core Engine States

# 7.1 MatchState

Represents the global state of the match.

## Responsibilities

- current score;
- current time;
- possession;
- current sequence;
- match tempo;
- global chaos level;
- momentum state;
- event history.

---

## Suggested Structure

```ts
interface MatchState {
  time: number;
  score: ScoreState;
  possessionTeamId: string;
  currentSequence: SequenceState;
  tempo: number;
  chaos: number;
  momentum: MomentumState;
  events: MatchEvent[];
}
```

---

# 7.2 TeamState

Represents the collective state of a team.

## Responsibilities

- tactical identity;
- collective properties;
- structure;
- fatigue trends;
- territorial control;
- tactical instructions.

---

## Suggested Structure

```ts
interface TeamState {
  id: string;
  name: string;
  players: PlayerState[];
  tacticalStyle: TacticalStyle;
  collectiveProperties: CollectiveProperties;
  tacticalInstructions: TacticalInstructions;
  territorialControl: TerritorialControl;
}
```

---

# 7.3 PlayerState

Represents the individual state of a player.

## Responsibilities

- attributes;
- role;
- fatigue;
- current freshness;
- current spatial influence;
- momentum.

---

## Suggested Structure

```ts
interface PlayerState {
  id: string;
  name: string;
  role: PlayerRole;
  attributes: PlayerAttributes;
  fatigue: number;
  freshness: number;
  currentZone: ZoneId;
}
```

---

# 7.4 TacticalState

Represents spatial organization.

## Responsibilities

- block compactness;
- width occupation;
- weak side exposure;
- defensive structure;
- offensive structure;
- density map.

---

## Suggested Structure

```ts
interface TacticalState {
  attackingShape: ShapeState;
  defensiveShape: ShapeState;
  densityMap: DensityMap;
  weakSideExposure: number;
}
```

---

# 7.5 SequenceState

Represents the current tactical sequence.

## Responsibilities

- sequence type;
- current danger level;
- pressure level;
- transition state;
- involved players;
- current zone.

---

## Suggested Structure

```ts
interface SequenceState {
  type: SequenceType;
  dangerLevel: number;
  pressureLevel: number;
  activeZone: ZoneId;
  involvedPlayers: string[];
}
```

---

# 8. Terrain Model

## 8.1 Abstract Tactical Terrain

The engine uses:
- abstract tactical zones;
- NOT physical coordinates.

The terrain is divided into:
- 7 longitudinal zones;
- 5 lateral corridors.

The tactical grid remains Z1 through Z7 for open-field spatial logic. Scoring adds two virtual grounding zones:
- Z0: left-side in-goal / grounding zone;
- Z8: right-side in-goal / grounding zone.

Z0 and Z8 are scoring-space concepts, not new physical tracking coordinates. They clarify where a try is grounded while keeping the core 7x5 tactical terrain stable.

---

## 8.2 Zone Example

```text
Z5-HSR
```

Meaning:
- Offensive pressure zone;
- Right half-space.

---

## 8.3 Scoring Space and Goal Frame

Z1 and Z7 are immediate scoring pressure zones. They are not the in-goal zones.

Directional scoring model:
- A team attacking from Z1 to Z7 creates try pressure in Z7 and grounds in Z8.
- A team attacking from Z7 to Z1 creates try pressure in Z1 and grounds in Z0.

The goal frame is centered on the C lane on the in-goal line:
- between Z1-C and Z0-C on the left side;
- between Z7-C and Z8-C on the right side.

V0.1 goal-frame constants:
- goal width: 8 meters;
- post height: 10 meters;
- crossbar height: 2.5 meters.

Interpretation:
- below the crossbar between the posts is the goal/net area;
- above the crossbar between the posts is the target for drops and penalties.

---

# 9. Spatial Philosophy

Teams do NOT occupy exact positions.

Teams generate:
- spatial influence;
- density;
- compactness;
- weak sides;
- territorial pressure.

Spatial structures must evolve dynamically.

## 9.1 Ball Context

Every tactical interaction that moves or protects possession must know the current BallContext.

BallContext includes:
- ballLocation: the current abstract tactical cell;
- ballCarrierRole: the role currently organizing or carrying the ball;
- possessionTeamId: the team in possession;
- attackingDirection: the direction that team attacks.

The engine still uses abstract zones, not coordinates. BallContext exists only to make tactical intent and logs coherent.

Example:

```ts
interface BallContext {
  ballLocation: ZoneId;
  ballCarrierRole: PlayerRole;
  possessionTeamId: TeamId;
  attackingDirection: AttackingDirection;
}
```

## 9.2 Attacking Direction

Teams must not all be assumed to attack from the same side.

For the V0.1 mini-match harness:
- Team A attacks from Z1 to Z7;
- Team B attacks from Z7 to Z1.

Directional logic influences:
- progression;
- backward recycling;
- direct vertical attacks;
- weak-side switches;
- target zone selection;
- readable ball movement logs.

Example:
- Z4-C to Z5-C is progression for a team attacking Z1 to Z7.
- Z4-C to Z3-C is backward recycle for that same team.

## 9.3 Tactical Spatial Intention

Target zones should not be selected only by fixed neighboring zones.

From the current ball zone, the engine evaluates contextual target zone attractiveness. This attractiveness depends on:
- attacking direction;
- verticality;
- risk level;
- collectiveness;
- foot vs hand usage;
- current pressure;
- chaos;
- weak side exposure;
- defensive compactness;
- territorial pressure;
- team style;
- ball-carrier role tendency.

This keeps target zones readable as tactical choices instead of mechanical jumps.

## 9.4 Sequence Spatial Continuity

Mini-match sequences should inherit lightweight spatial context from the previous sequence:
- last ball location;
- last possession team;
- last territorial pressure;
- last chaos level;
- last danger level.

This is not a full match clock or possession engine. It is a minimal continuity layer so a new sequence begins in a tactically related place instead of an arbitrary zone.

---

# 10. Core Interactions

V0.1 officially supports 5 MVP interactions.

| Interaction | Purpose |
|---|---|
| Build-up under pressure | structure |
| Offensive construction | control |
| Offensive transition | vertical danger |
| Coordinated pressing | defensive pressure |
| Finishing | scoring |

Each interaction:
- consumes context;
- evaluates offensive vs defensive capabilities;
- updates spatial states;
- generates events.

---

# 10.1 Tactical Principles Layer

The engine includes a tactical principles layer that converts collective football/rugby ideas into deterministic decision modifiers.

It evaluates:
- attacking occupation and five-corridor stretch;
- rest defense and security behind the ball;
- third-man and staggered support;
- overload / underload;
- short side, open side, weak side, and overloaded side;
- defensive three-corridor compactness;
- axis protection;
- cover shadows;
- pressing trap quality;
- counterpress readiness;
- gain-line / front-foot-ball pressure;
- recycle speed and abstract contact dominance estimates.

These are not scripted plays. They are context modifiers produced from current team structure, BallContext, side context, pressure, compactness, player zones, tactical instructions, and collective properties.

The layer must stay abstract:
- no physics;
- no animation;
- no full ruck simulation;
- no exact coordinate tracking.

---

# 11. Universal Resolution Philosophy

All interactions follow the same core logic.

```text
Offensive contextual capability
-
Defensive contextual capability
+
Contextual variance
```

---

# 12. Contextual Capability

A capability depends on:
- player attributes;
- role influence;
- collective properties;
- tactical instructions;
- fatigue;
- pressure;
- spatial context.

---

# 13. Fatigue System

## 13.1 Two-layer fatigue model

The engine distinguishes:

| Layer | Description |
|---|---|
| Accumulated fatigue | long-term wear |
| Freshness | short-term energy |

---

## 13.2 Fatigue Sources

- high-intensity runs;
- transitions;
- impacts;
- pressing;
- repeated structural adjustments.

---

## 13.3 Fatigue Consequences

Fatigue impacts:
- technical execution;
- support quality;
- mobility;
- pressing;
- structure;
- decision making.

---

# 14. Tempo System

Tempo represents:
- interaction speed;
- transition intensity;
- structural instability.

High tempo increases:
- chaos;
- fatigue;
- variance.

Low tempo increases:
- control;
- structure;
- territorial management.

---

# 15. Collective Properties

Collective properties are emergent.

They are NOT directly assigned.

They emerge from:
- player attributes;
- roles;
- fatigue;
- tactical coherence;
- collective structure.

---

## Main Collective Properties

- Cohesion
- Offensive Transition
- Defensive Transition
- Collective Mobility
- Tactical Discipline
- Collective Reading
- Resilience
- Collective Power

---

# 16. Tactical Instructions

Instructions are sliders.

They define tendencies.

The engine adapts dynamically according to context.

---

## Defensive Instructions

- Block Height
- Pressing Intensity
- Aggressiveness
- Marking Style

---

## Offensive Instructions

- Foot vs Hand Usage
- Risk Level
- Verticality
- Collectiveness

---

# 17. Event System

The engine must generate:
- highlights;
- tactical events;
- statistics;
- assistant coach analysis.

---

## Event Philosophy

Events should:
- describe tactical situations;
- explain momentum;
- reference spatial concepts;
- remain readable.

---

# 18. Reporting Philosophy

Reports are a core gameplay feature.

The user must be able to:
- visualize the match mentally;
- understand tactical dynamics;
- identify strengths and weaknesses;
- imagine adjustments.

## 18.1 Debug Report Blocks

Deep tactical reports should group important actions into readable blocks:
- Action Context;
- {ATTACKING_TEAM} Attacking Team Reasoning;
- {DEFENDING_TEAM} Defensive Structural Reading;
- Shared Tactical Context;
- {ATTACKING_TEAM} Attacking Principles;
- {DEFENDING_TEAM} Defensive Principles;
- Player-Derived Trace split into {ATTACKING_TEAM} Player Trace and {DEFENDING_TEAM} Player Trace;
- Comparative Resolution.

Numerical claims should name team ownership. For example, prefer "CONTROL support behind ball: 6 players" and
"CONTROL overload in Z5-C: 2 attackers vs 1 BLITZ defender" over ownerless counts.

Key tactical claims may include lightweight data-origin labels:
- [CALCULATED] direct engine state;
- [ESTIMATED] abstract tactical estimate;
- [NARRATIVE] explanatory wording.

## 18.2 Tactical Snapshots

The report may include static SVG tactical snapshots for calibration. These snapshots are abstract tactical estimates generated from zone and state data.

They are not:
- animation;
- physical tracking;
- coordinate simulation;
- pathfinding output.

They may show Z0 through Z8, lane labels, ball location, selected target zone, weak-side estimates, and abstract player-role markers.

Snapshot rendering must use PlayerMatchState as its source of truth. Every before/after SVG should render:
- 10 CONTROL player nodes;
- 10 BLITZ player nodes;
- exactly one ball marker;
- visible player initials for every role.

When multiple players occupy the same tactical cell, the renderer should use deterministic offsets inside the cell so no player fully hides another. Snapshot reports should include render validation counts and warnings.

Snapshot legend:
- blue = CONTROL;
- red = BLITZ;
- yellow marker = ball;
- D = delayed;
- R = recovering;
- E = eliminated;
- S = supporting;
- P = pressing;
- C = covering.

---

# 18.3 Official Source Hierarchy

Official terminology follows this hierarchy:

1. Gameplay docs
2. Glossary
3. Roster docs
4. Interaction specs
5. Prompts/examples

Prompts and examples must not redefine official gameplay concepts. If a prompt conflicts with the gameplay docs or glossary, the gameplay docs and glossary win.

---

# 19. V0.1 Scope Restrictions

The following systems are OUT OF SCOPE for V0.1.

- transfer market;
- player progression;
- injuries;
- weather;
- economy;
- contracts;
- multiplayer networking;
- visual rendering;
- physics engine.

---

# 20. V0.1 Success Criteria

The engine succeeds if:
- tactical styles are recognizable;
- matches tell believable stories;
- fatigue regulates dominant strategies;
- several tactical philosophies remain viable;
- reports are understandable;
- users want to experiment tactically.

---

# 21. Development Philosophy

Build the engine incrementally.

Prioritize:
- readability;
- emergence;
- systemic interactions;
- observability.

Avoid premature complexity.

The prototype should remain:
