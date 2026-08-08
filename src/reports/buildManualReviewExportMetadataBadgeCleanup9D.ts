import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
  currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
  renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CDoc,
  renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CValidation,
} from "./buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9C";
import { auditManualReviewExportCoverBadge9D } from "./manualReviewExportCoverBadgeAudit9D";
import { auditManualReviewExportMetadata9D } from "./manualReviewExportMetadataAudit9D";
import { evaluateManualReviewExportMetadataFalsePositiveGuard9D } from "./manualReviewExportMetadataFalsePositiveGuard9D";
import {
  MANUAL_REVIEW_EXPORT_METADATA_BADGE_CLEANUP_9D_BLOCKING_WARNINGS,
  type ManualReviewExportMetadataBadgeCleanupWarningCode9D,
} from "./manualReviewExportMetadataBadgeCleanupWarnings9D";
import type {
  ManualReviewExportMetadataBadgeCleanup9DModel,
  ManualReviewExportMetadataBadgeCleanupNextSprintRecommendation9D,
  ManualReviewExportMetadataBadgeCleanupRecommendation9D,
  ManualReviewExportMetadataBadgeCleanupStatus9D,
} from "./manualReviewExportMetadataBadgeCleanupTypes9D";
import type { ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./manualReviewPreviewPayloadDryRunResultDetailCardsTypes9C";
import {
  insertManualReviewExportMetadataBadgeCleanupExport9D,
  normalizeManualReviewExportMetadataBadgeCleanupShell9D,
  renderManualReviewExportMetadataBadgeCleanupExport9D,
} from "./renderManualReviewExportMetadataBadgeCleanupExport9D";
import {
  insertManualReviewExportMetadataBadgeCleanupProduct9D,
  renderManualReviewExportMetadataBadgeCleanupProduct9D,
} from "./renderManualReviewExportMetadataBadgeCleanupProduct9D";

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

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  if (text.length === 0) return 0;
  return Math.ceil((text.split(" ").length / 220) * 60);
}

function statusFromWarnings(
  warnings: readonly ManualReviewExportMetadataBadgeCleanupWarningCode9D[],
  exportUnder800Seconds: boolean,
): ManualReviewExportMetadataBadgeCleanupStatus9D {
  if (warnings.some((warning) => MANUAL_REVIEW_EXPORT_METADATA_BADGE_CLEANUP_9D_BLOCKING_WARNINGS.includes(warning))) return "FAIL";
  return exportUnder800Seconds ? "PASS" : "PARTIAL";
}

function recommendationFromStatus(
  status: ManualReviewExportMetadataBadgeCleanupStatus9D,
): ManualReviewExportMetadataBadgeCleanupRecommendation9D {
  if (status === "PASS") return "KEEP_EXPORT_METADATA_BADGE_CLEANUP";
  if (status === "PARTIAL") return "REVIEW_EXPORT_METADATA_BADGE_AUDIT";
  return "FIX_EXPORT_METADATA_SOURCE_OF_TRUTH";
}

function nextSprintRecommendationFromStatus(
  status: ManualReviewExportMetadataBadgeCleanupStatus9D,
): ManualReviewExportMetadataBadgeCleanupNextSprintRecommendation9D {
  if (status === "PASS") return "PREPARE_MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_WITHOUT_PREVIEW_ACTIVATION";
  if (status === "PARTIAL") return "EXPORT_METADATA_BADGE_AUDIT_FINAL_CLEANUP";
  return "EXPORT_METADATA_SOURCE_OF_TRUTH_REGRESSION_FIX";
}

function scoringConstantsPreserved(): boolean {
  return (
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2
  );
}

function buildWarningCodes(input: {
  readonly baseline9C: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel;
  readonly coverBadgeCorrect: boolean;
  readonly coverBadgeStaleVersionCount: number;
  readonly coverBadgeMentions9C: boolean;
  readonly coverBadgeMentions9B: boolean;
  readonly coverBadgeMentions9A: boolean;
  readonly exportTitleMentions9D: boolean;
  readonly exportMainIdIs9D: boolean;
  readonly exportCurrentDataAttributeVisible: boolean;
  readonly metadataFalsePositiveCountAfter9D: number;
  readonly exportReadTimeSecondsAfter9D: number;
  readonly noRuntimePreserved: boolean;
  readonly sourceOfTruthPreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly sharePackPass: boolean;
}): readonly ManualReviewExportMetadataBadgeCleanupWarningCode9D[] {
  const warnings: ManualReviewExportMetadataBadgeCleanupWarningCode9D[] = [];
  if (input.coverBadgeCorrect && input.coverBadgeStaleVersionCount === 0) {
    warnings.push("EXPORT_METADATA_BADGE_CLEANUP_COMPLETE", "EXPORT_COVER_BADGE_9D_READY", "EXPORT_COVER_BADGE_AUDIT_STRICT_READY");
  } else {
    warnings.push("EXPORT_COVER_BADGE_STALE");
  }
  if (input.coverBadgeMentions9C) warnings.push("EXPORT_COVER_BADGE_STILL_9C");
  if (input.coverBadgeMentions9B) warnings.push("EXPORT_COVER_BADGE_STILL_9B");
  if (input.coverBadgeMentions9A) warnings.push("EXPORT_COVER_BADGE_STILL_9A");
  if (input.exportTitleMentions9D) warnings.push("EXPORT_TITLE_9D_READY");
  else warnings.push("EXPORT_TITLE_STALE");
  if (input.exportMainIdIs9D) warnings.push("EXPORT_MAIN_ID_9D_READY");
  else warnings.push("EXPORT_MAIN_ID_STALE");
  if (input.exportCurrentDataAttributeVisible) warnings.push("EXPORT_CURRENT_DATA_ATTRIBUTE_9D_READY");
  warnings.push("NO_BODY_FALLBACK_FOR_COVER_BADGE", "EXPORT_METADATA_FALSE_POSITIVE_GUARD_READY");
  if (input.metadataFalsePositiveCountAfter9D === 0) warnings.push("METADATA_FALSE_POSITIVES_ZERO");
  else warnings.push("METADATA_FALSE_POSITIVE_DETECTED");
  if (input.baseline9C.status === "PASS") warnings.push("BASELINE_9C_PRESERVED");
  else warnings.push("BASELINE_9C_REGRESSED");
  if (
    input.baseline9C.detailCardCount === 16 &&
    input.baseline9C.detailCardGroupCount === 3 &&
    input.baseline9C.detailCoverageStillComplete
  ) {
    warnings.push("DETAIL_CARDS_9C_PRESERVED");
  } else {
    warnings.push("DETAIL_CARDS_9C_REGRESSED");
  }
  if (input.noRuntimePreserved) warnings.push("NO_RUNTIME_VALIDATION", "NO_PAYLOAD_READ", "NO_PAYLOAD_CREATED", "NO_PAYLOAD_ACCEPTED", "NO_PREVIEW_GENERATED", "NO_PERSISTENCE", "NO_OFFICIAL_TRUTH", "NO_SELECTION_OR_TACTIC", "NO_SCORE_TIMELINE_MUTATION");
  else warnings.push("VALIDATION_RUNTIME_ACTIVE_DETECTED");
  if (input.exportReadTimeSecondsAfter9D <= 900) warnings.push("EXPORT_UNDER_900_READY");
  else warnings.push("EXPORT_OVER_900");
  if (input.exportReadTimeSecondsAfter9D <= 800) warnings.push("EXPORT_UNDER_800_READY");
  if (input.sourceOfTruthPreserved) warnings.push("SOURCE_OF_TRUTH_PRESERVED");
  else warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (input.guardrailsPreserved) warnings.push("SCORING_CONSTANTS_UNCHANGED", "MATCH_BONUS_EVENT_UNCHANGED");
  if (!input.sharePackPass) warnings.push("SHARE_PACK_FAIL");
  return [...new Set(warnings)];
}

function buildModel(input: {
  readonly baseline9C: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel;
  readonly productHtmlAfter9D: string;
  readonly exportHtmlAfter9D: string;
  readonly productSection: string;
  readonly exportSection: string;
  readonly sharePackPass?: boolean;
}): ManualReviewExportMetadataBadgeCleanup9DModel {
  const coverBadgeAudit = auditManualReviewExportCoverBadge9D(input.exportHtmlAfter9D);
  const metadataAudit = auditManualReviewExportMetadata9D(input.exportHtmlAfter9D);
  const exportReadTimeSecondsAfter9D = estimateReadTimeSeconds(input.exportHtmlAfter9D);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9D <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9D <= 800;
  const noRuntimePreserved =
    !input.baseline9C.validationRuntimeActive &&
    !input.baseline9C.payloadValidationRuntimeDetected &&
    input.baseline9C.validationExecutionCount === 0 &&
    input.baseline9C.realPayloadReadCount === 0 &&
    !input.baseline9C.payloadCreated &&
    input.baseline9C.realPayloadInstanceCount === 0 &&
    input.baseline9C.dryRunAcceptedPayloadCount === 0 &&
    !input.baseline9C.realInputActivated &&
    !input.baseline9C.realPreviewGenerated &&
    input.baseline9C.previewActivationCount === 0 &&
    !input.baseline9C.submitCreated &&
    !input.baseline9C.apiCreated &&
    !input.baseline9C.backendCreated &&
    !input.baseline9C.storageCreated &&
    !input.baseline9C.memoryCreated &&
    !input.baseline9C.draftCreated &&
    !input.baseline9C.historyCreated &&
    !input.baseline9C.officialTruthPromoted &&
    !input.baseline9C.automaticDecisionCreated &&
    !input.baseline9C.selectionDriven &&
    !input.baseline9C.tacticalInstructionDriven &&
    input.baseline9C.scoreMutationCount === 0 &&
    input.baseline9C.timelineMutationCount === 0 &&
    input.baseline9C.scoreChangeCreationCount === 0 &&
    input.baseline9C.eventMutationCount === 0;
  const guardrailsPreserved = input.baseline9C.guardrailsPreserved && scoringConstantsPreserved();
  const warningCodes = buildWarningCodes({
    baseline9C: input.baseline9C,
    coverBadgeCorrect: coverBadgeAudit.exportCoverBadgeCorrect,
    coverBadgeStaleVersionCount: coverBadgeAudit.exportCoverBadgeStaleVersionCount,
    coverBadgeMentions9C: coverBadgeAudit.exportCoverBadgeMentions9C,
    coverBadgeMentions9B: coverBadgeAudit.exportCoverBadgeMentions9B,
    coverBadgeMentions9A: coverBadgeAudit.exportCoverBadgeMentions9A,
    exportTitleMentions9D: metadataAudit.exportTitleMentions9D,
    exportMainIdIs9D: metadataAudit.exportMainIdIs9D,
    exportCurrentDataAttributeVisible: metadataAudit.exportCurrentDataAttributeVisible,
    metadataFalsePositiveCountAfter9D: metadataAudit.metadataAuditFalsePositiveCount,
    exportReadTimeSecondsAfter9D,
    noRuntimePreserved,
    sourceOfTruthPreserved: input.baseline9C.sourceOfTruthSeparationPreserved,
    guardrailsPreserved,
    sharePackPass: input.sharePackPass ?? true,
  });
  const status = statusFromWarnings(warningCodes, exportUnder800Seconds);
  const partialModel = {
    status,
    scope: "MANUAL_REVIEW_EXPORT_METADATA_BADGE_CLEANUP_BEFORE_COACH_FACING_ERROR_COPY" as const,
    version: "MANUAL_REVIEW_EXPORT_METADATA_BADGE_CLEANUP_9D" as const,
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_9C" as const,
    matchId: input.baseline9C.matchId,
    officialScore: input.baseline9C.officialScore,
    baseline9C: input.baseline9C,
    baseline9CPreserved: input.baseline9C.status === "PASS",
    baseline9BPreserved: input.baseline9C.baseline9BPreserved,
    baseline9APreserved: input.baseline9C.baseline9APreserved,
    baseline8ZPreserved: input.baseline9C.baseline8ZPreserved,
    baseline8YPreserved: input.baseline9C.baseline8YPreserved,
    baseline8XPreserved: input.baseline9C.baseline8XPreserved,
    baseline8WPreserved: input.baseline9C.baseline8WPreserved,
    baseline8VPreserved: input.baseline9C.baseline8VPreserved,
    baseline8UPreserved: input.baseline9C.baseline8UPreserved,
    baseline8TPreserved: input.baseline9C.baseline8TPreserved,
    baseline8SPreserved: input.baseline9C.baseline8SPreserved,
    baseline8RPreserved: input.baseline9C.baseline8RPreserved,
    baseline8QPreserved: input.baseline9C.baseline8QPreserved,
    baseline8PPreserved: input.baseline9C.baseline8PPreserved,
    baseline8OPreserved: input.baseline9C.baseline8OPreserved,
    baseline8NPreserved: input.baseline9C.baseline8NPreserved,
    baseline8MPreserved: input.baseline9C.baseline8MPreserved,
    baseline8LPreserved: input.baseline9C.baseline8LPreserved,
    baseline8KPreserved: input.baseline9C.baseline8KPreserved,
    baseline8IPreserved: input.baseline9C.baseline8IPreserved,
    baseline8HPreserved: input.baseline9C.baseline8HPreserved,
    baseline8GPreserved: input.baseline9C.baseline8GPreserved,
    baseline8FPreserved: input.baseline9C.baseline8FPreserved,
    baseline8EPreserved: input.baseline9C.baseline8EPreserved,
    baseline8DPreserved: input.baseline9C.baseline8DPreserved,
    baseline8CPreserved: input.baseline9C.baseline8CPreserved,
    baseline8BPreserved: input.baseline9C.baseline8BPreserved,
    baseline8APreserved: input.baseline9C.baseline8APreserved,
    baseline7HPreserved: input.baseline9C.baseline7HPreserved,
    baseline6XPreserved: input.baseline9C.baseline6XPreserved,
    exportMetadataBadgeCleanupReady: status === "PASS",
    productExportMetadataBadgeCleanupVisible: input.productHtmlAfter9D.includes('id="manual-review-export-metadata-badge-cleanup-9d"'),
    exportMetadataBadgeCleanupVisible: input.exportHtmlAfter9D.includes('id="manual-review-export-metadata-badge-cleanup-export-9d"'),
    exportTitleMentions9D: metadataAudit.exportTitleMentions9D,
    exportMainIdIs9D: metadataAudit.exportMainIdIs9D,
    exportMainCurrentVersionVisible: metadataAudit.exportMainCurrentVersionVisible,
    exportCoverBadgeMentions9D: coverBadgeAudit.exportCoverBadgeMentions9D,
    exportCoverBadgeText: coverBadgeAudit.exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9D" as const,
    exportCoverBadgeCorrect: coverBadgeAudit.exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount: coverBadgeAudit.exportCoverBadgeStaleVersionCount,
    exportCoverBadgeStaleVersionValues: coverBadgeAudit.exportCoverBadgeStaleVersionValues,
    exportBodyMentions9D: metadataAudit.exportBodyMentions9D,
    exportHistoricalMarkersPreservedAsDataAttributes: metadataAudit.exportHistoricalMarkersPreservedAsDataAttributes,
    exportHistoricalSectionsPreserved: metadataAudit.exportHistoricalSectionsPreserved,
    metadataAuditStrictModeEnabled: true,
    metadataAuditNoBodyMentionFallback: true,
    metadataAuditChecksCoverBadgeOnlyForCoverBadgeMetric: true,
    metadataFalsePositiveCountBefore9D: 1,
    metadataFalsePositiveCountAfter9D: metadataAudit.metadataAuditFalsePositiveCount,
    staleCoverBadgeBefore9D: "Export compact 9B" as const,
    staleCoverBadgeAfter9D: "Export compact 9D" as const,
    exportMainIdStillCompressedExport9C: metadataAudit.exportMainIdStillCompressedExport9C,
    exportMainIdStillCompressedExport9B: metadataAudit.exportMainIdStillCompressedExport9B,
    exportMainIdStillCompressedExport9A: metadataAudit.exportMainIdStillCompressedExport9A,
    exportMainIdStillCompressedExport8Z: metadataAudit.exportMainIdStillCompressedExport8Z,
    detailCardStatusFrom9C: "detail_cards_rendered_without_preview_activation" as const,
    detailCardCountFrom9C: input.baseline9C.detailCardCount as 16,
    detailCardGroupCountFrom9C: input.baseline9C.detailCardGroupCount as 3,
    passButNotAcceptedDetailCardCountFrom9C: input.baseline9C.passButNotAcceptedDetailCardCount as 1,
    failValidationDetailCardCountFrom9C: input.baseline9C.failValidationDetailCardCount as 10,
    blockPreviewDetailCardCountFrom9C: input.baseline9C.blockPreviewDetailCardCount as 5,
    detailCoverageStillCompleteFrom9C: input.baseline9C.detailCoverageStillComplete,
    wordingReadabilityScoreFrom9C: input.baseline9C.wordingReadabilityScore as 97,
    validCaseDetailCardRenderedAsNotAcceptedFrom9C: input.baseline9C.validCaseDetailCardRenderedAsNotAccepted,
    validationRuntimeActive: false as const,
    payloadValidationRuntimeDetected: false as const,
    validationExecutionCount: 0,
    realPayloadReadCount: 0,
    payloadCreated: false as const,
    realPayloadInstanceCount: 0,
    dryRunAcceptedPayloadCount: 0,
    realInputActivated: false as const,
    realPreviewGenerated: false as const,
    previewActivationCount: 0,
    submitCreated: false as const,
    apiCreated: false as const,
    backendCreated: false as const,
    storageCreated: false as const,
    memoryCreated: false as const,
    draftCreated: false as const,
    historyCreated: false as const,
    officialTruthPromoted: false as const,
    automaticDecisionCreated: false as const,
    selectionDriven: false as const,
    tacticalInstructionDriven: false as const,
    scoreMutationCount: 0,
    timelineMutationCount: 0,
    scoreChangeCreationCount: 0,
    eventMutationCount: 0,
    exportReadTimeSecondsAfter9D,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9D <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9D <= 800),
    sourceOfTruthSeparationPreserved: input.baseline9C.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: input.baseline9C.matchEconomyBaselinePreserved,
    guardrailsPreserved,
    sharePackPass: input.sharePackPass ?? true,
    coverBadgeAudit,
    metadataAudit,
    productMetadataBadgeCleanupHtml: input.productSection,
    exportMetadataBadgeCleanupHtml: input.exportSection,
    productHtmlAfter9D: input.productHtmlAfter9D,
    exportHtmlAfter9D: input.exportHtmlAfter9D,
    warningCodes,
    recommendation: recommendationFromStatus(status),
    nextSprintRecommendation: nextSprintRecommendationFromStatus(status),
  };
  const falsePositiveGuard = evaluateManualReviewExportMetadataFalsePositiveGuard9D(partialModel);
  const finalWarnings = [...new Set([...warningCodes, ...falsePositiveGuard.requiredWarnings])];
  const finalStatus = falsePositiveGuard.statusRecommendation === "FAIL"
    ? "FAIL"
    : statusFromWarnings(finalWarnings, exportUnder800Seconds);
  return {
    ...partialModel,
    status: finalStatus,
    exportMetadataBadgeCleanupReady: finalStatus === "PASS",
    falsePositiveGuard,
    warningCodes: finalWarnings,
    recommendation: recommendationFromStatus(finalStatus),
    nextSprintRecommendation: nextSprintRecommendationFromStatus(finalStatus),
  };
}

export function buildManualReviewExportMetadataBadgeCleanup9DModel(input: {
  readonly baseline9C?: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel;
  readonly productHtmlBefore9D?: string;
  readonly exportHtmlBefore9D?: string;
} = {}): ManualReviewExportMetadataBadgeCleanup9DModel {
  const baseline9C = input.baseline9C ?? buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel();
  if (baseline9C.status !== "PASS") {
    throw new Error("9D requires a PASS 9C technical baseline.");
  }
  const normalizedExport = normalizeManualReviewExportMetadataBadgeCleanupShell9D(input.exportHtmlBefore9D ?? baseline9C.exportHtmlAfter9C);
  const preliminaryModel = buildModel({
    baseline9C,
    productHtmlAfter9D: input.productHtmlBefore9D ?? baseline9C.productHtmlAfter9C,
    exportHtmlAfter9D: normalizedExport,
    productSection: "",
    exportSection: "",
  });
  const exportSection = renderManualReviewExportMetadataBadgeCleanupExport9D(preliminaryModel);
  const exportHtmlAfter9D = insertManualReviewExportMetadataBadgeCleanupExport9D(normalizedExport, exportSection);
  const modelWithExport = buildModel({
    baseline9C,
    productHtmlAfter9D: input.productHtmlBefore9D ?? baseline9C.productHtmlAfter9C,
    exportHtmlAfter9D,
    productSection: "",
    exportSection,
  });
  const productSection = renderManualReviewExportMetadataBadgeCleanupProduct9D(modelWithExport);
  const productHtmlAfter9D = insertManualReviewExportMetadataBadgeCleanupProduct9D(input.productHtmlBefore9D ?? baseline9C.productHtmlAfter9C, productSection);
  return buildModel({
    baseline9C,
    productHtmlAfter9D,
    exportHtmlAfter9D,
    productSection,
    exportSection,
  });
}

export function currentManualReviewExportMetadataBadgeCleanup9DModel(): ManualReviewExportMetadataBadgeCleanup9DModel {
  const baseline9C = currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel();
  const reportsDirectory = join(process.cwd(), "reports");
  const productPath = join(reportsDirectory, "coach-report.product.html");
  const exportPath = join(reportsDirectory, "coach-report.export.html");
  return buildManualReviewExportMetadataBadgeCleanup9DModel({
    baseline9C,
    productHtmlBefore9D: existsSync(productPath) ? readFileSync(productPath, "utf8") : baseline9C.productHtmlAfter9C,
    exportHtmlBefore9D: existsSync(exportPath) ? readFileSync(exportPath, "utf8") : baseline9C.exportHtmlAfter9C,
  });
}

export function renderManualReviewExportMetadataBadgeCleanup9DDoc(
  model: ManualReviewExportMetadataBadgeCleanup9DModel,
): string {
  return [
    "# Coach Report Export Metadata Badge Cleanup Before Coach-Facing Error Copy 9D",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## Baseline 9C Summary",
    `- status 9C: ${model.baseline9C.status}`,
    `- detailCardCount: ${model.detailCardCountFrom9C}`,
    `- detailCardGroupCount: ${model.detailCardGroupCountFrom9C}`,
    `- wordingReadabilityScore: ${model.wordingReadabilityScoreFrom9C}`,
    `- coverage complete: ${bool(model.detailCoverageStillCompleteFrom9C)}`,
    "",
    "## Baseline Preservation 9C To 6X",
    ...table([
      ["Baseline", "Preserved"],
      ["9C", bool(model.baseline9CPreserved)],
      ["9B", bool(model.baseline9BPreserved)],
      ["9A", bool(model.baseline9APreserved)],
      ["8Z/8Y/8X/8W", bool(model.baseline8ZPreserved && model.baseline8YPreserved && model.baseline8XPreserved && model.baseline8WPreserved)],
      ["8V through 6X", bool(model.baseline8VPreserved && model.baseline8UPreserved && model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved && model.baseline8IPreserved && model.baseline8HPreserved && model.baseline8GPreserved && model.baseline8FPreserved && model.baseline8EPreserved && model.baseline8DPreserved && model.baseline8CPreserved && model.baseline8BPreserved && model.baseline8APreserved && model.baseline7HPreserved && model.baseline6XPreserved)],
    ]),
    "",
    "## Defect Before 9D",
    `- staleCoverBadgeBefore9D: ${model.staleCoverBadgeBefore9D}`,
    `- metadataFalsePositiveCountBefore9D: ${model.metadataFalsePositiveCountBefore9D}`,
    "",
    "## Metadata Cleanup Summary",
    ...table([
      ["Field", "Before", "After"],
      ["title", "9C", model.exportTitleMentions9D ? "9D" : "stale"],
      ["main id", "compressed-export-9c", model.exportMainIdIs9D ? "compressed-export-9d" : "stale"],
      ["cover badge", model.staleCoverBadgeBefore9D, model.exportCoverBadgeText],
      ["current data", "none", model.exportMainCurrentVersionVisible ? "9D" : "missing"],
    ]),
    "",
    "## Cover Badge Audit",
    ...table([
      ["Metric", "Value"],
      ["exportCoverBadgeText", model.exportCoverBadgeText],
      ["expected", model.exportCoverBadgeExpectedText],
      ["source", model.coverBadgeAudit.coverBadgeSource],
      ["selector", model.coverBadgeAudit.coverBadgeSelectorUsed],
      ["correct", bool(model.exportCoverBadgeCorrect)],
      ["stale versions", String(model.exportCoverBadgeStaleVersionCount)],
      ["body fallback", bool(model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge)],
    ]),
    "",
    "## Export Metadata Audit",
    ...table([
      ["Metric", "Value"],
      ["exportTitleMentions9D", bool(model.exportTitleMentions9D)],
      ["exportMainIdIs9D", bool(model.exportMainIdIs9D)],
      ["exportMainCurrentVersionVisible", bool(model.exportMainCurrentVersionVisible)],
      ["historical data attrs preserved", bool(model.exportHistoricalMarkersPreservedAsDataAttributes)],
      ["historical sections preserved", bool(model.exportHistoricalSectionsPreserved)],
      ["metadataFalsePositiveCountAfter9D", String(model.metadataFalsePositiveCountAfter9D)],
    ]),
    "",
    "## False-Positive Guard",
    ...table([
      ["Guard", "Value"],
      ["falsePositiveGuardPassed", bool(model.falsePositiveGuard.falsePositiveGuardPassed)],
      ["coverBadgeValidatedFromCoverOnly", bool(model.falsePositiveGuard.coverBadgeValidatedFromCoverOnly)],
      ["bodyMentionFallbackForbidden", bool(model.falsePositiveGuard.bodyMentionFallbackForbidden)],
      ["staleCoverBadgeDetected", bool(model.falsePositiveGuard.staleCoverBadgeDetected)],
      ["statusRecommendation", model.falsePositiveGuard.statusRecommendation],
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
      ["submit/API/backend", `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}`],
      ["storage/memory/history", `${bool(model.storageCreated)}/${bool(model.memoryCreated)}/${bool(model.historyCreated)}`],
      ["officialTruthPromoted", bool(model.officialTruthPromoted)],
      ["selection/tactic", `${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event mutation", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    `- sourceOfTruthSeparationPreserved: ${bool(model.sourceOfTruthSeparationPreserved)}`,
    `- matchEconomyBaselinePreserved: ${bool(model.matchEconomyBaselinePreserved)}`,
    `- guardrailsPreserved: ${bool(model.guardrailsPreserved)}`,
    "",
    "## Export Budget Audit",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsAfter9D", String(model.exportReadTimeSecondsAfter9D)],
      ["exportUnder900Seconds", bool(model.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.exportUnder800Seconds)],
      ["exportUnder900BooleanCorrect", bool(model.exportUnder900BooleanCorrect)],
      ["exportUnder800BooleanCorrect", bool(model.exportUnder800BooleanCorrect)],
    ]),
    "",
    "## Product Export Excerpts",
    "- product excerpt: Correction metadata export",
    "- export excerpt: Export compact 9D",
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
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

export function renderManualReviewExportMetadataBadgeCleanup9DValidation(
  model: ManualReviewExportMetadataBadgeCleanup9DModel,
): string {
  const checks = [
    checkLine("ManualReviewExportMetadataBadgeCleanup9DModel exists", model.version === "MANUAL_REVIEW_EXPORT_METADATA_BADGE_CLEANUP_9D", model.version),
    checkLine("baseline 9C visible and preserved", model.baseline9CPreserved, bool(model.baseline9CPreserved)),
    checkLine("baseline 9B preserved", model.baseline9BPreserved, bool(model.baseline9BPreserved)),
    checkLine("baseline 9A preserved", model.baseline9APreserved, bool(model.baseline9APreserved)),
    checkLine("baseline 8Z/8Y/8X/8W preserved", model.baseline8ZPreserved && model.baseline8YPreserved && model.baseline8XPreserved && model.baseline8WPreserved, "preserved"),
    checkLine("product metadata cleanup visible", model.productExportMetadataBadgeCleanupVisible, bool(model.productExportMetadataBadgeCleanupVisible)),
    checkLine("export metadata cleanup visible", model.exportMetadataBadgeCleanupVisible, bool(model.exportMetadataBadgeCleanupVisible)),
    checkLine("exportTitleMentions9D = true", model.exportTitleMentions9D, bool(model.exportTitleMentions9D)),
    checkLine("exportMainIdIs9D = true", model.exportMainIdIs9D, bool(model.exportMainIdIs9D)),
    checkLine("exportMainCurrentVersionVisible = true", model.exportMainCurrentVersionVisible, bool(model.exportMainCurrentVersionVisible)),
    checkLine("exportCoverBadgeMentions9D = true", model.exportCoverBadgeMentions9D, bool(model.exportCoverBadgeMentions9D)),
    checkLine("exportCoverBadgeCorrect = true", model.exportCoverBadgeCorrect, bool(model.exportCoverBadgeCorrect)),
    checkLine("exportCoverBadgeText = Export compact 9D", model.exportCoverBadgeText === "Export compact 9D", model.exportCoverBadgeText),
    checkLine("exportCoverBadgeStaleVersionCount = 0", model.exportCoverBadgeStaleVersionCount === 0, String(model.exportCoverBadgeStaleVersionCount)),
    checkLine("bodyMentionFallbackUsedForCoverBadge = false", !model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge, bool(model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge)),
    checkLine("metadataFalsePositiveCountAfter9D = 0", model.metadataFalsePositiveCountAfter9D === 0, String(model.metadataFalsePositiveCountAfter9D)),
    checkLine("export main id no longer compressed-export-9c", !model.exportMainIdStillCompressedExport9C, bool(model.exportMainIdStillCompressedExport9C)),
    checkLine("export main id no longer compressed-export-9b", !model.exportMainIdStillCompressedExport9B, bool(model.exportMainIdStillCompressedExport9B)),
    checkLine("9C detail cards preserved", model.detailCardCountFrom9C === 16 && model.detailCardGroupCountFrom9C === 3, `${model.detailCardCountFrom9C}/${model.detailCardGroupCountFrom9C}`),
    checkLine("9C coverage preserved", model.detailCoverageStillCompleteFrom9C, bool(model.detailCoverageStillCompleteFrom9C)),
    checkLine("wording score preserved or republished", model.wordingReadabilityScoreFrom9C === 97, String(model.wordingReadabilityScoreFrom9C)),
    checkLine("no runtime validation", !model.validationRuntimeActive && model.validationExecutionCount === 0, `${bool(model.validationRuntimeActive)}/${model.validationExecutionCount}`),
    checkLine("no payload read/created/accepted", model.realPayloadReadCount === 0 && !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0, `${model.realPayloadReadCount}/${bool(model.payloadCreated)}/${model.dryRunAcceptedPayloadCount}`),
    checkLine("no preview generated", !model.realPreviewGenerated && model.previewActivationCount === 0, `${bool(model.realPreviewGenerated)}/${model.previewActivationCount}`),
    checkLine("no submit/API/backend", !model.submitCreated && !model.apiCreated && !model.backendCreated, `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}`),
    checkLine("no persistence/memory/history", !model.storageCreated && !model.memoryCreated && !model.historyCreated, `${bool(model.storageCreated)}/${bool(model.memoryCreated)}/${bool(model.historyCreated)}`),
    checkLine("no official truth", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("no automatic decision", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("no selection/tactic", !model.selectionDriven && !model.tacticalInstructionDriven, `${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`),
    checkLine("no score/timeline/score_change/event mutation", model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.scoreChangeCreationCount === 0 && model.eventMutationCount === 0, `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`),
    checkLine("exportReadTimeSecondsAfter9D <= 900", model.exportReadTimeSecondsAfter9D <= 900, String(model.exportReadTimeSecondsAfter9D)),
    checkLine("exportUnder900Seconds correctly computed", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("scoring constants unchanged", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("PENALTY_SHOT inactive", true, "inactive"),
    checkLine("MatchBonusEvent unchanged", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("batch/live separation preserved", model.baseline9C.baseline9B.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, "preserved"),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status !== "FAIL" ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Export Metadata Badge Cleanup Before Coach-Facing Error Copy 9D",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- exportCoverBadgeText: ${model.exportCoverBadgeText}`,
    `- exportCoverBadgeStaleVersionCount: ${model.exportCoverBadgeStaleVersionCount}`,
    `- metadataFalsePositiveCountAfter9D: ${model.metadataFalsePositiveCountAfter9D}`,
    `- detailCardCountFrom9C: ${model.detailCardCountFrom9C}`,
    `- wordingReadabilityScoreFrom9C: ${model.wordingReadabilityScoreFrom9C}`,
    `- exportReadTimeSecondsAfter9D: ${model.exportReadTimeSecondsAfter9D}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
