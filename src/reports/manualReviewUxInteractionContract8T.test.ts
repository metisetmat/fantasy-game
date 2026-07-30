import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewUxInteractionContractWithoutPersistence8TModel,
  renderManualReviewUxInteractionContractWithoutPersistence8TValidation,
} from "./buildManualReviewUxInteractionContractWithoutPersistence8T";
import { buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel } from "./buildManualReviewWorkflowUxSkeletonWithoutPersistence8S";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewUxInteractionContract8T(): readonly string[] {
  const model = buildManualReviewUxInteractionContractWithoutPersistence8TModel();
  const validation = renderManualReviewUxInteractionContractWithoutPersistence8TValidation(model);
  const invalidBaseline = {
    ...buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel(),
    status: "FAIL" as const,
  };

  assertTest(model.status === "PASS", "8T model must pass.");
  assertTest(validation.includes("Status: PASS"), "8T validation must pass.");
  assertTest(model.baseline8SPreserved, "8T must preserve 8S.");
  assertTest(model.interactionContractReady, "8T interaction contract must be ready.");
  assertTest(model.productInteractionContractVisible, "product must show interaction contract.");
  assertTest(model.exportInteractionContractVisible, "export must show interaction contract.");
  assertTest(model.interactionContractUsesUxSkeleton8S, "8T must use the 8S UX skeleton.");
  assertTest(model.interactionContractStepCount === 6, "8T must create six interaction steps.");
  assertTest(model.contract.interactionSteps.map((step) => step.sourceVersion).join("/") === "8M/8N/8O/8P/8Q/8R", "8T steps must be 8M/8N/8O/8P/8Q/8R.");
  for (const step of model.contract.interactionSteps) {
    assertTest(step.blockedIn8T, "each step must be blocked in 8T.");
    assertTest(!step.canBeActivatedIn8T, "each step must not be activatable in 8T.");
    assertTest(!step.canSubmitIn8T, "each step must not submit in 8T.");
    assertTest(!step.canPersistIn8T, "each step must not persist in 8T.");
    assertTest(!step.canCallApiIn8T, "each step must not call API in 8T.");
    assertTest(!step.canPromoteOfficialTruthIn8T, "each step must not promote official truth in 8T.");
    assertTest(!step.canDriveSelectionIn8T, "each step must not drive selection in 8T.");
    assertTest(!step.canDriveTacticalInstructionIn8T, "each step must not drive tactical instruction in 8T.");
  }
  assertTest(model.futureInteractionCount === 6, "8T must define six future interactions.");
  assertTest(model.blockedInteractionCount === 6, "all future interactions must be blocked.");
  assertTest(model.enabledInteractionCount === 0, "8T must not enable interactions.");
  assertTest(model.refusalStateCount === 6, "8T must define six refusal states.");
  assertTest(model.storageDecisionDeferredVisible, "storage decision must remain deferred.");
  assertTest(model.permissionsDecisionDeferredVisible, "permissions decision must remain deferred.");
  assertTest(model.officializationDecisionDeferredVisible, "officialization decision must remain deferred.");
  assertTest(model.disabledStateAudit.enabledCtaCount === 0, "8T must have no enabled CTA.");
  assertTest(model.disabledStateAudit.submitButtonCount === 0, "8T must have no submit button.");
  assertTest(model.disabledStateAudit.enabledSubmitButtonCount === 0, "8T must have no enabled submit button.");
  assertTest(model.disabledStateAudit.backendActionCount === 0, "8T must have no backend action.");
  assertTest(model.disabledStateAudit.apiCallCount === 0, "8T must have no API call.");
  assertTest(model.nonPersistenceAudit.localStoragePersistenceCount === 0, "8T must have no localStorage persistence.");
  assertTest(model.nonPersistenceAudit.databasePersistenceCount === 0, "8T must have no database persistence.");
  assertTest(model.nonPersistenceAudit.filePersistenceCount === 0, "8T must have no file persistence.");
  assertTest(model.nonPersistenceAudit.memoryCreationCount === 0, "8T must have no memory creation.");
  assertTest(model.boundaryAudit.officialTruthPromotionCount === 0, "8T must not promote official truth.");
  assertTest(model.boundaryAudit.automaticDecisionCount === 0, "8T must not create automatic decisions.");
  assertTest(model.boundaryAudit.selectionRecommendationCount === 0, "8T must not drive selection.");
  assertTest(model.boundaryAudit.tacticalInstructionCount === 0, "8T must not drive tactics.");
  assertTest(model.workflowReadinessStatusFrom8S === "ready_for_non_persistent_preview", "8S readiness must remain ready_for_non_persistent_preview.");
  assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q gate must remain needs_completion.");
  assertTest(model.readinessDistinctFromReviewGateStillVisible, "workflow readiness and review gate must remain distinct.");
  assertTest(model.sourceOfTruthRegressionAudit.manualInteractionDoesNotMutateScore, "8T must not mutate score.");
  assertTest(model.sourceOfTruthRegressionAudit.manualInteractionDoesNotMutateTimeline, "8T must not mutate timeline.");
  assertTest(model.sourceOfTruthRegressionAudit.manualInteractionDoesNotCreateScoreChange, "8T must not create score changes.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.exportHtmlAfter8T.includes("Contrat UX revue manuelle"), "export must contain the 8T interaction contract section.");
  assertTest(model.exportMetadataAudit.exportTitleMentions8T, "export title must mention 8T.");
  assertTest(model.exportMetadataAudit.exportVisibleBadgeMentions8T, "export badge must mention 8T.");
  assertTest(!model.exportMetadataAudit.exportMainIdStillCompressedExport8S, "main id must no longer be compressed-export-8s.");
  assertTest(model.exportHtmlAfter8T.includes('id="compressed-export-8t"'), "main id must be compressed-export-8t.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.productHtmlAfter8T.includes("Contrat d'interaction UX"), "product must contain the 8T interaction contract section.");
  assertTest(model.warningCodes.length === 0, `8T warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(
    (() => {
      try {
        buildManualReviewUxInteractionContractWithoutPersistence8TModel({ baseline8S: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8S baseline must be blocked.",
  );

  return [
    "8T renders a six-step future interaction contract from a valid 8S UX skeleton",
    "all future interactions are documented_but_blocked with refusal states and deferred decisions",
    "8T creates no submit, API, backend, persistence, memory, official truth, selection, or tactic",
    "export metadata and main id are current for 8T",
    "scoring constants, MatchBonusEvent, score, timeline, and source-of-truth boundaries remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewUxInteractionContract8T();
  console.log("manualReviewUxInteractionContract8T tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
