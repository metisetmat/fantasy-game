import { scoringRegistryEntry } from "../systems/scoring";
import type {
  ManualReviewInputFieldBoundaryAudit8U,
  ManualReviewInputFieldContract8U,
  ManualReviewInputFieldContractAudit8U,
  ManualReviewInputFieldDisabledStateAudit8U,
  ManualReviewInputFieldExportBudgetAudit8U,
  ManualReviewInputFieldExportMetadataAudit8U,
  ManualReviewInputFieldIntegrationAudit8U,
  ManualReviewInputFieldNonPersistenceAudit8U,
  ManualReviewInputFieldWordingAudit8U,
} from "./manualReviewInputFieldContractTypes8U";
import type { ManualReviewInputFieldContractWarningCode8U } from "./manualReviewInputFieldContractWarnings8U";

function countMatches(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((sum, pattern) => sum + [...text.matchAll(pattern)].length, 0);
}

function hasAll(text: string, values: readonly string[]): boolean {
  return values.every((value) => text.includes(value));
}

export function estimateManualReviewInputFieldReadTimeSeconds8U(html: string): number {
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  if (visibleText.length === 0) return 0;
  return Math.ceil((visibleText.split(/\s+/u).length / 180) * 60);
}

function countEnabledControls(html: string): number {
  return countMatches(html, [
    /<button\b(?![^>]*(?:disabled|aria-disabled="true"))/giu,
    /<(?:input|select|textarea)\b(?![^>]*(?:disabled|aria-disabled="true"|readonly|type="hidden"))/giu,
    /<a\b[^>]*(?:data-enabled-action|href="(?:\/api|api:|https?:\/\/api))/giu,
  ]);
}

export function auditManualReviewInputFieldContract8U(input: {
  readonly contract: ManualReviewInputFieldContract8U;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewInputFieldContractAudit8U {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const productInputFieldContractVisible = input.productHtml.includes('id="manual-review-input-field-contract-8u"');
  const exportInputFieldContractVisible = input.exportHtml.includes('id="manual-review-input-field-contract-export-8u"');
  const disabledFieldCount = input.contract.fields.filter((field) => field.disabledIn8U && field.readOnlyIn8U).length;
  const activeFieldCount = input.contract.fields.filter((field) =>
    field.activeIn8U ||
    field.canSubmitIn8U ||
    field.canPersistIn8U ||
    field.canCallApiIn8U ||
    field.canPromoteOfficialTruthIn8U ||
    field.canDriveSelectionIn8U ||
    field.canDriveTacticalInstructionIn8U,
  ).length;
  const activeValidationRuleCount = input.contract.validationRules.filter((rule) => rule.activeIn8U).length;
  const activeErrorStateCount = input.contract.errorStates.filter((error) => error.activeIn8U).length;
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (!productInputFieldContractVisible && !exportInputFieldContractVisible) warnings.push("INPUT_FIELD_CONTRACT_MISSING");
  if (!productInputFieldContractVisible) warnings.push("PRODUCT_INPUT_FIELD_CONTRACT_MISSING");
  if (!exportInputFieldContractVisible) warnings.push("EXPORT_INPUT_FIELD_CONTRACT_MISSING");
  if (!combined.includes("8T")) warnings.push("INPUT_FIELD_CONTRACT_MISSING");
  if (input.contract.fieldSections.length !== 3) warnings.push("FIELD_SECTION_COUNT_INVALID");
  if (input.contract.fields.length !== 21) warnings.push("FIELD_COUNT_INVALID");
  if (disabledFieldCount !== 21) warnings.push("DISABLED_FIELD_COUNT_INVALID");
  if (activeFieldCount > 0) warnings.push("ACTIVE_FIELD_DETECTED");
  if (input.contract.validationRules.length < 12) warnings.push("VALIDATION_RULE_COUNT_INVALID");
  if (activeValidationRuleCount > 0) warnings.push("ACTIVE_VALIDATION_RULE_DETECTED");
  if (input.contract.errorStates.length < 11) warnings.push("ERROR_STATE_COUNT_INVALID");
  if (activeErrorStateCount > 0) warnings.push("ACTIVE_ERROR_STATE_DETECTED");
  if (input.contract.refusalStates.length !== 6) warnings.push("REFUSAL_STATE_COUNT_INVALID");
  if (input.contract.activationRequirements.length < 14) warnings.push("ACTIVATION_REQUIREMENT_COUNT_INVALID");
  if (input.contract.deferredDecisions.length < 6) warnings.push("DEFERRED_DECISION_MISSING");
  return {
    inputFieldContractVisible: productInputFieldContractVisible && exportInputFieldContractVisible,
    productInputFieldContractVisible,
    exportInputFieldContractVisible,
    inputFieldContractUsesInteractionContract8T: input.contract.sourceInteractionContractVersion === "8T" && combined.includes("Contrat d'interaction UX"),
    sectionCount: input.contract.fieldSections.length,
    sectionCountExpected: 3,
    fieldCount: input.contract.fields.length,
    fieldCountExpected: 21,
    disabledFieldCount,
    disabledFieldCountExpected: 21,
    activeFieldCount,
    validationRuleCount: input.contract.validationRules.length,
    activeValidationRuleCount,
    errorStateCount: input.contract.errorStates.length,
    activeErrorStateCount,
    refusalStateCount: input.contract.refusalStates.length,
    activationRequirementCount: input.contract.activationRequirements.length,
    deferredDecisionCount: input.contract.deferredDecisions.length,
    contractWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "INPUT_FIELD_CONTRACT_READY" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_PARTIAL",
  };
}

export function auditManualReviewInputFieldDisabledState8U(input: {
  readonly contract: ManualReviewInputFieldContract8U;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewInputFieldDisabledStateAudit8U {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const enabledInputControlCount = countEnabledControls(combined);
  const editableTextFieldCount = countMatches(combined, [
    /<(?:input|textarea)\b(?![^>]*(?:disabled|readonly|aria-disabled="true"|type="hidden"))/giu,
  ]);
  const enabledSelectControlCount = countMatches(combined, [
    /<select\b(?![^>]*(?:disabled|aria-disabled="true"))/giu,
  ]);
  const enabledCheckboxControlCount = countMatches(combined, [
    /<input\b(?=[^>]*type="checkbox")(?![^>]*(?:disabled|aria-disabled="true"))/giu,
  ]);
  const submitButtonCount = countMatches(combined, [/<button\b[^>]*type="submit"/giu, /<input\b[^>]*type="submit"/giu]);
  const enabledSubmitButtonCount = countMatches(combined, [/<(?:button|input)\b(?![^>]*disabled)[^>]*type="submit"/giu]);
  const backendActionCount = countMatches(combined, [/\bmethod="post"/giu, /\baction="[^"]+"/giu]);
  const apiCallCount = countMatches(combined, [/\bfetch\s*\(/giu, /\bXMLHttpRequest\b/giu, /\b(?:href|action)="\/api\//giu]);
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (enabledInputControlCount > 0) warnings.push("ENABLED_INPUT_CONTROL_DETECTED");
  if (editableTextFieldCount > 0) warnings.push("EDITABLE_TEXT_FIELD_DETECTED");
  if (enabledSelectControlCount > 0) warnings.push("ENABLED_SELECT_DETECTED");
  if (enabledCheckboxControlCount > 0) warnings.push("ENABLED_CHECKBOX_DETECTED");
  if (submitButtonCount > 0) warnings.push("SUBMIT_BUTTON_DETECTED");
  if (backendActionCount > 0) warnings.push("BACKEND_ACTION_DETECTED");
  if (apiCallCount > 0) warnings.push("API_CALL_DETECTED");
  return {
    enabledInputControlCount,
    editableTextFieldCount,
    enabledSelectControlCount,
    enabledCheckboxControlCount,
    submitButtonCount,
    enabledSubmitButtonCount,
    backendActionCount,
    apiCallCount,
    disabledLabelsVisible: input.contract.fields.every((field) => combined.includes(field.coachFacingLabel)),
    refusalMessagesVisible: input.contract.refusalStates.every((refusal) => combined.includes(refusal.coachFacingMessage)),
    disabledStateWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "NO_ENABLED_FIELD_CONTROL" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_FAIL",
  };
}

export function auditManualReviewInputFieldNonPersistence8U(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewInputFieldNonPersistenceAudit8U {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const localStoragePersistenceCount = countMatches(combined, [/\blocalStorage\.(?:setItem|removeItem|clear)/giu]);
  const databasePersistenceCount = countMatches(combined, [/\b(?:indexedDB|db\.save|insert into)\b/giu]);
  const filePersistenceCount = countMatches(combined, [/\b(?:writeFile|writeFileSync|appendFile|createWriteStream)\b/giu]);
  const backendSubmitActionCount = countMatches(combined, [/\bmethod="post"/giu, /\baction="[^"]+"/giu]);
  const apiCallCount = countMatches(combined, [/\bfetch\s*\(/giu, /\bXMLHttpRequest\b/giu, /\b(?:href|action)="\/api\//giu]);
  const memoryCreationCount = countMatches(combined, [/\b(?:create memory|memoire creee|memory created|season memory created|team style memory created)\b/giu]);
  const payloadCreationCount = Math.max(0, countMatches(combined, [/\bpayload cree\b|\bpayload created\b|\bcreer un payload reel\b/giu]));
  const realPreviewGenerationCount = countMatches(combined, [/\bpreview reelle generee\b|\breal preview generated\b/giu]);
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (localStoragePersistenceCount > 0) warnings.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (memoryCreationCount > 0) warnings.push("MEMORY_CREATED");
  if (backendSubmitActionCount > 0) warnings.push("BACKEND_ACTION_DETECTED");
  if (apiCallCount > 0) warnings.push("API_CALL_DETECTED");
  if (payloadCreationCount > 0) warnings.push("PAYLOAD_CREATION_DETECTED");
  if (realPreviewGenerationCount > 0) warnings.push("REAL_PREVIEW_GENERATION_DETECTED");
  return {
    localStoragePersistenceCount,
    databasePersistenceCount,
    filePersistenceCount,
    backendSubmitActionCount,
    apiCallCount,
    memoryCreationCount,
    payloadCreationCount,
    realPreviewGenerationCount,
    fieldPersistencePerformed: localStoragePersistenceCount + databasePersistenceCount + filePersistenceCount + memoryCreationCount > 0,
    fieldApplicationPerformed: countMatches(combined, [/\b(?:appliquer les champs|field contract applied|review applied)\b/giu]) > 0,
    nonPersistenceWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "INPUT_FIELD_CONTRACT_DOES_NOT_CREATE_STORAGE" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_FAIL",
  };
}

export function auditManualReviewInputFieldBoundary8U(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewInputFieldBoundaryAudit8U {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const officialTruthPromotionCount = countMatches(combined, [/\b(?:verite officielle creee|official truth promoted|source officielle modifiee)\b/giu]);
  const automaticDecisionCount = countMatches(combined, [/\b(?:decision automatique activee|automatic decision created)\b/giu]);
  const selectionRecommendationCount = Math.max(
    0,
    countMatches(combined, [/\b(?:selection imposee|doit selectionner|recommandation tactique officielle)\b/giu]) -
      countMatches(combined, [/\b(?:aucune selection|pas de selection|ne pilote aucune selection)\b/giu]),
  );
  const tacticalInstructionCount = Math.max(
    0,
    countMatches(combined, [/\b(?:consigne tactique officielle|plan tactique impose)\b/giu]) -
      countMatches(combined, [/\b(?:aucune consigne tactique|ne pilote aucune consigne)\b/giu]),
  );
  const scoreMutationCount = countMatches(combined, [/\bscoreMutationPerformed:\s*true\b/giu, /\bscore_mutation_performed\b/giu]);
  const timelineMutationCount = countMatches(combined, [/\btimelineMutationPerformed:\s*true\b/giu, /\btimeline_mutation_performed\b/giu]);
  const scoreChangeCreationCount = countMatches(combined, [/\bscoreChangeCreated:\s*true\b/giu, /\bscore_change_created\b/giu]);
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (officialTruthPromotionCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (automaticDecisionCount > 0) warnings.push("AUTOMATIC_DECISION_DETECTED");
  if (selectionRecommendationCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (scoreMutationCount + timelineMutationCount + scoreChangeCreationCount > 0) warnings.push("SCORE_MANIPULATION_DETECTED");
  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount: officialTruthPromotionCount,
    automaticDecisionCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    scoreMutationCount,
    timelineMutationCount,
    scoreChangeCreationCount,
    boundaryWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "INPUT_FIELD_CONTRACT_DOES_NOT_PROMOTE_OFFICIAL_TRUTH" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_FAIL",
  };
}

export function auditManualReviewInputFieldExportMetadata8U(exportHtml: string): ManualReviewInputFieldExportMetadataAudit8U {
  const exportTitleMentions8U = /<title>[^<]*8U[^<]*<\/title>/iu.test(exportHtml);
  const exportMainCurrentVersionVisible = exportHtml.includes('data-manual-review-input-field-contract-version="8U"');
  const exportVisibleBadgeMentions8U = exportHtml.includes("Export compact 8U") || exportHtml.includes("Contrat champs 8U");
  const exportMainIdStillCompressedExport8T = exportHtml.includes('id="compressed-export-8t"');
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
    'data-manual-review-ux-interaction-contract-version="8T"',
  ]);
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (!exportTitleMentions8U) warnings.push("EXPORT_TITLE_MISSING_8U");
  if (!exportVisibleBadgeMentions8U) warnings.push("EXPORT_BADGE_MISSING_8U");
  if (exportMainIdStillCompressedExport8T) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8T");
  if (exportMainIdStillCompressedExport8S) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8S");
  if (exportMainIdStillCompressedExport8R) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8R");
  if (exportMainIdStillCompressedExport8Q) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8Q");
  if (exportMainIdStillCompressedExport8P) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  if (exportMainIdStillCompressedExport8N) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (exportMainIdStillCompressedExport8I) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  return {
    exportTitleMentions8U,
    exportMainCurrentVersionVisible,
    exportVisibleBadgeMentions8U,
    exportMainIdStillCompressedExport8T,
    exportMainIdStillCompressedExport8S,
    exportMainIdStillCompressedExport8R,
    exportMainIdStillCompressedExport8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    exportHistoricalMarkersPreservedAsDataAttributes,
    metadataWarningCodes: warnings,
    recommendation: warnings.length === 0 && exportMainCurrentVersionVisible ? "EXPORT_METADATA_8U_VISIBLE" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_PARTIAL",
  };
}

export function auditManualReviewInputFieldExportBudget8U(input: {
  readonly exportHtmlBefore8U: string;
  readonly exportHtmlAfter8U: string;
}): ManualReviewInputFieldExportBudgetAudit8U {
  const exportReadTimeSecondsBefore8U = estimateManualReviewInputFieldReadTimeSeconds8U(input.exportHtmlBefore8U);
  const exportReadTimeSecondsAfter8U = estimateManualReviewInputFieldReadTimeSeconds8U(input.exportHtmlAfter8U);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8U <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8U <= 800;
  const exportInputFieldContractVisible = input.exportHtmlAfter8U.includes('id="manual-review-input-field-contract-export-8u"');
  const exportMandatorySectionsPreserved = hasAll(input.exportHtmlAfter8U, [
    "Match en 2 minutes",
    "Contrat UX revue manuelle",
    "Contrat champs revue manuelle",
    "Cartes tactiques essentielles",
  ]);
  const exportMetadataClean = input.exportHtmlAfter8U.includes('id="compressed-export-8u"') &&
    input.exportHtmlAfter8U.includes('data-manual-review-input-field-contract-version="8U"');
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  return {
    exportReadTimeSecondsBefore8U,
    exportReadTimeSecondsAfter8U,
    exportReadTimeDelta: exportReadTimeSecondsAfter8U - exportReadTimeSecondsBefore8U,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter8U <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter8U <= 800),
    exportInputFieldContractVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline: !input.exportHtmlAfter8U.includes("full timeline"),
    exportNoSandboxPanel: !input.exportHtmlAfter8U.includes("sandbox panel"),
    exportNoLongBatchDiagnostics: !input.exportHtmlAfter8U.includes("long batch diagnostics"),
    exportMetadataClean,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 && exportInputFieldContractVisible ? "EXPORT_UNDER_900_READY" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_FAIL",
  };
}

export function auditManualReviewInputFieldIntegration8U(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewInputFieldIntegrationAudit8U {
  const product = input.productHtml;
  const exportHtml = input.exportHtml;
  const productOrder =
    product.indexOf('id="manual-review-ux-interaction-contract-8t"') >= 0 &&
    product.indexOf('id="manual-review-input-field-contract-8u"') > product.indexOf('id="manual-review-ux-interaction-contract-8t"');
  const visibleChecks = {
    productInputFieldContractVisible: product.includes('id="manual-review-input-field-contract-8u"'),
    exportInputFieldContractVisible: exportHtml.includes('id="manual-review-input-field-contract-export-8u"'),
    productInteractionContract8TStillVisible: product.includes('id="manual-review-ux-interaction-contract-8t"'),
    exportInteractionContract8TStillVisible: exportHtml.includes('id="manual-review-ux-interaction-contract-export-8t"'),
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
    exportCompactPreserved: exportHtml.includes('id="compressed-export-8u"') && exportHtml.includes("Cartes tactiques essentielles"),
    productSectionOrderPreserved: productOrder,
  };
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (!visibleChecks.productInteractionContract8TStillVisible) warnings.push("UX_INTERACTION_CONTRACT_8T_PRESERVED");
  if (!visibleChecks.productUxSkeleton8SStillVisible) warnings.push("WORKFLOW_UX_SKELETON_8S_PRESERVED");
  if (!visibleChecks.productWorkflowReadiness8RStillVisible) warnings.push("WORKFLOW_READINESS_8R_PRESERVED");
  if (!visibleChecks.productDecisionGate8QStillVisible) warnings.push("DECISION_GATE_8Q_PRESERVED");
  if (!visibleChecks.productStoryFirstSectionVisible) warnings.push("PRODUCT_BASELINE_READY");
  if (!visibleChecks.exportCompactPreserved) warnings.push("EXPORT_COMPACT_PRESERVED");
  return {
    ...visibleChecks,
    integrationWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "PRODUCT_BASELINE_READY" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_PARTIAL",
  };
}

export function auditManualReviewInputFieldWording8U(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewInputFieldWordingAudit8U {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const futureOnly = combined.includes("future_input_field_contract_only") || combined.includes("future uniquement");
  const disabled = combined.includes("desactives") || combined.includes("desactive");
  const nonOfficial = combined.includes("non officiel");
  const notPersisted = combined.includes("non persiste") || combined.includes("Non persiste");
  const notApplied = combined.includes("non applique") || combined.includes("Non applique");
  const noRealInputClaimCount = countMatches(combined, [/\b(?:saisie reelle activee|real input enabled)\b/giu]);
  const noPayloadReadyClaimCount = countMatches(combined, [/\b(?:payload pret|payload ready)\b/giu]);
  const noPreviewReadyClaimCount = countMatches(combined, [/\b(?:preview reelle prete|real preview ready)\b/giu]);
  const noStorageReadyClaimCount = countMatches(combined, [/\b(?:stockage actif|historique cree|storage enabled)\b/giu]);
  const noSubmitReadyClaimCount = countMatches(combined, [/\b(?:cliquez pour enregistrer|submit enabled|submit actif)\b/giu]);
  const warnings: ManualReviewInputFieldContractWarningCode8U[] = [];
  if (!futureOnly) warnings.push("FIELD_CONTRACT_FUTURE_ONLY_MARKER_MISSING");
  if (!disabled) warnings.push("FIELD_CONTRACT_DISABLED_MARKER_MISSING");
  if (!nonOfficial) warnings.push("FIELD_CONTRACT_NON_OFFICIAL_MARKER_MISSING");
  if (!notPersisted) warnings.push("FIELD_CONTRACT_NOT_PERSISTED_MARKER_MISSING");
  if (!notApplied) warnings.push("FIELD_CONTRACT_NOT_APPLIED_MARKER_MISSING");
  if (noRealInputClaimCount + noPayloadReadyClaimCount + noPreviewReadyClaimCount + noStorageReadyClaimCount + noSubmitReadyClaimCount > 0) {
    warnings.push("MANUAL_REVIEW_INPUT_FIELD_CONTRACT_FAIL");
  }
  return {
    futureOnlyWordingVisible: futureOnly,
    disabledWordingVisible: disabled,
    nonOfficialWordingVisible: nonOfficial,
    notPersistedWordingVisible: notPersisted,
    notAppliedWordingVisible: notApplied,
    noRealInputClaimCount,
    noPayloadReadyClaimCount,
    noPreviewReadyClaimCount,
    noStorageReadyClaimCount,
    noSubmitReadyClaimCount,
    wordingWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "INPUT_FIELD_CONTRACT_READY" : "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_PARTIAL",
  };
}

export function scoringConstantsUnchangedForManualReviewInputField8U(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2;
}
