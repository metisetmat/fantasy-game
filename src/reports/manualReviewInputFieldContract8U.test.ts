import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewInputFieldContractWithoutPersistence8UModel,
  renderManualReviewInputFieldContractWithoutPersistence8UValidation,
} from "./buildManualReviewInputFieldContractWithoutPersistence8U";
import { buildManualReviewUxInteractionContractWithoutPersistence8TModel } from "./buildManualReviewUxInteractionContractWithoutPersistence8T";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewInputFieldContract8U(): readonly string[] {
  const model = buildManualReviewInputFieldContractWithoutPersistence8UModel();
  const validation = renderManualReviewInputFieldContractWithoutPersistence8UValidation(model);
  const invalidBaseline = {
    ...buildManualReviewUxInteractionContractWithoutPersistence8TModel(),
    status: "FAIL" as const,
  };
  const baseline8T = buildManualReviewUxInteractionContractWithoutPersistence8TModel();
  const exportBetween800And900 = `${baseline8T.exportHtmlAfter8T}<section>${Array.from({ length: 550 }, () => "mot").join(" ")}</section>`;
  const oversizedButUnderHardLimit = buildManualReviewInputFieldContractWithoutPersistence8UModel({
    baseline8T,
    productHtmlBefore8U: baseline8T.productHtmlAfter8T,
    exportHtmlBefore8U: exportBetween800And900,
  });
  const sectionLinks = model.contract.fieldSections.map((section) =>
    [
      section.linked8MReviewSectionId,
      section.linked8LObservationCardId,
      section.linked8KDecisionCardId,
    ].join("|"),
  );

  assertTest(model.status === "PASS", "8U model must pass.");
  assertTest(validation.includes("Status: PASS"), "8U validation must pass.");
  assertTest(model.baseline8TPreserved, "8U must preserve 8T.");
  assertTest(model.baseline8SPreserved, "8U must preserve 8S.");
  assertTest(model.inputFieldContractReady, "8U input field contract must be ready.");
  assertTest(model.productInputFieldContractVisible, "product must show the input field contract.");
  assertTest(model.exportInputFieldContractVisible, "export must show the input field contract.");
  assertTest(model.inputFieldContractUsesInteractionContract8T, "8U must use the 8T interaction contract.");
  assertTest(model.sectionCount === 3, "8U must define three sections.");
  assertTest(
    sectionLinks.join("/") ===
      "manual-review-first-exit-after-recovery-8l|outcome-first-exit-after-recovery-8l|decision-first-exit-after-recovery-8k/manual-review-danger-continuity-8l|outcome-danger-continuity-8l|decision-danger-continuity-8k/manual-review-structure-after-neutralized-action-8l|outcome-structure-after-neutralized-action-8l|decision-structure-after-pressure-8k",
    "8U section links must use canonical 8M/8L/8K IDs.",
  );
  assertTest(model.fieldCount === 21, "8U must define twenty-one fields.");
  assertTest(model.disabledFieldCount === 21, "all 8U fields must be disabled.");
  assertTest(model.activeFieldCount === 0, "8U must not activate fields.");
  assertTest(model.enabledInputControlCount === 0, "8U must not render enabled controls.");
  assertTest(model.editableTextFieldCount === 0, "8U must not render editable text fields.");
  assertTest(model.enabledSelectControlCount === 0, "8U must not render enabled selects.");
  assertTest(model.enabledCheckboxControlCount === 0, "8U must not render enabled checkboxes.");
  assertTest(model.validationRuleCount >= 12, "8U must document at least twelve future validation rules.");
  assertTest(model.activeValidationRuleCount === 0, "8U validation rules must be inactive.");
  assertTest(model.errorStateCount >= 11, "8U must document at least eleven error states.");
  assertTest(model.activeErrorStateCount === 0, "8U error states must be inactive.");
  assertTest(model.refusalStateCount === 6, "8U must define six refusal states.");
  assertTest(model.activationRequirementCount === 14, "8U must define fourteen activation requirements.");
  assertTest(model.contract.fields.every((field) => field.disabledIn8U && !field.activeIn8U && field.readOnlyIn8U), "every 8U field must be disabled, inactive, and read-only.");
  assertTest(model.contract.fields.every((field) => !field.canSubmitIn8U && !field.canPersistIn8U && !field.canCallApiIn8U), "fields must not submit, persist, or call API.");
  assertTest(model.contract.fields.every((field) => !field.canPromoteOfficialTruthIn8U && !field.canDriveSelectionIn8U && !field.canDriveTacticalInstructionIn8U), "fields must not promote truth, selection, or tactic.");
  assertTest(model.workflowReadinessStatusFrom8S === "ready_for_non_persistent_preview", "8S readiness must remain ready_for_non_persistent_preview.");
  assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q gate must remain needs_completion.");
  assertTest(model.contractDoesNotCreateRealInput, "8U must not create real input.");
  assertTest(model.contractDoesNotCreateSubmit, "8U must not create submit.");
  assertTest(model.contractDoesNotCreateApi, "8U must not create API calls.");
  assertTest(model.contractDoesNotCreateBackend, "8U must not create backend action.");
  assertTest(model.contractDoesNotCreateStorage, "8U must not create storage.");
  assertTest(model.contractDoesNotCreateMemory, "8U must not create memory.");
  assertTest(model.contractDoesNotCreatePayload, "8U must not create payloads.");
  assertTest(model.contractDoesNotCreateRealPreview, "8U must not create real previews.");
  assertTest(model.contractDoesNotPromoteOfficialTruth, "8U must not promote official truth.");
  assertTest(model.contractDoesNotCreateAutomaticDecision, "8U must not create automatic decisions.");
  assertTest(model.contractDoesNotDriveSelection, "8U must not drive selection.");
  assertTest(model.contractDoesNotDriveTacticalInstruction, "8U must not drive tactic.");
  assertTest(model.productHtmlAfter8U.includes("Contrat des champs de saisie"), "product must contain 8U field contract section.");
  assertTest(model.exportHtmlAfter8U.includes("Contrat champs revue manuelle"), "export must contain 8U field contract section.");
  assertTest(model.exportHtmlAfter8U.includes('data-manual-review-input-field-contract-version="8U"'), "export must carry 8U metadata.");
  assertTest(model.exportHtmlAfter8U.includes('id="compressed-export-8u"'), "main id must be compressed-export-8u.");
  assertTest(!model.exportHtmlAfter8U.includes('id="compressed-export-8t"'), "main id must no longer be compressed-export-8t.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(
    oversizedButUnderHardLimit.exportBudgetAudit.exportReadTimeSecondsAfter8U > 800,
    "oversized fixture must exceed 800 seconds.",
  );
  assertTest(
    oversizedButUnderHardLimit.exportBudgetAudit.exportReadTimeSecondsAfter8U <= 900,
    "oversized fixture must remain under hard 900-second limit.",
  );
  assertTest(
    oversizedButUnderHardLimit.status === "PARTIAL",
    "8U model must downgrade 801-900 second exports to PARTIAL.",
  );
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(model.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.warningCodes.length === 0, `8U warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(
    (() => {
      try {
        buildManualReviewInputFieldContractWithoutPersistence8UModel({ baseline8T: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8T baseline must be blocked.",
  );

  return [
    "8U defines three future manual-review field sections and twenty-one disabled fields",
    "all future validation rules and error states remain documented but inactive",
    "8U creates no input, submit, API, backend, storage, memory, payload, preview, official truth, selection, or tactic",
    "export metadata and main id are current for 8U",
    "8T through 6X baselines, scoring constants, MatchBonusEvent, score, timeline, and source-of-truth boundaries remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewInputFieldContract8U();
  console.log("manualReviewInputFieldContract8U tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
