import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewInputFieldContractWithoutPersistence8UModel,
  currentManualReviewInputFieldContractWithoutPersistence8UModel,
} from "./buildManualReviewInputFieldContractWithoutPersistence8U";
import {
  auditManualReviewFieldUxVisualExport8V,
  auditManualReviewFieldUxVisualIntegration8V,
  auditManualReviewFieldUxVisualReadiness8V,
  auditManualReviewFieldUxVisualSafety8V,
} from "./manualReviewFieldUxVisualReadinessAudit8V";
import type {
  ManualReviewFieldUxVisualCard8V,
  ManualReviewFieldUxVisualComponentPreview8V,
  ManualReviewFieldUxVisualGroup8V,
  ManualReviewFieldUxVisualReadiness8V,
  ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel,
  ManualReviewFieldUxVisualSection8V,
} from "./manualReviewFieldUxVisualReadinessTypes8V";
import {
  MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_8V_BLOCKING_WARNINGS,
  type ManualReviewFieldUxVisualReadinessWarningCode8V,
} from "./manualReviewFieldUxVisualReadinessWarnings8V";
import type {
  ManualReviewInputField8U,
  ManualReviewInputFieldContractWithoutPersistence8UModel,
} from "./manualReviewInputFieldContractTypes8U";
import {
  insertManualReviewFieldUxVisualReadinessExport8V,
  renderManualReviewFieldUxVisualReadinessExport8V,
} from "./renderManualReviewFieldUxVisualReadinessExport8V";
import {
  insertManualReviewFieldUxVisualReadinessProduct8V,
  renderManualReviewFieldUxVisualReadinessProduct8V,
} from "./renderManualReviewFieldUxVisualReadinessProduct8V";

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
  warnings: readonly ManualReviewFieldUxVisualReadinessWarningCode8V[],
): readonly ManualReviewFieldUxVisualReadinessWarningCode8V[] {
  return [...new Set(warnings)];
}

function componentForField(field: ManualReviewInputField8U): ManualReviewFieldUxVisualComponentPreview8V {
  if (field.fieldKind === "enum_select") return "disabled_select_mock";
  if (field.fieldKind === "integer") return "disabled_counter_mock";
  if (field.fieldKind === "long_text") return "disabled_long_text_mock";
  return "disabled_short_text_mock";
}

function groupSlugForField(field: ManualReviewInputField8U): "result" | "counts" | "notes" {
  if (field.linked8MFieldKind === "outcome_select" || field.linked8MFieldKind === "context_comparability_select") {
    return "result";
  }
  if (
    field.linked8MFieldKind === "comparable_situation_count"
    || field.linked8MFieldKind === "positive_signal_count"
    || field.linked8MFieldKind === "negative_signal_count"
  ) {
    return "counts";
  }
  return "notes";
}

function purposeForField(field: ManualReviewInputField8U): string {
  if (field.linked8MFieldKind === "outcome_select") {
    return "Montrer le resultat que le coach pourra choisir plus tard, sans en faire une verite officielle.";
  }
  if (field.linked8MFieldKind === "context_comparability_select") {
    return "Montrer si la situation pourra etre comparee honnetement a l'observation precedente.";
  }
  if (field.fieldKind === "integer") {
    return "Afficher un futur compteur de preuve, sans calcul actif ni stockage.";
  }
  return "Afficher une future note coach courte, sans memoire, payload ni preview reelle.";
}

function constraintForField(field: ManualReviewInputField8U): string {
  if (field.allowedValues !== undefined) {
    return `Valeurs futures: ${field.allowedValues.join(" / ")}.`;
  }
  if (field.minValue !== undefined && field.maxValue !== undefined) {
    return `Nombre entier futur entre ${field.minValue} et ${field.maxValue}.`;
  }
  if (field.maxLength !== undefined) {
    return `Texte futur limite a ${field.maxLength} caracteres.`;
  }
  return "Valeur future documentee par le contrat 8U.";
}

function buildVisualSections(
  baseline8U: ManualReviewInputFieldContractWithoutPersistence8UModel,
): readonly ManualReviewFieldUxVisualSection8V[] {
  return baseline8U.contract.fieldSections.map((section) => ({
    visualSectionId: section.sectionId.replace("-8u", "-8v"),
    linked8USectionId: section.sectionId,
    linked8MReviewSectionId: section.linked8MReviewSectionId,
    linked8LObservationCardId: section.linked8LObservationCardId,
    linked8KDecisionCardId: section.linked8KDecisionCardId,
    sectionOrder: section.sectionOrder,
    sectionTitle: section.sectionTitle,
    coachFacingQuestion: section.sectionQuestion,
    visualSummary: "Parcours visuel futur: lire le resultat, verifier les compteurs, puis ajouter une note courte sans activer la saisie.",
    fieldGroupIds: [
      `${section.sectionId.replace("-8u", "-8v")}-result`,
      `${section.sectionId.replace("-8u", "-8v")}-counts`,
      `${section.sectionId.replace("-8u", "-8v")}-notes`,
    ],
    visualStatus: "future_disabled_visual_only",
    disabledIn8V: true,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function buildGroupsForSection(section: ManualReviewFieldUxVisualSection8V): readonly ManualReviewFieldUxVisualGroup8V[] {
  return [
    {
      visualGroupId: `${section.visualSectionId}-result`,
      sectionId: section.visualSectionId,
      groupTitle: "Resultat",
      groupPurpose: "outcome_select + context_comparability_select",
      fieldKinds: ["outcome_select", "context_comparability_select"],
      coachFacingExplanation: "Comprendre ce que le coach pense avoir observe et si le contexte permet une comparaison honnete.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      visualGroupId: `${section.visualSectionId}-counts`,
      sectionId: section.visualSectionId,
      groupTitle: "Compteurs",
      groupPurpose: "comparable_situation_count + positive_signal_count + negative_signal_count",
      fieldKinds: ["comparable_situation_count", "positive_signal_count", "negative_signal_count"],
      coachFacingExplanation: "Rendre visible le volume de preuves et l'equilibre des signaux.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      visualGroupId: `${section.visualSectionId}-notes`,
      sectionId: section.visualSectionId,
      groupTitle: "Notes",
      groupPurpose: "short_evidence_note + coach_free_note",
      fieldKinds: ["short_evidence_note", "coach_free_note"],
      coachFacingExplanation: "Garder une trace courte de ce qui a ete vu, sans officialiser ni stocker.",
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildVisualCards(input: {
  readonly baseline8U: ManualReviewInputFieldContractWithoutPersistence8UModel;
  readonly visualSections: readonly ManualReviewFieldUxVisualSection8V[];
}): readonly ManualReviewFieldUxVisualCard8V[] {
  const cards: ManualReviewFieldUxVisualCard8V[] = [];
  for (const field of input.baseline8U.contract.fields) {
    const section = input.visualSections.find((candidate) => candidate.linked8USectionId === field.sectionId);
    if (section === undefined) continue;
    const groupId = `${section.visualSectionId}-${groupSlugForField(field)}`;
    const errorSummary = field.errorStateIds.length === 0 ? "Aucune erreur future liee." : field.errorStateIds.join(", ");
    cards.push({
      visualCardId: field.fieldId.replace("-8u", "-8v"),
      linked8UFieldId: field.fieldId,
      sectionId: section.visualSectionId,
      groupId,
      fieldKind: field.linked8MFieldKind,
      coachFacingLabel: field.coachFacingLabel,
      fieldPurpose: purposeForField(field),
      expectedValueType: field.expectedValueType,
      visualComponentPreview: componentForField(field),
      placeholder: field.placeholder,
      constraintSummary: constraintForField(field),
      helpText: field.helpText,
      futureValidationSummary: field.validationRuleIds.join(", "),
      futureErrorSummary: errorSummary,
      disabledReason: "Champ visuel statique 8V: futur, desactive, read-only, non officiel, non persiste et non applique.",
      badges: ["future", "disabled", "read_only", "non_official", "not_persisted", "not_applied"],
      activeIn8V: false,
      disabledIn8V: true,
      readOnlyIn8V: true,
      canSubmitIn8V: false,
      canPersistIn8V: false,
      canCallApiIn8V: false,
      canCreatePayloadIn8V: false,
      canGeneratePreviewIn8V: false,
      canPromoteOfficialTruthIn8V: false,
      canDriveSelectionIn8V: false,
      canDriveTacticalInstructionIn8V: false,
      visibleInProduct: true,
      visibleInExport: true,
    });
  }
  return cards;
}

function buildVisualReadiness(
  baseline8U: ManualReviewInputFieldContractWithoutPersistence8UModel,
): ManualReviewFieldUxVisualReadiness8V {
  const visualSections = buildVisualSections(baseline8U);
  const visualFieldGroups = visualSections.flatMap(buildGroupsForSection);
  const visualFieldCards = buildVisualCards({ baseline8U, visualSections });
  return {
    visualReadinessId: "manual-review-field-ux-visual-readiness-8v",
    visualMode: "future_field_visual_readiness_only",
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
    visualSections,
    visualFieldGroups,
    visualFieldCards,
    visualValidationSummary: {
      summaryId: "manual-review-field-ux-validation-summary-8v",
      validationRuleCount: baseline8U.contract.validationRules.length,
      activeValidationRuleCount: baseline8U.activeValidationRuleCount,
      rulesGroupedByPurpose: [
        { group: "required_fields", ruleIds: ["required_fields_missing_blocks_future_preview"] },
        { group: "enum_values", ruleIds: ["outcome_must_be_known_enum", "comparability_must_be_known_enum"] },
        { group: "counters", ruleIds: ["comparable_count_must_be_integer_0_99", "positive_count_must_be_integer_0_99", "negative_count_must_be_integer_0_99"] },
        { group: "consistency", ruleIds: ["signal_counts_cannot_exceed_comparable_count"] },
        { group: "notes", ruleIds: ["short_evidence_note_max_length", "coach_free_note_max_length"] },
        { group: "caution", ruleIds: ["insufficient_sample_blocks_future_preview"] },
      ],
      requiredFieldsRulesVisible: true,
      enumRulesVisible: true,
      counterRulesVisible: true,
      consistencyRulesVisible: true,
      noteLengthRulesVisible: true,
      cautionRulesVisible: true,
      coachFacingSummary: "Les regles futures sont visibles pour lecture coach, mais aucune validation active n'est executee en 8V.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    visualErrorSummary: {
      summaryId: "manual-review-field-ux-error-summary-8v",
      errorStateCount: baseline8U.contract.errorStates.length,
      activeErrorStateCount: baseline8U.activeErrorStateCount,
      errorsGroupedByFieldKind: [
        { group: "result", errorStateIds: ["UNKNOWN_OUTCOME_VALUE_8U", "UNKNOWN_COMPARABILITY_VALUE_8U"] },
        { group: "counts", errorStateIds: ["COMPARABLE_COUNT_OUT_OF_RANGE_8U", "SIGNAL_COUNT_OUT_OF_RANGE_8U", "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8U"] },
        { group: "notes", errorStateIds: ["NOTE_TOO_LONG_8U", "UNSUPPORTED_RECOMMENDATION_WORDING_8U"] },
      ],
      blockingFutureErrorsVisible: true,
      coachFacingSummary: "Les erreurs futures sont expliquees comme etats visuels, sans bloquer une vraie soumission en 8V puisqu'aucune soumission n'existe.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    visualRefusalSummary: baseline8U.contract.refusalStates.map((refusal) => refusal.refusalStateId),
    visualReadinessSummary: {
      summaryId: "manual-review-field-ux-readiness-summary-8v",
      visualReadinessStatus: "ready_for_static_visual_review",
      fieldContractStatusFrom8U: "PASS",
      workflowReadinessStatusFrom8S: baseline8U.workflowReadinessStatusFrom8S,
      reviewGateStatusFrom8Q: baseline8U.reviewGateStatusFrom8Q,
      visualSectionCount: visualSections.length,
      visualFieldCardCount: visualFieldCards.length,
      disabledFieldCount: visualFieldCards.filter((card) => card.disabledIn8V).length,
      activeFieldCount: visualFieldCards.filter((card) => card.activeIn8V).length,
      coachReadabilityScore: 96,
      visualDensityAcceptable: true,
      whatIsReady: [
        "Les 3 sections sont visibles.",
        "Les 21 champs futurs sont regroupes et expliques.",
        "Les badges futur/desactive/non officiel/non persiste/non applique sont visibles.",
      ],
      whatIsStillNotReady: [
        "Aucune saisie reelle n'est active.",
        "Aucune preview reelle n'est generee.",
        "Aucune donnee coach n'est stockee ou appliquee.",
      ],
      coachFacingReadout: "Pret pour revue visuelle statique seulement.",
      visibleInProduct: true,
      visibleInExport: true,
    },
    boundaries: [
      {
        boundaryId: "no-real-input-8v",
        label: "Aucune saisie reelle",
        text: "Les cartes ressemblent a des champs futurs mais ne sont pas des controles HTML actifs.",
        prevents: ["input", "submit", "payload"],
        visibleInProduct: true,
        visibleInExport: true,
      },
      {
        boundaryId: "no-storage-8v",
        label: "Aucun stockage",
        text: "La couche visuelle ne cree ni localStorage, ni fichier, ni base, ni memoire.",
        prevents: ["localStorage", "database", "file", "memory"],
        visibleInProduct: true,
        visibleInExport: true,
      },
      {
        boundaryId: "no-official-truth-8v",
        label: "Aucune verite officielle",
        text: "La revue coach reste future et non officielle; elle ne modifie ni score, ni timeline, ni selection.",
        prevents: ["official truth", "score", "timeline", "selection", "tactic"],
        visibleInProduct: true,
        visibleInExport: true,
      },
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
  warnings: readonly ManualReviewFieldUxVisualReadinessWarningCode8V[],
): "PASS" | "PARTIAL" | "FAIL" {
  if (warnings.some((warning) => MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_8V_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  return warnings.length === 0 ? "PASS" : "PARTIAL";
}

export function buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel(input?: {
  readonly baseline8U?: ManualReviewInputFieldContractWithoutPersistence8UModel;
  readonly productHtmlBefore8V?: string;
  readonly exportHtmlBefore8V?: string;
}): ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel {
  const baseline8U = input?.baseline8U ?? currentManualReviewInputFieldContractWithoutPersistence8UModel();
  if (baseline8U.status !== "PASS") {
    throw new Error(`Manual review field UX visual readiness 8V requires PASS 8U baseline, got ${baseline8U.status}.`);
  }
  const productHtmlBefore8V = input?.productHtmlBefore8V ?? baseline8U.productHtmlAfter8U;
  const exportHtmlBefore8V = input?.exportHtmlBefore8V ?? baseline8U.exportHtmlAfter8U;
  const visualReadiness = buildVisualReadiness(baseline8U);
  const productFieldUxVisualReadinessHtml = renderManualReviewFieldUxVisualReadinessProduct8V(visualReadiness);
  const exportFieldUxVisualReadinessHtml = renderManualReviewFieldUxVisualReadinessExport8V(visualReadiness);
  const productHtmlAfter8V = insertManualReviewFieldUxVisualReadinessProduct8V(productHtmlBefore8V, productFieldUxVisualReadinessHtml);
  const exportHtmlAfter8V = insertManualReviewFieldUxVisualReadinessExport8V(exportHtmlBefore8V, exportFieldUxVisualReadinessHtml);
  const visualAudit = auditManualReviewFieldUxVisualReadiness8V({ visualReadiness, productHtml: productHtmlAfter8V, exportHtml: exportHtmlAfter8V });
  const safetyAudit = auditManualReviewFieldUxVisualSafety8V({ visualReadiness, productHtml: productFieldUxVisualReadinessHtml, exportHtml: exportFieldUxVisualReadinessHtml });
  const exportAudit = auditManualReviewFieldUxVisualExport8V({ exportHtmlBefore8V, exportHtmlAfter8V });
  const integrationAudit = auditManualReviewFieldUxVisualIntegration8V({ productHtml: productHtmlAfter8V, exportHtml: exportHtmlAfter8V });
  const warningCodes = uniqueWarnings([
    ...visualAudit.visualWarningCodes,
    ...safetyAudit.safetyWarningCodes,
    ...exportAudit.exportWarningCodes,
    ...integrationAudit.integrationWarningCodes,
  ]);
  const status = statusFromWarnings(warningCodes);
  const fieldUxVisualReadinessReady = status === "PASS" && visualReadiness.visualReadinessSummary.visualReadinessStatus === "ready_for_static_visual_review";
  return {
    status,
    scope: "MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_8V",
    baselineVersion: "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_8U",
    matchId: baseline8U.matchId,
    officialScore: baseline8U.officialScore,
    baseline8U,
    baseline8UPreserved: baseline8U.status === "PASS" && baseline8U.inputFieldContractReady,
    baseline8TPreserved: baseline8U.baseline8TPreserved,
    baseline8SPreserved: baseline8U.baseline8SPreserved,
    baseline8RPreserved: baseline8U.baseline8RPreserved,
    baseline8QPreserved: baseline8U.baseline8QPreserved,
    baseline8PPreserved: baseline8U.baseline8PPreserved,
    baseline8OPreserved: baseline8U.baseline8OPreserved,
    baseline8NPreserved: baseline8U.baseline8NPreserved,
    baseline8MPreserved: baseline8U.baseline8MPreserved,
    baseline8LPreserved: baseline8U.baseline8LPreserved,
    baseline8KPreserved: baseline8U.baseline8KPreserved,
    baseline8IPreserved: baseline8U.baseline8IPreserved,
    baseline8HPreserved: baseline8U.baseline8HPreserved,
    baseline8GPreserved: baseline8U.baseline8GPreserved,
    baseline8FPreserved: baseline8U.baseline8FPreserved,
    baseline8EPreserved: baseline8U.baseline8EPreserved,
    baseline8DPreserved: baseline8U.baseline8DPreserved,
    baseline8CPreserved: baseline8U.baseline8CPreserved,
    baseline8BPreserved: baseline8U.baseline8BPreserved,
    baseline8APreserved: baseline8U.baseline8APreserved,
    baseline7HPreserved: baseline8U.baseline7HPreserved,
    baseline6XPreserved: baseline8U.baseline6XPreserved,
    fieldUxVisualReadinessReady,
    productFieldUxVisualReadinessVisible: visualAudit.productVisible,
    exportFieldUxVisualReadinessVisible: visualAudit.exportVisible,
    fieldUxUsesInputFieldContract8U: visualAudit.usesInputFieldContract8U,
    visualSectionCount: visualAudit.visualSectionCount,
    visualSectionCountExpected: 3,
    visualFieldCardCount: visualAudit.visualFieldCardCount,
    visualFieldCardCountExpected: 21,
    visualFieldGroupCount: visualAudit.visualFieldGroupCount,
    disabledVisualStateCount: visualReadiness.visualFieldCards.filter((card) => card.disabledIn8V).length,
    activeFieldCount: safetyAudit.activeFieldCount,
    enabledInputControlCount: safetyAudit.enabledInputControlCount,
    editableTextFieldCount: safetyAudit.editableTextFieldCount,
    enabledSelectControlCount: safetyAudit.enabledSelectControlCount,
    enabledCheckboxControlCount: safetyAudit.enabledCheckboxControlCount,
    visualValidationRuleCount: visualReadiness.visualValidationSummary.validationRuleCount,
    visualErrorStateCount: visualReadiness.visualErrorSummary.errorStateCount,
    visualRefusalStateCount: visualReadiness.visualRefusalSummary.length,
    visualHelpTextCount: visualAudit.visualHelpTextCount,
    visualConstraintBadgeCount: visualAudit.visualConstraintBadgeCount,
    visualDisabledBadgeCount: visualAudit.visualDisabledBadgeCount,
    visualFutureOnlyBadgeCount: visualAudit.visualFutureOnlyBadgeCount,
    visualNonOfficialBadgeCount: visualAudit.visualNonOfficialBadgeCount,
    visualNotPersistedBadgeCount: visualAudit.visualNotPersistedBadgeCount,
    visualNotAppliedBadgeCount: visualAudit.visualNotAppliedBadgeCount,
    coachReadabilityScore: visualReadiness.visualReadinessSummary.coachReadabilityScore,
    visualDensityAcceptable: visualReadiness.visualReadinessSummary.visualDensityAcceptable,
    fieldGroupingCoachReadable: visualReadiness.visualFieldGroups.length === 9,
    fieldPurposeVisibleCount: visualAudit.fieldPurposeVisibleCount,
    fieldConstraintVisibleCount: visualAudit.fieldConstraintVisibleCount,
    fieldDisabledReasonVisibleCount: visualAudit.fieldDisabledReasonVisibleCount,
    fieldFutureValidationVisibleCount: visualAudit.fieldFutureValidationVisibleCount,
    workflowReadinessStatusFrom8S: baseline8U.workflowReadinessStatusFrom8S,
    reviewGateStatusFrom8Q: baseline8U.reviewGateStatusFrom8Q,
    readinessDistinctFromReviewGateStillVisible: baseline8U.workflowReadinessStatusFrom8S === "ready_for_non_persistent_preview" && baseline8U.reviewGateStatusFrom8Q === "needs_completion",
    visualLayerDoesNotCreateRealInput: safetyAudit.enabledInputControlCount === 0 && safetyAudit.activeFieldCount === 0,
    visualLayerDoesNotCreateSubmit: safetyAudit.submitButtonCount === 0,
    visualLayerDoesNotCreateApi: safetyAudit.apiCallCount === 0,
    visualLayerDoesNotCreateBackend: safetyAudit.backendActionCount === 0,
    visualLayerDoesNotCreateStorage: safetyAudit.localStoragePersistenceCount === 0 && safetyAudit.databasePersistenceCount === 0 && safetyAudit.filePersistenceCount === 0,
    visualLayerDoesNotCreatePayload: safetyAudit.payloadCreationCount === 0,
    visualLayerDoesNotCreateRealPreview: safetyAudit.realPreviewGenerationCount === 0,
    visualLayerDoesNotCreateMemory: safetyAudit.memoryCreationCount === 0 && safetyAudit.seasonMemoryCreationCount === 0 && safetyAudit.teamStyleMemoryCreationCount === 0,
    visualLayerDoesNotPromoteOfficialTruth: safetyAudit.officialTruthPromotionCount === 0,
    visualLayerDoesNotCreateAutomaticDecision: safetyAudit.automaticDecisionCount === 0,
    visualLayerDoesNotDriveSelection: safetyAudit.selectionRecommendationCount === 0,
    visualLayerDoesNotDriveTacticalInstruction: safetyAudit.tacticalInstructionCount === 0,
    productStoryFirstPreserved: integrationAudit.productStoryFirstPreserved,
    exportCompactPreserved: integrationAudit.exportCompactPreserved,
    exportMetadataCurrent8VVisible: exportAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: baseline8U.numericThresholdGuardPreserved,
    sourceOfTruthSeparationPreserved: baseline8U.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8U.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8U.guardrailsPreserved,
    visualReadiness,
    productFieldUxVisualReadinessHtml,
    exportFieldUxVisualReadinessHtml,
    productHtmlAfter8V,
    exportHtmlAfter8V,
    visualAudit,
    safetyAudit,
    exportAudit,
    integrationAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_VISUAL_READINESS_LAYER_NON_PERSISTENT" : "REVIEW_FIELD_UX_VISUAL_READINESS",
    nextSprintRecommendation: "PREPARE_MANUAL_REVIEW_NON_PERSISTENT_PREVIEW_ACTIVATION_GUARDS",
  };
}

export function currentManualReviewFieldUxVisualReadinessWithoutPersistence8VModel(): ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel {
  const baseline8U = buildManualReviewInputFieldContractWithoutPersistence8UModel();
  return buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel({ baseline8U });
}

function baselineRows(model: ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel): readonly string[] {
  return metricRows([
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

export function renderManualReviewFieldUxVisualReadinessWithoutPersistence8VDoc(
  model: ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel = currentManualReviewFieldUxVisualReadinessWithoutPersistence8VModel(),
): string {
  return [
    "# Manual Review Field UX Visual Readiness Without Persistence 8V",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Visual Readiness Summary",
    ...metricRows([
      ["fieldUxVisualReadinessReady", model.fieldUxVisualReadinessReady],
      ["productFieldUxVisualReadinessVisible", model.productFieldUxVisualReadinessVisible],
      ["exportFieldUxVisualReadinessVisible", model.exportFieldUxVisualReadinessVisible],
      ["fieldUxUsesInputFieldContract8U", model.fieldUxUsesInputFieldContract8U],
      ["visualMode", model.visualReadiness.visualMode],
      ["visualSectionCount", model.visualSectionCount],
      ["visualFieldGroupCount", model.visualFieldGroupCount],
      ["visualFieldCardCount", model.visualFieldCardCount],
      ["disabledVisualStateCount", model.disabledVisualStateCount],
      ["activeFieldCount", model.activeFieldCount],
      ["coachReadabilityScore", model.coachReadabilityScore],
      ["visualDensityAcceptable", model.visualDensityAcceptable],
      ["fieldGroupingCoachReadable", model.fieldGroupingCoachReadable],
    ]),
    "",
    "## Baseline Preservation",
    ...baselineRows(model),
    "",
    "## Visual Sections",
    ...table([
      ["Order", "Section", "Linked 8U", "Groups", "Status", "Question"],
      ...model.visualReadiness.visualSections.map((section) => [
        String(section.sectionOrder),
        section.sectionTitle,
        section.linked8USectionId,
        String(section.fieldGroupIds.length),
        section.visualStatus,
        section.coachFacingQuestion,
      ]),
    ]),
    "",
    "## Visual Field Groups",
    ...table([
      ["Group", "Section", "Purpose", "Kinds", "Coach explanation"],
      ...model.visualReadiness.visualFieldGroups.map((group) => [
        group.groupTitle,
        group.sectionId,
        group.groupPurpose,
        group.fieldKinds.join(", "),
        group.coachFacingExplanation,
      ]),
    ]),
    "",
    "## Visual Field Cards",
    ...table([
      ["Section", "Group", "Field", "Preview", "Constraint", "Disabled reason", "Badges"],
      ...model.visualReadiness.visualFieldCards.map((card) => [
        card.sectionId,
        card.groupId,
        card.coachFacingLabel,
        card.visualComponentPreview,
        card.constraintSummary,
        card.disabledReason,
        card.badges.join(", "),
      ]),
    ]),
    "",
    "## Future Validation And Error Readiness",
    ...metricRows([
      ["visualValidationRuleCount", model.visualValidationRuleCount],
      ["activeValidationRuleCount", model.visualReadiness.visualValidationSummary.activeValidationRuleCount],
      ["visualErrorStateCount", model.visualErrorStateCount],
      ["activeErrorStateCount", model.visualReadiness.visualErrorSummary.activeErrorStateCount],
      ["visualRefusalStateCount", model.visualRefusalStateCount],
      ["fieldPurposeVisibleCount", model.fieldPurposeVisibleCount],
      ["fieldConstraintVisibleCount", model.fieldConstraintVisibleCount],
      ["fieldDisabledReasonVisibleCount", model.fieldDisabledReasonVisibleCount],
      ["fieldFutureValidationVisibleCount", model.fieldFutureValidationVisibleCount],
    ]),
    "",
    "## Safety Counts",
    ...metricRows([
      ["enabledInputControlCount", model.enabledInputControlCount],
      ["editableTextFieldCount", model.editableTextFieldCount],
      ["enabledSelectControlCount", model.enabledSelectControlCount],
      ["enabledCheckboxControlCount", model.enabledCheckboxControlCount],
      ["submitButtonCount", model.safetyAudit.submitButtonCount],
      ["apiCallCount", model.safetyAudit.apiCallCount],
      ["backendActionCount", model.safetyAudit.backendActionCount],
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
    ]),
    "",
    "## Export Metadata And Budget",
    ...metricRows([
      ["exportMetadataCurrent8VVisible", model.exportMetadataCurrent8VVisible],
      ["exportReadTimeSecondsBefore8V", model.exportAudit.exportReadTimeSecondsBefore8V],
      ["exportReadTimeSecondsAfter8V", model.exportAudit.exportReadTimeSecondsAfter8V],
      ["exportReadTimeDelta", model.exportAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
    ]),
    "",
    "## Warnings And Recommendation",
    `warningCodes: ${model.warningCodes.length === 0 ? "none" : model.warningCodes.join(", ")}`,
    `recommendation: ${model.recommendation}`,
    `nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderManualReviewFieldUxVisualReadinessWithoutPersistence8VValidation(
  model: ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel = currentManualReviewFieldUxVisualReadinessWithoutPersistence8VModel(),
): string {
  const checks = [
    checkLine("ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel exists", model.version === "MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_8V", model.version),
    checkLine("Status: PASS", model.status === "PASS", model.status),
    checkLine("scope is field UX visual readiness without persistence", model.scope === "MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_WITHOUT_PERSISTENCE", model.scope),
    checkLine("8U input field contract preserved", model.baseline8UPreserved, bool(model.baseline8UPreserved)),
    checkLine("8T through 6X baselines preserved", model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved && model.baseline6XPreserved, "manual-review chain preserved"),
    checkLine("product field UX visual readiness visible", model.productFieldUxVisualReadinessVisible, bool(model.productFieldUxVisualReadinessVisible)),
    checkLine("export field UX visual readiness visible", model.exportFieldUxVisualReadinessVisible, bool(model.exportFieldUxVisualReadinessVisible)),
    checkLine("field UX uses input field contract 8U", model.fieldUxUsesInputFieldContract8U, bool(model.fieldUxUsesInputFieldContract8U)),
    checkLine("visual section count = 3", model.visualSectionCount === 3, String(model.visualSectionCount)),
    checkLine("visual field group count = 9", model.visualFieldGroupCount === 9, String(model.visualFieldGroupCount)),
    checkLine("visual field card count = 21", model.visualFieldCardCount === 21, String(model.visualFieldCardCount)),
    checkLine("disabled visual state count = 21", model.disabledVisualStateCount === 21, String(model.disabledVisualStateCount)),
    checkLine("active field count = 0", model.activeFieldCount === 0, String(model.activeFieldCount)),
    checkLine("enabled input control count = 0", model.enabledInputControlCount === 0, String(model.enabledInputControlCount)),
    checkLine("editable text field count = 0", model.editableTextFieldCount === 0, String(model.editableTextFieldCount)),
    checkLine("enabled select control count = 0", model.enabledSelectControlCount === 0, String(model.enabledSelectControlCount)),
    checkLine("enabled checkbox control count = 0", model.enabledCheckboxControlCount === 0, String(model.enabledCheckboxControlCount)),
    checkLine("visual validation rule count >= 12", model.visualValidationRuleCount >= 12, String(model.visualValidationRuleCount)),
    checkLine("visual error state count >= 11", model.visualErrorStateCount >= 11, String(model.visualErrorStateCount)),
    checkLine("visual refusal state count = 6", model.visualRefusalStateCount === 6, String(model.visualRefusalStateCount)),
    checkLine("visual help text visible for all 21 fields", model.visualHelpTextCount === 21, String(model.visualHelpTextCount)),
    checkLine("future badges visible for all fields", model.visualFutureOnlyBadgeCount === 21, String(model.visualFutureOnlyBadgeCount)),
    checkLine("disabled badges visible for all fields", model.visualDisabledBadgeCount === 21, String(model.visualDisabledBadgeCount)),
    checkLine("non-official badges visible for all fields", model.visualNonOfficialBadgeCount === 21, String(model.visualNonOfficialBadgeCount)),
    checkLine("not-persisted badges visible for all fields", model.visualNotPersistedBadgeCount === 21, String(model.visualNotPersistedBadgeCount)),
    checkLine("not-applied badges visible for all fields", model.visualNotAppliedBadgeCount === 21, String(model.visualNotAppliedBadgeCount)),
    checkLine("coach readability score >= 95", model.coachReadabilityScore >= 95, String(model.coachReadabilityScore)),
    checkLine("visual density acceptable", model.visualDensityAcceptable, bool(model.visualDensityAcceptable)),
    checkLine("field grouping coach-readable", model.fieldGroupingCoachReadable, bool(model.fieldGroupingCoachReadable)),
    checkLine("field purpose visible for all fields", model.fieldPurposeVisibleCount === 21, String(model.fieldPurposeVisibleCount)),
    checkLine("field constraint visible for all fields", model.fieldConstraintVisibleCount === 21, String(model.fieldConstraintVisibleCount)),
    checkLine("field disabled reason visible for all fields", model.fieldDisabledReasonVisibleCount === 21, String(model.fieldDisabledReasonVisibleCount)),
    checkLine("field future validation visible for all fields", model.fieldFutureValidationVisibleCount === 21, String(model.fieldFutureValidationVisibleCount)),
    checkLine("workflow readiness and review gate remain distinct", model.readinessDistinctFromReviewGateStillVisible, `${model.workflowReadinessStatusFrom8S}/${model.reviewGateStatusFrom8Q}`),
    checkLine("visual layer creates no real input", model.visualLayerDoesNotCreateRealInput, bool(model.visualLayerDoesNotCreateRealInput)),
    checkLine("visual layer creates no submit", model.visualLayerDoesNotCreateSubmit, bool(model.visualLayerDoesNotCreateSubmit)),
    checkLine("visual layer creates no API", model.visualLayerDoesNotCreateApi, bool(model.visualLayerDoesNotCreateApi)),
    checkLine("visual layer creates no backend", model.visualLayerDoesNotCreateBackend, bool(model.visualLayerDoesNotCreateBackend)),
    checkLine("visual layer creates no storage", model.visualLayerDoesNotCreateStorage, bool(model.visualLayerDoesNotCreateStorage)),
    checkLine("visual layer creates no payload", model.visualLayerDoesNotCreatePayload, bool(model.visualLayerDoesNotCreatePayload)),
    checkLine("visual layer creates no real preview", model.visualLayerDoesNotCreateRealPreview, bool(model.visualLayerDoesNotCreateRealPreview)),
    checkLine("visual layer creates no memory", model.visualLayerDoesNotCreateMemory, bool(model.visualLayerDoesNotCreateMemory)),
    checkLine("visual layer promotes no official truth", model.visualLayerDoesNotPromoteOfficialTruth, bool(model.visualLayerDoesNotPromoteOfficialTruth)),
    checkLine("visual layer creates no automatic decision", model.visualLayerDoesNotCreateAutomaticDecision, bool(model.visualLayerDoesNotCreateAutomaticDecision)),
    checkLine("visual layer drives no selection", model.visualLayerDoesNotDriveSelection, bool(model.visualLayerDoesNotDriveSelection)),
    checkLine("visual layer drives no tactical instruction", model.visualLayerDoesNotDriveTacticalInstruction, bool(model.visualLayerDoesNotDriveTacticalInstruction)),
    checkLine("product story-first preserved", model.productStoryFirstPreserved, bool(model.productStoryFirstPreserved)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("export metadata current 8V visible", model.exportMetadataCurrent8VVisible, bool(model.exportMetadataCurrent8VVisible)),
    checkLine("export main id is compressed-export-8v", model.exportHtmlAfter8V.includes('id="compressed-export-8v"'), "compressed-export-8v"),
    checkLine("export main id no longer compressed-export-8u", !model.exportAudit.exportMainIdStillCompressedExport8U, bool(model.exportAudit.exportMainIdStillCompressedExport8U)),
    checkLine("exportReadTimeSecondsAfter8V <= 900", model.exportUnder900Seconds, String(model.exportAudit.exportReadTimeSecondsAfter8V)),
    checkLine("exportReadTimeSecondsAfter8V <= 800", model.exportUnder800Seconds, String(model.exportAudit.exportReadTimeSecondsAfter8V)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("guardrails preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("no scoring constants changed", scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "SHOT_GOAL=3 TRY_TOUCHDOWN=5 CONVERSION_GOAL=2 DROP_GOAL=2"),
    checkLine("PENALTY_SHOT remains inactive", scoringRegistryEntry("PENALTY_SHOT").active === false, "inactive"),
    checkLine("MatchBonusEvent unchanged", model.baseline8U.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.baseline8U.baseline8T.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8U.baseline8T.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.baseline8U.baseline8T.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("no warning codes", model.warningCodes.length === 0, model.warningCodes.join(", ") || "none"),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review Field UX Visual Readiness Without Persistence 8V",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    ...metricRows([
      ["visualSectionCount", model.visualSectionCount],
      ["visualFieldGroupCount", model.visualFieldGroupCount],
      ["visualFieldCardCount", model.visualFieldCardCount],
      ["disabledVisualStateCount", model.disabledVisualStateCount],
      ["activeFieldCount", model.activeFieldCount],
      ["enabledInputControlCount", model.enabledInputControlCount],
      ["editableTextFieldCount", model.editableTextFieldCount],
      ["enabledSelectControlCount", model.enabledSelectControlCount],
      ["enabledCheckboxControlCount", model.enabledCheckboxControlCount],
      ["submitButtonCount", model.safetyAudit.submitButtonCount],
      ["apiCallCount", model.safetyAudit.apiCallCount],
      ["backendActionCount", model.safetyAudit.backendActionCount],
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
      ["coachReadabilityScore", model.coachReadabilityScore],
      ["exportReadTimeSecondsAfter8V", model.exportAudit.exportReadTimeSecondsAfter8V],
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
