import type { TeamId } from "../../core/ids";
import { createScoringZoneId, ScoringEndZone, type ScoringZoneId } from "../../core/scoringZones";
import { LateralCorridor, LongitudinalZone, createZoneId, type ZoneId } from "../../core/zones";
import type { CalibrationScenario } from "../simulation";
import { AttackingDirection } from "../spatial/intention/types";
import { classifyInGoalAccessRoute, getDefendingTeamForInGoal, validateNoInGoalOccupancy, type InGoalAccessLaneCategory } from "../rules";
import type {
  TryOpportunityGenerationSummary,
  TryOpportunityRecord,
  TryOpportunityType,
} from "./tryOpportunityTypes";
import type { TryTouchdownOutcome } from "../scoring/tryTouchdownTypes";
import { resolveTryTouchdownAttempt } from "./tryTouchdownAttemptResolver";

export interface TryOpportunityBatchSampleInput {
  readonly matchId: string;
  readonly seed: string;
  readonly scenario: CalibrationScenario;
  readonly totalShots: number;
  readonly reboundEventCount: number;
  readonly contestedReboundCount: number;
  readonly scrambleReboundCount: number;
}

const OPPORTUNITY_TYPES: readonly TryOpportunityType[] = [
  "OUTER_CHANNEL_CARRY_TO_IN_GOAL",
  "OUTER_HALF_SPACE_CARRY_TO_IN_GOAL",
  "WEAK_SIDE_OVERLOAD_TO_IN_GOAL",
  "CONTACT_BREAK_LATERAL_TO_IN_GOAL",
  "TRANSITION_WIDE_RUN_TO_IN_GOAL",
  "SCRAMBLE_LOOSE_BALL_IN_GOAL",
  "REBOUND_DIVE_IN_GOAL",
];

const OUTCOME_TYPES: readonly Exclude<TryTouchdownOutcome, "PENDING">[] = [
  "TRY_SCORED",
  "HELD_UP",
  "LOST_FORWARD",
  "TACKLED_SHORT",
  "OUT_OF_PLAY",
  "INVALID_GROUNDING",
  "INVALID_ACCESS_ROUTE",
];

function emptyTypeCounts(): Record<TryOpportunityType, number> {
  return Object.fromEntries(OPPORTUNITY_TYPES.map((type) => [type, 0])) as Record<TryOpportunityType, number>;
}

function emptyOutcomeCounts(): Record<Exclude<TryTouchdownOutcome, "PENDING">, number> {
  return Object.fromEntries(OUTCOME_TYPES.map((outcome) => [outcome, 0])) as Record<Exclude<TryTouchdownOutcome, "PENDING">, number>;
}

function emptyAccessCounts(): Record<InGoalAccessLaneCategory, number> {
  return {
    CENTRAL_GOAL_AREA: 0,
    OUTER_CHANNEL_ACCESS: 0,
    OUTER_HALF_SPACE_ACCESS: 0,
    GOAL_AREA_HALF_SPACE: 0,
    FRONTAL_ACCESS: 0,
    REBOUND_OR_SCRAMBLE_ACCESS: 0,
    INVALID_ACCESS: 0,
  };
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isControlTeam(teamName: string): boolean {
  return teamName.toLowerCase().includes("control");
}

function legalAccessPreviousZone(input: {
  readonly teamIsControl: boolean;
  readonly opportunityType: TryOpportunityType;
  readonly seed: number;
}): ZoneId {
  const outerLane =
    input.seed % 2 === 0
      ? LateralCorridor.LeftHalfSpace
      : LateralCorridor.RightHalfSpace;
  const channelLane = input.seed % 2 === 0 ? LateralCorridor.LeftCorridor : LateralCorridor.RightCorridor;

  if (input.opportunityType === "OUTER_HALF_SPACE_CARRY_TO_IN_GOAL" || input.opportunityType === "WEAK_SIDE_OVERLOAD_TO_IN_GOAL") {
    return createZoneId(input.teamIsControl ? LongitudinalZone.FinishingZone : LongitudinalZone.DeepDefense, outerLane);
  }

  return createZoneId(input.teamIsControl ? LongitudinalZone.OffensiveTryZone : LongitudinalZone.DefensiveTryZone, channelLane);
}

function groundingZone(teamIsControl: boolean, seed: number): ScoringZoneId {
  const lanes = [
    LateralCorridor.LeftCorridor,
    LateralCorridor.LeftHalfSpace,
    LateralCorridor.RightHalfSpace,
    LateralCorridor.RightCorridor,
  ] as const;
  const lane = lanes[seed % lanes.length] ?? LateralCorridor.LeftHalfSpace;

  return createScoringZoneId(teamIsControl ? ScoringEndZone.RightInGoal : ScoringEndZone.LeftInGoal, lane);
}

function typeForSample(sample: TryOpportunityBatchSampleInput): TryOpportunityType | undefined {
  const scenario = sample.scenario;
  const controlOpportunity =
    scenario.controlStyleVariant === "CONTROL_PATIENT" ||
    scenario.controlStyleVariant === "CONTROL_BALANCED" ||
    scenario.initialBallZone.endsWith("-CL") ||
    scenario.initialBallZone.endsWith("-CR");
  const blitzOpportunity =
    scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE" ||
    scenario.blitzStyleVariant === "BLITZ_RISKY" ||
    scenario.pressureProfile === "HIGH";

  if (sample.scrambleReboundCount > 0) {
    return "SCRAMBLE_LOOSE_BALL_IN_GOAL";
  }

  if (sample.contestedReboundCount > 0 && scenario.pressureProfile !== "LOW") {
    return "REBOUND_DIVE_IN_GOAL";
  }

  if (scenario.initialPossessionTeamName.toLowerCase().includes("blitz") && blitzOpportunity) {
    return scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE" ? "TRANSITION_WIDE_RUN_TO_IN_GOAL" : "CONTACT_BREAK_LATERAL_TO_IN_GOAL";
  }

  if (controlOpportunity && scenario.pressureProfile !== "HIGH") {
    return scenario.controlStyleVariant === "CONTROL_PATIENT" ? "WEAK_SIDE_OVERLOAD_TO_IN_GOAL" : "OUTER_HALF_SPACE_CARRY_TO_IN_GOAL";
  }

  if (scenario.initialBallZone.endsWith("-CL") || scenario.initialBallZone.endsWith("-CR")) {
    return "OUTER_CHANNEL_CARRY_TO_IN_GOAL";
  }

  return undefined;
}

function dangerPhaseTypeForSample(sample: TryOpportunityBatchSampleInput): TryOpportunityType | undefined {
  const scenario = sample.scenario;
  const lateralZone = scenario.initialBallZone.endsWith("-CL") || scenario.initialBallZone.endsWith("-CR");
  const halfSpaceZone = scenario.initialBallZone.endsWith("-HSL") || scenario.initialBallZone.endsWith("-HSR");
  const highDangerShotVolume = sample.totalShots >= 5;
  const compactDefenseWindow = scenario.pressureProfile === "HIGH" || sample.contestedReboundCount > 0;
  const supportWindow = scenario.controlStyleVariant === "CONTROL_PATIENT" || scenario.controlStyleVariant === "CONTROL_BALANCED";

  if (sample.scrambleReboundCount > 0 && sample.totalShots >= 4) {
    return "SCRAMBLE_LOOSE_BALL_IN_GOAL";
  }

  if (lateralZone && compactDefenseWindow) {
    return "OUTER_CHANNEL_CARRY_TO_IN_GOAL";
  }

  if (halfSpaceZone && (supportWindow || scenario.blitzStyleVariant === "BLITZ_RISKY")) {
    return "OUTER_HALF_SPACE_CARRY_TO_IN_GOAL";
  }

  if (highDangerShotVolume && scenario.pressureProfile !== "LOW" && supportWindow) {
    return "WEAK_SIDE_OVERLOAD_TO_IN_GOAL";
  }

  if (highDangerShotVolume && scenario.initialPossessionTeamName.toLowerCase().includes("blitz")) {
    return "TRANSITION_WIDE_RUN_TO_IN_GOAL";
  }

  return undefined;
}

function attemptScore(sample: TryOpportunityBatchSampleInput, type: TryOpportunityType): number {
  const pressurePenalty = sample.scenario.pressureProfile === "HIGH" ? 20 : sample.scenario.pressureProfile === "MEDIUM" ? 10 : 2;
  const fatiguePenalty = sample.scenario.fatigueProfile === "LOADED" ? 12 : sample.scenario.fatigueProfile === "NORMAL" ? 5 : 0;
  const form =
    isControlTeam(sample.scenario.initialPossessionTeamName)
      ? sample.scenario.playerFormProfile.controlModifier
      : sample.scenario.playerFormProfile.blitzModifier;
  const typeBoost =
    type === "WEAK_SIDE_OVERLOAD_TO_IN_GOAL"
      ? 18
      : type === "TRANSITION_WIDE_RUN_TO_IN_GOAL"
        ? 16
        : type === "SCRAMBLE_LOOSE_BALL_IN_GOAL" || type === "REBOUND_DIVE_IN_GOAL"
          ? 10
          : 12;

  return 58 + typeBoost + form - pressurePenalty - fatiguePenalty;
}

function attemptMetrics(sample: TryOpportunityBatchSampleInput, type: TryOpportunityType, routeType: InGoalAccessLaneCategory): {
  readonly legalAccessQuality: number;
  readonly ballControlScore: number;
  readonly groundingScore: number;
  readonly bodyControlScore: number;
  readonly carrierMomentumScore: number;
  readonly supportArrivingScore: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly handlingRisk: number;
  readonly teamStyleModifier: number;
} {
  const base = attemptScore(sample, type);
  const controlTeam = isControlTeam(sample.scenario.initialPossessionTeamName);
  const form = controlTeam ? sample.scenario.playerFormProfile.controlModifier : sample.scenario.playerFormProfile.blitzModifier;
  const legalAccessQuality = routeType === "OUTER_CHANNEL_ACCESS" ? 82 : routeType === "OUTER_HALF_SPACE_ACCESS" ? 76 : 58;
  const pressureBase = sample.scenario.pressureProfile === "HIGH" ? 76 : sample.scenario.pressureProfile === "MEDIUM" ? 64 : 48;
  const fatiguePenalty = sample.scenario.fatigueProfile === "LOADED" ? 18 : sample.scenario.fatigueProfile === "NORMAL" ? 9 : 2;
  const styleModifier =
    sample.scenario.controlStyleVariant === "CONTROL_PATIENT"
      ? 5
      : sample.scenario.controlStyleVariant === "CONTROL_DIRECT"
        ? 8
        : sample.scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE"
          ? 7
          : sample.scenario.blitzStyleVariant === "BLITZ_RISKY"
            ? 3
            : 4;

  return {
    legalAccessQuality,
    ballControlScore: clamp(base + 8 + form),
    groundingScore: clamp(base + (type === "WEAK_SIDE_OVERLOAD_TO_IN_GOAL" ? 16 : 10) + form),
    bodyControlScore: clamp(62 + base * 0.35 + form),
    carrierMomentumScore: clamp(base + (type === "TRANSITION_WIDE_RUN_TO_IN_GOAL" ? 16 : 8)),
    supportArrivingScore: clamp(controlTeam ? 72 + form : 58 + form),
    contactPressure: clamp(pressureBase + (type === "CONTACT_BREAK_LATERAL_TO_IN_GOAL" ? 10 : 0)),
    tacklePressure: clamp(pressureBase + (type === "REBOUND_DIVE_IN_GOAL" ? 8 : 0)),
    defenderGoalLinePressure: clamp(pressureBase + (type === "WEAK_SIDE_OVERLOAD_TO_IN_GOAL" ? -10 : 6)),
    fatiguePenalty,
    handlingRisk: clamp(42 + fatiguePenalty + (type === "SCRAMBLE_LOOSE_BALL_IN_GOAL" ? 18 : 0) - form),
    teamStyleModifier: styleModifier,
  };
}

function createOpportunity(sample: TryOpportunityBatchSampleInput, opportunityType: TryOpportunityType | undefined = typeForSample(sample), seedOffset = 0): TryOpportunityRecord | undefined {
  if (opportunityType === undefined) {
    return undefined;
  }

  const effectiveSeed = sample.scenario.seed + seedOffset;
  const teamIsControl = isControlTeam(sample.scenario.initialPossessionTeamName);
  const previousZone = legalAccessPreviousZone({
    teamIsControl,
    opportunityType,
    seed: effectiveSeed,
  });
  const zone = groundingZone(teamIsControl, effectiveSeed);
  const route = classifyInGoalAccessRoute(previousZone, zone, sample.scenario.initialPossessionTeam);
  const score = attemptScore(sample, opportunityType);
  const attemptGenerated = route.legal && score >= 63;
  const metrics = attemptMetrics(sample, opportunityType, route.category);
  const groundingType =
    opportunityType === "SCRAMBLE_LOOSE_BALL_IN_GOAL" || opportunityType === "REBOUND_DIVE_IN_GOAL" ? "LOOSE_BALL" : "HELD_BALL";
  const result = attemptGenerated
    ? resolveTryTouchdownAttempt({
        actionId: `${sample.matchId}-try-${seedOffset}`,
        attackingTeamId: sample.scenario.initialPossessionTeam,
        defendingTeamId: getDefendingTeamForInGoal(sample.scenario.initialPossessionTeam),
        carrierId: `${sample.scenario.initialPossessionTeam}-try-runner`,
        carrierRole: opportunityType.includes("REBOUND") ? "rebound carrier" : "wide carrier",
        previousZone,
        currentZone: zone,
        targetTryZone: [zone],
        groundingZone: zone,
        groundingType,
        downwardPressureApplied: groundingType === "LOOSE_BALL",
        frontBodyWaistToNeckPressure: groundingType === "LOOSE_BALL",
        ballControlScore: metrics.ballControlScore,
        groundingScore: metrics.groundingScore,
        bodyControlScore: metrics.bodyControlScore,
        carrierMomentumScore: metrics.carrierMomentumScore,
        legalAccessQuality: metrics.legalAccessQuality,
        teamStyleModifier: metrics.teamStyleModifier,
        contactPressure: metrics.contactPressure,
        tacklePressure: metrics.tacklePressure,
        supportArrivingScore: metrics.supportArrivingScore,
        defenderGoalLinePressure: metrics.defenderGoalLinePressure,
        fatiguePenalty: metrics.fatiguePenalty,
        handlingRisk: metrics.handlingRisk,
        legalGroundingAvailable: true,
        entryType: groundingType === "LOOSE_BALL" ? "LOOSE_BALL_DIVE" : "CARRY",
        scoreBefore: "CONTROL 0 - 0 BLITZ",
      })
    : undefined;
  const outcome = result?.outcome ?? "NO_ATTEMPT";

  return {
    matchId: sample.matchId,
    seed: sample.seed,
    teamId: sample.scenario.initialPossessionTeam,
    teamName: sample.scenario.initialPossessionTeamName,
    styleVariant: teamIsControl ? sample.scenario.controlStyleVariant : sample.scenario.blitzStyleVariant,
    opportunityType,
    previousZone,
    groundingZone: zone,
    accessRouteType: route.category,
    legalAccessRoute: route.legal,
    attemptGenerated,
    blockedBeforeAttempt: !attemptGenerated,
    groundingResolverReached: attemptGenerated,
    legalAccessQuality: metrics.legalAccessQuality,
    ballControlScore: metrics.ballControlScore,
    groundingScore: metrics.groundingScore,
    bodyControlScore: metrics.bodyControlScore,
    carrierMomentumScore: metrics.carrierMomentumScore,
    supportArrivingScore: metrics.supportArrivingScore,
    contactPressure: metrics.contactPressure,
    tacklePressure: metrics.tacklePressure,
    defenderGoalLinePressure: metrics.defenderGoalLinePressure,
    fatiguePenalty: metrics.fatiguePenalty,
    outcome,
    pointValue: result?.pointValue ?? 0,
    reason: attemptGenerated
      ? (result?.reason ?? `${sample.scenario.initialPossessionTeamName} creates ${opportunityType} through ${route.category}.`)
      : `${sample.scenario.initialPossessionTeamName} creates ${opportunityType}, but pressure/form context blocks the carry before the grounding resolver.`,
  };
}

export function summarizeTryOpportunityGeneration(input: {
  readonly matchesSimulated: number;
  readonly samples: readonly TryOpportunityBatchSampleInput[];
}): TryOpportunityGenerationSummary {
  const opportunities = input.samples.flatMap((sample) => {
    const primary = createOpportunity(sample);
    const secondaryType = dangerPhaseTypeForSample(sample);
    const secondary =
      secondaryType === undefined || secondaryType === typeForSample(sample)
        ? undefined
        : createOpportunity(sample, secondaryType, 37);

    return [primary, secondary].filter((opportunity): opportunity is TryOpportunityRecord => opportunity !== undefined);
  });
  const opportunitiesByType = emptyTypeCounts();
  const outcomeCounts = emptyOutcomeCounts();
  const legalAccessRouteDistribution = emptyAccessCounts();
  const opportunitiesByTeam: Record<string, number> = {};
  const opportunitiesByStyle: Record<string, number> = {};
  const occupancy = validateNoInGoalOccupancy({
    offBallPlayerZones: [],
    receiverZones: [],
    supportTargetZones: [],
    tacticalTargetClusterZones: [],
    restDefenseZones: [],
    goalkeeperSetPositionZones: [],
  });

  for (const opportunity of opportunities) {
    opportunitiesByType[opportunity.opportunityType] += 1;
    legalAccessRouteDistribution[opportunity.accessRouteType] += 1;
    opportunitiesByTeam[opportunity.teamName] = (opportunitiesByTeam[opportunity.teamName] ?? 0) + 1;
    opportunitiesByStyle[opportunity.styleVariant] = (opportunitiesByStyle[opportunity.styleVariant] ?? 0) + 1;

    if (opportunity.outcome !== "NO_ATTEMPT") {
      outcomeCounts[opportunity.outcome] += 1;
    }
  }

  const attempts = opportunities.filter((opportunity) => opportunity.attemptGenerated).length;
  const triesScored = opportunities.filter((opportunity) => opportunity.outcome === "TRY_SCORED").length;

  return {
    detectorActive: true,
    matchesSimulated: input.matchesSimulated,
    tryOpportunities: opportunities.length,
    opportunitiesPerMatch: roundTenth(opportunities.length / Math.max(1, input.matchesSimulated)),
    tryAttempts: attempts,
    attemptsPerOpportunity: percent(attempts, opportunities.length),
    triesScored,
    tryConversionRate: percent(triesScored, attempts),
    opportunitiesByType,
    legalAccessRouteDistribution,
    invalidAccessBlockedCount: opportunities.filter((opportunity) => !opportunity.legalAccessRoute).length,
    opportunitiesByTeam,
    opportunitiesByStyle,
    opportunitiesBlockedBeforeAttempt: opportunities.filter((opportunity) => opportunity.blockedBeforeAttempt).length,
    attemptsReachingGroundingResolver: opportunities.filter((opportunity) => opportunity.groundingResolverReached).length,
    outcomeCounts,
    centralFrontalTriesGenerated: opportunities.filter((opportunity) => opportunity.accessRouteType === "CENTRAL_GOAL_AREA").length,
    offBallInGoalPlayerCount: occupancy.offBallInGoalPlayerCount,
    recommendation:
      opportunities.length === 0
        ? "INCREASE_TRY_OPPORTUNITIES"
        : attempts === 0
          ? "MONITOR_TRY_FREQUENCY"
          : triesScored === 0
            ? "INCREASE_TRY_FINISHING_SLIGHTLY"
            : outcomeCounts.HELD_UP === 0
              ? "INCREASE_HELD_UP_OUTCOMES"
              : "KEEP_TRY_ATTEMPT_MODEL",
    opportunities,
  };
}
