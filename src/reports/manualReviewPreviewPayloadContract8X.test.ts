import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadContractWithoutPersistence8XModel,
  renderManualReviewPreviewPayloadContractWithoutPersistence8XValidation,
} from "./buildManualReviewPreviewPayloadContractWithoutPersistence8X";

function assertTest(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const model = buildManualReviewPreviewPayloadContractWithoutPersistence8XModel();
const validation = renderManualReviewPreviewPayloadContractWithoutPersistence8XValidation(model);

assertTest(model.status === "PASS", `8X model must pass, got ${model.status}: ${model.warningCodes.join(", ")}`);
assertTest(validation.includes("Status: PASS"), "8X validation must show Status: PASS.");
assertTest(model.payloadContractStatus === "documented_but_not_instantiated", "8X payload contract must remain documented but not instantiated.");
assertTest(model.payloadSource === "manual_non_official", "8X payload source must be manual_non_official.");
assertTest(model.payloadScope === "preview_only", "8X payload scope must be preview_only.");
assertTest(!model.payloadCreated, "8X must not create a payload.");
assertTest(model.realPayloadInstanceCount === 0, "8X must not instantiate a payload.");
assertTest(!model.realInputActivated, "8X must not activate real inputs.");
assertTest(!model.realPreviewGenerated, "8X must not generate a real preview.");
assertTest(!model.submitCreated, "8X must not create submit controls.");
assertTest(!model.apiCreated && !model.backendCreated, "8X must not create API/backend surfaces.");
assertTest(!model.storageCreated && !model.memoryCreated && !model.draftCreated && !model.historyCreated, "8X must not persist.");
assertTest(!model.officialTruthPromoted, "8X must not promote official truth.");
assertTest(!model.automaticDecisionCreated && !model.selectionDriven && !model.tacticalInstructionDriven, "8X must not drive decisions, selections or tactics.");
assertTest(model.allowedTopLevelFieldCount === 12, "8X must expose 12 allowed top-level fields.");
assertTest(model.forbiddenTopLevelFieldCount === 16, "8X must expose 16 forbidden top-level fields.");
assertTest(model.validationRuleCount === 20 && model.activeValidationRuleCount === 0, "8X future validation rules must be inactive.");
assertTest(model.errorStateCount === 19 && model.activeErrorStateCount === 0, "8X error states must be inactive.");
assertTest(model.refusalStateCount === 7, "8X must expose 7 refusal states.");
assertTest(model.boundaryGuardCount === 14, "8X must expose 14 boundary guards.");
assertTest(model.previewActivationStatusFrom8W === "documented_but_blocked", "8W activation status must remain documented_but_blocked.");
assertTest(model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", "8V visual status must remain static review only.");
assertTest(model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", "8R readiness must remain preserved.");
assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q review gate must remain needs_completion.");
assertTest(model.exportAudit.exportTitleMentions8X, "8X export title must mention 8X.");
assertTest(model.exportAudit.exportMainCurrentVersionVisible, "8X export main metadata must be visible.");
assertTest(!model.exportAudit.exportMainIdStillCompressedExport8W, "8X export must not keep compressed-export-8w as main id.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

const leakyModel = buildManualReviewPreviewPayloadContractWithoutPersistence8XModel({
  productHtmlBefore8X: `${model.baseline8W.productHtmlAfter8W}<input name="coach-note"><script>const previewPayload = new FormData(); renderRealPreview(); fetch('/api/review');</script>`,
  exportHtmlBefore8X: `${model.baseline8W.exportHtmlAfter8W}<button type="submit">Valider</button><script>localStorage.setItem('draft','x'); timeline.push({});</script>`,
});
assertTest(leakyModel.status === "FAIL", "8X leak scenario must fail.");
assertTest(leakyModel.payloadCreated, "8X leak scenario must detect payload creation.");
assertTest(leakyModel.realPreviewGenerated, "8X leak scenario must detect real preview generation.");
assertTest(leakyModel.submitCreated, "8X leak scenario must detect submit creation.");
assertTest(leakyModel.apiCreated, "8X leak scenario must detect API creation.");
assertTest(leakyModel.storageCreated, "8X leak scenario must detect storage creation.");
assertTest(leakyModel.timelineMutationCount > 0, "8X leak scenario must detect timeline mutation.");

const missingPredecessorModel = buildManualReviewPreviewPayloadContractWithoutPersistence8XModel({
  baseline8W: model.baseline8W,
  productHtmlBefore8X: "<main></main>",
  exportHtmlBefore8X: '<main id="compressed-export-8w"></main>',
});
assertTest(missingPredecessorModel.status === "FAIL", "8X must fail when predecessor guard sections are missing.");
assertTest(!missingPredecessorModel.payloadAudit.usesActivationGuards8W, "8X must detect missing 8W activation guards.");
assertTest(!missingPredecessorModel.payloadAudit.usesFieldVisualReadiness8V, "8X must detect missing 8V visual readiness.");
assertTest(!missingPredecessorModel.payloadAudit.usesInputFieldContract8U, "8X must detect missing 8U input contract.");
assertTest(
  missingPredecessorModel.warningCodes.includes("PRODUCT_PREVIEW_ACTIVATION_GUARDS_8W_REGRESSED"),
  "8X missing predecessor scenario must emit an 8W regression warning.",
);

console.log("PASS manualReviewPreviewPayloadContract8X");
