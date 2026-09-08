import assert from "node:assert/strict";
import test from "node:test";
import {
  buildManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel,
  currentManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel,
  renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KValidation,
} from "./buildManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9K";
import { currentSprint } from "./share/currentSharePack";

test("Sprint 9K publishes wording score and repairs Group Views reporting", () => {
  const model = currentManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel();

  assert.equal(model.status, "PASS");
  assert.equal(model.baseline9JPreserved, true);
  assert.equal(model.baseline9IPreserved, true);
  assert.equal(model.baseline9HPreserved, true);
  assert.equal(model.baseline9GPreserved, true);
  assert.equal(model.disclosureLevelCount, 3);
  assert.equal(model.disclosureGroupCount, 5);
  assert.equal(model.groupViewCount, 5);
  assert.ok(model.misleadingGroupViewRowsBefore9K > 0);
  assert.ok(model.zeroCountGroupRowsBefore9K > 0);
  assert.equal(model.misleadingGroupViewRowsAfter9K, 0);
  assert.equal(model.zeroCountGroupRowsAfter9K, 0);
  assert.equal(model.groupViewsCorrected, true);
  assert.equal(model.groupViewTotalsMatchGlobalCounts, true);
  assert.equal(model.groupViewTotalCopiesSum, 19);
  assert.equal(model.groupViewErrorCopyCoverageSum, 19);
  assert.equal(model.groupViewBlockerCopyCoverageSum, 12);
  assert.equal(model.groupViewRefusalCopyCoverageSum, 8);
  assert.equal(model.groupViewCompatibleCaseCoverageSum, 1);
  assert.equal(model.groupViewBoundaryCoverageSum, 14);
  assert.equal(model.actionsRefuseesRefusalCopies, 8);
  assert.equal(model.compatibleCaseRowCount, 1);
  assert.equal(model.ungroupedCopyCountAfter9K, 0);
  assert.equal(model.duplicatedCopyCountAfter9K, 0);
  assert.equal(model.technicalReferencesCollapsedAllGroups, true);
  assert.equal(model.wordingReadabilityScorePublished, true);
  assert.equal(model.wordingPublishedInProduct, true);
  assert.equal(model.wordingPublishedInExport, true);
  assert.ok(model.wordingReadabilityScore >= 95);
  assert.equal(model.wordingPassThreshold, 90);
  assert.equal(model.wordingPassStrongThreshold, 95);
  assert.equal(model.wordingThresholdStatus, "pass_strong");
  assert.equal(model.wordingThresholdStatusCorrect, true);
  assert.equal(model.groupCountsPreservedFrom9H, true);
  assert.equal(model.coveragePreservedFrom9H, true);
  assert.equal(model.groupedErrorCopyCountFrom9H, 19);
  assert.equal(model.groupedBlockerCopyCountFrom9H, 12);
  assert.equal(model.groupedRefusalCopyCountFrom9H, 8);
  assert.equal(model.groupedCompatibleCaseCountFrom9H, 1);
  assert.equal(model.errorCopyCoverageFrom9H, "19/12/14/8");
  assert.equal(model.keyMessagesPreservedFrom9G, true);
  assert.equal(model.exportKeyMessagesDetectedCountFrom9G, 7);
  assert.equal(model.exportKeyMessagesMissingCountFrom9G, 0);
  assert.equal(model.warningContradictionCountAfter9K, 0);
  assert.equal(model.exportReadTimeSecondsBefore9K, 785);
  assert.ok(model.exportReadTimeSecondsAfter9K <= 790);
  assert.equal(model.exportUnder790Seconds, true);
  assert.equal(model.exportUnder800Seconds, true);
  assert.equal(model.exportBudgetPassStrongEligible, true);
  assert.equal(model.guard.noRuntimeReady, true);
  assert.equal(model.validationRuntimeActive, false);
  assert.equal(model.realPayloadReadCount, 0);
  assert.equal(model.payloadCreated, false);
  assert.equal(model.dryRunAcceptedPayloadCount, 0);
  assert.equal(model.realPreviewGenerated, false);
  assert.equal(model.previewActivationCount, 0);
  assert.equal(model.storageCreated, false);
  assert.equal(model.officialTruthPromoted, false);
  assert.equal(model.automaticDecisionCreated, false);
  assert.equal(model.selectionDriven, false);
  assert.equal(model.tacticalInstructionDriven, false);
  assert.equal(model.scoreMutationCount, 0);
  assert.equal(model.timelineMutationCount, 0);
  assert.equal(model.scoreChangeCreationCount, 0);
  assert.equal(model.eventMutationCount, 0);
  assert.equal(model.scoringConstantsChanged, false);
  assert.equal(model.penaltyShotInactive, true);
  assert.equal(model.matchBonusEventChanged, false);
  assert.equal(model.batchLiveSeparationPreserved, true);
  assert.equal(model.productSectionVisible, true);
  assert.equal(model.exportSectionVisible, true);
  assert.equal(model.exportTitleMentions9K, true);
  assert.equal(model.exportMainIdIs9K, true);
  assert.equal(model.exportCoverBadgeText, "Export compact 9K");
  assert.equal(model.historical9JPreserved, true);
  assert.equal(model.historical9IPreserved, true);
  assert.equal(model.warningCodes.includes("EXPORT_OVER_790_MARGIN_WARNING"), false);
  assert.deepEqual(model.recommendations, [
    "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE",
    "KEEP_GROUP_VIEW_REPORTING_CORRECTION",
    "KEEP_WORDING_READABILITY_SCORE_PUBLICATION",
    "PROCEED_TO_EMPTY_STATE_SPRINT",
  ]);
  assert.equal(currentSprint.name, "Sprint 9K - Progressive Disclosure Reporting Consistency Repair Before Empty States");
  assert.equal(
    currentSprint.requiredFiles.includes(
      "coach-report-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-without-preview-activation-9j.md",
    ),
    false,
  );
  assert.equal(
    currentSprint.requiredFiles.includes(
      "coach-report-manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-9k.md",
    ),
    true,
  );

  const validation = renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KValidation(model);
  assert.ok(validation.includes("Status: PASS"));
  assert.ok(validation.includes("wordingReadabilityScore published"));
  assert.ok(validation.includes("Group Views totals match global counts"));
});

test("Sprint 9K blocks missing or failed 9J baseline", () => {
  assert.throws(
    () => buildManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel({ baseline9J: null }),
    /9J progressive-disclosure baseline/u,
  );

  const baseline9J = currentManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel().baseline9J;
  assert.throws(
    () =>
      buildManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel({
        baseline9J: { ...baseline9J, status: "PARTIAL" },
      }),
    /PASS 9J/u,
  );
});
