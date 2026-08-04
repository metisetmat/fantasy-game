import type {
  ManualReviewPreviewActivationExportAudit8W,
  ManualReviewPreviewActivationGuard8W,
  ManualReviewPreviewActivationGuardsAudit8W,
} from "./manualReviewPreviewActivationGuardsTypes8W";
import type { ManualReviewPreviewActivationGuardsWarningCode8W } from "./manualReviewPreviewActivationGuardsWarnings8W";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function readTimeSeconds(html: string): number {
  const words = html.replace(/<[^>]*>/gu, " ").trim().split(/\s+/u).filter(Boolean).length;
  return Math.ceil((words / 180) * 60);
}

function hasEnabledControl(html: string): boolean {
  return [...html.matchAll(/<(?:input|textarea|select)\b[^>]*>/giu)].some((match) => {
    const tag = match[0];
    return !/\bdisabled\b|\breadonly\b|aria-disabled=["']true["']/iu.test(tag);
  });
}

function hasEnabledSubmit(html: string): boolean {
  return [...html.matchAll(/<button\b[^>]*>|<input\b[^>]*type=["']submit["'][^>]*>/giu)].some((match) => {
    const tag = match[0];
    return /\btype=["']submit["']|submit|envoyer|valider|appliquer/iu.test(tag)
      && !/\bdisabled\b|aria-disabled=["']true["']/iu.test(tag);
  }) || /<form\b[^>]*\baction=/iu.test(html);
}

function activeSurface(input: { readonly productHtml: string; readonly exportHtml: string }): string {
  return `${input.productHtml}\n${input.exportHtml}`;
}

function hasPositiveSelectionInstruction(html: string): boolean {
  return [...html.matchAll(/selection\s+imposee|doit\s+selectionner|changer\s+la\s+selection|selectedPlayerId/giu)].some((match) => {
    const start = match.index ?? 0;
    const before = html.slice(Math.max(0, start - 32), start).toLowerCase();
    return !/(pas de|sans|aucune?|zero|ne cree pas|ne produit pas)\s*$/iu.test(before);
  });
}

export function auditManualReviewPreviewActivationGuards8W(input: {
  readonly guard: ManualReviewPreviewActivationGuard8W;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewActivationGuardsAudit8W {
  const { guard, productHtml, exportHtml } = input;
  const combined = activeSurface(input);
  const warningCodes: ManualReviewPreviewActivationGuardsWarningCode8W[] = [];
  const productVisible = productHtml.includes('id="manual-review-preview-activation-guards-8w"');
  const exportVisible = exportHtml.includes('id="manual-review-preview-activation-guards-export-8w"');
  const usesFieldVisualReadiness8V = guard.sourceFieldVisualReadinessVersion === "8V"
    && productHtml.includes('id="manual-review-field-ux-visual-readiness-8v"')
    && exportHtml.includes('id="manual-review-field-ux-visual-readiness-export-8v"');
  const usesInputFieldContract8U = guard.sourceInputFieldContractVersion === "8U"
    && productHtml.includes('id="manual-review-input-field-contract-8u"')
    && exportHtml.includes('id="manual-review-input-field-contract-export-8u"');
  const activationConditionCount = guard.activationConditions.length;
  const satisfiedActivationConditionCount = guard.activationConditions.filter((condition) => condition.satisfiedIn8W).length;
  const unsatisfiedActivationConditionCount = guard.activationConditions.filter((condition) => !condition.satisfiedIn8W).length;
  const blockingGuardCount = guard.blockingGuards.length;
  const refusalStateCount = guard.refusalStates.length;
  const previewActivationStatusCorrect = guard.activationReadinessSummary.previewActivationStatus
    === guard.activationReadinessSummary.expectedPreviewActivationStatus;
  const nonPersistentPreviewModeDefined = guard.futurePreviewOnlyBoundary.boundaryId === "manual-review-preview-only-boundary-8w";
  const fieldVisualDistinctFromPreviewActivation = productHtml.includes("pret pour revue visuelle statique")
    && productHtml.includes("preview documentee mais bloquee");
  const readinessDistinctFromReviewGateStillVisible = productHtml.includes("Readiness 8R")
    && productHtml.includes("gate 8Q")
    && productHtml.includes("needs_completion");
  const export8VWorkflowLabelCorrected = !exportHtml.includes("Workflow 8S :</strong> ready_for_non_persistent_preview")
    && exportHtml.includes("Readiness 8R");
  const export8SLabelStillSkeletonOnly = exportHtml.includes("Squelette UX 8S") || exportHtml.includes("UX skeleton 8S");
  const microWordingDebt8VFixed = export8VWorkflowLabelCorrected && export8SLabelStillSkeletonOnly;
  const nonPersistentPreviewModeActivated = /nonPersistentPreviewModeActivated\s*[:=]\s*true|previewActivationStatus\s*[:=]\s*["']active["']|data-preview-mode=["']active["']|preview-mode-active/iu.test(combined);
  const realInputActivated = hasEnabledControl(combined) || /contenteditable=["']true["']/iu.test(combined);
  const payloadCreated = /payloadCreated\s*[:=]\s*true|createPreviewPayload|previewPayload\s*=|new\s+FormData|data-preview-payload/iu.test(combined);
  const realPreviewGenerated = /realPreviewGenerated\s*[:=]\s*true|previewGenerated\s*[:=]\s*true|renderRealPreview|data-real-preview=["']true["']|preview-rendered/iu.test(combined);
  const submitCreated = hasEnabledSubmit(combined);
  const apiCreated = /\bfetch\s*\(|\baxios\.|data-api-endpoint=|apiCreated\s*[:=]\s*true/iu.test(combined);
  const backendCreated = /backendCreated\s*[:=]\s*true|backendAction|serverAction|data-backend-action=|POST\s+\/|mutation\s*\{/iu.test(combined);
  const storageCreated = /localStorage\.setItem|sessionStorage\.setItem|indexedDB|writeFile(?:Sync)?\s*\(|historyStore\.save|storageCreated\s*[:=]\s*true/iu.test(combined);
  const memoryCreated = /seasonMemory|teamStyleMemory|createMemory|memoryCreated\s*[:=]\s*true/iu.test(combined);
  const officialTruthPromoted = /officialTruth\s*[:=]\s*true|promotedToOfficial|coachInputPromotedToOfficialTruth|data-official-truth=["']true["']/iu.test(combined);
  const automaticDecisionCreated = /automaticDecision\s*[:=]\s*true|auto(?:matic)?DecisionCreated\s*[:=]\s*true|data-automatic-decision=["']true["']/iu.test(combined);
  const selectionDriven = /selectionDriven\s*[:=]\s*true/iu.test(combined) || hasPositiveSelectionInstruction(combined);
  const tacticalInstructionDriven = /tacticalInstructionDriven\s*[:=]\s*true|plan\s+tactique\s+a\s+appliquer|consigne\s+tactique\s+imposee|applyTacticalPlan/iu.test(combined);

  if (!productVisible) warningCodes.push("PRODUCT_PREVIEW_ACTIVATION_GUARDS_MISSING");
  if (!exportVisible) warningCodes.push("EXPORT_PREVIEW_ACTIVATION_GUARDS_MISSING");
  if (!usesFieldVisualReadiness8V) warningCodes.push("PRODUCT_FIELD_VISUAL_READINESS_8V_REGRESSED");
  if (!usesInputFieldContract8U) warningCodes.push("PRODUCT_INPUT_FIELD_CONTRACT_8U_REGRESSED");
  if (activationConditionCount < 20) warningCodes.push("ACTIVATION_CONDITION_COUNT_INVALID");
  if (blockingGuardCount !== 12) warningCodes.push("BLOCKING_GUARD_COUNT_INVALID");
  if (refusalStateCount !== 6) warningCodes.push("REFUSAL_STATE_COUNT_INVALID");
  if (!previewActivationStatusCorrect) warningCodes.push("PREVIEW_ACTIVATION_STATUS_UNEXPECTED");
  if (!nonPersistentPreviewModeDefined) warningCodes.push("PREVIEW_ACTIVATION_GUARDS_MISSING");
  if (!fieldVisualDistinctFromPreviewActivation) warningCodes.push("FIELD_VISUAL_CLAIMS_REAL_USE_READY");
  if (!readinessDistinctFromReviewGateStillVisible) warningCodes.push("WORKFLOW_READINESS_STATUS_MASKED");
  if (!export8VWorkflowLabelCorrected) warningCodes.push("EXPORT_8V_WORKFLOW_LABEL_STILL_8S");
  if (!export8SLabelStillSkeletonOnly) warningCodes.push("MICRO_WORDING_DEBT_8V_NOT_FIXED");
  if (nonPersistentPreviewModeActivated) warningCodes.push("PREVIEW_MODE_ACTIVATED");
  if (realInputActivated) warningCodes.push("REAL_INPUT_ACTIVATED");
  if (payloadCreated) warningCodes.push("PAYLOAD_CREATION_DETECTED");
  if (realPreviewGenerated) warningCodes.push("REAL_PREVIEW_GENERATION_DETECTED");
  if (submitCreated) warningCodes.push("SUBMIT_BUTTON_DETECTED");
  if (apiCreated) warningCodes.push("API_CALL_DETECTED");
  if (backendCreated) warningCodes.push("BACKEND_ACTION_DETECTED");
  if (storageCreated) warningCodes.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (memoryCreated) warningCodes.push("SEASON_MEMORY_CREATED");
  if (officialTruthPromoted) warningCodes.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (automaticDecisionCreated) warningCodes.push("AUTOMATIC_DECISION_DETECTED");
  if (selectionDriven) warningCodes.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionDriven) warningCodes.push("TACTICAL_PLAN_IMPOSITION_DETECTED");

  return {
    productVisible,
    exportVisible,
    usesFieldVisualReadiness8V,
    usesInputFieldContract8U,
    activationConditionCount,
    satisfiedActivationConditionCount,
    unsatisfiedActivationConditionCount,
    blockingGuardCount,
    refusalStateCount,
    previewActivationStatusCorrect,
    nonPersistentPreviewModeDefined,
    nonPersistentPreviewModeActivated,
    realInputActivated,
    payloadCreated,
    realPreviewGenerated,
    submitCreated,
    apiCreated,
    backendCreated,
    storageCreated,
    memoryCreated,
    officialTruthPromoted,
    automaticDecisionCreated,
    selectionDriven,
    tacticalInstructionDriven,
    microWordingDebt8VFixed,
    export8VWorkflowLabelCorrected,
    export8SLabelStillSkeletonOnly,
    fieldVisualDistinctFromPreviewActivation,
    readinessDistinctFromReviewGateStillVisible,
    warningCodes,
  };
}

export function auditManualReviewPreviewActivationExport8W(input: {
  readonly exportHtmlBefore8W: string;
  readonly exportHtmlAfter8W: string;
}): ManualReviewPreviewActivationExportAudit8W {
  const exportReadTimeSecondsBefore8W = readTimeSeconds(input.exportHtmlBefore8W);
  const exportReadTimeSecondsAfter8W = readTimeSeconds(input.exportHtmlAfter8W);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8W <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8W <= 800;
  const warningCodes: ManualReviewPreviewActivationGuardsWarningCode8W[] = [];
  const exportTitleMentions8W = input.exportHtmlAfter8W.includes("Rapport coach export compact 8W");
  const exportVisibleBadgeMentions8W = input.exportHtmlAfter8W.includes("Export compact 8W");
  const exportMainCurrentVersionVisible = input.exportHtmlAfter8W.includes('data-manual-review-preview-activation-guards-version="8W"');
  const exportMainIdStillCompressedExport8V = input.exportHtmlAfter8W.includes('id="compressed-export-8v"');
  const exportMainIdStillCompressedExport8U = input.exportHtmlAfter8W.includes('id="compressed-export-8u"');
  const exportMainIdStillCompressedExport8T = input.exportHtmlAfter8W.includes('id="compressed-export-8t"');
  const exportMainIdStillCompressedExport8S = input.exportHtmlAfter8W.includes('id="compressed-export-8s"');
  const exportMainIdStillCompressedExport8R = input.exportHtmlAfter8W.includes('id="compressed-export-8r"');
  const exportMainIdStillCompressedExport8Q = input.exportHtmlAfter8W.includes('id="compressed-export-8q"');
  const exportMainIdStillCompressedExport8P = input.exportHtmlAfter8W.includes('id="compressed-export-8p"');
  const exportMainIdStillCompressedExport8N = input.exportHtmlAfter8W.includes('id="compressed-export-8n"');
  const exportMainIdStillCompressedExport8I = input.exportHtmlAfter8W.includes('id="compressed-export-8i"');

  if (!exportUnder900Seconds) warningCodes.push("EXPORT_OVER_900");
  if (exportUnder900Seconds !== (exportReadTimeSecondsAfter8W <= 900)) warningCodes.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (exportUnder800Seconds !== (exportReadTimeSecondsAfter8W <= 800)) warningCodes.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportTitleMentions8W) warningCodes.push("EXPORT_TITLE_MISSING_8W");
  if (!exportVisibleBadgeMentions8W) warningCodes.push("EXPORT_BADGE_MISSING_8W");
  if (!exportMainCurrentVersionVisible) warningCodes.push("EXPORT_METADATA_8W_VISIBLE");
  if (exportMainIdStillCompressedExport8V) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8V");
  if (exportMainIdStillCompressedExport8U) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8U");
  if (exportMainIdStillCompressedExport8T) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8T");
  if (exportMainIdStillCompressedExport8S) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8S");
  if (exportMainIdStillCompressedExport8R) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8R");
  if (exportMainIdStillCompressedExport8Q) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8Q");
  if (exportMainIdStillCompressedExport8P) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8P");
  if (exportMainIdStillCompressedExport8N) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8N");
  if (exportMainIdStillCompressedExport8I) warningCodes.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");

  return {
    exportReadTimeSecondsBefore8W,
    exportReadTimeSecondsAfter8W,
    exportReadTimeDelta: exportReadTimeSecondsAfter8W - exportReadTimeSecondsBefore8W,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter8W <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter8W <= 800),
    exportTitleMentions8W,
    exportVisibleBadgeMentions8W,
    exportMainCurrentVersionVisible,
    exportMainIdStillCompressedExport8V,
    exportMainIdStillCompressedExport8U,
    exportMainIdStillCompressedExport8T,
    exportMainIdStillCompressedExport8S,
    exportMainIdStillCompressedExport8R,
    exportMainIdStillCompressedExport8Q,
    exportMainIdStillCompressedExport8P,
    exportMainIdStillCompressedExport8N,
    exportMainIdStillCompressedExport8I,
    exportPrintReady: input.exportHtmlAfter8W.includes("manual-review-preview-activation-guards-export-8w"),
    exportNoHorizontalOverflow: countMatches(input.exportHtmlAfter8W, /overflow-x:\s*scroll/giu) === 0,
    warningCodes,
  };
}
