import { readTimeSeconds } from "./storyFirstAuditUtils8H";
import type {
  ManualReviewWorkflowReadiness8R,
  ManualReviewWorkflowReadinessAudit8R,
  ManualReviewWorkflowBoundaryAudit8R,
  ManualReviewWorkflowChainAudit8R,
  ManualReviewWorkflowExportBudgetAudit8R,
  ManualReviewWorkflowExportMetadataAudit8R,
  ManualReviewWorkflowIntegrationBudgetAudit8R,
  ManualReviewWorkflowNonPersistenceAudit8R,
  ManualReviewWorkflowReadinessLogicAudit8R,
  ManualReviewWorkflowSourceOfTruthRegressionAudit8R,
  ManualReviewWorkflowWordingAudit8R,
} from "./manualReviewWorkflowReadinessTypes8R";
import type { ManualReviewWorkflowReadinessWarningCode8R } from "./manualReviewWorkflowReadinessWarnings8R";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

function boundedWorkflowSection(html: string): string {
  const start = html.indexOf("manual-review-workflow-readiness");
  if (start < 0) return "";
  const afterStart = html.slice(start);
  const nextManualReviewSection = afterStart.slice(1).search(/manual-review-(?:workflow-ux-skeleton|ux-interaction-contract|input-field-contract|field-ux-visual-readiness|preview-activation-guards)/iu);
  return nextManualReviewSection < 0 ? afterStart : afterStart.slice(0, nextManualReviewSection + 1);
}

function workflowSlice(productHtml: string, exportHtml: string): string {
  return `${boundedWorkflowSection(productHtml)}\n${boundedWorkflowSection(exportHtml)}`;
}

function orderPreserved(html: string, first: string, second: string): boolean {
  const firstIndex = html.indexOf(first);
  const secondIndex = html.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

export function auditManualReviewWorkflowReadiness8R(input: {
  readonly workflow: ManualReviewWorkflowReadiness8R;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowReadinessAudit8R {
  const productWorkflowReadinessVisible = input.productHtml.includes('id="manual-review-workflow-readiness-8r"');
  const exportWorkflowReadinessVisible = input.exportHtml.includes('id="manual-review-workflow-readiness-export-8r"');
  const workflowStageCount = input.workflow.stages.length;
  const readyStageCount = input.workflow.stages.filter((stage) => stage.ready).length;
  const blockedStageCount = input.workflow.stages.filter((stage) => !stage.ready).length;
  const missingCriticalStageCount = 5 - workflowStageCount;
  const versions = input.workflow.stages.map((stage) => stage.stageVersion);
  const workflowUsesManualForm8M = versions.includes("8M");
  const workflowUsesIntakeBoundary8N = versions.includes("8N");
  const workflowUsesPreviewRenderer8O = versions.includes("8O");
  const workflowUsesPreviewComparison8P = versions.includes("8P");
  const workflowUsesDecisionGate8Q = versions.includes("8Q");
  const workflowStagesLinkedCount = input.workflow.stages.filter((stage, index, stages) => {
    const previousOk = index === 0 || stage.linkedPreviousStageId === stages[index - 1]?.stageId;
    const nextOk = index === stages.length - 1 || stage.linkedNextStageId === stages[index + 1]?.stageId;
    return previousOk && nextOk;
  }).length;
  const workflowReadinessDistinctFromReviewGate =
    input.workflow.readinessSummary.workflowReadinessStatus === "ready_for_non_persistent_preview" &&
    input.workflow.readinessSummary.reviewGateStatusFrom8Q === "needs_completion";
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (!productWorkflowReadinessVisible) warnings.push("PRODUCT_WORKFLOW_READINESS_MISSING");
  if (!exportWorkflowReadinessVisible) warnings.push("EXPORT_WORKFLOW_READINESS_MISSING");
  if (workflowStageCount !== 5) warnings.push("WORKFLOW_STAGE_COUNT_INVALID");
  if (readyStageCount !== 5 || blockedStageCount !== 0 || missingCriticalStageCount !== 0) warnings.push("WORKFLOW_STAGE_MISSING");
  if (!workflowUsesManualForm8M || !workflowUsesIntakeBoundary8N || !workflowUsesPreviewRenderer8O || !workflowUsesPreviewComparison8P || !workflowUsesDecisionGate8Q) {
    warnings.push("WORKFLOW_STAGE_MISSING");
  }
  if (workflowStagesLinkedCount !== 5) warnings.push("WORKFLOW_STAGE_LINK_MISSING");
  if (input.workflow.readinessSummary.workflowReadinessStatus !== "ready_for_non_persistent_preview") warnings.push("WORKFLOW_READINESS_STATUS_UNEXPECTED");
  if (!workflowReadinessDistinctFromReviewGate) warnings.push("WORKFLOW_READINESS_NOT_DISTINCT_FROM_REVIEW_GATE");
  return {
    workflowReadinessVisible: productWorkflowReadinessVisible && exportWorkflowReadinessVisible,
    productWorkflowReadinessVisible,
    exportWorkflowReadinessVisible,
    workflowStageCount,
    workflowStageCountExpected: 5,
    readyStageCount,
    blockedStageCount,
    missingCriticalStageCount,
    workflowUsesManualForm8M,
    workflowUsesIntakeBoundary8N,
    workflowUsesPreviewRenderer8O,
    workflowUsesPreviewComparison8P,
    workflowUsesDecisionGate8Q,
    workflowStagesLinkedCount,
    workflowReadinessStatus: input.workflow.readinessSummary.workflowReadinessStatus,
    reviewGateStatusFrom8Q: input.workflow.readinessSummary.reviewGateStatusFrom8Q,
    workflowReadinessDistinctFromReviewGate,
    readinessWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_REVIEW_WORKFLOW_READINESS" : "REPAIR_MANUAL_REVIEW_WORKFLOW_READINESS",
  };
}

export function auditManualReviewWorkflowChain8R(
  workflow: ManualReviewWorkflowReadiness8R,
): ManualReviewWorkflowChainAudit8R {
  const byVersion = new Map(workflow.stages.map((stage) => [stage.stageVersion, stage]));
  const stage8M = byVersion.get("8M");
  const stage8N = byVersion.get("8N");
  const stage8O = byVersion.get("8O");
  const stage8P = byVersion.get("8P");
  const stage8Q = byVersion.get("8Q");
  const stage8MPresent = stage8M !== undefined;
  const stage8NPresent = stage8N !== undefined;
  const stage8OPresent = stage8O !== undefined;
  const stage8PPresent = stage8P !== undefined;
  const stage8QPresent = stage8Q !== undefined;
  const stage8MOutputFeeds8NInput = stage8M?.linkedNextStageId === stage8N?.stageId && stage8N?.linkedPreviousStageId === stage8M?.stageId;
  const stage8NOutputFeeds8OInput = stage8N?.linkedNextStageId === stage8O?.stageId && stage8O?.linkedPreviousStageId === stage8N?.stageId;
  const stage8OOutputFeeds8PInput = stage8O?.linkedNextStageId === stage8P?.stageId && stage8P?.linkedPreviousStageId === stage8O?.stageId;
  const stage8POutputFeeds8QInput = stage8P?.linkedNextStageId === stage8Q?.stageId && stage8Q?.linkedPreviousStageId === stage8P?.stageId;
  const stage8QOutputFeeds8RReadiness = stage8Q?.linkedNextStageId === undefined && workflow.readinessSummary.workflowReadinessStatus === "ready_for_non_persistent_preview";
  const allStagesHavePurpose = workflow.stages.every((stage) => stage.stagePurpose.trim().length > 0);
  const allStagesHaveInput = workflow.stages.every((stage) => stage.input.trim().length > 0);
  const allStagesHaveOutput = workflow.stages.every((stage) => stage.output.trim().length > 0);
  const allStagesHaveGuardrails = workflow.stages.every((stage) => stage.guardrails.length > 0);
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (!stage8MPresent || !stage8NPresent || !stage8OPresent || !stage8PPresent || !stage8QPresent) warnings.push("WORKFLOW_STAGE_MISSING");
  if (!stage8MOutputFeeds8NInput || !stage8NOutputFeeds8OInput || !stage8OOutputFeeds8PInput || !stage8POutputFeeds8QInput || !stage8QOutputFeeds8RReadiness) warnings.push("WORKFLOW_STAGE_LINK_MISSING");
  if (!allStagesHavePurpose) warnings.push("WORKFLOW_STAGE_PURPOSE_MISSING");
  if (!allStagesHaveInput) warnings.push("WORKFLOW_STAGE_INPUT_MISSING");
  if (!allStagesHaveOutput) warnings.push("WORKFLOW_STAGE_OUTPUT_MISSING");
  if (!allStagesHaveGuardrails) warnings.push("WORKFLOW_STAGE_GUARDRAILS_MISSING");
  return {
    stage8MPresent,
    stage8NPresent,
    stage8OPresent,
    stage8PPresent,
    stage8QPresent,
    stage8MOutputFeeds8NInput,
    stage8NOutputFeeds8OInput,
    stage8OOutputFeeds8PInput,
    stage8POutputFeeds8QInput,
    stage8QOutputFeeds8RReadiness,
    allStagesHavePurpose,
    allStagesHaveInput,
    allStagesHaveOutput,
    allStagesHaveGuardrails,
    chainWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_WORKFLOW_CHAIN" : "REPAIR_WORKFLOW_CHAIN",
  };
}

export function auditManualReviewWorkflowReadinessLogic8R(input: {
  readonly workflow: ManualReviewWorkflowReadiness8R;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowReadinessLogicAudit8R {
  const combined = workflowSlice(input.productHtml, input.exportHtml);
  const workflowReadinessStatus = input.workflow.readinessSummary.workflowReadinessStatus;
  const reviewGateStatusFrom8Q = input.workflow.readinessSummary.reviewGateStatusFrom8Q;
  const workflowReadinessStatusCorrect = workflowReadinessStatus === "ready_for_non_persistent_preview";
  const reviewGateStillNeedsCompletion = reviewGateStatusFrom8Q === "needs_completion" && combined.includes("a completer");
  const workflowReadyDespiteIncompleteReview = workflowReadinessStatusCorrect && reviewGateStillNeedsCompletion;
  const workflowDoesNotClaimReviewReadyForRealUse = !/pret(?:e)? pour decision reelle|utilise pour decider|coach doit appliquer/iu.test(combined);
  const missingInformationVisible = combined.includes("Ce qui manque") || combined.includes("vraie saisie coach");
  const realUseBlockersVisible = combined.includes("avant usage reel") || combined.includes("aucune decision automatique");
  const storageDecisionDeferredVisible = combined.includes("stockage future separee") || combined.includes("decision de stockage");
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (!workflowReadinessStatusCorrect) warnings.push("WORKFLOW_READINESS_STATUS_UNEXPECTED");
  if (!reviewGateStillNeedsCompletion) warnings.push("REVIEW_GATE_STATUS_NOT_PRESERVED");
  if (!workflowReadyDespiteIncompleteReview) warnings.push("WORKFLOW_READINESS_NOT_DISTINCT_FROM_REVIEW_GATE");
  if (!workflowDoesNotClaimReviewReadyForRealUse) warnings.push("WORKFLOW_CLAIMS_REVIEW_READY_FOR_REAL_USE");
  if (!missingInformationVisible || !realUseBlockersVisible) warnings.push("WORKFLOW_READINESS_MISSING");
  if (!storageDecisionDeferredVisible) warnings.push("STORAGE_DECISION_NOT_DEFERRED");
  return {
    workflowReadinessStatus,
    workflowReadinessExpectedStatus: "ready_for_non_persistent_preview",
    workflowReadinessStatusCorrect,
    reviewGateStatusFrom8Q,
    reviewGateStillNeedsCompletion,
    workflowReadyDespiteIncompleteReview,
    workflowDoesNotClaimReviewReadyForRealUse,
    missingInformationVisible,
    realUseBlockersVisible,
    storageDecisionDeferredVisible,
    logicWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_WORKFLOW_READINESS_LOGIC" : "REPAIR_WORKFLOW_READINESS_LOGIC",
  };
}

export function auditManualReviewWorkflowNonPersistence8R(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowNonPersistenceAudit8R {
  const slice = workflowSlice(input.productHtml, input.exportHtml);
  const localStoragePersistenceCount = countMatches(slice, /localStorage\s*\./giu);
  const databasePersistenceCount = countMatches(slice, /\binsert\s+into\b|\bsqlite(?:3)?\s*\.\s*(?:run|exec|prepare)\s*\(|\bdb\s*\.\s*(?:run|exec|insert|save|write)\s*\(/giu);
  const filePersistenceCount = countMatches(slice, /\bwriteFile(?:Sync)?\s*\(|\bcreateWriteStream\s*\(|\bfs\s*\.\s*(?:writeFile|appendFile|createWriteStream)\s*\(/giu);
  const backendSubmitActionCount = countMatches(slice, /fetch\s*\(\s*["'][^"']*\/api\/manual-review|axios\.\w+\s*\(\s*["'][^"']*\/api\/manual-review|<form\b[^>]*\baction=["'][^"']*\/api\/manual-review|method=["']post["']/giu);
  const formSubmitButtonCount = countMatches(slice, /<button[^>]*submit|type="submit"|<form\b/giu);
  const apiCallCount = countMatches(slice, /fetch\(|XMLHttpRequest|axios\./giu);
  const memoryCreationCount = countMatches(slice, /\bcreate(?:Coach|ManualReview|Preview)?Memory\s*\(|\bnew\s+\w*Memory\b/giu);
  const seasonMemoryCreationCount = countMatches(slice, /\bcreateSeasonMemory\s*\(|\bnew\s+SeasonMemory\b/giu);
  const teamStyleMemoryCreationCount = countMatches(slice, /\bcreateTeamStyleMemory\s*\(|\bnew\s+TeamStyleMemory\b/giu);
  const storageDecisionImplementedCount = countMatches(slice, /\bstorageAdapter\s*:\s*["']active["']|\bpersistenceImplemented\s*:\s*true|\bstorageReady\s*:\s*true/giu);
  const workflowPersistencePerformed = localStoragePersistenceCount + databasePersistenceCount + filePersistenceCount + backendSubmitActionCount + formSubmitButtonCount + apiCallCount + memoryCreationCount + seasonMemoryCreationCount + teamStyleMemoryCreationCount + storageDecisionImplementedCount > 0;
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (localStoragePersistenceCount > 0) warnings.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (backendSubmitActionCount > 0 || formSubmitButtonCount > 0) warnings.push("BACKEND_SUBMIT_ACTION_DETECTED");
  if (apiCallCount > 0) warnings.push("API_CALL_DETECTED");
  if (memoryCreationCount > 0) warnings.push("WORKFLOW_PERSISTENCE_DETECTED");
  if (seasonMemoryCreationCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");
  if (storageDecisionImplementedCount > 0) warnings.push("STORAGE_DECISION_IMPLEMENTED");
  return {
    localStoragePersistenceCount,
    databasePersistenceCount,
    filePersistenceCount,
    backendSubmitActionCount,
    formSubmitButtonCount,
    apiCallCount,
    memoryCreationCount,
    seasonMemoryCreationCount,
    teamStyleMemoryCreationCount,
    workflowPersistencePerformed,
    workflowApplicationPerformed: false,
    storageDecisionImplementedCount,
    nonPersistenceWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_WORKFLOW_NON_PERSISTENT" : "REPAIR_WORKFLOW_PERSISTENCE_BOUNDARY",
  };
}

export function auditManualReviewWorkflowBoundary8R(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowBoundaryAudit8R {
  const slice = workflowSlice(input.productHtml, input.exportHtml);
  const officialTruthPromotionCount = countMatches(slice, /officialTruth:\s*true|devient une verite officielle|est une verite officielle|official truth promoted/giu);
  const coachInputPromotedToOfficialTruthCount = countMatches(slice, /coach input promoted to official truth|saisie coach promue en verite officielle/giu);
  const workflowClaimedAsRealNextMatchCount = countMatches(slice, /le prochain match a confirme|le prochain match montre|real next match confirmed/giu);
  const workflowClaimedAsEngineResultCount = countMatches(slice, /moteur apprend|moteur a appris|engine result confirmed|engine learning confirmed/giu);
  const workflowClaimedAsSeasonTrendCount = countMatches(slice, /tendance de saison est confirmee|season trend confirmed/giu);
  const workflowClaimedAsTeamMemoryCount = countMatches(slice, /team memory confirmed|memoire de style confirmee|memoire d'equipe confirmee/giu);
  const automaticDecisionCount = countMatches(slice, /decision automatique active|automatic decision active|appliquer cette decision/giu);
  const automaticClassificationRealMatchCount = countMatches(slice, /classification automatique.*vrai match|auto-classification real match/giu);
  const selectionRecommendationCount = countMatches(slice, /changer la selection|selection imposee active|selection imposee officiellement|doit selectionner|a selectionner/giu);
  const tacticalInstructionCount = countMatches(slice, /changer le systeme|plan tactique a appliquer|consigne tactique imposee|recommandation tactique officielle/giu);
  const sandboxPromotionCount = countMatches(slice, /sandbox promu en officiel|official sandbox truth/giu);
  const diagnosticPromotionCount = countMatches(slice, /diagnostic promu en officiel|official diagnostic truth/giu);
  const batchPromotionCount = countMatches(slice, /batch promu en officiel|official batch truth/giu);
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (officialTruthPromotionCount > 0 || coachInputPromotedToOfficialTruthCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (workflowClaimedAsRealNextMatchCount > 0) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (workflowClaimedAsEngineResultCount > 0) warnings.push("ENGINE_LEARNING_CLAIM_DETECTED");
  if (workflowClaimedAsSeasonTrendCount > 0) warnings.push("SEASON_TREND_CLAIM_DETECTED");
  if (workflowClaimedAsTeamMemoryCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");
  if (automaticDecisionCount > 0) warnings.push("WORKFLOW_AUTOMATIC_DECISION_DETECTED");
  if (automaticClassificationRealMatchCount > 0) warnings.push("WORKFLOW_AUTO_CLASSIFICATION_DETECTED");
  if (selectionRecommendationCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_WORKFLOW_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_WORKFLOW_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_WORKFLOW_PROMOTED");
  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount,
    workflowClaimedAsRealNextMatchCount,
    workflowClaimedAsEngineResultCount,
    workflowClaimedAsSeasonTrendCount,
    workflowClaimedAsTeamMemoryCount,
    automaticDecisionCount,
    automaticClassificationRealMatchCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    boundaryWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_WORKFLOW_BOUNDARIES" : "REPAIR_WORKFLOW_BOUNDARIES",
  };
}

export function auditManualReviewWorkflowSourceOfTruthRegression8R(input: {
  readonly workflow: ManualReviewWorkflowReadiness8R;
  readonly baselineSourceAudit: {
    readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
    readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
    readonly reportScoreMatchesOfficialScore: boolean;
    readonly allStoryScoreClaimsBackedByScoreChange: boolean;
    readonly allReplayScoreClaimsBackedByScoreChange: boolean;
    readonly manualGateDoesNotMutateTimeline: boolean;
    readonly manualGateDoesNotMutateScore: boolean;
    readonly manualGateDoesNotCreateScoreChange: boolean;
    readonly manualGateDoesNotPromoteCoachInputToOfficialTruth: boolean;
    readonly noScoreMutation: boolean;
    readonly noEventDeletion: boolean;
    readonly noScoringConstantChange: boolean;
    readonly MatchBonusEventUnchanged: boolean;
    readonly batchLiveSeparationPreserved: boolean;
  };
}): ManualReviewWorkflowSourceOfTruthRegressionAudit8R {
  const audit = input.baselineSourceAudit;
  const manualWorkflowDoesNotClaimNewScoreEvidence = input.workflow.isOfficialMatchEvidence === false && input.workflow.officialTruth === false;
  const manualWorkflowDoesNotCreateFutureEvidence = input.workflow.isRealCoachSubmission === false;
  const values = [
    audit.reportUsesOfficialTimelineOnlyForOfficialStory,
    audit.reportUsesOfficialScoreOnlyForOfficialScore,
    audit.reportScoreMatchesOfficialScore,
    audit.allStoryScoreClaimsBackedByScoreChange,
    audit.allReplayScoreClaimsBackedByScoreChange,
    manualWorkflowDoesNotClaimNewScoreEvidence,
    manualWorkflowDoesNotCreateFutureEvidence,
    audit.manualGateDoesNotMutateTimeline,
    audit.manualGateDoesNotMutateScore,
    audit.manualGateDoesNotCreateScoreChange,
    audit.manualGateDoesNotPromoteCoachInputToOfficialTruth,
    audit.noScoreMutation,
    audit.noEventDeletion,
    audit.noScoringConstantChange,
    audit.MatchBonusEventUnchanged,
    audit.batchLiveSeparationPreserved,
  ];
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = values.every(Boolean) ? [] : ["SCORE_MANIPULATION_DETECTED"];
  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: audit.reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore: audit.reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore: audit.reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange: audit.allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange: audit.allReplayScoreClaimsBackedByScoreChange,
    manualWorkflowDoesNotClaimNewScoreEvidence,
    manualWorkflowDoesNotCreateFutureEvidence,
    manualWorkflowDoesNotMutateTimeline: audit.manualGateDoesNotMutateTimeline,
    manualWorkflowDoesNotMutateScore: audit.manualGateDoesNotMutateScore,
    manualWorkflowDoesNotCreateScoreChange: audit.manualGateDoesNotCreateScoreChange,
    manualWorkflowDoesNotPromoteCoachInputToOfficialTruth: audit.manualGateDoesNotPromoteCoachInputToOfficialTruth,
    noScoreMutation: audit.noScoreMutation,
    noEventDeletion: audit.noEventDeletion,
    noScoringConstantChange: audit.noScoringConstantChange,
    MatchBonusEventUnchanged: audit.MatchBonusEventUnchanged,
    batchLiveSeparationPreserved: audit.batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_SOURCE_OF_TRUTH_SEPARATION" : "REPAIR_SOURCE_OF_TRUTH_REGRESSION",
  };
}

export function auditManualReviewWorkflowExportMetadata8R(exportHtml: string): ManualReviewWorkflowExportMetadataAudit8R {
  const exportTitleMentions8R = /<title>[^<]*8R[^<]*<\/title>/iu.test(exportHtml);
  const exportMainCurrentVersionVisible = /<main\b[^>]*data-manual-review-workflow-readiness-version="8R"/iu.test(exportHtml);
  const exportVisibleBadgeMentions8R = exportHtml.includes("Export compact 8R") || exportHtml.includes("Workflow revue manuelle 8R");
  const exportMainIdStillCompressedExport8Q = /\bid="compressed-export-8q"/iu.test(exportHtml);
  const exportMainIdStillCompressedExport8P = /\bid="compressed-export-8p"/iu.test(exportHtml);
  const exportMainIdStillCompressedExport8N = /\bid="compressed-export-8n"/iu.test(exportHtml);
  const exportMainIdStillCompressedExport8I = /\bid="compressed-export-8i"/iu.test(exportHtml);
  const export8PEyebrowCorrected = /id="manual-review-preview-comparison-export-8p"[\s\S]*?<p class="eyebrow">Comparaison preview 8P<\/p>/iu.test(exportHtml);
  const export8QEyebrowPreserved = /id="manual-review-preview-decision-gate-export-8q"[\s\S]*?<p class="eyebrow">Gate preview 8Q<\/p>/iu.test(exportHtml);
  const exportHistoricalMarkersPreservedAsDataAttributes = [
    'data-story-first-export-version="8I"',
    'data-export-restoration-version="8J"',
    'data-learning-loop-version="8L"',
    'data-manual-review-form-version="8M"',
    'data-manual-review-intake-boundary-version="8N"',
    'data-manual-review-preview-renderer-version="8O"',
    'data-manual-review-preview-comparison-version="8P"',
    'data-manual-review-preview-decision-gate-version="8Q"',
  ].every((marker) => exportHtml.includes(marker));
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (!exportTitleMentions8R) warnings.push("EXPORT_TITLE_MISSING_8R");
  if (!exportMainCurrentVersionVisible) warnings.push("EXPORT_TITLE_MISSING_8R");
  if (!exportVisibleBadgeMentions8R) warnings.push("EXPORT_BADGE_MISSING_8R");
  if (exportMainIdStillCompressedExport8Q) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8Q");
  if (exportMainIdStillCompressedExport8P) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  if (exportMainIdStillCompressedExport8N) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (exportMainIdStillCompressedExport8I) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  if (!export8PEyebrowCorrected) warnings.push("EXPORT_8P_EYEBROW_STILL_GATE_8Q");
  if (!export8QEyebrowPreserved) warnings.push("EXPORT_8Q_EYEBROW_MISSING");
  if (!exportHistoricalMarkersPreservedAsDataAttributes) warnings.push("EXPORT_COMPACT_REGRESSED");
  return {
    exportTitleMentions8R,
    exportMainCurrentVersionVisible,
    exportVisibleBadgeMentions8R,
    exportMainIdStillCompressedExport8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    export8PEyebrowCorrected,
    export8QEyebrowPreserved,
    exportHistoricalMarkersPreservedAsDataAttributes,
    metadataWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_METADATA_8R" : "REPAIR_EXPORT_METADATA_8R",
  };
}

export function auditManualReviewWorkflowExportBudget8R(input: {
  readonly exportHtmlBefore8R: string;
  readonly exportHtmlAfter8R: string;
  readonly exportMetadataClean: boolean;
}): ManualReviewWorkflowExportBudgetAudit8R {
  const exportReadTimeSecondsBefore8R = readTimeSeconds(input.exportHtmlBefore8R);
  const exportReadTimeSecondsAfter8R = readTimeSeconds(input.exportHtmlAfter8R);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8R <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8R <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8R <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8R <= 800);
  const exportWorkflowReadinessVisible = input.exportHtmlAfter8R.includes('id="manual-review-workflow-readiness-export-8r"');
  const exportMandatorySectionsPreserved = [
    "Gate preview",
    "Comparaison preview / plan",
    "Cartes tactiques essentielles",
    "Plan d'action",
  ].every((marker) => input.exportHtmlAfter8R.includes(marker));
  const exportNoFullTimeline = !input.exportHtmlAfter8R.includes("timeline complete") && !input.exportHtmlAfter8R.includes("Full timeline");
  const exportNoSandboxPanel = !input.exportHtmlAfter8R.includes("sandbox panel") && !input.exportHtmlAfter8R.includes("Sandbox Panel");
  const exportNoLongBatchDiagnostics = !input.exportHtmlAfter8R.includes("long batch diagnostics");
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportWorkflowReadinessVisible || !exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics || !input.exportMetadataClean) {
    warnings.push("EXPORT_COMPACT_REGRESSED");
  }
  return {
    exportReadTimeSecondsBefore8R,
    exportReadTimeSecondsAfter8R,
    exportReadTimeDelta: exportReadTimeSecondsAfter8R - exportReadTimeSecondsBefore8R,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportWorkflowReadinessVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportMetadataClean: input.exportMetadataClean,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_COMPACT_EXPORT_8R" : "REPAIR_COMPACT_EXPORT_8R",
  };
}

export function auditManualReviewWorkflowIntegrationBudget8R(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowIntegrationBudgetAudit8R {
  const productWorkflowReadinessVisible = input.productHtml.includes('id="manual-review-workflow-readiness-8r"');
  const exportWorkflowReadinessVisible = input.exportHtml.includes('id="manual-review-workflow-readiness-export-8r"');
  const productDecisionGate8QStillVisible = input.productHtml.includes('id="manual-review-preview-decision-gate-8q"');
  const exportDecisionGate8QStillVisible = input.exportHtml.includes('id="manual-review-preview-decision-gate-export-8q"');
  const productPreviewComparison8PStillVisible = input.productHtml.includes('id="manual-review-preview-comparison-8p"');
  const exportPreviewComparison8PStillVisible = input.exportHtml.includes('id="manual-review-preview-comparison-export-8p"');
  const productPreviewRenderer8OStillVisible = input.productHtml.includes('id="manual-review-preview-renderer-8o"');
  const exportPreviewRenderer8OStillVisible = input.exportHtml.includes('id="manual-review-preview-renderer-export-8o"');
  const productManualIntakeBoundary8NStillVisible = input.productHtml.includes('id="manual-review-result-intake-boundary-8n"');
  const exportManualIntakeBoundary8NStillVisible = input.exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"');
  const productManualForm8MStillVisible = input.productHtml.includes('id="manual-post-match-review-form-8m"');
  const exportManualForm8MStillVisible = input.exportHtml.includes('id="manual-post-match-review-form-export-8m"');
  const productLearningLoop8LStillVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"');
  const exportLearningLoop8LStillVisible = input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const productDecisionLayer8KStillVisible = input.productHtml.includes('id="coach-decision-layer-8k"');
  const exportDecisionLayer8KStillVisible = input.exportHtml.includes('id="next-match-observation-export-8k"') || input.exportHtml.includes("A observer au prochain match");
  const productStoryFirstSectionVisible = input.productHtml.includes("Lecture express") || input.productHtml.includes("match en 2 minutes");
  const exportStoryFirstSectionVisible = input.exportHtml.includes("Lecture express") || input.exportHtml.includes("match en 2 minutes");
  const productReplaySectionVisible = input.productHtml.includes("Replay coach") || input.productHtml.includes("replay");
  const exportReplaySectionVisible = input.exportHtml.includes("Replay coach") || input.exportHtml.includes("replay");
  const productActionPlanVisible = input.productHtml.includes("Plan d'action");
  const exportActionPlanVisible = input.exportHtml.includes("Plan d'action");
  const tacticalMapCardsStillVisible = input.productHtml.includes("tactical-map-card") && input.exportHtml.includes("Cartes tactiques essentielles");
  const sourceOfTruthNoteVisible = input.productHtml.includes("Source officielle") && (input.exportHtml.includes("Source officielle") || input.exportHtml.includes("score_change"));
  const productSectionOrderPreserved = orderPreserved(input.productHtml, 'id="manual-review-preview-decision-gate-8q"', 'id="manual-review-workflow-readiness-8r"');
  const exportCompactPreserved = input.exportHtml.includes('id="compressed-export-8r"') ||
    input.exportHtml.includes('id="compressed-export-8v"') ||
    input.exportHtml.includes('id="compressed-export-8u"') ||
    input.exportHtml.includes('id="compressed-export-8t"') ||
    input.exportHtml.includes('id="compressed-export-8s"') ||
    input.exportHtml.includes('id="compressed-export-current"');
  const values = [
    productWorkflowReadinessVisible,
    exportWorkflowReadinessVisible,
    productDecisionGate8QStillVisible,
    exportDecisionGate8QStillVisible,
    productPreviewComparison8PStillVisible,
    exportPreviewComparison8PStillVisible,
    productPreviewRenderer8OStillVisible,
    exportPreviewRenderer8OStillVisible,
    productManualIntakeBoundary8NStillVisible,
    exportManualIntakeBoundary8NStillVisible,
    productManualForm8MStillVisible,
    exportManualForm8MStillVisible,
    productLearningLoop8LStillVisible,
    exportLearningLoop8LStillVisible,
    productDecisionLayer8KStillVisible,
    exportDecisionLayer8KStillVisible,
    productStoryFirstSectionVisible,
    exportStoryFirstSectionVisible,
    productReplaySectionVisible,
    exportReplaySectionVisible,
    productActionPlanVisible,
    exportActionPlanVisible,
    tacticalMapCardsStillVisible,
    sourceOfTruthNoteVisible,
    productSectionOrderPreserved,
    exportCompactPreserved,
  ];
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = values.every(Boolean) ? [] : ["EXPORT_COMPACT_REGRESSED"];
  return {
    productWorkflowReadinessVisible,
    exportWorkflowReadinessVisible,
    productDecisionGate8QStillVisible,
    exportDecisionGate8QStillVisible,
    productPreviewComparison8PStillVisible,
    exportPreviewComparison8PStillVisible,
    productPreviewRenderer8OStillVisible,
    exportPreviewRenderer8OStillVisible,
    productManualIntakeBoundary8NStillVisible,
    exportManualIntakeBoundary8NStillVisible,
    productManualForm8MStillVisible,
    exportManualForm8MStillVisible,
    productLearningLoop8LStillVisible,
    exportLearningLoop8LStillVisible,
    productDecisionLayer8KStillVisible,
    exportDecisionLayer8KStillVisible,
    productStoryFirstSectionVisible,
    exportStoryFirstSectionVisible,
    productReplaySectionVisible,
    exportReplaySectionVisible,
    productActionPlanVisible,
    exportActionPlanVisible,
    tacticalMapCardsStillVisible,
    sourceOfTruthNoteVisible,
    productSectionOrderPreserved,
    exportCompactPreserved,
    integrationWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_8R_INTEGRATION" : "REPAIR_8R_INTEGRATION",
  };
}

export function auditManualReviewWorkflowWording8R(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewWorkflowWordingAudit8R {
  const slice = workflowSlice(input.productHtml, input.exportHtml);
  const workflowDemoOnlyWordingVisible = /demo|demonstration/iu.test(slice);
  const workflowNonOfficialWordingVisible = /non officiel|non officielle/iu.test(slice);
  const workflowNotPersistedWordingVisible = /non persiste|aucun stockage|ne stocke rien/iu.test(slice);
  const workflowNotAppliedWordingVisible = /non applique|aucune decision automatique|pas de decision automatique/iu.test(slice);
  const workflowReadinessDistinctFromReviewGateWordingVisible = /workflow est pret[\s\S]*revue.*reste a completer|Gate de la revue actuelle[\s\S]*a completer/iu.test(slice);
  const noRealNextMatchClaimCount = countMatches(slice, /le prochain match a confirme|le prochain match montre/giu);
  const noOfficialResultClaimCount = countMatches(slice, /resultat officiel de la preview|verite de match confirmee/giu);
  const noEngineLearningClaimCount = countMatches(slice, /moteur apprend|moteur a appris/giu);
  const noSeasonTrendClaimCount = countMatches(slice, /tendance de saison confirmee/giu);
  const noAutomaticDecisionClaimCount = countMatches(slice, /decision automatique active|appliquer cette decision/giu);
  const noSelectionInstructionCount = countMatches(slice, /changer la selection|selection imposee|doit selectionner/giu);
  const noTacticalInstructionCount = countMatches(slice, /changer le systeme|plan tactique a appliquer|consigne tactique imposee/giu);
  const noStorageReadyClaimCount = countMatches(slice, /stockage pret|storage ready|historique cree/giu);
  const ambiguousWorkflowWordingCount = countMatches(slice, /workflow officiel|decision reelle prete|selection automatique/giu);
  const warningCounts = noRealNextMatchClaimCount + noOfficialResultClaimCount + noEngineLearningClaimCount + noSeasonTrendClaimCount + noAutomaticDecisionClaimCount + noSelectionInstructionCount + noTacticalInstructionCount + noStorageReadyClaimCount + ambiguousWorkflowWordingCount;
  const wordingReadabilityScore = workflowDemoOnlyWordingVisible &&
    workflowNonOfficialWordingVisible &&
    workflowNotPersistedWordingVisible &&
    workflowNotAppliedWordingVisible &&
    workflowReadinessDistinctFromReviewGateWordingVisible &&
    warningCounts === 0
    ? 98
    : 86;
  const warnings: ManualReviewWorkflowReadinessWarningCode8R[] = [];
  if (!workflowDemoOnlyWordingVisible) warnings.push("WORKFLOW_DEMO_MARKER_MISSING");
  if (!workflowNonOfficialWordingVisible) warnings.push("WORKFLOW_NON_OFFICIAL_MARKER_MISSING");
  if (!workflowNotPersistedWordingVisible) warnings.push("WORKFLOW_NOT_PERSISTED_MARKER_MISSING");
  if (!workflowNotAppliedWordingVisible) warnings.push("WORKFLOW_NOT_APPLIED_MARKER_MISSING");
  if (!workflowReadinessDistinctFromReviewGateWordingVisible) warnings.push("WORKFLOW_READINESS_NOT_DISTINCT_FROM_REVIEW_GATE");
  if (warningCounts > 0) warnings.push("WORKFLOW_CLAIMS_REVIEW_READY_FOR_REAL_USE");
  return {
    workflowDemoOnlyWordingVisible,
    workflowNonOfficialWordingVisible,
    workflowNotPersistedWordingVisible,
    workflowNotAppliedWordingVisible,
    workflowReadinessDistinctFromReviewGateWordingVisible,
    noRealNextMatchClaimCount,
    noOfficialResultClaimCount,
    noEngineLearningClaimCount,
    noSeasonTrendClaimCount,
    noAutomaticDecisionClaimCount,
    noSelectionInstructionCount,
    noTacticalInstructionCount,
    noStorageReadyClaimCount,
    ambiguousWorkflowWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_WORKFLOW_WORDING" : "REPAIR_WORKFLOW_WORDING",
  };
}
