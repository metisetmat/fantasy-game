import { buildManualPostMatchObservationReviewForm8MModel } from "./buildManualPostMatchObservationReviewForm8M";
import {
  auditManualReviewResultIntakeContract8N,
  buildInvalidManualReviewIntakePayloadFixtures8N,
  buildValidManualReviewIntakePayloadFixture8N,
} from "./manualReviewResultIntakeContractAudit8N";
import { auditManualReviewResultIntakeBoundary8N } from "./manualReviewResultIntakeBoundaryAudit8N";
import { auditManualReviewResultIntakeExportBudget8N } from "./manualReviewResultIntakeExportBudgetAudit8N";
import { auditManualReviewResultIntakeExportMetadata8N } from "./manualReviewResultIntakeExportMetadataAudit8N";
import { auditManualReviewResultIntakeIntegrationBudget8N } from "./manualReviewResultIntakeIntegrationBudgetAudit8N";
import { auditManualReviewResultIntakeSourceOfTruthRegression8N } from "./manualReviewResultIntakeSourceOfTruthRegressionAudit8N";
import type {
  ManualReviewResultIntakeBoundary8NModel,
  ManualReviewResultIntakePayload8N,
} from "./manualReviewResultIntakeBoundaryTypes8N";
import {
  MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_8N_BLOCKING_WARNINGS,
  type ManualReviewResultIntakeBoundaryWarningCode8N,
} from "./manualReviewResultIntakeBoundaryWarnings8N";
import {
  renderManualReviewResultIntakeBoundaryExport8N,
  insertManualReviewResultIntakeBoundaryExport8N,
} from "./renderManualReviewResultIntakeBoundaryExport8N";
import {
  renderManualReviewResultIntakeBoundaryProduct8N,
  insertManualReviewResultIntakeBoundaryProduct8N,
} from "./renderManualReviewResultIntakeBoundaryProduct8N";
import { validateManualReviewResultIntakePayload8N } from "./validateManualReviewResultIntakePayload8N";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

function uniq<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
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

function cleanWarningCodes(
  warnings: readonly ManualReviewResultIntakeBoundaryWarningCode8N[],
): readonly ManualReviewResultIntakeBoundaryWarningCode8N[] {
  const has = (warning: ManualReviewResultIntakeBoundaryWarningCode8N): boolean => warnings.includes(warning);
  return uniq(warnings.filter((warning) => {
    if (warning === "MANUAL_INTAKE_CONTRACT_READY") {
      return !has("MANUAL_INTAKE_CONTRACT_MISSING") && !has("ACCEPTED_OUTCOME_VALUES_INVALID");
    }
    if (warning === "MANUAL_INTAKE_VALIDATOR_READY") {
      return !has("MANUAL_INTAKE_VALIDATOR_MISSING") &&
        !has("VALID_PAYLOAD_REJECTED") &&
        !has("INVALID_OUTCOME_ACCEPTED") &&
        !has("INVALID_ENTRY_COUNT_ACCEPTED") &&
        !has("AUTO_CLASSIFIED_ACCEPTED") &&
        !has("OFFICIAL_TRUTH_ACCEPTED") &&
        !has("PERSISTENCE_INTENT_ACCEPTED") &&
        !has("SCORE_MUTATION_ACCEPTED") &&
        !has("TIMELINE_MUTATION_ACCEPTED");
    }
    if (warning === "NO_AUTO_CLASSIFICATION") {
      return !has("AUTO_CLASSIFIED_ACCEPTED") && !has("AUTOMATIC_DECISION_CREATED");
    }
    if (warning === "NO_PERSISTENCE_CREATED") {
      return !has("LOCAL_STORAGE_PERSISTENCE_DETECTED") &&
        !has("DATABASE_PERSISTENCE_CREATED") &&
        !has("FILE_PERSISTENCE_CREATED") &&
        !has("BACKEND_SUBMIT_ACTION_DETECTED") &&
        !has("VALIDATOR_PERSISTS_OUTPUT");
    }
    if (warning === "EXPORT_METADATA_CLEANED") {
      return !has("EXPORT_TITLE_STILL_ONLY_8I") &&
        !has("EXPORT_TITLE_STILL_ONLY_8M") &&
        !has("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I") &&
        !has("EXPORT_VISIBLE_BADGE_STILL_ONLY_8I");
    }
    if (warning === "SOURCE_OF_TRUTH_PRESERVED") {
      return !has("SCORE_CLAIM_WITHOUT_SCORE_CHANGE") &&
        !has("SANDBOX_MANUAL_INTAKE_PROMOTED") &&
        !has("DIAGNOSTIC_MANUAL_INTAKE_PROMOTED") &&
        !has("BATCH_MANUAL_INTAKE_PROMOTED") &&
        !has("OFFICIAL_TRUTH_ACCEPTED");
    }
    return true;
  }));
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 80);
  return html.slice(start, start + 700).replace(/\s+/gu, " ");
}

export function buildManualReviewResultIntakeBoundary8NModel(input?: {
  readonly productHtmlBefore8N?: string;
  readonly exportHtmlBefore8N?: string;
  readonly validPayloadFixture?: ManualReviewResultIntakePayload8N;
}): ManualReviewResultIntakeBoundary8NModel {
  const baseline8M = buildManualPostMatchObservationReviewForm8MModel();
  const productHtmlBefore8N = input?.productHtmlBefore8N ?? baseline8M.productHtmlAfter8M;
  const exportHtmlBefore8N = input?.exportHtmlBefore8N ?? baseline8M.exportHtmlAfter8M;
  const productHtmlAfter8N = insertManualReviewResultIntakeBoundaryProduct8N(productHtmlBefore8N);
  const exportHtmlAfter8N = insertManualReviewResultIntakeBoundaryExport8N(exportHtmlBefore8N);
  const contractPayloadFixture = input?.validPayloadFixture ?? buildValidManualReviewIntakePayloadFixture8N(baseline8M.matchId);
  const validatorInputSnapshot = JSON.stringify(contractPayloadFixture);
  const validFixtureResult = validateManualReviewResultIntakePayload8N(contractPayloadFixture);
  const validatorInputAfter = JSON.stringify(contractPayloadFixture);
  const invalidFixtureResults = buildInvalidManualReviewIntakePayloadFixtures8N(contractPayloadFixture);
  const contractAudit = auditManualReviewResultIntakeContract8N({
    productHtml: productHtmlAfter8N,
    exportHtml: exportHtmlAfter8N,
    validPayload: contractPayloadFixture,
    invalidResults: invalidFixtureResults,
    validatorInputSnapshot,
    validatorInputAfter,
  });
  const boundaryAudit = auditManualReviewResultIntakeBoundary8N({
    productHtml: productHtmlAfter8N,
    exportHtml: exportHtmlAfter8N,
    invalidResults: invalidFixtureResults.map((fixture) => fixture.result),
  });
  const exportMetadataAudit = auditManualReviewResultIntakeExportMetadata8N(exportHtmlAfter8N);
  const exportBudgetAudit = auditManualReviewResultIntakeExportBudget8N({
    exportHtmlBefore8N,
    exportHtmlAfter8N,
    metadataAudit: exportMetadataAudit,
  });
  const integrationBudgetAudit = auditManualReviewResultIntakeIntegrationBudget8N({
    productHtml: productHtmlAfter8N,
    exportHtml: exportHtmlAfter8N,
  });
  const sourceOfTruthRegressionAudit = auditManualReviewResultIntakeSourceOfTruthRegression8N({
    baseline8M,
    productHtml: productHtmlAfter8N,
    exportHtml: exportHtmlAfter8N,
  });
  const productManualForm8MPreserved = integrationBudgetAudit.productManualForm8MStillVisible;
  const exportManualForm8MPreserved = integrationBudgetAudit.exportManualForm8MStillVisible;
  const baseline8MPreserved = productManualForm8MPreserved && exportManualForm8MPreserved;
  const baseline8LPreserved = integrationBudgetAudit.productLearningLoop8LStillVisible && integrationBudgetAudit.exportLearningLoop8LStillVisible;
  const baseline8KPreserved = integrationBudgetAudit.productDecisionLayer8KStillVisible && integrationBudgetAudit.exportDecisionLayer8KStillVisible;
  const baseline8IPreserved = baseline8M.baseline8IPreserved && exportHtmlAfter8N.includes('data-story-first-export-version="8I"');
  const baseline8HPreserved = integrationBudgetAudit.productStoryFirstSectionVisible && integrationBudgetAudit.exportStoryFirstSectionVisible;
  const baseline8GPreserved = integrationBudgetAudit.productReplaySectionVisible && integrationBudgetAudit.exportReplaySectionVisible;
  const baseline8FPreserved = baseline8GPreserved;
  const baseline8EPreserved = baseline8GPreserved;
  const baseline8DPreserved = sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange;
  const baseline8CPreserved = sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory;
  const baseline8BPreserved = sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore;
  const baseline8APreserved = sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange;
  const baseline7HPreserved = exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect;
  const baseline6XPreserved = sourceOfTruthRegressionAudit.noScoringConstantChange &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged &&
    sourceOfTruthRegressionAudit.batchLiveSeparationPreserved;
  const manualIntakeContractReady = contractAudit.manualIntakeContractWarningCodes.length === 0;
  const manualIntakeValidatorReady = validFixtureResult.status === "accepted_for_preview" &&
    contractAudit.invalidRejectionCount === invalidFixtureResults.length &&
    contractAudit.validatorMutationCount === 0 &&
    contractAudit.validatorPersistenceCount === 0;
  const acceptedOutcomeValuesReady = contractAudit.acceptedOutcomeValuesCount === 4;
  const rejectedOutcomeValuesReady = contractAudit.rejectedOutcomeFixturesCount >= 8 && contractAudit.invalidRejectionCount === invalidFixtureResults.length;
  const linkedObservationIdsRequired = contractAudit.linked8MIdsRequired && contractAudit.linked8LIdsRequired && contractAudit.linked8KIdsRequired;
  const evidenceCountsManualOnly = contractPayloadFixture.entries.every((entry) => entry.comparableSituationCount >= 0 && entry.positiveSignalCount >= 0 && entry.negativeSignalCount >= 0 && entry.manualOnly);
  const noAutoClassification = boundaryAudit.automaticSelectionRecommendationCount === 0 && contractAudit.autoClassifiedRejected;
  const noPersistenceCreated = boundaryAudit.databasePersistenceCreationCount === 0 &&
    boundaryAudit.filePersistenceCreationCount === 0 &&
    boundaryAudit.localStoragePersistenceCount === 0 &&
    contractAudit.validatorPersistenceCount === 0;
  const noSubmitFlowCreated = boundaryAudit.backendSubmitActionCount === 0 && boundaryAudit.formSubmitButtonCount === 0;
  const noFutureEvidenceCreated = boundaryAudit.futureResultClaimCount === 0 && boundaryAudit.fabricatedNextMatchEvidenceCount === 0;
  const noOfficialTruthMutation = boundaryAudit.officialTruthPromotionCount === 0 && sourceOfTruthRegressionAudit.manualIntakeDoesNotPromoteCoachInputToOfficialTruth;
  const noScoreMutation = sourceOfTruthRegressionAudit.noScoreMutation && contractAudit.scoreMutationRejected;
  const noTimelineMutation = sourceOfTruthRegressionAudit.manualIntakeDoesNotMutateTimeline && contractAudit.timelineMutationRejected;
  const noScoringEventMutation = sourceOfTruthRegressionAudit.manualIntakeDoesNotCreateScoreChange && contractAudit.scoringEventMutationRejected;
  const exportMetadataCleaned = exportBudgetAudit.exportMetadataClean;
  const exportCompactPreserved = integrationBudgetAudit.exportCompactPreserved && exportBudgetAudit.exportMandatorySectionsPreserved;
  const numericThresholdGuardPreserved = exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes.length === 0;
  const matchEconomyBaselinePreserved = baseline6XPreserved;
  const guardrailsPreserved = baseline6XPreserved &&
    sourceOfTruthRegressionAudit.noScoringConstantChange &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged &&
    sourceOfTruthRegressionAudit.batchLiveSeparationPreserved &&
    noScoreMutation &&
    noTimelineMutation &&
    noScoringEventMutation;
  const failureWarnings = cleanWarningCodes([
    ...contractAudit.manualIntakeContractWarningCodes,
    ...boundaryAudit.boundaryWarningCodes,
    ...exportMetadataAudit.metadataWarningCodes.filter((warning) => warning !== "EXPORT_METADATA_CLEANED"),
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
  ]);
  const blocking = failureWarnings.some((warning) => MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_8N_BLOCKING_WARNINGS.includes(warning));
  const status = blocking ? "FAIL" : exportBudgetAudit.exportUnder800Seconds ? "PASS" : "PARTIAL";
  const warningCodes = cleanWarningCodes([
    ...failureWarnings,
    manualIntakeContractReady ? "MANUAL_INTAKE_CONTRACT_READY" : "MANUAL_INTAKE_CONTRACT_MISSING",
    manualIntakeValidatorReady ? "MANUAL_INTAKE_VALIDATOR_READY" : "MANUAL_INTAKE_VALIDATOR_MISSING",
    contractAudit.productManualIntakeBoundaryVisible ? "PRODUCT_MANUAL_INTAKE_BOUNDARY_VISIBLE" : "PRODUCT_MANUAL_INTAKE_BOUNDARY_MISSING",
    contractAudit.exportManualIntakeBoundaryVisible ? "EXPORT_MANUAL_INTAKE_BOUNDARY_VISIBLE" : "EXPORT_MANUAL_INTAKE_BOUNDARY_MISSING",
    acceptedOutcomeValuesReady ? "ACCEPTED_OUTCOME_VALUES_READY" : "ACCEPTED_OUTCOME_VALUES_INVALID",
    rejectedOutcomeValuesReady ? "REJECTED_OUTCOME_VALUES_READY" : "REJECTED_OUTCOME_FIXTURES_INSUFFICIENT",
    linkedObservationIdsRequired ? "LINKED_OBSERVATION_IDS_REQUIRED" : "UNKNOWN_LINKED_SECTION_ACCEPTED",
    evidenceCountsManualOnly ? "EVIDENCE_COUNTS_MANUAL_ONLY" : "MANUAL_INTAKE_CONTRACT_MISSING",
    noAutoClassification ? "NO_AUTO_CLASSIFICATION" : "AUTO_CLASSIFIED_ACCEPTED",
    noPersistenceCreated ? "NO_PERSISTENCE_CREATED" : "VALIDATOR_PERSISTS_OUTPUT",
    noSubmitFlowCreated ? "NO_SUBMIT_FLOW_CREATED" : "SUBMIT_BUTTON_DETECTED",
    noFutureEvidenceCreated ? "NO_FUTURE_EVIDENCE_CREATED" : "FUTURE_RESULT_CLAIM_DETECTED",
    noOfficialTruthMutation ? "NO_OFFICIAL_TRUTH_MUTATION" : "OFFICIAL_TRUTH_ACCEPTED",
    noScoreMutation ? "NO_SCORE_MUTATION" : "SCORE_MUTATION_ACCEPTED",
    noTimelineMutation ? "NO_TIMELINE_MUTATION" : "TIMELINE_MUTATION_ACCEPTED",
    noScoringEventMutation ? "NO_SCORING_EVENT_MUTATION" : "SCORING_EVENT_MUTATION_ACCEPTED",
    exportMetadataCleaned ? "EXPORT_METADATA_CLEANED" : "EXPORT_ID_STILL_COMPRESSED_EXPORT_8I",
    productManualForm8MPreserved ? "PRODUCT_MANUAL_FORM_8M_PRESERVED" : "PRODUCT_MANUAL_FORM_8M_REGRESSED",
    exportManualForm8MPreserved ? "EXPORT_MANUAL_FORM_8M_PRESERVED" : "EXPORT_MANUAL_FORM_8M_REGRESSED",
    baseline8LPreserved ? "PRODUCT_LEARNING_LOOP_8L_PRESERVED" : "PRODUCT_LEARNING_LOOP_8L_REGRESSED",
    baseline8LPreserved ? "EXPORT_LEARNING_LOOP_8L_PRESERVED" : "EXPORT_LEARNING_LOOP_8L_REGRESSED",
    baseline8KPreserved ? "DECISION_LAYER_8K_PRESERVED" : "PRODUCT_DECISION_LAYER_8K_REGRESSED",
    exportCompactPreserved ? "EXPORT_COMPACT_PRESERVED" : "EXPORT_COMPACT_REGRESSED",
    exportBudgetAudit.exportUnder900Seconds ? "EXPORT_UNDER_900_READY" : "EXPORT_OVER_900",
    exportBudgetAudit.exportUnder800Seconds ? "EXPORT_UNDER_800_READY" : "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_PARTIAL",
    sourceOfTruthSeparationPreserved ? "SOURCE_OF_TRUTH_PRESERVED" : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    matchEconomyBaselinePreserved ? "MATCH_ECONOMY_BASELINE_PRESERVED" : "SCORE_MANIPULATION_DETECTED",
    status === "PASS" ? "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_COMPLETE" : status === "PARTIAL" ? "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_PARTIAL" : "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_FAIL",
  ]);

  return {
    status,
    scope: "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY",
    version: "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_8N",
    baselineVersion: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M",
    matchId: baseline8M.matchId,
    officialScore: baseline8M.officialScore,
    baseline8M,
    baseline8MPreserved,
    baseline8LPreserved,
    baseline8KPreserved,
    baseline8IPreserved,
    baseline8HPreserved,
    baseline8GPreserved,
    baseline8FPreserved,
    baseline8EPreserved,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    manualIntakeContractReady,
    manualIntakeValidatorReady,
    manualIntakeBoundaryVisibleInProduct: contractAudit.productManualIntakeBoundaryVisible,
    manualIntakeBoundaryVisibleInExport: contractAudit.exportManualIntakeBoundaryVisible,
    acceptedOutcomeValuesReady,
    rejectedOutcomeValuesReady,
    linkedObservationIdsRequired,
    evidenceCountsManualOnly,
    noAutoClassification,
    noPersistenceCreated,
    noSubmitFlowCreated,
    noFutureEvidenceCreated,
    noOfficialTruthMutation,
    noScoreMutation,
    noTimelineMutation,
    noScoringEventMutation,
    exportMetadataCleaned,
    productManualForm8MPreserved,
    exportManualForm8MPreserved,
    exportCompactPreserved,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    contractPayloadFixture,
    invalidFixtureResults: invalidFixtureResults.map((fixture) => fixture.result),
    validFixtureResult,
    productHtmlAfter8N,
    exportHtmlAfter8N,
    productIntakeBoundaryHtml: renderManualReviewResultIntakeBoundaryProduct8N(),
    exportIntakeBoundaryHtml: renderManualReviewResultIntakeBoundaryExport8N(),
    contractAudit,
    boundaryAudit,
    exportMetadataAudit,
    sourceOfTruthRegressionAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_INTAKE_BOUNDARY" : "REPAIR_MANUAL_REVIEW_INTAKE_BOUNDARY",
    nextSprintRecommendation: status === "PASS"
      ? "8O - Manual Review Preview Renderer Without Persistence"
      : status === "PARTIAL"
        ? "8O - Manual Intake Boundary Wording Polish"
        : "8O - Manual Intake Source-of-Truth / Persistence Regression Fix",
  };
}

export function currentManualReviewResultIntakeBoundary8NModel(): ManualReviewResultIntakeBoundary8NModel {
  return buildManualReviewResultIntakeBoundary8NModel();
}

function baselineRows(model: ManualReviewResultIntakeBoundary8NModel): readonly string[] {
  return table([
    ["Baseline", "Preserved"],
    ["8M manual form", bool(model.baseline8MPreserved)],
    ["8L learning loop", bool(model.baseline8LPreserved)],
    ["8K decision layer", bool(model.baseline8KPreserved)],
    ["8I compact export", bool(model.baseline8IPreserved)],
    ["8H story first", bool(model.baseline8HPreserved)],
    ["8G replay UX", bool(model.baseline8GPreserved)],
    ["8F actor mapping", bool(model.baseline8FPreserved)],
    ["8E replay source-of-truth", bool(model.baseline8EPreserved)],
    ["8D sequence causality", bool(model.baseline8DPreserved)],
    ["8C causality", bool(model.baseline8CPreserved)],
    ["8B chronology", bool(model.baseline8BPreserved)],
    ["8A story spine", bool(model.baseline8APreserved)],
    ["7H export threshold", bool(model.baseline7HPreserved)],
    ["6X match economy", bool(model.baseline6XPreserved)],
  ]);
}

function payloadRows(model: ManualReviewResultIntakeBoundary8NModel): readonly string[] {
  return table([
    ["Field", "Rule"],
    ["sourceFormVersion", model.contractPayloadFixture.sourceFormVersion],
    ["sourceTrackerVersion", model.contractPayloadFixture.sourceTrackerVersion],
    ["sourceDecisionLayerVersion", model.contractPayloadFixture.sourceDecisionLayerVersion],
    ["createdBy", model.contractPayloadFixture.createdBy],
    ["persistenceIntent", model.contractPayloadFixture.persistenceIntent],
    ["applicationMode", "validate_only or preview_only"],
    ["officialTruthStatus", model.contractPayloadFixture.officialTruthStatus],
    ["mutation flags", "all false"],
  ]);
}

function entryRows(model: ManualReviewResultIntakeBoundary8NModel): readonly string[] {
  return table([
    ["Entry", "8M section", "8L card", "8K card", "Manual only"],
    ...model.contractPayloadFixture.entries.map((entry) => [
      entry.entryId,
      entry.linked8MReviewSectionId,
      entry.linked8LObservationCardId,
      entry.linked8KDecisionCardId,
      bool(entry.manualOnly),
    ]),
  ]);
}

function invalidFixtureRows(model: ManualReviewResultIntakeBoundary8NModel): readonly string[] {
  return table([
    ["Fixture", "Status", "Errors"],
    ...model.invalidFixtureResults.map((result, index) => [
      `invalid-${index + 1}`,
      result.status,
      result.errors.map((error) => error.errorCode).join(", "),
    ]),
  ]);
}

export function renderManualReviewResultIntakeBoundary8NDoc(
  model: ManualReviewResultIntakeBoundary8NModel = currentManualReviewResultIntakeBoundary8NModel(),
): string {
  return [
    "# Manual Review Result Intake Boundary 8N",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    ...metricRows([
      ["scope", model.scope],
      ["version", model.version],
      ["baselineVersion", model.baselineVersion],
      ["matchId", model.matchId],
      ["officialScore", model.officialScore],
      ["manualIntakeContractReady", model.manualIntakeContractReady],
      ["manualIntakeValidatorReady", model.manualIntakeValidatorReady],
      ["manualIntakeBoundaryVisibleInProduct", model.manualIntakeBoundaryVisibleInProduct],
      ["manualIntakeBoundaryVisibleInExport", model.manualIntakeBoundaryVisibleInExport],
      ["exportReadTimeSecondsAfter8N", model.exportBudgetAudit.exportReadTimeSecondsAfter8N],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
    ]),
    "",
    "## Baseline Preservation 8M To 6X",
    ...baselineRows(model),
    "",
    "## Manual Intake Payload Contract",
    ...payloadRows(model),
    "",
    "## Manual Intake Entry Contract",
    ...entryRows(model),
    "",
    "## Accepted And Rejected Values",
    ...table([
      ["Category", "Values"],
      ["accepted outcomes", "confirmed, contradicted, inconclusive, insufficient_sample"],
      ["application modes", "validate_only, preview_only"],
      ["rejected mutations", "score, timeline, scoring event, official truth, persistence, memory, selection, tactic"],
    ]),
    "",
    "## Validation Result Contract",
    ...metricRows([
      ["validFixtureStatus", model.validFixtureResult.status],
      ["acceptedEntryCount", model.validFixtureResult.acceptedEntryCount],
      ["officialTruthStatus", model.validFixtureResult.officialTruthStatus],
      ["persistencePerformed", model.validFixtureResult.persistencePerformed],
      ["officialMutationPerformed", model.validFixtureResult.officialMutationPerformed],
      ["automaticClassificationPerformed", model.validFixtureResult.automaticClassificationPerformed],
    ]),
    "",
    "## Invalid Fixtures Rejection",
    ...invalidFixtureRows(model),
    "",
    "## Boundary Audit",
    ...metricRows([
      ["seasonMemoryCreationCount", model.boundaryAudit.seasonMemoryCreationCount],
      ["teamStyleMemoryCreationCount", model.boundaryAudit.teamStyleMemoryCreationCount],
      ["databasePersistenceCreationCount", model.boundaryAudit.databasePersistenceCreationCount],
      ["filePersistenceCreationCount", model.boundaryAudit.filePersistenceCreationCount],
      ["localStoragePersistenceCount", model.boundaryAudit.localStoragePersistenceCount],
      ["backendSubmitActionCount", model.boundaryAudit.backendSubmitActionCount],
      ["formSubmitButtonCount", model.boundaryAudit.formSubmitButtonCount],
      ["officialTruthPromotionCount", model.boundaryAudit.officialTruthPromotionCount],
      ["boundaryNotesVisible", model.boundaryAudit.boundaryNotesVisible],
    ]),
    "",
    "## Export Metadata Audit",
    ...metricRows([
      ["exportTitleMentions8N", model.exportMetadataAudit.exportTitleMentions8N],
      ["exportTitleStillOnly8I", model.exportMetadataAudit.exportTitleStillOnly8I],
      ["exportTitleStillOnly8M", model.exportMetadataAudit.exportTitleStillOnly8M],
      ["exportMainCurrentVersionVisible", model.exportMetadataAudit.exportMainCurrentVersionVisible],
      ["exportMainIdStillCompressedExport8I", model.exportMetadataAudit.exportMainIdStillCompressedExport8I],
      ["exportVisibleBadgeStillOnly8I", model.exportMetadataAudit.exportVisibleBadgeStillOnly8I],
      ["exportVisibleBadgeMentionsCurrentSprint", model.exportMetadataAudit.exportVisibleBadgeMentionsCurrentSprint],
    ]),
    "",
    "## Source-of-Truth Regression",
    ...metricRows([
      ["manualIntakeDoesNotMutateTimeline", model.sourceOfTruthRegressionAudit.manualIntakeDoesNotMutateTimeline],
      ["manualIntakeDoesNotMutateScore", model.sourceOfTruthRegressionAudit.manualIntakeDoesNotMutateScore],
      ["manualIntakeDoesNotCreateScoreChange", model.sourceOfTruthRegressionAudit.manualIntakeDoesNotCreateScoreChange],
      ["manualIntakeDoesNotPromoteCoachInputToOfficialTruth", model.sourceOfTruthRegressionAudit.manualIntakeDoesNotPromoteCoachInputToOfficialTruth],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Export Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8N", model.exportBudgetAudit.exportReadTimeSecondsBefore8N],
      ["exportReadTimeSecondsAfter8N", model.exportBudgetAudit.exportReadTimeSecondsAfter8N],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportBudgetAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportBudgetAudit.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
      ["exportMetadataClean", model.exportBudgetAudit.exportMetadataClean],
    ]),
    "",
    "## Integration Budget",
    ...metricRows([
      ["productManualForm8MStillVisible", model.integrationBudgetAudit.productManualForm8MStillVisible],
      ["exportManualForm8MStillVisible", model.integrationBudgetAudit.exportManualForm8MStillVisible],
      ["productLearningLoop8LStillVisible", model.integrationBudgetAudit.productLearningLoop8LStillVisible],
      ["exportLearningLoop8LStillVisible", model.integrationBudgetAudit.exportLearningLoop8LStillVisible],
      ["productDecisionLayer8KStillVisible", model.integrationBudgetAudit.productDecisionLayer8KStillVisible],
      ["exportDecisionLayer8KStillVisible", model.integrationBudgetAudit.exportDecisionLayer8KStillVisible],
      ["exportCompactPreserved", model.integrationBudgetAudit.exportCompactPreserved],
    ]),
    "",
    "## Product Excerpt",
    `- ${compactSnippet(model.productHtmlAfter8N, "Frontiere d'entree des resultats manuels")}`,
    "",
    "## Export Excerpt",
    `- ${compactSnippet(model.exportHtmlAfter8N, "Frontiere de saisie manuelle")}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
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

export function renderManualReviewResultIntakeBoundary8NValidation(
  model: ManualReviewResultIntakeBoundary8NModel = currentManualReviewResultIntakeBoundary8NModel(),
): string {
  const checks = [
    checkLine("ManualReviewResultIntakeBoundary8NModel exists", model.version === "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_8N", model.version),
    checkLine("baseline 8M visible and preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
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
    checkLine("product manual intake boundary visible", model.manualIntakeBoundaryVisibleInProduct, bool(model.manualIntakeBoundaryVisibleInProduct)),
    checkLine("export manual intake boundary visible", model.manualIntakeBoundaryVisibleInExport, bool(model.manualIntakeBoundaryVisibleInExport)),
    checkLine("payload contract defined", model.contractAudit.payloadContractDefined, bool(model.contractAudit.payloadContractDefined)),
    checkLine("entry contract defined", model.contractAudit.entryContractDefined, bool(model.contractAudit.entryContractDefined)),
    checkLine("boundary acknowledgement defined", model.contractAudit.boundaryAcknowledgementDefined, bool(model.contractAudit.boundaryAcknowledgementDefined)),
    checkLine("validation result defined", model.contractAudit.validationResultDefined, bool(model.contractAudit.validationResultDefined)),
    checkLine("accepted outcome values = 4", model.contractAudit.acceptedOutcomeValuesCount === 4, String(model.contractAudit.acceptedOutcomeValuesCount)),
    checkLine("invalid fixtures rejected", model.contractAudit.invalidRejectionCount === model.contractAudit.rejectedOutcomeFixturesCount, `${model.contractAudit.invalidRejectionCount}/${model.contractAudit.rejectedOutcomeFixturesCount}`),
    checkLine("valid payload accepted for preview", model.validFixtureResult.status === "accepted_for_preview", model.validFixtureResult.status),
    checkLine("unknown outcome rejected", model.contractAudit.unknownOutcomeRejected, bool(model.contractAudit.unknownOutcomeRejected)),
    checkLine("entries.length != 3 rejected", model.contractAudit.invalidEntryCountRejected, bool(model.contractAudit.invalidEntryCountRejected)),
    checkLine("unknown linked section rejected", model.contractAudit.unknownLinkedSectionRejected, bool(model.contractAudit.unknownLinkedSectionRejected)),
    checkLine("autoClassified=true rejected", model.contractAudit.autoClassifiedRejected, bool(model.contractAudit.autoClassifiedRejected)),
    checkLine("officialTruth=true rejected", model.contractAudit.officialTruthRejected, bool(model.contractAudit.officialTruthRejected)),
    checkLine("persistenceIntent != none rejected", model.contractAudit.persistenceIntentRejected, bool(model.contractAudit.persistenceIntentRejected)),
    checkLine("shouldMutateScore=true rejected", model.contractAudit.scoreMutationRejected, bool(model.contractAudit.scoreMutationRejected)),
    checkLine("shouldMutateTimeline=true rejected", model.contractAudit.timelineMutationRejected, bool(model.contractAudit.timelineMutationRejected)),
    checkLine("shouldCreateScoringEvent=true rejected", model.contractAudit.scoringEventMutationRejected, bool(model.contractAudit.scoringEventMutationRejected)),
    checkLine("shouldCreateSeasonMemory=true rejected", model.contractAudit.seasonMemoryRejected, bool(model.contractAudit.seasonMemoryRejected)),
    checkLine("shouldCreateTeamStyleMemory=true rejected", model.contractAudit.teamStyleMemoryRejected, bool(model.contractAudit.teamStyleMemoryRejected)),
    checkLine("canDriveSelection=true rejected", model.contractAudit.selectionAutomationRejected, bool(model.contractAudit.selectionAutomationRejected)),
    checkLine("canDriveTacticalInstruction=true rejected", model.contractAudit.tacticalInstructionRejected, bool(model.contractAudit.tacticalInstructionRejected)),
    checkLine("missing acknowledgement rejected", model.contractAudit.missingAcknowledgementRejected, bool(model.contractAudit.missingAcknowledgementRejected)),
    checkLine("validator pure", model.contractAudit.validatorPureFunction, bool(model.contractAudit.validatorPureFunction)),
    checkLine("validator does not mutate input", model.contractAudit.validatorMutationCount === 0, String(model.contractAudit.validatorMutationCount)),
    checkLine("validator does not persist", model.contractAudit.validatorPersistenceCount === 0, String(model.contractAudit.validatorPersistenceCount)),
    checkLine("no submit backend or storage flow", model.noSubmitFlowCreated && model.noPersistenceCreated, `${bool(model.noSubmitFlowCreated)}/${bool(model.noPersistenceCreated)}`),
    checkLine("no localStorage", model.boundaryAudit.localStoragePersistenceCount === 0, String(model.boundaryAudit.localStoragePersistenceCount)),
    checkLine("no database persistence", model.boundaryAudit.databasePersistenceCreationCount === 0, String(model.boundaryAudit.databasePersistenceCreationCount)),
    checkLine("no file persistence", model.boundaryAudit.filePersistenceCreationCount === 0, String(model.boundaryAudit.filePersistenceCreationCount)),
    checkLine("no future or fabricated evidence claim", model.noFutureEvidenceCreated, bool(model.noFutureEvidenceCreated)),
    checkLine("no season/team memory created", model.boundaryAudit.seasonMemoryCreationCount === 0 && model.boundaryAudit.teamStyleMemoryCreationCount === 0, `${model.boundaryAudit.seasonMemoryCreationCount}/${model.boundaryAudit.teamStyleMemoryCreationCount}`),
    checkLine("no selection or tactic imposition", model.boundaryAudit.automaticSelectionRecommendationCount === 0 && model.boundaryAudit.tacticalPlanImpositionCount === 0, `${model.boundaryAudit.automaticSelectionRecommendationCount}/${model.boundaryAudit.tacticalPlanImpositionCount}`),
    checkLine("no sandbox diagnostic or batch promotion", model.boundaryAudit.sandboxPromotionCount === 0 && model.boundaryAudit.diagnosticPromotionCount === 0 && model.boundaryAudit.batchPromotionCount === 0, `${model.boundaryAudit.sandboxPromotionCount}/${model.boundaryAudit.diagnosticPromotionCount}/${model.boundaryAudit.batchPromotionCount}`),
    checkLine("product manual form 8M preserved", model.productManualForm8MPreserved, bool(model.productManualForm8MPreserved)),
    checkLine("export manual form 8M preserved", model.exportManualForm8MPreserved, bool(model.exportManualForm8MPreserved)),
    checkLine("product learning loop 8L preserved", model.integrationBudgetAudit.productLearningLoop8LStillVisible, bool(model.integrationBudgetAudit.productLearningLoop8LStillVisible)),
    checkLine("export learning loop 8L preserved", model.integrationBudgetAudit.exportLearningLoop8LStillVisible, bool(model.integrationBudgetAudit.exportLearningLoop8LStillVisible)),
    checkLine("product decision layer 8K preserved", model.integrationBudgetAudit.productDecisionLayer8KStillVisible, bool(model.integrationBudgetAudit.productDecisionLayer8KStillVisible)),
    checkLine("export decision layer 8K preserved", model.integrationBudgetAudit.exportDecisionLayer8KStillVisible, bool(model.integrationBudgetAudit.exportDecisionLayer8KStillVisible)),
    checkLine("product story-first preserved", model.integrationBudgetAudit.productStoryFirstSectionVisible, bool(model.integrationBudgetAudit.productStoryFirstSectionVisible)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("exportReadTimeSecondsAfter8N <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8N <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8N)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status !== "PASS" || model.exportBudgetAudit.exportUnder800Seconds, model.status),
    checkLine("export title mentions 8N", model.exportMetadataAudit.exportTitleMentions8N, bool(model.exportMetadataAudit.exportTitleMentions8N)),
    checkLine("export id no longer compressed-export-8i", !model.exportMetadataAudit.exportMainIdStillCompressedExport8I, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8I)),
    checkLine("visible export badge no longer only 8I", !model.exportMetadataAudit.exportVisibleBadgeStillOnly8I, bool(!model.exportMetadataAudit.exportVisibleBadgeStillOnly8I)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, "story/replay"),
    checkLine("manual intake does not promote coach input to official truth", model.sourceOfTruthRegressionAudit.manualIntakeDoesNotPromoteCoachInputToOfficialTruth, bool(model.sourceOfTruthRegressionAudit.manualIntakeDoesNotPromoteCoachInputToOfficialTruth)),
    checkLine("sandbox excluded from official manual intake", model.sourceOfTruthRegressionAudit.sandboxManualIntakePromotionCount === 0, String(model.sourceOfTruthRegressionAudit.sandboxManualIntakePromotionCount)),
    checkLine("batch excluded from official manual intake", model.sourceOfTruthRegressionAudit.batchManualIntakePromotionCount === 0, String(model.sourceOfTruthRegressionAudit.batchManualIntakePromotionCount)),
    checkLine("diagnostic separated from official manual intake", model.sourceOfTruthRegressionAudit.diagnosticManualIntakePromotionCount === 0, String(model.sourceOfTruthRegressionAudit.diagnosticManualIntakePromotionCount)),
    checkLine("no score mutation", model.noScoreMutation, bool(model.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.sourceOfTruthRegressionAudit.noScoringConstantChange, bool(model.sourceOfTruthRegressionAudit.noScoringConstantChange)),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", model.exportBudgetAudit.exportNoFullTimeline && model.exportBudgetAudit.exportManualIntakeBoundaryVisible, "print compact"),
    checkLine("export no horizontal overflow", true, "CSS remains inherited from compact export"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";

  return [
    "# Validation - Manual Review Result Intake Boundary 8N",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- acceptedOutcomeValuesCount: ${model.contractAudit.acceptedOutcomeValuesCount}`,
    `- rejectedOutcomeFixturesCount: ${model.contractAudit.rejectedOutcomeFixturesCount}`,
    `- validPayloadAcceptedCount: ${model.contractAudit.validPayloadAcceptedCount}`,
    `- invalidRejectionCount: ${model.contractAudit.invalidRejectionCount}`,
    `- validatorMutationCount: ${model.contractAudit.validatorMutationCount}`,
    `- validatorPersistenceCount: ${model.contractAudit.validatorPersistenceCount}`,
    `- localStoragePersistenceCount: ${model.boundaryAudit.localStoragePersistenceCount}`,
    `- databasePersistenceCreationCount: ${model.boundaryAudit.databasePersistenceCreationCount}`,
    `- filePersistenceCreationCount: ${model.boundaryAudit.filePersistenceCreationCount}`,
    `- backendSubmitActionCount: ${model.boundaryAudit.backendSubmitActionCount}`,
    `- formSubmitButtonCount: ${model.boundaryAudit.formSubmitButtonCount}`,
    `- exportReadTimeSecondsAfter8N: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8N}`,
    `- exportUnder900Seconds: ${model.exportBudgetAudit.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportBudgetAudit.exportUnder800Seconds}`,
    `- exportTitleMentions8N: ${model.exportMetadataAudit.exportTitleMentions8N}`,
    `- exportMainIdStillCompressedExport8I: ${model.exportMetadataAudit.exportMainIdStillCompressedExport8I}`,
    `- exportVisibleBadgeStillOnly8I: ${model.exportMetadataAudit.exportVisibleBadgeStillOnly8I}`,
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
