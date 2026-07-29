import { readTimeSeconds } from "./storyFirstAuditUtils8H";
import type {
  ManualReviewPreviewComparison8P,
  ManualReviewPreviewComparisonAudit8P,
  ManualReviewPreviewComparisonExportBudgetAudit8P,
  ManualReviewPreviewComparisonExportMetadataAudit8P,
  ManualReviewPreviewComparisonIntegrationBudgetAudit8P,
  ManualReviewPreviewComparisonNonPersistenceAudit8P,
  ManualReviewPreviewComparisonOfficialTruthBoundaryAudit8P,
  ManualReviewPreviewComparisonWordingAudit8P,
  ManualReviewPreviewPlanCoverageAudit8P,
} from "./manualReviewPreviewComparisonTypes8P";
import type { ManualReviewPreviewComparisonWarningCode8P } from "./manualReviewPreviewComparisonWarnings8P";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

function comparisonSlice(productHtml: string, exportHtml: string): string {
  const combined = `${productHtml}\n${exportHtml}`;
  const start = combined.indexOf("manual-review-preview-comparison");
  return start < 0 ? "" : combined.slice(start);
}

function orderPreserved(html: string, first: string, second: string): boolean {
  const firstIndex = html.indexOf(first);
  const secondIndex = html.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

export function auditManualReviewPreviewComparison8P(input: {
  readonly comparison: ManualReviewPreviewComparison8P;
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly baseline8OStatus: string;
  readonly invalidPreviewStatus: string;
}): ManualReviewPreviewComparisonAudit8P {
  const productPreviewComparisonVisible = input.productHtml.includes('id="manual-review-preview-comparison-8p"');
  const exportPreviewComparisonVisible = input.exportHtml.includes('id="manual-review-preview-comparison-export-8p"');
  const comparisonUses8OValidatedPreviewOnly = input.baseline8OStatus === "PASS" && input.comparison.sourcePreviewVersion === "8O";
  const invalidPreviewComparisonBlocked = input.invalidPreviewStatus === "rejected";
  const comparisonUses8K8LObservationPlan = input.comparison.comparisonCards.every((card) =>
    card.originalObservationQuestion.length > 0 &&
    card.originalConfirmationCriteria.length > 0 &&
    card.originalDisconfirmationCriteria.length > 0 &&
    card.originalInsufficientEvidenceCriteria.length > 0,
  );
  const comparisonCardCount = input.comparison.comparisonCards.length;
  const linked = input.comparison.comparisonCards.filter((card) =>
    card.linked8OPreviewCardId.length > 0 &&
    card.linked8NEntryId.length > 0 &&
    card.linked8MReviewSectionId.length > 0 &&
    card.linked8LObservationCardId.length > 0 &&
    card.linked8KDecisionCardId.length > 0,
  ).length;
  const comparisonCardsWithOriginalQuestionCount = input.comparison.comparisonCards.filter((card) => card.originalObservationQuestion.length > 0).length;
  const comparisonCardsWithOriginalCriteriaCount = input.comparison.comparisonCards.filter((card) =>
    card.originalConfirmationCriteria.length > 0 &&
    card.originalDisconfirmationCriteria.length > 0 &&
    card.originalInsufficientEvidenceCriteria.length > 0,
  ).length;
  const comparisonCardsWithPreviewOutcomeCount = input.comparison.comparisonCards.filter((card) => card.previewOutcome.length > 0).length;
  const comparisonCardsWithAnswerStatusCount = input.comparison.comparisonCards.filter((card) => card.answerStatus.length > 0).length;
  const comparisonCardsWithGapToReviewCount = input.comparison.comparisonCards.filter((card) => card.gapToReview.length > 0).length;
  const comparisonMarkedDemoOnlyCount = input.comparison.comparisonCards.filter((card) => card.demoOnly).length;
  const comparisonMarkedNonOfficialCount = input.comparison.comparisonCards.filter((card) => card.nonOfficial && !card.officialTruth).length;
  const comparisonMarkedNotPersistedCount = input.comparison.comparisonCards.filter((card) => card.notPersisted).length;
  const comparisonMarkedNotAppliedCount = input.comparison.comparisonCards.filter((card) => card.notApplied).length;
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (!productPreviewComparisonVisible) warnings.push("PRODUCT_PREVIEW_COMPARISON_MISSING");
  if (!exportPreviewComparisonVisible) warnings.push("EXPORT_PREVIEW_COMPARISON_MISSING");
  if (!comparisonUses8OValidatedPreviewOnly) warnings.push("COMPARISON_RENDERED_WITHOUT_VALIDATED_PREVIEW");
  if (!invalidPreviewComparisonBlocked) warnings.push("INVALID_PREVIEW_COMPARISON_RENDERED");
  if (!comparisonUses8K8LObservationPlan) warnings.push("COMPARISON_PLAN_MISSING");
  if (comparisonCardCount !== 3) warnings.push("COMPARISON_CARD_COUNT_INVALID");
  if (linked !== 3) warnings.push("COMPARISON_CARD_LINK_MISSING");
  if (comparisonCardsWithOriginalQuestionCount !== 3) warnings.push("ORIGINAL_QUESTION_MISSING");
  if (comparisonCardsWithOriginalCriteriaCount !== 3) warnings.push("ORIGINAL_CRITERIA_MISSING");
  if (comparisonCardsWithAnswerStatusCount !== 3) warnings.push("ANSWER_STATUS_MISSING");
  if (comparisonCardsWithGapToReviewCount !== 3) warnings.push("GAP_TO_REVIEW_MISSING");
  if (comparisonMarkedDemoOnlyCount !== 3) warnings.push("COMPARISON_DEMO_MARKER_MISSING");
  if (comparisonMarkedNonOfficialCount !== 3) warnings.push("COMPARISON_NON_OFFICIAL_MARKER_MISSING");
  if (comparisonMarkedNotPersistedCount !== 3) warnings.push("COMPARISON_NOT_PERSISTED_MARKER_MISSING");
  if (comparisonMarkedNotAppliedCount !== 3) warnings.push("COMPARISON_NOT_APPLIED_MARKER_MISSING");

  return {
    previewComparisonVisible: productPreviewComparisonVisible && exportPreviewComparisonVisible,
    productPreviewComparisonVisible,
    exportPreviewComparisonVisible,
    comparisonUses8OValidatedPreviewOnly,
    invalidPreviewComparisonBlocked,
    comparisonUses8K8LObservationPlan,
    comparisonCardCount,
    comparisonCardsLinkedTo8OCount: linked,
    comparisonCardsLinkedTo8NCount: linked,
    comparisonCardsLinkedTo8MCount: linked,
    comparisonCardsLinkedTo8LCount: linked,
    comparisonCardsLinkedTo8KCount: linked,
    comparisonCardsWithOriginalQuestionCount,
    comparisonCardsWithOriginalCriteriaCount,
    comparisonCardsWithPreviewOutcomeCount,
    comparisonCardsWithAnswerStatusCount,
    comparisonCardsWithGapToReviewCount,
    comparisonMarkedDemoOnlyCount,
    comparisonMarkedNonOfficialCount,
    comparisonMarkedNotPersistedCount,
    comparisonMarkedNotAppliedCount,
    comparisonAuditWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_PREVIEW_COMPARISON" : "REPAIR_PREVIEW_COMPARISON",
  };
}

export function auditManualReviewPreviewPlanCoverage8P(comparison: ManualReviewPreviewComparison8P): ManualReviewPreviewPlanCoverageAudit8P {
  const answersQuestionCount = comparison.comparisonCards.filter((card) => card.answerStatus === "answers_question").length;
  const partiallyAnswersQuestionCount = comparison.comparisonCards.filter((card) => card.answerStatus === "partially_answers_question").length;
  const insufficientToAnswerCount = comparison.comparisonCards.filter((card) => card.answerStatus === "insufficient_to_answer").length;
  const comparisonGapCount = comparison.comparisonCards.filter((card) => card.gapToReview.length > 0).length;
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (answersQuestionCount !== 1 || partiallyAnswersQuestionCount !== 1 || insufficientToAnswerCount !== 1 || comparisonGapCount !== 3) {
    warnings.push("PLAN_COVERAGE_COUNT_INVALID");
  }
  return {
    answersQuestionCount,
    partiallyAnswersQuestionCount,
    insufficientToAnswerCount,
    confirmedCount: comparison.comparisonSummary.confirmedCount,
    contradictedCount: comparison.comparisonSummary.contradictedCount,
    inconclusiveCount: comparison.comparisonSummary.inconclusiveCount,
    insufficientSampleCount: comparison.comparisonSummary.insufficientSampleCount,
    comparisonGapCount,
    firstExitAnswerStatus: comparison.comparisonCards[0]?.answerStatus ?? "insufficient_to_answer",
    dangerContinuityAnswerStatus: comparison.comparisonCards[1]?.answerStatus ?? "insufficient_to_answer",
    structureAfterNeutralizedActionAnswerStatus: comparison.comparisonCards[2]?.answerStatus ?? "insufficient_to_answer",
    planCoverageWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_PLAN_COVERAGE" : "REPAIR_PLAN_COVERAGE",
  };
}

export function auditManualReviewPreviewComparisonNonPersistence8P(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewComparisonNonPersistenceAudit8P {
  const slice = comparisonSlice(input.productHtml, input.exportHtml);
  const localStoragePersistenceCount = countMatches(slice, /localStorage\s*\./giu);
  const databasePersistenceCount = countMatches(slice, /database write|db write|sqlite write|insert into/giu);
  const filePersistenceCount = countMatches(slice, /writeFile|file persistence|persisted file/giu);
  const backendSubmitActionCount = countMatches(slice, /backend submit|submit backend|api\/manual-review|post manual review/giu);
  const formSubmitButtonCount = countMatches(slice, /<button[^>]*submit|type="submit"|<form\b/giu);
  const apiCallCount = countMatches(slice, /fetch\(|XMLHttpRequest|axios\./giu);
  const memoryCreationCount = countMatches(slice, /memory created|memoire creee|creates? memory/giu);
  const seasonMemoryCreationCount = countMatches(slice, /season memory created|memoire de saison creee/giu);
  const teamStyleMemoryCreationCount = countMatches(slice, /team style memory created|memoire de style creee/giu);
  const comparisonPersistencePerformed = localStoragePersistenceCount + databasePersistenceCount + filePersistenceCount + backendSubmitActionCount + formSubmitButtonCount + apiCallCount + memoryCreationCount + seasonMemoryCreationCount + teamStyleMemoryCreationCount > 0;
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (localStoragePersistenceCount > 0) warnings.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (backendSubmitActionCount > 0 || formSubmitButtonCount > 0) warnings.push("BACKEND_SUBMIT_ACTION_DETECTED");
  if (apiCallCount > 0) warnings.push("API_CALL_DETECTED");
  if (memoryCreationCount > 0) warnings.push("COMPARISON_DOES_NOT_CREATE_MEMORY");
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
    comparisonPersistencePerformed,
    comparisonApplicationPerformed: false,
    nonPersistenceWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_NON_PERSISTENT_COMPARISON" : "REPAIR_COMPARISON_PERSISTENCE_BOUNDARY",
  };
}

export function auditManualReviewPreviewComparisonOfficialTruthBoundary8P(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewComparisonOfficialTruthBoundaryAudit8P {
  const slice = comparisonSlice(input.productHtml, input.exportHtml);
  const officialTruthPromotionCount = countMatches(slice, /officialTruth:\s*true|devient une verite officielle|est une verite officielle|official truth promoted/giu);
  const coachInputPromotedToOfficialTruthCount = countMatches(slice, /coach input promoted to official truth|saisie coach promue en verite officielle/giu);
  const comparisonClaimedAsRealNextMatchCount = countMatches(slice, /le prochain match a confirme|real next match confirmed/giu);
  const comparisonClaimedAsEngineResultCount = countMatches(slice, /moteur sait maintenant|engine result confirmed/giu);
  const comparisonClaimedAsSeasonTrendCount = countMatches(slice, /la tendance de saison est|season trend confirmed/giu);
  const automaticClassificationCount = countMatches(slice, /auto-classification active|classification automatique active/giu);
  const automaticDecisionCount = countMatches(slice, /decision automatique active|automatic decision active/giu);
  const selectionRecommendationCount = countMatches(slice, /selection imposee active|selection imposee officiellement|doit selectionner|a selectionner/giu);
  const tacticalInstructionCount = countMatches(slice, /plan tactique a appliquer|consigne tactique imposee/giu);
  const sandboxPromotionCount = countMatches(slice, /sandbox promu en officiel|official sandbox truth/giu);
  const diagnosticPromotionCount = countMatches(slice, /diagnostic promu en officiel|official diagnostic truth/giu);
  const batchPromotionCount = countMatches(slice, /batch promu en officiel|official batch truth/giu);
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (officialTruthPromotionCount > 0 || coachInputPromotedToOfficialTruthCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (comparisonClaimedAsRealNextMatchCount > 0) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (comparisonClaimedAsEngineResultCount > 0) warnings.push("ENGINE_LEARNING_CLAIM_DETECTED");
  if (comparisonClaimedAsSeasonTrendCount > 0) warnings.push("SEASON_TREND_CLAIM_DETECTED");
  if (automaticClassificationCount > 0) warnings.push("COMPARISON_AUTO_CLASSIFICATION_DETECTED");
  if (automaticDecisionCount > 0) warnings.push("COMPARISON_AUTOMATIC_DECISION_DETECTED");
  if (selectionRecommendationCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_COMPARISON_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_COMPARISON_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_COMPARISON_PROMOTED");
  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount,
    comparisonClaimedAsRealNextMatchCount,
    comparisonClaimedAsEngineResultCount,
    comparisonClaimedAsSeasonTrendCount,
    automaticClassificationCount,
    automaticDecisionCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    officialTruthBoundaryWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_COMPARISON_NON_OFFICIAL" : "REPAIR_COMPARISON_OFFICIAL_TRUTH_BOUNDARY",
  };
}

export function auditManualReviewPreviewComparisonExportMetadata8P(exportHtml: string): ManualReviewPreviewComparisonExportMetadataAudit8P {
  const exportTitleMentions8P = /<title>[^<]*8P[^<]*<\/title>/iu.test(exportHtml);
  const exportMainComparisonVersionVisible = /<main\b[^>]*data-manual-review-preview-comparison-version="8P"/iu.test(exportHtml);
  const exportVisibleBadgeMentions8P = exportHtml.includes("Export compact 8P") || exportHtml.includes("Comparaison preview 8P");
  const exportMainIdNoLonger8NOnly = !/\bid="compressed-export-8n"/iu.test(exportHtml);
  const exportMainIdNoLonger8IOnly = !/\bid="compressed-export-8i"/iu.test(exportHtml);
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (!exportTitleMentions8P) warnings.push("EXPORT_TITLE_MISSING_8P");
  if (!exportMainComparisonVersionVisible || !exportVisibleBadgeMentions8P) warnings.push("EXPORT_BADGE_MISSING_8P");
  if (!exportMainIdNoLonger8NOnly) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (!exportMainIdNoLonger8IOnly) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  return {
    exportTitleMentions8P,
    exportMainComparisonVersionVisible,
    exportVisibleBadgeMentions8P,
    exportMainIdNoLonger8NOnly,
    exportMainIdNoLonger8IOnly,
    exportMetadataWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_METADATA_8P" : "REPAIR_EXPORT_METADATA_8P",
  };
}

export function auditManualReviewPreviewComparisonExportBudget8P(input: {
  readonly exportHtmlBefore8P: string;
  readonly exportHtmlAfter8P: string;
}): ManualReviewPreviewComparisonExportBudgetAudit8P {
  const exportReadTimeSecondsBefore8P = readTimeSeconds(input.exportHtmlBefore8P);
  const exportReadTimeSecondsAfter8P = readTimeSeconds(input.exportHtmlAfter8P);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8P <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8P <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8P <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8P <= 800);
  const exportComparisonVisible = input.exportHtmlAfter8P.includes('id="manual-review-preview-comparison-export-8p"') &&
    input.exportHtmlAfter8P.includes("Comparaison preview / plan");
  const exportMandatorySectionsPreserved = input.exportHtmlAfter8P.includes("Le match en 2 minutes") &&
    input.exportHtmlAfter8P.includes("Replay coach en 60 secondes") &&
    input.exportHtmlAfter8P.includes("Plan d'action coach") &&
    input.exportHtmlAfter8P.includes("Preview revue manuelle");
  const exportNoFullTimeline = !/timeline complete|full timeline|chronologie complete/iu.test(input.exportHtmlAfter8P);
  const exportNoSandboxPanel = !/sandbox panel|sandbox applique/iu.test(input.exportHtmlAfter8P);
  const exportNoLongBatchDiagnostics = !/long batch diagnostics|diagnostics batch longs/iu.test(input.exportHtmlAfter8P);
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportComparisonVisible) warnings.push("EXPORT_PREVIEW_COMPARISON_MISSING");
  if (!exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics) warnings.push("EXPORT_COMPACT_REGRESSED");
  return {
    exportReadTimeSecondsBefore8P,
    exportReadTimeSecondsAfter8P,
    exportReadTimeDelta: exportReadTimeSecondsAfter8P - exportReadTimeSecondsBefore8P,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportComparisonVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_COMPARISON_EXPORT_BUDGET" : "REPAIR_COMPARISON_EXPORT_BUDGET",
  };
}

export function auditManualReviewPreviewComparisonIntegrationBudget8P(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewComparisonIntegrationBudgetAudit8P {
  const productPreviewComparisonVisible = input.productHtml.includes('id="manual-review-preview-comparison-8p"');
  const exportPreviewComparisonVisible = input.exportHtml.includes('id="manual-review-preview-comparison-export-8p"');
  const productPreviewRenderer8OStillVisible = input.productHtml.includes('id="manual-review-preview-renderer-8o"');
  const exportPreviewRenderer8OStillVisible = input.exportHtml.includes('id="manual-review-preview-renderer-export-8o"');
  const productManualIntakeBoundary8NStillVisible = input.productHtml.includes('id="manual-review-result-intake-boundary-8n"');
  const exportManualIntakeBoundary8NStillVisible = input.exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"');
  const productManualForm8MStillVisible = input.productHtml.includes('id="manual-post-match-review-form-8m"');
  const exportManualForm8MStillVisible = input.exportHtml.includes('id="manual-post-match-review-form-export-8m"');
  const productLearningLoop8LStillVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"');
  const exportLearningLoop8LStillVisible = input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const productDecisionLayer8KStillVisible = input.productHtml.includes('id="coach-decision-layer-8k"');
  const exportDecisionLayer8KStillVisible = input.exportHtml.includes('id="next-match-observation-export-8k"') || input.exportHtml.includes('id="coach-decision-layer-export-8k"');
  const productStoryFirstSectionVisible = input.productHtml.includes("Le match en 2 minutes") || input.productHtml.includes("Lecture express");
  const exportStoryFirstSectionVisible = input.exportHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = input.productHtml.includes("Replay coach") || input.productHtml.includes("replay");
  const exportReplaySectionVisible = input.exportHtml.includes("Replay coach en 60 secondes");
  const productActionPlanVisible = input.productHtml.includes("Plan d'action");
  const exportActionPlanVisible = input.exportHtml.includes("Plan d'action coach");
  const tacticalMapCardsStillVisible = input.productHtml.includes("Cartes tactiques") || input.exportHtml.includes("Cartes tactiques essentielles");
  const sourceOfTruthNoteVisible = input.productHtml.includes("source-of-truth") || input.exportHtml.includes("score officiel");
  const productSectionOrderPreserved = orderPreserved(input.productHtml, 'id="manual-review-preview-renderer-8o"', 'id="manual-review-preview-comparison-8p"');
  const exportCompactPreserved = orderPreserved(input.exportHtml, "Preview revue manuelle", "Comparaison preview / plan") &&
    input.exportHtml.includes("Cartes tactiques essentielles");
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (!productPreviewComparisonVisible) warnings.push("PRODUCT_PREVIEW_COMPARISON_MISSING");
  if (!exportPreviewComparisonVisible) warnings.push("EXPORT_PREVIEW_COMPARISON_MISSING");
  if (!productPreviewRenderer8OStillVisible) warnings.push("PRODUCT_PREVIEW_RENDERER_8O_REGRESSED");
  if (!exportPreviewRenderer8OStillVisible) warnings.push("EXPORT_PREVIEW_RENDERER_8O_REGRESSED");
  if (!productManualIntakeBoundary8NStillVisible) warnings.push("PRODUCT_MANUAL_INTAKE_BOUNDARY_8N_REGRESSED");
  if (!exportManualIntakeBoundary8NStillVisible) warnings.push("EXPORT_MANUAL_INTAKE_BOUNDARY_8N_REGRESSED");
  if (!productManualForm8MStillVisible) warnings.push("PRODUCT_MANUAL_FORM_8M_REGRESSED");
  if (!exportManualForm8MStillVisible) warnings.push("EXPORT_MANUAL_FORM_8M_REGRESSED");
  if (!productLearningLoop8LStillVisible) warnings.push("PRODUCT_LEARNING_LOOP_8L_REGRESSED");
  if (!exportLearningLoop8LStillVisible) warnings.push("EXPORT_LEARNING_LOOP_8L_REGRESSED");
  if (!productDecisionLayer8KStillVisible) warnings.push("PRODUCT_DECISION_LAYER_8K_REGRESSED");
  if (!exportDecisionLayer8KStillVisible) warnings.push("EXPORT_DECISION_LAYER_8K_REGRESSED");
  if (!productStoryFirstSectionVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!exportCompactPreserved) warnings.push("EXPORT_COMPACT_REGRESSED");
  return {
    productPreviewComparisonVisible,
    exportPreviewComparisonVisible,
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
    recommendation: warnings.length === 0 ? "KEEP_COMPARISON_INTEGRATION" : "REPAIR_COMPARISON_INTEGRATION",
  };
}

export function auditManualReviewPreviewComparisonWording8P(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewComparisonWordingAudit8P {
  const slice = comparisonSlice(input.productHtml, input.exportHtml);
  const comparisonDemoOnlyWordingVisible = /fixture de demonstration|Comparaison de demonstration|Preview demo/iu.test(slice);
  const comparisonNonOfficialWordingVisible = /non officielle|non officiel/iu.test(slice);
  const comparisonNotPersistedWordingVisible = /non persistee|non persiste|ne sont pas stockees/iu.test(slice);
  const comparisonNotAppliedWordingVisible = /non appliquee|non applique|ne sont pas appliquees/iu.test(slice);
  const noRealNextMatchClaimCount = countMatches(slice, /le prochain match a confirme|vrai prochain match confirme|real next match confirmed/giu);
  const noOfficialResultClaimCount = countMatches(slice, /resultat officiel de la preview|preview officielle|official preview result/giu);
  const noEngineLearningClaimCount = countMatches(slice, /moteur sait maintenant|engine learned|l'equipe a appris/giu);
  const noSeasonTrendClaimCount = countMatches(slice, /la tendance de saison est|season trend confirmed/giu);
  const noAutomaticDecisionClaimCount = countMatches(slice, /decision automatique active|automatic decision active/giu);
  const noSelectionInstructionCount = countMatches(slice, /selection imposee active|selection imposee officiellement|doit selectionner|a selectionner/giu);
  const noTacticalInstructionCount = countMatches(slice, /plan tactique a appliquer|consigne tactique imposee/giu);
  const ambiguousComparisonWordingCount = countMatches(slice, /outcome officiel|confirmed officially|preuve du prochain match confirmee/giu);
  const wordingReadabilityScore = comparisonDemoOnlyWordingVisible && comparisonNonOfficialWordingVisible && comparisonNotPersistedWordingVisible && comparisonNotAppliedWordingVisible ? 96 : 82;
  const warnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (!comparisonDemoOnlyWordingVisible) warnings.push("COMPARISON_DEMO_MARKER_MISSING");
  if (!comparisonNonOfficialWordingVisible) warnings.push("COMPARISON_NON_OFFICIAL_MARKER_MISSING");
  if (!comparisonNotPersistedWordingVisible) warnings.push("COMPARISON_NOT_PERSISTED_MARKER_MISSING");
  if (!comparisonNotAppliedWordingVisible) warnings.push("COMPARISON_NOT_APPLIED_MARKER_MISSING");
  if (noRealNextMatchClaimCount > 0) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (noOfficialResultClaimCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (noEngineLearningClaimCount > 0) warnings.push("ENGINE_LEARNING_CLAIM_DETECTED");
  if (noSeasonTrendClaimCount > 0) warnings.push("SEASON_TREND_CLAIM_DETECTED");
  if (noAutomaticDecisionClaimCount > 0) warnings.push("COMPARISON_AUTOMATIC_DECISION_DETECTED");
  if (noSelectionInstructionCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (noTacticalInstructionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (ambiguousComparisonWordingCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  return {
    comparisonDemoOnlyWordingVisible,
    comparisonNonOfficialWordingVisible,
    comparisonNotPersistedWordingVisible,
    comparisonNotAppliedWordingVisible,
    noRealNextMatchClaimCount,
    noOfficialResultClaimCount,
    noEngineLearningClaimCount,
    noSeasonTrendClaimCount,
    noAutomaticDecisionClaimCount,
    noSelectionInstructionCount,
    noTacticalInstructionCount,
    ambiguousComparisonWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_COMPARISON_WORDING" : "REPAIR_COMPARISON_WORDING",
  };
}
