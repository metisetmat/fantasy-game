import type {
  ManualReviewFieldUxVisualExportAudit8V,
  ManualReviewFieldUxVisualIntegrationAudit8V,
  ManualReviewFieldUxVisualReadiness8V,
  ManualReviewFieldUxVisualReadinessAudit8V,
  ManualReviewFieldUxVisualSafetyAudit8V,
} from "./manualReviewFieldUxVisualReadinessTypes8V";
import type { ManualReviewFieldUxVisualReadinessWarningCode8V } from "./manualReviewFieldUxVisualReadinessWarnings8V";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function includesAny(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((sum, pattern) => sum + countMatches(text, pattern), 0);
}

function readTimeSeconds(html: string): number {
  const words = html.replace(/<[^>]*>/gu, " ").trim().split(/\s+/u).filter(Boolean).length;
  return Math.ceil((words / 180) * 60);
}

export function auditManualReviewFieldUxVisualReadiness8V(input: {
  readonly visualReadiness: ManualReviewFieldUxVisualReadiness8V;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewFieldUxVisualReadinessAudit8V {
  const { visualReadiness, productHtml, exportHtml } = input;
  const warningCodes: ManualReviewFieldUxVisualReadinessWarningCode8V[] = [];
  const productVisible = productHtml.includes('id="manual-review-field-ux-visual-readiness-8v"');
  const exportVisible = exportHtml.includes('id="manual-review-field-ux-visual-readiness-export-8v"');
  const usesInputFieldContract8U = visualReadiness.sourceInputFieldContractVersion === "8U"
    && productHtml.includes('id="manual-review-input-field-contract-8u"')
    && exportHtml.includes('id="manual-review-input-field-contract-export-8u"');
  const visualHelpTextCount = visualReadiness.visualFieldCards.filter((card) => card.helpText.length > 0).length;
  const visualConstraintBadgeCount = visualReadiness.visualFieldCards.filter((card) => card.constraintSummary.length > 0).length;
  const visualDisabledBadgeCount = visualReadiness.visualFieldCards.filter((card) => card.badges.includes("disabled")).length;
  const visualFutureOnlyBadgeCount = visualReadiness.visualFieldCards.filter((card) => card.badges.includes("future")).length;
  const visualNonOfficialBadgeCount = visualReadiness.visualFieldCards.filter((card) => card.badges.includes("non_official")).length;
  const visualNotPersistedBadgeCount = visualReadiness.visualFieldCards.filter((card) => card.badges.includes("not_persisted")).length;
  const visualNotAppliedBadgeCount = visualReadiness.visualFieldCards.filter((card) => card.badges.includes("not_applied")).length;
  const fieldPurposeVisibleCount = visualReadiness.visualFieldCards.filter((card) => card.fieldPurpose.length > 0).length;
  const fieldConstraintVisibleCount = visualReadiness.visualFieldCards.filter((card) => card.constraintSummary.length > 0).length;
  const fieldDisabledReasonVisibleCount = visualReadiness.visualFieldCards.filter((card) => card.disabledReason.length > 0).length;
  const fieldFutureValidationVisibleCount = visualReadiness.visualFieldCards.filter((card) => card.futureValidationSummary.length > 0).length;
  const fieldFutureErrorVisibleCount = visualReadiness.visualFieldCards.filter((card) => card.futureErrorSummary.length > 0).length;

  if (!productVisible) warningCodes.push("PRODUCT_FIELD_UX_VISUAL_READINESS_MISSING");
  if (!exportVisible) warningCodes.push("EXPORT_FIELD_UX_VISUAL_READINESS_MISSING");
  if (!usesInputFieldContract8U) warningCodes.push("PRODUCT_INPUT_FIELD_CONTRACT_8U_REGRESSED");
  if (visualReadiness.visualSections.length !== 3) warningCodes.push("VISUAL_SECTION_COUNT_INVALID");
  if (visualReadiness.visualFieldCards.length !== 21) warningCodes.push("VISUAL_FIELD_CARD_COUNT_INVALID");
  if (visualReadiness.visualFieldGroups.length !== 9) warningCodes.push("VISUAL_FIELD_GROUP_COUNT_INVALID");
  if (visualHelpTextCount !== 21) warningCodes.push("VISUAL_HELP_TEXT_MISSING");
  if (fieldPurposeVisibleCount !== 21) warningCodes.push("FIELD_VISUAL_REASON_MISSING");
  if (fieldFutureValidationVisibleCount !== 21) warningCodes.push("FIELD_VISUAL_VALIDATION_SUMMARY_MISSING");
  if (fieldFutureErrorVisibleCount !== 21) warningCodes.push("FIELD_VISUAL_ERROR_SUMMARY_MISSING");
  if (visualReadiness.visualReadinessSummary.visualReadinessStatus !== "ready_for_static_visual_review") {
    warningCodes.push("FIELD_VISUAL_READINESS_STATUS_UNEXPECTED");
  }

  return {
    productVisible,
    exportVisible,
    usesInputFieldContract8U,
    visualSectionCount: visualReadiness.visualSections.length,
    visualFieldCardCount: visualReadiness.visualFieldCards.length,
    visualFieldGroupCount: visualReadiness.visualFieldGroups.length,
    visualHelpTextCount,
    visualConstraintBadgeCount,
    visualDisabledBadgeCount,
    visualFutureOnlyBadgeCount,
    visualNonOfficialBadgeCount,
    visualNotPersistedBadgeCount,
    visualNotAppliedBadgeCount,
    fieldPurposeVisibleCount,
    fieldConstraintVisibleCount,
    fieldDisabledReasonVisibleCount,
    fieldFutureValidationVisibleCount,
    fieldFutureErrorVisibleCount,
    readinessStatus: visualReadiness.visualReadinessSummary.visualReadinessStatus,
    visualWarningCodes: warningCodes,
  };
}

export function auditManualReviewFieldUxVisualSafety8V(input: {
  readonly visualReadiness: ManualReviewFieldUxVisualReadiness8V;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewFieldUxVisualSafetyAudit8V {
  const { visualReadiness, productHtml, exportHtml } = input;
  const html = `${productHtml}\n${exportHtml}`;
  const activeFieldCount = visualReadiness.visualFieldCards.filter((card) => card.activeIn8V).length;
  const enabledInputControlCount = includesAny(html, [
    /<input\b(?![^>]*disabled)[^>]*>/giu,
    /<textarea\b(?![^>]*disabled)[^>]*>/giu,
    /<select\b(?![^>]*disabled)[^>]*>/giu,
  ]);
  const editableTextFieldCount = includesAny(html, [
    /contenteditable\s*=\s*["']?true/giu,
    /<textarea\b(?![^>]*disabled)[^>]*>/giu,
  ]);
  const enabledSelectControlCount = countMatches(html, /<select\b(?![^>]*disabled)[^>]*>/giu);
  const enabledCheckboxControlCount = countMatches(html, /<input\b(?=[^>]*type=["']?checkbox)(?![^>]*disabled)[^>]*>/giu);
  const enabledCtaCount = countMatches(html, /<button\b(?![^>]*disabled)[^>]*>/giu);
  const submitButtonCount = countMatches(html, /<button\b[^>]*type=["']?submit/giu);
  const backendActionCount = countMatches(html, /\b(fetch|XMLHttpRequest|navigator\.sendBeacon)\s*\(/giu);
  const apiCallCount = countMatches(html, /["']\/api\/|["']api\//giu);
  const localStoragePersistenceCount = countMatches(html, /\blocalStorage\.(?:setItem|removeItem|clear)\s*\(/giu);
  const databasePersistenceCount = countMatches(html, /\b(indexedDB\.open|sqliteWrite|databaseWrite)\s*\(/giu);
  const filePersistenceCount = countMatches(html, /\b(writeFile|writeFileSync|saveAs)\s*\(/giu);
  const memoryCreationCount = countMatches(html, /\b(createMemory|memoryCreationPerformed:\s*true)\b/giu);
  const seasonMemoryCreationCount = countMatches(html, /\bseasonMemoryCreationPerformed:\s*true\b/giu);
  const teamStyleMemoryCreationCount = countMatches(html, /\bteamStyleMemoryCreationPerformed:\s*true\b/giu);
  const payloadCreationCount = countMatches(html, /\b(createPayload|payloadCreationPerformed:\s*true)\b/giu);
  const realPreviewGenerationCount = countMatches(html, /\b(generateRealPreview|realPreviewGenerationPerformed:\s*true)\b/giu);
  const officialTruthPromotionCount = countMatches(html, /\b(promoteOfficialTruth|officialTruthPromotionPerformed:\s*true)\b/giu);
  const automaticDecisionCount = countMatches(html, /\b(createAutomaticDecision|automaticDecisionPerformed:\s*true)\b/giu);
  const automaticRealMatchClassificationCount = countMatches(html, /\bautomaticRealMatchClassificationPerformed:\s*true\b/giu);
  const selectionRecommendationCount = countMatches(html, /\b(forceSelection|selectionRecommendationPerformed:\s*true)\b/giu);
  const tacticalInstructionCount = countMatches(html, /\b(createTacticalInstruction|tacticalInstructionPerformed:\s*true)\b/giu);
  const realNextMatchClaimCount = countMatches(html, /\brealNextMatchClaimPerformed:\s*true\b/giu);
  const engineLearningClaimCount = countMatches(html, /\bengineLearningClaimPerformed:\s*true\b/giu);
  const seasonTrendClaimCount = countMatches(html, /\bseasonTrendClaimPerformed:\s*true\b/giu);
  const warningCodes: ManualReviewFieldUxVisualReadinessWarningCode8V[] = [];

  if (activeFieldCount > 0) warningCodes.push("ACTIVE_FIELD_DETECTED");
  if (enabledInputControlCount > 0) warningCodes.push("ENABLED_INPUT_CONTROL_DETECTED");
  if (editableTextFieldCount > 0) warningCodes.push("EDITABLE_TEXT_FIELD_DETECTED");
  if (enabledSelectControlCount > 0) warningCodes.push("ENABLED_SELECT_CONTROL_DETECTED");
  if (enabledCheckboxControlCount > 0) warningCodes.push("ENABLED_CHECKBOX_CONTROL_DETECTED");
  if (enabledCtaCount > 0) warningCodes.push("ENABLED_CTA_DETECTED");
  if (submitButtonCount > 0) warningCodes.push("SUBMIT_BUTTON_DETECTED");
  if (backendActionCount > 0) warningCodes.push("BACKEND_ACTION_DETECTED");
  if (apiCallCount > 0) warningCodes.push("API_CALL_DETECTED");
  if (localStoragePersistenceCount > 0) warningCodes.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warningCodes.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warningCodes.push("FILE_PERSISTENCE_CREATED");
  if (memoryCreationCount > 0) warningCodes.push("FIELD_VISUAL_DOES_NOT_CREATE_MEMORY");
  if (seasonMemoryCreationCount > 0) warningCodes.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warningCodes.push("TEAM_STYLE_MEMORY_CREATED");
  if (payloadCreationCount > 0) warningCodes.push("PAYLOAD_CREATION_DETECTED");
  if (realPreviewGenerationCount > 0) warningCodes.push("REAL_PREVIEW_GENERATION_DETECTED");
  if (officialTruthPromotionCount > 0) warningCodes.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (automaticDecisionCount > 0) warningCodes.push("AUTOMATIC_DECISION_DETECTED");
  if (selectionRecommendationCount > 0) warningCodes.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warningCodes.push("TACTICAL_PLAN_IMPOSITION_DETECTED");

  return {
    activeFieldCount,
    enabledInputControlCount,
    editableTextFieldCount,
    enabledSelectControlCount,
    enabledCheckboxControlCount,
    enabledCtaCount,
    submitButtonCount,
    enabledSubmitButtonCount: submitButtonCount,
    backendActionCount,
    apiCallCount,
    localStoragePersistenceCount,
    databasePersistenceCount,
    filePersistenceCount,
    memoryCreationCount,
    seasonMemoryCreationCount,
    teamStyleMemoryCreationCount,
    payloadCreationCount,
    realPreviewGenerationCount,
    officialTruthPromotionCount,
    automaticDecisionCount,
    automaticRealMatchClassificationCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    realNextMatchClaimCount,
    engineLearningClaimCount,
    seasonTrendClaimCount,
    safetyWarningCodes: warningCodes,
  };
}

export function auditManualReviewFieldUxVisualExport8V(input: {
  readonly exportHtmlBefore8V: string;
  readonly exportHtmlAfter8V: string;
}): ManualReviewFieldUxVisualExportAudit8V {
  const exportReadTimeSecondsBefore8V = readTimeSeconds(input.exportHtmlBefore8V);
  const exportReadTimeSecondsAfter8V = readTimeSeconds(input.exportHtmlAfter8V);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8V <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8V <= 800;
  const warningCodes: ManualReviewFieldUxVisualReadinessWarningCode8V[] = [];
  if (!exportUnder900Seconds) warningCodes.push("EXPORT_OVER_900");
  if (!input.exportHtmlAfter8V.includes("8V")) warningCodes.push("EXPORT_TITLE_MISSING_8V");
  if (!input.exportHtmlAfter8V.includes('id="compressed-export-8v"')) warningCodes.push("EXPORT_METADATA_8V_VISIBLE");

  return {
    exportReadTimeSecondsBefore8V,
    exportReadTimeSecondsAfter8V,
    exportReadTimeDelta: exportReadTimeSecondsAfter8V - exportReadTimeSecondsBefore8V,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter8V <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter8V <= 800),
    exportTitleMentions8V: input.exportHtmlAfter8V.includes("Rapport coach export compact 8V"),
    exportVisibleBadgeMentions8V: input.exportHtmlAfter8V.includes("Export compact 8V"),
    exportMainCurrentVersionVisible: input.exportHtmlAfter8V.includes('data-manual-review-field-ux-visual-readiness-version="8V"'),
    exportMainIdStillCompressedExport8U: input.exportHtmlAfter8V.includes('id="compressed-export-8u"'),
    exportMainIdStillCompressedExport8T: input.exportHtmlAfter8V.includes('id="compressed-export-8t"'),
    exportMainIdStillCompressedExport8S: input.exportHtmlAfter8V.includes('id="compressed-export-8s"'),
    exportMainIdStillCompressedExport8R: input.exportHtmlAfter8V.includes('id="compressed-export-8r"'),
    exportMainIdStillCompressedExport8Q: input.exportHtmlAfter8V.includes('id="compressed-export-8q"'),
    exportMainIdStillCompressedExport8P: input.exportHtmlAfter8V.includes('id="compressed-export-8p"'),
    exportMainIdStillCompressedExport8N: input.exportHtmlAfter8V.includes('id="compressed-export-8n"'),
    exportMainIdStillCompressedExport8I: input.exportHtmlAfter8V.includes('id="compressed-export-8i"'),
    exportPrintReady: input.exportHtmlAfter8V.includes("manual-review-field-ux-visual-readiness-export-8v"),
    exportNoHorizontalOverflow: !input.exportHtmlAfter8V.includes("overflow-x: scroll"),
    exportWarningCodes: warningCodes,
  };
}

export function auditManualReviewFieldUxVisualIntegration8V(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewFieldUxVisualIntegrationAudit8V {
  const { productHtml, exportHtml } = input;
  const integrationWarningCodes: ManualReviewFieldUxVisualReadinessWarningCode8V[] = [];
  const productInputFieldContract8UStillVisible = productHtml.includes('id="manual-review-input-field-contract-8u"');
  const exportInputFieldContract8UStillVisible = exportHtml.includes('id="manual-review-input-field-contract-export-8u"');
  if (!productInputFieldContract8UStillVisible) integrationWarningCodes.push("PRODUCT_INPUT_FIELD_CONTRACT_8U_REGRESSED");
  if (!exportInputFieldContract8UStillVisible) integrationWarningCodes.push("EXPORT_INPUT_FIELD_CONTRACT_8U_REGRESSED");

  return {
    productInputFieldContract8UStillVisible,
    exportInputFieldContract8UStillVisible,
    productInteractionContract8TStillVisible: productHtml.includes('id="manual-review-ux-interaction-contract-8t"'),
    exportInteractionContract8TStillVisible: exportHtml.includes('id="manual-review-ux-interaction-contract-export-8t"'),
    productUxSkeleton8SStillVisible: productHtml.includes('id="manual-review-workflow-ux-skeleton-8s"'),
    exportUxSkeleton8SStillVisible: exportHtml.includes('id="manual-review-workflow-ux-skeleton-export-8s"'),
    productWorkflowReadiness8RStillVisible: productHtml.includes('id="manual-review-workflow-readiness-8r"'),
    exportWorkflowReadiness8RStillVisible: exportHtml.includes('id="manual-review-workflow-readiness-export-8r"'),
    productDecisionGate8QStillVisible: productHtml.includes('id="manual-review-preview-decision-gate-8q"'),
    exportDecisionGate8QStillVisible: exportHtml.includes('id="manual-review-preview-decision-gate-export-8q"'),
    productPreviewComparison8PStillVisible: productHtml.includes('id="manual-review-preview-comparison-8p"'),
    exportPreviewComparison8PStillVisible: exportHtml.includes('id="manual-review-preview-comparison-export-8p"'),
    productPreviewRenderer8OStillVisible: productHtml.includes('id="manual-review-preview-renderer-8o"'),
    exportPreviewRenderer8OStillVisible: exportHtml.includes('id="manual-review-preview-renderer-export-8o"'),
    productManualIntakeBoundary8NStillVisible: productHtml.includes('id="manual-review-result-intake-boundary-8n"'),
    exportManualIntakeBoundary8NStillVisible: exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"'),
    productManualForm8MStillVisible: productHtml.includes('id="manual-post-match-observation-review-form-8m"'),
    exportManualForm8MStillVisible: exportHtml.includes('id="manual-post-match-observation-review-form-export-8m"'),
    productLearningLoop8LStillVisible: productHtml.includes('id="seasonless-learning-loop-observation-outcome-tracker-8l"'),
    exportLearningLoop8LStillVisible: exportHtml.includes('id="seasonless-learning-loop-observation-outcome-tracker-export-8l"'),
    productDecisionLayer8KStillVisible: productHtml.includes('id="coach-decision-layer-next-match-observation-plan-8k"'),
    exportDecisionLayer8KStillVisible: exportHtml.includes('id="coach-decision-layer-next-match-observation-plan-export-8k"'),
    productStoryFirstPreserved: productHtml.includes("story-first") || productHtml.includes("Histoire officielle"),
    exportCompactPreserved: exportHtml.includes('id="compressed-export-8v"'),
    productSectionOrderPreserved: productHtml.indexOf('id="manual-review-input-field-contract-8u"') < productHtml.indexOf('id="manual-review-field-ux-visual-readiness-8v"'),
    integrationWarningCodes,
  };
}
