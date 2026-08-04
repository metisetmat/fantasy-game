import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel,
  currentManualReviewFieldUxVisualReadinessWithoutPersistence8VModel,
} from "./buildManualReviewFieldUxVisualReadinessWithoutPersistence8V";
import {
  auditManualReviewPreviewActivationExport8W,
  auditManualReviewPreviewActivationGuards8W,
} from "./manualReviewPreviewActivationGuardsAudit8W";
import type {
  ManualReviewNonPersistentPreviewActivationGuards8WModel,
  ManualReviewPreviewActivationCondition8W,
  ManualReviewPreviewActivationGuard8W,
  ManualReviewPreviewActivationRefusalState8W,
  ManualReviewPreviewBlockingGuard8W,
  ManualReviewPreviewOnlyBoundary8W,
} from "./manualReviewPreviewActivationGuardsTypes8W";
import {
  MANUAL_REVIEW_PREVIEW_ACTIVATION_GUARDS_8W_BLOCKING_WARNINGS,
  type ManualReviewPreviewActivationGuardsWarningCode8W,
} from "./manualReviewPreviewActivationGuardsWarnings8W";
import type { ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel } from "./manualReviewFieldUxVisualReadinessTypes8V";
import {
  insertManualReviewPreviewActivationGuardsExport8W,
  renderManualReviewPreviewActivationGuardsExport8W,
} from "./renderManualReviewPreviewActivationGuardsExport8W";
import {
  insertManualReviewPreviewActivationGuardsProduct8W,
  renderManualReviewPreviewActivationGuardsProduct8W,
} from "./renderManualReviewPreviewActivationGuardsProduct8W";

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

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewActivationGuardsWarningCode8W[],
): readonly ManualReviewPreviewActivationGuardsWarningCode8W[] {
  return [...new Set(warnings)];
}

function conditionRows(): readonly ManualReviewPreviewActivationCondition8W[] {
  const rows: readonly (readonly [
    string,
    string,
    ManualReviewPreviewActivationCondition8W["appliesTo"],
    boolean,
    ManualReviewPreviewActivationGuardsWarningCode8W,
  ])[] = [
    ["field_state_model_defined", "Les futurs champs doivent avoir un modele d'etat controle.", "fields", false, "REAL_INPUT_ACTIVATED"],
    ["real_input_component_approved", "La vraie saisie doit etre explicitement decidee.", "fields", false, "REAL_INPUT_ACTIVATED"],
    ["field_validation_runtime_defined", "Les regles 8U doivent devenir executables dans un sprint futur.", "validation", false, "PREVIEW_ACTIVATION_STATUS_UNEXPECTED"],
    ["field_error_messages_mapped", "Les error states 8U/8V doivent etre relies a des messages UX.", "error_recovery", false, "PREVIEW_ACTIVATION_STATUS_UNEXPECTED"],
    ["payload_preview_only_contract_defined", "Le futur payload doit etre preview_only, non officiel, non persiste.", "payload", false, "PAYLOAD_CREATION_DETECTED"],
    ["payload_creation_boundary_defined", "Le passage champs vers payload doit etre borne et testable.", "payload", false, "PAYLOAD_CREATION_DETECTED"],
    ["preview_renderer_accepts_preview_only_payload", "Le renderer futur doit accepter seulement un payload valide et non officiel.", "preview", false, "REAL_PREVIEW_GENERATION_DETECTED"],
    ["invalid_payload_blocks_preview", "Tout payload invalide doit bloquer la preview.", "preview", false, "REAL_PREVIEW_GENERATION_DETECTED"],
    ["no_submit_available", "Aucun submit ne doit exister tant que le stockage n'est pas decide.", "non_persistence", true, "SUBMIT_BUTTON_DETECTED"],
    ["no_api_available", "Aucune API ne doit etre appelee.", "non_persistence", true, "API_CALL_DETECTED"],
    ["no_backend_available", "Aucun backend ne doit etre appele.", "non_persistence", true, "BACKEND_ACTION_DETECTED"],
    ["no_storage_available", "Aucun localStorage, DB, file write, history ou draft.", "non_persistence", true, "LOCAL_STORAGE_PERSISTENCE_DETECTED"],
    ["official_truth_boundary_enforced", "Le resultat coach reste non officiel.", "source_of_truth", true, "OFFICIAL_TRUTH_PROMOTION_DETECTED"],
    ["no_score_or_timeline_mutation", "Aucun score, timeline, score_change ou event ne doit bouger.", "source_of_truth", true, "SCORE_MANIPULATION_DETECTED"],
    ["no_automatic_decision", "La preview ne peut pas devenir decision automatique.", "source_of_truth", true, "AUTOMATIC_DECISION_DETECTED"],
    ["no_selection_or_tactical_instruction", "La preview ne peut pas piloter selection ou tactique.", "source_of_truth", true, "SELECTION_IMPOSITION_DETECTED"],
    ["permissions_policy_deferred", "Permissions et identite coach restent a decider.", "permissions", false, "PREVIEW_ACTIVATION_STATUS_UNEXPECTED"],
    ["abandon_without_save_policy_defined", "Sortir sans sauvegarder doit etre prevu avant vraie saisie.", "error_recovery", false, "DRAFT_CREATED"],
    ["accessibility_policy_defined", "Focus, clavier et labels accessibles doivent etre definis avant activation.", "accessibility", false, "PREVIEW_ACTIVATION_STATUS_UNEXPECTED"],
    ["audit_logging_policy_deferred", "Si stockage futur, audit logging devra etre decide separement.", "non_persistence", false, "HISTORY_CREATED"],
  ];
  return rows.map(([conditionId, description, appliesTo, satisfiedIn8W, failureWarningCode]) => ({
    conditionId,
    label: conditionId.replace(/_/gu, " "),
    description,
    appliesTo,
    requiredBeforeActivation: true,
    satisfiedIn8W,
    mustBeTrueBeforeFutureActivation: "Condition requise avant toute activation preview-only future.",
    blockedReasonIn8W: satisfiedIn8W
      ? "Satisfait comme garde-fou negatif en 8W; ne rend pas la feature active."
      : "Non satisfait en 8W parce que l'activation reelle est explicitement hors scope.",
    failureWarningCode,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function blockingGuards(): readonly ManualReviewPreviewBlockingGuard8W[] {
  const rows: readonly (readonly [string, string, readonly ManualReviewPreviewBlockingGuard8W["blocks"][number][]])[] = [
    ["BLOCK_IF_ANY_FIELD_ACTIVE_8W", "Bloque si un champ devient actif.", ["real_input_processing", "preview_activation"]],
    ["BLOCK_IF_PAYLOAD_CREATION_DETECTED_8W", "Bloque toute creation de payload.", ["payload_creation", "preview_activation"]],
    ["BLOCK_IF_REAL_PREVIEW_GENERATION_DETECTED_8W", "Bloque toute preview reelle.", ["preview_activation"]],
    ["BLOCK_IF_SUBMIT_DETECTED_8W", "Bloque tout submit.", ["submit"]],
    ["BLOCK_IF_API_DETECTED_8W", "Bloque tout appel API.", ["api_call"]],
    ["BLOCK_IF_BACKEND_DETECTED_8W", "Bloque toute action backend.", ["backend_action"]],
    ["BLOCK_IF_STORAGE_DETECTED_8W", "Bloque localStorage, DB, fichier, draft et historique.", ["persistence"]],
    ["BLOCK_IF_MEMORY_DETECTED_8W", "Bloque memoire de saison ou team style memory.", ["season_memory_creation", "team_style_memory_creation"]],
    ["BLOCK_IF_OFFICIAL_TRUTH_PROMOTION_DETECTED_8W", "Bloque toute officialisation.", ["official_truth_promotion"]],
    ["BLOCK_IF_SCORE_OR_TIMELINE_MUTATION_DETECTED_8W", "Bloque mutation score, timeline, event ou score_change.", ["score_mutation", "timeline_mutation", "event_mutation", "score_change_creation"]],
    ["BLOCK_IF_AUTOMATIC_DECISION_DETECTED_8W", "Bloque decision automatique.", ["automatic_decision"]],
    ["BLOCK_IF_SELECTION_OR_TACTIC_DETECTED_8W", "Bloque selection automatique ou consigne tactique.", ["selection_automation", "tactical_instruction"]],
  ];
  return rows.map(([blockingGuardId, coachFacingMessage, blocks]) => ({
    blockingGuardId,
    label: blockingGuardId.replace(/_/gu, " "),
    trigger: "Detection dans le contrat, le HTML produit/export ou les audits de source-of-truth.",
    blocks,
    severity: "blocking",
    coachFacingMessage,
    technicalMessage: `${blockingGuardId} must fail activation guard validation if triggered.`,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function refusalStates(): readonly ManualReviewPreviewActivationRefusalState8W[] {
  const rows: readonly (readonly [string, string, string, string])[] = [
    ["PREVIEW_ACTIVATION_NOT_ENABLED_8W", "preview activation", "Preview reelle non activee", "La preview reelle n'est pas activee dans ce sprint."],
    ["PAYLOAD_CREATION_NOT_ENABLED_8W", "payload", "Payload non cree", "Aucun payload n'est cree depuis les champs."],
    ["REAL_INPUT_PROCESSING_NOT_ENABLED_8W", "input", "Saisie reelle non traitee", "Aucune donnee coach reelle n'est traitee."],
    ["STORAGE_NOT_DECIDED_8W", "storage", "Stockage non decide", "Aucun stockage, draft ou historique n'est decide."],
    ["OFFICIALIZATION_FORBIDDEN_8W", "official truth", "Officialisation interdite", "Une revue coach ne devient pas verite officielle."],
    ["AUTOMATION_FORBIDDEN_8W", "automation", "Automation interdite", "La preview ne declenche ni decision, ni selection, ni consigne tactique."],
  ];
  return rows.map(([refusalStateId, triggeredBy, title, coachFacingMessage]) => ({
    refusalStateId,
    triggeredBy,
    title,
    coachFacingMessage,
    technicalReason: "8W is an activation-guard documentation sprint only.",
    requiredFutureDecision: "A later sprint must define product, security, payload and persistence policy before activation.",
    severity: "blocking",
    prevents: ["preview_activation", "payload_creation", "input_processing", "submit", "api_call", "backend_action", "persistence", "official_truth_promotion", "automatic_decision", "selection_automation", "tactical_instruction"],
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function futureBoundary(): ManualReviewPreviewOnlyBoundary8W {
  return {
    boundaryId: "manual-review-preview-only-boundary-8w",
    label: "Preview-only future boundary",
    text: "Une future preview ne pourra exister que comme lecture non persistante, non officielle et non appliquee.",
    futureAllowedOnlyIf: [
      "field state, validation runtime, payload contract, invalid-payload blocking, permissions, accessibility and abandon policy are defined",
      "the preview renderer accepts only a validated preview_only payload",
      "source-of-truth and non-persistence guards pass",
    ],
    alwaysForbiddenIn8W: [
      "real input processing",
      "payload creation",
      "preview generation",
      "persistence",
      "submit/API/backend",
      "official truth promotion",
      "score/timeline/event mutation",
      "automatic decision, selection or tactic",
    ],
    prevents: [
      "real_input_processing",
      "payload_creation",
      "preview_generation",
      "persistence",
      "submit",
      "api_call",
      "backend_action",
      "official_truth_promotion",
      "score_mutation",
      "timeline_mutation",
      "score_change_creation",
      "event_mutation",
      "season_memory_creation",
      "team_style_memory_creation",
      "automatic_decision",
      "automatic_real_match_classification",
      "selection_automation",
      "tactical_instruction",
      "real_next_match_claim",
      "engine_learning_claim",
      "season_trend_claim",
      "sandbox_promotion",
      "diagnostic_promotion",
      "batch_promotion",
    ],
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function buildGuard(): ManualReviewPreviewActivationGuard8W {
  const activationConditions = conditionRows();
  const guards = blockingGuards();
  const refusals = refusalStates();
  const satisfiedActivationConditionCount = activationConditions.filter((condition) => condition.satisfiedIn8W).length;
  const unsatisfiedActivationConditionCount = activationConditions.length - satisfiedActivationConditionCount;
  return {
    guardId: "manual-review-non-persistent-preview-activation-guards-8w",
    guardMode: "future_preview_activation_guard_only",
    sourceFieldVisualReadinessVersion: "8V",
    sourceInputFieldContractVersion: "8U",
    sourceInteractionContractVersion: "8T",
    sourceUxSkeletonVersion: "8S",
    sourceWorkflowReadinessVersion: "8R",
    sourceDecisionGateVersion: "8Q",
    sourceComparisonVersion: "8P",
    sourcePreviewVersion: "8O",
    sourceIntakeBoundaryVersion: "8N",
    sourceManualFormVersion: "8M",
    sourceLearningLoopVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    activationConditions,
    blockingGuards: guards,
    refusalStates: refusals,
    activationReadinessSummary: {
      summaryId: "manual-review-preview-activation-readiness-summary-8w",
      previewActivationStatus: "documented_but_blocked",
      expectedPreviewActivationStatus: "documented_but_blocked",
      statusReason: "8W documents the activation guard stack while keeping real preview activation blocked.",
      activationConditionCount: activationConditions.length,
      satisfiedActivationConditionCount,
      unsatisfiedActivationConditionCount,
      blockingGuardCount: guards.length,
      refusalStateCount: refusals.length,
      whatIsReady: [
        "champs visuels lisibles",
        "regles futures connues",
        "erreurs futures connues",
        "garde-fous d'activation documentes",
      ],
      whatIsBlocked: [
        "vraie saisie",
        "payload",
        "preview reelle",
        "submit",
        "API/backend",
        "stockage",
        "officialisation",
        "decision automatique",
        "selection/tactique",
      ],
      whatFutureSprintCanDo: [
        "definir le contrat payload preview_only sans persistence",
        "relier les validations runtime sans stockage",
        "preparer un renderer de preview non officielle sous garde stricte",
      ],
      coachFacingReadout: "Les champs sont lisibles, mais la preview reste documentee et bloquee.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    futurePreviewOnlyBoundary: futureBoundary(),
    deferredDecisions: [
      "field state runtime",
      "payload preview_only schema",
      "invalid payload behavior",
      "permissions",
      "accessibility",
      "abandon without save",
      "storage policy if any future draft exists",
      "audit logging if storage is ever approved",
    ],
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function statusFromWarnings(
  warnings: readonly ManualReviewPreviewActivationGuardsWarningCode8W[],
  exportUnder900: boolean,
  exportUnder800: boolean,
): "PASS" | "PARTIAL" | "FAIL" {
  if (!exportUnder900) return "FAIL";
  if (warnings.some((warning) => MANUAL_REVIEW_PREVIEW_ACTIVATION_GUARDS_8W_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  if (!exportUnder800) return "PARTIAL";
  return warnings.length === 0 ? "PASS" : "PARTIAL";
}

export function buildManualReviewNonPersistentPreviewActivationGuards8WModel(input?: {
  readonly baseline8V?: ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel;
  readonly productHtmlBefore8W?: string;
  readonly exportHtmlBefore8W?: string;
}): ManualReviewNonPersistentPreviewActivationGuards8WModel {
  const baseline8V = input?.baseline8V ?? currentManualReviewFieldUxVisualReadinessWithoutPersistence8VModel();
  if (baseline8V.status !== "PASS") {
    throw new Error(`Manual review preview activation guards 8W require PASS 8V baseline, got ${baseline8V.status}.`);
  }
  const fieldVisualReadinessStatusFrom8V = baseline8V.visualReadiness.visualReadinessSummary.visualReadinessStatus;
  if (fieldVisualReadinessStatusFrom8V !== "ready_for_static_visual_review") {
    throw new Error(`Manual review preview activation guards 8W require ready 8V visual readiness, got ${fieldVisualReadinessStatusFrom8V}.`);
  }
  const productHtmlBefore8W = input?.productHtmlBefore8W ?? baseline8V.productHtmlAfter8V;
  const exportHtmlBefore8W = input?.exportHtmlBefore8W ?? baseline8V.exportHtmlAfter8V;
  const guard = buildGuard();
  const productPreviewActivationGuardHtml = renderManualReviewPreviewActivationGuardsProduct8W(guard);
  const exportPreviewActivationGuardHtml = renderManualReviewPreviewActivationGuardsExport8W(guard);
  const productHtmlAfter8W = insertManualReviewPreviewActivationGuardsProduct8W(productHtmlBefore8W, productPreviewActivationGuardHtml);
  const exportHtmlAfter8W = insertManualReviewPreviewActivationGuardsExport8W(exportHtmlBefore8W, exportPreviewActivationGuardHtml);
  const activationAudit = auditManualReviewPreviewActivationGuards8W({ guard, productHtml: productHtmlAfter8W, exportHtml: exportHtmlAfter8W });
  const exportAudit = auditManualReviewPreviewActivationExport8W({ exportHtmlBefore8W, exportHtmlAfter8W });
  const warningCodes = uniqueWarnings([
    ...activationAudit.warningCodes,
    ...exportAudit.warningCodes,
  ]);
  const status = statusFromWarnings(warningCodes, exportAudit.exportUnder900Seconds, exportAudit.exportUnder800Seconds);
  const previewActivationGuardReady = status === "PASS" && activationAudit.previewActivationStatusCorrect;
  const baselineStorageCreated = baseline8V.safetyAudit.localStoragePersistenceCount > 0
    || baseline8V.safetyAudit.databasePersistenceCount > 0
    || baseline8V.safetyAudit.filePersistenceCount > 0
    || baseline8V.safetyAudit.seasonMemoryCreationCount > 0
    || baseline8V.safetyAudit.teamStyleMemoryCreationCount > 0;

  return {
    status,
    scope: "MANUAL_REVIEW_NON_PERSISTENT_PREVIEW_ACTIVATION_GUARDS",
    version: "MANUAL_REVIEW_NON_PERSISTENT_PREVIEW_ACTIVATION_GUARDS_8W",
    baselineVersion: "MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_8V",
    matchId: baseline8V.matchId,
    officialScore: baseline8V.officialScore,
    baseline8V,
    baseline8VPreserved: baseline8V.status === "PASS" && baseline8V.fieldUxVisualReadinessReady,
    baseline8UPreserved: baseline8V.baseline8UPreserved,
    baseline8TPreserved: baseline8V.baseline8TPreserved,
    baseline8SPreserved: baseline8V.baseline8SPreserved,
    baseline8RPreserved: baseline8V.baseline8RPreserved,
    baseline8QPreserved: baseline8V.baseline8QPreserved,
    baseline8PPreserved: baseline8V.baseline8PPreserved,
    baseline8OPreserved: baseline8V.baseline8OPreserved,
    baseline8NPreserved: baseline8V.baseline8NPreserved,
    baseline8MPreserved: baseline8V.baseline8MPreserved,
    baseline8LPreserved: baseline8V.baseline8LPreserved,
    baseline8KPreserved: baseline8V.baseline8KPreserved,
    baseline8IPreserved: baseline8V.baseline8IPreserved,
    baseline8HPreserved: baseline8V.baseline8HPreserved,
    baseline8GPreserved: baseline8V.baseline8GPreserved,
    baseline8FPreserved: baseline8V.baseline8FPreserved,
    baseline8EPreserved: baseline8V.baseline8EPreserved,
    baseline8DPreserved: baseline8V.baseline8DPreserved,
    baseline8CPreserved: baseline8V.baseline8CPreserved,
    baseline8BPreserved: baseline8V.baseline8BPreserved,
    baseline8APreserved: baseline8V.baseline8APreserved,
    baseline7HPreserved: baseline8V.baseline7HPreserved,
    baseline6XPreserved: baseline8V.baseline6XPreserved,
    previewActivationGuardReady,
    productPreviewActivationGuardVisible: activationAudit.productVisible,
    exportPreviewActivationGuardVisible: activationAudit.exportVisible,
    previewActivationUsesFieldVisualReadiness8V: activationAudit.usesFieldVisualReadiness8V,
    previewActivationUsesInputFieldContract8U: activationAudit.usesInputFieldContract8U,
    activationConditionCount: activationAudit.activationConditionCount,
    activationConditionCountExpected: 20,
    satisfiedActivationConditionCount: activationAudit.satisfiedActivationConditionCount,
    unsatisfiedActivationConditionCount: activationAudit.unsatisfiedActivationConditionCount,
    blockingGuardCount: activationAudit.blockingGuardCount,
    blockingGuardCountExpected: 12,
    refusalStateCount: activationAudit.refusalStateCount,
    refusalStateCountExpected: 6,
    previewActivationStatus: guard.activationReadinessSummary.previewActivationStatus,
    expectedPreviewActivationStatus: guard.activationReadinessSummary.expectedPreviewActivationStatus,
    previewActivationStatusCorrect: activationAudit.previewActivationStatusCorrect,
    nonPersistentPreviewModeDefined: activationAudit.nonPersistentPreviewModeDefined,
    nonPersistentPreviewModeActivated: activationAudit.nonPersistentPreviewModeActivated,
    realInputActivated: activationAudit.realInputActivated,
    payloadCreated: activationAudit.payloadCreated,
    realPreviewGenerated: activationAudit.realPreviewGenerated,
    submitCreated: activationAudit.submitCreated,
    apiCreated: activationAudit.apiCreated,
    backendCreated: activationAudit.backendCreated,
    storageCreated: activationAudit.storageCreated || baselineStorageCreated,
    memoryCreated: activationAudit.memoryCreated || baselineStorageCreated,
    officialTruthPromoted: activationAudit.officialTruthPromoted,
    automaticDecisionCreated: activationAudit.automaticDecisionCreated,
    selectionDriven: activationAudit.selectionDriven,
    tacticalInstructionDriven: activationAudit.tacticalInstructionDriven,
    workflowReadinessStatusFrom8R: baseline8V.workflowReadinessStatusFrom8S,
    reviewGateStatusFrom8Q: baseline8V.reviewGateStatusFrom8Q,
    readinessDistinctFromReviewGateStillVisible: activationAudit.readinessDistinctFromReviewGateStillVisible,
    fieldVisualReadinessStatusFrom8V,
    fieldVisualDistinctFromPreviewActivation: activationAudit.fieldVisualDistinctFromPreviewActivation,
    microWordingDebt8VFixed: activationAudit.microWordingDebt8VFixed,
    export8VWorkflowLabelCorrected: activationAudit.export8VWorkflowLabelCorrected,
    export8SLabelStillSkeletonOnly: activationAudit.export8SLabelStillSkeletonOnly,
    productStoryFirstPreserved: baseline8V.productStoryFirstPreserved,
    exportCompactPreserved: baseline8V.exportCompactPreserved && exportHtmlAfter8W.includes('id="compressed-export-8w"'),
    exportMetadataCurrent8WVisible: exportAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportAudit.exportUnder900BooleanCorrect && exportAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved: baseline8V.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8V.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8V.guardrailsPreserved && !baselineStorageCreated && !activationAudit.storageCreated,
    guard,
    productPreviewActivationGuardHtml,
    exportPreviewActivationGuardHtml,
    productHtmlAfter8W,
    exportHtmlAfter8W,
    activationAudit,
    safetyAudit: baseline8V.safetyAudit,
    exportAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_PREVIEW_ACTIVATION_GUARDS_BLOCKED" : "REVIEW_PREVIEW_ACTIVATION_GUARD_COVERAGE",
    nextSprintRecommendation: status === "PASS"
      ? "PREPARE_MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_WITHOUT_PERSISTENCE"
      : "PREVIEW_ACTIVATION_GUARD_COVERAGE_FIX",
  };
}

export function currentManualReviewNonPersistentPreviewActivationGuards8WModel(): ManualReviewNonPersistentPreviewActivationGuards8WModel {
  const baseline8V = buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel();
  return buildManualReviewNonPersistentPreviewActivationGuards8WModel({ baseline8V });
}

function baselineRows(model: ManualReviewNonPersistentPreviewActivationGuards8WModel): readonly string[] {
  return metricRows([
    ["baseline8VPreserved", model.baseline8VPreserved],
    ["baseline8UPreserved", model.baseline8UPreserved],
    ["baseline8TPreserved", model.baseline8TPreserved],
    ["baseline8SPreserved", model.baseline8SPreserved],
    ["baseline8RPreserved", model.baseline8RPreserved],
    ["baseline8QPreserved", model.baseline8QPreserved],
    ["baseline8PPreserved", model.baseline8PPreserved],
    ["baseline8OPreserved", model.baseline8OPreserved],
    ["baseline8NPreserved", model.baseline8NPreserved],
    ["baseline8MPreserved", model.baseline8MPreserved],
    ["baseline8LPreserved", model.baseline8LPreserved],
    ["baseline8KPreserved", model.baseline8KPreserved],
    ["baseline6XPreserved", model.baseline6XPreserved],
  ]);
}

export function renderManualReviewNonPersistentPreviewActivationGuards8WDoc(
  model: ManualReviewNonPersistentPreviewActivationGuards8WModel = currentManualReviewNonPersistentPreviewActivationGuards8WModel(),
): string {
  return [
    "# Manual Review Non-Persistent Preview Activation Guards 8W",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Preview Activation Guards Summary",
    ...metricRows([
      ["previewActivationGuardReady", model.previewActivationGuardReady],
      ["productPreviewActivationGuardVisible", model.productPreviewActivationGuardVisible],
      ["exportPreviewActivationGuardVisible", model.exportPreviewActivationGuardVisible],
      ["previewActivationStatus", model.previewActivationStatus],
      ["expectedPreviewActivationStatus", model.expectedPreviewActivationStatus],
      ["nonPersistentPreviewModeDefined", model.nonPersistentPreviewModeDefined],
      ["nonPersistentPreviewModeActivated", model.nonPersistentPreviewModeActivated],
      ["fieldVisualReadinessStatusFrom8V", model.fieldVisualReadinessStatusFrom8V],
      ["workflowReadinessStatusFrom8R", model.workflowReadinessStatusFrom8R],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
    ]),
    "",
    "## Baseline Preservation",
    ...baselineRows(model),
    "",
    "## Activation Conditions",
    ...table([
      ["Condition", "Applies", "Satisfied 8W", "Blocked reason"],
      ...model.guard.activationConditions.map((condition) => [
        condition.conditionId,
        condition.appliesTo,
        bool(condition.satisfiedIn8W),
        condition.blockedReasonIn8W,
      ]),
    ]),
    "",
    "## Blocking Guards",
    ...table([
      ["Guard", "Severity", "Blocks", "Coach message"],
      ...model.guard.blockingGuards.map((guard) => [
        guard.blockingGuardId,
        guard.severity,
        guard.blocks.join(", "),
        guard.coachFacingMessage,
      ]),
    ]),
    "",
    "## Refusal States",
    ...table([
      ["Refusal", "Triggered by", "Severity", "Message"],
      ...model.guard.refusalStates.map((refusal) => [
        refusal.refusalStateId,
        refusal.triggeredBy,
        refusal.severity,
        refusal.coachFacingMessage,
      ]),
    ]),
    "",
    "## Preview Activation Readiness",
    ...metricRows([
      ["activationConditionCount", model.activationConditionCount],
      ["satisfiedActivationConditionCount", model.satisfiedActivationConditionCount],
      ["unsatisfiedActivationConditionCount", model.unsatisfiedActivationConditionCount],
      ["blockingGuardCount", model.blockingGuardCount],
      ["refusalStateCount", model.refusalStateCount],
      ["fieldVisualDistinctFromPreviewActivation", model.fieldVisualDistinctFromPreviewActivation],
      ["readinessDistinctFromReviewGateStillVisible", model.readinessDistinctFromReviewGateStillVisible],
    ]),
    "",
    "## Micro Wording Debt Fix",
    ...metricRows([
      ["microWordingDebt8VFixed", model.microWordingDebt8VFixed],
      ["export8VWorkflowLabelCorrected", model.export8VWorkflowLabelCorrected],
      ["export8SLabelStillSkeletonOnly", model.export8SLabelStillSkeletonOnly],
    ]),
    "",
    "## Non-Persistence Audit",
    ...metricRows([
      ["realInputActivated", model.realInputActivated],
      ["payloadCreated", model.payloadCreated],
      ["realPreviewGenerated", model.realPreviewGenerated],
      ["submitCreated", model.submitCreated],
      ["apiCreated", model.apiCreated],
      ["backendCreated", model.backendCreated],
      ["storageCreated", model.storageCreated],
      ["memoryCreated", model.memoryCreated],
      ["officialTruthPromoted", model.officialTruthPromoted],
      ["automaticDecisionCreated", model.automaticDecisionCreated],
      ["selectionDriven", model.selectionDriven],
      ["tacticalInstructionDriven", model.tacticalInstructionDriven],
    ]),
    "",
    "## Export Metadata And Budget",
    ...metricRows([
      ["exportMetadataCurrent8WVisible", model.exportMetadataCurrent8WVisible],
      ["exportReadTimeSecondsBefore8W", model.exportAudit.exportReadTimeSecondsBefore8W],
      ["exportReadTimeSecondsAfter8W", model.exportAudit.exportReadTimeSecondsAfter8W],
      ["exportReadTimeDelta", model.exportAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["numericThresholdGuardPreserved", model.numericThresholdGuardPreserved],
    ]),
    "",
    "## Guardrails",
    ...metricRows([
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
      ["matchEconomyBaselinePreserved", model.matchEconomyBaselinePreserved],
      ["guardrailsPreserved", model.guardrailsPreserved],
      ["scoring constants", "SHOT_GOAL=3 / TRY_TOUCHDOWN=5 / CONVERSION_GOAL=2 / DROP_GOAL=2"],
    ]),
    "",
    "## Product Excerpt",
    "Garde-fous d'activation preview: preview documentee mais bloquee, aucun payload, aucune preview reelle.",
    "",
    "## Export Excerpt",
    "Garde-fous preview revue manuelle: Activation guard, Readiness 8R, gate 8Q needs_completion.",
    "",
    "## Warnings And Recommendation",
    `warningCodes: ${model.warningCodes.length === 0 ? "none" : model.warningCodes.join(", ")}`,
    `recommendation: ${model.recommendation}`,
    `nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderManualReviewNonPersistentPreviewActivationGuards8WValidation(
  model: ManualReviewNonPersistentPreviewActivationGuards8WModel = currentManualReviewNonPersistentPreviewActivationGuards8WModel(),
): string {
  const checks = [
    checkLine("ManualReviewNonPersistentPreviewActivationGuards8WModel exists", model.version === "MANUAL_REVIEW_NON_PERSISTENT_PREVIEW_ACTIVATION_GUARDS_8W", model.version),
    checkLine("Status: PASS", model.status === "PASS", model.status),
    checkLine("baseline 8V visible and preserved", model.baseline8VPreserved, bool(model.baseline8VPreserved)),
    checkLine("baseline 8U preserved", model.baseline8UPreserved, bool(model.baseline8UPreserved)),
    checkLine("baseline 8T preserved", model.baseline8TPreserved, bool(model.baseline8TPreserved)),
    checkLine("baseline 8S preserved", model.baseline8SPreserved, bool(model.baseline8SPreserved)),
    checkLine("baseline 8R preserved", model.baseline8RPreserved, bool(model.baseline8RPreserved)),
    checkLine("baseline 8Q preserved", model.baseline8QPreserved, bool(model.baseline8QPreserved)),
    checkLine("baseline 8P preserved", model.baseline8PPreserved, bool(model.baseline8PPreserved)),
    checkLine("baseline 8O preserved", model.baseline8OPreserved, bool(model.baseline8OPreserved)),
    checkLine("baseline 8N preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
    checkLine("baseline 8M preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
    checkLine("baseline 8L preserved", model.baseline8LPreserved, bool(model.baseline8LPreserved)),
    checkLine("baseline 8K preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved && model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("product preview activation guards visible", model.productPreviewActivationGuardVisible, bool(model.productPreviewActivationGuardVisible)),
    checkLine("export preview activation guards visible", model.exportPreviewActivationGuardVisible, bool(model.exportPreviewActivationGuardVisible)),
    checkLine("preview activation uses field visual readiness 8V", model.previewActivationUsesFieldVisualReadiness8V, bool(model.previewActivationUsesFieldVisualReadiness8V)),
    checkLine("preview activation uses input field contract 8U", model.previewActivationUsesInputFieldContract8U, bool(model.previewActivationUsesInputFieldContract8U)),
    checkLine("activation condition count >= 20", model.activationConditionCount >= 20, String(model.activationConditionCount)),
    checkLine("blocking guard count = 12", model.blockingGuardCount === 12, String(model.blockingGuardCount)),
    checkLine("refusal state count = 6", model.refusalStateCount === 6, String(model.refusalStateCount)),
    checkLine("previewActivationStatus = documented_but_blocked", model.previewActivationStatus === "documented_but_blocked", model.previewActivationStatus),
    checkLine("expectedPreviewActivationStatus = documented_but_blocked", model.expectedPreviewActivationStatus === "documented_but_blocked", model.expectedPreviewActivationStatus),
    checkLine("previewActivationStatusCorrect = true", model.previewActivationStatusCorrect, bool(model.previewActivationStatusCorrect)),
    checkLine("nonPersistentPreviewModeDefined = true", model.nonPersistentPreviewModeDefined, bool(model.nonPersistentPreviewModeDefined)),
    checkLine("nonPersistentPreviewModeActivated = false", !model.nonPersistentPreviewModeActivated, bool(model.nonPersistentPreviewModeActivated)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("submitCreated = false", !model.submitCreated, bool(model.submitCreated)),
    checkLine("apiCreated = false", !model.apiCreated, bool(model.apiCreated)),
    checkLine("backendCreated = false", !model.backendCreated, bool(model.backendCreated)),
    checkLine("storageCreated = false", !model.storageCreated, bool(model.storageCreated)),
    checkLine("memoryCreated = false", !model.memoryCreated, bool(model.memoryCreated)),
    checkLine("officialTruthPromoted = false", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("automaticDecisionCreated = false", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("selectionDriven = false", !model.selectionDriven, bool(model.selectionDriven)),
    checkLine("tacticalInstructionDriven = false", !model.tacticalInstructionDriven, bool(model.tacticalInstructionDriven)),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("readiness distinct from review gate remains visible", model.readinessDistinctFromReviewGateStillVisible, bool(model.readinessDistinctFromReviewGateStillVisible)),
    checkLine("field visual readiness 8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("field visual distinct from preview activation", model.fieldVisualDistinctFromPreviewActivation, bool(model.fieldVisualDistinctFromPreviewActivation)),
    checkLine("micro wording debt 8V fixed", model.microWordingDebt8VFixed, bool(model.microWordingDebt8VFixed)),
    checkLine("export8VWorkflowLabelCorrected = true", model.export8VWorkflowLabelCorrected, bool(model.export8VWorkflowLabelCorrected)),
    checkLine("export8SLabelStillSkeletonOnly = true", model.export8SLabelStillSkeletonOnly, bool(model.export8SLabelStillSkeletonOnly)),
    checkLine("product story-first preserved", model.productStoryFirstPreserved, bool(model.productStoryFirstPreserved)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("export metadata 8W visible", model.exportMetadataCurrent8WVisible, bool(model.exportMetadataCurrent8WVisible)),
    checkLine("exportReadTimeSecondsAfter8W <= 900", model.exportUnder900Seconds, String(model.exportAudit.exportReadTimeSecondsAfter8W)),
    checkLine("exportUnder900Seconds correctly computed", model.exportAudit.exportUnder900BooleanCorrect, bool(model.exportAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportAudit.exportUnder800BooleanCorrect, bool(model.exportAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status !== "PASS" || model.exportUnder800Seconds, model.status),
    checkLine("export title mentions 8W", model.exportAudit.exportTitleMentions8W, bool(model.exportAudit.exportTitleMentions8W)),
    checkLine("export visible badge mentions 8W", model.exportAudit.exportVisibleBadgeMentions8W, bool(model.exportAudit.exportVisibleBadgeMentions8W)),
    checkLine("export main id no longer compressed-export-8v", !model.exportAudit.exportMainIdStillCompressedExport8V, bool(model.exportAudit.exportMainIdStillCompressedExport8V)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("manual preview activation guards do not promote coach input to official truth", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("no score mutation", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("no scoring constants changed", scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "SHOT_GOAL=3 TRY_TOUCHDOWN=5 CONVERSION_GOAL=2 DROP_GOAL=2"),
    checkLine("PENALTY_SHOT remains inactive", scoringRegistryEntry("PENALTY_SHOT").active === false, "inactive"),
    checkLine("MatchBonusEvent unchanged", model.baseline8V.baseline8U.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.baseline8V.baseline8U.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8V.baseline8U.baseline8T.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.baseline8V.baseline8U.baseline8T.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("no warning codes", model.warningCodes.length === 0, model.warningCodes.join(", ") || "none"),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review Non-Persistent Preview Activation Guards 8W",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    ...metricRows([
      ["activationConditionCount", model.activationConditionCount],
      ["satisfiedActivationConditionCount", model.satisfiedActivationConditionCount],
      ["unsatisfiedActivationConditionCount", model.unsatisfiedActivationConditionCount],
      ["blockingGuardCount", model.blockingGuardCount],
      ["refusalStateCount", model.refusalStateCount],
      ["enabledCtaCount", model.safetyAudit.enabledCtaCount],
      ["submitButtonCount", model.safetyAudit.submitButtonCount],
      ["backendActionCount", model.safetyAudit.backendActionCount],
      ["apiCallCount", model.safetyAudit.apiCallCount],
      ["localStoragePersistenceCount", model.safetyAudit.localStoragePersistenceCount],
      ["databasePersistenceCount", model.safetyAudit.databasePersistenceCount],
      ["filePersistenceCount", model.safetyAudit.filePersistenceCount],
      ["memoryCreationCount", model.safetyAudit.memoryCreationCount],
      ["payloadCreationCount", model.safetyAudit.payloadCreationCount],
      ["realPreviewGenerationCount", model.safetyAudit.realPreviewGenerationCount],
      ["officialTruthPromotionCount", model.safetyAudit.officialTruthPromotionCount],
      ["automaticDecisionCount", model.safetyAudit.automaticDecisionCount],
      ["selectionRecommendationCount", model.safetyAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.safetyAudit.tacticalInstructionCount],
      ["exportReadTimeSecondsAfter8W", model.exportAudit.exportReadTimeSecondsAfter8W],
    ]),
    "",
    "## Checks",
    ...checks,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `recommendation: ${model.recommendation}`,
    `nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}
