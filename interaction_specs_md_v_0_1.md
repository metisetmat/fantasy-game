# INTERACTION_SPECS.md

# Fantasy Game — Interaction Specifications V0.1

# 1. Purpose

This document defines the official MVP interaction specifications for the Fantasy Game simulation engine.

Interactions are the core building blocks of the engine.

The engine does NOT simulate:
- continuous physics;
- real-time movement.

Instead, it simulates:
- tactical situations;
- contextual decisions;
- collective structures;
- pressure;
- transitions;
- spatial manipulation.

Each interaction:
- consumes contextual inputs;
- evaluates offensive vs defensive capabilities;
- updates match state;
- updates tactical structures;
- generates events and narration.

---

# 2. Universal Interaction Model

All interactions follow the same global philosophy.

```text
offensive_capability
VS
contextual_pressure
VS
defensive_capability
+
variance
```

---

# 3. Contextual Inputs

Interactions may use:

## Individual Attributes

- Intelligence
- Hand Play
- Foot Play — Dribble
- Foot Play — Passing/Shooting
- Speed
- Agility
- Power
- Endurance
- Mental

---

## Collective Properties

- Cohesion
- Offensive Transition
- Defensive Transition
- Collective Mobility
- Tactical Discipline
- Collective Reading
- Resilience
- Collective Power

---

## Tactical Instructions

### Defensive

- Block Height
- Pressing Intensity
- Aggressiveness
- Marking Style

### Offensive

- Foot vs Hand Usage
- Risk Level
- Verticality
- Collectiveness

---

## Contextual Factors

- Pressure level
- Density
- Spatial occupation
- Weak side exposure
- Tempo
- Chaos level
- Fatigue
- Territorial control

---

# 4. Pressure Model

Pressure represents:
- available space;
- available time;
- defensive proximity;
- support quality.

---

## Pressure Levels

| Level | Description |
|---|---|
| Low | comfortable execution |
| Medium | tactical sweet spot |
| High | survival state |

---

# 5. Spatial Model Reminder

The engine uses:
- 7 longitudinal zones;
- 5 lateral corridors.

Example:

```text
Z5-HSR
```

Spatial context strongly influences interaction outcomes.

---

# 6. Interaction Lifecycle

Every interaction follows this sequence.

```text
Trigger
→ Actor Selection
→ Context Evaluation
→ Decision Selection
→ Resolution
→ State Updates
→ Event Generation
```

---

# 7. Actor Selection Philosophy

Actors are NOT fully deterministic.

Selection depends on:
- role;
- distance to action;
- tactical structure;
- freshness;
- tactical instructions;
- current momentum.

---

# 8. Interaction #1 — Build-Up Under Pressure

# Tactical Purpose

Ability to maintain or progress possession despite coordinated defensive pressure.

---

# Typical Situations

- low build-up;
- pressing trap;
- recycling under pressure;
- restart phase.

---

# Main Offensive Roles

- Hook Link
- Tempo Half
- Free Safety
- Forward Leader

---

# Main Defensive Roles

- Mobile Lock
- Space Hunter
- Power Runner

---

# Main Inputs

## Offensive

- Intelligence
- Hand Play
- Foot Play — Dribble
- Agility
- Mental

## Defensive

- Intelligence
- Speed
- Agility
- Mental

---

# Main Collective Properties

## Offensive

- Cohesion
- Collective Mobility
- Tactical Discipline
- Collective Reading

## Defensive

- Compression
- Pressing Synchronization
- Defensive Transition

---

# Offensive Decisions

- Short hand pass
- Short foot pass
- Dribble escape
- Long switch
- Clearance
- Individual duel

---

# Defensive Decisions

- Trap
- Pressure acceleration
- Support denial
- Weak side protection

---

# Main Outcomes

| Outcome | Effect |
|---|---|
| Clean exit | structure advantage |
| Controlled recycle | tempo stabilization |
| Forced clearance | territorial loss |
| Dangerous turnover | immediate transition |

---

# Fatigue Effects

High pressure:
- increases mental fatigue;
- increases technical errors;
- slows support quality.

---

# Narrative Examples

> “The Ravens resist the high press and find the weak side.”

> “Huge recovery near the 30-meter line after coordinated pressure.”

---

# 9. Interaction #2 — Offensive Construction

# Tactical Purpose

Structured progression against a stabilized defensive block.

---

# Philosophy

The attack attempts to:
- stretch the block;
- manipulate density;
- create weak sides;
- open interior lanes.

The defense attempts to:
- stay compact;
- protect the axis;
- deny diagonals.

---

# Main Offensive Roles

- Tempo Half
- Playmaker
- Hook Link
- Forward Leader

---

# Main Defensive Roles

- Mobile Lock
- Anchors
- Free Safety

---

# Main Inputs

## Offensive

- Intelligence
- Hand Play
- Foot Play — Passing
- Mental

## Defensive

- Intelligence
- Agility
- Mental

---

# Main Collective Properties

## Offensive

- Cohesion
- Collective Mobility
- Collective Reading
- Tactical Discipline

## Defensive

- Compression
- Tactical Discipline
- Resilience

---

# Offensive Decisions

- Side circulation
- Long switch
- Interior progression
- Fixation duel
- Recycling

---

# Defensive Decisions

- Sliding
- Axis compression
- Passive block
- Local overload

---

# Main Outcomes

| Outcome | Effect |
|---|---|
| Block stretched | transition danger |
| Territorial progression | sustained pressure |
| Stalled possession | frustration |
| Interception | counter opportunity |

---

# Fatigue Effects

Long possessions:
- fatigue defensive concentration;
- fatigue repeated block movements.

---

# Narrative Examples

> “The Falcons install a long possession phase in the offensive third.”

> “The Titans remain extremely compact despite continuous pressure.”

---

# 10. Interaction #3 — Offensive Transition

# Tactical Purpose

Immediate exploitation of defensive imbalance after possession recovery.

---

# Philosophy

Transition is:
- fast;
- vertical;
- opportunistic;
- emotionally explosive.

---

# Transition Window

Transitions have a temporary vulnerability window.

Suggested duration:

```text
2–6 tactical ticks
```

---

# Main Offensive Roles

- Space Hunter
- Playmaker
- Forward Leader
- Tempo Half

---

# Main Defensive Roles

- Mobile Lock
- Free Safety
- Anchors

---

# Main Inputs

## Offensive

- Speed
- Intelligence
- Agility
- Foot Play — Passing/Shooting

## Defensive

- Speed
- Intelligence
- Agility
- Mental

---

# Main Collective Properties

## Offensive

- Offensive Transition
- Collective Reading
- Collective Mobility
- Cohesion

## Defensive

- Defensive Transition
- Resilience
- Tactical Discipline

---

# Offensive Decisions

- Immediate vertical attack
- Weak side switch
- Fast shot
- Support progression
- Controlled recycle

---

# Defensive Decisions

- Tactical foul
- Emergency retreat
- Axis compression
- Delay duel

---

# Main Outcomes

| Outcome | Effect |
|---|---|
| Explosive transition | huge danger |
| Controlled transition | structured attack |
| Delayed transition | defensive recovery |
| Turnover in chaos | reverse transition |

---

# Fatigue Effects

Transitions are highly demanding.

They heavily consume:
- speed;
- acceleration;
- recovery runs;
- emergency structure rebuild.

---

# Narrative Examples

> “Interception in midfield! The Wolves immediately attack the right corridor.”

> “Huge defensive recovery from the Mobile Lock.”

---

# 11. Interaction #4 — Coordinated Pressing

# Tactical Purpose

Collective attempt to reduce space and time in order to force mistakes.

---

# Philosophy

Pressing is:
- collective;
- spatial;
- synchronized;
- structure-dependent.

It is NOT simple player chasing.

---

# Main Defensive Roles

- Mobile Lock
- Space Hunter
- Power Runner
- Forward Leader

---

# Main Offensive Roles Under Pressure

- Tempo Half
- Playmaker
- Hook Link
- Free Safety

---

# Main Inputs

## Defensive

- Intelligence
- Agility
- Speed
- Endurance

## Offensive

- Intelligence
- Hand Play
- Mental
- Agility

---

# Main Collective Properties

## Defensive

- Cohesion
- Tactical Discipline
- Collective Mobility
- Defensive Transition

## Offensive

- Cohesion
- Collective Reading
- Resilience

---

# Defensive Decisions

- High pressure
- Passing lane denial
- Side trap
- Delayed pressure

---

# Offensive Decisions

- Fast circulation
- Long switch
- Support relay
- Individual escape
- Clearance

---

# Main Outcomes

| Outcome | Effect |
|---|---|
| High recovery | immediate danger |
| Forced backward play | territorial gain |
| Press broken | exposed structure |
| Catastrophic press failure | huge weak side exposure |

---

# Fatigue Effects

Pressing is one of the most exhausting systems.

It heavily impacts:
- freshness;
- coordination;
- repeated accelerations.

---

# Narrative Examples

> “The Wolves completely trap the Ravens near the sideline.”

> “The Playmaker breaks the first pressing wave and immediately attacks the weak side.”

---

# 12. Interaction #5 — Finishing

# Tactical Purpose

Attempt to convert dangerous situations into points.

---

# Scoring Types

| Type | Points |
|---|---|
| Goal | 2 |
| Try | 2 |
| Drop | 1 |
| Conversion | 1 |

---

# Philosophy

Finishing is the consequence of:
- space creation;
- transitions;
- block manipulation;
- territorial pressure.

---

# Main Offensive Roles

- Playmaker
- Space Hunter
- Power Runner
- Forward Leader

---

# Main Defensive Roles

- Free Safety
- Anchors
- Mobile Lock

---

# Main Inputs

## Offensive

- Foot Play — Passing/Shooting
- Agility
- Intelligence
- Mental

## Defensive

- Agility
- Intelligence
- Speed
- Mental

---

# Main Collective Properties

## Offensive

- Collective Reading
- Cohesion
- Offensive Transition
- Resilience

## Defensive

- Compression
- Resilience
- Tactical Discipline

---

# Offensive Decisions

- Quick shot
- Drop
- Try attempt
- Final switch
- Recycle possession

---

# Defensive Decisions

- Aggressive challenge
- Axis protection
- Weak side denial
- Goal protection

---

# Main Outcomes

| Outcome | Effect |
|---|---|
| Goal | +2 points |
| Try | +2 points |
| Drop | +1 point |
| Saved attempt | possession reset |
| Live rebound | chaos continuation |

---

# Rebound Philosophy

Rebounds remain highly dangerous.

Unlike football:
- the ball often stays alive;
- transitions may instantly restart;
- chaos situations are common.

---

# Fatigue Effects

Fatigue reduces:
- technical precision;
- decision making;
- timing;
- reaction speed.

Late matches should naturally create:
- more space;
- more mistakes;
- more chaos.

---

# Narrative Examples

> “Beautiful weak side switch. The Space Hunter finishes easily.”

> “The Playmaker punishes the passive block with a superb drop from distance.”

---

# 13. Global Interaction Success Criteria

The interaction system succeeds if:
- tactical styles are recognizable;
- weak sides emerge naturally;
- transitions feel dangerous;
- pressing creates real tension;
- fatigue regulates excessive aggression;
- several offensive philosophies remain viable.

---

# 14. Global Failure Conditions

The interaction system fails if:
- all teams behave similarly;
- pressure has no visible impact;
- weak sides never appear;
- fatigue feels artificial;
- transitions are either harmless or unstoppable;
- interactions feel random.
