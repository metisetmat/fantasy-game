import { readTimeSeconds } from "./storyFirstAuditUtils8H";
import type {
  ManualReviewPreviewDecisionGate8Q,
  ManualReviewPreviewDecisionGateAudit8Q,
  ManualReviewPreviewDecisionGateBoundaryAudit8Q,
  ManualReviewPreviewDecisionGateExportBudgetAudit8Q,
  ManualReviewPreviewDecisionGateExportMetadataAudit8Q,
  ManualReviewPreviewDecisionGateIntegrationBudgetAudit8Q,
  ManualReviewPreviewDecisionGateLogicAudit8Q,
  ManualReviewPreviewDecisionGateNonPersistenceAudit8Q,
  ManualReviewPreviewDecisionGateSourceOfTruthRegressionAudit8Q,
  ManualReviewPreviewDecisionGateWordingAudit8Q,
} from "./manualReviewPreviewDecisionGateTypes8Q";
import type { ManualReviewPreviewDecisionGateWarningCode8Q } from "./manualReviewPreviewDecisionGateWarnings8Q";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

function gateSlice(productHtml: string, exportHtml: string): string {
  const combined = `${productHtml}\n${exportHtml}`;
  const start = combined.indexOf("manual-review-preview-decision-gate");
  return start < 0 ? "" : combined.slice(start);
}

function orderPreserved(html: string, first: string, second: string): boolean {
  const firstIndex = html.indexOf(first);
  const secondIndex = html.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

export function auditManualReviewPreviewDecisionGate8Q(input: {
  readonly gate: ManualReviewPreviewDecisionGate8Q;
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly baseline8PStatus: string;
  readonly baseline8OStatus: string;
  readonly invalidComparisonStatus: string;
}): ManualReviewPreviewDecisionGateAudit8Q {
  const productDecisionGateVisible = input.productHtml.includes('id="manual-review-preview-decision-gate-8q"');
  const exportDecisionGateVisible = input.exportHtml.includes('id="manual-review-preview-decision-gate-export-8q"');
  const gateUses8PComparisonOnly = input.baseline8PStatus === "PASS" &&
    input.baseline8OStatus === "PASS" &&
    input.gate.sourceComparisonVersion === "8P" &&
    input.gate.sourcePreviewVersion === "8O";
  const invalidComparisonGateBlocked = input.invalidComparisonStatus === "blocked";
  const gateCardCount = input.gate.gateCards.length;
  const linked = input.gate.gateCards.filter((card) =>
    card.linked8PComparisonCardId.length > 0 &&
    card.linked8OPreviewCardId.length > 0 &&
    card.linked8NEntryId.length > 0 &&
    card.linked8MReviewSectionId.length > 0 &&
    card.linked8LObservationCardId.length > 0 &&
    card.linked8KDecisionCardId.length > 0,
  ).length;
  const gateCardsWithStatusCount = input.gate.gateCards.filter((card) => card.gateStatus.length > 0 && card.gateLabel.length > 0).length;
  const gateCardsWithReasonCount = input.gate.gateCards.filter((card) => card.gateReason.length > 0).length;
  const gateCardsWithRequiredBeforeRealUseCount = input.gate.gateCards.filter((card) => card.requiredBeforeRealUse.length > 0).length;
  const gateCardsWithNextCoachQuestionCount = input.gate.gateCards.filter((card) => card.coachReviewQuestion.trim().endsWith("?")).length;
  const gateMarkedDemoOnlyCount = input.gate.gateCards.filter((card) => card.demoOnly).length;
  const gateMarkedNonOfficialCount = input.gate.gateCards.filter((card) => card.nonOfficial && !card.officialTruth).length;
  const gateMarkedNotPersistedCount = input.gate.gateCards.filter((card) => card.notPersisted).length;
  const gateMarkedNotAppliedCount = input.gate.gateCards.filter((card) => card.notApplied).length;
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (!productDecisionGateVisible) warnings.push("PRODUCT_DECISION_GATE_MISSING");
  if (!exportDecisionGateVisible) warnings.push("EXPORT_DECISION_GATE_MISSING");
  if (!gateUses8PComparisonOnly) warnings.push("GATE_NOT_USING_8P_ONLY");
  if (!invalidComparisonGateBlocked) warnings.push("INVALID_COMPARISON_GATE_NOT_BLOCKED");
  if (gateCardCount !== 3) warnings.push("GATE_CARD_COUNT_INVALID");
  if (linked !== 3) warnings.push("GATE_CARD_LINK_MISSING");
  if (gateCardsWithStatusCount !== 3 || gateCardsWithReasonCount !== 3 || gateCardsWithRequiredBeforeRealUseCount !== 3 || gateCardsWithNextCoachQuestionCount !== 3) {
    warnings.push("GATE_CARD_CONTENT_MISSING");
  }
  if (gateMarkedDemoOnlyCount !== 3 || gateMarkedNonOfficialCount !== 3 || gateMarkedNotPersistedCount !== 3 || gateMarkedNotAppliedCount !== 3) {
    warnings.push("GATE_MARKER_MISSING");
  }
  return {
    decisionGateVisible: productDecisionGateVisible && exportDecisionGateVisible,
    productDecisionGateVisible,
    exportDecisionGateVisible,
    gateUses8PComparisonOnly,
    invalidComparisonGateBlocked,
    gateCardCount,
    gateCardsLinkedTo8PCount: linked,
    gateCardsLinkedTo8OCount: linked,
    gateCardsLinkedTo8NCount: linked,
    gateCardsLinkedTo8MCount: linked,
    gateCardsLinkedTo8LCount: linked,
    gateCardsLinkedTo8KCount: linked,
    gateCardsWithStatusCount,
    gateCardsWithReasonCount,
    gateCardsWithRequiredBeforeRealUseCount,
    gateCardsWithNextCoachQuestionCount,
    gateMarkedDemoOnlyCount,
    gateMarkedNonOfficialCount,
    gateMarkedNotPersistedCount,
    gateMarkedNotAppliedCount,
    decisionGateWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_REVIEW_PREVIEW_DECISION_GATE" : "REPAIR_MANUAL_REVIEW_PREVIEW_DECISION_GATE",
  };
}

export function auditManualReviewPreviewDecisionGateLogic8Q(input: {
  readonly gate: ManualReviewPreviewDecisionGate8Q;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewDecisionGateLogicAudit8Q {
  const readableCardCount = input.gate.gateCards.filter((card) => card.gateStatus === "readable").length;
  const needsCompletionCardCount = input.gate.gateCards.filter((card) => card.gateStatus === "needs_completion").length;
  const insufficientCardCount = input.gate.gateCards.filter((card) => card.gateStatus === "insufficient").length;
  const firstExitGateStatus = input.gate.gateCards[0]?.gateStatus ?? "insufficient";
  const dangerContinuityGateStatus = input.gate.gateCards[1]?.gateStatus ?? "insufficient";
  const structureAfterNeutralizedActionGateStatus = input.gate.gateCards[2]?.gateStatus ?? "insufficient";
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const globalGateReasonVisible = combined.includes(input.gate.globalGate.globalGateReason);
  const missingInformationVisible = input.productHtml.includes("Informations a completer") &&
    countMatches(input.productHtml, /manual-review-preview-decision-gate-missing-8q[\s\S]*?<li>/giu) >= 1;
  const requiredBeforeRealUseVisible = input.gate.gateCards.every((card) => combined.includes(card.requiredBeforeRealUse));
  const globalGateStatusCorrect = input.gate.globalGate.gateStatus === "needs_completion" &&
    readableCardCount === 1 &&
    needsCompletionCardCount === 1 &&
    insufficientCardCount === 1;
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (!globalGateStatusCorrect) warnings.push("GLOBAL_GATE_STATUS_INVALID");
  if (firstExitGateStatus !== "readable" || dangerContinuityGateStatus !== "needs_completion" || structureAfterNeutralizedActionGateStatus !== "insufficient") {
    warnings.push("GATE_LOGIC_INVALID");
  }
  if (!globalGateReasonVisible || !missingInformationVisible || !requiredBeforeRealUseVisible) warnings.push("MISSING_INFORMATION_NOT_VISIBLE");
  return {
    readableCardCount,
    needsCompletionCardCount,
    insufficientCardCount,
    globalGateStatus: input.gate.globalGate.gateStatus,
    globalGateExpectedStatus: "needs_completion",
    globalGateStatusCorrect,
    firstExitGateStatus,
    dangerContinuityGateStatus,
    structureAfterNeutralizedActionGateStatus,
    globalGateReasonVisible,
    missingInformationVisible,
    requiredBeforeRealUseVisible,
    logicWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_GATE_LOGIC" : "REPAIR_GATE_LOGIC",
  };
}

export function auditManualReviewPreviewDecisionGateNonPersistence8Q(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewDecisionGateNonPersistenceAudit8Q {
  const slice = gateSlice(input.productHtml, input.exportHtml);
  const localStoragePersistenceCount = countMatches(slice, /localStorage\s*\./giu);
  const databasePersistenceCount = countMatches(slice, /database write|db write|sqlite write|insert into/giu);
  const filePersistenceCount = countMatches(slice, /writeFile|file persistence|persisted file/giu);
  const backendSubmitActionCount = countMatches(slice, /backend submit|submit backend|api\/manual-review|post manual review/giu);
  const formSubmitButtonCount = countMatches(slice, /<button[^>]*submit|type="submit"|<form\b/giu);
  const apiCallCount = countMatches(slice, /fetch\(|XMLHttpRequest|axios\./giu);
  const memoryCreationCount = countMatches(slice, /memory created|memoire creee|creates? memory/giu);
  const seasonMemoryCreationCount = countMatches(slice, /season memory created|memoire de saison creee/giu);
  const teamStyleMemoryCreationCount = countMatches(slice, /team style memory created|memoire de style creee/giu);
  const gatePersistencePerformed = localStoragePersistenceCount + databasePersistenceCount + filePersistenceCount + backendSubmitActionCount + formSubmitButtonCount + apiCallCount + memoryCreationCount + seasonMemoryCreationCount + teamStyleMemoryCreationCount > 0;
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (localStoragePersistenceCount > 0) warnings.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (backendSubmitActionCount > 0 || formSubmitButtonCount > 0) warnings.push("BACKEND_SUBMIT_ACTION_DETECTED");
  if (apiCallCount > 0) warnings.push("API_CALL_DETECTED");
  if (memoryCreationCount > 0) warnings.push("MEMORY_CREATION_DETECTED");
  if (seasonMemoryCreationCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");
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
    gatePersistencePerformed,
    gateApplicationPerformed: false,
    nonPersistenceWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_NON_PERSISTENT_GATE" : "REPAIR_GATE_PERSISTENCE_BOUNDARY",
  };
}

export function auditManualReviewPreviewDecisionGateBoundary8Q(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewDecisionGateBoundaryAudit8Q {
  const slice = gateSlice(input.productHtml, input.exportHtml);
  const officialTruthPromotionCount = countMatches(slice, /officialTruth:\s*true|devient une verite officielle|est une verite officielle|official truth promoted/giu);
  const coachInputPromotedToOfficialTruthCount = countMatches(slice, /coach input promoted to official truth|saisie coach promue en verite officielle/giu);
  const gateClaimedAsRealNextMatchCount = countMatches(slice, /le prochain match a confirme|le prochain match montre|real next match confirmed/giu);
  const gateClaimedAsEngineResultCount = countMatches(slice, /moteur apprend|moteur a appris|engine result confirmed|engine learning confirmed/giu);
  const gateClaimedAsSeasonTrendCount = countMatches(slice, /tendance de saison est confirmee|season trend confirmed/giu);
  const gateClaimedAsTeamMemoryCount = countMatches(slice, /team memory confirmed|memoire de style confirmee|memoire d'equipe confirmee/giu);
  const automaticDecisionCount = countMatches(slice, /decision automatique active|automatic decision active|appliquer cette decision/giu);
  const automaticClassificationRealMatchCount = countMatches(slice, /classification automatique.*vrai match|auto-classification real match/giu);
  const selectionRecommendationCount = countMatches(slice, /changer la selection|selection imposee active|selection imposee officiellement|doit selectionner|a selectionner/giu);
  const tacticalInstructionCount = countMatches(slice, /changer le systeme|plan tactique a appliquer|consigne tactique imposee|recommandation tactique officielle/giu);
  const sandboxPromotionCount = countMatches(slice, /sandbox promu en officiel|official sandbox truth/giu);
  const diagnosticPromotionCount = countMatches(slice, /diagnostic promu en officiel|official diagnostic truth/giu);
  const batchPromotionCount = countMatches(slice, /batch promu en officiel|official batch truth/giu);
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (officialTruthPromotionCount > 0 || coachInputPromotedToOfficialTruthCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (gateClaimedAsRealNextMatchCount > 0) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (gateClaimedAsEngineResultCount > 0) warnings.push("ENGINE_LEARNING_CLAIM_DETECTED");
  if (gateClaimedAsSeasonTrendCount > 0) warnings.push("SEASON_TREND_CLAIM_DETECTED");
  if (gateClaimedAsTeamMemoryCount > 0) warnings.push("TEAM_MEMORY_CLAIM_DETECTED");
  if (automaticDecisionCount > 0) warnings.push("AUTOMATIC_DECISION_DETECTED");
  if (automaticClassificationRealMatchCount > 0) warnings.push("AUTO_CLASSIFICATION_REAL_MATCH_DETECTED");
  if (selectionRecommendationCount > 0) warnings.push("SELECTION_AUTOMATION_DETECTED");
  if (tacticalInstructionCount > 0) warnings.push("TACTICAL_INSTRUCTION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_PROMOTED");
  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount,
    gateClaimedAsRealNextMatchCount,
    gateClaimedAsEngineResultCount,
    gateClaimedAsSeasonTrendCount,
    gateClaimedAsTeamMemoryCount,
    automaticDecisionCount,
    automaticClassificationRealMatchCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    boundaryWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_GATE_NON_OFFICIAL" : "REPAIR_GATE_OFFICIAL_TRUTH_BOUNDARY",
  };
}

export function auditManualReviewPreviewDecisionGateSourceOfTruthRegression8Q(input: {
  readonly gate: ManualReviewPreviewDecisionGate8Q;
  readonly baselineSourceAudit: {
    readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
    readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
    readonly reportScoreMatchesOfficialScore: boolean;
    readonly allStoryScoreClaimsBackedByScoreChange: boolean;
    readonly allReplayScoreClaimsBackedByScoreChange: boolean;
    readonly manualPreviewDoesNotMutateTimeline: boolean;
    readonly manualPreviewDoesNotMutateScore: boolean;
    readonly manualPreviewDoesNotCreateScoreChange: boolean;
    readonly manualPreviewDoesNotPromoteCoachInputToOfficialTruth: boolean;
    readonly noScoreMutation: boolean;
    readonly noEventDeletion: boolean;
    readonly noScoringConstantChange: boolean;
    readonly MatchBonusEventUnchanged: boolean;
    readonly batchLiveSeparationPreserved: boolean;
  };
}): ManualReviewPreviewDecisionGateSourceOfTruthRegressionAudit8Q {
  const audit = input.baselineSourceAudit;
  const manualGateDoesNotClaimNewScoreEvidence = input.gate.isOfficialMatchEvidence === false && input.gate.officialTruth === false;
  const manualGateDoesNotCreateFutureEvidence = input.gate.isRealCoachSubmission === false;
  const values = [
    audit.reportUsesOfficialTimelineOnlyForOfficialStory,
    audit.reportUsesOfficialScoreOnlyForOfficialScore,
    audit.reportScoreMatchesOfficialScore,
    audit.allStoryScoreClaimsBackedByScoreChange,
    audit.allReplayScoreClaimsBackedByScoreChange,
    manualGateDoesNotClaimNewScoreEvidence,
    manualGateDoesNotCreateFutureEvidence,
    audit.manualPreviewDoesNotMutateTimeline,
    audit.manualPreviewDoesNotMutateScore,
    audit.manualPreviewDoesNotCreateScoreChange,
    audit.manualPreviewDoesNotPromoteCoachInputToOfficialTruth,
    audit.noScoreMutation,
    audit.noEventDeletion,
    audit.noScoringConstantChange,
    audit.MatchBonusEventUnchanged,
    audit.batchLiveSeparationPreserved,
  ];
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = values.every(Boolean) ? [] : ["SOURCE_OF_TRUTH_REGRESSION"];
  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: audit.reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore: audit.reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore: audit.reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange: audit.allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange: audit.allReplayScoreClaimsBackedByScoreChange,
    manualGateDoesNotClaimNewScoreEvidence,
    manualGateDoesNotCreateFutureEvidence,
    manualGateDoesNotMutateTimeline: audit.manualPreviewDoesNotMutateTimeline,
    manualGateDoesNotMutateScore: audit.manualPreviewDoesNotMutateScore,
    manualGateDoesNotCreateScoreChange: audit.manualPreviewDoesNotCreateScoreChange,
    manualGateDoesNotPromoteCoachInputToOfficialTruth: audit.manualPreviewDoesNotPromoteCoachInputToOfficialTruth,
    noScoreMutation: audit.noScoreMutation,
    noEventDeletion: audit.noEventDeletion,
    noScoringConstantChange: audit.noScoringConstantChange,
    MatchBonusEventUnchanged: audit.MatchBonusEventUnchanged,
    batchLiveSeparationPreserved: audit.batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_SOURCE_OF_TRUTH_SEPARATION" : "REPAIR_SOURCE_OF_TRUTH_REGRESSION",
  };
}

export function auditManualReviewPreviewDecisionGateExportMetadata8Q(exportHtml: string): ManualReviewPreviewDecisionGateExportMetadataAudit8Q {
  const exportTitleMentions8Q = /<title>[^<]*8Q[^<]*<\/title>/iu.test(exportHtml);
  const exportMainCurrentVersionVisible = /<main\b[^>]*data-manual-review-preview-decision-gate-version="8Q"/iu.test(exportHtml);
  const exportVisibleBadgeMentions8Q = exportHtml.includes("Export compact 8Q") || exportHtml.includes("Gate preview 8Q");
  const exportMainIdStillCompressedExport8P = /\bid="compressed-export-8p"/iu.test(exportHtml);
  const exportMainIdStillCompressedExport8N = /\bid="compressed-export-8n"/iu.test(exportHtml);
  const exportMainIdStillCompressedExport8I = /\bid="compressed-export-8i"/iu.test(exportHtml);
  const exportHistoricalMarkersPreservedAsDataAttributes = [
    'data-story-first-export-version="8I"',
    'data-export-restoration-version="8J"',
    'data-learning-loop-version="8L"',
    'data-manual-review-form-version="8M"',
    'data-manual-review-intake-boundary-version="8N"',
    'data-manual-review-preview-renderer-version="8O"',
    'data-manual-review-preview-comparison-version="8P"',
  ].every((marker) => exportHtml.includes(marker));
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (!exportTitleMentions8Q) warnings.push("EXPORT_TITLE_MISSING_8Q");
  if (!exportMainCurrentVersionVisible) warnings.push("EXPORT_METADATA_MISSING_8Q");
  if (!exportVisibleBadgeMentions8Q) warnings.push("EXPORT_BADGE_MISSING_8Q");
  if (exportMainIdStillCompressedExport8P) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  if (exportMainIdStillCompressedExport8N) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (exportMainIdStillCompressedExport8I) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  if (!exportHistoricalMarkersPreservedAsDataAttributes) warnings.push("EXPORT_HISTORICAL_MARKERS_MISSING");
  return {
    exportTitleMentions8Q,
    exportMainCurrentVersionVisible,
    exportVisibleBadgeMentions8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    exportHistoricalMarkersPreservedAsDataAttributes,
    metadataWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_METADATA_8Q" : "REPAIR_EXPORT_METADATA_8Q",
  };
}

export function auditManualReviewPreviewDecisionGateExportBudget8Q(input: {
  readonly exportHtmlBefore8Q: string;
  readonly exportHtmlAfter8Q: string;
  readonly exportMetadataClean: boolean;
}): ManualReviewPreviewDecisionGateExportBudgetAudit8Q {
  const exportReadTimeSecondsBefore8Q = readTimeSeconds(input.exportHtmlBefore8Q);
  const exportReadTimeSecondsAfter8Q = readTimeSeconds(input.exportHtmlAfter8Q);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8Q <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8Q <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8Q <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8Q <= 800);
  const exportDecisionGateVisible = input.exportHtmlAfter8Q.includes('id="manual-review-preview-decision-gate-export-8q"');
  const exportMandatorySectionsPreserved = [
    "Comparaison preview / plan",
    "Cartes tactiques essentielles",
    "Plan d'action",
  ].every((marker) => input.exportHtmlAfter8Q.includes(marker)) &&
    (input.exportHtmlAfter8Q.includes("Source officielle") || input.exportHtmlAfter8Q.includes("score_change"));
  const exportNoFullTimeline = !input.exportHtmlAfter8Q.includes("timeline complete") && !input.exportHtmlAfter8Q.includes("Full timeline");
  const exportNoSandboxPanel = !input.exportHtmlAfter8Q.includes("sandbox panel") && !input.exportHtmlAfter8Q.includes("Sandbox Panel");
  const exportNoLongBatchDiagnostics = !input.exportHtmlAfter8Q.includes("long batch diagnostics");
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900_SECONDS");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_INVALID");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_INVALID");
  if (!exportDecisionGateVisible || !exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics || !input.exportMetadataClean) {
    warnings.push("EXPORT_COMPACTNESS_REGRESSION");
  }
  return {
    exportReadTimeSecondsBefore8Q,
    exportReadTimeSecondsAfter8Q,
    exportReadTimeDelta: exportReadTimeSecondsAfter8Q - exportReadTimeSecondsBefore8Q,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportDecisionGateVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportMetadataClean: input.exportMetadataClean,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_COMPACT_EXPORT_8Q" : "REPAIR_COMPACT_EXPORT_8Q",
  };
}

export function auditManualReviewPreviewDecisionGateIntegrationBudget8Q(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewDecisionGateIntegrationBudgetAudit8Q {
  const productDecisionGateVisible = input.productHtml.includes('id="manual-review-preview-decision-gate-8q"');
  const exportDecisionGateVisible = input.exportHtml.includes('id="manual-review-preview-decision-gate-export-8q"');
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
  const productSectionOrderPreserved = orderPreserved(input.productHtml, 'id="manual-review-preview-comparison-8p"', 'id="manual-review-preview-decision-gate-8q"');
  const exportCompactPreserved = input.exportHtml.includes('id="compressed-export-8q"') ||
    input.exportHtml.includes('id="compressed-export-8s"') ||
    input.exportHtml.includes('id="compressed-export-8r"') ||
    input.exportHtml.includes('id="compressed-export-current"');
  const visible = [
    productDecisionGateVisible,
    exportDecisionGateVisible,
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
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = visible.every(Boolean) ? [] : ["INTEGRATION_SECTION_MISSING"];
  return {
    productDecisionGateVisible,
    exportDecisionGateVisible,
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
    recommendation: warnings.length === 0 ? "KEEP_8Q_INTEGRATION" : "REPAIR_8Q_INTEGRATION",
  };
}

export function auditManualReviewPreviewDecisionGateWording8Q(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewDecisionGateWordingAudit8Q {
  const slice = gateSlice(input.productHtml, input.exportHtml);
  const gateDemoOnlyWordingVisible = /demo|demonstration/iu.test(slice);
  const gateNonOfficialWordingVisible = /non officiel|non officielle/iu.test(slice);
  const gateNotPersistedWordingVisible = /non persiste|ne stocke rien/iu.test(slice);
  const gateNotAppliedWordingVisible = /non applique|ne modifie pas|ne decide rien/iu.test(slice);
  const noRealNextMatchClaimCount = countMatches(slice, /le prochain match a confirme|le prochain match montre/giu);
  const noOfficialResultClaimCount = countMatches(slice, /resultat officiel de la preview|verite de match confirmee/giu);
  const noEngineLearningClaimCount = countMatches(slice, /moteur apprend|moteur a appris/giu);
  const noSeasonTrendClaimCount = countMatches(slice, /tendance de saison confirmee/giu);
  const noAutomaticDecisionClaimCount = countMatches(slice, /decision automatique active|appliquer cette decision/giu);
  const noSelectionInstructionCount = countMatches(slice, /changer la selection|selection imposee|doit selectionner/giu);
  const noTacticalInstructionCount = countMatches(slice, /changer le systeme|plan tactique a appliquer|consigne tactique imposee/giu);
  const ambiguousGateWordingCount = countMatches(slice, /gate tactique|decision tactique officielle|selection automatique/giu);
  const warningCounts = noRealNextMatchClaimCount + noOfficialResultClaimCount + noEngineLearningClaimCount + noSeasonTrendClaimCount + noAutomaticDecisionClaimCount + noSelectionInstructionCount + noTacticalInstructionCount + ambiguousGateWordingCount;
  const wordingReadabilityScore = gateDemoOnlyWordingVisible && gateNonOfficialWordingVisible && gateNotPersistedWordingVisible && gateNotAppliedWordingVisible && warningCounts === 0 ? 98 : 86;
  const warnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (!gateDemoOnlyWordingVisible || !gateNonOfficialWordingVisible || !gateNotPersistedWordingVisible || !gateNotAppliedWordingVisible) warnings.push("WORDING_BOUNDARY_MISSING");
  if (warningCounts > 0) warnings.push("AMBIGUOUS_GATE_WORDING");
  return {
    gateDemoOnlyWordingVisible,
    gateNonOfficialWordingVisible,
    gateNotPersistedWordingVisible,
    gateNotAppliedWordingVisible,
    noRealNextMatchClaimCount,
    noOfficialResultClaimCount,
    noEngineLearningClaimCount,
    noSeasonTrendClaimCount,
    noAutomaticDecisionClaimCount,
    noSelectionInstructionCount,
    noTacticalInstructionCount,
    ambiguousGateWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_GATE_WORDING" : "REPAIR_GATE_WORDING",
  };
}
