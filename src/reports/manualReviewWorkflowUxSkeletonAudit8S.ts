import type {
  ManualReviewWorkflowUxExportAudit8S,
  ManualReviewWorkflowUxSafetyAudit8S,
  ManualReviewWorkflowUxSkeleton8S,
  ManualReviewWorkflowUxSkeletonAudit8S,
  ManualReviewWorkflowUxWordingAudit8S,
} from "./manualReviewWorkflowUxSkeletonTypes8S";
import type { ManualReviewWorkflowUxSkeletonWarningCode8S } from "./manualReviewWorkflowUxSkeletonWarnings8S";

function countMatches(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((sum, pattern) => sum + [...text.matchAll(pattern)].length, 0);
}

function estimateReadTimeSeconds(html: string): number {
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  if (visibleText.length === 0) return 0;
  const words = visibleText.split(/\s+/u).length;
  return Math.ceil((words / 180) * 60);
}

function hasVersion(steps: ManualReviewWorkflowUxSkeleton8S["steps"], version: string): boolean {
  return steps.some((step) => step.sourceVersion === version);
}

function linkedCount(workflow: ManualReviewWorkflowUxSkeleton8S): number {
  return workflow.steps.filter((step, index) => {
    const previous = index === 0 ? undefined : workflow.steps[index - 1];
    const next = index === workflow.steps.length - 1 ? undefined : workflow.steps[index + 1];
    return (previous === undefined || step.linkedPreviousStepId === previous.stepId) &&
      (next === undefined || step.linkedNextStepId === next.stepId);
  }).length;
}

function allStepTextComplete(workflow: ManualReviewWorkflowUxSkeleton8S): boolean {
  return workflow.steps.every((step) =>
    step.coachFacingLabel.length > 0 &&
    step.stepPurpose.length > 0 &&
    step.inputLabel.length > 0 &&
    step.outputLabel.length > 0 &&
    step.displayedState.length > 0 &&
    step.guardrails.length > 0,
  );
}

export function auditManualReviewWorkflowUxSkeleton8S(input: {
  readonly workflow: ManualReviewWorkflowUxSkeleton8S;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowUxSkeletonAudit8S {
  const uxStepCount = input.workflow.steps.length;
  const uxStepsLinkedCount = linkedCount(input.workflow);
  const productUxSkeletonVisible = input.productHtml.includes('id="manual-review-workflow-ux-skeleton-8s"');
  const exportUxSkeletonVisible = input.exportHtml.includes('id="manual-review-workflow-ux-skeleton-export-8s"');
  const uxShowsWorkflowReadyForPreview = input.productHtml.includes("pret pour preview non persistante") &&
    input.exportHtml.includes("pret pour preview non persistante");
  const uxShowsReviewStillNeedsCompletion = input.productHtml.includes("Gate 8Q") &&
    input.productHtml.includes("a completer") &&
    input.exportHtml.includes("a completer");
  const uxReadinessDistinctFromReviewGate = uxShowsWorkflowReadyForPreview && uxShowsReviewStillNeedsCompletion;
  const warningCodes: ManualReviewWorkflowUxSkeletonWarningCode8S[] = [];
  if (!productUxSkeletonVisible && !exportUxSkeletonVisible) warningCodes.push("UX_SKELETON_MISSING");
  if (!productUxSkeletonVisible) warningCodes.push("PRODUCT_UX_SKELETON_MISSING");
  if (!exportUxSkeletonVisible) warningCodes.push("EXPORT_UX_SKELETON_MISSING");
  if (uxStepCount !== 6) warningCodes.push("UX_STEP_COUNT_INVALID");
  if (!allStepTextComplete(input.workflow)) warningCodes.push("UX_STEP_MISSING");
  if (uxStepsLinkedCount !== 6) warningCodes.push("UX_STEP_LINK_MISSING");
  if (input.workflow.steps.some((step) => step.interactive || step.enabled)) warningCodes.push("UX_STEP_INTERACTIVE_ENABLED");
  if (!uxShowsWorkflowReadyForPreview) warningCodes.push("WORKFLOW_READINESS_STATUS_MASKED");
  if (!uxShowsReviewStillNeedsCompletion) warningCodes.push("REVIEW_GATE_STATUS_NOT_PRESERVED");
  return {
    uxSkeletonVisible: productUxSkeletonVisible && exportUxSkeletonVisible,
    productUxSkeletonVisible,
    exportUxSkeletonVisible,
    uxStepCount,
    uxStepCountExpected: 6,
    uxStepsLinkedCount,
    uxUsesManualForm8M: hasVersion(input.workflow.steps, "8M"),
    uxUsesIntakeBoundary8N: hasVersion(input.workflow.steps, "8N"),
    uxUsesPreviewRenderer8O: hasVersion(input.workflow.steps, "8O"),
    uxUsesPreviewComparison8P: hasVersion(input.workflow.steps, "8P"),
    uxUsesDecisionGate8Q: hasVersion(input.workflow.steps, "8Q"),
    uxUsesWorkflowReadiness8R: hasVersion(input.workflow.steps, "8R"),
    uxShowsWorkflowReadyForPreview,
    uxShowsReviewStillNeedsCompletion,
    uxReadinessDistinctFromReviewGate,
    uxSkeletonWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 ? "UX_SKELETON_READY" : "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_PARTIAL",
  };
}

export function auditManualReviewWorkflowUxSafety8S(input: {
  readonly workflow: ManualReviewWorkflowUxSkeleton8S;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowUxSafetyAudit8S {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const enabledCtaCount = countMatches(combined, [
    /<button\b(?![^>]*(?:disabled|aria-disabled="true"))/giu,
    /<(?:input|select|textarea)\b(?![^>]*(?:disabled|aria-disabled="true"|type="hidden"))/giu,
    /<a\b[^>]*(?:data-enabled-action|href="(?:\/api|api:|https?:\/\/api))/giu,
  ]);
  const submitButtonCount = countMatches(combined, [/<button\b[^>]*type="submit"/giu, /<input\b[^>]*type="submit"/giu]);
  const enabledSubmitButtonCount = countMatches(combined, [/<(?:button|input)\b(?![^>]*disabled)[^>]*type="submit"/giu]);
  const backendActionCount = countMatches(combined, [/\bmethod=["']post["']/giu, /<form\b[^>]*\baction=["'][^"']+["']/giu]);
  const apiCallCount = countMatches(combined, [
    /\bfetch\s*\(/giu,
    /\bXMLHttpRequest\b/giu,
    /\baxios\.\w+\s*\(/giu,
    /<(?:a|form)\b[^>]*(?:href|action)=["'][^"']*\/api\//giu,
  ]);
  const localStoragePersistenceCount = countMatches(combined, [/\blocalStorage\.(?:setItem|removeItem|clear)/giu]);
  const databasePersistenceCount = countMatches(combined, [/\binsert\s+into\b/giu, /\bsqlite(?:3)?\s*\.\s*(?:run|exec|prepare)\s*\(/giu, /\bindexedDB\s*\./giu, /\bdb\s*\.\s*(?:run|exec|insert|save|write)\s*\(/giu]);
  const filePersistenceCount = countMatches(combined, [/\bwriteFile(?:Sync)?\s*\(/giu, /\bappendFile(?:Sync)?\s*\(/giu, /\bcreateWriteStream\s*\(/giu, /\bfs\s*\.\s*(?:writeFile|appendFile|createWriteStream)\s*\(/giu]);
  const memoryCreationCount = countMatches(combined, [/\bcreate(?:Coach|ManualReview|Preview)?Memory\s*\(/giu, /\bnew\s+\w*Memory\b/giu]);
  const seasonMemoryCreationCount = countMatches(combined, [/\bcreateSeasonMemory\s*\(/giu, /\bnew\s+SeasonMemory\b/giu]);
  const teamStyleMemoryCreationCount = countMatches(combined, [/\bcreateTeamStyleMemory\s*\(/giu, /\bnew\s+TeamStyleMemory\b/giu]);
  const officialTruthPromotionCount = countMatches(combined, [/\b(?:verite officielle creee|official truth promoted|source officielle modifiee)\b/giu]);
  const automaticDecisionCount = countMatches(combined, [/\b(?:decision automatique activee|automatic decision created)\b/giu]);
  const selectionRecommendationCount = Math.max(
    0,
    countMatches(combined, [/\b(?:selection imposee|doit selectionner|recommandation tactique officielle)\b/giu]) -
      countMatches(combined, [/\bpas de selection imposee\b/giu]),
  );
  const tacticalInstructionCount = countMatches(combined, [/\b(?:consigne tactique officielle|plan tactique impose)\b/giu]);
  const realNextMatchClaimCount = countMatches(combined, [/\b(?:prochain match confirme|real next match result)\b/giu]);
  const engineLearningClaimCount = countMatches(combined, [/\b(?:moteur apprend|engine learning applied)\b/giu]);
  const futureEvidenceClaimCount = countMatches(combined, [/\b(?:preuve future|future evidence)\b/giu]);
  const warningCodes: ManualReviewWorkflowUxSkeletonWarningCode8S[] = [];
  if (enabledCtaCount > 0) warningCodes.push("ENABLED_CTA_DETECTED");
  if (submitButtonCount > 0) warningCodes.push("SUBMIT_BUTTON_DETECTED");
  if (backendActionCount > 0) warningCodes.push("BACKEND_ACTION_DETECTED");
  if (apiCallCount > 0) warningCodes.push("API_CALL_DETECTED");
  if (localStoragePersistenceCount > 0) warningCodes.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warningCodes.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warningCodes.push("FILE_PERSISTENCE_CREATED");
  if (seasonMemoryCreationCount > 0) warningCodes.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warningCodes.push("TEAM_STYLE_MEMORY_CREATED");
  if (officialTruthPromotionCount > 0) warningCodes.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (automaticDecisionCount > 0) warningCodes.push("AUTOMATIC_DECISION_DETECTED");
  if (selectionRecommendationCount > 0) warningCodes.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warningCodes.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (realNextMatchClaimCount > 0) warningCodes.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (engineLearningClaimCount > 0) warningCodes.push("ENGINE_LEARNING_CLAIM_DETECTED");
  return {
    disabledActionCount: input.workflow.disabledActions.length,
    enabledCtaCount,
    submitButtonCount,
    enabledSubmitButtonCount,
    backendActionCount,
    apiCallCount,
    localStoragePersistenceCount,
    databasePersistenceCount,
    filePersistenceCount,
    memoryCreationCount,
    seasonMemoryCreationCount,
    teamStyleMemoryCreationCount,
    officialTruthPromotionCount,
    automaticDecisionCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    realNextMatchClaimCount,
    engineLearningClaimCount,
    futureEvidenceClaimCount,
    safetyWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 ? "DISABLED_ACTIONS_READY" : "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_FAIL",
  };
}

export function auditManualReviewWorkflowUxExport8S(input: {
  readonly exportHtmlBefore8S: string;
  readonly exportHtmlAfter8S: string;
}): ManualReviewWorkflowUxExportAudit8S {
  const exportReadTimeSecondsBefore8S = estimateReadTimeSeconds(input.exportHtmlBefore8S);
  const exportReadTimeSecondsAfter8S = estimateReadTimeSeconds(input.exportHtmlAfter8S);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8S <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8S <= 800;
  const warningCodes: ManualReviewWorkflowUxSkeletonWarningCode8S[] = [];
  const exportTitleMentions8S = /<title>[^<]*8S[^<]*<\/title>/iu.test(input.exportHtmlAfter8S);
  const exportVisibleBadgeMentions8S = input.exportHtmlAfter8S.includes("Export compact 8S") || input.exportHtmlAfter8S.includes("Squelette UX 8S");
  const exportMainCurrentVersionVisible = input.exportHtmlAfter8S.includes('data-manual-review-workflow-ux-skeleton-version="8S"');
  const exportMainIdStillCompressedExport8R = input.exportHtmlAfter8S.includes('id="compressed-export-8r"');
  const exportMainIdStillCompressedExport8Q = input.exportHtmlAfter8S.includes('id="compressed-export-8q"');
  const exportMainIdStillCompressedExport8P = input.exportHtmlAfter8S.includes('id="compressed-export-8p"');
  const exportMainIdStillCompressedExport8N = input.exportHtmlAfter8S.includes('id="compressed-export-8n"');
  const exportMainIdStillCompressedExport8I = input.exportHtmlAfter8S.includes('id="compressed-export-8i"');
  if (!exportTitleMentions8S) warningCodes.push("EXPORT_TITLE_MISSING_8S");
  if (!exportVisibleBadgeMentions8S) warningCodes.push("EXPORT_BADGE_MISSING_8S");
  if (!exportMainCurrentVersionVisible) warningCodes.push("EXPORT_METADATA_8S_VISIBLE");
  if (exportMainIdStillCompressedExport8R) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8R");
  if (exportMainIdStillCompressedExport8Q) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8Q");
  if (exportMainIdStillCompressedExport8P) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  if (exportMainIdStillCompressedExport8N) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (exportMainIdStillCompressedExport8I) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  if (!exportUnder900Seconds) warningCodes.push("EXPORT_OVER_900");
  return {
    exportTitleMentions8S,
    exportVisibleBadgeMentions8S,
    exportMainCurrentVersionVisible,
    exportMainIdStillCompressedExport8R,
    exportMainIdStillCompressedExport8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    exportReadTimeSecondsBefore8S,
    exportReadTimeSecondsAfter8S,
    exportReadTimeDelta: exportReadTimeSecondsAfter8S - exportReadTimeSecondsBefore8S,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter8S <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter8S <= 800),
    exportCompactPreserved: (
      input.exportHtmlAfter8S.includes('id="compressed-export-8s"') ||
      (
        input.exportHtmlAfter8S.includes('id="compressed-export-8v"') &&
        input.exportHtmlAfter8S.includes('data-manual-review-workflow-ux-skeleton-version="8S"')
      ) ||
      (
        input.exportHtmlAfter8S.includes('id="compressed-export-8u"') &&
        input.exportHtmlAfter8S.includes('data-manual-review-workflow-ux-skeleton-version="8S"')
      ) ||
      (
        input.exportHtmlAfter8S.includes('id="compressed-export-8t"') &&
        input.exportHtmlAfter8S.includes('data-manual-review-workflow-ux-skeleton-version="8S"')
      )
    ) &&
      (
        input.exportHtmlAfter8S.includes("Cartes tactiques essentielles") ||
        input.exportHtmlAfter8S.includes("Cartes tactiques") ||
        input.exportHtmlAfter8S.includes('id="tactical-map-cards"')
      ),
    exportWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 ? "EXPORT_METADATA_8S_VISIBLE" : "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_PARTIAL",
  };
}

export function auditManualReviewWorkflowUxWording8S(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowUxWordingAudit8S {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const skeletonOnlyWordingVisible = combined.includes("squelette UX") || combined.includes("Squelette UX");
  const demoOnlyWordingVisible = combined.includes("Demo only") || combined.includes("demonstration");
  const nonOfficialWordingVisible = combined.includes("Non officiel") || combined.includes("non officiel");
  const notPersistedWordingVisible = combined.includes("Non persiste") || combined.includes("non persiste");
  const notAppliedWordingVisible = combined.includes("Non applique") || combined.includes("non applique");
  const disabledActionsWordingVisible = combined.includes("Actions futures desactivees") || combined.includes("actions desactivees");
  const workflowReadinessDistinctFromReviewGateWordingVisible = combined.includes("Workflow 8R") &&
    combined.includes("Gate 8Q") &&
    combined.includes("a completer");
  const realUseReadyClaimCount = countMatches(combined, [/\b(?:pret pour decision reelle|ready for real use|doit appliquer)\b/giu]);
  const storageReadyClaimCount = countMatches(combined, [/\b(?:stockage actif|historique cree|memoire creee)\b/giu]);
  const submitReadyClaimCount = countMatches(combined, [/\b(?:cliquez pour enregistrer|envoyer|soumettre)\b/giu]);
  const ambiguousUxWordingCount = realUseReadyClaimCount + storageReadyClaimCount + submitReadyClaimCount;
  const positives = [
    skeletonOnlyWordingVisible,
    demoOnlyWordingVisible,
    nonOfficialWordingVisible,
    notPersistedWordingVisible,
    notAppliedWordingVisible,
    disabledActionsWordingVisible,
    workflowReadinessDistinctFromReviewGateWordingVisible,
  ].filter(Boolean).length;
  const wordingReadabilityScore = Math.max(0, Math.min(100, 86 + positives * 2 - ambiguousUxWordingCount * 20));
  const warningCodes: ManualReviewWorkflowUxSkeletonWarningCode8S[] = [];
  if (!skeletonOnlyWordingVisible) warningCodes.push("UX_SKELETON_MISSING");
  if (!notPersistedWordingVisible) warningCodes.push("UX_MARKED_NOT_PERSISTED");
  if (ambiguousUxWordingCount > 0) warningCodes.push("UX_CLAIMS_REAL_USE_READY");
  return {
    skeletonOnlyWordingVisible,
    demoOnlyWordingVisible,
    nonOfficialWordingVisible,
    notPersistedWordingVisible,
    notAppliedWordingVisible,
    disabledActionsWordingVisible,
    workflowReadinessDistinctFromReviewGateWordingVisible,
    realUseReadyClaimCount,
    storageReadyClaimCount,
    submitReadyClaimCount,
    ambiguousUxWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: warningCodes,
    recommendation: wordingReadabilityScore >= 95 && warningCodes.length === 0 ? "UX_SKELETON_READY" : "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_PARTIAL",
  };
}
