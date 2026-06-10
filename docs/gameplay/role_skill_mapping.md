# Role Skill Mapping

This document separates true V0.1 role archetypes from skills and functional contributions.

Visible attributes are coach-facing. Derived attributes are engine-facing and should not become normal coach-editable ratings in V0.1.

## Skill / Contribution Mapping

| skill / contribution | what it means | visible attributes | derived attributes | true roles commonly using it | route / defensive need | if missing |
|---|---|---|---|---|---|---|
| Goal-frame shooting | Turns legal goal-frame windows into SHOT_GOAL threat. | Foot Play, Composure, Vision | finishingComposure, longPlayQuality | Tempo Half, Playmaker, Space Hunter | SHOT_GOAL | Shot quality drops and the team must lean on try/drop creation. |
| Try carrying / grounding | Survives contact and grounds legally through allowed in-goal access. | Power, Ball Carrying, Hand Play, Composure | contactSurvival, ballSecurity, scrambleAbility | Hook Link, Forward Leader, Space Hunter | TRY_TOUCHDOWN | Legal access becomes low payoff or fails under contact. |
| Drop threat | Uses rare open-play timing and field-zone windows above the frame. | Foot Play, Composure, Vision | longPlayQuality, finishingComposure | Tempo Half, Playmaker | DROP_GOAL, route diversity | Defenses can ignore the drop route and 3-main-family bonus access weakens. |
| Conversion kicking | Converts scored tries into extra CONVERSION_GOAL points. | Foot Play, Composure | finishingComposure, longPlayQuality | Tempo Half, Playmaker, Goalkeeper / Free Safety | CONVERSION_GOAL | Try route point ceiling falls. |
| Route creation | Finds the best route among shot, try, drop, switch, recycle, and carry. | Vision, Creativity, Hand Play, Composure | supportTiming, spacingQuality, longPlayQuality | Playmaker, Tempo Half, Pivot | Multi-route attack | Candidate ranking overselects obvious or low-upside actions. |
| Support running | Arrives as the useful next player instead of leaving the carrier isolated. | Speed, Endurance, Vision, Hand Play | supportTiming, spacingQuality | Hook Link, Left Piston, Right Piston, Pivot | Pressure escape, try support, rebounds, continuity | More sterile phases, TACKLED_SHORT, and isolated forced shots. |
| Pressure breaking | Keeps possession alive when the press closes lanes. | Hand Play, Ball Carrying, Composure, Vision | ballSecurity, pressReading | Tempo Half, Hook Link, Playmaker | SUPPORT_CLUSTER_RECYCLE, FORWARD_PROGRESS | Pressing opponents create rushed attempts or turnovers. |
| Rebound crashing | Attacks spills, deflections, and second-shot windows. | Speed, Power, Creativity, Composure | scrambleAbility, chaosCreation, recoveryRange | Space Hunter, Forward Leader, Left Piston, Right Piston | Second-shot pressure | Deflections are less threatening and defenses clear more often. |
| Rebound cleaning | Protects the goalkeeper and clears loose balls. | Vision, Power, Composure, Speed | restDefenseReliability, scrambleAbility, recoveryRange | Mobile Lock, Forward Leader, Pivot | Shot suppression, defensive bonus paths | GK spills and central deflections become costly. |
| Defensive recovery | Repairs broken shape and chases transition danger. | Speed, Endurance, Vision, Composure | recoveryRange, restDefenseReliability | Mobile Lock, Left Piston, Right Piston, Pivot | Transition defense | Failed attacks become opponent scoring chances. |
| Goal-line defense | Creates HELD_UP, TACKLED_SHORT, or forced-out outcomes without illegal central/frontal try shortcuts. | Power, Composure, Vision, Endurance | contactSurvival, tacticalDiscipline, restDefenseReliability | Forward Leader, Mobile Lock, Goalkeeper / Free Safety | TRY_TOUCHDOWN prevention | Legal try access converts too easily. |
| Transition stopping | Delays danger after turnovers or ambitious attacks. | Speed, Endurance, Composure, Vision | recoveryRange, pressReading, restDefenseReliability | Mobile Lock, Pivot, Left Piston, Right Piston | Loss-channel protection | Opponents punish route failures more often. |
| Endurance engine | Keeps support, pressure, and recovery reliable late. | Endurance, Speed, Composure | recoveryRange, tacticalDiscipline | Left Piston, Right Piston, Forward Leader, Mobile Lock | Late-match stability | Late collapses and specialist overload rise. |
| Late-match stabilization | Keeps decision quality when fatigue and score pressure rise. | Composure, Endurance, Vision, Hand Play | tacticalDiscipline, ballSecurity | Tempo Half, Pivot, Goalkeeper / Free Safety | Lead protection and close-game readability | Late forced shots, spills, and poor resets increase. |
| GK rebound control | Decides catch, parry, safe deflection, or central spill. | Hand Play, Composure, Vision, Speed | goalkeeperResponse, scrambleAbility | Goalkeeper / Free Safety | Save quality and next possession | More dangerous rebounds and contested second actions. |
| GK second-save recovery | Recovers after first save, spill, or scramble. | Speed, Endurance, Composure | goalkeeperResponse, recoveryRange | Goalkeeper / Free Safety | Post-shot continuity defense | Deflections become second-shot windows. |
| GK mental reliability | Keeps positioning, legal hand-use timing, communication, and readiness stable. | Composure, Vision, Endurance | goalkeeperResponse, tacticalDiscipline | Goalkeeper / Free Safety | Cold-start and overload management | Fresh-but-cold errors and overloaded spills rise. |

## Detailed Export Mapping

| skill / contribution | styles valuing it most | how it appears in match reports | fatigue / load effect | bonus access effect |
|---|---|---|---|---|
| Goal-frame shooting | direct power, balanced, multi-route technical | SHOT action blocks, shot quality, xG/xSOT, goalkeeper challenge | repeated finishing raises technical and mental load | supports route-family scoring and can contribute to major scoring-family diversity |
| Try carrying / grounding | direct power, mobile/wide, high pressing chaos | TRY_TOUCHDOWN attempts, grounding score, contact pressure, failure reason | contact fatigue raises LOST_FORWARD, HELD_UP, and TACKLED_SHORT risk | supports 3+ try bonus and try-generated conversion opportunities |
| Drop threat | patient control, balanced, multi-route technical | DROP_GOAL candidates, timing context, field-zone legality, kicker profile | pressure and late fatigue reduce timing and execution quality | supports 3-main-family bonus because DROP_GOAL is a main scoring family |
| Conversion kicking | try-heavy, balanced, direct power | CONVERSION_GOAL events after tries, conversion geometry, kicker quality | low physical load but medium pressure/composure load | does not count as main route-family bonus, but increases points after tries |
| Route creation | patient control, multi-route technical, BLITZ risky | candidate ranking, tie-breaking, route choice explanation, tactical evidence | high mental load; fatigue raises poor-selection risk | indirect: enables route diversity and bonus eligibility |
| Support running | balanced, mobile/wide, patient control | reception evidence, chain evidence, support line availability | repeated support and sprint load can reduce late arrival quality | indirect: improves try support, pressure escape, and route continuity |
| Pressure breaking | patient control, balanced, direct under pressure | pressure-escape actions, support cluster recycle, pressure source notes | repeated press raises decision and ball-security load | indirect: prevents sterile danger phases and preserves route access |
| Rebound crashing | high pressing chaos, direct power, mobile/wide | rebound continuation, second-shot windows, scramble/contact contest | high repeated effort and contact load; overuse can harm rest defense | indirect: may create extra scoring events but no standalone bonus |
| Rebound cleaning | defensive spine, balanced, patient control | rebound continuation, next possession, defensive clearance, GK protection | reaction/contact load rises after repeated deflections | supports major-threat shutdown by preventing second-shot goals |
| Defensive recovery | balanced, high pressing chaos, mobile/wide | transition defense, loss-channel protection, recovery range | high sprint and late-match fatigue load | supports defensive bonus paths by reducing major threats |
| Goal-line defense | defensive spine, direct power, balanced | held-up, tackled-short, forced-out, goal-line pressure | high contact load during repeated try defense | supports major-threat shutdown and suppresses try bonus against |
| Transition stopping | mobile/wide, high pressing chaos, balanced | transition stopping, rest-defense reliability, loss-channel risk | repeated acceleration and concentration load | indirect: protects close-loss and defensive bonus conditions |
| Endurance engine | high pressing chaos, mobile/wide, balanced | player load, late-match fatigue, support/recovery stability | absorbs repeated effort; protects late role reliability | indirect: stabilizes late scoring/defensive bonus access |
| Late-match stabilization | patient control, balanced, defensive spine | late-match performance, safe recycle, decision quality under fatigue | medium physical load but high composure value | indirect: protects leads, close-loss margins, and route quality |
| GK rebound control | all styles, especially defensive spine and high-risk styles | goalkeeper action, rebound type, rebound zone, next possession | mental fatigue and repeated shots increase spill risk | supports major-threat shutdown by reducing second-shot danger |
| GK second-save recovery | all styles, especially BLITZ sweeper and defensive spine | second-save recovery score, rebound continuation, scramble outcome | recovery decreases with overload and repeated danger | indirect: protects scoreline and defensive bonus conditions |
| GK mental reliability | all styles | readiness state, concentration load, cold-start/overload notes, communication | mental fatigue rises through inactivity, danger phases, rebounds, scrambles, close-score and late pressure | indirect: protects shutout/major-threat defensive conditions |

## Reclassification Audit

The following previous labels are not true roles. They are now skills, contributions, or role capabilities:
- Goal-frame Shooter
- Try Carrier / Finisher
- Drop Kicker
- Conversion Kicker
- Creator / Distributor
- Support Runner
- Pressure Breaker
- Rebound Crasher
- Defensive Anchor
- Pressure Defender
- Recovery Defender
- Goal-Line Defender
- Rebound Cleaner
- Transition Stopper
- Endurance Engine
- High-Intensity Runner
- Contact Forward
- Late-Match Stabilizer

## Attribute Sufficiency

The 9 visible attributes remain sufficient for V0.1:
- Speed
- Power
- Endurance
- Hand Play
- Foot Play
- Ball Carrying
- Vision
- Composure
- Creativity

No visible Discipline attribute is added. Discipline remains an emergent engine-facing product of Composure, Vision, Creativity trade-offs, tacticalDiscipline, fatigue, pressure, and team style.

## Derived Attribute Sufficiency

The current derived attribute list is sufficient to express modern skills:
- supportTiming
- tacticalDiscipline
- spacingQuality
- pressReading
- restDefenseReliability
- contactSurvival
- longPlayQuality
- chaosCreation
- finishingComposure
- goalkeeperResponse
- recoveryRange
- ballSecurity
- scrambleAbility

Future UI should explain these as coach-readable effects or role-fit notes, not as normal editable ratings.
