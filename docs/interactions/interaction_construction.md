# Interaction MVP #1 — Sortie de pressing

---

# 1. Objectif tactique

La sortie de pressing représente :

> la capacité d’une équipe à conserver ou faire progresser le ballon malgré une pression adverse organisée.

C’est une interaction fondamentale du moteur.

Elle teste :

* la structure ;
* la cohésion ;
* les soutiens ;
* la maîtrise technique ;
* les décisions sous pression ;
* l’occupation spatiale ;
* le pressing adverse.

---

# 2. Situations typiques

La sortie de pressing apparaît principalement :

| Situation               | Exemple                       |
| ----------------------- | ----------------------------- |
| Récupération basse      | interception en Z2/Z3         |
| Remise en jeu           | touche / engagement           |
| Recyclage sous pression | possession lente              |
| Pressing haut adverse   | bloc adverse agressif         |
| Transition ralentie     | impossibilité de jouer direct |

---

# 3. Philosophie moteur

La sortie de pressing :

* n’est PAS une simple passe ;
* n’est PAS un duel individuel.

C’est :

# une interaction collective contextualisée.

Elle dépend :

* des soutiens ;
* des espaces ;
* de la structure ;
* du timing ;
* du comportement adverse.

Très important.

---

# 4. Acteurs impliqués

## Acteur principal

Le porteur du ballon.

Souvent :

* Hook Link ;
* Tempo Half ;
* Pivot relanceur ;
* Goalkeeper / Free Safety.

---

## Soutiens proches

Typiquement :

* Hook Link ;
* Forward Leader ;
* Tempo Half.

---

## Presseurs adverses

Typiquement :

* Mobile Lock ;
* Forward Leader ;
* Space Hunter.

---

# 5. Déclencheurs moteur

L’interaction démarre lorsque :

```text id="k5h9h7"
ballon en possession
ET
pression >= moyenne
ET
zone != Z6/Z7
```

---

# 6. Inputs individuels offensifs

## Porteur

| Attribut          | Importance     |
| ----------------- | -------------- |
| Vision      | Très haute     |
| Hand Play     | Haute          |
| Ball Carrying | Haute          |
| Composure            | Moyenne        |
| Speed           | Moyenne        |
| Speed           | Faible-Moyenne |

---

## Soutiens

| Attribut     | Importance |
| ------------ | ---------- |
| Vision | Très haute |
| Speed      | Moyenne    |
| Speed      | Moyenne    |
| Hand Play     | Moyenne    |

---

# 7. Inputs individuels défensifs

## Presseurs

| Attribut     | Importance |
| ------------ | ---------- |
| Speed      | Haute      |
| Speed      | Haute      |
| Vision | Haute      |
| Composure       | Moyenne    |
| Power    | Moyenne    |

---

# 8. Propriétés collectives utilisées

## Offensives

| Propriété           | Impact                  |
| ------------------- | ----------------------- |
| Cohésion            | qualité soutien         |
| Mobilité collective | disponibilité solutions |
| derived tactical discipline | respect structure       |
| Lecture collective  | choix weak side         |

---

## Défensives

| Propriété                | Impact                 |
| ------------------------ | ---------------------- |
| Compression défensive    | réduction espace       |
| Synchronisation pressing | pièges                 |
| Transition défensive     | vitesse réorganisation |

---

# 9. Consignes influentes

## Offensives

| Consigne        | Effet                |
| --------------- | -------------------- |
| Verticalité     | recherche jeu direct |
| Risque          | prise initiative     |
| Collectif       | recherche soutien    |
| Usage pied/main | type sortie          |

---

## Défensives

| Consigne | Effet                        |
| -------- | ---------------------------- |
| Pressing | intensité                    |
| Bloc     | hauteur récupération         |
| Marquage | chasse porteur vs couverture |

---

# 10. Contexte spatial

Très important.

La difficulté dépend énormément :

* du couloir ;
* de la densité ;
* des weak sides ;
* de la proximité ligne touche.

---

# Cas défavorables

| Situation            | Effet         |
| -------------------- | ------------- |
| Coin terrain         | pression ++   |
| Couloir fermé        | options --    |
| Bloc compact adverse | difficulté ++ |

---

# Cas favorables

| Situation                    | Effet        |
| ---------------------------- | ------------ |
| Weak side libre              | bonus sortie |
| Supériorité numérique locale | bonus        |
| Soutien diagonal disponible  | bonus        |

---

# 11. Niveaux de pression

## Pression faible

Le joueur dispose :

* de temps ;
* d’espace ;
* de plusieurs solutions.

Faible variance.

---

## Pression moyenne

Sweet spot.

Le moteur valorise :

* intelligence ;
* mental ;
* qualité technique ;
* soutien.

Zone la plus intéressante tactiquement.

---

## Pression forte

Le joueur :

* manque de temps ;
* manque d’espace ;
* risque turnover immédiat.

Variance élevée.

---

# 12. Choix possibles du porteur

Le moteur choisit une option selon :

* rôle ;
* consignes ;
* contexte ;
* attributs ;
* soutien disponible.

---

# Choix possibles

| Action            | Description     |
| ----------------- | --------------- |
| Passe courte main | continuité      |
| Passe courte pied | sortie rapide   |
| Conduite pied     | fixation        |
| Jeu long          | renversement    |
| Dégagement        | survie          |
| Duel individuel   | casser pression |

---

# 13. Résolution moteur

Le moteur compare :

```text id="o0m8sk"
capacité_sortie
VS
capacité_pressing
```

Puis applique :

* pression ;
* fatigue ;
* variance ;
* espace disponible.

---

# 14. Résultats possibles

## Succès majeur

L’équipe :

* casse le pressing ;
* progresse ;
* désorganise adversaire.

Conséquence :
transition offensive potentielle.

---

## Succès mineur

L’équipe :

* conserve ;
* recycle ;
* ralentit rythme.

---

## Équilibre

Pression continue.

Nouvelle interaction immédiate.

---

## Échec mineur

* ballon ralenti ;
* dégagement forcé ;
* recul territorial.

---

## Échec majeur

Turnover dangereux.

Très important :
souvent déclenche :
transition offensive adverse.

---

# 15. Effets secondaires

## Fatigue offensive

Plus forte si :

* pression intense ;
* nombreuses courses soutien ;
* jeu chaos.

---

## Fatigue défensive

Plus forte si :

* pressing raté ;
* longues séquences ;
* nombreuses accélérations.

---

## Effets structurels

Une sortie réussie peut :

* casser bloc ;
* ouvrir weak side ;
* créer déséquilibre.

---

# 16. Impact tempo

## Sortie propre

→ tempo maîtrisé.

---

## Sortie verticale

→ tempo augmente fortement.

---

## Échec

→ chaos augmente.

---

# 17. Importance émotionnelle

Cette interaction doit produire :

* tension ;
* sensation d’étouffement ;
* soulagement ;
* bascules brutales.

Très important.

---

# 18. Narration type

## Succès propre

> “Les Ravens résistent parfaitement au pressing haut et trouvent le demi-espace gauche grâce à une circulation rapide.”

---

## Sortie verticale

> “Le Tempo Half casse deux lignes avec un jeu au pied tendu. Les Wolves peuvent partir en transition.”

---

## Pressing réussi

> “Énorme pression des Blitzers ! Le ballon est récupéré sur la ligne des 30 mètres.”

---

## Dégagement forcé

> “Sous pression constante, le Goalkeeper / Free Safety choisit de dégager loin devant.”

---

# 19. Ce que cette interaction doit révéler

Elle doit permettre :

* d’identifier les équipes organisées ;
* de révéler les équipes chaotiques ;
* de voir les différences de style ;
* d’observer la fatigue ;
* de sentir la qualité collective.

Très important.

---

# 20. Critères de succès spécifiques

## Succès si :

* les équipes fortes sous pression sont reconnaissables ;
* le pressing produit des effets visibles ;
* les weak sides émergent naturellement ;
* les turnovers semblent logiques ;
* les styles influencent fortement les sorties.

---

# Échec si :

* tout le monde sort facilement ;
* personne ne sort jamais ;
* les turnovers semblent RNG ;
* les styles ne changent rien ;
* les rôles sont invisibles.
