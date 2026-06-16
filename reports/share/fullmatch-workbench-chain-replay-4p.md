# FullMatch Workbench Chain Replay 4P

Sprint 4P adds a player matchup view to coach-report.product.html. The view compares roster players with the three existing profile cards as observation prompts only; it does not select a lineup, recommend starters, drive live selection, or mutate scoring.

## Default Mode
- default runFullMatch remains segment_harness.
- default coach report remains available.

## Experimental Mode
- experimental mode remains opt-in.
- Player Matchup View status: available.
- evidence category: WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW.
- product report file generated: coach-report.product.html.

## Product Report Structure
- section count: 8.
- new section: Joueurs a etudier, placed after Profils a observer and before A verifier au prochain match.
- profile matchup block count: 3.
- comparison mode: Comparaison non appliquee.
- official recommendation status: Non confirmee comme recommandation officielle.
- appendix added: Details des rapprochements profil-joueur.

## Player Matchup View
- source profiles: support_near_z4_hsr_profile, second_ball_presence_profile, strong_goalkeeper_response_profile.
- fit labels: Compatibilite forte, Compatibilite moyenne, Compatibilite faible.
- visible fields: Atouts visibles, Points a verifier, Risque si utilise dans ce role, Signal a observer au prochain match.
- interpretation guard: profile-player matches are observation prompts, not lineup choices.

## Guardrails
- lineup selection count: 0.
- automatic selection count: 0.
- official recommendation count: 0.
- confidence upgrade count: 0.
- profile applied count: 0.
- timeline mutation count: 0.
- score mutation count: 0.
- possession mutation count: 0.
- production scoring event creation count: 0.
- global economy claim count: 0.
- scoring constants unchanged.
- MatchBonusEvent unchanged.
- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.

## Profile Context
- validation profile count: 6
- profile variation detected: YES
- report variation detected: YES

## Test Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share
