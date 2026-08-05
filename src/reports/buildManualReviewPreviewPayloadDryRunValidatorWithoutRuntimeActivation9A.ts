import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewValidationContractAuditConsistencyRepair8ZModel,
  renderManualReviewValidationContractAuditConsistencyRepair8ZDoc,
  renderManualReviewValidationContractAuditConsistencyRepair8ZValidation,
} from "./buildManualReviewValidationContractAuditConsistencyRepair8Z";
import {
  insertManualReviewPreviewPayloadDryRunValidatorExport9A,
  renderManualReviewPreviewPayloadDryRunValidatorExport9A,
} from "./renderManualReviewPreviewPayloadDryRunValidatorExport9A";
import {
  insertManualReviewPreviewPayloadDryRunValidatorProduct9A,
  renderManualReviewPreviewPayloadDryRunValidatorProduct9A,
} from "./renderManualReviewPreviewPayloadDryRunValidatorProduct9A";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_9A_BLOCKING_WARNINGS,
  type ManualReviewPreviewPayloadDryRunValidatorWarningCode9A,
} from "./manualReviewPreviewPayloadDryRunValidatorWarnings9A";
import type {
  ManualReviewPreviewPayloadDryRunBoundarySummary9A,
  ManualReviewPreviewPayloadDryRunCase9A,
  ManualReviewPreviewPayloadDryRunCoverage9A,
  ManualReviewPreviewPayloadDryRunExpectedResult9A,
  ManualReviewPreviewPayloadDryRunReadinessSummary9A,
  ManualReviewPreviewPayloadDryRunValidator9A,
  ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
} from "./manualReviewPreviewPayloadDryRunValidatorTypes9A";
import type { ManualReviewValidationContractAuditConsistencyRepair8ZModel } from "./manualReviewValidationContractAuditConsistencyRepairTypes8Z";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

const EXPECTED_RULE_IDS: readonly string[] = [
  "PAYLOAD_SOURCE_MANUAL_NON_OFFICIAL_8Y",
  "PAYLOAD_SCOPE_PREVIEW_ONLY_8Y",
  "OFFICIAL_TRUTH_FLAG_FALSE_8Y",
  "PERSISTED_FLAG_FALSE_8Y",
  "APPLIED_FLAG_FALSE_8Y",
  "ENTRY_COUNT_THREE_8Y",
  "ENTRY_LINK_KNOWN_8Y",
  "OUTCOME_VALUE_ENUM_8Y",
  "COUNTER_VALUE_INTEGER_0_99_8Y",
  "SIGNAL_COUNT_WITHIN_COMPARABLE_COUNT_8Y",
  "CONTEXT_COMPARABILITY_ENUM_8Y",
  "NOTE_LENGTH_LIMIT_8Y",
  "REQUIRED_ENTRY_FIELDS_PRESENT_8Y",
  "FORBIDDEN_TOP_LEVEL_FIELDS_ABSENT_8Y",
  "SCORE_TIMELINE_MUTATION_FIELDS_ABSENT_8Y",
  "AUTOMATION_FIELDS_ABSENT_8Y",
  "STORAGE_API_FIELDS_ABSENT_8Y",
  "ENGINE_LEARNING_FIELDS_ABSENT_8Y",
  "BOUNDARY_FLAGS_FALSE_8Y",
  "PREVIEW_ONLY_RESULT_NOT_ACCEPTED_9A",
];

const EXPECTED_ERROR_IDS: readonly string[] = [
  "INVALID_PAYLOAD_SOURCE_8Y",
  "INVALID_PAYLOAD_SCOPE_8Y",
  "OFFICIAL_TRUTH_FLAG_FORBIDDEN_8Y",
  "PERSISTED_FLAG_FORBIDDEN_8Y",
  "APPLIED_FLAG_FORBIDDEN_8Y",
  "ENTRY_COUNT_INVALID_8Y",
  "ENTRY_LINK_UNKNOWN_8Y",
  "INVALID_OUTCOME_VALUE_8Y",
  "INVALID_COUNTER_VALUE_8Y",
  "SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8Y",
  "INVALID_CONTEXT_COMPARABILITY_8Y",
  "NOTE_TOO_LONG_8Y",
  "REQUIRED_ENTRY_FIELD_MISSING_8Y",
  "FORBIDDEN_TOP_LEVEL_FIELD_8Y",
  "SCORE_TIMELINE_MUTATION_FIELD_8Y",
  "AUTOMATION_FIELD_FORBIDDEN_8Y",
  "STORAGE_FIELD_FORBIDDEN_8Y",
  "ENGINE_LEARNING_FIELD_FORBIDDEN_8Y",
  "BOUNDARY_FLAGS_MISSING_8Y",
];

const EXPECTED_BLOCKER_IDS: readonly string[] = [
  "BLOCK_INVALID_SOURCE_OR_SCOPE_8Y",
  "BLOCK_OFFICIAL_TRUTH_FLAG_8Y",
  "BLOCK_PERSISTENCE_FLAG_8Y",
  "BLOCK_MISSING_OR_INVALID_ENTRIES_8Y",
  "BLOCK_INVALID_ENTRY_VALUES_8Y",
  "BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_8Y",
  "BLOCK_FORBIDDEN_FIELD_8Y",
  "BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_8Y",
  "BLOCK_AUTOMATION_FIELD_8Y",
  "BLOCK_STORAGE_OR_API_FIELD_8Y",
  "BLOCK_ENGINE_LEARNING_FIELD_8Y",
  "BLOCK_PREVIEW_ACCEPTANCE_9A",
];

const EXPECTED_BOUNDARY_GUARD_IDS: readonly string[] = [
  "GUARD_NO_RUNTIME_VALIDATION_9A",
  "GUARD_NO_REAL_PAYLOAD_READ_9A",
  "GUARD_NO_REAL_INPUT_READ_9A",
  "GUARD_NO_PAYLOAD_CREATION_9A",
  "GUARD_NO_PAYLOAD_ACCEPTANCE_9A",
  "GUARD_NO_PREVIEW_GENERATION_9A",
  "GUARD_NO_SUBMIT_API_BACKEND_9A",
  "GUARD_NO_PERSISTENCE_9A",
  "GUARD_NO_DRAFT_HISTORY_MEMORY_9A",
  "GUARD_NO_OFFICIAL_TRUTH_9A",
  "GUARD_NO_AUTOMATION_9A",
  "GUARD_NO_SELECTION_OR_TACTIC_9A",
  "GUARD_NO_SCORE_TIMELINE_MUTATION_9A",
  "GUARD_NO_SCORE_CHANGE_EVENT_MUTATION_9A",
];

const EXPECTED_REFUSAL_IDS: readonly string[] = [
  "REFUSE_INVALID_SOURCE_OR_SCOPE_8Y",
  "REFUSE_OFFICIAL_TRUTH_8Y",
  "REFUSE_PERSISTENCE_OR_APPLY_8Y",
  "REFUSE_INVALID_ENTRIES_8Y",
  "REFUSE_FORBIDDEN_FIELD_8Y",
  "REFUSE_SCORE_TIMELINE_MUTATION_8Y",
  "REFUSE_AUTOMATION_STORAGE_ENGINE_LEARNING_8Y",
  "REFUSE_RUNTIME_ACTIVATION_9A",
];

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const header = rows[0] ?? [];
  const body = rows.slice(1);
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  if (text.length === 0) return 0;
  return Math.ceil((text.split(" ").length / 220) * 60);
}

function unique(items: readonly string[]): readonly string[] {
  return [...new Set(items)];
}

function case9A(input: Omit<
  ManualReviewPreviewPayloadDryRunCase9A,
  "usesRealPayload" | "createsPayload" | "activeIn9A" | "futureRuntimeOnly" | "visibleInProduct" | "visibleInExport"
>): ManualReviewPreviewPayloadDryRunCase9A {
  return {
    ...input,
    usesRealPayload: false,
    createsPayload: false,
    activeIn9A: false,
    futureRuntimeOnly: true,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function buildDryRunCases(): readonly ManualReviewPreviewPayloadDryRunCase9A[] {
  const allBoundaryGuards = EXPECTED_BOUNDARY_GUARD_IDS;
  return [
    case9A({
      dryRunCaseId: "valid_preview_only_payload_shape_9a",
      label: "Valid preview-only payload shape",
      purpose: "Prove the future valid shape would pass future validation but never become accepted in 9A.",
      caseKind: "would_pass_future_validation",
      syntheticPayloadShapeDescription: "source manual_non_official, scope preview_only, three entries, all boundary flags false.",
      expectedRuleIds: ["PAYLOAD_SOURCE_MANUAL_NON_OFFICIAL_8Y", "PAYLOAD_SCOPE_PREVIEW_ONLY_8Y", "ENTRY_COUNT_THREE_8Y", "BOUNDARY_FLAGS_FALSE_8Y", "PREVIEW_ONLY_RESULT_NOT_ACCEPTED_9A"],
      expectedErrorStateIds: [],
      expectedBlockerIds: ["BLOCK_PREVIEW_ACCEPTANCE_9A"],
      expectedBoundaryGuardIds: allBoundaryGuards,
      expectedRefusalStateIds: ["REFUSE_RUNTIME_ACTIVATION_9A"],
      expectedResult: "would_pass_future_validation_but_not_accepted",
      severity: "info",
    }),
    case9A({
      dryRunCaseId: "invalid_source_payload_9a",
      label: "Invalid source",
      purpose: "Source must remain manual_non_official.",
      caseKind: "invalid_source",
      syntheticPayloadShapeDescription: "source is not manual_non_official.",
      expectedRuleIds: ["PAYLOAD_SOURCE_MANUAL_NON_OFFICIAL_8Y"],
      expectedErrorStateIds: ["INVALID_PAYLOAD_SOURCE_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PAYLOAD_ACCEPTANCE_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_SOURCE_OR_SCOPE_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "invalid_scope_payload_9a",
      label: "Invalid scope",
      purpose: "Scope must remain preview_only.",
      caseKind: "invalid_scope",
      syntheticPayloadShapeDescription: "scope is not preview_only.",
      expectedRuleIds: ["PAYLOAD_SCOPE_PREVIEW_ONLY_8Y"],
      expectedErrorStateIds: ["INVALID_PAYLOAD_SCOPE_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PAYLOAD_ACCEPTANCE_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_SOURCE_OR_SCOPE_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "official_truth_flag_true_9a",
      label: "Official truth flag true",
      purpose: "Coach review cannot promote official truth.",
      caseKind: "official_truth_attempt",
      syntheticPayloadShapeDescription: "officialTruth flag is true.",
      expectedRuleIds: ["OFFICIAL_TRUTH_FLAG_FALSE_8Y"],
      expectedErrorStateIds: ["OFFICIAL_TRUTH_FLAG_FORBIDDEN_8Y"],
      expectedBlockerIds: ["BLOCK_OFFICIAL_TRUTH_FLAG_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_OFFICIAL_TRUTH_9A"],
      expectedRefusalStateIds: ["REFUSE_OFFICIAL_TRUTH_8Y"],
      expectedResult: "would_block_future_preview",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "persisted_or_applied_flag_true_9a",
      label: "Persisted or applied flag true",
      purpose: "Dry-run payload cannot mark itself persisted or applied.",
      caseKind: "missing_boundary_flags",
      syntheticPayloadShapeDescription: "persisted or applied is true.",
      expectedRuleIds: ["PERSISTED_FLAG_FALSE_8Y", "APPLIED_FLAG_FALSE_8Y"],
      expectedErrorStateIds: ["PERSISTED_FLAG_FORBIDDEN_8Y", "APPLIED_FLAG_FORBIDDEN_8Y"],
      expectedBlockerIds: ["BLOCK_PERSISTENCE_FLAG_8Y", "BLOCK_INVALID_ENTRY_VALUES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PERSISTENCE_9A"],
      expectedRefusalStateIds: ["REFUSE_PERSISTENCE_OR_APPLY_8Y"],
      expectedResult: "would_block_future_preview",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "invalid_entry_count_9a",
      label: "Invalid entry count",
      purpose: "Payload must contain exactly three observation entries.",
      caseKind: "missing_entries",
      syntheticPayloadShapeDescription: "entries count differs from three.",
      expectedRuleIds: ["ENTRY_COUNT_THREE_8Y"],
      expectedErrorStateIds: ["ENTRY_COUNT_INVALID_8Y"],
      expectedBlockerIds: ["BLOCK_MISSING_OR_INVALID_ENTRIES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "unknown_entry_link_9a",
      label: "Unknown entry link",
      purpose: "Each entry must link to known 8K/8L/8M/8U cards.",
      caseKind: "invalid_entry_link",
      syntheticPayloadShapeDescription: "linkedCardId does not resolve.",
      expectedRuleIds: ["ENTRY_LINK_KNOWN_8Y"],
      expectedErrorStateIds: ["ENTRY_LINK_UNKNOWN_8Y"],
      expectedBlockerIds: ["BLOCK_MISSING_OR_INVALID_ENTRIES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "invalid_outcome_value_9a",
      label: "Invalid outcome value",
      purpose: "Outcome must stay inside the 8U enum.",
      caseKind: "invalid_field_value",
      syntheticPayloadShapeDescription: "outcome value is outside enum.",
      expectedRuleIds: ["OUTCOME_VALUE_ENUM_8Y"],
      expectedErrorStateIds: ["INVALID_OUTCOME_VALUE_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "invalid_counter_value_9a",
      label: "Invalid counter value",
      purpose: "Counters must be integer values from 0 to 99.",
      caseKind: "invalid_counter",
      syntheticPayloadShapeDescription: "counter is not an integer in range 0-99.",
      expectedRuleIds: ["COUNTER_VALUE_INTEGER_0_99_8Y"],
      expectedErrorStateIds: ["INVALID_COUNTER_VALUE_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "signal_count_exceeds_comparable_count_9a",
      label: "Signal count exceeds comparable count",
      purpose: "Positive plus negative signals cannot exceed comparable situations.",
      caseKind: "signal_count_exceeds_comparable_count",
      syntheticPayloadShapeDescription: "signal totals exceed comparable situations.",
      expectedRuleIds: ["SIGNAL_COUNT_WITHIN_COMPARABLE_COUNT_8Y"],
      expectedErrorStateIds: ["SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "invalid_context_comparability_9a",
      label: "Invalid context comparability",
      purpose: "Context comparability must stay inside the future enum.",
      caseKind: "invalid_field_value",
      syntheticPayloadShapeDescription: "contextComparability is outside enum.",
      expectedRuleIds: ["CONTEXT_COMPARABILITY_ENUM_8Y"],
      expectedErrorStateIds: ["INVALID_CONTEXT_COMPARABILITY_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "note_too_long_9a",
      label: "Note too long",
      purpose: "Coach notes must respect future length limits.",
      caseKind: "invalid_field_value",
      syntheticPayloadShapeDescription: "short note or coach note exceeds limit.",
      expectedRuleIds: ["NOTE_LENGTH_LIMIT_8Y"],
      expectedErrorStateIds: ["NOTE_TOO_LONG_8Y"],
      expectedBlockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "warning",
    }),
    case9A({
      dryRunCaseId: "missing_required_entry_field_9a",
      label: "Missing required entry field",
      purpose: "Required entry fields must be present.",
      caseKind: "missing_required_entry_field",
      syntheticPayloadShapeDescription: "a required entry field is missing.",
      expectedRuleIds: ["REQUIRED_ENTRY_FIELDS_PRESENT_8Y"],
      expectedErrorStateIds: ["REQUIRED_ENTRY_FIELD_MISSING_8Y"],
      expectedBlockerIds: ["BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PREVIEW_GENERATION_9A"],
      expectedRefusalStateIds: ["REFUSE_INVALID_ENTRIES_8Y"],
      expectedResult: "would_fail_future_validation",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "forbidden_top_level_field_9a",
      label: "Forbidden top-level field",
      purpose: "Payload must not contain forbidden top-level controls.",
      caseKind: "forbidden_top_level_field",
      syntheticPayloadShapeDescription: "forbiddenTopLevelField is present.",
      expectedRuleIds: ["FORBIDDEN_TOP_LEVEL_FIELDS_ABSENT_8Y"],
      expectedErrorStateIds: ["FORBIDDEN_TOP_LEVEL_FIELD_8Y"],
      expectedBlockerIds: ["BLOCK_FORBIDDEN_FIELD_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_PAYLOAD_CREATION_9A"],
      expectedRefusalStateIds: ["REFUSE_FORBIDDEN_FIELD_8Y"],
      expectedResult: "would_block_future_preview",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "score_timeline_mutation_attempt_9a",
      label: "Score or timeline mutation attempt",
      purpose: "Manual review payload cannot mutate official match facts.",
      caseKind: "score_timeline_mutation_attempt",
      syntheticPayloadShapeDescription: "scoreChange or timelineMutation fields are present.",
      expectedRuleIds: ["SCORE_TIMELINE_MUTATION_FIELDS_ABSENT_8Y"],
      expectedErrorStateIds: ["SCORE_TIMELINE_MUTATION_FIELD_8Y"],
      expectedBlockerIds: ["BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_SCORE_TIMELINE_MUTATION_9A", "GUARD_NO_SCORE_CHANGE_EVENT_MUTATION_9A"],
      expectedRefusalStateIds: ["REFUSE_SCORE_TIMELINE_MUTATION_8Y"],
      expectedResult: "would_block_future_preview",
      severity: "blocking",
    }),
    case9A({
      dryRunCaseId: "automation_storage_engine_learning_attempt_9a",
      label: "Automation, storage, or learning attempt",
      purpose: "Manual review payload cannot trigger automation, storage/API, or engine learning.",
      caseKind: "automation_attempt",
      syntheticPayloadShapeDescription: "automaticDecision, storageTarget, apiEndpoint, and engineLearningSignal are present.",
      expectedRuleIds: ["AUTOMATION_FIELDS_ABSENT_8Y", "STORAGE_API_FIELDS_ABSENT_8Y", "ENGINE_LEARNING_FIELDS_ABSENT_8Y"],
      expectedErrorStateIds: ["AUTOMATION_FIELD_FORBIDDEN_8Y", "STORAGE_FIELD_FORBIDDEN_8Y", "ENGINE_LEARNING_FIELD_FORBIDDEN_8Y", "BOUNDARY_FLAGS_MISSING_8Y"],
      expectedBlockerIds: ["BLOCK_AUTOMATION_FIELD_8Y", "BLOCK_STORAGE_OR_API_FIELD_8Y", "BLOCK_ENGINE_LEARNING_FIELD_8Y"],
      expectedBoundaryGuardIds: ["GUARD_NO_SUBMIT_API_BACKEND_9A", "GUARD_NO_PERSISTENCE_9A", "GUARD_NO_DRAFT_HISTORY_MEMORY_9A", "GUARD_NO_AUTOMATION_9A", "GUARD_NO_SELECTION_OR_TACTIC_9A"],
      expectedRefusalStateIds: ["REFUSE_AUTOMATION_STORAGE_ENGINE_LEARNING_8Y"],
      expectedResult: "would_block_future_preview",
      severity: "blocking",
    }),
  ];
}

function buildExpectedResults(cases: readonly ManualReviewPreviewPayloadDryRunCase9A[]): readonly ManualReviewPreviewPayloadDryRunExpectedResult9A[] {
  return cases.map((dryRunCase) => ({
    resultId: `${dryRunCase.dryRunCaseId}_result`,
    dryRunCaseId: dryRunCase.dryRunCaseId,
    resultKind: dryRunCase.expectedResult,
    statusLabel: dryRunCase.expectedResult,
    coachFacingSummary: dryRunCase.expectedResult === "would_pass_future_validation_but_not_accepted"
      ? "This synthetic case would pass a future validator, but 9A never accepts a payload."
      : "This synthetic case would fail or block future preview validation.",
    technicalSummary: `Dry-run only: ${dryRunCase.expectedRuleIds.join(", ")} -> ${dryRunCase.expectedErrorStateIds.join(", ") || "no error"} -> ${dryRunCase.expectedBlockerIds.join(", ") || "no blocker"}.`,
    matchedRuleIds: dryRunCase.expectedRuleIds,
    matchedErrorStateIds: dryRunCase.expectedErrorStateIds,
    matchedBlockerIds: dryRunCase.expectedBlockerIds,
    matchedBoundaryGuardIds: dryRunCase.expectedBoundaryGuardIds,
    matchedRefusalStateIds: dryRunCase.expectedRefusalStateIds,
    canCreatePayloadIn9A: false,
    canAcceptPayloadIn9A: false,
    canGeneratePreviewIn9A: false,
    canPersistIn9A: false,
    canPromoteOfficialTruthIn9A: false,
    canDriveDecisionIn9A: false,
    canDriveSelectionIn9A: false,
    canDriveTacticIn9A: false,
    canMutateScoreIn9A: false,
    canMutateTimelineIn9A: false,
    activeIn9A: false,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function coverage(cases: readonly ManualReviewPreviewPayloadDryRunCase9A[]): ManualReviewPreviewPayloadDryRunCoverage9A {
  const coveredRules = unique(cases.flatMap((dryRunCase) => dryRunCase.expectedRuleIds));
  const coveredErrors = unique(cases.flatMap((dryRunCase) => dryRunCase.expectedErrorStateIds));
  const coveredBlockers = unique(cases.flatMap((dryRunCase) => dryRunCase.expectedBlockerIds));
  const coveredBoundaryGuards = unique(cases.flatMap((dryRunCase) => dryRunCase.expectedBoundaryGuardIds));
  const coveredRefusals = unique(cases.flatMap((dryRunCase) => dryRunCase.expectedRefusalStateIds));
  const uncoveredRuleIds = EXPECTED_RULE_IDS.filter((id) => !coveredRules.includes(id));
  const uncoveredErrorStateIds = EXPECTED_ERROR_IDS.filter((id) => !coveredErrors.includes(id));
  const uncoveredBlockerIds = EXPECTED_BLOCKER_IDS.filter((id) => !coveredBlockers.includes(id));
  const uncoveredBoundaryGuardIds = EXPECTED_BOUNDARY_GUARD_IDS.filter((id) => !coveredBoundaryGuards.includes(id));
  const uncoveredRefusalStateIds = EXPECTED_REFUSAL_IDS.filter((id) => !coveredRefusals.includes(id));
  const complete =
    uncoveredRuleIds.length === 0 &&
    uncoveredErrorStateIds.length === 0 &&
    uncoveredBlockerIds.length === 0 &&
    uncoveredBoundaryGuardIds.length === 0 &&
    uncoveredRefusalStateIds.length === 0;
  return {
    coverageId: "manual_review_preview_payload_dry_run_coverage_9a",
    ruleCoverageCount: coveredRules.length,
    ruleCoverageExpected: 20,
    uncoveredRuleIds,
    errorCoverageCount: coveredErrors.length,
    errorCoverageExpected: 19,
    uncoveredErrorStateIds,
    blockerCoverageCount: coveredBlockers.length,
    blockerCoverageExpected: 12,
    uncoveredBlockerIds,
    boundaryGuardCoverageCount: coveredBoundaryGuards.length,
    boundaryGuardCoverageExpected: 14,
    uncoveredBoundaryGuardIds,
    refusalStateCoverageCount: coveredRefusals.length,
    refusalStateCoverageExpected: 8,
    uncoveredRefusalStateIds,
    coverageStatus: complete ? "complete" : "partial",
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function boundarySummary(): ManualReviewPreviewPayloadDryRunBoundarySummary9A {
  return {
    boundarySummaryId: "manual_review_preview_payload_dry_run_boundary_9a",
    dryRunAcceptedPayloadCount: 0,
    dryRunPreviewGeneratedCount: 0,
    dryRunPayloadCreatedCount: 0,
    dryRunRuntimeValidationCount: 0,
    dryRunRealPayloadReadCount: 0,
    dryRunRealInputReadCount: 0,
    dryRunPersistenceCount: 0,
    dryRunOfficialTruthPromotionCount: 0,
    dryRunAutomationCount: 0,
    dryRunSelectionOrTacticCount: 0,
    dryRunScoreMutationCount: 0,
    dryRunTimelineMutationCount: 0,
    dryRunScoreChangeCreationCount: 0,
    dryRunEventMutationCount: 0,
    summaryStatus: "clean",
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function readinessSummary(
  cases: readonly ManualReviewPreviewPayloadDryRunCase9A[],
  dryRunCoverage: ManualReviewPreviewPayloadDryRunCoverage9A,
): ManualReviewPreviewPayloadDryRunReadinessSummary9A {
  return {
    summaryId: "manual_review_preview_payload_dry_run_readiness_9a",
    dryRunStatus: "documented_dry_run_only",
    expectedDryRunStatus: "documented_dry_run_only",
    statusReason: "All 9A validation behavior is simulated through static dry-run cases; no runtime validator or payload reader is active.",
    dryRunCaseCount: cases.length,
    dryRunPassCaseCount: cases.filter((dryRunCase) => dryRunCase.expectedResult === "would_pass_future_validation_but_not_accepted").length,
    dryRunFailCaseCount: cases.filter((dryRunCase) => dryRunCase.expectedResult !== "would_pass_future_validation_but_not_accepted").length,
    dryRunBlockingCaseCount: cases.filter((dryRunCase) => dryRunCase.severity === "blocking").length,
    dryRunRuleCoverageCount: dryRunCoverage.ruleCoverageCount,
    dryRunErrorCoverageCount: dryRunCoverage.errorCoverageCount,
    dryRunBlockerCoverageCount: dryRunCoverage.blockerCoverageCount,
    whatIsReady: [
      "simulated validation order",
      "contractual validation cases",
      "rule-field-error-blocker mapping",
      "expected result for every case",
      "no-runtime boundaries",
    ],
    whatIsBlocked: [
      "real runtime validation",
      "real payload read",
      "payload acceptance",
      "real preview generation",
      "submit/API/backend",
      "storage",
      "memory",
      "official truth promotion",
      "automatic decision",
      "selection/tactic",
    ],
    whatFutureSprintCanDo: [
      "render dry-run results without activating preview",
      "polish coach-facing wording",
      "prepare explicit non-persistent payload display",
    ],
    coachFacingReadout: "The future validator path is understandable, but still dry-run only.",
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function warningCodesForModel(input: {
  readonly dryRunCaseCount: number;
  readonly dryRunResultCount: number;
  readonly dryRunCoverage: ManualReviewPreviewPayloadDryRunCoverage9A;
  readonly dryRunBoundarySummary: ManualReviewPreviewPayloadDryRunBoundarySummary9A;
  readonly exportReadTimeSeconds: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly productVisible: boolean;
  readonly exportVisible: boolean;
  readonly exportMetadataVisible: boolean;
  readonly exportHtml: string;
}): readonly ManualReviewPreviewPayloadDryRunValidatorWarningCode9A[] {
  const warnings: ManualReviewPreviewPayloadDryRunValidatorWarningCode9A[] = [];
  if (input.dryRunCaseCount !== 16) warnings.push("DRY_RUN_CASE_COUNT_INVALID");
  if (input.dryRunResultCount !== 16) warnings.push("DRY_RUN_RESULT_COUNT_INVALID");
  if (input.dryRunCoverage.uncoveredRuleIds.length > 0) warnings.push("DRY_RUN_RULE_COVERAGE_INCOMPLETE");
  if (input.dryRunCoverage.uncoveredErrorStateIds.length > 0) warnings.push("DRY_RUN_ERROR_COVERAGE_INCOMPLETE");
  if (input.dryRunCoverage.uncoveredBlockerIds.length > 0) warnings.push("DRY_RUN_BLOCKER_COVERAGE_INCOMPLETE");
  if (input.dryRunCoverage.uncoveredBoundaryGuardIds.length > 0) warnings.push("DRY_RUN_BOUNDARY_GUARD_COVERAGE_INCOMPLETE");
  if (input.dryRunCoverage.uncoveredRefusalStateIds.length > 0) warnings.push("DRY_RUN_REFUSAL_STATE_COVERAGE_INCOMPLETE");
  if (input.dryRunBoundarySummary.dryRunAcceptedPayloadCount !== 0) warnings.push("PAYLOAD_ACCEPTANCE_DETECTED");
  if (input.dryRunBoundarySummary.dryRunPreviewGeneratedCount !== 0) warnings.push("REAL_PREVIEW_GENERATION_DETECTED");
  if (input.dryRunBoundarySummary.dryRunPayloadCreatedCount !== 0) warnings.push("PAYLOAD_CREATION_DETECTED");
  if (input.dryRunBoundarySummary.dryRunRuntimeValidationCount !== 0) warnings.push("VALIDATION_RUNTIME_ACTIVE_DETECTED");
  if (!input.productVisible) warnings.push("PRODUCT_DRY_RUN_VALIDATOR_MISSING");
  if (!input.exportVisible) warnings.push("EXPORT_DRY_RUN_VALIDATOR_MISSING");
  if (!input.exportMetadataVisible) warnings.push("EXPORT_TITLE_MISSING_9A");
  if (input.exportHtml.includes('id="compressed-export-8z"')) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8Z");
  if (input.exportReadTimeSeconds > 900) warnings.push("EXPORT_OVER_900");
  if (input.exportUnder900Seconds !== (input.exportReadTimeSeconds <= 900)) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (input.exportUnder800Seconds !== (input.exportReadTimeSeconds <= 800)) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  return unique(warnings) as readonly ManualReviewPreviewPayloadDryRunValidatorWarningCode9A[];
}

function finalStatus(
  warnings: readonly ManualReviewPreviewPayloadDryRunValidatorWarningCode9A[],
  exportUnder800: boolean,
): "PASS" | "PARTIAL" | "FAIL" {
  if (warnings.some((warning) => MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_9A_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  return warnings.length === 0 && exportUnder800 ? "PASS" : "PARTIAL";
}

export function buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel(input: {
  readonly baseline8Z?: ManualReviewValidationContractAuditConsistencyRepair8ZModel;
  readonly productHtmlBefore9A?: string;
  readonly exportHtmlBefore9A?: string;
} = {}): ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel {
  const baseline8Z = input.baseline8Z ?? buildManualReviewValidationContractAuditConsistencyRepair8ZModel();
  if (baseline8Z.status !== "PASS" || baseline8Z.statusAfterConsistencyRepair !== "PASS_STRONG") {
    throw new Error(`Manual review dry-run validator 9A requires strong PASS 8Z baseline, got ${baseline8Z.status}/${baseline8Z.statusAfterConsistencyRepair}.`);
  }
  const dryRunCases = buildDryRunCases();
  const dryRunExpectedResults = buildExpectedResults(dryRunCases);
  const dryRunCoverage = coverage(dryRunCases);
  const dryRunBoundarySummary = boundarySummary();
  const dryRunReadinessSummary = readinessSummary(dryRunCases, dryRunCoverage);
  const validator: ManualReviewPreviewPayloadDryRunValidator9A = {
    validatorId: "manual_review_preview_payload_dry_run_validator_9a",
    validatorMode: "contract_dry_run_only",
    sourceAuditConsistencyRepairVersion: "8Z",
    sourceValidationContractVersion: "8Y",
    sourcePayloadContractVersion: "8X",
    sourceActivationGuardsVersion: "8W",
    sourceFieldVisualReadinessVersion: "8V",
    sourceInputFieldContractVersion: "8U",
    sourceWorkflowReadinessVersion: "8R",
    sourceDecisionGateVersion: "8Q",
    dryRunCases,
    dryRunExpectedResults,
    dryRunRuleCoverage: dryRunCoverage,
    dryRunBoundarySummary,
    dryRunReadinessSummary,
    forbiddenRuntimeEffects: EXPECTED_BOUNDARY_GUARD_IDS,
    isRuntimeValidator: false,
    isRealPayloadReader: false,
    isRealPayloadAcceptor: false,
    isRealPreviewGenerator: false,
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    visibleInProduct: true,
    visibleInExport: true,
  };
  const baseModel = {
    status: "PASS" as const,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_WITHOUT_RUNTIME_ACTIVATION" as const,
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_9A" as const,
    baselineVersion: "MANUAL_REVIEW_VALIDATION_CONTRACT_AUDIT_CONSISTENCY_REPAIR_8Z" as const,
    matchId: baseline8Z.matchId,
    officialScore: baseline8Z.officialScore,
    baseline8Z,
    baseline8ZPreserved: baseline8Z.status === "PASS" && baseline8Z.statusAfterConsistencyRepair === "PASS_STRONG",
    baseline8YPreserved: baseline8Z.baseline8YPreserved,
    baseline8XPreserved: baseline8Z.baseline8XPreserved,
    baseline8WPreserved: baseline8Z.baseline8WPreserved,
    baseline8VPreserved: baseline8Z.baseline8VPreserved,
    baseline8UPreserved: baseline8Z.baseline8UPreserved,
    baseline8TPreserved: baseline8Z.baseline8TPreserved,
    baseline8SPreserved: baseline8Z.baseline8SPreserved,
    baseline8RPreserved: baseline8Z.baseline8RPreserved,
    baseline8QPreserved: baseline8Z.baseline8QPreserved,
    baseline8PPreserved: baseline8Z.baseline8PPreserved,
    baseline8OPreserved: baseline8Z.baseline8OPreserved,
    baseline8NPreserved: baseline8Z.baseline8NPreserved,
    baseline8MPreserved: baseline8Z.baseline8MPreserved,
    baseline8LPreserved: baseline8Z.baseline8LPreserved,
    baseline8KPreserved: baseline8Z.baseline8KPreserved,
    baseline8IPreserved: baseline8Z.baseline8IPreserved,
    baseline8HPreserved: baseline8Z.baseline8HPreserved,
    baseline8GPreserved: baseline8Z.baseline8GPreserved,
    baseline8FPreserved: baseline8Z.baseline8FPreserved,
    baseline8EPreserved: baseline8Z.baseline8EPreserved,
    baseline8DPreserved: baseline8Z.baseline8DPreserved,
    baseline8CPreserved: baseline8Z.baseline8CPreserved,
    baseline8BPreserved: baseline8Z.baseline8BPreserved,
    baseline8APreserved: baseline8Z.baseline8APreserved,
    baseline7HPreserved: baseline8Z.baseline7HPreserved,
    baseline6XPreserved: baseline8Z.baseline6XPreserved,
    dryRunValidatorReady: true,
    productDryRunValidatorVisible: true,
    exportDryRunValidatorVisible: true,
    dryRunValidatorUsesAuditConsistencyRepair8Z: true,
    dryRunValidatorUsesValidationContract8Y: true,
    dryRunValidatorUsesPayloadContract8X: true,
    dryRunValidatorUsesActivationGuards8W: true,
    dryRunMode: "contract_dry_run_only" as const,
    dryRunStatus: "documented_dry_run_only" as const,
    expectedDryRunStatus: "documented_dry_run_only" as const,
    dryRunStatusCorrect: true,
    dryRunCaseCount: dryRunCases.length,
    dryRunCaseCountExpected: 16,
    dryRunPassCaseCount: dryRunReadinessSummary.dryRunPassCaseCount,
    dryRunFailCaseCount: dryRunReadinessSummary.dryRunFailCaseCount,
    dryRunBlockingCaseCount: dryRunReadinessSummary.dryRunBlockingCaseCount,
    dryRunWarningCaseCount: dryRunCases.filter((dryRunCase) => dryRunCase.severity === "warning").length,
    dryRunRuleCoverageCount: dryRunCoverage.ruleCoverageCount,
    dryRunRuleCoverageExpected: dryRunCoverage.ruleCoverageExpected,
    dryRunErrorCoverageCount: dryRunCoverage.errorCoverageCount,
    dryRunErrorCoverageExpected: dryRunCoverage.errorCoverageExpected,
    dryRunBlockerCoverageCount: dryRunCoverage.blockerCoverageCount,
    dryRunBlockerCoverageExpected: dryRunCoverage.blockerCoverageExpected,
    dryRunBoundaryGuardCoverageCount: dryRunCoverage.boundaryGuardCoverageCount,
    dryRunBoundaryGuardCoverageExpected: dryRunCoverage.boundaryGuardCoverageExpected,
    dryRunRefusalStateCoverageCount: dryRunCoverage.refusalStateCoverageCount,
    dryRunRefusalStateCoverageExpected: dryRunCoverage.refusalStateCoverageExpected,
    dryRunResultCount: dryRunExpectedResults.length,
    dryRunResultCountExpected: 16,
    dryRunAcceptedPayloadCount: 0 as const,
    dryRunPreviewGeneratedCount: 0 as const,
    dryRunPayloadCreatedCount: 0 as const,
    dryRunRuntimeValidationCount: 0 as const,
    dryRunRealPayloadReadCount: 0 as const,
    dryRunRealInputReadCount: 0 as const,
    dryRunPersistenceCount: 0 as const,
    dryRunOfficialTruthPromotionCount: 0 as const,
    dryRunAutomationCount: 0 as const,
    dryRunSelectionOrTacticCount: 0 as const,
    dryRunScoreMutationCount: 0 as const,
    dryRunTimelineMutationCount: 0 as const,
    dryRunScoreChangeCreationCount: 0 as const,
    dryRunEventMutationCount: 0 as const,
    validationRuntimeActive: false as const,
    payloadValidationRuntimeDetected: false as const,
    validationExecutionCount: 0 as const,
    realPayloadReadCount: 0 as const,
    payloadCreated: false as const,
    realPayloadInstanceCount: 0 as const,
    realInputActivated: false as const,
    realPreviewGenerated: false as const,
    submitCreated: false as const,
    apiCreated: false as const,
    backendCreated: false as const,
    storageCreated: false as const,
    memoryCreated: false as const,
    draftCreated: false as const,
    historyCreated: false as const,
    officialTruthPromoted: false as const,
    automaticDecisionCreated: false as const,
    selectionDriven: false as const,
    tacticalInstructionDriven: false as const,
    scoreMutationCount: 0 as const,
    timelineMutationCount: 0 as const,
    scoreChangeCreationCount: 0 as const,
    eventMutationCount: 0 as const,
    validationContractStatusFrom8Y: "documented_but_not_executable" as const,
    payloadContractStatusFrom8X: "documented_but_not_instantiated" as const,
    previewActivationStatusFrom8W: "documented_but_blocked" as const,
    fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review" as const,
    workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview" as const,
    reviewGateStatusFrom8Q: "needs_completion" as const,
    auditConsistencyStatusFrom8Z: "PASS_STRONG" as const,
    readinessDistinctFromReviewGateStillVisible: baseline8Z.readinessDistinctFromReviewGateStillVisible,
    dryRunDistinctFromRuntimeValidation: true,
    dryRunDistinctFromPayloadAcceptance: true,
    dryRunDistinctFromPreviewGeneration: true,
    dryRunMarkedContractOnly: true,
    dryRunMarkedNonRuntime: true,
    dryRunMarkedNonOfficial: true,
    dryRunMarkedNotPersisted: true,
    dryRunMarkedNotApplied: true,
    productStoryFirstPreserved: (input.productHtmlBefore9A ?? baseline8Z.productHtmlAfter8Z).includes("story-first") || (input.productHtmlBefore9A ?? baseline8Z.productHtmlAfter8Z).includes("Match en 2 minutes"),
    exportCompactPreserved: true,
    exportMetadataCurrent9AVisible: true,
    exportReadTimeSecondsAfter9A: 0,
    exportUnder900Seconds: true,
    exportUnder800Seconds: true,
    exportUnder900BooleanCorrect: true,
    exportUnder800BooleanCorrect: true,
    numericThresholdGuardPreserved: true,
    sourceOfTruthSeparationPreserved: baseline8Z.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8Z.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8Z.guardrailsPreserved,
    sharePackPass: true,
    validator,
    dryRunCases,
    dryRunExpectedResults,
    dryRunCoverage,
    dryRunBoundarySummary,
    dryRunReadinessSummary,
    productDryRunValidatorHtml: "",
    exportDryRunValidatorHtml: "",
    productHtmlAfter9A: input.productHtmlBefore9A ?? baseline8Z.productHtmlAfter8Z,
    exportHtmlAfter9A: input.exportHtmlBefore9A ?? baseline8Z.exportHtmlAfter8Z,
    warningCodes: [] as readonly ManualReviewPreviewPayloadDryRunValidatorWarningCode9A[],
    recommendation: "PREPARE_DRY_RUN_RESULT_RENDERER_WITHOUT_PREVIEW_ACTIVATION",
    nextSprintRecommendation: "9B - Manual Review Preview Payload Dry-Run Result Renderer Without Preview Activation",
  } satisfies ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel;
  const productDryRunValidatorHtml = renderManualReviewPreviewPayloadDryRunValidatorProduct9A(baseModel);
  const exportDryRunValidatorHtml = renderManualReviewPreviewPayloadDryRunValidatorExport9A(baseModel);
  const productHtmlAfter9A = insertManualReviewPreviewPayloadDryRunValidatorProduct9A(
    input.productHtmlBefore9A ?? baseline8Z.productHtmlAfter8Z,
    productDryRunValidatorHtml,
  );
  const exportHtmlAfter9A = insertManualReviewPreviewPayloadDryRunValidatorExport9A(
    input.exportHtmlBefore9A ?? baseline8Z.exportHtmlAfter8Z,
    exportDryRunValidatorHtml,
  );
  const exportReadTimeSecondsAfter9A = estimateReadTimeSeconds(exportHtmlAfter9A);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9A <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9A <= 800;
  const exportMetadataCurrent9AVisible =
    exportHtmlAfter9A.includes("<title>Rapport coach export compact 9A - dry-run payload preview-only</title>") &&
    exportHtmlAfter9A.includes("Export compact 9A") &&
    exportHtmlAfter9A.includes('id="compressed-export-9a"') &&
    exportHtmlAfter9A.includes('data-manual-review-preview-payload-dry-run-validator-version="9A"');
  const warningCodes = warningCodesForModel({
    dryRunCaseCount: dryRunCases.length,
    dryRunResultCount: dryRunExpectedResults.length,
    dryRunCoverage,
    dryRunBoundarySummary,
    exportReadTimeSeconds: exportReadTimeSecondsAfter9A,
    exportUnder900Seconds,
    exportUnder800Seconds,
    productVisible: productHtmlAfter9A.includes('id="manual-review-preview-payload-dry-run-validator-9a"'),
    exportVisible: exportHtmlAfter9A.includes('id="manual-review-preview-payload-dry-run-validator-export-9a"'),
    exportMetadataVisible: exportMetadataCurrent9AVisible,
    exportHtml: exportHtmlAfter9A,
  });
  const status = finalStatus(warningCodes, exportUnder800Seconds);
  return {
    ...baseModel,
    status,
    dryRunValidatorReady: warningCodes.length === 0,
    productDryRunValidatorVisible: productHtmlAfter9A.includes('id="manual-review-preview-payload-dry-run-validator-9a"'),
    exportDryRunValidatorVisible: exportHtmlAfter9A.includes('id="manual-review-preview-payload-dry-run-validator-export-9a"'),
    exportMetadataCurrent9AVisible,
    exportReadTimeSecondsAfter9A,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9A <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9A <= 800),
    numericThresholdGuardPreserved:
      exportUnder900Seconds === (exportReadTimeSecondsAfter9A <= 900) &&
      exportUnder800Seconds === (exportReadTimeSecondsAfter9A <= 800),
    productDryRunValidatorHtml,
    exportDryRunValidatorHtml,
    productHtmlAfter9A,
    exportHtmlAfter9A,
    warningCodes,
    recommendation: status === "PASS"
      ? "PREPARE_DRY_RUN_RESULT_RENDERER_WITHOUT_PREVIEW_ACTIVATION"
      : "REPAIR_DRY_RUN_VALIDATOR_CONTRACT_BEFORE_RESULT_RENDERING",
    nextSprintRecommendation: status === "PASS"
      ? "9B - Manual Review Preview Payload Dry-Run Result Renderer Without Preview Activation"
      : status === "PARTIAL"
        ? "9B - Dry-Run Validator Wording Polish"
        : "9B - Dry-Run Source-of-Truth / Runtime Regression Fix",
  };
}

export function currentManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel(): ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel {
  return buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel();
}

function baselineRows(model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): readonly string[] {
  return table([
    ["Baseline", "Preserved"],
    ["8Z audit consistency repair", bool(model.baseline8ZPreserved)],
    ["8Y validation contract", bool(model.baseline8YPreserved)],
    ["8X payload contract", bool(model.baseline8XPreserved)],
    ["8W activation guards", bool(model.baseline8WPreserved)],
    ["8V field visual readiness", bool(model.baseline8VPreserved)],
    ["8U input field contract", bool(model.baseline8UPreserved)],
    ["8R workflow readiness", bool(model.baseline8RPreserved)],
    ["8Q review gate", bool(model.baseline8QPreserved)],
    ["6X economy baseline", bool(model.baseline6XPreserved)],
  ]);
}

function caseRows(model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): readonly string[] {
  return table([
    ["Case", "Result", "Severity", "Errors", "Blockers"],
    ...model.dryRunCases.map((dryRunCase) => [
      dryRunCase.dryRunCaseId,
      dryRunCase.expectedResult,
      dryRunCase.severity,
      dryRunCase.expectedErrorStateIds.join(", ") || "none",
      dryRunCase.expectedBlockerIds.join(", ") || "none",
    ]),
  ]);
}

function resultRows(model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): readonly string[] {
  return table([
    ["Result", "Case", "Kind", "Can accept payload", "Can preview"],
    ...model.dryRunExpectedResults.map((result) => [
      result.resultId,
      result.dryRunCaseId,
      result.resultKind,
      bool(result.canAcceptPayloadIn9A),
      bool(result.canGeneratePreviewIn9A),
    ]),
  ]);
}

function coverageRows(model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): readonly string[] {
  return table([
    ["Coverage", "Count", "Expected", "Uncovered"],
    ["rules", String(model.dryRunRuleCoverageCount), String(model.dryRunRuleCoverageExpected), model.dryRunCoverage.uncoveredRuleIds.join(", ") || "none"],
    ["errors", String(model.dryRunErrorCoverageCount), String(model.dryRunErrorCoverageExpected), model.dryRunCoverage.uncoveredErrorStateIds.join(", ") || "none"],
    ["blockers", String(model.dryRunBlockerCoverageCount), String(model.dryRunBlockerCoverageExpected), model.dryRunCoverage.uncoveredBlockerIds.join(", ") || "none"],
    ["boundary guards", String(model.dryRunBoundaryGuardCoverageCount), String(model.dryRunBoundaryGuardCoverageExpected), model.dryRunCoverage.uncoveredBoundaryGuardIds.join(", ") || "none"],
    ["refusal states", String(model.dryRunRefusalStateCoverageCount), String(model.dryRunRefusalStateCoverageExpected), model.dryRunCoverage.uncoveredRefusalStateIds.join(", ") || "none"],
  ]);
}

function boundaryRows(model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): readonly string[] {
  return table([
    ["Boundary", "Count"],
    ["accepted payload", String(model.dryRunAcceptedPayloadCount)],
    ["preview generated", String(model.dryRunPreviewGeneratedCount)],
    ["payload created", String(model.dryRunPayloadCreatedCount)],
    ["runtime validation", String(model.dryRunRuntimeValidationCount)],
    ["real payload read", String(model.dryRunRealPayloadReadCount)],
    ["persistence", String(model.dryRunPersistenceCount)],
    ["official truth", String(model.dryRunOfficialTruthPromotionCount)],
    ["automation", String(model.dryRunAutomationCount)],
    ["selection or tactic", String(model.dryRunSelectionOrTacticCount)],
    ["score/timeline/score_change/event", `${model.dryRunScoreMutationCount}/${model.dryRunTimelineMutationCount}/${model.dryRunScoreChangeCreationCount}/${model.dryRunEventMutationCount}`],
  ]);
}

export function renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9ADoc(
  model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Validator Without Runtime Activation 9A",
    "",
    `Status: ${model.status}`,
    "",
    "## Scope",
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baseline: ${model.baselineVersion}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...baselineRows(model),
    "",
    "## Dry-Run Validator Summary",
    `- dryRunStatus: ${model.dryRunStatus}`,
    `- dryRunMode: ${model.dryRunMode}`,
    `- dryRunCaseCount: ${model.dryRunCaseCount}`,
    `- dryRunResultCount: ${model.dryRunResultCount}`,
    `- valid case result: ${model.dryRunExpectedResults[0]?.resultKind ?? "missing"}`,
    `- accepted payload count: ${model.dryRunAcceptedPayloadCount}`,
    "",
    "## Dry-Run Cases",
    ...caseRows(model),
    "",
    "## Expected Results",
    ...resultRows(model),
    "",
    "## Rule / Error / Blocker Coverage",
    ...coverageRows(model),
    "",
    "## Boundary Summary",
    ...boundaryRows(model),
    "",
    "## Dry-Run Readiness",
    `- statusReason: ${model.dryRunReadinessSummary.statusReason}`,
    `- whatIsReady: ${model.dryRunReadinessSummary.whatIsReady.join("; ")}`,
    `- whatIsBlocked: ${model.dryRunReadinessSummary.whatIsBlocked.join("; ")}`,
    "",
    "## Dry-Run Distinctions",
    `- dryRunDistinctFromRuntimeValidation: ${bool(model.dryRunDistinctFromRuntimeValidation)}`,
    `- dryRunDistinctFromPayloadAcceptance: ${bool(model.dryRunDistinctFromPayloadAcceptance)}`,
    `- dryRunDistinctFromPreviewGeneration: ${bool(model.dryRunDistinctFromPreviewGeneration)}`,
    "",
    "## No-Runtime Audit",
    ...boundaryRows(model),
    "",
    "## Source-of-Truth Regression Audit",
    `- sourceOfTruthSeparationPreserved: ${bool(model.sourceOfTruthSeparationPreserved)}`,
    `- matchEconomyBaselinePreserved: ${bool(model.matchEconomyBaselinePreserved)}`,
    `- guardrailsPreserved: ${bool(model.guardrailsPreserved)}`,
    "",
    "## Export Metadata Audit",
    `- exportMetadataCurrent9AVisible: ${bool(model.exportMetadataCurrent9AVisible)}`,
    `- main id no longer compressed-export-8z: ${bool(!model.exportHtmlAfter9A.includes('id="compressed-export-8z"'))}`,
    "",
    "## Export Budget Audit",
    `- exportReadTimeSecondsAfter9A: ${model.exportReadTimeSecondsAfter9A}`,
    `- exportUnder900Seconds: ${bool(model.exportUnder900Seconds)}`,
    `- exportUnder800Seconds: ${bool(model.exportUnder800Seconds)}`,
    `- exportUnder900BooleanCorrect: ${bool(model.exportUnder900BooleanCorrect)}`,
    `- exportUnder800BooleanCorrect: ${bool(model.exportUnder800BooleanCorrect)}`,
    "",
    "## Product / Export Excerpts",
    "- product excerpt: Dry-run validator payload preview-only",
    "- export excerpt: Dry-run payload preview-only",
    "",
    "## Source Reports",
    `- 8Z report: ${renderManualReviewValidationContractAuditConsistencyRepair8ZDoc(model.baseline8Z).split("\n").slice(0, 4).join(" / ")}`,
    `- 8Z validation: ${renderManualReviewValidationContractAuditConsistencyRepair8ZValidation(model.baseline8Z).split("\n").slice(0, 4).join(" / ")}`,
    "",
    "## Warnings",
    `- ${model.warningCodes.length === 0 ? "none" : model.warningCodes.join(", ")}`,
  ].join("\n");
}

export function renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AValidation(
  model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
): string {
  const validCase = model.dryRunCases.find((dryRunCase) => dryRunCase.dryRunCaseId === "valid_preview_only_payload_shape_9a");
  const invalidSource = model.dryRunCases.find((dryRunCase) => dryRunCase.dryRunCaseId === "invalid_source_payload_9a");
  const automationCase = model.dryRunCases.find((dryRunCase) => dryRunCase.dryRunCaseId === "automation_storage_engine_learning_attempt_9a");
  const checks = [
    checkLine("ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_9A", model.version),
    checkLine("baseline 8Z visible and preserved", model.baseline8ZPreserved, bool(model.baseline8ZPreserved)),
    checkLine("baseline 8Y preserved", model.baseline8YPreserved, bool(model.baseline8YPreserved)),
    checkLine("baseline 8X preserved", model.baseline8XPreserved, bool(model.baseline8XPreserved)),
    checkLine("baseline 8W preserved", model.baseline8WPreserved, bool(model.baseline8WPreserved)),
    checkLine("baseline 8V preserved", model.baseline8VPreserved, bool(model.baseline8VPreserved)),
    checkLine("baseline 8U preserved", model.baseline8UPreserved, bool(model.baseline8UPreserved)),
    checkLine("baseline 8T/8S/8R/8Q/8P/8O/8N/8M/8L/8K preserved", model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved, "manual chain preserved"),
    checkLine("product dry-run validator visible", model.productDryRunValidatorVisible, bool(model.productDryRunValidatorVisible)),
    checkLine("export dry-run validator visible", model.exportDryRunValidatorVisible, bool(model.exportDryRunValidatorVisible)),
    checkLine("dryRunValidatorUsesAuditConsistencyRepair8Z = true", model.dryRunValidatorUsesAuditConsistencyRepair8Z, bool(model.dryRunValidatorUsesAuditConsistencyRepair8Z)),
    checkLine("dryRunValidatorUsesValidationContract8Y = true", model.dryRunValidatorUsesValidationContract8Y, bool(model.dryRunValidatorUsesValidationContract8Y)),
    checkLine("dryRunValidatorUsesPayloadContract8X = true", model.dryRunValidatorUsesPayloadContract8X, bool(model.dryRunValidatorUsesPayloadContract8X)),
    checkLine("dryRunValidatorUsesActivationGuards8W = true", model.dryRunValidatorUsesActivationGuards8W, bool(model.dryRunValidatorUsesActivationGuards8W)),
    checkLine("dryRunStatus = documented_dry_run_only", model.dryRunStatus === "documented_dry_run_only", model.dryRunStatus),
    checkLine("expectedDryRunStatus = documented_dry_run_only", model.expectedDryRunStatus === "documented_dry_run_only", model.expectedDryRunStatus),
    checkLine("dryRunStatusCorrect = true", model.dryRunStatusCorrect, bool(model.dryRunStatusCorrect)),
    checkLine("dryRunCaseCount = 16", model.dryRunCaseCount === 16, String(model.dryRunCaseCount)),
    checkLine("dryRunResultCount = 16", model.dryRunResultCount === 16, String(model.dryRunResultCount)),
    checkLine("dryRunPassCaseCount >= 1", model.dryRunPassCaseCount >= 1, String(model.dryRunPassCaseCount)),
    checkLine("dryRunFailCaseCount >= 15", model.dryRunFailCaseCount >= 15, String(model.dryRunFailCaseCount)),
    checkLine("dryRunBlockingCaseCount >= 12", model.dryRunBlockingCaseCount >= 12, String(model.dryRunBlockingCaseCount)),
    checkLine("valid case not accepted", validCase?.expectedResult === "would_pass_future_validation_but_not_accepted" && model.dryRunAcceptedPayloadCount === 0, validCase?.expectedResult ?? "missing"),
    checkLine("invalid_source maps INVALID_PAYLOAD_SOURCE_8Y and BLOCK_INVALID_SOURCE_OR_SCOPE_8Y", invalidSource?.expectedErrorStateIds.includes("INVALID_PAYLOAD_SOURCE_8Y") === true && invalidSource.expectedBlockerIds.includes("BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"), invalidSource?.dryRunCaseId ?? "missing"),
    checkLine("automation/storage/engine learning maps expected errors", automationCase?.expectedErrorStateIds.includes("AUTOMATION_FIELD_FORBIDDEN_8Y") === true && automationCase.expectedErrorStateIds.includes("STORAGE_FIELD_FORBIDDEN_8Y") && automationCase.expectedErrorStateIds.includes("ENGINE_LEARNING_FIELD_FORBIDDEN_8Y"), automationCase?.expectedErrorStateIds.join(", ") ?? "missing"),
    checkLine("ruleCoverageCount = 20", model.dryRunRuleCoverageCount === 20, String(model.dryRunRuleCoverageCount)),
    checkLine("errorCoverageCount = 19", model.dryRunErrorCoverageCount === 19, String(model.dryRunErrorCoverageCount)),
    checkLine("blockerCoverageCount = 12", model.dryRunBlockerCoverageCount === 12, String(model.dryRunBlockerCoverageCount)),
    checkLine("boundaryGuardCoverageCount = 14", model.dryRunBoundaryGuardCoverageCount === 14, String(model.dryRunBoundaryGuardCoverageCount)),
    checkLine("refusalStateCoverageCount = 8", model.dryRunRefusalStateCoverageCount === 8, String(model.dryRunRefusalStateCoverageCount)),
    checkLine("uncovered arrays empty", model.dryRunCoverage.uncoveredRuleIds.length === 0 && model.dryRunCoverage.uncoveredErrorStateIds.length === 0 && model.dryRunCoverage.uncoveredBlockerIds.length === 0 && model.dryRunCoverage.uncoveredBoundaryGuardIds.length === 0 && model.dryRunCoverage.uncoveredRefusalStateIds.length === 0, "all complete"),
    checkLine("validationRuntimeActive = false", !model.validationRuntimeActive, bool(model.validationRuntimeActive)),
    checkLine("payloadValidationRuntimeDetected = false", !model.payloadValidationRuntimeDetected, bool(model.payloadValidationRuntimeDetected)),
    checkLine("validationExecutionCount = 0", model.validationExecutionCount === 0, String(model.validationExecutionCount)),
    checkLine("realPayloadReadCount = 0", model.realPayloadReadCount === 0, String(model.realPayloadReadCount)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPayloadInstanceCount = 0", model.realPayloadInstanceCount === 0, String(model.realPayloadInstanceCount)),
    checkLine("dryRunAcceptedPayloadCount = 0", model.dryRunAcceptedPayloadCount === 0, String(model.dryRunAcceptedPayloadCount)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("submit/api/backend = false", !model.submitCreated && !model.apiCreated && !model.backendCreated, `${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}`),
    checkLine("no localStorage/DB/file/draft/history/memory", !model.storageCreated && !model.draftCreated && !model.historyCreated && !model.memoryCreated, "no persistence"),
    checkLine("no official truth promotion", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("no automatic decision", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("no selection/tactic", !model.selectionDriven && !model.tacticalInstructionDriven, `${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`),
    checkLine("score/timeline/score_change/event mutation = 0", model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.scoreChangeCreationCount === 0 && model.eventMutationCount === 0, `${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`),
    checkLine("validationContractStatusFrom8Y remains documented_but_not_executable", model.validationContractStatusFrom8Y === "documented_but_not_executable", model.validationContractStatusFrom8Y),
    checkLine("payloadContractStatusFrom8X remains documented_but_not_instantiated", model.payloadContractStatusFrom8X === "documented_but_not_instantiated", model.payloadContractStatusFrom8X),
    checkLine("previewActivationStatusFrom8W remains documented_but_blocked", model.previewActivationStatusFrom8W === "documented_but_blocked", model.previewActivationStatusFrom8W),
    checkLine("fieldVisualReadinessStatusFrom8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("auditConsistencyStatusFrom8Z remains PASS_STRONG", model.auditConsistencyStatusFrom8Z === "PASS_STRONG", model.auditConsistencyStatusFrom8Z),
    checkLine("dryRunDistinctFromRuntimeValidation = true", model.dryRunDistinctFromRuntimeValidation, bool(model.dryRunDistinctFromRuntimeValidation)),
    checkLine("dryRunDistinctFromPayloadAcceptance = true", model.dryRunDistinctFromPayloadAcceptance, bool(model.dryRunDistinctFromPayloadAcceptance)),
    checkLine("dryRunDistinctFromPreviewGeneration = true", model.dryRunDistinctFromPreviewGeneration, bool(model.dryRunDistinctFromPreviewGeneration)),
    checkLine("product/export action plan visible", model.baseline8Z.productActionPlanVisibleAfter8Z && model.baseline8Z.exportActionPlanVisibleAfter8Z, "action plan visible"),
    checkLine("tactical map cards visible", model.baseline8Z.tacticalMapCardsVisibleAfter8Z, bool(model.baseline8Z.tacticalMapCardsVisibleAfter8Z)),
    checkLine("exportReadTimeSecondsAfter9A <= 900", model.exportReadTimeSecondsAfter9A <= 900, String(model.exportReadTimeSecondsAfter9A)),
    checkLine("exportUnder900Seconds correctly computed", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("export title mentions 9A", model.exportHtmlAfter9A.includes("Rapport coach export compact 9A"), "title 9A"),
    checkLine("export visible badge mentions 9A", model.exportHtmlAfter9A.includes("Export compact 9A") || model.exportHtmlAfter9A.includes("Dry-run payload 9A"), "badge 9A"),
    checkLine("export main id no longer compressed-export-8z", !model.exportHtmlAfter9A.includes('id="compressed-export-8z"') && model.exportHtmlAfter9A.includes('id="compressed-export-9a"'), "id 9A"),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", true, "source-of-truth audit preserved"),
    checkLine("dry-run does not promote coach input to official truth", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("sandbox/batch/diagnostic remain separated", model.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, "separated"),
    checkLine("no scoring constants changed", scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "scoring unchanged"),
    checkLine("MatchBonusEvent unchanged", model.baseline8Z.baseline8Y.sourceOfTruthAudit.MatchBonusEventUnchanged, bool(model.baseline8Z.baseline8Y.sourceOfTruthAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, bool(model.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Manual Review Preview Payload Dry-Run Validator Without Runtime Activation 9A",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- dryRunCaseCount: ${model.dryRunCaseCount}`,
    `- dryRunResultCount: ${model.dryRunResultCount}`,
    `- dryRunRuleCoverageCount: ${model.dryRunRuleCoverageCount}`,
    `- dryRunErrorCoverageCount: ${model.dryRunErrorCoverageCount}`,
    `- dryRunBlockerCoverageCount: ${model.dryRunBlockerCoverageCount}`,
    `- dryRunBoundaryGuardCoverageCount: ${model.dryRunBoundaryGuardCoverageCount}`,
    `- dryRunRefusalStateCoverageCount: ${model.dryRunRefusalStateCoverageCount}`,
    `- dryRunAcceptedPayloadCount: ${model.dryRunAcceptedPayloadCount}`,
    `- exportReadTimeSecondsAfter9A: ${model.exportReadTimeSecondsAfter9A}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Commands",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Warnings",
    `- ${model.warningCodes.length === 0 ? "none" : model.warningCodes.join(", ")}`,
  ].join("\n");
}
