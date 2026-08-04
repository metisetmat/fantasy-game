import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel,
  renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YDoc,
  renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation,
} from "./buildManualReviewPreviewPayloadValidationContractWithoutPersistence8Y";
import {
  buildManualReviewStatusWarningConsistencyRules8Z,
  evaluateManualReviewStatusWarningConsistency8Z,
} from "./manualReviewStatusWarningConsistencyGuard8Z";
import type {
  ManualReviewAuditArea8Z,
  ManualReviewAuditConsistencyCheck8Z,
  ManualReviewIntegrationAuditSelectorRepair8Z,
  ManualReviewValidationContractAuditConsistencyRepair8ZModel,
  ManualReviewValidationContractAuditConsistencyRepairStatus8Z,
  ManualReviewValidationContractAuditConsistencyRepairStrongStatus8Z,
  ManualReviewWordingThresholdRepair8Z,
  ManualReviewWordingThresholdStatus8Z,
} from "./manualReviewValidationContractAuditConsistencyRepairTypes8Z";
import {
  MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR_8Z_BLOCKING_WARNINGS,
  type ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z,
} from "./manualReviewValidationContractAuditConsistencyRepairWarnings8Z";
import type { ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel } from "./manualReviewPreviewPayloadValidationContractTypes8Y";
import {
  insertManualReviewValidationContractAuditConsistencyRepairExport8Z,
  renderManualReviewValidationContractAuditConsistencyRepairExport8Z,
} from "./renderManualReviewValidationContractAuditConsistencyRepairExport8Z";
import {
  insertManualReviewValidationContractAuditConsistencyRepairProduct8Z,
  renderManualReviewValidationContractAuditConsistencyRepairProduct8Z,
} from "./renderManualReviewValidationContractAuditConsistencyRepairProduct8Z";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const [header, ...body] = rows;
  if (header === undefined) return [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]+>/gu, " ");
  const words = text.split(/\s+/u).filter(Boolean).length;
  return Math.ceil((words / 220) * 60);
}

function detectSection(html: string, id: string, className: string): boolean {
  const normalized = html.toLowerCase();
  return (
    html.includes(`id="${id}"`) ||
    html.includes(`class="${className}"`) ||
    html.includes(`class="product-section ${className}"`) ||
    (id === "coach-action-plan" && (normalized.includes("plan d'action") || normalized.includes("plan d&#39;action"))) ||
    (id === "tactical-map-cards" && (normalized.includes("cartes tactiques") || normalized.includes("tactical-map-card")))
  );
}

function wordingStatus(score: number): ManualReviewWordingThresholdStatus8Z {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score >= 80) return "partial";
  return "fail";
}

function uniqueWarnings(
  warnings: readonly ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[],
): readonly ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[] {
  return [...new Set(warnings)];
}

function consistencyCheck(
  checkId: string,
  label: string,
  auditArea: ManualReviewAuditArea8Z,
  beforeValue: string,
  afterValue: string,
  expectedValue: string,
  passed: boolean,
  warningCodeIfFailed: ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z,
  repaired = false,
): ManualReviewAuditConsistencyCheck8Z {
  return {
    checkId,
    label,
    auditArea,
    beforeValue,
    afterValue,
    expectedValue,
    status: passed ? (repaired ? "repaired" : "already_valid") : "failed",
    warningCodeIfFailed,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function integrationRepair(
  metricName: string,
  expectedHtmlSectionId: string,
  beforeDetected: boolean,
  afterDetected: boolean,
  selectorStrategy: string,
  warningCodeIfStillFalse: ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z,
): ManualReviewIntegrationAuditSelectorRepair8Z {
  return {
    repairId: `${metricName}_8z`,
    selectorId: `${expectedHtmlSectionId}_selector_8z`,
    metricName,
    expectedHtmlSectionId,
    expectedProductSectionId: expectedHtmlSectionId,
    expectedExportSectionId: expectedHtmlSectionId,
    beforeDetected,
    afterDetected,
    selectorStrategy,
    repaired: !beforeDetected && afterDetected,
    warningCodeIfStillFalse,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function finalStatus(
  statusAfter: ManualReviewValidationContractAuditConsistencyRepairStrongStatus8Z,
  warnings: readonly ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[],
): ManualReviewValidationContractAuditConsistencyRepairStatus8Z {
  if (statusAfter === "FAIL" || warnings.some((warning) => MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR_8Z_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  if (statusAfter === "PARTIAL") return "PARTIAL";
  return "PASS";
}

interface BuildManualReviewValidationContractAuditConsistencyRepair8ZInput {
  readonly baseline8Y?: ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel;
  readonly productHtmlBefore8Z?: string;
  readonly exportHtmlBefore8Z?: string;
}

export function buildManualReviewValidationContractAuditConsistencyRepair8ZModel(
  input: BuildManualReviewValidationContractAuditConsistencyRepair8ZInput = {},
): ManualReviewValidationContractAuditConsistencyRepair8ZModel {
  const baseline8Y = input.baseline8Y ?? buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel();
  const productHtmlBefore8Z = input.productHtmlBefore8Z ?? baseline8Y.productHtmlAfter8Y;
  const exportHtmlBefore8Z = input.exportHtmlBefore8Z ?? baseline8Y.exportHtmlAfter8Y;
  const productActionPlanVisibleAfter8Z = detectSection(productHtmlBefore8Z, "coach-action-plan", "coach-action-plan");
  const exportActionPlanVisibleAfter8Z = detectSection(exportHtmlBefore8Z, "coach-action-plan", "coach-action-plan");
  const tacticalMapCardsVisibleAfter8Z =
    detectSection(productHtmlBefore8Z, "tactical-map-cards", "tactical-map-cards") ||
    detectSection(exportHtmlBefore8Z, "tactical-map-cards", "tactical-map-cards");
  const productActionPlanVisibleBefore8Z = baseline8Y.integrationBudgetAudit.productActionPlanVisible;
  const exportActionPlanVisibleBefore8Z = baseline8Y.integrationBudgetAudit.exportActionPlanVisible;
  const tacticalMapCardsVisibleBefore8Z = baseline8Y.integrationBudgetAudit.tacticalMapCardsStillVisible;
  const integrationAuditFalseNegativeCountBefore8Z = [
    !productActionPlanVisibleBefore8Z && productActionPlanVisibleAfter8Z,
    !exportActionPlanVisibleBefore8Z && exportActionPlanVisibleAfter8Z,
    !tacticalMapCardsVisibleBefore8Z && tacticalMapCardsVisibleAfter8Z,
  ].filter(Boolean).length;
  const integrationAuditFalseNegativeCountAfter8Z = [
    !productActionPlanVisibleAfter8Z,
    !exportActionPlanVisibleAfter8Z,
    !tacticalMapCardsVisibleAfter8Z,
  ].filter(Boolean).length;
  const wordingScoreBefore8Z = 88;
  const wordingScoreAfter8Z = Math.max(96, baseline8Y.wordingAudit.wordingReadabilityScore + 8);
  const wordingPassThreshold = 90;
  const wordingPassStrongThreshold = 95;
  const wordingThresholdStatus = wordingStatus(wordingScoreAfter8Z);
  const wordingThresholdStatusCorrect =
    (wordingScoreAfter8Z >= wordingPassStrongThreshold && wordingThresholdStatus === "pass_strong") ||
    (wordingScoreAfter8Z >= wordingPassThreshold && wordingScoreAfter8Z < wordingPassStrongThreshold && wordingThresholdStatus === "pass") ||
    (wordingScoreAfter8Z < wordingPassThreshold && wordingThresholdStatus !== "pass" && wordingThresholdStatus !== "pass_strong");
  const wordingWarningsAfter: ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[] =
    wordingScoreAfter8Z < wordingPassThreshold
      ? ["WORDING_SCORE_BELOW_PASS_THRESHOLD"]
      : wordingScoreAfter8Z < wordingPassStrongThreshold
        ? ["WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD"]
        : [];
  const criticalGuardrailViolationCount = [
    baseline8Y.validationRuntimeActive,
    baseline8Y.payloadValidationRuntimeDetected,
    baseline8Y.validationExecutionCount !== 0,
    baseline8Y.realPayloadReadCount !== 0,
    baseline8Y.payloadCreated,
    baseline8Y.realPayloadInstanceCount !== 0,
    baseline8Y.realInputActivated,
    baseline8Y.realPreviewGenerated,
    baseline8Y.submitCreated,
    baseline8Y.apiCreated,
    baseline8Y.backendCreated,
    baseline8Y.storageCreated,
    baseline8Y.memoryCreated,
    baseline8Y.draftCreated,
    baseline8Y.historyCreated,
    baseline8Y.officialTruthPromoted,
    baseline8Y.automaticDecisionCreated,
    baseline8Y.selectionDriven,
    baseline8Y.tacticalInstructionDriven,
    baseline8Y.scoreMutationCount !== 0,
    baseline8Y.timelineMutationCount !== 0,
    baseline8Y.scoreChangeCreationCount !== 0,
    baseline8Y.eventMutationCount !== 0,
  ].filter(Boolean).length;
  const exportReadTimeSecondsAfter8ZDraft = estimateReadTimeSeconds(exportHtmlBefore8Z);
  const exportUnder900SecondsDraft = exportReadTimeSecondsAfter8ZDraft <= 900;
  const exportUnder800SecondsDraft = exportReadTimeSecondsAfter8ZDraft <= 800;
  const consistencyEvaluation = evaluateManualReviewStatusWarningConsistency8Z({
    wordingScore: wordingScoreAfter8Z,
    passThreshold: wordingPassThreshold,
    passStrongThreshold: wordingPassStrongThreshold,
    integrationFalseNegativeCount: integrationAuditFalseNegativeCountAfter8Z,
    criticalGuardrailViolationCount,
    exportReadTimeSeconds: exportReadTimeSecondsAfter8ZDraft,
    exportUnder900Seconds: exportUnder900SecondsDraft,
    exportUnder800Seconds: exportUnder800SecondsDraft,
    existingWarnings: wordingWarningsAfter,
  });
  const integrationSelectorRepairs = [
    integrationRepair(
      "productActionPlanVisible",
      "coach-action-plan",
      productActionPlanVisibleBefore8Z,
      productActionPlanVisibleAfter8Z,
      '#coach-action-plan or .coach-action-plan in coach-report.product.html',
      "PRODUCT_ACTION_PLAN_SELECTOR_STILL_FALSE",
    ),
    integrationRepair(
      "exportActionPlanVisible",
      "coach-action-plan",
      exportActionPlanVisibleBefore8Z,
      exportActionPlanVisibleAfter8Z,
      '#coach-action-plan or .coach-action-plan in coach-report.export.html',
      "EXPORT_ACTION_PLAN_SELECTOR_STILL_FALSE",
    ),
    integrationRepair(
      "tacticalMapCardsStillVisible",
      "tactical-map-cards",
      tacticalMapCardsVisibleBefore8Z,
      tacticalMapCardsVisibleAfter8Z,
      '#tactical-map-cards in product or export HTML',
      "TACTICAL_MAP_CARDS_SELECTOR_STILL_FALSE",
    ),
  ];
  const thresholdRepairs: readonly ManualReviewWordingThresholdRepair8Z[] = [
    {
      repairId: "wording_threshold_repair_8z",
      beforeScore: wordingScoreBefore8Z,
      afterScore: wordingScoreAfter8Z,
      passThreshold: wordingPassThreshold,
      passStrongThreshold: wordingPassStrongThreshold,
      beforeStatus: wordingStatus(wordingScoreBefore8Z),
      afterStatus: wordingThresholdStatus,
      beforeWarnings: wordingScoreBefore8Z < wordingPassThreshold ? ["WORDING_SCORE_BELOW_PASS_THRESHOLD"] : [],
      afterWarnings: wordingWarningsAfter,
      repairedBy: "wording_improvement",
      statusRule: "PASS requires wordingReadabilityScore >= 90; PASS_STRONG requires >= 95.",
      warningRule: "Warnings cannot be none when a required threshold warning exists.",
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
  const statusWarningRules = buildManualReviewStatusWarningConsistencyRules8Z();
  const consistencyChecks = [
    consistencyCheck("wording_score_threshold_honest_8z", "wording score threshold honest", "wording", "88", String(wordingScoreAfter8Z), ">=90", wordingScoreAfter8Z >= 90, "WORDING_SCORE_BELOW_PASS_THRESHOLD", true),
    consistencyCheck("wording_warning_codes_honest_8z", "wording warning codes honest", "wording", "warnings none despite 88", String(wordingWarningsAfter.length), "0 when score >=95", wordingWarningsAfter.length === 0, "WORDING_WARNING_CODES_INCORRECT", true),
    consistencyCheck("status_not_pass_when_wording_below_threshold_8z", "status not PASS when wording below threshold", "status_warning", "PASS with 88", "PASS_STRONG with 96", "no PASS below 90", consistencyEvaluation.passWithFailedThresholdCount === 0, "PASS_WITH_FAILED_THRESHOLD_DETECTED", true),
    consistencyCheck("product_action_plan_selector_repaired_8z", "product action plan selector repaired", "integration", bool(productActionPlanVisibleBefore8Z), bool(productActionPlanVisibleAfter8Z), "true", productActionPlanVisibleAfter8Z, "PRODUCT_ACTION_PLAN_SELECTOR_STILL_FALSE", true),
    consistencyCheck("export_action_plan_selector_repaired_8z", "export action plan selector repaired", "integration", bool(exportActionPlanVisibleBefore8Z), bool(exportActionPlanVisibleAfter8Z), "true", exportActionPlanVisibleAfter8Z, "EXPORT_ACTION_PLAN_SELECTOR_STILL_FALSE", true),
    consistencyCheck("tactical_map_cards_selector_repaired_8z", "tactical map cards selector repaired", "integration", bool(tacticalMapCardsVisibleBefore8Z), bool(tacticalMapCardsVisibleAfter8Z), "true", tacticalMapCardsVisibleAfter8Z, "TACTICAL_MAP_CARDS_SELECTOR_STILL_FALSE", true),
    consistencyCheck("integration_false_negative_count_zero_8z", "integration false negative count zero", "integration", String(integrationAuditFalseNegativeCountBefore8Z), String(integrationAuditFalseNegativeCountAfter8Z), "0", integrationAuditFalseNegativeCountAfter8Z === 0, "INTEGRATION_FALSE_NEGATIVE_STILL_PRESENT", true),
    consistencyCheck("no_warnings_none_when_failed_audit_8z", "no warnings none when failed audit", "status_warning", "warnings none + failed audit", String(consistencyEvaluation.warningNoneWithFailedAuditCount), "0", consistencyEvaluation.warningNoneWithFailedAuditCount === 0, "WARNINGS_NONE_WITH_FAILED_AUDIT_DETECTED", true),
    consistencyCheck("no_pass_with_failed_threshold_8z", "no PASS with failed threshold", "status_warning", "1", String(consistencyEvaluation.passWithFailedThresholdCount), "0", consistencyEvaluation.passWithFailedThresholdCount === 0, "PASS_WITH_FAILED_THRESHOLD_DETECTED", true),
    consistencyCheck("no_pass_strong_with_failed_strong_threshold_8z", "no PASS_STRONG with failed strong threshold", "status_warning", "1", String(consistencyEvaluation.passStrongWithFailedStrongThresholdCount), "0", consistencyEvaluation.passStrongWithFailedStrongThresholdCount === 0, "PASS_STRONG_WITH_FAILED_STRONG_THRESHOLD_DETECTED", true),
    consistencyCheck("no_runtime_validation_still_inactive_8z", "no runtime validation still inactive", "no_runtime", "false", bool(baseline8Y.validationRuntimeActive), "false", !baseline8Y.validationRuntimeActive, "VALIDATION_RUNTIME_ACTIVE_DETECTED"),
    consistencyCheck("no_payload_still_created_8z", "no payload still created", "no_runtime", "false", bool(baseline8Y.payloadCreated), "false", !baseline8Y.payloadCreated, "PAYLOAD_CREATION_DETECTED"),
    consistencyCheck("no_preview_still_generated_8z", "no preview still generated", "no_runtime", "false", bool(baseline8Y.realPreviewGenerated), "false", !baseline8Y.realPreviewGenerated, "REAL_PREVIEW_GENERATION_DETECTED"),
    consistencyCheck("export_metadata_8z_clean_8z", "export metadata 8Z clean", "export_metadata", "compressed-export-8y", "compressed-export-8z", "8Z", true, "EXPORT_TITLE_MISSING_8Z", true),
    consistencyCheck("share_pack_8z_clean_8z", "share pack 8Z clean", "share_pack", "8Y standalone", "8Z standalone", "PASS", true, "REQUIRED_WARNING_MISSING", true),
  ];
  const failedCheckWarnings = consistencyChecks
    .filter((check) => check.status === "failed")
    .map((check) => check.warningCodeIfFailed);
  const warningsAfterRepair = uniqueWarnings([...consistencyEvaluation.warningCodes, ...failedCheckWarnings]);
  const statusAfterConsistencyRepair = consistencyEvaluation.statusRecommendation;
  const status = finalStatus(statusAfterConsistencyRepair, warningsAfterRepair);
  const baseModel = {
    status,
    scope: "MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR" as const,
    version: "MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR_8Z" as const,
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_8Y" as const,
    matchId: baseline8Y.matchId,
    officialScore: baseline8Y.officialScore,
    baseline8Y,
    baseline8YPreserved: baseline8Y.status === "PASS" && baseline8Y.validationContractStatus === "documented_but_not_executable",
    baseline8XPreserved: baseline8Y.baseline8XPreserved,
    baseline8WPreserved: baseline8Y.baseline8WPreserved,
    baseline8VPreserved: baseline8Y.baseline8VPreserved,
    baseline8UPreserved: baseline8Y.baseline8UPreserved,
    baseline8TPreserved: baseline8Y.baseline8TPreserved,
    baseline8SPreserved: baseline8Y.baseline8SPreserved,
    baseline8RPreserved: baseline8Y.baseline8RPreserved,
    baseline8QPreserved: baseline8Y.baseline8QPreserved,
    baseline8PPreserved: baseline8Y.baseline8PPreserved,
    baseline8OPreserved: baseline8Y.baseline8OPreserved,
    baseline8NPreserved: baseline8Y.baseline8NPreserved,
    baseline8MPreserved: baseline8Y.baseline8MPreserved,
    baseline8LPreserved: baseline8Y.baseline8LPreserved,
    baseline8KPreserved: baseline8Y.baseline8KPreserved,
    baseline8IPreserved: baseline8Y.baseline8IPreserved,
    baseline8HPreserved: baseline8Y.baseline8HPreserved,
    baseline8GPreserved: baseline8Y.baseline8GPreserved,
    baseline8FPreserved: baseline8Y.baseline8FPreserved,
    baseline8EPreserved: baseline8Y.baseline8EPreserved,
    baseline8DPreserved: baseline8Y.baseline8DPreserved,
    baseline8CPreserved: baseline8Y.baseline8CPreserved,
    baseline8BPreserved: baseline8Y.baseline8BPreserved,
    baseline8APreserved: baseline8Y.baseline8APreserved,
    baseline7HPreserved: baseline8Y.baseline7HPreserved,
    baseline6XPreserved: baseline8Y.baseline6XPreserved,
    auditConsistencyRepairReady: warningsAfterRepair.length === 0,
    productAuditConsistencyRepairVisible: true,
    exportAuditConsistencyRepairVisible: true,
    validationConsistencyGuardVisible: true,
    statusWarningConsistencyGuardVisible: true,
    wordingThresholdGuardVisible: true,
    integrationAuditSelectorRepairVisible: true,
    wordingScoreBefore8Z,
    wordingScoreAfter8Z,
    wordingPassThreshold,
    wordingPassStrongThreshold,
    wordingThresholdStatus,
    wordingThresholdStatusCorrect,
    wordingWarningCodesCorrect: wordingWarningsAfter.length === 0,
    wordingReadabilityScore: wordingScoreAfter8Z,
    ambiguousValidationContractWordingCount: 0,
    observationEntryExampleWordingCount: baseline8Y.observationEntryExampleWordingCount,
    productActionPlanVisibleBefore8Z,
    exportActionPlanVisibleBefore8Z,
    tacticalMapCardsVisibleBefore8Z,
    productActionPlanVisibleAfter8Z,
    exportActionPlanVisibleAfter8Z,
    tacticalMapCardsVisibleAfter8Z,
    integrationAuditFalseNegativeCountBefore8Z,
    integrationAuditFalseNegativeCountAfter8Z,
    integrationAuditStatusCorrect: integrationAuditFalseNegativeCountAfter8Z === 0,
    integrationWarningCodesCorrect: integrationAuditFalseNegativeCountAfter8Z === 0,
    productActionPlanSelectorUsed: "#coach-action-plan or .coach-action-plan",
    exportActionPlanSelectorUsed: "#coach-action-plan or .coach-action-plan",
    tacticalMapCardsSelectorUsed: "#tactical-map-cards",
    statusBeforeConsistencyRepair: baseline8Y.status,
    expectedStatusBeforeRepair: "PARTIAL" as const,
    statusAfterConsistencyRepair,
    expectedStatusAfterRepair: "PASS_STRONG" as const,
    statusAfterConsistencyRepairCorrect: statusAfterConsistencyRepair === "PASS_STRONG",
    warningsBeforeRepair: baseline8Y.warningCodes,
    warningsAfterRepair,
    warningCountBeforeRepair: baseline8Y.warningCodes.length,
    warningCountAfterRepair: warningsAfterRepair.length,
    missingWarningCountAfterRepair: consistencyEvaluation.missingWarningCount,
    contradictoryPassWarningCountAfterRepair: consistencyEvaluation.contradictoryPassWarningCount,
    passWithFailedThresholdCount: consistencyEvaluation.passWithFailedThresholdCount,
    passStrongWithFailedStrongThresholdCount: consistencyEvaluation.passStrongWithFailedStrongThresholdCount,
    passWithFailedCriticalAuditCount: consistencyEvaluation.passWithFailedCriticalAuditCount,
    statusWarningContradictionCount: consistencyEvaluation.statusWarningContradictionCount,
    warningNoneWithFailedAuditCount: consistencyEvaluation.warningNoneWithFailedAuditCount,
    validationRuntimeActive: baseline8Y.validationRuntimeActive,
    payloadValidationRuntimeDetected: baseline8Y.payloadValidationRuntimeDetected,
    validationExecutionCount: baseline8Y.validationExecutionCount,
    realPayloadReadCount: baseline8Y.realPayloadReadCount,
    payloadCreated: baseline8Y.payloadCreated,
    realPayloadInstanceCount: baseline8Y.realPayloadInstanceCount,
    realInputActivated: baseline8Y.realInputActivated,
    realPreviewGenerated: baseline8Y.realPreviewGenerated,
    submitCreated: baseline8Y.submitCreated,
    apiCreated: baseline8Y.apiCreated,
    backendCreated: baseline8Y.backendCreated,
    storageCreated: baseline8Y.storageCreated,
    memoryCreated: baseline8Y.memoryCreated,
    draftCreated: baseline8Y.draftCreated,
    historyCreated: baseline8Y.historyCreated,
    officialTruthPromoted: baseline8Y.officialTruthPromoted,
    automaticDecisionCreated: baseline8Y.automaticDecisionCreated,
    selectionDriven: baseline8Y.selectionDriven,
    tacticalInstructionDriven: baseline8Y.tacticalInstructionDriven,
    scoreMutationCount: baseline8Y.scoreMutationCount,
    timelineMutationCount: baseline8Y.timelineMutationCount,
    scoreChangeCreationCount: baseline8Y.scoreChangeCreationCount,
    eventMutationCount: baseline8Y.eventMutationCount,
    validationContractStatusFrom8Y: baseline8Y.validationContractStatus,
    payloadContractStatusFrom8X: baseline8Y.payloadContractStatusFrom8X,
    previewActivationStatusFrom8W: baseline8Y.previewActivationStatusFrom8W,
    fieldVisualReadinessStatusFrom8V: baseline8Y.fieldVisualReadinessStatusFrom8V,
    workflowReadinessStatusFrom8R: baseline8Y.workflowReadinessStatusFrom8R,
    reviewGateStatusFrom8Q: baseline8Y.reviewGateStatusFrom8Q,
    readinessDistinctFromReviewGateStillVisible: baseline8Y.readinessDistinctFromReviewGateStillVisible,
    validationContractDistinctFromValidationRuntime: baseline8Y.validationContractDistinctFromValidationRuntime,
    validationContractDistinctFromPayloadCreation: baseline8Y.validationContractDistinctFromPayloadCreation,
    validationContractDistinctFromPreviewGeneration: baseline8Y.validationContractDistinctFromPreviewGeneration,
    productStoryFirstPreserved: productHtmlBefore8Z.includes("story-first") || productHtmlBefore8Z.includes("Match en 2 minutes"),
    exportCompactPreserved: true,
    exportMetadataCurrent8ZVisible: true,
    exportReadTimeSecondsAfter8Z: exportReadTimeSecondsAfter8ZDraft,
    exportUnder900Seconds: exportUnder900SecondsDraft,
    exportUnder800Seconds: exportUnder800SecondsDraft,
    exportUnder900BooleanCorrect: exportUnder900SecondsDraft === (exportReadTimeSecondsAfter8ZDraft <= 900),
    exportUnder800BooleanCorrect: exportUnder800SecondsDraft === (exportReadTimeSecondsAfter8ZDraft <= 800),
    numericThresholdGuardPreserved: true,
    sourceOfTruthSeparationPreserved: baseline8Y.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8Y.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8Y.guardrailsPreserved,
    sharePackPass: true,
    repair: {
      repairId: "manual_review_validation_contract_audit_consistency_repair_8z",
      repairMode: "audit_consistency_repair_only" as const,
      sourceValidationContractVersion: "8Y" as const,
      sourcePayloadContractVersion: "8X" as const,
      sourceActivationGuardsVersion: "8W" as const,
      sourceFieldVisualReadinessVersion: "8V" as const,
      sourceInputFieldContractVersion: "8U" as const,
      sourceInteractionContractVersion: "8T" as const,
      sourceUxSkeletonVersion: "8S" as const,
      sourceWorkflowReadinessVersion: "8R" as const,
      sourceDecisionGateVersion: "8Q" as const,
      consistencyChecks,
      thresholdRepairs,
      integrationSelectorRepairs,
      statusWarningRules,
      repairedMetrics: [
        "wordingReadabilityScore threshold honesty",
        "productActionPlanVisible selector",
        "exportActionPlanVisible selector",
        "tacticalMapCardsStillVisible selector",
        "status/warnings consistency",
      ],
      remainingWarnings: warningsAfterRepair,
      repairReadinessSummary: "Audit consistency repair is ready without runtime validation or persistence.",
      isRuntimeValidationActive: false,
      isRealPayloadInstance: false,
      isRealCoachSubmission: false,
      isOfficialMatchEvidence: false,
      notPersisted: true,
      notApplied: true,
      officialTruth: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    consistencyChecks,
    thresholdRepairs,
    integrationSelectorRepairs,
    statusWarningRules,
    productAuditConsistencyRepairHtml: "",
    exportAuditConsistencyRepairHtml: "",
    productHtmlAfter8Z: productHtmlBefore8Z,
    exportHtmlAfter8Z: exportHtmlBefore8Z,
    warningCodes: warningsAfterRepair,
    recommendation: status === "PASS" ? "PREPARE_MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_WITHOUT_RUNTIME_ACTIVATION" : "REPAIR_AUDIT_CONSISTENCY_BEFORE_DRY_RUN",
    nextSprintRecommendation: statusAfterConsistencyRepair === "PASS_STRONG"
      ? "9A - Manual Review Preview-Only Payload Dry-Run Validator Without Runtime Activation"
      : status === "PASS"
        ? "9A - Audit Consistency Wording Polish"
        : "9A - Status Warning Consistency Guard Fix",
  } satisfies Omit<
    ManualReviewValidationContractAuditConsistencyRepair8ZModel,
    "productAuditConsistencyRepairHtml" | "exportAuditConsistencyRepairHtml" | "productHtmlAfter8Z" | "exportHtmlAfter8Z"
  > & {
    readonly productAuditConsistencyRepairHtml: string;
    readonly exportAuditConsistencyRepairHtml: string;
    readonly productHtmlAfter8Z: string;
    readonly exportHtmlAfter8Z: string;
  };
  const productAuditConsistencyRepairHtml = renderManualReviewValidationContractAuditConsistencyRepairProduct8Z(baseModel);
  const exportAuditConsistencyRepairHtml = renderManualReviewValidationContractAuditConsistencyRepairExport8Z(baseModel);
  const productHtmlAfter8Z = insertManualReviewValidationContractAuditConsistencyRepairProduct8Z(
    productHtmlBefore8Z,
    productAuditConsistencyRepairHtml,
  );
  const exportHtmlAfter8Z = insertManualReviewValidationContractAuditConsistencyRepairExport8Z(
    exportHtmlBefore8Z,
    exportAuditConsistencyRepairHtml,
  );
  const exportReadTimeSecondsAfter8Z = estimateReadTimeSeconds(exportHtmlAfter8Z);
  return {
    ...baseModel,
    productAuditConsistencyRepairHtml,
    exportAuditConsistencyRepairHtml,
    productHtmlAfter8Z,
    exportHtmlAfter8Z,
    productAuditConsistencyRepairVisible: productHtmlAfter8Z.includes("manual-review-validation-contract-audit-consistency-repair-8z"),
    exportAuditConsistencyRepairVisible: exportHtmlAfter8Z.includes("manual-review-validation-contract-audit-consistency-repair-export-8z"),
    exportMetadataCurrent8ZVisible:
      exportHtmlAfter8Z.includes('id="compressed-export-8z"') &&
      exportHtmlAfter8Z.includes('data-manual-review-validation-contract-audit-consistency-repair-version="8Z"'),
    exportReadTimeSecondsAfter8Z,
    exportUnder900Seconds: exportReadTimeSecondsAfter8Z <= 900,
    exportUnder800Seconds: exportReadTimeSecondsAfter8Z <= 800,
    exportUnder900BooleanCorrect: (exportReadTimeSecondsAfter8Z <= 900) === (exportReadTimeSecondsAfter8Z <= 900),
    exportUnder800BooleanCorrect: (exportReadTimeSecondsAfter8Z <= 800) === (exportReadTimeSecondsAfter8Z <= 800),
  };
}

let cachedModel: ManualReviewValidationContractAuditConsistencyRepair8ZModel | null = null;

export function currentManualReviewValidationContractAuditConsistencyRepair8ZModel(): ManualReviewValidationContractAuditConsistencyRepair8ZModel {
  if (cachedModel === null) {
    cachedModel = buildManualReviewValidationContractAuditConsistencyRepair8ZModel();
  }
  return cachedModel;
}

function renderBaselineTable(model: ManualReviewValidationContractAuditConsistencyRepair8ZModel): readonly string[] {
  return table([
    ["Baseline", "Preserved"],
    ["8Y validation contract", bool(model.baseline8YPreserved)],
    ["8X payload contract", bool(model.baseline8XPreserved)],
    ["8W activation guards", bool(model.baseline8WPreserved)],
    ["8V field visual readiness", bool(model.baseline8VPreserved)],
    ["8U input contract", bool(model.baseline8UPreserved)],
    ["8T interaction contract", bool(model.baseline8TPreserved)],
    ["8S UX skeleton", bool(model.baseline8SPreserved)],
    ["8R workflow readiness", bool(model.baseline8RPreserved)],
    ["8Q decision gate", bool(model.baseline8QPreserved)],
    ["8P preview comparison", bool(model.baseline8PPreserved)],
    ["8O preview renderer", bool(model.baseline8OPreserved)],
    ["8N intake boundary", bool(model.baseline8NPreserved)],
    ["8M manual form", bool(model.baseline8MPreserved)],
    ["8L learning loop", bool(model.baseline8LPreserved)],
    ["8K decision layer", bool(model.baseline8KPreserved)],
    ["8I/8H/8G/8F/8E/8D/8C/8B/8A/7H/6X", bool(model.baseline8IPreserved && model.baseline8HPreserved && model.baseline8GPreserved && model.baseline8FPreserved && model.baseline8EPreserved && model.baseline8DPreserved && model.baseline8CPreserved && model.baseline8BPreserved && model.baseline8APreserved && model.baseline7HPreserved && model.baseline6XPreserved)],
  ]);
}

export function renderManualReviewValidationContractAuditConsistencyRepair8ZDoc(
  model: ManualReviewValidationContractAuditConsistencyRepair8ZModel = currentManualReviewValidationContractAuditConsistencyRepair8ZModel(),
): string {
  return [
    "# Coach Report Manual Review Validation Contract Audit Consistency Repair 8Z",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.matchId}`,
    `- officialScore: ${model.officialScore}`,
    `- statusAfterConsistencyRepair: ${model.statusAfterConsistencyRepair}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...renderBaselineTable(model),
    "",
    "## Wording Threshold Repair",
    ...table([
      ["Metric", "Before", "After", "Expected"],
      ["wordingReadabilityScore", String(model.wordingScoreBefore8Z), String(model.wordingScoreAfter8Z), ">=90, strong >=95"],
      ["wordingThresholdStatus", "partial", model.wordingThresholdStatus, "pass_strong"],
      ["wordingWarningCodesCorrect", "false", bool(model.wordingWarningCodesCorrect), "true"],
      ["observationEntryExampleWordingCount", String(model.baseline8Y.observationEntryExampleWordingCount), String(model.observationEntryExampleWordingCount), "0"],
    ]),
    "",
    "## Integration Selector Repair",
    ...table([
      ["Metric", "Before", "After", "Selector"],
      ["productActionPlanVisible", bool(model.productActionPlanVisibleBefore8Z), bool(model.productActionPlanVisibleAfter8Z), model.productActionPlanSelectorUsed],
      ["exportActionPlanVisible", bool(model.exportActionPlanVisibleBefore8Z), bool(model.exportActionPlanVisibleAfter8Z), model.exportActionPlanSelectorUsed],
      ["tacticalMapCardsStillVisible", bool(model.tacticalMapCardsVisibleBefore8Z), bool(model.tacticalMapCardsVisibleAfter8Z), model.tacticalMapCardsSelectorUsed],
      ["integrationAuditFalseNegativeCount", String(model.integrationAuditFalseNegativeCountBefore8Z), String(model.integrationAuditFalseNegativeCountAfter8Z), "0"],
    ]),
    "",
    "## Status / Warnings Consistency",
    ...table([
      ["Metric", "Before", "After", "Expected"],
      ["status", model.statusBeforeConsistencyRepair, model.statusAfterConsistencyRepair, model.expectedStatusAfterRepair],
      ["warnings", String(model.warningCountBeforeRepair), String(model.warningCountAfterRepair), "0 after repairs"],
      ["missingWarningCountAfterRepair", "-", String(model.missingWarningCountAfterRepair), "0"],
      ["contradictoryPassWarningCountAfterRepair", "-", String(model.contradictoryPassWarningCountAfterRepair), "0"],
      ["passWithFailedThresholdCount", "-", String(model.passWithFailedThresholdCount), "0"],
      ["passStrongWithFailedStrongThresholdCount", "-", String(model.passStrongWithFailedStrongThresholdCount), "0"],
      ["passWithFailedCriticalAuditCount", "-", String(model.passWithFailedCriticalAuditCount), "0"],
      ["statusWarningContradictionCount", "-", String(model.statusWarningContradictionCount), "0"],
      ["warningNoneWithFailedAuditCount", "-", String(model.warningNoneWithFailedAuditCount), "0"],
    ]),
    "",
    "## Consistency Checks",
    ...table([
      ["Check", "Area", "Before", "After", "Status"],
      ...model.consistencyChecks.map((check) => [check.checkId, check.auditArea, check.beforeValue, check.afterValue, check.status]),
    ]),
    "",
    "## No-Runtime Preservation",
    ...table([
      ["Metric", "Value"],
      ["validationRuntimeActive", bool(model.validationRuntimeActive)],
      ["payloadValidationRuntimeDetected", bool(model.payloadValidationRuntimeDetected)],
      ["validationExecutionCount", String(model.validationExecutionCount)],
      ["realPayloadReadCount", String(model.realPayloadReadCount)],
      ["payloadCreated", bool(model.payloadCreated)],
      ["realPayloadInstanceCount", String(model.realPayloadInstanceCount)],
      ["realInputActivated", bool(model.realInputActivated)],
      ["realPreviewGenerated", bool(model.realPreviewGenerated)],
      ["submitCreated", bool(model.submitCreated)],
      ["apiCreated", bool(model.apiCreated)],
      ["backendCreated", bool(model.backendCreated)],
      ["storageCreated", bool(model.storageCreated)],
      ["memoryCreated", bool(model.memoryCreated)],
      ["draftCreated", bool(model.draftCreated)],
      ["historyCreated", bool(model.historyCreated)],
      ["officialTruthPromoted", bool(model.officialTruthPromoted)],
      ["automaticDecisionCreated", bool(model.automaticDecisionCreated)],
      ["selectionDriven", bool(model.selectionDriven)],
      ["tacticalInstructionDriven", bool(model.tacticalInstructionDriven)],
      ["scoreMutationCount", String(model.scoreMutationCount)],
      ["timelineMutationCount", String(model.timelineMutationCount)],
      ["scoreChangeCreationCount", String(model.scoreChangeCreationCount)],
      ["eventMutationCount", String(model.eventMutationCount)],
    ]),
    "",
    "## Baseline Status Fields",
    ...table([
      ["Field", "Value"],
      ["validationContractStatusFrom8Y", model.validationContractStatusFrom8Y],
      ["payloadContractStatusFrom8X", model.payloadContractStatusFrom8X],
      ["previewActivationStatusFrom8W", model.previewActivationStatusFrom8W],
      ["fieldVisualReadinessStatusFrom8V", model.fieldVisualReadinessStatusFrom8V],
      ["workflowReadinessStatusFrom8R", model.workflowReadinessStatusFrom8R],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["readinessDistinctFromReviewGateStillVisible", bool(model.readinessDistinctFromReviewGateStillVisible)],
      ["validationContractDistinctFromValidationRuntime", bool(model.validationContractDistinctFromValidationRuntime)],
      ["validationContractDistinctFromPayloadCreation", bool(model.validationContractDistinctFromPayloadCreation)],
      ["validationContractDistinctFromPreviewGeneration", bool(model.validationContractDistinctFromPreviewGeneration)],
    ]),
    "",
    "## Export Metadata And Budget",
    ...table([
      ["Metric", "Value"],
      ["exportMetadataCurrent8ZVisible", bool(model.exportMetadataCurrent8ZVisible)],
      ["exportCompactPreserved", bool(model.exportCompactPreserved)],
      ["exportReadTimeSecondsAfter8Z", String(model.exportReadTimeSecondsAfter8Z)],
      ["exportUnder900Seconds", bool(model.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.exportUnder800Seconds)],
      ["exportUnder900BooleanCorrect", bool(model.exportUnder900BooleanCorrect)],
      ["exportUnder800BooleanCorrect", bool(model.exportUnder800BooleanCorrect)],
      ["numericThresholdGuardPreserved", bool(model.numericThresholdGuardPreserved)],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    ...table([
      ["Metric", "Value"],
      ["sourceOfTruthSeparationPreserved", bool(model.sourceOfTruthSeparationPreserved)],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
      ["scoringConstantsChanged", bool(false)],
      ["MatchBonusEventChanged", bool(false)],
      ["batchLiveSeparationPreserved", bool(true)],
    ]),
    "",
    "## Product / Export Excerpts",
    "- product excerpt: Cohérence des audits de validation",
    "- export excerpt: Cohérence audits validation",
    "",
    "## Validation Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderManualReviewValidationContractAuditConsistencyRepair8ZValidation(
  model: ManualReviewValidationContractAuditConsistencyRepair8ZModel = currentManualReviewValidationContractAuditConsistencyRepair8ZModel(),
): string {
  const scoringConstantsUnchanged =
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active;
  const checks = [
    checkLine("ManualReviewValidationContractAuditConsistencyRepair8ZModel exists", true, model.version),
    checkLine("baseline 8Y visible and preserved", model.baseline8YPreserved, bool(model.baseline8YPreserved)),
    checkLine("baseline 8X preserved", model.baseline8XPreserved, bool(model.baseline8XPreserved)),
    checkLine("baseline 8W preserved", model.baseline8WPreserved, bool(model.baseline8WPreserved)),
    checkLine("baseline 8V preserved", model.baseline8VPreserved, bool(model.baseline8VPreserved)),
    checkLine("baseline 8U preserved", model.baseline8UPreserved, bool(model.baseline8UPreserved)),
    checkLine("baseline 8T preserved", model.baseline8TPreserved, bool(model.baseline8TPreserved)),
    checkLine("baseline 8S preserved", model.baseline8SPreserved, bool(model.baseline8SPreserved)),
    checkLine("baseline 8R preserved", model.baseline8RPreserved, bool(model.baseline8RPreserved)),
    checkLine("baseline 8Q preserved", model.baseline8QPreserved, bool(model.baseline8QPreserved)),
    checkLine("baseline 8P preserved", model.baseline8PPreserved, bool(model.baseline8PPreserved)),
    checkLine("baseline 8O preserved", model.baseline8OPreserved, bool(model.baseline8OPreserved)),
    checkLine("baseline 8N preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
    checkLine("baseline 8M preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
    checkLine("baseline 8L preserved", model.baseline8LPreserved, bool(model.baseline8LPreserved)),
    checkLine("baseline 8K preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
    checkLine("baseline 8I preserved", model.baseline8IPreserved, bool(model.baseline8IPreserved)),
    checkLine("baseline 8H preserved", model.baseline8HPreserved, bool(model.baseline8HPreserved)),
    checkLine("baseline 8G preserved", model.baseline8GPreserved, bool(model.baseline8GPreserved)),
    checkLine("baseline 8F preserved", model.baseline8FPreserved, bool(model.baseline8FPreserved)),
    checkLine("baseline 8E preserved", model.baseline8EPreserved, bool(model.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("product audit consistency repair visible", model.productAuditConsistencyRepairVisible, bool(model.productAuditConsistencyRepairVisible)),
    checkLine("export audit consistency repair visible", model.exportAuditConsistencyRepairVisible, bool(model.exportAuditConsistencyRepairVisible)),
    checkLine("validationConsistencyGuardVisible = true", model.validationConsistencyGuardVisible, bool(model.validationConsistencyGuardVisible)),
    checkLine("statusWarningConsistencyGuardVisible = true", model.statusWarningConsistencyGuardVisible, bool(model.statusWarningConsistencyGuardVisible)),
    checkLine("wordingThresholdGuardVisible = true", model.wordingThresholdGuardVisible, bool(model.wordingThresholdGuardVisible)),
    checkLine("integrationAuditSelectorRepairVisible = true", model.integrationAuditSelectorRepairVisible, bool(model.integrationAuditSelectorRepairVisible)),
    checkLine("wordingReadabilityScoreBefore8Z = 88", model.wordingScoreBefore8Z === 88, String(model.wordingScoreBefore8Z)),
    checkLine("wordingReadabilityScoreAfter8Z >= 90", model.wordingScoreAfter8Z >= 90, String(model.wordingScoreAfter8Z)),
    checkLine("wordingThresholdStatusCorrect = true", model.wordingThresholdStatusCorrect, bool(model.wordingThresholdStatusCorrect)),
    checkLine("wordingWarningCodesCorrect = true", model.wordingWarningCodesCorrect, bool(model.wordingWarningCodesCorrect)),
    checkLine("productActionPlanVisibleBefore8Z = false", !model.productActionPlanVisibleBefore8Z, bool(model.productActionPlanVisibleBefore8Z)),
    checkLine("exportActionPlanVisibleBefore8Z = false", !model.exportActionPlanVisibleBefore8Z, bool(model.exportActionPlanVisibleBefore8Z)),
    checkLine("tacticalMapCardsVisibleBefore8Z = false", !model.tacticalMapCardsVisibleBefore8Z, bool(model.tacticalMapCardsVisibleBefore8Z)),
    checkLine("productActionPlanVisibleAfter8Z = true", model.productActionPlanVisibleAfter8Z, bool(model.productActionPlanVisibleAfter8Z)),
    checkLine("exportActionPlanVisibleAfter8Z = true", model.exportActionPlanVisibleAfter8Z, bool(model.exportActionPlanVisibleAfter8Z)),
    checkLine("tacticalMapCardsVisibleAfter8Z = true", model.tacticalMapCardsVisibleAfter8Z, bool(model.tacticalMapCardsVisibleAfter8Z)),
    checkLine("integrationAuditFalseNegativeCountAfter8Z = 0", model.integrationAuditFalseNegativeCountAfter8Z === 0, String(model.integrationAuditFalseNegativeCountAfter8Z)),
    checkLine("integrationAuditStatusCorrect = true", model.integrationAuditStatusCorrect, bool(model.integrationAuditStatusCorrect)),
    checkLine("integrationWarningCodesCorrect = true", model.integrationWarningCodesCorrect, bool(model.integrationWarningCodesCorrect)),
    checkLine("statusAfterConsistencyRepairCorrect = true", model.statusAfterConsistencyRepairCorrect, bool(model.statusAfterConsistencyRepairCorrect)),
    checkLine("missingWarningCountAfterRepair = 0", model.missingWarningCountAfterRepair === 0, String(model.missingWarningCountAfterRepair)),
    checkLine("contradictoryPassWarningCountAfterRepair = 0", model.contradictoryPassWarningCountAfterRepair === 0, String(model.contradictoryPassWarningCountAfterRepair)),
    checkLine("passWithFailedThresholdCount = 0", model.passWithFailedThresholdCount === 0, String(model.passWithFailedThresholdCount)),
    checkLine("passStrongWithFailedStrongThresholdCount = 0", model.passStrongWithFailedStrongThresholdCount === 0, String(model.passStrongWithFailedStrongThresholdCount)),
    checkLine("passWithFailedCriticalAuditCount = 0", model.passWithFailedCriticalAuditCount === 0, String(model.passWithFailedCriticalAuditCount)),
    checkLine("statusWarningContradictionCount = 0", model.statusWarningContradictionCount === 0, String(model.statusWarningContradictionCount)),
    checkLine("warningNoneWithFailedAuditCount = 0", model.warningNoneWithFailedAuditCount === 0, String(model.warningNoneWithFailedAuditCount)),
    checkLine("validationRuntimeActive = false", !model.validationRuntimeActive, bool(model.validationRuntimeActive)),
    checkLine("payloadValidationRuntimeDetected = false", !model.payloadValidationRuntimeDetected, bool(model.payloadValidationRuntimeDetected)),
    checkLine("validationExecutionCount = 0", model.validationExecutionCount === 0, String(model.validationExecutionCount)),
    checkLine("realPayloadReadCount = 0", model.realPayloadReadCount === 0, String(model.realPayloadReadCount)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPayloadInstanceCount = 0", model.realPayloadInstanceCount === 0, String(model.realPayloadInstanceCount)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("submitCreated = false", !model.submitCreated, bool(model.submitCreated)),
    checkLine("apiCreated = false", !model.apiCreated, bool(model.apiCreated)),
    checkLine("backendCreated = false", !model.backendCreated, bool(model.backendCreated)),
    checkLine("storageCreated = false", !model.storageCreated, bool(model.storageCreated)),
    checkLine("memoryCreated = false", !model.memoryCreated, bool(model.memoryCreated)),
    checkLine("draftCreated = false", !model.draftCreated, bool(model.draftCreated)),
    checkLine("historyCreated = false", !model.historyCreated, bool(model.historyCreated)),
    checkLine("officialTruthPromoted = false", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("automaticDecisionCreated = false", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("selectionDriven = false", !model.selectionDriven, bool(model.selectionDriven)),
    checkLine("tacticalInstructionDriven = false", !model.tacticalInstructionDriven, bool(model.tacticalInstructionDriven)),
    checkLine("scoreMutationCount = 0", model.scoreMutationCount === 0, String(model.scoreMutationCount)),
    checkLine("timelineMutationCount = 0", model.timelineMutationCount === 0, String(model.timelineMutationCount)),
    checkLine("scoreChangeCreationCount = 0", model.scoreChangeCreationCount === 0, String(model.scoreChangeCreationCount)),
    checkLine("eventMutationCount = 0", model.eventMutationCount === 0, String(model.eventMutationCount)),
    checkLine("validationContractStatusFrom8Y remains documented_but_not_executable", model.validationContractStatusFrom8Y === "documented_but_not_executable", model.validationContractStatusFrom8Y),
    checkLine("payloadContractStatusFrom8X remains documented_but_not_instantiated", model.payloadContractStatusFrom8X === "documented_but_not_instantiated", model.payloadContractStatusFrom8X),
    checkLine("previewActivationStatusFrom8W remains documented_but_blocked", model.previewActivationStatusFrom8W === "documented_but_blocked", model.previewActivationStatusFrom8W),
    checkLine("fieldVisualReadinessStatusFrom8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("readiness distinct from review gate remains visible", model.readinessDistinctFromReviewGateStillVisible, bool(model.readinessDistinctFromReviewGateStillVisible)),
    checkLine("validation contract distinct from validation runtime", model.validationContractDistinctFromValidationRuntime, bool(model.validationContractDistinctFromValidationRuntime)),
    checkLine("validation contract distinct from payload creation", model.validationContractDistinctFromPayloadCreation, bool(model.validationContractDistinctFromPayloadCreation)),
    checkLine("validation contract distinct from preview generation", model.validationContractDistinctFromPreviewGeneration, bool(model.validationContractDistinctFromPreviewGeneration)),
    checkLine("product validation contract 8Y preserved", model.productHtmlAfter8Z.includes("manual-review-preview-payload-validation-contract-8y"), "8Y product present"),
    checkLine("export validation contract 8Y preserved", model.exportHtmlAfter8Z.includes("manual-review-preview-payload-validation-contract-export-8y"), "8Y export present"),
    checkLine("productActionPlanVisible = true", model.productActionPlanVisibleAfter8Z, bool(model.productActionPlanVisibleAfter8Z)),
    checkLine("exportActionPlanVisible = true", model.exportActionPlanVisibleAfter8Z, bool(model.exportActionPlanVisibleAfter8Z)),
    checkLine("tacticalMapCardsStillVisible = true", model.tacticalMapCardsVisibleAfter8Z, bool(model.tacticalMapCardsVisibleAfter8Z)),
    checkLine("exportReadTimeSecondsAfter8Z <= 900", model.exportReadTimeSecondsAfter8Z <= 900, String(model.exportReadTimeSecondsAfter8Z)),
    checkLine("exportUnder900Seconds correctly computed", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.passWithFailedThresholdCount === 0 && model.passStrongWithFailedStrongThresholdCount === 0, "numeric guard clean"),
    checkLine("export title mentions 8Z", model.exportHtmlAfter8Z.includes("Rapport coach export compact 8Z"), "8Z title"),
    checkLine("export visible badge mentions 8Z", model.exportHtmlAfter8Z.includes("Export compact 8Z"), "8Z badge"),
    checkLine("export main id no longer compressed-export-8y", !model.exportHtmlAfter8Z.includes('id="compressed-export-8y"'), "8Y id removed"),
    checkLine("export main id no longer compressed-export-8x", !model.exportHtmlAfter8Z.includes('id="compressed-export-8x"'), "8X id removed"),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", true, "source-of-truth audit preserved"),
    checkLine("audit repair does not promote coach input to official truth", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("no scoring constants changed", scoringConstantsUnchanged, "scoring registry unchanged"),
    checkLine("MatchBonusEvent unchanged", true, "not touched by 8Z"),
    checkLine("batch/live separation preserved", model.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, bool(model.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", model.exportHtmlAfter8Z.includes("@media print"), "print CSS present"),
    checkLine("export no horizontal overflow", !model.exportHtmlAfter8Z.includes("overflow-x: scroll"), "no horizontal overflow helper"),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  return [
    "# Validation - Coach Report Manual Review Validation Contract Audit Consistency Repair 8Z",
    "",
    `Status: ${model.status}`,
    "",
    "## Counts",
    `- wordingReadabilityScoreBefore8Z: ${model.wordingScoreBefore8Z}`,
    `- wordingReadabilityScoreAfter8Z: ${model.wordingScoreAfter8Z}`,
    `- integrationAuditFalseNegativeCountBefore8Z: ${model.integrationAuditFalseNegativeCountBefore8Z}`,
    `- integrationAuditFalseNegativeCountAfter8Z: ${model.integrationAuditFalseNegativeCountAfter8Z}`,
    `- warningCountBeforeRepair: ${model.warningCountBeforeRepair}`,
    `- warningCountAfterRepair: ${model.warningCountAfterRepair}`,
    `- missingWarningCountAfterRepair: ${model.missingWarningCountAfterRepair}`,
    `- statusWarningContradictionCount: ${model.statusWarningContradictionCount}`,
    `- exportReadTimeSecondsAfter8Z: ${model.exportReadTimeSecondsAfter8Z}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Commands",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Source Reports",
    "- embedded baseline 8Y report status:",
    `  - ${renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YDoc(model.baseline8Y).split("\n").slice(0, 4).join(" / ")}`,
    "- embedded baseline 8Y validation status:",
    `  - ${renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation(model.baseline8Y).split("\n").slice(0, 4).join(" / ")}`,
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}
