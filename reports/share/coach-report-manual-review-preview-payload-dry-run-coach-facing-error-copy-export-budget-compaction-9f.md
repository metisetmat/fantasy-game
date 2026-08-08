# Coach Report Manual Review Preview Payload Dry-Run Coach-Facing Error Copy Export Budget Compaction 9F

Status: PASS
Scope: MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION
Version: MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F

## Baseline 9E Summary
- status 9E: PARTIAL
- export read time before 9F: 817
- error copy count from 9E: 19

## Export Budget Compaction
| Metric | Value |
| --- | --- |
| exportReadTimeSecondsBefore9F | 817 |
| exportReadTimeSecondsAfter9F | 789 |
| exportReadTimeDelta9F | -28 |
| exportErrorCopySectionBeforeSeconds | 55 |
| exportErrorCopySectionAfterSeconds | 27 |
| exportUnder900Seconds | true |
| exportUnder800Seconds | true |
| exportUnder760Seconds | false |
| exportCompactionStatus | compacted_under_800 |
| expectedExportCompactionStatus | compacted_under_800 |

## 9E Copy Preservation
| Metric | Value |
| --- | --- |
| coachFacingErrorCopyCountFrom9E | 19 |
| coachFacingBlockerCopyCountFrom9E | 12 |
| coachFacingRefusalCopyCountFrom9E | 8 |
| compatibleCaseCopyCountFrom9E | 1 |
| error coverage | 19/19 |
| blocker coverage | 12/12 |
| boundary coverage | 14/14 |
| refusal coverage | 8/8 |
| product details preserved | true |
| export summary preserved | true |
| detailed export rows collapsed | true |
| compatible case preserved | true |

## Export Metadata
| Metric | Value |
| --- | --- |
| title mentions 9F | true |
| main id compressed-export-9f | true |
| current data attribute 9F | true |
| cover badge | Export compact 9F |
| metadata false positives | 0 |
| historical 9E preserved | true |
| historical 9D/9C/9B/9A preserved | true |

## No Runtime And Source Of Truth
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
| scoringConstantsChanged | false |
| penaltyShotInactive | true |
| matchBonusEventChanged | false |
| batchLiveSeparationPreserved | true |

## Compaction Guard
| Guard | Value |
| --- | --- |
| compactionAllowed | true |
| exportBudgetPassed | true |
| exportBudgetPassStrongEligible | true |
| productDetailsPreserved | true |
| exportSummaryPreserved | true |
| noRuntimePreserved | true |
| metadataCurrentVersionClean | true |
| violations | none |

## Warnings
- EXPORT_ERROR_COPY_COMPACT_SECTION_VISIBLE
- EXPORT_UNDER_900_READY
- EXPORT_UNDER_800_READY
- PRODUCT_ERROR_COPY_DETAILS_PRESERVED
- ERROR_COPY_COUNTS_PRESERVED
- ERROR_COPY_COVERAGE_PRESERVED
- COMPATIBLE_CASE_NON_ACCEPTED_PRESERVED
- EXPORT_KEY_MESSAGES_PRESERVED
- EXPORT_NO_RUNTIME_GUARD_PRESERVED
- EXPORT_NO_PAYLOAD_ACCEPTED_GUARD_PRESERVED
- EXPORT_NO_PREVIEW_GUARD_PRESERVED
- EXPORT_METADATA_9F_VISIBLE
- EXPORT_COVER_BADGE_9F_READY
- EXPORT_ID_CLEANED_FROM_9E
- SOURCE_OF_TRUTH_PRESERVED
- SCORING_CONSTANTS_UNCHANGED
- MATCH_BONUS_EVENT_UNCHANGED
- EXPORT_KEY_MESSAGES_MISSING

## Recommendation
- recommendation: KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION
- nextSprintRecommendation: MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION

## Required Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share