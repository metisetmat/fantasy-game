# Player Attributes

V0.1 uses exactly 9 visible coach-facing player attributes.

This file is the official terminology source for visible player attributes. Gameplay, engine, roster, interaction, and prompt documentation must use these names.

All visible and derived attributes use the official 0-100 interpretation in `docs/gameplay/attribute_ranges.md`.

## Physical

| Attribute | Definition |
|---|---|
| Speed | Movement, acceleration, recovery range. |
| Power | Contact, duels, physical resistance. |
| Endurance | Repeated efforts, fatigue resistance, recovery. |

## Technical

| Attribute | Definition |
|---|---|
| Hand Play | Passing, receiving, offloads, ball security with hands. |
| Foot Play | Drops, goal attempts, penalties, clearances, chandelles, long kicks. |
| Ball Carrying | Ball-at-feet carrying, dribbling, and small-space foot control only. |

## Tactical / Decision

| Attribute | Definition |
|---|---|
| Vision | Tactical reading, support detection, spacing, anticipation. |
| Composure | Calmness under pressure, finishing control, decision stability. |
| Creativity | Improvisation, unpredictability, chaos creation, and lower structural discipline at high values. |

Creativity intentionally creates a discipline tradeoff. There is no separate visible Discipline attribute in V0.1.
