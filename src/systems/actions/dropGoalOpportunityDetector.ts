import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "../scoring";
import type {
  DropGoalOpportunityRecord,
  DropGoalOpportunitySummary,
  DropGoalOpportunityType,
} from "./dropGoalOpportunityTypes";

const DROP_ZONES = ["Z3-C", "Z3-HSL", "Z3-HSR", "Z4-C", "Z4-HSL", "Z4-HSR", "Z5-C"] as const;

function stableSeed(input: MatchScoringCalibrationSample, index: number): number {
  const parsed = Number.parseInt(input.seed, 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return [...input.seed].reduce((sum, char) => sum + char.charCodeAt(0), index * 17 + 31);
}

function zoneFor(input: MatchScoringCalibrationSample, seed: number): (typeof DROP_ZONES)[number] {
  const scenarioZone = input.scenario.initialBallZone;
  if (!scenarioZone.startsWith("Z0") && !scenarioZone.startsWith("Z8") && DROP_ZONES.includes(scenarioZone as (typeof DROP_ZONES)[number])) {
    return scenarioZone as (typeof DROP_ZONES)[number];
  }

  return DROP_ZONES[seed % DROP_ZONES.length] ?? "Z4-C";
}

function laneForZone(zone: string): string {
  return zone.split("-")[1] ?? "C";
}

function opportunityType(input: MatchScoringCalibrationSample, seed: number): DropGoalOpportunityType {
  if (input.scenario.pressureProfile === "HIGH" && seed % 2 === 0) {
    return "CENTRAL_PRESSURE_RELEASE_DROP_WINDOW";
  }

  if (input.scenario.controlStyleVariant === "CONTROL_PATIENT" && input.scenario.pressureProfile !== "LOW") {
    return "SET_DEFENSE_DROP_WINDOW";
  }

  if (input.scenario.blitzStyleVariant === "BLITZ_RISKY") {
    return "BROKEN_PLAY_DROP_WINDOW";
  }

  if (input.cleanWindowShotCount === 0 && input.shotGoals === 0) {
    return "LOW_SHOT_QUALITY_DROP_WINDOW";
  }

  if (seed % 5 === 0) {
    return "PHASE_END_DROP_WINDOW";
  }

  return seed % 3 === 0 ? "LOW_TRY_ACCESS_DROP_WINDOW" : "ADVANTAGE_STATE_DROP_WINDOW";
}

function candidateScore(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly seed: number;
  readonly angleDifficulty: number;
  readonly distanceToPosts: number;
  readonly defenderRushPressure: number;
  readonly blockPressure: number;
  readonly tryAccessQuality: number;
  readonly shotQuality: number;
  readonly recycleSafety: number;
  readonly phaseMomentum: number;
}): number {
  const form = input.sample.scenario.playerFormProfile;
  const styleBonus = input.sample.scenario.controlStyleVariant === "CONTROL_PATIENT" ? 7 : input.sample.scenario.blitzStyleVariant === "BLITZ_RISKY" ? 5 : 2;
  const pressureBonus = input.sample.scenario.pressureProfile === "HIGH" ? 9 : input.sample.scenario.pressureProfile === "MEDIUM" ? 5 : 0;
  const opportunityNeed = Math.max(0, 68 - input.shotQuality) + Math.max(0, 62 - input.tryAccessQuality) + Math.max(0, 68 - input.phaseMomentum);
  const execution =
    58 +
    (input.seed % 18) +
    form.controlModifier +
    form.blitzModifier +
    styleBonus +
    pressureBonus +
    Math.round(opportunityNeed / 6) -
    Math.round((input.angleDifficulty + Math.max(0, input.distanceToPosts - 28)) / 5) -
    Math.round((input.defenderRushPressure + input.blockPressure) / 18) -
    Math.round(input.recycleSafety / 14);

  return Math.max(25, Math.min(94, execution));
}

function shouldCreateOpportunity(sample: MatchScoringCalibrationSample, seed: number, index: number): boolean {
  if (sample.scenario.initialBallZone.startsWith("Z0") || sample.scenario.initialBallZone.startsWith("Z8")) {
    return false;
  }

  const styleWindow =
    sample.scenario.controlStyleVariant === "CONTROL_PATIENT" ||
    sample.scenario.blitzStyleVariant === "BLITZ_RISKY" ||
    sample.scenario.pressureProfile === "HIGH";
  const lowAccessWindow = sample.cleanWindowShotCount === 0 || sample.conversionRate <= 35 || sample.shotGoals === 0;

  return styleWindow && lowAccessWindow && (seed + index) % 4 !== 1;
}

function shouldCreateDangerPhaseDropOpportunity(sample: MatchScoringCalibrationSample, seed: number, index: number): boolean {
  if (sample.scenario.initialBallZone.startsWith("Z0") || sample.scenario.initialBallZone.startsWith("Z8")) {
    return false;
  }

  const compactDefense = sample.scenario.pressureProfile !== "LOW" && sample.cleanWindowShotCount <= 1;
  const fadingPhase = sample.totalShots >= 5 && sample.shotGoals === 0;
  const lowShotQuality = sample.averageShotQuality < 68 || sample.conversionRate <= 35;
  const plausibleTiming = (seed + index) % 5 !== 2;

  return plausibleTiming && (compactDefense || fadingPhase || lowShotQuality);
}

function buildOpportunity(sample: MatchScoringCalibrationSample, index: number, seedOffset = 0): DropGoalOpportunityRecord | undefined {
  const seed = stableSeed(sample, index + seedOffset);
  if (seedOffset === 0 ? !shouldCreateOpportunity(sample, seed, index) : !shouldCreateDangerPhaseDropOpportunity(sample, seed, index)) {
    return undefined;
  }

  const zone = zoneFor(sample, seed);
  const lane = laneForZone(zone);
  const possessionTeamId = sample.scenario.initialPossessionTeam;
  const defendingTeamId = possessionTeamId === "BLITZ" ? "CONTROL" : "BLITZ";
  const pressureBase = sample.scenario.pressureProfile === "HIGH" ? 58 : sample.scenario.pressureProfile === "MEDIUM" ? 46 : 34;
  const defenderRushPressure = pressureBase + (seed % 18);
  const blockPressure = 32 + sample.scenario.playerFormProfile.blockModifier + (seed % 22);
  const distanceToPosts = zone.startsWith("Z5") ? 34 : zone.startsWith("Z4") ? 28 : 23;
  const angleDifficulty = lane === "C" ? 10 : 24 + (seed % 11);
  const tryAccessQuality = Math.max(18, 58 - sample.contestedReboundCount * 4 - (sample.scenario.pressureProfile === "HIGH" ? 8 : 0) + (seed % 10));
  const shotQuality = Math.max(20, sample.averageShotQuality - (sample.scenario.pressureProfile === "HIGH" ? 10 : 4) + (seed % 8));
  const recycleSafety = sample.scenario.controlStyleVariant === "CONTROL_PATIENT" ? 72 : sample.scenario.blitzStyleVariant === "BLITZ_RISKY" ? 48 : 61;
  const phaseMomentum = sample.scenario.fatigueProfile === "LOADED" ? 44 : 56 + (seed % 12);
  const score = candidateScore({
    sample,
    seed,
    angleDifficulty,
    distanceToPosts,
    defenderRushPressure,
    blockPressure,
    tryAccessQuality,
    shotQuality,
    recycleSafety,
    phaseMomentum,
  });
  const selected = score >= 68 && defenderRushPressure < 72 && blockPressure < 63;
  const competingCandidate =
    shotQuality >= 66 ? "SHOT" : tryAccessQuality >= 64 ? "TRY_TOUCHDOWN_ATTEMPT" : recycleSafety >= 68 ? "SAFE_RECYCLE" : "CARRY_OR_HOLD";
  const type = opportunityType(sample, seed);

  return {
    context: {
      matchId: sample.matchId,
      sequenceId: `Batch ${sample.matchId} Drop Window${seedOffset === 0 ? "" : " Danger"}`,
      possessionTeamId,
      defendingTeamId,
      ballCarrierId: `${possessionTeamId.toLowerCase()}-drop-carrier`,
      potentialKickerId: `${possessionTeamId.toLowerCase()}-drop-kicker`,
      potentialKickerRole: `${possessionTeamId} drop kicker`,
      ballZone: zone,
      ballLane: lane,
      attackingDirection: sample.scenario.attackingDirection,
      phase: type === "BROKEN_PLAY_DROP_WINDOW" ? "offensive_transition" : "offensive_construction",
      possessionQuality: 62 + (seed % 18),
      ballControlScore: 61 + (seed % 17),
      dropSetupScore: 59 + (seed % 22),
      footSkill: 65 + (seed % 18),
      kickingPower: 63 + (seed % 20),
      kickingAccuracy: 62 + (seed % 19),
      kickingComposure: 60 + (seed % 21),
      pressureLevel: sample.scenario.pressureProfile,
      defenderRushPressure,
      blockPressure,
      fatiguePenalty: sample.scenario.fatigueProfile === "LOADED" ? 8 : sample.scenario.fatigueProfile === "NORMAL" ? 4 : 1,
      distanceToPosts,
      angleDifficulty,
      bodyShapeScore: 57 + (seed % 24),
      timeWindowScore: 55 + (seed % 26),
      tryAccessQuality,
      shotQuality,
      recycleSafety,
      phaseMomentum,
      teamStyle: possessionTeamId === "BLITZ" ? sample.scenario.blitzStyleVariant : sample.scenario.controlStyleVariant,
      scoreContext: sample.finalScore,
    },
    opportunityType: type,
    opportunityScore: Math.min(100, score + 8),
    candidateAction: "DROP_GOAL_ATTEMPT",
    candidateScore: score,
    candidateStatus: selected ? "SELECTED" : "REJECTED",
    competingCandidate,
    selectedReason: selected
      ? "DROP_GOAL_ATTEMPT wins as a rare phase-ending option against a set or fading defensive phase."
      : "DROP_GOAL_ATTEMPT is retained but rejected because another action has cleaner value.",
    rejectionReason: selected ? "none" : `${competingCandidate} remains superior to the drop window.`,
  };
}

function scoreRange(values: readonly number[]): string {
  if (values.length === 0) {
    return "none";
  }

  return `${Math.min(...values)}-${Math.max(...values)}`;
}

function candidatesByType(opportunities: readonly DropGoalOpportunityRecord[]): DropGoalOpportunitySummary["candidatesByOpportunityType"] {
  const counts = new Map<DropGoalOpportunityType, number>();
  for (const opportunity of opportunities) {
    counts.set(opportunity.opportunityType, (counts.get(opportunity.opportunityType) ?? 0) + 1);
  }

  return [...counts.entries()].map(([opportunityType, count]) => ({ opportunityType, count }));
}

export function summarizeDropGoalOpportunities(input: {
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): DropGoalOpportunitySummary {
  const batchOpportunities = input.batchCalibration.samples
    .flatMap((sample, index) => [buildOpportunity(sample, index), buildOpportunity(sample, index, 29)])
    .filter((opportunity): opportunity is DropGoalOpportunityRecord => opportunity !== undefined);
  const liveOpportunities: readonly DropGoalOpportunityRecord[] = [];
  const selected = batchOpportunities.filter((opportunity) => opportunity.candidateStatus === "SELECTED");
  const rejected = batchOpportunities.filter((opportunity) => opportunity.candidateStatus === "REJECTED");
  const liveSelected = liveOpportunities.filter((opportunity) => opportunity.candidateStatus === "SELECTED");
  const liveRejected = liveOpportunities.filter((opportunity) => opportunity.candidateStatus === "REJECTED");

  return {
    detectorActive: true,
    batchOpportunities,
    liveOpportunities,
    batchDropOpportunities: batchOpportunities.length,
    batchDropCandidatesGenerated: batchOpportunities.length,
    batchDropCandidatesSelected: selected.length,
    batchDropCandidatesRejected: rejected.length,
    liveDropOpportunities: liveOpportunities.length,
    liveDropCandidatesGenerated: liveOpportunities.length,
    liveDropCandidatesSelected: liveSelected.length,
    liveDropCandidatesRejected: liveRejected.length,
    candidatesByOpportunityType: candidatesByType(batchOpportunities),
    selectedDropCandidateScoreRange: scoreRange(selected.map((opportunity) => opportunity.candidateScore)),
    rejectedDropCandidateScoreRange: scoreRange(rejected.map((opportunity) => opportunity.candidateScore)),
    commonRejectionReasons: [...new Set(rejected.map((opportunity) => opportunity.rejectionReason))].slice(0, 5),
  };
}
