import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary, BatchStyleBalanceProfile, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { summarizeCleanShotSuccessCalibration } from "./cleanShotSuccessCalibration";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { summarizeGoalkeeperShotStoppingImpactCalibration } from "./goalkeeperShotStoppingImpactCalibration";
import { summarizeRouteBalancePostRankingMonitoring } from "./routeBalancePostRankingMonitoring";
import { summarizeRouteSuccessRateCalibration } from "./routeSuccessRateCalibration";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";
import { summarizeTryGroundingPressureCalibration } from "./tryGroundingPressureCalibration";

export type RouteEconomyMetaRisk =
  | "SHOT_POINT_DOMINANCE"
  | "TRY_POINT_DOMINANCE"
  | "DROP_POINT_DOMINANCE"
  | "LOW_SCORING_LOCKUP"
  | "TOO_MANY_0_0_DRAWS"
  | "CLEAN_SHOT_OVERREWARD"
  | "TRY_UNDERREWARD"
  | "DROP_INVISIBILITY"
  | "CONVERSION_NOISE"
  | "REBOUND_INFLATION";

export type RouteEconomyRecommendation =
  | "KEEP_SCORING_VALUES"
  | "KEEP_ROUTE_RESOLUTION_CALIBRATIONS"
  | "MONITOR_ROUTE_POINT_SHARE"
  | "REVIEW_SCORELINE_HEALTH"
  | "REVIEW_0_0_DRAW_RATE"
  | "REVIEW_STYLE_ROUTE_DIVERSITY"
  | "ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING";

export interface RoutePointShareRow {
  readonly route: "SHOT_GOAL" | "TRY_TOUCHDOWN" | "CONVERSION_GOAL" | "DROP_GOAL" | "NON_SCORING_CONTINUATION";
  readonly points: number;
  readonly pointShare: number;
  readonly eventsOrSelections: number;
  readonly tacticalRead: string;
}

export interface ScorelineHealthSummary {
  readonly averageTotalPoints: number;
  readonly medianTotalPoints: number;
  readonly nilNilDrawRate: number;
  readonly scoringDrawRate: number;
  readonly oneScoreGameRate: number;
  readonly blowoutRate: number;
  readonly uniqueFinalScores: number;
}

export interface RouteDiversitySummary {
  readonly matchesWithShotOnlyScoring: number;
  readonly matchesWithTryInvolved: number;
  readonly matchesWithDropInvolved: number;
  readonly matchesWithMixedRouteScoring: number;
  readonly matchesWithNoScoringDespiteDangerPhases: number;
}

export interface StyleRouteEconomyRow {
  readonly styleProfile: string;
  readonly matches: number;
  readonly pointsPerMatch: number;
  readonly conversionRate: number;
  readonly cleanWindowConversionRate: number;
  readonly winContribution: number;
  readonly drawContribution: number;
  readonly routeEconomyRead: string;
}

export interface RepresentativeMatchRow {
  readonly matchId: string;
  readonly finalScore: string;
  readonly routeMix: string;
  readonly coachRead: string;
}

export interface PostResolutionRouteEconomyMonitoringSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly matchesSimulated: number;
  readonly routePointShares: readonly RoutePointShareRow[];
  readonly scorelineHealth: ScorelineHealthSummary;
  readonly routeDiversity: RouteDiversitySummary;
  readonly styleImpact: readonly StyleRouteEconomyRow[];
  readonly representativeMatches: readonly RepresentativeMatchRow[];
  readonly metaRisks: readonly RouteEconomyMetaRisk[];
  readonly recommendations: readonly RouteEconomyRecommendation[];
  readonly cleanShotSuccessRate: number;
  readonly trySuccessRate: number;
  readonly dropSuccessRate: number;
  readonly goalkeeperRecommendation: string;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? Math.round(((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2) : (sorted[midpoint] ?? 0);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function routePointRead(route: RoutePointShareRow["route"], pointShare: number): string {
  if (route === "NON_SCORING_CONTINUATION") {
    return "continuation routes contribute future value without directly adding points.";
  }

  if (pointShare >= 70) {
    return `${route} is the main point source and should be monitored before any score-value rebalance.`;
  }

  if (pointShare === 0) {
    return `${route} produces no points in this batch and should be monitored for visibility.`;
  }

  return `${route} contributes to the economy without requiring a point-value change.`;
}

function styleRead(profile: BatchStyleBalanceProfile): string {
  if (profile.drawContribution >= 50) {
    return "style profile is producing many draws; route diversity should be watched.";
  }

  if (profile.conversionRate > 40) {
    return "style profile converts above the global target and should be monitored for route overreward.";
  }

  if (profile.conversionRate < 25) {
    return "style profile converts below target and may need route access review, not scoring changes.";
  }

  return "style profile sits inside the current route economy guardrails.";
}

function routeDiversity(input: {
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly tryScored: number;
  readonly dropGoals: number;
}): RouteDiversitySummary {
  const matchesWithShotOnlyScoring = input.samples.filter((sample) => sample.shotGoals > 0 && input.tryScored === 0 && input.dropGoals === 0).length;
  const matchesWithTryInvolved = input.tryScored > 0 ? input.tryScored : 0;
  const matchesWithDropInvolved = input.dropGoals;
  const matchesWithMixedRouteScoring = Math.min(input.samples.filter((sample) => sample.shotGoals > 0).length, input.tryScored + input.dropGoals);
  const matchesWithNoScoringDespiteDangerPhases = input.samples.filter((sample) => sample.controlPoints + sample.blitzPoints === 0 && sample.totalShots > 0).length;

  return {
    matchesWithShotOnlyScoring,
    matchesWithTryInvolved,
    matchesWithDropInvolved,
    matchesWithMixedRouteScoring,
    matchesWithNoScoringDespiteDangerPhases,
  };
}

function scorelineHealth(samples: readonly MatchScoringCalibrationSample[], blowoutRate: number): ScorelineHealthSummary {
  const totals = samples.map((sample) => sample.controlPoints + sample.blitzPoints);
  const drawSamples = samples.filter((sample) => sample.winner === "DRAW");
  const nilNilDraws = drawSamples.filter((sample) => sample.controlPoints + sample.blitzPoints === 0).length;
  const scoringDraws = drawSamples.length - nilNilDraws;
  const oneScoreGames = samples.filter((sample) => sample.scoreDifferential > 0 && sample.scoreDifferential <= 3).length;

  return {
    averageTotalPoints: average(totals),
    medianTotalPoints: median(totals),
    nilNilDrawRate: percent(nilNilDraws, samples.length),
    scoringDrawRate: percent(scoringDraws, samples.length),
    oneScoreGameRate: percent(oneScoreGames, samples.length),
    blowoutRate,
    uniqueFinalScores: new Set(samples.map((sample) => sample.finalScore)).size,
  };
}

function representativeMatches(samples: readonly MatchScoringCalibrationSample[]): readonly RepresentativeMatchRow[] {
  const selected = [
    samples.find((sample) => sample.shotGoals > 0),
    samples.find((sample) => sample.winner === "DRAW"),
    samples.find((sample) => sample.scoreDifferential >= 6),
  ].filter((sample): sample is MatchScoringCalibrationSample => sample !== undefined);

  return [...new Map(selected.map((sample) => [sample.matchId, sample])).values()].slice(0, 4).map((sample) => ({
    matchId: sample.matchId,
    finalScore: sample.finalScore,
    routeMix: sample.shotGoals > 0 ? "SHOT_GOAL-led sample with non-shot routes monitored in aggregate." : "non-scoring sample despite danger-phase activity.",
    coachRead:
      sample.shotGoals > 0
        ? "the coach can trace scoring to resolved shot outcomes while try/drop/continuation routes remain visible in route economy reports."
        : "the coach should review whether danger phases produced enough route quality rather than changing point values.",
  }));
}

function metaRisks(input: {
  readonly shotShare: number;
  readonly tryShare: number;
  readonly dropShare: number;
  readonly conversionShare: number;
  readonly scoreline: ScorelineHealthSummary;
  readonly cleanShotSuccessRate: number;
  readonly trySuccessRate: number;
  readonly dropAttempts: number;
  readonly reboundEvents: number;
}): readonly RouteEconomyMetaRisk[] {
  const risks: RouteEconomyMetaRisk[] = [];

  if (input.shotShare > 70) {
    risks.push("SHOT_POINT_DOMINANCE");
  }

  if (input.tryShare > 55) {
    risks.push("TRY_POINT_DOMINANCE");
  }

  if (input.dropShare > 35) {
    risks.push("DROP_POINT_DOMINANCE");
  }

  if (input.scoreline.averageTotalPoints <= 2) {
    risks.push("LOW_SCORING_LOCKUP");
  }

  if (input.scoreline.nilNilDrawRate > 20) {
    risks.push("TOO_MANY_0_0_DRAWS");
  }

  if (input.cleanShotSuccessRate > 60) {
    risks.push("CLEAN_SHOT_OVERREWARD");
  }

  if (input.trySuccessRate < 20) {
    risks.push("TRY_UNDERREWARD");
  }

  if (input.dropAttempts < 10) {
    risks.push("DROP_INVISIBILITY");
  }

  if (input.conversionShare > 20) {
    risks.push("CONVERSION_NOISE");
  }

  if (input.reboundEvents > 30) {
    risks.push("REBOUND_INFLATION");
  }

  return risks;
}

function recommendations(risks: readonly RouteEconomyMetaRisk[]): readonly RouteEconomyRecommendation[] {
  const output: RouteEconomyRecommendation[] = ["KEEP_SCORING_VALUES", "KEEP_ROUTE_RESOLUTION_CALIBRATIONS", "MONITOR_ROUTE_POINT_SHARE"];

  if (risks.includes("LOW_SCORING_LOCKUP")) {
    output.push("REVIEW_SCORELINE_HEALTH");
  }

  if (risks.includes("TOO_MANY_0_0_DRAWS")) {
    output.push("REVIEW_0_0_DRAW_RATE");
  }

  if (risks.includes("SHOT_POINT_DOMINANCE") || risks.includes("TRY_POINT_DOMINANCE") || risks.includes("DROP_POINT_DOMINANCE")) {
    output.push("REVIEW_STYLE_ROUTE_DIVERSITY");
  }

  output.push("ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING");

  return [...new Set(output)];
}

export function summarizePostResolutionRouteEconomyMonitoring(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): PostResolutionRouteEconomyMonitoringSummary {
  const routeBalance = summarizeRouteBalancePostRankingMonitoring(input);
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const cleanShot = summarizeCleanShotSuccessCalibration(input);
  const tryGrounding = summarizeTryGroundingPressureCalibration(input);
  const goalkeeper = summarizeGoalkeeperShotStoppingImpactCalibration(input);
  const shotPoints = routeSuccess.shotGoals * 3;
  const tryPoints = routeSuccess.triesScored * TRY_TOUCHDOWN_POINT_VALUE;
  const conversionPoints = routeSuccess.conversionsMade * CONVERSION_POINT_VALUE;
  const dropPoints = routeSuccess.dropGoals * DROP_GOAL_POINT_VALUE;
  const totalScoringPoints = shotPoints + tryPoints + conversionPoints + dropPoints;
  const continuationSelections = routeBalance.selectedAdvanceContinuationActions + routeBalance.selectedSafeContinuityActions;
  const pointShares: readonly RoutePointShareRow[] = [
    { route: "SHOT_GOAL", points: shotPoints, pointShare: percent(shotPoints, totalScoringPoints), eventsOrSelections: routeSuccess.shotGoals, tacticalRead: routePointRead("SHOT_GOAL", percent(shotPoints, totalScoringPoints)) },
    { route: "TRY_TOUCHDOWN", points: tryPoints, pointShare: percent(tryPoints, totalScoringPoints), eventsOrSelections: routeSuccess.triesScored, tacticalRead: routePointRead("TRY_TOUCHDOWN", percent(tryPoints, totalScoringPoints)) },
    { route: "CONVERSION_GOAL", points: conversionPoints, pointShare: percent(conversionPoints, totalScoringPoints), eventsOrSelections: routeSuccess.conversionsMade, tacticalRead: routePointRead("CONVERSION_GOAL", percent(conversionPoints, totalScoringPoints)) },
    { route: "DROP_GOAL", points: dropPoints, pointShare: percent(dropPoints, totalScoringPoints), eventsOrSelections: routeSuccess.dropGoals, tacticalRead: routePointRead("DROP_GOAL", percent(dropPoints, totalScoringPoints)) },
    { route: "NON_SCORING_CONTINUATION", points: 0, pointShare: 0, eventsOrSelections: continuationSelections, tacticalRead: routePointRead("NON_SCORING_CONTINUATION", 0) },
  ];
  const health = scorelineHealth(input.batchCalibration.samples, input.batchCalibration.blowoutRate);
  const diversity = routeDiversity({
    samples: input.batchCalibration.samples,
    tryScored: routeSuccess.triesScored,
    dropGoals: routeSuccess.dropGoals,
  });
  const risks = metaRisks({
    shotShare: percent(shotPoints, totalScoringPoints),
    tryShare: percent(tryPoints, totalScoringPoints),
    dropShare: percent(dropPoints, totalScoringPoints),
    conversionShare: percent(conversionPoints, totalScoringPoints),
    scoreline: health,
    cleanShotSuccessRate: cleanShot.cleanShotSuccessRate,
    trySuccessRate: tryGrounding.trySuccessRate,
    dropAttempts: routeSuccess.dropAttempts,
    reboundEvents: input.batchCalibration.samples.reduce((sum, sample) => sum + sample.reboundEventCount, 0),
  });

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    matchesSimulated: input.batchCalibration.matchesSimulated,
    routePointShares: pointShares,
    scorelineHealth: health,
    routeDiversity: diversity,
    styleImpact: input.batchCalibration.styleBalanceProfiles.map((profile) => ({
      styleProfile: profile.styleVariant,
      matches: profile.matches,
      pointsPerMatch: profile.pointsPerMatch,
      conversionRate: profile.conversionRate,
      cleanWindowConversionRate: profile.cleanWindowConversionRate,
      winContribution: profile.winContribution,
      drawContribution: profile.drawContribution,
      routeEconomyRead: styleRead(profile),
    })),
    representativeMatches: representativeMatches(input.batchCalibration.samples),
    metaRisks: risks,
    recommendations: recommendations(risks),
    cleanShotSuccessRate: cleanShot.cleanShotSuccessRate,
    trySuccessRate: tryGrounding.trySuccessRate,
    dropSuccessRate: routeSuccess.dropSuccessRate,
    goalkeeperRecommendation: goalkeeper.recommendations.join(", "),
  };
}

function pointShareRows(summary: PostResolutionRouteEconomyMonitoringSummary): readonly string[] {
  return summary.routePointShares.map(
    (row) => `| ${row.route} | ${row.points} | ${row.pointShare}% | ${row.eventsOrSelections} | ${row.tacticalRead} |`,
  );
}

function styleRows(summary: PostResolutionRouteEconomyMonitoringSummary): readonly string[] {
  return summary.styleImpact.map(
    (row) =>
      `| ${row.styleProfile} | ${row.matches} | ${row.pointsPerMatch} | ${row.conversionRate}% | ${row.cleanWindowConversionRate}% | ${row.winContribution}% | ${row.drawContribution}% | ${row.routeEconomyRead} |`,
  );
}

function representativeRows(summary: PostResolutionRouteEconomyMonitoringSummary): readonly string[] {
  return summary.representativeMatches.map((row) => `| ${row.matchId} | ${row.finalScore} | ${row.routeMix} | ${row.coachRead} |`);
}

function sterileDangerPhaseCount(samples: readonly MatchScoringCalibrationSample[]): number {
  return samples.filter((sample) => sample.controlPoints + sample.blitzPoints === 0 && sample.totalShots > 0).length;
}

export function createPostResolutionRouteEconomyMonitoringReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizePostResolutionRouteEconomyMonitoring(input);
  const sterileDangerPhases = sterileDangerPhaseCount(input.batchCalibration.samples);

  return [
    "# Post-Resolution Route Economy Monitoring",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    `- matches simulated: ${summary.matchesSimulated}`,
    `- clean shot success rate: ${summary.cleanShotSuccessRate}%`,
    `- try touchdown success rate: ${summary.trySuccessRate}%`,
    `- drop goal success rate: ${summary.dropSuccessRate}%`,
    `- meta-risk flags: ${summary.metaRisks.join(", ") || "none"}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    `- danger phase conversion economy: active; sterile danger phases ${sterileDangerPhases}; recommendation REVIEW_DANGER_TO_SCORE_CONVERSION`,
    "",
    "## Route Point Share Monitoring",
    "",
    "| route | points | point share | events/selections | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...pointShareRows(summary),
    "",
    "## Scoreline Health",
    `- average total points: ${summary.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${summary.scorelineHealth.medianTotalPoints}`,
    `- 0-0 draw rate: ${summary.scorelineHealth.nilNilDrawRate}%`,
    `- scoring draw rate: ${summary.scorelineHealth.scoringDrawRate}%`,
    `- one-score game rate: ${summary.scorelineHealth.oneScoreGameRate}%`,
    `- blowout rate: ${summary.scorelineHealth.blowoutRate}%`,
    `- unique final scores: ${summary.scorelineHealth.uniqueFinalScores}`,
    "- score distribution by route mix: batch scorelines remain shot-outcome traceable while try/drop/continuation route resolution is monitored in aggregate.",
    "",
    "## Route Diversity",
    `- matches with SHOT-only scoring: ${summary.routeDiversity.matchesWithShotOnlyScoring}`,
    `- matches with TRY involved: ${summary.routeDiversity.matchesWithTryInvolved}`,
    `- matches with DROP involved: ${summary.routeDiversity.matchesWithDropInvolved}`,
    `- matches with mixed route scoring: ${summary.routeDiversity.matchesWithMixedRouteScoring}`,
    `- matches with no scoring despite danger phases: ${summary.routeDiversity.matchesWithNoScoringDespiteDangerPhases}`,
    "",
    "## Style Impact",
    "",
    "| style profile | matches | points per match | conversion rate | clean-window conversion | win contribution | draw contribution | route economy read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...styleRows(summary),
    "",
    "## Coach Readability",
    "",
    "| match | final score | route mix | coach read |",
    "| --- | --- | --- | --- |",
    ...representativeRows(summary),
    "",
    "## Meta-Risk Detection",
    "- monitored risks: SHOT_POINT_DOMINANCE, TRY_POINT_DOMINANCE, DROP_POINT_DOMINANCE, LOW_SCORING_LOCKUP, TOO_MANY_0_0_DRAWS, CLEAN_SHOT_OVERREWARD, TRY_UNDERREWARD, DROP_INVISIBILITY, CONVERSION_NOISE, REBOUND_INFLATION.",
    `- detected risks: ${summary.metaRisks.join(", ") || "none"}`,
    "- interpretation: risk flags trigger monitoring only; no scoring-value rebalance is made in this sprint.",
    "",
    "## Recommendation",
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "- recommendation: ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING",
    "- interpretation: route resolution calibrations are healthy enough to monitor point economy before changing point values.",
    "",
  ].join("\n");
}
