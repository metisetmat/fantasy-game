import assert from "node:assert/strict";
import {
  buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel,
  renderManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GValidation,
} from "./buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9G";
import { buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel } from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F";
import { buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import { auditManualReviewPreviewPayloadDryRunExportKeyMessages9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesAudit9G";
import { evaluateManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistency9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuard9G";
import { currentSprint } from "./share/currentSharePack";
import { scoringRegistryEntry } from "../systems/scoring";

const baseline9E = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel();
const baseline9F = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
  baseline9E,
});
const model = buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel({
  baseline9F,
});
const validation = renderManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GValidation(model);

assert.equal(model.status, "PASS");
assert.equal(validation.includes("Status: PASS"), true);
assert.equal(model.version, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G");
assert.equal(model.scope, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR");
assert.equal(model.baselineVersion, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F");

assert.equal(baseline9F.warningCodes.includes("EXPORT_KEY_MESSAGES_PRESERVED"), true);
assert.equal(baseline9F.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING"), true);
assert.equal(model.exportKeyMessagesWarningContradictionCountBefore9G, 1);
assert.equal(model.exportKeyMessagesWarningContradictionCountAfter9G, 0);

assert.equal(model.exportKeyMessagesExpectedCount, 7);
assert.equal(model.exportKeyMessagesDetectedCount, 7);
assert.equal(model.exportKeyMessagesMissingCount, 0);
assert.deepEqual(model.exportKeyMessagesMissing, []);
assert.equal(model.exportKeyMessagesPreserved, true);
assert.equal(model.exportKeyMessagesMissingFlag, false);
assert.equal(model.warningCodes.includes("EXPORT_KEY_MESSAGES_PRESERVED"), true);
assert.equal(model.warningCodes.includes("EXPORT_KEY_MESSAGES_ALL_PRESENT"), true);
assert.equal(model.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING_SUPPRESSED_CORRECTLY"), true);
assert.equal(model.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING"), false);
assert.equal(model.exportKeyMessagesPositiveWarningEmitted, true);
assert.equal(model.exportKeyMessagesNegativeWarningEmitted, false);
assert.equal(model.warningMutualExclusionGuardReady, true);
assert.equal(model.warningMutualExclusionGuardPassed, true);
assert.equal(model.preservedAndMissingSimultaneousCount, 0);
assert.equal(model.warningRegistryConflictCount, 0);
assert.equal(model.warningAggregationConflictCount, 0);
assert.equal(model.warningStatusConsistencyStatus, "clean");
assert.equal(model.warningStatusConsistencyCorrect, true);

const normalizedAudit = auditManualReviewPreviewPayloadDryRunExportKeyMessages9G(`
  <section id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f">
    Source non autoris&eacute;e; scope incorrect; official truth interdite;
    stockage/API interdit; mutation score/timeline interdite;
    automation interdite; engine learning interdit.
  </section>
`);
assert.equal(normalizedAudit.detected.length, 7);
assert.equal(normalizedAudit.missing.length, 0);
assert.equal(normalizedAudit.preserved, true);
assert.equal(normalizedAudit.missingFlag, false);

const cleanGuardInput = {
  status: "PASS",
  exportKeyMessagesMissingCount: 0,
  exportReadTimeSecondsAfter9G: 700,
  exportCoverBadgeCorrect: true,
  metadataFalsePositiveCountAfter9G: 0,
  validationRuntimeActive: false,
  realPayloadReadCount: 0,
  payloadCreated: false,
  dryRunAcceptedPayloadCount: 0,
  realPreviewGenerated: false,
  previewActivationCount: 0,
  storageCreated: false,
  memoryCreated: false,
  officialTruthPromoted: false,
  selectionDriven: false,
  tacticalInstructionDriven: false,
  scoreMutationCount: 0,
  timelineMutationCount: 0,
  scoreChangeCreationCount: 0,
  eventMutationCount: 0,
  scoringConstantsChanged: false,
  matchBonusEventChanged: false,
  warningCodes: ["EXPORT_KEY_MESSAGES_PRESERVED", "EXPORT_KEY_MESSAGES_MISSING"],
} as const;
const contradictionGuard = evaluateManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistency9G(cleanGuardInput);
assert.equal(contradictionGuard.consistencyGuardPassed, false);
assert.equal(contradictionGuard.statusRecommendation, "FAIL");

const missingWithPreservedGuard = evaluateManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistency9G({
  ...cleanGuardInput,
  exportKeyMessagesMissingCount: 1,
  warningCodes: ["EXPORT_KEY_MESSAGES_PRESERVED"],
});
assert.equal(missingWithPreservedGuard.consistencyGuardPassed, false);
assert.equal(missingWithPreservedGuard.statusRecommendation, "FAIL");

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

assert.equal(model.exportReadTimeSecondsAfter9G <= 800, true);
assert.equal(model.exportUnder900Seconds, model.exportReadTimeSecondsAfter9G <= 900);
assert.equal(model.exportUnder800Seconds, model.exportReadTimeSecondsAfter9G <= 800);
assert.equal(model.exportUnder760Seconds, model.exportReadTimeSecondsAfter9G <= 760);
assert.equal(model.exportUnder900BooleanCorrect, true);
assert.equal(model.exportUnder800BooleanCorrect, true);
assert.equal(model.exportUnder760BooleanCorrect, true);
assert.equal(model.exportCompactionStatusFrom9F, "compacted_under_800");
assert.equal(model.exportBudgetPassStrongEligible, true);

assert.equal(model.coachFacingErrorCopyCountFrom9E, 19);
assert.equal(model.coachFacingBlockerCopyCountFrom9E, 12);
assert.equal(model.coachFacingRefusalCopyCountFrom9E, 8);
assert.equal(model.compatibleCaseCopyCountFrom9E, 1);
assert.equal(model.errorCopyErrorCoverageCountFrom9E, 19);
assert.equal(model.errorCopyBlockerCoverageCountFrom9E, 12);
assert.equal(model.errorCopyBoundaryGuardCoverageCountFrom9E, 14);
assert.equal(model.errorCopyRefusalStateCoverageCountFrom9E, 8);
assert.equal(model.validCaseCopyRenderedAsNotAcceptedFrom9E, true);
assert.equal(model.productCopyDetailsPreserved, true);
assert.equal(model.productHtmlAfter9G.includes("Messages blockers"), true);
assert.equal(model.productHtmlAfter9G.includes("Messages refusals"), true);
assert.equal(model.productHtmlAfter9G.includes("Correction future"), true);
assert.equal(model.exportCompactCopyPreserved, true);
assert.equal(model.exportDetailedCopyRowsRemainCollapsed, true);
assert.equal(model.exportCompatibleCasePreserved, true);
assert.equal(model.exportNoRuntimeGuardPreserved, true);
assert.equal(model.exportNoPayloadAcceptedGuardPreserved, true);
assert.equal(model.exportNoPreviewGuardPreserved, true);

assert.equal(model.exportTitleMentions9G, true);
assert.equal(model.exportHtmlAfter9G.includes("<title>Rapport coach export compact 9G - key messages warning consistency</title>"), true);
assert.equal(model.exportMainIdIs9G, true);
assert.equal(model.exportHtmlAfter9G.includes('id="compressed-export-9g"'), true);
assert.equal(model.exportCurrentDataAttributeVisible, true);
assert.equal(model.exportHtmlAfter9G.includes('data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"'), true);
assert.equal(model.exportCoverBadgeText, "Export compact 9G");
assert.equal(model.exportCoverBadgeCorrect, true);
assert.equal(model.metadataFalsePositiveCountAfter9G, 0);
assert.equal(model.bodyMentionFallbackUsedForCoverBadge, false);
assert.equal(model.historical9FPreserved, true);
assert.equal(model.historical9EPreserved, true);
assert.equal(model.historical9DPreserved, true);
assert.equal(model.historical9CPreserved, true);
assert.equal(model.historical9BPreserved, true);
assert.equal(model.historical9APreserved, true);
assert.equal(model.historical8Z8Y8X8WPreserved, true);

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

assert.equal(scoringRegistryEntry("SHOT_GOAL").points, 3);
assert.equal(scoringRegistryEntry("TRY_TOUCHDOWN").points, 5);
assert.equal(scoringRegistryEntry("CONVERSION_GOAL").points, 2);
assert.equal(scoringRegistryEntry("DROP_GOAL").points, 2);
assert.equal(scoringRegistryEntry("PENALTY_SHOT").active, false);
assert.equal(model.sourceOfTruthSeparationPreserved, true);
assert.equal(model.matchEconomyBaselinePreserved, true);
assert.equal(model.guardrailsPreserved, true);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.penaltyShotInactive, true);
assert.equal(model.matchBonusEventChanged, false);
assert.equal(model.batchLiveSeparationPreserved, true);

assert.equal(
  currentSprint.name.includes("Sprint 9G") ||
    currentSprint.name.includes("Sprint 9H") ||
    currentSprint.name.includes("Sprint 9I") ||
    currentSprint.name.includes("Sprint 9J"),
  true,
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f.md"),
  false,
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-9g.md"),
  currentSprint.name.includes("Sprint 9G"),
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-error-copy-ux-grouping-without-preview-activation-9h.md"),
  currentSprint.name.includes("Sprint 9H"),
);

assert.equal(model.exportHtmlAfter9G.includes("Cohérence messages clés"), true);
assert.equal(model.exportHtmlAfter9G.includes("Messages clés détectés"), true);
assert.equal(model.exportHtmlAfter9G.includes("Warning contradiction"), true);
assert.equal(model.productHtmlAfter9G.includes("Cohérence warnings messages clés export"), true);
assert.equal(model.recommendation, "KEEP_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR");
assert.equal(model.nextSprintRecommendation, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION");

console.log("PASS manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9G");
