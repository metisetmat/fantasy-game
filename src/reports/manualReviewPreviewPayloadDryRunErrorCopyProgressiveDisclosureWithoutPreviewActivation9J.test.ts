import assert from "node:assert/strict";
import test from "node:test";
import {
  buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
  currentManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
  renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JValidation,
} from "./buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9J";
import { currentSprint } from "./share/currentSharePack";

test("Sprint 9J creates read-only progressive disclosure from 9I", () => {
  const model = currentManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel();

  assert.equal(model.status, "PASS");
  assert.equal(model.baseline9IPreserved, true);
  assert.equal(model.exportReadTimeSecondsBefore9J, 778);
  assert.equal(model.disclosureLevelCount, 3);
  assert.equal(model.summaryLevelVisible, true);
  assert.equal(model.coachDetailLevelVisible, true);
  assert.equal(model.technicalReferenceLevelVisible, true);
  assert.equal(model.technicalReferenceLevelCollapsed, true);
  assert.equal(model.disclosureGroupCount, 5);
  assert.equal(model.uxGroupCountFrom9H, 5);
  assert.equal(model.groupedErrorCopyCountFrom9H, 19);
  assert.equal(model.groupedBlockerCopyCountFrom9H, 12);
  assert.equal(model.groupedRefusalCopyCountFrom9H, 8);
  assert.equal(
    model.groupViews.reduce((total, group) => total + group.errorCopyCount, 0),
    19,
  );
  assert.equal(
    model.groupViews.reduce((total, group) => total + group.blockerCopyCount, 0),
    12,
  );
  assert.equal(
    model.groupViews.reduce((total, group) => total + group.refusalCopyCount, 0),
    8,
  );
  const compatibleGroup = model.groupViews.find((group) => group.source9HGroupId === "compatible_shape_group_9h");
  assert.equal(compatibleGroup?.compatibleCaseCount, 1);
  assert.equal(compatibleGroup?.blockerCopyCount, 1);
  assert.equal(
    model.groupViews.filter(
      (group) =>
        group.source9HGroupId !== "compatible_shape_group_9h" &&
        group.copyCount > 0 &&
        group.errorCopyCount + group.blockerCopyCount + group.refusalCopyCount === 0,
    ).length,
    0,
  );
  assert.equal(model.groupedCompatibleCaseCountFrom9H, 1);
  assert.equal(model.ungroupedCopyCountFrom9H, 0);
  assert.equal(model.duplicatedCopyCountFrom9H, 0);
  assert.equal(model.compatibleCaseStillNotAcceptedFrom9H, true);
  assert.equal(model.errorCopyCoverageFrom9H, "19/12/14/8");
  assert.equal(model.exportKeyMessagesDetectedCountFrom9G, 7);
  assert.equal(model.exportKeyMessagesMissingCountFrom9G, 0);
  assert.equal(model.warningContradictionCountAfter9J, 0);
  assert.equal(model.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING_REINTRODUCED"), false);
  assert.equal(model.baseline9FPreserved, true);
  assert.equal(model.baseline9EPreserved, true);
  assert.equal(model.productProgressiveDisclosureVisible, true);
  assert.equal(model.exportProgressiveDisclosureVisible, true);
  assert.ok(model.exportReadTimeSecondsAfter9J <= 790);
  assert.equal(model.exportHtmlAfter9J.includes("error_copy_19"), false);
  assert.equal(model.exportHtmlAfter9J.includes("blockerCopies"), false);
  assert.equal(model.exportHtmlAfter9J.includes("refusalCopies"), false);
  assert.equal(model.disclosureUsesDetailsSummaryOnly, true);
  assert.equal(model.disclosureUsesNoJavaScript, true);
  assert.equal(model.disclosureCreatesNoActiveControls, true);
  assert.equal(model.disclosureHasNoSubmitButton, true);
  assert.equal(model.disclosureHasNoEnabledInputs, true);
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
  assert.equal(model.historyCreated, false);
  assert.equal(model.officialTruthPromoted, false);
  assert.equal(model.automaticDecisionCreated, false);
  assert.equal(model.selectionDriven, false);
  assert.equal(model.tacticalInstructionDriven, false);
  assert.equal(model.scoreMutationCount, 0);
  assert.equal(model.timelineMutationCount, 0);
  assert.equal(model.scoreChangeCreationCount, 0);
  assert.equal(model.eventMutationCount, 0);
  assert.equal(model.exportUnder900Seconds, true);
  assert.equal(model.exportUnder800Seconds, true);
  assert.equal(model.exportUnder790Seconds, true);
  assert.equal(model.exportUnder900BooleanCorrect, true);
  assert.equal(model.exportUnder800BooleanCorrect, true);
  assert.equal(model.exportUnder790BooleanCorrect, true);
  assert.equal(model.warningCodes.includes("EXPORT_OVER_790_MARGIN_WARNING"), false);
  assert.equal(model.exportBudgetPassStrongEligible, true);
  assert.ok(model.wordingReadabilityScore >= 95);
  assert.equal(model.exportTitleMentions9J, true);
  assert.equal(model.exportMainIdIs9J, true);
  assert.equal(model.exportCoverBadgeText, "Export compact 9J");
  assert.equal(model.exportCurrentDataAttributeVisible, true);
  assert.equal(model.historical9IPreserved, true);
  assert.equal(model.historical9HPreserved, true);
  assert.equal(model.historical9GPreserved, true);
  assert.equal(model.historical9FPreserved, true);
  assert.equal(model.historical9EPreserved, true);
  assert.equal(model.historical8Z8Y8X8WPreserved, true);
  assert.equal(model.metadataFalsePositiveCountAfter9J, 0);
  assert.equal(model.bodyMentionFallbackUsedForCoverBadge, false);
  assert.equal(model.exportNoHiddenContentTrick, true);
  assert.equal(model.scoringConstantsChanged, false);
  assert.equal(model.penaltyShotInactive, true);
  assert.equal(model.matchBonusEventChanged, false);
  assert.equal(model.batchLiveSeparationPreserved, true);
  assert.equal(currentSprint.name, "Sprint 9J - Error Copy Progressive Disclosure Without Preview Activation");
  assert.equal(
    currentSprint.requiredFiles.includes(
      "coach-report-manual-review-preview-payload-dry-run-export-budget-cushion-before-progressive-disclosure-9i.md",
    ),
    false,
  );

  const validation = renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JValidation(model);
  assert.ok(validation.includes("Status: PASS"));
});

test("Sprint 9J blocks missing or weak 9I baselines", () => {
  assert.throws(
    () => buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel({ baseline9I: null }),
    /9I export-budget-cushion baseline/u,
  );

  const baseline9I = currentManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel().baseline9I;
  assert.throws(
    () =>
      buildManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel({
        baseline9I: { ...baseline9I, status: "PARTIAL" },
      }),
    /PASS strong 9I/u,
  );
});
