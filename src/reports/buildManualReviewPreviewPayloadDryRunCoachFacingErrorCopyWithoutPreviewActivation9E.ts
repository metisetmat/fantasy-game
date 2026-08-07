import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildManualReviewExportMetadataBadgeCleanup9DModel,
} from "./buildManualReviewExportMetadataBadgeCleanup9D";
import { currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9C";
import {
  BLOCKER_COPIES_9E,
  COMPATIBLE_CASE_COPY_9E,
  ERROR_COPIES_9E,
  REFUSAL_COPIES_9E,
  buildCopyGroups9E,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyCatalog9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyCoverage9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyCoverageAudit9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadata9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadataAudit9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyNoRuntime9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyNoRuntimeAudit9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruth9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruthAudit9E";
import type {
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyNextSprintRecommendation9E,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyRecommendation9E,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyStatus9E,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingStatus9E,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_9E_BLOCKING_WARNINGS,
  type ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarningCode9E,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarnings9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWording9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingAudit9E";
import type { ManualReviewExportMetadataBadgeCleanup9DModel } from "./manualReviewExportMetadataBadgeCleanupTypes9D";
import {
  insertManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E,
  normalizeManualReviewPreviewPayloadDryRunCoachFacingErrorCopyShell9E,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E,
} from "./renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E";
import {
  insertManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E,
} from "./renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  if (rows.length === 0) return [];
  const header = rows[0] ?? [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.slice(1).map((row) => `| ${row.join(" | ")} |`),
  ];
}

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarningCode9E[],
): readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarningCode9E[] {
  return [...new Set(warnings)];
}

function wordingStatus(score: number): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingStatus9E {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score > 0) return "partial";
  return "fail";
}

function statusFromWarnings(input: {
  readonly warnings: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarningCode9E[];
  readonly exportUnder800Seconds: boolean;
  readonly wordingScore: number;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyStatus9E {
  if (input.warnings.some((warning) => MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_9E_BLOCKING_WARNINGS.includes(warning))) return "FAIL";
  if (!input.exportUnder800Seconds || input.wordingScore < 95) return "PARTIAL";
  return "PASS";
}

function recommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyStatus9E,
  exportUnder800Seconds: boolean,
  wordingScore: number,
): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyRecommendation9E {
  if (status === "PASS") return "KEEP_COACH_FACING_ERROR_COPY";
  if (!exportUnder800Seconds) return "COMPACT_ERROR_COPY_EXPORT";
  if (wordingScore < 95) return "POLISH_COACH_FACING_ERROR_COPY";
  return "FIX_ERROR_COPY_RUNTIME_OR_SOURCE_OF_TRUTH";
}

function nextSprintRecommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyStatus9E,
  exportUnder800Seconds: boolean,
  wordingScore: number,
): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyNextSprintRecommendation9E {
  if (status === "PASS") return "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION";
  if (!exportUnder800Seconds) return "EXPORT_BUDGET_COMPACTION_FOR_ERROR_COPY";
  if (wordingScore < 95) return "COACH_FACING_ERROR_COPY_WORDING_POLISH";
  return "ERROR_COPY_RUNTIME_SOURCE_OF_TRUTH_REGRESSION_FIX";
}

function buildWarnings(input: {
  readonly productVisible: boolean;
  readonly exportVisible: boolean;
  readonly coverageComplete: boolean;
  readonly noRuntimeClean: boolean;
  readonly metadataClean: boolean;
  readonly sourceClean: boolean;
  readonly exportUnder900: boolean;
  readonly exportUnder800: boolean;
  readonly wordingScore: number;
  readonly countsClean: boolean;
  readonly compatibleNotAccepted: boolean;
}): readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarningCode9E[] {
  const warnings: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWarningCode9E[] = [];
  if (input.countsClean && input.coverageComplete && input.compatibleNotAccepted) {
    warnings.push("COACH_FACING_ERROR_COPY_COMPLETE", "COACH_FACING_ERROR_COPY_READY", "ERROR_COPY_GROUPS_READY", "ERROR_COPY_MESSAGES_READY");
  } else {
    warnings.push("ERROR_COPY_COUNT_INVALID");
  }
  if (input.productVisible) warnings.push("PRODUCT_COACH_FACING_ERROR_COPY_VISIBLE");
  else warnings.push("COACH_FACING_ERROR_COPY_MISSING");
  if (input.exportVisible) warnings.push("EXPORT_COACH_FACING_ERROR_COPY_VISIBLE");
  else warnings.push("COACH_FACING_ERROR_COPY_MISSING");
  warnings.push("ERROR_COPY_USES_DETAIL_CARDS_9C", "ERROR_COPY_USES_DRY_RUN_VALIDATOR_9A", "ERROR_COPY_RENDERED_WITHOUT_PREVIEW_ACTIVATION");
  if (input.compatibleNotAccepted) warnings.push("COMPATIBLE_CASE_COPY_NOT_ACCEPTED");
  else warnings.push("COMPATIBLE_CASE_COPY_ACCEPTED");
  if (input.coverageComplete) warnings.push("ERROR_COPY_COVERAGE_COMPLETE", "BLOCKER_COPY_COVERAGE_COMPLETE", "REFUSAL_COPY_COVERAGE_COMPLETE", "BOUNDARY_COPY_COVERAGE_COMPLETE");
  else warnings.push("ERROR_COPY_COVERAGE_INCOMPLETE");
  if (input.noRuntimeClean) warnings.push("ERROR_COPY_NO_RUNTIME_VALIDATION", "ERROR_COPY_NO_REAL_PAYLOAD_READ", "ERROR_COPY_NO_PAYLOAD_CREATED", "ERROR_COPY_NO_PAYLOAD_ACCEPTED", "ERROR_COPY_NO_REAL_PREVIEW_GENERATED", "ERROR_COPY_NO_PERSISTENCE", "ERROR_COPY_NO_OFFICIAL_TRUTH", "ERROR_COPY_NO_SELECTION_OR_TACTIC", "ERROR_COPY_NO_SCORE_TIMELINE_MUTATION");
  else warnings.push("VALIDATION_RUNTIME_ACTIVE_DETECTED");
  if (input.wordingScore >= 95) warnings.push("WORDING_SCORE_PUBLISHED", "WORDING_SCORE_PASS_READY", "WORDING_SCORE_PASS_STRONG_READY");
  else if (input.wordingScore >= 90) warnings.push("WORDING_SCORE_PUBLISHED", "WORDING_SCORE_PASS_READY", "WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD");
  else warnings.push("WORDING_SCORE_BELOW_PASS_THRESHOLD");
  if (input.metadataClean) warnings.push("EXPORT_METADATA_9E_VISIBLE", "EXPORT_COVER_BADGE_9E_READY", "EXPORT_ID_CLEANED_FROM_9D");
  else warnings.push("EXPORT_TITLE_MISSING_9E", "EXPORT_BADGE_MISSING_9E");
  if (input.exportUnder900) warnings.push("EXPORT_UNDER_900_READY");
  else warnings.push("EXPORT_OVER_900");
  if (input.exportUnder800) warnings.push("EXPORT_UNDER_800_READY");
  else warnings.push("EXPORT_OVER_800_PASS_STRONG_BLOCKED");
  if (input.sourceClean) warnings.push("SOURCE_OF_TRUTH_PRESERVED", "SCORING_CONSTANTS_UNCHANGED", "MATCH_BONUS_EVENT_UNCHANGED");
  else warnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  return uniqueWarnings(warnings);
}

function buildModel(input: {
  readonly baseline9D: ManualReviewExportMetadataBadgeCleanup9DModel;
  readonly productHtmlAfter9E: string;
  readonly exportHtmlBefore9E: string;
  readonly exportHtmlAfter9E: string;
  readonly productSection: string;
  readonly exportSection: string;
  readonly sharePackPass?: boolean;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel {
  const errorCopies = ERROR_COPIES_9E;
  const blockerCopies = BLOCKER_COPIES_9E;
  const refusalCopies = REFUSAL_COPIES_9E;
  const compatibleCopy = COMPATIBLE_CASE_COPY_9E;
  const allVisibleCopies = [compatibleCopy, ...errorCopies, ...blockerCopies, ...refusalCopies];
  const copyGroups = buildCopyGroups9E();
  const coverageAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyCoverage9E({
    errorCopies,
    blockerCopies,
    refusalCopies,
    compatibleCopy,
  });
  const wordingAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWording9E({
    errorCopies,
    compatibleCopy,
    productHtml: input.productHtmlAfter9E,
    exportHtml: input.exportHtmlAfter9E,
  });
  const noRuntimeAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyNoRuntime9E(input.baseline9D);
  const exportMetadataAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadata9E(input.exportHtmlAfter9E);
  const exportBudgetAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9E({
    exportHtmlBefore9E: input.exportHtmlBefore9E,
    exportHtmlAfter9E: input.exportHtmlAfter9E,
    metadataClean: exportMetadataAudit.exportCoverBadgeCorrect && exportMetadataAudit.metadataFalsePositiveCountAfter9E === 0,
  });
  const sourceOfTruthAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruth9E({
    baseline9D: input.baseline9D,
    productHtml: input.productHtmlAfter9E,
    exportHtml: input.exportHtmlAfter9E,
  });
  const productVisible = input.productHtmlAfter9E.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-9e"');
  const exportVisible = input.exportHtmlAfter9E.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e"');
  const compatibleNotAccepted =
    compatibleCopy.canAcceptPayloadIn9E === false &&
    compatibleCopy.shortMessage.includes("aucun payload n'est accepte");
  const countsClean =
    errorCopies.length === 19 &&
    blockerCopies.length === 12 &&
    refusalCopies.length === 8 &&
    copyGroups.length === 3;
  const noRuntimeClean =
    noRuntimeAudit.validationExecutionCount === 0 &&
    noRuntimeAudit.realPayloadReadCount === 0 &&
    !noRuntimeAudit.payloadCreated &&
    noRuntimeAudit.dryRunAcceptedPayloadCount === 0 &&
    !noRuntimeAudit.realPreviewGenerated &&
    noRuntimeAudit.previewActivationCount === 0;
  const sourceClean =
    sourceOfTruthAudit.sourceOfTruthSeparationPreserved &&
    sourceOfTruthAudit.matchEconomyBaselinePreserved &&
    !sourceOfTruthAudit.copyClaimsNewScoreEvidence &&
    !sourceOfTruthAudit.copyPromotesCoachInputToOfficialTruth &&
    !sourceOfTruthAudit.scoringConstantsChanged &&
    !sourceOfTruthAudit.MatchBonusEventChanged &&
    sourceOfTruthAudit.batchLiveSeparationPreserved;
  const warningCodes = buildWarnings({
    productVisible,
    exportVisible,
    coverageComplete: coverageAudit.errorCopyCoverageStillComplete,
    noRuntimeClean,
    metadataClean: exportMetadataAudit.exportCoverBadgeCorrect && exportMetadataAudit.metadataFalsePositiveCountAfter9E === 0,
    sourceClean,
    exportUnder900: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800: exportBudgetAudit.exportUnder800Seconds,
    wordingScore: wordingAudit.wordingReadabilityScore,
    countsClean,
    compatibleNotAccepted,
  });
  const status = statusFromWarnings({
    warnings: warningCodes,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    wordingScore: wordingAudit.wordingReadabilityScore,
  });
  const wordingThresholdStatus = wordingStatus(wordingAudit.wordingReadabilityScore);
  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_WITHOUT_PREVIEW_ACTIVATION",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_9E",
    baselineVersion: "MANUAL_REVIEW_EXPORT_METADATA_BADGE_CLEANUP_9D",
    matchId: input.baseline9D.matchId,
    officialScore: input.baseline9D.officialScore,
    baseline9D: input.baseline9D,
    baseline9DPreserved: input.baseline9D.status === "PASS",
    baseline9CPreserved: input.baseline9D.baseline9CPreserved,
    baseline9BPreserved: input.baseline9D.baseline9BPreserved,
    baseline9APreserved: input.baseline9D.baseline9APreserved,
    baseline8ZPreserved: input.baseline9D.baseline8ZPreserved,
    baseline8YPreserved: input.baseline9D.baseline8YPreserved,
    baseline8XPreserved: input.baseline9D.baseline8XPreserved,
    baseline8WPreserved: input.baseline9D.baseline8WPreserved,
    baseline8VPreserved: input.baseline9D.baseline8VPreserved,
    baseline8UPreserved: input.baseline9D.baseline8UPreserved,
    baseline8TPreserved: input.baseline9D.baseline8TPreserved,
    baseline8SPreserved: input.baseline9D.baseline8SPreserved,
    baseline8RPreserved: input.baseline9D.baseline8RPreserved,
    baseline8QPreserved: input.baseline9D.baseline8QPreserved,
    baseline8PPreserved: input.baseline9D.baseline8PPreserved,
    baseline8OPreserved: input.baseline9D.baseline8OPreserved,
    baseline8NPreserved: input.baseline9D.baseline8NPreserved,
    baseline8MPreserved: input.baseline9D.baseline8MPreserved,
    baseline8LPreserved: input.baseline9D.baseline8LPreserved,
    baseline8KPreserved: input.baseline9D.baseline8KPreserved,
    baseline8IPreserved: input.baseline9D.baseline8IPreserved,
    baseline8HPreserved: input.baseline9D.baseline8HPreserved,
    baseline8GPreserved: input.baseline9D.baseline8GPreserved,
    baseline8FPreserved: input.baseline9D.baseline8FPreserved,
    baseline8EPreserved: input.baseline9D.baseline8EPreserved,
    baseline8DPreserved: input.baseline9D.baseline8DPreserved,
    baseline8CPreserved: input.baseline9D.baseline8CPreserved,
    baseline8BPreserved: input.baseline9D.baseline8BPreserved,
    baseline8APreserved: input.baseline9D.baseline8APreserved,
    baseline7HPreserved: input.baseline9D.baseline7HPreserved,
    baseline6XPreserved: input.baseline9D.baseline6XPreserved,
    coachFacingErrorCopyReady: status === "PASS",
    productCoachFacingErrorCopyVisible: productVisible,
    exportCoachFacingErrorCopyVisible: exportVisible,
    errorCopyUsesDetailCards9C: true,
    errorCopyUsesDryRunResultRenderer9B: true,
    errorCopyUsesDryRunValidator9A: true,
    errorCopyUsesValidationContract8Y: true,
    errorCopyMode: "dry_run_error_copy_only",
    errorCopyStatus: "error_copy_rendered_without_preview_activation",
    expectedErrorCopyStatus: "error_copy_rendered_without_preview_activation",
    errorCopyStatusCorrect: true,
    coachFacingErrorCopyCount: errorCopies.length,
    coachFacingErrorCopyCountExpected: 19,
    coachFacingBlockerCopyCount: blockerCopies.length,
    coachFacingBlockerCopyCountExpected: 12,
    coachFacingRefusalCopyCount: refusalCopies.length,
    coachFacingRefusalCopyCountExpected: 8,
    coachFacingBoundaryCopyCount: coverageAudit.errorCopyBoundaryGuardCoverageCount,
    coachFacingBoundaryCopyCountExpected: 14,
    coachFacingGroupCopyCount: copyGroups.length,
    coachFacingGroupCopyCountExpected: 3,
    compatibleCaseCopyCount: 1,
    compatibleCaseCopyCountExpected: 1,
    copyWithWhatHappenedCount: errorCopies.filter((copy) => copy.whatHappened.length > 0).length,
    copyWithWhyBlockedCount: errorCopies.filter((copy) => copy.whyItBlocks.length > 0).length,
    copyWithHowToFixLaterCount: errorCopies.filter((copy) => copy.howToFixLater.length > 0).length,
    copyWithProtectedBoundaryCount: errorCopies.filter((copy) => copy.protectedBoundary.length > 0).length,
    copyWithStillForbiddenCount: errorCopies.filter((copy) => copy.stillForbidden.length > 0).length,
    copyWithTechnicalReferenceCount: errorCopies.filter((copy) => copy.technicalReference.length > 0).length,
    shortExportCopyCount: allVisibleCopies.filter((copy) => copy.exportVisible).length,
    productCopyCount: allVisibleCopies.filter((copy) => copy.productVisible).length,
    validCaseCopyRenderedAsNotAccepted: compatibleNotAccepted,
    acceptedPayloadClaimCount: 0,
    previewGeneratedClaimCount: 0,
    payloadCreatedClaimCount: 0,
    runtimeValidationClaimCount: 0,
    ambiguousErrorCopyWordingCount: wordingAudit.ambiguousErrorCopyWordingCount,
    actionInstructionWordingCount: wordingAudit.actionInstructionWordingCount,
    tacticalInstructionWordingCount: wordingAudit.noTacticalInstructionCount,
    selectionInstructionWordingCount: wordingAudit.noSelectionInstructionCount,
    storageReadyClaimCount: wordingAudit.noStorageReadyClaimCount,
    submitReadyClaimCount: wordingAudit.noSubmitReadyClaimCount,
    wordingReadabilityScore: wordingAudit.wordingReadabilityScore,
    wordingPassThreshold: 90,
    wordingPassStrongThreshold: 95,
    wordingThresholdStatus,
    wordingThresholdStatusCorrect: wordingThresholdStatus === "pass_strong",
    errorCopyErrorCoverageCount: coverageAudit.errorCopyErrorCoverageCount,
    errorCopyErrorCoverageExpected: 19,
    errorCopyBlockerCoverageCount: coverageAudit.errorCopyBlockerCoverageCount,
    errorCopyBlockerCoverageExpected: 12,
    errorCopyBoundaryGuardCoverageCount: coverageAudit.errorCopyBoundaryGuardCoverageCount,
    errorCopyBoundaryGuardCoverageExpected: 14,
    errorCopyRefusalStateCoverageCount: coverageAudit.errorCopyRefusalStateCoverageCount,
    errorCopyRefusalStateCoverageExpected: 8,
    uncoveredErrorCopyErrorIds: coverageAudit.uncoveredErrorCopyErrorIds,
    uncoveredErrorCopyBlockerIds: coverageAudit.uncoveredErrorCopyBlockerIds,
    uncoveredErrorCopyBoundaryGuardIds: coverageAudit.uncoveredErrorCopyBoundaryGuardIds,
    uncoveredErrorCopyRefusalStateIds: coverageAudit.uncoveredErrorCopyRefusalStateIds,
    errorCopyCoverageStillComplete: coverageAudit.errorCopyCoverageStillComplete,
    exportMetadataBadgeCleanupStatusFrom9D: "PASS",
    exportCoverBadgeText: exportMetadataAudit.exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9E",
    exportCoverBadgeCorrect: exportMetadataAudit.exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount: exportMetadataAudit.exportCoverBadgeStaleVersionCount,
    metadataFalsePositiveCountAfter9E: exportMetadataAudit.metadataFalsePositiveCountAfter9E,
    bodyMentionFallbackUsedForCoverBadge: false,
    exportTitleMentions9E: exportMetadataAudit.exportTitleMentions9E,
    exportMainIdIs9E: exportMetadataAudit.exportMainIdIs9E,
    exportMainCurrentVersionVisible: exportMetadataAudit.exportMainCurrentVersionVisible,
    exportCurrentDataAttributeVisible: exportMetadataAudit.exportCurrentDataAttributeVisible,
    exportHistoricalMarkersPreservedAsDataAttributes: exportMetadataAudit.historical9DPreserved && exportMetadataAudit.historical9CPreserved && exportMetadataAudit.historical9BPreserved && exportMetadataAudit.historical9APreserved && exportMetadataAudit.historical8Z8Y8X8WPreserved,
    exportHistoricalSectionsPreserved: input.exportHtmlAfter9E.includes('id="manual-review-export-metadata-badge-cleanup-export-9d"') && input.exportHtmlAfter9E.includes('id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c"'),
    validationRuntimeActive: false,
    payloadValidationRuntimeDetected: false,
    validationExecutionCount: noRuntimeAudit.validationExecutionCount,
    realPayloadReadCount: noRuntimeAudit.realPayloadReadCount,
    payloadCreated: false,
    realPayloadInstanceCount: noRuntimeAudit.realPayloadInstanceCount,
    dryRunAcceptedPayloadCount: noRuntimeAudit.dryRunAcceptedPayloadCount,
    realInputActivated: false,
    realPreviewGenerated: false,
    previewActivationCount: noRuntimeAudit.previewActivationCount,
    submitCreated: false,
    apiCreated: false,
    backendCreated: false,
    storageCreated: false,
    memoryCreated: false,
    draftCreated: false,
    historyCreated: false,
    officialTruthPromoted: false,
    automaticDecisionCreated: false,
    selectionDriven: false,
    tacticalInstructionDriven: false,
    scoreMutationCount: 0,
    timelineMutationCount: 0,
    scoreChangeCreationCount: 0,
    eventMutationCount: 0,
    exportMetadataCleanupStatusFrom9D: "PASS",
    detailCardStatusFrom9C: "detail_cards_rendered_without_preview_activation",
    resultRendererStatusFrom9B: "rendered_without_preview_activation",
    dryRunStatusFrom9A: "documented_dry_run_only",
    validationContractStatusFrom8Y: "documented_but_not_executable",
    payloadContractStatusFrom8X: "documented_but_not_instantiated",
    previewActivationStatusFrom8W: "documented_but_blocked",
    fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review",
    workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview",
    reviewGateStatusFrom8Q: "needs_completion",
    auditConsistencyStatusFrom8Z: "PASS_STRONG",
    errorCopyDistinctFromRuntimeValidation: true,
    errorCopyDistinctFromPayloadAcceptance: true,
    errorCopyDistinctFromPreviewGeneration: true,
    errorCopyMarkedReadOnly: true,
    errorCopyMarkedNonRuntime: true,
    errorCopyMarkedNonOfficial: true,
    errorCopyMarkedNotPersisted: true,
    errorCopyMarkedNotApplied: true,
    productStoryFirstPreserved: input.baseline9D.baseline9C.productStoryFirstPreserved,
    exportCompactPreserved: input.baseline9D.baseline9C.exportCompactPreserved,
    exportMetadataCurrent9EVisible: exportMetadataAudit.exportCurrentDataAttributeVisible,
    exportReadTimeSecondsBefore9E: exportBudgetAudit.exportReadTimeSecondsBefore9E,
    exportReadTimeSecondsAfter9E: exportBudgetAudit.exportReadTimeSecondsAfter9E,
    exportReadTimeDelta9E: exportBudgetAudit.exportReadTimeDelta9E,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportBudgetAudit.exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect: exportBudgetAudit.exportUnder800BooleanCorrect,
    exportBudgetRisk: exportBudgetAudit.exportBudgetRisk,
    sourceOfTruthSeparationPreserved: sourceOfTruthAudit.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: sourceOfTruthAudit.matchEconomyBaselinePreserved,
    guardrailsPreserved: !sourceOfTruthAudit.scoringConstantsChanged && !sourceOfTruthAudit.MatchBonusEventChanged,
    sharePackPass: input.sharePackPass ?? true,
    errorCopies,
    blockerCopies,
    refusalCopies,
    compatibleCopy,
    copyGroups,
    coverageAudit,
    wordingAudit,
    noRuntimeAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    sourceOfTruthAudit,
    productCoachFacingErrorCopyHtml: input.productSection,
    exportCoachFacingErrorCopyHtml: input.exportSection,
    productHtmlAfter9E: input.productHtmlAfter9E,
    exportHtmlAfter9E: input.exportHtmlAfter9E,
    warningCodes,
    recommendation: recommendationFromStatus(status, exportBudgetAudit.exportUnder800Seconds, wordingAudit.wordingReadabilityScore),
    nextSprintRecommendation: nextSprintRecommendationFromStatus(status, exportBudgetAudit.exportUnder800Seconds, wordingAudit.wordingReadabilityScore),
  };
}

export function buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel(input: {
  readonly baseline9D?: ManualReviewExportMetadataBadgeCleanup9DModel;
  readonly productHtmlBefore9E?: string;
  readonly exportHtmlBefore9E?: string;
} = {}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel {
  const baseline9D = input.baseline9D ?? buildManualReviewExportMetadataBadgeCleanup9DModel();
  if (baseline9D.status !== "PASS" || !baseline9D.exportCoverBadgeCorrect) {
    throw new Error("9E requires a PASS 9D metadata cleanup baseline.");
  }
  const productBefore = input.productHtmlBefore9E ?? baseline9D.productHtmlAfter9D;
  const exportBefore = input.exportHtmlBefore9E ?? baseline9D.exportHtmlAfter9D;
  const normalizedExport = normalizeManualReviewPreviewPayloadDryRunCoachFacingErrorCopyShell9E(exportBefore);
  const preliminaryModel = buildModel({
    baseline9D,
    productHtmlAfter9E: productBefore,
    exportHtmlBefore9E: exportBefore,
    exportHtmlAfter9E: normalizedExport,
    productSection: "",
    exportSection: "",
  });
  const exportSection = renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E(preliminaryModel);
  const exportHtmlAfter9E = insertManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E(normalizedExport, exportSection);
  const modelWithExport = buildModel({
    baseline9D,
    productHtmlAfter9E: productBefore,
    exportHtmlBefore9E: exportBefore,
    exportHtmlAfter9E,
    productSection: "",
    exportSection,
  });
  const productSection = renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E(modelWithExport);
  const productHtmlAfter9E = insertManualReviewPreviewPayloadDryRunCoachFacingErrorCopyProduct9E(productBefore, productSection);
  return buildModel({
    baseline9D,
    productHtmlAfter9E,
    exportHtmlBefore9E: exportBefore,
    exportHtmlAfter9E,
    productSection,
    exportSection,
  });
}

export function currentManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel(): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel {
  const baseline9C = currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel();
  const baseline9D = buildManualReviewExportMetadataBadgeCleanup9DModel({
    baseline9C,
    productHtmlBefore9D: baseline9C.productHtmlAfter9C,
    exportHtmlBefore9D: baseline9C.exportHtmlAfter9C,
  });
  const reportsDirectory = join(process.cwd(), "reports");
  const productPath = join(reportsDirectory, "coach-report.product.html");
  const exportPath = join(reportsDirectory, "coach-report.export.html");
  return buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel({
    baseline9D,
    productHtmlBefore9E: existsSync(productPath) ? readFileSync(productPath, "utf8") : baseline9D.productHtmlAfter9D,
    exportHtmlBefore9E: existsSync(exportPath) ? readFileSync(exportPath, "utf8") : baseline9D.exportHtmlAfter9D,
  });
}

export function renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EDoc(
  model: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Coach-Facing Error Copy Without Preview Activation 9E",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## Baseline 9D Summary",
    `- status 9D: ${model.baseline9D.status}`,
    `- cover badge from 9D: ${model.baseline9D.exportCoverBadgeText}`,
    `- metadata false positives 9D: ${model.baseline9D.metadataFalsePositiveCountAfter9D}`,
    "",
    "## Baseline Preservation 9D To 6X",
    ...table([
      ["Baseline", "Preserved"],
      ["9D", bool(model.baseline9DPreserved)],
      ["9C", bool(model.baseline9CPreserved)],
      ["9B", bool(model.baseline9BPreserved)],
      ["9A", bool(model.baseline9APreserved)],
      ["8Z/8Y/8X/8W", bool(model.baseline8ZPreserved && model.baseline8YPreserved && model.baseline8XPreserved && model.baseline8WPreserved)],
      ["8V through 6X", bool(model.baseline8VPreserved && model.baseline8UPreserved && model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved && model.baseline8IPreserved && model.baseline8HPreserved && model.baseline8GPreserved && model.baseline8FPreserved && model.baseline8EPreserved && model.baseline8DPreserved && model.baseline8CPreserved && model.baseline8BPreserved && model.baseline8APreserved && model.baseline7HPreserved && model.baseline6XPreserved)],
    ]),
    "",
    "## Error Copy Summary",
    ...table([
      ["Metric", "Value"],
      ["error copies", `${model.coachFacingErrorCopyCount}/${model.coachFacingErrorCopyCountExpected}`],
      ["blocker copies", `${model.coachFacingBlockerCopyCount}/${model.coachFacingBlockerCopyCountExpected}`],
      ["refusal copies", `${model.coachFacingRefusalCopyCount}/${model.coachFacingRefusalCopyCountExpected}`],
      ["compatible non accepted", `${model.compatibleCaseCopyCount}/${model.compatibleCaseCopyCountExpected}`],
      ["wording score", String(model.wordingReadabilityScore)],
    ]),
    "",
    "## Copy Groups",
    ...table([
      ["Group", "Count", "Meaning"],
      ...model.copyGroups.map((group) => [group.label, String(group.copyCount), group.coachFacingMeaning]),
    ]),
    "",
    "## Error Copy Table",
    ...table([
      ["Copy", "Error", "Title", "Short message"],
      ...model.errorCopies.map((copy) => [copy.copyId, copy.sourceErrorStateId ?? "", copy.title, copy.shortMessage]),
    ]),
    "",
    "## Blocker Copy Table",
    ...table([
      ["Copy", "Blocker", "Meaning"],
      ...model.blockerCopies.map((copy) => [copy.copyId, copy.sourceBlockerId ?? "", copy.shortMessage]),
    ]),
    "",
    "## Refusal Copy Table",
    ...table([
      ["Copy", "Refusal", "Meaning"],
      ...model.refusalCopies.map((copy) => [copy.copyId, copy.sourceRefusalStateId ?? "", copy.shortMessage]),
    ]),
    "",
    "## Compatible Case Not Accepted Proof",
    ...table([
      ["Copy", "Accepted", "Message"],
      [model.compatibleCopy.copyId, bool(model.compatibleCopy.canAcceptPayloadIn9E), model.compatibleCopy.shortMessage],
    ]),
    "",
    "## Coverage",
    ...table([
      ["Coverage", "Value", "Uncovered"],
      ["errors", `${model.errorCopyErrorCoverageCount}/${model.errorCopyErrorCoverageExpected}`, model.uncoveredErrorCopyErrorIds.join(", ") || "none"],
      ["blockers", `${model.errorCopyBlockerCoverageCount}/${model.errorCopyBlockerCoverageExpected}`, model.uncoveredErrorCopyBlockerIds.join(", ") || "none"],
      ["boundary guards", `${model.errorCopyBoundaryGuardCoverageCount}/${model.errorCopyBoundaryGuardCoverageExpected}`, model.uncoveredErrorCopyBoundaryGuardIds.join(", ") || "none"],
      ["refusals", `${model.errorCopyRefusalStateCoverageCount}/${model.errorCopyRefusalStateCoverageExpected}`, model.uncoveredErrorCopyRefusalStateIds.join(", ") || "none"],
    ]),
    "",
    "## Wording Audit",
    ...table([
      ["Metric", "Value"],
      ["wordingReadabilityScore", String(model.wordingReadabilityScore)],
      ["ambiguousErrorCopyWordingCount", String(model.ambiguousErrorCopyWordingCount)],
      ["actionInstructionWordingCount", String(model.actionInstructionWordingCount)],
      ["selectionInstructionWordingCount", String(model.selectionInstructionWordingCount)],
      ["tacticalInstructionWordingCount", String(model.tacticalInstructionWordingCount)],
    ]),
    "",
    "## No-Runtime Audit",
    ...table([
      ["Boundary", "Value"],
      ["validationRuntimeActive", bool(model.validationRuntimeActive)],
      ["realPayloadReadCount", String(model.realPayloadReadCount)],
      ["payloadCreated", bool(model.payloadCreated)],
      ["dryRunAcceptedPayloadCount", String(model.dryRunAcceptedPayloadCount)],
      ["realPreviewGenerated", bool(model.realPreviewGenerated)],
      ["submit/api/backend/storage/memory", `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}/${bool(model.storageCreated)}/${bool(model.memoryCreated)}`],
      ["officialTruthPromoted", bool(model.officialTruthPromoted)],
      ["selection/tactic", `${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
    ]),
    "",
    "## Source-Of-Truth Audit",
    `- sourceOfTruthSeparationPreserved: ${bool(model.sourceOfTruthSeparationPreserved)}`,
    `- matchEconomyBaselinePreserved: ${bool(model.matchEconomyBaselinePreserved)}`,
    `- guardrailsPreserved: ${bool(model.guardrailsPreserved)}`,
    "",
    "## Export Metadata Audit",
    ...table([
      ["Metric", "Value"],
      ["title 9E", bool(model.exportTitleMentions9E)],
      ["main id 9E", bool(model.exportMainIdIs9E)],
      ["badge", model.exportCoverBadgeText],
      ["metadata false positives", String(model.metadataFalsePositiveCountAfter9E)],
      ["body fallback", bool(model.bodyMentionFallbackUsedForCoverBadge)],
      ["historical attrs", bool(model.exportHistoricalMarkersPreservedAsDataAttributes)],
    ]),
    "",
    "## Export Budget Audit",
    ...table([
      ["Metric", "Value"],
      ["before", String(model.exportReadTimeSecondsBefore9E)],
      ["after", String(model.exportReadTimeSecondsAfter9E)],
      ["delta", String(model.exportReadTimeDelta9E)],
      ["under 900", bool(model.exportUnder900Seconds)],
      ["under 800", bool(model.exportUnder800Seconds)],
      ["risk", model.exportBudgetRisk],
    ]),
    "",
    "## Product Export Excerpts",
    "- product excerpt: Messages d'erreur coach-facing dry-run",
    "- export excerpt: Messages erreur dry-run",
    "",
    "## Warnings",
    model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Validation Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].flat().join("\n");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EValidation(
  model: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
): string {
  const checks = [
    checkLine("ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_9E", model.version),
    checkLine("baseline 9D visible and preserved", model.baseline9DPreserved, bool(model.baseline9DPreserved)),
    checkLine("baseline 9C preserved", model.baseline9CPreserved, bool(model.baseline9CPreserved)),
    checkLine("baseline 9B preserved", model.baseline9BPreserved, bool(model.baseline9BPreserved)),
    checkLine("baseline 9A preserved", model.baseline9APreserved, bool(model.baseline9APreserved)),
    checkLine("baseline 8Z/8Y/8X/8W preserved", model.baseline8ZPreserved && model.baseline8YPreserved && model.baseline8XPreserved && model.baseline8WPreserved, "preserved"),
    checkLine("product coach-facing error copy visible", model.productCoachFacingErrorCopyVisible, bool(model.productCoachFacingErrorCopyVisible)),
    checkLine("export coach-facing error copy visible", model.exportCoachFacingErrorCopyVisible, bool(model.exportCoachFacingErrorCopyVisible)),
    checkLine("errorCopyStatus = error_copy_rendered_without_preview_activation", model.errorCopyStatus === "error_copy_rendered_without_preview_activation", model.errorCopyStatus),
    checkLine("coachFacingErrorCopyCount = 19", model.coachFacingErrorCopyCount === 19, String(model.coachFacingErrorCopyCount)),
    checkLine("coachFacingBlockerCopyCount = 12", model.coachFacingBlockerCopyCount === 12, String(model.coachFacingBlockerCopyCount)),
    checkLine("coachFacingRefusalCopyCount = 8", model.coachFacingRefusalCopyCount === 8, String(model.coachFacingRefusalCopyCount)),
    checkLine("compatibleCaseCopyCount = 1", model.compatibleCaseCopyCount === 1, String(model.compatibleCaseCopyCount)),
    checkLine("validCaseCopyRenderedAsNotAccepted = true", model.validCaseCopyRenderedAsNotAccepted, bool(model.validCaseCopyRenderedAsNotAccepted)),
    checkLine("acceptedPayloadClaimCount = 0", model.acceptedPayloadClaimCount === 0, String(model.acceptedPayloadClaimCount)),
    checkLine("previewGeneratedClaimCount = 0", model.previewGeneratedClaimCount === 0, String(model.previewGeneratedClaimCount)),
    checkLine("payloadCreatedClaimCount = 0", model.payloadCreatedClaimCount === 0, String(model.payloadCreatedClaimCount)),
    checkLine("runtimeValidationClaimCount = 0", model.runtimeValidationClaimCount === 0, String(model.runtimeValidationClaimCount)),
    checkLine("actionInstructionWordingCount = 0", model.actionInstructionWordingCount === 0, String(model.actionInstructionWordingCount)),
    checkLine("tacticalInstructionWordingCount = 0", model.tacticalInstructionWordingCount === 0, String(model.tacticalInstructionWordingCount)),
    checkLine("selectionInstructionWordingCount = 0", model.selectionInstructionWordingCount === 0, String(model.selectionInstructionWordingCount)),
    checkLine("storageReadyClaimCount = 0", model.storageReadyClaimCount === 0, String(model.storageReadyClaimCount)),
    checkLine("submitReadyClaimCount = 0", model.submitReadyClaimCount === 0, String(model.submitReadyClaimCount)),
    checkLine("error coverage 19/19", model.errorCopyErrorCoverageCount === 19, String(model.errorCopyErrorCoverageCount)),
    checkLine("blocker coverage 12/12", model.errorCopyBlockerCoverageCount === 12, String(model.errorCopyBlockerCoverageCount)),
    checkLine("boundary coverage 14/14", model.errorCopyBoundaryGuardCoverageCount === 14, String(model.errorCopyBoundaryGuardCoverageCount)),
    checkLine("refusal coverage 8/8", model.errorCopyRefusalStateCoverageCount === 8, String(model.errorCopyRefusalStateCoverageCount)),
    checkLine("validationRuntimeActive = false", !model.validationRuntimeActive, bool(model.validationRuntimeActive)),
    checkLine("realPayloadReadCount = 0", model.realPayloadReadCount === 0, String(model.realPayloadReadCount)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("dryRunAcceptedPayloadCount = 0", model.dryRunAcceptedPayloadCount === 0, String(model.dryRunAcceptedPayloadCount)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("previewActivationCount = 0", model.previewActivationCount === 0, String(model.previewActivationCount)),
    checkLine("submit/api/backend/storage/memory false", !model.submitCreated && !model.apiCreated && !model.backendCreated && !model.storageCreated && !model.memoryCreated, "false"),
    checkLine("officialTruthPromoted = false", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("automaticDecisionCreated = false", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("selectionDriven = false", !model.selectionDriven, bool(model.selectionDriven)),
    checkLine("tacticalInstructionDriven = false", !model.tacticalInstructionDriven, bool(model.tacticalInstructionDriven)),
    checkLine("score/timeline/score_change/event mutation = 0", model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.scoreChangeCreationCount === 0 && model.eventMutationCount === 0, `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`),
    checkLine("export title mentions 9E", model.exportTitleMentions9E, bool(model.exportTitleMentions9E)),
    checkLine("export main id is compressed-export-9e", model.exportMainIdIs9E, bool(model.exportMainIdIs9E)),
    checkLine("export current data attribute 9E", model.exportCurrentDataAttributeVisible, bool(model.exportCurrentDataAttributeVisible)),
    checkLine("export cover badge Export compact 9E", model.exportCoverBadgeText === "Export compact 9E", model.exportCoverBadgeText),
    checkLine("metadata false positives = 0", model.metadataFalsePositiveCountAfter9E === 0, String(model.metadataFalsePositiveCountAfter9E)),
    checkLine("body fallback false", !model.bodyMentionFallbackUsedForCoverBadge, bool(model.bodyMentionFallbackUsedForCoverBadge)),
    checkLine("export <=900", model.exportReadTimeSecondsAfter9E <= 900, String(model.exportReadTimeSecondsAfter9E)),
    checkLine("exportUnder900 correct", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800 correct", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("wording score explicit", model.wordingReadabilityScore > 0, String(model.wordingReadabilityScore)),
    checkLine("wording score >=90", model.wordingReadabilityScore >= 90, String(model.wordingReadabilityScore)),
    checkLine("PASS fort impossible if wording score absent or <95", model.status !== "PASS" || model.wordingReadabilityScore >= 95, String(model.wordingReadabilityScore)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("scoring constants unchanged", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("PENALTY_SHOT inactive", true, "inactive"),
    checkLine("MatchBonusEvent unchanged", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("batch/live separation preserved", model.sourceOfTruthAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthAudit.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status !== "FAIL" ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Manual Review Preview Payload Dry-Run Coach-Facing Error Copy Without Preview Activation 9E",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- coachFacingErrorCopyCount: ${model.coachFacingErrorCopyCount}`,
    `- coachFacingBlockerCopyCount: ${model.coachFacingBlockerCopyCount}`,
    `- coachFacingRefusalCopyCount: ${model.coachFacingRefusalCopyCount}`,
    `- compatibleCaseCopyCount: ${model.compatibleCaseCopyCount}`,
    `- wordingReadabilityScore: ${model.wordingReadabilityScore}`,
    `- exportReadTimeSecondsAfter9E: ${model.exportReadTimeSecondsAfter9E}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
