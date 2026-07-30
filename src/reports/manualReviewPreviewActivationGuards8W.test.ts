import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewNonPersistentPreviewActivationGuards8WModel,
  renderManualReviewNonPersistentPreviewActivationGuards8WValidation,
} from "./buildManualReviewNonPersistentPreviewActivationGuards8W";
import { buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel } from "./buildManualReviewFieldUxVisualReadinessWithoutPersistence8V";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewPreviewActivationGuards8W(): readonly string[] {
  const model = buildManualReviewNonPersistentPreviewActivationGuards8WModel();
  const validation = renderManualReviewNonPersistentPreviewActivationGuards8WValidation(model);
  const invalidBaseline = {
    ...buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel(),
    status: "FAIL" as const,
  };

  assertTest(model.status === "PASS", "8W model must pass.");
  assertTest(validation.includes("Status: PASS"), "8W validation must pass.");
  assertTest(model.baseline8VPreserved, "8W must preserve 8V.");
  assertTest(model.baseline8UPreserved, "8W must preserve 8U.");
  assertTest(model.baseline8TPreserved, "8W must preserve 8T.");
  assertTest(model.baseline8SPreserved, "8W must preserve 8S.");
  assertTest(model.baseline8RPreserved, "8W must preserve 8R.");
  assertTest(model.baseline8QPreserved, "8W must preserve 8Q.");
  assertTest(model.baseline8PPreserved, "8W must preserve 8P.");
  assertTest(model.baseline8OPreserved, "8W must preserve 8O.");
  assertTest(model.baseline8NPreserved, "8W must preserve 8N.");
  assertTest(model.baseline8MPreserved, "8W must preserve 8M.");
  assertTest(model.baseline8LPreserved, "8W must preserve 8L.");
  assertTest(model.baseline8KPreserved, "8W must preserve 8K.");
  assertTest(model.baseline6XPreserved, "8W must preserve 6X.");
  assertTest(model.previewActivationGuardReady, "8W activation guards must be ready.");
  assertTest(model.productPreviewActivationGuardVisible, "product must show 8W activation guards.");
  assertTest(model.exportPreviewActivationGuardVisible, "export must show 8W activation guards.");
  assertTest(model.previewActivationUsesFieldVisualReadiness8V, "8W must use 8V field visual readiness.");
  assertTest(model.previewActivationUsesInputFieldContract8U, "8W must use 8U input field contract.");
  assertTest(model.activationConditionCount >= 20, "8W must define at least twenty activation conditions.");
  assertTest(model.blockingGuardCount === 12, "8W must define twelve blocking guards.");
  assertTest(model.refusalStateCount === 6, "8W must define six refusal states.");
  assertTest(model.previewActivationStatus === "documented_but_blocked", "8W preview activation status must be documented_but_blocked.");
  assertTest(model.previewActivationStatusCorrect, "8W preview activation status must match expected status.");
  assertTest(model.nonPersistentPreviewModeDefined, "8W must define non-persistent preview mode.");
  assertTest(!model.nonPersistentPreviewModeActivated, "8W must not activate non-persistent preview mode.");
  assertTest(!model.realInputActivated, "8W must not activate real input.");
  assertTest(!model.payloadCreated, "8W must not create payload.");
  assertTest(!model.realPreviewGenerated, "8W must not generate a real preview.");
  assertTest(!model.submitCreated, "8W must not create submit.");
  assertTest(!model.apiCreated, "8W must not create API.");
  assertTest(!model.backendCreated, "8W must not create backend.");
  assertTest(!model.storageCreated, "8W must not create storage.");
  assertTest(!model.memoryCreated, "8W must not create memory.");
  assertTest(!model.officialTruthPromoted, "8W must not promote official truth.");
  assertTest(!model.automaticDecisionCreated, "8W must not create automatic decisions.");
  assertTest(!model.selectionDriven, "8W must not drive selection.");
  assertTest(!model.tacticalInstructionDriven, "8W must not drive tactical instruction.");
  assertTest(model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", "8R readiness must remain ready_for_non_persistent_preview.");
  assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q gate must remain needs_completion.");
  assertTest(model.readinessDistinctFromReviewGateStillVisible, "8R readiness and 8Q gate must remain distinct.");
  assertTest(model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", "8V visual readiness must remain static.");
  assertTest(model.fieldVisualDistinctFromPreviewActivation, "field visual readiness must remain distinct from preview activation.");
  assertTest(model.microWordingDebt8VFixed, "8W must fix the 8V micro wording debt.");
  assertTest(model.export8VWorkflowLabelCorrected, "8W export must label readiness as 8R.");
  assertTest(model.export8SLabelStillSkeletonOnly, "8S must remain a skeleton-only label.");
  assertTest(model.productHtmlAfter8W.includes('id="manual-review-preview-activation-guards-8w"'), "product must contain 8W section.");
  assertTest(model.exportHtmlAfter8W.includes('id="manual-review-preview-activation-guards-export-8w"'), "export must contain 8W section.");
  assertTest(model.exportHtmlAfter8W.includes('data-manual-review-preview-activation-guards-version="8W"'), "export must carry 8W metadata.");
  assertTest(model.exportHtmlAfter8W.includes('id="compressed-export-8w"'), "main id must be compressed-export-8w.");
  assertTest(!model.exportHtmlAfter8W.includes('id="compressed-export-8v"'), "main id must no longer be compressed-export-8v.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.exportUnder800Seconds, "export must remain under 800 seconds.");
  assertTest(model.sourceOfTruthSeparationPreserved, "source-of-truth separation must remain preserved.");
  assertTest(model.matchEconomyBaselinePreserved, "match economy baseline must remain preserved.");
  assertTest(model.guardrailsPreserved, "guardrails must remain preserved.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");
  assertTest(model.warningCodes.length === 0, `8W warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(
    (() => {
      try {
        buildManualReviewNonPersistentPreviewActivationGuards8WModel({ baseline8V: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8V baseline must be blocked.",
  );

  return [
    "8W defines twenty activation conditions, twelve blocking guards, and six refusal states",
    "preview activation remains documented_but_blocked with no payload and no real preview",
    "8W fixes the 8V export wording by assigning readiness to 8R and keeping 8S skeleton-only",
    "export metadata and main id are current for 8W",
    "8V through 6X baselines, scoring constants, MatchBonusEvent, score, timeline, and source-of-truth boundaries remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewPreviewActivationGuards8W();
  console.log("manualReviewPreviewActivationGuards8W tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
