import type { MiniMatchResult, MiniMatchTryEvent } from "../../simulation/miniMatch";
import type { TryOpportunityRecord } from "../actions";
import { resolveConversionAttempt } from "../actions";
import {
  createConversionGeometriesFromTryOpportunities,
  formatConversionGeometryLaneCounts,
  summarizeConversionGeometryStorage,
} from "./conversionGeometry";
import { conversionRuleLabel } from "./conversionRules";
import type {
  ConversionAttemptContext,
  ConversionAttemptResult,
  ConversionRecommendation,
  ConversionResolutionSummary,
} from "./conversionTypes";
import { dropGoalRuleLabel } from "./dropGoalRules";
import { scoringRuleLabel } from "./scoringRules";
import { TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION, tryTouchdownRuleLabel } from "./tryTouchdownRules";

function distanceFromPoint(point: string): number {
  const match = /(\d+)m/.exec(point);
  const value = match?.[1];
  return value === undefined ? 22 : Number.parseInt(value, 10);
}

function scoreDisplay(input: { readonly result: MiniMatchResult; readonly teamA: number; readonly teamB: number }): string {
  return `${input.result.state.context.teamA.displayName} ${input.teamA} - ${input.teamB} ${input.result.state.context.teamB.displayName}`;
}

function parseScoreAfterTry(input: { readonly result: MiniMatchResult; readonly score: string }): { readonly teamA: number; readonly teamB: number } {
  const escapedHome = input.result.state.context.teamA.displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedAway = input.result.state.context.teamB.displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escapedHome} (\\d+) - (\\d+) ${escapedAway}`).exec(input.score);

  return {
    teamA: match?.[1] === undefined ? input.result.summary.finalScore.teamA : Number.parseInt(match[1], 10),
    teamB: match?.[2] === undefined ? input.result.summary.finalScore.teamB : Number.parseInt(match[2], 10),
  };
}

function defendingTeamId(input: { readonly result: MiniMatchResult; readonly scoringTeamId: string }): string {
  return input.scoringTeamId === input.result.state.context.teamA.id
    ? input.result.state.context.teamB.id
    : input.result.state.context.teamA.id;
}

function baseKickerAccuracy(teamId: string): number {
  return teamId === "CONTROL" ? 78 : 74;
}

function baseKickerPower(teamId: string): number {
  return teamId === "CONTROL" ? 75 : 77;
}

function baseKickerComposure(teamId: string): number {
  return teamId === "CONTROL" ? 77 : 71;
}

function pressurePenalty(opportunity: TryOpportunityRecord | undefined): number {
  if (opportunity === undefined) {
    return 4;
  }

  return Math.round((opportunity.contactPressure + opportunity.tacklePressure) / 32);
}

function defenderChargePressure(opportunity: TryOpportunityRecord | undefined): number {
  if (opportunity === undefined) {
    return 35;
  }

  return Math.round(opportunity.defenderGoalLinePressure * 0.45 + opportunity.tacklePressure * 0.35 + opportunity.contactPressure * 0.2);
}

function recommendation(input: {
  readonly attempts: number;
  readonly made: number;
  readonly missingGeometry: number;
}): ConversionRecommendation {
  if (input.missingGeometry > 0) {
    return "FIX_CONVERSION_GEOMETRY";
  }

  if (input.attempts === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  const successRate = Math.round((input.made / input.attempts) * 100);
  if (successRate > 80) {
    return "INCREASE_CONVERSION_DIFFICULTY";
  }

  if (successRate < 55) {
    return "REDUCE_CONVERSION_DIFFICULTY";
  }

  if (input.attempts < 5) {
    return "KEEP_CONVERSION_MODEL_BUT_MONITOR";
  }

  return "KEEP_CONVERSION_MODEL";
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function successRate(attempts: readonly ConversionAttemptResult[]): number {
  if (attempts.length === 0) {
    return 0;
  }

  return Math.round((attempts.filter((attempt) => attempt.outcome === "CONVERSION_GOAL").length / attempts.length) * 100);
}

function attemptsForLaneGroup(input: {
  readonly attempts: readonly ConversionAttemptResult[];
  readonly laneGroup: "CENTRAL" | "HALF_SPACE" | "WIDE";
}): readonly ConversionAttemptResult[] {
  return input.attempts.filter((attempt) => {
    if (input.laneGroup === "CENTRAL") {
      return attempt.groundingLane === "C";
    }

    if (input.laneGroup === "HALF_SPACE") {
      return attempt.groundingLane === "HSL" || attempt.groundingLane === "HSR";
    }

    return attempt.groundingLane === "CL" || attempt.groundingLane === "CR";
  });
}

function laneRateLine(input: {
  readonly lane: string;
  readonly attempts: readonly ConversionAttemptResult[];
}): string {
  if (input.attempts.length === 0) {
    return `${input.lane}: no sample`;
  }

  const made = input.attempts.filter((attempt) => attempt.outcome === "CONVERSION_GOAL").length;

  return `${input.lane}: ${made}/${input.attempts.length} (${successRate(input.attempts)}%)`;
}

function contextFromBatch(input: {
  readonly result: MiniMatchResult;
  readonly opportunity: TryOpportunityRecord | undefined;
  readonly geometry: ReturnType<typeof createConversionGeometriesFromTryOpportunities>[number];
}): ConversionAttemptContext {
  const opportunity = input.opportunity;
  const distance = distanceFromPoint(input.geometry.recommendedConversionPoint);

  return {
    sourceTryActionId: input.geometry.sourceActionId,
    scoringTeamId: input.geometry.scoringTeamId,
    scoringTeamName: input.geometry.scoringTeamName,
    defendingTeamId: defendingTeamId({ result: input.result, scoringTeamId: input.geometry.scoringTeamId }),
    kickerId: `${input.geometry.scoringTeamId}-conversion-kicker`,
    kickerRole: `${input.geometry.scoringTeamName} conversion kicker`,
    groundingZone: input.geometry.groundingZone,
    groundingLane: input.geometry.groundingLane,
    groundingPoint: input.geometry.groundingPoint,
    conversionLine: input.geometry.conversionLine,
    selectedConversionPoint: input.geometry.recommendedConversionPoint,
    distanceFromGoalLine: distance,
    angleDifficulty: input.geometry.conversionAngleDifficulty,
    kickerAccuracy: baseKickerAccuracy(input.geometry.scoringTeamId),
    kickerPower: baseKickerPower(input.geometry.scoringTeamId),
    kickerComposure: baseKickerComposure(input.geometry.scoringTeamId),
    fatiguePenalty: Math.round((opportunity?.fatiguePenalty ?? 8) / 4),
    pressurePenalty: pressurePenalty(opportunity),
    defenderChargePressure: defenderChargePressure(opportunity),
    defendingTeamBehindGoalLine: input.geometry.defendingTeamBehindGoalLine,
    scoreBefore: "batch diagnostic score before conversion",
    scoreAfterIfGoal: "batch diagnostic score before conversion + 2 points",
    scoreAfterIfNoScore: "batch diagnostic score unchanged",
  };
}

function contextFromLive(input: {
  readonly result: MiniMatchResult;
  readonly event: MiniMatchTryEvent;
}): ConversionAttemptContext | undefined {
  if (input.event.eventType !== "TRY_TOUCHDOWN_SCORED" || input.event.conversionGeometry === undefined) {
    return undefined;
  }

  const geometry = input.event.conversionGeometry;
  const distance = distanceFromPoint(geometry.recommendedConversionPoint);
  const scoreAfterTry = parseScoreAfterTry({ result: input.result, score: input.event.scoreAfter });
  const teamAAfterGoal =
    input.event.teamId === input.result.state.context.teamA.id
      ? scoreAfterTry.teamA + 2
      : scoreAfterTry.teamA;
  const teamBAfterGoal =
    input.event.teamId === input.result.state.context.teamB.id
      ? scoreAfterTry.teamB + 2
      : scoreAfterTry.teamB;

  return {
    sourceTryActionId: input.event.actionId,
    scoringTeamId: input.event.teamId,
    scoringTeamName: input.event.teamName,
    defendingTeamId: defendingTeamId({ result: input.result, scoringTeamId: input.event.teamId }),
    kickerId: `${input.event.teamId}-conversion-kicker`,
    kickerRole: `${input.event.teamName} conversion kicker`,
    groundingZone: geometry.groundingZone,
    groundingLane: geometry.groundingLane,
    groundingPoint: geometry.groundingPoint,
    conversionLine: geometry.conversionLine,
    selectedConversionPoint: geometry.recommendedConversionPoint,
    distanceFromGoalLine: distance,
    angleDifficulty: geometry.conversionAngleDifficulty,
    kickerAccuracy: baseKickerAccuracy(input.event.teamId),
    kickerPower: baseKickerPower(input.event.teamId),
    kickerComposure: baseKickerComposure(input.event.teamId),
    fatiguePenalty: Math.round(input.event.fatiguePenalty / 4),
    pressurePenalty: Math.round((input.event.contactPressure + input.event.tacklePressure) / 32),
    defenderChargePressure: Math.round(input.event.defenderGoalLinePressure * 0.45 + input.event.tacklePressure * 0.35 + input.event.contactPressure * 0.2),
    defendingTeamBehindGoalLine: geometry.defendingTeamBehindGoalLine,
    scoreBefore: input.event.scoreAfter,
    scoreAfterIfGoal: scoreDisplay({ result: input.result, teamA: teamAAfterGoal, teamB: teamBAfterGoal }),
    scoreAfterIfNoScore: input.event.scoreAfter,
  };
}

export function summarizeConversionResolution(input: {
  readonly result: MiniMatchResult;
  readonly opportunities: readonly TryOpportunityRecord[];
}): ConversionResolutionSummary {
  const geometry = summarizeConversionGeometryStorage(input.opportunities);
  const geometries = createConversionGeometriesFromTryOpportunities(input.opportunities);
  const attempts = geometries.map((item) =>
    resolveConversionAttempt(
      contextFromBatch({
        result: input.result,
        opportunity: input.opportunities.find((opportunity) => `${opportunity.matchId}-try` === item.sourceActionId),
        geometry: item,
      }),
    ),
  );
  const liveAttempts = input.result.summary.liveTryEvents
    .map((event) => contextFromLive({ result: input.result, event }))
    .filter((context): context is ConversionAttemptContext => context !== undefined)
    .map((context) => resolveConversionAttempt(context));
  const made = attempts.filter((attempt) => attempt.outcome === "CONVERSION_GOAL").length;
  const missed = attempts.filter((attempt) => attempt.outcome === "CONVERSION_MISSED").length;
  const blocked = attempts.filter((attempt) => attempt.outcome === "CONVERSION_BLOCKED").length;
  const invalid = attempts.filter((attempt) => attempt.outcome === "CONVERSION_INVALID").length;
  const liveMade = liveAttempts.filter((attempt) => attempt.outcome === "CONVERSION_GOAL").length;
  const batchConversionPoints = attempts.reduce((sum, attempt) => sum + attempt.pointValue, 0);
  const liveConversionPoints = liveAttempts.reduce((sum, attempt) => sum + attempt.pointValue, 0);
  const centralAttempts = attemptsForLaneGroup({ attempts, laneGroup: "CENTRAL" });
  const halfSpaceAttempts = attemptsForLaneGroup({ attempts, laneGroup: "HALF_SPACE" });
  const wideAttempts = attemptsForLaneGroup({ attempts, laneGroup: "WIDE" });

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    batchTryTouchdownsScored: geometry.tryScoredCount,
    batchConversionAttempts: attempts.length,
    batchConversionsMade: made,
    batchConversionsMissed: missed,
    batchConversionsBlocked: blocked,
    batchInvalidConversions: invalid,
    batchConversionSuccessRate: attempts.length === 0 ? 0 : Math.round((made / attempts.length) * 100),
    centralConversionSuccessRate: successRate(centralAttempts),
    halfSpaceConversionSuccessRate: successRate(halfSpaceAttempts),
    wideConversionSuccessRate: successRate(wideAttempts),
    averageAngleDifficulty: average(attempts.map((attempt) => attempt.angleDifficulty)),
    averageDistance: average(attempts.map((attempt) => attempt.distanceFromGoalLine)),
    averageKickExecutionScore: average(attempts.map((attempt) => attempt.kickExecutionScore)),
    averagePressureDifficulty: average(attempts.map((attempt) => attempt.pressureDifficultyScore)),
    batchConversionPoints,
    liveConversionAttempts: liveAttempts.length,
    liveConversionsMade: liveMade,
    liveConversionPoints,
    missingConversionGeometryRows: geometry.missingGeometryRows,
    conversionAttemptsAfterFailedTries: input.result.summary.liveTryEvents.filter((event) => event.eventType !== "TRY_TOUCHDOWN_SCORED" && event.conversionGeometryStored).length,
    recommendation: recommendation({
      attempts: attempts.length,
      made,
      missingGeometry: geometry.missingGeometryRows,
    }),
    attempts,
    liveAttempts,
  };
}

export function createConversionResolutionReport(input: {
  readonly result: MiniMatchResult;
  readonly opportunities: readonly TryOpportunityRecord[];
  readonly shotPoints: number;
  readonly tryPoints: number;
}): string {
  const summary = summarizeConversionResolution(input);
  const geometry = summarizeConversionGeometryStorage(input.opportunities);
  const pointsFromConversions = summary.batchConversionPoints;
  const liveTryScored = input.result.summary.liveTryEvents.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length;
  const centralAttempts = attemptsForLaneGroup({ attempts: summary.attempts, laneGroup: "CENTRAL" });
  const halfSpaceAttempts = attemptsForLaneGroup({ attempts: summary.attempts, laneGroup: "HALF_SPACE" });
  const wideAttempts = attemptsForLaneGroup({ attempts: summary.attempts, laneGroup: "WIDE" });

  return [
    "# Conversion Resolution",
    "",
    "## Summary",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    "- score unit: POINTS",
    `- ${scoringRuleLabel("SHOT_GOAL")}`,
    `- ${tryTouchdownRuleLabel()}`,
    `- ${conversionRuleLabel()}`,
    "- DROP_GOAL active: YES",
    `- drop goal scoring rule: ${dropGoalRuleLabel()}`,
    "- PENALTY_SHOT active: NO",
    `- batch TRY_TOUCHDOWN scored: ${summary.batchTryTouchdownsScored}`,
    `- batch conversion attempts: ${summary.batchConversionAttempts}`,
    `- batch conversions made: ${summary.batchConversionsMade}`,
    `- batch conversions missed: ${summary.batchConversionsMissed}`,
    `- batch conversions blocked: ${summary.batchConversionsBlocked}`,
    `- batch invalid conversions: ${summary.batchInvalidConversions}`,
    `- batch conversion success rate: ${summary.batchConversionSuccessRate}%`,
    `- conversion points awarded: ${summary.batchConversionPoints}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Difficulty Calibration Summary",
    "- previous batch conversion success rate: 100%",
    `- new batch conversion success rate: ${summary.batchConversionSuccessRate}%`,
    "- previous conversions made: 3/3",
    `- new conversions made: ${summary.batchConversionsMade}/${summary.batchConversionAttempts}`,
    `- central conversion success rate: ${laneRateLine({ lane: "C", attempts: centralAttempts })}`,
    `- half-space conversion success rate: ${laneRateLine({ lane: "HSL/HSR", attempts: halfSpaceAttempts })}`,
    `- wide conversion success rate: ${laneRateLine({ lane: "CL/CR", attempts: wideAttempts })}`,
    `- average angle difficulty: ${summary.averageAngleDifficulty}/100`,
    `- average distance: ${summary.averageDistance}m`,
    `- average kicker execution score: ${summary.averageKickExecutionScore}/100`,
    `- average pressure difficulty: ${summary.averagePressureDifficulty}/100`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Conversion Attempt Table",
    "",
    "| matchId | source try action | team | kicker | grounding zone | grounding lane | conversion line | selected conversion point | angle difficulty | distance | kicker accuracy | kicker power | kicker composure | fatigue penalty | defender charge pressure | outcome | points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(summary.attempts.length === 0
      ? ["| none | none | none | none | none | none | none | none | 0 | 0m | 0 | 0 | 0 | 0 | 0 | CONVERSION_INVALID | 0 | no scored TRY_TOUCHDOWN rows available for conversion |"]
      : summary.attempts.map(
          (attempt) =>
            `| ${attempt.matchId} | ${attempt.sourceTryActionId} | ${attempt.scoringTeamName} | ${attempt.kickerRole} | ${attempt.groundingZone} | ${attempt.groundingLane} | ${attempt.conversionLine} | ${attempt.selectedConversionPoint} | ${attempt.angleDifficulty}/100 | ${attempt.distanceFromGoalLine}m | ${attempt.kickerAccuracy} | ${attempt.kickerPower} | ${attempt.kickerComposure} | ${attempt.fatiguePenalty} | ${attempt.defenderChargePressure} | ${attempt.outcome} | ${attempt.pointValue} | ${attempt.reason} |`,
        )),
    "",
    "## Conversion Difficulty Factors",
    "",
    "| matchId | grounding lane | angle difficulty | distance | distance penalty | lane difficulty | kicker accuracy | kicker power | kicker composure | selected point quality | fatigue penalty | pressure penalty | defender charge pressure | final kick execution score | final difficulty score | outcome |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(summary.attempts.length === 0
      ? ["| none | none | 0 | 0m | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | CONVERSION_INVALID |"]
      : summary.attempts.map(
          (attempt) =>
            `| ${attempt.matchId} | ${attempt.groundingLane} | ${attempt.angleDifficulty}/100 | ${attempt.distanceFromGoalLine}m | ${attempt.distancePenalty} | ${attempt.laneDifficulty} | ${attempt.kickerAccuracy} | ${attempt.kickerPower} | ${attempt.kickerComposure} | ${attempt.selectedPointQuality} | ${attempt.fatiguePenalty} | ${attempt.pressurePenalty} | ${attempt.defenderChargePressure} | ${attempt.kickExecutionScore} | ${attempt.finalDifficultyScore} | ${attempt.outcome} |`,
        )),
    "",
    "## Conversion Geometry Interpretation",
    "- central grounding difficulty: lowest angle difficulty and usually the shortest selected distance.",
    "- half-space grounding difficulty: moderate angle difficulty; recommended point balances angle and distance.",
    "- wide grounding difficulty: highest angle difficulty; deeper selected points can reduce angle but increase power/composure demand.",
    `- average angle difficulty: ${geometry.averageConversionAngleDifficulty}/100`,
    `- recommended point logic: ${formatConversionGeometryLaneCounts(geometry.conversionGeometryByLane)} lanes use stored distance options and do not invent missing geometry.`,
    "",
    "## Lane Difficulty Interpretation",
    "- central conversions: favored because the lane penalty and angle penalty are low, but poor execution can still miss.",
    "- half-space conversions: moderate; the stored geometry reduces angle where possible, but pressure and rhythm can still turn one into a miss.",
    "- wide conversions: hardest monitored group because touchline-adjacent lane difficulty and angle penalty stack with distance demand.",
    "- selected distance changes difficulty: deeper points reduce angle stress but increase power/composure demand through distance penalty.",
    `- current batch sample: ${summary.batchConversionAttempts} attempts, so lane rates should be monitored before overfitting.`,
    "",
    "## Scoring Impact",
    `- points from shots: ${input.shotPoints}`,
    `- points from tries: ${input.tryPoints}`,
    `- points from conversions: ${pointsFromConversions}`,
    `- final score impact: batch conversions add ${pointsFromConversions} diagnostic points; live conversions affect the mini-match score only when a live TRY_TOUCHDOWN is scored.`,
    "- batch conversion points are diagnostic unless corresponding live TRY_TOUCHDOWN/CONVERSION events exist.",
    "- unified live score is computed in scoring-events-summary.md.",
    "- conversion scoring active: YES",
    "",
    "## Live Mini-Match Conversion",
    `- live TRY_TOUCHDOWN scored: ${liveTryScored}`,
    `- live conversion attempts: ${summary.liveConversionAttempts}`,
    `- live conversions made: ${summary.liveConversionsMade}`,
    `- live conversion points awarded: ${summary.liveConversionPoints}`,
    `- reason: ${
      summary.liveConversionAttempts === 0
        ? "live conversion attempts: 0 because no live TRY_TOUCHDOWN was scored"
        : "live conversion attempts resolved from scored live TRY_TOUCHDOWN geometry"
    }`,
    "",
  ].join("\n");
}
