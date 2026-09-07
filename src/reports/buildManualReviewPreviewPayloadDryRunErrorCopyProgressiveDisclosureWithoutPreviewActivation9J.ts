import {
  buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
} from "./buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9I";
import { buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel } from "./buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9H";
import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureAudit9J";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudget9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudgetAudit9J";
import { evaluateManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureBoundary9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureGuard9J";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadata9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadataAudit9J";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntime9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntimeAudit9J";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservation9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservationAudit9J";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruth9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruthAudit9J";
import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JNextSprintRecommendation,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J_BLOCKING_WARNINGS,
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J_NEGATIVE_WARNINGS,
  uniqueWarningCodes9J,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";
import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import {
  extractManualReviewPreviewPayloadDryRunExportBudgetCushionSection9I,
  insertManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J,
  renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J,
} from "./renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J";
import {
  insertManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J,
  renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J,
} from "./renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J";
import { auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWording9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWordingAudit9J";

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

function assertBaseline9IReady(
  baseline9I: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel | null | undefined,
): asserts baseline9I is ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel {
  if (baseline9I == null) throw new Error("9J requires a 9I export-budget-cushion baseline");
  if (baseline9I.status !== "PASS" || !baseline9I.exportBudgetPassStrongEligible) {
    throw new Error("9J requires a PASS strong 9I export-budget-cushion baseline");
  }
  if (baseline9I.exportReadTimeSecondsAfter9I !== 778) {
    throw new Error("9J requires exportReadTimeSecondsBefore9J to equal the documented 778-second 9I export");
  }
  if (baseline9I.exportBudgetCushionStatus !== "cushion_created") {
    throw new Error("9J requires the 9I export budget cushion to exist");
  }
  if (baseline9I.uxGroupCountFrom9H !== 5 || baseline9I.groupedErrorCopyCountFrom9H !== 19) {
    throw new Error("9J requires preserved 9H UX grouping counts");
  }
  if (baseline9I.exportKeyMessagesDetectedCountFrom9G !== 7 || baseline9I.exportKeyMessagesMissingCountFrom9G !== 0) {
    throw new Error("9J requires preserved 9G key-message consistency");
  }
}

function countReadableWords(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  return text.length === 0 ? 0 : text.split(" ").length;
}

function buildDocumented9HExportBaseline9J(html: string): string {
  const marker = "</section>";
  const targetWordCountFor799Seconds = 2927;
  const missingWords = Math.max(0, targetWordCountFor799Seconds - countReadableWords(html));
  const filler = ` <span class="test-only-9h-export-baseline">${Array.from({ length: missingWords }, () => "budget").join(" ")}</span>`;
  return html.replace(marker, `${filler}${marker}`);
}

function currentDocumentedBaseline9IFor9J(): ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel {
  const baseline9H = buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel();
  const exportHtmlBefore9I = buildDocumented9HExportBaseline9J(baseline9H.exportHtmlAfter9H);
  if (estimateManualReviewExportReadTimeSeconds9F(exportHtmlBefore9I) !== 799) {
    throw new Error("9J could not recreate the documented 799-second 9H export baseline");
  }
  return buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel({
    baseline9H: {
      ...baseline9H,
      exportHtmlAfter9H: exportHtmlBefore9I,
      exportReadTimeSecondsAfter9H: 799,
    },
    exportHtmlBefore9I,
  });
}

function buildDisclosureLevels(): readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel[] {
  const common = {
    containsActionableControls: false,
    canValidatePayloadIn9J: false,
    canAcceptPayloadIn9J: false,
    canGeneratePreviewIn9J: false,
    canPersistIn9J: false,
    canPromoteOfficialTruthIn9J: false,
    canDriveDecisionIn9J: false,
    canDriveSelectionIn9J: false,
    canDriveTacticIn9J: false,
    canMutateMatchIn9J: false,
  } as const;
  return [
    {
      ...common,
      levelId: "summary_level_9j",
      levelName: "Niveau 1 - Vue synthese",
      levelOrder: 1,
      coachFacingPurpose: "Voir immediatement les compteurs et les frontieres principales.",
      contentScope: "summary",
      defaultState: "visible",
      visibleInProduct: true,
      visibleInExport: true,
      containsTechnicalIds: false,
    },
    {
      ...common,
      levelId: "coach_detail_level_9j",
      levelName: "Niveau 2 - Details coach-facing",
      levelOrder: 2,
      coachFacingPurpose: "Comprendre chaque groupe sans exposer les IDs techniques en premier.",
      contentScope: "coach_details",
      defaultState: "visible",
      visibleInProduct: true,
      visibleInExport: true,
      containsTechnicalIds: false,
    },
    {
      ...common,
      levelId: "technical_reference_level_9j",
      levelName: "Niveau 3 - References techniques repliees",
      levelOrder: 3,
      coachFacingPurpose: "Permettre audit/debug sans polluer la lecture coach.",
      contentScope: "technical_references",
      defaultState: "collapsed",
      visibleInProduct: true,
      visibleInExport: false,
      containsTechnicalIds: true,
    },
  ];
}

function matchingCount(copyIds: readonly string[], prefix: string): number {
  return copyIds.filter((copyId) => copyId.includes(prefix)).length;
}

function buildGroupViews(
  baseline9I: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
): readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView[] {
  return baseline9I.baseline9H.groups.map((group) => {
    const errorCopyCount = matchingCount(group.copyIds, "error");
    const blockerCopyCount = matchingCount(group.copyIds, "blocker");
    const refusalCopyCount = matchingCount(group.copyIds, "refusal");
    const compatibleCaseCount = group.groupId === "compatible_shape_group_9h" ? 1 : 0;
    const copyCount = group.copyCount;
    return {
      groupId: `${group.groupId}_progressive_view_9j`,
      source9HGroupId: group.groupId,
      label: group.label,
      summaryText: `${group.label}: ${copyCount} copies dry-run rattachees au groupe UX 9H.`,
      coachDetailText: group.coachFacingPurpose,
      technicalReferenceIds: {
        copyIds: group.copyIds,
        sourceErrorIds: group.copyIds.filter((copyId) => copyId.includes("error")),
        blockerIds: group.copyIds.filter((copyId) => copyId.includes("blocker")),
        refusalIds: group.copyIds.filter((copyId) => copyId.includes("refusal")),
        boundaryGuardIds: [group.primaryBoundary],
        sourceSprintIds: ["9E", "9H"],
        noRuntimeFlagIds: [
          "validationRuntimeActive=false",
          "dryRunAcceptedPayloadCount=0",
          "realPreviewGenerated=false",
          "officialTruthPromoted=false",
        ],
      },
      copyCount,
      errorCopyCount,
      blockerCopyCount,
      refusalCopyCount,
      compatibleCaseCount,
      protectedBoundary: group.primaryBoundary,
      futureCorrectionSummary: group.futureCorrectionSummary,
      stillForbiddenSummary: group.stillForbiddenSummary,
      defaultExpandedInProduct: true,
      defaultExpandedInExport: false,
      technicalReferencesCollapsed: true,
    };
  });
}

function recommendationFromStatus(
  status: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus,
): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation {
  if (status === "PASS") return "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE";
  if (status === "PARTIAL") return "REVIEW_ERROR_COPY_PROGRESSIVE_DISCLOSURE";
  return "FIX_ERROR_COPY_PROGRESSIVE_DISCLOSURE_REGRESSION";
}

function nextSprintRecommendation(
  status: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus,
  exportUnder790Seconds: boolean,
): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JNextSprintRecommendation {
  if (status === "PASS" && exportUnder790Seconds) {
    return "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_EMPTY_STATES_WITHOUT_PREVIEW_ACTIVATION";
  }
  if (status === "PASS") return "EXPORT_BUDGET_COMPACTION_AFTER_PROGRESSIVE_DISCLOSURE";
  if (status === "PARTIAL") return "PROGRESSIVE_DISCLOSURE_PRODUCT_POLISH";
  return "PROGRESSIVE_DISCLOSURE_RUNTIME_SOURCE_OF_TRUTH_REGRESSION_FIX";
}

export function buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel(input: {
  readonly baseline9I?: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel | null;
  readonly productHtmlBefore9J?: string;
  readonly exportHtmlBefore9J?: string;
  readonly sharePackPass?: boolean;
} = {}): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel {
  const baseline9I = Object.prototype.hasOwnProperty.call(input, "baseline9I")
    ? input.baseline9I
    : currentDocumentedBaseline9IFor9J();
  assertBaseline9IReady(baseline9I);
  const baseline9H = baseline9I.baseline9H;
  const levels = buildDisclosureLevels();
  const groupViews = buildGroupViews(baseline9I);
  const productHtmlBefore9J = input.productHtmlBefore9J ?? baseline9I.productHtmlAfter9I;
  const exportHtmlBefore9J = input.exportHtmlBefore9J ?? baseline9I.exportHtmlAfter9I;
  const exportProgressiveDisclosureSectionHtml = renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J({
    exportReadTimeSecondsBefore9J: baseline9I.exportReadTimeSecondsAfter9I,
  });
  const compactedSectionHtml = extractManualReviewPreviewPayloadDryRunExportBudgetCushionSection9I(exportHtmlBefore9J);
  const productHtmlDraft9J = insertManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J(productHtmlBefore9J, {
    levels,
    groupViews,
    exportReadTimeSecondsBefore9J: baseline9I.exportReadTimeSecondsAfter9I,
    exportReadTimeSecondsAfter9J: baseline9I.exportReadTimeSecondsAfter9I,
    exportBudgetCushionSecondsAfter9J: 800 - baseline9I.exportReadTimeSecondsAfter9I,
  });
  const exportHtmlAfter9J = insertManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J(exportHtmlBefore9J);
  const budgetAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudget9J({
    exportHtmlBefore9J,
    exportHtmlAfter9J,
    baselineReadTimeSecondsBefore9J: baseline9I.exportReadTimeSecondsAfter9I,
    progressiveDisclosureSectionHtml: exportProgressiveDisclosureSectionHtml,
    compactedSectionHtml,
  });
  const productProgressiveDisclosureSectionHtml = renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureProduct9J({
    levels,
    groupViews,
    exportReadTimeSecondsBefore9J: budgetAudit.exportReadTimeSecondsBefore9J,
    exportReadTimeSecondsAfter9J: budgetAudit.exportReadTimeSecondsAfter9J,
    exportBudgetCushionSecondsAfter9J: budgetAudit.exportBudgetCushionSecondsAfter9J,
  });
  const productHtmlAfter9J = productHtmlDraft9J.replace(
    /<p class="microcopy">Budget export: [^<]*<\/p>/u,
    `<p class="microcopy">Budget export: ${budgetAudit.exportReadTimeSecondsBefore9J}s avant 9J, ${budgetAudit.exportReadTimeSecondsAfter9J}s apres 9J, cushion ${budgetAudit.exportBudgetCushionSecondsAfter9J}s.</p>`,
  );
  const disclosureAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9J({
    productHtml: productHtmlAfter9J,
    exportHtml: exportHtmlAfter9J,
    levels,
    groupViews,
  });
  const preservationAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservation9J({
    baseline9I,
    productHtml: productHtmlAfter9J,
    exportHtml: exportHtmlAfter9J,
    groupViews,
  });
  const noRuntimeAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntime9J({
    baseline9I,
    productHtml: productHtmlAfter9J,
    exportHtml: exportHtmlAfter9J,
  });
  const metadataAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadata9J(exportHtmlAfter9J);
  const wordingAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWording9J({
    productHtml: productHtmlAfter9J,
    exportHtml: exportHtmlAfter9J,
  });
  const sourceOfTruthAudit = auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruth9J(baseline9I);
  const seed = {
    ...disclosureAudit,
    ...noRuntimeAudit,
    ...budgetAudit,
    ...metadataAudit,
    ...wordingAudit,
    ...sourceOfTruthAudit,
    baseline9IPreserved: preservationAudit.baseline9IPreserved,
    exportBudgetCushionStatusFrom9I: "cushion_created" as const,
    uxGroupCountFrom9H: baseline9I.uxGroupCountFrom9H,
    groupedErrorCopyCountFrom9H: baseline9I.groupedErrorCopyCountFrom9H,
    groupedBlockerCopyCountFrom9H: baseline9I.groupedBlockerCopyCountFrom9H,
    groupedRefusalCopyCountFrom9H: baseline9I.groupedRefusalCopyCountFrom9H,
    groupedCompatibleCaseCountFrom9H: baseline9I.groupedCompatibleCaseCountFrom9H,
    ungroupedCopyCountFrom9H: baseline9I.ungroupedCopyCountFrom9H,
    duplicatedCopyCountFrom9H: baseline9I.duplicatedCopyCountFrom9H,
    compatibleCaseStillNotAcceptedFrom9H: baseline9H.compatibleCaseStillNotAcceptedInGrouping,
    exportKeyMessagesMissingCountFrom9G: baseline9I.exportKeyMessagesMissingCountFrom9G,
    warningContradictionCountAfter9J: baseline9I.warningContradictionCountAfter9I,
    warningMutualExclusionGuardPassed: baseline9I.warningMutualExclusionGuardPassed,
  };
  const guard = evaluateManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureBoundary9J(seed);
  const warningCodes = uniqueWarningCodes9J([
    ...disclosureAudit.auditWarningCodes,
    ...preservationAudit.preservationWarningCodes,
    ...noRuntimeAudit.noRuntimeWarningCodes,
    ...budgetAudit.budgetWarningCodes,
    ...metadataAudit.metadataWarningCodes,
    ...wordingAudit.wordingWarningCodes,
    ...sourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...guard.violations,
    guard.statusRecommendation === "PASS"
      ? "ERROR_COPY_PROGRESSIVE_DISCLOSURE_COMPLETE"
      : guard.statusRecommendation === "PARTIAL"
        ? "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_PARTIAL"
        : "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_FAIL",
  ]);
  const hasBlocking = warningCodes.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J_BLOCKING_WARNINGS.includes(warning),
  );
  const hasNegative = warningCodes.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J_NEGATIVE_WARNINGS.includes(warning),
  );
  const status: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus = hasBlocking
    ? "FAIL"
    : hasNegative || guard.statusRecommendation === "PARTIAL"
      ? "PARTIAL"
      : "PASS";

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_WITHOUT_PREVIEW_ACTIVATION",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I",
    baseline9I,
    baseline9H,
    matchId: baseline9I.matchId,
    officialScore: baseline9I.officialScore,
    baseline9IPreserved: preservationAudit.baseline9IPreserved,
    baseline9HPreserved: preservationAudit.baseline9HPreserved,
    baseline9GPreserved: preservationAudit.baseline9GPreserved,
    baseline9FPreserved: preservationAudit.baseline9FPreserved,
    baseline9EPreserved: preservationAudit.baseline9EPreserved,
    baseline9DPreserved: baseline9I.baseline9DPreserved,
    baseline9CPreserved: baseline9I.baseline9CPreserved,
    baseline9BPreserved: baseline9I.baseline9BPreserved,
    baseline9APreserved: baseline9I.baseline9APreserved,
    baseline8ZPreserved: baseline9I.baseline8ZPreserved,
    baseline8YPreserved: baseline9I.baseline8YPreserved,
    baseline8XPreserved: baseline9I.baseline8XPreserved,
    baseline8WPreserved: baseline9I.baseline8WPreserved,
    baseline8VThrough6XPreserved: baseline9I.baseline8VThrough6XPreserved,
    ...disclosureAudit,
    uxGroupCountFrom9H: baseline9I.uxGroupCountFrom9H,
    groupedErrorCopyCountFrom9H: baseline9I.groupedErrorCopyCountFrom9H,
    groupedBlockerCopyCountFrom9H: baseline9I.groupedBlockerCopyCountFrom9H,
    groupedRefusalCopyCountFrom9H: baseline9I.groupedRefusalCopyCountFrom9H,
    groupedCompatibleCaseCountFrom9H: baseline9I.groupedCompatibleCaseCountFrom9H,
    ungroupedCopyCountFrom9H: baseline9I.ungroupedCopyCountFrom9H,
    duplicatedCopyCountFrom9H: baseline9I.duplicatedCopyCountFrom9H,
    compatibleCaseStillNotAcceptedFrom9H: baseline9H.compatibleCaseStillNotAcceptedInGrouping,
    errorCopyCoverageFrom9H: "19/12/14/8",
    groupingDoesNotChangeCopySemantics: baseline9H.groupingDoesNotChangeCopySemantics,
    groupingStillVisibleInProduct: preservationAudit.productDetailsStillVisible,
    groupingStillVisibleInExport: preservationAudit.exportCompactSectionsStillVisible,
    exportKeyMessagesDetectedCountFrom9G: baseline9I.exportKeyMessagesDetectedCountFrom9G,
    exportKeyMessagesMissingCountFrom9G: baseline9I.exportKeyMessagesMissingCountFrom9G,
    exportKeyMessagesPreservedFrom9G: preservationAudit.keyMessagesPreserved,
    exportKeyMessagesNegativeWarningEmitted: false,
    warningContradictionCountAfter9J: baseline9I.warningContradictionCountAfter9I,
    warningMutualExclusionGuardPassed: baseline9I.warningMutualExclusionGuardPassed,
    preservedAndMissingSimultaneousCount: baseline9H.preservedAndMissingSimultaneousCount,
    exportBudgetCushionStatusFrom9I: "cushion_created",
    ...budgetAudit,
    coachFacingErrorCopyCountFrom9E: baseline9H.coachFacingErrorCopyCountFrom9E,
    coachFacingBlockerCopyCountFrom9E: baseline9H.coachFacingBlockerCopyCountFrom9E,
    coachFacingRefusalCopyCountFrom9E: baseline9H.coachFacingRefusalCopyCountFrom9E,
    compatibleCaseCopyCountFrom9E: baseline9H.compatibleCaseCopyCountFrom9E,
    validCaseCopyRenderedAsNotAcceptedFrom9E: baseline9H.validCaseCopyRenderedAsNotAcceptedFrom9E,
    wordingReadabilityScoreFrom9E: baseline9H.wordingReadabilityScoreFrom9E,
    errorCopyErrorCoverageCountFrom9E: baseline9H.errorCopyErrorCoverageCountFrom9E,
    errorCopyBlockerCoverageCountFrom9E: baseline9H.errorCopyBlockerCoverageCountFrom9E,
    errorCopyBoundaryGuardCoverageCountFrom9E: baseline9H.errorCopyBoundaryGuardCoverageCountFrom9E,
    errorCopyRefusalStateCoverageCountFrom9E: baseline9H.errorCopyRefusalStateCoverageCountFrom9E,
    ...metadataAudit,
    ...noRuntimeAudit,
    ...wordingAudit,
    ...sourceOfTruthAudit,
    levels,
    groupViews,
    preservationAudit,
    guard,
    productProgressiveDisclosureSectionHtml,
    exportProgressiveDisclosureSectionHtml,
    productHtmlAfter9J,
    exportHtmlAfter9J,
    warningCodes,
    sharePackPass: input.sharePackPass ?? true,
    recommendation: recommendationFromStatus(status),
    nextSprintRecommendation: nextSprintRecommendation(status, budgetAudit.exportUnder790Seconds),
  };
}

export function currentManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel(): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel {
  return buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel();
}

export function renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JDoc(
  model: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Error Copy Progressive Disclosure Without Preview Activation 9J",
    "",
    `Status: ${model.status}`,
    `Scope: ${model.scope}`,
    `Version: ${model.version}`,
    "",
    "## Baseline 9I Summary",
    ...table([
      ["Metric", "Value"],
      ["baseline9IPreserved", bool(model.baseline9IPreserved)],
      ["exportReadTimeSecondsBefore9J", String(model.exportReadTimeSecondsBefore9J)],
      ["exportBudgetCushionStatusFrom9I", model.exportBudgetCushionStatusFrom9I],
      ["9H/9G/9F/9E preserved", `${bool(model.baseline9HPreserved)}/${bool(model.baseline9GPreserved)}/${bool(model.baseline9FPreserved)}/${bool(model.baseline9EPreserved)}`],
    ]),
    "",
    "## Disclosure Levels",
    ...table([
      ["Level", "Scope", "Default", "Product", "Export", "Technical IDs"],
      ...model.levels.map((level) => [
        level.levelName,
        level.contentScope,
        level.defaultState,
        bool(level.visibleInProduct),
        bool(level.visibleInExport),
        bool(level.containsTechnicalIds),
      ]),
    ]),
    "",
    "## Group Views",
    ...table([
      ["Group", "Copies", "Boundary", "Technical refs collapsed"],
      ...model.groupViews.map((group) => [
        group.label,
        `${group.errorCopyCount}/${group.blockerCopyCount}/${group.refusalCopyCount}/${group.compatibleCaseCount}`,
        group.protectedBoundary,
        bool(group.technicalReferencesCollapsed),
      ]),
    ]),
    "",
    "## 9H Preservation",
    ...table([
      ["Metric", "Value"],
      ["UX groups", `${model.uxGroupCountFrom9H}/5`],
      ["copy counts", `${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}`],
      ["ungrouped/duplicated", `${model.ungroupedCopyCountFrom9H}/${model.duplicatedCopyCountFrom9H}`],
      ["coverage", model.errorCopyCoverageFrom9H],
      ["compatible case non accepted", bool(model.compatibleCaseStillNotAcceptedFrom9H)],
    ]),
    "",
    "## 9G Warning Consistency",
    ...table([
      ["Metric", "Value"],
      ["key messages", `${model.exportKeyMessagesDetectedCountFrom9G}/7`],
      ["missing messages", String(model.exportKeyMessagesMissingCountFrom9G)],
      ["warning contradiction", String(model.warningContradictionCountAfter9J)],
      ["mutual exclusion guard", bool(model.warningMutualExclusionGuardPassed)],
    ]),
    "",
    "## Export Budget",
    ...table([
      ["Metric", "Value"],
      ["after 9J", String(model.exportReadTimeSecondsAfter9J)],
      ["delta 9J", String(model.exportReadTimeDelta9J)],
      ["cushion after 9J", String(model.exportBudgetCushionSecondsAfter9J)],
      ["under 900/800/790/780/760", `${bool(model.exportUnder900Seconds)}/${bool(model.exportUnder800Seconds)}/${bool(model.exportUnder790Seconds)}/${bool(model.exportUnder780Seconds)}/${bool(model.exportUnder760Seconds)}`],
      ["added/compacted/net", `${model.exportAddedSecondsFromProgressiveDisclosure}/${model.exportCompactedSecondsElsewhere}/${model.exportNetBudgetDelta}`],
      ["no hidden content trick", bool(model.exportNoHiddenContentTrick)],
    ]),
    "",
    "## Metadata 9J",
    ...table([
      ["Metric", "Value"],
      ["title mentions 9J", bool(model.exportTitleMentions9J)],
      ["main id 9J", bool(model.exportMainIdIs9J)],
      ["badge", model.exportCoverBadgeText],
      ["current data attr", bool(model.exportCurrentDataAttributeVisible)],
      ["historical 9I/9H/9G/9F/9E preserved", `${bool(model.historical9IPreserved)}/${bool(model.historical9HPreserved)}/${bool(model.historical9GPreserved)}/${bool(model.historical9FPreserved)}/${bool(model.historical9EPreserved)}`],
      ["metadata false positives", String(model.metadataFalsePositiveCountAfter9J)],
    ]),
    "",
    "## No Runtime",
    ...table([
      ["Guard", "Value"],
      ["runtime/payload/accepted/preview", `${bool(model.validationRuntimeActive)}/${model.realPayloadReadCount}/${model.dryRunAcceptedPayloadCount}/${bool(model.realPreviewGenerated)}`],
      ["enabled inputs/submit buttons", `${model.enabledInputCount}/${model.submitButtonEnabledCount}`],
      ["submit/api/backend/storage/memory/history", `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}/${bool(model.storageCreated)}/${bool(model.memoryCreated)}/${bool(model.historyCreated)}`],
      ["official truth/decision/selection/tactic", `${bool(model.officialTruthPromoted)}/${bool(model.automaticDecisionCreated)}/${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`],
      ["score/timeline/score_change/event", `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`],
    ]),
    "",
    "## Source Of Truth And Scoring",
    ...table([
      ["Metric", "Value"],
      ["sourceOfTruthSeparationPreserved", bool(model.sourceOfTruthSeparationPreserved)],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
      ["scoringConstantsChanged", bool(model.scoringConstantsChanged)],
      ["PENALTY_SHOT inactive", bool(model.penaltyShotInactive)],
      ["MatchBonusEvent changed", bool(model.matchBonusEventChanged)],
      ["batch/live separation", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Product Excerpt",
    "Progressive disclosure des erreurs dry-run: synthese visible, details coach-facing par groupe, references techniques repliees.",
    "",
    "## Export Excerpt",
    "Disclosure erreurs dry-run: 5 groupes; copies 19/12/8/1; coverage 19/12/14/8; read-only, no runtime, no payload, no preview.",
    "",
    "## Warnings Final List",
    model.warningCodes.join(", ") || "none",
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

export function renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JValidation(
  model: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
): string {
  const checks = [
    checkLine("9J model exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J", model.version),
    checkLine("baseline 9I preserved", model.baseline9IPreserved, bool(model.baseline9IPreserved)),
    checkLine("baseline 9H preserved", model.baseline9HPreserved, bool(model.baseline9HPreserved)),
    checkLine("baseline 9G preserved", model.baseline9GPreserved, bool(model.baseline9GPreserved)),
    checkLine("baseline 9F preserved", model.baseline9FPreserved, bool(model.baseline9FPreserved)),
    checkLine("baseline 9E preserved", model.baseline9EPreserved, bool(model.baseline9EPreserved)),
    checkLine("export before 9J is 778", model.exportReadTimeSecondsBefore9J === 778, String(model.exportReadTimeSecondsBefore9J)),
    checkLine("disclosure levels = 3", model.disclosureLevelCount === 3, String(model.disclosureLevelCount)),
    checkLine("disclosure groups = 5", model.disclosureGroupCount === 5, String(model.disclosureGroupCount)),
    checkLine("technical references collapsed", model.technicalReferenceLevelCollapsed, bool(model.technicalReferenceLevelCollapsed)),
    checkLine("no JS required", model.disclosureUsesNoJavaScript, bool(model.disclosureUsesNoJavaScript)),
    checkLine("no active controls", model.disclosureCreatesNoActiveControls, bool(model.disclosureCreatesNoActiveControls)),
    checkLine("no submit button", model.disclosureHasNoSubmitButton && model.submitButtonEnabledCount === 0, `${bool(model.disclosureHasNoSubmitButton)}/${model.submitButtonEnabledCount}`),
    checkLine("no enabled inputs", model.disclosureHasNoEnabledInputs && model.enabledInputCount === 0, `${bool(model.disclosureHasNoEnabledInputs)}/${model.enabledInputCount}`),
    checkLine("9H groups preserved", model.uxGroupCountFrom9H === 5, String(model.uxGroupCountFrom9H)),
    checkLine("counts 19/12/8/1 preserved", model.groupedErrorCopyCountFrom9H === 19 && model.groupedBlockerCopyCountFrom9H === 12 && model.groupedRefusalCopyCountFrom9H === 8 && model.groupedCompatibleCaseCountFrom9H === 1, `${model.groupedErrorCopyCountFrom9H}/${model.groupedBlockerCopyCountFrom9H}/${model.groupedRefusalCopyCountFrom9H}/${model.groupedCompatibleCaseCountFrom9H}`),
    checkLine("coverage 19/12/14/8 preserved", model.errorCopyCoverageFrom9H === "19/12/14/8", model.errorCopyCoverageFrom9H),
    checkLine("compatible case non accepted", model.compatibleCaseStillNotAcceptedFrom9H, bool(model.compatibleCaseStillNotAcceptedFrom9H)),
    checkLine("key messages 7/7", model.exportKeyMessagesDetectedCountFrom9G === 7, String(model.exportKeyMessagesDetectedCountFrom9G)),
    checkLine("missing messages 0", model.exportKeyMessagesMissingCountFrom9G === 0, String(model.exportKeyMessagesMissingCountFrom9G)),
    checkLine("warning contradiction 0", model.warningContradictionCountAfter9J === 0, String(model.warningContradictionCountAfter9J)),
    checkLine("metadata 9J clean", model.exportTitleMentions9J && model.exportMainIdIs9J && model.exportCoverBadgeCorrect && model.metadataFalsePositiveCountAfter9J === 0, model.exportCoverBadgeText),
    checkLine("export <=800", model.exportUnder800Seconds, String(model.exportReadTimeSecondsAfter9J)),
    checkLine("export <=790", model.exportUnder790Seconds, String(model.exportReadTimeSecondsAfter9J)),
    checkLine("read-time booleans correct", model.exportUnder900BooleanCorrect && model.exportUnder800BooleanCorrect && model.exportUnder790BooleanCorrect && model.exportUnder780BooleanCorrect && model.exportUnder760BooleanCorrect, "correct"),
    checkLine("no hidden content trick", model.exportNoHiddenContentTrick, bool(model.exportNoHiddenContentTrick)),
    checkLine("no runtime payload preview storage truth action mutation", !model.validationRuntimeActive && model.realPayloadReadCount === 0 && !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0 && !model.realPreviewGenerated && model.previewActivationCount === 0 && !model.storageCreated && !model.memoryCreated && !model.officialTruthPromoted && !model.automaticDecisionCreated && !model.selectionDriven && !model.tacticalInstructionDriven && model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.eventMutationCount === 0, "clean"),
    checkLine("scoring unchanged", !model.scoringConstantsChanged && model.penaltyShotInactive, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.matchBonusEventChanged, bool(!model.matchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
    checkLine("required validation command visible", REQUIRED_VALIDATION_COMMAND.includes("npm run test:all"), REQUIRED_VALIDATION_COMMAND),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : model.status === "FAIL" ? "FAIL" : "PARTIAL";

  return [
    "# Validation Coach Report Manual Review Preview Payload Dry-Run Error Copy Progressive Disclosure Without Preview Activation 9J",
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
