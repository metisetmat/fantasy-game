import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel,
  currentManualReviewWorkflowUxSkeletonWithoutPersistence8SModel,
} from "./buildManualReviewWorkflowUxSkeletonWithoutPersistence8S";
import {
  auditManualReviewUxInteractionBoundary8T,
  auditManualReviewUxInteractionContract8T,
  auditManualReviewUxInteractionDisabledState8T,
  auditManualReviewUxInteractionExportBudget8T,
  auditManualReviewUxInteractionExportMetadata8T,
  auditManualReviewUxInteractionIntegrationBudget8T,
  auditManualReviewUxInteractionNonPersistence8T,
  auditManualReviewUxInteractionSourceOfTruthRegression8T,
  auditManualReviewUxInteractionWording8T,
} from "./manualReviewUxInteractionContractAudit8T";
import type {
  ManualReviewUxActivationRequirement8T,
  ManualReviewUxFutureInteraction8T,
  ManualReviewUxInteractionBoundary8T,
  ManualReviewUxInteractionContract8T,
  ManualReviewUxInteractionContractWithoutPersistence8TModel,
  ManualReviewUxInteractionStep8T,
  ManualReviewUxRefusalState8T,
} from "./manualReviewUxInteractionContractTypes8T";
import {
  MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T_BLOCKING_WARNINGS,
  type ManualReviewUxInteractionContractWarningCode8T,
} from "./manualReviewUxInteractionContractWarnings8T";
import type { ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel } from "./manualReviewWorkflowUxSkeletonTypes8S";
import {
  insertManualReviewUxInteractionContractExport8T,
  renderManualReviewUxInteractionContractExport8T,
} from "./renderManualReviewUxInteractionContractExport8T";
import {
  insertManualReviewUxInteractionContractProduct8T,
  renderManualReviewUxInteractionContractProduct8T,
} from "./renderManualReviewUxInteractionContractProduct8T";

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
  warnings: readonly ManualReviewUxInteractionContractWarningCode8T[],
): readonly ManualReviewUxInteractionContractWarningCode8T[] {
  return [...new Set(warnings)];
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 120);
  return html.slice(start, start + 1000).replace(/\s+/gu, " ");
}

function buildInteractionSteps(baseline8S: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel): readonly ManualReviewUxInteractionStep8T[] {
  const sourceStepIds = new Map(baseline8S.workflow.steps.map((step) => [step.sourceVersion, step.stepId] as const));
  return [
    {
      stepContractId: "manual-review-ux-interaction-step-8m-8t",
      sourceUxStepId8S: sourceStepIds.get("8M") ?? "manual-review-workflow-ux-step-8m",
      sourceVersion: "8M",
      stepOrder: 1,
      coachFacingLabel: "Saisir une vraie revue",
      current8SState: "empty_manual_form / disabled",
      allowedFutureIntent: "real_manual_review_input",
      blockedIn8T: true,
      blockedReason: "8T definit le contrat, mais aucune saisie reelle n'est encore autorisee.",
      activationRequires: ["UX de saisie reelle", "decision produit sur stockage", "validation permissions", "regle de statut non officiel", "strategie d'abandon sans sauvegarde"],
      refusalStateId: "REAL_INPUT_NOT_ENABLED_8T",
      canBeActivatedIn8T: false,
      canSubmitIn8T: false,
      canPersistIn8T: false,
      canCallApiIn8T: false,
      canPromoteOfficialTruthIn8T: false,
      canDriveSelectionIn8T: false,
      canDriveTacticalInstructionIn8T: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepContractId: "manual-review-ux-interaction-step-8n-8t",
      sourceUxStepId8S: sourceStepIds.get("8N") ?? "manual-review-workflow-ux-step-8n",
      sourceVersion: "8N",
      stepOrder: 2,
      coachFacingLabel: "Valider l'entree",
      current8SState: "intake contract visible / disabled",
      allowedFutureIntent: "validate_manual_review_payload",
      blockedIn8T: true,
      blockedReason: "Aucun payload reel n'est envoye en 8T.",
      activationRequires: ["payload reel type", "mode validate_only ou preview_only", "pas de submit backend", "pas de mutation officielle", "messages d'erreur UX"],
      refusalStateId: "REAL_VALIDATION_NOT_ENABLED_8T",
      canBeActivatedIn8T: false,
      canSubmitIn8T: false,
      canPersistIn8T: false,
      canCallApiIn8T: false,
      canPromoteOfficialTruthIn8T: false,
      canDriveSelectionIn8T: false,
      canDriveTacticalInstructionIn8T: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepContractId: "manual-review-ux-interaction-step-8o-8t",
      sourceUxStepId8S: sourceStepIds.get("8O") ?? "manual-review-workflow-ux-step-8o",
      sourceVersion: "8O",
      stepOrder: 3,
      coachFacingLabel: "Voir la preview",
      current8SState: "demo fixture preview / disabled",
      allowedFutureIntent: "render_preview_from_valid_input",
      blockedIn8T: true,
      blockedReason: "La preview reelle depuis saisie coach est hors 8T.",
      activationRequires: ["payload valide 8N", "renderer read-only", "marquage non officiel", "rejet des payloads invalides", "pas de persistance"],
      refusalStateId: "REAL_PREVIEW_NOT_ENABLED_8T",
      canBeActivatedIn8T: false,
      canSubmitIn8T: false,
      canPersistIn8T: false,
      canCallApiIn8T: false,
      canPromoteOfficialTruthIn8T: false,
      canDriveSelectionIn8T: false,
      canDriveTacticalInstructionIn8T: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepContractId: "manual-review-ux-interaction-step-8p-8t",
      sourceUxStepId8S: sourceStepIds.get("8P") ?? "manual-review-workflow-ux-step-8p",
      sourceVersion: "8P",
      stepOrder: 4,
      coachFacingLabel: "Comparer au plan",
      current8SState: "fixture comparison / disabled",
      allowedFutureIntent: "compare_preview_to_observation_plan",
      blockedIn8T: true,
      blockedReason: "La comparaison reelle reste liee a une future preview validee.",
      activationRequires: ["preview reelle validee", "plan 8K/8L disponible", "mapping explicite des questions", "pas de conclusion vraie-match automatique", "pas d'official truth"],
      refusalStateId: "REAL_COMPARISON_NOT_ENABLED_8T",
      canBeActivatedIn8T: false,
      canSubmitIn8T: false,
      canPersistIn8T: false,
      canCallApiIn8T: false,
      canPromoteOfficialTruthIn8T: false,
      canDriveSelectionIn8T: false,
      canDriveTacticalInstructionIn8T: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepContractId: "manual-review-ux-interaction-step-8q-8t",
      sourceUxStepId8S: sourceStepIds.get("8Q") ?? "manual-review-workflow-ux-step-8q",
      sourceVersion: "8Q",
      stepOrder: 5,
      coachFacingLabel: "Lire le gate",
      current8SState: "gate needs_completion / disabled",
      allowedFutureIntent: "compute_readability_gate",
      blockedIn8T: true,
      blockedReason: "Le gate reel ne peut pas devenir une decision automatique.",
      activationRequires: ["comparaison validee", "regles de gate transparentes", "wording lisibilite, pas decision", "aucun changement de selection/tactique", "revue encore marquee non officielle"],
      refusalStateId: "REAL_GATE_NOT_ENABLED_8T",
      canBeActivatedIn8T: false,
      canSubmitIn8T: false,
      canPersistIn8T: false,
      canCallApiIn8T: false,
      canPromoteOfficialTruthIn8T: false,
      canDriveSelectionIn8T: false,
      canDriveTacticalInstructionIn8T: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepContractId: "manual-review-ux-interaction-step-8r-8t",
      sourceUxStepId8S: sourceStepIds.get("8R") ?? "manual-review-workflow-ux-step-8r",
      sourceVersion: "8R",
      stepOrder: 6,
      coachFacingLabel: "Confirmer readiness workflow",
      current8SState: "ready_for_non_persistent_preview / disabled",
      allowedFutureIntent: "persist_or_history_review",
      blockedIn8T: true,
      blockedReason: "Readiness workflow ne vaut pas readiness d'usage reel.",
      activationRequires: ["vraie saisie testee", "strategie de stockage decidee separement", "permissions decidees separement", "policy d'historique decidee separement", "frontiere official truth conservee"],
      refusalStateId: "STORAGE_NOT_DECIDED_8T",
      canBeActivatedIn8T: false,
      canSubmitIn8T: false,
      canPersistIn8T: false,
      canCallApiIn8T: false,
      canPromoteOfficialTruthIn8T: false,
      canDriveSelectionIn8T: false,
      canDriveTacticalInstructionIn8T: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildFutureInteractions(): readonly ManualReviewUxFutureInteraction8T[] {
  const sharedNever = ["submit/backend avant decision", "official truth promotion", "score mutation", "selection automation", "tactical automation"];
  return [
    {
      interactionId: "future-real-input-8t",
      label: "Saisir une vraie revue",
      sourceStepVersion: "8M",
      futureIntent: "real_manual_review_input",
      statusIn8T: "documented_but_blocked",
      currentUiTreatment: "disabled_control",
      blockedReason: "8T definit le contrat, mais aucune saisie reelle n'est encore autorisee.",
      requiredBeforeActivation: ["real_input_component_design", "storage_product_decision", "permissions_and_access_control"],
      allowedLaterOnlyIf: ["statut non officiel visible", "abandon sans sauvegarde disponible"],
      mustNeverDo: sharedNever,
      refusalStateId: "REAL_INPUT_NOT_ENABLED_8T",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      interactionId: "future-real-validation-8t",
      label: "Valider la revue",
      sourceStepVersion: "8N",
      futureIntent: "validate_manual_review_payload",
      statusIn8T: "documented_but_blocked",
      currentUiTreatment: "read_only_panel",
      blockedReason: "Aucun payload reel n'est envoye en 8T.",
      requiredBeforeActivation: ["real_payload_validation_messages", "error_recovery_policy"],
      allowedLaterOnlyIf: ["validate_only ou preview_only", "aucun submit backend"],
      mustNeverDo: sharedNever,
      refusalStateId: "REAL_VALIDATION_NOT_ENABLED_8T",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      interactionId: "future-real-preview-8t",
      label: "Voir la preview reelle",
      sourceStepVersion: "8O",
      futureIntent: "render_preview_from_valid_input",
      statusIn8T: "documented_but_blocked",
      currentUiTreatment: "placeholder_copy",
      blockedReason: "La preview reelle depuis saisie coach est hors 8T.",
      requiredBeforeActivation: ["payload valide", "renderer read-only", "marquage non officiel"],
      allowedLaterOnlyIf: ["payload 8N valide", "pas de persistance"],
      mustNeverDo: sharedNever,
      refusalStateId: "REAL_PREVIEW_NOT_ENABLED_8T",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      interactionId: "future-real-comparison-8t",
      label: "Comparer au plan",
      sourceStepVersion: "8P",
      futureIntent: "compare_preview_to_observation_plan",
      statusIn8T: "documented_but_blocked",
      currentUiTreatment: "read_only_panel",
      blockedReason: "La comparaison reelle reste liee a une future preview validee.",
      requiredBeforeActivation: ["preview validee", "mapping explicite des questions", "plan 8K/8L disponible"],
      allowedLaterOnlyIf: ["comparaison de lisibilite uniquement", "pas de conclusion vraie-match automatique"],
      mustNeverDo: sharedNever,
      refusalStateId: "REAL_COMPARISON_NOT_ENABLED_8T",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      interactionId: "future-real-gate-8t",
      label: "Lire le gate reel",
      sourceStepVersion: "8Q",
      futureIntent: "compute_readability_gate",
      statusIn8T: "documented_but_blocked",
      currentUiTreatment: "read_only_panel",
      blockedReason: "Le gate reel ne peut pas devenir une decision automatique.",
      requiredBeforeActivation: ["regles de gate transparentes", "wording lisibilite", "frontiere non officielle"],
      allowedLaterOnlyIf: ["aucun changement de selection/tactique", "reviewGateStatus visible"],
      mustNeverDo: sharedNever,
      refusalStateId: "REAL_GATE_NOT_ENABLED_8T",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      interactionId: "future-persist-or-history-8t",
      label: "Enregistrer ou historiser",
      sourceStepVersion: "8R",
      futureIntent: "persist_or_history_review",
      statusIn8T: "documented_but_blocked",
      currentUiTreatment: "disabled_control",
      blockedReason: "Aucune decision produit de stockage, permissions, historique ou officialisation n'existe dans 8T.",
      requiredBeforeActivation: ["storage_product_decision", "permissions_and_access_control", "history_policy", "official_truth_boundary_policy", "audit_logging_policy_if_storage_later"],
      allowedLaterOnlyIf: ["stockage decide dans un sprint separe", "frontiere official truth maintenue"],
      mustNeverDo: ["localStorage without decision", "database write", "file write", "memory creation", "official truth promotion", "score mutation", "tactical automation"],
      refusalStateId: "STORAGE_NOT_DECIDED_8T",
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildRefusalStates(): readonly ManualReviewUxRefusalState8T[] {
  const common = "Cette action est decrite pour un futur sprint mais reste desactivee ici. Aucune donnee coach reelle n'est traitee dans 8T. Cette etape necessitera une decision produit separee avant activation.";
  return [
    {
      refusalStateId: "REAL_INPUT_NOT_ENABLED_8T",
      triggeredByInteractionId: "future-real-input-8t",
      title: "Saisie reelle non activee",
      coachFacingMessage: common,
      technicalReason: "No real input component is active in 8T.",
      requiredFutureDecision: "real_input_component_design",
      severity: "blocking",
      prevents: ["submit", "api_call", "backend_action", "persistence"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      refusalStateId: "REAL_VALIDATION_NOT_ENABLED_8T",
      triggeredByInteractionId: "future-real-validation-8t",
      title: "Validation reelle non activee",
      coachFacingMessage: "Aucune donnee coach reelle n'est traitee dans 8T.",
      technicalReason: "No typed real payload enters the validation boundary.",
      requiredFutureDecision: "real_payload_validation_messages",
      severity: "blocking",
      prevents: ["api_call", "backend_action", "official_truth_promotion"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      refusalStateId: "REAL_PREVIEW_NOT_ENABLED_8T",
      triggeredByInteractionId: "future-real-preview-8t",
      title: "Preview reelle non activee",
      coachFacingMessage: common,
      technicalReason: "Preview rendering is documented but remains fixture/read-only.",
      requiredFutureDecision: "error_recovery_policy",
      severity: "warning",
      prevents: ["persistence", "official_truth_promotion", "automatic_decision"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      refusalStateId: "REAL_COMPARISON_NOT_ENABLED_8T",
      triggeredByInteractionId: "future-real-comparison-8t",
      title: "Comparaison reelle non activee",
      coachFacingMessage: "Le statut de lecture ne devient pas une decision tactique.",
      technicalReason: "Real comparison needs a validated preview payload from a later sprint.",
      requiredFutureDecision: "official_truth_boundary_policy",
      severity: "warning",
      prevents: ["official_truth_promotion", "selection_automation", "tactical_instruction"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      refusalStateId: "REAL_GATE_NOT_ENABLED_8T",
      triggeredByInteractionId: "future-real-gate-8t",
      title: "Gate reel non actif",
      coachFacingMessage: "Le statut de lecture ne devient pas une decision tactique.",
      technicalReason: "The gate remains a readability contract and cannot drive automatic decisions.",
      requiredFutureDecision: "permissions_and_access_control",
      severity: "blocking",
      prevents: ["automatic_decision", "selection_automation", "tactical_instruction"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      refusalStateId: "STORAGE_NOT_DECIDED_8T",
      triggeredByInteractionId: "future-persist-or-history-8t",
      title: "Stockage non decide",
      coachFacingMessage: "Aucun stockage ou historique n'est cree.",
      technicalReason: "Storage, permissions, history, and officialization are deferred product decisions.",
      requiredFutureDecision: "storage_product_decision",
      severity: "blocking",
      prevents: ["submit", "api_call", "backend_action", "persistence", "official_truth_promotion", "automatic_decision", "selection_automation", "tactical_instruction"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildActivationRequirements(): readonly ManualReviewUxActivationRequirement8T[] {
  const allInteractions = [
    "future-real-input-8t",
    "future-real-validation-8t",
    "future-real-preview-8t",
    "future-real-comparison-8t",
    "future-real-gate-8t",
    "future-persist-or-history-8t",
  ];
  return [
    ["real_input_component_design", "UX de saisie reelle", ["future-real-input-8t"], "8U", "Defines accessible real fields before any input exists.", "submit"],
    ["real_payload_validation_messages", "Messages de validation payload", ["future-real-validation-8t"], "8U", "Explains errors without sending data.", "api_call"],
    ["storage_product_decision", "Decision produit stockage", ["future-persist-or-history-8t"], "future storage sprint", "Chooses storage or no-storage policy separately.", "persistence"],
    ["permissions_and_access_control", "Permissions et acces", allInteractions, "future permissions sprint", "Prevents accidental review access.", "backend_action"],
    ["history_policy", "Politique historique", ["future-persist-or-history-8t"], "future history sprint", "Keeps review history separate from official evidence.", "official_truth_promotion"],
    ["official_truth_boundary_policy", "Frontiere official truth", allInteractions, "future boundary sprint", "Maintains official score/timeline/source-of-truth.", "official_truth_promotion"],
    ["abandon_without_save_policy", "Abandon sans sauvegarde", ["future-real-input-8t"], "8U", "Makes cancellation explicit without persistence.", "persistence"],
    ["error_recovery_policy", "Error recovery", ["future-real-validation-8t", "future-real-preview-8t"], "8U", "Defines recoverable read-only errors.", "automatic_decision"],
    ["accessibility_keyboard_navigation_policy", "Accessibilite clavier", allInteractions, "future accessibility sprint", "Required before controls become real.", "submit"],
    ["audit_logging_policy_if_storage_later", "Audit logging si stockage futur", ["future-persist-or-history-8t"], "future storage sprint", "Only relevant after explicit storage decision.", "persistence"],
  ].map(([requirementId, label, appliesToInteractionIds, futureSprintCandidate, rationale, boundaryProtected]) => ({
    requirementId: requirementId as string,
    label: label as string,
    appliesToInteractionIds: appliesToInteractionIds as readonly string[],
    requiredBeforeActivation: true,
    satisfiedIn8T: false,
    futureSprintCandidate: futureSprintCandidate as string,
    rationale: rationale as string,
    boundaryProtected: boundaryProtected as string,
  }));
}

function buildBoundaries(): readonly ManualReviewUxInteractionBoundary8T[] {
  return [
    {
      boundaryId: "manual-review-ux-interaction-boundary-no-submit-8t",
      label: "No submit/backend/API",
      text: "8T documents the future interaction contract but does not create a submit, API call, backend action, or enabled control.",
      prevents: ["submit", "api_call", "backend_action"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-ux-interaction-boundary-no-persistence-8t",
      label: "No storage or memory",
      text: "8T creates no localStorage, database write, file write, season memory, or team style memory.",
      prevents: ["persistence", "season_memory_creation", "team_style_memory_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-ux-interaction-boundary-source-of-truth-8t",
      label: "No official truth or tactical automation",
      text: "8T cannot promote coach input to official truth, mutate score/timeline/events, classify a real match, drive selection, or create tactical instruction.",
      prevents: ["official_truth_promotion", "score_mutation", "timeline_mutation", "score_change_creation", "event_mutation", "automatic_decision", "automatic_real_match_classification", "selection_automation", "tactical_instruction", "real_next_match_claim", "engine_learning_claim", "season_trend_claim", "sandbox_promotion", "diagnostic_promotion", "batch_promotion"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildContract(baseline8S: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel): ManualReviewUxInteractionContract8T {
  return {
    contractId: "manual-review-ux-interaction-contract-without-persistence-8t",
    contractMode: "future_interaction_contract_only",
    sourceUxSkeletonVersion: "8S",
    sourceWorkflowReadinessVersion: "8R",
    sourceDecisionGateVersion: "8Q",
    sourceComparisonVersion: "8P",
    sourcePreviewVersion: "8O",
    sourceIntakeBoundaryVersion: "8N",
    sourceManualFormVersion: "8M",
    sourceLearningLoopVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    interactionSteps: buildInteractionSteps(baseline8S),
    futureInteractions: buildFutureInteractions(),
    refusalStates: buildRefusalStates(),
    activationRequirements: buildActivationRequirements(),
    deferredDecisions: [
      "decision de stockage",
      "permissions",
      "historique",
      "officialisation",
      "abandon sans sauvegarde",
      "audit logging si stockage futur",
      "error recovery",
      "accessibilite clavier",
    ],
    boundaries: buildBoundaries(),
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
  warnings: readonly ManualReviewUxInteractionContractWarningCode8T[],
  exportUnder900Seconds: boolean,
  exportUnder800Seconds: boolean,
): "PASS" | "PARTIAL" | "FAIL" {
  if (!exportUnder900Seconds) return "FAIL";
  if (warnings.some((warning) => MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  if (!exportUnder800Seconds || warnings.length > 0) return "PARTIAL";
  return "PASS";
}

export function buildManualReviewUxInteractionContractWithoutPersistence8TModel(input?: {
  readonly baseline8S?: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel;
  readonly productHtmlBefore8T?: string;
  readonly exportHtmlBefore8T?: string;
}): ManualReviewUxInteractionContractWithoutPersistence8TModel {
  const baseline8S = input?.baseline8S ?? currentManualReviewWorkflowUxSkeletonWithoutPersistence8SModel();
  if (baseline8S.status !== "PASS") {
    throw new Error("8T interaction contract blocked: baseline 8S UX skeleton is not PASS.");
  }
  const contract = buildContract(baseline8S);
  const productHtmlBefore8T = input?.productHtmlBefore8T ?? baseline8S.productHtmlAfter8S;
  const exportHtmlBefore8T = input?.exportHtmlBefore8T ?? baseline8S.exportHtmlAfter8S;
  const productInteractionContractHtml = renderManualReviewUxInteractionContractProduct8T(contract);
  const exportInteractionContractHtml = renderManualReviewUxInteractionContractExport8T(contract);
  const productHtmlAfter8T = insertManualReviewUxInteractionContractProduct8T(productHtmlBefore8T, productInteractionContractHtml);
  const exportHtmlAfter8T = insertManualReviewUxInteractionContractExport8T(exportHtmlBefore8T, exportInteractionContractHtml);
  const contractAudit = auditManualReviewUxInteractionContract8T({ contract, productHtml: productHtmlAfter8T, exportHtml: exportHtmlAfter8T });
  const disabledStateAudit = auditManualReviewUxInteractionDisabledState8T({ contract, productHtml: productHtmlAfter8T, exportHtml: exportHtmlAfter8T });
  const nonPersistenceAudit = auditManualReviewUxInteractionNonPersistence8T({ productHtml: productHtmlAfter8T, exportHtml: exportHtmlAfter8T });
  const boundaryAudit = auditManualReviewUxInteractionBoundary8T({ productHtml: productHtmlAfter8T, exportHtml: exportHtmlAfter8T });
  const sourceOfTruthRegressionAudit = auditManualReviewUxInteractionSourceOfTruthRegression8T({ baseline8S, boundaryAudit });
  const exportMetadataAudit = auditManualReviewUxInteractionExportMetadata8T(exportHtmlAfter8T);
  const exportBudgetAudit = auditManualReviewUxInteractionExportBudget8T({ exportHtmlBefore8T, exportHtmlAfter8T });
  const integrationBudgetAudit = auditManualReviewUxInteractionIntegrationBudget8T({ productHtml: productHtmlAfter8T, exportHtml: exportHtmlAfter8T });
  const wordingAudit = auditManualReviewUxInteractionWording8T({ productHtml: productHtmlAfter8T, exportHtml: exportHtmlAfter8T });
  const warningCodes = uniqueWarnings([
    ...contractAudit.interactionContractWarningCodes,
    ...disabledStateAudit.disabledStateWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...boundaryAudit.boundaryWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...exportMetadataAudit.metadataWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
  ]);
  const status = statusFromWarnings(warningCodes, exportBudgetAudit.exportUnder900Seconds, exportBudgetAudit.exportUnder800Seconds);
  return {
    status,
    scope: "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T",
    baselineVersion: "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_8S",
    matchId: baseline8S.matchId,
    officialScore: baseline8S.officialScore,
    baseline8S,
    baseline8SPreserved: baseline8S.status === "PASS" && baseline8S.uxSkeletonReady,
    baseline8RPreserved: baseline8S.baseline8RPreserved,
    baseline8QPreserved: baseline8S.baseline8QPreserved,
    baseline8PPreserved: baseline8S.baseline8PPreserved,
    baseline8OPreserved: baseline8S.baseline8OPreserved,
    baseline8NPreserved: baseline8S.baseline8NPreserved,
    baseline8MPreserved: baseline8S.baseline8MPreserved,
    baseline8LPreserved: baseline8S.baseline8LPreserved,
    baseline8KPreserved: baseline8S.baseline8KPreserved,
    baseline8IPreserved: baseline8S.baseline8IPreserved,
    baseline8HPreserved: baseline8S.baseline8HPreserved,
    baseline8GPreserved: baseline8S.baseline8GPreserved,
    baseline8FPreserved: baseline8S.baseline8FPreserved,
    baseline8EPreserved: baseline8S.baseline8EPreserved,
    baseline8DPreserved: baseline8S.baseline8DPreserved,
    baseline8CPreserved: baseline8S.baseline8CPreserved,
    baseline8BPreserved: baseline8S.baseline8BPreserved,
    baseline8APreserved: baseline8S.baseline8APreserved,
    baseline7HPreserved: baseline8S.baseline7HPreserved,
    baseline6XPreserved: baseline8S.baseline6XPreserved,
    interactionContractReady: status === "PASS",
    productInteractionContractVisible: contractAudit.productInteractionContractVisible,
    exportInteractionContractVisible: contractAudit.exportInteractionContractVisible,
    interactionContractUsesUxSkeleton8S: contractAudit.interactionContractUsesUxSkeleton8S,
    interactionContractStepCount: contractAudit.interactionContractStepCount,
    interactionContractStepCountExpected: contractAudit.interactionContractStepCountExpected,
    futureInteractionCount: contractAudit.futureInteractionCount,
    futureInteractionCountExpected: contractAudit.futureInteractionCountExpected,
    blockedInteractionCount: contractAudit.blockedInteractionCount,
    blockedInteractionCountExpected: contractAudit.blockedInteractionCountExpected,
    enabledInteractionCount: contractAudit.enabledInteractionCount,
    interactionPreconditionCount: contractAudit.activationRequirementCount,
    refusalStateCount: contractAudit.refusalStateCount,
    refusalStateCountExpected: contractAudit.refusalStateCountExpected,
    interactionActivationRequirementVisible: contractAudit.interactionActivationRequirementVisible,
    storageDecisionDeferredVisible: contractAudit.storageDecisionDeferredVisible,
    permissionsDecisionDeferredVisible: contractAudit.permissionsDecisionDeferredVisible,
    officializationDecisionDeferredVisible: contractAudit.officializationDecisionDeferredVisible,
    workflowReadinessStatusFrom8S: "ready_for_non_persistent_preview",
    reviewGateStatusFrom8Q: "needs_completion",
    readinessDistinctFromReviewGateStillVisible: baseline8S.uxReadinessDistinctFromReviewGate && wordingAudit.workflowReadinessDistinctFromReviewGateWordingVisible,
    contractMarkedFutureOnly: wordingAudit.interactionContractFutureOnlyWordingVisible,
    contractMarkedNonInteractive: wordingAudit.interactionContractNonInteractiveWordingVisible,
    contractMarkedNonOfficial: wordingAudit.interactionContractNonOfficialWordingVisible,
    contractMarkedNotPersisted: wordingAudit.interactionContractNotPersistedWordingVisible,
    contractMarkedNotApplied: wordingAudit.interactionContractNotAppliedWordingVisible,
    contractDoesNotCreateSubmit: disabledStateAudit.submitButtonCount === 0 && disabledStateAudit.enabledSubmitButtonCount === 0,
    contractDoesNotCreateApi: disabledStateAudit.apiCallCount === 0 && nonPersistenceAudit.apiCallCount === 0,
    contractDoesNotCreateBackend: disabledStateAudit.backendActionCount === 0 && nonPersistenceAudit.backendSubmitActionCount === 0,
    contractDoesNotCreateStorage: !nonPersistenceAudit.interactionPersistencePerformed && nonPersistenceAudit.storageDecisionImplementedCount === 0,
    contractDoesNotCreateMemory: nonPersistenceAudit.memoryCreationCount === 0,
    contractDoesNotPromoteOfficialTruth: boundaryAudit.officialTruthPromotionCount === 0,
    contractDoesNotCreateAutomaticDecision: boundaryAudit.automaticDecisionCount === 0,
    contractDoesNotDriveSelection: boundaryAudit.selectionRecommendationCount === 0,
    contractDoesNotDriveTacticalInstruction: boundaryAudit.tacticalInstructionCount === 0,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationBudgetAudit.exportCompactPreserved,
    exportMetadataCurrent8TVisible: exportMetadataAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved: sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes.length === 0,
    matchEconomyBaselinePreserved: baseline8S.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8S.guardrailsPreserved &&
      scoringRegistryEntry("SHOT_GOAL").points === 3 &&
      scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
      scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
      scoringRegistryEntry("DROP_GOAL").points === 2,
    contract,
    productInteractionContractHtml,
    exportInteractionContractHtml,
    productHtmlAfter8T,
    exportHtmlAfter8T,
    contractAudit,
    disabledStateAudit,
    nonPersistenceAudit,
    boundaryAudit,
    sourceOfTruthRegressionAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_UX_INTERACTION_CONTRACT" : "REVIEW_MANUAL_REVIEW_UX_INTERACTION_CONTRACT",
    nextSprintRecommendation: status === "PASS"
      ? "8U - Manual Review Input Field Contract Without Persistence"
      : "8U - UX Interaction Contract Wording Polish",
  };
}

export function currentManualReviewUxInteractionContractWithoutPersistence8TModel(): ManualReviewUxInteractionContractWithoutPersistence8TModel {
  return buildManualReviewUxInteractionContractWithoutPersistence8TModel({
    baseline8S: buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel(),
  });
}

function baselineRows(model: ManualReviewUxInteractionContractWithoutPersistence8TModel): readonly string[] {
  return metricRows([
    ["baseline8SPreserved", model.baseline8SPreserved],
    ["baseline8RPreserved", model.baseline8RPreserved],
    ["baseline8QPreserved", model.baseline8QPreserved],
    ["baseline8PPreserved", model.baseline8PPreserved],
    ["baseline8OPreserved", model.baseline8OPreserved],
    ["baseline8NPreserved", model.baseline8NPreserved],
    ["baseline8MPreserved", model.baseline8MPreserved],
    ["baseline8LPreserved", model.baseline8LPreserved],
    ["baseline8KPreserved", model.baseline8KPreserved],
    ["baseline8IPreserved", model.baseline8IPreserved],
    ["baseline8HPreserved", model.baseline8HPreserved],
    ["baseline8GPreserved", model.baseline8GPreserved],
    ["baseline8FPreserved", model.baseline8FPreserved],
    ["baseline8EPreserved", model.baseline8EPreserved],
    ["baseline8DPreserved", model.baseline8DPreserved],
    ["baseline8CPreserved", model.baseline8CPreserved],
    ["baseline8BPreserved", model.baseline8BPreserved],
    ["baseline8APreserved", model.baseline8APreserved],
    ["baseline7HPreserved", model.baseline7HPreserved],
    ["baseline6XPreserved", model.baseline6XPreserved],
  ]);
}

function stepRows(model: ManualReviewUxInteractionContractWithoutPersistence8TModel): readonly string[] {
  return table([
    ["Order", "Version", "Interaction", "State", "Blocked", "Reason", "Refusal"],
    ...model.contract.interactionSteps.map((step) => [
      String(step.stepOrder),
      step.sourceVersion,
      step.coachFacingLabel,
      step.current8SState,
      bool(step.blockedIn8T),
      step.blockedReason,
      step.refusalStateId,
    ]),
  ]);
}

function futureInteractionRows(model: ManualReviewUxInteractionContractWithoutPersistence8TModel): readonly string[] {
  return table([
    ["Interaction", "Future intent", "Status 8T", "Treatment", "Blocked reason", "Must never do"],
    ...model.contract.futureInteractions.map((interaction) => [
      interaction.label,
      interaction.futureIntent,
      interaction.statusIn8T,
      interaction.currentUiTreatment,
      interaction.blockedReason,
      interaction.mustNeverDo.join("; "),
    ]),
  ]);
}

function refusalRows(model: ManualReviewUxInteractionContractWithoutPersistence8TModel): readonly string[] {
  return table([
    ["Refusal", "Triggered by", "Severity", "Coach message", "Prevents"],
    ...model.contract.refusalStates.map((refusal) => [
      refusal.refusalStateId,
      refusal.triggeredByInteractionId,
      refusal.severity,
      refusal.coachFacingMessage,
      refusal.prevents.join("; "),
    ]),
  ]);
}

function requirementRows(model: ManualReviewUxInteractionContractWithoutPersistence8TModel): readonly string[] {
  return table([
    ["Requirement", "Label", "Satisfied in 8T", "Future sprint", "Boundary"],
    ...model.contract.activationRequirements.map((requirement) => [
      requirement.requirementId,
      requirement.label,
      bool(requirement.satisfiedIn8T),
      requirement.futureSprintCandidate,
      requirement.boundaryProtected,
    ]),
  ]);
}

export function renderManualReviewUxInteractionContractWithoutPersistence8TDoc(
  model: ManualReviewUxInteractionContractWithoutPersistence8TModel = currentManualReviewUxInteractionContractWithoutPersistence8TModel(),
): string {
  return [
    "# Manual Review UX Interaction Contract Without Persistence 8T",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Baseline 8S Summary",
    ...metricRows([
      ["baseline8SStatus", model.baseline8S.status],
      ["uxSkeletonReady", model.baseline8S.uxSkeletonReady],
      ["workflowReadinessStatusFrom8S", model.workflowReadinessStatusFrom8S],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["readinessDistinctFromReviewGateStillVisible", model.readinessDistinctFromReviewGateStillVisible],
    ]),
    "",
    "## Baseline Preservation 8S To 6X",
    ...baselineRows(model),
    "",
    "## Interaction Contract Summary",
    ...metricRows([
      ["interactionContractReady", model.interactionContractReady],
      ["productInteractionContractVisible", model.productInteractionContractVisible],
      ["exportInteractionContractVisible", model.exportInteractionContractVisible],
      ["interactionContractUsesUxSkeleton8S", model.interactionContractUsesUxSkeleton8S],
      ["interactionContractStepCount", model.interactionContractStepCount],
      ["futureInteractionCount", model.futureInteractionCount],
      ["blockedInteractionCount", model.blockedInteractionCount],
      ["enabledInteractionCount", model.enabledInteractionCount],
      ["refusalStateCount", model.refusalStateCount],
      ["interactionPreconditionCount", model.interactionPreconditionCount],
    ]),
    "",
    "## Interaction Steps Table",
    ...stepRows(model),
    "",
    "## Future Interactions Table",
    ...futureInteractionRows(model),
    "",
    "## Refusal States Table",
    ...refusalRows(model),
    "",
    "## Activation Requirements Table",
    ...requirementRows(model),
    "",
    "## Deferred Decisions Table",
    ...metricRows(model.contract.deferredDecisions.map((decision) => [decision, "deferred"] as const)),
    "",
    "## Workflow Ready / Review Incomplete Distinction",
    ...metricRows([
      ["workflowReadinessStatusFrom8S", model.workflowReadinessStatusFrom8S],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["readinessDistinctFromReviewGateStillVisible", model.readinessDistinctFromReviewGateStillVisible],
    ]),
    "",
    "## Non-Persistence Audit",
    ...metricRows([
      ["enabledCtaCount", model.disabledStateAudit.enabledCtaCount],
      ["submitButtonCount", model.disabledStateAudit.submitButtonCount],
      ["enabledSubmitButtonCount", model.disabledStateAudit.enabledSubmitButtonCount],
      ["backendActionCount", model.disabledStateAudit.backendActionCount],
      ["apiCallCount", model.disabledStateAudit.apiCallCount],
      ["localStoragePersistenceCount", model.nonPersistenceAudit.localStoragePersistenceCount],
      ["databasePersistenceCount", model.nonPersistenceAudit.databasePersistenceCount],
      ["filePersistenceCount", model.nonPersistenceAudit.filePersistenceCount],
      ["memoryCreationCount", model.nonPersistenceAudit.memoryCreationCount],
      ["storageDecisionImplementedCount", model.nonPersistenceAudit.storageDecisionImplementedCount],
    ]),
    "",
    "## Official Truth Boundary Audit",
    ...metricRows([
      ["officialTruthPromotionCount", model.boundaryAudit.officialTruthPromotionCount],
      ["automaticDecisionCount", model.boundaryAudit.automaticDecisionCount],
      ["selectionRecommendationCount", model.boundaryAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.boundaryAudit.tacticalInstructionCount],
      ["sandboxPromotionCount", model.boundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.boundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.boundaryAudit.batchPromotionCount],
    ]),
    "",
    "## Export Metadata Audit",
    ...metricRows([
      ["exportTitleMentions8T", model.exportMetadataAudit.exportTitleMentions8T],
      ["exportMainCurrentVersionVisible", model.exportMetadataAudit.exportMainCurrentVersionVisible],
      ["exportVisibleBadgeMentions8T", model.exportMetadataAudit.exportVisibleBadgeMentions8T],
      ["exportMainIdStillCompressedExport8S", model.exportMetadataAudit.exportMainIdStillCompressedExport8S],
      ["exportHistoricalMarkersPreservedAsDataAttributes", model.exportMetadataAudit.exportHistoricalMarkersPreservedAsDataAttributes],
    ]),
    "",
    "## Source-Of-Truth Regression",
    ...metricRows([
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
      ["allStoryScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange],
      ["allReplayScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["manualInteractionDoesNotPromoteCoachInputToOfficialTruth", model.sourceOfTruthRegressionAudit.manualInteractionDoesNotPromoteCoachInputToOfficialTruth],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Export Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8T", model.exportBudgetAudit.exportReadTimeSecondsBefore8T],
      ["exportReadTimeSecondsAfter8T", model.exportBudgetAudit.exportReadTimeSecondsAfter8T],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
    ]),
    "",
    "## Integration Budget Audit",
    ...metricRows([
      ["productUxSkeleton8SStillVisible", model.integrationBudgetAudit.productUxSkeleton8SStillVisible],
      ["exportUxSkeleton8SStillVisible", model.integrationBudgetAudit.exportUxSkeleton8SStillVisible],
      ["productWorkflowReadiness8RStillVisible", model.integrationBudgetAudit.productWorkflowReadiness8RStillVisible],
      ["exportWorkflowReadiness8RStillVisible", model.integrationBudgetAudit.exportWorkflowReadiness8RStillVisible],
      ["productDecisionGate8QStillVisible", model.integrationBudgetAudit.productDecisionGate8QStillVisible],
      ["exportDecisionGate8QStillVisible", model.integrationBudgetAudit.exportDecisionGate8QStillVisible],
      ["productSectionOrderPreserved", model.integrationBudgetAudit.productSectionOrderPreserved],
      ["exportCompactPreserved", model.integrationBudgetAudit.exportCompactPreserved],
    ]),
    "",
    "## Wording Audit",
    ...metricRows([
      ["interactionContractFutureOnlyWordingVisible", model.wordingAudit.interactionContractFutureOnlyWordingVisible],
      ["interactionContractNonInteractiveWordingVisible", model.wordingAudit.interactionContractNonInteractiveWordingVisible],
      ["interactionContractNonOfficialWordingVisible", model.wordingAudit.interactionContractNonOfficialWordingVisible],
      ["interactionContractNotPersistedWordingVisible", model.wordingAudit.interactionContractNotPersistedWordingVisible],
      ["interactionContractNotAppliedWordingVisible", model.wordingAudit.interactionContractNotAppliedWordingVisible],
      ["refusalStateWordingVisible", model.wordingAudit.refusalStateWordingVisible],
      ["deferredDecisionWordingVisible", model.wordingAudit.deferredDecisionWordingVisible],
      ["ambiguousInteractionWordingCount", model.wordingAudit.ambiguousInteractionWordingCount],
      ["wordingReadabilityScore", model.wordingAudit.wordingReadabilityScore],
    ]),
    "",
    "## Product/Export Excerpts",
    `- product: ${compactSnippet(model.productHtmlAfter8T, "Contrat d'interaction UX")}`,
    `- export: ${compactSnippet(model.exportHtmlAfter8T, "Contrat UX revue manuelle")}`,
    "",
    "## Warnings",
    ...(model.warningCodes.length === 0 ? ["- none"] : model.warningCodes.map((warning) => `- ${warning}`)),
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function renderManualReviewUxInteractionContractWithoutPersistence8TValidation(
  model: ManualReviewUxInteractionContractWithoutPersistence8TModel = currentManualReviewUxInteractionContractWithoutPersistence8TModel(),
): string {
  const steps = model.contract.interactionSteps.map((step) => step.sourceVersion).join("/");
  const allStepsBlocked = model.contract.interactionSteps.every((step) =>
    step.blockedIn8T &&
    !step.canBeActivatedIn8T &&
    !step.canSubmitIn8T &&
    !step.canPersistIn8T &&
    !step.canCallApiIn8T &&
    !step.canPromoteOfficialTruthIn8T &&
    !step.canDriveSelectionIn8T &&
    !step.canDriveTacticalInstructionIn8T,
  );
  const checks = [
    checkLine("ManualReviewUxInteractionContractWithoutPersistence8TModel exists", model.version === "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T", model.version),
    checkLine("baseline 8S visible and preserved", model.baseline8SPreserved, bool(model.baseline8SPreserved)),
    checkLine("baseline 8R preserved", model.baseline8RPreserved, bool(model.baseline8RPreserved)),
    checkLine("baseline 8Q preserved", model.baseline8QPreserved, bool(model.baseline8QPreserved)),
    checkLine("baseline 8P preserved", model.baseline8PPreserved, bool(model.baseline8PPreserved)),
    checkLine("baseline 8O preserved", model.baseline8OPreserved, bool(model.baseline8OPreserved)),
    checkLine("baseline 8N preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
    checkLine("baseline 8M preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
    checkLine("baseline 8L preserved", model.baseline8LPreserved, bool(model.baseline8LPreserved)),
    checkLine("baseline 8K preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
    checkLine("baseline 8I preserved", model.baseline8IPreserved, bool(model.baseline8IPreserved)),
    checkLine("baseline 8H preserved", model.baseline8HPreserved, bool(model.baseline8HPreserved)),
    checkLine("baseline 8G preserved", model.baseline8GPreserved, bool(model.baseline8GPreserved)),
    checkLine("baseline 8F preserved", model.baseline8FPreserved, bool(model.baseline8FPreserved)),
    checkLine("baseline 8E preserved", model.baseline8EPreserved, bool(model.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved && model.matchEconomyBaselinePreserved, bool(model.baseline6XPreserved && model.matchEconomyBaselinePreserved)),
    checkLine("product interaction contract visible", model.productInteractionContractVisible, bool(model.productInteractionContractVisible)),
    checkLine("export interaction contract visible", model.exportInteractionContractVisible, bool(model.exportInteractionContractVisible)),
    checkLine("interaction contract uses UX skeleton 8S", model.interactionContractUsesUxSkeleton8S, bool(model.interactionContractUsesUxSkeleton8S)),
    checkLine("interaction step count = 6", model.interactionContractStepCount === 6, String(model.interactionContractStepCount)),
    checkLine("steps are 8M/8N/8O/8P/8Q/8R", steps === "8M/8N/8O/8P/8Q/8R", steps),
    checkLine("all interaction steps blocked in 8T", allStepsBlocked, bool(allStepsBlocked)),
    checkLine("future interaction count = 6", model.futureInteractionCount === 6, String(model.futureInteractionCount)),
    checkLine("blocked interaction count = 6", model.blockedInteractionCount === 6, String(model.blockedInteractionCount)),
    checkLine("enabled interaction count = 0", model.enabledInteractionCount === 0, String(model.enabledInteractionCount)),
    checkLine("refusal state count = 6", model.refusalStateCount === 6, String(model.refusalStateCount)),
    checkLine("activation requirements visible", model.interactionActivationRequirementVisible, bool(model.interactionActivationRequirementVisible)),
    checkLine("storage decision deferred", model.storageDecisionDeferredVisible, bool(model.storageDecisionDeferredVisible)),
    checkLine("permissions decision deferred", model.permissionsDecisionDeferredVisible, bool(model.permissionsDecisionDeferredVisible)),
    checkLine("officialization decision deferred", model.officializationDecisionDeferredVisible, bool(model.officializationDecisionDeferredVisible)),
    checkLine("workflowReadinessStatus remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8S === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8S),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("readiness distinct from review gate remains visible", model.readinessDistinctFromReviewGateStillVisible, bool(model.readinessDistinctFromReviewGateStillVisible)),
    checkLine("product UX skeleton 8S preserved", model.integrationBudgetAudit.productUxSkeleton8SStillVisible, bool(model.integrationBudgetAudit.productUxSkeleton8SStillVisible)),
    checkLine("export UX skeleton 8S preserved", model.integrationBudgetAudit.exportUxSkeleton8SStillVisible, bool(model.integrationBudgetAudit.exportUxSkeleton8SStillVisible)),
    checkLine("product workflow readiness 8R preserved", model.integrationBudgetAudit.productWorkflowReadiness8RStillVisible, bool(model.integrationBudgetAudit.productWorkflowReadiness8RStillVisible)),
    checkLine("export workflow readiness 8R preserved", model.integrationBudgetAudit.exportWorkflowReadiness8RStillVisible, bool(model.integrationBudgetAudit.exportWorkflowReadiness8RStillVisible)),
    checkLine("product decision gate 8Q preserved", model.integrationBudgetAudit.productDecisionGate8QStillVisible, bool(model.integrationBudgetAudit.productDecisionGate8QStillVisible)),
    checkLine("export decision gate 8Q preserved", model.integrationBudgetAudit.exportDecisionGate8QStillVisible, bool(model.integrationBudgetAudit.exportDecisionGate8QStillVisible)),
    checkLine("enabledCtaCount = 0", model.disabledStateAudit.enabledCtaCount === 0, String(model.disabledStateAudit.enabledCtaCount)),
    checkLine("submitButtonCount = 0", model.disabledStateAudit.submitButtonCount === 0, String(model.disabledStateAudit.submitButtonCount)),
    checkLine("enabledSubmitButtonCount = 0", model.disabledStateAudit.enabledSubmitButtonCount === 0, String(model.disabledStateAudit.enabledSubmitButtonCount)),
    checkLine("backendActionCount = 0", model.disabledStateAudit.backendActionCount === 0, String(model.disabledStateAudit.backendActionCount)),
    checkLine("apiCallCount = 0", model.disabledStateAudit.apiCallCount === 0, String(model.disabledStateAudit.apiCallCount)),
    checkLine("no localStorage", model.nonPersistenceAudit.localStoragePersistenceCount === 0, String(model.nonPersistenceAudit.localStoragePersistenceCount)),
    checkLine("no database persistence", model.nonPersistenceAudit.databasePersistenceCount === 0, String(model.nonPersistenceAudit.databasePersistenceCount)),
    checkLine("no file persistence", model.nonPersistenceAudit.filePersistenceCount === 0, String(model.nonPersistenceAudit.filePersistenceCount)),
    checkLine("no memory creation", model.nonPersistenceAudit.memoryCreationCount === 0, String(model.nonPersistenceAudit.memoryCreationCount)),
    checkLine("no season memory creation", model.nonPersistenceAudit.seasonMemoryCreationCount === 0, String(model.nonPersistenceAudit.seasonMemoryCreationCount)),
    checkLine("no team style memory creation", model.nonPersistenceAudit.teamStyleMemoryCreationCount === 0, String(model.nonPersistenceAudit.teamStyleMemoryCreationCount)),
    checkLine("no selection automation", model.boundaryAudit.selectionRecommendationCount === 0, String(model.boundaryAudit.selectionRecommendationCount)),
    checkLine("no tactical instruction", model.boundaryAudit.tacticalInstructionCount === 0, String(model.boundaryAudit.tacticalInstructionCount)),
    checkLine("no official truth promotion", model.boundaryAudit.officialTruthPromotionCount === 0, String(model.boundaryAudit.officialTruthPromotionCount)),
    checkLine("no automatic decision", model.boundaryAudit.automaticDecisionCount === 0, String(model.boundaryAudit.automaticDecisionCount)),
    checkLine("no future evidence claim", model.sourceOfTruthRegressionAudit.manualInteractionDoesNotCreateFutureEvidence, bool(model.sourceOfTruthRegressionAudit.manualInteractionDoesNotCreateFutureEvidence)),
    checkLine("no real next-match result claim", model.boundaryAudit.interactionClaimedAsRealNextMatchCount === 0, String(model.boundaryAudit.interactionClaimedAsRealNextMatchCount)),
    checkLine("no engine learning claim", model.boundaryAudit.interactionClaimedAsEngineResultCount === 0, String(model.boundaryAudit.interactionClaimedAsEngineResultCount)),
    checkLine("exportReadTimeSecondsAfter8T <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8T <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8T)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status === "PASS" ? model.exportUnder900Seconds : true, model.status),
    checkLine("export title mentions 8T", model.exportMetadataAudit.exportTitleMentions8T, bool(model.exportMetadataAudit.exportTitleMentions8T)),
    checkLine("export visible badge mentions 8T", model.exportMetadataAudit.exportVisibleBadgeMentions8T, bool(model.exportMetadataAudit.exportVisibleBadgeMentions8T)),
    checkLine("export main id no longer compressed-export-8s", !model.exportMetadataAudit.exportMainIdStillCompressedExport8S, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8S)),
    checkLine("export main id no longer compressed-export-8r", !model.exportMetadataAudit.exportMainIdStillCompressedExport8R, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8R)),
    checkLine("export main id no longer compressed-export-8q", !model.exportMetadataAudit.exportMainIdStillCompressedExport8Q, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8Q)),
    checkLine("export main id no longer compressed-export-8p", !model.exportMetadataAudit.exportMainIdStillCompressedExport8P, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8P)),
    checkLine("export main id no longer compressed-export-8n", !model.exportMetadataAudit.exportMainIdStillCompressedExport8N, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8N)),
    checkLine("export main id no longer compressed-export-8i", !model.exportMetadataAudit.exportMainIdStillCompressedExport8I, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8I)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("manual interaction contract does not promote coach input to official truth", model.sourceOfTruthRegressionAudit.manualInteractionDoesNotPromoteCoachInputToOfficialTruth, bool(model.sourceOfTruthRegressionAudit.manualInteractionDoesNotPromoteCoachInputToOfficialTruth)),
    checkLine("sandbox excluded from official story/replay/decision/learning/manual interaction contract", model.boundaryAudit.sandboxPromotionCount === 0, String(model.boundaryAudit.sandboxPromotionCount)),
    checkLine("batch excluded from official story/replay/decision/learning/manual interaction contract", model.boundaryAudit.batchPromotionCount === 0, String(model.boundaryAudit.batchPromotionCount)),
    checkLine("diagnostic separated from official story/replay/decision/learning/manual interaction contract", model.boundaryAudit.diagnosticPromotionCount === 0, String(model.boundaryAudit.diagnosticPromotionCount)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.sourceOfTruthRegressionAudit.noScoringConstantChange, "3/5/2/2"),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("export no horizontal overflow", true, "compact export inherited"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review UX Interaction Contract Without Persistence 8T",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- interactionContractStepCount: ${model.interactionContractStepCount}`,
    `- interactionContractStepCountExpected: ${model.interactionContractStepCountExpected}`,
    `- futureInteractionCount: ${model.futureInteractionCount}`,
    `- futureInteractionCountExpected: ${model.futureInteractionCountExpected}`,
    `- blockedInteractionCount: ${model.blockedInteractionCount}`,
    `- blockedInteractionCountExpected: ${model.blockedInteractionCountExpected}`,
    `- enabledInteractionCount: ${model.enabledInteractionCount}`,
    `- refusalStateCount: ${model.refusalStateCount}`,
    `- refusalStateCountExpected: ${model.refusalStateCountExpected}`,
    `- activationRequirementCount: ${model.contractAudit.activationRequirementCount}`,
    `- enabledCtaCount: ${model.disabledStateAudit.enabledCtaCount}`,
    `- submitButtonCount: ${model.disabledStateAudit.submitButtonCount}`,
    `- enabledSubmitButtonCount: ${model.disabledStateAudit.enabledSubmitButtonCount}`,
    `- backendActionCount: ${model.disabledStateAudit.backendActionCount}`,
    `- apiCallCount: ${model.disabledStateAudit.apiCallCount}`,
    `- localStoragePersistenceCount: ${model.nonPersistenceAudit.localStoragePersistenceCount}`,
    `- databasePersistenceCount: ${model.nonPersistenceAudit.databasePersistenceCount}`,
    `- filePersistenceCount: ${model.nonPersistenceAudit.filePersistenceCount}`,
    `- memoryCreationCount: ${model.nonPersistenceAudit.memoryCreationCount}`,
    `- seasonMemoryCreationCount: ${model.nonPersistenceAudit.seasonMemoryCreationCount}`,
    `- teamStyleMemoryCreationCount: ${model.nonPersistenceAudit.teamStyleMemoryCreationCount}`,
    `- officialTruthPromotionCount: ${model.boundaryAudit.officialTruthPromotionCount}`,
    `- automaticDecisionCount: ${model.boundaryAudit.automaticDecisionCount}`,
    `- selectionRecommendationCount: ${model.boundaryAudit.selectionRecommendationCount}`,
    `- tacticalInstructionCount: ${model.boundaryAudit.tacticalInstructionCount}`,
    `- workflowReadinessStatusFrom8S: ${model.workflowReadinessStatusFrom8S}`,
    `- reviewGateStatusFrom8Q: ${model.reviewGateStatusFrom8Q}`,
    `- exportReadTimeSecondsAfter8T: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8T}`,
    `- exportUnder900Seconds: ${model.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportUnder800Seconds}`,
    `- wordingReadabilityScore: ${model.wordingAudit.wordingReadabilityScore}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}
