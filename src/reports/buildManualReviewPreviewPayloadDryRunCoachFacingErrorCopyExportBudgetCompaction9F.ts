import { buildManualReviewExportMetadataBadgeCleanup9DModel } from "./buildManualReviewExportMetadataBadgeCleanup9D";
import { currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9C";
import {
  buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
} from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import type {
  ExportCompactionNextSprintRecommendation9F,
  ExportCompactionRecommendation9F,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionStatus9F,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarningCode9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarnings9F";
import { MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F_BLOCKING_WARNINGS } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarnings9F";
import { evaluateManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadata9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadataAudit9F";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyNoRuntime9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyNoRuntimeAudit9F";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyPreservation9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyPreservationAudit9F";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruth9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruthAudit9F";
import { auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWording9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingAudit9F";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

const EXPORT_9E_SECTION_ID = "manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e";
const PRODUCT_9E_SECTION_ID = "manual-review-preview-payload-dry-run-coach-facing-error-copy-9e";

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
  warnings: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarningCode9F[],
): readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarningCode9F[] {
  return [...new Set(warnings)];
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
    if (tag.startsWith("</")) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      return { start: openStart, end: match.index + tag.length };
    }
  }
  return null;
}

function sectionById(html: string, id: string): string {
  const range = findElementRangeById(html, id);
  return range === null ? "" : html.slice(range.start, range.end);
}

function replaceSectionById(html: string, id: string, replacement: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${replacement}` : `${html.slice(0, mainEnd)}${replacement}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.start)}${replacement}${html.slice(range.end)}`;
}

function insertAfterSectionById(html: string, id: string, insertion: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${insertion}` : `${html.slice(0, mainEnd)}${insertion}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.end)}\n${insertion}${html.slice(range.end)}`;
}

function normalizeExportShell9F(exportHtml: string): string {
  let normalized = exportHtml
    .replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9F - error copy compaction</title>")
    .replace(/\bid="compressed-export-[^"]+"/u, 'id="compressed-export-9f"')
    .replace(/Export compact 9E/gu, "Export compact 9F");
  const mainTag = normalized.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"')) {
    normalized = normalized.replace(
      /(<main\b[^>]*)(>)/u,
      '$1 data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"$2',
    );
  }
  return normalized;
}

function renderExportCompactionSection9F(): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f" class="premium-section manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f" data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F">',
    '<p class="eyebrow">Sprint 9F - messages erreur dry-run compactes</p>',
    "<h2>Messages erreur dry-run</h2>",
    '<div class="product-callout">',
    "<p><strong>Copy :</strong> read-only. Source : 9E. 19 erreurs, 12 blockers, 8 refus, 1 cas compatible non accepte.</p>",
    "<p><strong>Couverture :</strong> erreurs 19/19; blockers 12/12; boundary 14/14; refus 8/8.</p>",
    "<p><strong>Messages cles :</strong> source non autorisee; scope incorrect; official truth interdite; stockage/API interdit; mutation score/timeline interdite; automation interdite; engine learning interdit.</p>",
    "<p><strong>Cas compatible :</strong> forme compatible mais non acceptee; aucun payload accepte.</p>",
    "<p><strong>Garde-fou :</strong> aucun runtime, aucun payload reel, aucun payload accepte, aucune preview reelle, aucun submit/API/backend/stockage/memoire, aucune official truth, aucune decision automatique, aucune selection, aucune tactique, aucune mutation score/timeline.</p>",
    "</div>",
    "</section>",
  ].join("\n");
}

function renderProductCompactionSection9F(input: {
  readonly before: number;
  readonly after: number;
  readonly status: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionStatus9F;
  readonly recommendation: ExportCompactionRecommendation9F;
}): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f" class="product-section manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f" data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F">',
    '<p class="eyebrow">Sprint 9F - compaction export sans runtime</p>',
    "<h2>Compaction export des messages d'erreur</h2>",
    '<div class="detail-card-grid">',
    '<article class="detail-card">',
    "<h3>Budget export</h3>",
    `<p>Le temps de lecture export passe de ${input.before}s a ${input.after}s. Statut : ${input.status}.</p>`,
    "</article>",
    '<article class="detail-card">',
    "<h3>Preservation produit</h3>",
    "<p>Les details coach-facing 9E restent visibles dans le rapport produit : erreurs, blockers, refusals et cas compatible non accepte.</p>",
    "</article>",
    '<article class="detail-card">',
    "<h3>Export compact</h3>",
    "<p>L'export garde seulement la synthese, les comptes, les messages cles et les garde-fous no-runtime/no-payload/no-preview.</p>",
    "</article>",
    '<article class="detail-card">',
    "<h3>Recommendation</h3>",
    `<p>${input.recommendation}</p>`,
    "</article>",
    "</div>",
    "</section>",
  ].join("\n");
}

function assertBaseline9EReady(baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel): void {
  if (baseline9E.status === "FAIL") {
    throw new Error("9F requires a non-FAIL 9E coach-facing error copy baseline");
  }
  if (
    baseline9E.coachFacingErrorCopyCount !== 19 ||
    baseline9E.coachFacingBlockerCopyCount !== 12 ||
    baseline9E.coachFacingRefusalCopyCount !== 8 ||
    baseline9E.compatibleCaseCopyCount !== 1
  ) {
    throw new Error("9F requires preserved 9E error copy counts: 19 errors, 12 blockers, 8 refusals, 1 compatible case");
  }
  if (
    baseline9E.validationRuntimeActive ||
    baseline9E.realPayloadReadCount !== 0 ||
    baseline9E.payloadCreated ||
    baseline9E.dryRunAcceptedPayloadCount !== 0 ||
    baseline9E.realPreviewGenerated ||
    baseline9E.previewActivationCount !== 0
  ) {
    throw new Error("9F requires a clean no-runtime/no-payload/no-preview 9E baseline");
  }
}

function statusFromWarnings(input: {
  readonly warnings: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarningCode9F[];
  readonly exportUnder800Seconds: boolean;
  readonly guard: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionStatus9F {
  if (
    input.guard.statusRecommendation === "FAIL" ||
    input.warnings.some((warning) =>
      MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F_BLOCKING_WARNINGS.includes(warning),
    )
  ) {
    return "FAIL";
  }
  if (!input.exportUnder800Seconds) return "PARTIAL";
  return "PASS";
}

function recommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionStatus9F,
): ExportCompactionRecommendation9F {
  if (status === "PASS") return "KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION";
  if (status === "PARTIAL") return "COMPACT_ERROR_COPY_EXPORT_FINAL_PASS";
  return "FIX_ERROR_COPY_EXPORT_BUDGET_SOURCE_OF_TRUTH";
}

function nextSprintRecommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionStatus9F,
): ExportCompactionNextSprintRecommendation9F {
  if (status === "PASS") return "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION";
  if (status === "PARTIAL") return "EXPORT_BUDGET_COMPACTION_FINAL_PASS";
  return "ERROR_COPY_EXPORT_BUDGET_SOURCE_OF_TRUTH_REGRESSION_FIX";
}

export function buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel(input: {
  readonly baseline9E?: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel;
  readonly productHtmlBefore9F?: string;
  readonly exportHtmlBefore9F?: string;
  readonly sharePackPass?: boolean;
} = {}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel {
  const baseline9E = input.baseline9E ?? buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel();
  assertBaseline9EReady(baseline9E);
  const productBefore = input.productHtmlBefore9F ?? baseline9E.productHtmlAfter9E;
  const exportBefore = input.exportHtmlBefore9F ?? baseline9E.exportHtmlAfter9E;
  const exportSectionBefore = sectionById(exportBefore, EXPORT_9E_SECTION_ID);
  const exportCompactionSectionHtml = renderExportCompactionSection9F();
  const exportHtmlAfter9F = normalizeExportShell9F(
    replaceSectionById(exportBefore, EXPORT_9E_SECTION_ID, exportCompactionSectionHtml),
  );
  const budgetAuditBeforeProduct = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9F({
    productHtmlAfter9F: productBefore,
    exportHtmlBefore9F: exportBefore,
    exportHtmlAfter9F,
    exportSectionBefore9F: exportSectionBefore,
    exportSectionAfter9F: exportCompactionSectionHtml,
  });
  const provisionalRecommendation = budgetAuditBeforeProduct.recommendation;
  const provisionalStatus: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionStatus9F =
    budgetAuditBeforeProduct.exportUnder800Seconds ? "PASS" : budgetAuditBeforeProduct.exportUnder900Seconds ? "PARTIAL" : "FAIL";
  const productCompactionSectionHtml = renderProductCompactionSection9F({
    before: budgetAuditBeforeProduct.exportReadTimeSecondsBefore9F,
    after: budgetAuditBeforeProduct.exportReadTimeSecondsAfter9F,
    status: provisionalStatus,
    recommendation: provisionalRecommendation,
  });
  const productHtmlAfter9F = insertAfterSectionById(productBefore, PRODUCT_9E_SECTION_ID, productCompactionSectionHtml);
  const budgetAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9F({
    productHtmlAfter9F,
    exportHtmlBefore9F: exportBefore,
    exportHtmlAfter9F,
    exportSectionBefore9F: exportSectionBefore,
    exportSectionAfter9F: exportCompactionSectionHtml,
  });
  const preservationAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyPreservation9F({
    baseline9E,
    productHtmlAfter9F,
    exportHtmlAfter9F,
  });
  const metadataAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadata9F(exportHtmlAfter9F);
  const noRuntimeAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyNoRuntime9F(baseline9E);
  const sourceOfTruthAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruth9F({
    baseline9E,
    productHtmlAfter9F,
    exportHtmlAfter9F,
  });
  const wordingAudit = auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWording9F({
    exportHtmlAfter9F,
  });
  const preliminaryWarnings = uniqueWarnings([
    ...budgetAudit.budgetWarningCodes,
    ...preservationAudit.preservationWarningCodes,
    ...metadataAudit.metadataWarningCodes,
    ...noRuntimeAudit.noRuntimeWarningCodes,
    ...sourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...wordingAudit.wordingWarningCodes,
  ]);
  const guard = evaluateManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F({
    exportReadTimeSecondsAfter9F: budgetAudit.exportReadTimeSecondsAfter9F,
    productCopyDetailsPreserved: preservationAudit.productCopyDetailsPreserved,
    exportCopySummaryPreserved: preservationAudit.exportCopySummaryPreserved,
    exportCompatibleCasePreserved: preservationAudit.exportCompatibleCasePreserved,
    exportNoRuntimeGuardPreserved: preservationAudit.exportNoRuntimeGuardPreserved,
    exportNoPayloadAcceptedGuardPreserved: preservationAudit.exportNoPayloadAcceptedGuardPreserved,
    exportNoPreviewGuardPreserved: preservationAudit.exportNoPreviewGuardPreserved,
    coachFacingErrorCopyCountFrom9E: preservationAudit.coachFacingErrorCopyCountFrom9E,
    coachFacingBlockerCopyCountFrom9E: preservationAudit.coachFacingBlockerCopyCountFrom9E,
    coachFacingRefusalCopyCountFrom9E: preservationAudit.coachFacingRefusalCopyCountFrom9E,
    scoringConstantsChanged: sourceOfTruthAudit.scoringConstantsChanged,
    matchBonusEventChanged: sourceOfTruthAudit.matchBonusEventChanged,
    exportTitleMentions9F: metadataAudit.exportTitleMentions9F,
    exportMainIdIs9F: metadataAudit.exportMainIdIs9F,
    exportCoverBadgeCorrect: metadataAudit.exportCoverBadgeCorrect,
    metadataFalsePositiveCountAfter9F: metadataAudit.metadataFalsePositiveCountAfter9F,
  });
  const warningCodes = uniqueWarnings([...preliminaryWarnings, ...guard.violations]);
  const status = statusFromWarnings({
    warnings: warningCodes,
    exportUnder800Seconds: budgetAudit.exportUnder800Seconds,
    guard,
  });
  const recommendation = recommendationFromStatus(status);
  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_9E",
    matchId: baseline9E.matchId,
    officialScore: baseline9E.officialScore,
    baseline9E,
    baseline9EPreserved: baseline9E.status !== "FAIL",
    baseline9DPreserved: baseline9E.baseline9DPreserved,
    baseline9CPreserved: baseline9E.baseline9CPreserved,
    baseline9BPreserved: baseline9E.baseline9BPreserved,
    baseline9APreserved: baseline9E.baseline9APreserved,
    baseline8ZPreserved: baseline9E.baseline8ZPreserved,
    baseline8YPreserved: baseline9E.baseline8YPreserved,
    baseline8XPreserved: baseline9E.baseline8XPreserved,
    baseline8WPreserved: baseline9E.baseline8WPreserved,
    baseline8VPreserved: baseline9E.baseline8VPreserved,
    baseline8UPreserved: baseline9E.baseline8UPreserved,
    baseline8TPreserved: baseline9E.baseline8TPreserved,
    baseline8SPreserved: baseline9E.baseline8SPreserved,
    baseline8RPreserved: baseline9E.baseline8RPreserved,
    baseline8QPreserved: baseline9E.baseline8QPreserved,
    baseline8PPreserved: baseline9E.baseline8PPreserved,
    baseline8OPreserved: baseline9E.baseline8OPreserved,
    baseline8NPreserved: baseline9E.baseline8NPreserved,
    baseline8MPreserved: baseline9E.baseline8MPreserved,
    baseline8LPreserved: baseline9E.baseline8LPreserved,
    baseline8KPreserved: baseline9E.baseline8KPreserved,
    baseline8IPreserved: baseline9E.baseline8IPreserved,
    baseline8HPreserved: baseline9E.baseline8HPreserved,
    baseline8GPreserved: baseline9E.baseline8GPreserved,
    baseline8FPreserved: baseline9E.baseline8FPreserved,
    baseline8EPreserved: baseline9E.baseline8EPreserved,
    baseline8DPreserved: baseline9E.baseline8DPreserved,
    baseline8CPreserved: baseline9E.baseline8CPreserved,
    baseline8BPreserved: baseline9E.baseline8BPreserved,
    baseline8APreserved: baseline9E.baseline8APreserved,
    baseline7HPreserved: baseline9E.baseline7HPreserved,
    baseline6XPreserved: baseline9E.baseline6XPreserved,
    errorCopyExportCompactionReady: budgetAudit.errorCopyExportCompactionReady,
    productErrorCopyStillVisible: budgetAudit.productErrorCopyStillVisible,
    exportErrorCopyStillVisible: budgetAudit.exportErrorCopyStillVisible,
    exportErrorCopyCompactedVisible: budgetAudit.exportErrorCopyCompactedVisible,
    exportErrorCopySectionBeforeSeconds: budgetAudit.exportErrorCopySectionBeforeSeconds,
    exportErrorCopySectionAfterSeconds: budgetAudit.exportErrorCopySectionAfterSeconds,
    exportErrorCopySectionSecondsDelta: budgetAudit.exportErrorCopySectionSecondsDelta,
    exportReadTimeSecondsBefore9F: budgetAudit.exportReadTimeSecondsBefore9F,
    exportReadTimeSecondsAfter9F: budgetAudit.exportReadTimeSecondsAfter9F,
    exportReadTimeDelta9F: budgetAudit.exportReadTimeDelta9F,
    exportUnder900Seconds: budgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: budgetAudit.exportUnder800Seconds,
    exportUnder760Seconds: budgetAudit.exportUnder760Seconds,
    exportUnder900BooleanCorrect: budgetAudit.exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect: budgetAudit.exportUnder800BooleanCorrect,
    exportUnder760BooleanCorrect: budgetAudit.exportUnder760BooleanCorrect,
    exportBudgetRiskBefore9F: budgetAudit.exportBudgetRiskBefore9F,
    exportBudgetRiskAfter9F: budgetAudit.exportBudgetRiskAfter9F,
    exportBudgetPassStrongEligible: budgetAudit.exportBudgetPassStrongEligible,
    exportCompactionStatus: budgetAudit.exportCompactionStatus,
    expectedExportCompactionStatus: budgetAudit.expectedExportCompactionStatus,
    exportCompactionStatusCorrect: budgetAudit.exportCompactionStatusCorrect,
    coachFacingErrorCopyCountFrom9E: preservationAudit.coachFacingErrorCopyCountFrom9E,
    coachFacingBlockerCopyCountFrom9E: preservationAudit.coachFacingBlockerCopyCountFrom9E,
    coachFacingRefusalCopyCountFrom9E: preservationAudit.coachFacingRefusalCopyCountFrom9E,
    compatibleCaseCopyCountFrom9E: preservationAudit.compatibleCaseCopyCountFrom9E,
    wordingReadabilityScoreFrom9E: preservationAudit.wordingReadabilityScoreFrom9E,
    validCaseCopyRenderedAsNotAcceptedFrom9E: preservationAudit.validCaseCopyRenderedAsNotAcceptedFrom9E,
    errorCopyCoverageStillCompleteFrom9E: preservationAudit.errorCopyCoverageStillCompleteFrom9E,
    errorCopyErrorCoverageCountFrom9E: preservationAudit.errorCopyErrorCoverageCountFrom9E,
    errorCopyBlockerCoverageCountFrom9E: preservationAudit.errorCopyBlockerCoverageCountFrom9E,
    errorCopyBoundaryGuardCoverageCountFrom9E: preservationAudit.errorCopyBoundaryGuardCoverageCountFrom9E,
    errorCopyRefusalStateCoverageCountFrom9E: preservationAudit.errorCopyRefusalStateCoverageCountFrom9E,
    productCopyDetailsPreserved: preservationAudit.productCopyDetailsPreserved,
    exportCopySummaryPreserved: preservationAudit.exportCopySummaryPreserved,
    exportDetailedCopyRowsRemovedOrCollapsed: preservationAudit.exportDetailedCopyRowsRemovedOrCollapsed,
    exportKeyMessagesPreserved: preservationAudit.exportKeyMessagesPreserved,
    exportCompatibleCasePreserved: preservationAudit.exportCompatibleCasePreserved,
    exportNoRuntimeGuardPreserved: preservationAudit.exportNoRuntimeGuardPreserved,
    exportNoPayloadAcceptedGuardPreserved: preservationAudit.exportNoPayloadAcceptedGuardPreserved,
    exportNoPreviewGuardPreserved: preservationAudit.exportNoPreviewGuardPreserved,
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
    exportTitleMentions9F: metadataAudit.exportTitleMentions9F,
    exportMainIdIs9F: metadataAudit.exportMainIdIs9F,
    exportMainCurrentVersionVisible: metadataAudit.exportMainCurrentVersionVisible,
    exportCurrentDataAttributeVisible: metadataAudit.exportCurrentDataAttributeVisible,
    exportCoverBadgeText: metadataAudit.exportCoverBadgeText,
    exportCoverBadgeExpectedText: metadataAudit.exportCoverBadgeExpectedText,
    exportCoverBadgeCorrect: metadataAudit.exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount: metadataAudit.exportCoverBadgeStaleVersionCount,
    metadataFalsePositiveCountAfter9F: metadataAudit.metadataFalsePositiveCountAfter9F,
    bodyMentionFallbackUsedForCoverBadge: metadataAudit.bodyMentionFallbackUsedForCoverBadge,
    historical9EPreserved: metadataAudit.historical9EPreserved,
    historical9DPreserved: metadataAudit.historical9DPreserved,
    historical9CPreserved: metadataAudit.historical9CPreserved,
    historical9BPreserved: metadataAudit.historical9BPreserved,
    historical9APreserved: metadataAudit.historical9APreserved,
    historical8Z8Y8X8WPreserved: metadataAudit.historical8Z8Y8X8WPreserved,
    sourceOfTruthSeparationPreserved: sourceOfTruthAudit.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: sourceOfTruthAudit.matchEconomyBaselinePreserved,
    guardrailsPreserved: sourceOfTruthAudit.sourceOfTruthSeparationPreserved && sourceOfTruthAudit.matchEconomyBaselinePreserved,
    scoringConstantsChanged: sourceOfTruthAudit.scoringConstantsChanged,
    penaltyShotInactive: sourceOfTruthAudit.penaltyShotInactive,
    matchBonusEventChanged: sourceOfTruthAudit.matchBonusEventChanged,
    batchLiveSeparationPreserved: sourceOfTruthAudit.batchLiveSeparationPreserved,
    sharePackPass: input.sharePackPass ?? true,
    budgetAudit,
    preservationAudit,
    metadataAudit,
    noRuntimeAudit,
    sourceOfTruthAudit,
    wordingAudit,
    guard,
    productHtmlAfter9F,
    exportHtmlAfter9F,
    productCompactionSectionHtml,
    exportCompactionSectionHtml,
    warningCodes,
    recommendation,
    nextSprintRecommendation: nextSprintRecommendationFromStatus(status),
  };
}

export function currentManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel(): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel {
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
  return buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
    baseline9E,
    productHtmlBefore9F: baseline9E.productHtmlAfter9E,
    exportHtmlBefore9F: baseline9E.exportHtmlAfter9E,
  });
}

export function renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FDoc(
  model: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Coach-Facing Error Copy Export Budget Compaction 9F",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## Baseline 9E Summary",
    `- status 9E: ${model.baseline9E.status}`,
    `- export read time before 9F: ${model.exportReadTimeSecondsBefore9F}`,
    `- error copy count from 9E: ${model.coachFacingErrorCopyCountFrom9E}`,
    "",
    "## Export Budget Compaction",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsBefore9F", String(model.exportReadTimeSecondsBefore9F)],
      ["exportReadTimeSecondsAfter9F", String(model.exportReadTimeSecondsAfter9F)],
      ["exportReadTimeDelta9F", String(model.exportReadTimeDelta9F)],
      ["exportErrorCopySectionBeforeSeconds", String(model.exportErrorCopySectionBeforeSeconds)],
      ["exportErrorCopySectionAfterSeconds", String(model.exportErrorCopySectionAfterSeconds)],
      ["exportUnder900Seconds", bool(model.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.exportUnder800Seconds)],
      ["exportUnder760Seconds", bool(model.exportUnder760Seconds)],
      ["exportCompactionStatus", model.exportCompactionStatus],
      ["expectedExportCompactionStatus", model.expectedExportCompactionStatus],
    ]),
    "",
    "## 9E Copy Preservation",
    ...table([
      ["Metric", "Value"],
      ["coachFacingErrorCopyCountFrom9E", String(model.coachFacingErrorCopyCountFrom9E)],
      ["coachFacingBlockerCopyCountFrom9E", String(model.coachFacingBlockerCopyCountFrom9E)],
      ["coachFacingRefusalCopyCountFrom9E", String(model.coachFacingRefusalCopyCountFrom9E)],
      ["compatibleCaseCopyCountFrom9E", String(model.compatibleCaseCopyCountFrom9E)],
      ["error coverage", `${model.errorCopyErrorCoverageCountFrom9E}/19`],
      ["blocker coverage", `${model.errorCopyBlockerCoverageCountFrom9E}/12`],
      ["boundary coverage", `${model.errorCopyBoundaryGuardCoverageCountFrom9E}/14`],
      ["refusal coverage", `${model.errorCopyRefusalStateCoverageCountFrom9E}/8`],
      ["product details preserved", bool(model.productCopyDetailsPreserved)],
      ["export summary preserved", bool(model.exportCopySummaryPreserved)],
      ["detailed export rows collapsed", bool(model.exportDetailedCopyRowsRemovedOrCollapsed)],
      ["compatible case preserved", bool(model.exportCompatibleCasePreserved)],
    ]),
    "",
    "## Export Metadata",
    ...table([
      ["Metric", "Value"],
      ["title mentions 9F", bool(model.exportTitleMentions9F)],
      ["main id compressed-export-9f", bool(model.exportMainIdIs9F)],
      ["current data attribute 9F", bool(model.exportCurrentDataAttributeVisible)],
      ["cover badge", model.exportCoverBadgeText],
      ["metadata false positives", String(model.metadataFalsePositiveCountAfter9F)],
      ["historical 9E preserved", bool(model.historical9EPreserved)],
      ["historical 9D/9C/9B/9A preserved", bool(model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved)],
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
      ["selection/tactic", `${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
      ["scoringConstantsChanged", bool(model.scoringConstantsChanged)],
      ["penaltyShotInactive", bool(model.penaltyShotInactive)],
      ["matchBonusEventChanged", bool(model.matchBonusEventChanged)],
      ["batchLiveSeparationPreserved", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Compaction Guard",
    ...table([
      ["Guard", "Value"],
      ["compactionAllowed", bool(model.guard.compactionAllowed)],
      ["exportBudgetPassed", bool(model.guard.exportBudgetPassed)],
      ["exportBudgetPassStrongEligible", bool(model.guard.exportBudgetPassStrongEligible)],
      ["productDetailsPreserved", bool(model.guard.productDetailsPreserved)],
      ["exportSummaryPreserved", bool(model.guard.exportSummaryPreserved)],
      ["noRuntimePreserved", bool(model.guard.noRuntimePreserved)],
      ["metadataCurrentVersionClean", bool(model.guard.metadataCurrentVersionClean)],
      ["violations", model.guard.violations.join(", ") || "none"],
    ]),
    "",
    "## Warnings",
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

export function renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FValidation(
  model: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
): string {
  const checks = [
    checkLine("ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F", model.version),
    checkLine("baseline 9E preserved", model.baseline9EPreserved, bool(model.baseline9EPreserved)),
    checkLine("baseline 9D/9C/9B/9A preserved", model.baseline9DPreserved && model.baseline9CPreserved && model.baseline9BPreserved && model.baseline9APreserved, "preserved"),
    checkLine("exportReadTimeSecondsBefore9F is measured", model.exportReadTimeSecondsBefore9F > model.exportReadTimeSecondsAfter9F, String(model.exportReadTimeSecondsBefore9F)),
    checkLine("exportReadTimeSecondsAfter9F <= 900", model.exportReadTimeSecondsAfter9F <= 900, String(model.exportReadTimeSecondsAfter9F)),
    checkLine("exportReadTimeSecondsAfter9F <= 800", model.exportReadTimeSecondsAfter9F <= 800, String(model.exportReadTimeSecondsAfter9F)),
    checkLine("exportUnder900Seconds boolean correct", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds boolean correct", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("9E product details preserved", model.productCopyDetailsPreserved, bool(model.productCopyDetailsPreserved)),
    checkLine("9F export compact section visible", model.exportErrorCopyCompactedVisible, bool(model.exportErrorCopyCompactedVisible)),
    checkLine("9E export detailed blocker/refusal rows removed from export", model.exportDetailedCopyRowsRemovedOrCollapsed, bool(model.exportDetailedCopyRowsRemovedOrCollapsed)),
    checkLine("error copy counts preserved from 9E", model.coachFacingErrorCopyCountFrom9E === 19 && model.coachFacingBlockerCopyCountFrom9E === 12 && model.coachFacingRefusalCopyCountFrom9E === 8, `${model.coachFacingErrorCopyCountFrom9E}/${model.coachFacingBlockerCopyCountFrom9E}/${model.coachFacingRefusalCopyCountFrom9E}`),
    checkLine("coverage counts preserved from 9E", model.errorCopyErrorCoverageCountFrom9E === 19 && model.errorCopyBlockerCoverageCountFrom9E === 12 && model.errorCopyBoundaryGuardCoverageCountFrom9E === 14 && model.errorCopyRefusalStateCoverageCountFrom9E === 8, `${model.errorCopyErrorCoverageCountFrom9E}/${model.errorCopyBlockerCoverageCountFrom9E}/${model.errorCopyBoundaryGuardCoverageCountFrom9E}/${model.errorCopyRefusalStateCoverageCountFrom9E}`),
    checkLine("compatible case remains not accepted", model.exportCompatibleCasePreserved && model.validCaseCopyRenderedAsNotAcceptedFrom9E, bool(model.exportCompatibleCasePreserved)),
    checkLine("export no-runtime guard preserved", model.exportNoRuntimeGuardPreserved, bool(model.exportNoRuntimeGuardPreserved)),
    checkLine("export no-payload-accepted guard preserved", model.exportNoPayloadAcceptedGuardPreserved, bool(model.exportNoPayloadAcceptedGuardPreserved)),
    checkLine("export no-preview guard preserved", model.exportNoPreviewGuardPreserved, bool(model.exportNoPreviewGuardPreserved)),
    checkLine("no validation runtime active", !model.validationRuntimeActive && model.validationExecutionCount === 0, `${bool(model.validationRuntimeActive)}/${model.validationExecutionCount}`),
    checkLine("no real payload read or created", model.realPayloadReadCount === 0 && !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0, `${model.realPayloadReadCount}/${bool(model.payloadCreated)}/${model.dryRunAcceptedPayloadCount}`),
    checkLine("no real preview generated or activated", !model.realPreviewGenerated && model.previewActivationCount === 0, `${bool(model.realPreviewGenerated)}/${model.previewActivationCount}`),
    checkLine("no submit/api/backend/storage/memory created", !model.submitCreated && !model.apiCreated && !model.backendCreated && !model.storageCreated && !model.memoryCreated, "false"),
    checkLine("no official truth, selection, tactic, score, or timeline mutation", !model.officialTruthPromoted && !model.selectionDriven && !model.tacticalInstructionDriven && model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.scoreChangeCreationCount === 0 && model.eventMutationCount === 0, "clean"),
    checkLine("export title mentions 9F", model.exportTitleMentions9F, bool(model.exportTitleMentions9F)),
    checkLine("export main id is compressed-export-9f", model.exportMainIdIs9F, bool(model.exportMainIdIs9F)),
    checkLine("export current data attribute is 9F", model.exportCurrentDataAttributeVisible, bool(model.exportCurrentDataAttributeVisible)),
    checkLine("export cover badge is Export compact 9F", model.exportCoverBadgeText === "Export compact 9F", model.exportCoverBadgeText),
    checkLine("historical 9E/9D/9C/9B/9A attrs preserved", model.historical9EPreserved && model.historical9DPreserved && model.historical9CPreserved && model.historical9BPreserved && model.historical9APreserved, "preserved"),
    checkLine("metadata false positives after 9F = 0", model.metadataFalsePositiveCountAfter9F === 0, String(model.metadataFalsePositiveCountAfter9F)),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, bool(model.scoringConstantsChanged)),
    checkLine("PENALTY_SHOT inactive", model.penaltyShotInactive, bool(model.penaltyShotInactive)),
    checkLine("MatchBonusEvent unchanged", !model.matchBonusEventChanged, bool(model.matchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("compaction guard PASS", model.guard.statusRecommendation === "PASS", model.guard.statusRecommendation),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Manual Review Preview Payload Dry-Run Coach-Facing Error Copy Export Budget Compaction 9F",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- exportReadTimeSecondsBefore9F: ${model.exportReadTimeSecondsBefore9F}`,
    `- exportReadTimeSecondsAfter9F: ${model.exportReadTimeSecondsAfter9F}`,
    `- exportReadTimeDelta9F: ${model.exportReadTimeDelta9F}`,
    `- coachFacingErrorCopyCountFrom9E: ${model.coachFacingErrorCopyCountFrom9E}`,
    `- coachFacingBlockerCopyCountFrom9E: ${model.coachFacingBlockerCopyCountFrom9E}`,
    `- coachFacingRefusalCopyCountFrom9E: ${model.coachFacingRefusalCopyCountFrom9E}`,
    `- compatibleCaseCopyCountFrom9E: ${model.compatibleCaseCopyCountFrom9E}`,
    `- noRuntimeViolationCount: ${model.guard.violations.length}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
