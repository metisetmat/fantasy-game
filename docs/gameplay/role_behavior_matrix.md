# Role Behavior Matrix

This document defines the official V0.1 tactical behavior matrix for each role. Attributes describe player capacity; role behavior describes how that capacity is expressed under context.

| Role | Normal Behavior | Pressing Behavior | Transition Behavior | Chaos Behavior | Finishing Behavior | Fatigue Behavior | Support Behavior | Risk Tolerance |
|---|---|---|---|---|---|---|---|---|
| Tempo Half | Organizes tempo, protects structure, prefers supported progression. | Finds exits behind pressure and avoids isolated carries. | Connects first pass, then follows as organizer. | Slows unstable phases and avoids chaos unless advantage is clear. | Prefers drops, controlled final passes, or structured progression. | Recycles earlier and lowers direct-risk choices. | Inside support, third-man outlet, safe diagonal. | Low-medium. |
| Hook Link | Stabilizes possession and survives contact. | Offers secure receiver under pressure. | Secures first contact or phase connection. | Protects ball and waits for support. | Supports close-range continuation, rarely forces finish. | Becomes more conservative but remains reliable. | Connected outlet, pod support, contact support. | Low-medium. |
| Forward Leader | Anchors structure, screens pressure, organizes pods. | Screens nearest presser and protects gain-line support. | Leads second wave and contact stabilization. | Turns chaos into contact security rather than improvisation. | Supports try pressure, screens last defender, secures rebounds. | Loses explosiveness but keeps structure. | Pod organizer, pressure screen, support anchor. | Medium. |
| Goalkeeper / Free Safety | Protects depth first and organizes last line. | Offers emergency release only when structure needs it. | Protects counter depth before joining. | Prioritizes rebound control and last-line order. | Saves below crossbar, controls rebounds, organizes goal-frame defense. | Leaves line less often and clears earlier. | Deep outlet, rest-defense organizer. | Low. |
| Mobile Lock | Closes lanes and protects emergency spaces. | Steps into traps and blocks direct exits. | Recovers against runners and covers central lanes. | Tries to reduce chaos by delaying the carrier. | Last-line tackle, emergency block, forced wide. | Recovery range drops; covering choices become earlier. | Covering support, defensive fold. | Medium. |
| Space Hunter | Waits for weak-side or depth window. | Jumps pressing lanes when trigger is visible. | Attacks depth aggressively and accepts isolation more often. | Becomes more rupture-oriented and less disciplined. | Prefers try attack, weak-side finish, chaotic second chance. | Loses repeated sprint threat and becomes less reliable. | Depth runner, weak-side outlet, late support. | High. |
| Playmaker | Creates third-man solutions and controlled unlocks. | Receives between lines to break pressure. | Finds early final pass or controlled acceleration. | Can improvise without fully abandoning structure. | Chooses drop, final pass, or red-zone unlock based on lane quality. | Creativity remains, execution risk rises. | Third-man creator, inside connector. | Medium-high. |
| Pivot | Balances possession and rest defense. | Offers central reset and protects axis. | Stabilizes the first secure phase after transition. | Pulls team back toward structure. | Supports controlled second wave, rarely forces finish. | Sits deeper and protects rest defense. | Behind-ball support, central hinge. | Low-medium. |
| Left Piston | Provides left width and short-side protection. | Offers touchline outlet or closes flank. | Supports flank progression and recovery. | Keeps width but avoids reckless isolation. | Supports wide entry or switch reception. | Reduces overlap frequency and protects behind ball. | Wide support, short-side security. | Medium. |
| Right Piston | Provides right width and open-side reception. | Offers escape lane or closes flank. | Supports open-side progression and recovery. | Keeps width but avoids reckless isolation. | Supports wide entry or switch reception. | Reduces overlap frequency and protects behind ball. | Wide support, open-side outlet. | Medium. |

## CONTROL Role Examples

Tempo Half:
- avoids chaos;
- protects structure;
- prefers supported progression;
- slows tempo under instability;
- recycles under low-quality windows.

Space Hunter:
- attacks weak side;
- increases depth aggression during transitions;
- accepts isolated runs more often;
- becomes less disciplined during chaos.

Goalkeeper / Free Safety:
- protects depth first;
- leaves line only under high danger;
- prioritizes rebound control;
- organizes rest defense.

## Engine Contract

Role behavior may influence:
- target selection;
- transition choices;
- support timing;
- recovery behavior;
- finishing choices;
- chaos reactions.

Behavior is modulated by:
- fatigue;
- pressure;
- chaos;
- momentum.

A disciplined player can become riskier under extreme chaos, but less than a naturally chaotic role.

## BLITZ Role Overrides

BLITZ uses team-specific role behavior overrides. These overrides do not replace visible attributes or derived attributes; they change how BLITZ players express those attributes inside target selection, transition choices, chaos reactions, and finishing choices.

| Role | BLITZ Behavior Override | Selection Bias |
|---|---|---|
| Tempo Half | Primary vertical trigger. Looks for depth runners early, prefers line-breaking release over slow support, accepts contested lanes, and can force action under pressure. | Strong Direct Vertical Attack / Progression / Finishing bias; reduced lateral and recycle bias. |
| Hook Link | Contact connector. Keeps chaotic phases alive, supports second balls, and is less safe than CONTROL's Hook Link. | Progression and direct continuation bias; lower safe recycle preference. |
| Forward Leader | Collision launcher. Screens long-play receivers, attacks second contact, and accepts weaker rest-defense discipline. | Progression, direct attack, and finishing support bias. |
| Goalkeeper / Free Safety | Aggressive sweeper-kicker. Strong long distribution, more risk outside goal area, less composed than CONTROL GK. | Direct distribution and progression bias; reduced backward recycle preference. |
| Mobile Lock | Aggressive recovery defender. Counterpresses forward and can overcommit. | Forward recovery and pressure bias; less conservative reset behavior. |
| Space Hunter | Depth attacker. Accepts isolation, attacks loose balls and rebounds, turns chaos into scoring pressure. | Very strong Direct Vertical Attack / Finishing / Weak Side bias. |
| Playmaker | High-risk creator. Tries direct goal, drop, and line-breaking actions, accepting turnover risk. | Strong Finishing / Direct Vertical Attack / Progression bias. |
| Pivot | Transition relay. Supports vertical continuation with less positional stability than CONTROL Pivot. | Progression and direct continuation bias; reduced recycle behavior. |
| Left Piston | High-speed width and depth runner. Attacks open-side lanes with less conservative rest defense. | Direct Vertical Attack / Progression / Weak Side bias. |
| Right Piston | High-speed width and depth runner. Attacks open-side lanes with less conservative rest defense. | Direct Vertical Attack / Progression / Weak Side bias. |

Reports must identify the role behavior source as either `generic role` or `team override`.
