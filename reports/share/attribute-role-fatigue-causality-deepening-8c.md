# Attribute Role Fatigue Causality Deepening 8C

## Summary
- status: PASS
- scope: ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING
- version: ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C
- baselineVersion: MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B
- matchId: contract-fixture-001
- official score: 12 - 7
- officialCausalityLayerReady: true
- attributeCausalityReady: true
- roleCausalityReady: true
- fatigueCausalityReady: true
- strategyCausalityReady: true
- coachReadableCausalityReady: true
- recommendation: KEEP_OFFICIAL_MATCH_STORY_SPINE
- nextSprintRecommendation: 8D - Match Storyline Immersion & Coach Replay View

## Baseline Preservation
| Baseline | Preserved |
| --- | --- |
| 8B chronology/cumulative score/narrative quality | true |
| 8A official story spine | true |
| 7H export cleanup | true |
| 6X match economy | true |
| guardrails | true |
| product baseline | true |

## Official Attribute / Role / Fatigue Causality Summary
| Metric | Value |
| --- | --- |
| officialCausalityLinkCount | 18 |
| attributeCausalityCount | 2 |
| roleCausalityCount | 2 |
| fatigueCausalityCount | 4 |
| tacticalPlanCausalityCount | 18 |
| pressureCausalityCount | 0 |
| zoneAccessCausalityCount | 6 |
| playerImpactCausalityCount | 2 |
| unsupportedCausalityClaimCount | 0 |
| inventedCausalityClaimCount | 0 |

## Official Causality Evidence Facts
| Type | Cause | Effect | Player | Role | Zone | Confidence | Event |
| --- | --- | --- | --- | --- | --- | --- | --- |
| fatigue | Condition ou fraicheur visible autour de control | une qualite de sequence a confirmer | none | none | Z3-C | low | contract-fixture-001-segment-1-start |
| fatigue | Condition ou fraicheur visible autour de blitz | une qualite de sequence a confirmer | none | none | Z5-HSR | medium | contract-fixture-001-segment-1-sequence-1 |
| score_sequence | control relie l'action au score_change officiel | un changement de score officiel | none | none | Z3-C | high | contract-fixture-001-segment-1-score-1 |
| fatigue | Condition ou fraicheur visible autour de blitz | une qualite de sequence a confirmer | none | none | Z3-C | medium | contract-fixture-001-segment-1-sequence-3 |
| fatigue | Condition ou fraicheur visible autour de control | une qualite de sequence a confirmer | none | none | Z3-C | medium | contract-fixture-001-segment-1-sequence-4 |
| fatigue | Condition ou fraicheur visible autour de blitz | une qualite de sequence a confirmer | none | none | Z3-C | medium | contract-fixture-001-segment-1-sequence-6 |
| fatigue | Condition ou fraicheur visible autour de control | une qualite de sequence a confirmer | none | none | Z3-C | medium | contract-fixture-001-segment-2-sequence-2 |
| fatigue | Condition ou fraicheur visible autour de blitz | une qualite de sequence a confirmer | none | none | Z3-C | medium | contract-fixture-001-segment-2-sequence-4 |
| score_sequence | control relie l'action au score_change officiel | un changement de score officiel | none | none | Z3-C | high | contract-fixture-001-segment-2-score-1 |
| score_sequence | Blitz Goalkeeper relie l'action au score_change officiel | un changement de score officiel | blitz-gk | goalkeeper_free_safety | Z2-C | high | segment-2-route-family-try_touchdown-blitz |
| score_sequence | Blitz Goalkeeper relie l'action au score_change officiel | un changement de score officiel | blitz-gk | goalkeeper_free_safety | Z2-C | high | segment-2-route-family-conversion_goal-blitz |
| fatigue | Condition ou fraicheur visible autour de blitz | une qualite de sequence a confirmer | none | none | Z3-C | medium | contract-fixture-001-segment-3-sequence-4 |

## Player Impact Causality
| Player | Role | Impact | Evidence | Limitation |
| --- | --- | --- | --- | --- |
| blitz-gk | goalkeeper_free_safety | score_created | segment-2-route-family-try_touchdown-blitz | Le lien est visible dans la timeline officielle. |
| blitz-gk | goalkeeper_free_safety | score_created | segment-2-route-family-conversion_goal-blitz | Le lien est visible dans la timeline officielle. |

## Role Causality
| Role | Player | Function | Effect | Evidence |
| --- | --- | --- | --- | --- |
| goalkeeper_free_safety | blitz-gk | goalkeeper_free_safety | un changement de score officiel | segment-2-route-family-try_touchdown-blitz |
| goalkeeper_free_safety | blitz-gk | goalkeeper_free_safety | un changement de score officiel | segment-2-route-family-conversion_goal-blitz |

## Attribute Causality
| Metric | Value |
| --- | --- |
| attributeSnapshotAvailable | true |
| attributeCausalityCount | 2 |
| attributeClaimWithoutSnapshotCount | 0 |
| attributeClaimWithoutEventCount | 0 |
| attributeNameCoverageCount | 6 |

## Fatigue Causality
| Metric | Value |
| --- | --- |
| fatigueSignalsAvailable | true |
| fatigueCausalityCount | 4 |
| fatigueVisibleButNotCausalCount | 0 |
| fatigueClaimWithoutSignalCount | 0 |
| fatigueInStoryWithoutEvidenceCount | 0 |

## Strategy / Pressure / Zone Causality
| Metric | Value |
| --- | --- |
| tacticalPlanCausalityCount | 6 |
| pressureCausalityCount | 0 |
| zoneAccessCausalityCount | 6 |
| planClaimWithoutObservedEffectCount | 0 |
| pressureClaimWithoutEventCount | 0 |
| zoneClaimWithoutEventCount | 0 |

## Causal Narrative Quality Audit
| Metric | Value |
| --- | --- |
| shortCausalNarrativeAvailable | true |
| coachFacingCausalSummaryAvailable | true |
| causalSentenceWithoutEvidenceCount | 0 |
| mechanicalCausalSentenceCount | 0 |
| metricDumpCausalSentenceCount | 0 |
| technicalJargonCount | 0 |
| narrativeFlowScore | 95 |
| causalClarityScore | 92 |
| coachReadabilityScore | 94 |

## Source-Of-Truth Causality Audit
| Metric | Value |
| --- | --- |
| causalityUsesOfficialTimelineOnly | true |
| causalityUsesOfficialScoreOnly | true |
| allCausalScoreClaimsBackedByScoreChange | true |
| sandboxExcludedFromOfficialCausality | true |
| batchExcludedFromOfficialCausality | true |
| diagnosticSeparatedFromOfficialCausality | true |
| inventedCausalityCount | 0 |

## Report Integration Budget Audit
| Metric | Value |
| --- | --- |
| productCausalitySectionVisible | true |
| exportCausalitySectionVisible | true |
| exportReadTimeSecondsBefore8C | 894 |
| exportReadTimeSecondsAfter8C | 688 |
| exportReadTimeDelta | -206 |
| exportUnder900Seconds | true |
| exportCausalityCardCount | 2 |
| productCausalityCardCount | 2 |

## Short Causal Narrative Excerpt
Condition ou fraicheur visible autour de blitz pese sur une qualite de sequence a confirmer (piste solide, preuve: contract-fixture-001-segment-1-sequence-1). control relie l'action au score_change officiel pese sur un changement de score officiel (lien visible, preuve: contract-fixture-001-segment-1-score-1). Condition ou fraicheur visible autour de blitz pese sur une qualite de sequence a confirmer (piste solide, preuve: contract-fixture-001-segment-1-sequence-3).

## Coach-Facing Causal Summary Excerpt
Condition ou fraicheur visible autour de blitz pese sur une qualite de sequence a confirmer; source officielle contract-fixture-001-segment-1-sequence-1; confiance medium. control relie l'action au score_change officiel pese sur un changement de score officiel; source officielle contract-fixture-001-segment-1-score-1; confiance high. Condition ou fraicheur visible autour de blitz pese sur une qualite de sequence a confirmer; source officielle contract-fixture-001-segment-1-sequence-3; confiance medium.

## Guardrails
| Guardrail | Value |
| --- | --- |
| scoreFromScoreChangeAllRuns | true |
| officialPathConnectedAllRuns | true |
| scoringConstantsUnchanged | true |
| MatchBonusEventUnchanged | true |
| batchLiveSeparationPreserved | true |
| noScoreCap | true |
| noRewrite | true |
| noDeletion | true |

## Warnings
- OFFICIAL_CAUSALITY_LAYER_READY
- ATTRIBUTE_CAUSALITY_READY
- ROLE_CAUSALITY_READY
- FATIGUE_CAUSALITY_READY
- STRATEGY_CAUSALITY_READY
- ZONE_ACCESS_CAUSALITY_READY
- PLAYER_IMPACT_CAUSALITY_READY
- COACH_READABLE_CAUSALITY_READY
- SOURCE_OF_TRUTH_PRESERVED
- EXPORT_LENGTH_PRESERVED
- MATCH_ECONOMY_BASELINE_PRESERVED
- ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_COMPLETE

## Recommendation
- KEEP_OFFICIAL_MATCH_STORY_SPINE
- next: 8D - Match Storyline Immersion & Coach Replay View