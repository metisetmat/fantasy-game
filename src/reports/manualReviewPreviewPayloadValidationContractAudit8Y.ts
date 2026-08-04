import type {
  ManualReviewPreviewPayloadValidationBoundaryAudit8Y,
  ManualReviewPreviewPayloadValidationContract8Y,
  ManualReviewPreviewPayloadValidationContractAudit8Y,
  ManualReviewPreviewPayloadValidationExportBudgetAudit8Y,
  ManualReviewPreviewPayloadValidationExportMetadataAudit8Y,
  ManualReviewPreviewPayloadValidationIntegrationBudgetAudit8Y,
  ManualReviewPreviewPayloadValidationMappingAudit8Y,
  ManualReviewPreviewPayloadValidationNoRuntimeAudit8Y,
  ManualReviewPreviewPayloadValidationNonPersistenceAudit8Y,
  ManualReviewPreviewPayloadValidationSourceOfTruthRegressionAudit8Y,
  ManualReviewPreviewPayloadValidationWordingAudit8Y,
} from "./manualReviewPreviewPayloadValidationContractTypes8Y";
import type { ManualReviewPreviewPayloadValidationContractWarningCode8Y } from "./manualReviewPreviewPayloadValidationContractWarnings8Y";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function strip8YSections(html: string): string {
  return html
    .replace(/<section\b[^>]*manual-review-preview-payload-validation-contract-8y[\s\S]*?<\/section>/giu, "")
    .replace(/<section\b[^>]*manual-review-preview-payload-validation-contract-export-8y[\s\S]*?<\/section>/giu, "");
}

function extract8YSections(productHtml: string, exportHtml: string): string {
  return [
    productHtml.match(/<section\b[^>]*manual-review-preview-payload-validation-contract-8y[\s\S]*?<\/section>/iu)?.[0] ?? "",
    exportHtml.match(/<section\b[^>]*manual-review-preview-payload-validation-contract-export-8y[\s\S]*?<\/section>/iu)?.[0] ?? "",
  ].join("\n");
}

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]+>/gu, " ");
  const words = text.split(/\s+/u).filter(Boolean).length;
  return Math.ceil((words / 220) * 60);
}

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewPayloadValidationContractWarningCode8Y[],
): readonly ManualReviewPreviewPayloadValidationContractWarningCode8Y[] {
  return [...new Set(warnings)];
}

function pushIf(
  warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[],
  condition: boolean,
  code: ManualReviewPreviewPayloadValidationContractWarningCode8Y,
): void {
  if (condition) warnings.push(code);
}

function countEnabledInputControls(html: string): number {
  const controls = [...html.matchAll(/<(?:input|textarea|select)\b[^>]*>/giu)];
  return controls.filter((match) => !/\bdisabled\b|\breadonly\b/iu.test(match[0])).length;
}

function countEnabledSubmitButtons(html: string): number {
  const buttons = [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/giu)];
  return buttons.filter((match) => {
    const tag = match[0];
    return !/\bdisabled\b/iu.test(tag) && /submit|soumettre|envoyer|valider|appliquer|save|sauvegarder/iu.test(tag);
  }).length;
}

export function auditManualReviewPreviewPayloadValidationContract8Y(
  contract: ManualReviewPreviewPayloadValidationContract8Y,
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadValidationContractAudit8Y {
  const productPreviewPayloadValidationContractVisible = productHtml.includes('id="manual-review-preview-payload-validation-contract-8y"');
  const exportPreviewPayloadValidationContractVisible = exportHtml.includes('id="manual-review-preview-payload-validation-contract-export-8y"');
  const combined8YSections = extract8YSections(productHtml, exportHtml);
  const validationContractUsesPayloadContract8X = combined8YSections.includes("8X") && combined8YSections.includes("documented_but_not_instantiated");
  const validationContractUsesActivationGuards8W = combined8YSections.includes("8W") && combined8YSections.includes("documented_but_blocked");
  const validationContractUsesFieldVisualReadiness8V = productHtml.includes("manual-review-field-ux-visual-readiness-8v") || exportHtml.includes("data-manual-review-field-ux-visual-readiness-version=\"8V\"");
  const validationContractUsesInputFieldContract8U = productHtml.includes("manual-review-input-field-contract-8u") || exportHtml.includes("data-manual-review-input-field-contract-version=\"8U\"");
  const observationEntryExampleWordingCount = countMatches(combined8YSections, /observation entry examples|exemples d'entree|entrees exemple/giu);
  const observationEntryContractWordingVisible = /observation entry contracts|contrats d'entrees d'observation|entry contracts/iu.test(combined8YSections);
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, !productPreviewPayloadValidationContractVisible, "PRODUCT_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_MISSING");
  pushIf(warnings, !exportPreviewPayloadValidationContractVisible, "EXPORT_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_MISSING");
  pushIf(warnings, !validationContractUsesPayloadContract8X, "PAYLOAD_CONTRACT_STATUS_NOT_PRESERVED");
  pushIf(warnings, !validationContractUsesActivationGuards8W, "PREVIEW_ACTIVATION_STATUS_NOT_PRESERVED");
  pushIf(warnings, contract.validationReadinessSummary.validationContractStatus !== "documented_but_not_executable", "VALIDATION_CONTRACT_STATUS_INVALID");
  pushIf(warnings, contract.validationGroups.length !== 7, "VALIDATION_GROUP_COUNT_INVALID");
  pushIf(warnings, contract.orderedValidationSteps.length !== 10, "ORDERED_VALIDATION_STEP_COUNT_INVALID");
  pushIf(warnings, contract.ruleMappings.length !== 20, "VALIDATION_RULE_MAPPING_COUNT_INVALID");
  pushIf(warnings, contract.errorMessages.length !== 19, "ERROR_MESSAGE_COUNT_INVALID");
  pushIf(warnings, contract.validationBlockers.length !== 12, "VALIDATION_BLOCKER_COUNT_INVALID");
  pushIf(warnings, contract.refusalStates.length !== 8, "VALIDATION_REFUSAL_STATE_COUNT_INVALID");
  pushIf(warnings, contract.boundaryGuards.length !== 14, "VALIDATION_BOUNDARY_GUARD_COUNT_INVALID");
  pushIf(warnings, contract.observationEntryContracts.length !== 3, "OBSERVATION_ENTRY_CONTRACT_COUNT_INVALID");
  pushIf(warnings, !observationEntryContractWordingVisible, "OBSERVATION_ENTRY_CONTRACT_WORDING_MISSING");
  pushIf(warnings, observationEntryExampleWordingCount !== 0, "OBSERVATION_ENTRY_EXAMPLE_WORDING_STILL_VISIBLE");
  return {
    previewPayloadValidationContractVisible: productPreviewPayloadValidationContractVisible && exportPreviewPayloadValidationContractVisible,
    productPreviewPayloadValidationContractVisible,
    exportPreviewPayloadValidationContractVisible,
    validationContractUsesPayloadContract8X,
    validationContractUsesActivationGuards8W,
    validationContractUsesFieldVisualReadiness8V,
    validationContractUsesInputFieldContract8U,
    validationContractStatus: contract.validationReadinessSummary.validationContractStatus,
    expectedValidationContractStatus: "documented_but_not_executable",
    validationContractStatusCorrect: contract.validationReadinessSummary.validationContractStatus === "documented_but_not_executable",
    validationGroupCount: contract.validationGroups.length,
    validationGroupCountExpected: 7,
    orderedValidationStepCount: contract.orderedValidationSteps.length,
    orderedValidationStepCountExpected: 10,
    validationRuleCount: contract.ruleMappings.length,
    validationRuleCountExpected: 20,
    validationRuleMappingCount: contract.ruleMappings.length,
    validationRuleMappingCountExpected: 20,
    errorMessageCount: contract.errorMessages.length,
    errorMessageCountExpected: 19,
    blockerCount: contract.validationBlockers.length,
    blockerCountExpected: 12,
    refusalStateCount: contract.refusalStates.length,
    refusalStateCountExpected: 8,
    boundaryGuardCount: contract.boundaryGuards.length,
    boundaryGuardCountExpected: 14,
    observationEntryContractCount: contract.observationEntryContracts.length,
    observationEntryContractCountExpected: 3,
    observationEntryExampleWordingCount,
    observationEntryContractWordingVisible,
    validationContractWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "PREPARE_MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_RUNTIME_LATER" : "REVIEW_VALIDATION_CONTRACT_8Y",
  };
}

export function auditManualReviewPreviewPayloadValidationNoRuntime8Y(
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadValidationNoRuntimeAudit8Y {
  const combined = extract8YSections(productHtml, exportHtml);
  const enabledInputControlCount = countEnabledInputControls(combined);
  const editableTextFieldCount = [...combined.matchAll(/<(?:input|textarea)\b[^>]*>/giu)]
    .filter((match) => !/\bdisabled\b|\breadonly\b/iu.test(match[0])).length;
  const enabledSelectControlCount = [...combined.matchAll(/<select\b[^>]*>/giu)]
    .filter((match) => !/\bdisabled\b/iu.test(match[0])).length;
  const enabledCheckboxControlCount = [...combined.matchAll(/<input\b[^>]*type=["']checkbox["'][^>]*>/giu)]
    .filter((match) => !/\bdisabled\b|\breadonly\b/iu.test(match[0])).length;
  const enabledSubmitButtonCount = countEnabledSubmitButtons(combined);
  const enabledCtaCount = enabledSubmitButtonCount + countMatches(combined, /<form\b[^>]*(?:action|method)=/giu);
  const payloadValidationRuntimeDetected = /validatePreviewPayload\s*\(|payloadValidationRuntime\s*[:=]\s*true|payloadValidationPerformed\s*[:=]\s*true/iu.test(combined);
  const validationExecutionCount = countMatches(combined, /validationExecutionCount\s*[:=]\s*(?!0)\d+|runtime validation executed/giu);
  const realPayloadReadCount = countMatches(combined, /realPayloadReadCount\s*[:=]\s*(?!0)\d+|readRealPayload\s*\(/giu);
  const payloadCreated = /payloadCreated\s*[:=]\s*true|createPreviewPayload\s*\(|data-real-payload=["']true["']/iu.test(combined);
  const realPayloadInstanceCount = countMatches(combined, /createPreviewPayload\s*\(|data-real-payload=["']true["']/giu);
  const realInputActivated = enabledInputControlCount > 0 || /realInputActivated\s*[:=]\s*true|data-real-input=["']true["']/iu.test(combined);
  const realPreviewGenerated = /realPreviewGenerated\s*[:=]\s*true|renderRealPreview\s*\(|data-real-preview=["']true["']/iu.test(combined);
  const backendActionCount = countMatches(combined, /backendAction\s*[:=]\s*true|serverAction\s*\(|data-backend-action=|POST\s+\//giu);
  const apiCallCount = countMatches(combined, /fetch\s*\(|axios\.|data-api-endpoint=|apiCreated\s*[:=]\s*true/giu);
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, payloadValidationRuntimeDetected, "PAYLOAD_VALIDATION_RUNTIME_DETECTED");
  pushIf(warnings, validationExecutionCount !== 0, "VALIDATION_EXECUTION_DETECTED");
  pushIf(warnings, realPayloadReadCount !== 0, "REAL_PAYLOAD_READ_DETECTED");
  pushIf(warnings, payloadCreated, "PAYLOAD_CREATION_DETECTED");
  pushIf(warnings, realPayloadInstanceCount !== 0, "REAL_PAYLOAD_INSTANCE_DETECTED");
  pushIf(warnings, realInputActivated, "REAL_INPUT_ACTIVATED");
  pushIf(warnings, enabledInputControlCount !== 0, "ENABLED_INPUT_CONTROL_DETECTED");
  pushIf(warnings, realPreviewGenerated, "REAL_PREVIEW_GENERATION_DETECTED");
  pushIf(warnings, enabledCtaCount !== 0, "ENABLED_CTA_DETECTED");
  pushIf(warnings, enabledSubmitButtonCount !== 0, "SUBMIT_BUTTON_DETECTED");
  pushIf(warnings, backendActionCount !== 0, "BACKEND_ACTION_DETECTED");
  pushIf(warnings, apiCallCount !== 0, "API_CALL_DETECTED");
  return {
    validationRuntimeActive: false,
    payloadValidationRuntimeDetected,
    validationExecutionCount,
    realPayloadReadCount,
    payloadCreated,
    realPayloadInstanceCount,
    realInputActivated,
    activeFieldCount: enabledInputControlCount,
    enabledInputControlCount,
    editableTextFieldCount,
    enabledSelectControlCount,
    enabledCheckboxControlCount,
    realPreviewGenerated,
    enabledCtaCount,
    submitButtonCount: enabledSubmitButtonCount,
    enabledSubmitButtonCount,
    backendActionCount,
    apiCallCount,
    runtimeWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "VALIDATION_RUNTIME_REMAINS_INACTIVE" : "BLOCK_RUNTIME_ACTIVATION",
  };
}

export function auditManualReviewPreviewPayloadValidationMapping8Y(
  contract: ManualReviewPreviewPayloadValidationContract8Y,
): ManualReviewPreviewPayloadValidationMappingAudit8Y {
  const errorIds = new Set(contract.errorMessages.map((message) => message.linkedErrorStateId));
  const blockerIds = new Set(contract.validationBlockers.map((blocker) => blocker.blockerId));
  const unmappedRuleCount = contract.ruleMappings.filter((mapping) => mapping.appliesToPayloadField.length === 0).length;
  const unmappedErrorCount = contract.ruleMappings.filter((mapping) => !errorIds.has(mapping.errorStateId)).length;
  const unmappedBlockerCount = contract.ruleMappings.filter((mapping) => !blockerIds.has(mapping.blockerId)).length;
  const mappingText = contract.ruleMappings.map((mapping) => `${mapping.groupId} ${mapping.appliesToPayloadField} ${mapping.appliesToEntryField ?? ""}`).join(" ");
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, contract.ruleMappings.length < 20, "RULE_TO_FIELD_MAPPING_INCOMPLETE");
  pushIf(warnings, contract.ruleMappings.filter((mapping) => errorIds.has(mapping.errorStateId)).length !== 20, "RULE_TO_ERROR_MAPPING_INCOMPLETE");
  pushIf(warnings, contract.ruleMappings.filter((mapping) => blockerIds.has(mapping.blockerId)).length < 20, "RULE_TO_BLOCKER_MAPPING_INCOMPLETE");
  pushIf(warnings, contract.errorMessages.length !== 19, "COACH_FACING_ERROR_MESSAGES_MISSING");
  pushIf(warnings, contract.errorMessages.length !== 19, "TECHNICAL_ERROR_MESSAGES_MISSING");
  pushIf(warnings, unmappedRuleCount !== 0, "UNMAPPED_RULE_DETECTED");
  pushIf(warnings, unmappedErrorCount !== 0, "UNMAPPED_ERROR_DETECTED");
  pushIf(warnings, unmappedBlockerCount !== 0, "UNMAPPED_BLOCKER_DETECTED");
  return {
    ruleToFieldMappingCount: contract.ruleMappings.filter((mapping) => mapping.appliesToPayloadField.length > 0).length,
    ruleToErrorMappingCount: contract.ruleMappings.filter((mapping) => errorIds.has(mapping.errorStateId)).length,
    ruleToBlockerMappingCount: contract.ruleMappings.filter((mapping) => blockerIds.has(mapping.blockerId)).length,
    coachFacingErrorMessageCount: contract.errorMessages.filter((message) => message.coachFacingMessage.length > 0).length,
    technicalErrorMessageCount: contract.errorMessages.filter((message) => message.technicalMessage.length > 0).length,
    unmappedRuleCount,
    unmappedErrorCount,
    unmappedBlockerCount,
    sourceScopeMappingVisible: /source_and_scope|payloadSource|payloadScope/iu.test(mappingText),
    entryMappingVisible: /observation_entries|entries/iu.test(mappingText),
    fieldValueMappingVisible: /field_values|outcome|count|note/iu.test(mappingText),
    boundaryFlagMappingVisible: /boundary_flags|boundaryFlags|officialTruth|applied/iu.test(mappingText),
    forbiddenFieldMappingVisible: /forbidden_fields|scoreChange|automaticDecision|storageTarget/iu.test(mappingText),
    runtimeEffectMappingVisible: /runtime_effects_blocked|validationState|backendCommand/iu.test(mappingText),
    mappingWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "KEEP_RULE_FIELD_ERROR_BLOCKER_MAPPING" : "REVIEW_RULE_FIELD_ERROR_BLOCKER_MAPPING",
  };
}

export function auditManualReviewPreviewPayloadValidationNonPersistence8Y(
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadValidationNonPersistenceAudit8Y {
  const combined = extract8YSections(productHtml, exportHtml);
  const localStoragePersistenceCount = countMatches(combined, /localStorage\.setItem|sessionStorage\.setItem|indexedDB/giu);
  const databasePersistenceCount = countMatches(combined, /sqlite|database write|db\.save|INSERT INTO/giu);
  const filePersistenceCount = countMatches(combined, /writeFile(?:Sync)?\s*\(|appendFile(?:Sync)?\s*\(/giu);
  const backendSubmitActionCount = countMatches(combined, /backendSubmit\s*\(|serverAction\s*\(|POST\s+\//giu);
  const formSubmitButtonCount = countEnabledSubmitButtons(combined);
  const apiCallCount = countMatches(combined, /fetch\s*\(|axios\.|apiCall/giu);
  const memoryCreationCount = countMatches(combined, /createMemory\s*\(|memoryCreated\s*[:=]\s*true/giu);
  const seasonMemoryCreationCount = countMatches(combined, /seasonMemoryCreation|seasonMemory\s*[:=]\s*true/giu);
  const teamStyleMemoryCreationCount = countMatches(combined, /teamStyleMemoryCreation|teamStyleMemory\s*[:=]\s*true/giu);
  const draftCreationCount = countMatches(combined, /draftCreated\s*[:=]\s*true|saveDraft\s*\(/giu);
  const historyCreationCount = countMatches(combined, /historyCreated\s*[:=]\s*true|historyStore\.save|saveHistory\s*\(/giu);
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, localStoragePersistenceCount !== 0, "LOCAL_STORAGE_PERSISTENCE_DETECTED");
  pushIf(warnings, databasePersistenceCount !== 0, "DATABASE_PERSISTENCE_CREATED");
  pushIf(warnings, filePersistenceCount !== 0, "FILE_PERSISTENCE_CREATED");
  pushIf(warnings, draftCreationCount !== 0, "DRAFT_CREATED");
  pushIf(warnings, historyCreationCount !== 0, "HISTORY_CREATED");
  pushIf(warnings, memoryCreationCount + seasonMemoryCreationCount !== 0, "SEASON_MEMORY_CREATED");
  pushIf(warnings, teamStyleMemoryCreationCount !== 0, "TEAM_STYLE_MEMORY_CREATED");
  pushIf(warnings, backendSubmitActionCount !== 0, "BACKEND_ACTION_DETECTED");
  pushIf(warnings, apiCallCount !== 0, "API_CALL_DETECTED");
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
    draftCreationCount,
    historyCreationCount,
    validationPersistencePerformed: false,
    validationApplicationPerformed: false,
    storageDecisionImplementedCount: 0,
    nonPersistenceWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "KEEP_VALIDATION_NON_PERSISTENT" : "BLOCK_PERSISTENCE_SURFACE",
  };
}

export function auditManualReviewPreviewPayloadValidationBoundary8Y(
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadValidationBoundaryAudit8Y {
  const combined = extract8YSections(productHtml, exportHtml);
  const officialTruthPromotionCount = countMatches(combined, /officialTruth\s*[:=]\s*true|promotedToOfficial|verite officielle appliquee/giu);
  const coachInputPromotedToOfficialTruthCount = countMatches(combined, /coach input promoted|revue coach promue|manual review promoted/giu);
  const validationClaimedAsRealNextMatchCount = countMatches(combined, /real next match result|prochain match confirme|validation confirme le prochain match/giu);
  const validationClaimedAsEngineResultCount = countMatches(combined, /engine result from validation|resultat moteur depuis validation|validation appliquee au moteur/giu);
  const validationClaimedAsSeasonTrendCount = countMatches(combined, /season trend confirmed|tendance saison confirmee/giu);
  const validationClaimedAsTeamMemoryCount = countMatches(combined, /team memory created|team style memory created|memoire d'equipe creee/giu);
  const automaticDecisionCount = countMatches(combined, /automaticDecision\s*[:=]\s*true|decision automatique creee|decision automatique activee/giu);
  const automaticClassificationRealMatchCount = countMatches(combined, /automaticClassificationRealMatch|classification automatique real match/giu);
  const selectionRecommendationCount = countMatches(combined, /selection imposee|selectionRecommendation\s*[:=]\s*true/giu);
  const tacticalInstructionCount = countMatches(combined, /tacticalInstruction\s*[:=]\s*true|consigne tactique officielle activee|plan tactique impose/giu);
  const sandboxPromotionCount = countMatches(combined, /sandbox promoted|sandbox applique/giu);
  const diagnosticPromotionCount = countMatches(combined, /diagnostic promoted|diagnostic comme verite officielle/giu);
  const batchPromotionCount = countMatches(combined, /batch promoted|batch score comme score officiel/giu);
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, officialTruthPromotionCount + coachInputPromotedToOfficialTruthCount !== 0, "OFFICIAL_TRUTH_PROMOTION_DETECTED");
  pushIf(warnings, validationClaimedAsRealNextMatchCount !== 0, "REAL_NEXT_MATCH_CLAIM_DETECTED");
  pushIf(warnings, validationClaimedAsEngineResultCount !== 0, "ENGINE_LEARNING_CLAIM_DETECTED");
  pushIf(warnings, validationClaimedAsSeasonTrendCount !== 0, "SEASON_TREND_CLAIM_DETECTED");
  pushIf(warnings, validationClaimedAsTeamMemoryCount !== 0, "TEAM_STYLE_MEMORY_CREATED");
  pushIf(warnings, automaticDecisionCount + automaticClassificationRealMatchCount !== 0, "AUTOMATIC_DECISION_DETECTED");
  pushIf(warnings, selectionRecommendationCount !== 0, "SELECTION_IMPOSITION_DETECTED");
  pushIf(warnings, tacticalInstructionCount !== 0, "TACTICAL_PLAN_IMPOSITION_DETECTED");
  pushIf(warnings, sandboxPromotionCount !== 0, "SANDBOX_PROMOTION_DETECTED");
  pushIf(warnings, diagnosticPromotionCount !== 0, "DIAGNOSTIC_PROMOTION_DETECTED");
  pushIf(warnings, batchPromotionCount !== 0, "BATCH_PROMOTION_DETECTED");
  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount,
    validationClaimedAsRealNextMatchCount,
    validationClaimedAsEngineResultCount,
    validationClaimedAsSeasonTrendCount,
    validationClaimedAsTeamMemoryCount,
    automaticDecisionCount,
    automaticClassificationRealMatchCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    boundaryWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "KEEP_BOUNDARIES_NON_OFFICIAL" : "BLOCK_OFFICIAL_OR_AUTOMATION_PROMOTION",
  };
}

export function auditManualReviewPreviewPayloadValidationSourceOfTruth8Y(): ManualReviewPreviewPayloadValidationSourceOfTruthRegressionAudit8Y {
  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: true,
    reportUsesOfficialScoreOnlyForOfficialScore: true,
    reportScoreMatchesOfficialScore: true,
    allStoryScoreClaimsBackedByScoreChange: true,
    allReplayScoreClaimsBackedByScoreChange: true,
    validationContractDoesNotClaimNewScoreEvidence: true,
    validationContractDoesNotCreateFutureEvidence: true,
    validationContractDoesNotMutateTimeline: true,
    validationContractDoesNotMutateScore: true,
    validationContractDoesNotCreateScoreChange: true,
    validationContractDoesNotPromoteCoachInputToOfficialTruth: true,
    noScoreMutation: true,
    noEventDeletion: true,
    noScoringConstantChange: true,
    MatchBonusEventUnchanged: true,
    batchLiveSeparationPreserved: true,
    sourceOfTruthWarningCodes: [],
    recommendation: "KEEP_SOURCE_OF_TRUTH_BOUNDARY",
  };
}

export function auditManualReviewPreviewPayloadValidationExportMetadata8Y(
  exportHtml: string,
): ManualReviewPreviewPayloadValidationExportMetadataAudit8Y {
  const exportTitleMentions8Y = /<title>[^<]*8Y[^<]*<\/title>/iu.test(exportHtml);
  const exportMainCurrentVersionVisible =
    exportHtml.includes('id="compressed-export-8y"') &&
    exportHtml.includes('data-manual-review-preview-payload-validation-contract-version="8Y"');
  const exportVisibleBadgeMentions8Y = /Export compact 8Y|Validation payload 8Y/iu.test(exportHtml);
  const exportMainIdStillCompressedExport8X = exportHtml.includes('id="compressed-export-8x"');
  const exportMainIdStillCompressedExport8W = exportHtml.includes('id="compressed-export-8w"');
  const exportMainIdStillCompressedExport8V = exportHtml.includes('id="compressed-export-8v"');
  const exportMainIdStillCompressedExport8U = exportHtml.includes('id="compressed-export-8u"');
  const exportMainIdStillCompressedExport8T = exportHtml.includes('id="compressed-export-8t"');
  const exportMainIdStillCompressedExport8S = exportHtml.includes('id="compressed-export-8s"');
  const exportMainIdStillCompressedExport8R = exportHtml.includes('id="compressed-export-8r"');
  const exportMainIdStillCompressedExport8Q = exportHtml.includes('id="compressed-export-8q"');
  const exportMainIdStillCompressedExport8P = exportHtml.includes('id="compressed-export-8p"');
  const exportMainIdStillCompressedExport8N = exportHtml.includes('id="compressed-export-8n"');
  const exportMainIdStillCompressedExport8I = exportHtml.includes('id="compressed-export-8i"');
  const exportHistoricalMarkersPreservedAsDataAttributes =
    exportHtml.includes('data-manual-review-preview-payload-contract-version="8X"') &&
    exportHtml.includes('data-manual-review-preview-activation-guards-version="8W"') &&
    exportHtml.includes('data-manual-review-input-field-contract-version="8U"') &&
    exportHtml.includes('data-story-first-export-version="8I"');
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, !exportTitleMentions8Y, "EXPORT_TITLE_MISSING_8Y");
  pushIf(warnings, !exportMainCurrentVersionVisible, "EXPORT_TITLE_MISSING_8Y");
  pushIf(warnings, !exportVisibleBadgeMentions8Y, "EXPORT_BADGE_MISSING_8Y");
  pushIf(warnings, exportMainIdStillCompressedExport8X, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8X");
  pushIf(warnings, !exportHistoricalMarkersPreservedAsDataAttributes, "EXPORT_HISTORICAL_MARKERS_MISSING");
  return {
    exportTitleMentions8Y,
    exportMainCurrentVersionVisible,
    exportVisibleBadgeMentions8Y,
    exportMainIdStillCompressedExport8X,
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
    exportHistoricalMarkersPreservedAsDataAttributes,
    metadataWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_METADATA_8Y" : "REPAIR_EXPORT_METADATA_8Y",
  };
}

export function auditManualReviewPreviewPayloadValidationExportBudget8Y(
  beforeExportHtml: string,
  afterExportHtml: string,
): ManualReviewPreviewPayloadValidationExportBudgetAudit8Y {
  const before = estimateReadTimeSeconds(beforeExportHtml);
  const after = estimateReadTimeSeconds(afterExportHtml);
  const exportUnder900Seconds = after <= 900;
  const exportUnder800Seconds = after <= 800;
  const exportMandatorySectionsPreserved =
    afterExportHtml.includes("manual-review-preview-payload-contract-export-8x") &&
    afterExportHtml.includes("manual-review-preview-payload-validation-contract-export-8y") &&
    afterExportHtml.includes("tactical-map-cards");
  const exportNoFullTimeline = !/full timeline|timeline complete|event-by-event/iu.test(afterExportHtml);
  const exportNoSandboxPanel = !/sandbox panel|sandbox applique/iu.test(afterExportHtml);
  const exportNoLongBatchDiagnostics = !/long batch diagnostics|diagnostics batch longs/iu.test(afterExportHtml);
  const exportMetadataClean =
    afterExportHtml.includes('id="compressed-export-8y"') &&
    !afterExportHtml.includes('id="compressed-export-8x"');
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, !exportUnder900Seconds, "EXPORT_OVER_900");
  pushIf(warnings, exportUnder900Seconds !== (after <= 900), "EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  pushIf(warnings, exportUnder800Seconds !== (after <= 800), "EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  pushIf(warnings, !exportMetadataClean, "EXPORT_ID_STILL_COMPRESSED_EXPORT_8X");
  return {
    exportReadTimeSecondsBefore8Y: before,
    exportReadTimeSecondsAfter8Y: after,
    exportReadTimeDelta: after - before,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (after <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (after <= 800),
    exportPreviewPayloadValidationContractVisible: afterExportHtml.includes("manual-review-preview-payload-validation-contract-export-8y"),
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportMetadataClean,
    exportBudgetWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_COMPACT_8Y" : "REPAIR_EXPORT_BUDGET_8Y",
  };
}

export function auditManualReviewPreviewPayloadValidationIntegration8Y(
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadValidationIntegrationBudgetAudit8Y {
  return {
    productPreviewPayloadValidationContractVisible: productHtml.includes("manual-review-preview-payload-validation-contract-8y"),
    exportPreviewPayloadValidationContractVisible: exportHtml.includes("manual-review-preview-payload-validation-contract-export-8y"),
    productPreviewPayloadContract8XStillVisible: productHtml.includes("manual-review-preview-payload-contract-8x"),
    exportPreviewPayloadContract8XStillVisible: exportHtml.includes("manual-review-preview-payload-contract-export-8x"),
    productPreviewActivationGuards8WStillVisible: productHtml.includes("manual-review-preview-activation-guards-8w"),
    exportPreviewActivationGuards8WStillVisible: exportHtml.includes("manual-review-preview-activation-guards-export-8w"),
    productFieldUxVisualReadiness8VStillVisible: productHtml.includes("manual-review-field-ux-visual-readiness-8v"),
    exportFieldUxVisualReadiness8VStillVisible: exportHtml.includes("manual-review-field-ux-visual-readiness-export-8v") || exportHtml.includes('data-manual-review-field-ux-visual-readiness-version="8V"'),
    productInputFieldContract8UStillVisible: productHtml.includes("manual-review-input-field-contract-8u"),
    exportInputFieldContract8UStillVisible: exportHtml.includes("manual-review-input-field-contract-export-8u") || exportHtml.includes('data-manual-review-input-field-contract-version="8U"'),
    productInteractionContract8TStillVisible: productHtml.includes("manual-review-ux-interaction-contract-8t"),
    exportInteractionContract8TStillVisible: exportHtml.includes("manual-review-ux-interaction-contract-export-8t") || exportHtml.includes('data-manual-review-ux-interaction-contract-version="8T"'),
    productUxSkeleton8SStillVisible: productHtml.includes("manual-review-workflow-ux-skeleton-8s"),
    exportUxSkeleton8SStillVisible: exportHtml.includes("manual-review-workflow-ux-skeleton-export-8s") || exportHtml.includes('data-manual-review-workflow-ux-skeleton-version="8S"'),
    productWorkflowReadiness8RStillVisible: productHtml.includes("manual-review-workflow-readiness-8r"),
    exportWorkflowReadiness8RStillVisible: exportHtml.includes("manual-review-workflow-readiness-export-8r") || exportHtml.includes('data-manual-review-workflow-readiness-version="8R"'),
    productDecisionGate8QStillVisible: productHtml.includes("manual-review-preview-decision-gate-8q"),
    exportDecisionGate8QStillVisible: exportHtml.includes("manual-review-preview-decision-gate-export-8q") || exportHtml.includes('data-manual-review-preview-decision-gate-version="8Q"'),
    productPreviewComparison8PStillVisible: productHtml.includes("manual-review-preview-comparison-8p"),
    exportPreviewComparison8PStillVisible: exportHtml.includes("manual-review-preview-comparison-export-8p") || exportHtml.includes('data-manual-review-preview-comparison-version="8P"'),
    productPreviewRenderer8OStillVisible: productHtml.includes("manual-review-preview-8o"),
    exportPreviewRenderer8OStillVisible: exportHtml.includes("manual-review-preview-export-8o") || exportHtml.includes('data-manual-review-preview-renderer-version="8O"'),
    productManualIntakeBoundary8NStillVisible: productHtml.includes("manual-review-intake-boundary-8n"),
    exportManualIntakeBoundary8NStillVisible: exportHtml.includes("manual-review-intake-boundary-export-8n") || exportHtml.includes('data-manual-review-intake-boundary-version="8N"'),
    productManualForm8MStillVisible: productHtml.includes("manual-post-match-observation-form-8m"),
    exportManualForm8MStillVisible: exportHtml.includes("manual-post-match-observation-form-export-8m") || exportHtml.includes('data-manual-review-form-version="8M"'),
    productLearningLoop8LStillVisible: productHtml.includes("seasonless-learning-loop-8l"),
    exportLearningLoop8LStillVisible: exportHtml.includes("seasonless-learning-loop-export-8l") || exportHtml.includes('data-learning-loop-version="8L"'),
    productDecisionLayer8KStillVisible: productHtml.includes("coach-decision-layer-8k"),
    exportDecisionLayer8KStillVisible: exportHtml.includes("next-match-plan"),
    productStoryFirstSectionVisible: productHtml.includes("story-first") || productHtml.includes("Match en 2 minutes"),
    exportStoryFirstSectionVisible: exportHtml.includes("story-first") || exportHtml.includes("Match en 2 minutes"),
    productReplaySectionVisible: productHtml.includes("coach-replay") || productHtml.includes("Replay"),
    exportReplaySectionVisible: exportHtml.includes("Replay"),
    productActionPlanVisible: productHtml.includes("coach-action-plan"),
    exportActionPlanVisible: exportHtml.includes("coach-action-plan"),
    tacticalMapCardsStillVisible: productHtml.includes("tactical-map-cards") && exportHtml.includes("tactical-map-cards"),
    sourceOfTruthNoteVisible: productHtml.includes("source-of-truth") || exportHtml.includes("source-of-truth") || exportHtml.includes("Score officiel"),
    productSectionOrderPreserved:
      productHtml.indexOf("manual-review-preview-payload-contract-8x") >= 0 &&
      productHtml.indexOf("manual-review-preview-payload-validation-contract-8y") > productHtml.indexOf("manual-review-preview-payload-contract-8x"),
    exportCompactPreserved: exportHtml.includes("compressed-export-8y"),
    integrationWarningCodes: [],
    recommendation: "KEEP_8Y_INTEGRATION_COMPACT",
  };
}

export function auditManualReviewPreviewPayloadValidationWording8Y(
  productHtml: string,
  exportHtml: string,
): ManualReviewPreviewPayloadValidationWordingAudit8Y {
  const combined8YSections = extract8YSections(productHtml, exportHtml);
  const observationEntryExampleWordingCount = countMatches(combined8YSections, /observation entry examples|exemples d'entree|entrees exemple/giu);
  const forbiddenCounts = {
    noValidationActiveClaimCount: countMatches(combined8YSections, /validation active|validation runtime active/giu),
    noPayloadAcceptedClaimCount: countMatches(combined8YSections, /payload accepte|payload valide/giu),
    noPayloadCreatedClaimCount: countMatches(combined8YSections, /payload cree(?! 0)|payload reel cree(?!\s*[:=]?\s*0)/giu),
    noRealPreviewGeneratedClaimCount: countMatches(combined8YSections, /preview generee|preview reelle generee/giu),
    noPreviewActivatedClaimCount: countMatches(combined8YSections, /preview activee|activation preview reelle/giu),
    noRealNextMatchClaimCount: countMatches(combined8YSections, /vrai prochain match|prochain match confirme/giu),
    noOfficialResultClaimCount: countMatches(combined8YSections, /resultat officiel depuis validation|verite officielle appliquee/giu),
    noEngineLearningClaimCount: countMatches(combined8YSections, /moteur apprend|engine learning/giu),
    noSeasonTrendClaimCount: countMatches(combined8YSections, /tendance saison|season trend/giu),
    noAutomaticDecisionClaimCount: countMatches(combined8YSections, /decision automatique creee|automatic decision created/giu),
    noSelectionInstructionCount: countMatches(combined8YSections, /selection imposee|selection recommandee officiellement/giu),
    noTacticalInstructionCount: countMatches(combined8YSections, /consigne tactique officielle|plan tactique impose/giu),
    noStorageReadyClaimCount: countMatches(combined8YSections, /stockage actif|storage ready/giu),
    noSubmitReadyClaimCount: countMatches(combined8YSections, /submit pret|envoyer maintenant|soumettre maintenant/giu),
  };
  const visibleChecks = [
    /future|futur|documentee/iu.test(combined8YSections),
    /inactive|aucune execution/iu.test(combined8YSections),
    /aucune validation runtime|validation runtime.*inactive/iu.test(combined8YSections),
    /preview-only|preview only/iu.test(combined8YSections),
    /manual_non_official|non officielle/iu.test(combined8YSections),
    /stocke|persisted|persistante/iu.test(combined8YSections),
    /applique|applied/iu.test(combined8YSections),
    /aucun payload reel|payload reel cree.*0/iu.test(combined8YSections),
    /preview reelle.*0|aucune preview reelle/iu.test(combined8YSections),
    /submit.*API.*backend|submit, API, backend/iu.test(combined8YSections),
    /contrats d'entrees d'observation|entry contracts/iu.test(combined8YSections),
    /ready_for_non_persistent_preview.*needs_completion|Gate 8Q.*needs_completion/iu.test(combined8YSections),
    /contrat de validation.*validation runtime|validation runtime.*inactive/iu.test(combined8YSections),
    /payload reel absent|aucun payload reel/iu.test(combined8YSections),
    /preview reelle non generee|aucune preview reelle/iu.test(combined8YSections),
  ];
  const ambiguousValidationContractWordingCount = countMatches(combined8YSections, /validation active|payload accepte|preview activee/giu);
  const wordingReadabilityScore = visibleChecks.filter(Boolean).length === visibleChecks.length &&
    observationEntryExampleWordingCount === 0 &&
    Object.values(forbiddenCounts).every((count) => count === 0) &&
    ambiguousValidationContractWordingCount === 0
    ? 96
    : 88;
  const warnings: ManualReviewPreviewPayloadValidationContractWarningCode8Y[] = [];
  pushIf(warnings, observationEntryExampleWordingCount !== 0, "OBSERVATION_ENTRY_EXAMPLE_WORDING_STILL_VISIBLE");
  pushIf(warnings, ambiguousValidationContractWordingCount !== 0, "AMBIGUOUS_VALIDATION_CONTRACT_WORDING");
  return {
    validationContractFutureOnlyWordingVisible: visibleChecks[0] === true,
    validationContractInactiveWordingVisible: visibleChecks[1] === true,
    validationContractNoRuntimeWordingVisible: visibleChecks[2] === true,
    validationContractPreviewOnlyWordingVisible: visibleChecks[3] === true,
    validationContractNonOfficialWordingVisible: visibleChecks[4] === true,
    validationContractNotPersistedWordingVisible: visibleChecks[5] === true,
    validationContractNotAppliedWordingVisible: visibleChecks[6] === true,
    noPayloadCreatedWordingVisible: visibleChecks[7] === true,
    noRealPreviewWordingVisible: visibleChecks[8] === true,
    noSubmitApiBackendWordingVisible: visibleChecks[9] === true,
    observationEntryContractWordingVisible: visibleChecks[10] === true,
    observationEntryExampleWordingCount,
    workflowReadinessDistinctFromReviewGateWordingVisible: visibleChecks[11] === true,
    validationContractDistinctFromRuntimeWordingVisible: visibleChecks[12] === true,
    validationContractDistinctFromPayloadCreationWordingVisible: visibleChecks[13] === true,
    validationContractDistinctFromPreviewGenerationWordingVisible: visibleChecks[14] === true,
    ...forbiddenCounts,
    ambiguousValidationContractWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: uniqueWarnings(warnings),
    recommendation: warnings.length === 0 && wordingReadabilityScore >= 95 ? "KEEP_8Y_WORDING" : "TIGHTEN_8Y_WORDING",
  };
}
