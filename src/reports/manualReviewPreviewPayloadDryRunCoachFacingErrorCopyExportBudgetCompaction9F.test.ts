import assert from "node:assert/strict";
import {
  buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FValidation,
} from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F";
import { buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import { currentSprint } from "./share/currentSharePack";
import { scoringRegistryEntry } from "../systems/scoring";

const baseline9E = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel();
const model = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
  baseline9E,
});
const validation = renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FValidation(model);

assert.equal(model.status, "PASS");
assert.equal(validation.includes("Status: PASS"), true);
assert.equal(model.baseline9EPreserved, true);
assert.equal(model.baseline9DPreserved, true);
assert.equal(model.baseline9CPreserved, true);
assert.equal(model.baseline9BPreserved, true);
assert.equal(model.baseline9APreserved, true);
assert.equal(model.baseline8ZPreserved, true);

assert.equal(model.exportReadTimeSecondsBefore9F > model.exportReadTimeSecondsAfter9F, true);
assert.equal(model.exportReadTimeSecondsAfter9F <= 900, true);
assert.equal(model.exportReadTimeSecondsAfter9F <= 800, true);
assert.equal(model.exportUnder900Seconds, model.exportReadTimeSecondsAfter9F <= 900);
assert.equal(model.exportUnder800Seconds, model.exportReadTimeSecondsAfter9F <= 800);
assert.equal(model.exportCompactionStatus, "compacted_under_800");
assert.equal(model.exportBudgetPassStrongEligible, true);
assert.equal(model.guard.statusRecommendation, "PASS");

assert.equal(model.coachFacingErrorCopyCountFrom9E, 19);
assert.equal(model.coachFacingBlockerCopyCountFrom9E, 12);
assert.equal(model.coachFacingRefusalCopyCountFrom9E, 8);
assert.equal(model.compatibleCaseCopyCountFrom9E, 1);
assert.equal(model.errorCopyErrorCoverageCountFrom9E, 19);
assert.equal(model.errorCopyBlockerCoverageCountFrom9E, 12);
assert.equal(model.errorCopyBoundaryGuardCoverageCountFrom9E, 14);
assert.equal(model.errorCopyRefusalStateCoverageCountFrom9E, 8);
assert.equal(model.productCopyDetailsPreserved, true);
assert.equal(model.productHtmlAfter9F.includes("Messages blockers"), true);
assert.equal(model.productHtmlAfter9F.includes("Messages refusals"), true);
assert.equal(model.productHtmlAfter9F.includes("Correction future"), true);
assert.equal(model.exportCopySummaryPreserved, true);
assert.equal(model.exportDetailedCopyRowsRemovedOrCollapsed, true);
assert.equal(model.exportKeyMessagesPreserved, true);
assert.equal(model.exportCompatibleCasePreserved, true);
assert.equal(model.exportNoRuntimeGuardPreserved, true);
assert.equal(model.exportNoPayloadAcceptedGuardPreserved, true);
assert.equal(model.exportNoPreviewGuardPreserved, true);

assert.equal(model.validationRuntimeActive, false);
assert.equal(model.realPayloadReadCount, 0);
assert.equal(model.payloadCreated, false);
assert.equal(model.dryRunAcceptedPayloadCount, 0);
assert.equal(model.realPreviewGenerated, false);
assert.equal(model.previewActivationCount, 0);
assert.equal(model.submitCreated, false);
assert.equal(model.apiCreated, false);
assert.equal(model.backendCreated, false);
assert.equal(model.storageCreated, false);
assert.equal(model.memoryCreated, false);
assert.equal(model.officialTruthPromoted, false);
assert.equal(model.automaticDecisionCreated, false);
assert.equal(model.selectionDriven, false);
assert.equal(model.tacticalInstructionDriven, false);
assert.equal(model.scoreMutationCount, 0);
assert.equal(model.timelineMutationCount, 0);
assert.equal(model.scoreChangeCreationCount, 0);
assert.equal(model.eventMutationCount, 0);

assert.equal(model.exportTitleMentions9F, true);
assert.equal(model.exportHtmlAfter9F.includes("<title>Rapport coach export compact 9F - error copy compaction</title>"), true);
assert.equal(model.exportMainIdIs9F, true);
assert.equal(model.exportHtmlAfter9F.includes('id="compressed-export-9f"'), true);
assert.equal(model.exportCurrentDataAttributeVisible, true);
assert.equal(model.exportCoverBadgeText, "Export compact 9F");
assert.equal(model.historical9EPreserved, true);
assert.equal(model.historical9DPreserved, true);
assert.equal(model.historical9CPreserved, true);
assert.equal(model.historical9BPreserved, true);
assert.equal(model.historical9APreserved, true);
assert.equal(model.metadataFalsePositiveCountAfter9F, 0);
assert.equal(model.bodyMentionFallbackUsedForCoverBadge, false);

assert.equal(model.exportHtmlAfter9F.includes("Blockers visibles"), false);
assert.equal(model.exportHtmlAfter9F.includes("Refusals visibles"), false);
assert.equal(model.exportHtmlAfter9F.includes("19 erreurs, 12 blockers, 8 refus"), true);
assert.equal(model.exportHtmlAfter9F.includes("aucun runtime"), true);
assert.equal(model.exportHtmlAfter9F.includes("aucun payload accepte"), true);
assert.equal(model.exportHtmlAfter9F.includes("aucune preview reelle"), true);

assert.equal(scoringRegistryEntry("SHOT_GOAL").points, 3);
assert.equal(scoringRegistryEntry("TRY_TOUCHDOWN").points, 5);
assert.equal(scoringRegistryEntry("CONVERSION_GOAL").points, 2);
assert.equal(scoringRegistryEntry("DROP_GOAL").points, 2);
assert.equal(scoringRegistryEntry("PENALTY_SHOT").active, false);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.matchBonusEventChanged, false);
assert.equal(model.batchLiveSeparationPreserved, true);
assert.equal(currentSprint.name.includes("Sprint 9F"), true);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-without-preview-activation-9e.md"),
  false,
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f.md"),
  true,
);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
      baseline9E: {
        ...baseline9E,
        coachFacingErrorCopyCount: 18,
      },
    }),
  /9F requires preserved 9E error copy counts/u,
);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
      baseline9E: {
        ...baseline9E,
        realPayloadReadCount: 1,
      },
    }),
  /9F requires a clean no-runtime/u,
);

console.log("PASS manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F");
