Je reprends un projet de moteur de simulation pour un sport hybride football/rugby appelé Fantasy Game.



Contexte général :



\* Le jeu est inspiré de MPG mais basé sur un sport fictif jouable toute l’année.

\* Le cœur du jeu est le moteur de simulation.

\* Le GDD indique que les matchs doivent être principalement déterminés par les attributs des joueurs, les interactions entre attributs, les synergies collectives, la fatigue, les faiblesses, les choix tactiques et la compréhension du coach.

\* La cohérence collective doit compter plus que les individualités.

\* Le jeu doit créer de la tension compétitive, de la réflexion tactique, de la rejouabilité et éviter les métas dominantes.



État actuel du scoring :



\* Scoring version actuelle : V2\_DROP\_FOUNDATION.

\* Score unit : POINTS.

\* Routes actives :



&#x20; \* SHOT\_GOAL = 3 points.

&#x20; \* TRY\_TOUCHDOWN = 5 points.

&#x20; \* CONVERSION\_GOAL = 2 points.

&#x20; \* DROP\_GOAL = 2 points.

\* Route inactive :



&#x20; \* PENALTY\_SHOT inactive.

\* Le score live vient du flux unifié de ScoringEvents actifs.

\* Les diagnostics batch restent séparés du score live.

\* Le score live courant du mini-match est CONTROL 3 - 0 BLITZ.

\* Il y a 1 événement live actif : SHOT\_GOAL pour CONTROL.

\* Les autres routes existent surtout en diagnostics batch pour l’instant.



État des routes :



\* Tir :



&#x20; \* Les tirs sont techniquement propres.

&#x20; \* Les shots utilisent une sémantique de tir, pas de passe.

&#x20; \* Le gardien est évalué sur les tirs cadrés.

&#x20; \* Les rebounds et continuations existent.

&#x20; \* Le tir domine encore les points batch, mais il ne faut pas le nerfer arbitrairement.

\* Essai :



&#x20; \* TRY\_TOUCHDOWN est actif à 5 points.

&#x20; \* Les règles d’en-but sont :



&#x20;   \* Z0/Z8 sont les zones d’en-but.

&#x20;   \* Aucun joueur ne doit occuper Z0/Z8 sans ballon.

&#x20;   \* Un essai ne peut être marqué que par un porteur de balle qui atteint Z0/Z8 par un accès latéral légal.

&#x20;   \* Pas d’essai possible par entrée centrale/frontale via la surface de but.

&#x20;   \* L’essai utilise les règles de grounding rugby.

&#x20;   \* La transformation est faite selon la géométrie de l’endroit où l’essai est marqué.

&#x20; \* La tentative live actuelle finit en LOST\_FORWARD.

\* Conversion :



&#x20; \* CONVERSION\_GOAL est active après TRY\_TOUCHDOWN seulement.

&#x20; \* Dernier état connu après expansion non-shot : 3 tentatives batch, 0 réussie, recommandation REDUCE\_CONVERSION\_DIFFICULTY.

\* Drop :



&#x20; \* DROP\_GOAL est actif à 2 points.

&#x20; \* Il est conçu comme arme rare de timing, pas comme route dominante.

&#x20; \* Dernier état connu après expansion non-shot : 39 opportunités, 16 tentatives, 2 réussites, 13%, recommandation REDUCE\_DROP\_DIFFICULTY.



Derniers diagnostics importants :



\* Le moteur génère des danger phases.

\* Après instrumentation :



&#x20; \* environ 6 possessions offensives par match.

&#x20; \* environ 8.7 danger phases par match.

&#x20; \* danger phase to scoring affordance rate autour de 90%.

\* Le problème n’est donc plus principalement “pas de danger phase”.

\* Le problème était que les danger phases créaient trop souvent du shot et pas assez de non-shot.

\* Le sprint Danger Phase Non-Shot Affordance Generation a amélioré cela :



&#x20; \* TRY affordances : 39 -> 66.

&#x20; \* DROP affordances : 16 -> 39.

&#x20; \* non-shot setup affordances : 60.

&#x20; \* non-shot affordance share : 16% -> 27%.

\* Ce sprint a réussi, mais a révélé que conversion et drop sont maintenant trop durs.



Dernier sprint recommandé avant la discussion de shape :



\* Rebalance Drop and Conversion Resolution After Non-Shot Expansion.

\* Objectif :



&#x20; \* remonter conversion success rate de 0% vers 60%-80%.

&#x20; \* remonter drop success rate de 13% vers 20%-45%.

&#x20; \* ne pas changer les valeurs de points.

&#x20; \* ne pas activer PENALTY\_SHOT.

&#x20; \* ne pas nerfer les tirs.

&#x20; \* ne pas augmenter encore les affordances non-shot.



Nouvelle priorité ouverte dans la conversation :

Nous avons ensuite identifié un problème plus fondamental dans sequence-1-action-1.html : la logique d’occupation collective.



Contexte sequence-1-action-1 :



\* CONTROL vs BLITZ.

\* CONTROL attaque de Z1 vers Z7.

\* Avant action :



&#x20; \* CONTROL TH porte le ballon en Z4-HSL.

\* Action sélectionnée :



&#x20; \* TH -> ML.

&#x20; \* SUPPORT\_CLUSTER\_RECYCLE.

&#x20; \* pression escape / secure recycle.

\* Après action :



&#x20; \* ML reçoit et devient porteur en Z3-HSL.

\* L’action TH -> ML est acceptable.

\* Le problème est surtout le placement collectif before/after.



Vision tactique à intégrer :



1\. BLITZ Before :



&#x20;  \* Une équipe qui défend doit protéger l’axe entre le ballon et les façons de marquer.

&#x20;  \* Elle doit protéger le but et aussi l’accès à l’essai par les routes légales.

&#x20;  \* BLITZ devrait protéger prioritairement :



&#x20;    \* Z5-CL

&#x20;    \* Z5-HSL

&#x20;    \* Z5-C

&#x20;  \* On devrait trouver un joueur BLITZ en Z5-CL, par exemple LP ou TH.

&#x20;  \* SH et PM peuvent protéger/compacter vers Z5-HSL.

&#x20;  \* RP peut protéger Z5-C.

&#x20;  \* Le bloc doit rester compact sur 2-3 lignes.



2\. CONTROL After :



&#x20;  \* CONTROL est méthodique et prudent.

&#x20;  \* Après la passe, le ballon est sous pression en Z3-HSL.

&#x20;  \* Si CONTROL perd le ballon là, BLITZ peut attaquer directement via le couloir libre.

&#x20;  \* CONTROL doit donc renforcer sa rest defense :



&#x20;    \* PV doit glisser en Z2-HSL.

&#x20;    \* PM doit protéger Z2-C.

&#x20;    \* GK doit se repositionner en Z1-C comme dernier rempart.

&#x20;    \* SH ne doit pas s’éloigner davantage s’il n’a pas été servi ; il doit se reconnecter vers Z4-C.

&#x20;  \* Il faut éviter la duplication GK/PV en Z2-C si Z2-HSL reste vide.



3\. BLITZ After :



&#x20;  \* BLITZ doit rester compact et suivre le pressing autour du nouveau porteur ML en Z3-HSL.

&#x20;  \* FL peut presser vers Z2-C ou Z2-HSL.

&#x20;  \* LP peut glisser en Z4-CL.

&#x20;  \* PM et TH peuvent compacter en Z4-HSL.

&#x20;  \* RP peut protéger Z4-C.

&#x20;  \* SH peut occuper Z3-C ou un couloir central d’interception.

&#x20;  \* BLITZ peut accepter une exposition côté faible, mais seulement comme trade-off de style agressif documenté.



Sprint à lancer maintenant :

Team Shape Intent Calibration — Sequence 1 Action 1.



Objectif :



\* Ne pas changer l’action TH -> ML.

\* Ne pas changer le scoring.

\* Corriger la logique d’occupation collective before/after.

\* Ajouter un modèle Team Shape Intent.

\* Ajouter :



&#x20; \* defensive ball-goal axis protection.

&#x20; \* defensive try-access protection.

&#x20; \* attacking rest-defense protection.

&#x20; \* loss-channel protection.

&#x20; \* pressing synchronization.

&#x20; \* style-based compactness.

&#x20; \* weak-side risk acceptance.

\* Mettre à jour sequence-1-action-1.html.

\* Produire team-shape-intent-calibration.md.

\* Produire validation.team-shape-intent-calibration.md.

\* Garder reports/share en MINIMAL\_REVIEW strict.
