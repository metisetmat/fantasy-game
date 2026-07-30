import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel,
  renderManualReviewFieldUxVisualReadinessWithoutPersistence8VValidation,
} from "./buildManualReviewFieldUxVisualReadinessWithoutPersistence8V";
import { buildManualReviewInputFieldContractWithoutPersistence8UModel } from "./buildManualReviewInputFieldContractWithoutPersistence8U";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewFieldUxVisualReadiness8V(): readonly string[] {
  const model = buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel();
  const validation = renderManualReviewFieldUxVisualReadinessWithoutPersistence8VValidation(model);
  const invalidBaseline = {
    ...buildManualReviewInputFieldContractWithoutPersistence8UModel(),
    status: "FAIL" as const,
  };

  assertTest(model.status === "PASS", "8V model must pass.");
  assertTest(validation.includes("Status: PASS"), "8V validation must pass.");
  assertTest(model.baseline8UPreserved, "8V must preserve 8U.");
  assertTest(model.baseline8TPreserved, "8V must preserve 8T.");
  assertTest(model.baseline6XPreserved, "8V must preserve 6X.");
  assertTest(model.fieldUxVisualReadinessReady, "8V field UX visual readiness must be ready.");
  assertTest(model.productFieldUxVisualReadinessVisible, "product must show 8V visual readiness.");
  assertTest(model.exportFieldUxVisualReadinessVisible, "export must show 8V visual readiness.");
  assertTest(model.fieldUxUsesInputFieldContract8U, "8V must derive from 8U input field contract.");
  assertTest(model.visualSectionCount === 3, "8V must keep three visual sections.");
  assertTest(model.visualFieldGroupCount === 9, "8V must group fields into nine visual groups.");
  assertTest(model.visualFieldCardCount === 21, "8V must render twenty-one visual field cards.");
  assertTest(model.disabledVisualStateCount === 21, "all visual fields must be disabled.");
  assertTest(model.activeFieldCount === 0, "8V must not activate fields.");
  assertTest(model.enabledInputControlCount === 0, "8V must not render enabled controls.");
  assertTest(model.editableTextFieldCount === 0, "8V must not render editable text fields.");
  assertTest(model.enabledSelectControlCount === 0, "8V must not render enabled selects.");
  assertTest(model.enabledCheckboxControlCount === 0, "8V must not render enabled checkboxes.");
  assertTest(model.visualValidationRuleCount >= 12, "8V must show future validation rules.");
  assertTest(model.visualErrorStateCount >= 11, "8V must show future error states.");
  assertTest(model.visualRefusalStateCount === 6, "8V must show six refusal states.");
  assertTest(model.visualHelpTextCount === 21, "every visual card must have help text.");
  assertTest(model.visualFutureOnlyBadgeCount === 21, "every visual card must show future badge.");
  assertTest(model.visualDisabledBadgeCount === 21, "every visual card must show disabled badge.");
  assertTest(model.visualNonOfficialBadgeCount === 21, "every visual card must show non-official badge.");
  assertTest(model.visualNotPersistedBadgeCount === 21, "every visual card must show not-persisted badge.");
  assertTest(model.visualNotAppliedBadgeCount === 21, "every visual card must show not-applied badge.");
  assertTest(model.coachReadabilityScore >= 95, "coach readability score must be high.");
  assertTest(model.visualDensityAcceptable, "visual density must be acceptable.");
  assertTest(model.fieldGroupingCoachReadable, "field grouping must be coach-readable.");
  assertTest(model.workflowReadinessStatusFrom8S === "ready_for_non_persistent_preview", "8S readiness must remain ready.");
  assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q gate must remain needs_completion.");
  assertTest(model.readinessDistinctFromReviewGateStillVisible, "readiness and review gate must remain distinct.");
  assertTest(model.visualLayerDoesNotCreateRealInput, "8V must not create real input.");
  assertTest(model.visualLayerDoesNotCreateSubmit, "8V must not create submit.");
  assertTest(model.visualLayerDoesNotCreateApi, "8V must not create API.");
  assertTest(model.visualLayerDoesNotCreateBackend, "8V must not create backend.");
  assertTest(model.visualLayerDoesNotCreateStorage, "8V must not create storage.");
  assertTest(model.visualLayerDoesNotCreatePayload, "8V must not create payload.");
  assertTest(model.visualLayerDoesNotCreateRealPreview, "8V must not create real preview.");
  assertTest(model.visualLayerDoesNotCreateMemory, "8V must not create memory.");
  assertTest(model.visualLayerDoesNotPromoteOfficialTruth, "8V must not promote official truth.");
  assertTest(model.visualLayerDoesNotCreateAutomaticDecision, "8V must not create automatic decisions.");
  assertTest(model.visualLayerDoesNotDriveSelection, "8V must not drive selection.");
  assertTest(model.visualLayerDoesNotDriveTacticalInstruction, "8V must not drive tactical instructions.");
  assertTest(model.productHtmlAfter8V.includes('id="manual-review-field-ux-visual-readiness-8v"'), "product must contain 8V section.");
  assertTest(model.exportHtmlAfter8V.includes('id="manual-review-field-ux-visual-readiness-export-8v"'), "export must contain 8V section.");
  assertTest(model.exportHtmlAfter8V.includes('data-manual-review-field-ux-visual-readiness-version="8V"'), "export must carry 8V metadata.");
  assertTest(model.exportHtmlAfter8V.includes('id="compressed-export-8v"'), "main id must be compressed-export-8v.");
  assertTest(!model.exportHtmlAfter8V.includes('id="compressed-export-8u"'), "main id must no longer be compressed-export-8u.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.exportUnder800Seconds, "export must remain under 800 seconds.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");
  assertTest(model.warningCodes.length === 0, `8V warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(
    (() => {
      try {
        buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel({ baseline8U: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8U baseline must be blocked.",
  );

  return [
    "8V renders three visual sections, nine groups, and twenty-one static field cards",
    "all cards remain disabled, read-only, non-official, not-persisted, and not-applied",
    "8V creates no input, submit, API, backend, storage, memory, payload, preview, official truth, selection, or tactic",
    "export metadata and main id are current for 8V",
    "8U through 6X baselines, scoring constants, MatchBonusEvent, score, timeline, and source-of-truth boundaries remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewFieldUxVisualReadiness8V();
  console.log("manualReviewFieldUxVisualReadiness8V tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
