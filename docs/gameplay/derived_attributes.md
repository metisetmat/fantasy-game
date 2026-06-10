# Derived Attributes

Derived attributes are engine-facing tactical capabilities computed from the 9 visible attributes, role behavior, team style, fatigue, pressure, and match context.

They are not normal coach-editable ratings in V0.1.

All derived attributes use the same 0-100 interpretation as `docs/gameplay/attribute_ranges.md`.

| Derived attribute | Meaning | Typical visible inputs |
|---|---|---|
| supportTiming | Arriving as useful support at the right tactical moment. | Vision, Speed, Endurance, Hand Play |
| tacticalDiscipline | Holding role structure and avoiding reckless choices. | Composure, Vision, inverse high-risk Creativity context |
| spacingQuality | Creating useful distances and angles around the ball. | Vision, Speed, Hand Play |
| pressReading | Understanding pressure, traps, and escape timing. | Vision, Composure, Hand Play |
| restDefenseReliability | Protecting the team after ambitious attacks or turnovers. | Vision, Composure, Endurance, Power |
| contactSurvival | Staying playable through contact. | Power, Ball Carrying, Hand Play, Composure |
| longPlayQuality | Quality of long passes, drops, conversions, clearances, and long distribution. | Foot Play, Vision, Composure |
| chaosCreation | Creating rupture and instability. | Creativity, Speed, Ball Carrying |
| finishingComposure | Keeping execution reliable in scoring moments. | Composure, Foot Play, Hand Play, Vision |
| goalkeeperResponse | Goalkeeper readiness, response, legal hand-use timing, and frame interaction. | Composure, Vision, Hand Play, Speed |
| recoveryRange | Ability to repair space and recover defensively. | Speed, Endurance, Vision |
| ballSecurity | Avoiding loose control, poor reception, or turnover under pressure. | Hand Play, Ball Carrying, Composure |
| scrambleAbility | Winning or surviving chaotic rebounds, spills, and contact contests. | Power, Speed, Composure, Creativity |

## Coach-Facing Rule

Reports may explain derived attributes as skill evidence or role-fit notes.

Roster editing should continue to expose only:
- Speed
- Power
- Endurance
- Hand Play
- Foot Play
- Ball Carrying
- Vision
- Composure
- Creativity
