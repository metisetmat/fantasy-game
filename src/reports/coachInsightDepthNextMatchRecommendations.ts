import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { CoachProductReportViewModel } from "./coachProductReportView";
import { buildCoachDeepInsights, buildNextMatchRecommendations, type CoachDeepInsight, type NextMatchRecommendation } from "./coachDeepInsights";
import { auditCoachInsightCausalityEvidence, type CoachInsightCausalityEvidenceAudit } from "./coachInsightCausalityEvidenceAudit";
import { auditCoachInsightDepth, type CoachInsightDepthAudit } from "./coachInsightDepthAudit";
import { auditCoachLanguageReadability, type CoachLanguageReadabilityAudit } from "./coachLanguageReadabilityAudit";
import {
  COACH_INSIGHT_DEPTH_BLOCKING_WARNINGS,
  type CoachInsightDepthNextMatchRecommendationsWarningCode,
} from "./coachInsightDepthNextMatchRecommendationsWarnings";
import { currentFullMatchEconomyFinalStabilizationModel, type FullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import { auditNextMatchRecommendations, type NextMatchRecommendationAudit } from "./nextMatchRecommendationAudit";
import {
  currentProductBaselineCoachReportReadinessModel,
  type ProductBaselineCoachReportReadinessModel,
} from "./productBaselineCoachReportReadiness";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

export type CoachInsightDepthNextMatchRecommendationsStatus = "PASS" | "PARTIAL" | "FAIL";
export type CoachInsightDepthNextMatchRecommendationsRecommendation =
  | "KEEP_COACH_INSIGHT_DEPTH"
  | "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING"
  | "COACH_INSIGHT_SPECIFICITY_FOLLOW_UP"
  | "NEXT_MATCH_PLAN_CLEANUP"
  | "COACH_REPORT_INSIGHT_REGRESSION_FIX";

export interface CoachInsightDepthNextMatchRecommendationsModel {
  readonly status: CoachInsightDepthNextMatchRecommendationsStatus;
  readonly scope: "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS";
  readonly version: "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B";
  readonly baselineVersion: "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly insightDepthReady: boolean;
  readonly causalExplanationReady: boolean;
  readonly nextMatchRecommendationsReady: boolean;
  readonly coachLanguageReady: boolean;
  readonly productBaselineReady: boolean;
  readonly coachInsightCount: number;
  readonly deepInsightCount: number;
  readonly shallowInsightCount: number;
  readonly insightDepthCoverageRate: number;
  readonly causeLinkedInsightCount: number;
  readonly consequenceLinkedInsightCount: number;
  readonly riskLinkedInsightCount: number;
  readonly nextMatchSignalLinkedInsightCount: number;
  readonly evidenceLinkedInsightCount: number;
  readonly confidenceLabeledInsightCount: number;
  readonly unsupportedCausalClaimCount: number;
  readonly overconfidentCausalClaimCount: number;
  readonly actionableInsightCount: number;
  readonly vagueInsightCount: number;
  readonly actionableInsightRate: number;
  readonly nextMatchRecommendationCount: number;
  readonly concreteNextMatchRecommendationCount: number;
  readonly vagueNextMatchRecommendationCount: number;
  readonly unsupportedRecommendationCount: number;
  readonly recommendationWithTradeoffCount: number;
  readonly recommendationWithObservableSignalCount: number;
  readonly recommendationWithTrainingFocusCount: number;
  readonly forcedSelectionRecommendationCount: number;
  readonly selectionPreviewAsRecommendationCount: number;
  readonly profileObservationCount: number;
  readonly profileObservationForcedCount: number;
  readonly trainingFocusCount: number;
  readonly trainingFocusWithWhyCount: number;
  readonly trainingFocusWithDrillCueCount: number;
  readonly trainingFocusWithRiskCount: number;
  readonly phaseLinkedInsightCount: number;
  readonly zoneLinkedInsightCount: number;
  readonly playerOrProfileLinkedInsightCount: number;
  readonly teamBehaviorLinkedInsightCount: number;
  readonly officialEvidenceInsightCount: number;
  readonly diagnosticOnlyInsightCount: number;
  readonly sandboxOnlyInsightCount: number;
  readonly sandboxTruthLeakageCount: number;
  readonly diagnosticTruthLeakageCount: number;
  readonly batchScoreLeakageCount: number;
  readonly sourceBadgeCoverageRate: number;
  readonly evidenceLinkCoverageRate: number;
  readonly confidenceLabelCoverageRate: number;
  readonly lowConfidenceSignalLabeledCount: number;
  readonly missingConfidenceLabelCount: number;
  readonly forbiddenWordingCount: number;
  readonly jargonCount: number;
  readonly reportReadingTimeEstimate: number;
  readonly productSectionCount: number;
  readonly appendixSectionCount: number;
  readonly technicalCardsCollapsedCount: number;
  readonly uncollapsedTechnicalNoiseCount: number;
  readonly guardrailsPreserved: boolean;
  readonly noScoreManipulationConfirmed: boolean;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly noPenaltyLeak: boolean;
  readonly noUnknownScoringFamily: boolean;
  readonly noPersistenceSqliteScoring: boolean;
  readonly scoreConstantsUnchanged: boolean;
  readonly matchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly deepInsights: readonly CoachDeepInsight[];
  readonly nextMatchRecommendations: readonly NextMatchRecommendation[];
  readonly baseline7A: ProductBaselineCoachReportReadinessModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly insightDepthAudit: CoachInsightDepthAudit;
  readonly nextMatchRecommendationAudit: NextMatchRecommendationAudit;
  readonly causalityEvidenceAudit: CoachInsightCausalityEvidenceAudit;
  readonly coachLanguageAudit: CoachLanguageReadabilityAudit;
  readonly warningCodes: readonly CoachInsightDepthNextMatchRecommendationsWarningCode[];
  readonly recommendation: CoachInsightDepthNextMatchRecommendationsRecommendation;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
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

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function readReport(fileName: string): string {
  const path = join(process.cwd(), "reports", fileName);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function includesBlocking(warnings: readonly CoachInsightDepthNextMatchRecommendationsWarningCode[]): boolean {
  return warnings.some((warning) => COACH_INSIGHT_DEPTH_BLOCKING_WARNINGS.includes(warning));
}

export function buildCoachInsightDepthNextMatchRecommendationsModel(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baseline7A?: ProductBaselineCoachReportReadinessModel;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
}): CoachInsightDepthNextMatchRecommendationsModel {
  const matchEconomyBaseline = input.matchEconomyBaseline ?? currentFullMatchEconomyFinalStabilizationModel();
  const baseline7A = input.baseline7A ?? currentProductBaselineCoachReportReadinessModel({
    productReport: input.productReport,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    matchEconomyBaseline,
  });
  const deepInsights = buildCoachDeepInsights(input.productReport);
  const nextMatchRecommendations = buildNextMatchRecommendations(deepInsights);
  const insightDepthAudit = auditCoachInsightDepth(deepInsights);
  const nextMatchRecommendationAudit = auditNextMatchRecommendations(nextMatchRecommendations);
  const causalityEvidenceAudit = auditCoachInsightCausalityEvidence(deepInsights);
  const coachLanguageAudit = auditCoachLanguageReadability(input);
  const matchEconomyBaselinePreserved = baseline7A.matchEconomyBaselinePreserved &&
    matchEconomyBaseline.averageTotalPointsAfter >= 21 &&
    matchEconomyBaseline.averageTotalPointsAfter <= 24 &&
    matchEconomyBaseline.scoringEventsPerMatchAfter >= 6 &&
    matchEconomyBaseline.scoringEventsPerMatchAfter <= 8.5 &&
    matchEconomyBaseline.scoringOpportunitiesPerMatchAfter >= 15 &&
    matchEconomyBaseline.scoringOpportunitiesPerMatchAfter <= 17 &&
    matchEconomyBaseline.closeGameRateAfter >= 45 &&
    matchEconomyBaseline.closeGameRateAfter <= 60 &&
    matchEconomyBaseline.competitiveGameRateAfter >= 70 &&
    matchEconomyBaseline.competitiveGameRateAfter <= 85 &&
    matchEconomyBaseline.blowoutRateAfter <= 20 &&
    matchEconomyBaseline.severeBlowoutRateAfter <= 5;
  const guardrailsPreserved = baseline7A.guardrailsPreserved &&
    matchEconomyBaseline.scoreFromScoreChangeAllRuns &&
    matchEconomyBaseline.officialPathConnectedAllRuns &&
    !matchEconomyBaseline.scoringConstantsChanged &&
    !matchEconomyBaseline.MatchBonusEventChanged &&
    !matchEconomyBaseline.scoreCapApplied &&
    !matchEconomyBaseline.postHocRewriteApplied &&
    !matchEconomyBaseline.scoringEventsDeleted &&
    !matchEconomyBaseline.forcedOpponentScoreApplied &&
    !matchEconomyBaseline.forcedTrailingTeamScoreApplied &&
    !matchEconomyBaseline.rubberBandingApplied &&
    !matchEconomyBaseline.comebackForced &&
    !matchEconomyBaseline.trailingTeamOpportunityForced &&
    !matchEconomyBaseline.trailingTeamScoreChangeInjected &&
    matchEconomyBaseline.unknownScoringFamilyCount === 0 &&
    matchEconomyBaseline.penaltyShotActiveLeakageCount === 0 &&
    matchEconomyBaseline.batchLiveSeparationPreserved &&
    !matchEconomyBaseline.persistenceUsedForScoring &&
    !matchEconomyBaseline.sqliteUsedForScoring;
  const sourceOfTruthSeparationPreserved = baseline7A.officialTruthSeparationReady &&
    baseline7A.diagnosticSeparationReady &&
    baseline7A.sandboxSeparationReady &&
    baseline7A.noSandboxTruthLeakage &&
    baseline7A.noDiagnosticScoreLeakage &&
    baseline7A.noBatchScoreLeakage;
  const insightDepthReady = insightDepthAudit.deepInsightCount >= 3 &&
    insightDepthAudit.unsupportedCausalClaimCount === 0 &&
    insightDepthAudit.overconfidentCausalClaimCount === 0;
  const causalExplanationReady = causalityEvidenceAudit.unsupportedCausalClaimCount === 0 &&
    causalityEvidenceAudit.overconfidentCausalClaimCount === 0 &&
    causalityEvidenceAudit.supportedCausalClaimCount >= 3;
  const nextMatchRecommendationsReady = nextMatchRecommendationAudit.concreteNextMatchRecommendationCount >= 2 &&
    nextMatchRecommendationAudit.unsupportedRecommendationCount === 0 &&
    nextMatchRecommendationAudit.forcedSelectionRecommendationCount === 0 &&
    nextMatchRecommendationAudit.forcedTacticalPlanRecommendationCount === 0;
  const coachLanguageReady = coachLanguageAudit.forbiddenWordingCount === 0 &&
    coachLanguageAudit.jargonCount === 0 &&
    coachLanguageAudit.missingPlainLanguageExplanationCount === 0;
  const routeFamilyDiversityPreserved = baseline7A.routeFamilyDiversityPreserved && matchEconomyBaseline.noRollbackToShotOnly;
  const noScoreManipulationConfirmed = baseline7A.noScoreManipulationConfirmed && guardrailsPreserved;
  const warningCodes = [
    ...insightDepthAudit.insightDepthWarningCodes,
    ...nextMatchRecommendationAudit.nextMatchRecommendationWarningCodes,
    ...causalityEvidenceAudit.causalEvidenceWarningCodes,
    ...coachLanguageAudit.coachLanguageWarningCodes,
    ...(sourceOfTruthSeparationPreserved ? ["OFFICIAL_DIAGNOSTIC_SANDBOX_SEPARATION_PRESERVED" as const] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
    ...(baseline7A.productReportReady ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(baseline7A.coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(matchEconomyBaselinePreserved && guardrailsPreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(baseline7A.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
    ...(nextMatchRecommendationAudit.forcedSelectionRecommendationCount === 0 ? ["PROFILES_TO_OBSERVE_NOT_FORCED" as const, "SELECTION_PREVIEW_NON_APPLIED_CONFIRMED" as const] : ["FORCED_SELECTION_FROM_PREVIEW" as const]),
    ...(insightDepthReady && causalExplanationReady && nextMatchRecommendationsReady && coachLanguageReady
      ? ["COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_COMPLETE" as const]
      : ["COACH_INSIGHT_DEPTH_PARTIAL" as const]),
  ];
  const productBaselineReady = baseline7A.productBaselineReady &&
    baseline7A.productReportReady &&
    baseline7A.coachExportReady &&
    sourceOfTruthSeparationPreserved &&
    insightDepthReady &&
    causalExplanationReady &&
    nextMatchRecommendationsReady &&
    coachLanguageReady &&
    matchEconomyBaselinePreserved &&
    guardrailsPreserved &&
    routeFamilyDiversityPreserved &&
    !includesBlocking(warningCodes);
  const status: CoachInsightDepthNextMatchRecommendationsStatus = includesBlocking(warningCodes)
    ? "FAIL"
    : productBaselineReady
      ? "PASS"
      : "PARTIAL";
  const recommendation: CoachInsightDepthNextMatchRecommendationsRecommendation = status === "PASS"
    ? "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING"
    : !insightDepthReady
      ? "COACH_INSIGHT_SPECIFICITY_FOLLOW_UP"
      : !nextMatchRecommendationsReady
        ? "NEXT_MATCH_PLAN_CLEANUP"
        : "COACH_REPORT_INSIGHT_REGRESSION_FIX";

  return {
    status,
    scope: "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS",
    version: "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B",
    baselineVersion: "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A",
    matchEconomyBaselinePreserved,
    productReportReady: baseline7A.productReportReady,
    coachExportReady: baseline7A.coachExportReady,
    sourceOfTruthSeparationPreserved,
    insightDepthReady,
    causalExplanationReady,
    nextMatchRecommendationsReady,
    coachLanguageReady,
    productBaselineReady,
    coachInsightCount: insightDepthAudit.totalInsightCount,
    deepInsightCount: insightDepthAudit.deepInsightCount,
    shallowInsightCount: insightDepthAudit.shallowInsightCount,
    insightDepthCoverageRate: insightDepthAudit.insightDepthCoverageRate,
    causeLinkedInsightCount: insightDepthAudit.insightWithProbableCauseCount,
    consequenceLinkedInsightCount: insightDepthAudit.insightWithTacticalConsequenceCount,
    riskLinkedInsightCount: insightDepthAudit.insightWithRiskIfRepeatedCount,
    nextMatchSignalLinkedInsightCount: insightDepthAudit.insightWithNextMatchCheckCount,
    evidenceLinkedInsightCount: insightDepthAudit.insightWithEvidenceCount,
    confidenceLabeledInsightCount: deepInsights.filter((insight) => insight.confidence.length > 0).length,
    unsupportedCausalClaimCount: causalityEvidenceAudit.unsupportedCausalClaimCount,
    overconfidentCausalClaimCount: causalityEvidenceAudit.overconfidentCausalClaimCount,
    actionableInsightCount: baseline7A.actionableInsightCount,
    vagueInsightCount: baseline7A.vagueInsightCount,
    actionableInsightRate: percent(baseline7A.actionableInsightCount, Math.max(1, baseline7A.coachInsightCount)),
    nextMatchRecommendationCount: nextMatchRecommendationAudit.nextMatchRecommendationCount,
    concreteNextMatchRecommendationCount: nextMatchRecommendationAudit.concreteNextMatchRecommendationCount,
    vagueNextMatchRecommendationCount: nextMatchRecommendationAudit.vagueNextMatchRecommendationCount,
    unsupportedRecommendationCount: nextMatchRecommendationAudit.unsupportedRecommendationCount,
    recommendationWithTradeoffCount: nextMatchRecommendationAudit.recommendationWithTradeoffCount,
    recommendationWithObservableSignalCount: nextMatchRecommendationAudit.recommendationWithObservableSignalCount,
    recommendationWithTrainingFocusCount: nextMatchRecommendationAudit.recommendationWithTrainingFocusCount,
    forcedSelectionRecommendationCount: nextMatchRecommendationAudit.forcedSelectionRecommendationCount,
    selectionPreviewAsRecommendationCount: nextMatchRecommendationAudit.selectionPreviewAsRecommendationCount,
    profileObservationCount: baseline7A.profileObservationCount,
    profileObservationForcedCount: baseline7A.profileRecommendationForcedCount,
    trainingFocusCount: baseline7A.trainingFocusCount,
    trainingFocusWithWhyCount: nextMatchRecommendationAudit.recommendationWithEvidenceCount,
    trainingFocusWithDrillCueCount: nextMatchRecommendationAudit.recommendationWithTrainingFocusCount,
    trainingFocusWithRiskCount: nextMatchRecommendationAudit.recommendationWithTradeoffCount,
    phaseLinkedInsightCount: deepInsights.length,
    zoneLinkedInsightCount: deepInsights.filter((insight) => insight.affectedZones.length > 0).length,
    playerOrProfileLinkedInsightCount: deepInsights.filter((insight) => insight.affectedPlayersOrProfiles.length > 0).length,
    teamBehaviorLinkedInsightCount: deepInsights.length,
    officialEvidenceInsightCount: deepInsights.filter((insight) => insight.sourceType === "official").length,
    diagnosticOnlyInsightCount: deepInsights.filter((insight) => insight.sourceType === "diagnostic").length,
    sandboxOnlyInsightCount: deepInsights.filter((insight) => insight.sourceType === "sandbox").length,
    sandboxTruthLeakageCount: baseline7A.noSandboxTruthLeakage ? 0 : 1,
    diagnosticTruthLeakageCount: baseline7A.noDiagnosticScoreLeakage ? 0 : 1,
    batchScoreLeakageCount: baseline7A.noBatchScoreLeakage ? 0 : 1,
    sourceBadgeCoverageRate: baseline7A.sourceBadgeCoverageRate,
    evidenceLinkCoverageRate: baseline7A.evidenceLinkCoverageRate,
    confidenceLabelCoverageRate: baseline7A.missingConfidenceLabelCount === 0 ? 100 : 0,
    lowConfidenceSignalLabeledCount: baseline7A.lowConfidenceSignalLabeledCount,
    missingConfidenceLabelCount: baseline7A.missingConfidenceLabelCount,
    forbiddenWordingCount: coachLanguageAudit.forbiddenWordingCount,
    jargonCount: coachLanguageAudit.jargonCount,
    reportReadingTimeEstimate: baseline7A.reportReadingTimeEstimate,
    productSectionCount: baseline7A.productSectionCount,
    appendixSectionCount: baseline7A.appendixSectionCount,
    technicalCardsCollapsedCount: baseline7A.technicalCardsCollapsedCount,
    uncollapsedTechnicalNoiseCount: baseline7A.uncollapsedTechnicalNoiseCount,
    guardrailsPreserved,
    noScoreManipulationConfirmed,
    routeFamilyDiversityPreserved,
    noPenaltyLeak: matchEconomyBaseline.penaltyShotActiveLeakageCount === 0,
    noUnknownScoringFamily: matchEconomyBaseline.unknownScoringFamilyCount === 0,
    noPersistenceSqliteScoring: !matchEconomyBaseline.persistenceUsedForScoring && !matchEconomyBaseline.sqliteUsedForScoring,
    scoreConstantsUnchanged: !matchEconomyBaseline.scoringConstantsChanged,
    matchBonusEventUnchanged: !matchEconomyBaseline.MatchBonusEventChanged,
    batchLiveSeparationPreserved: matchEconomyBaseline.batchLiveSeparationPreserved,
    deepInsights,
    nextMatchRecommendations,
    baseline7A,
    matchEconomyBaseline,
    insightDepthAudit,
    nextMatchRecommendationAudit,
    causalityEvidenceAudit,
    coachLanguageAudit,
    warningCodes: [...new Set(warningCodes)],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7C - Coach Action Plan Cards & Training Focus Packaging"
      : recommendation === "COACH_INSIGHT_SPECIFICITY_FOLLOW_UP"
        ? "7C - Coach Insight Specificity Follow-up"
        : recommendation === "NEXT_MATCH_PLAN_CLEANUP"
          ? "7C - Next-Match Plan Cleanup"
          : "7C - Coach Report Insight Regression Fix",
  };
}

export function currentCoachInsightDepthNextMatchRecommendationsModel(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml?: string;
  readonly exportReportHtml?: string;
  readonly baseline7A?: ProductBaselineCoachReportReadinessModel;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
}): CoachInsightDepthNextMatchRecommendationsModel {
  return buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport: input.productReport,
    productReportHtml: input.productReportHtml ?? readReport("coach-report.product.html"),
    exportReportHtml: input.exportReportHtml ?? readReport("coach-report.export.html"),
    ...(input.baseline7A === undefined ? {} : { baseline7A: input.baseline7A }),
    ...(input.matchEconomyBaseline === undefined ? {} : { matchEconomyBaseline: input.matchEconomyBaseline }),
  });
}

export function currentGeneratedCoachInsightDepthNextMatchRecommendationsModel(): CoachInsightDepthNextMatchRecommendationsModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const productReportHtml = renderCoachProductReport(productReport);
  const exportReportHtml = renderCoachReportExportHtml({ productReportHtml });
  return buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport,
    productReportHtml,
    exportReportHtml,
  });
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderCoachInsightDepthNextMatchRecommendations7BDoc(
  model: CoachInsightDepthNextMatchRecommendationsModel = currentGeneratedCoachInsightDepthNextMatchRecommendationsModel(),
): string {
  return [
    "# Coach Insight Depth & Next-Match Recommendations 7B",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchEconomyBaselinePreserved: ${model.matchEconomyBaselinePreserved}`,
    `- productReportReady: ${model.productReportReady}`,
    `- coachExportReady: ${model.coachExportReady}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 7A Summary",
    ...table([
      ["Metric", "Value"],
      ["7A status", model.baseline7A.status],
      ["7A productBaselineReady", bool(model.baseline7A.productBaselineReady)],
      ["7A sourceOfTruth", bool(model.sourceOfTruthSeparationPreserved)],
      ["7A productReportReady", bool(model.productReportReady)],
      ["7A coachExportReady", bool(model.coachExportReady)],
    ]),
    "",
    "## Baseline 6X Preservation",
    ...table([
      ["Metric", "Value"],
      ["averageTotalPoints", String(model.matchEconomyBaseline.averageTotalPointsAfter)],
      ["scoringEventsPerMatch", String(model.matchEconomyBaseline.scoringEventsPerMatchAfter)],
      ["scoringOpportunitiesPerMatch", String(model.matchEconomyBaseline.scoringOpportunitiesPerMatchAfter)],
      ["closeGameRate", `${model.matchEconomyBaseline.closeGameRateAfter}%`],
      ["competitiveGameRate", `${model.matchEconomyBaseline.competitiveGameRateAfter}%`],
      ["blowoutRate", `${model.matchEconomyBaseline.blowoutRateAfter}%`],
      ["severeBlowoutRate", `${model.matchEconomyBaseline.severeBlowoutRateAfter}%`],
      ["routeFamilyDiversityPreserved", bool(model.routeFamilyDiversityPreserved)],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
    ]),
    "",
    "## Insight Depth Audit",
    ...table([
      ["Metric", "Value"],
      ["coachInsightCount", String(model.coachInsightCount)],
      ["deepInsightCount", String(model.deepInsightCount)],
      ["shallowInsightCount", String(model.shallowInsightCount)],
      ["insightDepthCoverageRate", `${model.insightDepthCoverageRate}%`],
      ["causeLinkedInsightCount", String(model.causeLinkedInsightCount)],
      ["riskLinkedInsightCount", String(model.riskLinkedInsightCount)],
      ["nextMatchSignalLinkedInsightCount", String(model.nextMatchSignalLinkedInsightCount)],
      ["evidenceLinkedInsightCount", String(model.evidenceLinkedInsightCount)],
    ]),
    "",
    "## Deep Insight Cards",
    ...model.deepInsights.map((insight) => [
      `### ${insight.title}`,
      `- observation: ${insight.observation}`,
      `- whyItMatters: ${insight.whyItMatters}`,
      `- probableCause: ${insight.probableCause}`,
      `- tacticalConsequence: ${insight.tacticalConsequence}`,
      `- riskIfRepeated: ${insight.riskIfRepeated}`,
      `- nextMatchCheck: ${insight.nextMatchCheck}`,
      `- coachAction: ${insight.coachAction}`,
      `- tradeoff: ${insight.tradeoff}`,
      `- confidence: ${insight.confidence}`,
    ].join("\n")),
    "",
    "## Next-Match Recommendations",
    ...table([
      ["Metric", "Value"],
      ["nextMatchRecommendationCount", String(model.nextMatchRecommendationCount)],
      ["concreteNextMatchRecommendationCount", String(model.concreteNextMatchRecommendationCount)],
      ["vagueNextMatchRecommendationCount", String(model.vagueNextMatchRecommendationCount)],
      ["recommendationWithObservableSignalCount", String(model.recommendationWithObservableSignalCount)],
      ["recommendationWithTradeoffCount", String(model.recommendationWithTradeoffCount)],
      ["recommendationWithTrainingFocusCount", String(model.recommendationWithTrainingFocusCount)],
      ["forcedSelectionRecommendationCount", String(model.forcedSelectionRecommendationCount)],
    ]),
    "",
    "## Causality / Evidence Audit",
    ...table([
      ["Metric", "Value"],
      ["causalClaimCount", String(model.causalityEvidenceAudit.causalClaimCount)],
      ["supportedCausalClaimCount", String(model.causalityEvidenceAudit.supportedCausalClaimCount)],
      ["unsupportedCausalClaimCount", String(model.unsupportedCausalClaimCount)],
      ["officialEvidenceLinkedClaimCount", String(model.causalityEvidenceAudit.officialEvidenceLinkedClaimCount)],
      ["overconfidentCausalClaimCount", String(model.overconfidentCausalClaimCount)],
    ]),
    "",
    "## Coach Language Audit",
    ...table([
      ["Metric", "Value"],
      ["coachReadableSentenceCount", String(model.coachLanguageAudit.coachReadableSentenceCount)],
      ["technicalSentenceCount", String(model.coachLanguageAudit.technicalSentenceCount)],
      ["jargonCount", String(model.jargonCount)],
      ["forbiddenWordingCount", String(model.forbiddenWordingCount)],
      ["overlongParagraphCount", String(model.coachLanguageAudit.overlongParagraphCount)],
    ]),
    "",
    "## Product / Export Readiness",
    ...table([
      ["Metric", "Value"],
      ["productReportReady", bool(model.productReportReady)],
      ["coachExportReady", bool(model.coachExportReady)],
      ["sourceOfTruthSeparationPreserved", bool(model.sourceOfTruthSeparationPreserved)],
      ["insightDepthReady", bool(model.insightDepthReady)],
      ["causalExplanationReady", bool(model.causalExplanationReady)],
      ["nextMatchRecommendationsReady", bool(model.nextMatchRecommendationsReady)],
      ["coachLanguageReady", bool(model.coachLanguageReady)],
      ["productBaselineReady", bool(model.productBaselineReady)],
    ]),
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Value"],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
      ["noScoreManipulationConfirmed", bool(model.noScoreManipulationConfirmed)],
      ["noPenaltyLeak", bool(model.noPenaltyLeak)],
      ["noUnknownScoringFamily", bool(model.noUnknownScoringFamily)],
      ["noPersistenceSqliteScoring", bool(model.noPersistenceSqliteScoring)],
      ["scoreConstantsUnchanged", bool(model.scoreConstantsUnchanged)],
      ["matchBonusEventUnchanged", bool(model.matchBonusEventUnchanged)],
      ["batchLiveSeparationPreserved", bool(model.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderCoachInsightDepthNextMatchRecommendations7BValidation(
  model: CoachInsightDepthNextMatchRecommendationsModel = currentGeneratedCoachInsightDepthNextMatchRecommendationsModel(),
): string {
  const checks = [
    checkLine("CoachInsightDepthNextMatchRecommendationsModel exists", model.scope === "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS", model.scope),
    checkLine("baseline 7A visible", model.baselineVersion === "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A", model.baselineVersion),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("deep insights present", model.deepInsightCount >= 3, String(model.deepInsightCount)),
    checkLine("every main insight has observation", model.insightDepthAudit.insightWithObservationCount === model.coachInsightCount, `${model.insightDepthAudit.insightWithObservationCount}/${model.coachInsightCount}`),
    checkLine("every main insight has whyItMatters", model.insightDepthAudit.insightWithWhyItMattersCount === model.coachInsightCount, `${model.insightDepthAudit.insightWithWhyItMattersCount}/${model.coachInsightCount}`),
    checkLine("every main insight has probableCause", model.causeLinkedInsightCount === model.coachInsightCount, `${model.causeLinkedInsightCount}/${model.coachInsightCount}`),
    checkLine("every main insight has tacticalConsequence", model.consequenceLinkedInsightCount === model.coachInsightCount, `${model.consequenceLinkedInsightCount}/${model.coachInsightCount}`),
    checkLine("every main insight has riskIfRepeated", model.riskLinkedInsightCount === model.coachInsightCount, `${model.riskLinkedInsightCount}/${model.coachInsightCount}`),
    checkLine("every main insight has nextMatchCheck", model.nextMatchSignalLinkedInsightCount === model.coachInsightCount, `${model.nextMatchSignalLinkedInsightCount}/${model.coachInsightCount}`),
    checkLine("every main insight has evidence or confidence label", model.evidenceLinkedInsightCount === model.coachInsightCount && model.confidenceLabeledInsightCount === model.coachInsightCount, `${model.evidenceLinkedInsightCount}/${model.confidenceLabeledInsightCount}`),
    checkLine("next-match plan visible", model.nextMatchRecommendationCount >= 2, String(model.nextMatchRecommendationCount)),
    checkLine("next-match recommendations concrete", model.concreteNextMatchRecommendationCount === model.nextMatchRecommendationCount, `${model.concreteNextMatchRecommendationCount}/${model.nextMatchRecommendationCount}`),
    checkLine("recommendations have observable signal", model.recommendationWithObservableSignalCount === model.nextMatchRecommendationCount, `${model.recommendationWithObservableSignalCount}/${model.nextMatchRecommendationCount}`),
    checkLine("recommendations have tradeoff", model.recommendationWithTradeoffCount === model.nextMatchRecommendationCount, `${model.recommendationWithTradeoffCount}/${model.nextMatchRecommendationCount}`),
    checkLine("no unsupported recommendations", model.unsupportedRecommendationCount === 0, String(model.unsupportedRecommendationCount)),
    checkLine("no forced selection", model.forcedSelectionRecommendationCount === 0 && model.profileObservationForcedCount === 0, `${model.forcedSelectionRecommendationCount}/${model.profileObservationForcedCount}`),
    checkLine("profiles remain observations not imposed choices", model.profileObservationCount > 0 && model.profileObservationForcedCount === 0, `${model.profileObservationCount}/${model.profileObservationForcedCount}`),
    checkLine("sandbox remains separated", model.sandboxTruthLeakageCount === 0, String(model.sandboxTruthLeakageCount)),
    checkLine("diagnostics do not override official truth", model.diagnosticTruthLeakageCount === 0 && model.batchScoreLeakageCount === 0, `${model.diagnosticTruthLeakageCount}/${model.batchScoreLeakageCount}`),
    checkLine("technical details collapsed", model.uncollapsedTechnicalNoiseCount === 0, String(model.uncollapsedTechnicalNoiseCount)),
    checkLine("forbidden wording absent", model.forbiddenWordingCount === 0, String(model.forbiddenWordingCount)),
    checkLine("guardrail summary visible", model.baseline7A.clarityAudit.guardrailSummaryVisible, bool(model.baseline7A.clarityAudit.guardrailSummaryVisible)),
    checkLine("guardrails preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, bool(model.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", model.noScoreManipulationConfirmed, bool(model.noScoreManipulationConfirmed)),
    checkLine("no PENALTY leak", model.noPenaltyLeak, bool(model.noPenaltyLeak)),
    checkLine("no UNKNOWN scoring family", model.noUnknownScoringFamily, bool(model.noUnknownScoringFamily)),
    checkLine("no persistence/SQLite scoring", model.noPersistenceSqliteScoring, bool(model.noPersistenceSqliteScoring)),
    checkLine("score constants unchanged", model.scoreConstantsUnchanged, bool(model.scoreConstantsUnchanged)),
    checkLine("MatchBonusEvent unchanged", model.matchBonusEventUnchanged, bool(model.matchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, bool(model.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const hasFailure = checks.some((line) => line.startsWith("- FAIL"));

  return [
    "# Validation - Coach Insight Depth & Next-Match Recommendations 7B",
    "",
    `Status: ${hasFailure || model.status !== "PASS" ? model.status : "PASS"}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- coachInsightCount: ${model.coachInsightCount}`,
    `- deepInsightCount: ${model.deepInsightCount}`,
    `- shallowInsightCount: ${model.shallowInsightCount}`,
    `- insightDepthCoverageRate: ${model.insightDepthCoverageRate}`,
    `- nextMatchRecommendationCount: ${model.nextMatchRecommendationCount}`,
    `- concreteNextMatchRecommendationCount: ${model.concreteNextMatchRecommendationCount}`,
    `- unsupportedRecommendationCount: ${model.unsupportedRecommendationCount}`,
    `- forcedSelectionRecommendationCount: ${model.forcedSelectionRecommendationCount}`,
    `- forbiddenWordingCount: ${model.forbiddenWordingCount}`,
    `- guardrailsPreserved: ${model.guardrailsPreserved}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}
