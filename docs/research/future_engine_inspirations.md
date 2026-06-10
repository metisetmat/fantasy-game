# Future Engine Inspirations

## Repos / approches utiles

### 1. football-simulator — tbleckert
Inspiration prioritaire.
Le moteur utilise une boucle agent-based en tranches de 0,25 seconde : target positions, player intents, ball action, movement, event detection. C’est exactement la direction utile pour passer d’actions abstraites à du jeu continu. :contentReference[oaicite:0]{index=0}

À retenir :
- micro-ticks ;
- intentions individuelles ;
- mouvement continu ;
- détection d’événements ;
- snapshots plus fiables.

### 2. openengine — atas76
Inspiration philosophique prioritaire.
Principe clé : “don’t fake output” ; les joueurs comme agents, leurs attributs et les tactiques doivent produire une sortie cohérente. :contentReference[oaicite:1]{index=1}

À retenir :
- cohérence input → output ;
- éviter le storytelling non soutenu par l’état joueur ;
- chaque événement doit venir des joueurs, pas seulement du style d’équipe.

### 3. footballSimulationEngine / footballsim
Utile pour structurer un moteur itératif en TypeScript/Node : match state, movement iteration, modularisation. :contentReference[oaicite:2]{index=2}

À retenir :
- itérations de match ;
- séparation match init / movement / event ;
- strict typing ;
- architecture modulaire.

### 4. OpenFootManager
Utile plus tard pour la couche jeu complet : rapports de match, modding JSON, management, progression, transferts. Moins prioritaire pour le moteur tactique actuel. :contentReference[oaicite:3]{index=3}

### 5. TacSIm / tactical style imitation
Utile pour le futur : comparaison d’occupation spatiale et de vecteurs de mouvement pour mesurer un style tactique. :contentReference[oaicite:4]{index=4}

## Priorité actuelle

1. Spatial Engine V2
2. Player Intent Engine
3. Continuous Play Loop
4. Danger Model Rewrite
5. Role Autonomy
6. Coach-readable report layer
7. Economy / cost curve