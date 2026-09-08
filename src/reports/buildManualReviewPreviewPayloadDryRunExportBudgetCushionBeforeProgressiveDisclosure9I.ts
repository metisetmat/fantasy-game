import {
  currentManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
} from "./buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9H";
import type { ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";
import {
  auditManualReviewPreviewPayloadDryRunExportBudgetCushion9I,
  auditManualReviewPreviewPayloadDryRunExportBudgetMetadata9I,
} from "./manualReviewPreviewPayloadDryRunExportBudgetCushionAudit9I";
import { evaluateManualReviewPreviewPayloadDryRunExportBudgetCushionBoundary9I } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionGuard9I";
import type {
  ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
  ManualReviewPreviewPayloadDryRunExportBudgetCushionNextSprintRecommendation9I,
  ManualReviewPreviewPayloadDryRunExportBudgetCushionRecommendation9I,
  ManualReviewPreviewPayloadDryRunExportBudgetCushionStatus9I,
} from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I_BLOCKING_WARNINGS,
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I_NEGATIVE_WARNINGS,
  type ManualReviewPreviewPayloadDryRunExportBudgetCushionWarningCode9I,
  uniqueWarningCodes9I,
} from "./manualReviewPreviewPayloadDryRunExportBudgetCushionWarnings9I";
import {
  insertManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I,
  renderManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I,
} from "./renderManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I";
import {
  insertManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I,
  renderManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I,
} from "./renderManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I";

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

function assertBaseline9HReady(baseline9H: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel): void {
  if (baseline9H.status !== "PASS") throw new Error("9I requires a PASS 9H UX-grouping baseline");
  if (baseline9H.exportReadTimeSecondsAfter9H !== 799) {
    throw new Error("9I requires the documented 9H export baseline to be 799 seconds");
  }
  if (baseline9H.uxGroupCount !== 5 || baseline9H.groupedErrorCopyCount !== 19 || baseline9H.groupedBlockerCopyCount !== 12) {
    throw new Error("9I requires preserved 9H grouping counts");
  }
  if (baseline9H.exportKeyMessagesDetectedCountFrom9G !== 7 || baseline9H.exportKeyMessagesMissingCountFrom9G !== 0) {
    throw new Error("9I requires preserved 9G key-message detection");
  }
  if (baseline9H.warningContradictionCountAfter9H !== 0) {
    throw new Error("9I requires warning contradiction after 9H to be 0");
  }
}

function recommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunExportBudgetCushionStatus9I,
): ManualReviewPreviewPayloadDryRunExportBudgetCushionRecommendation9I {
  if (status === "PASS") return "KEEP_EXPORT_BUDGET_CUSHION";
  if (status === "PARTIAL") return "REVIEW_EXPORT_BUDGET_CUSHION";
  return "FIX_EXPORT_BUDGET_CUSHION_REGRESSION";
}

function nextRecommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunExportBudgetCushionStatus9I,
  exportUnder780Seconds: boolean,
  exportUnder800Seconds: boolean,
): ManualReviewPreviewPayloadDryRunExportBudgetCushionNextSprintRecommendation9I {
  if (status === "PASS" && exportUnder780Seconds) {
    return "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_WITHOUT_PREVIEW_ACTIVATION";
  }
  if (status === "PASS" && exportUnder800Seconds) return "EXPORT_BUDGET_CUSHION_FINAL_PASS";
  if (status === "PARTIAL") return "EXPORT_BUDGET_REPAIR_BEFORE_PROGRESSIVE_DISCLOSURE";
  return "EXPORT_BUDGET_CUSHION_SOURCE_OF_TRUTH_REGRESSION_FIX";
}

export function buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel(input: {
  readonly baseline9H?: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel;
  readonly productHtmlBefore9I?: string;
  readonly exportHtmlBefore9I?: string;
  readonly sharePackPass?: boolean;
} = {}): ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel {
  const baseline9H = input.baseline9H ?? currentManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel();
  assertBaseline9HReady(baseline9H);

  const productHtmlBefore9I = input.productHtmlBefore9I ?? baseline9H.productHtmlAfter9H;
  const exportHtmlBefore9I = input.exportHtmlBefore9I ?? baseline9H.exportHtmlAfter9H;
  const exportBudgetCushionSectionHtml = renderManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I();
  const exportHtmlAfter9I = insertManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I(exportHtmlBefore9I);
  const budgetAudit = auditManualReviewPreviewPayloadDryRunExportBudgetCushion9I({
    exportHtmlBefore9I,
    exportHtmlAfter9I,
    baselineReadTimeSecondsBefore9I: baseline9H.exportReadTimeSecondsAfter9H,
  });
  const metadataAudit = auditManualReviewPreviewPayloadDryRunExportBudgetMetadata9I(exportHtmlAfter9I);

  const productSeed = {
    status: "PASS" as const,
    exportReadTimeSecondsBefore9I: budgetAudit.exportReadTimeSecondsBefore9I,
    exportReadTimeSecondsAfter9I: budgetAudit.exportReadTimeSecondsAfter9I,
    exportReadTimeDelta9I: budgetAudit.exportReadTimeDelta9I,
    exportBudgetCushionSeconds: budgetAudit.exportBudgetCushionSeconds,
    exportBudgetCushionStatus: budgetAudit.exportBudgetCushionStatus,
    uxGroupCountFrom9H: baseline9H.uxGroupCount,
    groupedErrorCopyCountFrom9H: baseline9H.groupedErrorCopyCount,
    groupedBlockerCopyCountFrom9H: baseline9H.groupedBlockerCopyCount,
    groupedRefusalCopyCountFrom9H: baseline9H.groupedRefusalCopyCount,
    groupedCompatibleCaseCountFrom9H: baseline9H.groupedCompatibleCaseCount,
    exportKeyMessagesDetectedCountFrom9G: baseline9H.exportKeyMessagesDetectedCountFrom9G,
    warningContradictionCountAfter9I: baseline9H.warningContradictionCountAfter9H,
    validationRuntimeActive: baseline9H.validationRuntimeActive,
    dryRunAcceptedPayloadCount: baseline9H.dryRunAcceptedPayloadCount,
    realPreviewGenerated: baseline9H.realPreviewGenerated,
    storageCreated: baseline9H.storageCreated,
    officialTruthPromoted: baseline9H.officialTruthPromoted,
    scoreMutationCount: baseline9H.scoreMutationCount,
    timelineMutationCount: baseline9H.timelineMutationCount,
  };
  const productBudgetCushionSectionHtml = renderManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I(productSeed);
  const productHtmlAfter9I = insertManualReviewPreviewPayloadDryRunExportBudgetCushionProduct9I(productHtmlBefore9I, productSeed);

  const modelSeed = {
    baseline9HPreserved: baseline9H.status === "PASS",
    baseline9GPreserved: baseline9H.baseline9GPreserved,
    baseline9FPreserved: baseline9H.baseline9FPreserved,
    baseline9EPreserved: baseline9H.baseline9EPreserved,
    productBudgetCushionSectionVisible: productHtmlAfter9I.includes('id="manual-review-preview-payload-dry-run-export-budget-cushion-9i"'),
    exportBudgetCushionSectionVisible: exportHtmlAfter9I.includes('id="manual-review-preview-payload-dry-run-export-budget-cushion-9i"'),
    exportDetailsPreservedInProduct:
      productHtmlAfter9I.includes("Regroupement UX des erreurs dry-run") &&
      productHtmlAfter9I.includes("Forme compatible - non acceptee") &&
      productHtmlAfter9I.includes("Messages blockers"),
    exportReadTimeSecondsAfter9I: budgetAudit.exportReadTimeSecondsAfter9I,
    exportUnder900BooleanCorrect: budgetAudit.exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect: budgetAudit.exportUnder800BooleanCorrect,
    exportUnder790BooleanCorrect: budgetAudit.exportUnder790BooleanCorrect,
    exportUnder780BooleanCorrect: budgetAudit.exportUnder780BooleanCorrect,
    ...metadataAudit,
    uxGroupCountFrom9H: baseline9H.uxGroupCount,
    groupedErrorCopyCountFrom9H: baseline9H.groupedErrorCopyCount,
    groupedBlockerCopyCountFrom9H: baseline9H.groupedBlockerCopyCount,
    groupedRefusalCopyCountFrom9H: baseline9H.groupedRefusalCopyCount,
    groupedCompatibleCaseCountFrom9H: baseline9H.groupedCompatibleCaseCount,
    ungroupedCopyCountFrom9H: baseline9H.ungroupedCopyCount,
    duplicatedCopyCountFrom9H: baseline9H.duplicatedCopyCount,
    exportKeyMessagesDetectedCountFrom9G: baseline9H.exportKeyMessagesDetectedCountFrom9G,
    exportKeyMessagesMissingCountFrom9G: baseline9H.exportKeyMessagesMissingCountFrom9G,
    warningContradictionCountAfter9I: baseline9H.warningContradictionCountAfter9H,
    validationRuntimeActive: baseline9H.validationRuntimeActive,
    realPayloadReadCount: baseline9H.realPayloadReadCount,
    payloadCreated: baseline9H.payloadCreated,
    dryRunAcceptedPayloadCount: baseline9H.dryRunAcceptedPayloadCount,
    realPreviewGenerated: baseline9H.realPreviewGenerated,
    previewActivationCount: baseline9H.previewActivationCount,
    submitCreated: baseline9H.submitCreated,
    apiCreated: baseline9H.apiCreated,
    backendCreated: baseline9H.backendCreated,
    storageCreated: baseline9H.storageCreated,
    memoryCreated: baseline9H.memoryCreated,
    draftCreated: baseline9H.draftCreated,
    historyCreated: baseline9H.historyCreated,
    officialTruthPromoted: baseline9H.officialTruthPromoted,
    automaticDecisionCreated: baseline9H.automaticDecisionCreated,
    selectionDriven: baseline9H.selectionDriven,
    tacticalInstructionDriven: baseline9H.tacticalInstructionDriven,
    scoreMutationCount: baseline9H.scoreMutationCount,
    timelineMutationCount: baseline9H.timelineMutationCount,
    scoreChangeCreationCount: baseline9H.scoreChangeCreationCount,
    eventMutationCount: baseline9H.eventMutationCount,
    sourceOfTruthSeparationPreserved: baseline9H.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9H.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline9H.guardrailsPreserved,
    scoringConstantsChanged: baseline9H.scoringConstantsChanged,
    matchBonusEventChanged: baseline9H.matchBonusEventChanged,
  };
  const guard = evaluateManualReviewPreviewPayloadDryRunExportBudgetCushionBoundary9I(modelSeed);
  const warningCodesBeforeGuard = uniqueWarningCodes9I([
    baseline9H.status === "PASS" ? "BASELINE_9H_PRESERVED" : "BASELINE_9H_REGRESSED",
    baseline9H.baseline9GPreserved ? "BASELINE_9G_PRESERVED" : "BASELINE_9G_REGRESSED",
    baseline9H.baseline9FPreserved ? "BASELINE_9F_PRESERVED" : "BASELINE_9F_REGRESSED",
    baseline9H.baseline9EPreserved ? "BASELINE_9E_PRESERVED" : "BASELINE_9E_REGRESSED",
    budgetAudit.exportUnder900Seconds ? "EXPORT_UNDER_900_READY_9I" : "EXPORT_OVER_900_9I",
    budgetAudit.exportUnder800Seconds ? "EXPORT_UNDER_800_READY_9I" : "EXPORT_OVER_800_PASS_STRONG_BLOCKED_9I",
    budgetAudit.exportUnder780Seconds ? "EXPORT_UNDER_780_READY_9I" : "EXPORT_OVER_780_MARGIN_WARNING_9I",
    budgetAudit.exportBudgetCushionStatus === "cushion_created" ? "EXPORT_CUSHION_CREATED_9I" : "EXPORT_CUSHION_NOT_CREATED_9I",
    metadataAudit.exportTitleMentions9I && metadataAudit.exportMainIdIs9I && metadataAudit.exportCurrentDataAttributeVisible
      ? "EXPORT_METADATA_9I_VISIBLE"
      : "EXPORT_METADATA_9I_MISSING",
    metadataAudit.exportCoverBadgeCorrect ? "EXPORT_COVER_BADGE_9I_READY" : "EXPORT_COVER_BADGE_9I_STALE",
    baseline9H.uxGroupCount === 5 && baseline9H.groupedErrorCopyCount === 19 && baseline9H.groupedBlockerCopyCount === 12
      ? "ERROR_COPY_UX_GROUPING_PRESERVED_9I"
      : "EXPORT_9H_GROUPING_REGRESSED_9I",
    baseline9H.exportKeyMessagesDetectedCountFrom9G === 7 && baseline9H.exportKeyMessagesMissingCountFrom9G === 0
      ? "EXPORT_KEY_MESSAGES_9G_PRESERVED_9I"
      : "EXPORT_KEY_MESSAGES_9G_REGRESSED_9I",
    baseline9H.warningContradictionCountAfter9H === 0
      ? "WARNING_CONTRADICTION_COUNT_ZERO_9I"
      : "WARNING_CONTRADICTION_REINTRODUCED_9I",
    !baseline9H.validationRuntimeActive ? "NO_RUNTIME_VALIDATION_9I" : "VALIDATION_RUNTIME_ACTIVE_DETECTED_9I",
    baseline9H.realPayloadReadCount === 0 ? "NO_PAYLOAD_READ_9I" : "REAL_PAYLOAD_READ_DETECTED_9I",
    !baseline9H.payloadCreated ? "NO_PAYLOAD_CREATED_9I" : "PAYLOAD_CREATION_DETECTED_9I",
    baseline9H.dryRunAcceptedPayloadCount === 0 ? "NO_PAYLOAD_ACCEPTED_9I" : "PAYLOAD_ACCEPTANCE_DETECTED_9I",
    !baseline9H.realPreviewGenerated && baseline9H.previewActivationCount === 0 ? "NO_PREVIEW_GENERATED_9I" : "REAL_PREVIEW_GENERATION_DETECTED_9I",
    !baseline9H.storageCreated && !baseline9H.memoryCreated && !baseline9H.draftCreated && !baseline9H.historyCreated
      ? "NO_PERSISTENCE_9I"
      : "PERSISTENCE_DETECTED_9I",
    !baseline9H.officialTruthPromoted ? "NO_OFFICIAL_TRUTH_9I" : "OFFICIAL_TRUTH_PROMOTION_DETECTED_9I",
    !baseline9H.automaticDecisionCreated && !baseline9H.selectionDriven && !baseline9H.tacticalInstructionDriven
      ? "NO_DECISION_SELECTION_OR_TACTIC_9I"
      : "DECISION_SELECTION_OR_TACTIC_DETECTED_9I",
    baseline9H.scoreMutationCount === 0 &&
    baseline9H.timelineMutationCount === 0 &&
    baseline9H.scoreChangeCreationCount === 0 &&
    baseline9H.eventMutationCount === 0
      ? "NO_SCORE_TIMELINE_MUTATION_9I"
      : "SCORE_OR_TIMELINE_MUTATION_DETECTED_9I",
    baseline9H.sourceOfTruthSeparationPreserved && baseline9H.matchEconomyBaselinePreserved && baseline9H.guardrailsPreserved
      ? "SOURCE_OF_TRUTH_PRESERVED_9I"
      : "SOURCE_OF_TRUTH_REGRESSED_9I",
    !baseline9H.scoringConstantsChanged ? "SCORING_CONSTANTS_UNCHANGED_9I" : "SCORE_MANIPULATION_DETECTED_9I",
    !baseline9H.matchBonusEventChanged ? "MATCH_BONUS_EVENT_UNCHANGED_9I" : "MATCH_BONUS_EVENT_CHANGED_9I",
  ]);
  const allWarnings = uniqueWarningCodes9I([...warningCodesBeforeGuard, ...guard.violations]);
  const hasBlocking = allWarnings.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I_BLOCKING_WARNINGS.includes(warning),
  );
  const negativeWarningCount = allWarnings.filter((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I_NEGATIVE_WARNINGS.includes(warning),
  ).length;
  const status: ManualReviewPreviewPayloadDryRunExportBudgetCushionStatus9I = hasBlocking
    ? "FAIL"
    : negativeWarningCount > 0 || guard.statusRecommendation === "PARTIAL"
      ? "PARTIAL"
      : "PASS";
  const warningCodes = uniqueWarningCodes9I([
    ...allWarnings,
    ...(status === "PASS"
      ? (["EXPORT_BUDGET_CUSHION_READY_9I", "EXPORT_9H_BASELINE_PRESERVED_9I"] as const)
      : status === "PARTIAL"
        ? (["EXPORT_BUDGET_CUSHION_PARTIAL_9I"] as const)
        : (["EXPORT_BUDGET_CUSHION_FAIL_9I"] as const)),
  ]);
  const recommendation = recommendationFromStatus(status);
  const nextSprintRecommendation = nextRecommendationFromStatus(status, budgetAudit.exportUnder780Seconds, budgetAudit.exportUnder800Seconds);

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_BEFORE_PROGRESSIVE_DISCLOSURE",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H",
    baseline9H,
    matchId: baseline9H.matchId,
    officialScore: baseline9H.officialScore,
    baseline9HPreserved: modelSeed.baseline9HPreserved,
    baseline9GPreserved: modelSeed.baseline9GPreserved,
    baseline9FPreserved: modelSeed.baseline9FPreserved,
    baseline9EPreserved: modelSeed.baseline9EPreserved,
    baseline9DPreserved: baseline9H.baseline9DPreserved,
    baseline9CPreserved: baseline9H.baseline9CPreserved,
    baseline9BPreserved: baseline9H.baseline9BPreserved,
    baseline9APreserved: baseline9H.baseline9APreserved,
    baseline8ZPreserved: baseline9H.baseline8ZPreserved,
    baseline8YPreserved: baseline9H.baseline8YPreserved,
    baseline8XPreserved: baseline9H.baseline8XPreserved,
    baseline8WPreserved: baseline9H.baseline8WPreserved,
    baseline8VThrough6XPreserved: baseline9H.baseline8VThrough6XPreserved,
    exportBudgetCushionMode: "export_compaction_only",
    exportBudgetCushionStatus: budgetAudit.exportBudgetCushionStatus,
    exportBudgetCushionStatusCorrect: budgetAudit.exportBudgetCushionStatus === (budgetAudit.exportUnder780Seconds ? "cushion_created" : budgetAudit.exportUnder800Seconds ? "minimal_cushion" : budgetAudit.exportUnder900Seconds ? "no_cushion" : "failed_budget"),
    productBudgetCushionSectionVisible: modelSeed.productBudgetCushionSectionVisible,
    exportBudgetCushionSectionVisible: modelSeed.exportBudgetCushionSectionVisible,
    exportHistoryCompacted: !exportHtmlAfter9I.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f"'),
    exportDetailsPreservedInProduct: modelSeed.exportDetailsPreservedInProduct,
    exportReadTimeSecondsBefore9I: budgetAudit.exportReadTimeSecondsBefore9I,
    exportReadTimeSecondsAfter9I: budgetAudit.exportReadTimeSecondsAfter9I,
    exportReadTimeDelta9I: budgetAudit.exportReadTimeDelta9I,
    exportBudgetCushionSeconds: budgetAudit.exportBudgetCushionSeconds,
    exportTargetLowSeconds: budgetAudit.targetLowSeconds,
    exportTargetHighSeconds: budgetAudit.targetHighSeconds,
    exportUnder900Seconds: budgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: budgetAudit.exportUnder800Seconds,
    exportUnder790Seconds: budgetAudit.exportUnder790Seconds,
    exportUnder780Seconds: budgetAudit.exportUnder780Seconds,
    exportInTargetWindow: budgetAudit.exportInTargetWindow,
    exportUnder900BooleanCorrect: budgetAudit.exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect: budgetAudit.exportUnder800BooleanCorrect,
    exportUnder790BooleanCorrect: budgetAudit.exportUnder790BooleanCorrect,
    exportUnder780BooleanCorrect: budgetAudit.exportUnder780BooleanCorrect,
    exportBudgetPassStrongEligible: budgetAudit.exportBudgetPassStrongEligible,
    exportBudgetRiskBefore9I: budgetAudit.exportBudgetRiskBefore9I,
    exportBudgetRiskAfter9I: budgetAudit.exportBudgetRiskAfter9I,
    exportCompactionStrategy: "compact_export_history_keep_product_detail",
    exportCompactionRisks: budgetAudit.exportUnder780Seconds ? [] : ["budget margin remains above preferred target"],
    exportTitleMentions9I: metadataAudit.exportTitleMentions9I,
    exportMainIdIs9I: metadataAudit.exportMainIdIs9I,
    exportCurrentDataAttributeVisible: metadataAudit.exportCurrentDataAttributeVisible,
    exportCoverBadgeText: metadataAudit.exportCoverBadgeText,
    exportCoverBadgeExpectedText: metadataAudit.exportCoverBadgeExpectedText,
    exportCoverBadgeCorrect: metadataAudit.exportCoverBadgeCorrect,
    metadataFalsePositiveCountAfter9I: metadataAudit.metadataFalsePositiveCountAfter9I,
    historical9HPreserved: metadataAudit.historical9HPreserved,
    historical9GPreserved: metadataAudit.historical9GPreserved,
    historical9FPreserved: metadataAudit.historical9FPreserved,
    historical9EPreserved: metadataAudit.historical9EPreserved,
    historical9DPreserved: metadataAudit.historical9DPreserved,
    historical9CPreserved: metadataAudit.historical9CPreserved,
    historical9BPreserved: metadataAudit.historical9BPreserved,
    historical9APreserved: metadataAudit.historical9APreserved,
    historical8Z8Y8X8WPreserved: metadataAudit.historical8Z8Y8X8WPreserved,
    uxGroupCountFrom9H: baseline9H.uxGroupCount,
    groupedErrorCopyCountFrom9H: baseline9H.groupedErrorCopyCount,
    groupedBlockerCopyCountFrom9H: baseline9H.groupedBlockerCopyCount,
    groupedRefusalCopyCountFrom9H: baseline9H.groupedRefusalCopyCount,
    groupedCompatibleCaseCountFrom9H: baseline9H.groupedCompatibleCaseCount,
    ungroupedCopyCountFrom9H: baseline9H.ungroupedCopyCount,
    duplicatedCopyCountFrom9H: baseline9H.duplicatedCopyCount,
    errorCopyErrorCoverageCountFrom9E: baseline9H.errorCopyErrorCoverageCountFrom9E,
    errorCopyBlockerCoverageCountFrom9E: baseline9H.errorCopyBlockerCoverageCountFrom9E,
    errorCopyBoundaryGuardCoverageCountFrom9E: baseline9H.errorCopyBoundaryGuardCoverageCountFrom9E,
    errorCopyRefusalStateCoverageCountFrom9E: baseline9H.errorCopyRefusalStateCoverageCountFrom9E,
    exportKeyMessagesDetectedCountFrom9G: baseline9H.exportKeyMessagesDetectedCountFrom9G,
    exportKeyMessagesMissingCountFrom9G: baseline9H.exportKeyMessagesMissingCountFrom9G,
    warningContradictionCountAfter9H: baseline9H.warningContradictionCountAfter9H,
    warningContradictionCountAfter9I: baseline9H.warningContradictionCountAfter9H,
    warningMutualExclusionGuardPassed: baseline9H.warningMutualExclusionGuardPassed,
    validationRuntimeActive: baseline9H.validationRuntimeActive,
    payloadValidationRuntimeDetected: baseline9H.payloadValidationRuntimeDetected,
    validationExecutionCount: baseline9H.validationExecutionCount,
    realPayloadReadCount: baseline9H.realPayloadReadCount,
    payloadCreated: baseline9H.payloadCreated,
    realPayloadInstanceCount: baseline9H.realPayloadInstanceCount,
    dryRunAcceptedPayloadCount: baseline9H.dryRunAcceptedPayloadCount,
    realInputActivated: baseline9H.realInputActivated,
    realPreviewGenerated: baseline9H.realPreviewGenerated,
    previewActivationCount: baseline9H.previewActivationCount,
    submitCreated: baseline9H.submitCreated,
    apiCreated: baseline9H.apiCreated,
    backendCreated: baseline9H.backendCreated,
    storageCreated: baseline9H.storageCreated,
    memoryCreated: baseline9H.memoryCreated,
    draftCreated: baseline9H.draftCreated,
    historyCreated: baseline9H.historyCreated,
    officialTruthPromoted: baseline9H.officialTruthPromoted,
    automaticDecisionCreated: baseline9H.automaticDecisionCreated,
    selectionDriven: baseline9H.selectionDriven,
    tacticalInstructionDriven: baseline9H.tacticalInstructionDriven,
    scoreMutationCount: baseline9H.scoreMutationCount,
    timelineMutationCount: baseline9H.timelineMutationCount,
    scoreChangeCreationCount: baseline9H.scoreChangeCreationCount,
    eventMutationCount: baseline9H.eventMutationCount,
    sourceOfTruthSeparationPreserved: baseline9H.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9H.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline9H.guardrailsPreserved,
    scoringConstantsChanged: baseline9H.scoringConstantsChanged,
    penaltyShotInactive: baseline9H.penaltyShotInactive,
    matchBonusEventChanged: baseline9H.matchBonusEventChanged,
    batchLiveSeparationPreserved: baseline9H.batchLiveSeparationPreserved,
    sharePackPass: input.sharePackPass ?? true,
    budgetAudit,
    metadataAudit,
    guard,
    productBudgetCushionSectionHtml,
    exportBudgetCushionSectionHtml,
    productHtmlAfter9I,
    exportHtmlAfter9I,
    warningCodes,
    recommendation,
    nextSprintRecommendation,
  };
}

export function currentManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel(): ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel {
  return buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel();
}

export function renderManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IDoc(
  model: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Export Budget Cushion Before Progressive Disclosure 9I",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## Export Budget Cushion",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsBefore9I", String(model.exportReadTimeSecondsBefore9I)],
      ["exportReadTimeSecondsAfter9I", String(model.exportReadTimeSecondsAfter9I)],
      ["exportReadTimeDelta9I", String(model.exportReadTimeDelta9I)],
      ["exportBudgetCushionSeconds", String(model.exportBudgetCushionSeconds)],
      ["target", `${model.exportTargetLowSeconds}-${model.exportTargetHighSeconds}`],
      ["exportBudgetCushionStatus", model.exportBudgetCushionStatus],
      ["exportBudgetRiskBefore9I", model.exportBudgetRiskBefore9I],
      ["exportBudgetRiskAfter9I", model.exportBudgetRiskAfter9I],
    ]),
    "",
    "## Preservation",
    ...table([
      ["Metric", "Value"],
      ["baseline9HPreserved", bool(model.baseline9HPreserved)],
      ["baseline 9G/9F/9E", `${bool(model.baseline9GPreserved)}/${bool(model.baseline9FPreserved)}/${bool(model.baseline9EPreserved)}`],
      ["groups 9H", `${model.uxGroupCountFrom9H}/5`],
      ["copy counts 9H", `${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}`],
      ["coverage 9E", `${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}`],
      ["key messages 9G", `${model.exportKeyMessagesDetectedCountFrom9G}/7`],
      ["warning contradiction after 9I", String(model.warningContradictionCountAfter9I)],
    ]),
    "",
    "## Export Metadata",
    ...table([
      ["Metric", "Value"],
      ["exportTitleMentions9I", bool(model.exportTitleMentions9I)],
      ["exportMainIdIs9I", bool(model.exportMainIdIs9I)],
      ["exportCurrentDataAttributeVisible", bool(model.exportCurrentDataAttributeVisible)],
      ["exportCoverBadgeText", model.exportCoverBadgeText],
      ["historical attrs 9H-8W", bool(model.historical9HPreserved && model.historical9GPreserved && model.historical9FPreserved && model.historical9EPreserved && model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved && model.historical8Z8Y8X8WPreserved)],
      ["metadataFalsePositiveCountAfter9I", String(model.metadataFalsePositiveCountAfter9I)],
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
      ["submit/api/backend/storage/memory/history", `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}/${bool(model.storageCreated)}/${bool(model.memoryCreated)}/${bool(model.historyCreated)}`],
      ["officialTruthPromoted", bool(model.officialTruthPromoted)],
      ["decision/selection/tactic", `${bool(model.automaticDecisionCreated)}/${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
      ["scoringConstantsChanged", bool(model.scoringConstantsChanged)],
      ["MatchBonusEventChanged", bool(model.matchBonusEventChanged)],
      ["batchLiveSeparationPreserved", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Guard",
    ...table([
      ["Guard", "Value"],
      ["exportBudgetPassed", bool(model.guard.exportBudgetPassed)],
      ["exportBudgetPassStrongEligible", bool(model.guard.exportBudgetPassStrongEligible)],
      ["exportBudgetCushionCreated", bool(model.guard.exportBudgetCushionCreated)],
      ["preservationPassed", bool(model.guard.preservationPassed)],
      ["noRuntimePassed", bool(model.guard.noRuntimePassed)],
      ["sourceOfTruthPassed", bool(model.guard.sourceOfTruthPassed)],
      ["metadataPassed", bool(model.guard.metadataPassed)],
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

export function renderManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IValidation(
  model: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
): string {
  const checks = [
    checkLine("9I model exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I", model.version),
    checkLine("baseline 9H preserved", model.baseline9HPreserved, bool(model.baseline9HPreserved)),
    checkLine("baseline 9G/9F/9E preserved", model.baseline9GPreserved && model.baseline9FPreserved && model.baseline9EPreserved, `${bool(model.baseline9GPreserved)}/${bool(model.baseline9FPreserved)}/${bool(model.baseline9EPreserved)}`),
    checkLine("product 9I budget cushion visible", model.productBudgetCushionSectionVisible && model.productHtmlAfter9I.includes("Marge export avant progressive disclosure"), "visible"),
    checkLine("export 9I budget cushion visible", model.exportBudgetCushionSectionVisible && model.exportHtmlAfter9I.includes("Budget export 9I"), "visible"),
    checkLine("product details preserved", model.exportDetailsPreservedInProduct, bool(model.exportDetailsPreservedInProduct)),
    checkLine("9H grouping preserved", model.uxGroupCountFrom9H === 5 && model.groupedErrorCopyCountFrom9H === 19 && model.groupedBlockerCopyCountFrom9H === 12 && model.groupedRefusalCopyCountFrom9H === 8 && model.groupedCompatibleCaseCountFrom9H === 1, `${model.uxGroupCountFrom9H}/${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}`),
    checkLine("9H ungrouped and duplicated counts remain zero", model.ungroupedCopyCountFrom9H === 0 && model.duplicatedCopyCountFrom9H === 0, `${model.ungroupedCopyCountFrom9H}/${model.duplicatedCopyCountFrom9H}`),
    checkLine("9E coverage 19/12/14/8 unchanged", model.errorCopyErrorCoverageCountFrom9E === 19 && model.errorCopyBlockerCoverageCountFrom9E === 12 && model.errorCopyBoundaryGuardCoverageCountFrom9E === 14 && model.errorCopyRefusalStateCoverageCountFrom9E === 8, `${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}`),
    checkLine("9G key messages preserved", model.exportKeyMessagesDetectedCountFrom9G === 7 && model.exportKeyMessagesMissingCountFrom9G === 0, `${model.exportKeyMessagesDetectedCountFrom9G}/${model.exportKeyMessagesMissingCountFrom9G}`),
    checkLine("warning contradiction remains zero", model.warningContradictionCountAfter9I === 0, String(model.warningContradictionCountAfter9I)),
    checkLine("export before 9I is 799", model.exportReadTimeSecondsBefore9I === 799, String(model.exportReadTimeSecondsBefore9I)),
    checkLine("export <=900", model.exportUnder900Seconds, String(model.exportReadTimeSecondsAfter9I)),
    checkLine("export <=800", model.exportUnder800Seconds, String(model.exportReadTimeSecondsAfter9I)),
    checkLine("export <=780", model.exportUnder780Seconds, String(model.exportReadTimeSecondsAfter9I)),
    checkLine("export cushion created", model.exportBudgetCushionStatus === "cushion_created" && model.exportBudgetCushionSeconds >= 20, `${model.exportBudgetCushionStatus}/${model.exportBudgetCushionSeconds}`),
    checkLine("export read-time booleans correct", model.exportUnder900BooleanCorrect && model.exportUnder800BooleanCorrect && model.exportUnder790BooleanCorrect && model.exportUnder780BooleanCorrect, "correct"),
    checkLine("export metadata 9I clean", model.exportTitleMentions9I && model.exportMainIdIs9I && model.exportCoverBadgeCorrect && model.metadataFalsePositiveCountAfter9I === 0, model.exportCoverBadgeText),
    checkLine("historical data attrs preserved", model.historical9HPreserved && model.historical9GPreserved && model.historical9FPreserved && model.historical9EPreserved && model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved && model.historical8Z8Y8X8WPreserved, "historical attrs"),
    checkLine("no runtime payload preview storage truth action mutation", !model.validationRuntimeActive && model.realPayloadReadCount === 0 && !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0 && !model.realPreviewGenerated && model.previewActivationCount === 0 && !model.storageCreated && !model.memoryCreated && !model.officialTruthPromoted && !model.automaticDecisionCreated && !model.selectionDriven && !model.tacticalInstructionDriven && model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.eventMutationCount === 0, "clean"),
    checkLine("source of truth preserved", model.sourceOfTruthSeparationPreserved && model.matchEconomyBaselinePreserved && model.guardrailsPreserved, "preserved"),
    checkLine("scoring unchanged", !model.scoringConstantsChanged && model.penaltyShotInactive, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.matchBonusEventChanged, bool(!model.matchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("warning registry has no blocking violations", model.guard.violations.length === 0, model.guard.violations.join(", ") || "none"),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
    checkLine("required validation command visible", REQUIRED_VALIDATION_COMMAND.includes("npm run test:all"), REQUIRED_VALIDATION_COMMAND),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : model.status === "FAIL" ? "FAIL" : "PARTIAL";

  return [
    "# Validation Coach Report Manual Review Preview Payload Dry-Run Export Budget Cushion Before Progressive Disclosure 9I",
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
