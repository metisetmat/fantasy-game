import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";
import type {
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroup9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingAudit9H,
} from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";
import { uniqueWarningCodes9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarnings9H";

const STRUCTURE_ERROR_COPY_IDS = [
  "INVALID_PAYLOAD_SOURCE_COPY_9E",
  "INVALID_PAYLOAD_SCOPE_COPY_9E",
  "ENTRY_COUNT_INVALID_COPY_9E",
  "REQUIRED_ENTRY_FIELD_MISSING_COPY_9E",
  "FORBIDDEN_TOP_LEVEL_FIELD_COPY_9E",
  "BOUNDARY_FLAGS_MISSING_COPY_9E",
] as const;

const ENTRY_VALUE_COPY_IDS = [
  "ENTRY_LINK_UNKNOWN_COPY_9E",
  "INVALID_OUTCOME_VALUE_COPY_9E",
  "INVALID_COUNTER_VALUE_COPY_9E",
  "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_COPY_9E",
  "INVALID_CONTEXT_COMPARABILITY_COPY_9E",
  "NOTE_TOO_LONG_COPY_9E",
] as const;

const FORBIDDEN_BOUNDARY_COPY_IDS = [
  "OFFICIAL_TRUTH_FLAG_FORBIDDEN_COPY_9E",
  "PERSISTED_FLAG_FORBIDDEN_COPY_9E",
  "APPLIED_FLAG_FORBIDDEN_COPY_9E",
  "SCORE_TIMELINE_MUTATION_FIELD_COPY_9E",
  "AUTOMATION_FIELD_FORBIDDEN_COPY_9E",
  "STORAGE_FIELD_FORBIDDEN_COPY_9E",
  "ENGINE_LEARNING_FIELD_FORBIDDEN_COPY_9E",
] as const;

const ACTION_REFUSAL_COPY_IDS = [
  "REFUSE_RUNTIME_VALIDATION_COPY_9E",
  "REFUSE_REAL_PAYLOAD_READ_COPY_9E",
  "REFUSE_PAYLOAD_ACCEPTANCE_COPY_9E",
  "REFUSE_REAL_PREVIEW_GENERATION_COPY_9E",
  "REFUSE_SUBMIT_API_BACKEND_COPY_9E",
  "REFUSE_PERSISTENCE_MEMORY_HISTORY_COPY_9E",
  "REFUSE_OFFICIAL_TRUTH_DECISION_COPY_9E",
  "REFUSE_SELECTION_TACTIC_SCORE_TIMELINE_COPY_9E",
] as const;

const STRUCTURE_BLOCKER_COPY_IDS = [
  "BLOCK_INVALID_SOURCE_OR_SCOPE_COPY_9E",
  "BLOCK_MISSING_OR_INVALID_ENTRIES_COPY_9E",
  "BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_COPY_9E",
  "BLOCK_FORBIDDEN_FIELD_COPY_9E",
] as const;

const ENTRY_VALUE_BLOCKER_COPY_IDS = ["BLOCK_INVALID_ENTRY_VALUES_COPY_9E"] as const;

const FORBIDDEN_BOUNDARY_BLOCKER_COPY_IDS = [
  "BLOCK_OFFICIAL_TRUTH_FLAG_COPY_9E",
  "BLOCK_PERSISTENCE_FLAG_COPY_9E",
  "BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_COPY_9E",
  "BLOCK_AUTOMATION_FIELD_COPY_9E",
  "BLOCK_STORAGE_OR_API_FIELD_COPY_9E",
  "BLOCK_ENGINE_LEARNING_FIELD_COPY_9E",
] as const;

function group(input: {
  readonly groupId: string;
  readonly label: string;
  readonly coachFacingPurpose: string;
  readonly copyIds: readonly string[];
  readonly severity: ManualReviewPreviewPayloadDryRunErrorCopyUxGroup9H["severity"];
  readonly primaryBoundary: string;
  readonly stillForbiddenSummary: string;
  readonly futureCorrectionSummary: string;
  readonly visibleInExport: boolean;
}): ManualReviewPreviewPayloadDryRunErrorCopyUxGroup9H {
  return {
    ...input,
    copyCount: input.copyIds.length,
    visibleInProduct: true,
    canValidatePayloadIn9H: false,
    canAcceptPayloadIn9H: false,
    canGeneratePreviewIn9H: false,
    canPersistIn9H: false,
    canPromoteOfficialTruthIn9H: false,
    canDriveDecisionIn9H: false,
    canDriveSelectionIn9H: false,
    canDriveTacticIn9H: false,
    canMutateMatchIn9H: false,
  };
}

export function buildManualReviewPreviewPayloadDryRunErrorCopyUxGroups9H(
  baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
): readonly ManualReviewPreviewPayloadDryRunErrorCopyUxGroup9H[] {
  return [
    group({
      groupId: "compatible_shape_group_9h",
      label: "Forme compatible - non acceptee",
      coachFacingPurpose: "Montrer l'exemple positif sans jamais l'accepter comme payload.",
      copyIds: [
        baseline9E.compatibleCopy.copyId,
        "BLOCK_PREVIEW_ACCEPTANCE_COPY_9E",
      ],
      severity: "info",
      primaryBoundary: "Un exemple compatible ne devient pas un payload accepte.",
      stillForbiddenSummary: "Aucune acceptation, aucune preview reelle, aucune official truth.",
      futureCorrectionSummary: "Servir plus tard de repere de forme pour un validator futur.",
      visibleInExport: true,
    }),
    group({
      groupId: "payload_structure_group_9h",
      label: "Structure du payload",
      coachFacingPurpose: "Expliquer ce qui est mal forme ou hors contrat dans le payload futur.",
      copyIds: [...STRUCTURE_ERROR_COPY_IDS, ...STRUCTURE_BLOCKER_COPY_IDS],
      severity: "warning",
      primaryBoundary: "Le dry-run ne lit ni ne valide un payload reel.",
      stillForbiddenSummary: "Validation runtime, payload reel et submit/API/backend restent interdits.",
      futureCorrectionSummary: "Corriger plus tard source, scope, nombre d'observations et champs requis.",
      visibleInExport: true,
    }),
    group({
      groupId: "entry_values_group_9h",
      label: "Valeurs d'observation",
      coachFacingPurpose: "Expliquer les erreurs de saisie ou de coherence sur les 3 observations.",
      copyIds: [...ENTRY_VALUE_COPY_IDS, ...ENTRY_VALUE_BLOCKER_COPY_IDS],
      severity: "warning",
      primaryBoundary: "Le systeme ne relie pas une observation inconnue a une decision.",
      stillForbiddenSummary: "Aucune selection, tactique ou decision automatique.",
      futureCorrectionSummary: "Corriger plus tard les liens, outcomes, compteurs, comparabilite et notes.",
      visibleInExport: true,
    }),
    group({
      groupId: "forbidden_boundaries_group_9h",
      label: "Frontieres interdites",
      coachFacingPurpose: "Rendre visibles les frontieres a ne jamais franchir.",
      copyIds: [...FORBIDDEN_BOUNDARY_COPY_IDS, ...FORBIDDEN_BOUNDARY_BLOCKER_COPY_IDS],
      severity: "blocking",
      primaryBoundary: "Official truth, stockage, application, automation, score/timeline et engine learning restent separes.",
      stillForbiddenSummary: "Aucun stockage, memoire, historique, official truth ou mutation match.",
      futureCorrectionSummary: "Retirer plus tard les champs qui demandent un effet reel.",
      visibleInExport: true,
    }),
    group({
      groupId: "action_refusal_group_9h",
      label: "Actions refusees",
      coachFacingPurpose: "Rappeler ce que 9H refuse activement de faire.",
      copyIds: ACTION_REFUSAL_COPY_IDS,
      severity: "blocking",
      primaryBoundary: "Une lecture UX ne devient pas action produit.",
      stillForbiddenSummary: "Aucun runtime, payload, preview, submit/API/backend, persistence, official truth, decision, selection, tactique ou mutation.",
      futureCorrectionSummary: "Traiter ces actions plus tard dans un sprint d'activation explicite.",
      visibleInExport: true,
    }),
  ];
}

export function buildManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H(
  baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
): ManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H {
  const groups = buildManualReviewPreviewPayloadDryRunErrorCopyUxGroups9H(baseline9E);
  const allCopies = [baseline9E.compatibleCopy, ...baseline9E.errorCopies, ...baseline9E.blockerCopies, ...baseline9E.refusalCopies];
  const allCopyIds = allCopies.map((copy) => copy.copyId);
  const assignedIds = groups.flatMap((item) => item.copyIds);
  const assignedCounts = new Map<string, number>();
  for (const copyId of assignedIds) assignedCounts.set(copyId, (assignedCounts.get(copyId) ?? 0) + 1);
  const ungroupedCopyIds = allCopyIds.filter((copyId) => (assignedCounts.get(copyId) ?? 0) === 0);
  const duplicatedCopyIds = [...assignedCounts.entries()].filter((entry) => entry[1] > 1).map((entry) => entry[0]);
  return {
    groupingId: "manual_review_preview_payload_dry_run_error_copy_ux_grouping_9h",
    sourceVersion: "9E",
    groupingVersion: "9H",
    groups,
    totalGroupedCopies: assignedIds.length,
    ungroupedCopyIds,
    duplicatedCopyIds,
    compatibleCaseGroupId: "compatible_shape_group_9h",
    boundaryGroupIds: ["forbidden_boundaries_group_9h", "action_refusal_group_9h"],
    exportSummary: "5 familles, 19 erreurs, 12 blockers, 8 refus, 1 cas compatible non accepte.",
    productSummary: "Groupes UX lisibles en produit sans validation runtime ni preview reelle.",
    readOnlyNotice: "Regroupement lecture seule.",
    noRuntimeNotice: "Aucun runtime, payload reel, preview reelle, submit, API ou backend.",
    noOfficialTruthNotice: "Aucune official truth, decision, selection, tactique ou mutation match.",
  };
}

export function auditManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H(input: {
  readonly baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel;
  readonly grouping: ManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingAudit9H {
  const errorCopyIds = input.baseline9E.errorCopies.map((copy) => copy.copyId);
  const blockerCopyIds = input.baseline9E.blockerCopies.map((copy) => copy.copyId);
  const refusalCopyIds = input.baseline9E.refusalCopies.map((copy) => copy.copyId);
  const assignedIds = input.grouping.groups.flatMap((groupItem) => groupItem.copyIds);
  const assignedSet = new Set(assignedIds);
  const groupedErrorCopyCount = errorCopyIds.filter((copyId) => assignedSet.has(copyId)).length;
  const groupedBlockerCopyCount = blockerCopyIds.filter((copyId) => assignedSet.has(copyId)).length;
  const groupedRefusalCopyCount = refusalCopyIds.filter((copyId) => assignedSet.has(copyId)).length;
  const compatibleAssigned = assignedSet.has(input.baseline9E.compatibleCopy.copyId);
  const groupLabelsCoachFacing = input.grouping.groups.every((groupItem) => groupItem.label.length > 0);
  const groupDescriptionsCoachFacing = input.grouping.groups.every((groupItem) => groupItem.coachFacingPurpose.length > 0);
  const groupBoundariesVisible = input.grouping.groups.every((groupItem) => groupItem.primaryBoundary.length > 0);
  const groupStillForbiddenVisible = input.grouping.groups.every((groupItem) => groupItem.stillForbiddenSummary.length > 0);
  const groupNextStepNotActivatedVisible = input.grouping.groups.every((groupItem) => groupItem.futureCorrectionSummary.length > 0);
  const groupingDoesNotChangeCopySemantics =
    groupedErrorCopyCount === input.baseline9E.coachFacingErrorCopyCount &&
    groupedBlockerCopyCount === input.baseline9E.coachFacingBlockerCopyCount &&
    groupedRefusalCopyCount === input.baseline9E.coachFacingRefusalCopyCount &&
    compatibleAssigned;
  const groupingDoesNotChangeCoverage =
    input.baseline9E.errorCopyErrorCoverageCount === 19 &&
    input.baseline9E.errorCopyBlockerCoverageCount === 12 &&
    input.baseline9E.errorCopyBoundaryGuardCoverageCount === 14 &&
    input.baseline9E.errorCopyRefusalStateCoverageCount === 8;
  const complete =
    input.grouping.groups.length === 5 &&
    groupedErrorCopyCount === 19 &&
    groupedBlockerCopyCount === 12 &&
    groupedRefusalCopyCount === 8 &&
    compatibleAssigned &&
    input.grouping.ungroupedCopyIds.length === 0 &&
    input.grouping.duplicatedCopyIds.length === 0 &&
    groupingDoesNotChangeCopySemantics &&
    groupingDoesNotChangeCoverage;
  const warningCodes = uniqueWarningCodes9H([
    complete ? "ERROR_COPY_UX_GROUPING_READY_9H" : "ERROR_COPY_UX_GROUPING_FAIL_9H",
    input.grouping.groups.length === 5 ? "UX_GROUP_COUNT_READY_9H" : "UX_GROUP_COUNT_MISMATCH_9H",
    groupedErrorCopyCount === 19 ? "ERROR_COPY_GROUPING_COMPLETE_9H" : "ERROR_COPY_GROUPING_COUNT_MISMATCH_9H",
    groupedBlockerCopyCount === 12 ? "BLOCKER_COPY_GROUPING_COMPLETE_9H" : "BLOCKER_COPY_GROUPING_COUNT_MISMATCH_9H",
    groupedRefusalCopyCount === 8 ? "REFUSAL_COPY_GROUPING_COMPLETE_9H" : "REFUSAL_COPY_GROUPING_COUNT_MISMATCH_9H",
    compatibleAssigned ? "COMPATIBLE_CASE_GROUPED_NOT_ACCEPTED_9H" : "COMPATIBLE_CASE_GROUPING_MISMATCH_9H",
    input.grouping.ungroupedCopyIds.length === 0 ? "NO_UNGROUPED_COPY_ASSIGNMENTS_9H" : "UNGROUPED_COPY_ASSIGNMENTS_9H",
    input.grouping.duplicatedCopyIds.length === 0 ? "NO_DUPLICATED_COPY_ASSIGNMENTS_9H" : "DUPLICATED_COPY_ASSIGNMENTS_9H",
    groupLabelsCoachFacing && groupDescriptionsCoachFacing ? "GROUP_LABELS_COACH_FACING_9H" : "GROUP_LABELS_MISSING_9H",
    groupBoundariesVisible && groupStillForbiddenVisible ? "GROUP_BOUNDARIES_VISIBLE_9H" : "GROUP_BOUNDARIES_MISSING_9H",
    groupingDoesNotChangeCopySemantics && groupingDoesNotChangeCoverage ? "GROUPING_SEMANTICS_PRESERVED_9H" : "GROUPING_SEMANTICS_CHANGED_9H",
  ]);
  return {
    errorCopyUxGroupingReady: complete,
    productErrorCopyUxGroupingVisible: input.productHtml.includes("Regroupement UX des erreurs dry-run"),
    exportErrorCopyUxGroupingVisible: input.exportHtml.includes("Groupes erreurs dry-run"),
    uxGroupingMode: "dry_run_copy_grouping_only",
    uxGroupingStatus: complete ? "grouped_without_preview_activation" : "blocked",
    expectedUxGroupingStatus: "grouped_without_preview_activation",
    uxGroupingStatusCorrect: complete,
    uxGroupCount: input.grouping.groups.length,
    uxGroupCountExpected: 5,
    uxGroupIds: input.grouping.groups.map((groupItem) => groupItem.groupId),
    compatibleShapeGroupCount: input.grouping.groups.filter((groupItem) => groupItem.groupId === "compatible_shape_group_9h").length,
    payloadStructureGroupCount: input.grouping.groups.filter((groupItem) => groupItem.groupId === "payload_structure_group_9h").length,
    entryValuesGroupCount: input.grouping.groups.filter((groupItem) => groupItem.groupId === "entry_values_group_9h").length,
    forbiddenBoundariesGroupCount: input.grouping.groups.filter((groupItem) => groupItem.groupId === "forbidden_boundaries_group_9h").length,
    actionRefusalGroupCount: input.grouping.groups.filter((groupItem) => groupItem.groupId === "action_refusal_group_9h").length,
    groupedErrorCopyCount,
    groupedErrorCopyCountExpected: 19,
    groupedBlockerCopyCount,
    groupedBlockerCopyCountExpected: 12,
    groupedRefusalCopyCount,
    groupedRefusalCopyCountExpected: 8,
    groupedCompatibleCaseCount: compatibleAssigned ? 1 : 0,
    groupedCompatibleCaseCountExpected: 1,
    ungroupedCopyCount: input.grouping.ungroupedCopyIds.length,
    duplicatedCopyCount: input.grouping.duplicatedCopyIds.length,
    missingCopyGroupAssignments: input.grouping.ungroupedCopyIds,
    duplicatedCopyGroupAssignments: input.grouping.duplicatedCopyIds,
    groupLabelsCoachFacing,
    groupDescriptionsCoachFacing,
    groupBoundariesVisible,
    groupStillForbiddenVisible,
    groupNextStepNotActivatedVisible,
    compatibleCaseStillNotAcceptedInGrouping: compatibleAssigned && input.baseline9E.validCaseCopyRenderedAsNotAccepted,
    groupingDoesNotChangeCopySemantics,
    groupingDoesNotCreateNewErrorCopies: groupedErrorCopyCount === input.baseline9E.coachFacingErrorCopyCount,
    groupingDoesNotDeleteErrorCopies: groupedErrorCopyCount === input.baseline9E.coachFacingErrorCopyCount,
    groupingDoesNotChangeCoverage,
    auditWarningCodes: warningCodes,
    recommendation: complete ? "KEEP_ERROR_COPY_UX_GROUPING" : "FIX_ERROR_COPY_GROUPING_BOUNDARY_REGRESSION",
  };
}
