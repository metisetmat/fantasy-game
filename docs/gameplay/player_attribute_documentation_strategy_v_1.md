# Fantasy Game — Player Attribute Documentation Strategy

## Why This Matters

The engine is now becoming deep enough that documentation drift is a major risk.

Without a clear contract between:
- gameplay design;
- simulation systems;
- tactical principles;
- UI/UX;
- player creation;
- balancing;
- future AI coaching;

…the project risks:
- attribute inflation;
- duplicate concepts;
- hidden contradictions;
- impossible balancing;
- unusable roster creation.

The goal is therefore:

> Keep the coach-facing system simple while allowing the simulation engine to remain rich internally.

---

# Core Design Rule

## IMPORTANT

The coach manipulates:
- a SMALL number of understandable attributes.

The engine internally derives:
- many tactical/systemic behaviors.

This distinction must become an official architectural principle.

---

# Official Attribute Architecture

The documentation should explicitly separate:

| Layer | Audience | Purpose |
|---|---|---|
| Visible Attributes | Coach | Team building gameplay |
| Role Archetypes | Coach + Engine | Tactical identity |
| Derived Tactical Attributes | Engine | Simulation depth |
| Match States | Engine | Dynamic runtime behavior |

---

# 1. Visible Coach Attributes (Official V1)

## Design Goals

Visible attributes must:
- be understandable instantly;
- create meaningful tradeoffs;
- remain low in number;
- generate many emergent behaviors;
- stay stable long-term.

Target:
- 8 to 10 maximum.

---

# Official Visible Attributes

## Physical

| Attribute | Meaning |
|---|---|
| Speed | Movement speed and acceleration |
| Power | Duel/contact dominance |
| Endurance | Fatigue resistance and recovery |

---

## Technical

| Attribute | Meaning |
|---|---|
| Hand Play | Passing, receiving, offloads, ball control with hands |
| Foot Play | Shots, drops, penalties, clearances, long kicks |
| Ball Carrying | Ball-at-feet carrying, dribbling, and small-space foot control only |

---

## Tactical / Decision

| Attribute | Meaning |
|---|---|
| Vision | Tactical reading, support detection, spacing |
| Composure | Calmness under pressure and finishing control |
| Creativity | Improvisation, unpredictability, tactical indiscipline |

---

# Creativity Principle

Creativity is intentionally dual-purpose.

High creativity means:
- more improvisation;
- more chaos creation;
- more difficult actions attempted;
- more line-breaking potential;
- less structural discipline.

Low creativity means:
- more tactical stability;
- more structure preservation;
- safer decisions;
- cleaner support behavior.

This is an intentional tradeoff.

The engine should derive tactical discipline partially from the inverse of creativity.

---

# 2. Role Archetypes

Visible attributes alone do NOT define behavior.

Behavior emerges from:
- visible attributes;
- role archetype modifiers;
- tactical philosophy;
- match context.

---

# Example

## Tempo Half

The role naturally values:
- Vision;
- Composure;
- Hand Play.

The engine therefore derives:
- support timing;
- spacing;
- press reading;
- progression timing.

Even if two players share identical visible attributes,
Tempo Half and Space Hunter should behave differently.

---

# Official Rule

Roles are NOT cosmetic.

Roles:
- shape tactical interpretation;
- influence movement;
- alter risk tolerance;
- alter support behavior;
- influence transition logic.

---

# 3. Derived Tactical Attributes (Engine Only)

These values are NOT directly editable by coaches.

They are derived internally from:
- visible attributes;
- role archetypes;
- tactical philosophy;
- momentum;
- fatigue;
- support structure;
- match context.

---

# Example Derived Attributes

| Derived Attribute | Derived From |
|---|---|
| Support Timing | Vision + Composure + Role |
| Tactical Discipline | Inverse Creativity + Role |
| Spacing Quality | Vision + Composure |
| Press Reading | Vision + Experience |
| Scramble Ability | Creativity + Ball Carrying |
| Offload Quality | Hand Play + Creativity |
| Long-Play Quality | Foot Play + Vision |
| Contact Survival | Power + Balance |
| Transition Recovery | Endurance + Tactical Discipline |
| Chaos Tolerance | Creativity + Composure |

---

# Important Rule

Derived attributes should remain:
- inspectable in debug reports;
- invisible in normal roster creation.

This preserves:
- gameplay readability;
- simulation depth.

---

# 4. Team Identity Emergence

## Critical Principle

Teams do NOT directly possess personalities.

Instead:
- player attributes;
- role archetypes;
- tactical instructions;
- collective synergies;

combine to create emergent team identity.

---

# Example

CONTROL is NOT:
"a structured team because the engine says so."

CONTROL becomes structured because:
- players have high Vision;
- players have high Composure;
- players have lower Creativity;
- support timing emerges naturally;
- rest defense remains intact;
- spacing quality stays high.

---

# BLITZ Example

BLITZ becomes chaotic because:
- players have high Creativity;
- players attack depth aggressively;
- players accept structural instability;
- support timing becomes less reliable;
- transitions become explosive.

---

# 5. Goalkeeper Rule

The sport officially includes:
- a goalkeeper role.

Each team has exactly one goalkeeper.

The goalkeeper:
- is the only player on that team allowed to use hands inside their own defensive goal area;
- behaves as a normal field participant outside that area;
- protects the goal frame;
- controls rebounds and loose balls;
- participates in depth protection.

---

# Goalkeeper Core Attributes

Important attributes:
- Composure;
- Vision;
- Hand Play;
- Foot Play;
- Positioning (derived);
- Reflexes (derived);
- Aerial Reach (derived).

---

# Goalkeeper Tactical Identity

The goalkeeper is NOT merely:
- a stronger Free Safety.

The goalkeeper:
- influences pressing risk;
- changes finishing probabilities;
- controls long clearances;
- alters transition security;
- shapes defensive depth.

---

# 6. Snapshot Design Rules

Snapshots must:
- display all players;
- reflect PlayerMatchState;
- show tactical roles clearly;
- remain abstract tactical diagrams;
- NOT pretend to be exact physics simulations.

---

# Important Snapshot Rule

Snapshots are:
- tactical estimates;
- not tracking data.

This must remain documented to avoid false realism.

---

# 7. Anti-Complexity Rule

## Extremely Important

The engine may become highly complex internally.

The coach-facing layer must remain:
- elegant;
- understandable;
- emotionally readable.

The project must avoid:
"brilliant simulator, terrible game."

---

# Official Constraint

Never expose all internal attributes to the coach.

If a new internal attribute is proposed:
- first attempt to derive it;
- expose it only if it creates meaningful gameplay decisions.

---

# 8. Recommended Documentation Structure

## Add New Docs

Suggested:

/docs
- player_attributes.md
- role_archetypes.md
- derived_attributes.md
- tactical_principles.md
- goalkeeper_rules.md
- snapshot_rules.md

---

# Update Existing Docs

## ENGINE_ARCHITECTURE.md

Add:
- attribute layering model;
- emergent identity principle;
- derived attribute philosophy.

---

## INTERACTION_SPECS.md

Add:
- player-derived calculations;
- event chains based on individual states.

---

## PROTOTYPE_TEAMS.md

Add:
- CONTROL roster philosophy;
- BLITZ roster philosophy;
- role distributions.

---

# Final Design Principle

The coach should feel:

> “I understand my players.”

while the engine secretly understands:

> support timing,
> spacing,
> tactical discipline,
> pressing traps,
> gain line,
> transition chaos,
> structural inertia,
> overloads,
> finishing quality,
> recovery speed.

That separation is one of the most important long-term design decisions for the entire project.



---

# CONTROL — 10 Player Visible Attribute Proposal

## Visible Attributes Reminder

Ratings are /100.

| Attribute | Meaning |
|---|---|
| Speed | Movement, acceleration, recovery range |
| Power | Contact, duels, physical resistance |
| Endurance | Repeated efforts, recovery, late-match stability |
| Hand Play | Passing, receiving, offloads, hand-ball security |
| Foot Play | Drops, goal attempts, penalties, clearances, long kicks |
| Ball Carrying | Ball-at-feet carrying, dribbling, small-space foot control |
| Vision | Tactical reading, support detection, spacing |
| Composure | Calmness under pressure, finishing control |
| Creativity | Improvisation, unpredictability, lower structural discipline |

CONTROL target profile:
- high Vision;
- high Composure;
- high Hand Play;
- good Endurance;
- moderate Speed;
- moderate Power;
- low-to-medium Creativity.

---

# CONTROL Starting 10 — Proposed Ratings

| # | Role | Speed | Power | Endurance | Hand Play | Foot Play | Ball Carrying | Vision | Composure | Creativity |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | Tempo Half | 62 | 52 | 84 | 90 | 82 | 66 | 97 | 97 | 38 |
| 2 | Hook Link | 68 | 78 | 82 | 92 | 54 | 70 | 88 | 90 | 42 |
| 3 | Forward Leader | 58 | 88 | 86 | 78 | 42 | 58 | 84 | 88 | 30 |
| 4 | Goalkeeper / Free Safety | 64 | 66 | 78 | 86 | 88 | 54 | 92 | 94 | 28 |
| 5 | Mobile Lock | 72 | 86 | 84 | 72 | 50 | 68 | 78 | 82 | 34 |
| 6 | Space Hunter | 84 | 62 | 78 | 76 | 62 | 82 | 80 | 78 | 58 |
| 7 | Playmaker | 76 | 56 | 76 | 88 | 78 | 84 | 92 | 86 | 62 |
| 8 | Pivot | 66 | 74 | 88 | 84 | 64 | 68 | 90 | 90 | 34 |
| 9 | Left Piston | 74 | 64 | 84 | 80 | 68 | 76 | 84 | 84 | 44 |
| 10 | Right Piston | 74 | 64 | 84 | 80 | 68 | 76 | 84 | 84 | 44 |

---

# Player-by-Player Intent

## 1. Tempo Half

CONTROL's brain. Creates structure through reading, tempo control, support orientation, and calm distribution.

Why these ratings:
- Vision 97 and Composure 97 make him the strongest tactical stabilizer.
- Hand Play 90 allows clean circulation and pressure resistance.
- Foot Play 82 gives CONTROL territorial tools without turning him into a pure kicker.
- Creativity 38 keeps him disciplined and prevents unnecessary chaos.

Expected derived calibration:
- Support Timing: elite
- Tactical Discipline: elite
- Spacing Quality: elite
- Press Reading: elite
- Chaos Creation: low-medium

## 2. Hook Link

CONTROL's possession stabilizer. Receives under pressure, connects phases, protects possession, and survives contact.

Why these ratings:
- Hand Play 92 and Composure 90 make him secure under pressure.
- Power 78 and Ball Carrying 70 let him survive contact without becoming a runner-first player.
- Vision 88 keeps him connected to the structure.
- Creativity 42 keeps decisions mostly safe.

Expected derived calibration:
- Ball Security: elite
- Contact Survival: high
- Support Link Quality: high
- Risk Control: high

## 3. Forward Leader

CONTROL's structural support anchor. Creates pods, screens pressure, supports the ball carrier, and stabilizes gain-line actions.

Why these ratings:
- Power 88 and Endurance 86 make him the strongest repeated-contact player.
- Vision 84 and Composure 88 make him reliable in support.
- Hand Play 78 allows secure short connections.
- Creativity 30 makes him very disciplined.

Expected derived calibration:
- Pod Support: elite
- Contact Dominance: high
- Rest Defense Reliability: high
- Tactical Discipline: elite

## 4. Goalkeeper / Free Safety

CONTROL's last-line protector and hybrid goalkeeper. He is CONTROL's designated goalkeeper and may use hands only inside CONTROL's defensive goal area.

Why these ratings:
- Composure 94 and Vision 92 make him an elite last-line reader.
- Foot Play 88 supports clearances, long distribution, and controlled restarts.
- Hand Play 86 supports saves, catches, and loose-ball control inside the area.
- Creativity 28 keeps him conservative and reliable.

Expected derived calibration:
- Goalkeeping Positioning: elite
- Reflex / Save Response: high
- Aerial Control: high
- Long Clearance Quality: high
- Risk Control: elite

## 5. Mobile Lock

CONTROL's emergency cover defender. Shuts down broken play, covers transition lanes, and slows explosive attacks.

Why these ratings:
- Speed 72, Power 86, Endurance 84 give him defensive range and contact power.
- Vision 78 and Composure 82 keep him reliable but less cerebral than FS or TH.
- Creativity 34 keeps him role-disciplined.

Expected derived calibration:
- Emergency Recovery: high
- Contact Stop Power: elite
- Cover Lane Quality: high
- Defensive Chaos Suppression: high

## 6. Space Hunter

CONTROL's selective vertical threat. Attacks space only when the structure has created a good window.

Why these ratings:
- Speed 84 and Ball Carrying 82 make him the best depth runner.
- Creativity 58 gives controlled unpredictability.
- Vision 80 and Composure 78 prevent him from becoming pure chaos.
- Hand Play 76 keeps him functional in combinations.

Expected derived calibration:
- Depth Threat: high
- Weak-Side Attack: high
- Structural Patience: medium
- Finishing Instinct: medium-high

## 7. Playmaker

CONTROL's creative unlocker. Creates advantage when structure alone is not enough.

Why these ratings:
- Vision 92, Hand Play 88, Ball Carrying 84 make him the most creative technical connector.
- Creativity 62 is the highest in CONTROL, but still below a CHAOS/BLITZ specialist.
- Composure 86 keeps his creativity controlled.
- Foot Play 78 allows drops, chips, switches, and attacking kicks.

Expected derived calibration:
- Third-Man Creation: elite
- Line-Breaking Pass: high
- Controlled Improvisation: high
- Turnover Risk: medium

## 8. Pivot

CONTROL's balance player. Protects the center, links attack and defense, and prevents the team from becoming stretched.

Why these ratings:
- Endurance 88 keeps him involved all match.
- Vision 90 and Composure 90 make him extremely reliable.
- Power 74 gives him contact presence.
- Creativity 34 keeps him stable.

Expected derived calibration:
- Rest Defense: elite
- Central Balance: elite
- Support Behind Ball: high
- Transition Recovery: high

## 9. Left Piston

CONTROL's left-side structural width. Maintains width, supports circulation, protects the short side, and receives switches.

Why these ratings:
- Speed 74 and Ball Carrying 76 allow wide progression.
- Vision 84 and Composure 84 keep the role structured.
- Foot Play 68 supports wide clearances and switch options.
- Creativity 44 gives enough adaptability without destabilizing CONTROL.

Expected derived calibration:
- Width Occupation: high
- Short-Side Security: high
- Switch Reception: high
- Rest Defense Awareness: medium-high

## 10. Right Piston

CONTROL's right-side structural width. Mirror profile to Left Piston for V1 simplicity.

Why these ratings:
- Same values as Left Piston to keep CONTROL symmetrical in V1.
- Later balancing can differentiate LP/RP if one side becomes too predictable.

Expected derived calibration:
- Width Occupation: high
- Open-Side Reception: high
- Switch Support: high
- Structural Balance: medium-high

---

# Expected CONTROL Team Aggregates From This Roster

| Collective Attribute | Expected Result | Why |
|---|---|---|
| Collectiveness | high | many players with high Vision + Composure |
| Cohesion | very high | low Creativity across structural roles |
| Tactical Discipline | very high | Creativity mostly controlled |
| Verticality | medium-low | only SH and PM strongly attack depth |
| Risk | low-medium | high Composure, low Creativity spine |
| Support Quality | very high | TH, HL, FL, P are support elite |
| Build-up Resistance | high | Hand Play + Vision + Composure spine |
| Defensive Compactness | high | P, ML, FS, FL form strong rest defense |
| Finishing | controlled but not explosive | high-quality windows preferred |

---

# Design Notes

CONTROL has a strong central spine:
- Tempo Half;
- Hook Link;
- Forward Leader;
- Pivot;
- Goalkeeper / Free Safety.

This gives:
- possession stability;
- support timing;
- rest defense;
- controlled progression;
- resistance under pressure.

CONTROL is not built for:
- extreme vertical attacks;
- repeated solo ruptures;
- chaotic loose-ball battles;
- high-risk pressing;
- improvisational finishing.

If CONTROL falls behind and must chase the game, it may lack explosive chaos unless the coach selects more creative/vertical profiles.

---

# Next Calibration Step

For each role, the engine should derive hidden values from:
- visible attributes;
- role archetype;
- tactical philosophy;
- match context.

Suggested immediate derived values to test:
- Support Timing;
- Tactical Discipline;
- Spacing Quality;
- Press Reading;
- Rest Defense Reliability;
- Contact Survival;
- Long-Play Quality;
- Chaos Creation;
- Finishing Composure;
- Goalkeeper Response.
