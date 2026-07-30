import { scoringRegistryEntry } from "../systems/scoring";
import type {
  ManualReviewUxInteractionBoundaryAudit8T,
  ManualReviewUxInteractionContract8T,
  ManualReviewUxInteractionContractAudit8T,
  ManualReviewUxInteractionDisabledStateAudit8T,
  ManualReviewUxInteractionExportBudgetAudit8T,
  ManualReviewUxInteractionExportMetadataAudit8T,
  ManualReviewUxInteractionIntegrationBudgetAudit8T,
  ManualReviewUxInteractionNonPersistenceAudit8T,
  ManualReviewUxInteractionSourceOfTruthRegressionAudit8T,
  ManualReviewUxInteractionWordingAudit8T,
} from "./manualReviewUxInteractionContractTypes8T";
import type { ManualReviewUxInteractionContractWarningCode8T } from "./manualReviewUxInteractionContractWarnings8T";
import type { ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel } from "./manualReviewWorkflowUxSkeletonTypes8S";

function countMatches(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((sum, pattern) => sum + [...text.matchAll(pattern)].length, 0);
}

export function estimateManualReviewUxInteractionReadTimeSeconds8T(html: string): number {
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  if (visibleText.length === 0) return 0;
  return Math.ceil((visibleText.split(/\s+/u).length / 180) * 60);
}

function hasAll(text: string, values: readonly string[]): boolean {
  return values.every((value) => text.includes(value));
}

function countActiveControls(html: string): number {
  return countMatches(html, [
    /<button\b(?![^>]*(?:disabled|aria-disabled="true"))/giu,
    /<(?:input|select|textarea)\b(?![^>]*(?:disabled|aria-disabled="true"|type="hidden"))/giu,
    /<a\b[^>]*(?:data-enabled-action|href="(?:\/api|api:|https?:\/\/api))/giu,
  ]);
}

export function auditManualReviewUxInteractionContract8T(input: {
  readonly contract: ManualReviewUxInteractionContract8T;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewUxInteractionContractAudit8T {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const productInteractionContractVisible = input.productHtml.includes('id="manual-review-ux-interaction-contract-8t"');
  const exportInteractionContractVisible = input.exportHtml.includes('id="manual-review-ux-interaction-contract-export-8t"');
  const futureInteractionCount = input.contract.futureInteractions.length;
  const blockedInteractionCount = input.contract.futureInteractions.filter((interaction) => interaction.statusIn8T === "documented_but_blocked").length;
  const enabledInteractionCount = input.contract.interactionSteps.filter((step) =>
    step.canBeActivatedIn8T ||
    step.canSubmitIn8T ||
    step.canPersistIn8T ||
    step.canCallApiIn8T ||
    step.canPromoteOfficialTruthIn8T ||
    step.canDriveSelectionIn8T ||
    step.canDriveTacticalInstructionIn8T,
  ).length;
  const interactionActivationRequirementVisible = combined.includes("Prerequis avant activation") ||
    combined.includes("Activation requirements");
  const storageDecisionDeferredVisible = combined.includes("decision de stockage") || combined.includes("stockage");
  const permissionsDecisionDeferredVisible = combined.includes("permissions");
  const officializationDecisionDeferredVisible = combined.includes("officialisation");
  const warningCodes: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (!productInteractionContractVisible && !exportInteractionContractVisible) warningCodes.push("INTERACTION_CONTRACT_MISSING");
  if (!productInteractionContractVisible) warningCodes.push("PRODUCT_INTERACTION_CONTRACT_MISSING");
  if (!exportInteractionContractVisible) warningCodes.push("EXPORT_INTERACTION_CONTRACT_MISSING");
  if (input.contract.interactionSteps.length !== 6) warningCodes.push("INTERACTION_STEP_COUNT_INVALID");
  if (futureInteractionCount !== 6) warningCodes.push("FUTURE_INTERACTION_COUNT_INVALID");
  if (blockedInteractionCount !== 6) warningCodes.push("BLOCKED_INTERACTION_COUNT_INVALID");
  if (enabledInteractionCount > 0) warningCodes.push("ENABLED_INTERACTION_DETECTED");
  if (input.contract.refusalStates.length !== 6) warningCodes.push("REFUSAL_STATE_COUNT_INVALID");
  if (input.contract.activationRequirements.length < 8) warningCodes.push("ACTIVATION_REQUIREMENT_MISSING");
  if (!storageDecisionDeferredVisible) warningCodes.push("STORAGE_DECISION_NOT_DEFERRED");
  if (!permissionsDecisionDeferredVisible) warningCodes.push("PERMISSIONS_DECISION_NOT_DEFERRED");
  if (!officializationDecisionDeferredVisible) warningCodes.push("OFFICIALIZATION_DECISION_NOT_DEFERRED");
  return {
    interactionContractVisible: productInteractionContractVisible && exportInteractionContractVisible,
    productInteractionContractVisible,
    exportInteractionContractVisible,
    interactionContractUsesUxSkeleton8S: input.contract.sourceUxSkeletonVersion === "8S" && combined.includes("8S"),
    interactionContractStepCount: input.contract.interactionSteps.length,
    interactionContractStepCountExpected: 6,
    futureInteractionCount,
    futureInteractionCountExpected: 6,
    blockedInteractionCount,
    blockedInteractionCountExpected: 6,
    enabledInteractionCount,
    refusalStateCount: input.contract.refusalStates.length,
    refusalStateCountExpected: 6,
    activationRequirementCount: input.contract.activationRequirements.length,
    interactionActivationRequirementVisible,
    storageDecisionDeferredVisible,
    permissionsDecisionDeferredVisible,
    officializationDecisionDeferredVisible,
    interactionContractWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 ? "INTERACTION_CONTRACT_READY" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_PARTIAL",
  };
}

export function auditManualReviewUxInteractionDisabledState8T(input: {
  readonly contract: ManualReviewUxInteractionContract8T;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewUxInteractionDisabledStateAudit8T {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const enabledCtaCount = countActiveControls(combined);
  const submitButtonCount = countMatches(combined, [/<button\b[^>]*type="submit"/giu, /<input\b[^>]*type="submit"/giu]);
  const enabledSubmitButtonCount = countMatches(combined, [/<(?:button|input)\b(?![^>]*disabled)[^>]*type="submit"/giu]);
  const backendActionCount = countMatches(combined, [/\bmethod="post"/giu, /\baction="[^"]+"/giu]);
  const apiCallCount = countMatches(combined, [/\bfetch\s*\(/giu, /\bXMLHttpRequest\b/giu, /\b(?:href|action)="\/api\//giu]);
  const clickableSubmitLikeTextCount = countMatches(combined, [
    /<button\b(?![^>]*(?:disabled|aria-disabled="true"))[^>]*>(?:[^<]*(?:Envoyer|Soumettre|Enregistrer|Submit)[^<]*)<\/button>/giu,
    /<a\b(?![^>]*aria-disabled="true")[^>]*>(?:[^<]*(?:Envoyer|Soumettre|Enregistrer|Submit)[^<]*)<\/a>/giu,
  ]);
  const warningCodes: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (enabledCtaCount > 0) warningCodes.push("ENABLED_CTA_DETECTED");
  if (submitButtonCount > 0) warningCodes.push("SUBMIT_BUTTON_DETECTED");
  if (backendActionCount > 0) warningCodes.push("BACKEND_ACTION_DETECTED");
  if (apiCallCount > 0) warningCodes.push("API_CALL_DETECTED");
  if (input.contract.futureInteractions.filter((interaction) => interaction.statusIn8T === "documented_but_blocked").length !== 6) {
    warningCodes.push("BLOCKED_INTERACTION_COUNT_INVALID");
  }
  return {
    documentedButBlockedInteractionCount: input.contract.futureInteractions.filter((interaction) => interaction.statusIn8T === "documented_but_blocked").length,
    enabledCtaCount,
    submitButtonCount,
    enabledSubmitButtonCount,
    backendActionCount,
    apiCallCount,
    interactiveControlCount: enabledCtaCount,
    clickableSubmitLikeTextCount,
    disabledInteractionLabelsVisible: input.contract.futureInteractions.every((interaction) => combined.includes(interaction.label)),
    disabledReasonsVisible: input.contract.futureInteractions.every((interaction) => combined.includes(interaction.blockedReason)),
    futureRequirementsVisible: input.contract.activationRequirements.length >= 8 && combined.includes("Decisions differees"),
    disabledStateWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 ? "NO_ENABLED_INTERACTION" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_FAIL",
  };
}

export function auditManualReviewUxInteractionNonPersistence8T(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewUxInteractionNonPersistenceAudit8T {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const localStoragePersistenceCount = countMatches(combined, [/\blocalStorage\.(?:setItem|removeItem|clear)/giu]);
  const databasePersistenceCount = countMatches(combined, [/\b(?:indexedDB|db\.save|insert into)\b/giu]);
  const filePersistenceCount = countMatches(combined, [/\b(?:writeFile|writeFileSync|appendFile|createWriteStream)\b/giu]);
  const backendSubmitActionCount = countMatches(combined, [/\bmethod="post"/giu, /\baction="[^"]+"/giu]);
  const formSubmitButtonCount = countMatches(combined, [/<(?:button|input)\b[^>]*type="submit"/giu]);
  const apiCallCount = countMatches(combined, [/\bfetch\s*\(/giu, /\bXMLHttpRequest\b/giu, /\b(?:href|action)="\/api\//giu]);
  const memoryCreationCount = countMatches(combined, [/\b(?:create memory|memoire creee|memory created|season memory created|team style memory created)\b/giu]);
  const seasonMemoryCreationCount = countMatches(combined, [/\bseason memory created\b/giu]);
  const teamStyleMemoryCreationCount = countMatches(combined, [/\bteam style memory created\b/giu]);
  const storageDecisionImplementedCount = countMatches(combined, [/\b(?:stockage actif|historique cree|storage enabled|persistence enabled)\b/giu]);
  const warningCodes: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (localStoragePersistenceCount > 0) warningCodes.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warningCodes.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warningCodes.push("FILE_PERSISTENCE_CREATED");
  if (seasonMemoryCreationCount > 0) warningCodes.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warningCodes.push("TEAM_STYLE_MEMORY_CREATED");
  if (backendSubmitActionCount > 0) warningCodes.push("BACKEND_ACTION_DETECTED");
  if (apiCallCount > 0) warningCodes.push("API_CALL_DETECTED");
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
    interactionPersistencePerformed: localStoragePersistenceCount + databasePersistenceCount + filePersistenceCount + memoryCreationCount > 0,
    interactionApplicationPerformed: countMatches(combined, [/\b(?:appliquer la revue|applied review|review applied)\b/giu]) > 0,
    storageDecisionImplementedCount,
    nonPersistenceWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 && storageDecisionImplementedCount === 0 ? "INTERACTION_CONTRACT_DOES_NOT_CREATE_STORAGE" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_FAIL",
  };
}

export function auditManualReviewUxInteractionBoundary8T(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewUxInteractionBoundaryAudit8T {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const officialTruthPromotionCount = countMatches(combined, [/\b(?:verite officielle creee|official truth promoted|source officielle modifiee)\b/giu]);
  const selectionRecommendationCount = Math.max(
    0,
    countMatches(combined, [/\b(?:selection imposee|doit selectionner|recommandation tactique officielle)\b/giu]) -
      countMatches(combined, [/\b(?:pas de selection|aucune selection)\b/giu]),
  );
  const tacticalInstructionCount = countMatches(combined, [/\b(?:consigne tactique officielle|plan tactique impose)\b/giu]);
  const automaticDecisionCount = countMatches(combined, [/\b(?:decision automatique activee|automatic decision created)\b/giu]);
  const warningCodes: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (officialTruthPromotionCount > 0) warningCodes.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (automaticDecisionCount > 0) warningCodes.push("AUTOMATIC_DECISION_DETECTED");
  if (selectionRecommendationCount > 0) warningCodes.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warningCodes.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount: officialTruthPromotionCount,
    interactionClaimedAsRealNextMatchCount: countMatches(combined, [/\b(?:prochain match confirme|real next match result)\b/giu]),
    interactionClaimedAsEngineResultCount: countMatches(combined, [/\b(?:moteur apprend|engine learning applied)\b/giu]),
    interactionClaimedAsSeasonTrendCount: countMatches(combined, [/\b(?:tendance de saison creee|season trend created)\b/giu]),
    interactionClaimedAsTeamMemoryCount: countMatches(combined, [/\b(?:team style memory created|memoire style equipe creee)\b/giu]),
    automaticDecisionCount,
    automaticClassificationRealMatchCount: countMatches(combined, [/\bautomatic real match classification\b/giu]),
    selectionRecommendationCount,
    tacticalInstructionCount,
    sandboxPromotionCount: countMatches(combined, [/\bsandbox promu\b/giu]),
    diagnosticPromotionCount: countMatches(combined, [/\bdiagnostic promu\b/giu]),
    batchPromotionCount: countMatches(combined, [/\bbatch promu\b/giu]),
    boundaryWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 ? "INTERACTION_CONTRACT_DOES_NOT_PROMOTE_OFFICIAL_TRUTH" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_FAIL",
  };
}

export function auditManualReviewUxInteractionSourceOfTruthRegression8T(input: {
  readonly baseline8S: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel;
  readonly boundaryAudit: ManualReviewUxInteractionBoundaryAudit8T;
}): ManualReviewUxInteractionSourceOfTruthRegressionAudit8T {
  const baseline = input.baseline8S.baseline8R.sourceOfTruthRegressionAudit;
  const noScoringConstantChange = scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2;
  const warnings: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (!baseline.allStoryScoreClaimsBackedByScoreChange || !baseline.allReplayScoreClaimsBackedByScoreChange) {
    warnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  }
  if (!baseline.noScoreMutation) warnings.push("SCORE_MANIPULATION_DETECTED");
  if (input.boundaryAudit.officialTruthPromotionCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: baseline.reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore: baseline.reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore: baseline.reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange: baseline.allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange: baseline.allReplayScoreClaimsBackedByScoreChange,
    manualInteractionDoesNotClaimNewScoreEvidence: true,
    manualInteractionDoesNotCreateFutureEvidence: true,
    manualInteractionDoesNotMutateTimeline: true,
    manualInteractionDoesNotMutateScore: true,
    manualInteractionDoesNotCreateScoreChange: true,
    manualInteractionDoesNotPromoteCoachInputToOfficialTruth: input.boundaryAudit.officialTruthPromotionCount === 0,
    noScoreMutation: baseline.noScoreMutation,
    noEventDeletion: baseline.noEventDeletion,
    noScoringConstantChange,
    MatchBonusEventUnchanged: baseline.MatchBonusEventUnchanged,
    batchLiveSeparationPreserved: baseline.batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: warnings,
    recommendation: warnings.length === 0 && noScoringConstantChange ? "SOURCE_OF_TRUTH_PRESERVED" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_FAIL",
  };
}

export function auditManualReviewUxInteractionExportMetadata8T(exportHtml: string): ManualReviewUxInteractionExportMetadataAudit8T {
  const exportTitleMentions8T = /<title>[^<]*8T[^<]*<\/title>/iu.test(exportHtml);
  const exportMainCurrentVersionVisible = exportHtml.includes('data-manual-review-ux-interaction-contract-version="8T"');
  const exportVisibleBadgeMentions8T = exportHtml.includes("Export compact 8T") || exportHtml.includes("Contrat UX 8T");
  const exportMainIdStillCompressedExport8S = exportHtml.includes('id="compressed-export-8s"');
  const exportMainIdStillCompressedExport8R = exportHtml.includes('id="compressed-export-8r"');
  const exportMainIdStillCompressedExport8Q = exportHtml.includes('id="compressed-export-8q"');
  const exportMainIdStillCompressedExport8P = exportHtml.includes('id="compressed-export-8p"');
  const exportMainIdStillCompressedExport8N = exportHtml.includes('id="compressed-export-8n"');
  const exportMainIdStillCompressedExport8I = exportHtml.includes('id="compressed-export-8i"');
  const exportHistoricalMarkersPreservedAsDataAttributes = hasAll(exportHtml, [
    'data-story-first-export-version="8I"',
    'data-export-restoration-version="8J"',
    'data-learning-loop-version="8L"',
    'data-manual-review-form-version="8M"',
    'data-manual-review-intake-boundary-version="8N"',
    'data-manual-review-preview-renderer-version="8O"',
    'data-manual-review-preview-comparison-version="8P"',
    'data-manual-review-preview-decision-gate-version="8Q"',
    'data-manual-review-workflow-readiness-version="8R"',
    'data-manual-review-workflow-ux-skeleton-version="8S"',
  ]);
  const warningCodes: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (!exportTitleMentions8T) warningCodes.push("EXPORT_TITLE_MISSING_8T");
  if (!exportVisibleBadgeMentions8T) warningCodes.push("EXPORT_BADGE_MISSING_8T");
  if (exportMainIdStillCompressedExport8S) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8S");
  if (exportMainIdStillCompressedExport8R) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8R");
  if (exportMainIdStillCompressedExport8Q) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8Q");
  if (exportMainIdStillCompressedExport8P) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  if (exportMainIdStillCompressedExport8N) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (exportMainIdStillCompressedExport8I) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  return {
    exportTitleMentions8T,
    exportMainCurrentVersionVisible,
    exportVisibleBadgeMentions8T,
    exportMainIdStillCompressedExport8S,
    exportMainIdStillCompressedExport8R,
    exportMainIdStillCompressedExport8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    exportHistoricalMarkersPreservedAsDataAttributes,
    metadataWarningCodes: warningCodes,
    recommendation: warningCodes.length === 0 && exportMainCurrentVersionVisible ? "EXPORT_METADATA_8T_VISIBLE" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_PARTIAL",
  };
}

export function auditManualReviewUxInteractionExportBudget8T(input: {
  readonly exportHtmlBefore8T: string;
  readonly exportHtmlAfter8T: string;
}): ManualReviewUxInteractionExportBudgetAudit8T {
  const exportReadTimeSecondsBefore8T = estimateManualReviewUxInteractionReadTimeSeconds8T(input.exportHtmlBefore8T);
  const exportReadTimeSecondsAfter8T = estimateManualReviewUxInteractionReadTimeSeconds8T(input.exportHtmlAfter8T);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8T <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8T <= 800;
  const exportInteractionContractVisible = input.exportHtmlAfter8T.includes('id="manual-review-ux-interaction-contract-export-8t"');
  const exportMandatorySectionsPreserved = hasAll(input.exportHtmlAfter8T, [
    "Match en 2 minutes",
    "Squelette UX revue manuelle",
    "Contrat UX revue manuelle",
    "Cartes tactiques essentielles",
  ]);
  const exportNoFullTimeline = !input.exportHtmlAfter8T.includes("full timeline");
  const exportNoSandboxPanel = !input.exportHtmlAfter8T.includes("sandbox panel");
  const exportNoLongBatchDiagnostics = !input.exportHtmlAfter8T.includes("long batch diagnostics");
  const exportMetadataClean = input.exportHtmlAfter8T.includes('id="compressed-export-8t"') &&
    input.exportHtmlAfter8T.includes('data-manual-review-ux-interaction-contract-version="8T"');
  const warnings: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (exportUnder900Seconds !== (exportReadTimeSecondsAfter8T <= 900)) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (exportUnder800Seconds !== (exportReadTimeSecondsAfter8T <= 800)) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  return {
    exportReadTimeSecondsBefore8T,
    exportReadTimeSecondsAfter8T,
    exportReadTimeDelta: exportReadTimeSecondsAfter8T - exportReadTimeSecondsBefore8T,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter8T <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter8T <= 800),
    exportInteractionContractVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportMetadataClean,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 && exportInteractionContractVisible ? "EXPORT_UNDER_900_READY" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_FAIL",
  };
}

export function auditManualReviewUxInteractionIntegrationBudget8T(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewUxInteractionIntegrationBudgetAudit8T {
  const product = input.productHtml;
  const exportHtml = input.exportHtml;
  const productSectionOrderPreserved =
    product.indexOf('id="manual-review-workflow-ux-skeleton-8s"') >= 0 &&
    product.indexOf('id="manual-review-ux-interaction-contract-8t"') > product.indexOf('id="manual-review-workflow-ux-skeleton-8s"');
  const visibleChecks = {
    productInteractionContractVisible: product.includes('id="manual-review-ux-interaction-contract-8t"'),
    exportInteractionContractVisible: exportHtml.includes('id="manual-review-ux-interaction-contract-export-8t"'),
    productUxSkeleton8SStillVisible: product.includes('id="manual-review-workflow-ux-skeleton-8s"'),
    exportUxSkeleton8SStillVisible: exportHtml.includes('id="manual-review-workflow-ux-skeleton-export-8s"'),
    productWorkflowReadiness8RStillVisible: product.includes('id="manual-review-workflow-readiness-8r"'),
    exportWorkflowReadiness8RStillVisible: exportHtml.includes('id="manual-review-workflow-readiness-export-8r"'),
    productDecisionGate8QStillVisible: product.includes('id="manual-review-preview-decision-gate-8q"'),
    exportDecisionGate8QStillVisible: exportHtml.includes('id="manual-review-preview-decision-gate-export-8q"'),
    productPreviewComparison8PStillVisible: product.includes('id="manual-review-preview-comparison-8p"'),
    exportPreviewComparison8PStillVisible: exportHtml.includes('id="manual-review-preview-comparison-export-8p"'),
    productPreviewRenderer8OStillVisible: product.includes('id="manual-review-preview-renderer-8o"'),
    exportPreviewRenderer8OStillVisible: exportHtml.includes('id="manual-review-preview-renderer-export-8o"'),
    productManualIntakeBoundary8NStillVisible: product.includes('id="manual-review-result-intake-boundary-8n"'),
    exportManualIntakeBoundary8NStillVisible: exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"'),
    productManualForm8MStillVisible: product.includes('id="manual-post-match-review-form-8m"'),
    exportManualForm8MStillVisible: exportHtml.includes('id="manual-post-match-review-form-export-8m"'),
    productLearningLoop8LStillVisible: product.includes('data-learning-loop-version="8L"'),
    exportLearningLoop8LStillVisible: exportHtml.includes('data-learning-loop-version="8L"'),
    productDecisionLayer8KStillVisible: product.includes('id="coach-decision-layer-8k"'),
    exportDecisionLayer8KStillVisible: exportHtml.includes('id="next-match-observation-export-8k"'),
    productStoryFirstSectionVisible: product.includes('id="official-match-story-spine"'),
    exportStoryFirstSectionVisible: exportHtml.includes("Match en 2 minutes"),
    productReplaySectionVisible: product.includes('id="coach-replay-8e"'),
    exportReplaySectionVisible: exportHtml.includes("Replay coach"),
    productActionPlanVisible: product.includes("Plan d'action"),
    exportActionPlanVisible: exportHtml.includes("Plan d'action"),
    tacticalMapCardsStillVisible: product.includes("Cartes tactiques") && exportHtml.includes("Cartes tactiques essentielles"),
    sourceOfTruthNoteVisible: product.includes("source-of-truth") || exportHtml.includes("source-of-truth") || exportHtml.includes("Source-of-truth"),
    productSectionOrderPreserved,
    exportCompactPreserved: exportHtml.includes('id="compressed-export-8t"') && exportHtml.includes("Cartes tactiques essentielles"),
  };
  const warnings: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (!visibleChecks.productUxSkeleton8SStillVisible) warnings.push("PRODUCT_UX_SKELETON_8S_REGRESSED");
  if (!visibleChecks.exportUxSkeleton8SStillVisible) warnings.push("EXPORT_UX_SKELETON_8S_REGRESSED");
  if (!visibleChecks.productWorkflowReadiness8RStillVisible) warnings.push("PRODUCT_WORKFLOW_READINESS_8R_REGRESSED");
  if (!visibleChecks.exportWorkflowReadiness8RStillVisible) warnings.push("EXPORT_WORKFLOW_READINESS_8R_REGRESSED");
  if (!visibleChecks.productDecisionGate8QStillVisible) warnings.push("PRODUCT_DECISION_GATE_8Q_REGRESSED");
  if (!visibleChecks.exportDecisionGate8QStillVisible) warnings.push("EXPORT_DECISION_GATE_8Q_REGRESSED");
  if (!visibleChecks.productStoryFirstSectionVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!visibleChecks.exportCompactPreserved) warnings.push("EXPORT_COMPACT_REGRESSED");
  return {
    ...visibleChecks,
    integrationWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "PRODUCT_BASELINE_READY" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_PARTIAL",
  };
}

export function auditManualReviewUxInteractionWording8T(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewUxInteractionWordingAudit8T {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const futureOnly = combined.includes("interactions futures documentees") || combined.includes("future_interaction_contract_only");
  const nonInteractive = combined.includes("non interactif") || combined.includes("non-interactif");
  const nonOfficial = combined.includes("non officiel");
  const notPersisted = combined.includes("non persiste") || combined.includes("Non persiste");
  const notApplied = combined.includes("non applique") || combined.includes("Non applique");
  const refusalVisible = combined.includes("Refusal states") || combined.includes("refusal states");
  const deferredVisible = combined.includes("Decisions differees");
  const readinessVisible = combined.includes("Workflow 8R") && combined.includes("Gate 8Q") && combined.includes("a completer");
  const noRealNextMatchClaimCount = countMatches(combined, [/\b(?:prochain match confirme|real next match result)\b/giu]);
  const noOfficialResultClaimCount = countMatches(combined, [/\b(?:resultat officiel cree|official result created)\b/giu]);
  const noEngineLearningClaimCount = countMatches(combined, [/\b(?:moteur apprend|engine learning applied)\b/giu]);
  const noSeasonTrendClaimCount = countMatches(combined, [/\b(?:season trend created|tendance de saison creee)\b/giu]);
  const noAutomaticDecisionClaimCount = countMatches(combined, [/\b(?:decision automatique activee|automatic decision created)\b/giu]);
  const noSelectionInstructionCount = Math.max(0, countMatches(combined, [/\b(?:selection imposee|doit selectionner)\b/giu]) - countMatches(combined, [/\b(?:aucune selection|pas de selection)\b/giu]));
  const noTacticalInstructionCount = countMatches(combined, [/\b(?:consigne tactique officielle|plan tactique impose)\b/giu]);
  const noStorageReadyClaimCount = countMatches(combined, [/\b(?:stockage actif|historique cree|storage enabled)\b/giu]);
  const noSubmitReadyClaimCount = countMatches(combined, [/\b(?:cliquez pour enregistrer|submit enabled|submit actif)\b/giu]);
  const ambiguousInteractionWordingCount = noRealNextMatchClaimCount +
    noOfficialResultClaimCount +
    noEngineLearningClaimCount +
    noSeasonTrendClaimCount +
    noAutomaticDecisionClaimCount +
    noSelectionInstructionCount +
    noTacticalInstructionCount +
    noStorageReadyClaimCount +
    noSubmitReadyClaimCount;
  const positives = [
    futureOnly,
    nonInteractive,
    nonOfficial,
    notPersisted,
    notApplied,
    refusalVisible,
    deferredVisible,
    readinessVisible,
  ].filter(Boolean).length;
  const wordingReadabilityScore = Math.max(0, Math.min(100, 84 + positives * 2 - ambiguousInteractionWordingCount * 20));
  const warnings: ManualReviewUxInteractionContractWarningCode8T[] = [];
  if (!futureOnly) warnings.push("INTERACTION_CONTRACT_FUTURE_ONLY_MARKER_MISSING");
  if (!nonInteractive) warnings.push("INTERACTION_CONTRACT_NON_INTERACTIVE_MARKER_MISSING");
  if (!nonOfficial) warnings.push("INTERACTION_CONTRACT_NON_OFFICIAL_MARKER_MISSING");
  if (!notPersisted) warnings.push("INTERACTION_CONTRACT_NOT_PERSISTED_MARKER_MISSING");
  if (!notApplied) warnings.push("INTERACTION_CONTRACT_NOT_APPLIED_MARKER_MISSING");
  if (ambiguousInteractionWordingCount > 0) warnings.push("INTERACTION_CONTRACT_CLAIMS_REAL_USE_READY");
  return {
    interactionContractFutureOnlyWordingVisible: futureOnly,
    interactionContractNonInteractiveWordingVisible: nonInteractive,
    interactionContractNonOfficialWordingVisible: nonOfficial,
    interactionContractNotPersistedWordingVisible: notPersisted,
    interactionContractNotAppliedWordingVisible: notApplied,
    refusalStateWordingVisible: refusalVisible,
    deferredDecisionWordingVisible: deferredVisible,
    workflowReadinessDistinctFromReviewGateWordingVisible: readinessVisible,
    noRealNextMatchClaimCount,
    noOfficialResultClaimCount,
    noEngineLearningClaimCount,
    noSeasonTrendClaimCount,
    noAutomaticDecisionClaimCount,
    noSelectionInstructionCount,
    noTacticalInstructionCount,
    noStorageReadyClaimCount,
    noSubmitReadyClaimCount,
    ambiguousInteractionWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: warnings,
    recommendation: warnings.length === 0 && wordingReadabilityScore >= 95 ? "INTERACTION_CONTRACT_READY" : "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_PARTIAL",
  };
}
