import assert from "node:assert/strict";
import {
  buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
  renderManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IValidation,
} from "./buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9I";
import { buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel } from "./buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9H";
import { evaluateManualReviewPreviewPayloadDryRunExportBudgetCushionBoundary9I } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionGuard9I";
import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import { currentSprint } from "./share/currentSharePack";
import { scoringRegistryEntry } from "../systems/scoring";

const baseline9H = buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel();

function countReadableWords(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  return text.length === 0 ? 0 : text.split(" ").length;
}

function buildDocumented9HExportBaseline(html: string): string {
  const marker = "</section>";
  const targetWordCountFor799Seconds = 2927;
  const missingWords = Math.max(0, targetWordCountFor799Seconds - countReadableWords(html));
  const filler = ` <span class="test-only-9h-export-baseline">${Array.from({ length: missingWords }, () => "budget").join(" ")}</span>`;
  const documented = html.replace(marker, `${filler}${marker}`);
  const readTime = estimateManualReviewExportReadTimeSeconds9F(documented);
  assert.equal(readTime, 799);
  return documented;
}

const exportHtmlBefore9I = buildDocumented9HExportBaseline(baseline9H.exportHtmlAfter9H);
const documentedBaseline9H = {
  ...baseline9H,
  exportHtmlAfter9H: exportHtmlBefore9I,
  exportReadTimeSecondsAfter9H: 799,
};
const model = buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel({
  baseline9H: documentedBaseline9H,
  exportHtmlBefore9I,
});
const validation = renderManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IValidation(model);

assert.equal(model.status, "PASS");
assert.equal(validation.includes("Status: PASS"), true);
assert.equal(model.version, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I");
assert.equal(model.scope, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_BEFORE_PROGRESSIVE_DISCLOSURE");
assert.equal(model.baselineVersion, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H");

assert.equal(model.baseline9HPreserved, true);
assert.equal(model.baseline9GPreserved, true);
assert.equal(model.baseline9FPreserved, true);
assert.equal(model.baseline9EPreserved, true);
assert.equal(model.baseline9DPreserved, true);
assert.equal(model.baseline9CPreserved, true);
assert.equal(model.baseline9BPreserved, true);
assert.equal(model.baseline9APreserved, true);
assert.equal(model.baseline8ZPreserved, true);
assert.equal(model.baseline8YPreserved, true);
assert.equal(model.baseline8XPreserved, true);
assert.equal(model.baseline8WPreserved, true);
assert.equal(model.baseline8VThrough6XPreserved, true);

assert.equal(model.exportBudgetCushionMode, "export_compaction_only");
assert.equal(model.productBudgetCushionSectionVisible, true);
assert.equal(model.exportBudgetCushionSectionVisible, true);
assert.equal(model.exportHistoryCompacted, true);
assert.equal(model.exportDetailsPreservedInProduct, true);
assert.equal(model.productHtmlAfter9I.includes("Marge export avant progressive disclosure"), true);
assert.equal(model.exportHtmlAfter9I.includes("Budget export 9I"), true);
assert.equal(model.exportHtmlAfter9I.includes("Groupes erreurs dry-run"), true);
assert.equal(model.exportHtmlAfter9I.includes("Messages cles detectes"), false);

assert.equal(model.exportReadTimeSecondsBefore9I, 799);
assert.equal(model.exportReadTimeSecondsAfter9I <= 780, true);
assert.equal(model.exportReadTimeSecondsAfter9I <= 800, true);
assert.equal(model.exportReadTimeSecondsAfter9I <= 900, true);
assert.equal(model.exportReadTimeDelta9I < 0, true);
assert.equal(model.exportBudgetCushionSeconds >= 20, true);
assert.equal(model.exportBudgetCushionStatus, "cushion_created");
assert.equal(model.exportBudgetCushionStatusCorrect, true);
assert.equal(model.exportUnder900Seconds, true);
assert.equal(model.exportUnder800Seconds, true);
assert.equal(model.exportUnder790Seconds, true);
assert.equal(model.exportUnder780Seconds, true);
assert.equal(model.exportUnder900BooleanCorrect, true);
assert.equal(model.exportUnder800BooleanCorrect, true);
assert.equal(model.exportUnder790BooleanCorrect, true);
assert.equal(model.exportUnder780BooleanCorrect, true);
assert.equal(model.exportBudgetPassStrongEligible, true);
assert.equal(model.exportBudgetRiskBefore9I, "critical");
assert.notEqual(model.exportBudgetRiskAfter9I, "critical");
assert.equal(model.exportCompactionStrategy, "compact_export_history_keep_product_detail");

assert.equal(model.exportTitleMentions9I, true);
assert.equal(model.exportHtmlAfter9I.includes("<title>Rapport coach export compact 9I - budget cushion</title>"), true);
assert.equal(model.exportMainIdIs9I, true);
assert.equal(model.exportHtmlAfter9I.includes('id="compressed-export-9i"'), true);
assert.equal(model.exportCurrentDataAttributeVisible, true);
assert.equal(model.exportHtmlAfter9I.includes('data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I"'), true);
assert.equal(model.exportCoverBadgeText, "Export compact 9I");
assert.equal(model.exportCoverBadgeCorrect, true);
assert.equal(model.metadataFalsePositiveCountAfter9I, 0);
assert.equal(model.historical9HPreserved, true);
assert.equal(model.historical9GPreserved, true);
assert.equal(model.historical9FPreserved, true);
assert.equal(model.historical9EPreserved, true);
assert.equal(model.historical9DPreserved, true);
assert.equal(model.historical9CPreserved, true);
assert.equal(model.historical9BPreserved, true);
assert.equal(model.historical9APreserved, true);
assert.equal(model.historical8Z8Y8X8WPreserved, true);

assert.equal(model.uxGroupCountFrom9H, 5);
assert.equal(model.groupedErrorCopyCountFrom9H, 19);
assert.equal(model.groupedBlockerCopyCountFrom9H, 12);
assert.equal(model.groupedRefusalCopyCountFrom9H, 8);
assert.equal(model.groupedCompatibleCaseCountFrom9H, 1);
assert.equal(model.ungroupedCopyCountFrom9H, 0);
assert.equal(model.duplicatedCopyCountFrom9H, 0);
assert.equal(model.errorCopyErrorCoverageCountFrom9E, 19);
assert.equal(model.errorCopyBlockerCoverageCountFrom9E, 12);
assert.equal(model.errorCopyBoundaryGuardCoverageCountFrom9E, 14);
assert.equal(model.errorCopyRefusalStateCoverageCountFrom9E, 8);
assert.equal(model.exportKeyMessagesDetectedCountFrom9G, 7);
assert.equal(model.exportKeyMessagesMissingCountFrom9G, 0);
assert.equal(model.warningContradictionCountAfter9H, 0);
assert.equal(model.warningContradictionCountAfter9I, 0);
assert.equal(model.warningMutualExclusionGuardPassed, true);

assert.equal(model.validationRuntimeActive, false);
assert.equal(model.payloadValidationRuntimeDetected, false);
assert.equal(model.validationExecutionCount, 0);
assert.equal(model.realPayloadReadCount, 0);
assert.equal(model.payloadCreated, false);
assert.equal(model.realPayloadInstanceCount, 0);
assert.equal(model.dryRunAcceptedPayloadCount, 0);
assert.equal(model.realInputActivated, false);
assert.equal(model.realPreviewGenerated, false);
assert.equal(model.previewActivationCount, 0);
assert.equal(model.submitCreated, false);
assert.equal(model.apiCreated, false);
assert.equal(model.backendCreated, false);
assert.equal(model.storageCreated, false);
assert.equal(model.memoryCreated, false);
assert.equal(model.draftCreated, false);
assert.equal(model.historyCreated, false);
assert.equal(model.officialTruthPromoted, false);
assert.equal(model.automaticDecisionCreated, false);
assert.equal(model.selectionDriven, false);
assert.equal(model.tacticalInstructionDriven, false);
assert.equal(model.scoreMutationCount, 0);
assert.equal(model.timelineMutationCount, 0);
assert.equal(model.scoreChangeCreationCount, 0);
assert.equal(model.eventMutationCount, 0);
assert.equal(model.sourceOfTruthSeparationPreserved, true);
assert.equal(model.matchEconomyBaselinePreserved, true);
assert.equal(model.guardrailsPreserved, true);

assert.equal(scoringRegistryEntry("SHOT_GOAL").points, 3);
assert.equal(scoringRegistryEntry("TRY_TOUCHDOWN").points, 5);
assert.equal(scoringRegistryEntry("CONVERSION_GOAL").points, 2);
assert.equal(scoringRegistryEntry("DROP_GOAL").points, 2);
assert.equal(scoringRegistryEntry("PENALTY_SHOT").active, false);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.penaltyShotInactive, true);
assert.equal(model.matchBonusEventChanged, false);
assert.equal(model.batchLiveSeparationPreserved, true);

assert.equal(model.guard.exportBudgetPassed, true);
assert.equal(model.guard.exportBudgetPassStrongEligible, true);
assert.equal(model.guard.exportBudgetCushionCreated, true);
assert.equal(model.guard.preservationPassed, true);
assert.equal(model.guard.noRuntimePassed, true);
assert.equal(model.guard.sourceOfTruthPassed, true);
assert.equal(model.guard.metadataPassed, true);
assert.deepEqual(model.guard.violations, []);

const overPreferredBudgetGuard = evaluateManualReviewPreviewPayloadDryRunExportBudgetCushionBoundary9I({
  ...model,
  exportReadTimeSecondsAfter9I: 785,
});
assert.equal(overPreferredBudgetGuard.statusRecommendation, "PARTIAL");
assert.equal(overPreferredBudgetGuard.exportBudgetCushionCreated, false);
assert.equal(overPreferredBudgetGuard.violations.includes("EXPORT_OVER_780_MARGIN_WARNING_9I"), true);

const overHardBudgetGuard = evaluateManualReviewPreviewPayloadDryRunExportBudgetCushionBoundary9I({
  ...model,
  exportReadTimeSecondsAfter9I: 901,
});
assert.equal(overHardBudgetGuard.statusRecommendation, "FAIL");
assert.equal(overHardBudgetGuard.violations.includes("EXPORT_OVER_900_9I"), true);

assert.equal(currentSprint.name.includes("Sprint 9I"), true);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-error-copy-ux-grouping-without-preview-activation-9h.md"),
  false,
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-export-budget-cushion-before-progressive-disclosure-9i.md"),
  true,
);
assert.equal(model.recommendation, "KEEP_EXPORT_BUDGET_CUSHION");
assert.equal(
  model.nextSprintRecommendation,
  "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_WITHOUT_PREVIEW_ACTIVATION",
);
assert.equal(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"), true);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel({
      baseline9H: {
        ...baseline9H,
        status: "PARTIAL",
      },
    }),
  /9I requires a PASS 9H/u,
);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel({
      baseline9H: {
        ...baseline9H,
        exportReadTimeSecondsAfter9H: 800,
      },
    }),
  /9H export baseline to be 799/u,
);

console.log("PASS manualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9I");
