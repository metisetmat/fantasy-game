import assert from "node:assert/strict";
import {
  buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
  renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HValidation,
} from "./buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9H";
import { buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel } from "./buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9G";
import { buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel } from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F";
import { buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import { evaluateManualReviewPreviewPayloadDryRunErrorCopyUxGroupingBoundary9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingGuard9H";
import { currentSprint } from "./share/currentSharePack";
import { scoringRegistryEntry } from "../systems/scoring";

const baseline9E = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel();
const baseline9F = buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({ baseline9E });
const baseline9G = buildManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel({ baseline9F });
const model = buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel({ baseline9G });
const validation = renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HValidation(model);

assert.equal(model.status, "PASS");
assert.equal(validation.includes("Status: PASS"), true);
assert.equal(model.version, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H");
assert.equal(model.scope, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION");
assert.equal(model.baselineVersion, "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G");

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

assert.equal(model.errorCopyUxGroupingReady, true);
assert.equal(model.uxGroupingMode, "dry_run_copy_grouping_only");
assert.equal(model.uxGroupingStatus, "grouped_without_preview_activation");
assert.equal(model.uxGroupingStatusCorrect, true);
assert.equal(model.uxGroupCount, 5);
assert.deepEqual(model.uxGroupIds, [
  "compatible_shape_group_9h",
  "payload_structure_group_9h",
  "entry_values_group_9h",
  "forbidden_boundaries_group_9h",
  "action_refusal_group_9h",
]);
assert.equal(model.groupedErrorCopyCount, 19);
assert.equal(model.groupedBlockerCopyCount, 12);
assert.equal(model.groupedRefusalCopyCount, 8);
assert.equal(model.groupedCompatibleCaseCount, 1);
assert.equal(model.ungroupedCopyCount, 0);
assert.equal(model.duplicatedCopyCount, 0);
assert.deepEqual(model.missingCopyGroupAssignments, []);
assert.deepEqual(model.duplicatedCopyGroupAssignments, []);
assert.equal(model.coverageAudit.coveragePreserved, true);
assert.equal(model.compatibleCaseStillNotAcceptedInGrouping, true);
assert.equal(model.groupingDoesNotChangeCopySemantics, true);
assert.equal(model.groupingDoesNotCreateNewErrorCopies, true);
assert.equal(model.groupingDoesNotDeleteErrorCopies, true);
assert.equal(model.groupingDoesNotChangeCoverage, true);

assert.equal(model.groups.find((group) => group.groupId === "compatible_shape_group_9h")?.label, "Forme compatible - non acceptee");
assert.equal(model.groups.find((group) => group.groupId === "payload_structure_group_9h")?.copyIds.includes("INVALID_PAYLOAD_SOURCE_COPY_9E"), true);
assert.equal(model.groups.find((group) => group.groupId === "entry_values_group_9h")?.copyIds.includes("INVALID_OUTCOME_VALUE_COPY_9E"), true);
assert.equal(model.groups.find((group) => group.groupId === "forbidden_boundaries_group_9h")?.copyIds.includes("OFFICIAL_TRUTH_FLAG_FORBIDDEN_COPY_9E"), true);
assert.equal(model.groups.find((group) => group.groupId === "action_refusal_group_9h")?.copyIds.includes("REFUSE_REAL_PREVIEW_GENERATION_COPY_9E"), true);

for (const group of model.groups) {
  assert.equal(group.visibleInProduct, true);
  assert.equal(group.visibleInExport, true);
  assert.equal(group.canValidatePayloadIn9H, false);
  assert.equal(group.canAcceptPayloadIn9H, false);
  assert.equal(group.canGeneratePreviewIn9H, false);
  assert.equal(group.canPersistIn9H, false);
  assert.equal(group.canPromoteOfficialTruthIn9H, false);
  assert.equal(group.canDriveDecisionIn9H, false);
  assert.equal(group.canDriveSelectionIn9H, false);
  assert.equal(group.canDriveTacticIn9H, false);
  assert.equal(group.canMutateMatchIn9H, false);
}

assert.equal(model.coachFacingErrorCopyCountFrom9E, 19);
assert.equal(model.coachFacingBlockerCopyCountFrom9E, 12);
assert.equal(model.coachFacingRefusalCopyCountFrom9E, 8);
assert.equal(model.compatibleCaseCopyCountFrom9E, 1);
assert.equal(model.errorCopyErrorCoverageCountFrom9E, 19);
assert.equal(model.errorCopyBlockerCoverageCountFrom9E, 12);
assert.equal(model.errorCopyBoundaryGuardCoverageCountFrom9E, 14);
assert.equal(model.errorCopyRefusalStateCoverageCountFrom9E, 8);
assert.equal(model.wordingReadabilityScoreFrom9E, 97);

assert.equal(model.exportKeyMessagesDetectedCountFrom9G, 7);
assert.equal(model.exportKeyMessagesMissingCountFrom9G, 0);
assert.equal(model.exportKeyMessagesPreservedFrom9G, true);
assert.equal(model.exportKeyMessagesMissingFlagFrom9G, false);
assert.equal(model.warningContradictionCountBefore9G, 1);
assert.equal(model.warningContradictionCountAfter9H, 0);
assert.equal(model.exportKeyMessagesPositiveWarningEmitted, true);
assert.equal(model.exportKeyMessagesNegativeWarningEmitted, false);
assert.equal(model.warningMutualExclusionGuardPassed, true);
assert.equal(model.warningStatusConsistencyStatus, "clean");
assert.equal(model.warningStatusConsistencyCorrect, true);

assert.equal(model.exportCompactionStatusFrom9F, "compacted_under_800");
assert.equal(model.exportCompactCopyPreservedFrom9F, true);
assert.equal(model.exportDetailedCopyRowsRemainCollapsed, true);
assert.equal(model.exportNoRuntimeGuardPreserved, true);
assert.equal(model.exportNoPayloadAcceptedGuardPreserved, true);
assert.equal(model.exportNoPreviewGuardPreserved, true);

assert.equal(model.productHtmlAfter9H.includes("Regroupement UX des erreurs dry-run"), true);
assert.equal(model.productHtmlAfter9H.includes("Forme compatible - non acceptee"), true);
assert.equal(model.productHtmlAfter9H.includes("Structure du payload"), true);
assert.equal(model.productHtmlAfter9H.includes("Valeurs d'observation"), true);
assert.equal(model.productHtmlAfter9H.includes("Frontieres interdites"), true);
assert.equal(model.productHtmlAfter9H.includes("Actions refusees"), true);
assert.equal(model.productHtmlAfter9H.includes("Cohérence warnings messages clés export"), true);
assert.equal(model.productHtmlAfter9H.includes("Messages blockers"), true);
assert.equal(model.productHtmlAfter9H.includes("Messages refusals"), true);

assert.equal(model.exportHtmlAfter9H.includes("Groupes erreurs dry-run"), true);
assert.equal(model.exportHtmlAfter9H.includes("19 erreurs, 12 blockers, 8 refus, 1 cas compatible non accepte"), true);
assert.equal(model.exportHtmlAfter9H.includes("messages clés 7/7, missing 0, contradiction 0"), true);
assert.equal(model.exportHtmlAfter9H.includes("Messages clés détectés"), false);
assert.equal(model.exportReadTimeSecondsAfter9H <= 800, true);
assert.equal(model.exportReadTimeSecondsAfter9H <= model.exportReadTimeSecondsBefore9H + 8, true);
assert.equal(model.exportUnder900Seconds, model.exportReadTimeSecondsAfter9H <= 900);
assert.equal(model.exportUnder800Seconds, model.exportReadTimeSecondsAfter9H <= 800);
assert.equal(model.exportUnder790Seconds, model.exportReadTimeSecondsAfter9H <= 790);
assert.equal(model.exportBudgetPassStrongEligible, true);
assert.equal(model.exportBudgetStrategy, "replace_previous_summary_with_grouped_summary");

assert.equal(model.exportTitleMentions9H, true);
assert.equal(model.exportHtmlAfter9H.includes("<title>Rapport coach export compact 9H - error copy UX grouping</title>"), true);
assert.equal(model.exportMainIdIs9H, true);
assert.equal(model.exportHtmlAfter9H.includes('id="compressed-export-9h"'), true);
assert.equal(model.exportCurrentDataAttributeVisible, true);
assert.equal(model.exportHtmlAfter9H.includes('data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"'), true);
assert.equal(model.exportCoverBadgeText, "Export compact 9H");
assert.equal(model.exportCoverBadgeCorrect, true);
assert.equal(model.metadataFalsePositiveCountAfter9H, 0);
assert.equal(model.historical9GPreserved, true);
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

assert.equal(model.groupingWordingReadOnlyVisible, true);
assert.equal(model.groupingWordingNonRuntimeVisible, true);
assert.equal(model.groupingWordingNoPayloadAcceptedVisible, true);
assert.equal(model.groupingWordingNoPreviewVisible, true);
assert.equal(model.groupingWordingNoSubmitApiBackendVisible, true);
assert.equal(model.groupingWordingNoOfficialTruthVisible, true);
assert.equal(model.groupingWordingNoSelectionTacticVisible, true);
assert.equal(model.groupingWordingNoScoreTimelineMutationVisible, true);
assert.equal(model.groupingWordingNotAFormVisible, true);
assert.equal(model.groupingWordingNotAValidatorVisible, true);
assert.equal(model.groupingWordingNotDecisionReadyVisible, true);
assert.equal(model.wordingReadabilityScore >= 95, true);
assert.equal(model.wordingThresholdStatus, "pass_strong");
assert.equal(model.validationActiveClaimCount, 0);
assert.equal(model.payloadAcceptedClaimCount, 0);
assert.equal(model.previewGeneratedClaimCount, 0);
assert.equal(model.actionInstructionWordingCount, 0);
assert.equal(model.selectionInstructionWordingCount, 0);
assert.equal(model.tacticalInstructionWordingCount, 0);

assert.equal(model.guard.groupingAllowed, true);
assert.equal(model.guard.groupingComplete, true);
assert.equal(model.guard.exportBudgetPassed, true);
assert.equal(model.guard.exportBudgetPassStrongEligible, true);
assert.equal(model.guard.warningConsistencyPreserved, true);
assert.deepEqual(model.guard.violations, []);

const overBudgetGuard = evaluateManualReviewPreviewPayloadDryRunErrorCopyUxGroupingBoundary9H({
  ...model,
  exportReadTimeSecondsAfter9H: 850,
});
assert.equal(overBudgetGuard.statusRecommendation, "PARTIAL");
assert.equal(overBudgetGuard.exportBudgetPassStrongEligible, false);

const keyMessageOnlyExportBefore9H = [
  "<!doctype html>",
  "<html>",
  "<head><title>Rapport coach export compact 9G - key messages warning consistency</title></head>",
  "<body>",
  '<header><span class="badge">Export compact 9G</span></header>',
  '<main id="compressed-export-9g" data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G">',
  '<section id="manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-export-9g">',
  "<p>Source non autorisee. Scope incorrect. Official truth interdite. Stockage/API interdit.</p>",
  "<p>Mutation score/timeline interdite. Automation interdite. Engine learning interdit.</p>",
  "</section>",
  "</main>",
  "</body>",
  "</html>",
].join("\n");
const keyMessageRegressionModel = buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel({
  baseline9G,
  exportHtmlBefore9H: keyMessageOnlyExportBefore9H,
});
assert.equal(keyMessageRegressionModel.status, "FAIL");
assert.equal(keyMessageRegressionModel.exportKeyMessagesDetectedCountFrom9G < 7, true);
assert.equal(keyMessageRegressionModel.exportKeyMessagesMissingCountFrom9G > 0, true);
assert.equal(keyMessageRegressionModel.exportKeyMessagesPreservedFrom9G, false);
assert.equal(keyMessageRegressionModel.warningCodes.includes("EXPORT_KEY_MESSAGES_9G_REGRESSED_9H"), true);
const keyMessageRegressionProductSection =
  keyMessageRegressionModel.productHtmlAfter9H.match(
    /<section id="manual-review-preview-payload-dry-run-error-copy-ux-grouping-9h"[\s\S]*?<\/section>/u,
  )?.[0] ?? "";
assert.equal(keyMessageRegressionProductSection.includes("<h3>Statut</h3><p>FAIL."), true);
assert.equal(keyMessageRegressionProductSection.includes("<h3>Statut</h3><p>PASS."), false);

assert.equal(scoringRegistryEntry("SHOT_GOAL").points, 3);
assert.equal(scoringRegistryEntry("TRY_TOUCHDOWN").points, 5);
assert.equal(scoringRegistryEntry("CONVERSION_GOAL").points, 2);
assert.equal(scoringRegistryEntry("DROP_GOAL").points, 2);
assert.equal(scoringRegistryEntry("PENALTY_SHOT").active, false);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.penaltyShotInactive, true);
assert.equal(model.matchBonusEventChanged, false);
assert.equal(model.batchLiveSeparationPreserved, true);

assert.equal(currentSprint.name.includes("Sprint 9H") || currentSprint.name.includes("Sprint 9I"), true);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-9g.md"),
  false,
);
assert.equal(
  currentSprint.requiredFiles.includes("coach-report-manual-review-preview-payload-dry-run-error-copy-ux-grouping-without-preview-activation-9h.md"),
  currentSprint.name.includes("Sprint 9H"),
);
assert.equal(model.recommendation, "KEEP_ERROR_COPY_UX_GROUPING");
assert.equal(
  model.nextSprintRecommendation,
  "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_WITHOUT_PREVIEW_ACTIVATION",
);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel({
      baseline9G: {
        ...baseline9G,
        status: "PARTIAL",
      },
    }),
  /9H requires a PASS 9G/u,
);

assert.throws(
  () =>
    buildManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel({
      baseline9G: {
        ...baseline9G,
        exportKeyMessagesWarningContradictionCountAfter9G: 1,
      },
    }),
  /warning contradiction after 9G/u,
);

console.log("PASS manualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9H");
