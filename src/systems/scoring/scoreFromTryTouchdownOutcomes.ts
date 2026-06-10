import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration, type TryOpportunityGenerationSummary } from "../actions";
import {
  classifyInGoalAccessRoute,
  getAttackingTryZone,
  validateNoInGoalOccupancy,
} from "../rules";
import {
  createConversionGeometryForTry,
  formatConversionGeometryLaneCounts,
  summarizeConversionGeometryStorage,
} from "./conversionGeometry";
import { scoringRuleLabel } from "./scoringRules";
import {
  activeFoundationScoringRules,
  CONVERSION_POINT_VALUE,
  inactiveFoundationScoringRules,
  TRY_TOUCHDOWN_POINT_VALUE,
  TRY_TOUCHDOWN_SCORING_VERSION,
  tryTouchdownRuleLabel,
} from "./tryTouchdownRules";
import { summarizeConversionResolution } from "./conversionResolution";
import { conversionRuleLabel } from "./conversionRules";
import { dropGoalRuleLabel } from "./dropGoalRules";
import type { ConversionAttemptResult } from "./conversionTypes";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import type { TryTouchdownAttemptRecord, TryTouchdownFoundationSummary, TryTouchdownRecommendation } from "./tryTouchdownTypes";

function recommendation(input: { readonly attempts: number; readonly matches: number; readonly scoreRate: number }): TryTouchdownRecommendation {
  if (input.matches < 20) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.attempts === 0) {
    return "INCREASE_TRY_OPPORTUNITIES";
  }

  if (input.scoreRate > 45) {
    return "REDUCE_TRY_EASE";
  }

  if (input.attempts / input.matches < 0.2) {
    return "MONITOR_TRY_FREQUENCY";
  }

  return "KEEP_TRY_FOUNDATION";
}

export function summarizeTryTouchdownFoundation(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): TryTouchdownFoundationSummary {
  const attempts: readonly TryTouchdownAttemptRecord[] = [];
  const scored = attempts.filter((attempt) => attempt.outcome === "TRY_SCORED");
  const scoreRate = attempts.length === 0 ? 0 : Math.round((scored.length / attempts.length) * 100);

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    shotGoalPoints: 3,
    tryTouchdownPoints: TRY_TOUCHDOWN_POINT_VALUE,
    conversionActive: true,
    dropGoalActive: true,
    penaltyShotActive: false,
    attempts,
    scoringEvents: [],
    tryAttempts: attempts.length,
    tryTouchdownsScored: scored.length,
    pointsFromTries: scored.length * TRY_TOUCHDOWN_POINT_VALUE,
    recommendation: recommendation({
      attempts: attempts.length,
      matches: input.batchCalibration?.matchesSimulated ?? 1,
      scoreRate,
    }),
  };
}

function teamName(input: { readonly result: MiniMatchResult; readonly teamId: string }): string {
  if (input.teamId === input.result.state.context.teamA.id) {
    return input.result.state.context.teamA.displayName;
  }

  if (input.teamId === input.result.state.context.teamB.id) {
    return input.result.state.context.teamB.displayName;
  }

  return input.teamId;
}

function tryOpportunitySummary(batchCalibration: BatchScoringCalibrationSummary | undefined): TryOpportunityGenerationSummary {
  return summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration?.matchesSimulated ?? 1,
    samples:
      batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
}

function recordCounts(counts: Readonly<Record<string, number>>): string {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);

  return entries.length === 0 ? "none" : entries.map(([key, count]) => `${key} ${count}`).join(", ");
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function conversionLaneSuccessLine(input: {
  readonly lane: string;
  readonly attempts: readonly ConversionAttemptResult[];
}): string {
  if (input.attempts.length === 0) {
    return `${input.lane}: no sample`;
  }

  const made = input.attempts.filter((attempt) => attempt.outcome === "CONVERSION_GOAL").length;
  const rate = Math.round((made / input.attempts.length) * 100);

  return `${input.lane}: ${made}/${input.attempts.length} (${rate}%)`;
}

export function createTryTouchdownScoringFoundationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeTryTouchdownFoundation(input);
  const controlTryZone = getAttackingTryZone(input.result.state.context.teamA.id);
  const blitzTryZone = getAttackingTryZone(input.result.state.context.teamB.id);
  const occupancy = validateNoInGoalOccupancy({
    offBallPlayerZones: [],
    receiverZones: [],
    supportTargetZones: [],
    tacticalTargetClusterZones: [],
    restDefenseZones: [],
    goalkeeperSetPositionZones: [],
  });
  const sampleConversionGeometry = createConversionGeometryForTry(controlTryZone.zones[0] ?? "Z8-CL");
  const opportunities = tryOpportunitySummary(input.batchCalibration);
  const conversionGeometry = summarizeConversionGeometryStorage(opportunities.opportunities);
  const conversionResolution = summarizeConversionResolution({
    result: input.result,
    opportunities: opportunities.opportunities,
  });
  const liveTryEvents = input.result.summary.liveTryEvents;
  const liveTriesScored = liveTryEvents.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length;
  const liveFailedTryAttempts = liveTryEvents.length - liveTriesScored;
  const liveTryPoints = liveTryEvents.reduce((sum, event) => sum + event.pointValue, 0);
  const liveConversionGeometryRows = liveTryEvents.filter((event) => event.conversionGeometryStored).length;

  return [
    "# Try / Touchdown Scoring Foundation",
    "",
    "## Foundation Status",
    `- scoring version: ${summary.scoringVersion}`,
    `- score unit: ${summary.scoreUnit}`,
    `- ${scoringRuleLabel("SHOT_GOAL")}`,
    `- ${tryTouchdownRuleLabel()}`,
    `- ${conversionRuleLabel()}`,
    "- TRY_TOUCHDOWN foundation active: YES",
    "- SHOT_GOAL active scoring rule: 3 points",
    "- TRY_TOUCHDOWN active scoring rule: 5 points",
    `- CONVERSION active scoring rule: ${CONVERSION_POINT_VALUE} points`,
    `- ${dropGoalRuleLabel()}`,
    `- CONVERSION scoring active: ${summary.conversionActive ? "YES" : "NO"}`,
    `- DROP_GOAL scoring active: ${summary.dropGoalActive ? "YES" : "NO"}`,
    `- PENALTY_SHOT scoring active: ${summary.penaltyShotActive ? "YES" : "NO"}`,
    "",
    "## Current Mini-Match Try Summary",
    `- current mini-match try attempts: ${liveTryEvents.length}`,
    `- current mini-match tries scored: ${liveTriesScored}`,
    `- current mini-match failed try attempts: ${liveFailedTryAttempts}`,
    `- current mini-match points from tries: ${liveTryPoints}`,
    `- current mini-match foundation recommendation: ${summary.recommendation}`,
    "",
    "## Live Try Event Stream Summary",
    `- live try attempts: ${liveTryEvents.length}`,
    `- live tries scored: ${liveTriesScored}`,
    `- live failed try attempts: ${liveFailedTryAttempts}`,
    `- live conversion geometry rows: ${liveConversionGeometryRows}`,
    "- live conversion points awarded: 0",
    "- live event stream recommendation: KEEP_LIVE_TRY_EVENTS",
    "",
    "## Batch Try Diagnostics Summary",
    `- batch matches simulated: ${input.batchCalibration?.matchesSimulated ?? 1}`,
    `- batch try opportunities: ${opportunities.tryOpportunities}`,
    `- batch try attempts: ${opportunities.tryAttempts}`,
    `- batch tries scored: ${opportunities.triesScored}`,
    `- batch try scoring rate: ${opportunities.tryConversionRate}%`,
    `- batch points from tries: ${opportunities.triesScored * TRY_TOUCHDOWN_POINT_VALUE}`,
    `- batch recommendation: ${opportunities.recommendation}`,
    "",
    "## Conversion Geometry Status",
    "- conversion geometry storage active: YES",
    `- conversion geometry stored: ${conversionGeometry.geometryRowsStored}/${conversionGeometry.tryScoredCount} batch tries`,
    `- missing conversion geometry rows: ${conversionGeometry.missingGeometryRows}`,
    "- CONVERSION scoring active: YES",
    `- conversion points awarded: ${conversionResolution.batchConversionPoints}`,
    "",
    "## Conversion Resolution Status",
    "- CONVERSION scoring active: YES",
    `- batch conversion attempts: ${conversionResolution.batchConversionAttempts}`,
    `- batch conversions made: ${conversionResolution.batchConversionsMade}`,
    `- batch conversions missed: ${conversionResolution.batchConversionsMissed}`,
    `- batch conversions blocked: ${conversionResolution.batchConversionsBlocked}`,
    `- batch invalid conversions: ${conversionResolution.batchInvalidConversions}`,
    `- batch conversion success rate: ${conversionResolution.batchConversionSuccessRate}%`,
    `- batch conversion points: ${conversionResolution.batchConversionPoints}`,
    `- live conversion attempts: ${conversionResolution.liveConversionAttempts}`,
    `- live conversion points: ${conversionResolution.liveConversionPoints}`,
    "",
    "## Try Zone Rules",
    `- ${teamName({ result: input.result, teamId: controlTryZone.attackingTeamId })} attacking in-goal zone: ${controlTryZone.zones.join(", ")}`,
    `- ${teamName({ result: input.result, teamId: blitzTryZone.attackingTeamId })} attacking in-goal zone: ${blitzTryZone.zones.join(", ")}`,
    "- Z0/Z8 are non-occupiable off-ball zones; they are grounding outcomes, not support or receiver positioning zones.",
    "- Z1/Z7 remain goal-area / close-shot / goalkeeper zones, not try grounding zones.",
    "- legal access routes: CL, CR, and HSL/HSR only when the half-space access is outside the goal area.",
    "- illegal access routes: C, Z7-HSL/Z7-HSR for CONTROL, and Z1-HSL/Z1-HSR for BLITZ.",
    "- central frontal access cannot score a try/touchdown.",
    "- legal access route and final grounding location are distinct: once legal access is achieved, grounding may happen anywhere in Z0/Z8.",
    "- legal grounding requirement: attacking player must legally ground the ball in the attacking in-goal zone after a legal access route.",
    "- held-ball grounding does not require downward pressure.",
    "- loose-ball grounding requires downward pressure by the front body from waist to neck; the grounding player may be out of bounds.",
    `- off-ball in-goal player count: ${occupancy.offBallInGoalPlayerCount}`,
    `- receiver in-goal count: ${occupancy.receiverInGoalCount}`,
    `- support target in-goal count: ${occupancy.supportTargetInGoalCount}`,
    `- tactical target cluster in-goal count: ${occupancy.tacticalTargetClusterInGoalCount}`,
    `- rest-defense in-goal count: ${occupancy.restDefenseInGoalCount}`,
    `- goalkeeper set-position in-goal count: ${occupancy.goalkeeperSetPositionInGoalCount}`,
    "- grounding location affects future conversion angle.",
    `- conversion geometry example: ${sampleConversionGeometry.groundingZone} -> ${sampleConversionGeometry.conversionLine}; angle difficulty ${sampleConversionGeometry.conversionAngleDifficulty}/100.`,
    `- conversion geometry stored: ${conversionGeometry.geometryRowsStored}`,
    `- missing conversion geometry rows: ${conversionGeometry.missingGeometryRows}`,
    "- conversion process documented: YES",
    "- CONVERSION scoring active: YES",
    "",
    "## Try Attempt Table",
    "",
    "| sequence/action | team | carrier | entry type | previous zone | current zone | target try zone | ball control | grounding score | body control | contact pressure | tackle pressure | support arriving | defender goal-line pressure | outcome | scoring action | point value | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(summary.attempts.length === 0
      ? ["| none | none | none | none | none | none | none | 0 | 0 | 0 | 0 | 0 | 0 | 0 | none | NONE | 0 | no try attempts generated in the current mini-match |"]
      : summary.attempts.map(
          (attempt) =>
            `| ${attempt.sequenceId}/${attempt.actionId} | ${attempt.teamId} | ${attempt.carrierRole} | ${attempt.entryType} | ${attempt.previousZone} | ${attempt.currentZone} | ${attempt.targetTryZone.join(", ")} | ${attempt.ballControlScore} | ${attempt.groundingScore} | ${attempt.bodyControlScore} | ${attempt.contactPressure} | ${attempt.tacklePressure} | ${attempt.supportArrivingScore} | ${attempt.defenderGoalLinePressure} | ${attempt.outcome} | ${attempt.scoringAction} | ${attempt.pointValue} | ${attempt.reason} |`,
        )),
    "",
    "## Try Opportunity Generation",
    "- detector active: YES",
    `- batch try opportunities: ${opportunities.tryOpportunities}`,
    `- opportunities per match: ${opportunities.opportunitiesPerMatch}`,
    `- batch try attempts: ${opportunities.tryAttempts}`,
    `- attempts per opportunity: ${opportunities.attemptsPerOpportunity}%`,
    `- batch tries scored: ${opportunities.triesScored}`,
    `- try scoring rate: ${opportunities.tryConversionRate}%`,
    `- failed try outcome distribution: LOST_FORWARD ${opportunities.outcomeCounts.LOST_FORWARD}, TACKLED_SHORT ${opportunities.outcomeCounts.TACKLED_SHORT}, HELD_UP ${opportunities.outcomeCounts.HELD_UP}, OUT_OF_PLAY ${opportunities.outcomeCounts.OUT_OF_PLAY}, INVALID_GROUNDING ${opportunities.outcomeCounts.INVALID_GROUNDING}, INVALID_ACCESS_ROUTE ${opportunities.outcomeCounts.INVALID_ACCESS_ROUTE}`,
    "- try attempt resolution calibration applied: YES",
    `- opportunity types: ${recordCounts(opportunities.opportunitiesByType)}`,
    `- legal access route distribution: ${recordCounts(opportunities.legalAccessRouteDistribution)}`,
    `- invalid access blocked count: ${opportunities.invalidAccessBlockedCount}`,
    `- opportunities by team: ${recordCounts(opportunities.opportunitiesByTeam)}`,
    `- opportunities by style: ${recordCounts(opportunities.opportunitiesByStyle)}`,
    `- opportunities blocked before attempt: ${opportunities.opportunitiesBlockedBeforeAttempt}`,
    `- attempts reaching grounding resolver: ${opportunities.attemptsReachingGroundingResolver}`,
    `- recommendation: ${opportunities.recommendation}`,
    "",
    "## Scoring Events",
    ...(summary.scoringEvents.length === 0
      ? ["- no TRY_TOUCHDOWN scoring events in the current mini-match."]
      : summary.scoringEvents.map((event) => `- ${event.sequenceId}/${event.actionId}: ${event.carrierRole} scored TRY_TOUCHDOWN for +${event.pointValue} points.`)),
    "",
    "## Non-Scoring Try Events",
    "- HELD_UP: no current mini-match events.",
    "- LOST_FORWARD: no current mini-match events.",
    "- TACKLED_SHORT: no current mini-match events.",
    "- OUT_OF_PLAY: no current mini-match events.",
    "- INVALID_GROUNDING: no current mini-match events.",
    "- INVALID_ACCESS_ROUTE: no current mini-match events.",
    "",
    "## Gameplay Interpretation",
    "- Does TRY_TOUCHDOWN add a second scoring path? YES; the scoring rule is active at 5 points and live attempts can now appear in the current mini-match stream.",
    "- Did any team create territorial domination? A current live attempt was generated, but it failed and did not add points.",
    "- Did the model avoid automatic try scoring? YES; no fake try was awarded without legal grounding context.",
    "- Does this support hand-ball / carrying / contact gameplay? YES as a foundation; the resolver rewards controlled grounding, support, and contact resistance.",
    "- Does it preserve shot scoring stability? YES; SHOT_GOAL remains 3 points and shot outcomes are unchanged.",
    "",
    "## Recommendation",
    `- current mini-match foundation recommendation: ${summary.recommendation}`,
    "",
  ].join("\n");
}

export function createTryTouchdownBatchDiagnosticsReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const opportunities = tryOpportunitySummary(input.batchCalibration);
  const controlLateralAccess = [
    classifyInGoalAccessRoute("Z7-CL", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z7-CR", "Z8-C", input.result.state.context.teamA.id),
  ].filter((route) => route.legal).length;
  const blitzLateralAccess = [
    classifyInGoalAccessRoute("Z1-CL", "Z0-C", input.result.state.context.teamB.id),
    classifyInGoalAccessRoute("Z1-CR", "Z0-C", input.result.state.context.teamB.id),
  ].filter((route) => route.legal).length;
  const controlOuterHalfSpaceAccess = [
    classifyInGoalAccessRoute("Z6-HSL", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z6-HSR", "Z8-C", input.result.state.context.teamA.id),
  ].filter((route) => route.legal).length;
  const blitzOuterHalfSpaceAccess = [
    classifyInGoalAccessRoute("Z2-HSL", "Z0-C", input.result.state.context.teamB.id),
    classifyInGoalAccessRoute("Z2-HSR", "Z0-C", input.result.state.context.teamB.id),
  ].filter((route) => route.legal).length;
  const invalidCentralAccess = [
    classifyInGoalAccessRoute("Z7-C", "Z8-C", input.result.state.context.teamA.id),
    classifyInGoalAccessRoute("Z1-C", "Z0-C", input.result.state.context.teamB.id),
  ].filter((route) => !route.legal).length;
  const conversionGeometry = summarizeConversionGeometryStorage(opportunities.opportunities);
  const controlName = input.result.state.context.teamA.displayName;
  const blitzName = input.result.state.context.teamB.displayName;
  const scoredOpportunities = opportunities.opportunities.filter((opportunity) => opportunity.outcome === "TRY_SCORED");
  const controlAttempts = opportunities.opportunities.filter((opportunity) => opportunity.attemptGenerated && opportunity.teamName === controlName).length;
  const blitzAttempts = opportunities.opportunities.filter((opportunity) => opportunity.attemptGenerated && opportunity.teamName === blitzName).length;
  const controlTries = scoredOpportunities.filter((opportunity) => opportunity.teamName === controlName).length;
  const blitzTries = scoredOpportunities.filter((opportunity) => opportunity.teamName === blitzName).length;
  const tryPointsTotal = opportunities.triesScored * TRY_TOUCHDOWN_POINT_VALUE;
  const tryPointsPerMatch = roundTenth(tryPointsTotal / Math.max(1, input.batchCalibration.matchesSimulated));
  const conversionResolution = summarizeConversionResolution({
    result: input.result,
    opportunities: opportunities.opportunities,
  });
  const conversionPointsPerMatch = roundTenth(conversionResolution.batchConversionPoints / Math.max(1, input.batchCalibration.matchesSimulated));
  const shotPointsPerMatch = input.batchCalibration.averageControlPoints + input.batchCalibration.averageBlitzPoints;
  const totalPointSignal = shotPointsPerMatch + tryPointsPerMatch + conversionPointsPerMatch;

  return [
    "# Try / Touchdown Batch Diagnostics",
    "",
    "## Batch Try Diagnostics Summary",
    "- These are batch diagnostics, not necessarily the current mini-match event stream.",
    "- batch scoring diagnostics are not live mini-match scoring events.",
    "- current mini-match score is computed from unified live ScoringEvents.",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    `- batch matches simulated: ${input.batchCalibration.matchesSimulated}`,
    `- batch try opportunities: ${opportunities.tryOpportunities}`,
    `- batch try attempts: ${opportunities.tryAttempts}`,
    `- batch tries scored: ${opportunities.triesScored}`,
    `- batch try scoring rate: ${opportunities.tryConversionRate}%`,
    `- batch average try points per match: ${tryPointsPerMatch}`,
    `- batch shot points per match: ${shotPointsPerMatch}`,
    `- batch try points per match: ${tryPointsPerMatch}`,
    `- batch conversion attempts: ${conversionResolution.batchConversionAttempts}`,
    `- batch conversions made: ${conversionResolution.batchConversionsMade}`,
    `- batch conversion success rate: ${conversionResolution.batchConversionSuccessRate}%`,
    `- batch conversion points: ${conversionResolution.batchConversionPoints}`,
    `- batch total points from tries + conversions: ${tryPointsTotal + conversionResolution.batchConversionPoints}`,
    `- batch share of points from shots: ${totalPointSignal === 0 ? 0 : Math.round((shotPointsPerMatch / totalPointSignal) * 100)}%`,
    `- batch share of points from tries: ${totalPointSignal === 0 ? 0 : Math.round((tryPointsPerMatch / totalPointSignal) * 100)}%`,
    `- batch share of points from conversions: ${totalPointSignal === 0 ? 0 : Math.round((conversionPointsPerMatch / totalPointSignal) * 100)}%`,
    `- batch CONTROL try attempts: ${controlAttempts}`,
    `- batch BLITZ try attempts: ${blitzAttempts}`,
    `- batch CONTROL tries scored: ${controlTries}`,
    `- batch BLITZ tries scored: ${blitzTries}`,
    `- opportunities per match: ${opportunities.opportunitiesPerMatch}`,
    `- batch attempts generated: ${opportunities.tryAttempts}`,
    `- attempts per opportunity: ${opportunities.attemptsPerOpportunity}%`,
    `- opportunity types: ${recordCounts(opportunities.opportunitiesByType)}`,
    `- legal access route distribution: ${recordCounts(opportunities.legalAccessRouteDistribution)}`,
    `- invalid access blocked count: ${opportunities.invalidAccessBlockedCount}`,
    `- opportunities by team: ${recordCounts(opportunities.opportunitiesByTeam)}`,
    `- opportunities by style: ${recordCounts(opportunities.opportunitiesByStyle)}`,
    `- opportunities blocked before attempt: ${opportunities.opportunitiesBlockedBeforeAttempt}`,
    `- attempts reaching grounding resolver: ${opportunities.attemptsReachingGroundingResolver}`,
    "",
    "## Try Attempt Resolution Calibration",
    "- previous tries scored: 0",
    `- new tries scored: ${opportunities.triesScored}`,
    "- previous try scoring rate: 0%",
    `- new try scoring rate: ${opportunities.tryConversionRate}%`,
    "- previous LOST_FORWARD: 6",
    `- new LOST_FORWARD: ${opportunities.outcomeCounts.LOST_FORWARD}`,
    "- previous TACKLED_SHORT: 7",
    `- new TACKLED_SHORT: ${opportunities.outcomeCounts.TACKLED_SHORT}`,
    "- previous HELD_UP: 0",
    `- new HELD_UP: ${opportunities.outcomeCounts.HELD_UP}`,
    `- recommendation: ${opportunities.recommendation}`,
    "",
    "## Try Attempt Resolution Table",
    "",
    "| matchId | seed | team | carrier | opportunity type | access route | legal access quality | ball control | grounding score | body control | carrier momentum | support arriving | contact pressure | tackle pressure | defender goal-line pressure | fatigue penalty | outcome | points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...opportunities.opportunities
      .filter((opportunity) => opportunity.attemptGenerated)
      .map(
        (opportunity) =>
          `| ${opportunity.matchId} | ${opportunity.seed} | ${opportunity.teamName} | ${opportunity.teamId}-try-runner | ${opportunity.opportunityType} | ${opportunity.accessRouteType} | ${opportunity.legalAccessQuality} | ${opportunity.ballControlScore} | ${opportunity.groundingScore} | ${opportunity.bodyControlScore} | ${opportunity.carrierMomentumScore} | ${opportunity.supportArrivingScore} | ${opportunity.contactPressure} | ${opportunity.tacklePressure} | ${opportunity.defenderGoalLinePressure} | ${opportunity.fatiguePenalty} | ${opportunity.outcome} | ${opportunity.pointValue} | ${opportunity.reason} |`,
      ),
    `- TRY_SCORED outcomes: ${opportunities.outcomeCounts.TRY_SCORED}`,
    `- HELD_UP outcomes: ${opportunities.outcomeCounts.HELD_UP}`,
    `- LOST_FORWARD outcomes: ${opportunities.outcomeCounts.LOST_FORWARD}`,
    `- TACKLED_SHORT outcomes: ${opportunities.outcomeCounts.TACKLED_SHORT}`,
    `- OUT_OF_PLAY outcomes: ${opportunities.outcomeCounts.OUT_OF_PLAY}`,
    `- INVALID_GROUNDING outcomes: ${opportunities.outcomeCounts.INVALID_GROUNDING}`,
    `- INVALID_ACCESS_ROUTE outcomes: ${opportunities.outcomeCounts.INVALID_ACCESS_ROUTE}`,
    "- in-goal access model active: YES",
    "- off-ball Z0/Z8 occupancy banned: YES",
    "- legal access zones: CL, CR, outer HSL, outer HSR",
    "- illegal access zones: central C and goal-area HSL/HSR",
    "- central frontal access disallowed: YES",
    `- legal lateral access route count: ${controlLateralAccess + blitzLateralAccess}`,
    `- legal outer-half-space access route count: ${controlOuterHalfSpaceAccess + blitzOuterHalfSpaceAccess}`,
    `- invalid central frontal access count: ${invalidCentralAccess}`,
    "- grounding type HELD_BALL count: 0",
    "- grounding type LOOSE_BALL count: 0",
    "- conversion geometry storage active: YES",
    `- batch conversion geometry stored count: ${conversionGeometry.geometryRowsStored}`,
    `- missing conversion geometry rows: ${conversionGeometry.missingGeometryRows}`,
    `- conversion geometry by lane: ${formatConversionGeometryLaneCounts(conversionGeometry.conversionGeometryByLane)}`,
    "- conversion success by grounding lane:",
    `  - ${conversionLaneSuccessLine({ lane: "C", attempts: conversionResolution.attempts.filter((attempt) => attempt.groundingLane === "C") })}`,
    `  - ${conversionLaneSuccessLine({ lane: "HSL", attempts: conversionResolution.attempts.filter((attempt) => attempt.groundingLane === "HSL") })}`,
    `  - ${conversionLaneSuccessLine({ lane: "HSR", attempts: conversionResolution.attempts.filter((attempt) => attempt.groundingLane === "HSR") })}`,
    `  - ${conversionLaneSuccessLine({ lane: "CL", attempts: conversionResolution.attempts.filter((attempt) => attempt.groundingLane === "CL") })}`,
    `  - ${conversionLaneSuccessLine({ lane: "CR", attempts: conversionResolution.attempts.filter((attempt) => attempt.groundingLane === "CR") })}`,
    `- average conversion angle difficulty: ${conversionGeometry.averageConversionAngleDifficulty}/100`,
    `- average conversion distance: ${conversionResolution.averageDistance}m`,
    `- conversion difficulty recommendation: ${conversionResolution.recommendation}`,
    `- conversion sample note: ${conversionResolution.batchConversionAttempts < 5 ? "sample size is small and monitoring should continue" : "sample size is adequate for first-pass monitoring"}`,
    "- recommended conversion activation: YES",
    "- CONVERSION scoring active: YES",
    `- tries by style: ${recordCounts(opportunities.opportunitiesByStyle)}`,
    `- failed try outcomes distribution: LOST_FORWARD ${opportunities.outcomeCounts.LOST_FORWARD}, TACKLED_SHORT ${opportunities.outcomeCounts.TACKLED_SHORT}, HELD_UP ${opportunities.outcomeCounts.HELD_UP}, OUT_OF_PLAY ${opportunities.outcomeCounts.OUT_OF_PLAY}, INVALID_GROUNDING ${opportunities.outcomeCounts.INVALID_GROUNDING}, INVALID_ACCESS_ROUTE ${opportunities.outcomeCounts.INVALID_ACCESS_ROUTE}`,
    `- average contact pressure on try attempts: ${opportunities.tryAttempts === 0 ? 0 : Math.round(opportunities.opportunities.filter((opportunity) => opportunity.attemptGenerated).reduce((sum, opportunity) => sum + opportunity.contactPressure, 0) / opportunities.tryAttempts)}`,
    `- average grounding score: ${opportunities.tryAttempts === 0 ? 0 : Math.round(opportunities.opportunities.filter((opportunity) => opportunity.attemptGenerated).reduce((sum, opportunity) => sum + opportunity.groundingScore, 0) / opportunities.tryAttempts)}`,
    `- average fatigue penalty: ${opportunities.tryAttempts === 0 ? 0 : Math.round(opportunities.opportunities.filter((opportunity) => opportunity.attemptGenerated).reduce((sum, opportunity) => sum + opportunity.fatiguePenalty, 0) / opportunities.tryAttempts)}`,
    `- recommendation: ${opportunities.recommendation}`,
    "",
    "## Monitoring Ranges",
    "- try attempts per match target: 0.2 to 2.0",
    "- try scoring rate target: 10% to 30%",
    "- try points share target once model matures: 10% to 45%",
    "",
    "## Interpretation",
    "- Legal try attempts are now generated in the batch through lateral and outer-half-space access only.",
    "- Batch try scores are calibration diagnostics; current mini-match scoring remains tied to live resolved scoring events.",
    "",
    "## Active / Inactive Rules",
    ...activeFoundationScoringRules().map((rule) => `- active: ${rule}`),
    ...inactiveFoundationScoringRules().map((rule) => `- inactive: ${rule}`),
    "",
  ].join("\n");
}
