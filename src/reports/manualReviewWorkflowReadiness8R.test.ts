import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewWorkflowReadinessWithoutPersistence8RModel,
  renderManualReviewWorkflowReadinessWithoutPersistence8RValidation,
} from "./buildManualReviewWorkflowReadinessWithoutPersistence8R";
import { currentManualReviewPreviewDecisionGateWithoutPersistence8QModel } from "./buildManualReviewPreviewDecisionGateWithoutPersistence8Q";
import {
  auditManualReviewWorkflowNonPersistence8R,
  auditManualReviewWorkflowReadinessLogic8R,
} from "./manualReviewWorkflowReadinessAudit8R";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewWorkflowReadiness8R(): readonly string[] {
  const model = buildManualReviewWorkflowReadinessWithoutPersistence8RModel();
  const validation = renderManualReviewWorkflowReadinessWithoutPersistence8RValidation(model);
  const invalidBaseline = {
    ...currentManualReviewPreviewDecisionGateWithoutPersistence8QModel(),
    status: "FAIL" as const,
  };
  const persistenceLeakAudit = auditManualReviewWorkflowNonPersistence8R({
    productHtml: '<section id="manual-review-workflow-readiness-8r"><script>localStorage.setItem("workflow", "leak")</script></section>',
    exportHtml: "",
  });
  const exportOnlyRealUseAudit = auditManualReviewWorkflowReadinessLogic8R({
    workflow: model.workflow,
    productHtml: '<section id="manual-review-workflow-readiness-8r">Workflow pret pour preview non persistante.</section><section id="manual-review-workflow-ux-skeleton-8s">Squelette</section>',
    exportHtml: '<section id="manual-review-workflow-readiness-export-8r">Workflow prete pour decision reelle.</section><section id="manual-review-workflow-ux-skeleton-export-8s">Squelette</section>',
  });

  assertTest(model.status === "PASS", "8R model must pass.");
  assertTest(validation.includes("Status: PASS"), "8R validation must pass.");
  assertTest(model.workflowReadinessReady, "8R must render workflow readiness from a valid 8Q gate.");
  assertTest(model.baseline8QPreserved, "8R must preserve 8Q.");
  assertTest(model.workflowStageCount === 5, "8R must create exactly five stages.");
  assertTest(model.workflow.stages.map((stage) => stage.stageVersion).join("/") === "8M/8N/8O/8P/8Q", "8R stages must be 8M/8N/8O/8P/8Q.");
  assertTest(model.chainAudit.allStagesHavePurpose, "all stages must have purpose.");
  assertTest(model.chainAudit.allStagesHaveInput, "all stages must have input.");
  assertTest(model.chainAudit.allStagesHaveOutput, "all stages must have output.");
  assertTest(model.chainAudit.allStagesHaveGuardrails, "all stages must have guardrails.");
  assertTest(model.chainAudit.stage8MOutputFeeds8NInput, "8M must feed 8N.");
  assertTest(model.chainAudit.stage8NOutputFeeds8OInput, "8N must feed 8O.");
  assertTest(model.chainAudit.stage8OOutputFeeds8PInput, "8O must feed 8P.");
  assertTest(model.chainAudit.stage8POutputFeeds8QInput, "8P must feed 8Q.");
  assertTest(model.chainAudit.stage8QOutputFeeds8RReadiness, "8Q must feed 8R readiness.");
  assertTest(model.workflowReadinessStatus === "ready_for_non_persistent_preview", "workflow readiness status must be ready_for_non_persistent_preview.");
  assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "review gate status must remain needs_completion.");
  assertTest(model.workflowReadinessDistinctFromReviewGate, "workflow readiness must remain distinct from review gate status.");
  assertTest(model.logicAudit.workflowDoesNotClaimReviewReadyForRealUse, "workflow must not claim readiness for real use.");
  assertTest(!model.nonPersistenceAudit.workflowPersistencePerformed, "8R workflow must perform no persistence.");
  assertTest(model.nonPersistenceAudit.backendSubmitActionCount === 0, "8R workflow must create no backend submit.");
  assertTest(model.nonPersistenceAudit.apiCallCount === 0, "8R workflow must create no API call.");
  assertTest(model.boundaryAudit.officialTruthPromotionCount === 0, "8R workflow must create no official truth.");
  assertTest(model.boundaryAudit.automaticDecisionCount === 0, "8R workflow must create no automatic decision.");
  assertTest(model.boundaryAudit.selectionRecommendationCount === 0, "8R workflow must create no selection.");
  assertTest(model.boundaryAudit.tacticalInstructionCount === 0, "8R workflow must create no tactical instruction.");
  assertTest(model.workflowDoesNotMutateScore, "8R workflow must not mutate score.");
  assertTest(model.workflowDoesNotMutateTimeline, "8R workflow must not mutate timeline.");
  assertTest(model.workflowDoesNotCreateScoreChange, "8R workflow must not create score_change.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.exportWorkflowReadinessVisible, "export must contain the 8R workflow section.");
  assertTest(model.exportMetadataAudit.exportTitleMentions8R, "export title must mention 8R.");
  assertTest(model.exportMetadataAudit.exportVisibleBadgeMentions8R, "export badge must mention 8R.");
  assertTest(!model.exportMetadataAudit.exportMainIdStillCompressedExport8Q, "export main id must no longer be compressed-export-8q.");
  assertTest(model.exportMetadataAudit.export8PEyebrowCorrected, "8P eyebrow must be corrected.");
  assertTest(model.exportMetadataAudit.export8QEyebrowPreserved, "8Q eyebrow must remain correct.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.workflowDoesNotPromoteOfficialTruth, "workflow must not promote coach input to official truth.");
  assertTest(model.warningCodes.length === 0, `8R warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(persistenceLeakAudit.localStoragePersistenceCount === 1, "localStorage workflow leak must be counted.");
  assertTest(persistenceLeakAudit.workflowPersistencePerformed, "detected persistence must set workflowPersistencePerformed.");
  assertTest(!exportOnlyRealUseAudit.workflowDoesNotClaimReviewReadyForRealUse, "export-only real-use claim must be audited.");
  assertTest(exportOnlyRealUseAudit.logicWarningCodes.includes("WORKFLOW_CLAIMS_REVIEW_READY_FOR_REAL_USE"), "export-only real-use warning must be emitted.");
  assertTest(
    (() => {
      try {
        buildManualReviewWorkflowReadinessWithoutPersistence8RModel({ baseline8Q: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8Q gate must be blocked.",
  );

  return [
    "8R creates a five-stage 8M/8N/8O/8P/8Q workflow map",
    "workflow readiness is ready_for_non_persistent_preview while 8Q remains needs_completion",
    "8R performs no persistence, API, backend submit, official-truth promotion, score mutation, selection, or tactical instruction",
    "export metadata and main id are current for 8R and the 8P/8Q eyebrow debt is fixed",
    "scoring constants, MatchBonusEvent, score, and timeline remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewWorkflowReadiness8R();
  console.log("manualReviewWorkflowReadiness8R tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
