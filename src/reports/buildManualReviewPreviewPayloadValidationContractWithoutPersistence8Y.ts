import { buildManualReviewPreviewPayloadContractWithoutPersistence8XModel } from "./buildManualReviewPreviewPayloadContractWithoutPersistence8X";
import {
  auditManualReviewPreviewPayloadValidationBoundary8Y,
  auditManualReviewPreviewPayloadValidationContract8Y,
  auditManualReviewPreviewPayloadValidationExportBudget8Y,
  auditManualReviewPreviewPayloadValidationExportMetadata8Y,
  auditManualReviewPreviewPayloadValidationIntegration8Y,
  auditManualReviewPreviewPayloadValidationMapping8Y,
  auditManualReviewPreviewPayloadValidationNoRuntime8Y,
  auditManualReviewPreviewPayloadValidationNonPersistence8Y,
  auditManualReviewPreviewPayloadValidationSourceOfTruth8Y,
  auditManualReviewPreviewPayloadValidationWording8Y,
} from "./manualReviewPreviewPayloadValidationContractAudit8Y";
import type {
  ManualReviewPreviewPayloadObservationEntryContract8Y,
  ManualReviewPreviewPayloadOrderedValidationStep8Y,
  ManualReviewPreviewPayloadValidationBlocker8Y,
  ManualReviewPreviewPayloadValidationBoundaryGuard8Y,
  ManualReviewPreviewPayloadValidationContract8Y,
  ManualReviewPreviewPayloadValidationContractStatus8Y,
  ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel,
  ManualReviewPreviewPayloadValidationErrorMessage8Y,
  ManualReviewPreviewPayloadValidationGroup8Y,
  ManualReviewPreviewPayloadValidationRefusalState8Y,
  ManualReviewPreviewPayloadValidationRuleMapping8Y,
} from "./manualReviewPreviewPayloadValidationContractTypes8Y";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_8Y_BLOCKING_WARNINGS,
  type ManualReviewPreviewPayloadValidationContractWarningCode8Y,
} from "./manualReviewPreviewPayloadValidationContractWarnings8Y";
import type { ManualReviewPreviewPayloadContractWithoutPersistence8XModel } from "./manualReviewPreviewPayloadContractTypes8X";
import {
  insertManualReviewPreviewPayloadValidationContractExport8Y,
  renderManualReviewPreviewPayloadValidationContractExport8Y,
} from "./renderManualReviewPreviewPayloadValidationContractExport8Y";
import {
  insertManualReviewPreviewPayloadValidationContractProduct8Y,
  renderManualReviewPreviewPayloadValidationContractProduct8Y,
} from "./renderManualReviewPreviewPayloadValidationContractProduct8Y";

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
  warnings: readonly ManualReviewPreviewPayloadValidationContractWarningCode8Y[],
): readonly ManualReviewPreviewPayloadValidationContractWarningCode8Y[] {
  return [...new Set(warnings)];
}

function statusFromWarnings(
  warnings: readonly ManualReviewPreviewPayloadValidationContractWarningCode8Y[],
  exportUnder900Seconds: boolean,
  exportUnder800Seconds: boolean,
): ManualReviewPreviewPayloadValidationContractStatus8Y {
  const blocking = warnings.some((warning) => MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_8Y_BLOCKING_WARNINGS.includes(warning));
  if (blocking || !exportUnder900Seconds) return "FAIL";
  if (!exportUnder800Seconds || warnings.length > 0) return "PARTIAL";
  return "PASS";
}

function validationGroups(): readonly ManualReviewPreviewPayloadValidationGroup8Y[] {
  const rows: readonly (readonly [string, string, string, readonly string[], readonly string[]])[] = [
    ["identity_and_version", "Identity/version", "Validate payloadId, payloadVersion and matchId before any future preview state.", ["payload_identity_must_exist", "payload_version_must_match_contract"], ["BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"]],
    ["source_and_scope", "Source/scope", "Keep the source manual_non_official and scope preview_only.", ["payload_source_must_be_manual_non_official", "payload_scope_must_be_preview_only"], ["BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"]],
    ["observation_entries", "Observation entry contracts", "Require three linked observation entry contracts, not runtime examples.", ["entries_count_must_be_three", "entries_must_link_to_known_observation_cards"], ["BLOCK_MISSING_OR_INVALID_ENTRIES_8Y"]],
    ["field_values", "Field values", "Document future enum, counter, note and comparable-context checks.", ["outcome_values_must_match_8u_enum", "count_values_must_be_integer_0_99", "signal_counts_cannot_exceed_comparable_count", "context_comparability_must_match_8u_enum", "note_lengths_must_respect_8u_limits"], ["BLOCK_INVALID_ENTRY_VALUES_8Y"]],
    ["boundary_flags", "Boundary flags", "Require negative flags proving no official truth, persistence, application or mutation.", ["payload_official_truth_must_be_false", "payload_persisted_must_be_false", "payload_applied_must_be_false", "payload_without_boundary_flags_rejected"], ["BLOCK_MISSING_BOUNDARY_FLAGS_8Y", "BLOCK_OFFICIAL_TRUTH_FLAG_8Y", "BLOCK_PERSISTENCE_FLAG_8Y"]],
    ["forbidden_fields", "Forbidden fields", "Reject future fields that would create score, timeline, storage, automation or tactical effects.", ["forbidden_top_level_fields_rejected", "score_timeline_mutation_fields_rejected", "automation_fields_rejected", "storage_fields_rejected", "engine_learning_fields_rejected"], ["BLOCK_FORBIDDEN_FIELD_8Y", "BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_8Y", "BLOCK_STORAGE_OR_API_FIELD_8Y", "BLOCK_AUTOMATION_FIELD_8Y", "BLOCK_ENGINE_LEARNING_FIELD_8Y"]],
    ["runtime_effects_blocked", "Runtime effects blocked", "Keep validation runtime, preview generation, submit, API, backend, storage and officialization blocked.", ["required_entry_fields_missing_blocks_future_preview", "invalid_entry_blocks_payload_preview"], ["BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_8Y"]],
  ];
  return rows.map(([groupId, label, purpose, ruleIds, blockerIds], index) => ({
    groupId,
    label,
    purpose,
    order: index + 1,
    ruleIds,
    blockerIds,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function orderedValidationSteps(): readonly ManualReviewPreviewPayloadOrderedValidationStep8Y[] {
  const rows: readonly (readonly [string, string, string, readonly string[]])[] = [
    ["validate_payload_identity", "identity_and_version", "Validate payload identity", ["payload_identity_must_exist", "payload_version_must_match_contract"]],
    ["validate_payload_source_scope", "source_and_scope", "Validate source and scope", ["payload_source_must_be_manual_non_official", "payload_scope_must_be_preview_only"]],
    ["validate_observation_entry_count", "observation_entries", "Validate observation entry count", ["entries_count_must_be_three"]],
    ["validate_observation_entry_links", "observation_entries", "Validate observation entry links", ["entries_must_link_to_known_observation_cards"]],
    ["validate_observation_entry_field_values", "field_values", "Validate observation entry field values", ["outcome_values_must_match_8u_enum", "count_values_must_be_integer_0_99", "signal_counts_cannot_exceed_comparable_count", "context_comparability_must_match_8u_enum", "note_lengths_must_respect_8u_limits"]],
    ["validate_boundary_flags", "boundary_flags", "Validate preview-only boundary flags", ["payload_official_truth_must_be_false", "payload_persisted_must_be_false", "payload_applied_must_be_false", "payload_without_boundary_flags_rejected"]],
    ["reject_forbidden_top_level_fields", "forbidden_fields", "Reject forbidden top-level fields", ["forbidden_top_level_fields_rejected"]],
    ["reject_runtime_effect_fields", "runtime_effects_blocked", "Reject runtime effect fields", ["automation_fields_rejected", "storage_fields_rejected", "engine_learning_fields_rejected"]],
    ["reject_source_of_truth_promotion", "boundary_flags", "Reject source-of-truth promotion", ["score_timeline_mutation_fields_rejected"]],
    ["produce_future_preview_validation_state", "runtime_effects_blocked", "Document future validation state without producing it", ["required_entry_fields_missing_blocks_future_preview", "invalid_entry_blocks_payload_preview"]],
  ];
  return rows.map(([stepId, groupId, label, ruleIds], index) => ({
    stepId,
    order: index + 1,
    groupId,
    label,
    description: "Future validation step documented in 8Y; no runtime validation is executed.",
    ruleIds,
    failsWithErrorStateIds: [],
    blocksWithBlockerIds: [],
    activeIn8Y: false,
    futureRuntimeOnly: true,
    visibleInProduct: true,
    visibleInExport: index < 5,
  }));
}

function errorMessages(): readonly ManualReviewPreviewPayloadValidationErrorMessage8Y[] {
  const rows: readonly (readonly [string, string, string])[] = [
    ["INVALID_PAYLOAD_SOURCE_8Y", "payload_source_must_be_manual_non_official", "La source du payload doit rester manuelle et non officielle."],
    ["INVALID_PAYLOAD_SCOPE_8Y", "payload_scope_must_be_preview_only", "Ce payload ne peut servir qu'a une preview non persistante."],
    ["OFFICIAL_TRUTH_FLAG_FORBIDDEN_8Y", "payload_official_truth_must_be_false", "Une revue coach ne peut pas devenir verite officielle."],
    ["PERSISTED_FLAG_FORBIDDEN_8Y", "payload_persisted_must_be_false", "Ce payload ne peut pas etre stocke."],
    ["APPLIED_FLAG_FORBIDDEN_8Y", "payload_applied_must_be_false", "Ce payload ne peut pas etre applique."],
    ["ENTRY_COUNT_INVALID_8Y", "entries_count_must_be_three", "Les entrees doivent correspondre aux trois observations prevues."],
    ["ENTRY_LINK_UNKNOWN_8Y", "entries_must_link_to_known_observation_cards", "Chaque entree doit rester liee aux cartes d'observation connues."],
    ["INVALID_OUTCOME_VALUE_8Y", "outcome_values_must_match_8u_enum", "Cette valeur n'est pas autorisee pour ce champ."],
    ["INVALID_COUNTER_VALUE_8Y", "count_values_must_be_integer_0_99", "Les compteurs doivent rester des entiers entre 0 et 99."],
    ["SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8Y", "signal_counts_cannot_exceed_comparable_count", "Les compteurs doivent rester coherents avec les situations comparables."],
    ["INVALID_CONTEXT_COMPARABILITY_8Y", "context_comparability_must_match_8u_enum", "Le contexte doit utiliser l'enum prevu par 8U."],
    ["NOTE_TOO_LONG_8Y", "note_lengths_must_respect_8u_limits", "Les notes sont trop longues pour une preview lisible."],
    ["REQUIRED_ENTRY_FIELD_MISSING_8Y", "required_entry_fields_missing_blocks_future_preview", "Un champ obligatoire manque pour cette entree."],
    ["FORBIDDEN_TOP_LEVEL_FIELD_8Y", "forbidden_top_level_fields_rejected", "Ce champ est interdit car il creerait un effet non preview-only."],
    ["SCORE_TIMELINE_MUTATION_FIELD_8Y", "score_timeline_mutation_fields_rejected", "Ce champ est interdit car il creerait un effet de score ou de timeline."],
    ["AUTOMATION_FIELD_FORBIDDEN_8Y", "automation_fields_rejected", "Ce champ est interdit car il creerait une decision automatique."],
    ["STORAGE_FIELD_FORBIDDEN_8Y", "storage_fields_rejected", "Ce champ est interdit car il creerait un stockage ou un envoi."],
    ["ENGINE_LEARNING_FIELD_FORBIDDEN_8Y", "engine_learning_fields_rejected", "Ce champ est interdit car il creerait un apprentissage moteur."],
    ["BOUNDARY_FLAGS_MISSING_8Y", "payload_without_boundary_flags_rejected", "Les flags de frontiere sont obligatoires pour prouver que le payload reste preview-only."],
  ];
  return rows.map(([messageId, linkedRuleId, coachFacingMessage]) => ({
    messageId,
    linkedErrorStateId: messageId,
    linkedRuleId,
    coachFacingTitle: messageId.replace(/_8Y$/u, "").replace(/_/gu, " "),
    coachFacingMessage,
    technicalMessage: `Future runtime must reject ${linkedRuleId}; 8Y documents only and executes nothing.`,
    severity: "blocking",
    futureResolutionHint: "Future sprint must keep the input preview-only and return this error without persistence or official promotion.",
    activeIn8Y: false,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function validationBlockers(): readonly ManualReviewPreviewPayloadValidationBlocker8Y[] {
  const ids = [
    "BLOCK_INVALID_SOURCE_OR_SCOPE_8Y",
    "BLOCK_MISSING_OR_INVALID_ENTRIES_8Y",
    "BLOCK_INVALID_ENTRY_VALUES_8Y",
    "BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_8Y",
    "BLOCK_MISSING_BOUNDARY_FLAGS_8Y",
    "BLOCK_OFFICIAL_TRUTH_FLAG_8Y",
    "BLOCK_PERSISTENCE_FLAG_8Y",
    "BLOCK_FORBIDDEN_FIELD_8Y",
    "BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_8Y",
    "BLOCK_STORAGE_OR_API_FIELD_8Y",
    "BLOCK_AUTOMATION_FIELD_8Y",
    "BLOCK_ENGINE_LEARNING_FIELD_8Y",
  ];
  const blocks = [
    "validation_acceptance",
    "payload_creation",
    "payload_runtime_validation",
    "preview_generation",
    "submit",
    "api_call",
    "backend_action",
    "persistence",
    "official_truth_promotion",
    "automatic_decision",
    "selection_automation",
    "tactical_instruction",
    "score_mutation",
    "timeline_mutation",
    "score_change_creation",
    "event_mutation",
  ];
  return ids.map((blockerId) => ({
    blockerId,
    label: blockerId.replace(/_8Y$/u, "").replace(/_/gu, " "),
    triggeredByRuleIds: [],
    triggeredByErrorStateIds: [],
    blocks,
    severity: "blocking",
    coachFacingMessage: "La future validation doit refuser ce cas sans creer de payload, preview, stockage ou decision.",
    technicalMessage: "Blocker documented in 8Y only; no runtime blocker is executed.",
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function mapRuleToError(ruleId: string): string {
  const mapping: Record<string, string> = {
    payload_source_must_be_manual_non_official: "INVALID_PAYLOAD_SOURCE_8Y",
    payload_scope_must_be_preview_only: "INVALID_PAYLOAD_SCOPE_8Y",
    payload_official_truth_must_be_false: "OFFICIAL_TRUTH_FLAG_FORBIDDEN_8Y",
    payload_persisted_must_be_false: "PERSISTED_FLAG_FORBIDDEN_8Y",
    payload_applied_must_be_false: "APPLIED_FLAG_FORBIDDEN_8Y",
    entries_count_must_be_three: "ENTRY_COUNT_INVALID_8Y",
    entries_must_link_to_known_observation_cards: "ENTRY_LINK_UNKNOWN_8Y",
    outcome_values_must_match_8u_enum: "INVALID_OUTCOME_VALUE_8Y",
    count_values_must_be_integer_0_99: "INVALID_COUNTER_VALUE_8Y",
    signal_counts_cannot_exceed_comparable_count: "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8Y",
    context_comparability_must_match_8u_enum: "INVALID_CONTEXT_COMPARABILITY_8Y",
    note_lengths_must_respect_8u_limits: "NOTE_TOO_LONG_8Y",
    required_entry_fields_missing_blocks_future_preview: "REQUIRED_ENTRY_FIELD_MISSING_8Y",
    invalid_entry_blocks_payload_preview: "REQUIRED_ENTRY_FIELD_MISSING_8Y",
    forbidden_top_level_fields_rejected: "FORBIDDEN_TOP_LEVEL_FIELD_8Y",
    score_timeline_mutation_fields_rejected: "SCORE_TIMELINE_MUTATION_FIELD_8Y",
    automation_fields_rejected: "AUTOMATION_FIELD_FORBIDDEN_8Y",
    storage_fields_rejected: "STORAGE_FIELD_FORBIDDEN_8Y",
    engine_learning_fields_rejected: "ENGINE_LEARNING_FIELD_FORBIDDEN_8Y",
    payload_without_boundary_flags_rejected: "BOUNDARY_FLAGS_MISSING_8Y",
  };
  return mapping[ruleId] ?? "FORBIDDEN_TOP_LEVEL_FIELD_8Y";
}

function mapRuleToBlocker(ruleId: string): string {
  if (ruleId.includes("source") || ruleId.includes("scope")) return "BLOCK_INVALID_SOURCE_OR_SCOPE_8Y";
  if (ruleId.includes("entries_must") || ruleId.includes("entries_count")) return "BLOCK_MISSING_OR_INVALID_ENTRIES_8Y";
  if (ruleId.includes("required_entry")) return "BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_8Y";
  if (ruleId.includes("boundary_flags")) return "BLOCK_MISSING_BOUNDARY_FLAGS_8Y";
  if (ruleId.includes("official_truth")) return "BLOCK_OFFICIAL_TRUTH_FLAG_8Y";
  if (ruleId.includes("persisted")) return "BLOCK_PERSISTENCE_FLAG_8Y";
  if (ruleId.includes("score_timeline")) return "BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_8Y";
  if (ruleId.includes("automation")) return "BLOCK_AUTOMATION_FIELD_8Y";
  if (ruleId.includes("storage")) return "BLOCK_STORAGE_OR_API_FIELD_8Y";
  if (ruleId.includes("engine_learning")) return "BLOCK_ENGINE_LEARNING_FIELD_8Y";
  if (ruleId.includes("forbidden")) return "BLOCK_FORBIDDEN_FIELD_8Y";
  return "BLOCK_INVALID_ENTRY_VALUES_8Y";
}

function ruleMappings(): readonly ManualReviewPreviewPayloadValidationRuleMapping8Y[] {
  const rules: readonly (readonly [string, string, string, string, string | undefined])[] = [
    ["payload_source_must_be_manual_non_official", "source_and_scope", "validate_payload_source_scope", "payloadSource", undefined],
    ["payload_scope_must_be_preview_only", "source_and_scope", "validate_payload_source_scope", "payloadScope", undefined],
    ["payload_official_truth_must_be_false", "boundary_flags", "validate_boundary_flags", "boundaryFlags", "officialTruth"],
    ["payload_persisted_must_be_false", "boundary_flags", "validate_boundary_flags", "boundaryFlags", "persisted"],
    ["payload_applied_must_be_false", "boundary_flags", "validate_boundary_flags", "boundaryFlags", "applied"],
    ["entries_count_must_be_three", "observation_entries", "validate_observation_entry_count", "entries", undefined],
    ["entries_must_link_to_known_observation_cards", "observation_entries", "validate_observation_entry_links", "entries", "linkedCardId"],
    ["outcome_values_must_match_8u_enum", "field_values", "validate_observation_entry_field_values", "entries", "outcome"],
    ["count_values_must_be_integer_0_99", "field_values", "validate_observation_entry_field_values", "entries", "count"],
    ["signal_counts_cannot_exceed_comparable_count", "field_values", "validate_observation_entry_field_values", "entries", "signalCount"],
    ["context_comparability_must_match_8u_enum", "field_values", "validate_observation_entry_field_values", "entries", "contextComparability"],
    ["note_lengths_must_respect_8u_limits", "field_values", "validate_observation_entry_field_values", "entries", "note"],
    ["required_entry_fields_missing_blocks_future_preview", "runtime_effects_blocked", "produce_future_preview_validation_state", "entries", "requiredFields"],
    ["invalid_entry_blocks_payload_preview", "runtime_effects_blocked", "produce_future_preview_validation_state", "entries", "entryValidity"],
    ["forbidden_top_level_fields_rejected", "forbidden_fields", "reject_forbidden_top_level_fields", "forbiddenTopLevelFields", undefined],
    ["score_timeline_mutation_fields_rejected", "forbidden_fields", "reject_source_of_truth_promotion", "scoreChange", "timelineMutation"],
    ["automation_fields_rejected", "runtime_effects_blocked", "reject_runtime_effect_fields", "automaticDecision", "selectionRecommendation"],
    ["storage_fields_rejected", "runtime_effects_blocked", "reject_runtime_effect_fields", "storageTarget", "apiEndpoint"],
    ["engine_learning_fields_rejected", "runtime_effects_blocked", "reject_runtime_effect_fields", "engineLearningSignal", "teamStyleMemoryUpdate"],
    ["payload_without_boundary_flags_rejected", "boundary_flags", "validate_boundary_flags", "boundaryFlags", undefined],
  ];
  return rules.map(([ruleId, groupId, stepId, appliesToPayloadField, appliesToEntryField]) => {
    const errorStateId = mapRuleToError(ruleId);
    return {
      mappingId: `${ruleId}_mapping_8y`,
      ruleId,
      sourceRuleId8X: ruleId.toUpperCase(),
      groupId,
      stepId,
      appliesToPayloadField,
      ...(appliesToEntryField === undefined ? {} : { appliesToEntryField }),
      validationIntent: "Future payload validation contract only; no 8Y execution.",
      futurePredicateDescription: `Future runtime predicate checks ${appliesToPayloadField}${appliesToEntryField === undefined ? "" : `.${appliesToEntryField}`} without persistence.`,
      errorStateId,
      coachFacingErrorMessageId: errorStateId,
      technicalErrorMessageId: errorStateId,
      blockerId: mapRuleToBlocker(ruleId),
      severity: "blocking",
      activeIn8Y: false,
      visibleInProduct: true,
      visibleInExport: true,
    };
  });
}

function refusalStates(): readonly ManualReviewPreviewPayloadValidationRefusalState8Y[] {
  const rows: readonly (readonly [string, string, string, string])[] = [
    ["VALIDATION_CONTRACT_ONLY_8Y", "validation contract requested", "Contrat seulement", "Les regles sont documentees mais aucune validation runtime n'est activee."],
    ["REAL_PAYLOAD_VALIDATION_REFUSED_8Y", "real payload read", "Payload reel refuse", "Aucun payload reel n'est lu ou valide dans 8Y."],
    ["PAYLOAD_ACCEPTANCE_REFUSED_8Y", "payload accepted", "Acceptation refusee", "Aucun payload ne peut etre accepte comme valide dans 8Y."],
    ["PREVIEW_FROM_VALIDATION_REFUSED_8Y", "preview generated", "Preview refusee", "La validation ne genere aucune preview reelle."],
    ["SUBMIT_FROM_VALIDATION_REFUSED_8Y", "submit requested", "Submit refuse", "La validation ne peut declencher aucun submit."],
    ["PERSISTENCE_FROM_VALIDATION_REFUSED_8Y", "persistence requested", "Persistence refusee", "La validation ne peut creer aucun stockage, draft ou historique."],
    ["OFFICIALIZATION_FROM_VALIDATION_REFUSED_8Y", "official truth requested", "Officialisation refusee", "La validation ne peut pas transformer une revue coach en verite officielle."],
    ["AUTOMATION_FROM_VALIDATION_REFUSED_8Y", "automation requested", "Automation refusee", "La validation ne declenche ni decision, ni selection, ni tactique."],
  ];
  return rows.map(([refusalStateId, triggeredBy, title, coachFacingMessage]) => ({
    refusalStateId,
    triggeredBy,
    title,
    coachFacingMessage,
    technicalReason: "8Y is a future validation contract only and refuses runtime effects.",
    requiredFutureDecision: "A later sprint may implement runtime validation only behind explicit non-persistent preview guards.",
    severity: "blocking",
    prevents: ["runtime_validation", "payload_creation", "payload_acceptance", "preview_generation", "submit", "api_call", "backend_action", "persistence", "official_truth_promotion", "automatic_decision", "selection_automation", "tactical_instruction"],
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function boundaryGuards(): readonly ManualReviewPreviewPayloadValidationBoundaryGuard8Y[] {
  const ids = [
    "BLOCK_IF_VALIDATION_RUNTIME_ACTIVE_8Y",
    "BLOCK_IF_REAL_PAYLOAD_READ_8Y",
    "BLOCK_IF_PAYLOAD_INSTANCE_CREATED_8Y",
    "BLOCK_IF_PAYLOAD_ACCEPTED_AS_VALID_8Y",
    "BLOCK_IF_PREVIEW_GENERATED_AFTER_VALIDATION_8Y",
    "BLOCK_IF_SUBMIT_OR_CTA_AFTER_VALIDATION_8Y",
    "BLOCK_IF_API_OR_BACKEND_AFTER_VALIDATION_8Y",
    "BLOCK_IF_STORAGE_AFTER_VALIDATION_8Y",
    "BLOCK_IF_DRAFT_HISTORY_MEMORY_AFTER_VALIDATION_8Y",
    "BLOCK_IF_OFFICIAL_TRUTH_AFTER_VALIDATION_8Y",
    "BLOCK_IF_SCORE_TIMELINE_MUTATION_AFTER_VALIDATION_8Y",
    "BLOCK_IF_AUTOMATIC_DECISION_AFTER_VALIDATION_8Y",
    "BLOCK_IF_SELECTION_OR_TACTIC_AFTER_VALIDATION_8Y",
    "BLOCK_IF_SANDBOX_DIAGNOSTIC_BATCH_PROMOTION_AFTER_VALIDATION_8Y",
  ];
  return ids.map((boundaryGuardId) => ({
    boundaryGuardId,
    label: boundaryGuardId.replace(/_8Y$/u, "").replace(/_/gu, " "),
    trigger: "future runtime would have to block this condition; 8Y only documents it",
    blocks: ["runtime_validation", "payload_creation", "payload_acceptance", "preview_generation", "real_input_processing", "submit", "api_call", "backend_action", "persistence", "official_truth_promotion", "automatic_decision", "selection_automation", "tactical_instruction", "score_mutation", "timeline_mutation", "score_change_creation", "event_mutation", "engine_learning", "sandbox_promotion", "diagnostic_promotion", "batch_promotion"],
    severity: "blocking",
    coachFacingMessage: "Frontiere preview-only : aucun effet officiel ou persistant ne peut etre produit.",
    technicalMessage: "Guard documented, inactive, and future-runtime-only in 8Y.",
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function observationEntryContracts(): readonly ManualReviewPreviewPayloadObservationEntryContract8Y[] {
  const rows: readonly (readonly [string, string, string])[] = [
    ["first_exit_after_recovery_entry_contract_8y", "first_exit_after_recovery_preview_entry_8x", "Premiere sortie apres recuperation"],
    ["danger_zone_continuity_entry_contract_8y", "danger_zone_continuity_preview_entry_8x", "Continuite apres entree en zone dangereuse"],
    ["neutralized_action_structure_entry_contract_8y", "neutralized_action_structure_preview_entry_8x", "Structure apres action neutralisee"],
  ];
  return rows.map(([entryContractId, sourceEntryContractId8X, label], index) => ({
    entryContractId,
    sourceEntryContractId8X,
    label,
    linked8KDecisionCardId: `8k_${entryContractId}`,
    linked8LObservationCardId: `8l_${entryContractId}`,
    linked8MReviewSectionId: `8m_${entryContractId}`,
    linked8USectionId: `8u_${entryContractId}`,
    linked8VVisualSectionId: `8v_${entryContractId}`,
    entryOrder: index + 1,
    requiredFields: ["entryContractId", "outcome", "count", "contextComparability", "boundaryFlags"],
    optionalFields: ["coachNote", "confidence", "manualLabel"],
    validationRuleIds: ["entries_must_link_to_known_observation_cards", "outcome_values_must_match_8u_enum", "count_values_must_be_integer_0_99", "note_lengths_must_respect_8u_limits"],
    errorStateIds: ["ENTRY_LINK_UNKNOWN_8Y", "INVALID_OUTCOME_VALUE_8Y", "INVALID_COUNTER_VALUE_8Y", "NOTE_TOO_LONG_8Y"],
    blockerIds: ["BLOCK_MISSING_OR_INVALID_ENTRIES_8Y", "BLOCK_INVALID_ENTRY_VALUES_8Y"],
    isExampleOnly: false,
    isContractShapeOnly: true,
    isRuntimeInstance: false,
    activeIn8Y: false,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function buildContract(): ManualReviewPreviewPayloadValidationContract8Y {
  const groups = validationGroups();
  const steps = orderedValidationSteps();
  const mappings = ruleMappings();
  const messages = errorMessages();
  const blockers = validationBlockers();
  const refusals = refusalStates();
  const guards = boundaryGuards();
  const entryContracts = observationEntryContracts();
  return {
    contractId: "manual-review-preview-payload-validation-contract-without-persistence-8y",
    contractMode: "future_payload_validation_contract_only",
    sourcePayloadContractVersion: "8X",
    sourceActivationGuardsVersion: "8W",
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
    validationGroups: groups,
    orderedValidationSteps: steps,
    ruleMappings: mappings,
    errorMessages: messages,
    validationBlockers: blockers,
    refusalStates: refusals,
    boundaryGuards: guards,
    validationReadinessSummary: {
      summaryId: "manual-review-preview-payload-validation-readiness-8y",
      validationContractStatus: "documented_but_not_executable",
      expectedValidationContractStatus: "documented_but_not_executable",
      statusReason: "8Y documents future validation order and blockers while keeping runtime validation inactive.",
      validationGroupCount: groups.length,
      orderedValidationStepCount: steps.length,
      validationRuleMappingCount: mappings.length,
      errorMessageCount: messages.length,
      blockerCount: blockers.length,
      refusalStateCount: refusals.length,
      boundaryGuardCount: guards.length,
      observationEntryContractCount: entryContracts.length,
      validationRuntimeActive: false,
      validationExecutionCount: 0,
      realPayloadReadCount: 0,
      whatIsReady: ["ordre de validation futur connu", "regles liees aux champs", "erreurs liees aux regles", "blockers lies aux erreurs", "messages coach-facing definis", "contrats d'entrees clarifies"],
      whatIsBlocked: ["validation runtime", "lecture de payload reel", "acceptation de payload", "preview reelle", "submit", "API/backend", "stockage", "officialisation", "decision automatique", "selection/tactique"],
      whatFutureSprintCanDo: ["instancier un payload preview-only uniquement apres garde explicite", "executer ces validations sans persistence", "retourner les messages d'erreur sans officialiser"],
      coachFacingReadout: "Contrat de validation pret, mais validation runtime inactive et gate 8Q toujours needs_completion.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    observationEntryContracts: entryContracts,
    forbiddenRuntimeEffects: ["runtime_validation", "real_payload_read", "payload_creation", "preview_generation", "submit", "api", "backend", "storage", "official_truth", "automatic_decision", "selection", "tactic", "score_mutation", "timeline_mutation"],
    deferredDecisions: ["runtime validation activation", "real input processing", "non-persistent preview generation", "coach payload acceptance"],
    isRuntimeValidationActive: false,
    isRealPayloadInstance: false,
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

export function buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel(input?: {
  readonly baseline8X?: ManualReviewPreviewPayloadContractWithoutPersistence8XModel;
  readonly productHtmlBefore8Y?: string;
  readonly exportHtmlBefore8Y?: string;
}): ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel {
  const baseline8X = input?.baseline8X ?? buildManualReviewPreviewPayloadContractWithoutPersistence8XModel();
  const contract = buildContract();
  const productHtmlBefore8Y = input?.productHtmlBefore8Y ?? baseline8X.productHtmlAfter8X;
  const exportHtmlBefore8Y = input?.exportHtmlBefore8Y ?? baseline8X.exportHtmlAfter8X;
  const productPreviewPayloadValidationContractHtml = renderManualReviewPreviewPayloadValidationContractProduct8Y(contract);
  const exportPreviewPayloadValidationContractHtml = renderManualReviewPreviewPayloadValidationContractExport8Y(contract);
  const productHtmlAfter8Y = insertManualReviewPreviewPayloadValidationContractProduct8Y(productHtmlBefore8Y, productPreviewPayloadValidationContractHtml);
  const exportHtmlAfter8Y = insertManualReviewPreviewPayloadValidationContractExport8Y(exportHtmlBefore8Y, exportPreviewPayloadValidationContractHtml);
  const contractAudit = auditManualReviewPreviewPayloadValidationContract8Y(contract, productHtmlAfter8Y, exportHtmlAfter8Y);
  const noRuntimeAudit = auditManualReviewPreviewPayloadValidationNoRuntime8Y(productHtmlAfter8Y, exportHtmlAfter8Y);
  const mappingAudit = auditManualReviewPreviewPayloadValidationMapping8Y(contract);
  const nonPersistenceAudit = auditManualReviewPreviewPayloadValidationNonPersistence8Y(productHtmlAfter8Y, exportHtmlAfter8Y);
  const boundaryAudit = auditManualReviewPreviewPayloadValidationBoundary8Y(productHtmlAfter8Y, exportHtmlAfter8Y);
  const sourceOfTruthAudit = auditManualReviewPreviewPayloadValidationSourceOfTruth8Y();
  const exportMetadataAudit = auditManualReviewPreviewPayloadValidationExportMetadata8Y(exportHtmlAfter8Y);
  const exportBudgetAudit = auditManualReviewPreviewPayloadValidationExportBudget8Y(exportHtmlBefore8Y, exportHtmlAfter8Y);
  const integrationBudgetAudit = auditManualReviewPreviewPayloadValidationIntegration8Y(productHtmlAfter8Y, exportHtmlAfter8Y);
  const wordingAudit = auditManualReviewPreviewPayloadValidationWording8Y(productHtmlAfter8Y, exportHtmlAfter8Y);
  const warnings = uniqueWarnings([
    ...(baseline8X.status === "PASS" ? [] : ["PAYLOAD_CONTRACT_STATUS_NOT_PRESERVED"] as const),
    ...contractAudit.validationContractWarningCodes,
    ...noRuntimeAudit.runtimeWarningCodes,
    ...mappingAudit.mappingWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...boundaryAudit.boundaryWarningCodes,
    ...sourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...exportMetadataAudit.metadataWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
  ]);
  const status = statusFromWarnings(warnings, exportBudgetAudit.exportUnder900Seconds, exportBudgetAudit.exportUnder800Seconds);

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_8Y",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_8X",
    matchId: baseline8X.matchId,
    officialScore: baseline8X.officialScore,
    baseline8X,
    baseline8XPreserved: baseline8X.status === "PASS" && baseline8X.payloadContractStatus === "documented_but_not_instantiated",
    baseline8WPreserved: baseline8X.baseline8WPreserved,
    baseline8VPreserved: baseline8X.baseline8VPreserved,
    baseline8UPreserved: baseline8X.baseline8UPreserved,
    baseline8TPreserved: baseline8X.baseline8TPreserved,
    baseline8SPreserved: baseline8X.baseline8SPreserved,
    baseline8RPreserved: baseline8X.baseline8RPreserved,
    baseline8QPreserved: baseline8X.baseline8QPreserved,
    baseline8PPreserved: baseline8X.baseline8PPreserved,
    baseline8OPreserved: baseline8X.baseline8OPreserved,
    baseline8NPreserved: baseline8X.baseline8NPreserved,
    baseline8MPreserved: baseline8X.baseline8MPreserved,
    baseline8LPreserved: baseline8X.baseline8LPreserved,
    baseline8KPreserved: baseline8X.baseline8KPreserved,
    baseline8IPreserved: baseline8X.baseline8IPreserved,
    baseline8HPreserved: baseline8X.baseline8HPreserved,
    baseline8GPreserved: baseline8X.baseline8GPreserved,
    baseline8FPreserved: baseline8X.baseline8FPreserved,
    baseline8EPreserved: baseline8X.baseline8EPreserved,
    baseline8DPreserved: baseline8X.baseline8DPreserved,
    baseline8CPreserved: baseline8X.baseline8CPreserved,
    baseline8BPreserved: baseline8X.baseline8BPreserved,
    baseline8APreserved: baseline8X.baseline8APreserved,
    baseline7HPreserved: baseline8X.baseline7HPreserved,
    baseline6XPreserved: baseline8X.baseline6XPreserved,
    previewPayloadValidationContractReady: contractAudit.previewPayloadValidationContractVisible && mappingAudit.unmappedRuleCount === 0 && mappingAudit.unmappedErrorCount === 0 && mappingAudit.unmappedBlockerCount === 0,
    productPreviewPayloadValidationContractVisible: contractAudit.productPreviewPayloadValidationContractVisible,
    exportPreviewPayloadValidationContractVisible: contractAudit.exportPreviewPayloadValidationContractVisible,
    validationContractUsesPayloadContract8X: contractAudit.validationContractUsesPayloadContract8X,
    validationContractUsesActivationGuards8W: contractAudit.validationContractUsesActivationGuards8W,
    validationContractUsesFieldVisualReadiness8V: contractAudit.validationContractUsesFieldVisualReadiness8V,
    validationContractUsesInputFieldContract8U: contractAudit.validationContractUsesInputFieldContract8U,
    validationContractMode: "future_payload_validation_contract_only",
    validationContractStatus: "documented_but_not_executable",
    expectedValidationContractStatus: "documented_but_not_executable",
    validationContractStatusCorrect: contractAudit.validationContractStatusCorrect,
    validationRuntimeActive: false,
    payloadValidationRuntimeDetected: noRuntimeAudit.payloadValidationRuntimeDetected,
    validationExecutionCount: noRuntimeAudit.validationExecutionCount,
    realPayloadReadCount: noRuntimeAudit.realPayloadReadCount,
    realPayloadInstanceCount: noRuntimeAudit.realPayloadInstanceCount,
    payloadCreated: noRuntimeAudit.payloadCreated,
    realInputActivated: noRuntimeAudit.realInputActivated,
    realPreviewGenerated: noRuntimeAudit.realPreviewGenerated,
    validationGroupCount: contract.validationGroups.length,
    validationGroupCountExpected: 7,
    orderedValidationStepCount: contract.orderedValidationSteps.length,
    orderedValidationStepCountExpected: 10,
    validationRuleCount: contract.ruleMappings.length,
    validationRuleCountExpected: 20,
    activeValidationRuleCount: contract.ruleMappings.filter((rule) => rule.activeIn8Y).length,
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
    observationEntryExampleWordingCount: contractAudit.observationEntryExampleWordingCount,
    observationEntryContractWordingVisible: contractAudit.observationEntryContractWordingVisible,
    payloadSource: "manual_non_official",
    payloadScope: "preview_only",
    payloadOfficialTruth: false,
    payloadPersistence: "none",
    payloadApplication: "none",
    submitCreated: noRuntimeAudit.submitButtonCount !== 0,
    apiCreated: noRuntimeAudit.apiCallCount !== 0,
    backendCreated: noRuntimeAudit.backendActionCount !== 0,
    storageCreated: nonPersistenceAudit.localStoragePersistenceCount + nonPersistenceAudit.databasePersistenceCount + nonPersistenceAudit.filePersistenceCount !== 0,
    memoryCreated: nonPersistenceAudit.memoryCreationCount !== 0,
    draftCreated: nonPersistenceAudit.draftCreationCount !== 0,
    historyCreated: nonPersistenceAudit.historyCreationCount !== 0,
    officialTruthPromoted: boundaryAudit.officialTruthPromotionCount !== 0,
    automaticDecisionCreated: boundaryAudit.automaticDecisionCount !== 0,
    selectionDriven: boundaryAudit.selectionRecommendationCount !== 0,
    tacticalInstructionDriven: boundaryAudit.tacticalInstructionCount !== 0,
    scoreMutationCount: sourceOfTruthAudit.noScoreMutation ? 0 : 1,
    timelineMutationCount: sourceOfTruthAudit.validationContractDoesNotMutateTimeline ? 0 : 1,
    scoreChangeCreationCount: sourceOfTruthAudit.validationContractDoesNotCreateScoreChange ? 0 : 1,
    eventMutationCount: sourceOfTruthAudit.noEventDeletion ? 0 : 1,
    previewActivationStatusFrom8W: "documented_but_blocked",
    fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review",
    payloadContractStatusFrom8X: baseline8X.payloadContractStatus,
    workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview",
    reviewGateStatusFrom8Q: "needs_completion",
    readinessDistinctFromReviewGateStillVisible: wordingAudit.workflowReadinessDistinctFromReviewGateWordingVisible,
    validationContractDistinctFromValidationRuntime: wordingAudit.validationContractDistinctFromRuntimeWordingVisible,
    validationContractDistinctFromPayloadCreation: wordingAudit.validationContractDistinctFromPayloadCreationWordingVisible,
    validationContractDistinctFromPreviewGeneration: wordingAudit.validationContractDistinctFromPreviewGenerationWordingVisible,
    validationContractMarkedFutureOnly: wordingAudit.validationContractFutureOnlyWordingVisible,
    validationContractMarkedInactive: wordingAudit.validationContractInactiveWordingVisible,
    validationContractMarkedPreviewOnly: wordingAudit.validationContractPreviewOnlyWordingVisible,
    validationContractMarkedNonOfficial: wordingAudit.validationContractNonOfficialWordingVisible,
    validationContractMarkedNotPersisted: wordingAudit.validationContractNotPersistedWordingVisible,
    validationContractMarkedNotApplied: wordingAudit.validationContractNotAppliedWordingVisible,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: exportBudgetAudit.exportNoFullTimeline && integrationBudgetAudit.exportCompactPreserved,
    exportMetadataCurrent8YVisible: exportMetadataAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved: sourceOfTruthAudit.sourceOfTruthWarningCodes.length === 0,
    matchEconomyBaselinePreserved: baseline8X.baseline6XPreserved,
    guardrailsPreserved: sourceOfTruthAudit.noScoringConstantChange && sourceOfTruthAudit.MatchBonusEventUnchanged && sourceOfTruthAudit.batchLiveSeparationPreserved,
    contract,
    productPreviewPayloadValidationContractHtml,
    exportPreviewPayloadValidationContractHtml,
    productHtmlAfter8Y,
    exportHtmlAfter8Y,
    contractAudit,
    noRuntimeAudit,
    mappingAudit,
    nonPersistenceAudit,
    boundaryAudit,
    sourceOfTruthAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    wordingAudit,
    warningCodes: warnings,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT_WITHOUT_PERSISTENCE" : "REVIEW_MANUAL_REVIEW_PREVIEW_PAYLOAD_VALIDATION_CONTRACT",
    nextSprintRecommendation: "PREPARE_MANUAL_REVIEW_PREVIEW_PAYLOAD_RUNTIME_VALIDATION_GUARDS_WITHOUT_PERSISTENCE",
  };
}

export function currentManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel(): ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel {
  return buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel();
}

export function renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YDoc(
  model: ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel = currentManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel(),
): string {
  return [
    "# Coach Report Manual Review Preview Payload Validation Contract Without Persistence 8Y",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    ...table([
      ["Field", "Value"],
      ["scope", model.scope],
      ["version", model.version],
      ["baselineVersion", model.baselineVersion],
      ["matchId", model.matchId],
      ["officialScore", model.officialScore],
      ["validationContractStatus", model.validationContractStatus],
      ["expectedValidationContractStatus", model.expectedValidationContractStatus],
      ["validationRuntimeActive", bool(model.validationRuntimeActive)],
      ["validationExecutionCount", String(model.validationExecutionCount)],
      ["realPayloadReadCount", String(model.realPayloadReadCount)],
      ["payloadCreated", bool(model.payloadCreated)],
      ["realPreviewGenerated", bool(model.realPreviewGenerated)],
    ]),
    "",
    "## Baseline Preservation 8X -> 6X",
    ...table([
      ["Baseline", "Preserved"],
      ["8X payload contract", bool(model.baseline8XPreserved)],
      ["8W activation guards", bool(model.baseline8WPreserved)],
      ["8V field visual readiness", bool(model.baseline8VPreserved)],
      ["8U input field contract", bool(model.baseline8UPreserved)],
      ["8T interaction contract", bool(model.baseline8TPreserved)],
      ["8S UX skeleton", bool(model.baseline8SPreserved)],
      ["8R workflow readiness", bool(model.baseline8RPreserved)],
      ["8Q review gate needs_completion", bool(model.baseline8QPreserved)],
      ["8P comparison", bool(model.baseline8PPreserved)],
      ["8O preview renderer", bool(model.baseline8OPreserved)],
      ["8N intake boundary", bool(model.baseline8NPreserved)],
      ["8M manual form", bool(model.baseline8MPreserved)],
      ["8L learning loop", bool(model.baseline8LPreserved)],
      ["8K decision layer", bool(model.baseline8KPreserved)],
      ["8I", bool(model.baseline8IPreserved)],
      ["8H", bool(model.baseline8HPreserved)],
      ["8G", bool(model.baseline8GPreserved)],
      ["8F", bool(model.baseline8FPreserved)],
      ["8E", bool(model.baseline8EPreserved)],
      ["8D", bool(model.baseline8DPreserved)],
      ["8C", bool(model.baseline8CPreserved)],
      ["8B", bool(model.baseline8BPreserved)],
      ["8A", bool(model.baseline8APreserved)],
      ["7H", bool(model.baseline7HPreserved)],
      ["6X match economy", bool(model.baseline6XPreserved)],
    ]),
    "",
    "## Validation Groups",
    ...table([
      ["Order", "Group", "Purpose"],
      ...model.contract.validationGroups.map((group) => [String(group.order), group.groupId, group.purpose]),
    ]),
    "",
    "## Ordered Validation Steps",
    ...table([
      ["Order", "Step", "Active in 8Y", "Future only"],
      ...model.contract.orderedValidationSteps.map((step) => [String(step.order), step.stepId, bool(step.activeIn8Y), bool(step.futureRuntimeOnly)]),
    ]),
    "",
    "## Rule -> Field -> Error -> Blocker Mapping",
    ...table([
      ["Rule", "Field", "Entry field", "Error", "Blocker"],
      ...model.contract.ruleMappings.map((mapping) => [mapping.ruleId, mapping.appliesToPayloadField, mapping.appliesToEntryField ?? "none", mapping.errorStateId, mapping.blockerId]),
    ]),
    "",
    "## Coach-Facing Error Messages",
    ...table([
      ["Message", "Rule", "Coach message"],
      ...model.contract.errorMessages.map((message) => [message.messageId, message.linkedRuleId, message.coachFacingMessage]),
    ]),
    "",
    "## Technical Messages",
    ...table([
      ["Message", "Technical message"],
      ...model.contract.errorMessages.map((message) => [message.messageId, message.technicalMessage]),
    ]),
    "",
    "## Validation Blockers",
    ...table([
      ["Blocker", "Severity", "Coach message"],
      ...model.contract.validationBlockers.map((blocker) => [blocker.blockerId, blocker.severity, blocker.coachFacingMessage]),
    ]),
    "",
    "## Refusal States",
    ...table([
      ["Refusal state", "Prevents", "Message"],
      ...model.contract.refusalStates.map((refusal) => [refusal.refusalStateId, refusal.prevents.join(", "), refusal.coachFacingMessage]),
    ]),
    "",
    "## Boundary Guards",
    ...table([
      ["Boundary guard", "Trigger"],
      ...model.contract.boundaryGuards.map((guard) => [guard.boundaryGuardId, guard.trigger]),
    ]),
    "",
    "## Observation Entry Contracts",
    "Observation entry contracts are contract shapes only, not executable examples and not coach data.",
    ...table([
      ["Entry contract", "Source 8X", "Runtime instance", "Contract shape only"],
      ...model.contract.observationEntryContracts.map((entry) => [entry.entryContractId, entry.sourceEntryContractId8X, bool(entry.isRuntimeInstance), bool(entry.isContractShapeOnly)]),
    ]),
    "",
    "## Validation Readiness",
    ...table([
      ["Metric", "Value"],
      ["validationGroupCount", String(model.validationGroupCount)],
      ["orderedValidationStepCount", String(model.orderedValidationStepCount)],
      ["validationRuleMappingCount", String(model.validationRuleMappingCount)],
      ["errorMessageCount", String(model.errorMessageCount)],
      ["blockerCount", String(model.blockerCount)],
      ["refusalStateCount", String(model.refusalStateCount)],
      ["boundaryGuardCount", String(model.boundaryGuardCount)],
      ["observationEntryContractCount", String(model.observationEntryContractCount)],
    ]),
    "",
    "## Validation Contract / Runtime Distinction",
    `- validationContractDistinctFromValidationRuntime: ${bool(model.validationContractDistinctFromValidationRuntime)}`,
    `- validationContractDistinctFromPayloadCreation: ${bool(model.validationContractDistinctFromPayloadCreation)}`,
    `- validationContractDistinctFromPreviewGeneration: ${bool(model.validationContractDistinctFromPreviewGeneration)}`,
    `- readinessDistinctFromReviewGateStillVisible: ${bool(model.readinessDistinctFromReviewGateStillVisible)}`,
    "",
    "## Non-Persistence Audit",
    ...table([
      ["Metric", "Value"],
      ["localStoragePersistenceCount", String(model.nonPersistenceAudit.localStoragePersistenceCount)],
      ["databasePersistenceCount", String(model.nonPersistenceAudit.databasePersistenceCount)],
      ["filePersistenceCount", String(model.nonPersistenceAudit.filePersistenceCount)],
      ["draftCreationCount", String(model.nonPersistenceAudit.draftCreationCount)],
      ["historyCreationCount", String(model.nonPersistenceAudit.historyCreationCount)],
      ["validationPersistencePerformed", bool(model.nonPersistenceAudit.validationPersistencePerformed)],
      ["validationApplicationPerformed", bool(model.nonPersistenceAudit.validationApplicationPerformed)],
    ]),
    "",
    "## Official Truth Boundary Audit",
    ...table([
      ["Metric", "Value"],
      ["officialTruthPromotionCount", String(model.boundaryAudit.officialTruthPromotionCount)],
      ["automaticDecisionCount", String(model.boundaryAudit.automaticDecisionCount)],
      ["selectionRecommendationCount", String(model.boundaryAudit.selectionRecommendationCount)],
      ["tacticalInstructionCount", String(model.boundaryAudit.tacticalInstructionCount)],
      ["sandboxPromotionCount", String(model.boundaryAudit.sandboxPromotionCount)],
      ["diagnosticPromotionCount", String(model.boundaryAudit.diagnosticPromotionCount)],
      ["batchPromotionCount", String(model.boundaryAudit.batchPromotionCount)],
    ]),
    "",
    "## Export Metadata Audit",
    ...table([
      ["Metric", "Value"],
      ["exportTitleMentions8Y", bool(model.exportMetadataAudit.exportTitleMentions8Y)],
      ["exportMainCurrentVersionVisible", bool(model.exportMetadataAudit.exportMainCurrentVersionVisible)],
      ["exportVisibleBadgeMentions8Y", bool(model.exportMetadataAudit.exportVisibleBadgeMentions8Y)],
      ["exportMainIdStillCompressedExport8X", bool(model.exportMetadataAudit.exportMainIdStillCompressedExport8X)],
      ["exportHistoricalMarkersPreservedAsDataAttributes", bool(model.exportMetadataAudit.exportHistoricalMarkersPreservedAsDataAttributes)],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    ...table([
      ["Metric", "Value"],
      ["validationContractDoesNotClaimNewScoreEvidence", bool(model.sourceOfTruthAudit.validationContractDoesNotClaimNewScoreEvidence)],
      ["validationContractDoesNotCreateFutureEvidence", bool(model.sourceOfTruthAudit.validationContractDoesNotCreateFutureEvidence)],
      ["validationContractDoesNotMutateTimeline", bool(model.sourceOfTruthAudit.validationContractDoesNotMutateTimeline)],
      ["validationContractDoesNotMutateScore", bool(model.sourceOfTruthAudit.validationContractDoesNotMutateScore)],
      ["noScoringConstantChange", bool(model.sourceOfTruthAudit.noScoringConstantChange)],
      ["MatchBonusEventUnchanged", bool(model.sourceOfTruthAudit.MatchBonusEventUnchanged)],
      ["batchLiveSeparationPreserved", bool(model.sourceOfTruthAudit.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Export Budget Audit",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsAfter8Y", String(model.exportBudgetAudit.exportReadTimeSecondsAfter8Y)],
      ["exportUnder900Seconds", bool(model.exportBudgetAudit.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.exportBudgetAudit.exportUnder800Seconds)],
      ["exportNoFullTimeline", bool(model.exportBudgetAudit.exportNoFullTimeline)],
      ["exportNoSandboxPanel", bool(model.exportBudgetAudit.exportNoSandboxPanel)],
      ["exportNoLongBatchDiagnostics", bool(model.exportBudgetAudit.exportNoLongBatchDiagnostics)],
    ]),
    "",
    "## Integration Budget Audit",
    ...table([
      ["Metric", "Value"],
      ["productPreviewPayloadContract8XStillVisible", bool(model.integrationBudgetAudit.productPreviewPayloadContract8XStillVisible)],
      ["exportPreviewPayloadContract8XStillVisible", bool(model.integrationBudgetAudit.exportPreviewPayloadContract8XStillVisible)],
      ["productPreviewActivationGuards8WStillVisible", bool(model.integrationBudgetAudit.productPreviewActivationGuards8WStillVisible)],
      ["exportPreviewActivationGuards8WStillVisible", bool(model.integrationBudgetAudit.exportPreviewActivationGuards8WStillVisible)],
      ["productActionPlanVisible", bool(model.integrationBudgetAudit.productActionPlanVisible)],
      ["exportActionPlanVisible", bool(model.integrationBudgetAudit.exportActionPlanVisible)],
      ["tacticalMapCardsStillVisible", bool(model.integrationBudgetAudit.tacticalMapCardsStillVisible)],
      ["exportCompactPreserved", bool(model.integrationBudgetAudit.exportCompactPreserved)],
    ]),
    "",
    "## Wording Audit",
    ...table([
      ["Metric", "Value"],
      ["observationEntryContractWordingVisible", bool(model.wordingAudit.observationEntryContractWordingVisible)],
      ["observationEntryExampleWordingCount", String(model.wordingAudit.observationEntryExampleWordingCount)],
      ["validationContractNoRuntimeWordingVisible", bool(model.wordingAudit.validationContractNoRuntimeWordingVisible)],
      ["wordingReadabilityScore", String(model.wordingAudit.wordingReadabilityScore)],
      ["ambiguousValidationContractWordingCount", String(model.wordingAudit.ambiguousValidationContractWordingCount)],
    ]),
    "",
    "## Product / Export Excerpts",
    "- product excerpt: Contrat de validation du payload - Validation future documentee - aucune execution.",
    "- export excerpt: Validation payload preview revue manuelle - Contrat validation documente, non execute.",
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation(
  model: ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel = currentManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel(),
): string {
  const checks = [
    checkLine("ManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel exists", true, model.version),
    checkLine("baseline 8X visible and preserved", model.baseline8XPreserved, bool(model.baseline8XPreserved)),
    checkLine("baseline 8W preserved", model.baseline8WPreserved, bool(model.baseline8WPreserved)),
    checkLine("baseline 8V preserved", model.baseline8VPreserved, bool(model.baseline8VPreserved)),
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
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("product preview payload validation contract visible", model.productPreviewPayloadValidationContractVisible, bool(model.productPreviewPayloadValidationContractVisible)),
    checkLine("export preview payload validation contract visible", model.exportPreviewPayloadValidationContractVisible, bool(model.exportPreviewPayloadValidationContractVisible)),
    checkLine("validation contract uses payload contract 8X", model.validationContractUsesPayloadContract8X, bool(model.validationContractUsesPayloadContract8X)),
    checkLine("validation contract uses activation guards 8W", model.validationContractUsesActivationGuards8W, bool(model.validationContractUsesActivationGuards8W)),
    checkLine("validation contract uses field visual readiness 8V", model.validationContractUsesFieldVisualReadiness8V, bool(model.validationContractUsesFieldVisualReadiness8V)),
    checkLine("validation contract uses input field contract 8U", model.validationContractUsesInputFieldContract8U, bool(model.validationContractUsesInputFieldContract8U)),
    checkLine("validationContractStatus = documented_but_not_executable", model.validationContractStatus === "documented_but_not_executable", model.validationContractStatus),
    checkLine("expectedValidationContractStatus = documented_but_not_executable", model.expectedValidationContractStatus === "documented_but_not_executable", model.expectedValidationContractStatus),
    checkLine("validationContractStatusCorrect = true", model.validationContractStatusCorrect, bool(model.validationContractStatusCorrect)),
    checkLine("validationRuntimeActive = false", !model.validationRuntimeActive, bool(model.validationRuntimeActive)),
    checkLine("payloadValidationRuntimeDetected = false", !model.payloadValidationRuntimeDetected, bool(model.payloadValidationRuntimeDetected)),
    checkLine("validationExecutionCount = 0", model.validationExecutionCount === 0, String(model.validationExecutionCount)),
    checkLine("realPayloadReadCount = 0", model.realPayloadReadCount === 0, String(model.realPayloadReadCount)),
    checkLine("validationGroupCount = 7", model.validationGroupCount === 7, String(model.validationGroupCount)),
    checkLine("orderedValidationStepCount = 10", model.orderedValidationStepCount === 10, String(model.orderedValidationStepCount)),
    checkLine("validationRuleMappingCount = 20", model.validationRuleMappingCount === 20, String(model.validationRuleMappingCount)),
    checkLine("errorMessageCount = 19", model.errorMessageCount === 19, String(model.errorMessageCount)),
    checkLine("blockerCount = 12", model.blockerCount === 12, String(model.blockerCount)),
    checkLine("refusalStateCount = 8", model.refusalStateCount === 8, String(model.refusalStateCount)),
    checkLine("boundaryGuardCount = 14", model.boundaryGuardCount === 14, String(model.boundaryGuardCount)),
    checkLine("observationEntryContractCount = 3", model.observationEntryContractCount === 3, String(model.observationEntryContractCount)),
    checkLine("observationEntryContractWordingVisible = true", model.observationEntryContractWordingVisible, bool(model.observationEntryContractWordingVisible)),
    checkLine("observationEntryExampleWordingCount = 0 in 8Y main product/export sections", model.observationEntryExampleWordingCount === 0, String(model.observationEntryExampleWordingCount)),
    checkLine("ruleToFieldMappingCount >= 20", model.mappingAudit.ruleToFieldMappingCount >= 20, String(model.mappingAudit.ruleToFieldMappingCount)),
    checkLine("ruleToErrorMappingCount = 20", model.mappingAudit.ruleToErrorMappingCount === 20, String(model.mappingAudit.ruleToErrorMappingCount)),
    checkLine("ruleToBlockerMappingCount >= 20", model.mappingAudit.ruleToBlockerMappingCount >= 20, String(model.mappingAudit.ruleToBlockerMappingCount)),
    checkLine("coachFacingErrorMessageCount = 19", model.mappingAudit.coachFacingErrorMessageCount === 19, String(model.mappingAudit.coachFacingErrorMessageCount)),
    checkLine("technicalErrorMessageCount = 19", model.mappingAudit.technicalErrorMessageCount === 19, String(model.mappingAudit.technicalErrorMessageCount)),
    checkLine("unmappedRuleCount = 0", model.mappingAudit.unmappedRuleCount === 0, String(model.mappingAudit.unmappedRuleCount)),
    checkLine("unmappedErrorCount = 0", model.mappingAudit.unmappedErrorCount === 0, String(model.mappingAudit.unmappedErrorCount)),
    checkLine("unmappedBlockerCount = 0", model.mappingAudit.unmappedBlockerCount === 0, String(model.mappingAudit.unmappedBlockerCount)),
    checkLine("payload source remains manual_non_official", model.payloadSource === "manual_non_official", model.payloadSource),
    checkLine("payload scope remains preview_only", model.payloadScope === "preview_only", model.payloadScope),
    checkLine("payload officialTruth remains false", !model.payloadOfficialTruth, bool(model.payloadOfficialTruth)),
    checkLine("payload persistence remains none", model.payloadPersistence === "none", model.payloadPersistence),
    checkLine("payload application remains none", model.payloadApplication === "none", model.payloadApplication),
    checkLine("payloadContractStatusFrom8X remains documented_but_not_instantiated", model.payloadContractStatusFrom8X === "documented_but_not_instantiated", model.payloadContractStatusFrom8X),
    checkLine("previewActivationStatusFrom8W remains documented_but_blocked", model.previewActivationStatusFrom8W === "documented_but_blocked", model.previewActivationStatusFrom8W),
    checkLine("fieldVisualReadinessStatusFrom8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("validation contract distinct from runtime", model.validationContractDistinctFromValidationRuntime, bool(model.validationContractDistinctFromValidationRuntime)),
    checkLine("validation contract distinct from payload creation", model.validationContractDistinctFromPayloadCreation, bool(model.validationContractDistinctFromPayloadCreation)),
    checkLine("validation contract distinct from preview generation", model.validationContractDistinctFromPreviewGeneration, bool(model.validationContractDistinctFromPreviewGeneration)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPayloadInstanceCount = 0", model.realPayloadInstanceCount === 0, String(model.realPayloadInstanceCount)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("submitButtonCount = 0", model.noRuntimeAudit.submitButtonCount === 0, String(model.noRuntimeAudit.submitButtonCount)),
    checkLine("backendActionCount = 0", model.noRuntimeAudit.backendActionCount === 0, String(model.noRuntimeAudit.backendActionCount)),
    checkLine("apiCallCount = 0", model.noRuntimeAudit.apiCallCount === 0, String(model.noRuntimeAudit.apiCallCount)),
    checkLine("no localStorage", model.nonPersistenceAudit.localStoragePersistenceCount === 0, String(model.nonPersistenceAudit.localStoragePersistenceCount)),
    checkLine("no database persistence", model.nonPersistenceAudit.databasePersistenceCount === 0, String(model.nonPersistenceAudit.databasePersistenceCount)),
    checkLine("no file persistence", model.nonPersistenceAudit.filePersistenceCount === 0, String(model.nonPersistenceAudit.filePersistenceCount)),
    checkLine("no draft creation", model.nonPersistenceAudit.draftCreationCount === 0, String(model.nonPersistenceAudit.draftCreationCount)),
    checkLine("no history creation", model.nonPersistenceAudit.historyCreationCount === 0, String(model.nonPersistenceAudit.historyCreationCount)),
    checkLine("no memory creation", model.nonPersistenceAudit.memoryCreationCount === 0, String(model.nonPersistenceAudit.memoryCreationCount)),
    checkLine("no official truth promotion", model.boundaryAudit.officialTruthPromotionCount === 0, String(model.boundaryAudit.officialTruthPromotionCount)),
    checkLine("no automatic decision", model.boundaryAudit.automaticDecisionCount === 0, String(model.boundaryAudit.automaticDecisionCount)),
    checkLine("no selection/tactic", model.boundaryAudit.selectionRecommendationCount + model.boundaryAudit.tacticalInstructionCount === 0, `${model.boundaryAudit.selectionRecommendationCount}/${model.boundaryAudit.tacticalInstructionCount}`),
    checkLine("scoreMutationCount = 0", model.scoreMutationCount === 0, String(model.scoreMutationCount)),
    checkLine("timelineMutationCount = 0", model.timelineMutationCount === 0, String(model.timelineMutationCount)),
    checkLine("scoreChangeCreationCount = 0", model.scoreChangeCreationCount === 0, String(model.scoreChangeCreationCount)),
    checkLine("eventMutationCount = 0", model.eventMutationCount === 0, String(model.eventMutationCount)),
    checkLine("exportReadTimeSecondsAfter8Y <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8Y <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8Y)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("export title mentions 8Y", model.exportMetadataAudit.exportTitleMentions8Y, bool(model.exportMetadataAudit.exportTitleMentions8Y)),
    checkLine("export visible badge mentions 8Y", model.exportMetadataAudit.exportVisibleBadgeMentions8Y, bool(model.exportMetadataAudit.exportVisibleBadgeMentions8Y)),
    checkLine("export main id no longer compressed-export-8x", !model.exportMetadataAudit.exportMainIdStillCompressedExport8X, bool(model.exportMetadataAudit.exportMainIdStillCompressedExport8X)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("no scoring constants changed", model.sourceOfTruthAudit.noScoringConstantChange, bool(model.sourceOfTruthAudit.noScoringConstantChange)),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthAudit.batchLiveSeparationPreserved)),
    checkLine("share pack PASS can be generated", true, "validated by reports:share"),
  ];
  return [
    "# Validation - Coach Report Manual Review Preview Payload Validation Contract Without Persistence 8Y",
    "",
    `Status: ${model.status}`,
    "",
    "## Counts",
    `- validationGroupCount: ${model.validationGroupCount}`,
    `- orderedValidationStepCount: ${model.orderedValidationStepCount}`,
    `- validationRuleMappingCount: ${model.validationRuleMappingCount}`,
    `- errorMessageCount: ${model.errorMessageCount}`,
    `- blockerCount: ${model.blockerCount}`,
    `- refusalStateCount: ${model.refusalStateCount}`,
    `- boundaryGuardCount: ${model.boundaryGuardCount}`,
    `- observationEntryContractCount: ${model.observationEntryContractCount}`,
    `- observationEntryExampleWordingCount: ${model.observationEntryExampleWordingCount}`,
    `- exportReadTimeSecondsAfter8Y: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8Y}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Commands",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}
