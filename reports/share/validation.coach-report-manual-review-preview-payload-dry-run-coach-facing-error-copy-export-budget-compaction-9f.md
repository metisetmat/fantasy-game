# Validation - Coach Report Manual Review Preview Payload Dry-Run Coach-Facing Error Copy Export Budget Compaction 9F

Status: PASS

## Counts
- exportReadTimeSecondsBefore9F: 817
- exportReadTimeSecondsAfter9F: 789
- exportReadTimeDelta9F: -28
- coachFacingErrorCopyCountFrom9E: 19
- coachFacingBlockerCopyCountFrom9E: 12
- coachFacingRefusalCopyCountFrom9E: 8
- compatibleCaseCopyCountFrom9E: 1
- noRuntimeViolationCount: 0

## Checks
- PASS: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel exists - MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F
- PASS: baseline 9E preserved - true
- PASS: baseline 9D/9C/9B/9A preserved - preserved
- PASS: exportReadTimeSecondsBefore9F is measured - 817
- PASS: exportReadTimeSecondsAfter9F <= 900 - 789
- PASS: exportReadTimeSecondsAfter9F <= 800 - 789
- PASS: exportUnder900Seconds boolean correct - true
- PASS: exportUnder800Seconds boolean correct - true
- PASS: 9E product details preserved - true
- PASS: 9F export compact section visible - true
- PASS: 9E export detailed blocker/refusal rows removed from export - true
- PASS: error copy counts preserved from 9E - 19/12/8
- PASS: coverage counts preserved from 9E - 19/12/14/8
- PASS: compatible case remains not accepted - true
- PASS: export no-runtime guard preserved - true
- PASS: export no-payload-accepted guard preserved - true
- PASS: export no-preview guard preserved - true
- PASS: no validation runtime active - false/0
- PASS: no real payload read or created - 0/false/0
- PASS: no real preview generated or activated - false/0
- PASS: no submit/api/backend/storage/memory created - false
- PASS: no official truth, selection, tactic, score, or timeline mutation - clean
- PASS: export title mentions 9F - true
- PASS: export main id is compressed-export-9f - true
- PASS: export current data attribute is 9F - true
- PASS: export cover badge is Export compact 9F - Export compact 9F
- PASS: historical 9E/9D/9C/9B/9A attrs preserved - preserved
- PASS: metadata false positives after 9F = 0 - 0
- PASS: scoring constants unchanged - false
- PASS: PENALTY_SHOT inactive - true
- PASS: MatchBonusEvent unchanged - false
- PASS: batch/live separation preserved - true
- PASS: compaction guard PASS - PASS
- PASS: share pack PASS - true

## Required Command
- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share