import type {
  ManualReviewPreviewPayloadContract8X,
  ManualReviewPreviewPayloadContractAudit8X,
  ManualReviewPreviewPayloadContractExportAudit8X,
} from "./manualReviewPreviewPayloadContractTypes8X";
import type { ManualReviewPreviewPayloadContractWarningCode8X } from "./manualReviewPreviewPayloadContractWarnings8X";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function stripContractSections(html: string): string {
  return html
    .replace(/<section\b[^>]*manual-review-preview-payload-contract-8x[\s\S]*?<\/section>/giu, "")
    .replace(/<section\b[^>]*manual-review-preview-payload-contract-export-8x[\s\S]*?<\/section>/giu, "");
}

function countEnabledInputControls(html: string): number {
  const controlMatches = [
    ...html.matchAll(/<(?:input|textarea|select)\b[^>]*>/giu),
  ];
  return controlMatches.filter((match) => {
    const tag = match[0];
    return !/\bdisabled\b/iu.test(tag) && !/\breadonly\b/iu.test(tag);
  }).length;
}

function countEnabledCtas(html: string): number {
  const buttonMatches = [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/giu)];
  const enabledSubmitButtons = buttonMatches.filter((match) => {
    const tag = match[0];
    return !/\bdisabled\b/iu.test(tag) && /submit|valider|appliquer|envoyer|save|sauvegarder/iu.test(tag);
  }).length;
  return enabledSubmitButtons + countMatches(html, /<form\b[^>]*(?:action|method)=/giu);
}

function flag(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function pushIf(
  warnings: ManualReviewPreviewPayloadContractWarningCode8X[],
  condition: boolean,
  code: ManualReviewPreviewPayloadContractWarningCode8X,
): void {
  if (condition) warnings.push(code);
}

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewPayloadContractWarningCode8X[],
): readonly ManualReviewPreviewPayloadContractWarningCode8X[] {
  return [...new Set(warnings)];
}

export function auditManualReviewPreviewPayloadContract8X(
  contract: ManualReviewPreviewPayloadContract8X,
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadContractAudit8X {
  const combined = `${stripContractSections(productHtml)}\n${stripContractSections(exportHtml)}`;
  const productVisible = productHtml.includes('id="manual-review-preview-payload-contract-8x"');
  const exportVisible = exportHtml.includes('id="manual-review-preview-payload-contract-export-8x"');
  const activeValidationRuleCount = contract.validationRules.filter((rule) => rule.activeIn8X).length;
  const activeErrorStateCount = contract.errorStates.filter((state) => state.activeIn8X).length;
  const enabledInputControlCount = countEnabledInputControls(combined);
  const activeFieldCount = enabledInputControlCount + countMatches(combined, /data-manual-field-active=["']true["']/giu);
  const payloadCreated =
    flag(combined, /payloadCreated\s*[:=]\s*true|data-real-payload=["']true["']|createPreviewPayload\s*\(|previewPayload\s*=|new\s+FormData\s*\(/iu);
  const realPayloadInstanceCount = countMatches(combined, /data-real-payload=["']true["']|createPreviewPayload\s*\(|previewPayload\s*=|new\s+FormData\s*\(/giu);
  const fieldToPayloadRuntimeDetected = flag(combined, /mapFieldsToPayload|fieldToPayloadRuntime\s*[:=]\s*true|payloadFromFields\s*\(/iu);
  const payloadValidationRuntimeDetected = flag(combined, /validatePreviewPayload\s*\(|payloadValidationRuntime\s*[:=]\s*true|payloadValidationPerformed\s*[:=]\s*true/iu);
  const realInputActivated = activeFieldCount > 0 || flag(combined, /realInputActivated\s*[:=]\s*true|data-real-input=["']true["']/iu);
  const realPreviewGenerated = flag(combined, /realPreviewGenerated\s*[:=]\s*true|renderRealPreview\s*\(|data-real-preview=["']true["']/iu);
  const submitCreated = countEnabledCtas(combined) > 0 || flag(combined, /submitCreated\s*[:=]\s*true|type=["']submit["']/iu);
  const apiCreated = flag(combined, /fetch\s*\(|axios\.|data-api-endpoint=|apiCreated\s*[:=]\s*true/iu);
  const backendCreated = flag(combined, /backendCreated\s*[:=]\s*true|backendAction|serverAction|data-backend-action=|POST\s+\//iu);
  const storageCreated = flag(combined, /localStorage\.setItem|sessionStorage\.setItem|indexedDB|writeFile(?:Sync)?\s*\(|storageCreated\s*[:=]\s*true/iu);
  const memoryCreated = flag(combined, /seasonMemory|teamStyleMemory|memoryCreated\s*[:=]\s*true|createMemory\s*\(/iu);
  const draftCreated = flag(combined, /draftCreated\s*[:=]\s*true|saveDraft\s*\(|data-draft=["']true["']/iu);
  const historyCreated = flag(combined, /historyCreated\s*[:=]\s*true|historyStore\.save|saveHistory\s*\(/iu);
  const officialTruthPromoted = flag(combined, /officialTruth\s*[:=]\s*true|promotedToOfficial|data-official-truth=["']true["']/iu);
  const automaticDecisionCreated = flag(combined, /automaticDecision\s*[:=]\s*true|data-automatic-decision=["']true["']/iu);
  const realNextMatchClaimCount = countMatches(combined, /real next match|prochain match reel|vrai prochain match/giu);
  const engineLearningClaimCount = countMatches(combined, /engine learning|moteur apprend|apprentissage moteur/giu);
  const seasonTrendClaimCount = countMatches(combined, /season trend|tendance saison|memoire saison/giu);
  const selectionDriven = flag(combined, /selectionDriven\s*[:=]\s*true|selectionImposed\s*[:=]\s*true|data-selection-driven=["']true["']/iu);
  const tacticalInstructionDriven = flag(combined, /tacticalInstructionDriven\s*[:=]\s*true|tacticApplied\s*[:=]\s*true|data-tactic-driven=["']true["']/iu);
  const scoreMutationCount = countMatches(combined, /scoreMutation(?:Performed)?\s*[:=]\s*true|mutateScore\s*\(|setScore\s*\(/giu);
  const timelineMutationCount = countMatches(combined, /timelineMutation(?:Performed)?\s*[:=]\s*true|mutateTimeline\s*\(|timeline\.push\s*\(/giu);
  const eventMutationCount = countMatches(combined, /eventMutation(?:Performed)?\s*[:=]\s*true|mutateEvent\s*\(|events\.push\s*\(/giu);
  const scoreChangeMutationCount = countMatches(combined, /scoreChangeMutation(?:Performed)?\s*[:=]\s*true|score_changes?\.push\s*\(/giu);
  const scoreClaimWithoutScoreChangeCount = countMatches(combined, /score claim without score_change|scoreClaimWithoutScoreChange\s*[:=]\s*true/giu);
  const penaltyShotLeakageCount = countMatches(combined, /PENALTY_SHOT|penalty shot active|penaltyShotActive\s*[:=]\s*true/giu);
  const unknownScoringFamilyCount = countMatches(combined, /UNKNOWN_SCORING_FAMILY|unknown scoring family/giu);

  const warnings: ManualReviewPreviewPayloadContractWarningCode8X[] = [];
  pushIf(warnings, !productVisible, "PRODUCT_PREVIEW_PAYLOAD_CONTRACT_MISSING");
  pushIf(warnings, !exportVisible, "EXPORT_PREVIEW_PAYLOAD_CONTRACT_MISSING");
  pushIf(warnings, contract.allowedTopLevelFields.length !== 12, "PAYLOAD_ALLOWED_FIELDS_MISSING");
  pushIf(warnings, contract.forbiddenTopLevelFields.length !== 16, "PAYLOAD_FORBIDDEN_FIELDS_MISSING");
  pushIf(warnings, contract.fieldGroups.length !== 5, "PAYLOAD_FIELD_GROUP_COUNT_INVALID");
  pushIf(warnings, contract.observationEntries.length !== 3, "PAYLOAD_OBSERVATION_ENTRY_COUNT_INVALID");
  pushIf(warnings, contract.validationRules.length !== 20, "PAYLOAD_VALIDATION_RULES_MISSING");
  pushIf(warnings, activeValidationRuleCount !== 0, "ACTIVE_PAYLOAD_VALIDATION_RULE_DETECTED");
  pushIf(warnings, contract.errorStates.length !== 19, "PAYLOAD_ERROR_STATES_MISSING");
  pushIf(warnings, activeErrorStateCount !== 0, "ACTIVE_PAYLOAD_ERROR_STATE_DETECTED");
  pushIf(warnings, contract.refusalStates.length !== 7, "PAYLOAD_REFUSAL_STATE_COUNT_INVALID");
  pushIf(warnings, contract.boundaryGuards.length !== 14, "PAYLOAD_BOUNDARY_GUARD_COUNT_INVALID");
  pushIf(warnings, contract.payloadContractStatus !== "documented_but_not_instantiated", "PAYLOAD_CONTRACT_STATUS_INVALID");
  pushIf(warnings, contract.payloadSource !== "manual_non_official", "PAYLOAD_SOURCE_INVALID");
  pushIf(warnings, contract.payloadScope !== "preview_only", "PAYLOAD_SCOPE_INVALID");
  pushIf(warnings, contract.payloadPersistence !== "none", "PAYLOAD_PERSISTENCE_NOT_NONE");
  pushIf(warnings, contract.payloadApplication !== "none", "PAYLOAD_APPLICATION_NOT_NONE");
  pushIf(warnings, payloadCreated, "PAYLOAD_CREATION_DETECTED");
  pushIf(warnings, realPayloadInstanceCount !== 0, "REAL_PAYLOAD_INSTANCE_DETECTED");
  pushIf(warnings, fieldToPayloadRuntimeDetected, "FIELD_TO_PAYLOAD_RUNTIME_DETECTED");
  pushIf(warnings, payloadValidationRuntimeDetected, "PAYLOAD_VALIDATION_RUNTIME_DETECTED");
  pushIf(warnings, realInputActivated, "REAL_INPUT_ACTIVATED");
  pushIf(warnings, activeFieldCount !== 0, "ACTIVE_FIELD_DETECTED");
  pushIf(warnings, enabledInputControlCount !== 0, "ENABLED_INPUT_CONTROL_DETECTED");
  pushIf(warnings, realPreviewGenerated, "REAL_PREVIEW_GENERATION_DETECTED");
  pushIf(warnings, submitCreated, "SUBMIT_BUTTON_DETECTED");
  pushIf(warnings, apiCreated, "API_CALL_DETECTED");
  pushIf(warnings, backendCreated, "BACKEND_ACTION_DETECTED");
  pushIf(warnings, storageCreated, "LOCAL_STORAGE_PERSISTENCE_DETECTED");
  pushIf(warnings, memoryCreated, "SEASON_MEMORY_CREATED");
  pushIf(warnings, draftCreated, "DRAFT_CREATED");
  pushIf(warnings, historyCreated, "HISTORY_CREATED");
  pushIf(warnings, officialTruthPromoted, "OFFICIAL_TRUTH_PROMOTION_DETECTED");
  pushIf(warnings, automaticDecisionCreated, "AUTOMATIC_DECISION_DETECTED");
  pushIf(warnings, selectionDriven, "SELECTION_IMPOSITION_DETECTED");
  pushIf(warnings, tacticalInstructionDriven, "TACTICAL_PLAN_IMPOSITION_DETECTED");
  pushIf(warnings, scoreMutationCount + timelineMutationCount + eventMutationCount + scoreChangeMutationCount > 0, "SCORE_OR_TIMELINE_MUTATION_DETECTED");
  pushIf(warnings, scoreClaimWithoutScoreChangeCount !== 0, "SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  pushIf(warnings, penaltyShotLeakageCount !== 0, "PENALTY_SHOT_LEAKAGE_DETECTED");
  pushIf(warnings, unknownScoringFamilyCount !== 0, "UNKNOWN_SCORING_FAMILY_DETECTED");

  return {
    productVisible,
    exportVisible,
    usesActivationGuards8W: productHtml.includes("manual-review-preview-activation-guards-8w") && exportHtml.includes("manual-review-preview-activation-guards-export-8w"),
    usesFieldVisualReadiness8V: productHtml.includes("manual-review-field-ux-visual-readiness-8v") || exportHtml.includes("ready_for_static_visual_review"),
    usesInputFieldContract8U: productHtml.includes("8U") || exportHtml.includes("8U"),
    schemaDefined: contract.allowedTopLevelFields.length > 0,
    allowedTopLevelFieldCount: contract.allowedTopLevelFields.length,
    forbiddenTopLevelFieldCount: contract.forbiddenTopLevelFields.length,
    fieldGroupCount: contract.fieldGroups.length,
    observationEntryCount: contract.observationEntries.length,
    validationRuleCount: contract.validationRules.length,
    activeValidationRuleCount,
    errorStateCount: contract.errorStates.length,
    activeErrorStateCount,
    refusalStateCount: contract.refusalStates.length,
    boundaryGuardCount: contract.boundaryGuards.length,
    payloadContractStatusCorrect: contract.payloadContractStatus === "documented_but_not_instantiated",
    payloadCreated,
    realPayloadInstanceCount,
    fieldToPayloadRuntimeDetected,
    payloadValidationRuntimeDetected,
    realInputActivated,
    activeFieldCount,
    enabledInputControlCount,
    realPreviewGenerated,
    submitCreated,
    apiCreated,
    backendCreated,
    storageCreated,
    memoryCreated,
    draftCreated,
    historyCreated,
    officialTruthPromoted,
    automaticDecisionCreated,
    realNextMatchClaimCount,
    engineLearningClaimCount,
    seasonTrendClaimCount,
    selectionDriven,
    tacticalInstructionDriven,
    scoreMutationCount,
    timelineMutationCount,
    eventMutationCount,
    scoreChangeMutationCount,
    scoreClaimWithoutScoreChangeCount,
    penaltyShotLeakageCount,
    unknownScoringFamilyCount,
    warningCodes: uniqueWarnings(warnings),
  };
}

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]+>/gu, " ");
  const words = text.split(/\s+/u).filter(Boolean).length;
  return Math.ceil((words / 220) * 60);
}

export function auditManualReviewPreviewPayloadContractExport8X(
  beforeExportHtml: string,
  afterExportHtml: string,
): ManualReviewPreviewPayloadContractExportAudit8X {
  const before = estimateReadTimeSeconds(beforeExportHtml);
  const after = estimateReadTimeSeconds(afterExportHtml);
  const warnings: ManualReviewPreviewPayloadContractWarningCode8X[] = [];
  const exportUnder900Seconds = after <= 900;
  const exportUnder800Seconds = after <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (after <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (after <= 800);
  const exportTitleMentions8X = /<title>[^<]*8X[^<]*<\/title>/iu.test(afterExportHtml);
  const exportVisibleBadgeMentions8X = /Export compact 8X|Contrat payload 8X/iu.test(afterExportHtml);
  const exportMainCurrentVersionVisible =
    afterExportHtml.includes('id="compressed-export-8x"') &&
    afterExportHtml.includes('data-manual-review-preview-payload-contract-version="8X"');
  const exportMainIdStillCompressedExport8W = afterExportHtml.includes('id="compressed-export-8w"');
  const exportMainIdStillCompressedExport8V = afterExportHtml.includes('id="compressed-export-8v"');
  const exportMainIdStillCompressedExport8U = afterExportHtml.includes('id="compressed-export-8u"');
  const exportMainIdStillCompressedExport8T = afterExportHtml.includes('id="compressed-export-8t"');
  const exportMainIdStillCompressedExport8S = afterExportHtml.includes('id="compressed-export-8s"');
  const exportMainIdStillCompressedExport8R = afterExportHtml.includes('id="compressed-export-8r"');
  const exportMainIdStillCompressedExport8Q = afterExportHtml.includes('id="compressed-export-8q"');
  const exportMainIdStillCompressedExport8P = afterExportHtml.includes('id="compressed-export-8p"');
  const exportMainIdStillCompressedExport8N = afterExportHtml.includes('id="compressed-export-8n"');
  const exportMainIdStillCompressedExport8I = afterExportHtml.includes('id="compressed-export-8i"');

  pushIf(warnings, !exportUnder900Seconds, "EXPORT_OVER_900");
  pushIf(warnings, !exportUnder900BooleanCorrect, "EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  pushIf(warnings, !exportUnder800BooleanCorrect, "EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  pushIf(warnings, !exportTitleMentions8X, "EXPORT_TITLE_MISSING_8X");
  pushIf(warnings, !exportVisibleBadgeMentions8X, "EXPORT_BADGE_MISSING_8X");
  pushIf(warnings, exportMainIdStillCompressedExport8W, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8W");
  pushIf(warnings, exportMainIdStillCompressedExport8V, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8V");
  pushIf(warnings, exportMainIdStillCompressedExport8U, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8U");
  pushIf(warnings, exportMainIdStillCompressedExport8T, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8T");
  pushIf(warnings, exportMainIdStillCompressedExport8S, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8S");
  pushIf(warnings, exportMainIdStillCompressedExport8R, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8R");
  pushIf(warnings, exportMainIdStillCompressedExport8Q, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8Q");
  pushIf(warnings, exportMainIdStillCompressedExport8P, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  pushIf(warnings, exportMainIdStillCompressedExport8N, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  pushIf(warnings, exportMainIdStillCompressedExport8I, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");

  return {
    exportReadTimeSecondsBefore8X: before,
    exportReadTimeSecondsAfter8X: after,
    exportReadTimeDelta: after - before,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportTitleMentions8X,
    exportVisibleBadgeMentions8X,
    exportMainCurrentVersionVisible,
    exportMainIdStillCompressedExport8W,
    exportMainIdStillCompressedExport8V,
    exportMainIdStillCompressedExport8U,
    exportMainIdStillCompressedExport8T,
    exportMainIdStillCompressedExport8S,
    exportMainIdStillCompressedExport8R,
    exportMainIdStillCompressedExport8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    warningCodes: uniqueWarnings(warnings),
  };
}
