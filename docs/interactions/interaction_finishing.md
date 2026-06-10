# Interaction MVP #5 — Tir / finition

---

# 1. Objectif tactique

La finition représente :

> la tentative de transformer une situation dangereuse en points.

Dans ton sport :
la finition est beaucoup plus riche qu’un simple “tir”.

Pourquoi ?

Parce qu’il existe :

* buts ;
* essais ;
* drops ;
* transformations ;
* tirs lointains ;
* finitions pied ;
* finitions main.

Très important.

---

# 2. Philosophie moteur

La finition :

# est la conséquence :

des interactions précédentes.

Très important.

Une bonne finition :

* récompense :

  * structure ;
  * domination ;
  * chaos exploité ;
  * transition ;
  * manipulation spatiale.

Elle ne doit PAS :
être indépendante du reste du moteur.

---

# 3. Situations typiques

| Situation             | Exemple              |
| --------------------- | -------------------- |
| Transition ouverte    | défense désorganisée |
| Bloc cassé            | espace axe           |
| Weak side trouvé      | finition large       |
| Pression territoriale | drop/tir             |
| Chaos surface         | ballon libre         |
| Gardien avancé        | tir lointain         |

---

# 4. Déclencheurs moteur

La finition démarre lorsque :

```text id="4vd0iz"
danger_offensif >= seuil
ET
ballon en zone dangereuse
```

Typiquement :

* Z5 ;
* Z6 ;
* Z7.

---

# 5. Types de finition

Très important.

Le moteur doit permettre :
plusieurs philosophies offensives.

---

# A. But

## Description

Finition dans les buts.

---

## Favorisé par

* espaces ;
* angle ouvert ;
* transitions ;
* gardien avancé.

---

# B. Essai

## Description

Projection dans l’en-but.

---

## Favorisé par

* domination physique ;
* surnombre ;
* largeur ;
* chaos proche ligne.

---

# C. Drop

## Description

Frappe rapide sous pression.

---

## Favorisé par

* bloc bas adverse ;
* espace axe ;
* Playmaker fort pied ;
* défense passive.

Très important :
arme anti-bloc bas.

---

# D. Transformation

## Description

Suite à essai.

Interaction plus simple.

---

# 6. Acteurs offensifs principaux

| Rôle           | Importance |
| -------------- | ---------- |
| Playmaker      | Très haute |
| Space Hunter   | Très haute |
| Forward Leader   | Haute      |
| Forward Leader | Haute      |
| Tempo Half     | Moyenne    |

---

# 7. Acteurs défensifs principaux

| Rôle        | Importance |
| ----------- | ---------- |
| Goalkeeper / Free Safety | Très haute |
| Pivot and Pistons     | Haute      |
| Mobile Lock | Haute      |

---

# 8. Inputs offensifs principaux

| Attribut              | Importance |
| --------------------- | ---------- |
| Foot Play | Très haute |
| Speed               | Haute      |
| Composure                | Haute      |
| Vision          | Haute      |
| Speed               | Moyenne    |
| Power             | Moyenne    |

---

# 9. Inputs défensifs principaux

| Attribut     | Importance |
| ------------ | ---------- |
| Vision | Haute      |
| Speed      | Haute      |
| Speed      | Haute      |
| Composure       | Moyenne    |
| Power    | Moyenne    |

---

# 10. Inputs gardien / Goalkeeper / Free Safety

Très important.

| Attribut            | Importance |
| ------------------- | ---------- |
| Vision        | Très haute |
| Composure              | Haute      |
| Speed             | Haute      |
| Jeu aérien          | Haute      |
| Jeu pied dégagement | Haute      |

---

# 11. Propriétés collectives offensives

| Propriété            | Impact           |
| -------------------- | ---------------- |
| Lecture collective   | choix finition   |
| Cohésion             | timing soutien   |
| Transition offensive | létalité         |
| Résilience           | lucidité fatigue |

---

# 12. Propriétés collectives défensives

| Propriété             | Impact            |
| --------------------- | ----------------- |
| Résilience            | survie pression   |
| derived tactical discipline   | protection axe    |
| Compression défensive | fermeture espaces |
| Transition défensive  | replis            |

---

# 13. Consignes offensives influentes

| Consigne        | Impact                      |
| --------------- | --------------------------- |
| Risque          | tirs difficiles             |
| Verticalité     | vitesse finition            |
| Usage pied/main | choix finition              |
| Collectif       | recherche solution optimale |

---

# 14. Consignes défensives influentes

| Consigne    | Impact               |
| ----------- | -------------------- |
| Bloc        | densité surface      |
| Agressivité | pression tireur      |
| Marquage    | couverture receveurs |

---

# 15. Philosophie spatiale

Très important.

La finition dépend énormément :

* des angles ;
* de la densité ;
* des couloirs ;
* des lignes défensives ;
* de la position du Goalkeeper / Free Safety.

---

# Situations dangereuses

| Situation       | Danger |
| --------------- | ------ |
| Axe ouvert      | énorme |
| Weak side libre | énorme |
| Gardien avancé  | énorme |
| Bloc cassé      | énorme |
| Chaos proche Z7 | énorme |

---

# Situations favorables défense

| Situation       | Effet         |
| --------------- | ------------- |
| Axe compact     | danger réduit |
| Tireur excentré | angle fermé   |
| Bloc reformé    | pression      |
| Soutiens coupés | isolement     |

---

# 16. Choix offensifs possibles

| Action           | Objectif           |
| ---------------- | ------------------ |
| Tir rapide       | surprendre         |
| Fixation + passe | ouvrir angle       |
| Percussion       | essai              |
| Drop             | punir densité      |
| Switch final     | weak side          |
| Recyclage        | maintenir pression |

---

# 17. Choix défensifs possibles

| Action              | Objectif         |
| ------------------- | ---------------- |
| Sortie agressive    | réduire angle    |
| Compression axe     | protéger but     |
| Sacrifice contact   | stopper essai    |
| Fermeture weak side | éviter switch    |
| Temporisation       | attendre soutien |

---

# 18. Résolution moteur

Le moteur évalue :

```text id="nzt0kq"
capacité_finalisation
VS
capacité_protection_défensive
```

Puis applique :

* angle ;
* espace ;
* pression ;
* fatigue ;
* chaos ;
* variance.

Très important.

---

# 19. Résultats possibles

## But

2 points.

---

## Essai

2 points.

Puis :
transformation potentielle.

---

## Drop réussi

1 point.

---

## Échec cadré

Goalkeeper / Free Safety intervient.

---

## Échec non cadré

Perte possession.

---

## Chaos rebond

Ballon vivant.

Très important dans ton sport.

---

# 20. Importance des rebonds

Très important.

Contrairement au football :
les rebonds doivent rester :

# extrêmement vivants.

Pourquoi ?

Parce que :

* jeu hybride ;
* mains/pieds ;
* chaos ;
* transitions immédiates.

Donc :
un tir raté peut :

* rester dangereux ;
* produire une deuxième vague ;
* créer une nouvelle transition.

Très important.

---

# 21. Effets fatigue

## Offensive

Fatigue impacte :

* lucidité ;
* précision ;
* timing ;
* coordination ;
* exécution technique.

---

## Défensive

Fatigue impacte :

* replacement ;
* réactions ;
* protection angles ;
* agressivité.

Très important :
les fins de match doivent produire :
plus :

* espaces ;
* erreurs ;
* chaos.

---

# 22. Impact tempo

Une finition :

# casse souvent :

la structure précédente.

Après :

* but ;
* rebond ;
* arrêt ;
  → nouveau cycle.

Très important.

---

# 23. Importance émotionnelle

La finition doit produire :

* climax ;
* tension ;
* momentum ;
* frustration ;
* euphorie.

C’est :

# le payoff émotionnel :

de toutes les interactions précédentes.

---

# 24. Narration type

## Tir lointain

> “Le Playmaker profite du bloc bas adverse et déclenche un drop splendide depuis les 30 mètres.”

---

## Essai

> “Les Titans finissent par enfoncer la défense dans l’axe et aplatissent dans l’en-but.”

---

## Weak side

> “Superbe renversement vers le couloir droit. Le Space Hunter n’a plus qu’à finir.”

---

## Gardien volant puni

> “Le Goalkeeper / Free Safety était très avancé ! Tentative immédiate depuis le milieu terrain.”

---

## Chaos surface

> “Le ballon reste vivant dans les 10 mètres ! Situation extrêmement confuse.”

---

# 25. Ce que cette interaction doit révéler

Elle doit permettre de voir :

* les équipes létales ;
* les équipes patientes ;
* les équipes physiques ;
* les équipes opportunistes ;
* les différences de style offensif.

---

# 26. Critères de succès spécifiques

## Succès si :

* plusieurs façons de marquer existent ;
* les styles influencent les finitions ;
* les blocs bas craignent les drops ;
* les rebonds restent dangereux ;
* les transitions créent de vraies occasions.

---

# Échec si :

* une seule méthode domine ;
* les tirs semblent RNG ;
* les défenses arrêtent tout ;
* les drops sont inutiles ;
* les essais sont trop faciles.

---

# 27. Scoring Space And Strict Resolution Vocabulary

V0.1 scoring values:

| Type | Points | Target space |
|---|---:|---|
| Goal / But | 3 | Below the crossbar, inside the 8m frame. |
| Try / Essai | 3 | Grounding in a legal in-goal grounding zone. |
| Drop | 1 | Above the crossbar, between the posts. |
| Penalty / Penalite | 1 | Above the crossbar, between the posts. |
| Conversion / Transformation | 1 | Only after a try if conversion rules are active. |

The goal frame sits on the goal line. The in-goal grounding zone sits beyond that line. A team cannot score a try behind the goal area or behind the goal frame.

Strict output taxonomy:

GOAL_ATTEMPT:
- GOAL_SCORED;
- SAVED_BY_GOALKEEPER;
- MISSED_FRAME;
- REBOUND_LIVE.

TRY_ATTEMPT:
- TRY_SCORED;
- HELD_UP_BY_GOALKEEPER;
- STOPPED_SHORT;
- LOOSE_BALL_SCRAMBLE.

DROP_ATTEMPT:
- DROP_SCORED;
- DROP_MISSED;
- DROP_CHARGED_DOWN;
- REBOUND_LIVE.

PENALTY_ATTEMPT:
- PENALTY_SCORED;
- PENALTY_MISSED;
- PENALTY_CHARGED_DOWN if applicable.

CONVERSION_ATTEMPT:
- CONVERSION_SCORED;
- CONVERSION_MISSED.

Each resolution type must use exclusive wording. A goal attempt must not mention try grounding. A try attempt must not mention the below-crossbar goal frame. A drop attempt must not mention goal or try scoring. Conversion wording appears only after a conversion attempt.
