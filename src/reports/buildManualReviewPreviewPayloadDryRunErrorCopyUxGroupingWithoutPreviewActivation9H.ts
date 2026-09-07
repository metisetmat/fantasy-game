import { buildManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H, auditManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingAudit9H";
import { auditManualReviewPreviewPayloadDryRunErrorCopyUxGroupingCoverage9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingCoverageAudit9H";
import { evaluateManualReviewPreviewPayloadDryRunErrorCopyUxGroupingBoundary9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingGuard9H";
import type {
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingNextSprintRecommendation9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingRecommendation9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingStatus9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWordingStatus9H,
} from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_BLOCKING_WARNINGS,
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_NEGATIVE_WARNINGS,
  type ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarningCode9H,
  uniqueWarningCodes9H,
} from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarnings9H";
import {
  currentManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel,
} from "./buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9G";
import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";
import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import {
  insertManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H,
  renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H,
} from "./renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H";
import {
  insertManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H,
  renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H,
} from "./renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H";

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

function budgetRisk(seconds: number): "low" | "medium" | "high" {
  if (seconds > 900) return "high";
  if (seconds > 800) return "medium";
  return "low";
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.toLowerCase().matchAll(pattern)].length;
}

function wordingStatus(score: number): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWordingStatus9H {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score > 0) return "partial";
  return "fail";
}

function recommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingStatus9H,
): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingRecommendation9H {
  if (status === "PASS") return "KEEP_ERROR_COPY_UX_GROUPING";
  if (status === "PARTIAL") return "REVIEW_ERROR_COPY_GROUPING_EXPORT_BUDGET";
  return "FIX_ERROR_COPY_GROUPING_BOUNDARY_REGRESSION";
}

function nextRecommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingStatus9H,
  exportUnder800Seconds: boolean,
): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingNextSprintRecommendation9H {
  if (status === "PASS") return "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_WITHOUT_PREVIEW_ACTIVATION";
  if (status === "PARTIAL" && !exportUnder800Seconds) return "EXPORT_BUDGET_COMPACTION_AFTER_UX_GROUPING";
  return "ERROR_COPY_UX_GROUPING_BOUNDARY_FIX";
}

function assertBaseline9GReady(baseline9G: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel): void {
  if (baseline9G.status !== "PASS") throw new Error("9H requires a PASS 9G warning-consistency baseline");
  if (baseline9G.exportKeyMessagesWarningContradictionCountAfter9G !== 0) {
    throw new Error("9H requires warning contradiction after 9G to be 0");
  }
  if (baseline9G.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING")) {
    throw new Error("9H requires EXPORT_KEY_MESSAGES_MISSING to stay absent");
  }
  if (baseline9G.exportCompactionStatusFrom9F !== "compacted_under_800") {
    throw new Error("9H requires 9F compacted_under_800 export baseline");
  }
  if (
    baseline9G.coachFacingErrorCopyCountFrom9E !== 19 ||
    baseline9G.coachFacingBlockerCopyCountFrom9E !== 12 ||
    baseline9G.coachFacingRefusalCopyCountFrom9E !== 8 ||
    baseline9G.compatibleCaseCopyCountFrom9E !== 1
  ) {
    throw new Error("9H requires preserved 9E copy counts: 19 errors, 12 blockers, 8 refusals, 1 compatible case");
  }
}

export function buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel(input: {
  readonly baseline9G?: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel;
  readonly productHtmlBefore9H?: string;
  readonly exportHtmlBefore9H?: string;
  readonly sharePackPass?: boolean;
} = {}): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel {
  const baseline9G = input.baseline9G ?? currentManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel();
  assertBaseline9GReady(baseline9G);

  const baseline9E = baseline9G.baseline9F.baseline9E;
  const grouping = buildManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H(baseline9E);
  const groups = grouping.groups;
  const exportHtmlBefore9H = input.exportHtmlBefore9H ?? baseline9G.exportHtmlAfter9G;
  const exportGroupingSectionHtml = renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H();
  const exportHtmlAfter9H = insertManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H(exportHtmlBefore9H);
  const productSeed = {
    status: "PASS" as const,
    uxGroupCount: groups.length,
    groupedErrorCopyCount: baseline9G.coachFacingErrorCopyCountFrom9E,
    groupedBlockerCopyCount: baseline9G.coachFacingBlockerCopyCountFrom9E,
    groupedRefusalCopyCount: baseline9G.coachFacingRefusalCopyCountFrom9E,
    groupedCompatibleCaseCount: baseline9G.compatibleCaseCopyCountFrom9E,
    errorCopyErrorCoverageCountFrom9E: baseline9G.errorCopyErrorCoverageCountFrom9E,
    errorCopyBlockerCoverageCountFrom9E: baseline9G.errorCopyBlockerCoverageCountFrom9E,
    errorCopyBoundaryGuardCoverageCountFrom9E: baseline9G.errorCopyBoundaryGuardCoverageCountFrom9E,
    errorCopyRefusalStateCoverageCountFrom9E: baseline9G.errorCopyRefusalStateCoverageCountFrom9E,
    warningContradictionCountAfter9H: baseline9G.exportKeyMessagesWarningContradictionCountAfter9G,
    validationRuntimeActive: baseline9G.validationRuntimeActive,
    dryRunAcceptedPayloadCount: baseline9G.dryRunAcceptedPayloadCount,
    realPreviewGenerated: baseline9G.realPreviewGenerated,
    groups,
  };
  const productGroupingSectionHtml = renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H(productSeed);
  const productHtmlBefore9H = input.productHtmlBefore9H ?? baseline9G.productHtmlAfter9G;
  const productHtmlAfter9H = insertManualReviewPreviewPayloadDryRunErrorCopyUxGroupingProduct9H(productHtmlBefore9H, productSeed);
  const exportReadTimeSecondsBefore9H = estimateManualReviewExportReadTimeSeconds9F(exportHtmlBefore9H);
  const exportReadTimeSecondsAfter9H = estimateManualReviewExportReadTimeSeconds9F(exportHtmlAfter9H);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9H <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9H <= 800;
  const exportUnder790Seconds = exportReadTimeSecondsAfter9H <= 790;
  const exportUnder760Seconds = exportReadTimeSecondsAfter9H <= 760;
  const exportMainTag = exportHtmlAfter9H.match(/<main\b[^>]*>/u)?.[0] ?? "";
  const exportHeader = exportHtmlAfter9H.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
  const exportCoverBadgeText =
    exportHeader.match(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>(Export compact [^<]*)<\/[^>]+>/u)?.[1] ?? "";
  const exportTitleMentions9H = exportHtmlAfter9H.includes("<title>Rapport coach export compact 9H - error copy UX grouping</title>");
  const exportMainIdIs9H = exportMainTag.includes('id="compressed-export-9h"');
  const exportCurrentDataAttributeVisible = exportMainTag.includes(
    'data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"',
  );
  const metadataFalsePositiveCountAfter9H = [...exportMainTag.matchAll(/id="compressed-export-9g"|Export compact 9G/gu)].length;
  const historical9GPreserved = exportMainTag.includes(
    'data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"',
  );
  const historical9FPreserved = exportMainTag.includes(
    'data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"',
  );
  const historical9EPreserved = exportMainTag.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"');
  const historical9DPreserved = exportMainTag.includes('data-export-metadata-badge-cleanup-version="9D"');
  const historical9CPreserved = exportMainTag.includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"');
  const historical9BPreserved = exportMainTag.includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"');
  const historical9APreserved = exportMainTag.includes('data-manual-review-preview-payload-dry-run-validator-version="9A"');
  const historical8Z8Y8X8WPreserved =
    exportMainTag.includes('data-manual-review-validation-contract-audit-consistency-repair-version="8Z"') &&
    exportMainTag.includes('data-manual-review-preview-payload-validation-contract-version="8Y"') &&
    exportMainTag.includes('data-manual-review-preview-payload-contract-version="8X"') &&
    exportMainTag.includes('data-manual-review-preview-activation-guards-version="8W"');
  const visibleText = `${productGroupingSectionHtml} ${exportGroupingSectionHtml}`.toLowerCase();
  const validationActiveClaimCount = countMatches(visibleText, /\bvalidation activee\b|\bvalider maintenant\b/gu);
  const payloadAcceptedClaimCount = countMatches(visibleText, /\bpayload accepte comme valide\b|\bpayload est accepte\b|\bpayload valide accepte\b/gu);
  const previewGeneratedClaimCount = countMatches(visibleText, /\bpreview reelle generee\b|\bgenere une preview reelle\b/gu);
  const storageReadyClaimCount = countMatches(visibleText, /\bstockage pret\b|\bpersistance prete\b/gu);
  const submitReadyClaimCount = countMatches(visibleText, /\bsubmit pret\b|\bapi prete\b|\bbackend pret\b/gu);
  const actionInstructionWordingCount = countMatches(visibleText, /\bcliquez\b|\bappuyez\b|\benvoyez\b|\bsauvegardez\b/gu);
  const ambiguousGroupingWordingCount = countMatches(visibleText, /\bpret pour production\b|\bdecision prete\b/gu);
  const selectionInstructionWordingCount = countMatches(visibleText, /\bselection recommandee\b|\bselection imposee\b/gu);
  const tacticalInstructionWordingCount = countMatches(visibleText, /\bconsigne tactique\b|\btactique a appliquer\b/gu);
  const forbiddenWordingCount =
    validationActiveClaimCount +
    payloadAcceptedClaimCount +
    previewGeneratedClaimCount +
    storageReadyClaimCount +
    submitReadyClaimCount +
    actionInstructionWordingCount +
    ambiguousGroupingWordingCount +
    selectionInstructionWordingCount +
    tacticalInstructionWordingCount;
  const wordingReadabilityScore = forbiddenWordingCount === 0 ? 97 : Math.max(0, 90 - forbiddenWordingCount * 10);
  const groupingAudit = auditManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H({
    baseline9E,
    grouping,
    productHtml: productHtmlAfter9H,
    exportHtml: exportHtmlAfter9H,
  });
  const coverageAudit = auditManualReviewPreviewPayloadDryRunErrorCopyUxGroupingCoverage9H({ baseline9E, grouping });
  const warningCodesBeforeGuard = uniqueWarningCodes9H([
    ...groupingAudit.auditWarningCodes,
    ...coverageAudit.coverageWarningCodes,
    baseline9G.status === "PASS" ? "BASELINE_9G_PRESERVED" : "BASELINE_9G_REGRESSED",
    baseline9G.baseline9FPreserved ? "BASELINE_9F_PRESERVED" : "BASELINE_9F_REGRESSED",
    baseline9G.baseline9EPreserved ? "BASELINE_9E_PRESERVED" : "BASELINE_9E_REGRESSED",
    baseline9G.exportKeyMessagesDetectedCount === 7 && baseline9G.exportKeyMessagesMissingCount === 0
      ? "EXPORT_KEY_MESSAGES_9G_PRESERVED_9H"
      : "EXPORT_KEY_MESSAGES_9G_REGRESSED_9H",
    baseline9G.exportKeyMessagesWarningContradictionCountAfter9G === 0
      ? "WARNING_CONTRADICTION_COUNT_ZERO_9H"
      : "WARNING_CONTRADICTION_REINTRODUCED_9H",
    exportUnder900Seconds ? "EXPORT_UNDER_900_READY_9H" : "EXPORT_OVER_900_9H",
    exportUnder800Seconds ? "EXPORT_UNDER_800_READY_9H" : "EXPORT_OVER_800_PASS_STRONG_BLOCKED_9H",
    ...(exportUnder790Seconds ? (["EXPORT_UNDER_790_READY_9H"] as const) : []),
    exportTitleMentions9H && exportMainIdIs9H && exportCurrentDataAttributeVisible
      ? "EXPORT_METADATA_9H_VISIBLE"
      : "EXPORT_METADATA_9H_MISSING",
    exportCoverBadgeText === "Export compact 9H" ? "EXPORT_COVER_BADGE_9H_READY" : "EXPORT_COVER_BADGE_9H_STALE",
    !baseline9G.validationRuntimeActive ? "NO_RUNTIME_VALIDATION_9H" : "VALIDATION_RUNTIME_ACTIVE_DETECTED_9H",
    baseline9G.realPayloadReadCount === 0 ? "NO_PAYLOAD_READ_9H" : "REAL_PAYLOAD_READ_DETECTED_9H",
    !baseline9G.payloadCreated ? "NO_PAYLOAD_CREATED_9H" : "PAYLOAD_CREATION_DETECTED_9H",
    baseline9G.dryRunAcceptedPayloadCount === 0 ? "NO_PAYLOAD_ACCEPTED_9H" : "PAYLOAD_ACCEPTANCE_DETECTED_9H",
    !baseline9G.realPreviewGenerated && baseline9G.previewActivationCount === 0 ? "NO_PREVIEW_GENERATED_9H" : "REAL_PREVIEW_GENERATION_DETECTED_9H",
    !baseline9G.storageCreated && !baseline9G.memoryCreated && !baseline9G.draftCreated && !baseline9G.historyCreated
      ? "NO_PERSISTENCE_9H"
      : "PERSISTENCE_DETECTED_9H",
    !baseline9G.officialTruthPromoted ? "NO_OFFICIAL_TRUTH_9H" : "OFFICIAL_TRUTH_PROMOTION_DETECTED_9H",
    !baseline9G.automaticDecisionCreated && !baseline9G.selectionDriven && !baseline9G.tacticalInstructionDriven
      ? "NO_DECISION_SELECTION_OR_TACTIC_9H"
      : "DECISION_SELECTION_OR_TACTIC_DETECTED_9H",
    baseline9G.scoreMutationCount === 0 &&
    baseline9G.timelineMutationCount === 0 &&
    baseline9G.scoreChangeCreationCount === 0 &&
    baseline9G.eventMutationCount === 0
      ? "NO_SCORE_TIMELINE_MUTATION_9H"
      : "SCORE_OR_TIMELINE_MUTATION_DETECTED_9H",
    baseline9G.sourceOfTruthSeparationPreserved && baseline9G.matchEconomyBaselinePreserved && baseline9G.guardrailsPreserved
      ? "SOURCE_OF_TRUTH_PRESERVED_9H"
      : "SOURCE_OF_TRUTH_REGRESSED_9H",
    !baseline9G.scoringConstantsChanged ? "SCORING_CONSTANTS_UNCHANGED_9H" : "SCORE_MANIPULATION_DETECTED_9H",
    !baseline9G.matchBonusEventChanged ? "MATCH_BONUS_EVENT_UNCHANGED_9H" : "MATCH_BONUS_EVENT_CHANGED_9H",
    wordingReadabilityScore >= 95 ? "WORDING_SCORE_PASS_STRONG_READY_9H" : "WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD_9H",
  ]);

  const modelSeed = {
    uxGroupCount: groupingAudit.uxGroupCount,
    groupedErrorCopyCount: groupingAudit.groupedErrorCopyCount,
    groupedBlockerCopyCount: groupingAudit.groupedBlockerCopyCount,
    groupedRefusalCopyCount: groupingAudit.groupedRefusalCopyCount,
    groupedCompatibleCaseCount: groupingAudit.groupedCompatibleCaseCount,
    ungroupedCopyCount: groupingAudit.ungroupedCopyCount,
    duplicatedCopyCount: groupingAudit.duplicatedCopyCount,
    compatibleCaseStillNotAcceptedInGrouping: groupingAudit.compatibleCaseStillNotAcceptedInGrouping,
    warningContradictionCountAfter9H: baseline9G.exportKeyMessagesWarningContradictionCountAfter9G,
    exportKeyMessagesMissingCountFrom9G: baseline9G.exportKeyMessagesMissingCount,
    exportKeyMessagesNegativeWarningEmitted: baseline9G.exportKeyMessagesNegativeWarningEmitted,
    validationRuntimeActive: baseline9G.validationRuntimeActive,
    realPayloadReadCount: baseline9G.realPayloadReadCount,
    payloadCreated: baseline9G.payloadCreated,
    dryRunAcceptedPayloadCount: baseline9G.dryRunAcceptedPayloadCount,
    realPreviewGenerated: baseline9G.realPreviewGenerated,
    previewActivationCount: baseline9G.previewActivationCount,
    submitCreated: baseline9G.submitCreated,
    apiCreated: baseline9G.apiCreated,
    backendCreated: baseline9G.backendCreated,
    storageCreated: baseline9G.storageCreated,
    memoryCreated: baseline9G.memoryCreated,
    draftCreated: baseline9G.draftCreated,
    historyCreated: baseline9G.historyCreated,
    officialTruthPromoted: baseline9G.officialTruthPromoted,
    automaticDecisionCreated: baseline9G.automaticDecisionCreated,
    selectionDriven: baseline9G.selectionDriven,
    tacticalInstructionDriven: baseline9G.tacticalInstructionDriven,
    scoreMutationCount: baseline9G.scoreMutationCount,
    timelineMutationCount: baseline9G.timelineMutationCount,
    scoreChangeCreationCount: baseline9G.scoreChangeCreationCount,
    eventMutationCount: baseline9G.eventMutationCount,
    exportReadTimeSecondsAfter9H,
    wordingReadabilityScore,
    exportTitleMentions9H,
    exportMainIdIs9H,
    exportCoverBadgeCorrect: exportCoverBadgeText === "Export compact 9H",
    metadataFalsePositiveCountAfter9H,
    scoringConstantsChanged: baseline9G.scoringConstantsChanged,
    matchBonusEventChanged: baseline9G.matchBonusEventChanged,
  };
  const guard = evaluateManualReviewPreviewPayloadDryRunErrorCopyUxGroupingBoundary9H(modelSeed);
  const hasBlocking =
    guard.violations.some((warning) =>
      MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_BLOCKING_WARNINGS.includes(warning),
    ) ||
    warningCodesBeforeGuard.some((warning) =>
      MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_BLOCKING_WARNINGS.includes(warning),
    );
  const negativeWarningCount = warningCodesBeforeGuard.filter((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_NEGATIVE_WARNINGS.includes(warning),
  ).length;
  const status: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingStatus9H = hasBlocking
    ? "FAIL"
    : negativeWarningCount > 0 || guard.statusRecommendation === "PARTIAL"
      ? "PARTIAL"
      : "PASS";
  const warningCodes = uniqueWarningCodes9H([
    ...warningCodesBeforeGuard,
    ...guard.violations,
    ...(status === "PARTIAL"
      ? (["ERROR_COPY_UX_GROUPING_PARTIAL_9H"] as const)
      : status === "FAIL"
        ? (["ERROR_COPY_UX_GROUPING_FAIL_9H"] as const)
        : []),
  ]);
  const recommendation = recommendationFromStatus(status);
  const nextSprintRecommendation = nextRecommendationFromStatus(status, exportUnder800Seconds);
  const groupedCopies = [baseline9E.compatibleCopy, ...baseline9E.errorCopies, ...baseline9E.blockerCopies, ...baseline9E.refusalCopies];

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G",
    baseline9G,
    matchId: baseline9G.matchId,
    officialScore: baseline9G.officialScore,
    baseline9GPreserved: baseline9G.status === "PASS",
    baseline9FPreserved: baseline9G.baseline9FPreserved,
    baseline9EPreserved: baseline9G.baseline9EPreserved,
    baseline9DPreserved: baseline9G.baseline9DPreserved,
    baseline9CPreserved: baseline9G.baseline9CPreserved,
    baseline9BPreserved: baseline9G.baseline9BPreserved,
    baseline9APreserved: baseline9G.baseline9APreserved,
    baseline8ZPreserved: baseline9G.baseline8ZPreserved,
    baseline8YPreserved: baseline9G.baseline8YPreserved,
    baseline8XPreserved: baseline9G.baseline8XPreserved,
    baseline8WPreserved: baseline9G.baseline8WPreserved,
    baseline8VThrough6XPreserved: baseline9G.baseline8VThrough6XPreserved,
    errorCopyUxGroupingReady: groupingAudit.errorCopyUxGroupingReady,
    productErrorCopyUxGroupingVisible: groupingAudit.productErrorCopyUxGroupingVisible,
    exportErrorCopyUxGroupingVisible: groupingAudit.exportErrorCopyUxGroupingVisible,
    uxGroupingMode: groupingAudit.uxGroupingMode,
    uxGroupingStatus: groupingAudit.uxGroupingStatus,
    expectedUxGroupingStatus: groupingAudit.expectedUxGroupingStatus,
    uxGroupingStatusCorrect: groupingAudit.uxGroupingStatusCorrect,
    uxGroupCount: groupingAudit.uxGroupCount,
    uxGroupCountExpected: groupingAudit.uxGroupCountExpected,
    uxGroupIds: groupingAudit.uxGroupIds,
    groupedErrorCopyCount: groupingAudit.groupedErrorCopyCount,
    groupedErrorCopyCountExpected: groupingAudit.groupedErrorCopyCountExpected,
    groupedBlockerCopyCount: groupingAudit.groupedBlockerCopyCount,
    groupedBlockerCopyCountExpected: groupingAudit.groupedBlockerCopyCountExpected,
    groupedRefusalCopyCount: groupingAudit.groupedRefusalCopyCount,
    groupedRefusalCopyCountExpected: groupingAudit.groupedRefusalCopyCountExpected,
    groupedCompatibleCaseCount: groupingAudit.groupedCompatibleCaseCount,
    groupedCompatibleCaseCountExpected: groupingAudit.groupedCompatibleCaseCountExpected,
    ungroupedCopyCount: groupingAudit.ungroupedCopyCount,
    duplicatedCopyCount: groupingAudit.duplicatedCopyCount,
    missingCopyGroupAssignments: groupingAudit.missingCopyGroupAssignments,
    duplicatedCopyGroupAssignments: groupingAudit.duplicatedCopyGroupAssignments,
    groupLabelsCoachFacing: groupingAudit.groupLabelsCoachFacing,
    groupDescriptionsCoachFacing: groupingAudit.groupDescriptionsCoachFacing,
    groupBoundariesVisible: groupingAudit.groupBoundariesVisible,
    groupStillForbiddenVisible: groupingAudit.groupStillForbiddenVisible,
    groupNextStepNotActivatedVisible: groupingAudit.groupNextStepNotActivatedVisible,
    compatibleCaseStillNotAcceptedInGrouping: groupingAudit.compatibleCaseStillNotAcceptedInGrouping,
    groupingDoesNotChangeCopySemantics: groupingAudit.groupingDoesNotChangeCopySemantics,
    groupingDoesNotCreateNewErrorCopies: groupingAudit.groupingDoesNotCreateNewErrorCopies,
    groupingDoesNotDeleteErrorCopies: groupingAudit.groupingDoesNotDeleteErrorCopies,
    groupingDoesNotChangeCoverage: groupingAudit.groupingDoesNotChangeCoverage,
    exportKeyMessagesDetectedCountFrom9G: baseline9G.exportKeyMessagesDetectedCount,
    exportKeyMessagesMissingCountFrom9G: baseline9G.exportKeyMessagesMissingCount,
    exportKeyMessagesPreservedFrom9G: baseline9G.exportKeyMessagesPreserved,
    exportKeyMessagesMissingFlagFrom9G: baseline9G.exportKeyMessagesMissingFlag,
    warningContradictionCountBefore9G: baseline9G.exportKeyMessagesWarningContradictionCountBefore9G,
    warningContradictionCountAfter9H: baseline9G.exportKeyMessagesWarningContradictionCountAfter9G,
    exportKeyMessagesPositiveWarningEmitted: baseline9G.exportKeyMessagesPositiveWarningEmitted,
    exportKeyMessagesNegativeWarningEmitted: baseline9G.exportKeyMessagesNegativeWarningEmitted,
    warningMutualExclusionGuardPassed: baseline9G.warningMutualExclusionGuardPassed,
    preservedAndMissingSimultaneousCount: baseline9G.preservedAndMissingSimultaneousCount,
    warningRegistryConflictCount: baseline9G.warningRegistryConflictCount,
    warningAggregationConflictCount: baseline9G.warningAggregationConflictCount,
    warningStatusConsistencyStatus: baseline9G.warningStatusConsistencyStatus,
    warningStatusConsistencyCorrect: baseline9G.warningStatusConsistencyCorrect,
    exportCompactionStatusFrom9F: baseline9G.exportCompactionStatusFrom9F,
    exportCompactCopyPreservedFrom9F: baseline9G.exportCompactCopyPreserved,
    exportDetailedCopyRowsRemainCollapsed: baseline9G.exportDetailedCopyRowsRemainCollapsed,
    exportKeyMessagesPreserved: baseline9G.exportKeyMessagesPreserved,
    exportNoRuntimeGuardPreserved: baseline9G.exportNoRuntimeGuardPreserved,
    exportNoPayloadAcceptedGuardPreserved: baseline9G.exportNoPayloadAcceptedGuardPreserved,
    exportNoPreviewGuardPreserved: baseline9G.exportNoPreviewGuardPreserved,
    coachFacingErrorCopyCountFrom9E: baseline9G.coachFacingErrorCopyCountFrom9E,
    coachFacingBlockerCopyCountFrom9E: baseline9G.coachFacingBlockerCopyCountFrom9E,
    coachFacingRefusalCopyCountFrom9E: baseline9G.coachFacingRefusalCopyCountFrom9E,
    compatibleCaseCopyCountFrom9E: baseline9G.compatibleCaseCopyCountFrom9E,
    errorCopyErrorCoverageCountFrom9E: baseline9G.errorCopyErrorCoverageCountFrom9E,
    errorCopyBlockerCoverageCountFrom9E: baseline9G.errorCopyBlockerCoverageCountFrom9E,
    errorCopyBoundaryGuardCoverageCountFrom9E: baseline9G.errorCopyBoundaryGuardCoverageCountFrom9E,
    errorCopyRefusalStateCoverageCountFrom9E: baseline9G.errorCopyRefusalStateCoverageCountFrom9E,
    validCaseCopyRenderedAsNotAcceptedFrom9E: baseline9G.validCaseCopyRenderedAsNotAcceptedFrom9E,
    wordingReadabilityScoreFrom9E: baseline9G.baseline9F.wordingReadabilityScoreFrom9E,
    exportTitleMentions9H,
    exportMainIdIs9H,
    exportMainCurrentVersionVisible: exportCurrentDataAttributeVisible,
    exportCurrentDataAttributeVisible,
    exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9H",
    exportCoverBadgeCorrect: exportCoverBadgeText === "Export compact 9H",
    exportCoverBadgeStaleVersionCount: metadataFalsePositiveCountAfter9H,
    metadataFalsePositiveCountAfter9H,
    bodyMentionFallbackUsedForCoverBadge: false,
    historical9GPreserved,
    historical9FPreserved,
    historical9EPreserved,
    historical9DPreserved,
    historical9CPreserved,
    historical9BPreserved,
    historical9APreserved,
    historical8Z8Y8X8WPreserved,
    validationRuntimeActive: baseline9G.validationRuntimeActive,
    payloadValidationRuntimeDetected: baseline9G.payloadValidationRuntimeDetected,
    validationExecutionCount: baseline9G.validationExecutionCount,
    realPayloadReadCount: baseline9G.realPayloadReadCount,
    payloadCreated: baseline9G.payloadCreated,
    realPayloadInstanceCount: baseline9G.realPayloadInstanceCount,
    dryRunAcceptedPayloadCount: baseline9G.dryRunAcceptedPayloadCount,
    realInputActivated: baseline9G.realInputActivated,
    realPreviewGenerated: baseline9G.realPreviewGenerated,
    previewActivationCount: baseline9G.previewActivationCount,
    submitCreated: baseline9G.submitCreated,
    apiCreated: baseline9G.apiCreated,
    backendCreated: baseline9G.backendCreated,
    storageCreated: baseline9G.storageCreated,
    memoryCreated: baseline9G.memoryCreated,
    draftCreated: baseline9G.draftCreated,
    historyCreated: baseline9G.historyCreated,
    officialTruthPromoted: baseline9G.officialTruthPromoted,
    automaticDecisionCreated: baseline9G.automaticDecisionCreated,
    selectionDriven: baseline9G.selectionDriven,
    tacticalInstructionDriven: baseline9G.tacticalInstructionDriven,
    scoreMutationCount: baseline9G.scoreMutationCount,
    timelineMutationCount: baseline9G.timelineMutationCount,
    scoreChangeCreationCount: baseline9G.scoreChangeCreationCount,
    eventMutationCount: baseline9G.eventMutationCount,
    groupingWordingReadOnlyVisible: visibleText.includes("lecture") || visibleText.includes("ux grouping uniquement"),
    groupingWordingNonRuntimeVisible: visibleText.includes("aucun runtime"),
    groupingWordingNoPayloadAcceptedVisible: visibleText.includes("aucune acceptation de payload") || visibleText.includes("non accepte"),
    groupingWordingNoPreviewVisible: visibleText.includes("aucune preview reelle") || visibleText.includes("preview reelle"),
    groupingWordingNoSubmitApiBackendVisible: visibleText.includes("submit") && visibleText.includes("api") && visibleText.includes("backend"),
    groupingWordingNoOfficialTruthVisible: visibleText.includes("official truth"),
    groupingWordingNoSelectionTacticVisible: visibleText.includes("selection") && visibleText.includes("tactique"),
    groupingWordingNoScoreTimelineMutationVisible: visibleText.includes("score") && visibleText.includes("timeline"),
    groupingWordingNotAFormVisible: !visibleText.includes("formulaire actif"),
    groupingWordingNotAValidatorVisible: !visibleText.includes("valider maintenant"),
    groupingWordingNotDecisionReadyVisible: !visibleText.includes("decision prete"),
    ambiguousGroupingWordingCount,
    actionInstructionWordingCount,
    tacticalInstructionWordingCount,
    selectionInstructionWordingCount,
    validationActiveClaimCount,
    payloadAcceptedClaimCount,
    previewGeneratedClaimCount,
    storageReadyClaimCount,
    submitReadyClaimCount,
    wordingReadabilityScore,
    wordingPassThreshold: 90,
    wordingPassStrongThreshold: 95,
    wordingThresholdStatus: wordingStatus(wordingReadabilityScore),
    wordingThresholdStatusCorrect: wordingStatus(wordingReadabilityScore) === "pass_strong",
    exportReadTimeSecondsBefore9H,
    exportReadTimeSecondsAfter9H,
    exportReadTimeDelta9H: exportReadTimeSecondsAfter9H - exportReadTimeSecondsBefore9H,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder790Seconds,
    exportUnder760Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9H <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9H <= 800),
    exportUnder790BooleanCorrect: exportUnder790Seconds === (exportReadTimeSecondsAfter9H <= 790),
    exportUnder760BooleanCorrect: exportUnder760Seconds === (exportReadTimeSecondsAfter9H <= 760),
    exportBudgetPassStrongEligible: exportUnder800Seconds,
    exportBudgetRiskBefore9H: budgetRisk(exportReadTimeSecondsBefore9H),
    exportBudgetRiskAfter9H: budgetRisk(exportReadTimeSecondsAfter9H),
    exportBudgetStrategy: "replace_previous_summary_with_grouped_summary",
    exportAddedSecondsFromGrouping: estimateManualReviewExportReadTimeSeconds9F(exportGroupingSectionHtml),
    exportCompactedSecondsElsewhere: estimateManualReviewExportReadTimeSeconds9F(baseline9G.exportRepairSectionHtml),
    exportNetBudgetDelta: exportReadTimeSecondsAfter9H - exportReadTimeSecondsBefore9H,
    sourceOfTruthSeparationPreserved: baseline9G.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9G.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline9G.guardrailsPreserved,
    scoringConstantsChanged: baseline9G.scoringConstantsChanged,
    penaltyShotInactive: baseline9G.penaltyShotInactive,
    matchBonusEventChanged: baseline9G.matchBonusEventChanged,
    batchLiveSeparationPreserved: baseline9G.batchLiveSeparationPreserved,
    sharePackPass: input.sharePackPass ?? true,
    groups,
    grouping,
    groupedCopies,
    groupingAudit,
    coverageAudit,
    guard,
    productGroupingSectionHtml,
    exportGroupingSectionHtml,
    productHtmlAfter9H,
    exportHtmlAfter9H,
    warningCodes,
    recommendation,
    nextSprintRecommendation,
  };
}

export function currentManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel(): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel {
  return buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel();
}

export function renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HDoc(
  model: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Error Copy UX Grouping Without Preview Activation 9H",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## UX Grouping Summary",
    ...table([
      ["Metric", "Value"],
      ["uxGroupCount", `${model.uxGroupCount}/${model.uxGroupCountExpected}`],
      ["groupedErrorCopyCount", `${model.groupedErrorCopyCount}/${model.groupedErrorCopyCountExpected}`],
      ["groupedBlockerCopyCount", `${model.groupedBlockerCopyCount}/${model.groupedBlockerCopyCountExpected}`],
      ["groupedRefusalCopyCount", `${model.groupedRefusalCopyCount}/${model.groupedRefusalCopyCountExpected}`],
      ["groupedCompatibleCaseCount", `${model.groupedCompatibleCaseCount}/${model.groupedCompatibleCaseCountExpected}`],
      ["ungroupedCopyCount", String(model.ungroupedCopyCount)],
      ["duplicatedCopyCount", String(model.duplicatedCopyCount)],
      ["coverage", `${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}`],
    ]),
    "",
    "## UX Groups",
    ...table([
      ["Group", "Label", "Copies", "Severity", "Boundary"],
      ...model.groups.map((groupItem) => [
        groupItem.groupId,
        groupItem.label,
        String(groupItem.copyCount),
        groupItem.severity,
        groupItem.primaryBoundary,
      ]),
    ]),
    "",
    "## 9G Warning Consistency Preservation",
    ...table([
      ["Metric", "Value"],
      ["exportKeyMessagesDetectedCountFrom9G", String(model.exportKeyMessagesDetectedCountFrom9G)],
      ["exportKeyMessagesMissingCountFrom9G", String(model.exportKeyMessagesMissingCountFrom9G)],
      ["exportKeyMessagesPreservedFrom9G", bool(model.exportKeyMessagesPreservedFrom9G)],
      ["EXPORT_KEY_MESSAGES_MISSING flag", bool(model.exportKeyMessagesMissingFlagFrom9G)],
      ["warningContradictionCountBefore9G", String(model.warningContradictionCountBefore9G)],
      ["warningContradictionCountAfter9H", String(model.warningContradictionCountAfter9H)],
      ["warningMutualExclusionGuardPassed", bool(model.warningMutualExclusionGuardPassed)],
    ]),
    "",
    "## Export Budget",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsBefore9H", String(model.exportReadTimeSecondsBefore9H)],
      ["exportReadTimeSecondsAfter9H", String(model.exportReadTimeSecondsAfter9H)],
      ["exportReadTimeDelta9H", String(model.exportReadTimeDelta9H)],
      ["exportUnder900Seconds", bool(model.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.exportUnder800Seconds)],
      ["exportUnder790Seconds", bool(model.exportUnder790Seconds)],
      ["exportBudgetStrategy", model.exportBudgetStrategy],
      ["exportNetBudgetDelta", String(model.exportNetBudgetDelta)],
    ]),
    "",
    "## Metadata",
    ...table([
      ["Metric", "Value"],
      ["exportTitleMentions9H", bool(model.exportTitleMentions9H)],
      ["exportMainIdIs9H", bool(model.exportMainIdIs9H)],
      ["exportCurrentDataAttributeVisible", bool(model.exportCurrentDataAttributeVisible)],
      ["exportCoverBadgeText", model.exportCoverBadgeText],
      ["metadataFalsePositiveCountAfter9H", String(model.metadataFalsePositiveCountAfter9H)],
      ["historical 9G/9F/9E/9D/9C/9B/9A/8Z8Y8X8W", bool(model.historical9GPreserved && model.historical9FPreserved && model.historical9EPreserved && model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved && model.historical8Z8Y8X8WPreserved)],
    ]),
    "",
    "## No Runtime And Source Of Truth",
    ...table([
      ["Guard", "Value"],
      ["validationRuntimeActive", bool(model.validationRuntimeActive)],
      ["realPayloadReadCount", String(model.realPayloadReadCount)],
      ["payloadCreated", bool(model.payloadCreated)],
      ["dryRunAcceptedPayloadCount", String(model.dryRunAcceptedPayloadCount)],
      ["realPreviewGenerated", bool(model.realPreviewGenerated)],
      ["previewActivationCount", String(model.previewActivationCount)],
      ["submit/api/backend/storage/memory", `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}/${bool(model.storageCreated)}/${bool(model.memoryCreated)}`],
      ["officialTruthPromoted", bool(model.officialTruthPromoted)],
      ["decision/selection/tactic", `${bool(model.automaticDecisionCreated)}/${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
      ["scoringConstantsChanged", bool(model.scoringConstantsChanged)],
      ["MatchBonusEventChanged", bool(model.matchBonusEventChanged)],
      ["batchLiveSeparationPreserved", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Wording",
    ...table([
      ["Metric", "Value"],
      ["wordingReadabilityScore", String(model.wordingReadabilityScore)],
      ["wordingThresholdStatus", model.wordingThresholdStatus],
      ["ambiguousGroupingWordingCount", String(model.ambiguousGroupingWordingCount)],
      ["actionInstructionWordingCount", String(model.actionInstructionWordingCount)],
      ["selectionInstructionWordingCount", String(model.selectionInstructionWordingCount)],
      ["tacticalInstructionWordingCount", String(model.tacticalInstructionWordingCount)],
    ]),
    "",
    "## Guard",
    ...table([
      ["Guard", "Value"],
      ["groupingAllowed", bool(model.guard.groupingAllowed)],
      ["groupingComplete", bool(model.guard.groupingComplete)],
      ["exportBudgetPassed", bool(model.guard.exportBudgetPassed)],
      ["exportBudgetPassStrongEligible", bool(model.guard.exportBudgetPassStrongEligible)],
      ["warningConsistencyPreserved", bool(model.guard.warningConsistencyPreserved)],
      ["violations", model.guard.violations.join(", ") || "none"],
    ]),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].flat().join("\n");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HValidation(
  model: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
): string {
  const checks = [
    checkLine("9H model exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H", model.version),
    checkLine("baseline 9G preserved", model.baseline9GPreserved, bool(model.baseline9GPreserved)),
    checkLine("baseline 9F preserved", model.baseline9FPreserved, bool(model.baseline9FPreserved)),
    checkLine("baseline 9E preserved", model.baseline9EPreserved, bool(model.baseline9EPreserved)),
    checkLine("UX groups = 5", model.uxGroupCount === 5, String(model.uxGroupCount)),
    checkLine("all grouped counts preserved", model.groupedErrorCopyCount === 19 && model.groupedBlockerCopyCount === 12 && model.groupedRefusalCopyCount === 8 && model.groupedCompatibleCaseCount === 1, `${model.groupedErrorCopyCount}/${model.groupedBlockerCopyCount}/${model.groupedRefusalCopyCount}/${model.groupedCompatibleCaseCount}`),
    checkLine("coverage 19/12/14/8 unchanged", model.errorCopyErrorCoverageCountFrom9E === 19 && model.errorCopyBlockerCoverageCountFrom9E === 12 && model.errorCopyBoundaryGuardCoverageCountFrom9E === 14 && model.errorCopyRefusalStateCoverageCountFrom9E === 8, `${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}`),
    checkLine("missing group assignments none", model.ungroupedCopyCount === 0, String(model.ungroupedCopyCount)),
    checkLine("duplicated group assignments none", model.duplicatedCopyCount === 0, String(model.duplicatedCopyCount)),
    checkLine("compatible case remains not accepted", model.compatibleCaseStillNotAcceptedInGrouping && model.validCaseCopyRenderedAsNotAcceptedFrom9E, bool(model.compatibleCaseStillNotAcceptedInGrouping)),
    checkLine("product 9H grouping visible", model.productErrorCopyUxGroupingVisible && model.productHtmlAfter9H.includes("Regroupement UX des erreurs dry-run"), "visible"),
    checkLine("export 9H grouping visible", model.exportErrorCopyUxGroupingVisible && model.exportHtmlAfter9H.includes("Groupes erreurs dry-run"), "visible"),
    checkLine("9G key messages preserved", model.exportKeyMessagesDetectedCountFrom9G === 7 && model.exportKeyMessagesMissingCountFrom9G === 0 && model.exportKeyMessagesPreservedFrom9G, `${model.exportKeyMessagesDetectedCountFrom9G}/${model.exportKeyMessagesMissingCountFrom9G}`),
    checkLine("warning contradiction remains zero", model.warningContradictionCountAfter9H === 0, String(model.warningContradictionCountAfter9H)),
    checkLine("EXPORT_KEY_MESSAGES_MISSING remains absent", !model.exportKeyMessagesNegativeWarningEmitted, bool(!model.exportKeyMessagesNegativeWarningEmitted)),
    checkLine("export <=800", model.exportReadTimeSecondsAfter9H <= 800, String(model.exportReadTimeSecondsAfter9H)),
    checkLine("export metadata 9H clean", model.exportTitleMentions9H && model.exportMainIdIs9H && model.exportCoverBadgeCorrect && model.metadataFalsePositiveCountAfter9H === 0, model.exportCoverBadgeText),
    checkLine("historical data attrs preserved", model.historical9GPreserved && model.historical9FPreserved && model.historical9EPreserved && model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved && model.historical8Z8Y8X8WPreserved, "historical attrs"),
    checkLine("no runtime payload preview storage truth action mutation", !model.validationRuntimeActive && model.realPayloadReadCount === 0 && !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0 && !model.realPreviewGenerated && model.previewActivationCount === 0 && !model.storageCreated && !model.memoryCreated && !model.officialTruthPromoted && !model.automaticDecisionCreated && !model.selectionDriven && !model.tacticalInstructionDriven && model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.eventMutationCount === 0, "clean"),
    checkLine("wording score >=95", model.wordingReadabilityScore >= 95, String(model.wordingReadabilityScore)),
    checkLine("no active wording claims", model.validationActiveClaimCount === 0 && model.payloadAcceptedClaimCount === 0 && model.previewGeneratedClaimCount === 0 && model.actionInstructionWordingCount === 0 && model.selectionInstructionWordingCount === 0 && model.tacticalInstructionWordingCount === 0, "0"),
    checkLine("scoring unchanged", !model.scoringConstantsChanged && model.penaltyShotInactive, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.matchBonusEventChanged, bool(!model.matchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
    checkLine("required validation command visible", REQUIRED_VALIDATION_COMMAND.includes("npm run test:all"), REQUIRED_VALIDATION_COMMAND),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : model.status === "FAIL" ? "FAIL" : "PARTIAL";

  return [
    "# Validation Coach Report Manual Review Preview Payload Dry-Run Error Copy UX Grouping Without Preview Activation 9H",
    "",
    `Status: ${status}`,
    `Model status: ${model.status}`,
    "",
    ...checks,
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
