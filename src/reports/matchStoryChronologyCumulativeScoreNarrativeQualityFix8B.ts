import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { auditMatchStoryChronology, type MatchStoryChronologyAudit } from "./matchStoryChronologyAudit";
import { auditMatchStoryCumulativeScore, type MatchStoryCumulativeScoreAudit } from "./matchStoryCumulativeScoreAudit";
import { auditMatchStoryNarrativeQuality, type MatchStoryNarrativeQualityAudit } from "./matchStoryNarrativeQualityAudit";
import {
  auditMatchStoryReportIntegrationRegression,
  type MatchStoryReportIntegrationRegressionAudit,
} from "./matchStoryReportIntegrationRegressionAudit";
import {
  auditMatchStorySourceOfTruthRegression,
  type MatchStorySourceOfTruthRegressionAudit,
} from "./matchStorySourceOfTruthRegressionAudit";
import {
  currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel,
  type OfficialMatchStorySpineEngineCausalityProof8AModel,
} from "./officialMatchStorySpineEngineCausalityProof8A";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { auditTurningPointNarrativeOrder, type TurningPointNarrativeOrderAudit } from "./turningPointNarrativeOrderAudit";

export type OfficialMatchStoryChronologyNarrativeQualityFixStatus = "PASS" | "PARTIAL" | "FAIL";
export type OfficialMatchStoryChronologyNarrativeQualityFixRecommendation =
  | "KEEP_OFFICIAL_MATCH_STORY_SPINE"
  | "MATCH_NARRATIVE_QUALITY_FOLLOW_UP"
  | "STORY_CHRONOLOGY_FOLLOW_UP"
  | "STORY_EXPORT_INTEGRATION_CLEANUP"
  | "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH";

export interface OfficialMatchStoryChronologyNarrativeQualityFixModel {
  readonly status: OfficialMatchStoryChronologyNarrativeQualityFixStatus;
  readonly scope: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX";
  readonly version: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B";
  readonly baselineVersion: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8A: OfficialMatchStorySpineEngineCausalityProof8AModel;
  readonly storySpine: OfficialMatchStorySpineModel;
  readonly chronologyAudit: MatchStoryChronologyAudit;
  readonly cumulativeScoreAudit: MatchStoryCumulativeScoreAudit;
  readonly turningPointOrderAudit: TurningPointNarrativeOrderAudit;
  readonly narrativeQualityAudit: MatchStoryNarrativeQualityAudit;
  readonly sourceOfTruthRegressionAudit: MatchStorySourceOfTruthRegressionAudit;
  readonly reportIntegrationRegressionAudit: MatchStoryReportIntegrationRegressionAudit;
  readonly storyChronologyReady: boolean;
  readonly cumulativeScoreReady: boolean;
  readonly turningPointOrderReady: boolean;
  readonly narrativeQualityReady: boolean;
  readonly shortNarrativeQualityReady: boolean;
  readonly detailedNarrativeQualityReady: boolean;
  readonly coachFacingNarrativeQualityReady: boolean;
  readonly mechanicalNarrativeRemoved: boolean;
  readonly scoreTimelineConsistencyReady: boolean;
  readonly storyRegressionFixed: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly reportIntegrationReady: boolean;
  readonly exportLengthPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly warningCodes: readonly string[];
  readonly recommendation: OfficialMatchStoryChronologyNarrativeQualityFixRecommendation;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
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

function deriveWarningCodes(model: Omit<OfficialMatchStoryChronologyNarrativeQualityFixModel, "warningCodes">): readonly string[] {
  return [...new Set([
    ...model.storySpine.warningCodes,
    ...model.chronologyAudit.storyChronologyWarningCodes,
    ...model.cumulativeScoreAudit.scoreTimelineWarningCodes,
    ...model.turningPointOrderAudit.turningPointOrderWarningCodes,
    ...model.narrativeQualityAudit.narrativeQualityWarningCodes,
    ...model.sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...model.reportIntegrationRegressionAudit.reportIntegrationWarningCodes,
    ...(model.status === "PASS"
      ? ["MATCH_STORY_CHRONOLOGY_NARRATIVE_QUALITY_FIX_COMPLETE"]
      : model.status === "PARTIAL"
        ? ["MATCH_STORY_CHRONOLOGY_FIX_PARTIAL"]
        : ["MATCH_STORY_CHRONOLOGY_FIX_FAIL"]),
  ])];
}

export function buildOfficialMatchStoryChronologyNarrativeQualityFix8BModel(input: {
  readonly baseline8A: OfficialMatchStorySpineEngineCausalityProof8AModel;
  readonly storySpine: OfficialMatchStorySpineModel;
  readonly chronologyAudit: MatchStoryChronologyAudit;
  readonly cumulativeScoreAudit: MatchStoryCumulativeScoreAudit;
  readonly turningPointOrderAudit: TurningPointNarrativeOrderAudit;
  readonly narrativeQualityAudit: MatchStoryNarrativeQualityAudit;
  readonly sourceOfTruthRegressionAudit: MatchStorySourceOfTruthRegressionAudit;
  readonly reportIntegrationRegressionAudit: MatchStoryReportIntegrationRegressionAudit;
}): OfficialMatchStoryChronologyNarrativeQualityFixModel {
  const storyChronologyReady = input.chronologyAudit.storySegmentsChronological &&
    input.chronologyAudit.storyBeatsChronological &&
    input.chronologyAudit.turningPointsChronological &&
    input.chronologyAudit.segmentScoreRegressionCount === 0 &&
    input.chronologyAudit.segmentScoreResetToZeroCount === 0 &&
    input.chronologyAudit.scoreLabelAmbiguityCount === 0 &&
    input.chronologyAudit.firstDangerAfterScoreContradictionCount === 0;
  const cumulativeScoreReady = input.cumulativeScoreAudit.finalCumulativeScoreMatchesOfficial &&
    input.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount === input.cumulativeScoreAudit.scoreChangeEventCount &&
    input.cumulativeScoreAudit.cumulativeScoreMissingCount === 0 &&
    input.cumulativeScoreAudit.scoreRegressionCount === 0 &&
    input.cumulativeScoreAudit.scoreResetCount === 0 &&
    input.cumulativeScoreAudit.scoreNarrativeMismatchCount === 0;
  const turningPointOrderReady = input.turningPointOrderAudit.turningPointChronologicalOrderReady &&
    input.turningPointOrderAudit.turningPointCount >= 2 &&
    input.turningPointOrderAudit.turningPointCount <= 4 &&
    input.turningPointOrderAudit.firstScoreTurningPointPresent &&
    input.turningPointOrderAudit.invalidFirstDangerLabelCount === 0 &&
    input.turningPointOrderAudit.turningPointGenericTitleCount === 0 &&
    input.turningPointOrderAudit.turningPointGenericWhyItTurnedCount === 0;
  const shortNarrativeQualityReady = input.narrativeQualityAudit.shortNarrativeAvailable &&
    input.narrativeQualityAudit.shortNarrativeReadTimeSeconds <= 45;
  const detailedNarrativeQualityReady = input.narrativeQualityAudit.detailedNarrativeAvailable &&
    input.narrativeQualityAudit.detailedNarrativeReadTimeSeconds <= 180;
  const coachFacingNarrativeQualityReady = input.narrativeQualityAudit.coachFacingNarrativeAvailable &&
    input.narrativeQualityAudit.technicalJargonCount === 0 &&
    input.narrativeQualityAudit.coachReadabilityScore >= 85;
  const mechanicalNarrativeRemoved = input.narrativeQualityAudit.mechanicalSentenceCount === 0 &&
    input.narrativeQualityAudit.repeatedSentenceCount === 0 &&
    input.narrativeQualityAudit.placeholderSentenceCount === 0 &&
    input.narrativeQualityAudit.genericTurningPointSentenceCount === 0;
  const narrativeQualityReady = shortNarrativeQualityReady &&
    detailedNarrativeQualityReady &&
    coachFacingNarrativeQualityReady &&
    mechanicalNarrativeRemoved &&
    input.narrativeQualityAudit.chronologyContradictionCount === 0 &&
    input.narrativeQualityAudit.scoreContradictionCount === 0 &&
    input.narrativeQualityAudit.narrativeFlowScore >= 80;
  const sourceOfTruthSeparationPreserved = input.sourceOfTruthRegressionAudit.storyUsesOfficialTimelineOnly &&
    input.sourceOfTruthRegressionAudit.storyUsesOfficialScoreOnly &&
    input.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange &&
    input.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory &&
    input.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory &&
    input.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory &&
    input.sourceOfTruthRegressionAudit.unsupportedTruthClaimCount === 0 &&
    input.sourceOfTruthRegressionAudit.inventedEventCount === 0;
  const reportIntegrationReady = input.reportIntegrationRegressionAudit.productStorySectionVisible &&
    input.reportIntegrationRegressionAudit.exportStorySectionVisible &&
    input.reportIntegrationRegressionAudit.exportCompact45SecondStoryVisible &&
    input.reportIntegrationRegressionAudit.actionPlanStillVisible &&
    input.reportIntegrationRegressionAudit.tacticalMapCardsStillVisible &&
    input.reportIntegrationRegressionAudit.trendsStillVisible;
  const exportLengthPreserved = input.reportIntegrationRegressionAudit.exportUnder900Seconds;
  const matchEconomyBaselinePreserved = input.baseline8A.matchEconomyBaselinePreserved;
  const guardrailsPreserved = input.baseline8A.guardrailsPreserved &&
    !input.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged &&
    !input.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged &&
    input.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved;
  const productBaselineReady = input.baseline8A.productBaselineReady;
  const scoreTimelineConsistencyReady = cumulativeScoreReady &&
    input.narrativeQualityAudit.scoreContradictionCount === 0;
  const storyRegressionFixed = storyChronologyReady &&
    cumulativeScoreReady &&
    turningPointOrderReady &&
    narrativeQualityReady &&
    sourceOfTruthSeparationPreserved;
  const clean = input.baseline8A.status === "PASS" &&
    storyRegressionFixed &&
    reportIntegrationReady &&
    exportLengthPreserved &&
    matchEconomyBaselinePreserved &&
    guardrailsPreserved &&
    productBaselineReady;
  const status: OfficialMatchStoryChronologyNarrativeQualityFixStatus = clean
    ? "PASS"
    : !sourceOfTruthSeparationPreserved || !guardrailsPreserved || !cumulativeScoreReady
      ? "FAIL"
      : "PARTIAL";
  const recommendation: OfficialMatchStoryChronologyNarrativeQualityFixRecommendation = clean
    ? "KEEP_OFFICIAL_MATCH_STORY_SPINE"
    : !storyChronologyReady
      ? "STORY_CHRONOLOGY_FOLLOW_UP"
      : !narrativeQualityReady
        ? "MATCH_NARRATIVE_QUALITY_FOLLOW_UP"
        : !reportIntegrationReady || !exportLengthPreserved
          ? "STORY_EXPORT_INTEGRATION_CLEANUP"
          : "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH";
  const modelWithoutWarnings: Omit<OfficialMatchStoryChronologyNarrativeQualityFixModel, "warningCodes"> = {
    status,
    scope: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX",
    version: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B",
    baselineVersion: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A",
    matchId: input.storySpine.matchId,
    officialScore: input.storySpine.officialScore,
    baseline8A: input.baseline8A,
    storySpine: input.storySpine,
    chronologyAudit: input.chronologyAudit,
    cumulativeScoreAudit: input.cumulativeScoreAudit,
    turningPointOrderAudit: input.turningPointOrderAudit,
    narrativeQualityAudit: input.narrativeQualityAudit,
    sourceOfTruthRegressionAudit: input.sourceOfTruthRegressionAudit,
    reportIntegrationRegressionAudit: input.reportIntegrationRegressionAudit,
    storyChronologyReady,
    cumulativeScoreReady,
    turningPointOrderReady,
    narrativeQualityReady,
    shortNarrativeQualityReady,
    detailedNarrativeQualityReady,
    coachFacingNarrativeQualityReady,
    mechanicalNarrativeRemoved,
    scoreTimelineConsistencyReady,
    storyRegressionFixed,
    sourceOfTruthSeparationPreserved,
    reportIntegrationReady,
    exportLengthPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "8C - Attribute Role Fatigue Causality Deepening"
      : status === "PARTIAL"
        ? "8C - Match Narrative Quality Follow-up"
        : "8C - Official Story Source-of-Truth Regression Fix",
  };

  return {
    ...modelWithoutWarnings,
    warningCodes: deriveWarningCodes(modelWithoutWarnings),
  };
}

export function currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel(): OfficialMatchStoryChronologyNarrativeQualityFixModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const storySpine = productReport.officialMatchStorySpine;
  if (storySpine === undefined) {
    throw new Error("official match story spine must be available for Sprint 8B");
  }
  const productReportHtml = renderCoachProductReport(productReport);
  const baseline8A = currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel();
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });

  return buildOfficialMatchStoryChronologyNarrativeQualityFix8BModel({
    baseline8A,
    storySpine,
    chronologyAudit: auditMatchStoryChronology(storySpine),
    cumulativeScoreAudit: auditMatchStoryCumulativeScore(storySpine, report),
    turningPointOrderAudit: auditTurningPointNarrativeOrder(storySpine),
    narrativeQualityAudit: auditMatchStoryNarrativeQuality(storySpine),
    sourceOfTruthRegressionAudit: auditMatchStorySourceOfTruthRegression(storySpine, report),
    reportIntegrationRegressionAudit: auditMatchStoryReportIntegrationRegression({
      productReportHtml,
      exportReportHtml,
      exportReadTimeSecondsBefore8B: baseline8A.exportReadTimeSecondsAfter8A,
    }),
  });
}

export function renderOfficialMatchStoryChronologyNarrativeQualityFix8BDoc(
  model: OfficialMatchStoryChronologyNarrativeQualityFixModel = currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel(),
): string {
  return [
    "# Match Story Chronology, Cumulative Score & Narrative Quality Fix 8B",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.matchId}`,
    `- official score: ${model.officialScore}`,
    `- storyChronologyReady: ${bool(model.storyChronologyReady)}`,
    `- cumulativeScoreReady: ${bool(model.cumulativeScoreReady)}`,
    `- turningPointOrderReady: ${bool(model.turningPointOrderReady)}`,
    `- narrativeQualityReady: ${bool(model.narrativeQualityReady)}`,
    `- storyRegressionFixed: ${bool(model.storyRegressionFixed)}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 8A Summary",
    ...table([
      ["Metric", "Value"],
      ["baseline 8A status", model.baseline8A.status],
      ["baseline 8A version", model.baseline8A.version],
      ["story segments", String(model.baseline8A.storySpineAudit.storySegmentCount)],
      ["story beats", String(model.baseline8A.storySpineAudit.storyBeatCount)],
      ["turning points", String(model.baseline8A.storySpineAudit.turningPointCount)],
      ["score changes covered", `${model.baseline8A.storySpineAudit.scoreChangeEventsCoveredByStoryCount}/${model.baseline8A.storySpineAudit.scoreChangeEventCount}`],
    ]),
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Preserved"],
      ["7H export length/trend count cleanup", bool(model.baseline8A.baseline7H.status === "PASS")],
      ["6X match economy", bool(model.matchEconomyBaselinePreserved)],
      ["scoring constants unchanged", bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged)],
      ["MatchBonusEvent unchanged", bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged)],
      ["batch/live separation", bool(model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)],
      ["product baseline", bool(model.productBaselineReady)],
    ]),
    "",
    "## Chronology Audit",
    ...table([
      ["Metric", "Value"],
      ["storySegmentsChronological", bool(model.chronologyAudit.storySegmentsChronological)],
      ["storyBeatsChronological", bool(model.chronologyAudit.storyBeatsChronological)],
      ["turningPointsChronological", bool(model.chronologyAudit.turningPointsChronological)],
      ["segmentScoreRegressionCount", String(model.chronologyAudit.segmentScoreRegressionCount)],
      ["segmentScoreResetToZeroCount", String(model.chronologyAudit.segmentScoreResetToZeroCount)],
      ["scoreLabelAmbiguityCount", String(model.chronologyAudit.scoreLabelAmbiguityCount)],
      ["firstDangerAfterScoreContradictionCount", String(model.chronologyAudit.firstDangerAfterScoreContradictionCount)],
    ]),
    "",
    "## Cumulative Score Audit",
    ...table([
      ["Metric", "Value"],
      ["officialScore", model.cumulativeScoreAudit.officialScore],
      ["finalCumulativeScoreFromStory", model.cumulativeScoreAudit.finalCumulativeScoreFromStory],
      ["finalCumulativeScoreMatchesOfficial", bool(model.cumulativeScoreAudit.finalCumulativeScoreMatchesOfficial)],
      ["scoreChangeEventsCoveredByStoryCount", `${model.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount}/${model.cumulativeScoreAudit.scoreChangeEventCount}`],
      ["cumulativeScoreMissingCount", String(model.cumulativeScoreAudit.cumulativeScoreMissingCount)],
      ["scoreRegressionCount", String(model.cumulativeScoreAudit.scoreRegressionCount)],
      ["scoreResetCount", String(model.cumulativeScoreAudit.scoreResetCount)],
      ["scoreNarrativeMismatchCount", String(model.cumulativeScoreAudit.scoreNarrativeMismatchCount)],
    ]),
    "",
    "## Turning Point Order Audit",
    ...table([
      ["Metric", "Value"],
      ["turningPointCount", String(model.turningPointOrderAudit.turningPointCount)],
      ["turningPointChronologicalOrderReady", bool(model.turningPointOrderAudit.turningPointChronologicalOrderReady)],
      ["firstScoreTurningPointPresent", bool(model.turningPointOrderAudit.firstScoreTurningPointPresent)],
      ["firstRealDangerTitleValid", bool(model.turningPointOrderAudit.firstRealDangerTitleValid)],
      ["invalidFirstDangerLabelCount", String(model.turningPointOrderAudit.invalidFirstDangerLabelCount)],
      ["turningPointGenericTitleCount", String(model.turningPointOrderAudit.turningPointGenericTitleCount)],
      ["turningPointGenericWhyItTurnedCount", String(model.turningPointOrderAudit.turningPointGenericWhyItTurnedCount)],
    ]),
    "",
    "## Narrative Quality Audit",
    ...table([
      ["Metric", "Value"],
      ["shortNarrativeReadTimeSeconds", String(model.narrativeQualityAudit.shortNarrativeReadTimeSeconds)],
      ["detailedNarrativeReadTimeSeconds", String(model.narrativeQualityAudit.detailedNarrativeReadTimeSeconds)],
      ["coachFacingNarrativeReadTimeSeconds", String(model.narrativeQualityAudit.coachFacingNarrativeReadTimeSeconds)],
      ["mechanicalSentenceCount", String(model.narrativeQualityAudit.mechanicalSentenceCount)],
      ["repeatedSentenceCount", String(model.narrativeQualityAudit.repeatedSentenceCount)],
      ["placeholderSentenceCount", String(model.narrativeQualityAudit.placeholderSentenceCount)],
      ["metricDumpSentenceCount", String(model.narrativeQualityAudit.metricDumpSentenceCount)],
      ["technicalJargonCount", String(model.narrativeQualityAudit.technicalJargonCount)],
      ["narrativeFlowScore", String(model.narrativeQualityAudit.narrativeFlowScore)],
      ["coachReadabilityScore", String(model.narrativeQualityAudit.coachReadabilityScore)],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    ...table([
      ["Metric", "Value"],
      ["storyUsesOfficialTimelineOnly", bool(model.sourceOfTruthRegressionAudit.storyUsesOfficialTimelineOnly)],
      ["storyUsesOfficialScoreOnly", bool(model.sourceOfTruthRegressionAudit.storyUsesOfficialScoreOnly)],
      ["allStoryScoreClaimsBackedByScoreChange", bool(model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange)],
      ["sandboxExcludedFromOfficialStory", bool(model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory)],
      ["batchExcludedFromOfficialStory", bool(model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory)],
      ["diagnosticSeparatedFromOfficialStory", bool(model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory)],
      ["unsupportedTruthClaimCount", String(model.sourceOfTruthRegressionAudit.unsupportedTruthClaimCount)],
      ["inventedEventCount", String(model.sourceOfTruthRegressionAudit.inventedEventCount)],
    ]),
    "",
    "## Report Integration Regression Audit",
    ...table([
      ["Metric", "Value"],
      ["productStorySectionVisible", bool(model.reportIntegrationRegressionAudit.productStorySectionVisible)],
      ["exportStorySectionVisible", bool(model.reportIntegrationRegressionAudit.exportStorySectionVisible)],
      ["exportCompact45SecondStoryVisible", bool(model.reportIntegrationRegressionAudit.exportCompact45SecondStoryVisible)],
      ["exportReadTimeSecondsBefore8B", String(model.reportIntegrationRegressionAudit.exportReadTimeSecondsBefore8B)],
      ["exportReadTimeSecondsAfter8B", String(model.reportIntegrationRegressionAudit.exportReadTimeSecondsAfter8B)],
      ["exportReadTimeDelta", String(model.reportIntegrationRegressionAudit.exportReadTimeDelta)],
      ["exportUnder900Seconds", bool(model.reportIntegrationRegressionAudit.exportUnder900Seconds)],
      ["actionPlanStillVisible", bool(model.reportIntegrationRegressionAudit.actionPlanStillVisible)],
      ["tacticalMapCardsStillVisible", bool(model.reportIntegrationRegressionAudit.tacticalMapCardsStillVisible)],
      ["trendsStillVisible", bool(model.reportIntegrationRegressionAudit.trendsStillVisible)],
    ]),
    "",
    "## Corrected Story Segments",
    ...table([
      ["#", "Minutes", "Phase", "Score label", "Lead", "Close"],
      ...model.storySpine.segments.map((segment) => [
        String(segment.chronologicalIndex),
        `${segment.startMinute}-${segment.endMinute}`,
        segment.phaseType,
        segment.segmentScoreLabel,
        segment.narrativeLead,
        segment.narrativeClose,
      ]),
    ]),
    "",
    "## Corrected Turning Points",
    ...table([
      ["#", "Minute", "Title", "Previous scores", "Why it turned"],
      ...model.storySpine.turningPoints.map((point) => [
        String(point.chronologicalIndex),
        String(point.minute),
        point.title,
        String(point.previousScoreChangeCount),
        point.whyItTurned,
      ]),
    ]),
    "",
    "## Corrected Short Narrative",
    model.storySpine.narrative.shortNarrative,
    "",
    "## Corrected Coach-Facing Narrative",
    model.storySpine.narrative.coachFacingNarrative,
    "",
    "## Corrected Detailed Narrative Excerpt",
    model.storySpine.narrative.detailedNarrative,
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Value"],
      ["scoreFromScoreChangeAllRuns", bool(model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoreFromScoreChangeAllRuns)],
      ["officialPathConnectedAllRuns", bool(model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.officialPathConnectedAllRuns)],
      ["noScoreCap", bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoreCapApplied)],
      ["noRewrite", bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.postHocRewriteApplied)],
      ["noDeletion", bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringEventsDeleted)],
      ["noForcedScore", bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.forcedOpponentScoreApplied && !model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.forcedTrailingTeamScoreApplied)],
    ]),
    "",
    "## Warning Codes",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- next: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderOfficialMatchStoryChronologyNarrativeQualityFix8BValidation(
  model: OfficialMatchStoryChronologyNarrativeQualityFixModel = currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel(),
): string {
  const checks = [
    checkLine("OfficialMatchStoryChronologyNarrativeQualityFixModel exists", model.scope === "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX", model.version),
    checkLine("status PASS", model.status === "PASS", model.status),
    checkLine("baseline 8A visible", model.baselineVersion === "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A" && model.baseline8A.status === "PASS", model.baseline8A.status),
    checkLine("baseline 7H preserved", model.baseline8A.baseline7H.status === "PASS", model.baseline8A.baseline7H.status),
    checkLine("baseline 6X match economy preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("story spine still exists", model.storySpine.storySpineReady, bool(model.storySpine.storySpineReady)),
    checkLine("story segments still between 4 and 8", model.storySpine.segments.length >= 4 && model.storySpine.segments.length <= 8, String(model.storySpine.segments.length)),
    checkLine("story beats still >= 8", model.storySpine.beats.length >= 8, String(model.storySpine.beats.length)),
    checkLine("turning points still between 2 and 4", model.storySpine.turningPoints.length >= 2 && model.storySpine.turningPoints.length <= 4, String(model.storySpine.turningPoints.length)),
    checkLine("score_change events still covered", model.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount === model.cumulativeScoreAudit.scoreChangeEventCount, `${model.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount}/${model.cumulativeScoreAudit.scoreChangeEventCount}`),
    checkLine("story segments chronological", model.chronologyAudit.storySegmentsChronological, bool(model.chronologyAudit.storySegmentsChronological)),
    checkLine("story beats chronological", model.chronologyAudit.storyBeatsChronological, bool(model.chronologyAudit.storyBeatsChronological)),
    checkLine("turning points chronological", model.chronologyAudit.turningPointsChronological, bool(model.chronologyAudit.turningPointsChronological)),
    checkLine("cumulative score ready", model.cumulativeScoreReady, bool(model.cumulativeScoreReady)),
    checkLine("final cumulative score matches official score", model.cumulativeScoreAudit.finalCumulativeScoreMatchesOfficial, `${model.cumulativeScoreAudit.finalCumulativeScoreFromStory} vs ${model.cumulativeScoreAudit.officialScore}`),
    checkLine("no segment score reset to zero", model.cumulativeScoreAudit.scoreResetCount === 0, String(model.cumulativeScoreAudit.scoreResetCount)),
    checkLine("no segment score regression", model.cumulativeScoreAudit.scoreRegressionCount === 0, String(model.cumulativeScoreAudit.scoreRegressionCount)),
    checkLine("no score label ambiguity", model.chronologyAudit.scoreLabelAmbiguityCount === 0, String(model.chronologyAudit.scoreLabelAmbiguityCount)),
    checkLine("no invalid first danger label", model.turningPointOrderAudit.invalidFirstDangerLabelCount === 0, String(model.turningPointOrderAudit.invalidFirstDangerLabelCount)),
    checkLine("first score turning point present", model.turningPointOrderAudit.firstScoreTurningPointPresent, bool(model.turningPointOrderAudit.firstScoreTurningPointPresent)),
    checkLine("no generic turning point title", model.turningPointOrderAudit.turningPointGenericTitleCount === 0, String(model.turningPointOrderAudit.turningPointGenericTitleCount)),
    checkLine("no generic why-it-turned", model.turningPointOrderAudit.turningPointGenericWhyItTurnedCount === 0, String(model.turningPointOrderAudit.turningPointGenericWhyItTurnedCount)),
    checkLine("short narrative available", model.narrativeQualityAudit.shortNarrativeAvailable, bool(model.narrativeQualityAudit.shortNarrativeAvailable)),
    checkLine("detailed narrative available", model.narrativeQualityAudit.detailedNarrativeAvailable, bool(model.narrativeQualityAudit.detailedNarrativeAvailable)),
    checkLine("coach-facing narrative available", model.narrativeQualityAudit.coachFacingNarrativeAvailable, bool(model.narrativeQualityAudit.coachFacingNarrativeAvailable)),
    checkLine("mechanical sentence count = 0", model.narrativeQualityAudit.mechanicalSentenceCount === 0, String(model.narrativeQualityAudit.mechanicalSentenceCount)),
    checkLine("repeated sentence count = 0", model.narrativeQualityAudit.repeatedSentenceCount === 0, String(model.narrativeQualityAudit.repeatedSentenceCount)),
    checkLine("placeholder sentence count = 0", model.narrativeQualityAudit.placeholderSentenceCount === 0, String(model.narrativeQualityAudit.placeholderSentenceCount)),
    checkLine("chronology contradiction count = 0", model.narrativeQualityAudit.chronologyContradictionCount === 0, String(model.narrativeQualityAudit.chronologyContradictionCount)),
    checkLine("score contradiction count = 0", model.narrativeQualityAudit.scoreContradictionCount === 0, String(model.narrativeQualityAudit.scoreContradictionCount)),
    checkLine("narrative flow score >= 80", model.narrativeQualityAudit.narrativeFlowScore >= 80, String(model.narrativeQualityAudit.narrativeFlowScore)),
    checkLine("coach readability score >= 85", model.narrativeQualityAudit.coachReadabilityScore >= 85, String(model.narrativeQualityAudit.coachReadabilityScore)),
    checkLine("story uses official timeline only", model.sourceOfTruthRegressionAudit.storyUsesOfficialTimelineOnly, bool(model.sourceOfTruthRegressionAudit.storyUsesOfficialTimelineOnly)),
    checkLine("story uses official score only", model.sourceOfTruthRegressionAudit.storyUsesOfficialScoreOnly, bool(model.sourceOfTruthRegressionAudit.storyUsesOfficialScoreOnly)),
    checkLine("all score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange, bool(model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange)),
    checkLine("sandbox excluded from official story", model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory)),
    checkLine("batch excluded from official story", model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory)),
    checkLine("diagnostic separated from official story", model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory)),
    checkLine("no invented event", model.sourceOfTruthRegressionAudit.inventedEventCount === 0, String(model.sourceOfTruthRegressionAudit.inventedEventCount)),
    checkLine("no forced narrative outcome", model.sourceOfTruthRegressionAudit.noForcedNarrativeOutcome, bool(model.sourceOfTruthRegressionAudit.noForcedNarrativeOutcome)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", !model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged, bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("export remains under 900 seconds", model.reportIntegrationRegressionAudit.exportUnder900Seconds, String(model.reportIntegrationRegressionAudit.exportReadTimeSecondsAfter8B)),
    checkLine("no new season memory", model.baseline8A.noSeasonNarrativeAdded, bool(model.baseline8A.noSeasonNarrativeAdded)),
    checkLine("no new team style memory", model.baseline8A.noTeamStyleMemoryAdded, bool(model.baseline8A.noTeamStyleMemoryAdded)),
    checkLine("no new database history feature", !model.storySpine.narrative.shortNarrative.includes("SQLite") && !model.storySpine.narrative.coachFacingNarrative.includes("history"), "story clean"),
  ];
  const validationStatus: OfficialMatchStoryChronologyNarrativeQualityFixStatus = checks.every((check) => check.startsWith("- PASS"))
    ? model.status
    : "FAIL";

  return [
    "# Validation - Match Story Chronology, Cumulative Score & Narrative Quality Fix 8B",
    "",
    `Status: ${validationStatus}`,
    "",
    "## Required Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- story segments: ${model.storySpine.segments.length}`,
    `- story beats: ${model.storySpine.beats.length}`,
    `- turning points: ${model.storySpine.turningPoints.length}`,
    `- score changes covered: ${model.cumulativeScoreAudit.scoreChangeEventsCoveredByStoryCount}/${model.cumulativeScoreAudit.scoreChangeEventCount}`,
    `- segmentScoreRegressionCount: ${model.chronologyAudit.segmentScoreRegressionCount}`,
    `- segmentScoreResetToZeroCount: ${model.chronologyAudit.segmentScoreResetToZeroCount}`,
    `- invalidFirstDangerLabelCount: ${model.turningPointOrderAudit.invalidFirstDangerLabelCount}`,
    `- mechanicalSentenceCount: ${model.narrativeQualityAudit.mechanicalSentenceCount}`,
    `- repeatedSentenceCount: ${model.narrativeQualityAudit.repeatedSentenceCount}`,
    `- narrativeFlowScore: ${model.narrativeQualityAudit.narrativeFlowScore}`,
    `- coachReadabilityScore: ${model.narrativeQualityAudit.coachReadabilityScore}`,
    `- exportReadTimeSecondsAfter8B: ${model.reportIntegrationRegressionAudit.exportReadTimeSecondsAfter8B}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function validateOfficialMatchStoryChronologyNarrativeQualityFix8B(): OfficialMatchStoryChronologyNarrativeQualityFixStatus {
  return currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel().status;
}
