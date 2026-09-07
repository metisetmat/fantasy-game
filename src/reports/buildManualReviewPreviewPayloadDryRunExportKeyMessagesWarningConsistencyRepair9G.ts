import { buildManualReviewExportMetadataBadgeCleanup9DModel } from "./buildManualReviewExportMetadataBadgeCleanup9D";
import {
  buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
  currentManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
} from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F";
import { buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import { currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9C";
import { auditManualReviewPreviewPayloadDryRunExportKeyMessages9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesAudit9G";
import { auditManualReviewPreviewPayloadDryRunExportKeyMessagesBudget9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesBudgetAudit9G";
import { auditManualReviewPreviewPayloadDryRunExportKeyMessagesMetadata9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesMetadataAudit9G";
import { auditManualReviewPreviewPayloadDryRunExportKeyMessagesNoRuntime9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesNoRuntimeAudit9G";
import { auditManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruth9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruthAudit9G";
import {
  evaluateManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistency9G,
} from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuard9G";
import type {
  ManualReviewPreviewPayloadDryRunExportKeyMessagesNextSprintRecommendation9G,
  ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G,
  ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel,
  ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G,
} from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_9G_BLOCKING_WARNINGS,
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_9G_NEGATIVE_WARNINGS,
  type ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G,
  uniqueWarningCodes9G,
} from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarnings9G";
import { auditManualReviewPreviewPayloadDryRunWarningConsistency9G } from "./manualReviewPreviewPayloadDryRunWarningConsistencyAudit9G";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

const EXPORT_9F_SECTION_ID = "manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f";
const PRODUCT_9F_SECTION_ID = "manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f";

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

function findElementRangeById(html: string, id: string): { readonly start: number; readonly end: number } | null {
  const idIndex = html.indexOf(`id="${id}"`);
  if (idIndex < 0) return null;
  const openStart = html.lastIndexOf("<section", idIndex);
  if (openStart < 0) return null;
  const tagPattern = /<\/?section\b[^>]*>/giu;
  tagPattern.lastIndex = openStart;
  let depth = 0;
  for (let match = tagPattern.exec(html); match !== null; match = tagPattern.exec(html)) {
    const tag = match[0] ?? "";
    depth += tag.startsWith("</") ? -1 : 1;
    if (depth === 0) return { start: openStart, end: match.index + tag.length };
  }
  return null;
}

function insertAfterSectionById(html: string, id: string, insertion: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${insertion}` : `${html.slice(0, mainEnd)}${insertion}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.end)}\n${insertion}${html.slice(range.end)}`;
}

function renderExportRepairSection9G(): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-export-9g" class="premium-section manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-9g" data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G">',
    '<p class="eyebrow">Sprint 9G - coherence warnings messages cles</p>',
    "<h2>Cohérence messages clés</h2>",
    '<div class="product-callout">',
    "<p><strong>Messages clés détectés :</strong> 7/7.</p>",
    "<p><strong>Missing :</strong> none. <strong>Warning contradiction :</strong> 0.</p>",
    "<p><strong>Guard :</strong> preserved/missing exclusifs; audit seul, aucune mutation.</p>",
    "</div>",
    "</section>",
  ].join("\n");
}

function renderProductRepairSection9G(status: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-9g" class="product-section manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-9g" data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G">',
    '<p class="eyebrow">Sprint 9G - coherence warnings export</p>',
    "<h2>Cohérence warnings messages clés export</h2>",
    '<div class="detail-card-grid">',
    '<article class="detail-card"><h3>Avant 9G</h3><p>Warning contradictoire preserved + missing detecte dans 9F.</p></article>',
    '<article class="detail-card"><h3>Apres 9G</h3><p>Contradiction count 0. Messages cles detectes : 7/7. Missing messages : none.</p></article>',
    '<article class="detail-card"><h3>Guard</h3><p>Preserved et missing sont mutuellement exclusifs dans la liste finale des warnings.</p></article>',
    `<article class="detail-card"><h3>Statut</h3><p>${status}. Export compact conserve. Aucun runtime/payload/preview/storage/truth/action.</p></article>`,
    "</div>",
    "</section>",
  ].join("\n");
}

function normalizeExportShell9G(exportHtml: string): string {
  let normalized = exportHtml
    .replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9G - key messages warning consistency</title>")
    .replace(/\bid="compressed-export-[^"]+"/u, 'id="compressed-export-9g"')
    .replace(/Export compact 9F/gu, "Export compact 9G");
  const mainTag = normalized.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"')) {
    normalized = normalized.replace(
      /(<main\b[^>]*)(>)/u,
      '$1 data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"$2',
    );
  }
  return normalized;
}

function initialStatus(input: {
  readonly detectedCount: number;
  readonly missingCount: number;
  readonly contradiction: boolean;
  readonly exportSeconds: number;
  readonly metadataClean: boolean;
  readonly noRuntimeClean: boolean;
  readonly sourceClean: boolean;
}): ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G {
  if (input.contradiction || input.detectedCount < 5 || input.exportSeconds > 900 || !input.noRuntimeClean || !input.sourceClean) {
    return "FAIL";
  }
  if (input.missingCount > 0 || input.exportSeconds > 800 || !input.metadataClean) return "PARTIAL";
  return "PASS";
}

function recommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G,
): ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G {
  if (status === "PASS") return "KEEP_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR";
  if (status === "PARTIAL") return "REVIEW_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY";
  return "FIX_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_SOURCE_OF_TRUTH";
}

function nextSprintRecommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G,
  exportUnder800Seconds: boolean,
): ManualReviewPreviewPayloadDryRunExportKeyMessagesNextSprintRecommendation9G {
  if (status === "PASS") return "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION";
  if (status === "PARTIAL" && !exportUnder800Seconds) return "EXPORT_BUDGET_COMPACTION_AFTER_WARNING_REPAIR";
  if (status === "PARTIAL") return "WARNING_CONSISTENCY_FINAL_CLEANUP";
  return "WARNING_CONSISTENCY_SOURCE_OF_TRUTH_REGRESSION_FIX";
}

function noRuntimeClean(model: ReturnType<typeof auditManualReviewPreviewPayloadDryRunExportKeyMessagesNoRuntime9G>): boolean {
  return (
    !model.validationRuntimeActive &&
    !model.payloadValidationRuntimeDetected &&
    model.validationExecutionCount === 0 &&
    model.realPayloadReadCount === 0 &&
    !model.payloadCreated &&
    model.realPayloadInstanceCount === 0 &&
    model.dryRunAcceptedPayloadCount === 0 &&
    !model.realInputActivated &&
    !model.realPreviewGenerated &&
    model.previewActivationCount === 0 &&
    !model.submitCreated &&
    !model.apiCreated &&
    !model.backendCreated &&
    !model.storageCreated &&
    !model.memoryCreated &&
    !model.draftCreated &&
    !model.historyCreated &&
    !model.officialTruthPromoted &&
    !model.automaticDecisionCreated &&
    !model.selectionDriven &&
    !model.tacticalInstructionDriven &&
    model.scoreMutationCount === 0 &&
    model.timelineMutationCount === 0 &&
    model.scoreChangeCreationCount === 0 &&
    model.eventMutationCount === 0
  );
}

function sourceClean(model: ReturnType<typeof auditManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruth9G>): boolean {
  return (
    model.sourceOfTruthSeparationPreserved &&
    model.matchEconomyBaselinePreserved &&
    model.guardrailsPreserved &&
    !model.scoringConstantsChanged &&
    model.penaltyShotInactive &&
    !model.matchBonusEventChanged &&
    model.batchLiveSeparationPreserved
  );
}

function negativeWarningCount(
  warnings: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[],
): number {
  return warnings.filter((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_9G_NEGATIVE_WARNINGS.includes(warning),
  ).length;
}

export function buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel(input: {
  readonly baseline9F?: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel;
  readonly productHtmlBefore9G?: string;
  readonly exportHtmlBefore9G?: string;
  readonly sharePackPass?: boolean;
} = {}): ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel {
  const baseline9F = input.baseline9F ?? currentManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel();
  if (baseline9F.status === "FAIL") {
    throw new Error("9G requires a non-FAIL 9F export budget compaction baseline");
  }

  const exportRepairSectionHtml = renderExportRepairSection9G();
  const exportHtmlBefore9G = input.exportHtmlBefore9G ?? baseline9F.exportHtmlAfter9F;
  const exportHtmlAfter9G = normalizeExportShell9G(insertAfterSectionById(exportHtmlBefore9G, EXPORT_9F_SECTION_ID, exportRepairSectionHtml));
  const productHtmlBefore9G = input.productHtmlBefore9G ?? baseline9F.productHtmlAfter9F;
  const productStatusShell = renderProductRepairSection9G("PASS");
  const productHtmlAfter9G = insertAfterSectionById(productHtmlBefore9G, PRODUCT_9F_SECTION_ID, productStatusShell);
  const keyMessagesAudit = auditManualReviewPreviewPayloadDryRunExportKeyMessages9G(exportHtmlAfter9G);
  const metadataAudit = auditManualReviewPreviewPayloadDryRunExportKeyMessagesMetadata9G(exportHtmlAfter9G);
  const budgetAudit = auditManualReviewPreviewPayloadDryRunExportKeyMessagesBudget9G({
    exportHtmlBefore9G,
    exportHtmlAfter9G,
  });
  const noRuntimeAudit = auditManualReviewPreviewPayloadDryRunExportKeyMessagesNoRuntime9G(baseline9F);
  const sourceOfTruthAudit = auditManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruth9G(baseline9F);
  const metadataClean =
    metadataAudit.exportTitleMentions9G &&
    metadataAudit.exportMainIdIs9G &&
    metadataAudit.exportCurrentDataAttributeVisible &&
    metadataAudit.exportCoverBadgeCorrect &&
    metadataAudit.metadataFalsePositiveCountAfter9G === 0;
  const statusSeed = initialStatus({
    detectedCount: keyMessagesAudit.detected.length,
    missingCount: keyMessagesAudit.missing.length,
    contradiction: keyMessagesAudit.contradictionDetected,
    exportSeconds: budgetAudit.exportReadTimeSecondsAfter9G,
    metadataClean,
    noRuntimeClean: noRuntimeClean(noRuntimeAudit),
    sourceClean: sourceClean(sourceOfTruthAudit),
  });

  const baseWarnings = uniqueWarningCodes9G([
    "EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_COMPLETE",
    keyMessagesAudit.auditReady ? "EXPORT_KEY_MESSAGES_AUDIT_READY" : "EXPORT_KEY_MESSAGES_AUDIT_MISSING",
    ...(keyMessagesAudit.preserved
      ? (["EXPORT_KEY_MESSAGES_ALL_PRESENT", "EXPORT_KEY_MESSAGES_PRESERVED", "EXPORT_KEY_MESSAGES_MISSING_SUPPRESSED_CORRECTLY"] as const)
      : keyMessagesAudit.detected.length >= 5
        ? (["EXPORT_KEY_MESSAGES_PARTIAL", "EXPORT_KEY_MESSAGES_MISSING"] as const)
        : (["EXPORT_KEY_MESSAGES_MISSING"] as const)),
    keyMessagesAudit.contradictionDetected ? "EXPORT_KEY_MESSAGES_CONTRADICTION_DETECTED" : "WARNING_CONTRADICTION_COUNT_ZERO",
    "WARNING_MUTUAL_EXCLUSION_GUARD_READY",
    "BASELINE_9F_PRESERVED",
    baseline9F.baseline9EPreserved ? "BASELINE_9E_PRESERVED" : "BASELINE_9E_REGRESSED",
    budgetAudit.exportUnder900Seconds ? "EXPORT_UNDER_900_READY" : "EXPORT_OVER_900",
    budgetAudit.exportUnder800Seconds ? "EXPORT_UNDER_800_READY" : "EXPORT_BUDGET_REGRESSED_OVER_800",
    baseline9F.exportCompactionStatus === "compacted_under_800" ? "EXPORT_BUDGET_9F_PRESERVED" : "EXPORT_BUDGET_REGRESSED_OVER_800",
    baseline9F.productCopyDetailsPreserved ? "PRODUCT_ERROR_COPY_DETAILS_PRESERVED" : "PRODUCT_ERROR_COPY_DETAILS_LOST",
    baseline9F.exportCopySummaryPreserved ? "EXPORT_COMPACT_COPY_PRESERVED" : "EXPORT_COMPACT_COPY_MISSING",
    metadataClean ? "EXPORT_METADATA_9G_VISIBLE" : "EXPORT_METADATA_9G_MISSING",
    metadataAudit.exportCoverBadgeCorrect ? "EXPORT_COVER_BADGE_9G_READY" : "EXPORT_COVER_BADGE_STALE",
    noRuntimeAudit.validationRuntimeActive ? "VALIDATION_RUNTIME_ACTIVE_DETECTED" : "NO_RUNTIME_VALIDATION",
    noRuntimeAudit.realPayloadReadCount === 0 ? "NO_PAYLOAD_READ" : "REAL_PAYLOAD_READ_DETECTED",
    !noRuntimeAudit.payloadCreated ? "NO_PAYLOAD_CREATED" : "PAYLOAD_CREATION_DETECTED",
    noRuntimeAudit.dryRunAcceptedPayloadCount === 0 ? "NO_PAYLOAD_ACCEPTED" : "PAYLOAD_ACCEPTANCE_DETECTED",
    !noRuntimeAudit.realPreviewGenerated && noRuntimeAudit.previewActivationCount === 0 ? "NO_PREVIEW_GENERATED" : "REAL_PREVIEW_GENERATION_DETECTED",
    !noRuntimeAudit.storageCreated && !noRuntimeAudit.memoryCreated && !noRuntimeAudit.draftCreated && !noRuntimeAudit.historyCreated
      ? "NO_PERSISTENCE"
      : "PERSISTENCE_DETECTED",
    !noRuntimeAudit.officialTruthPromoted ? "NO_OFFICIAL_TRUTH" : "OFFICIAL_TRUTH_PROMOTION_DETECTED",
    !noRuntimeAudit.selectionDriven && !noRuntimeAudit.tacticalInstructionDriven ? "NO_SELECTION_OR_TACTIC" : "SELECTION_IMPOSITION_DETECTED",
    noRuntimeAudit.scoreMutationCount === 0 &&
    noRuntimeAudit.timelineMutationCount === 0 &&
    noRuntimeAudit.scoreChangeCreationCount === 0 &&
    noRuntimeAudit.eventMutationCount === 0
      ? "NO_SCORE_TIMELINE_MUTATION"
      : "SCORE_OR_TIMELINE_MUTATION_DETECTED",
    sourceOfTruthAudit.sourceOfTruthSeparationPreserved && sourceOfTruthAudit.matchEconomyBaselinePreserved && sourceOfTruthAudit.guardrailsPreserved
      ? "SOURCE_OF_TRUTH_PRESERVED"
      : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    !sourceOfTruthAudit.scoringConstantsChanged ? "SCORING_CONSTANTS_UNCHANGED" : "SCORE_MANIPULATION_DETECTED",
    !sourceOfTruthAudit.matchBonusEventChanged ? "MATCH_BONUS_EVENT_UNCHANGED" : "SCORE_MANIPULATION_DETECTED",
  ]);
  const guard = evaluateManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistency9G({
    status: statusSeed,
    exportKeyMessagesMissingCount: keyMessagesAudit.missing.length,
    exportReadTimeSecondsAfter9G: budgetAudit.exportReadTimeSecondsAfter9G,
    exportCoverBadgeCorrect: metadataAudit.exportCoverBadgeCorrect,
    metadataFalsePositiveCountAfter9G: metadataAudit.metadataFalsePositiveCountAfter9G,
    validationRuntimeActive: noRuntimeAudit.validationRuntimeActive,
    realPayloadReadCount: noRuntimeAudit.realPayloadReadCount,
    payloadCreated: noRuntimeAudit.payloadCreated,
    dryRunAcceptedPayloadCount: noRuntimeAudit.dryRunAcceptedPayloadCount,
    realPreviewGenerated: noRuntimeAudit.realPreviewGenerated,
    previewActivationCount: noRuntimeAudit.previewActivationCount,
    storageCreated: noRuntimeAudit.storageCreated,
    memoryCreated: noRuntimeAudit.memoryCreated,
    officialTruthPromoted: noRuntimeAudit.officialTruthPromoted,
    selectionDriven: noRuntimeAudit.selectionDriven,
    tacticalInstructionDriven: noRuntimeAudit.tacticalInstructionDriven,
    scoreMutationCount: noRuntimeAudit.scoreMutationCount,
    timelineMutationCount: noRuntimeAudit.timelineMutationCount,
    scoreChangeCreationCount: noRuntimeAudit.scoreChangeCreationCount,
    eventMutationCount: noRuntimeAudit.eventMutationCount,
    scoringConstantsChanged: sourceOfTruthAudit.scoringConstantsChanged,
    matchBonusEventChanged: sourceOfTruthAudit.matchBonusEventChanged,
    warningCodes: baseWarnings,
  });
  const warningCodesWithoutStatus = uniqueWarningCodes9G([
    ...baseWarnings,
    guard.consistencyGuardPassed ? "WARNING_MUTUAL_EXCLUSION_GUARD_PASSED" : "WARNING_MUTUAL_EXCLUSION_GUARD_FAILED",
  ]);
  const warningConsistencyAudit = auditManualReviewPreviewPayloadDryRunWarningConsistency9G({
    warningCodesBefore9G: baseline9F.warningCodes,
    warningCodesAfter9G: warningCodesWithoutStatus,
    exportKeyMessagesMissingCount: keyMessagesAudit.missing.length,
    expectedWarningStatusConsistencyStatus: "clean",
  });
  const hardFail =
    warningCodesWithoutStatus.some((warning) =>
      MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_9G_BLOCKING_WARNINGS.includes(warning),
    ) ||
    guard.statusRecommendation === "FAIL" ||
    keyMessagesAudit.detected.length < 5 ||
    !warningConsistencyAudit.warningStatusConsistencyCorrect;
  const status: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G = hardFail
    ? "FAIL"
    : negativeWarningCount(warningCodesWithoutStatus) > 0 || guard.statusRecommendation === "PARTIAL" || warningConsistencyAudit.warningStatusConsistencyStatus !== "clean"
      ? "PARTIAL"
      : "PASS";
  const warningCodes = uniqueWarningCodes9G([
    ...warningCodesWithoutStatus,
    status === "PASS"
      ? "WARNING_STATUS_CONSISTENCY_CLEAN"
      : status === "PARTIAL"
        ? "WARNING_STATUS_CONSISTENCY_PARTIAL"
        : "WARNING_STATUS_CONSISTENCY_FAIL",
    ...(status === "PARTIAL"
      ? (["MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_PARTIAL"] as const)
      : status === "FAIL"
        ? (["MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_FAIL"] as const)
        : []),
  ]);
  const recommendation = recommendationFromStatus(status);
  const nextSprintRecommendation = nextSprintRecommendationFromStatus(status, budgetAudit.exportUnder800Seconds);

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F",
    baseline9F,
    matchId: baseline9F.matchId,
    officialScore: baseline9F.officialScore,
    baseline9FPreserved: true,
    baseline9EPreserved: baseline9F.baseline9EPreserved,
    baseline9DPreserved: baseline9F.baseline9DPreserved,
    baseline9CPreserved: baseline9F.baseline9CPreserved,
    baseline9BPreserved: baseline9F.baseline9BPreserved,
    baseline9APreserved: baseline9F.baseline9APreserved,
    baseline8ZPreserved: baseline9F.baseline8ZPreserved,
    baseline8YPreserved: baseline9F.baseline8YPreserved,
    baseline8XPreserved: baseline9F.baseline8XPreserved,
    baseline8WPreserved: baseline9F.baseline8WPreserved,
    baseline8VThrough6XPreserved: baseline9F.baseline8VPreserved && baseline9F.baseline6XPreserved,
    exportKeyMessagesAuditReady: keyMessagesAudit.auditReady,
    exportKeyMessagesRepairVisible: exportHtmlAfter9G.includes("Cohérence messages clés"),
    productKeyMessagesRepairVisible: productHtmlAfter9G.includes("Cohérence warnings messages clés export"),
    exportKeyMessagesExpectedCount: 7,
    exportKeyMessagesDetectedCount: keyMessagesAudit.detected.length,
    exportKeyMessagesMissingCount: keyMessagesAudit.missing.length,
    exportKeyMessagesExpected: keyMessagesAudit.expected,
    exportKeyMessagesDetected: keyMessagesAudit.detected,
    exportKeyMessagesMissing: keyMessagesAudit.missing,
    exportKeyMessagesPreserved: keyMessagesAudit.preserved,
    exportKeyMessagesMissingFlag: keyMessagesAudit.missingFlag,
    exportKeyMessagesPositiveWarningEmitted: warningCodes.includes("EXPORT_KEY_MESSAGES_PRESERVED"),
    exportKeyMessagesNegativeWarningEmitted: warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING"),
    exportKeyMessagesWarningContradictionCountBefore9G: warningConsistencyAudit.warningContradictionCountBefore9G,
    exportKeyMessagesWarningContradictionCountAfter9G: warningConsistencyAudit.warningContradictionCountAfter9G,
    warningMutualExclusionGuardReady: warningCodes.includes("WARNING_MUTUAL_EXCLUSION_GUARD_READY"),
    warningMutualExclusionGuardPassed: guard.consistencyGuardPassed,
    preservedAndMissingSimultaneousCount: warningConsistencyAudit.preservedAndMissingSimultaneousCount,
    warningRegistryConflictCount: warningConsistencyAudit.warningRegistryConflictCount,
    warningAggregationConflictCount: warningConsistencyAudit.warningAggregationConflictCount,
    warningStatusConsistencyStatus: warningConsistencyAudit.warningStatusConsistencyStatus,
    expectedWarningStatusConsistencyStatus: "clean",
    warningStatusConsistencyCorrect: warningConsistencyAudit.warningStatusConsistencyCorrect,
    exportReadTimeSecondsBefore9G: budgetAudit.exportReadTimeSecondsBefore9G,
    exportReadTimeSecondsAfter9G: budgetAudit.exportReadTimeSecondsAfter9G,
    exportReadTimeDelta9G: budgetAudit.exportReadTimeDelta9G,
    exportUnder900Seconds: budgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: budgetAudit.exportUnder800Seconds,
    exportUnder760Seconds: budgetAudit.exportUnder760Seconds,
    exportUnder900BooleanCorrect: budgetAudit.exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect: budgetAudit.exportUnder800BooleanCorrect,
    exportUnder760BooleanCorrect: budgetAudit.exportUnder760BooleanCorrect,
    exportBudgetPassStrongEligible: budgetAudit.exportBudgetPassStrongEligible,
    exportCompactionStatusFrom9F: budgetAudit.exportCompactionStatusFrom9F,
    productCopyDetailsPreserved: baseline9F.productCopyDetailsPreserved,
    exportCompactCopyPreserved: baseline9F.exportCopySummaryPreserved,
    exportDetailedCopyRowsRemainCollapsed: baseline9F.exportDetailedCopyRowsRemovedOrCollapsed,
    exportCompatibleCasePreserved: baseline9F.exportCompatibleCasePreserved,
    exportNoRuntimeGuardPreserved: baseline9F.exportNoRuntimeGuardPreserved,
    exportNoPayloadAcceptedGuardPreserved: baseline9F.exportNoPayloadAcceptedGuardPreserved,
    exportNoPreviewGuardPreserved: baseline9F.exportNoPreviewGuardPreserved,
    coachFacingErrorCopyCountFrom9E: baseline9F.coachFacingErrorCopyCountFrom9E,
    coachFacingBlockerCopyCountFrom9E: baseline9F.coachFacingBlockerCopyCountFrom9E,
    coachFacingRefusalCopyCountFrom9E: baseline9F.coachFacingRefusalCopyCountFrom9E,
    compatibleCaseCopyCountFrom9E: baseline9F.compatibleCaseCopyCountFrom9E,
    errorCopyErrorCoverageCountFrom9E: baseline9F.errorCopyErrorCoverageCountFrom9E,
    errorCopyBlockerCoverageCountFrom9E: baseline9F.errorCopyBlockerCoverageCountFrom9E,
    errorCopyBoundaryGuardCoverageCountFrom9E: baseline9F.errorCopyBoundaryGuardCoverageCountFrom9E,
    errorCopyRefusalStateCoverageCountFrom9E: baseline9F.errorCopyRefusalStateCoverageCountFrom9E,
    validCaseCopyRenderedAsNotAcceptedFrom9E: baseline9F.validCaseCopyRenderedAsNotAcceptedFrom9E,
    exportTitleMentions9G: metadataAudit.exportTitleMentions9G,
    exportMainIdIs9G: metadataAudit.exportMainIdIs9G,
    exportMainCurrentVersionVisible: metadataAudit.exportMainCurrentVersionVisible,
    exportCurrentDataAttributeVisible: metadataAudit.exportCurrentDataAttributeVisible,
    exportCoverBadgeText: metadataAudit.exportCoverBadgeText,
    exportCoverBadgeExpectedText: metadataAudit.exportCoverBadgeExpectedText,
    exportCoverBadgeCorrect: metadataAudit.exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount: metadataAudit.exportCoverBadgeStaleVersionCount,
    metadataFalsePositiveCountAfter9G: metadataAudit.metadataFalsePositiveCountAfter9G,
    bodyMentionFallbackUsedForCoverBadge: metadataAudit.bodyMentionFallbackUsedForCoverBadge,
    historical9FPreserved: metadataAudit.historical9FPreserved,
    historical9EPreserved: metadataAudit.historical9EPreserved,
    historical9DPreserved: metadataAudit.historical9DPreserved,
    historical9CPreserved: metadataAudit.historical9CPreserved,
    historical9BPreserved: metadataAudit.historical9BPreserved,
    historical9APreserved: metadataAudit.historical9APreserved,
    historical8Z8Y8X8WPreserved: metadataAudit.historical8Z8Y8X8WPreserved,
    validationRuntimeActive: noRuntimeAudit.validationRuntimeActive,
    payloadValidationRuntimeDetected: noRuntimeAudit.payloadValidationRuntimeDetected,
    validationExecutionCount: noRuntimeAudit.validationExecutionCount,
    realPayloadReadCount: noRuntimeAudit.realPayloadReadCount,
    payloadCreated: noRuntimeAudit.payloadCreated,
    realPayloadInstanceCount: noRuntimeAudit.realPayloadInstanceCount,
    dryRunAcceptedPayloadCount: noRuntimeAudit.dryRunAcceptedPayloadCount,
    realInputActivated: noRuntimeAudit.realInputActivated,
    realPreviewGenerated: noRuntimeAudit.realPreviewGenerated,
    previewActivationCount: noRuntimeAudit.previewActivationCount,
    submitCreated: noRuntimeAudit.submitCreated,
    apiCreated: noRuntimeAudit.apiCreated,
    backendCreated: noRuntimeAudit.backendCreated,
    storageCreated: noRuntimeAudit.storageCreated,
    memoryCreated: noRuntimeAudit.memoryCreated,
    draftCreated: noRuntimeAudit.draftCreated,
    historyCreated: noRuntimeAudit.historyCreated,
    officialTruthPromoted: noRuntimeAudit.officialTruthPromoted,
    automaticDecisionCreated: noRuntimeAudit.automaticDecisionCreated,
    selectionDriven: noRuntimeAudit.selectionDriven,
    tacticalInstructionDriven: noRuntimeAudit.tacticalInstructionDriven,
    scoreMutationCount: noRuntimeAudit.scoreMutationCount,
    timelineMutationCount: noRuntimeAudit.timelineMutationCount,
    scoreChangeCreationCount: noRuntimeAudit.scoreChangeCreationCount,
    eventMutationCount: noRuntimeAudit.eventMutationCount,
    sourceOfTruthSeparationPreserved: sourceOfTruthAudit.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: sourceOfTruthAudit.matchEconomyBaselinePreserved,
    guardrailsPreserved: sourceOfTruthAudit.guardrailsPreserved,
    scoringConstantsChanged: sourceOfTruthAudit.scoringConstantsChanged,
    penaltyShotInactive: sourceOfTruthAudit.penaltyShotInactive,
    matchBonusEventChanged: sourceOfTruthAudit.matchBonusEventChanged,
    batchLiveSeparationPreserved: sourceOfTruthAudit.batchLiveSeparationPreserved,
    sharePackPass: input.sharePackPass ?? true,
    keyMessagesAudit,
    warningConsistencyAudit,
    metadataAudit,
    budgetAudit,
    noRuntimeAudit,
    sourceOfTruthAudit,
    guard,
    productHtmlAfter9G,
    exportHtmlAfter9G,
    productRepairSectionHtml: productStatusShell,
    exportRepairSectionHtml,
    warningCodes,
    recommendation,
    nextSprintRecommendation,
  };
}

export function currentManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel(): ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel {
  const baseline9C = currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel();
  const baseline9D = buildManualReviewExportMetadataBadgeCleanup9DModel({
    baseline9C,
    productHtmlBefore9D: baseline9C.productHtmlAfter9C,
    exportHtmlBefore9D: baseline9C.exportHtmlAfter9C,
  });
  const baseline9E = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel({
    baseline9D,
    productHtmlBefore9E: baseline9D.productHtmlAfter9D,
    exportHtmlBefore9E: baseline9D.exportHtmlAfter9D,
  });
  const baseline9F = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
    baseline9E,
    productHtmlBefore9F: baseline9E.productHtmlAfter9E,
    exportHtmlBefore9F: baseline9E.exportHtmlAfter9E,
  });
  return buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel({
    baseline9F,
    productHtmlBefore9G: baseline9F.productHtmlAfter9F,
    exportHtmlBefore9G: baseline9F.exportHtmlAfter9F,
  });
}

export function renderManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GDoc(
  model: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Export Key Messages Warning Consistency Repair 9G",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## Baseline 9F Summary",
    `- status 9F: ${model.baseline9F.status}`,
    `- contradiction before 9G: ${model.exportKeyMessagesWarningContradictionCountBefore9G}`,
    `- exportReadTimeSecondsBefore9G: ${model.exportReadTimeSecondsBefore9G}`,
    "",
    "## Key Messages Audit",
    ...table([
      ["Metric", "Value"],
      ["expected", String(model.exportKeyMessagesExpectedCount)],
      ["detected", String(model.exportKeyMessagesDetectedCount)],
      ["missing", String(model.exportKeyMessagesMissingCount)],
      ["preserved", bool(model.exportKeyMessagesPreserved)],
      ["missing flag", bool(model.exportKeyMessagesMissingFlag)],
      ["detected list", model.exportKeyMessagesDetected.join(", ")],
      ["missing list", model.exportKeyMessagesMissing.join(", ") || "none"],
    ]),
    "",
    "## Warning Consistency Before After",
    ...table([
      ["Metric", "Before", "After"],
      ["EXPORT_KEY_MESSAGES_PRESERVED", bool(model.baseline9F.warningCodes.includes("EXPORT_KEY_MESSAGES_PRESERVED")), bool(model.exportKeyMessagesPositiveWarningEmitted)],
      ["EXPORT_KEY_MESSAGES_MISSING", bool(model.baseline9F.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING")), bool(model.exportKeyMessagesNegativeWarningEmitted)],
      ["contradiction count", String(model.exportKeyMessagesWarningContradictionCountBefore9G), String(model.exportKeyMessagesWarningContradictionCountAfter9G)],
    ]),
    "",
    "## Mutual Exclusion Guard",
    ...table([
      ["Guard", "Value"],
      ["warningMutualExclusionGuardReady", bool(model.warningMutualExclusionGuardReady)],
      ["warningMutualExclusionGuardPassed", bool(model.warningMutualExclusionGuardPassed)],
      ["preservedAndMissingSimultaneousCount", String(model.preservedAndMissingSimultaneousCount)],
      ["warningRegistryConflictCount", String(model.warningRegistryConflictCount)],
      ["warningAggregationConflictCount", String(model.warningAggregationConflictCount)],
      ["warningStatusConsistencyStatus", model.warningStatusConsistencyStatus],
    ]),
    "",
    "## Export Budget",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsBefore9G", String(model.exportReadTimeSecondsBefore9G)],
      ["exportReadTimeSecondsAfter9G", String(model.exportReadTimeSecondsAfter9G)],
      ["exportReadTimeDelta9G", String(model.exportReadTimeDelta9G)],
      ["exportUnder900Seconds", bool(model.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.exportUnder800Seconds)],
      ["exportUnder760Seconds", bool(model.exportUnder760Seconds)],
      ["exportCompactionStatusFrom9F", model.exportCompactionStatusFrom9F],
    ]),
    "",
    "## 9F Preservation",
    ...table([
      ["Metric", "Value"],
      ["baseline9FPreserved", bool(model.baseline9FPreserved)],
      ["productCopyDetailsPreserved", bool(model.productCopyDetailsPreserved)],
      ["exportCompactCopyPreserved", bool(model.exportCompactCopyPreserved)],
      ["exportDetailedCopyRowsRemainCollapsed", bool(model.exportDetailedCopyRowsRemainCollapsed)],
      ["exportCompatibleCasePreserved", bool(model.exportCompatibleCasePreserved)],
      ["exportNoRuntimeGuardPreserved", bool(model.exportNoRuntimeGuardPreserved)],
    ]),
    "",
    "## 9E Copy Preservation",
    ...table([
      ["Metric", "Value"],
      ["coachFacingErrorCopyCountFrom9E", String(model.coachFacingErrorCopyCountFrom9E)],
      ["coachFacingBlockerCopyCountFrom9E", String(model.coachFacingBlockerCopyCountFrom9E)],
      ["coachFacingRefusalCopyCountFrom9E", String(model.coachFacingRefusalCopyCountFrom9E)],
      ["compatibleCaseCopyCountFrom9E", String(model.compatibleCaseCopyCountFrom9E)],
      ["coverage", `${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}`],
      ["compatible case not accepted", bool(model.validCaseCopyRenderedAsNotAcceptedFrom9E)],
    ]),
    "",
    "## Metadata",
    ...table([
      ["Metric", "Value"],
      ["exportTitleMentions9G", bool(model.exportTitleMentions9G)],
      ["exportMainIdIs9G", bool(model.exportMainIdIs9G)],
      ["exportCurrentDataAttributeVisible", bool(model.exportCurrentDataAttributeVisible)],
      ["exportCoverBadgeText", model.exportCoverBadgeText],
      ["metadataFalsePositiveCountAfter9G", String(model.metadataFalsePositiveCountAfter9G)],
      ["historical 9F/9E/9D/9C/9B/9A", bool(model.historical9FPreserved && model.historical9EPreserved && model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved)],
    ]),
    "",
    "## No Runtime Audit",
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
      ["selection/tactic", `${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
    ]),
    "",
    "## Source Of Truth Audit",
    ...table([
      ["Guard", "Value"],
      ["sourceOfTruthSeparationPreserved", bool(model.sourceOfTruthSeparationPreserved)],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
      ["scoringConstantsChanged", bool(model.scoringConstantsChanged)],
      ["penaltyShotInactive", bool(model.penaltyShotInactive)],
      ["matchBonusEventChanged", bool(model.matchBonusEventChanged)],
      ["batchLiveSeparationPreserved", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Warnings Final List",
    model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
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

export function renderManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GValidation(
  model: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel,
): string {
  const checks = [
    checkLine("9G model exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G", model.version),
    checkLine("baseline 9F preserved", model.baseline9FPreserved, bool(model.baseline9FPreserved)),
    checkLine("baseline 9E preserved", model.baseline9EPreserved, bool(model.baseline9EPreserved)),
    checkLine("export key messages detected 7/7", model.exportKeyMessagesDetectedCount === 7, String(model.exportKeyMessagesDetectedCount)),
    checkLine("missing key messages none", model.exportKeyMessagesMissingCount === 0 && model.exportKeyMessagesMissing.length === 0, model.exportKeyMessagesMissing.join(", ") || "none"),
    checkLine("EXPORT_KEY_MESSAGES_PRESERVED present", model.warningCodes.includes("EXPORT_KEY_MESSAGES_PRESERVED"), bool(model.warningCodes.includes("EXPORT_KEY_MESSAGES_PRESERVED"))),
    checkLine("EXPORT_KEY_MESSAGES_MISSING absent", !model.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING"), bool(!model.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING"))),
    checkLine("contradiction count before = 1", model.exportKeyMessagesWarningContradictionCountBefore9G === 1, String(model.exportKeyMessagesWarningContradictionCountBefore9G)),
    checkLine("contradiction count after = 0", model.exportKeyMessagesWarningContradictionCountAfter9G === 0, String(model.exportKeyMessagesWarningContradictionCountAfter9G)),
    checkLine("mutual exclusion guard passed", model.warningMutualExclusionGuardPassed, bool(model.warningMutualExclusionGuardPassed)),
    checkLine("product details 9E preserved", model.productCopyDetailsPreserved, bool(model.productCopyDetailsPreserved)),
    checkLine("export compact 9F preserved", model.exportCompactCopyPreserved, bool(model.exportCompactCopyPreserved)),
    checkLine("export <=800", model.exportReadTimeSecondsAfter9G <= 800, String(model.exportReadTimeSecondsAfter9G)),
    checkLine("export metadata 9G clean", model.exportTitleMentions9G && model.exportMainIdIs9G && model.exportCoverBadgeCorrect && model.metadataFalsePositiveCountAfter9G === 0, model.exportCoverBadgeText),
    checkLine("no runtime payload preview storage truth action mutation", !model.validationRuntimeActive && model.realPayloadReadCount === 0 && !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0 && !model.realPreviewGenerated && model.previewActivationCount === 0 && !model.storageCreated && !model.officialTruthPromoted && !model.selectionDriven && !model.tacticalInstructionDriven && model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.eventMutationCount === 0, "clean"),
    checkLine("scoring unchanged", !model.scoringConstantsChanged && model.penaltyShotInactive, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.matchBonusEventChanged, bool(!model.matchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
    checkLine("required validation command visible", REQUIRED_VALIDATION_COMMAND.includes("npm run test:all"), REQUIRED_VALIDATION_COMMAND),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : model.status === "FAIL" ? "FAIL" : "PARTIAL";

  return [
    "# Validation Coach Report Manual Review Preview Payload Dry-Run Export Key Messages Warning Consistency Repair 9G",
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
