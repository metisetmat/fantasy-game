# Coach Insight Depth & Next-Match Recommendations 7B

## Summary
- status: PASS
- scope: COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS
- version: COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B
- baselineVersion: PRODUCT_BASELINE_COACH_REPORT_READINESS_7A
- matchEconomyBaselinePreserved: true
- productReportReady: true
- coachExportReady: true
- productBaselineReady: true
- recommendation: COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING
- nextSprintRecommendation: 7C - Coach Action Plan Cards & Training Focus Packaging

## Baseline 7A Summary
| Metric | Value |
| --- | --- |
| 7A status | PASS |
| 7A productBaselineReady | true |
| 7A sourceOfTruth | true |
| 7A productReportReady | true |
| 7A coachExportReady | true |

## Baseline 6X Preservation
| Metric | Value |
| --- | --- |
| averageTotalPoints | 22.2 |
| scoringEventsPerMatch | 7.2 |
| scoringOpportunitiesPerMatch | 16.3 |
| closeGameRate | 50% |
| competitiveGameRate | 78% |
| blowoutRate | 14% |
| severeBlowoutRate | 0% |
| routeFamilyDiversityPreserved | true |
| guardrailsPreserved | true |

## Insight Depth Audit
| Metric | Value |
| --- | --- |
| coachInsightCount | 3 |
| deepInsightCount | 3 |
| shallowInsightCount | 0 |
| insightDepthCoverageRate | 100% |
| causeLinkedInsightCount | 3 |
| riskLinkedInsightCount | 3 |
| nextMatchSignalLinkedInsightCount | 3 |
| evidenceLinkedInsightCount | 3 |

## Deep Insight Cards
### Zones de danger et progression
- observation: Le signal principal montre Le rapport officiel met en avant les zones où le danger se répète.
- whyItMatters: C'est important parce que la progression propre donne au coach un repere sur la premiere structure offensive utile.
- probableCause: Cause probable: le porteur trouve une solution proche avant que la pression ne ferme la zone.
- tacticalConsequence: Consequence tactique: l'equipe peut avancer sans transformer chaque recuperation en action forcee.
- riskIfRepeated: Risque si on insiste: trop de soutien proche peut ralentir la sortie et exposer la rest-defense si la perte arrive au mauvais moment.
- nextMatchCheck: A verifier au prochain match: la premiere sortie apres recuperation reste-t-elle propre sous pression ?
- coachAction: Action coach prudente: observer la qualite de la premiere passe avant de transformer ce signal en consigne.
- tradeoff: Tradeoff: securiser la sortie aide la conservation, mais peut reduire la vitesse de projection.
- confidence: medium
### Récupération et première sortie
- observation: Le deuxieme signal indique La qualité de la première sortie après récupération reste un signal de lecture prioritaire.
- whyItMatters: C'est important parce que la deuxieme action decide si le gain initial devient une sequence stable ou une perte rapide.
- probableCause: Cause probable: l'equipe cherche le second ballon ou le relais avant que le bloc adverse ne se replace.
- tacticalConsequence: Consequence tactique: une bonne deuxieme action peut maintenir la pression sans forcer une finition precoce.
- riskIfRepeated: Risque si on insiste: chercher trop vite le second ballon peut ouvrir une transition adverse dans l'axe.
- nextMatchCheck: A verifier au prochain match: les secondes actions augmentent-elles sans exposer l'axe central ?
- coachAction: Action coach prudente: comparer le nombre de secondes actions utiles avec les pertes immediates.
- tradeoff: Tradeoff: attaquer le second ballon augmente le danger, mais demande une couverture plus rigoureuse.
- confidence: medium
### Pression, continuité et réponse du gardien
- observation: Le troisieme signal montre La suite de l'action après pression ou arrêt du gardien doit rester structurée.
- whyItMatters: C'est important parce que la reponse a la pression et au gardien stabilise la fin de sequence.
- probableCause: Cause probable: la ligne de soutien reste disponible quand la premiere option est neutralisee.
- tacticalConsequence: Consequence tactique: l'equipe peut conserver une menace sans confondre continuation et score automatique.
- riskIfRepeated: Risque si on insiste: multiplier les continuations peut user le bloc et laisser des rebonds centraux a defendre.
- nextMatchCheck: A verifier au prochain match: la continuite reste-t-elle lisible apres arret, pression ou rebond ?
- coachAction: Action coach prudente: surveiller si la continuite vient d'un vrai soutien ou d'une lecture opportuniste.
- tradeoff: Tradeoff: prolonger l'action garde la pression, mais peut masquer une fatigue ou une organisation defensive fragile.
- confidence: low

## Next-Match Recommendations
| Metric | Value |
| --- | --- |
| nextMatchRecommendationCount | 3 |
| concreteNextMatchRecommendationCount | 3 |
| vagueNextMatchRecommendationCount | 0 |
| recommendationWithObservableSignalCount | 3 |
| recommendationWithTradeoffCount | 3 |
| recommendationWithTrainingFocusCount | 3 |
| forcedSelectionRecommendationCount | 0 |

## Causality / Evidence Audit
| Metric | Value |
| --- | --- |
| causalClaimCount | 3 |
| supportedCausalClaimCount | 3 |
| unsupportedCausalClaimCount | 0 |
| officialEvidenceLinkedClaimCount | 3 |
| overconfidentCausalClaimCount | 0 |

## Coach Language Audit
| Metric | Value |
| --- | --- |
| coachReadableSentenceCount | 879 |
| technicalSentenceCount | 12 |
| jargonCount | 0 |
| forbiddenWordingCount | 0 |
| overlongParagraphCount | 1 |

## Product / Export Readiness
| Metric | Value |
| --- | --- |
| productReportReady | true |
| coachExportReady | true |
| sourceOfTruthSeparationPreserved | true |
| insightDepthReady | true |
| causalExplanationReady | true |
| nextMatchRecommendationsReady | true |
| coachLanguageReady | true |
| productBaselineReady | true |

## Guardrails
| Guardrail | Value |
| --- | --- |
| guardrailsPreserved | true |
| noScoreManipulationConfirmed | true |
| noPenaltyLeak | true |
| noUnknownScoringFamily | true |
| noPersistenceSqliteScoring | true |
| scoreConstantsUnchanged | true |
| matchBonusEventUnchanged | true |
| batchLiveSeparationPreserved | true |

## Warnings
- DEEP_INSIGHTS_PRESENT
- ACTIONABLE_INSIGHTS_DEEPENED
- NEXT_MATCH_PLAN_VISIBLE
- NEXT_MATCH_RECOMMENDATIONS_CONCRETE
- TRADEOFFS_VISIBLE
- INSIGHT_CAUSALITY_SUPPORTED
- OFFICIAL_DIAGNOSTIC_SANDBOX_SEPARATION_PRESERVED
- PRODUCT_REPORT_READY
- COACH_EXPORT_READY
- MATCH_ECONOMY_BASELINE_PRESERVED
- PRODUCT_BASELINE_READY
- PROFILES_TO_OBSERVE_NOT_FORCED
- SELECTION_PREVIEW_NON_APPLIED_CONFIRMED
- COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_COMPLETE