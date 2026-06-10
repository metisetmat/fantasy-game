# AGENTS.md

# Fantasy Game — Codex Agent Instructions V0.1

# 1. Purpose

This document defines the development philosophy, coding rules, architectural constraints, and behavioral expectations for AI coding agents working on the Fantasy Game simulation engine.

The goal is to ensure:
- consistency;
- maintainability;
- tactical readability;
- systemic coherence.

This project is NOT a traditional sports game.

The engine must prioritize:
- tactical emergence;
- contextual interactions;
- readable simulation;
- believable match stories.

---

# 2. Core Design Philosophy

# 2.1 Tactical Simulation First

The engine simulates:
- tactical situations;
- collective structures;
- pressure;
- transitions;
- space occupation.

The engine does NOT simulate:
- real-time physics;
- precise movement coordinates;
- animation systems;
- frame-by-frame gameplay.

---

# 2.2 Emergence Over Scripting

Prefer:
- contextual systems;
- interaction-driven outcomes;
- dynamic structures;
- probabilistic tactical behavior.

Avoid:
- hardcoded scenarios;
- role-specific hacks;
- scripted sequences;
- deterministic match flows.

---

# 2.3 Readability Over Complexity

The simulation must remain:
- understandable;
- observable;
- explainable.

Avoid unnecessary complexity.

The engine should produce:
- coherent tactical patterns;
- recognizable styles;
- believable momentum shifts.

---

# 2.4 Data-Driven Architecture

Prefer:
- configuration files;
- data-driven balancing;
- reusable systems.

Avoid:
- magic values inside systems;
- duplicated balancing logic;
- hardcoded team behaviors.

---

# 3. Technical Constraints

# Official V0.1 Stack

- TypeScript
- Node.js
- JSON-based data
- Console-first execution

No frontend required.

No networking required.

No database required.

---

# 4. Coding Standards

# 4.1 TypeScript Rules

Mandatory:

- strict TypeScript mode
- no any
- explicit interfaces
- explicit return types for exported functions

Avoid:
- dynamic typing shortcuts
- implicit state mutations
- hidden side effects

---

# 4.2 Function Philosophy

Prefer:
- pure functions;
- deterministic utilities;
- composable systems.

Functions should:
- do one thing;
- remain testable;
- remain readable.

---

# 4.3 Naming Conventions

Use clear tactical naming.

Good examples:

```ts
resolveOffensiveTransition()
calculatePressureLevel()
updateDensityMap()
```

Avoid vague names.

Bad examples:

```ts
handleStuff()
doAction()
computeData()
```

---

# 4.4 System Isolation

Each tactical system must remain isolated.

Examples:

- fatigue system;
- pressure system;
- interaction resolver;
- spatial system;
- reporting system.

Systems communicate through:
- state updates;
- shared interfaces;
- contextual inputs.

Avoid hidden cross-dependencies.

---

# 5. Engine Philosophy

# 5.1 Abstract Tactical Terrain

The engine uses:
- abstract tactical zones;
- NOT physical coordinates.

Do NOT implement:
- pathfinding;
- continuous movement;
- physics simulations.

Spatial logic is based on:
- influence;
- density;
- structure;
- compactness;
- weak sides.

---

# 5.2 Tactical Ticks

The engine simulates:
- tactical moments;
- not every second.

A tactical tick represents:
- a tactical decision;
- a structural adjustment;
- an interaction phase.

Avoid real-time assumptions.

---

# 5.3 Interactions Drive the Match

The match evolves through:
- contextual interactions;
- state transitions;
- tactical consequences.

Core MVP interactions:

- Build-Up Under Pressure
- Offensive Construction
- Offensive Transition
- Coordinated Pressing
- Finishing

Do NOT bypass interaction systems.

---

# 5.4 Collective Properties Are Emergent

Collective properties are NOT static ratings.

They emerge from:
- player attributes;
- tactical instructions;
- fatigue;
- structure;
- cohesion.

Avoid hardcoded collective bonuses.

---

# 6. Fatigue Philosophy

Fatigue is a core balancing system.

Fatigue must impact:
- technical execution;
- tactical structure;
- support quality;
- pressing efficiency;
- decision making.

High-intensity playstyles must naturally generate:
- exhaustion;
- instability;
- increased errors.

Avoid artificial stamina systems.

---

# 7. Spatial Philosophy

# 7.1 Compactness

Defensive structures prioritize:
- axis protection;
- compactness;
- synchronized sliding.

---

# 7.2 Offensive Width

Offensive structures prioritize:
- width;
- weak side creation;
- diagonal support;
- stretching defensive blocks.

---

# 7.3 Weak Sides Must Exist

Weak sides are critical.

Block movements must:
- create temporary spatial vulnerabilities;
- generate exploitable spaces.

Avoid instantaneous structural repositioning.

# 7.4 Ball Context and Spatial Intention

When implementing spatial or interaction systems, keep BallContext explicit.

Important tactical logs should identify:
- ball carrier role;
- ball location;
- attacking direction;
- intended target zone;
- move type;
- reason the target was selected.

Target zones must be selected through contextual tactical attractiveness when possible, not only fixed neighbor rules. Direction matters: the same zone change can be progression for one team and backward recycle for the other.

---

# 8. Match Narrative Philosophy

Reports are a core gameplay feature.

Generated events must:
- describe tactical situations;
- reference spatial dynamics;
- explain momentum shifts;
- remain readable.

Avoid:
- overly technical prose;
- generic meaningless commentary.

Good example:

> “The Falcons exploit the weak side after breaking the first pressing wave.”

Bad example:

> “Player passes the ball.”

---

# 9. Balancing Philosophy

No tactical philosophy should dominate permanently.

The engine must support:
- multiple viable styles;
- strengths and weaknesses;
- matchup dependencies;
- fatigue regulation.

Avoid dominant meta systems.

---

# 10. V0.1 Scope Restrictions

OUT OF SCOPE:

- transfer market
- progression systems
- injuries
- weather
- multiplayer networking
- visual rendering
- physics engine
- economy systems
- advanced AI coaching

Avoid implementing future systems early.

---

# 11. Development Priorities

Prioritize:

1. readability
2. interaction quality
3. tactical coherence
4. observability
5. emergence
6. balancing

Visual polish is irrelevant for V0.1.

---

# 12. Testing Philosophy

The engine must support:
- batch simulations;
- match logging;
- tactical report generation;
- statistical analysis.

The prototype will be validated primarily through:
- reading reports;
- analyzing tactical patterns;
- detecting emergent behaviors.

---

# 13. Logging Requirements

Every major interaction should generate:
- interaction type;
- involved roles;
- spatial context;
- pressure level;
- result;
- tactical consequences.

Logs must remain readable.

---

# 14. Preferred Architecture Style

Prefer:
- small systems;
- modular resolvers;
- composable utilities;
- explicit state transitions.

Avoid:
- giant god classes;
- monolithic match resolvers;
- hidden mutable state.

---

# 15. Success Criteria

The prototype succeeds if:
- tactical styles are recognizable;
- reports tell believable stories;
- fatigue regulates aggression;
- transitions feel dangerous;
- weak sides emerge naturally;
- users want to experiment tactically.

---

# 16. Failure Conditions

The prototype fails if:
- all teams behave similarly;
- interactions feel random;
- pressure has no impact;
- fatigue feels artificial;
- spatial play is irrelevant;
- tactical styles are unreadable.

---

# 17. Final Guiding Principle

Always prioritize:

```text
Readable tactical emergence
OVER
simulation complexity
```

The engine should create:
- understandable matches;
- believable tactical dynamics;
- emotionally engaging stories.
