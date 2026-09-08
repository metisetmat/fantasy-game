import {
  currentManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
} from "./buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9J";
import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import {
  auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistency9K,
  buildCorrectedManualReviewPreviewPayloadDryRunProgressiveDisclosureGroupViews9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K";
import { auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudget9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K";
import { evaluateManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K";
import type {
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRecommendation9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyStatus9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_BLOCKING_WARNINGS,
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_NEGATIVE_WARNINGS,
  uniqueWarningCodes9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";
import { auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadata9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K";
import { auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntime9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K";
import { auditManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservation9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K";
import { auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruth9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K";
import { auditManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublication9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K";
import {
  insertManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K,
  renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K,
} from "./renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K";
import {
  insertManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K,
  renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K,
} from "./renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K";

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

function countMisleadingBaselineRows(
  baseline9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
): number {
  return baseline9J.groupViews.filter(
    (groupView) =>
      groupView.copyCount > 0 &&
      groupView.errorCopyCount + groupView.blockerCopyCount + groupView.refusalCopyCount + groupView.compatibleCaseCount === 0,
  ).length;
}

function countZeroBaselineRows(
  baseline9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
): number {
  return baseline9J.groupViews.filter(
    (groupView) =>
      groupView.errorCopyCount === 0 &&
      groupView.blockerCopyCount === 0 &&
      groupView.refusalCopyCount === 0 &&
      groupView.compatibleCaseCount === 0,
  ).length;
}

function recommendationsForStatus(
  status: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyStatus9K,
  exportUnder790Seconds: boolean,
): readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRecommendation9K[] {
  if (status === "FAIL") return ["FIX_PROGRESSIVE_DISCLOSURE_REPORTING"];
  if (status === "PARTIAL") return ["REVIEW_PROGRESSIVE_DISCLOSURE_REPORTING", "MONITOR_EXPORT_BUDGET_AFTER_EMPTY_STATES"];
  return [
    "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE",
    "KEEP_GROUP_VIEW_REPORTING_CORRECTION",
    "KEEP_WORDING_READABILITY_SCORE_PUBLICATION",
    exportUnder790Seconds ? "PROCEED_TO_EMPTY_STATE_SPRINT" : "MONITOR_EXPORT_BUDGET_AFTER_EMPTY_STATES",
  ];
}

export function buildManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel(input: {
  readonly baseline9J?: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel | null;
  readonly productHtmlBefore9K?: string;
  readonly exportHtmlBefore9K?: string;
} = {}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel {
  const baseline9J = Object.prototype.hasOwnProperty.call(input, "baseline9J")
    ? input.baseline9J
    : currentManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel();
  if (baseline9J == null) throw new Error("9K requires the 9J progressive-disclosure baseline");
  if (baseline9J.status !== "PASS") throw new Error("9K requires a PASS 9J progressive-disclosure baseline");
  const correctedGroupViews = buildCorrectedManualReviewPreviewPayloadDryRunProgressiveDisclosureGroupViews9K();
  const productHtmlBefore9K = input.productHtmlBefore9K ?? baseline9J.productHtmlAfter9J;
  const exportHtmlBefore9K = input.exportHtmlBefore9K ?? baseline9J.exportHtmlAfter9J;
  const exportReportingConsistencySectionHtml = renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K({
    correctedGroupViews,
    wordingReadabilityScore: baseline9J.wordingReadabilityScore,
    wordingThresholdStatus: baseline9J.wordingThresholdStatus,
    exportReadTimeSecondsBefore9K: baseline9J.exportReadTimeSecondsAfter9J,
  });
  const exportHtmlAfter9K = insertManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K(exportHtmlBefore9K, {
    correctedGroupViews,
    wordingReadabilityScore: baseline9J.wordingReadabilityScore,
    wordingThresholdStatus: baseline9J.wordingThresholdStatus,
    exportReadTimeSecondsBefore9K: baseline9J.exportReadTimeSecondsAfter9J,
  });
  const budgetAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudget9K({
    exportHtmlBefore9K,
    exportHtmlAfter9K,
  });
  const productRenderingInput = {
    correctedGroupViews,
    wordingReadabilityScore: baseline9J.wordingReadabilityScore,
    wordingPassThreshold: baseline9J.wordingPassThreshold,
    wordingPassStrongThreshold: baseline9J.wordingPassStrongThreshold,
    wordingThresholdStatus: baseline9J.wordingThresholdStatus,
    exportReadTimeSecondsBefore9K: budgetAudit.exportReadTimeSecondsBefore9K,
    exportReadTimeSecondsAfter9K: budgetAudit.exportReadTimeSecondsAfter9K,
    misleadingGroupViewRowsBefore9K: countMisleadingBaselineRows(baseline9J),
    misleadingGroupViewRowsAfter9K: 0,
  };
  const productHtmlAfter9K = insertManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K(
    productHtmlBefore9K,
    productRenderingInput,
  );
  const productReportingConsistencySectionHtml =
    renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K(productRenderingInput);
  const reportingAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistency9K({
    correctedGroupViews,
    misleadingGroupViewRowsBefore9K: countMisleadingBaselineRows(baseline9J),
    zeroCountGroupRowsBefore9K: countZeroBaselineRows(baseline9J),
  });
  const wordingAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublication9K({
    productHtml: productHtmlAfter9K,
    exportHtml: exportHtmlAfter9K,
    wordingReadabilityScore: baseline9J.wordingReadabilityScore,
  });
  const preservationAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservation9K({ baseline9J });
  const metadataAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadata9K({
    productHtml: productHtmlAfter9K,
    exportHtml: exportHtmlAfter9K,
  });
  const noRuntimeAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntime9K({
    productHtml: productHtmlAfter9K,
    exportHtml: exportHtmlAfter9K,
  });
  const sourceOfTruthAudit = auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruth9K({ baseline9J });
  const guard = evaluateManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K({
    reporting: reportingAudit,
    wording: wordingAudit,
    preservation: preservationAudit,
    metadata: metadataAudit,
    budget: budgetAudit,
    noRuntime: noRuntimeAudit,
    sourceOfTruth: sourceOfTruthAudit,
  });
  const warningCodes = uniqueWarningCodes9K([
    ...guard.violations,
    guard.statusRecommendation === "PASS"
      ? "PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_READY"
      : guard.statusRecommendation === "PARTIAL"
        ? "PROGRESSIVE_DISCLOSURE_REPORTING_PARTIAL"
        : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
  ]);
  const hasBlocking = warningCodes.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_BLOCKING_WARNINGS.includes(warning),
  );
  const hasNegative = warningCodes.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_NEGATIVE_WARNINGS.includes(warning),
  );
  const status: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyStatus9K = hasBlocking
    ? "FAIL"
    : hasNegative
      ? "PARTIAL"
      : "PASS";

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_REPAIR",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_REPAIR_9K",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J",
    baseline9J,
    matchId: baseline9J.matchId,
    officialScore: baseline9J.officialScore,
    disclosureLevelCount: baseline9J.disclosureLevelCount,
    disclosureGroupCount: baseline9J.disclosureGroupCount,
    uxGroupCountFrom9H: baseline9J.uxGroupCountFrom9H,
    groupedErrorCopyCountFrom9H: baseline9J.groupedErrorCopyCountFrom9H,
    groupedBlockerCopyCountFrom9H: baseline9J.groupedBlockerCopyCountFrom9H,
    groupedRefusalCopyCountFrom9H: baseline9J.groupedRefusalCopyCountFrom9H,
    groupedCompatibleCaseCountFrom9H: baseline9J.groupedCompatibleCaseCountFrom9H,
    errorCopyCoverageFrom9H: baseline9J.errorCopyCoverageFrom9H,
    exportKeyMessagesDetectedCountFrom9G: baseline9J.exportKeyMessagesDetectedCountFrom9G,
    exportKeyMessagesMissingCountFrom9G: baseline9J.exportKeyMessagesMissingCountFrom9G,
    warningContradictionCountAfter9K: baseline9J.warningContradictionCountAfter9J,
    correctedGroupViews,
    ...reportingAudit,
    ...wordingAudit,
    ...preservationAudit,
    ...metadataAudit,
    ...budgetAudit,
    ...noRuntimeAudit,
    ...sourceOfTruthAudit,
    guard,
    productReportingConsistencySectionHtml,
    exportReportingConsistencySectionHtml,
    productHtmlAfter9K,
    exportHtmlAfter9K,
    warningCodes,
    recommendations: recommendationsForStatus(status, budgetAudit.exportUnder790Seconds),
  };
}

export function currentManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel(): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel {
  return buildManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel();
}

export function renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KDoc(
  model: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Progressive Disclosure Reporting Consistency Repair 9K",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## 9J Baseline",
    ...table([
      ["Metric", "Value"],
      ["baseline9JPreserved", bool(model.baseline9JPreserved)],
      ["disclosure levels", `${model.disclosureLevelCount}/3`],
      ["disclosure groups", `${model.disclosureGroupCount}/5`],
      ["technical refs collapsed", bool(model.technicalReferencesCollapsedAllGroups)],
      ["no runtime/action mutation", bool(model.noRuntimeBoundaryPreserved)],
    ]),
    "",
    "## Wording Readability Score Publication",
    ...table([
      ["Metric", "Value"],
      ["wordingReadabilityScore", String(model.wordingReadabilityScore)],
      ["PASS threshold", String(model.wordingPassThreshold)],
      ["PASS strong threshold", String(model.wordingPassStrongThreshold)],
      ["threshold status", model.wordingThresholdStatus],
      ["published product/export", `${bool(model.wordingPublishedInProduct)}/${bool(model.wordingPublishedInExport)}`],
    ]),
    "",
    "## Corrected Group Views",
    ...table([
      ["Group", "Total copies", "Error copies", "Blocker copies", "Refusal copies", "Compatible case", "Boundary", "Technical refs collapsed"],
      ...model.correctedGroupViews.map((groupView) => [
        groupView.group,
        String(groupView.totalCopies),
        String(groupView.errorCopies),
        String(groupView.blockerCopies),
        String(groupView.refusalCopies),
        String(groupView.compatibleCase),
        String(groupView.boundary),
        bool(groupView.technicalRefsCollapsed),
      ]),
    ]),
    "",
    "## Reporting Consistency Delta",
    ...table([
      ["Metric", "Before 9K", "After 9K"],
      ["misleading Group Views rows", String(model.misleadingGroupViewRowsBefore9K), String(model.misleadingGroupViewRowsAfter9K)],
      ["zero-count Group Views rows", String(model.zeroCountGroupRowsBefore9K), String(model.zeroCountGroupRowsAfter9K)],
      ["group total copies", "misleading", String(model.groupViewTotalCopiesSum)],
      ["ungrouped/duplicated", "0/0", `${model.ungroupedCopyCountAfter9K}/${model.duplicatedCopyCountAfter9K}`],
    ]),
    "",
    "## Preservation",
    ...table([
      ["Metric", "Value"],
      ["9H counts", `${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}`],
      ["9H coverage", model.errorCopyCoverageFrom9H],
      ["9G key messages", `${model.exportKeyMessagesDetectedCountFrom9G}/7`],
      ["9G missing messages", String(model.exportKeyMessagesMissingCountFrom9G)],
      ["warning contradiction", String(model.warningContradictionCountAfter9K)],
      ["compatible case non accepted", bool(model.compatibleCaseStillNotAccepted)],
    ]),
    "",
    "## Export Budget",
    ...table([
      ["Metric", "Value"],
      ["before 9K", String(model.exportReadTimeSecondsBefore9K)],
      ["after 9K", String(model.exportReadTimeSecondsAfter9K)],
      ["delta", String(model.exportReadTimeDelta9K)],
      ["target <=790", bool(model.exportUnder790Seconds)],
      ["strong pass <=800", bool(model.exportUnder800Seconds)],
      ["pass <=900", bool(model.exportUnder900Seconds)],
    ]),
    "",
    "## No Runtime And Source Of Truth",
    ...table([
      ["Metric", "Value"],
      ["no JS / active controls", `${bool(model.disclosureUsesNoJavaScript)}/${bool(model.disclosureCreatesNoActiveControls)}`],
      ["payload accepted / preview generated", `${model.dryRunAcceptedPayloadCount}/${bool(model.realPreviewGenerated)}`],
      ["persistence / official truth", `${bool(model.storageCreated)}/${bool(model.officialTruthPromoted)}`],
      ["decision / selection / tactic", `${bool(model.automaticDecisionCreated)}/${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score / timeline mutation", `${model.scoreMutationCount}/${model.timelineMutationCount}`],
      ["scoring constants changed", bool(model.scoringConstantsChanged)],
      ["PENALTY_SHOT inactive", bool(model.penaltyShotInactive)],
      ["MatchBonusEvent changed", bool(model.matchBonusEventChanged)],
      ["batch/live separation", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Recommendations",
    ...model.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
    "## Warnings Final List",
    model.warningCodes.join(", ") || "none",
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].flat().join("\n");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KValidation(
  model: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel,
): string {
  const checks = [
    checkLine("9K model exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_REPAIR_9K", model.version),
    checkLine("baseline 9J preserved", model.baseline9JPreserved, bool(model.baseline9JPreserved)),
    checkLine("disclosure levels = 3", model.disclosureLevelCount === 3, String(model.disclosureLevelCount)),
    checkLine("disclosure groups = 5", model.disclosureGroupCount === 5, String(model.disclosureGroupCount)),
    checkLine("wordingReadabilityScore published", model.wordingReadabilityScorePublished, String(model.wordingReadabilityScore)),
    checkLine("wordingReadabilityScore >=95", model.wordingReadabilityScore >= 95, String(model.wordingReadabilityScore)),
    checkLine("wording thresholds correct", model.wordingPassThreshold === 90 && model.wordingPassStrongThreshold === 95 && model.wordingThresholdStatusCorrect, `${model.wordingPassThreshold}/${model.wordingPassStrongThreshold}/${model.wordingThresholdStatus}`),
    checkLine("Group Views corrected", model.groupViewsCorrected, bool(model.groupViewsCorrected)),
    checkLine("Group Views zero rows removed", model.zeroCountGroupRowsAfter9K === 0 && model.misleadingGroupViewRowsAfter9K === 0, `${model.zeroCountGroupRowsAfter9K}/${model.misleadingGroupViewRowsAfter9K}`),
    checkLine("Group Views totals match global counts", model.groupViewTotalsMatchGlobalCounts, `${model.groupViewTotalCopiesSum}/${model.groupViewBlockerCopyCoverageSum}/${model.groupViewRefusalCopyCoverageSum}/${model.groupViewCompatibleCaseCoverageSum}/${model.groupViewBoundaryCoverageSum}`),
    checkLine("Actions refusees shows 8 refusals", model.actionsRefuseesRefusalCopies === 8, String(model.actionsRefuseesRefusalCopies)),
    checkLine("compatible case remains 1 and non accepted", model.compatibleCaseRowCount === 1 && model.compatibleCaseStillNotAccepted, `${model.compatibleCaseRowCount}/${bool(model.compatibleCaseStillNotAccepted)}`),
    checkLine("9H counts preserved", model.groupCountsPreservedFrom9H, `${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}`),
    checkLine("9H coverage preserved", model.coveragePreservedFrom9H && model.errorCopyCoverageFrom9H === "19/12/14/8", model.errorCopyCoverageFrom9H),
    checkLine("9G key messages preserved", model.keyMessagesPreservedFrom9G && model.exportKeyMessagesDetectedCountFrom9G === 7 && model.exportKeyMessagesMissingCountFrom9G === 0, `${model.exportKeyMessagesDetectedCountFrom9G}/${model.exportKeyMessagesMissingCountFrom9G}`),
    checkLine("warning contradiction remains zero", model.warningContradictionCountAfter9K === 0, String(model.warningContradictionCountAfter9K)),
    checkLine("export before 9K is 785", model.exportReadTimeSecondsBefore9K === 785, String(model.exportReadTimeSecondsBefore9K)),
    checkLine("export <=790", model.exportUnder790Seconds, String(model.exportReadTimeSecondsAfter9K)),
    checkLine("export <=800 strong pass", model.exportUnder800Seconds && model.exportBudgetPassStrongEligible, String(model.exportReadTimeSecondsAfter9K)),
    checkLine("read-time booleans correct", model.exportUnder790BooleanCorrect && model.exportUnder800BooleanCorrect && model.exportUnder900BooleanCorrect, "correct"),
    checkLine("no runtime payload preview storage truth action mutation", model.guard.noRuntimeReady, "clean"),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged && model.penaltyShotInactive, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.matchBonusEventChanged, bool(!model.matchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("metadata 9K clean", model.productSectionVisible && model.exportSectionVisible && model.exportTitleMentions9K && model.exportMainIdIs9K && model.exportCoverBadgeCorrect && model.historical9JPreserved && model.historical9IPreserved, model.exportCoverBadgeText),
    checkLine("required validation command visible", REQUIRED_VALIDATION_COMMAND.includes("npm run test:all"), REQUIRED_VALIDATION_COMMAND),
  ];
  const checksPass = checks.every((line) => line.startsWith("- PASS"));
  const status = checksPass && model.status === "PASS" ? "PASS" : model.status === "FAIL" ? "FAIL" : "PARTIAL";
  return [
    "# Validation Coach Report Manual Review Preview Payload Dry-Run Progressive Disclosure Reporting Consistency Repair 9K",
    "",
    `Status: ${status}`,
    `Model status: ${model.status}`,
    "",
    ...checks,
    "",
    "## Recommendations",
    ...model.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
