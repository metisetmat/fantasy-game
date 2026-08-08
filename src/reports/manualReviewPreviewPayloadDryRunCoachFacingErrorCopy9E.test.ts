import assert from "node:assert/strict";
import {
  buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EValidation,
} from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import { buildManualReviewExportMetadataBadgeCleanup9DModel } from "./buildManualReviewExportMetadataBadgeCleanup9D";
import { currentSprint } from "./share/currentSharePack";
import { scoringRegistryEntry } from "../systems/scoring";

const baseline9D = buildManualReviewExportMetadataBadgeCleanup9DModel();
const model = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel({
  baseline9D,
});
const validation = renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EValidation(model);

assert.notEqual(model.status, "FAIL");
assert.equal(validation.includes("Status: PASS"), true);
assert.equal(model.baseline9D.status, "PASS");
assert.equal(model.baseline9DPreserved, true);
assert.equal(model.baseline9CPreserved, true);
assert.equal(model.baseline9BPreserved, true);
assert.equal(model.baseline9APreserved, true);
assert.equal(model.baseline8ZPreserved, true);

assert.equal(model.coachFacingErrorCopyReady, true);
assert.equal(model.coachFacingErrorCopyCount, 19);
assert.equal(model.coachFacingBlockerCopyCount, 12);
assert.equal(model.coachFacingRefusalCopyCount, 8);
assert.equal(model.coachFacingBoundaryCopyCount, 14);
assert.equal(model.compatibleCaseCopyCount, 1);
assert.equal(model.coachFacingGroupCopyCount, 3);
assert.equal(model.copyGroups.some((group) => group.groupId === "compatible_but_not_accepted_copy_9e"), true);
assert.equal(model.copyGroups.some((group) => group.groupId === "validation_error_copy_9e"), true);
assert.equal(model.copyGroups.some((group) => group.groupId === "preview_blocker_copy_9e"), true);

for (const copy of [model.compatibleCopy, ...model.errorCopies, ...model.blockerCopies, ...model.refusalCopies]) {
  assert.equal(copy.title.length > 0, true);
  assert.equal(copy.shortMessage.length > 0, true);
  assert.equal(copy.whatHappened.length > 0, true);
  assert.equal(copy.stillForbidden.length > 0, true);
}

assert.equal(model.errorCopyErrorCoverageCount, 19);
assert.equal(model.errorCopyBlockerCoverageCount, 12);
assert.equal(model.errorCopyBoundaryGuardCoverageCount, 14);
assert.equal(model.errorCopyRefusalStateCoverageCount, 8);
assert.equal(model.coverageAudit.errorCopyCoverageStillComplete, true);
assert.equal(model.wordingAudit.wordingWarningCodes.includes("WORDING_SCORE_PASS_STRONG_READY"), true);
assert.equal(model.wordingReadabilityScore >= 95, true);
assert.equal(model.wordingAudit.noOfficialResultClaimCount, 0);
assert.equal(model.wordingAudit.noPayloadAcceptedClaimCount, 0);
assert.equal(model.wordingAudit.noAutomaticDecisionClaimCount, 0);
assert.equal(model.tacticalInstructionWordingCount, 0);
assert.equal(model.selectionInstructionWordingCount, 0);
assert.equal(model.storageReadyClaimCount, 0);
assert.equal(model.submitReadyClaimCount, 0);

assert.equal(model.noRuntimeAudit.noRuntimeWarningCodes.includes("ERROR_COPY_NO_RUNTIME_VALIDATION"), true);
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

assert.equal(model.exportTitleMentions9E, true);
assert.equal(model.exportHtmlAfter9E.includes("<title>Rapport coach export compact 9E - coach-facing error copy</title>"), true);
assert.equal(model.exportMainIdIs9E, true);
assert.equal(model.exportHtmlAfter9E.includes('id="compressed-export-9e"'), true);
assert.equal(model.exportMainCurrentVersionVisible, true);
assert.equal(model.exportCoverBadgeText, "Export compact 9E");
assert.equal(model.exportCoverBadgeCorrect, true);
assert.equal(model.metadataFalsePositiveCountAfter9E, 0);
assert.equal(model.bodyMentionFallbackUsedForCoverBadge, false);
assert.equal(model.exportReadTimeSecondsAfter9E <= 900, true);
assert.equal(model.exportUnder900Seconds, model.exportReadTimeSecondsAfter9E <= 900);
assert.equal(model.exportUnder800Seconds, model.exportReadTimeSecondsAfter9E <= 800);

assert.equal(model.productHtmlAfter9E.includes("Messages d'erreur coach-facing dry-run"), true);
assert.equal(model.exportHtmlAfter9E.includes("Messages erreur dry-run"), true);
assert.equal(model.productHtmlAfter9E.includes("Forme compatible - non acceptee"), true);
assert.equal(model.productHtmlAfter9E.includes("Messages blockers"), true);
assert.equal(model.productHtmlAfter9E.includes("Messages refusals"), true);
assert.equal(model.productHtmlAfter9E.includes(model.blockerCopies[0]?.title ?? "missing-blocker-title"), true);
assert.equal(model.productHtmlAfter9E.includes(model.refusalCopies[0]?.title ?? "missing-refusal-title"), true);
assert.equal(model.exportHtmlAfter9E.includes("Blockers visibles"), true);
assert.equal(model.exportHtmlAfter9E.includes("Refusals visibles"), true);
assert.equal(model.exportHtmlAfter9E.includes(model.blockerCopies[0]?.title ?? "missing-blocker-title"), true);
assert.equal(model.exportHtmlAfter9E.includes(model.refusalCopies[0]?.title ?? "missing-refusal-title"), true);
assert.equal(model.exportHtmlAfter9E.includes("Export compact 9E"), true);

assert.equal(scoringRegistryEntry("SHOT_GOAL").points, 3);
assert.equal(scoringRegistryEntry("TRY_TOUCHDOWN").points, 5);
assert.equal(scoringRegistryEntry("CONVERSION_GOAL").points, 2);
assert.equal(scoringRegistryEntry("DROP_GOAL").points, 2);
assert.equal(scoringRegistryEntry("PENALTY_SHOT").active, false);
assert.equal(model.guardrailsPreserved, true);
assert.equal(model.sourceOfTruthSeparationPreserved, true);
assert.equal(model.sourceOfTruthAudit.batchLiveSeparationPreserved, true);
assert.equal(currentSprint.name.includes("Sprint 9E"), true);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md"),
  false,
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-without-preview-activation-9e.md"),
  true,
);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel({
      baseline9D: {
        ...baseline9D,
        status: "FAIL",
      },
    }),
  /9E requires a PASS 9D metadata cleanup baseline/u,
);

console.log("PASS manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E");
