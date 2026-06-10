# Fantasy Game — Master Design Document V3

## Choix documentaire

Cette V3 devient désormais le document de référence principal du projet.

Elle :
- reprend les éléments utiles des documents précédents ;
- clarifie les concepts devenus flous ;
- supprime les doublons ;
- uniformise le vocabulaire ;
- intègre les avancées récentes sur :
  - le moteur de match ;
  - les interactions tactiques ;
  - les propriétés collectives ;
  - les rôles ;
  - la fatigue ;
  - le tempo ;
  - la structure spatiale.

Les anciens documents deviennent des archives de réflexion.

---

# 1. Vision du projet

## 1.1 Vision générale

Fantasy Game est un jeu de management et de simulation compétitif basé sur un sport fictif hybride.

Le projet se situe à l’intersection de :
- Football Manager ;
- MPG ;
- rugby à 7 ;
- hockey ;
- football moderne ;
- football australien.

Le cœur du jeu repose sur :
- la compréhension tactique ;
- la construction d’effectif ;
- les synergies collectives ;
- les styles de jeu émergents ;
- la lecture des rapports de match.

---

## 1.2 Fantasme joueur

Le fantasme principal du jeu est :

> “Partir de rien, façonner une équipe de ses propres mains et arriver au sommet.”

Le coach :
- découvre progressivement un nouveau sport ;
- apprend ses dynamiques ;
- expérimente ;
- développe sa propre philosophie ;
- construit une identité d’équipe.

La compréhension du jeu doit être progressive.

Le joueur ne doit jamais avoir l’impression que le jeu est totalement “résolu”.

---

## 1.3 Priorités fondamentales

### Priorité n°1 — Cohérence collective

La cohérence collective doit être plus importante que les individualités.

Le moteur doit valoriser :
- la complémentarité ;
- les synergies ;
- les rôles ;
- la structure ;
- la gestion des espaces ;
- la fatigue ;
- les comportements collectifs.

---

### Priorité n°2 — Profondeur tactique

Le coach doit pouvoir :
- imposer une philosophie ;
- adapter son style ;
- contrer l’adversaire ;
- interpréter les rapports ;
- développer des automatismes.

---

### Priorité n°3 — Émergence systémique

Le moteur ne doit pas reposer sur des scripts.

Les situations doivent émerger naturellement de l’interaction entre :
- attributs ;
- fatigue ;
- pression ;
- espace ;
- rôles ;
- consignes ;
- propriétés collectives.

---

# 2. ADN du sport

## 2.1 Identité générale

Le sport est :
- hybride pied/main ;
- fortement transitionnel ;
- basé sur l’espace ;
- rythmé ;
- tactique ;
- physique ;
- très exigeant mentalement.

Références principales :
- rugby à 7 ;
- hockey ;
- football moderne.

---

## 2.2 Philosophie offensive

Une bonne attaque cherche à :
- étirer le bloc adverse ;
- manipuler les espaces ;
- alterner pied et main ;
- provoquer des déséquilibres ;
- créer des surnombres ;
- accélérer brutalement quand une faille apparaît.

Une attaque dominante :
- maîtrise le tempo ;
- varie les rythmes ;
- sait jouer court et long ;
- manipule le pressing ;
- exploite les weak sides ;
- sait conserver sous pression.

---

## 2.3 Philosophie défensive

Une bonne défense cherche à :
- rendre le terrain plus petit ;
- réduire les espaces ;
- orienter l’adversaire ;
- protéger l’axe ;
- piéger dans la densité ;
- coulisser rapidement.

Le pressing doit être :
- coordonné ;
- intelligent ;
- contextuel.

Un mauvais pressing doit être sévèrement puni.

---

# 3. Terrain et spatialisation

## 3.1 Terrain

Terrain rectangulaire inspiré du football américain.

Éléments :
- repères visuels tous les 10 mètres ;
- buts hybrides football/rugby ;
- zone d’essai derrière les buts.

---

## 3.2 Découpage longitudinal

Le terrain est divisé en 7 zones longitudinales.

| Zone | Fonction |
|---|---|
| Z1 | En-but défensif |
| Z2 | Défense profonde |
| Z3 | Sortie de camp |
| Z4 | Milieu terrain |
| Z5 | Pression offensive |
| Z6 | Zone de tir / surface offensive |
| Z7 | En-but offensif |

---

## 3.3 Découpage latéral

Le terrain est divisé en 5 couloirs.

| Couloir | Fonction |
|---|---|
| CL | Couloir gauche |
| HSL | Demi-espace gauche |
| C | Axe central |
| HSR | Demi-espace droit |
| CR | Couloir droit |

---

## 3.4 Principes structurels

### Défense

Une équipe défend généralement :
- compacte ;
- sur 3 couloirs ;
- avec échelonnement vertical.

Objectif :
- éviter qu’une seule action élimine plusieurs joueurs.

---

### Attaque

Une équipe attaque généralement :
- en occupant les 5 couloirs ;
- avec maximum 2 joueurs par ligne ;
- en cherchant prioritairement :
  1. diagonales vers l’avant ;
  2. verticalité ;
  3. circulation latérale ;
  4. sécurité arrière.

---

# 4. Scoring

| Action | Points |
|---|---|
| But | 2 |
| Essai | 2 |
| Transformation | 1 |
| Drop | 1 |

Objectif :
- encourager plusieurs styles offensifs ;
- éviter une seule façon optimale de marquer.

---

# 5. Structure des équipes

## 5.1 Format actuel

- 10 joueurs titulaires ;
- remplaçants à définir après prototypage.

---

## 5.2 Philosophie des rôles

Les rôles :
- ne sont PAS des classes rigides ;
- ne sont PAS des postes figés.

Ils représentent :
- des tendances comportementales ;
- des zones naturelles ;
- des priorités tactiques.

Les dépassements de fonction sont centraux dans l’identité du jeu.

---

# 6. Les 10 rôles fondamentaux

## 1 — Left Piston

Protecteur physique structurel.

Responsabilités :
- stabilisation défensive ;
- protection axe ;
- sorties sous pression ;
- couverture proche.

---

## 2 — Right Piston

Version asymétrique du Left Piston.

Peut être :
- plus agressif ;
- plus mobile ;
- plus relanceur.

---

## 3 — Hook Link

Relais permanent.

Responsabilités :
- continuité du jeu ;
- soutien ;
- liaison pied/main ;
- fluidité collective.

---

## 4 — Mobile Lock

Destructeur spatial.

Responsabilités :
- couverture ;
- cassure transitions ;
- chasse défensive ;
- protection structurelle.

---

## 5 — Forward Leader

Moteur total.

Responsabilités :
- avancer ;
- défendre ;
- distribuer ;
- survivre dans le chaos.

Archétype superstar naturel du jeu.

---

## 6 — Tempo Half

Régulateur du tempo.

Responsabilités :
- orientation ;
- contrôle du rythme ;
- gestion transitions ;
- circulation.

---

## 7 — Playmaker

Créateur de rupture.

Responsabilités :
- casser lignes ;
- trouver weak side ;
- alterner pied/main ;
- manipuler bloc adverse.

---

## 8 — Forward Leader

Fixateur destructeur.

Responsabilités :
- fixation ;
- duel ;
- attaque intervalles ;
- création surnombre.

---

## 9 — Space Hunter

Prédateur spatial.

Responsabilités :
- profondeur ;
- transitions ;
- appels ;
- attaques weak side.

---

## 10 — Free Safety

Sécurité globale dynamique.

Responsabilités :
- couverture profonde ;
- relance ;
- lecture du jeu ;
- gardien volant.

---

# 7. Attributs individuels

## Philosophie générale

Les attributs doivent être :
- peu nombreux ;
- systémiques ;
- fortement interconnectés.

Chaque attribut doit influencer plusieurs systèmes.

---

## Liste actuelle des attributs

### 1. Vitesse

Capacité à :
- couvrir rapidement une distance ;
- accélérer ;
- répéter des courses ;
- effectuer des replis ;
- attaquer la profondeur.

---

### 2. Speed

Capacité à :
- changer de direction ;
- éviter un duel ;
- ajuster son corps ;
- réagir rapidement ;
- conserver son équilibre.

Très importante dans les petits espaces.

---

### 3. Endurance

Capacité à :
- résister à la fatigue ;
- répéter les efforts ;
- maintenir l’intensité.

---

### 4. Puissance

Capacité à :
- gagner les impacts ;
- protéger le ballon ;
- résister physiquement ;
- stabiliser les duels.

---

### 5. Jeu à la main

Capacité à :
- contrôler ;
- passer ;
- conserver ;
- exécuter sous pression.

---

### 6. Jeu au pied — conduite

Capacité à :
- dribbler ;
- contrôler ;
- conduire le ballon ;
- exécuter des petits gestes techniques.

---

### 7. Jeu au pied — passe/frappe

Capacité à :
- jouer long ;
- tirer ;
- dropper ;
- changer le jeu ;
- transformer.

---

### 8. Vision

Capacité à :
- lire le jeu ;
- anticiper ;
- se placer ;
- comprendre les espaces ;
- prendre des décisions ;
- respecter les consignes.

---

### 9. Composure

Capacité à :
- résister à la pression ;
- jouer malgré fatigue ;
- supporter les impacts ;
- maintenir intensité émotionnelle ;
- rester lucide.

---

# 8. Consignes tactiques

## 8.1 Philosophie

Le coach ne contrôle pas chaque action.

Il définit :
- des tendances ;
- des priorités ;
- une identité.

Le moteur adapte ensuite les comportements selon le contexte.

---

## 8.2 Consignes défensives

### Bloc

Bloc haut ↔ On gare le bus

---

### Pressing

Extrême ↔ Tranquille Émile

---

### Agressivité

Toujours à la limite ↔ Surtout pas de fautes

---

### Marquage

Individuel ↔ Zone

---

## 8.3 Consignes offensives

### Usage pied/main

Tout au pied ↔ Tout à la main

---

### Niveau de risque

Tous les risques ↔ Prudence maximale

---

### Verticalité

Toujours vers l’avant ↔ Construction patiente

---

### Collectif

Jeu individuel ↔ Collectif à mort

---

# 9. Propriétés collectives émergentes

## Philosophie

Les propriétés collectives ne sont pas directement configurées.

Elles émergent :
- des attributs ;
- des rôles ;
- de la fatigue ;
- de la cohérence tactique ;
- des habitudes collectives.

---

## Cohésion

Capacité de l’équipe à :
- réagir ensemble ;
- couvrir les erreurs ;
- synchroniser les décisions ;
- rester stable sous pression.

---

## Mobilité collective

Capacité de l’équipe à :
- coulisser ;
- se replacer ;
- soutenir ;
- couvrir l’espace.

Émerge principalement de :
- vitesse ;
- agilité ;
- intelligence ;
- fatigue.

---

## Transition offensive

Capacité à :
- accélérer après récupération ;
- casser le contre-pressing ;
- exploiter les déséquilibres.

---

## Transition défensive

Capacité à :
- survivre après perte ;
- ralentir l’adversaire ;
- reformer la structure.

---

## Puissance collective

Capacité à :
- gagner les impacts ;
- protéger la balle ;
- stabiliser les duels.

---

## Résilience

Capacité à :
- continuer malgré fatigue ;
- survivre aux temps faibles ;
- éviter l’effondrement collectif.

---

## derived tactical discipline

Capacité à :
- respecter les consignes ;
- maintenir le bloc ;
- synchroniser les déplacements.

---

## Lecture collective

Capacité à :
- identifier les failles ;
- exploiter les déséquilibres ;
- anticiper les intentions adverses.

---

# 10. Pression

## Philosophie

La pression représente principalement :
- le temps ;
- l’espace ;
- les possibilités d’exécution.

---

## Zones conceptuelles

### Zone libre

Le joueur peut exécuter proprement.

---

### Sweet spot

Le joueur est sous pression mais peut encore réussir.

Les qualités techniques, mentales et décisionnelles deviennent critiques.

---

### Zone d’étouffement

Le joueur ne dispose plus d’assez d’espace.

Conséquences possibles :
- turnover ;
- erreur ;
- duel perdu ;
- dégagement forcé.

---

# 11. Fatigue et fraîcheur

## 11.1 Philosophie

La fatigue est un régulateur systémique majeur.

Elle équilibre naturellement :
- pressing ;
- verticalité ;
- chaos ;
- domination physique.

---

## 11.2 Sources principales

- distance parcourue ;
- courses haute intensité ;
- changements de direction ;
- impacts ;
- transitions ;
- longues séquences défensives.

---

## 11.3 Deux notions distinctes

### Fatigue accumulée

Usure durable du joueur.

---

### Fraîcheur instantanée

État énergétique actuel.

Peut légèrement remonter :
- lors de phases calmes ;
- possessions longues ;
- réorganisations lentes.

---

## 11.4 Effets de la fatigue

La fatigue ne réduit pas seulement les statistiques.

Elle modifie aussi les comportements.

Conséquences :
- moins de soutien ;
- moins de pressing ;
- moins de mobilité ;
- baisse lucidité ;
- erreurs techniques ;
- baisse qualité pied/main ;
- pertes de coordination.

---

# 12. Tempo

## Philosophie

Le tempo représente :
- le rythme décisionnel ;
- la vitesse des transitions ;
- l’intensité structurelle du match.

Le tempo n’est PAS simplement la vitesse.

---

## Tempo élevé

Produit :
- transitions ;
- chaos ;
- fatigue ;
- variance.

---

## Tempo faible

Produit :
- contrôle ;
- structure ;
- stabilité ;
- maîtrise territoriale.

---

## Influences principales

Le tempo dépend notamment :
- des consignes ;
- des turnovers ;
- des espaces ;
- de la fatigue ;
- des propriétés collectives.

---

# 13. Interactions fondamentales du moteur

Le moteur repose sur des interactions tactiques contextualisées.

Liste actuelle :

1. Sortie de pressing
2. Transition offensive
3. Construction offensive
4. Attaque verticale
5. Conservation sous pression
6. Pressing coordonné
7. Transition défensive
8. Duel physique
9. Duel spatial
10. Tir / finition
11. Phases arrêtées

Chaque interaction combine :
- attributs individuels ;
- propriétés collectives ;
- consignes ;
- contexte spatial ;
- fatigue ;
- pression.

---

# 14. Architecture du moteur

## 14.1 Philosophie générale

Le moteur ne simule PAS des gestes physiques précis.

Il simule :
- des situations ;
- des décisions ;
- des interactions ;
- des conséquences.

---

## 14.2 Boucle principale

Le moteur fonctionne par ticks tactiques.

Chaque tick représente :
- une micro-décision ;
- une interaction ;
- une évolution de structure.

Boucle :

Tick → interaction → résolution → mise à jour états → nouveau tick

---

## 14.3 Structure logique

### MatchState

État global du match.

---

### TeamState

État collectif des équipes.

---

### PlayerState

État individuel des joueurs.

---

### TacticalState

Organisation spatiale et structurelle.

---

### SequenceState

État de la séquence actuelle.

---

### EventLog

Narration et statistiques.

---

# 15. Système de résolution

## Philosophie

Le moteur utilise une formule universelle simple.

Résolution générale :

Capacité offensive contextualisée
−
Capacité défensive contextualisée
+
Variance contextuelle

---

## Capacité contextualisée

Une capacité dépend de :
- attributs ;
- rôle ;
- propriétés collectives ;
- contexte ;
- consignes ;
- fraîcheur.

---

## Variance

La variance dépend du contexte.

Elle augmente notamment avec :
- fatigue ;
- chaos ;
- pression ;
- prise de risque.

---

# 16. Rapports de match

## Philosophie

Le rapport de match EST une partie centrale du gameplay.

Le coach doit pouvoir :
- imaginer le match ;
- comprendre les dynamiques ;
- analyser ses choix ;
- préparer le suivant.

---

## Structure actuelle

### 1. Highlights narratifs

Commentaires tactiques détaillés.

Exemples :
- références aux zones ;
- lignes des 20/30/40 mètres ;
- weak side ;
- transitions ;
- pressing.

---

### 2. Rapport collectif

Analyse :
- domination ;
- pressing ;
- espaces ;
- transitions ;
- fatigue ;
- occupation terrain.

---

### 3. Rapport individuel

Analyse des performances des joueurs.

---

### 4. Rapport du coach adjoint

Interprétation tactique et pédagogique.

---

# 17. Anti “jeu résolu”

## Philosophie

Le jeu ne doit jamais devenir totalement solvable.

---

## Sources d’incertitude

- fatigue ;
- récupération ;
- adversaires humains ;
- sport inédit ;
- comportements émergents ;
- rôles hybrides ;
- propriétés collectives ;
- variance contextuelle.

---

## Informations partiellement cachées

À terme :
- récupération réelle ;
- régularité ;
- résistance à la pression ;
- tenue sur 80 minutes ;
- fragilité mentale.

---

# 18. Priorités de développement

## Priorité absolue actuelle

1. Prototype moteur
2. Interactions fondamentales
3. Équilibrage systémique
4. Rapports de match
5. Identités d’équipes

---

## Hors scope V1

- marché transferts ;
- progression joueurs ;
- météo ;
- infrastructures ;
- blessures détaillées ;
- scouting ;
- carrière long terme.

---

# 19. Vision finale

Créer un jeu où :
- les équipes ont une identité reconnaissable ;
- les coachs débattent stratégie pendant des heures ;
- les rapports deviennent obsessionnels ;
- les matchs racontent des histoires crédibles ;
- le sport semble réellement exister.

Objectif ultime :

> créer un nouveau sport crédible, profond, tactique et émergent.
