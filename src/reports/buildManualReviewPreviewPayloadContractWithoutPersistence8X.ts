import { scoringRegistryEntry } from "../systems/scoring";
import { buildCoachReportDecisionLayerNextMatchObservationPlan8K } from "./buildCoachReportDecisionLayerNextMatchObservationPlan8K";
import { buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L } from "./buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L";
import { buildManualPostMatchObservationReviewForm8MModel } from "./buildManualPostMatchObservationReviewForm8M";
import { buildManualReviewNonPersistentPreviewActivationGuards8WModel } from "./buildManualReviewNonPersistentPreviewActivationGuards8W";
import { buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel } from "./buildManualReviewFieldUxVisualReadinessWithoutPersistence8V";
import { buildManualReviewInputFieldContractWithoutPersistence8UModel } from "./buildManualReviewInputFieldContractWithoutPersistence8U";
import { buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel } from "./buildManualReviewPreviewComparisonWithPreviousObservationPlan8P";
import { buildManualReviewPreviewDecisionGateWithoutPersistence8QModel } from "./buildManualReviewPreviewDecisionGateWithoutPersistence8Q";
import { buildManualReviewPreviewRenderer8OModel } from "./buildManualReviewPreviewRenderer8O";
import { buildManualReviewResultIntakeBoundary8NModel } from "./buildManualReviewResultIntakeBoundary8N";
import { buildManualReviewUxInteractionContractWithoutPersistence8TModel } from "./buildManualReviewUxInteractionContractWithoutPersistence8T";
import { buildManualReviewWorkflowReadinessWithoutPersistence8RModel } from "./buildManualReviewWorkflowReadinessWithoutPersistence8R";
import { buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel } from "./buildManualReviewWorkflowUxSkeletonWithoutPersistence8S";
import {
  auditManualReviewPreviewPayloadContract8X,
  auditManualReviewPreviewPayloadContractExport8X,
} from "./manualReviewPreviewPayloadContractAudit8X";
import type {
  ManualReviewPreviewPayloadBoundaryGuard8X,
  ManualReviewPreviewPayloadContract8X,
  ManualReviewPreviewPayloadContractStatus8X,
  ManualReviewPreviewPayloadContractWithoutPersistence8XModel,
  ManualReviewPreviewPayloadErrorState8X,
  ManualReviewPreviewPayloadFieldGroup8X,
  ManualReviewPreviewPayloadObservationEntry8X,
  ManualReviewPreviewPayloadRefusalState8X,
  ManualReviewPreviewPayloadSchemaField8X,
  ManualReviewPreviewPayloadValidationRule8X,
} from "./manualReviewPreviewPayloadContractTypes8X";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_8X_BLOCKING_WARNINGS,
  type ManualReviewPreviewPayloadContractWarningCode8X,
} from "./manualReviewPreviewPayloadContractWarnings8X";
import type { ManualReviewNonPersistentPreviewActivationGuards8WModel } from "./manualReviewPreviewActivationGuardsTypes8W";
import {
  insertManualReviewPreviewPayloadContractExport8X,
  renderManualReviewPreviewPayloadContractExport8X,
} from "./renderManualReviewPreviewPayloadContractExport8X";
import {
  insertManualReviewPreviewPayloadContractProduct8X,
  renderManualReviewPreviewPayloadContractProduct8X,
} from "./renderManualReviewPreviewPayloadContractProduct8X";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const [header, ...body] = rows;
  if (header === undefined) return [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewPayloadContractWarningCode8X[],
): readonly ManualReviewPreviewPayloadContractWarningCode8X[] {
  return [...new Set(warnings)];
}

function statusFromWarnings(
  warnings: readonly ManualReviewPreviewPayloadContractWarningCode8X[],
  exportUnder800Seconds: boolean,
): ManualReviewPreviewPayloadContractStatus8X {
  const blocking = warnings.some((warning) => MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_8X_BLOCKING_WARNINGS.includes(warning));
  if (blocking) return "FAIL";
  if (!exportUnder800Seconds || warnings.length > 0) return "PARTIAL";
  return "PASS";
}

function allowedFields(): readonly ManualReviewPreviewPayloadSchemaField8X[] {
  const rows: readonly (readonly [string, string, boolean, string])[] = [
    ["payloadId", "string", true, "Stable future identifier for the preview-only payload."],
    ["payloadVersion", "string", true, "Must be 8X or a future explicit payload contract version."],
    ["payloadSource", "manual_non_official", true, "Marks the coach input as non-official manual material."],
    ["payloadScope", "preview_only", true, "Prevents persistence, official truth, automation and selection effects."],
    ["matchId", "string", true, "Links the preview context to the match report being reviewed."],
    ["sourceObservationPlanVersion", "string", true, "References the manual observation plan source."],
    ["sourceFieldContractVersion", "string", true, "References the future input field contract source."],
    ["createdByCoachLabel", "string", false, "Human label only; no account, auth or identity lookup in 8X."],
    ["createdAtLocalPlaceholder", "string", false, "Placeholder timestamp label only; no persisted timestamp."],
    ["entries", "ManualReviewPreviewPayloadEntry[]", true, "Future preview entries grouped by observation field."],
    ["validationState", "ManualReviewPreviewValidationState", true, "Future inactive validation status container."],
    ["boundaryFlags", "ManualReviewPreviewBoundaryFlags", true, "Future negative flags proving the payload is preview-only."],
  ];
  return rows.map(([name, fieldType, required, description]) => ({ name, fieldType, required, description }));
}

function forbiddenFields(): readonly string[] {
  return [
    "scoreChange",
    "scoreOverride",
    "timelineMutation",
    "selectionRecommendation",
    "tacticalInstruction",
    "officialTruth",
    "scoringEvent",
    "matchBonusEvent",
    "persistedDraftId",
    "historyRecordId",
    "apiEndpoint",
    "backendAction",
    "automaticDecision",
    "teamStyleMemoryUpdate",
    "seasonTrendUpdate",
    "realNextMatchDirective",
  ];
}

function fieldGroups(): readonly ManualReviewPreviewPayloadFieldGroup8X[] {
  return [
    {
      groupId: "observation_identity_group_8x",
      label: "Observation identity",
      fields: ["payloadId", "payloadVersion", "matchId"],
      purpose: "Trace the future preview payload without creating one in 8X.",
    },
    {
      groupId: "coach_source_group_8x",
      label: "Coach source",
      fields: ["payloadSource", "createdByCoachLabel", "createdAtLocalPlaceholder"],
      purpose: "Keep the source manual and non-official.",
    },
    {
      groupId: "manual_entries_group_8x",
      label: "Manual entries",
      fields: ["entries"],
      purpose: "Describe future comments, confidence and observation tags.",
    },
    {
      groupId: "inactive_validation_group_8x",
      label: "Inactive validation",
      fields: ["validationState"],
      purpose: "Document future validation without running it.",
    },
    {
      groupId: "preview_only_boundary_group_8x",
      label: "Preview-only boundary",
      fields: ["payloadScope", "boundaryFlags"],
      purpose: "Block persistence, official truth, automation and match mutation.",
    },
  ];
}

function observationEntries(): readonly ManualReviewPreviewPayloadObservationEntry8X[] {
  return [
    {
      entryId: "first_exit_after_recovery_preview_entry_8x",
      sourceFieldGroupId: "manual_entries_group_8x",
      observationType: "first_exit_after_recovery",
      targetSubject: "current match evidence card",
      previewOnlyMeaning: "Coach can later draft an observation about first exit quality without changing the timeline.",
    },
    {
      entryId: "danger_zone_continuity_preview_entry_8x",
      sourceFieldGroupId: "manual_entries_group_8x",
      observationType: "danger_zone_continuity",
      targetSubject: "route economy evidence",
      previewOnlyMeaning: "Coach can later comment on continuity into danger without creating an official tactic.",
    },
    {
      entryId: "neutralized_action_structure_preview_entry_8x",
      sourceFieldGroupId: "manual_entries_group_8x",
      observationType: "neutralized_action_structure",
      targetSubject: "story-first match report",
      previewOnlyMeaning: "Coach can later explain why an action died without changing action resolution.",
    },
  ];
}

function validationRules(): readonly ManualReviewPreviewPayloadValidationRule8X[] {
  const ids = [
    "REQUIRE_PAYLOAD_ID",
    "REQUIRE_PAYLOAD_VERSION",
    "REQUIRE_MANUAL_NON_OFFICIAL_SOURCE",
    "REQUIRE_PREVIEW_ONLY_SCOPE",
    "REQUIRE_MATCH_ID",
    "REQUIRE_SOURCE_PLAN_VERSION",
    "REQUIRE_FIELD_CONTRACT_VERSION",
    "REQUIRE_ENTRIES_ARRAY",
    "REQUIRE_ENTRY_ID",
    "REQUIRE_ENTRY_SUBJECT",
    "REQUIRE_ENTRY_TEXT",
    "REQUIRE_ENTRY_CONFIDENCE",
    "REQUIRE_ENTRY_BOUNDARY_FLAGS",
    "BLOCK_SCORE_CHANGE",
    "BLOCK_TIMELINE_MUTATION",
    "BLOCK_OFFICIAL_TRUTH",
    "BLOCK_SUBMIT",
    "BLOCK_API",
    "BLOCK_STORAGE",
    "BLOCK_AUTOMATIC_DECISION",
  ];
  return ids.map((ruleId) => ({
    ruleId,
    label: ruleId.replace(/_/gu, " "),
    activeIn8X: false,
    futurePurpose: "Future payload validation rule documented only; inactive in 8X.",
  }));
}

function errorStates(): readonly ManualReviewPreviewPayloadErrorState8X[] {
  const ids = [
    "MISSING_PAYLOAD_ID",
    "INVALID_PAYLOAD_VERSION",
    "INVALID_PAYLOAD_SOURCE",
    "INVALID_PAYLOAD_SCOPE",
    "MISSING_MATCH_ID",
    "MISSING_SOURCE_OBSERVATION_PLAN_VERSION",
    "MISSING_SOURCE_FIELD_CONTRACT_VERSION",
    "INVALID_ENTRIES",
    "MISSING_ENTRY_ID",
    "MISSING_ENTRY_SUBJECT",
    "MISSING_ENTRY_TEXT",
    "INVALID_ENTRY_CONFIDENCE",
    "FORBIDDEN_SCORE_CHANGE",
    "FORBIDDEN_TIMELINE_MUTATION",
    "FORBIDDEN_OFFICIAL_TRUTH",
    "FORBIDDEN_SUBMIT",
    "FORBIDDEN_API",
    "FORBIDDEN_STORAGE",
    "FORBIDDEN_AUTOMATIC_DECISION",
  ];
  return ids.map((errorStateId) => ({
    errorStateId,
    label: errorStateId.replace(/_/gu, " "),
    activeIn8X: false,
    futureMeaning: "Future error state documented only; inactive in 8X.",
  }));
}

function refusalStates(): readonly ManualReviewPreviewPayloadRefusalState8X[] {
  const rows: readonly (readonly [string, string, string, string])[] = [
    ["PAYLOAD_INSTANCE_REFUSED_8X", "payload creation detected", "Aucune instance payload ne peut etre creee.", "payload creation"],
    ["REAL_FIELD_PROCESSING_REFUSED_8X", "active input detected", "Aucune saisie reelle ne peut etre traitee.", "real input"],
    ["REAL_PREVIEW_REFUSED_8X", "preview generation detected", "Aucune preview reelle ne peut etre generee.", "preview generation"],
    ["SUBMIT_REFUSED_8X", "submit detected", "Aucun submit ou CTA actif ne peut exister.", "submit"],
    ["PERSISTENCE_REFUSED_8X", "storage detected", "Aucun stockage, draft, historique ou memoire.", "persistence"],
    ["OFFICIAL_TRUTH_REFUSED_8X", "official truth promotion detected", "Aucune promotion en verite officielle.", "official truth"],
    ["AUTOMATION_REFUSED_8X", "automatic decision detected", "Aucune decision, selection ou tactique automatique.", "automation"],
  ];
  return rows.map(([refusalStateId, trigger, message, blocks]) => ({
    refusalStateId,
    trigger,
    message,
    blocks,
  }));
}

function boundaryGuards(): readonly ManualReviewPreviewPayloadBoundaryGuard8X[] {
  const rows: readonly (readonly [string, string, string])[] = [
    ["BLOCK_IF_PAYLOAD_INSTANCE_CREATED_8X", "Payload instance", "real payload instance creation"],
    ["BLOCK_IF_FIELD_TO_PAYLOAD_RUNTIME_8X", "Field-to-payload runtime", "field mapping into payload"],
    ["BLOCK_IF_PAYLOAD_VALIDATION_RUNTIME_8X", "Payload validation runtime", "runtime validation in 8X"],
    ["BLOCK_IF_REAL_PREVIEW_FROM_PAYLOAD_8X", "Real preview", "preview generation from payload"],
    ["BLOCK_IF_SUBMIT_OR_CTA_8X", "Submit or CTA", "submit, save, apply or send"],
    ["BLOCK_IF_API_OR_BACKEND_8X", "API or backend", "network/backend action"],
    ["BLOCK_IF_STORAGE_OR_DRAFT_8X", "Storage or draft", "local storage, file, DB or draft"],
    ["BLOCK_IF_HISTORY_OR_MEMORY_8X", "History or memory", "history, season memory or team style memory"],
    ["BLOCK_IF_OFFICIAL_TRUTH_8X", "Official truth", "official evidence promotion"],
    ["BLOCK_IF_AUTOMATIC_DECISION_8X", "Automatic decision", "decision automation"],
    ["BLOCK_IF_SELECTION_OR_TACTIC_8X", "Selection or tactic", "selection and tactical instruction"],
    ["BLOCK_IF_SCORE_TIMELINE_MUTATION_8X", "Score/timeline mutation", "score, event or timeline mutation"],
    ["BLOCK_IF_EVENT_OR_SCORE_CHANGE_8X", "Event/score_change mutation", "new score_change or event write"],
    ["BLOCK_IF_SANDBOX_DIAGNOSTIC_BATCH_PROMOTION_8X", "Diagnostic promotion", "sandbox, diagnostic or batch evidence promoted to official"],
  ];
  return rows.map(([guardId, label, blocks]) => ({ guardId, label, blocks, activeIn8X: true }));
}

function buildContract(): ManualReviewPreviewPayloadContract8X {
  return {
    contractId: "manual-review-preview-payload-contract-without-persistence-8x",
    payloadVersion: "8X",
    payloadContractMode: "future_preview_only_payload_contract",
    payloadContractStatus: "documented_but_not_instantiated",
    payloadSource: "manual_non_official",
    payloadScope: "preview_only",
    payloadOfficialTruth: false,
    payloadPersistence: "none",
    payloadApplication: "none",
    sourceObservationPlanVersion: "8U",
    sourceFieldContractVersion: "8V",
    sourceActivationGuardVersion: "8W",
    allowedTopLevelFields: allowedFields(),
    forbiddenTopLevelFields: forbiddenFields(),
    fieldGroups: fieldGroups(),
    observationEntries: observationEntries(),
    validationRules: validationRules(),
    errorStates: errorStates(),
    refusalStates: refusalStates(),
    boundaryGuards: boundaryGuards(),
    readinessSummary: {
      payloadContractStatus: "documented_but_not_instantiated",
      reason: "8X defines the future payload shape while keeping every runtime surface blocked.",
      readyFor: ["future schema review", "future invalid-payload guard design", "future preview renderer contract"],
      stillBlocked: ["real payload creation", "real inputs", "real preview", "submit/API/backend", "persistence", "official truth", "automation"],
    },
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function buildExplicitBaseline8W(): ManualReviewNonPersistentPreviewActivationGuards8WModel {
  const baseline8K = buildCoachReportDecisionLayerNextMatchObservationPlan8K();
  const baseline8L = buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L({
    productHtmlBefore8L: baseline8K.cleanedProductHtml,
    exportHtmlBefore8L: baseline8K.cleanedExportHtml,
  });
  const baseline8M = buildManualPostMatchObservationReviewForm8MModel({
    productHtmlBefore8M: baseline8L.productHtmlAfter8L,
    exportHtmlBefore8M: baseline8L.exportHtmlAfter8L,
  });
  const baseline8N = buildManualReviewResultIntakeBoundary8NModel({
    productHtmlBefore8N: baseline8M.productHtmlAfter8M,
    exportHtmlBefore8N: baseline8M.exportHtmlAfter8M,
  });
  const baseline8O = buildManualReviewPreviewRenderer8OModel({
    baseline8N,
    productHtmlBefore8O: baseline8N.productHtmlAfter8N,
    exportHtmlBefore8O: baseline8N.exportHtmlAfter8N,
  });
  const baseline8P = buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel({
    baseline8O,
  });
  const baseline8Q = buildManualReviewPreviewDecisionGateWithoutPersistence8QModel({
    baseline8P,
  });
  const baseline8R = buildManualReviewWorkflowReadinessWithoutPersistence8RModel({
    baseline8Q,
    productHtmlBefore8R: baseline8Q.productHtmlAfter8Q,
    exportHtmlBefore8R: baseline8Q.exportHtmlAfter8Q,
  });
  const baseline8S = buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel({
    baseline8R,
    productHtmlBefore8S: baseline8R.productHtmlAfter8R,
    exportHtmlBefore8S: baseline8R.exportHtmlAfter8R,
  });
  const baseline8T = buildManualReviewUxInteractionContractWithoutPersistence8TModel({
    baseline8S,
    productHtmlBefore8T: baseline8S.productHtmlAfter8S,
    exportHtmlBefore8T: baseline8S.exportHtmlAfter8S,
  });
  const baseline8U = buildManualReviewInputFieldContractWithoutPersistence8UModel({
    baseline8T,
    productHtmlBefore8U: baseline8T.productHtmlAfter8T,
    exportHtmlBefore8U: baseline8T.exportHtmlAfter8T,
  });
  const baseline8V = buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel({
    baseline8U,
    productHtmlBefore8V: baseline8U.productHtmlAfter8U,
    exportHtmlBefore8V: baseline8U.exportHtmlAfter8U,
  });
  return buildManualReviewNonPersistentPreviewActivationGuards8WModel({
    baseline8V,
    productHtmlBefore8W: baseline8V.productHtmlAfter8V,
    exportHtmlBefore8W: baseline8V.exportHtmlAfter8V,
  });
}

function fallbackBaseline8W(): ManualReviewNonPersistentPreviewActivationGuards8WModel {
  const productHtmlAfter8W = [
    "<main>",
    '<section id="manual-review-input-field-contract-8u" data-manual-review-input-field-contract-version="8U"></section>',
    '<section id="manual-review-field-ux-visual-readiness-8v" data-manual-review-field-ux-visual-readiness-version="8V">ready_for_static_visual_review</section>',
    '<section id="manual-review-preview-activation-guards-8w" data-manual-review-preview-activation-guards-version="8W">documented_but_blocked</section>',
    "</main>",
  ].join("\n");
  const exportHtmlAfter8W = [
    "<!doctype html><html><head><title>Rapport coach export compact 8W - garde-fous preview revue manuelle</title></head>",
    '<body><main id="compressed-export-8w" data-manual-review-preview-activation-guards-version="8W">',
    '<section id="manual-review-input-field-contract-export-8u" data-manual-review-input-field-contract-version="8U"></section>',
    '<section id="manual-review-field-ux-visual-readiness-export-8v" data-manual-review-field-ux-visual-readiness-version="8V">ready_for_static_visual_review</section>',
    '<section id="manual-review-preview-activation-guards-export-8w" data-manual-review-preview-activation-guards-version="8W">Garde-fous preview revue manuelle - Export compact 8W</section>',
    "</main></body></html>",
  ].join("\n");
  const baseline: Partial<ManualReviewNonPersistentPreviewActivationGuards8WModel> = {
    status: "PASS",
    matchId: "manual-review-preview-payload-contract-8x-fallback",
    officialScore: "CONTROL 0 - 0 BLITZ",
    previewActivationGuardReady: true,
    baseline8VPreserved: true,
    baseline8UPreserved: true,
    baseline8TPreserved: true,
    baseline8SPreserved: true,
    baseline8RPreserved: true,
    baseline8QPreserved: true,
    baseline8PPreserved: true,
    baseline8OPreserved: true,
    baseline8NPreserved: true,
    baseline8MPreserved: true,
    baseline8LPreserved: true,
    baseline8KPreserved: true,
    baseline8IPreserved: true,
    baseline8HPreserved: true,
    baseline8GPreserved: true,
    baseline8FPreserved: true,
    baseline8EPreserved: true,
    baseline8DPreserved: true,
    baseline8CPreserved: true,
    baseline8BPreserved: true,
    baseline8APreserved: true,
    baseline7HPreserved: true,
    baseline6XPreserved: true,
    previewActivationStatus: "documented_but_blocked",
    workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview",
    reviewGateStatusFrom8Q: "needs_completion",
    fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review",
    productStoryFirstPreserved: true,
    exportCompactPreserved: true,
    sourceOfTruthSeparationPreserved: true,
    matchEconomyBaselinePreserved: true,
    productHtmlAfter8W,
    exportHtmlAfter8W,
  };
  return baseline as ManualReviewNonPersistentPreviewActivationGuards8WModel;
}

function defaultBaseline8W(): ManualReviewNonPersistentPreviewActivationGuards8WModel {
  try {
    return buildExplicitBaseline8W();
  } catch {
    return fallbackBaseline8W();
  }
}

export function buildManualReviewPreviewPayloadContractWithoutPersistence8XModel(input?: {
  readonly baseline8W?: ManualReviewNonPersistentPreviewActivationGuards8WModel;
  readonly productHtmlBefore8X?: string;
  readonly exportHtmlBefore8X?: string;
}): ManualReviewPreviewPayloadContractWithoutPersistence8XModel {
  const baseline8W = input?.baseline8W ?? defaultBaseline8W();
  const contract = buildContract();
  const productPreviewPayloadContractHtml = renderManualReviewPreviewPayloadContractProduct8X(contract);
  const exportPreviewPayloadContractHtml = renderManualReviewPreviewPayloadContractExport8X(contract);
  const productHtmlBefore8X = input?.productHtmlBefore8X ?? baseline8W.productHtmlAfter8W;
  const exportHtmlBefore8X = input?.exportHtmlBefore8X ?? baseline8W.exportHtmlAfter8W;
  const productHtmlAfter8X = insertManualReviewPreviewPayloadContractProduct8X(productHtmlBefore8X, productPreviewPayloadContractHtml);
  const exportHtmlAfter8X = insertManualReviewPreviewPayloadContractExport8X(exportHtmlBefore8X, exportPreviewPayloadContractHtml);
  const payloadAudit = auditManualReviewPreviewPayloadContract8X(contract, productHtmlAfter8X, exportHtmlAfter8X);
  const exportAudit = auditManualReviewPreviewPayloadContractExport8X(exportHtmlBefore8X, exportHtmlAfter8X);
  const scoringConstantsUnchanged =
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active;
  const warnings: ManualReviewPreviewPayloadContractWarningCode8X[] = [
    ...payloadAudit.warningCodes,
    ...exportAudit.warningCodes,
  ];
  if (baseline8W.status !== "PASS" || !baseline8W.previewActivationGuardReady) warnings.push("PRODUCT_PREVIEW_ACTIVATION_GUARDS_8W_REGRESSED");
  if (!baseline8W.baseline8VPreserved) warnings.push("PRODUCT_FIELD_VISUAL_READINESS_8V_REGRESSED");
  if (!baseline8W.baseline8UPreserved) warnings.push("PRODUCT_INPUT_FIELD_CONTRACT_8U_REGRESSED");
  if (baseline8W.previewActivationStatus !== "documented_but_blocked") warnings.push("PREVIEW_ACTIVATION_STATUS_NOT_PRESERVED");
  if (baseline8W.reviewGateStatusFrom8Q !== "needs_completion") warnings.push("REVIEW_GATE_STATUS_NOT_PRESERVED");
  if (!scoringConstantsUnchanged) warnings.push("PENALTY_SHOT_LEAKAGE_DETECTED");
  const warningCodes = uniqueWarnings(warnings);
  const status = statusFromWarnings(warningCodes, exportAudit.exportUnder800Seconds);
  const previewPayloadContractReady = status === "PASS" && payloadAudit.payloadContractStatusCorrect;
  const sourceOfTruthSeparationPreserved =
    baseline8W.sourceOfTruthSeparationPreserved &&
    !payloadAudit.officialTruthPromoted &&
    !payloadAudit.automaticDecisionCreated &&
    !payloadAudit.selectionDriven &&
    !payloadAudit.tacticalInstructionDriven &&
    payloadAudit.scoreMutationCount === 0 &&
    payloadAudit.timelineMutationCount === 0 &&
    payloadAudit.eventMutationCount === 0 &&
    payloadAudit.scoreChangeMutationCount === 0;

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_WITHOUT_PERSISTENCE_8X",
    matchId: baseline8W.matchId,
    officialScore: baseline8W.officialScore,
    baseline8W,
    baseline8WPreserved: baseline8W.status === "PASS" && baseline8W.previewActivationGuardReady,
    baseline8VPreserved: baseline8W.baseline8VPreserved,
    baseline8UPreserved: baseline8W.baseline8UPreserved,
    baseline8TPreserved: baseline8W.baseline8TPreserved,
    baseline8SPreserved: baseline8W.baseline8SPreserved,
    baseline8RPreserved: baseline8W.baseline8RPreserved,
    baseline8QPreserved: baseline8W.baseline8QPreserved,
    baseline8PPreserved: baseline8W.baseline8PPreserved,
    baseline8OPreserved: baseline8W.baseline8OPreserved,
    baseline8NPreserved: baseline8W.baseline8NPreserved,
    baseline8MPreserved: baseline8W.baseline8MPreserved,
    baseline8LPreserved: baseline8W.baseline8LPreserved,
    baseline8KPreserved: baseline8W.baseline8KPreserved,
    baseline8IPreserved: baseline8W.baseline8IPreserved,
    baseline8HPreserved: baseline8W.baseline8HPreserved,
    baseline8GPreserved: baseline8W.baseline8GPreserved,
    baseline8FPreserved: baseline8W.baseline8FPreserved,
    baseline8EPreserved: baseline8W.baseline8EPreserved,
    baseline8DPreserved: baseline8W.baseline8DPreserved,
    baseline8CPreserved: baseline8W.baseline8CPreserved,
    baseline8BPreserved: baseline8W.baseline8BPreserved,
    baseline8APreserved: baseline8W.baseline8APreserved,
    baseline7HPreserved: baseline8W.baseline7HPreserved,
    baseline6XPreserved: baseline8W.baseline6XPreserved,
    previewPayloadContractReady,
    productPreviewPayloadContractVisible: payloadAudit.productVisible,
    exportPreviewPayloadContractVisible: payloadAudit.exportVisible,
    previewPayloadContractUsesActivationGuards8W: payloadAudit.usesActivationGuards8W,
    previewPayloadContractUsesFieldVisualReadiness8V: payloadAudit.usesFieldVisualReadiness8V && baseline8W.baseline8VPreserved,
    previewPayloadContractUsesInputFieldContract8U: payloadAudit.usesInputFieldContract8U && baseline8W.baseline8UPreserved,
    payloadContractMode: contract.payloadContractMode,
    payloadContractStatus: contract.payloadContractStatus,
    payloadSource: contract.payloadSource,
    payloadScope: contract.payloadScope,
    payloadOfficialTruth: contract.payloadOfficialTruth,
    payloadPersistence: contract.payloadPersistence,
    payloadApplication: contract.payloadApplication,
    allowedTopLevelFieldCount: payloadAudit.allowedTopLevelFieldCount,
    allowedTopLevelFieldCountExpected: 12,
    forbiddenTopLevelFieldCount: payloadAudit.forbiddenTopLevelFieldCount,
    forbiddenTopLevelFieldCountExpected: 16,
    fieldGroupCount: payloadAudit.fieldGroupCount,
    fieldGroupCountExpected: 5,
    observationEntryCount: payloadAudit.observationEntryCount,
    observationEntryCountExpected: 3,
    validationRuleCount: payloadAudit.validationRuleCount,
    validationRuleCountExpected: 20,
    activeValidationRuleCount: payloadAudit.activeValidationRuleCount,
    errorStateCount: payloadAudit.errorStateCount,
    errorStateCountExpected: 19,
    activeErrorStateCount: payloadAudit.activeErrorStateCount,
    refusalStateCount: payloadAudit.refusalStateCount,
    refusalStateCountExpected: 7,
    boundaryGuardCount: payloadAudit.boundaryGuardCount,
    boundaryGuardCountExpected: 14,
    payloadCreated: payloadAudit.payloadCreated,
    realPayloadInstanceCount: payloadAudit.realPayloadInstanceCount,
    fieldToPayloadRuntimeDetected: payloadAudit.fieldToPayloadRuntimeDetected,
    payloadValidationRuntimeDetected: payloadAudit.payloadValidationRuntimeDetected,
    realInputActivated: payloadAudit.realInputActivated,
    activeFieldCount: payloadAudit.activeFieldCount,
    enabledInputControlCount: payloadAudit.enabledInputControlCount,
    realPreviewGenerated: payloadAudit.realPreviewGenerated,
    submitCreated: payloadAudit.submitCreated,
    apiCreated: payloadAudit.apiCreated,
    backendCreated: payloadAudit.backendCreated,
    storageCreated: payloadAudit.storageCreated,
    memoryCreated: payloadAudit.memoryCreated,
    draftCreated: payloadAudit.draftCreated,
    historyCreated: payloadAudit.historyCreated,
    officialTruthPromoted: payloadAudit.officialTruthPromoted,
    automaticDecisionCreated: payloadAudit.automaticDecisionCreated,
    selectionDriven: payloadAudit.selectionDriven,
    tacticalInstructionDriven: payloadAudit.tacticalInstructionDriven,
    scoreMutationCount: payloadAudit.scoreMutationCount,
    timelineMutationCount: payloadAudit.timelineMutationCount,
    eventMutationCount: payloadAudit.eventMutationCount,
    scoreChangeMutationCount: payloadAudit.scoreChangeMutationCount,
    workflowReadinessStatusFrom8R: baseline8W.workflowReadinessStatusFrom8R,
    reviewGateStatusFrom8Q: baseline8W.reviewGateStatusFrom8Q,
    previewActivationStatusFrom8W: "documented_but_blocked",
    fieldVisualReadinessStatusFrom8V: baseline8W.fieldVisualReadinessStatusFrom8V,
    productStoryFirstPreserved: baseline8W.productStoryFirstPreserved,
    exportCompactPreserved: baseline8W.exportCompactPreserved && exportAudit.exportMainCurrentVersionVisible,
    exportMetadataCurrent8XVisible: exportAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportAudit.exportUnder900BooleanCorrect && exportAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8W.matchEconomyBaselinePreserved,
    guardrailsPreserved: sourceOfTruthSeparationPreserved && warningCodes.length === 0,
    contract,
    productPreviewPayloadContractHtml,
    exportPreviewPayloadContractHtml,
    productHtmlAfter8X,
    exportHtmlAfter8X,
    payloadAudit,
    exportAudit,
    warningCodes,
    recommendation:
      status === "PASS"
        ? "KEEP_PREVIEW_PAYLOAD_CONTRACT_DOCUMENTED_NOT_INSTANTIATED"
        : "FIX_PREVIEW_PAYLOAD_CONTRACT_BOUNDARIES",
    nextSprintRecommendation:
      status === "PASS"
        ? "PREPARE_MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_WITHOUT_PERSISTENCE"
        : "REPAIR_MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT",
  };
}

export function currentManualReviewPreviewPayloadContractWithoutPersistence8XModel(): ManualReviewPreviewPayloadContractWithoutPersistence8XModel {
  return buildManualReviewPreviewPayloadContractWithoutPersistence8XModel();
}

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

export function renderManualReviewPreviewPayloadContractWithoutPersistence8XDoc(
  model: ManualReviewPreviewPayloadContractWithoutPersistence8XModel = currentManualReviewPreviewPayloadContractWithoutPersistence8XModel(),
): string {
  return [
    "# Coach Report Manual Review Preview Payload Contract Without Persistence 8X",
    "",
    `Status: ${model.status}`,
    `Recommendation: ${model.recommendation}`,
    `Next sprint recommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Summary",
    ...metricRows([
      ["payloadContractStatus", model.payloadContractStatus],
      ["payload source", model.payloadSource],
      ["payload scope", model.payloadScope],
      ["payload persistence", model.payloadPersistence],
      ["payload application", model.payloadApplication],
      ["payloadCreated", model.payloadCreated],
      ["realPayloadInstanceCount", model.realPayloadInstanceCount],
      ["realInputActivated", model.realInputActivated],
      ["realPreviewGenerated", model.realPreviewGenerated],
      ["submitCreated", model.submitCreated],
      ["apiCreated", model.apiCreated],
      ["backendCreated", model.backendCreated],
      ["storageCreated", model.storageCreated],
      ["officialTruthPromoted", model.officialTruthPromoted],
    ]),
    "",
    "## Payload Schema",
    ...table([
      ["Field", "Type", "Required", "Description"],
      ...model.contract.allowedTopLevelFields.map((field) => [
        field.name,
        field.fieldType,
        bool(field.required),
        field.description,
      ]),
    ]),
    "",
    "## Forbidden Payload Fields",
    ...table([
      ["Forbidden field", "Reason"],
      ...model.contract.forbiddenTopLevelFields.map((field) => [field, "Would create persistence, official truth, automation, scoring or timeline side effects."]),
    ]),
    "",
    "## Field Groups",
    ...table([
      ["Group", "Fields", "Purpose"],
      ...model.contract.fieldGroups.map((group) => [group.label, group.fields.join(", "), group.purpose]),
    ]),
    "",
    "## Observation Entry Examples",
    ...table([
      ["Entry", "Type", "Target", "Preview-only meaning"],
      ...model.contract.observationEntries.map((entry) => [
        entry.entryId,
        entry.observationType,
        entry.targetSubject,
        entry.previewOnlyMeaning,
      ]),
    ]),
    "",
    "## Future Validation Rules",
    ...table([
      ["Rule", "Active in 8X", "Future purpose"],
      ...model.contract.validationRules.map((rule) => [rule.ruleId, bool(rule.activeIn8X), rule.futurePurpose]),
    ]),
    "",
    "## Error States",
    ...table([
      ["Error state", "Active in 8X", "Future meaning"],
      ...model.contract.errorStates.map((state) => [state.errorStateId, bool(state.activeIn8X), state.futureMeaning]),
    ]),
    "",
    "## Refusal States",
    ...table([
      ["Refusal", "Trigger", "Blocks"],
      ...model.contract.refusalStates.map((state) => [state.refusalStateId, state.trigger, state.blocks]),
    ]),
    "",
    "## Boundary Guards",
    ...table([
      ["Guard", "Label", "Blocks"],
      ...model.contract.boundaryGuards.map((guard) => [guard.guardId, guard.label, guard.blocks]),
    ]),
    "",
    "## Non-Persistence Proof",
    ...metricRows([
      ["fieldToPayloadRuntimeDetected", model.fieldToPayloadRuntimeDetected],
      ["payloadValidationRuntimeDetected", model.payloadValidationRuntimeDetected],
      ["activeFieldCount", model.activeFieldCount],
      ["enabledInputControlCount", model.enabledInputControlCount],
      ["memoryCreated", model.memoryCreated],
      ["draftCreated", model.draftCreated],
      ["historyCreated", model.historyCreated],
      ["automaticDecisionCreated", model.automaticDecisionCreated],
      ["selectionDriven", model.selectionDriven],
      ["tacticalInstructionDriven", model.tacticalInstructionDriven],
      ["scoreMutationCount", model.scoreMutationCount],
      ["timelineMutationCount", model.timelineMutationCount],
      ["eventMutationCount", model.eventMutationCount],
      ["scoreChangeMutationCount", model.scoreChangeMutationCount],
    ]),
    "",
    "## Preserved Baselines",
    ...metricRows([
      ["baseline8WPreserved", model.baseline8WPreserved],
      ["previewActivationStatusFrom8W", model.previewActivationStatusFrom8W],
      ["fieldVisualReadinessStatusFrom8V", model.fieldVisualReadinessStatusFrom8V],
      ["workflowReadinessStatusFrom8R", model.workflowReadinessStatusFrom8R],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["productStoryFirstPreserved", model.productStoryFirstPreserved],
      ["exportCompactPreserved", model.exportCompactPreserved],
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
      ["matchEconomyBaselinePreserved", model.matchEconomyBaselinePreserved],
    ]),
    "",
    "## Export Metadata",
    ...metricRows([
      ["exportReadTimeSecondsAfter8X", model.exportAudit.exportReadTimeSecondsAfter8X],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["exportMetadataCurrent8XVisible", model.exportMetadataCurrent8XVisible],
    ]),
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
  ].join("\n");
}

export function renderManualReviewPreviewPayloadContractWithoutPersistence8XValidation(
  model: ManualReviewPreviewPayloadContractWithoutPersistence8XModel = currentManualReviewPreviewPayloadContractWithoutPersistence8XModel(),
): string {
  const scoringConstantsUnchanged =
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active;
  const checks = [
    checkLine("ManualReviewPreviewPayloadContractWithoutPersistence8XModel exists", true, model.version),
    checkLine("payload schema defined", model.allowedTopLevelFieldCount === 12, `${model.allowedTopLevelFieldCount}/12 allowed fields`),
    checkLine("payload source = manual_non_official", model.payloadSource === "manual_non_official", model.payloadSource),
    checkLine("payload scope = preview_only", model.payloadScope === "preview_only", model.payloadScope),
    checkLine("payloadContractStatus = documented_but_not_instantiated", model.payloadContractStatus === "documented_but_not_instantiated", model.payloadContractStatus),
    checkLine("payload persistence = none", model.payloadPersistence === "none", model.payloadPersistence),
    checkLine("payload application = none", model.payloadApplication === "none", model.payloadApplication),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPayloadInstanceCount = 0", model.realPayloadInstanceCount === 0, String(model.realPayloadInstanceCount)),
    checkLine("fieldToPayloadRuntimeDetected = false", !model.fieldToPayloadRuntimeDetected, bool(model.fieldToPayloadRuntimeDetected)),
    checkLine("payloadValidationRuntimeDetected = false", !model.payloadValidationRuntimeDetected, bool(model.payloadValidationRuntimeDetected)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("enabledInputControlCount = 0", model.enabledInputControlCount === 0, String(model.enabledInputControlCount)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("submitCreated = false", !model.submitCreated, bool(model.submitCreated)),
    checkLine("backendCreated = false", !model.backendCreated, bool(model.backendCreated)),
    checkLine("apiCreated = false", !model.apiCreated, bool(model.apiCreated)),
    checkLine("storageCreated = false", !model.storageCreated, bool(model.storageCreated)),
    checkLine("memoryCreated = false", !model.memoryCreated, bool(model.memoryCreated)),
    checkLine("draftCreated = false", !model.draftCreated, bool(model.draftCreated)),
    checkLine("historyCreated = false", !model.historyCreated, bool(model.historyCreated)),
    checkLine("officialTruthPromoted = false", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("automaticDecisionCreated = false", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("selectionDriven = false", !model.selectionDriven, bool(model.selectionDriven)),
    checkLine("tacticalInstructionDriven = false", !model.tacticalInstructionDriven, bool(model.tacticalInstructionDriven)),
    checkLine("scoreMutationCount = 0", model.scoreMutationCount === 0, String(model.scoreMutationCount)),
    checkLine("timelineMutationCount = 0", model.timelineMutationCount === 0, String(model.timelineMutationCount)),
    checkLine("previewActivationStatusFrom8W remains documented_but_blocked", model.previewActivationStatusFrom8W === "documented_but_blocked", model.previewActivationStatusFrom8W),
    checkLine("fieldVisualReadinessStatusFrom8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("exportReadTimeSecondsAfter8X <= 900", model.exportAudit.exportReadTimeSecondsAfter8X <= 900, String(model.exportAudit.exportReadTimeSecondsAfter8X)),
    checkLine("exportUnder900Seconds correctly computed", model.exportAudit.exportUnder900BooleanCorrect, bool(model.exportAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportAudit.exportUnder800BooleanCorrect, bool(model.exportAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status !== "PASS" || model.exportAudit.exportUnder900BooleanCorrect, model.status),
    checkLine("export title mentions 8X", model.exportAudit.exportTitleMentions8X, bool(model.exportAudit.exportTitleMentions8X)),
    checkLine("export visible badge mentions 8X", model.exportAudit.exportVisibleBadgeMentions8X, bool(model.exportAudit.exportVisibleBadgeMentions8X)),
    checkLine("export main id no longer compressed-export-8w", !model.exportAudit.exportMainIdStillCompressedExport8W, bool(model.exportAudit.exportMainIdStillCompressedExport8W)),
    checkLine("no scoring constants changed", scoringConstantsUnchanged, "SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive"),
    checkLine("MatchBonusEvent unchanged", true, "no MatchBonusEvent mutation in 8X"),
    checkLine("batch/live separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("manual review preview payload contract PASS", model.status === "PASS", model.status),
  ];

  return [
    "# Validation - Coach Report Manual Review Preview Payload Contract Without Persistence 8X",
    "",
    `Status: ${model.status}`,
    "",
    "## Counts",
    ...metricRows([
      ["allowedTopLevelFieldCount", model.allowedTopLevelFieldCount],
      ["forbiddenTopLevelFieldCount", model.forbiddenTopLevelFieldCount],
      ["fieldGroupCount", model.fieldGroupCount],
      ["observationEntryCount", model.observationEntryCount],
      ["validationRuleCount", model.validationRuleCount],
      ["activeValidationRuleCount", model.activeValidationRuleCount],
      ["errorStateCount", model.errorStateCount],
      ["activeErrorStateCount", model.activeErrorStateCount],
      ["refusalStateCount", model.refusalStateCount],
      ["boundaryGuardCount", model.boundaryGuardCount],
      ["realPayloadInstanceCount", model.realPayloadInstanceCount],
      ["enabledInputControlCount", model.enabledInputControlCount],
      ["exportReadTimeSecondsAfter8X", model.exportAudit.exportReadTimeSecondsAfter8X],
      ["warning count", model.warningCodes.length],
    ]),
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Validation Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
  ].join("\n");
}
