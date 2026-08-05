import { scoringRegistryEntry } from "../systems/scoring";
import {
  currentManualReviewUxInteractionContractWithoutPersistence8TModel,
} from "./buildManualReviewUxInteractionContractWithoutPersistence8T";
import {
  auditManualReviewInputFieldBoundary8U,
  auditManualReviewInputFieldContract8U,
  auditManualReviewInputFieldDisabledState8U,
  auditManualReviewInputFieldExportBudget8U,
  auditManualReviewInputFieldExportMetadata8U,
  auditManualReviewInputFieldIntegration8U,
  auditManualReviewInputFieldNonPersistence8U,
  auditManualReviewInputFieldWording8U,
  scoringConstantsUnchangedForManualReviewInputField8U,
} from "./manualReviewInputFieldContractAudit8U";
import type {
  ManualReviewInputActivationRequirement8U,
  ManualReviewInputBoundary8U,
  ManualReviewInputErrorState8U,
  ManualReviewInputField8U,
  ManualReviewInputFieldContract8U,
  ManualReviewInputFieldContractWithoutPersistence8UModel,
  ManualReviewInputFieldSection8U,
  ManualReviewInputRefusalState8U,
  ManualReviewInputValidationRule8U,
} from "./manualReviewInputFieldContractTypes8U";
import {
  MANUAL_REVIEW_INPUT_FIELD_CONTRACT_8U_BLOCKING_WARNINGS,
  type ManualReviewInputFieldContractWarningCode8U,
} from "./manualReviewInputFieldContractWarnings8U";
import type { ManualReviewUxInteractionContractWithoutPersistence8TModel } from "./manualReviewUxInteractionContractTypes8T";
import {
  insertManualReviewInputFieldContractExport8U,
  renderManualReviewInputFieldContractExport8U,
} from "./renderManualReviewInputFieldContractExport8U";
import {
  insertManualReviewInputFieldContractProduct8U,
  renderManualReviewInputFieldContractProduct8U,
} from "./renderManualReviewInputFieldContractProduct8U";

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
  warnings: readonly ManualReviewInputFieldContractWarningCode8U[],
): readonly ManualReviewInputFieldContractWarningCode8U[] {
  return [...new Set(warnings)];
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 120);
  return html.slice(start, start + 1000).replace(/\s+/gu, " ");
}

function sectionSeeds(): readonly Omit<ManualReviewInputFieldSection8U, "fieldIds">[] {
  return [
    {
      sectionId: "first-exit-after-recovery-8u",
      linked8MReviewSectionId: "manual-review-section-first-exit-8m",
      linked8LObservationCardId: "seasonless-observation-card-first-exit-8l",
      linked8KDecisionCardId: "coach-decision-card-first-exit-8k",
      sectionOrder: 1,
      sectionTitle: "Premiere sortie apres recuperation",
      sectionQuestion: "La premiere sortie apres recuperation a-t-elle confirme le plan d'observation ?",
      disabledIn8U: true,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      sectionId: "danger-zone-continuity-8u",
      linked8MReviewSectionId: "manual-review-section-danger-continuity-8m",
      linked8LObservationCardId: "seasonless-observation-card-danger-continuity-8l",
      linked8KDecisionCardId: "coach-decision-card-danger-continuity-8k",
      sectionOrder: 2,
      sectionTitle: "Continuite apres entree en zone dangereuse",
      sectionQuestion: "L'entree en zone dangereuse a-t-elle produit une continuite credible ?",
      disabledIn8U: true,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      sectionId: "neutralized-action-structure-8u",
      linked8MReviewSectionId: "manual-review-section-neutralized-action-8m",
      linked8LObservationCardId: "seasonless-observation-card-neutralized-action-8l",
      linked8KDecisionCardId: "coach-decision-card-neutralized-action-8k",
      sectionOrder: 3,
      sectionTitle: "Structure apres action neutralisee",
      sectionQuestion: "L'equipe a-t-elle conserve une structure lisible apres action neutralisee ?",
      disabledIn8U: true,
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildFieldsForSection(sectionId: string): readonly ManualReviewInputField8U[] {
  return [
    {
      fieldId: `${sectionId}-outcome-select`,
      sectionId,
      linked8MFieldKind: "outcome_select",
      fieldOrder: 1,
      coachFacingLabel: "Resultat de l'observation",
      fieldKind: "enum_select",
      expectedValueType: "confirmed_contradicted_inconclusive_insufficient_sample",
      allowedValues: ["confirmed", "contradicted", "inconclusive", "insufficient_sample"],
      requiredLater: true,
      optionalLater: false,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "A choisir plus tard",
      helpText: "Choix manuel coach, non officiel, jamais automatique.",
      validationRuleIds: ["outcome_must_be_known_enum", "required_fields_missing_blocks_future_preview"],
      errorStateIds: ["UNKNOWN_OUTCOME_VALUE_8U", "REQUIRED_FIELD_MISSING_8U"],
      refusalStateId: "REAL_FIELD_INPUT_NOT_ENABLED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      fieldId: `${sectionId}-comparable-situation-count`,
      sectionId,
      linked8MFieldKind: "comparable_situation_count",
      fieldOrder: 2,
      coachFacingLabel: "Nombre de situations comparables",
      fieldKind: "integer",
      expectedValueType: "integer_0_99",
      minValue: 0,
      maxValue: 99,
      requiredLater: true,
      optionalLater: false,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "0",
      helpText: "Nombre futur de situations comparables, documente sans traitement en 8U.",
      validationRuleIds: ["comparable_count_must_be_integer_0_99", "required_fields_missing_blocks_future_preview"],
      errorStateIds: ["COMPARABLE_COUNT_OUT_OF_RANGE_8U", "REQUIRED_FIELD_MISSING_8U"],
      refusalStateId: "FIELD_VALIDATION_NOT_ENABLED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      fieldId: `${sectionId}-positive-signal-count`,
      sectionId,
      linked8MFieldKind: "positive_signal_count",
      fieldOrder: 3,
      coachFacingLabel: "Signaux positifs",
      fieldKind: "integer",
      expectedValueType: "integer_0_99",
      minValue: 0,
      maxValue: 99,
      requiredLater: false,
      optionalLater: true,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "0",
      helpText: "Signal futur optionnel, non stocke et non applique en 8U.",
      validationRuleIds: ["positive_count_must_be_integer_0_99", "signal_counts_cannot_exceed_comparable_count"],
      errorStateIds: ["SIGNAL_COUNT_OUT_OF_RANGE_8U", "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8U"],
      refusalStateId: "FIELD_VALIDATION_NOT_ENABLED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      fieldId: `${sectionId}-negative-signal-count`,
      sectionId,
      linked8MFieldKind: "negative_signal_count",
      fieldOrder: 4,
      coachFacingLabel: "Signaux negatifs",
      fieldKind: "integer",
      expectedValueType: "integer_0_99",
      minValue: 0,
      maxValue: 99,
      requiredLater: false,
      optionalLater: true,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "0",
      helpText: "Signal futur optionnel, sans decision automatique.",
      validationRuleIds: ["negative_count_must_be_integer_0_99", "signal_counts_cannot_exceed_comparable_count"],
      errorStateIds: ["SIGNAL_COUNT_OUT_OF_RANGE_8U", "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8U"],
      refusalStateId: "FIELD_VALIDATION_NOT_ENABLED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      fieldId: `${sectionId}-context-comparability-select`,
      sectionId,
      linked8MFieldKind: "context_comparability_select",
      fieldOrder: 5,
      coachFacingLabel: "Contexte comparable",
      fieldKind: "enum_select",
      expectedValueType: "yes_no_uncertain",
      allowedValues: ["yes", "no", "uncertain"],
      requiredLater: true,
      optionalLater: false,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "A choisir plus tard",
      helpText: "Le contexte sera choisi manuellement plus tard; rien n'est traite en 8U.",
      validationRuleIds: ["context_comparability_must_be_known_enum", "required_fields_missing_blocks_future_preview"],
      errorStateIds: ["UNKNOWN_CONTEXT_COMPARABILITY_8U", "REQUIRED_FIELD_MISSING_8U"],
      refusalStateId: "REAL_FIELD_INPUT_NOT_ENABLED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      fieldId: `${sectionId}-short-evidence-note`,
      sectionId,
      linked8MFieldKind: "short_evidence_note",
      fieldOrder: 6,
      coachFacingLabel: "Preuve courte",
      fieldKind: "short_text",
      expectedValueType: "text",
      maxLength: 180,
      requiredLater: false,
      optionalLater: true,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "Ex. 4 recuperations, 3 sorties propres",
      helpText: "Trace coach future, courte, non officielle et non persistee en 8U.",
      validationRuleIds: ["short_evidence_note_max_180"],
      errorStateIds: ["SHORT_EVIDENCE_NOTE_TOO_LONG_8U"],
      refusalStateId: "FIELD_TO_PAYLOAD_NOT_ENABLED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      fieldId: `${sectionId}-coach-free-note`,
      sectionId,
      linked8MFieldKind: "coach_free_note",
      fieldOrder: 7,
      coachFacingLabel: "Note coach",
      fieldKind: "long_text",
      expectedValueType: "text",
      maxLength: 800,
      requiredLater: false,
      optionalLater: true,
      disabledIn8U: true,
      activeIn8U: false,
      readOnlyIn8U: true,
      placeholder: "Note libre a renseigner plus tard",
      helpText: "Note libre future; non stockee, non officielle et jamais traitee dans 8U.",
      validationRuleIds: ["coach_free_note_max_800"],
      errorStateIds: ["COACH_FREE_NOTE_TOO_LONG_8U"],
      refusalStateId: "FIELD_STORAGE_NOT_DECIDED_8U",
      canSubmitIn8U: false,
      canPersistIn8U: false,
      canCallApiIn8U: false,
      canPromoteOfficialTruthIn8U: false,
      canDriveSelectionIn8U: false,
      canDriveTacticalInstructionIn8U: false,
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildValidationRules(): readonly ManualReviewInputValidationRule8U[] {
  const rows: readonly [string, string, readonly string[], string, string][] = [
    ["outcome_must_be_known_enum", "Resultat connu", ["outcome_select"], "UNKNOWN_OUTCOME_VALUE_8U", "Le resultat futur doit etre confirmed, contradicted, inconclusive ou insufficient_sample."],
    ["comparable_count_must_be_integer_0_99", "Compteurs comparables 0-99", ["integer"], "COMPARABLE_COUNT_OUT_OF_RANGE_8U", "Le nombre de situations comparables doit etre un entier entre 0 et 99."],
    ["positive_count_must_be_integer_0_99", "Signaux positifs 0-99", ["integer"], "SIGNAL_COUNT_OUT_OF_RANGE_8U", "Les signaux positifs doivent rester entre 0 et 99."],
    ["negative_count_must_be_integer_0_99", "Signaux negatifs 0-99", ["integer"], "SIGNAL_COUNT_OUT_OF_RANGE_8U", "Les signaux negatifs doivent rester entre 0 et 99."],
    ["signal_counts_cannot_exceed_comparable_count", "Signaux <= comparables", ["integer"], "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8U", "Les signaux positifs et negatifs ne peuvent pas depasser le nombre comparable."],
    ["context_comparability_must_be_known_enum", "Contexte connu", ["context_comparability_select"], "UNKNOWN_CONTEXT_COMPARABILITY_8U", "Le contexte futur doit etre yes, no ou uncertain."],
    ["short_evidence_note_max_180", "Preuve courte <= 180", ["short_text"], "SHORT_EVIDENCE_NOTE_TOO_LONG_8U", "La preuve courte future est limitee a 180 caracteres."],
    ["coach_free_note_max_800", "Note coach <= 800", ["long_text"], "COACH_FREE_NOTE_TOO_LONG_8U", "La note coach future est limitee a 800 caracteres."],
    ["required_fields_missing_blocks_future_preview", "Champs requis presents", ["outcome_select", "integer", "context_comparability_select"], "REQUIRED_FIELD_MISSING_8U", "Une preview future serait bloquee si un champ requis manque."],
    ["insufficient_sample_requires_low_count_or_manual_reason", "Echantillon insuffisant coherent", ["outcome_select", "integer", "long_text"], "INSUFFICIENT_SAMPLE_WITH_HIGH_COUNT_8U", "insufficient_sample doit rester coherent avec un faible volume ou une raison manuelle."],
    ["confirmed_requires_context_yes_or_manual_caution", "Confirmed contextualise", ["outcome_select", "context_comparability_select"], "CONFIRMED_WITH_UNCERTAIN_CONTEXT_8U", "confirmed exige un contexte comparable ou un avertissement manuel."],
    ["contradicted_requires_negative_signal_or_manual_caution", "Contradicted etaye", ["outcome_select", "integer"], "CONTRADICTED_WITHOUT_NEGATIVE_SIGNAL_8U", "contradicted exige un signal negatif ou un avertissement manuel."],
  ];
  return rows.map(([ruleId, label, appliesToFieldKinds, futureFailureCode, ruleText]) => ({
    ruleId,
    label,
    appliesToFieldKinds,
    activeIn8U: false,
    futureFailureCode,
    ruleText,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function buildErrorStates(): readonly ManualReviewInputErrorState8U[] {
  const ids = [
    "UNKNOWN_OUTCOME_VALUE_8U",
    "COMPARABLE_COUNT_OUT_OF_RANGE_8U",
    "SIGNAL_COUNT_OUT_OF_RANGE_8U",
    "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8U",
    "UNKNOWN_CONTEXT_COMPARABILITY_8U",
    "SHORT_EVIDENCE_NOTE_TOO_LONG_8U",
    "COACH_FREE_NOTE_TOO_LONG_8U",
    "REQUIRED_FIELD_MISSING_8U",
    "INSUFFICIENT_SAMPLE_WITH_HIGH_COUNT_8U",
    "CONFIRMED_WITH_UNCERTAIN_CONTEXT_8U",
    "CONTRADICTED_WITHOUT_NEGATIVE_SIGNAL_8U",
  ] as const;
  return ids.map((errorStateId) => ({
    errorStateId,
    label: errorStateId.toLowerCase().replace(/_/gu, " "),
    activeIn8U: false,
    coachFacingMessage: `Erreur future documentee: ${errorStateId}. Inactive en 8U.`,
    blocksFuturePreview: true,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function buildRefusalStates(): readonly ManualReviewInputRefusalState8U[] {
  const rows: readonly (readonly [string, string, string])[] = [
    ["REAL_FIELD_INPUT_NOT_ENABLED_8U", "Ces champs decrivent une future saisie, mais aucune donnee reelle n'est traitee dans 8U.", "no real field input pipeline"],
    ["FIELD_VALIDATION_NOT_ENABLED_8U", "La validation de champ est documentee mais inactive.", "validation rules are future-only"],
    ["FIELD_TO_PAYLOAD_NOT_ENABLED_8U", "Aucun payload n'est cree depuis ces champs.", "field to payload mapping is not active"],
    ["FIELD_TO_PREVIEW_NOT_ENABLED_8U", "Aucune preview reelle n'est generee depuis ces champs.", "preview generation from fields is not active"],
    ["FIELD_STORAGE_NOT_DECIDED_8U", "Aucun stockage ou historique n'est cree.", "storage policy is deferred"],
    ["FIELD_OFFICIALIZATION_FORBIDDEN_8U", "Une note coach ne devient jamais verite officielle dans 8U.", "official truth boundary forbids promotion"],
  ];
  return rows.map(([refusalStateId, coachFacingMessage, technicalReason]) => ({
    refusalStateId,
    coachFacingMessage,
    technicalReason,
    prevents: ["real input", "payload", "preview", "storage", "official truth", "selection", "tactic"],
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function buildActivationRequirements(): readonly ManualReviewInputActivationRequirement8U[] {
  const rows: readonly [string, string, string][] = [
    ["real_input_component_design", "Design composant de saisie reel", "real input"],
    ["controlled_field_state_model", "Modele d'etat controle", "field state"],
    ["field_validation_messages", "Messages de validation", "validation UX"],
    ["keyboard_navigation_and_focus", "Navigation clavier et focus", "accessibility"],
    ["accessible_labels_and_descriptions", "Labels et descriptions accessibles", "accessibility"],
    ["abandon_without_save_policy", "Politique abandon sans sauvegarde", "non persistence"],
    ["draft_policy_decision", "Decision brouillon", "draft storage"],
    ["payload_creation_boundary", "Frontiere payload", "payload"],
    ["storage_product_decision", "Decision produit stockage", "storage"],
    ["permissions_and_access_control", "Permissions et acces", "security"],
    ["history_policy", "Politique historique", "history"],
    ["official_truth_boundary_policy", "Politique official truth", "source-of-truth"],
    ["error_recovery_policy", "Politique recovery erreur", "error recovery"],
    ["audit_logging_policy_if_storage_later", "Audit logging si stockage futur", "audit log"],
  ];
  return rows.map(([requirementId, label, boundaryProtected]) => ({
    requirementId,
    label,
    requiredBeforeActivation: true,
    satisfiedIn8U: false,
    rationale: "Condition requise avant toute activation future; non satisfaite dans 8U.",
    boundaryProtected,
  }));
}

function buildBoundaries(): readonly ManualReviewInputBoundary8U[] {
  const rows: readonly (readonly [string, string])[] = [
    ["real_input_processing", "Aucune saisie reelle traitee"],
    ["payload_creation", "Aucun payload cree"],
    ["preview_generation", "Aucune preview reelle generee"],
    ["persistence", "Aucun stockage, historique ou memoire"],
    ["submit_api_backend", "Aucun submit, API ou backend"],
    ["official_truth_promotion", "Aucune promotion source-of-truth"],
    ["score_timeline_event_mutation", "Aucune mutation score, timeline, event ou score_change"],
    ["decision_selection_tactic", "Aucune decision automatique, selection ou consigne tactique"],
    ["claims_and_promotions", "Aucune pretention de resultat officiel ou tendance reelle"],
  ];
  return rows.map(([boundaryId, label]) => ({
    boundaryId,
    label,
    prevents: ["real input", "payload", "preview", "persistence", "official truth", "score", "timeline", "decision", "selection", "tactic"],
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function buildContract(): ManualReviewInputFieldContract8U {
  const fields = sectionSeeds().flatMap((section) => buildFieldsForSection(section.sectionId));
  const fieldSections = sectionSeeds().map((section) => ({
    ...section,
    fieldIds: fields.filter((field) => field.sectionId === section.sectionId).map((field) => field.fieldId),
  }));
  return {
    contractId: "manual-review-input-field-contract-8u",
    contractMode: "future_input_field_contract_only",
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
    fieldSections,
    fields,
    validationRules: buildValidationRules(),
    errorStates: buildErrorStates(),
    refusalStates: buildRefusalStates(),
    activationRequirements: buildActivationRequirements(),
    deferredDecisions: [
      "real input activation",
      "payload creation",
      "preview generation from fields",
      "storage and draft policy",
      "permissions and access control",
      "official truth boundary policy",
      "history policy",
      "audit logging policy",
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
  warnings: readonly ManualReviewInputFieldContractWarningCode8U[],
  exportUnder900: boolean,
  exportUnder800: boolean,
): "PASS" | "PARTIAL" | "FAIL" {
  if (!exportUnder900) return "FAIL";
  if (warnings.some((warning) => MANUAL_REVIEW_INPUT_FIELD_CONTRACT_8U_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  if (!exportUnder800) return "PARTIAL";
  return warnings.length === 0 ? "PASS" : "PARTIAL";
}

export function buildManualReviewInputFieldContractWithoutPersistence8UModel(input?: {
  readonly baseline8T?: ManualReviewUxInteractionContractWithoutPersistence8TModel;
  readonly productHtmlBefore8U?: string;
  readonly exportHtmlBefore8U?: string;
}): ManualReviewInputFieldContractWithoutPersistence8UModel {
  const baseline8T = input?.baseline8T ?? currentManualReviewUxInteractionContractWithoutPersistence8TModel();
  if (baseline8T.status !== "PASS") {
    throw new Error(`Manual review input field contract 8U requires PASS 8T baseline, got ${baseline8T.status}.`);
  }
  const productHtmlBefore8U = input?.productHtmlBefore8U ?? baseline8T.productHtmlAfter8T;
  const exportHtmlBefore8U = input?.exportHtmlBefore8U ?? baseline8T.exportHtmlAfter8T;
  const contract = buildContract();
  const productInputFieldContractHtml = renderManualReviewInputFieldContractProduct8U(contract);
  const exportInputFieldContractHtml = renderManualReviewInputFieldContractExport8U(contract);
  const productHtmlAfter8U = insertManualReviewInputFieldContractProduct8U(productHtmlBefore8U, productInputFieldContractHtml);
  const exportHtmlAfter8U = insertManualReviewInputFieldContractExport8U(exportHtmlBefore8U, exportInputFieldContractHtml);
  const contractAudit = auditManualReviewInputFieldContract8U({ contract, productHtml: productHtmlAfter8U, exportHtml: exportHtmlAfter8U });
  const disabledStateAudit = auditManualReviewInputFieldDisabledState8U({ contract, productHtml: productHtmlAfter8U, exportHtml: exportHtmlAfter8U });
  const nonPersistenceAudit = auditManualReviewInputFieldNonPersistence8U({ productHtml: productHtmlAfter8U, exportHtml: exportHtmlAfter8U });
  const boundaryAudit = auditManualReviewInputFieldBoundary8U({ productHtml: productHtmlAfter8U, exportHtml: exportHtmlAfter8U });
  const exportMetadataAudit = auditManualReviewInputFieldExportMetadata8U(exportHtmlAfter8U);
  const exportBudgetAudit = auditManualReviewInputFieldExportBudget8U({ exportHtmlBefore8U, exportHtmlAfter8U });
  const integrationAudit = auditManualReviewInputFieldIntegration8U({ productHtml: productHtmlAfter8U, exportHtml: exportHtmlAfter8U });
  const wordingAudit = auditManualReviewInputFieldWording8U({ productHtml: productHtmlAfter8U, exportHtml: exportHtmlAfter8U });
  const warningCodes = uniqueWarnings([
    ...contractAudit.contractWarningCodes,
    ...disabledStateAudit.disabledStateWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...boundaryAudit.boundaryWarningCodes,
    ...exportMetadataAudit.metadataWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
  ]);
  const status = statusFromWarnings(warningCodes, exportBudgetAudit.exportUnder900Seconds, exportBudgetAudit.exportUnder800Seconds);
  const baseline8TPreserved = baseline8T.status === "PASS" && baseline8T.interactionContractReady;
  return {
    status,
    scope: "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_8U",
    baselineVersion: "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T",
    matchId: baseline8T.matchId,
    officialScore: baseline8T.officialScore,
    baseline8T,
    baseline8TPreserved,
    baseline8SPreserved: baseline8T.baseline8SPreserved,
    baseline8RPreserved: baseline8T.baseline8RPreserved,
    baseline8QPreserved: baseline8T.baseline8QPreserved,
    baseline8PPreserved: baseline8T.baseline8PPreserved,
    baseline8OPreserved: baseline8T.baseline8OPreserved,
    baseline8NPreserved: baseline8T.baseline8NPreserved,
    baseline8MPreserved: baseline8T.baseline8MPreserved,
    baseline8LPreserved: baseline8T.baseline8LPreserved,
    baseline8KPreserved: baseline8T.baseline8KPreserved,
    baseline8IPreserved: baseline8T.baseline8IPreserved,
    baseline8HPreserved: baseline8T.baseline8HPreserved,
    baseline8GPreserved: baseline8T.baseline8GPreserved,
    baseline8FPreserved: baseline8T.baseline8FPreserved,
    baseline8EPreserved: baseline8T.baseline8EPreserved,
    baseline8DPreserved: baseline8T.baseline8DPreserved,
    baseline8CPreserved: baseline8T.baseline8CPreserved,
    baseline8BPreserved: baseline8T.baseline8BPreserved,
    baseline8APreserved: baseline8T.baseline8APreserved,
    baseline7HPreserved: baseline8T.baseline7HPreserved,
    baseline6XPreserved: baseline8T.baseline6XPreserved,
    inputFieldContractReady: status === "PASS",
    productInputFieldContractVisible: contractAudit.productInputFieldContractVisible,
    exportInputFieldContractVisible: contractAudit.exportInputFieldContractVisible,
    inputFieldContractUsesInteractionContract8T: contractAudit.inputFieldContractUsesInteractionContract8T,
    sectionCount: contractAudit.sectionCount,
    fieldCount: contractAudit.fieldCount,
    disabledFieldCount: contractAudit.disabledFieldCount,
    activeFieldCount: contractAudit.activeFieldCount,
    enabledInputControlCount: disabledStateAudit.enabledInputControlCount,
    editableTextFieldCount: disabledStateAudit.editableTextFieldCount,
    enabledSelectControlCount: disabledStateAudit.enabledSelectControlCount,
    enabledCheckboxControlCount: disabledStateAudit.enabledCheckboxControlCount,
    validationRuleCount: contractAudit.validationRuleCount,
    activeValidationRuleCount: contractAudit.activeValidationRuleCount,
    errorStateCount: contractAudit.errorStateCount,
    activeErrorStateCount: contractAudit.activeErrorStateCount,
    refusalStateCount: contractAudit.refusalStateCount,
    activationRequirementCount: contractAudit.activationRequirementCount,
    deferredDecisionCount: contractAudit.deferredDecisionCount,
    workflowReadinessStatusFrom8S: "ready_for_non_persistent_preview",
    reviewGateStatusFrom8Q: "needs_completion",
    readinessDistinctFromReviewGateStillVisible: baseline8T.readinessDistinctFromReviewGateStillVisible,
    contractMarkedFutureOnly: wordingAudit.futureOnlyWordingVisible,
    contractMarkedDisabled: wordingAudit.disabledWordingVisible,
    contractMarkedNonOfficial: wordingAudit.nonOfficialWordingVisible,
    contractMarkedNotPersisted: wordingAudit.notPersistedWordingVisible,
    contractMarkedNotApplied: wordingAudit.notAppliedWordingVisible,
    contractDoesNotCreateRealInput: disabledStateAudit.enabledInputControlCount === 0 && contract.fields.every((field) => !field.activeIn8U),
    contractDoesNotCreateSubmit: disabledStateAudit.submitButtonCount === 0 && disabledStateAudit.enabledSubmitButtonCount === 0,
    contractDoesNotCreateApi: disabledStateAudit.apiCallCount === 0 && nonPersistenceAudit.apiCallCount === 0,
    contractDoesNotCreateBackend: disabledStateAudit.backendActionCount === 0 && nonPersistenceAudit.backendSubmitActionCount === 0,
    contractDoesNotCreateStorage: !nonPersistenceAudit.fieldPersistencePerformed,
    contractDoesNotCreateMemory: nonPersistenceAudit.memoryCreationCount === 0,
    contractDoesNotCreatePayload: nonPersistenceAudit.payloadCreationCount === 0,
    contractDoesNotCreateRealPreview: nonPersistenceAudit.realPreviewGenerationCount === 0,
    contractDoesNotPromoteOfficialTruth: boundaryAudit.officialTruthPromotionCount === 0,
    contractDoesNotCreateAutomaticDecision: boundaryAudit.automaticDecisionCount === 0,
    contractDoesNotDriveSelection: boundaryAudit.selectionRecommendationCount === 0,
    contractDoesNotDriveTacticalInstruction: boundaryAudit.tacticalInstructionCount === 0,
    productStoryFirstPreserved: integrationAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationAudit.exportCompactPreserved,
    exportMetadataCurrent8UVisible: exportMetadataAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved: baseline8T.sourceOfTruthSeparationPreserved && boundaryAudit.boundaryWarningCodes.length === 0,
    matchEconomyBaselinePreserved: baseline8T.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8T.guardrailsPreserved && scoringConstantsUnchangedForManualReviewInputField8U(),
    contract,
    productInputFieldContractHtml,
    exportInputFieldContractHtml,
    productHtmlAfter8U,
    exportHtmlAfter8U,
    contractAudit,
    disabledStateAudit,
    nonPersistenceAudit,
    boundaryAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    integrationAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_INPUT_FIELD_CONTRACT" : "REVIEW_MANUAL_REVIEW_INPUT_FIELD_CONTRACT",
    nextSprintRecommendation: status === "PASS"
      ? "8V - Manual Review Field UX Visual Readiness"
      : "8V - Input Field Contract Guardrail Cleanup",
  };
}

export function currentManualReviewInputFieldContractWithoutPersistence8UModel(): ManualReviewInputFieldContractWithoutPersistence8UModel {
  return buildManualReviewInputFieldContractWithoutPersistence8UModel({
    baseline8T: currentManualReviewUxInteractionContractWithoutPersistence8TModel(),
  });
}

function baselineRows(model: ManualReviewInputFieldContractWithoutPersistence8UModel): readonly string[] {
  return metricRows([
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

function fieldRows(model: ManualReviewInputFieldContractWithoutPersistence8UModel): readonly string[] {
  return table([
    ["Section", "Order", "Field", "Kind", "Expected", "Required later", "Active 8U", "Can submit", "Can persist", "Can officialize"],
    ...model.contract.fields.map((field) => [
      field.sectionId,
      String(field.fieldOrder),
      field.coachFacingLabel,
      field.fieldKind,
      field.expectedValueType,
      bool(field.requiredLater),
      bool(field.activeIn8U),
      bool(field.canSubmitIn8U),
      bool(field.canPersistIn8U),
      bool(field.canPromoteOfficialTruthIn8U),
    ]),
  ]);
}

function validationRuleRows(model: ManualReviewInputFieldContractWithoutPersistence8UModel): readonly string[] {
  return table([
    ["Rule", "Active 8U", "Future failure", "Text"],
    ...model.contract.validationRules.map((rule) => [
      rule.ruleId,
      bool(rule.activeIn8U),
      rule.futureFailureCode,
      rule.ruleText,
    ]),
  ]);
}

export function renderManualReviewInputFieldContractWithoutPersistence8UDoc(
  model: ManualReviewInputFieldContractWithoutPersistence8UModel = currentManualReviewInputFieldContractWithoutPersistence8UModel(),
): string {
  return [
    "# Manual Review Input Field Contract Without Persistence 8U",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Baseline 8T Summary",
    ...metricRows([
      ["baseline8TStatus", model.baseline8T.status],
      ["interactionContractReady", model.baseline8T.interactionContractReady],
      ["futureInteractionCount8T", model.baseline8T.futureInteractionCount],
      ["blockedInteractionCount8T", model.baseline8T.blockedInteractionCount],
      ["enabledInteractionCount8T", model.baseline8T.enabledInteractionCount],
      ["workflowReadinessStatusFrom8S", model.workflowReadinessStatusFrom8S],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
    ]),
    "",
    "## Baseline Preservation 8T To 6X",
    ...baselineRows(model),
    "",
    "## Input Field Contract Summary",
    ...metricRows([
      ["inputFieldContractReady", model.inputFieldContractReady],
      ["productInputFieldContractVisible", model.productInputFieldContractVisible],
      ["exportInputFieldContractVisible", model.exportInputFieldContractVisible],
      ["inputFieldContractUsesInteractionContract8T", model.inputFieldContractUsesInteractionContract8T],
      ["sectionCount", model.sectionCount],
      ["fieldCount", model.fieldCount],
      ["disabledFieldCount", model.disabledFieldCount],
      ["activeFieldCount", model.activeFieldCount],
      ["enabledInputControlCount", model.enabledInputControlCount],
      ["editableTextFieldCount", model.editableTextFieldCount],
      ["enabledSelectControlCount", model.enabledSelectControlCount],
      ["enabledCheckboxControlCount", model.enabledCheckboxControlCount],
      ["validationRuleCount", model.validationRuleCount],
      ["activeValidationRuleCount", model.activeValidationRuleCount],
      ["errorStateCount", model.errorStateCount],
      ["activeErrorStateCount", model.activeErrorStateCount],
      ["refusalStateCount", model.refusalStateCount],
      ["activationRequirementCount", model.activationRequirementCount],
      ["deferredDecisionCount", model.deferredDecisionCount],
    ]),
    "",
    "## Field Sections",
    ...table([
      ["Order", "Section", "Question", "Linked 8M", "Linked 8L", "Linked 8K", "Fields", "Disabled"],
      ...model.contract.fieldSections.map((section) => [
        String(section.sectionOrder),
        section.sectionTitle,
        section.sectionQuestion,
        section.linked8MReviewSectionId,
        section.linked8LObservationCardId,
        section.linked8KDecisionCardId,
        String(section.fieldIds.length),
        bool(section.disabledIn8U),
      ]),
    ]),
    "",
    "## Fields Matrix",
    ...fieldRows(model),
    "",
    "## Future Validation Rules",
    ...validationRuleRows(model),
    "",
    "## Future Error States",
    ...table([
      ["Error state", "Active 8U", "Blocks future preview", "Coach message"],
      ...model.contract.errorStates.map((error) => [
        error.errorStateId,
        bool(error.activeIn8U),
        bool(error.blocksFuturePreview),
        error.coachFacingMessage,
      ]),
    ]),
    "",
    "## Refusal States",
    ...table([
      ["Refusal", "Coach message", "Prevents"],
      ...model.contract.refusalStates.map((refusal) => [
        refusal.refusalStateId,
        refusal.coachFacingMessage,
        refusal.prevents.join("; "),
      ]),
    ]),
    "",
    "## Activation Requirements",
    ...table([
      ["Requirement", "Satisfied 8U", "Boundary", "Rationale"],
      ...model.contract.activationRequirements.map((requirement) => [
        requirement.requirementId,
        bool(requirement.satisfiedIn8U),
        requirement.boundaryProtected,
        requirement.rationale,
      ]),
    ]),
    "",
    "## Deferred Decisions",
    ...model.contract.deferredDecisions.map((decision) => `- ${decision}`),
    "",
    "## Safety Audit Counts",
    ...metricRows([
      ["real input processed", !model.contractDoesNotCreateRealInput],
      ["submitButtonCount", model.disabledStateAudit.submitButtonCount],
      ["backendActionCount", model.disabledStateAudit.backendActionCount],
      ["apiCallCount", model.disabledStateAudit.apiCallCount],
      ["localStoragePersistenceCount", model.nonPersistenceAudit.localStoragePersistenceCount],
      ["databasePersistenceCount", model.nonPersistenceAudit.databasePersistenceCount],
      ["filePersistenceCount", model.nonPersistenceAudit.filePersistenceCount],
      ["memoryCreationCount", model.nonPersistenceAudit.memoryCreationCount],
      ["payloadCreationCount", model.nonPersistenceAudit.payloadCreationCount],
      ["realPreviewGenerationCount", model.nonPersistenceAudit.realPreviewGenerationCount],
      ["officialTruthPromotionCount", model.boundaryAudit.officialTruthPromotionCount],
      ["automaticDecisionCount", model.boundaryAudit.automaticDecisionCount],
      ["selectionRecommendationCount", model.boundaryAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.boundaryAudit.tacticalInstructionCount],
    ]),
    "",
    "## Export Metadata And Budget",
    ...metricRows([
      ["exportMetadataCurrent8UVisible", model.exportMetadataCurrent8UVisible],
      ["exportReadTimeSecondsAfter8U", model.exportBudgetAudit.exportReadTimeSecondsAfter8U],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["numericThresholdGuardPreserved", model.numericThresholdGuardPreserved],
    ]),
    "",
    "## Product Excerpt",
    compactSnippet(model.productHtmlAfter8U, "manual-review-input-field-contract-8u"),
    "",
    "## Export Excerpt",
    compactSnippet(model.exportHtmlAfter8U, "manual-review-input-field-contract-export-8u"),
    "",
    "## Warnings And Recommendation",
    `warningCodes: ${model.warningCodes.length === 0 ? "none" : model.warningCodes.join(", ")}`,
    `recommendation: ${model.recommendation}`,
    `nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderManualReviewInputFieldContractWithoutPersistence8UValidation(
  model: ManualReviewInputFieldContractWithoutPersistence8UModel = currentManualReviewInputFieldContractWithoutPersistence8UModel(),
): string {
  const checks = [
    checkLine("ManualReviewInputFieldContractWithoutPersistence8UModel exists", model.version === "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_8U", model.version),
    checkLine("Status: PASS", model.status === "PASS", model.status),
    checkLine("scope is input field contract without persistence", model.scope === "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_WITHOUT_PERSISTENCE", model.scope),
    checkLine("baseline 8T interaction contract preserved", model.baseline8TPreserved, bool(model.baseline8TPreserved)),
    checkLine("baseline 8S visible and preserved", model.baseline8SPreserved, bool(model.baseline8SPreserved)),
    checkLine("baseline 8R preserved", model.baseline8RPreserved, bool(model.baseline8RPreserved)),
    checkLine("baseline 8Q preserved", model.baseline8QPreserved, bool(model.baseline8QPreserved)),
    checkLine("baseline 8P preserved", model.baseline8PPreserved, bool(model.baseline8PPreserved)),
    checkLine("baseline 8O preserved", model.baseline8OPreserved, bool(model.baseline8OPreserved)),
    checkLine("baseline 8N preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
    checkLine("baseline 8M preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
    checkLine("baseline 8L preserved", model.baseline8LPreserved, bool(model.baseline8LPreserved)),
    checkLine("baseline 8K preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
    checkLine("baseline 6X preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("product input field contract visible", model.productInputFieldContractVisible, bool(model.productInputFieldContractVisible)),
    checkLine("export input field contract visible", model.exportInputFieldContractVisible, bool(model.exportInputFieldContractVisible)),
    checkLine("input field contract uses interaction contract 8T", model.inputFieldContractUsesInteractionContract8T, bool(model.inputFieldContractUsesInteractionContract8T)),
    checkLine("section count = 3", model.sectionCount === 3, String(model.sectionCount)),
    checkLine("field count = 21", model.fieldCount === 21, String(model.fieldCount)),
    checkLine("disabled field count = 21", model.disabledFieldCount === 21, String(model.disabledFieldCount)),
    checkLine("active field count = 0", model.activeFieldCount === 0, String(model.activeFieldCount)),
    checkLine("enabled input control count = 0", model.enabledInputControlCount === 0, String(model.enabledInputControlCount)),
    checkLine("editable text field count = 0", model.editableTextFieldCount === 0, String(model.editableTextFieldCount)),
    checkLine("enabled select control count = 0", model.enabledSelectControlCount === 0, String(model.enabledSelectControlCount)),
    checkLine("enabled checkbox control count = 0", model.enabledCheckboxControlCount === 0, String(model.enabledCheckboxControlCount)),
    checkLine("field validation rule count >= 12", model.validationRuleCount >= 12, String(model.validationRuleCount)),
    checkLine("active validation rule count = 0", model.activeValidationRuleCount === 0, String(model.activeValidationRuleCount)),
    checkLine("error state count >= 11", model.errorStateCount >= 11, String(model.errorStateCount)),
    checkLine("active error state count = 0", model.activeErrorStateCount === 0, String(model.activeErrorStateCount)),
    checkLine("refusal state count = 6", model.refusalStateCount === 6, String(model.refusalStateCount)),
    checkLine("activation requirement count = 14", model.activationRequirementCount === 14, String(model.activationRequirementCount)),
    checkLine("workflowReadinessStatusFrom8S: ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8S === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8S),
    checkLine("reviewGateStatusFrom8Q: needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("no real input", model.contractDoesNotCreateRealInput, bool(model.contractDoesNotCreateRealInput)),
    checkLine("no submit", model.contractDoesNotCreateSubmit, bool(model.contractDoesNotCreateSubmit)),
    checkLine("no API", model.contractDoesNotCreateApi, bool(model.contractDoesNotCreateApi)),
    checkLine("no backend", model.contractDoesNotCreateBackend, bool(model.contractDoesNotCreateBackend)),
    checkLine("no storage", model.contractDoesNotCreateStorage, bool(model.contractDoesNotCreateStorage)),
    checkLine("no memory", model.contractDoesNotCreateMemory, bool(model.contractDoesNotCreateMemory)),
    checkLine("no payload", model.contractDoesNotCreatePayload, bool(model.contractDoesNotCreatePayload)),
    checkLine("no real preview", model.contractDoesNotCreateRealPreview, bool(model.contractDoesNotCreateRealPreview)),
    checkLine("no official truth promotion", model.contractDoesNotPromoteOfficialTruth, bool(model.contractDoesNotPromoteOfficialTruth)),
    checkLine("no automatic decision", model.contractDoesNotCreateAutomaticDecision, bool(model.contractDoesNotCreateAutomaticDecision)),
    checkLine("no selection", model.contractDoesNotDriveSelection, bool(model.contractDoesNotDriveSelection)),
    checkLine("no tactical instruction", model.contractDoesNotDriveTacticalInstruction, bool(model.contractDoesNotDriveTacticalInstruction)),
    checkLine("product story-first preserved", model.productStoryFirstPreserved, bool(model.productStoryFirstPreserved)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("export metadata current 8U visible", model.exportMetadataCurrent8UVisible, bool(model.exportMetadataCurrent8UVisible)),
    checkLine("export title mentions 8U", model.exportMetadataAudit.exportTitleMentions8U, bool(model.exportMetadataAudit.exportTitleMentions8U)),
    checkLine("export visible badge mentions 8U", model.exportMetadataAudit.exportVisibleBadgeMentions8U, bool(model.exportMetadataAudit.exportVisibleBadgeMentions8U)),
    checkLine("export main id is compressed-export-8u", model.exportHtmlAfter8U.includes('id="compressed-export-8u"'), "compressed-export-8u"),
    checkLine("export main id no longer compressed-export-8t", !model.exportMetadataAudit.exportMainIdStillCompressedExport8T, bool(model.exportMetadataAudit.exportMainIdStillCompressedExport8T)),
    checkLine("exportReadTimeSecondsAfter8U <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8U <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8U)),
    checkLine("exportReadTimeSecondsAfter8U <= 800", model.exportBudgetAudit.exportReadTimeSecondsAfter8U <= 800, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8U)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("guardrails preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("no scoring constants changed", scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "SHOT_GOAL=3 TRY_TOUCHDOWN=5 CONVERSION_GOAL=2 DROP_GOAL=2"),
    checkLine("MatchBonusEvent unchanged", model.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8T.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.baseline8T.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("no warning codes", model.warningCodes.length === 0, model.warningCodes.join(", ") || "none"),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review Input Field Contract Without Persistence 8U",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    ...metricRows([
      ["sectionCount", model.sectionCount],
      ["fieldCount", model.fieldCount],
      ["disabledFieldCount", model.disabledFieldCount],
      ["activeFieldCount", model.activeFieldCount],
      ["enabledInputControlCount", model.enabledInputControlCount],
      ["editableTextFieldCount", model.editableTextFieldCount],
      ["enabledSelectControlCount", model.enabledSelectControlCount],
      ["enabledCheckboxControlCount", model.enabledCheckboxControlCount],
      ["validationRuleCount", model.validationRuleCount],
      ["activeValidationRuleCount", model.activeValidationRuleCount],
      ["errorStateCount", model.errorStateCount],
      ["activeErrorStateCount", model.activeErrorStateCount],
      ["refusalStateCount", model.refusalStateCount],
      ["activationRequirementCount", model.activationRequirementCount],
      ["submitButtonCount", model.disabledStateAudit.submitButtonCount],
      ["apiCallCount", model.disabledStateAudit.apiCallCount],
      ["backendActionCount", model.disabledStateAudit.backendActionCount],
      ["localStoragePersistenceCount", model.nonPersistenceAudit.localStoragePersistenceCount],
      ["databasePersistenceCount", model.nonPersistenceAudit.databasePersistenceCount],
      ["filePersistenceCount", model.nonPersistenceAudit.filePersistenceCount],
      ["memoryCreationCount", model.nonPersistenceAudit.memoryCreationCount],
      ["payloadCreationCount", model.nonPersistenceAudit.payloadCreationCount],
      ["realPreviewGenerationCount", model.nonPersistenceAudit.realPreviewGenerationCount],
      ["officialTruthPromotionCount", model.boundaryAudit.officialTruthPromotionCount],
      ["automaticDecisionCount", model.boundaryAudit.automaticDecisionCount],
      ["selectionRecommendationCount", model.boundaryAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.boundaryAudit.tacticalInstructionCount],
      ["exportReadTimeSecondsAfter8U", model.exportBudgetAudit.exportReadTimeSecondsAfter8U],
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
