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

- Vision
- Hand Play
- Ball Carrying
- Foot Play
- Speed
- Power
- Endurance
- Composure
- Creativity

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

Z1 through Z7 are the open-field tactical zones. Z0 and Z8 exist as scoring-only virtual in-goal zones:
- Z0: left-side grounding zone;
- Z8: right-side grounding zone.

Z1 and Z7 are immediate scoring pressure zones. A try is created from those zones and grounded into Z0 or Z8 according to attacking direction.

Example:

```text
Z5-HSR
```

Spatial context strongly influences interaction outcomes.

## 5.1 Ball Context and Direction

Important interactions must receive explicit BallContext:
- ball location;
- ball-carrier role;
- possession team;
- attacking direction.

Logs should make these visible before major tactical actions.

Example:

```text
Ball: CONTROL Tempo Half in Z4-HSL.
CONTROL attacks from Z1 to Z7.
```

Direction must define whether a move is:
- progression;
- direct vertical attack;
- lateral circulation;
- backward recycle;
- weak-side switch;
- safety clearance.

## 5.2 Target Zone Attractiveness

Interactions that move possession should evaluate possible target zones from the current ball location.

Target attractiveness depends on:
- team instructions;
- team style;
- role tendency;
- pressure;
- chaos;
- weak side;
- compactness;
- territorial pressure;
- attacking direction.

The interaction should log the selected target and a short reason.

Example:

```text
Target zone evaluation:
- Z4-C: diagonal support, safe
- Z5-C: forward progression, medium risk
- Z3-HSL: backward recycle, safe but loses territory

Selected target: Z5-C.
Move type: PROGRESSION.
```

Weak side targets must be directionally plausible. A weak side behind the ball can still be used as a recycle or reset, but it should not be narrated as forward danger.

## 5.3 Tactical Principles in Target Selection

Target selection may use a tactical principles layer.

Attacking principles include:
- rest defense;
- five-corridor occupation;
- third-man support;
- staggered support;
- overload / underload;
- short-side and open-side threat;
- gain-line / front-foot-ball threat;
- recycle speed.

Defensive principles include:
- three-corridor compactness;
- axis protection;
- near-side closure;
- cover shadow;
- pressing trap quality;
- depth protection;
- counterpress readiness.

Target candidates should expose local tactical evidence when possible:
- local numbers;
- receiver availability;
- passing lane difficulty;
- support behind ball;
- whether the action attacks open side, short side, weak side, or overloaded side.

These principles are deterministic modifiers, not scripted actions.

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
- Goalkeeper / Free Safety
- Forward Leader

---

# Main Defensive Roles

- Mobile Lock
- Space Hunter
- Forward Leader

---

# Main Inputs

## Offensive

- Vision
- Hand Play
- Ball Carrying
- Speed
- Composure

## Defensive

- Vision
- Speed
- Power
- Composure

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
- Pivot and Pistons
- Goalkeeper / Free Safety

---

# Main Inputs

## Offensive

- Vision
- Hand Play
- Foot Play
- Composure

## Defensive

- Vision
- Speed
- Composure

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
- Goalkeeper / Free Safety
- Pivot and Pistons

---

# Main Inputs

## Offensive

- Speed
- Vision
- Ball Carrying
- Foot Play

## Defensive

- Speed
- Vision
- Power
- Composure

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
- Forward Leader
- Pivot

---

# Main Offensive Roles Under Pressure

- Tempo Half
- Playmaker
- Hook Link
- Goalkeeper / Free Safety

---

# Main Inputs

## Defensive

- Vision
- Speed
- Speed
- Endurance

## Offensive

- Vision
- Hand Play
- Composure
- Ball Carrying

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
| Goal | 3 |
| Try | 3 |
| Drop | 1 |
| Penalty | 1 |
| Conversion | 1 |

---

# Scoring Targets

TRY:
- created from the immediate scoring pressure zone;
- grounded in the virtual in-goal zone.

Examples:
- Team attacking Z1 to Z7 attempts from Z7 and grounds in Z8.
- Team attacking Z7 to Z1 attempts from Z1 and grounds in Z0.

DROP and PENALTY:
- target the area above the crossbar between the posts;
- use the goal frame centered on the C lane.

GOAL:
- targets the area below the crossbar inside the 8m frame;
- is only legal when the V0.1 finishing legality model explicitly allows an open-play goal context.

Goal-frame constants:
- width: 8 meters;
- post height: 10 meters;
- crossbar height: 2.5 meters.

Illegal finishing options must never be selected. They may appear only as rejected options with an explicit reason.

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
- Forward Leader
- Pivot

---

# Main Defensive Roles

- Goalkeeper / Free Safety
- Pivot and Pistons
- Mobile Lock

---

# Main Inputs

## Offensive

- Foot Play
- Ball Carrying
- Vision
- Composure

## Defensive

- Speed
- Vision
- Speed
- Composure

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
| Goal | +3 points |
| Try | +3 points |
| Drop | +1 point |
| Saved attempt | possession reset |
| Live rebound | chaos continuation |

---

# Finishing Report Requirements

Finishing logs should show:
- option legality;
- point value;
- scoring target;
- selected finishing type;
- conversion quality;
- defensive response;
- terminal result.

Try logs should name both the pressure zone and grounding target, for example:

```text
Try attempt from Z1-HSL toward Z0-HSL.
Grounding target: Z0-HSL.
Try scored: ball grounded in Z0-HSL.
```

Drop and penalty logs should name the goal-frame target:

```text
Kick target: above crossbar, centered on C lane.
Goal frame: 8m wide, crossbar 2.5m, posts 10m.
```

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
