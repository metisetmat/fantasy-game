import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel,
  renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation,
} from "./buildManualReviewPreviewPayloadValidationContractWithoutPersistence8Y";
import {
  auditManualReviewPreviewPayloadValidationBoundary8Y,
  auditManualReviewPreviewPayloadValidationNoRuntime8Y,
  auditManualReviewPreviewPayloadValidationNonPersistence8Y,
} from "./manualReviewPreviewPayloadValidationContractAudit8Y";
import type { ManualReviewPreviewPayloadContractWithoutPersistence8XModel } from "./manualReviewPreviewPayloadContractTypes8X";

function assertTest(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const model = buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel();
const validation = renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation(model);

assertTest(model.status === "PASS", `8Y model must pass, got ${model.status}: ${model.warningCodes.join(", ")}`);
assertTest(validation.includes("Status: PASS"), "8Y validation must show Status: PASS.");
assertTest(model.scope === "MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_WITHOUT_PERSISTENCE", "8Y scope must be explicit.");
assertTest(model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_8Y", "8Y version must be explicit.");
assertTest(model.baselineVersion === "MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_8X", "8Y must keep 8X as baseline.");
assertTest(model.validationContractStatus === "documented_but_not_executable", "8Y validation contract must not be executable.");
assertTest(!model.validationRuntimeActive, "8Y must not activate validation runtime.");
assertTest(!model.payloadValidationRuntimeDetected, "8Y must not detect payload validation runtime.");
assertTest(model.validationExecutionCount === 0, "8Y must execute zero validations.");
assertTest(model.realPayloadReadCount === 0, "8Y must read zero real payloads.");
assertTest(model.validationGroupCount === 7, "8Y must expose 7 validation groups.");
assertTest(model.orderedValidationStepCount === 10, "8Y must expose 10 ordered validation steps.");
assertTest(model.validationRuleMappingCount === 20, "8Y must expose 20 rule mappings.");
assertTest(model.errorMessageCount === 19, "8Y must expose 19 error messages.");
assertTest(model.blockerCount === 12, "8Y must expose 12 blockers.");
assertTest(model.refusalStateCount === 8, "8Y must expose 8 refusal states.");
assertTest(model.boundaryGuardCount === 14, "8Y must expose 14 boundary guards.");
assertTest(model.observationEntryContractCount === 3, "8Y must expose 3 observation entry contracts.");
assertTest(model.observationEntryExampleWordingCount === 0, "8Y main sections must not use executable example wording.");
assertTest(model.mappingAudit.unmappedRuleCount === 0, "8Y rule mapping must not leave unmapped rules.");
assertTest(model.mappingAudit.unmappedErrorCount === 0, "8Y error mapping must not leave unmapped errors.");
assertTest(model.mappingAudit.unmappedBlockerCount === 0, "8Y blocker mapping must not leave unmapped blockers.");
assertTest(model.payloadSource === "manual_non_official", "8Y payload source must remain manual_non_official.");
assertTest(model.payloadScope === "preview_only", "8Y payload scope must remain preview_only.");
assertTest(!model.payloadOfficialTruth, "8Y payload must not be official truth.");
assertTest(model.payloadPersistence === "none", "8Y payload persistence must remain none.");
assertTest(model.payloadApplication === "none", "8Y payload application must remain none.");
assertTest(!model.payloadCreated && model.realPayloadInstanceCount === 0, "8Y must create no payload instance.");
assertTest(!model.realInputActivated, "8Y must activate no real input.");
assertTest(!model.realPreviewGenerated, "8Y must generate no real preview.");
assertTest(model.noRuntimeAudit.submitButtonCount === 0, "8Y must create no submit button.");
assertTest(model.noRuntimeAudit.backendActionCount === 0, "8Y must create no backend action.");
assertTest(model.noRuntimeAudit.apiCallCount === 0, "8Y must create no API call.");
assertTest(model.nonPersistenceAudit.localStoragePersistenceCount === 0, "8Y must create no localStorage persistence.");
assertTest(model.nonPersistenceAudit.databasePersistenceCount === 0, "8Y must create no database persistence.");
assertTest(model.nonPersistenceAudit.filePersistenceCount === 0, "8Y must create no file persistence.");
assertTest(model.boundaryAudit.officialTruthPromotionCount === 0, "8Y must promote no official truth.");
assertTest(model.boundaryAudit.automaticDecisionCount === 0, "8Y must create no automatic decision.");
assertTest(model.boundaryAudit.selectionRecommendationCount === 0, "8Y must create no selection recommendation.");
assertTest(model.boundaryAudit.tacticalInstructionCount === 0, "8Y must create no tactical instruction.");
assertTest(model.scoreMutationCount === 0, "8Y must mutate no score.");
assertTest(model.timelineMutationCount === 0, "8Y must mutate no timeline.");
assertTest(model.scoreChangeCreationCount === 0, "8Y must create no score_change.");
assertTest(model.eventMutationCount === 0, "8Y must mutate no event.");
assertTest(model.productPreviewPayloadValidationContractVisible, "8Y product section must be visible.");
assertTest(model.exportPreviewPayloadValidationContractVisible, "8Y export section must be visible.");
assertTest(model.exportMetadataAudit.exportTitleMentions8Y, "8Y export title must mention 8Y.");
assertTest(!model.exportMetadataAudit.exportMainIdStillCompressedExport8X, "8Y export main id must not remain compressed-export-8x.");
assertTest(model.baseline8XPreserved && model.baseline8WPreserved && model.baseline6XPreserved, "8Y must preserve 8X through 6X baselines.");
assertTest(model.payloadContractStatusFrom8X === "documented_but_not_instantiated", "8Y must keep 8X payload contract documented but not instantiated.");
assertTest(model.previewActivationStatusFrom8W === "documented_but_blocked", "8Y must keep 8W preview activation blocked.");
assertTest(model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", "8Y must keep 8R workflow readiness.");
assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Y must keep 8Q review gate incomplete.");
assertTest(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"), "8Y validation must display the exhaustive command string.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

const failedBaseline8X = {
  ...model.baseline8X,
  status: "FAIL",
} as ManualReviewPreviewPayloadContractWithoutPersistence8XModel;
const failedBaselineModel = buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel({
  baseline8X: failedBaseline8X,
  productHtmlBefore8Y: model.baseline8X.productHtmlAfter8X,
  exportHtmlBefore8Y: model.baseline8X.exportHtmlAfter8X,
});
assertTest(failedBaselineModel.status === "FAIL", "8Y must fail when 8X baseline status is not preserved.");
assertTest(
  failedBaselineModel.warningCodes.includes("PAYLOAD_CONTRACT_STATUS_NOT_PRESERVED"),
  "8Y must emit a baseline preservation warning when 8X fails.",
);

const leaky8YProductHtml =
  '<section id="manual-review-preview-payload-validation-contract-8y"><button type="submit">Valider</button><script>validatePreviewPayload(); renderRealPreview(); automaticDecision = true;</script></section>';
const leaky8YExportHtml =
  '<section id="manual-review-preview-payload-validation-contract-export-8y"><script>localStorage.setItem("review","x"); fetch("/api/manual-review");</script></section>';
const leakyRuntimeAudit = auditManualReviewPreviewPayloadValidationNoRuntime8Y(leaky8YProductHtml, leaky8YExportHtml);
const leakyPersistenceAudit = auditManualReviewPreviewPayloadValidationNonPersistence8Y(leaky8YProductHtml, leaky8YExportHtml);
const leakyBoundaryAudit = auditManualReviewPreviewPayloadValidationBoundary8Y(leaky8YProductHtml, leaky8YExportHtml);
assertTest(leakyRuntimeAudit.payloadValidationRuntimeDetected, "8Y leak audit must detect validation runtime.");
assertTest(leakyRuntimeAudit.realPreviewGenerated, "8Y leak audit must detect real preview generation.");
assertTest(leakyRuntimeAudit.submitButtonCount > 0, "8Y leak audit must detect submit creation.");
assertTest(leakyRuntimeAudit.apiCallCount > 0, "8Y leak audit must detect API creation.");
assertTest(leakyPersistenceAudit.localStoragePersistenceCount > 0, "8Y leak audit must detect localStorage persistence.");
assertTest(leakyBoundaryAudit.automaticDecisionCount > 0, "8Y leak audit must detect automatic decision creation.");

console.log("PASS manualReviewPreviewPayloadValidationContract8Y");
