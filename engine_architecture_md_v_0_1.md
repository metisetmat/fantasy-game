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

---

## 8.2 Zone Example

```text
Z5-HSR
```

Meaning:
- Offensive pressure zone;
- Right half-space.

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