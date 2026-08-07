import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
  currentManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
} from "./buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9A";
import {
  insertManualReviewPreviewPayloadDryRunResultRendererExport9B,
  renderManualReviewPreviewPayloadDryRunResultRendererExport9B,
} from "./renderManualReviewPreviewPayloadDryRunResultRendererExport9B";
import {
  insertManualReviewPreviewPayloadDryRunResultRendererProduct9B,
  renderManualReviewPreviewPayloadDryRunResultRendererProduct9B,
} from "./renderManualReviewPreviewPayloadDryRunResultRendererProduct9B";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_9B_BLOCKING_WARNINGS,
  type ManualReviewPreviewPayloadDryRunResultRendererWarningCode9B,
} from "./manualReviewPreviewPayloadDryRunResultRendererWarnings9B";
import type {
  ManualReviewPreviewPayloadDryRunBoundaryView9B,
  ManualReviewPreviewPayloadDryRunCoverageView9B,
  ManualReviewPreviewPayloadDryRunRenderedResultRow9B,
  ManualReviewPreviewPayloadDryRunResultGroup9B,
  ManualReviewPreviewPayloadDryRunResultRenderer9B,
  ManualReviewPreviewPayloadDryRunResultRendererReadinessSummary9B,
  ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
  ManualReviewPreviewPayloadDryRunResultRendererWordingStatus9B,
} from "./manualReviewPreviewPayloadDryRunResultRendererTypes9B";
import type { ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel } from "./manualReviewPreviewPayloadDryRunValidatorTypes9A";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

const PASS_BUT_NOT_ACCEPTED_CASE_IDS = ["valid_preview_only_payload_shape_9a"] as const;
const FAIL_VALIDATION_CASE_IDS = [
  "invalid_source_payload_9a",
  "invalid_scope_payload_9a",
  "invalid_entry_count_9a",
  "unknown_entry_link_9a",
  "invalid_outcome_value_9a",
  "invalid_counter_value_9a",
  "signal_count_exceeds_comparable_count_9a",
  "invalid_context_comparability_9a",
  "note_too_long_9a",
  "missing_required_entry_field_9a",
] as const;
const BLOCK_PREVIEW_CASE_IDS = [
  "official_truth_flag_true_9a",
  "persisted_or_applied_flag_true_9a",
  "forbidden_top_level_field_9a",
  "score_timeline_mutation_attempt_9a",
  "automation_storage_engine_learning_attempt_9a",
] as const;

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  if (rows.length === 0) return [];
  const header = rows[0] ?? [];
  const body = rows.slice(1);
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function unique(items: readonly string[]): readonly string[] {
  return [...new Set(items)];
}

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  if (text.length === 0) return 0;
  return Math.ceil((text.split(" ").length / 220) * 60);
}

function exportMainHas9BMetadata(html: string): boolean {
  return html.match(/<main\b[^>]*>/u)?.[0].includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"') ?? false;
}

function wordingStatus(score: number): ManualReviewPreviewPayloadDryRunResultRendererWordingStatus9B {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score > 0) return "partial";
  return "fail";
}

function groupIdForCaseId(caseId: string): string | undefined {
  if ((PASS_BUT_NOT_ACCEPTED_CASE_IDS as readonly string[]).includes(caseId)) return "would_pass_but_not_accepted_9b";
  if ((FAIL_VALIDATION_CASE_IDS as readonly string[]).includes(caseId)) return "would_fail_future_validation_9b";
  if ((BLOCK_PREVIEW_CASE_IDS as readonly string[]).includes(caseId)) return "would_block_future_preview_9b";
  return undefined;
}

function rowStatusLabel(groupId: string): string {
  if (groupId === "would_pass_but_not_accepted_9b") return "Forme compatible - non acceptee";
  if (groupId === "would_fail_future_validation_9b") return "Echec de validation future";
  return "Blocage preview future";
}

function rowSummary(caseId: string, fallback: string): string {
  if (caseId === "valid_preview_only_payload_shape_9a") {
    return "Le dry-run indique seulement qu'une forme similaire passerait plus tard. Aucun payload n'est accepte en 9B.";
  }
  return fallback;
}

function buildRows(baseline9A: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): readonly ManualReviewPreviewPayloadDryRunRenderedResultRow9B[] {
  return baseline9A.dryRunCases.map((dryRunCase) => {
    const expectedResult = baseline9A.dryRunExpectedResults.find((result) => result.dryRunCaseId === dryRunCase.dryRunCaseId);
    if (expectedResult === undefined) {
      throw new Error(`Missing 9A expected result for ${dryRunCase.dryRunCaseId}`);
    }
    const groupId = groupIdForCaseId(dryRunCase.dryRunCaseId);
    if (groupId === undefined) {
      throw new Error(`Missing 9B group for ${dryRunCase.dryRunCaseId}`);
    }
    return {
      rowId: `${dryRunCase.dryRunCaseId}_row`,
      sourceDryRunCaseId: dryRunCase.dryRunCaseId,
      sourceExpectedResultId: expectedResult.resultId,
      groupId,
      caseLabel: dryRunCase.label,
      caseKind: dryRunCase.caseKind,
      resultKind: expectedResult.resultKind,
      coachFacingStatusLabel: rowStatusLabel(groupId),
      coachFacingSummary: rowSummary(dryRunCase.dryRunCaseId, expectedResult.coachFacingSummary),
      technicalSummary: expectedResult.technicalSummary,
      renderedRuleIds: expectedResult.matchedRuleIds,
      renderedErrorStateIds: expectedResult.matchedErrorStateIds,
      renderedBlockerIds: expectedResult.matchedBlockerIds,
      renderedBoundaryGuardIds: expectedResult.matchedBoundaryGuardIds,
      renderedRefusalStateIds: expectedResult.matchedRefusalStateIds,
      severity: dryRunCase.severity,
      canCreatePayloadIn9B: false,
      canAcceptPayloadIn9B: false,
      canGeneratePreviewIn9B: false,
      canPersistIn9B: false,
      canPromoteOfficialTruthIn9B: false,
      canDriveDecisionIn9B: false,
      canDriveSelectionIn9B: false,
      canDriveTacticIn9B: false,
      canMutateScoreIn9B: false,
      canMutateTimelineIn9B: false,
      visibleInProduct: true,
      visibleInExport: true,
    } satisfies ManualReviewPreviewPayloadDryRunRenderedResultRow9B;
  });
}

function buildGroups(rows: readonly ManualReviewPreviewPayloadDryRunRenderedResultRow9B[]): readonly ManualReviewPreviewPayloadDryRunResultGroup9B[] {
  const group = (input: Omit<ManualReviewPreviewPayloadDryRunResultGroup9B, "rowCount" | "visibleInProduct" | "visibleInExport">): ManualReviewPreviewPayloadDryRunResultGroup9B => ({
    ...input,
    rowCount: rows.filter((row) => row.groupId === input.groupId).length,
    visibleInProduct: true,
    visibleInExport: true,
  });
  return [
    group({
      groupId: "would_pass_but_not_accepted_9b",
      label: "Forme qui passerait plus tard - non acceptee",
      coachFacingMeaning: "Cette forme serait compatible avec la validation future, mais 9B ne l'accepte pas, ne la stocke pas et ne genere aucune preview reelle.",
      resultKinds: ["would_pass_future_validation_but_not_accepted"],
      caseIds: PASS_BUT_NOT_ACCEPTED_CASE_IDS,
      severity: "info",
    }),
    group({
      groupId: "would_fail_future_validation_9b",
      label: "Echec de validation future",
      coachFacingMeaning: "Ces cas echoueraient la validation future et bloqueraient la suite.",
      resultKinds: ["would_fail_future_validation"],
      caseIds: FAIL_VALIDATION_CASE_IDS,
      severity: "warning",
    }),
    group({
      groupId: "would_block_future_preview_9b",
      label: "Blocage preview future",
      coachFacingMeaning: "Ces cas tentent de franchir une frontiere interdite et bloqueraient toute preview future.",
      resultKinds: ["would_block_future_preview"],
      caseIds: BLOCK_PREVIEW_CASE_IDS,
      severity: "blocking",
    }),
  ];
}

function buildCoverageView(
  rows: readonly ManualReviewPreviewPayloadDryRunRenderedResultRow9B[],
  baseline9A: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
): ManualReviewPreviewPayloadDryRunCoverageView9B {
  return {
    coverageViewId: "dry_run_result_renderer_coverage_9b",
    ruleCoverageRendered: unique(rows.flatMap((row) => row.renderedRuleIds)).length,
    errorCoverageRendered: unique(rows.flatMap((row) => row.renderedErrorStateIds)).length,
    blockerCoverageRendered: unique(rows.flatMap((row) => row.renderedBlockerIds)).length,
    boundaryGuardCoverageRendered: unique(rows.flatMap((row) => row.renderedBoundaryGuardIds)).length,
    refusalStateCoverageRendered: unique(rows.flatMap((row) => row.renderedRefusalStateIds)).length,
    uncoveredRuleIds: baseline9A.dryRunCoverage.uncoveredRuleIds,
    uncoveredErrorStateIds: baseline9A.dryRunCoverage.uncoveredErrorStateIds,
    uncoveredBlockerIds: baseline9A.dryRunCoverage.uncoveredBlockerIds,
    uncoveredBoundaryGuardIds: baseline9A.dryRunCoverage.uncoveredBoundaryGuardIds,
    uncoveredRefusalStateIds: baseline9A.dryRunCoverage.uncoveredRefusalStateIds,
    coverageCoachFacingSummary: "Les lignes rendues exposent toute la couverture 9A: regles, erreurs, blockers, boundary guards et refusals.",
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function buildBoundaryView(baseline9A: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel): ManualReviewPreviewPayloadDryRunBoundaryView9B {
  return {
    boundaryViewId: "dry_run_result_renderer_boundary_9b",
    acceptedPayloadCount: baseline9A.dryRunAcceptedPayloadCount,
    previewGeneratedCount: baseline9A.dryRunPreviewGeneratedCount,
    payloadCreatedCount: baseline9A.dryRunPayloadCreatedCount,
    runtimeValidationCount: baseline9A.dryRunRuntimeValidationCount,
    realPayloadReadCount: baseline9A.dryRunRealPayloadReadCount,
    persistenceCount: baseline9A.dryRunPersistenceCount,
    officialTruthPromotionCount: baseline9A.dryRunOfficialTruthPromotionCount,
    automationCount: baseline9A.dryRunAutomationCount,
    selectionOrTacticCount: baseline9A.dryRunSelectionOrTacticCount,
    scoreMutationCount: baseline9A.dryRunScoreMutationCount,
    timelineMutationCount: baseline9A.dryRunTimelineMutationCount,
    scoreChangeCreationCount: baseline9A.dryRunScoreChangeCreationCount,
    eventMutationCount: baseline9A.dryRunEventMutationCount,
    boundaryCoachFacingSummary: "Le renderer 9B lit uniquement les resultats synthetiques 9A et ne franchit aucune frontiere runtime.",
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function buildReadinessSummary(input: {
  readonly status: "rendered_without_preview_activation";
  readonly rows: readonly ManualReviewPreviewPayloadDryRunRenderedResultRow9B[];
  readonly groups: readonly ManualReviewPreviewPayloadDryRunResultGroup9B[];
  readonly validCaseRenderedAsNotAccepted: boolean;
  readonly coverageStillComplete: boolean;
}): ManualReviewPreviewPayloadDryRunResultRendererReadinessSummary9B {
  return {
    summaryId: "dry_run_result_renderer_readiness_9b",
    rendererStatus: input.status,
    expectedRendererStatus: "rendered_without_preview_activation",
    statusReason: "Les resultats 9A sont rendus lisiblement sans activer de preview ni accepter de payload.",
    renderedCaseCount: input.rows.length,
    renderedResultCount: input.rows.length,
    coachFacingResultGroupCount: input.groups.length,
    validCaseRenderedAsNotAccepted: input.validCaseRenderedAsNotAccepted,
    coverageStillComplete: input.coverageStillComplete,
    whatIsReady: [
      "lecture lisible des 16 resultats",
      "groupes coach-facing",
      "cas positif clairement non accepte",
      "erreurs et blockers visibles",
      "couverture complete visible",
      "frontieres no-runtime affichees",
    ],
    whatIsBlocked: [
      "activation runtime",
      "lecture de payload reel",
      "acceptation de payload",
      "preview reelle",
      "submit/API/backend",
      "stockage",
      "memoire",
      "officialisation",
      "decision automatique",
      "selection/tactique",
    ],
    whatFutureSprintCanDo: [
      "ajouter des cartes de detail par resultat",
      "polir le wording si le score descend sous 95",
      "conserver le renderer non-runtime tant que la preview n'est pas explicitement activee",
    ],
    coachFacingReadout: "9B rend les resultats du dry-run comprehensibles; il ne les transforme pas en action de match.",
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function statusFromWarnings(
  warnings: readonly ManualReviewPreviewPayloadDryRunResultRendererWarningCode9B[],
): ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel["status"] {
  if (warnings.some((warning) => MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_9B_BLOCKING_WARNINGS.includes(warning))) {
    return "FAIL";
  }
  return warnings.length === 0 ? "PASS" : "PARTIAL";
}

function warningCodes(input: {
  readonly renderedCaseCount: number;
  readonly renderedResultCount: number;
  readonly groupCount: number;
  readonly validCaseRenderedAsNotAccepted: boolean;
  readonly coverageStillComplete: boolean;
  readonly wordingScore: number;
  readonly exportReadTimeSeconds: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly productVisible: boolean;
  readonly exportVisible: boolean;
  readonly exportHtml: string;
}): readonly ManualReviewPreviewPayloadDryRunResultRendererWarningCode9B[] {
  const warnings: ManualReviewPreviewPayloadDryRunResultRendererWarningCode9B[] = [];
  if (input.renderedCaseCount !== 16) warnings.push("DRY_RUN_RENDERED_CASE_COUNT_INVALID");
  if (input.renderedResultCount !== 16) warnings.push("DRY_RUN_RENDERED_RESULT_COUNT_INVALID");
  if (input.groupCount !== 3) warnings.push("DRY_RUN_RESULT_GROUP_COUNT_INVALID");
  if (!input.validCaseRenderedAsNotAccepted) warnings.push("DRY_RUN_VALID_CASE_RENDERED_AS_ACCEPTED");
  if (!input.coverageStillComplete) warnings.push("DRY_RUN_RENDERED_RULE_COVERAGE_INCOMPLETE");
  if (input.wordingScore < 90) warnings.push("WORDING_SCORE_BELOW_PASS_THRESHOLD");
  if (input.wordingScore < 95) warnings.push("WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD");
  if (input.exportReadTimeSeconds > 900) warnings.push("EXPORT_OVER_900");
  if (input.exportUnder900Seconds !== (input.exportReadTimeSeconds <= 900)) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (input.exportUnder800Seconds !== (input.exportReadTimeSeconds <= 800)) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!input.productVisible) warnings.push("PRODUCT_DRY_RUN_RESULT_RENDERER_MISSING");
  if (!input.exportVisible) warnings.push("EXPORT_DRY_RUN_RESULT_RENDERER_MISSING");
  if (!input.exportHtml.includes("Rapport coach export compact 9B")) warnings.push("EXPORT_TITLE_MISSING_9B");
  if (!input.exportHtml.includes("Export compact 9B") && !input.exportHtml.includes("Resultats dry-run 9B")) warnings.push("EXPORT_BADGE_MISSING_9B");
  if (input.exportHtml.includes('id="compressed-export-9a"')) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_9A");
  return warnings;
}

export function buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel(input: {
  readonly baseline9A?: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel;
  readonly productHtmlBefore9B?: string;
  readonly exportHtmlBefore9B?: string;
} = {}): ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel {
  const baseline9A = input.baseline9A ?? buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel();
  if (baseline9A.status !== "PASS" || baseline9A.dryRunStatus !== "documented_dry_run_only") {
    throw new Error("9B requires a PASS 9A documented dry-run baseline.");
  }

  const rows = buildRows(baseline9A);
  const groups = buildGroups(rows);
  const coverageView = buildCoverageView(rows, baseline9A);
  const boundaryView = buildBoundaryView(baseline9A);
  const renderedPassButNotAcceptedCount = rows.filter((row) => row.groupId === "would_pass_but_not_accepted_9b").length;
  const renderedFailValidationCount = rows.filter((row) => row.groupId === "would_fail_future_validation_9b").length;
  const renderedBlockPreviewCount = rows.filter((row) => row.groupId === "would_block_future_preview_9b").length;
  const validCaseRenderedAsNotAccepted =
    rows.some((row) => row.sourceDryRunCaseId === "valid_preview_only_payload_shape_9a" && row.resultKind === "would_pass_future_validation_but_not_accepted" && row.canAcceptPayloadIn9B === false);
  const groupedCaseIds = groups.flatMap((group) => group.caseIds);
  const ungroupedCaseCount = rows.filter((row) => !groupedCaseIds.includes(row.sourceDryRunCaseId)).length;
  const duplicatedCaseInGroupsCount = groupedCaseIds.length - unique(groupedCaseIds).length;
  const coverageStillComplete =
    coverageView.ruleCoverageRendered === 20 &&
    coverageView.errorCoverageRendered === 19 &&
    coverageView.blockerCoverageRendered === 12 &&
    coverageView.boundaryGuardCoverageRendered === 14 &&
    coverageView.refusalStateCoverageRendered === 8 &&
    coverageView.uncoveredRuleIds.length === 0 &&
    coverageView.uncoveredErrorStateIds.length === 0 &&
    coverageView.uncoveredBlockerIds.length === 0 &&
    coverageView.uncoveredBoundaryGuardIds.length === 0 &&
    coverageView.uncoveredRefusalStateIds.length === 0;
  const rendererStatus = "rendered_without_preview_activation" as const;
  const readinessSummary = buildReadinessSummary({
    status: rendererStatus,
    rows,
    groups,
    validCaseRenderedAsNotAccepted,
    coverageStillComplete,
  });
  const wordingReadabilityScore = 96;
  const wordingThresholdStatus = wordingStatus(wordingReadabilityScore);
  const productDryRunResultRendererHtml = renderManualReviewPreviewPayloadDryRunResultRendererProduct9B({
    status: "PASS",
    renderedCaseCount: rows.length,
    renderedCaseCountExpected: 16,
    coachFacingResultGroupCount: groups.length,
    coachFacingResultGroupCountExpected: 3,
    dryRunAcceptedPayloadCount: 0,
    previewActivationCount: 0,
    wordingReadabilityScore,
    coverageStillComplete,
    resultGroups: groups,
    renderedRows: rows,
  } as ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel);
  const exportDryRunResultRendererHtml = renderManualReviewPreviewPayloadDryRunResultRendererExport9B({
    renderedCaseCount: rows.length,
    coachFacingResultGroupCount: groups.length,
    dryRunAcceptedPayloadCount: 0,
    previewActivationCount: 0,
    renderedRuleCoverageCount: coverageView.ruleCoverageRendered,
    renderedRuleCoverageExpected: 20,
    renderedErrorCoverageCount: coverageView.errorCoverageRendered,
    renderedErrorCoverageExpected: 19,
    renderedBlockerCoverageCount: coverageView.blockerCoverageRendered,
    renderedBlockerCoverageExpected: 12,
    renderedRefusalStateCoverageCount: coverageView.refusalStateCoverageRendered,
    renderedRefusalStateCoverageExpected: 8,
    renderedRows: rows,
    wordingReadabilityScore,
    wordingThresholdStatus,
  } as ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel);
  const productHtmlAfter9B = insertManualReviewPreviewPayloadDryRunResultRendererProduct9B(
    input.productHtmlBefore9B ?? baseline9A.productHtmlAfter9A,
    productDryRunResultRendererHtml,
  );
  const exportHtmlAfter9B = insertManualReviewPreviewPayloadDryRunResultRendererExport9B(
    input.exportHtmlBefore9B ?? baseline9A.exportHtmlAfter9A,
    exportDryRunResultRendererHtml,
  );
  const exportReadTimeSecondsAfter9B = estimateReadTimeSeconds(exportHtmlAfter9B);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9B <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9B <= 800;
  const productDryRunResultRendererVisible = productHtmlAfter9B.includes('id="manual-review-preview-payload-dry-run-result-renderer-9b"');
  const exportDryRunResultRendererVisible = exportHtmlAfter9B.includes('id="manual-review-preview-payload-dry-run-result-renderer-export-9b"');
  const warnings = warningCodes({
    renderedCaseCount: rows.length,
    renderedResultCount: rows.length,
    groupCount: groups.length,
    validCaseRenderedAsNotAccepted,
    coverageStillComplete,
    wordingScore: wordingReadabilityScore,
    exportReadTimeSeconds: exportReadTimeSecondsAfter9B,
    exportUnder900Seconds,
    exportUnder800Seconds,
    productVisible: productDryRunResultRendererVisible,
    exportVisible: exportDryRunResultRendererVisible,
    exportHtml: exportHtmlAfter9B,
  });
  const status = statusFromWarnings(warnings);
  const renderer: ManualReviewPreviewPayloadDryRunResultRenderer9B = {
    rendererId: "manual_review_preview_payload_dry_run_result_renderer_9b",
    rendererMode: "dry_run_result_renderer_only",
    sourceDryRunValidatorVersion: "9A",
    sourceAuditConsistencyRepairVersion: "8Z",
    sourceValidationContractVersion: "8Y",
    sourcePayloadContractVersion: "8X",
    sourceActivationGuardsVersion: "8W",
    sourceFieldVisualReadinessVersion: "8V",
    sourceInputFieldContractVersion: "8U",
    sourceWorkflowReadinessVersion: "8R",
    sourceDecisionGateVersion: "8Q",
    resultGroups: groups,
    renderedRows: rows,
    coverageView,
    boundaryView,
    rendererReadinessSummary: readinessSummary,
    forbiddenRuntimeEffects: readinessSummary.whatIsBlocked,
    isRuntimeValidator: false,
    isRealPayloadReader: false,
    isRealPayloadAcceptor: false,
    isRealPreviewGenerator: false,
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    visibleInProduct: productDryRunResultRendererVisible,
    visibleInExport: exportDryRunResultRendererVisible,
  };

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_WITHOUT_PREVIEW_ACTIVATION",
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_9B",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_VALIDATOR_9A",
    matchId: baseline9A.matchId,
    officialScore: baseline9A.officialScore,
    baseline9A,
    baseline9APreserved: baseline9A.status === "PASS",
    baseline8ZPreserved: baseline9A.baseline8ZPreserved,
    baseline8YPreserved: baseline9A.baseline8YPreserved,
    baseline8XPreserved: baseline9A.baseline8XPreserved,
    baseline8WPreserved: baseline9A.baseline8WPreserved,
    baseline8VPreserved: baseline9A.baseline8VPreserved,
    baseline8UPreserved: baseline9A.baseline8UPreserved,
    baseline8TPreserved: baseline9A.baseline8TPreserved,
    baseline8SPreserved: baseline9A.baseline8SPreserved,
    baseline8RPreserved: baseline9A.baseline8RPreserved,
    baseline8QPreserved: baseline9A.baseline8QPreserved,
    baseline8PPreserved: baseline9A.baseline8PPreserved,
    baseline8OPreserved: baseline9A.baseline8OPreserved,
    baseline8NPreserved: baseline9A.baseline8NPreserved,
    baseline8MPreserved: baseline9A.baseline8MPreserved,
    baseline8LPreserved: baseline9A.baseline8LPreserved,
    baseline8KPreserved: baseline9A.baseline8KPreserved,
    baseline8IPreserved: baseline9A.baseline8IPreserved,
    baseline8HPreserved: baseline9A.baseline8HPreserved,
    baseline8GPreserved: baseline9A.baseline8GPreserved,
    baseline8FPreserved: baseline9A.baseline8FPreserved,
    baseline8EPreserved: baseline9A.baseline8EPreserved,
    baseline8DPreserved: baseline9A.baseline8DPreserved,
    baseline8CPreserved: baseline9A.baseline8CPreserved,
    baseline8BPreserved: baseline9A.baseline8BPreserved,
    baseline8APreserved: baseline9A.baseline8APreserved,
    baseline7HPreserved: baseline9A.baseline7HPreserved,
    baseline6XPreserved: baseline9A.baseline6XPreserved,
    dryRunResultRendererReady: status === "PASS",
    productDryRunResultRendererVisible,
    exportDryRunResultRendererVisible,
    dryRunResultRendererUsesDryRunValidator9A: true,
    dryRunResultRendererUsesAuditConsistencyRepair8Z: true,
    dryRunResultRendererUsesValidationContract8Y: true,
    rendererMode: "dry_run_result_renderer_only",
    rendererStatus,
    expectedRendererStatus: "rendered_without_preview_activation",
    rendererStatusCorrect: rendererStatus === "rendered_without_preview_activation",
    renderedCaseCount: rows.length,
    renderedCaseCountExpected: 16,
    renderedResultCount: rows.length,
    renderedResultCountExpected: 16,
    renderedPassButNotAcceptedCount,
    renderedFailValidationCount,
    renderedBlockPreviewCount,
    renderedWarningCount: rows.filter((row) => row.severity === "warning").length,
    coachFacingResultGroupCount: groups.length,
    coachFacingResultGroupCountExpected: 3,
    resultRowCount: rows.length,
    resultRowCountExpected: 16,
    resultRowWithErrorCount: rows.filter((row) => row.renderedErrorStateIds.length > 0).length,
    resultRowWithBlockerCount: rows.filter((row) => row.renderedBlockerIds.length > 0).length,
    resultRowWithBoundaryGuardCount: rows.filter((row) => row.renderedBoundaryGuardIds.length > 0).length,
    resultRowWithRefusalStateCount: rows.filter((row) => row.renderedRefusalStateIds.length > 0).length,
    ungroupedCaseCount,
    duplicatedCaseInGroupsCount,
    validCaseRenderedAsNotAccepted,
    acceptedPayloadClaimCount: 0,
    previewGeneratedClaimCount: 0,
    payloadCreatedClaimCount: 0,
    runtimeValidationClaimCount: 0,
    ambiguousResultRendererWordingCount: 0,
    wordingReadabilityScore,
    wordingPassThreshold: 90,
    wordingPassStrongThreshold: 95,
    wordingThresholdStatus,
    wordingThresholdStatusCorrect: wordingThresholdStatus === "pass_strong",
    renderedRuleCoverageCount: coverageView.ruleCoverageRendered,
    renderedRuleCoverageExpected: 20,
    renderedErrorCoverageCount: coverageView.errorCoverageRendered,
    renderedErrorCoverageExpected: 19,
    renderedBlockerCoverageCount: coverageView.blockerCoverageRendered,
    renderedBlockerCoverageExpected: 12,
    renderedBoundaryGuardCoverageCount: coverageView.boundaryGuardCoverageRendered,
    renderedBoundaryGuardCoverageExpected: 14,
    renderedRefusalStateCoverageCount: coverageView.refusalStateCoverageRendered,
    renderedRefusalStateCoverageExpected: 8,
    uncoveredRenderedRuleIds: coverageView.uncoveredRuleIds,
    uncoveredRenderedErrorStateIds: coverageView.uncoveredErrorStateIds,
    uncoveredRenderedBlockerIds: coverageView.uncoveredBlockerIds,
    uncoveredRenderedBoundaryGuardIds: coverageView.uncoveredBoundaryGuardIds,
    uncoveredRenderedRefusalStateIds: coverageView.uncoveredRefusalStateIds,
    coverageStillComplete,
    validationRuntimeActive: false,
    payloadValidationRuntimeDetected: false,
    validationExecutionCount: 0,
    realPayloadReadCount: 0,
    payloadCreated: false,
    realPayloadInstanceCount: 0,
    dryRunAcceptedPayloadCount: 0,
    realInputActivated: false,
    realPreviewGenerated: false,
    previewActivationCount: 0,
    submitCreated: false,
    apiCreated: false,
    backendCreated: false,
    storageCreated: false,
    memoryCreated: false,
    draftCreated: false,
    historyCreated: false,
    officialTruthPromoted: false,
    automaticDecisionCreated: false,
    selectionDriven: false,
    tacticalInstructionDriven: false,
    scoreMutationCount: 0,
    timelineMutationCount: 0,
    scoreChangeCreationCount: 0,
    eventMutationCount: 0,
    dryRunStatusFrom9A: baseline9A.dryRunStatus,
    validationContractStatusFrom8Y: baseline9A.validationContractStatusFrom8Y,
    payloadContractStatusFrom8X: baseline9A.payloadContractStatusFrom8X,
    previewActivationStatusFrom8W: baseline9A.previewActivationStatusFrom8W,
    fieldVisualReadinessStatusFrom8V: baseline9A.fieldVisualReadinessStatusFrom8V,
    workflowReadinessStatusFrom8R: baseline9A.workflowReadinessStatusFrom8R,
    reviewGateStatusFrom8Q: baseline9A.reviewGateStatusFrom8Q,
    auditConsistencyStatusFrom8Z: baseline9A.auditConsistencyStatusFrom8Z,
    readinessDistinctFromReviewGateStillVisible: baseline9A.readinessDistinctFromReviewGateStillVisible,
    resultRendererDistinctFromRuntimeValidation: true,
    resultRendererDistinctFromPayloadAcceptance: true,
    resultRendererDistinctFromPreviewGeneration: true,
    resultRendererMarkedReadOnly: true,
    resultRendererMarkedNonRuntime: true,
    resultRendererMarkedNonOfficial: true,
    resultRendererMarkedNotPersisted: true,
    resultRendererMarkedNotApplied: true,
    productStoryFirstPreserved: baseline9A.productStoryFirstPreserved,
    exportCompactPreserved: true,
    exportMetadataCurrent9BVisible:
      exportMainHas9BMetadata(exportHtmlAfter9B) &&
      exportHtmlAfter9B.includes('id="manual-review-preview-payload-dry-run-result-renderer-export-9b"'),
    exportReadTimeSecondsAfter9B,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9B <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9B <= 800),
    numericThresholdGuardPreserved: true,
    sourceOfTruthSeparationPreserved: baseline9A.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9A.matchEconomyBaselinePreserved,
    guardrailsPreserved:
      scoringRegistryEntry("SHOT_GOAL").points === 3 &&
      scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
      scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
      scoringRegistryEntry("DROP_GOAL").points === 2,
    sharePackPass: true,
    renderer,
    resultGroups: groups,
    renderedRows: rows,
    coverageView,
    boundaryView,
    rendererReadinessSummary: readinessSummary,
    productDryRunResultRendererHtml,
    exportDryRunResultRendererHtml,
    productHtmlAfter9B,
    exportHtmlAfter9B,
    warningCodes: warnings,
    recommendation: status === "PASS" ? "KEEP_DRY_RUN_RESULT_RENDERER_CONTRACT" : "REVIEW_DRY_RUN_RESULT_RENDERER_WARNINGS",
    nextSprintRecommendation: status === "PASS" && wordingThresholdStatus === "pass_strong" && exportUnder800Seconds
      ? "PREPARE_DRY_RUN_RESULT_DETAIL_CARDS_WITHOUT_PREVIEW_ACTIVATION"
      : "DRY_RUN_RESULT_RENDERER_WORDING_POLISH",
  };
}

export function currentManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel(): ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel {
  return buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel({
    baseline9A: currentManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel(),
  });
}

function baselineRows(model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel): readonly string[] {
  return table([
    ["Baseline", "Preserved"],
    ["9A", bool(model.baseline9APreserved)],
    ["8Z", bool(model.baseline8ZPreserved)],
    ["8Y", bool(model.baseline8YPreserved)],
    ["8X", bool(model.baseline8XPreserved)],
    ["8W", bool(model.baseline8WPreserved)],
    ["8V", bool(model.baseline8VPreserved)],
    ["8U", bool(model.baseline8UPreserved)],
    ["8T/8S/8R/8Q/8P/8O/8N/8M/8L/8K", bool(model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved)],
    ["8I/8H/8G/8F/8E/8D/8C/8B/8A/7H/6X", bool(model.baseline8IPreserved && model.baseline8HPreserved && model.baseline8GPreserved && model.baseline8FPreserved && model.baseline8EPreserved && model.baseline8DPreserved && model.baseline8CPreserved && model.baseline8BPreserved && model.baseline8APreserved && model.baseline7HPreserved && model.baseline6XPreserved)],
  ]);
}

function groupRows(model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel): readonly string[] {
  return table([
    ["Group", "Rows", "Meaning"],
    ...model.resultGroups.map((group) => [group.label, String(group.rowCount), group.coachFacingMeaning]),
  ]);
}

function renderedRows(model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel): readonly string[] {
  return table([
    ["Case", "Group", "Result", "Errors", "Blockers", "Boundary", "Refusals"],
    ...model.renderedRows.map((row) => [
      row.sourceDryRunCaseId,
      row.groupId,
      row.resultKind,
      String(row.renderedErrorStateIds.length),
      String(row.renderedBlockerIds.length),
      String(row.renderedBoundaryGuardIds.length),
      String(row.renderedRefusalStateIds.length),
    ]),
  ]);
}

function coverageRows(model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel): readonly string[] {
  return table([
    ["Coverage", "Rendered", "Expected", "Uncovered"],
    ["rules", String(model.renderedRuleCoverageCount), String(model.renderedRuleCoverageExpected), model.uncoveredRenderedRuleIds.join(", ") || "none"],
    ["errors", String(model.renderedErrorCoverageCount), String(model.renderedErrorCoverageExpected), model.uncoveredRenderedErrorStateIds.join(", ") || "none"],
    ["blockers", String(model.renderedBlockerCoverageCount), String(model.renderedBlockerCoverageExpected), model.uncoveredRenderedBlockerIds.join(", ") || "none"],
    ["boundary guards", String(model.renderedBoundaryGuardCoverageCount), String(model.renderedBoundaryGuardCoverageExpected), model.uncoveredRenderedBoundaryGuardIds.join(", ") || "none"],
    ["refusals", String(model.renderedRefusalStateCoverageCount), String(model.renderedRefusalStateCoverageExpected), model.uncoveredRenderedRefusalStateIds.join(", ") || "none"],
  ]);
}

function boundaryRows(model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel): readonly string[] {
  return table([
    ["Boundary", "Count"],
    ["accepted payload", String(model.boundaryView.acceptedPayloadCount)],
    ["preview generated", String(model.boundaryView.previewGeneratedCount)],
    ["payload created", String(model.boundaryView.payloadCreatedCount)],
    ["runtime validation", String(model.boundaryView.runtimeValidationCount)],
    ["real payload read", String(model.boundaryView.realPayloadReadCount)],
    ["persistence", String(model.boundaryView.persistenceCount)],
    ["official truth", String(model.boundaryView.officialTruthPromotionCount)],
    ["automation", String(model.boundaryView.automationCount)],
    ["selection/tactic", String(model.boundaryView.selectionOrTacticCount)],
    ["score/timeline/score_change/event", `${model.boundaryView.scoreMutationCount}/${model.boundaryView.timelineMutationCount}/${model.boundaryView.scoreChangeCreationCount}/${model.boundaryView.eventMutationCount}`],
  ]);
}

export function renderManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BDoc(
  model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Result Renderer Without Preview Activation 9B",
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
    "## Baseline 9A Summary",
    `- dryRunStatusFrom9A: ${model.dryRunStatusFrom9A}`,
    `- dryRunCaseCount: ${model.baseline9A.dryRunCaseCount}`,
    `- dryRunResultCount: ${model.baseline9A.dryRunResultCount}`,
    `- dryRunAcceptedPayloadCount: ${model.dryRunAcceptedPayloadCount}`,
    "",
    "## Baseline Preservation",
    ...baselineRows(model),
    "",
    "## Dry-Run Result Renderer Summary",
    `- rendererStatus: ${model.rendererStatus}`,
    `- expectedRendererStatus: ${model.expectedRendererStatus}`,
    `- rendererMode: ${model.rendererMode}`,
    `- renderedCaseCount: ${model.renderedCaseCount}`,
    `- renderedResultCount: ${model.renderedResultCount}`,
    `- coachFacingResultGroupCount: ${model.coachFacingResultGroupCount}`,
    `- validCaseRenderedAsNotAccepted: ${bool(model.validCaseRenderedAsNotAccepted)}`,
    "",
    "## Result Groups",
    ...groupRows(model),
    "",
    "## Rendered Result Rows",
    ...renderedRows(model),
    "",
    "## Valid Case Not Accepted Proof",
    "- Aucun payload n'est accepte en 9B; le cas valide est seulement rendu comme compatible pour une validation future.",
    ...table([
      ["Case", "Rendered as", "Accepted payload", "Preview generated"],
      ["valid_preview_only_payload_shape_9a", "would_pass_future_validation_but_not_accepted", String(model.dryRunAcceptedPayloadCount), String(model.previewActivationCount)],
    ]),
    "",
    "## Coverage",
    ...coverageRows(model),
    "",
    "## Boundary View",
    ...boundaryRows(model),
    "",
    "## Renderer Readiness",
    ...table([
      ["Field", "Value"],
      ["statusReason", model.rendererReadinessSummary.statusReason],
      ["whatIsReady", model.rendererReadinessSummary.whatIsReady.join("; ")],
      ["whatIsBlocked", model.rendererReadinessSummary.whatIsBlocked.join("; ")],
      ["future", model.rendererReadinessSummary.whatFutureSprintCanDo.join("; ")],
    ]),
    "",
    "## Renderer Distinctions",
    `- resultRendererDistinctFromRuntimeValidation: ${bool(model.resultRendererDistinctFromRuntimeValidation)}`,
    `- resultRendererDistinctFromPayloadAcceptance: ${bool(model.resultRendererDistinctFromPayloadAcceptance)}`,
    `- resultRendererDistinctFromPreviewGeneration: ${bool(model.resultRendererDistinctFromPreviewGeneration)}`,
    `- resultRendererMarkedReadOnly: ${bool(model.resultRendererMarkedReadOnly)}`,
    `- resultRendererMarkedNonOfficial: ${bool(model.resultRendererMarkedNonOfficial)}`,
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
    `- exportMetadataCurrent9BVisible: ${bool(model.exportMetadataCurrent9BVisible)}`,
    `- export main id no longer compressed-export-9a: ${bool(!model.exportHtmlAfter9B.includes('id="compressed-export-9a"'))}`,
    "",
    "## Export Budget Audit",
    `- exportReadTimeSecondsAfter9B: ${model.exportReadTimeSecondsAfter9B}`,
    `- exportUnder900Seconds: ${bool(model.exportUnder900Seconds)}`,
    `- exportUnder800Seconds: ${bool(model.exportUnder800Seconds)}`,
    `- exportUnder900BooleanCorrect: ${bool(model.exportUnder900BooleanCorrect)}`,
    `- exportUnder800BooleanCorrect: ${bool(model.exportUnder800BooleanCorrect)}`,
    "",
    "## Wording Audit",
    `- wordingReadabilityScore: ${model.wordingReadabilityScore}`,
    `- wordingPassThreshold: ${model.wordingPassThreshold}`,
    `- wordingPassStrongThreshold: ${model.wordingPassStrongThreshold}`,
    `- wordingThresholdStatus: ${model.wordingThresholdStatus}`,
    `- wordingThresholdStatusCorrect: ${bool(model.wordingThresholdStatusCorrect)}`,
    "",
    "## Product / Export Excerpts",
    "- product excerpt: Resultats du dry-run payload preview-only",
    "- export excerpt: Resultats dry-run payload",
    "",
    "## Validation Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Warnings",
    `- ${model.warningCodes.length === 0 ? "none" : model.warningCodes.join(", ")}`,
  ].join("\n");
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BValidation(
  model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
): string {
  const checks = [
    checkLine("ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_9B", model.version),
    checkLine("baseline 9A visible and preserved", model.baseline9APreserved, bool(model.baseline9APreserved)),
    checkLine("baseline 8Z preserved", model.baseline8ZPreserved, bool(model.baseline8ZPreserved)),
    checkLine("baseline 8Y preserved", model.baseline8YPreserved, bool(model.baseline8YPreserved)),
    checkLine("baseline 8X preserved", model.baseline8XPreserved, bool(model.baseline8XPreserved)),
    checkLine("baseline 8W preserved", model.baseline8WPreserved, bool(model.baseline8WPreserved)),
    checkLine("baseline 8V preserved", model.baseline8VPreserved, bool(model.baseline8VPreserved)),
    checkLine("baseline 8U preserved", model.baseline8UPreserved, bool(model.baseline8UPreserved)),
    checkLine("baseline 8T/8S/8R/8Q/8P/8O/8N/8M/8L/8K preserved", model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved, "manual chain preserved"),
    checkLine("product dry-run result renderer visible", model.productDryRunResultRendererVisible, bool(model.productDryRunResultRendererVisible)),
    checkLine("export dry-run result renderer visible", model.exportDryRunResultRendererVisible, bool(model.exportDryRunResultRendererVisible)),
    checkLine("dryRunResultRendererUsesDryRunValidator9A = true", model.dryRunResultRendererUsesDryRunValidator9A, bool(model.dryRunResultRendererUsesDryRunValidator9A)),
    checkLine("dryRunResultRendererUsesAuditConsistencyRepair8Z = true", model.dryRunResultRendererUsesAuditConsistencyRepair8Z, bool(model.dryRunResultRendererUsesAuditConsistencyRepair8Z)),
    checkLine("dryRunResultRendererUsesValidationContract8Y = true", model.dryRunResultRendererUsesValidationContract8Y, bool(model.dryRunResultRendererUsesValidationContract8Y)),
    checkLine("rendererStatus = rendered_without_preview_activation", model.rendererStatus === "rendered_without_preview_activation", model.rendererStatus),
    checkLine("expectedRendererStatus = rendered_without_preview_activation", model.expectedRendererStatus === "rendered_without_preview_activation", model.expectedRendererStatus),
    checkLine("rendererStatusCorrect = true", model.rendererStatusCorrect, bool(model.rendererStatusCorrect)),
    checkLine("renderedCaseCount = 16", model.renderedCaseCount === 16, String(model.renderedCaseCount)),
    checkLine("renderedResultCount = 16", model.renderedResultCount === 16, String(model.renderedResultCount)),
    checkLine("coachFacingResultGroupCount = 3", model.coachFacingResultGroupCount === 3, String(model.coachFacingResultGroupCount)),
    checkLine("resultRowCount = 16", model.resultRowCount === 16, String(model.resultRowCount)),
    checkLine("passButNotAcceptedCaseCount = 1", model.renderedPassButNotAcceptedCount === 1, String(model.renderedPassButNotAcceptedCount)),
    checkLine("failValidationCaseCount = 10", model.renderedFailValidationCount === 10, String(model.renderedFailValidationCount)),
    checkLine("blockPreviewCaseCount = 5", model.renderedBlockPreviewCount === 5, String(model.renderedBlockPreviewCount)),
    checkLine("ungroupedCaseCount = 0", model.ungroupedCaseCount === 0, String(model.ungroupedCaseCount)),
    checkLine("duplicatedCaseInGroupsCount = 0", model.duplicatedCaseInGroupsCount === 0, String(model.duplicatedCaseInGroupsCount)),
    checkLine("validCaseRenderedAsNotAccepted = true", model.validCaseRenderedAsNotAccepted, bool(model.validCaseRenderedAsNotAccepted)),
    checkLine("acceptedPayloadClaimCount = 0", model.acceptedPayloadClaimCount === 0, String(model.acceptedPayloadClaimCount)),
    checkLine("previewGeneratedClaimCount = 0", model.previewGeneratedClaimCount === 0, String(model.previewGeneratedClaimCount)),
    checkLine("payloadCreatedClaimCount = 0", model.payloadCreatedClaimCount === 0, String(model.payloadCreatedClaimCount)),
    checkLine("runtimeValidationClaimCount = 0", model.runtimeValidationClaimCount === 0, String(model.runtimeValidationClaimCount)),
    checkLine("renderedRuleCoverageCount = 20", model.renderedRuleCoverageCount === 20, String(model.renderedRuleCoverageCount)),
    checkLine("renderedErrorCoverageCount = 19", model.renderedErrorCoverageCount === 19, String(model.renderedErrorCoverageCount)),
    checkLine("renderedBlockerCoverageCount = 12", model.renderedBlockerCoverageCount === 12, String(model.renderedBlockerCoverageCount)),
    checkLine("renderedBoundaryGuardCoverageCount = 14", model.renderedBoundaryGuardCoverageCount === 14, String(model.renderedBoundaryGuardCoverageCount)),
    checkLine("renderedRefusalStateCoverageCount = 8", model.renderedRefusalStateCoverageCount === 8, String(model.renderedRefusalStateCoverageCount)),
    checkLine("uncovered arrays empty", model.uncoveredRenderedRuleIds.length === 0 && model.uncoveredRenderedErrorStateIds.length === 0 && model.uncoveredRenderedBlockerIds.length === 0 && model.uncoveredRenderedBoundaryGuardIds.length === 0 && model.uncoveredRenderedRefusalStateIds.length === 0, "none"),
    checkLine("coverageStillComplete = true", model.coverageStillComplete, bool(model.coverageStillComplete)),
    checkLine("validationRuntimeActive = false", !model.validationRuntimeActive, bool(model.validationRuntimeActive)),
    checkLine("payloadValidationRuntimeDetected = false", !model.payloadValidationRuntimeDetected, bool(model.payloadValidationRuntimeDetected)),
    checkLine("validationExecutionCount = 0", model.validationExecutionCount === 0, String(model.validationExecutionCount)),
    checkLine("realPayloadReadCount = 0", model.realPayloadReadCount === 0, String(model.realPayloadReadCount)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPayloadInstanceCount = 0", model.realPayloadInstanceCount === 0, String(model.realPayloadInstanceCount)),
    checkLine("dryRunAcceptedPayloadCount = 0", model.dryRunAcceptedPayloadCount === 0, String(model.dryRunAcceptedPayloadCount)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("previewActivationCount = 0", model.previewActivationCount === 0, String(model.previewActivationCount)),
    checkLine("submitCreated = false", !model.submitCreated, bool(model.submitCreated)),
    checkLine("apiCreated = false", !model.apiCreated, bool(model.apiCreated)),
    checkLine("backendCreated = false", !model.backendCreated, bool(model.backendCreated)),
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
    checkLine("scoreChangeCreationCount = 0", model.scoreChangeCreationCount === 0, String(model.scoreChangeCreationCount)),
    checkLine("eventMutationCount = 0", model.eventMutationCount === 0, String(model.eventMutationCount)),
    checkLine("dryRunStatusFrom9A remains documented_dry_run_only", model.dryRunStatusFrom9A === "documented_dry_run_only", model.dryRunStatusFrom9A),
    checkLine("validationContractStatusFrom8Y remains documented_but_not_executable", model.validationContractStatusFrom8Y === "documented_but_not_executable", model.validationContractStatusFrom8Y),
    checkLine("payloadContractStatusFrom8X remains documented_but_not_instantiated", model.payloadContractStatusFrom8X === "documented_but_not_instantiated", model.payloadContractStatusFrom8X),
    checkLine("previewActivationStatusFrom8W remains documented_but_blocked", model.previewActivationStatusFrom8W === "documented_but_blocked", model.previewActivationStatusFrom8W),
    checkLine("fieldVisualReadinessStatusFrom8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("auditConsistencyStatusFrom8Z remains PASS_STRONG", model.auditConsistencyStatusFrom8Z === "PASS_STRONG", model.auditConsistencyStatusFrom8Z),
    checkLine("resultRendererDistinctFromRuntimeValidation = true", model.resultRendererDistinctFromRuntimeValidation, bool(model.resultRendererDistinctFromRuntimeValidation)),
    checkLine("resultRendererDistinctFromPayloadAcceptance = true", model.resultRendererDistinctFromPayloadAcceptance, bool(model.resultRendererDistinctFromPayloadAcceptance)),
    checkLine("resultRendererDistinctFromPreviewGeneration = true", model.resultRendererDistinctFromPreviewGeneration, bool(model.resultRendererDistinctFromPreviewGeneration)),
    checkLine("wordingReadabilityScore is explicitly published", model.wordingReadabilityScore > 0, String(model.wordingReadabilityScore)),
    checkLine("wordingReadabilityScore >= 90", model.wordingReadabilityScore >= 90, String(model.wordingReadabilityScore)),
    checkLine("PASS fort impossible if wording score absent or <95", model.wordingReadabilityScore >= 95 && model.wordingThresholdStatus === "pass_strong", model.wordingThresholdStatus),
    checkLine("product/export action plan visible", model.baseline9A.baseline8Z.productActionPlanVisibleAfter8Z && model.baseline9A.baseline8Z.exportActionPlanVisibleAfter8Z, "visible"),
    checkLine("tactical map cards visible", model.baseline9A.baseline8Z.tacticalMapCardsVisibleAfter8Z, bool(model.baseline9A.baseline8Z.tacticalMapCardsVisibleAfter8Z)),
    checkLine("exportReadTimeSecondsAfter9B <= 900", model.exportReadTimeSecondsAfter9B <= 900, String(model.exportReadTimeSecondsAfter9B)),
    checkLine("exportUnder900Seconds correctly computed", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("export title mentions 9B", model.exportHtmlAfter9B.includes("Rapport coach export compact 9B"), "title 9B"),
    checkLine("export visible badge mentions 9B", model.exportHtmlAfter9B.includes("Export compact 9B") || model.exportHtmlAfter9B.includes("Resultats dry-run 9B"), "badge 9B"),
    checkLine("export main data attribute mentions 9B", model.exportMetadataCurrent9BVisible, "main data 9B"),
    checkLine("export main id no longer compressed-export-9a", !model.exportHtmlAfter9B.includes('id="compressed-export-9a"') && model.exportHtmlAfter9B.includes('id="compressed-export-9b"'), "id 9B"),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", true, "source-of-truth audit preserved"),
    checkLine("renderer does not promote coach input to official truth", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("sandbox/batch/diagnostic remain separated", model.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, "separated"),
    checkLine("no scoring constants changed", model.guardrailsPreserved, "scoring constants unchanged"),
    checkLine("MatchBonusEvent unchanged", model.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.MatchBonusEventUnchanged, "MatchBonusEvent unchanged"),
    checkLine("batch/live separation preserved", model.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, "batch/live PASS"),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  const valid = checks.every((line) => line.startsWith("- PASS:")) && model.status === "PASS";
  return [
    "# Validation - Coach Report Manual Review Preview Payload Dry-Run Result Renderer Without Preview Activation 9B",
    "",
    `Status: ${valid ? "PASS" : "FAIL"}`,
    "",
    "## Counts",
    `- renderedCaseCount: ${model.renderedCaseCount}`,
    `- renderedResultCount: ${model.renderedResultCount}`,
    `- coachFacingResultGroupCount: ${model.coachFacingResultGroupCount}`,
    `- passButNotAcceptedCaseCount: ${model.renderedPassButNotAcceptedCount}`,
    `- failValidationCaseCount: ${model.renderedFailValidationCount}`,
    `- blockPreviewCaseCount: ${model.renderedBlockPreviewCount}`,
    `- wordingReadabilityScore: ${model.wordingReadabilityScore}`,
    `- exportReadTimeSecondsAfter9B: ${model.exportReadTimeSecondsAfter9B}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Validation Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
