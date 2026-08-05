import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewValidationContractAuditConsistencyRepair8ZModel,
  renderManualReviewValidationContractAuditConsistencyRepair8ZDoc,
  renderManualReviewValidationContractAuditConsistencyRepair8ZValidation,
} from "./buildManualReviewValidationContractAuditConsistencyRepair8Z";
import { evaluateManualReviewStatusWarningConsistency8Z } from "./manualReviewStatusWarningConsistencyGuard8Z";

function assertTest(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const model = buildManualReviewValidationContractAuditConsistencyRepair8ZModel();
const doc = renderManualReviewValidationContractAuditConsistencyRepair8ZDoc(model);
const validation = renderManualReviewValidationContractAuditConsistencyRepair8ZValidation(model);

function buildOverBudgetAfterInsertionModel(): ReturnType<typeof buildManualReviewValidationContractAuditConsistencyRepair8ZModel> {
  for (let wordCount = 600; wordCount <= 5200; wordCount += 100) {
    const exportHtmlBefore8Z = `${model.baseline8Y.exportHtmlAfter8Y}<section>${Array.from({ length: wordCount }, () => "mot").join(" ")}</section>`;
    const candidate = buildManualReviewValidationContractAuditConsistencyRepair8ZModel({
      baseline8Y: model.baseline8Y,
      productHtmlBefore8Z: model.baseline8Y.productHtmlAfter8Y,
      exportHtmlBefore8Z,
    });
    if (candidate.exportReadTimeSecondsAfter8Z > 900) {
      return candidate;
    }
  }
  throw new Error("Unable to build an 8Z over-budget final export fixture.");
}

assertTest(model.status === "PASS", `8Z model must pass, got ${model.status}: ${model.warningCodes.join(", ")}`);
assertTest(validation.includes("Status: PASS"), "8Z validation must show Status: PASS.");
assertTest(model.scope === "MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR", "8Z scope must be explicit.");
assertTest(model.version === "MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR_8Z", "8Z version must be explicit.");
assertTest(model.baselineVersion === "MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_8Y", "8Z must keep 8Y as baseline.");
assertTest(model.statusAfterConsistencyRepair === "PASS_STRONG", "8Z repaired audit status must be PASS_STRONG.");
assertTest(model.wordingScoreBefore8Z === 88, "8Z must record the 8Y wording score before repair as 88.");
assertTest(model.wordingScoreAfter8Z >= 95, "8Z wording score after repair must be strong.");
assertTest(model.wordingThresholdStatusCorrect, "8Z wording threshold status must match numeric thresholds.");
assertTest(model.wordingWarningCodesCorrect, "8Z wording warning codes must be consistent with thresholds.");
assertTest(!model.productActionPlanVisibleBefore8Z, "8Z must document the 8Y product action-plan false negative.");
assertTest(!model.exportActionPlanVisibleBefore8Z, "8Z must document the 8Y export action-plan false negative.");
assertTest(!model.tacticalMapCardsVisibleBefore8Z, "8Z must document the 8Y tactical-map false negative.");
assertTest(model.productActionPlanVisibleAfter8Z, "8Z must repair product action-plan selector detection.");
assertTest(model.exportActionPlanVisibleAfter8Z, "8Z must repair export action-plan selector detection.");
assertTest(model.tacticalMapCardsVisibleAfter8Z, "8Z must repair tactical-map selector detection.");
assertTest(model.integrationAuditFalseNegativeCountBefore8Z === 3, "8Z must count the three 8Y integration false negatives before repair.");
assertTest(model.integrationAuditFalseNegativeCountAfter8Z === 0, "8Z must leave zero integration false negatives after repair.");
assertTest(model.missingWarningCountAfterRepair === 0, "8Z must have no missing warning codes after repair.");
assertTest(model.contradictoryPassWarningCountAfterRepair === 0, "8Z must have no contradictory PASS warnings after repair.");
assertTest(model.passWithFailedThresholdCount === 0, "8Z must not PASS with failed wording threshold.");
assertTest(model.passStrongWithFailedStrongThresholdCount === 0, "8Z must not PASS_STRONG with failed strong threshold.");
assertTest(model.passWithFailedCriticalAuditCount === 0, "8Z must not PASS with a failed critical audit.");
assertTest(model.statusWarningContradictionCount === 0, "8Z must have no status/warning contradictions.");
assertTest(model.warningNoneWithFailedAuditCount === 0, "8Z must not emit warnings none with failed audit.");
assertTest(!model.validationRuntimeActive, "8Z must not activate validation runtime.");
assertTest(!model.payloadValidationRuntimeDetected, "8Z must not detect payload validation runtime.");
assertTest(model.validationExecutionCount === 0, "8Z must execute zero validations.");
assertTest(model.realPayloadReadCount === 0, "8Z must read zero real payloads.");
assertTest(!model.payloadCreated && model.realPayloadInstanceCount === 0, "8Z must create no payload instance.");
assertTest(!model.realInputActivated, "8Z must activate no real input.");
assertTest(!model.realPreviewGenerated, "8Z must generate no real preview.");
assertTest(!model.submitCreated && !model.apiCreated && !model.backendCreated, "8Z must create no submit/API/backend.");
assertTest(!model.storageCreated && !model.memoryCreated && !model.draftCreated && !model.historyCreated, "8Z must create no storage, memory, draft, or history.");
assertTest(!model.officialTruthPromoted, "8Z must promote no official truth.");
assertTest(!model.automaticDecisionCreated && !model.selectionDriven && !model.tacticalInstructionDriven, "8Z must drive no automatic decision, selection, or tactic.");
assertTest(model.scoreMutationCount === 0 && model.timelineMutationCount === 0, "8Z must mutate no score or timeline.");
assertTest(model.scoreChangeCreationCount === 0 && model.eventMutationCount === 0, "8Z must create no score_change and mutate no event.");
assertTest(model.productHtmlAfter8Z.includes('id="manual-review-validation-contract-audit-consistency-repair-8z"'), "8Z product section must be visible.");
assertTest(model.exportHtmlAfter8Z.includes('id="manual-review-validation-contract-audit-consistency-repair-export-8z"'), "8Z export section must be visible.");
assertTest(model.exportMetadataCurrent8ZVisible, "8Z export metadata must be current.");
assertTest(model.exportHtmlAfter8Z.includes('id="compressed-export-8z"'), "8Z export must use compressed-export-8z.");
assertTest(!model.exportHtmlAfter8Z.includes('id="compressed-export-8y"'), "8Z export must not keep compressed-export-8y as the main id.");
assertTest(!model.exportHtmlAfter8Z.includes('id="compressed-export-8x"'), "8Z export must not keep compressed-export-8x as the main id.");
assertTest(model.baseline8YPreserved && model.baseline8XPreserved && model.baseline8WPreserved && model.baseline6XPreserved, "8Z must preserve 8Y through 6X baselines.");
assertTest(model.validationContractStatusFrom8Y === "documented_but_not_executable", "8Z must keep 8Y validation contract documented but not executable.");
assertTest(model.payloadContractStatusFrom8X === "documented_but_not_instantiated", "8Z must keep 8X payload contract documented but not instantiated.");
assertTest(model.previewActivationStatusFrom8W === "documented_but_blocked", "8Z must keep 8W preview activation blocked.");
assertTest(doc.includes("Wording Threshold Repair"), "8Z report must include wording threshold repair.");
assertTest(doc.includes("Integration Selector Repair"), "8Z report must include integration selector repair.");
assertTest(doc.includes("Status / Warnings Consistency"), "8Z report must include status/warnings consistency.");
assertTest(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"), "8Z validation must display the exhaustive command string.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

const lowWordingEvaluation = evaluateManualReviewStatusWarningConsistency8Z({
  wordingScore: 88,
  passThreshold: 90,
  passStrongThreshold: 95,
  integrationFalseNegativeCount: 0,
  criticalGuardrailViolationCount: 0,
  exportReadTimeSeconds: 300,
  exportUnder900Seconds: true,
  exportUnder800Seconds: true,
  existingWarnings: [],
});
assertTest(lowWordingEvaluation.statusRecommendation === "PARTIAL", "8Z guard must not recommend PASS for wording below 90.");
assertTest(
  lowWordingEvaluation.warningCodes.includes("WORDING_SCORE_BELOW_PASS_THRESHOLD"),
  "8Z guard must emit wording threshold warning for wording below 90.",
);

const thresholdMismatchEvaluation = evaluateManualReviewStatusWarningConsistency8Z({
  wordingScore: 96,
  passThreshold: 90,
  passStrongThreshold: 95,
  integrationFalseNegativeCount: 0,
  criticalGuardrailViolationCount: 0,
  exportReadTimeSeconds: 500,
  exportUnder900Seconds: false,
  exportUnder800Seconds: true,
  existingWarnings: [],
});
assertTest(thresholdMismatchEvaluation.statusRecommendation === "FAIL", "8Z guard must fail threshold boolean mismatches.");
assertTest(
  thresholdMismatchEvaluation.warningCodes.includes("EXPORT_UNDER_900_BOOLEAN_MISMATCH"),
  "8Z guard must emit the mismatched export-under-900 warning.",
);

const finalExportOverBudgetModel = buildOverBudgetAfterInsertionModel();
assertTest(finalExportOverBudgetModel.status === "FAIL", "8Z final over-budget export must fail after completed HTML insertion.");
assertTest(
  finalExportOverBudgetModel.warningCodes.includes("EXPORT_OVER_900"),
  "8Z final over-budget export must emit EXPORT_OVER_900.",
);

console.log("PASS manualReviewValidationContractAuditConsistencyRepair8Z");
