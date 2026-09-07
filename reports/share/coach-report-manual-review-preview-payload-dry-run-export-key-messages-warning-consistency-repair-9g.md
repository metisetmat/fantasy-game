# Coach Report Manual Review Preview Payload Dry-Run Export Key Messages Warning Consistency Repair 9G

Status: PASS
Scope: MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR
Version: MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G

## Baseline 9F Summary
- status 9F: PASS
- contradiction before 9G: 1
- exportReadTimeSecondsBefore9G: 789

## Key Messages Audit
| Metric | Value |
| --- | --- |
| expected | 7 |
| detected | 7 |
| missing | 0 |
| preserved | true |
| missing flag | false |
| detected list | source_non_autorisee, scope_incorrect, official_truth_interdite, stockage_api_interdit, mutation_score_timeline_interdite, automation_interdite, engine_learning_interdit |
| missing list | none |

## Warning Consistency Before After
| Metric | Before | After |
| --- | --- | --- |
| EXPORT_KEY_MESSAGES_PRESERVED | true | true |
| EXPORT_KEY_MESSAGES_MISSING | true | false |
| contradiction count | 1 | 0 |

## Mutual Exclusion Guard
| Guard | Value |
| --- | --- |
| warningMutualExclusionGuardReady | true |
| warningMutualExclusionGuardPassed | true |
| preservedAndMissingSimultaneousCount | 0 |
| warningRegistryConflictCount | 0 |
| warningAggregationConflictCount | 0 |
| warningStatusConsistencyStatus | clean |

## Export Budget
| Metric | Value |
| --- | --- |
| exportReadTimeSecondsBefore9G | 789 |
| exportReadTimeSecondsAfter9G | 797 |
| exportReadTimeDelta9G | 8 |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |
| exportUnder760Seconds | false |
| exportCompactionStatusFrom9F | compacted_under_800 |

## 9F Preservation
| Metric | Value |
| --- | --- |
| baseline9FPreserved | true |
| productCopyDetailsPreserved | true |
| exportCompactCopyPreserved | true |
| exportDetailedCopyRowsRemainCollapsed | true |
| exportCompatibleCasePreserved | true |
| exportNoRuntimeGuardPreserved | true |

## 9E Copy Preservation
| Metric | Value |
| --- | --- |
| coachFacingErrorCopyCountFrom9E | 19 |
| coachFacingBlockerCopyCountFrom9E | 12 |
| coachFacingRefusalCopyCountFrom9E | 8 |
| compatibleCaseCopyCountFrom9E | 1 |
| coverage | 19/12/14/8 |
| compatible case not accepted | true |

## Metadata
| Metric | Value |
| --- | --- |
| exportTitleMentions9G | true |
| exportMainIdIs9G | true |
| exportCurrentDataAttributeVisible | true |
| exportCoverBadgeText | Export compact 9G |
| metadataFalsePositiveCountAfter9G | 0 |
| historical 9F/9E/9D/9C/9B/9A | true |

## No Runtime Audit
| Guard | Value |
| --- | --- |
| validationRuntimeActive | false |
| realPayloadReadCount | 0 |
| payloadCreated | false |
| dryRunAcceptedPayloadCount | 0 |
| realPreviewGenerated | false |
| previewActivationCount | 0 |
| submit/api/backend/storage/memory | false/false/false/false/false |
| officialTruthPromoted | false |
| selection/tactic | false/false |
| score/timeline/score_change/event | 0/0/0/0 |

## Source Of Truth Audit
| Guard | Value |
| --- | --- |
| sourceOfTruthSeparationPreserved | true |
| matchEconomyBaselinePreserved | true |
| guardrailsPreserved | true |
| scoringConstantsChanged | false |
| penaltyShotInactive | true |
| matchBonusEventChanged | false |
| batchLiveSeparationPreserved | true |

## Warnings Final List
- EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_COMPLETE
- EXPORT_KEY_MESSAGES_AUDIT_READY
- EXPORT_KEY_MESSAGES_ALL_PRESENT
- EXPORT_KEY_MESSAGES_PRESERVED
- EXPORT_KEY_MESSAGES_MISSING_SUPPRESSED_CORRECTLY
- WARNING_CONTRADICTION_COUNT_ZERO
- WARNING_MUTUAL_EXCLUSION_GUARD_READY
- BASELINE_9F_PRESERVED
- BASELINE_9E_PRESERVED
- EXPORT_UNDER_900_READY
- EXPORT_UNDER_800_READY
- EXPORT_BUDGET_9F_PRESERVED
- PRODUCT_ERROR_COPY_DETAILS_PRESERVED
- EXPORT_COMPACT_COPY_PRESERVED
- EXPORT_METADATA_9G_VISIBLE
- EXPORT_COVER_BADGE_9G_READY
- NO_RUNTIME_VALIDATION
- NO_PAYLOAD_READ
- NO_PAYLOAD_CREATED
- NO_PAYLOAD_ACCEPTED
- NO_PREVIEW_GENERATED
- NO_PERSISTENCE
- NO_OFFICIAL_TRUTH
- NO_SELECTION_OR_TACTIC
- NO_SCORE_TIMELINE_MUTATION
- SOURCE_OF_TRUTH_PRESERVED
- SCORING_CONSTANTS_UNCHANGED
- MATCH_BONUS_EVENT_UNCHANGED
- WARNING_MUTUAL_EXCLUSION_GUARD_PASSED
- WARNING_STATUS_CONSISTENCY_CLEAN

## Recommendation
- recommendation: KEEP_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR
- nextSprintRecommendation: MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION

## Required Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share