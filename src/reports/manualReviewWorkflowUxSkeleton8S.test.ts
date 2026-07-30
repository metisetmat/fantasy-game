import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel,
  renderManualReviewWorkflowUxSkeletonWithoutPersistence8SValidation,
} from "./buildManualReviewWorkflowUxSkeletonWithoutPersistence8S";
import { currentManualReviewWorkflowReadinessWithoutPersistence8RModel } from "./buildManualReviewWorkflowReadinessWithoutPersistence8R";
import { auditManualReviewWorkflowUxSafety8S } from "./manualReviewWorkflowUxSkeletonAudit8S";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewWorkflowUxSkeleton8S(): readonly string[] {
  const model = buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel();
  const validation = renderManualReviewWorkflowUxSkeletonWithoutPersistence8SValidation(model);
  const invalidBaseline = {
    ...currentManualReviewWorkflowReadinessWithoutPersistence8RModel(),
    status: "FAIL" as const,
  };
  const persistenceLeakAudit = auditManualReviewWorkflowUxSafety8S({
    workflow: model.workflow,
    productHtml: '<section id="manual-review-workflow-ux-skeleton-8s"><script>localStorage.setItem("review", "leak"); fetch("/api/review");</script><button type="submit">submit</button></section>',
    exportHtml: "",
  });

  assertTest(model.status === "PASS", "8S model must pass.");
  assertTest(validation.includes("Status: PASS"), "8S validation must pass.");
  assertTest(model.baseline8RPreserved, "8S must preserve 8R.");
  assertTest(model.workflowReadinessStatus === "ready_for_non_persistent_preview", "workflow readiness must remain ready_for_non_persistent_preview.");
  assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q gate must remain needs_completion.");
  assertTest(model.uxReadinessDistinctFromReviewGate, "workflow readiness and review gate must remain distinct.");
  assertTest(model.uxStepCount === 6, "8S must create six UX steps.");
  assertTest(model.workflow.steps.map((step) => step.sourceVersion).join("/") === "8M/8N/8O/8P/8Q/8R", "8S steps must be 8M/8N/8O/8P/8Q/8R.");
  assertTest(model.uxStepsLinkedCount === 6, "8S steps must be linked in order.");
  for (const step of model.workflow.steps) {
    assertTest(step.coachFacingLabel.length > 0, "each step must have a coach label.");
    assertTest(step.stepPurpose.length > 0, "each step must have a purpose.");
    assertTest(step.inputLabel.length > 0, "each step must have an input label.");
    assertTest(step.outputLabel.length > 0, "each step must have an output label.");
    assertTest(step.displayedState.length > 0, "each step must have a displayed state.");
    assertTest(step.guardrails.length > 0, "each step must have guardrails.");
    assertTest(!step.enabled, "each step must be disabled.");
    assertTest(!step.interactive, "each step must be non-interactive.");
    assertTest(!step.canSubmit, "each step must not submit.");
    assertTest(!step.canPersist, "each step must not persist.");
    assertTest(!step.canApply, "each step must not apply.");
    assertTest(!step.canPromoteOfficialTruth, "each step must not promote official truth.");
    assertTest(!step.canDriveSelection, "each step must not drive selection.");
    assertTest(!step.canDriveTacticalInstruction, "each step must not drive tactical instruction.");
  }
  assertTest(model.safetyAudit.disabledActionCount >= 6, "8S must expose at least six disabled actions.");
  assertTest(model.enabledCtaCount === 0, "8S must have no enabled CTA.");
  assertTest(model.submitButtonCount === 0, "8S must have no submit button.");
  assertTest(model.safetyAudit.enabledSubmitButtonCount === 0, "8S must have no enabled submit button.");
  assertTest(model.backendActionCount === 0, "8S must have no backend action.");
  assertTest(model.apiCallCount === 0, "8S must have no API call.");
  assertTest(model.localStoragePersistenceCount === 0, "8S must have no localStorage persistence.");
  assertTest(model.databasePersistenceCount === 0, "8S must have no database persistence.");
  assertTest(model.filePersistenceCount === 0, "8S must have no file persistence.");
  assertTest(model.memoryCreationCount === 0, "8S must have no memory creation.");
  assertTest(model.officialTruthPromotionCount === 0, "8S must not promote official truth.");
  assertTest(model.automaticDecisionCount === 0, "8S must not create automatic decisions.");
  assertTest(model.selectionRecommendationCount === 0, "8S must not create selection recommendations.");
  assertTest(model.tacticalInstructionCount === 0, "8S must not create tactical instructions.");
  assertTest(model.baseline8R.sourceOfTruthRegressionAudit.noScoreMutation, "8S must not mutate score.");
  assertTest(model.baseline8R.sourceOfTruthRegressionAudit.noEventDeletion, "8S must not delete events.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(model.baseline8R.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.exportUxSkeletonVisible, "export must contain the 8S UX skeleton section.");
  assertTest(model.exportAudit.exportTitleMentions8S, "export title must mention 8S.");
  assertTest(model.exportAudit.exportVisibleBadgeMentions8S, "export badge must mention 8S.");
  assertTest(model.exportAudit.exportMainCurrentVersionVisible, "export main must expose 8S metadata.");
  assertTest(!model.exportAudit.exportMainIdStillCompressedExport8R, "main id must no longer be compressed-export-8r.");
  assertTest(!model.exportAudit.exportMainIdStillCompressedExport8Q, "main id must no longer be compressed-export-8q.");
  assertTest(
    model.exportHtmlAfter8S.includes('id="compressed-export-8s"') ||
      (
        model.exportHtmlAfter8S.includes('id="compressed-export-8t"') &&
        model.exportHtmlAfter8S.includes('data-manual-review-workflow-ux-skeleton-version="8S"')
      ),
    "main id must be compressed-export-8s or a current export id that preserves 8S metadata.",
  );
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.productHtmlAfter8S.includes("Squelette UX de revue manuelle"), "product must contain the 8S UX skeleton section.");
  assertTest(model.exportHtmlAfter8S.includes("Squelette UX revue manuelle"), "export must contain the 8S compact UX skeleton section.");
  assertTest(model.warningCodes.length === 0, `8S warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(persistenceLeakAudit.localStoragePersistenceCount === 1, "localStorage leak must be counted.");
  assertTest(persistenceLeakAudit.apiCallCount === 1, "API leak must be counted.");
  assertTest(persistenceLeakAudit.submitButtonCount === 1, "submit leak must be counted.");
  assertTest(
    (() => {
      try {
        buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel({ baseline8R: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8R baseline must be blocked.",
  );

  return [
    "8S renders a six-step UX skeleton from a valid 8R workflow",
    "8S preserves ready_for_non_persistent_preview while the 8Q gate remains needs_completion",
    "all steps and future actions are disabled, non-interactive, non-persistent, non-official, and non-applied",
    "export metadata and main id are current for 8S",
    "scoring constants, MatchBonusEvent, score, timeline, and share-pack guardrails remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewWorkflowUxSkeleton8S();
  console.log("manualReviewWorkflowUxSkeleton8S tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
