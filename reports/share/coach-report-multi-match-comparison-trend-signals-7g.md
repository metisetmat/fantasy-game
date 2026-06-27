# Coach Report Multi-Match Comparison & Trend Signals 7G

## Summary
- status: PASS
- scope: COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS
- version: COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_7G
- baselineVersion: PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F
- productReportReady: true
- coachExportReady: true
- trendSignalsReady: true
- historyScopeClean: true
- baselineMetadataConsistent: true
- unresolvedTemplatePlaceholdersRemoved: true
- recommendation: KEEP_MULTI_MATCH_TRENDS_PRUDENT
- nextSprintRecommendation: 7H - Coach Report Team Style Memory & Season Narrative

## Baseline Preservation
| Baseline | Status |
| --- | --- |
| 7F scope/density/wording | PASS |
| 7E tactical map cards | PASS |
| 7D premium layout | PASS |
| 7C action plan packaging | PASS |
| 7B insight depth | PASS |
| 7A product baseline | PASS |
| 6X match economy | PASS |

## Baseline 7A Metadata Repair
| Metric | Value |
| --- | --- |
| baseline7AReportedStatus | PASS |
| baseline7AValidationStatus | PASS |
| baseline7AFailCount | 0 |
| baseline7ACheckCount | 0 |
| baselineStatusMismatchCount | 0 |
| unexplainedFailInPassReportCount | 0 |
| baselineMetadataConsistent | true |

## Placeholder Cleanup Audit
| Metric | Value |
| --- | --- |
| unresolvedTemplatePlaceholderCountBefore | 1 |
| unresolvedTemplatePlaceholderCountAfter | 0 |
| visiblePlaceholderCount | 0 |
| mainBodyPlaceholderCount | 0 |
| exportPlaceholderCount | 0 |
| technicalAppendixPlaceholderCount | 0 |

## Trend Signals
| Metric | Value |
| --- | --- |
| trendSignalCardCount | 3 |
| repeatedTrendSignalCount | 0 |
| visibleOnceTrendSignalCount | 0 |
| unstableTrendSignalCount | 0 |
| insufficientDataTrendSignalCount | 3 |
| officialTrendSignalCount | 3 |
| sandboxTrendInOfficialBodyCount | 0 |
| forcedSelectionTrendCount | 0 |
| forcedTacticalPlanTrendCount | 0 |
| overconfidentTrendClaimCount | 0 |

## Trend Cards
| Trend | Type | Source | Confidence | Samples | Next check | Limitation |
| --- | --- | --- | --- | --- | --- | --- |
| Zone de danger qui revient | insufficient_data | official | medium | 1/1 | A verifier au prochain match: la zone produit-elle encore une deuxieme action controlee ? | Match courant uniquement: donnee insuffisante pour parler de tendance multi-match; ne remplace pas la lecture officielle. |
| Premiere sortie apres recuperation a confirmer | insufficient_data | official | low | 1/1 | A verifier au prochain match: moins de pertes immediates apres recuperation. | Match courant uniquement: donnee insuffisante pour parler de tendance multi-match; pas une conclusion generale. |
| Dernier rempart / rebond encore insuffisant | insufficient_data | official | low | 1/1 | A verifier au prochain match: interventions, rebonds et securisations restent-ils propres ? | Match courant uniquement: volume insuffisant pour parler de tendance multi-match; ne remplace pas la lecture officielle. |

## Trend Prudence Audit
| Metric | Value |
| --- | --- |
| localSampleLanguagePresent | true |
| globalProofClaimCount | 0 |
| definitiveTrendClaimCount | 0 |
| trendAsInstructionCount | 0 |
| trendAsSelectionCount | 0 |
| trendAsOfficialScoreTruthCount | 0 |
| confidenceLabelsPresent | true |
| limitationNotesPresent | true |
| nextMatchChecksPresent | true |

## History Scope Audit
| Metric | Value |
| --- | --- |
| historyMainBodySectionCount | 2 |
| historyTechnicalMainBodySectionCount | 0 |
| persistenceMainBodySectionCount | 0 |
| databaseMainBodySectionCount | 0 |
| calibrationMainBodySectionCount | 0 |
| multiMatchCoachSectionCount | 2 |
| recordDumpVisibleCount | 0 |
| historyScopeClean | true |

## Density Regression Audit
| Metric | Value |
| --- | --- |
| visualDensityScore7F | 87 |
| visualDensityScore7G | 88 |
| visualDensityDelta | 1 |
| mainBodySectionCount7F | 16 |
| mainBodySectionCount7G | 16 |
| exportSectionCount7F | 14 |
| exportSectionCount7G | 14 |
| trendSectionAddedCount | 1 |
| coachReadTimeSeconds7G | 1270 |
| exportReadTimeSeconds7G | 1333 |

## Source-of-Truth Multi-Match Audit
| Metric | Value |
| --- | --- |
| currentMatchOfficialScoreStillAboveFold | true |
| currentMatchSourceOfTruthStillAboveFold | true |
| trendsSeparatedFromCurrentMatchTruth | true |
| historyNotOfficialScoreTruth | true |
| historyNotSelectionTruth | true |
| persistenceNotScoringTruth | true |
| sqliteNotScoringTruth | true |
| trendTruthLeakageCount | 0 |
| unsupportedTruthClaimCount | 0 |

## Product / Export Readiness
| Metric | Value |
| --- | --- |
| productReportReady | true |
| coachExportReady | true |
| reportScopeCleanPreserved | true |
| exportScopeCleanPreserved | true |
| mainBodyCoachOnlyPreserved | true |
| tacticalMapCardsPreserved | true |
| visualDensityControlled | true |
| sourceOfTruthSeparationPreserved | true |

## Match Economy Preservation
| Metric | Value |
| --- | --- |
| status | PASS |
| routeFamilyDiversityPreserved | true |
| guardrailsPreserved | true |
| matchEconomyBaselinePreserved | true |

## Warnings
- COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_COMPLETE
- BASELINE_METADATA_REPAIRED
- NO_UNEXPLAINED_FAIL_IN_PASS_REPORT
- BASELINE_7A_REPAIRED
- TEMPLATE_PLACEHOLDERS_REMOVED
- TREND_SIGNALS_READY
- MULTI_MATCH_COMPARISON_READY
- TREND_PRUDENCE_READY
- HISTORY_SCOPE_CLEAN
- VISUAL_DENSITY_CONTROLLED
- EXPRESS_READ_PRESERVED
- ACTION_PLAN_STILL_PROMINENT
- TACTICAL_MAP_CARDS_PRESERVED
- SOURCE_OF_TRUTH_PRESERVED
- MATCH_ECONOMY_BASELINE_PRESERVED
- REPORT_SCOPE_CLEAN_PRESERVED
- EXPORT_SCOPE_CLEAN_PRESERVED
- MAIN_BODY_COACH_ONLY_PRESERVED
- PRODUCT_REPORT_READY
- COACH_EXPORT_READY
- PRODUCT_BASELINE_READY

## Validation Command
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- KEEP_MULTI_MATCH_TRENDS_PRUDENT
- next: 7H - Coach Report Team Style Memory & Season Narrative