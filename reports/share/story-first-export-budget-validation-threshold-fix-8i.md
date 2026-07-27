# Story-First Export Budget Validation Threshold Fix 8I

Status: PASS

## Summary
- scope: STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX
- version: STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I
- baselineVersion: COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION_8H
- matchId: contract-fixture-001
- officialScore: 12 - 7
- recommendation: KEEP_STORY_FIRST_EXPORT_BUDGET_FIX
- nextSprintRecommendation: 8J - Coach Report Decision Layer & Next-Match Observation Plan

## Baseline 8H Summary
| Metric | Value |
| --- | --- |
| baseline8H status | PASS |
| baseline8H preserved | true |
| baseline8G preserved | true |
| baseline8F preserved | true |
| baseline6X preserved | true |
| 8H export read time | 1321 |

## Export Budget Before / After
| Metric | Value |
| --- | --- |
| exportReadTimeSecondsBefore8I | 1321 |
| exportReadTimeSecondsAfter8I | 256 |
| exportReadTimeSecondsAfter8J | 256 |
| exportReadTimeDelta | -1065 |
| hardLimitSeconds | 900 |
| idealLimitSeconds | 800 |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |
| exportUnder900SecondsAfter8J | true |
| exportUnder800SecondsAfter8J | true |

## Numeric Threshold Validation Rules
| Rule | Metric | Actual | Operator | Threshold | actualPass | Severity | Message |
| --- | --- | --- | --- | --- | --- | --- | --- |
| export-under-900-hard-limit | exportReadTimeSecondsAfter8I | 256 | less_than_or_equal | 900 | true | blocking | exportReadTimeSecondsAfter8I=256 satisfies less_than_or_equal 900 |
| export-under-800-ideal-limit | exportReadTimeSecondsAfter8I | 256 | less_than_or_equal | 800 | true | partial | exportReadTimeSecondsAfter8I=256 satisfies less_than_or_equal 800 |

## Numeric Validation Honesty
| Metric | Value |
| --- | --- |
| numericRuleCount | 2 |
| numericRulePassCount | 2 |
| numericRuleViolationCount | 0 |
| passMessageOnFailedRuleCount | 0 |
| failedRuleMarkedPassCount | 0 |
| thresholdBooleanMismatchCount | 0 |
| exportUnder900BooleanCorrect | true |
| exportUnder800BooleanCorrect | true |
| validationStatusMatchesThresholds | true |

## Export Content Audit
| Metric | Value |
| --- | --- |
| exportStoryFirstSectionVisible | true |
| coverVisible | true |
| expressReadVisible | true |
| matchIn2MinutesVisible | true |
| replay60SecondsVisible | true |
| truncatedSentenceCount | 0 |
| ellipsisTruncationCount | 0 |
| actionPlanVisible | true |
| actionPlanNonEmpty | true |
| exportActionPlanCardCount | 3 |
| tacticalMapEssentialsVisible | true |
| fullTimelineIncludedInExport | false |
| technicalTraceabilityIncludedInExport | false |
| sandboxPanelIncludedInExport | false |
| longBatchDiagnosticsIncludedInExport | false |
| rawEventIdInMainTextCount | 0 |
| repeatedSourceOfTruthSentenceCount | 2 |

## Replay Wording Cleanup
| Metric | Value |
| --- | --- |
| replay60SecondsVisible | true |
| truncatedSentenceCount | 0 |
| ellipsisTruncationCount | 0 |
| replayMomentTarget | 3 complete score-backed moments |

## Action Plan Restoration
| Metric | Value |
| --- | --- |
| actionPlanVisible | true |
| actionPlanNonEmpty | true |
| exportActionPlanCardCount | 3 |
| target | 2-3 compact action cards |

## Product Preservation
| Metric | Value |
| --- | --- |
| productStoryFirstSectionVisible | true |
| productReplaySectionVisible | true |
| productActionPlanVisible | true |
| productTechnicalDetailsStillAvailable | true |
| productSandboxDetailsStillSeparated | true |
| productRawIdMainTextCount | 5 |
| productStoryFirstOrderPreserved | true |

## Source-Of-Truth Regression
| Metric | Value |
| --- | --- |
| reportUsesOfficialTimelineOnlyForOfficialStory | true |
| reportUsesOfficialScoreOnlyForOfficialScore | true |
| reportScoreMatchesOfficialScore | true |
| allStoryScoreClaimsBackedByScoreChange | true |
| allReplayScoreClaimsBackedByScoreChange | true |
| scoreChangeEventsCoveredByReplayCount | 6 |
| scoreChangeEventCount | 6 |
| sandboxStoryPromotionCount | 0 |
| diagnosticStoryPromotionCount | 0 |
| batchStoryPromotionCount | 0 |
| noScoreMutation | true |
| noEventDeletion | true |

## Mobile / Print Export
| Metric | Value |
| --- | --- |
| exportPrintReady | true |
| exportPageBreaksControlled | true |
| exportNoHorizontalOverflow | true |
| exportCardsStackOnMobile | true |
| exportReplayReadableOnMobile | true |
| exportActionPlanReadableOnMobile | true |
| exportTechnicalAppendixCompact | false |

## Before / After Export Section Order
| Before 8I | After 8I |
| --- | --- |
| Cover / score | Cover / score officiel |
| Story / replay / long evidence / many appendices | Story / replay / action plan / tactical essentials / ultra-compact appendix |
| Long causality and sequence proof in export | Technical proof remains product-only or compact appendix |
| 1321s export budget | 256s export budget |

## Export Excerpts
- Le match en 2 minutes: lass="premium-section" data-source-product-sections="official-match-story-spine"> <h2>Le match en 2 minutes</h2> <p>control marque des la minute 2. blitz repond et garde le match sous tension, puis control reprend l&#39;ecart. Le cumul final 12 - 7 reste lisible meme dans les segments sans score.</p> <div class="grid"><article class="card"><h3>Premier score officiel</h3></article><article class="card"><h3>Score qui installe le resulta
- Replay coach en 60 secondes: y-8e" class="premium-section coach-replay-export-8g" data-replay-ux-version="8G"> <h2>Replay coach en 60 secondes</h2> <ul class="compact-list"><li>CONTROL frappe le premier CONTROL frappe le premier grace au Space Hunter de CONTROL dans axe central. La sequence fait passer le score de 0 - 0 a 3 - 0. Acteur / role: le Space Hunter de CONTROL / Space Hunter. Preuve officielle: 0 - 0 vers 3 - 0.</li><li>BLITZ repond BLITZ reste dans le matc
- Plan d'action coach: /li></ul> </section> <section id="coach-action-plan" class="premium-section"> <h2>Plan d'action coach</h2> <div class="grid"><article class="card action-plan-export-card"><h3>Securiser la première sortie après récupération</h3><ul><li><strong>Observation :</strong> La première sortie reste propre sous pression.</li><li><strong>A travailler :</strong> Les récupérations existent, mais leur valeur depend de la première passe ou du premie

## Match Economy Preservation
| Metric | Value |
| --- | --- |
| averageTotalPointsAfter | 22.2 |
| scoringEventsPerMatchAfter | 7.2 |
| scoringOpportunitiesPerMatchAfter | 16.3 |
| closeGameRateAfter | 50 |
| competitiveGameRateAfter | 78 |
| blowoutRateAfter | 14 |
| severeBlowoutRateAfter | 0 |
| routeFamilyDiversityPreserved | true |
| finalGuardrailsPass | true |

## Guardrails
| Metric | Value |
| --- | --- |
| scoreFromScoreChangeAllRuns | true |
| officialPathConnectedAllRuns | true |
| scoringConstantsChanged | false |
| MatchBonusEventChanged | false |
| scoreCapApplied | false |
| postHocRewriteApplied | false |
| scoringEventsDeleted | false |
| forcedOpponentScoreApplied | false |
| forcedTrailingTeamScoreApplied | false |
| batchLiveSeparationPreserved | true |

## Warnings
- EXPORT_BUDGET_FIXED
- EXPORT_UNDER_900_READY
- EXPORT_UNDER_800_READY
- NUMERIC_THRESHOLD_GUARD_READY
- VALIDATION_HONESTY_READY
- STORY_FIRST_EXPORT_PRESERVED
- REPLAY_EXPORT_PRESERVED
- ACTION_PLAN_EXPORT_PRESERVED
- TACTICAL_MAP_EXPORT_PRESERVED
- TECHNICAL_EXPORT_COMPRESSION_READY
- PRODUCT_STORY_FIRST_PRESERVED
- SOURCE_OF_TRUTH_PRESERVED
- EXPORT_PRINT_READY
- EXPORT_MOBILE_READY
- MATCH_ECONOMY_BASELINE_PRESERVED
- PRODUCT_BASELINE_READY
- STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_COMPLETE

## Exhaustive Validation Command
npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share

## Recommendation
- KEEP_STORY_FIRST_EXPORT_BUDGET_FIX
- 8J - Coach Report Decision Layer & Next-Match Observation Plan