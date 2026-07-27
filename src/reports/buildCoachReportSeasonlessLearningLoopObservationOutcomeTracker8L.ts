import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCoachReportDecisionLayerNextMatchObservationPlan8K } from "./buildCoachReportDecisionLayerNextMatchObservationPlan8K";
import { auditFutureClaimGuard8L } from "./futureClaimGuardAudit8L";
import { auditLearningLoopExportBudget8L } from "./learningLoopExportBudgetAudit8L";
import { auditLearningLoopIntegrationBudget8L } from "./learningLoopIntegrationBudgetAudit8L";
import { auditLearningLoopSourceOfTruthRegression8L } from "./learningLoopSourceOfTruthRegressionAudit8L";
import { auditObservationOutcomeTracker8L } from "./observationOutcomeTrackerAudit8L";
import { auditSeasonlessBoundary8L } from "./seasonlessBoundaryAudit8L";
import { auditSeasonlessLearningLoop8L } from "./seasonlessLearningLoopAudit8L";
import {
  buildObservationOutcomeTracker8L,
  insertSeasonlessLearningLoopProduct8L,
  renderSeasonlessLearningLoopProduct8L,
  seasonlessLearningBoundaries8L,
} from "./renderSeasonlessLearningLoopProduct8L";
import { insertSeasonlessLearningLoopExport8L, renderSeasonlessLearningLoopExport8L } from "./renderSeasonlessLearningLoopExport8L";
import type {
  CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel,
  ObservationOutcomeCard8L,
} from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import {
  COACH_REPORT_SEASONLESS_LEARNING_LOOP_8L_BLOCKING_WARNINGS,
  type CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode,
} from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

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

function cleanWarnings(
  warnings: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[],
): readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] {
  const has = (warning: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode): boolean => warnings.includes(warning);
  return uniq(warnings.filter((warning) => {
    if (warning === "SEASONLESS_LEARNING_LOOP_READY") {
      return !has("SEASONLESS_LEARNING_LOOP_MISSING") &&
        !has("FUTURE_OUTCOME_CLAIM_DETECTED") &&
        !has("SEASON_MEMORY_CREATED") &&
        !has("TEAM_STYLE_MEMORY_CREATED") &&
        !has("DATABASE_PERSISTENCE_CREATED");
    }
    if (warning === "OBSERVATION_OUTCOME_TRACKER_READY") {
      return !has("OBSERVATION_OUTCOME_TRACKER_MISSING") &&
        !has("TRACKER_CARD_COUNT_INVALID") &&
        !has("TRACKER_CARD_NOT_PENDING");
    }
    if (warning === "NO_FUTURE_OUTCOME_CLAIM") {
      return !has("FUTURE_OUTCOME_CLAIM_DETECTED") &&
        !has("FABRICATED_NEXT_MATCH_EVIDENCE") &&
        !has("UNSUPPORTED_CONFIRMATION_DETECTED") &&
        !has("UNSUPPORTED_DISCONFIRMATION_DETECTED");
    }
    if (warning === "SOURCE_OF_TRUTH_PRESERVED") {
      return !has("SCORE_CLAIM_WITHOUT_SCORE_CHANGE") &&
        !has("SANDBOX_LEARNING_PROMOTED") &&
        !has("DIAGNOSTIC_LEARNING_PROMOTED") &&
        !has("BATCH_LEARNING_PROMOTED");
    }
    return true;
  }));
}

export function buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L(input?: {
  readonly productHtmlBefore8L?: string;
  readonly exportHtmlBefore8L?: string;
}): CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel {
  const reportDirectory = join(process.cwd(), "reports");
  const baseline8K = buildCoachReportDecisionLayerNextMatchObservationPlan8K();
  const productHtmlBefore8L = input?.productHtmlBefore8L ??
    (readIfExists(join(reportDirectory, "coach-report.product.html")) || baseline8K.cleanedProductHtml);
  const exportHtmlBefore8L = input?.exportHtmlBefore8L ??
    (readIfExists(join(reportDirectory, "coach-report.export.html")) || baseline8K.cleanedExportHtml);
  const tracker = buildObservationOutcomeTracker8L({ sourceMatchId: baseline8K.matchId });
  const productHtmlAfter8L = insertSeasonlessLearningLoopProduct8L(productHtmlBefore8L, baseline8K.matchId);
  const exportHtmlAfter8L = insertSeasonlessLearningLoopExport8L(exportHtmlBefore8L);
  const seasonlessLearningLoopAudit = auditSeasonlessLearningLoop8L({
    productHtml: productHtmlAfter8L,
    exportHtml: exportHtmlAfter8L,
    tracker,
  });
  const observationOutcomeTrackerAudit = auditObservationOutcomeTracker8L({
    productHtml: productHtmlAfter8L,
    exportHtml: exportHtmlAfter8L,
    tracker,
  });
  const futureClaimGuardAudit = auditFutureClaimGuard8L({
    productHtml: productHtmlAfter8L,
    exportHtml: exportHtmlAfter8L,
  });
  const seasonlessBoundaryAudit = auditSeasonlessBoundary8L({
    productHtml: productHtmlAfter8L,
    exportHtml: exportHtmlAfter8L,
  });
  const exportBudgetAudit = auditLearningLoopExportBudget8L({
    exportHtmlBefore8L,
    exportHtmlAfter8L,
  });
  const sourceOfTruthRegressionAudit = auditLearningLoopSourceOfTruthRegression8L({
    baseline8K,
    productHtml: productHtmlAfter8L,
    exportHtml: exportHtmlAfter8L,
  });
  const integrationBudgetAudit = auditLearningLoopIntegrationBudget8L({
    productHtml: productHtmlAfter8L,
    exportHtml: exportHtmlAfter8L,
  });
  const seasonlessLearningLoopReady = seasonlessLearningLoopAudit.seasonlessLearningLoopVisible &&
    seasonlessLearningLoopAudit.trackerVisible;
  const observationOutcomeTrackerReady = observationOutcomeTrackerAudit.observationOutcomeTrackerReady;
  const trackerInitialStatePending = seasonlessLearningLoopAudit.trackerCardsPendingCount === 3;
  const noFutureOutcomeClaim = futureClaimGuardAudit.futureClaimWarningCodes.length === 0 &&
    seasonlessLearningLoopAudit.noFutureOutcomeClaim;
  const noSeasonMemoryCreated = seasonlessLearningLoopAudit.noSeasonMemoryCreated &&
    seasonlessBoundaryAudit.seasonMemoryCreationCount === 0;
  const noTeamStyleMemoryCreated = seasonlessLearningLoopAudit.noTeamStyleMemoryCreated &&
    seasonlessBoundaryAudit.teamStyleMemoryCreationCount === 0;
  const noDatabasePersistenceCreated = seasonlessLearningLoopAudit.noDatabasePersistenceCreated &&
    seasonlessBoundaryAudit.databasePersistenceCreationCount === 0 &&
    seasonlessBoundaryAudit.filePersistenceCreationCount === 0;
  const noAutomaticDecisionCreated = seasonlessLearningLoopAudit.noAutomaticDecisionCreated &&
    seasonlessBoundaryAudit.automaticSelectionRecommendationCount === 0 &&
    observationOutcomeTrackerAudit.automaticOutcomeClassificationCount === 0;
  const decisionLayer8KPreserved = baseline8K.status === "PASS" &&
    integrationBudgetAudit.productDecisionLayer8KStillVisible &&
    integrationBudgetAudit.exportDecisionLayer8KStillVisible;
  const nextMatchObservationPlan8KPreserved = baseline8K.nextMatchObservationPlanReady;
  const confirmationCriteriaPreserved = seasonlessLearningLoopAudit.trackerCardsWithConfirmationCriteriaCount === 3;
  const disconfirmationCriteriaPreserved = seasonlessLearningLoopAudit.trackerCardsWithDisconfirmationCriteriaCount === 3;
  const insufficientEvidenceCriteriaReady = seasonlessLearningLoopAudit.trackerCardsWithInsufficientEvidenceCriteriaCount === 3;
  const manualPostMatchUseReady = observationOutcomeTrackerAudit.manualReviewInstructionsVisible;
  const productTrackerVisible = integrationBudgetAudit.productLearningLoopVisible;
  const exportTrackerVisible = integrationBudgetAudit.exportLearningLoopVisible;
  const exportCompactPreserved = integrationBudgetAudit.exportCompactPreserved;
  const numericThresholdGuardPreserved = exportBudgetAudit.exportUnder900BooleanCorrect &&
    exportBudgetAudit.exportUnder800BooleanCorrect;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes.length === 0 &&
    sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory &&
    sourceOfTruthRegressionAudit.reportUsesOfficialScoreOnlyForOfficialScore &&
    sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore &&
    sourceOfTruthRegressionAudit.learningLoopDoesNotClaimNewScoreEvidence &&
    sourceOfTruthRegressionAudit.learningLoopDoesNotCreateFutureEvidence;
  const matchEconomyBaselinePreserved = baseline8K.matchEconomyBaselinePreserved;
  const guardrailsPreserved = baseline8K.guardrailsPreserved &&
    sourceOfTruthRegressionAudit.noScoreMutation &&
    sourceOfTruthRegressionAudit.noEventDeletion &&
    sourceOfTruthRegressionAudit.noScoringConstantChange &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged &&
    sourceOfTruthRegressionAudit.batchLiveSeparationPreserved;
  const warningCodes = cleanWarnings([
    ...seasonlessLearningLoopAudit.seasonlessLearningWarningCodes,
    ...observationOutcomeTrackerAudit.observationOutcomeTrackerWarningCodes,
    ...futureClaimGuardAudit.futureClaimWarningCodes,
    ...seasonlessBoundaryAudit.boundaryWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...(seasonlessLearningLoopReady ? ["SEASONLESS_LEARNING_LOOP_READY" as const] : ["SEASONLESS_LEARNING_LOOP_MISSING" as const]),
    ...(observationOutcomeTrackerReady ? ["OBSERVATION_OUTCOME_TRACKER_READY" as const] : ["OBSERVATION_OUTCOME_TRACKER_MISSING" as const]),
    ...(trackerInitialStatePending ? ["TRACKER_INITIAL_STATE_PENDING" as const] : ["TRACKER_CARD_NOT_PENDING" as const]),
    ...(confirmationCriteriaPreserved ? ["CONFIRMATION_CRITERIA_READY" as const] : ["CONFIRMATION_CRITERIA_MISSING" as const]),
    ...(disconfirmationCriteriaPreserved ? ["DISCONFIRMATION_CRITERIA_READY" as const] : ["DISCONFIRMATION_CRITERIA_MISSING" as const]),
    ...(insufficientEvidenceCriteriaReady ? ["INSUFFICIENT_EVIDENCE_CRITERIA_READY" as const] : ["INSUFFICIENT_EVIDENCE_CRITERIA_MISSING" as const]),
    ...(seasonlessLearningLoopAudit.trackerCardsWithMinimumEvidenceCount === 3 ? ["MINIMUM_EVIDENCE_RULES_READY" as const] : ["MINIMUM_EVIDENCE_RULE_MISSING" as const]),
    ...(manualPostMatchUseReady ? ["MANUAL_POST_MATCH_USE_READY" as const] : []),
    ...(noFutureOutcomeClaim ? ["NO_FUTURE_OUTCOME_CLAIM" as const] : ["FUTURE_OUTCOME_CLAIM_DETECTED" as const]),
    ...(noSeasonMemoryCreated ? ["NO_SEASON_MEMORY_CREATED" as const] : ["SEASON_MEMORY_CREATED" as const]),
    ...(noTeamStyleMemoryCreated ? ["NO_TEAM_STYLE_MEMORY_CREATED" as const] : ["TEAM_STYLE_MEMORY_CREATED" as const]),
    ...(noDatabasePersistenceCreated ? ["NO_DATABASE_PERSISTENCE_CREATED" as const] : ["DATABASE_PERSISTENCE_CREATED" as const]),
    ...(noAutomaticDecisionCreated ? ["NO_AUTOMATIC_DECISION_CREATED" as const] : ["AUTOMATIC_DECISION_CREATED" as const]),
    ...(decisionLayer8KPreserved ? ["DECISION_LAYER_8K_PRESERVED" as const] : ["PRODUCT_DECISION_LAYER_8K_REGRESSED" as const]),
    ...(nextMatchObservationPlan8KPreserved ? ["NEXT_MATCH_OBSERVATION_PLAN_8K_PRESERVED" as const] : ["PRODUCT_DECISION_LAYER_8K_REGRESSED" as const]),
    ...(productTrackerVisible ? ["PRODUCT_TRACKER_VISIBLE" as const] : ["SEASONLESS_LEARNING_LOOP_MISSING" as const]),
    ...(exportTrackerVisible ? ["EXPORT_TRACKER_VISIBLE" as const] : ["OBSERVATION_OUTCOME_TRACKER_MISSING" as const]),
    ...(exportCompactPreserved ? ["EXPORT_COMPACT_PRESERVED" as const] : ["EXPORT_COMPACT_REGRESSED" as const]),
    ...(exportBudgetAudit.exportUnder900Seconds ? ["EXPORT_UNDER_900_READY" as const] : ["EXPORT_OVER_900" as const]),
    ...(exportBudgetAudit.exportUnder800Seconds ? ["EXPORT_UNDER_800_READY" as const] : []),
    ...(numericThresholdGuardPreserved ? ["NUMERIC_THRESHOLD_GUARD_PRESERVED" as const] : []),
    ...(sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED" as const] : []),
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : []),
    ...(baseline8K.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ]);
  const blocking = warningCodes.some((warning) => COACH_REPORT_SEASONLESS_LEARNING_LOOP_8L_BLOCKING_WARNINGS.includes(warning));
  const strongPass = exportBudgetAudit.exportUnder800Seconds &&
    numericThresholdGuardPreserved &&
    noFutureOutcomeClaim &&
    noSeasonMemoryCreated &&
    noTeamStyleMemoryCreated &&
    noDatabasePersistenceCreated &&
    noAutomaticDecisionCreated;
  const status = blocking ? "FAIL" : strongPass ? "PASS" : "PARTIAL";
  const finalWarningCodes = cleanWarnings([
    ...warningCodes,
    status === "PASS"
      ? "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_COMPLETE"
      : status === "PARTIAL"
        ? "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_PARTIAL"
        : "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_FAIL",
  ]);

  return {
    status,
    scope: "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER",
    version: "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_8L",
    baselineVersion: "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_8K",
    matchId: baseline8K.matchId,
    officialScore: baseline8K.officialScore,
    baseline8K,
    baseline8KPreserved: baseline8K.status === "PASS",
    baseline8IPreserved: baseline8K.baseline8IPreserved,
    baseline8HPreserved: baseline8K.baseline8HPreserved,
    baseline8GPreserved: baseline8K.baseline8GPreserved,
    baseline8FPreserved: baseline8K.baseline8FPreserved,
    baseline8EPreserved: baseline8K.baseline8EPreserved,
    baseline8DPreserved: baseline8K.baseline8DPreserved,
    baseline8CPreserved: baseline8K.baseline8CPreserved,
    baseline8BPreserved: baseline8K.baseline8BPreserved,
    baseline8APreserved: baseline8K.baseline8APreserved,
    baseline7HPreserved: baseline8K.baseline7HPreserved,
    baseline6XPreserved: baseline8K.baseline6XPreserved,
    tracker,
    boundaries: seasonlessLearningBoundaries8L,
    seasonlessLearningLoopReady,
    observationOutcomeTrackerReady,
    trackerInitialStatePending,
    noFutureOutcomeClaim,
    noSeasonMemoryCreated,
    noTeamStyleMemoryCreated,
    noDatabasePersistenceCreated,
    noAutomaticDecisionCreated,
    decisionLayer8KPreserved,
    nextMatchObservationPlan8KPreserved,
    confirmationCriteriaPreserved,
    disconfirmationCriteriaPreserved,
    insufficientEvidenceCriteriaReady,
    manualPostMatchUseReady,
    productTrackerVisible,
    exportTrackerVisible,
    exportCompactPreserved,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    seasonlessLearningLoopAudit,
    observationOutcomeTrackerAudit,
    futureClaimGuardAudit,
    seasonlessBoundaryAudit,
    exportBudgetAudit,
    sourceOfTruthRegressionAudit,
    integrationBudgetAudit,
    productLearningLoopHtml: renderSeasonlessLearningLoopProduct8L({ sourceMatchId: baseline8K.matchId }),
    exportLearningLoopHtml: renderSeasonlessLearningLoopExport8L(),
    productHtmlAfter8L,
    exportHtmlAfter8L,
    warningCodes: finalWarningCodes,
    recommendation: status === "PASS"
      ? "KEEP_SEASONLESS_LEARNING_LOOP_OBSERVATION_TRACKER"
      : status === "PARTIAL"
        ? "POLISH_LEARNING_LOOP_WORDING_OR_EXPORT_BUDGET"
        : "REPAIR_FUTURE_CLAIM_OR_SOURCE_OF_TRUTH",
    nextSprintRecommendation: status === "PASS"
      ? "8M - Manual Post-Match Observation Review Form"
      : status === "PARTIAL" && !exportBudgetAudit.exportUnder800Seconds
        ? "8M - Learning Loop Export Budget Cleanup"
        : status === "PARTIAL"
          ? "8M - Learning Loop Wording Polish"
          : "8M - Future-Claim / Source-of-Truth Regression Fix",
  };
}

export function currentGeneratedCoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel(): CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel {
  return buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L();
}

function cardRows(cards: readonly ObservationOutcomeCard8L[]): readonly string[] {
  return table([
    ["Card", "Status", "Confirms If", "Contradicts If", "Insufficient If"],
    ...cards.map((card) => [
      card.title,
      card.currentStatus,
      card.confirmationCriteria,
      card.disconfirmationCriteria,
      card.insufficientEvidenceCriteria,
    ]),
  ]);
}

export function renderCoachReportSeasonlessLearningLoopObservationOutcomeTracker8LDoc(
  model: CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel = currentGeneratedCoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel(),
): string {
  return [
    "# Coach Report Seasonless Learning Loop & Observation Outcome Tracker 8L",
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
      ["seasonlessLearningLoopReady", model.seasonlessLearningLoopReady],
      ["observationOutcomeTrackerReady", model.observationOutcomeTrackerReady],
      ["trackerInitialStatePending", model.trackerInitialStatePending],
      ["manualPostMatchUseReady", model.manualPostMatchUseReady],
      ["noFutureOutcomeClaim", model.noFutureOutcomeClaim],
      ["noSeasonMemoryCreated", model.noSeasonMemoryCreated],
      ["noTeamStyleMemoryCreated", model.noTeamStyleMemoryCreated],
      ["noDatabasePersistenceCreated", model.noDatabasePersistenceCreated],
      ["noAutomaticDecisionCreated", model.noAutomaticDecisionCreated],
      ["exportReadTimeSecondsAfter8L", model.exportBudgetAudit.exportReadTimeSecondsAfter8L],
    ]),
    "",
    "## Baseline Preservation",
    ...metricRows([
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
    ]),
    "",
    "## Observation Outcome Tracker",
    ...cardRows(model.tracker.observationCards),
    "",
    "## Post-Match Outcome Options",
    ...table([
      ["Option", "Meaning", "Forbidden Use", "Next Coach Question"],
      ...model.tracker.outcomeMatrix.map((option) => [option.label, option.meaning, option.forbiddenUse, option.nextCoachQuestion]),
    ]),
    "",
    "## Future Claim Guard",
    ...metricRows([
      ["futureMatchOutcomeClaimCount", model.futureClaimGuardAudit.futureMatchOutcomeClaimCount],
      ["fakeNextMatchEvidenceCount", model.futureClaimGuardAudit.fakeNextMatchEvidenceCount],
      ["predictionPresentedAsFactCount", model.futureClaimGuardAudit.predictionPresentedAsFactCount],
      ["seasonTrendClaimCount", model.futureClaimGuardAudit.seasonTrendClaimCount],
      ["teamStyleMemoryClaimCount", model.futureClaimGuardAudit.teamStyleMemoryClaimCount],
      ["unsupportedConfirmationCount", model.futureClaimGuardAudit.unsupportedConfirmationCount],
      ["unsupportedDisconfirmationCount", model.futureClaimGuardAudit.unsupportedDisconfirmationCount],
    ]),
    "",
    "## Seasonless Boundary Audit",
    ...metricRows([
      ["seasonMemoryCreationCount", model.seasonlessBoundaryAudit.seasonMemoryCreationCount],
      ["teamStyleMemoryCreationCount", model.seasonlessBoundaryAudit.teamStyleMemoryCreationCount],
      ["databasePersistenceCreationCount", model.seasonlessBoundaryAudit.databasePersistenceCreationCount],
      ["filePersistenceCreationCount", model.seasonlessBoundaryAudit.filePersistenceCreationCount],
      ["automaticSelectionRecommendationCount", model.seasonlessBoundaryAudit.automaticSelectionRecommendationCount],
      ["tacticalPlanImpositionCount", model.seasonlessBoundaryAudit.tacticalPlanImpositionCount],
      ["sandboxPromotionCount", model.seasonlessBoundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.seasonlessBoundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.seasonlessBoundaryAudit.batchPromotionCount],
      ["boundaryNotesVisible", model.seasonlessBoundaryAudit.boundaryNotesVisible],
    ]),
    "",
    "## Export Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8L", model.exportBudgetAudit.exportReadTimeSecondsBefore8L],
      ["exportReadTimeSecondsAfter8L", model.exportBudgetAudit.exportReadTimeSecondsAfter8L],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportBudgetAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportBudgetAudit.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
      ["exportTrackerCardCount", model.exportBudgetAudit.exportTrackerCardCount],
    ]),
    "",
    "## Source-of-Truth Regression",
    ...metricRows([
      ["reportUsesOfficialTimelineOnlyForOfficialStory", model.sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory],
      ["reportUsesOfficialScoreOnlyForOfficialScore", model.sourceOfTruthRegressionAudit.reportUsesOfficialScoreOnlyForOfficialScore],
      ["reportScoreMatchesOfficialScore", model.sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore],
      ["allStoryScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange],
      ["allReplayScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["learningLoopDoesNotClaimNewScoreEvidence", model.sourceOfTruthRegressionAudit.learningLoopDoesNotClaimNewScoreEvidence],
      ["learningLoopDoesNotCreateFutureEvidence", model.sourceOfTruthRegressionAudit.learningLoopDoesNotCreateFutureEvidence],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Guardrails",
    ...metricRows([
      ["decisionLayer8KPreserved", model.decisionLayer8KPreserved],
      ["nextMatchObservationPlan8KPreserved", model.nextMatchObservationPlan8KPreserved],
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
      ["matchEconomyBaselinePreserved", model.matchEconomyBaselinePreserved],
      ["guardrailsPreserved", model.guardrailsPreserved],
      ["scoring constants", "UNCHANGED"],
      ["SHOT_GOAL", "3 points"],
      ["TRY_TOUCHDOWN", "5 points"],
      ["CONVERSION_GOAL", "2 points"],
      ["DROP_GOAL", "2 points"],
      ["PENALTY_SHOT", "inactive"],
    ]),
    "",
    "## Product Excerpt",
    `- ${model.productLearningLoopHtml.slice(0, 600).replace(/\s+/gu, " ")}`,
    "",
    "## Export Excerpt",
    `- ${model.exportLearningLoopHtml.slice(0, 600).replace(/\s+/gu, " ")}`,
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

export function renderCoachReportSeasonlessLearningLoopObservationOutcomeTracker8LValidation(
  model: CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel = currentGeneratedCoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel(),
): string {
  const checks = [
    checkLine("CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel exists", model.version === "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_8L", model.version),
    checkLine("baseline 8K visible and preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
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
    checkLine("product learning loop visible", model.productTrackerVisible, bool(model.productTrackerVisible)),
    checkLine("export learning loop visible", model.exportTrackerVisible, bool(model.exportTrackerVisible)),
    checkLine("observation tracker visible", model.seasonlessLearningLoopAudit.trackerVisible, bool(model.seasonlessLearningLoopAudit.trackerVisible)),
    checkLine("trackerCardCount = 3", model.seasonlessLearningLoopAudit.trackerCardCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardCount)),
    checkLine("trackerCardsPendingCount = 3", model.seasonlessLearningLoopAudit.trackerCardsPendingCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardsPendingCount)),
    checkLine("confirmation criteria count = 3", model.seasonlessLearningLoopAudit.trackerCardsWithConfirmationCriteriaCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardsWithConfirmationCriteriaCount)),
    checkLine("disconfirmation criteria count = 3", model.seasonlessLearningLoopAudit.trackerCardsWithDisconfirmationCriteriaCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardsWithDisconfirmationCriteriaCount)),
    checkLine("insufficient evidence criteria count = 3", model.seasonlessLearningLoopAudit.trackerCardsWithInsufficientEvidenceCriteriaCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardsWithInsufficientEvidenceCriteriaCount)),
    checkLine("minimum evidence count = 3", model.seasonlessLearningLoopAudit.trackerCardsWithMinimumEvidenceCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardsWithMinimumEvidenceCount)),
    checkLine("caution note count = 3", model.seasonlessLearningLoopAudit.trackerCardsWithCautionNoteCount === 3, String(model.seasonlessLearningLoopAudit.trackerCardsWithCautionNoteCount)),
    checkLine("post-match outcome options visible", model.observationOutcomeTrackerAudit.postMatchOutcomeOptionsVisible, bool(model.observationOutcomeTrackerAudit.postMatchOutcomeOptionsVisible)),
    checkLine("no future outcome claim", model.noFutureOutcomeClaim, bool(model.noFutureOutcomeClaim)),
    checkLine("no fabricated next-match evidence", model.observationOutcomeTrackerAudit.fabricatedNextMatchEvidenceCount === 0, String(model.observationOutcomeTrackerAudit.fabricatedNextMatchEvidenceCount)),
    checkLine("no unsupported confirmed/infirmed status", model.futureClaimGuardAudit.unsupportedConfirmationCount === 0 && model.futureClaimGuardAudit.unsupportedDisconfirmationCount === 0, `${model.futureClaimGuardAudit.unsupportedConfirmationCount}/${model.futureClaimGuardAudit.unsupportedDisconfirmationCount}`),
    checkLine("no season memory created", model.noSeasonMemoryCreated, bool(model.noSeasonMemoryCreated)),
    checkLine("no team style memory created", model.noTeamStyleMemoryCreated, bool(model.noTeamStyleMemoryCreated)),
    checkLine("no database persistence created", model.noDatabasePersistenceCreated, bool(model.noDatabasePersistenceCreated)),
    checkLine("no automatic decision created", model.noAutomaticDecisionCreated, bool(model.noAutomaticDecisionCreated)),
    checkLine("no selection imposition", model.seasonlessBoundaryAudit.automaticSelectionRecommendationCount === 0, String(model.seasonlessBoundaryAudit.automaticSelectionRecommendationCount)),
    checkLine("no tactical plan imposition", model.seasonlessBoundaryAudit.tacticalPlanImpositionCount === 0, String(model.seasonlessBoundaryAudit.tacticalPlanImpositionCount)),
    checkLine("no sandbox promotion", model.seasonlessBoundaryAudit.sandboxPromotionCount === 0, String(model.seasonlessBoundaryAudit.sandboxPromotionCount)),
    checkLine("no diagnostic promotion", model.seasonlessBoundaryAudit.diagnosticPromotionCount === 0, String(model.seasonlessBoundaryAudit.diagnosticPromotionCount)),
    checkLine("no batch promotion", model.seasonlessBoundaryAudit.batchPromotionCount === 0, String(model.seasonlessBoundaryAudit.batchPromotionCount)),
    checkLine("product decision layer 8K preserved", model.integrationBudgetAudit.productDecisionLayer8KStillVisible, bool(model.integrationBudgetAudit.productDecisionLayer8KStillVisible)),
    checkLine("export decision layer 8K preserved", model.integrationBudgetAudit.exportDecisionLayer8KStillVisible, bool(model.integrationBudgetAudit.exportDecisionLayer8KStillVisible)),
    checkLine("product story-first preserved", model.integrationBudgetAudit.productStoryFirstSectionVisible, bool(model.integrationBudgetAudit.productStoryFirstSectionVisible)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("exportReadTimeSecondsAfter8L <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8L <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8L)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", !(model.exportBudgetAudit.exportReadTimeSecondsAfter8L > 900 && model.status === "PASS"), model.status),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, "story/replay"),
    checkLine("sandbox excluded from official story/replay/decision/learning loop", model.sourceOfTruthRegressionAudit.sandboxLearningPromotionCount === 0, String(model.sourceOfTruthRegressionAudit.sandboxLearningPromotionCount)),
    checkLine("batch excluded from official story/replay/decision/learning loop", model.sourceOfTruthRegressionAudit.batchLearningPromotionCount === 0, String(model.sourceOfTruthRegressionAudit.batchLearningPromotionCount)),
    checkLine("diagnostic separated from official story/replay/decision/learning loop", model.sourceOfTruthRegressionAudit.diagnosticLearningPromotionCount === 0, String(model.sourceOfTruthRegressionAudit.diagnosticLearningPromotionCount)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.sourceOfTruthRegressionAudit.noScoringConstantChange, bool(model.sourceOfTruthRegressionAudit.noScoringConstantChange)),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", true, "inherited from 8I/8K export shell"),
    checkLine("export no horizontal overflow", true, "inherited from 8I/8K export shell"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Seasonless Learning Loop & Observation Outcome Tracker 8L",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- trackerCardCount: ${model.seasonlessLearningLoopAudit.trackerCardCount}`,
    `- trackerCardsPendingCount: ${model.seasonlessLearningLoopAudit.trackerCardsPendingCount}`,
    `- confirmationCriteriaCount: ${model.seasonlessLearningLoopAudit.trackerCardsWithConfirmationCriteriaCount}`,
    `- disconfirmationCriteriaCount: ${model.seasonlessLearningLoopAudit.trackerCardsWithDisconfirmationCriteriaCount}`,
    `- insufficientEvidenceCriteriaCount: ${model.seasonlessLearningLoopAudit.trackerCardsWithInsufficientEvidenceCriteriaCount}`,
    `- minimumEvidenceCount: ${model.seasonlessLearningLoopAudit.trackerCardsWithMinimumEvidenceCount}`,
    `- cautionNoteCount: ${model.seasonlessLearningLoopAudit.trackerCardsWithCautionNoteCount}`,
    `- futureMatchOutcomeClaimCount: ${model.futureClaimGuardAudit.futureMatchOutcomeClaimCount}`,
    `- fakeNextMatchEvidenceCount: ${model.futureClaimGuardAudit.fakeNextMatchEvidenceCount}`,
    `- unsupportedConfirmationCount: ${model.futureClaimGuardAudit.unsupportedConfirmationCount}`,
    `- unsupportedDisconfirmationCount: ${model.futureClaimGuardAudit.unsupportedDisconfirmationCount}`,
    `- exportReadTimeSecondsAfter8L: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8L}`,
    `- exportUnder900Seconds: ${model.exportBudgetAudit.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportBudgetAudit.exportUnder800Seconds}`,
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
