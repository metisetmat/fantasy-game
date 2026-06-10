import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { writeTacticalSnapshots } from "../../reports/visualization";
import { runMiniMatch } from "../../simulation/miniMatch";
import { resolveBallOutcomeFromShotDifficulty, resolveShotOutcomes, type ShotOutcomeContract } from "../actions";
import {
  createCalibrationScenario,
  diagnoseSeedVariation,
  type CalibrationScenario,
  type SeedVariationSample,
} from "../simulation";
import { scoringRuleLabel, SCORING_VERSION } from "./scoringRules";
import { summarizeDrawRateStyleOutcomeMonitoring } from "./drawRateStyleOutcomeMonitoring";
import { formatPercent, shotQualityBand, summarizeScoringV1GameplayCalibration } from "./scoringV1GameplayCalibration";
import type {
  BatchScoringCalibrationSummary,
  BatchReboundCalibrationEvent,
  BatchStyleBalanceProfile,
  BatchTeamStyleProfile,
  BatchVariationStatus,
  MatchScoringCalibrationSample,
  StyleBalanceStatus,
} from "./batchScoringCalibrationTypes";

const DEFAULT_BATCH_MATCHES = 50;
const MINIMUM_BATCH_MATCHES = 20;
const CONTROL_STYLE_VARIANTS = ["CONTROL_PATIENT", "CONTROL_BALANCED", "CONTROL_DIRECT"] as const;
const BLITZ_STYLE_VARIANTS = ["BLITZ_AGGRESSIVE", "BLITZ_BALANCED", "BLITZ_RISKY"] as const;

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? Math.round(((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2) : (sorted[midpoint] ?? 0);
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function parseBatchSize(value: string | undefined): number {
  const parsed = value === undefined ? DEFAULT_BATCH_MATCHES : Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return DEFAULT_BATCH_MATCHES;
  }

  return Math.max(MINIMUM_BATCH_MATCHES, parsed);
}

function matchSignature(sample: MatchScoringCalibrationSample): string {
  return [
    sample.finalScore,
    sample.totalShots,
    sample.shotGoals,
    sample.lowQualityGoals,
    sample.highQualityMisses,
    sample.forcedShotCount,
  ].join("|");
}

function scoreText(input: { readonly controlName: string; readonly control: number; readonly blitz: number; readonly blitzName: string }): string {
  return `${input.controlName} ${input.control} - ${input.blitz} ${input.blitzName}`;
}

function variationStatus(samples: readonly MatchScoringCalibrationSample[]): BatchVariationStatus {
  const unique = new Set(samples.map(matchSignature)).size;

  if (unique <= 1) {
    return "IDENTICAL_OUTPUT_WARNING";
  }

  return unique < samples.length / 2 ? "PARTIALLY_VARIED" : "VARIED";
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scenarioShotQualityModifier(scenario: CalibrationScenario, shootingTeamName: string, controlName: string): number {
  const teamForm =
    shootingTeamName === controlName ? scenario.playerFormProfile.controlModifier : scenario.playerFormProfile.blitzModifier;
  const styleModifier =
    shootingTeamName === controlName
      ? scenario.controlStyleVariant === "CONTROL_DIRECT"
        ? 6
        : scenario.controlStyleVariant === "CONTROL_PATIENT"
          ? 1
          : 4
      : scenario.blitzStyleVariant === "BLITZ_RISKY"
        ? -1
        : scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE"
          ? -8
          : -4;
  const pressureModifier = scenario.pressureProfile === "HIGH" ? -7 : scenario.pressureProfile === "MEDIUM" ? -2 : 4;
  const fatigueModifier = scenario.fatigueProfile === "LOADED" ? -5 : scenario.fatigueProfile === "FRESH" ? 3 : 0;

  return teamForm + styleModifier + pressureModifier + fatigueModifier;
}

function scenarioShotCountLimit(scenario: CalibrationScenario, baseCount: number): number {
  const pressureTrim = scenario.pressureProfile === "HIGH" ? 1 : 0;
  const directBoost = scenario.controlStyleVariant === "CONTROL_DIRECT" || scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE" ? 1 : 0;
  const fatigueTrim = scenario.fatigueProfile === "LOADED" ? 1 : 0;
  const projected = baseCount + directBoost - pressureTrim - fatigueTrim;

  return Math.max(3, Math.min(baseCount, projected));
}

function resolveScenarioOutcome(input: {
  readonly outcome: ShotOutcomeContract;
  readonly scenario: CalibrationScenario;
  readonly index: number;
  readonly controlName: string;
  readonly controlTeamId: string;
  readonly blitzTeamId: string;
  readonly currentControlScore: number;
  readonly currentBlitzScore: number;
  readonly blitzName: string;
}): { readonly adjusted: ShotOutcomeContract; readonly controlScore: number; readonly blitzScore: number } {
  const seedNoise = ((input.scenario.seed + input.index * 17) % 15) - 7;
  const shotQuality = clamp(
    input.outcome.shotQuality +
      seedNoise +
      scenarioShotQualityModifier(input.scenario, input.outcome.shootingTeamName, input.controlName),
  );
  const goalkeeperChallenge = clamp(
    input.outcome.goalkeeperChallenge +
      input.scenario.playerFormProfile.goalkeeperModifier +
      (input.scenario.blitzStyleVariant === "BLITZ_BALANCED" ? 2 : 0),
  );
  const defensiveBlockPressure = clamp(
    input.outcome.defensiveBlockPressure +
      input.scenario.playerFormProfile.blockModifier +
      (input.scenario.pressureProfile === "HIGH" ? 10 : input.scenario.pressureProfile === "MEDIUM" ? 4 : -6),
  );
  const finishingPressure = clamp(
    input.outcome.finishingPressure + (input.scenario.pressureProfile === "HIGH" ? 8 : input.scenario.pressureProfile === "LOW" ? -6 : 0),
  );
  const difficultyResolution = resolveBallOutcomeFromShotDifficulty({
    shotQuality,
    goalkeeperChallenge,
    defensiveBlockPressure,
    finishingPressure,
    shotOriginZone: input.outcome.shotOriginZone,
    cleanWindow: input.scenario.pressureProfile === "LOW" && input.index % 2 === 0,
    eliteFinisher: input.outcome.shooterInitials === "ML" || input.outcome.shooterInitials === "LP",
  });
  const ballOutcome = difficultyResolution.ballOutcome;
  const possessionAfterShot = difficultyResolution.possessionAfterShot;
  const scoringTeamId = ballOutcome === "GOAL" ? input.outcome.shootingTeamId : undefined;
  const pointsAdded = ballOutcome === "GOAL" ? 3 : 0;
  const nextControlScore =
    scoringTeamId === input.controlTeamId ? input.currentControlScore + pointsAdded : input.currentControlScore;
  const nextBlitzScore = scoringTeamId === input.blitzTeamId ? input.currentBlitzScore + pointsAdded : input.currentBlitzScore;
  const scoreBefore = scoreText({
    controlName: input.controlName,
    control: input.currentControlScore,
    blitz: input.currentBlitzScore,
    blitzName: input.blitzName,
  });
  const scoreAfter = scoreText({
    controlName: input.controlName,
    control: nextControlScore,
    blitz: nextBlitzScore,
    blitzName: input.blitzName,
  });

  return {
    controlScore: nextControlScore,
    blitzScore: nextBlitzScore,
    adjusted: {
      ...input.outcome,
      shotQuality,
      goalkeeperChallenge,
      defensiveBlockPressure,
      finishingPressure,
      difficultyFactors: difficultyResolution.difficultyFactors,
      ballOutcome,
      possessionAfterShot,
      scoringImpact: {
        ...(scoringTeamId === undefined ? {} : { teamId: scoringTeamId }),
        pointsAdded,
        scoreBefore,
        scoreAfter,
        reason:
          ballOutcome === "GOAL"
            ? `${input.outcome.shootingTeamName} SHOT_GOAL scoring event links this calibration scenario shot to 3 points.`
            : "Calibration scenario resolves this shot as non-scoring under adjusted pressure and form context.",
      },
      outcomeReason:
        ballOutcome === "GOAL"
          ? `${input.outcome.shooterInitials} converts from ${input.outcome.shotOriginZone} after seed-driven form and pressure adjustments.`
          : `${input.outcome.shooterInitials}'s shot resolves as ${ballOutcome} after seed-driven form and pressure adjustments.`,
    },
  };
}

function applyCalibrationScenario(input: {
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly scenario: CalibrationScenario;
  readonly controlName: string;
  readonly blitzName: string;
  readonly controlTeamId: string;
  readonly blitzTeamId: string;
}): readonly ShotOutcomeContract[] {
  const retainedCount = scenarioShotCountLimit(input.scenario, input.outcomes.length);
  const retained = input.outcomes.slice(0, retainedCount);
  let controlScore = 0;
  let blitzScore = 0;
  const adjusted: ShotOutcomeContract[] = [];

  for (let index = 0; index < retained.length; index += 1) {
    const outcome = retained[index];
    if (outcome === undefined) {
      continue;
    }

    const resolved = resolveScenarioOutcome({
      outcome,
      scenario: input.scenario,
      index,
      controlName: input.controlName,
      controlTeamId: input.controlTeamId,
      blitzTeamId: input.blitzTeamId,
      currentControlScore: controlScore,
      currentBlitzScore: blitzScore,
      blitzName: input.blitzName,
    });
    controlScore = resolved.controlScore;
    blitzScore = resolved.blitzScore;
    adjusted.push(resolved.adjusted);
  }

  return adjusted;
}

function winner(input: { readonly control: string; readonly blitz: string; readonly controlPoints: number; readonly blitzPoints: number }): string {
  if (input.controlPoints === input.blitzPoints) {
    return "DRAW";
  }

  return input.controlPoints > input.blitzPoints ? input.control : input.blitz;
}

function reboundCalibrationEvents(input: {
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly matchId: string;
  readonly seed: string;
  readonly scenario: CalibrationScenario;
}): readonly BatchReboundCalibrationEvent[] {
  const reboundProducingOutcomes = new Set([
    "SAVED",
    "SAVED_BY_GK",
    "CAUGHT_BY_GK",
    "DEFLECTED_BY_GK",
    "BLOCKED",
    "BLOCKED_BY_DEFENDER",
    "REBOUND",
    "REBOUND_CONTESTED",
  ]);

  return input.outcomes
    .filter((outcome) => outcome.reboundResolution.reboundType !== "NONE" && reboundProducingOutcomes.has(outcome.ballOutcome))
    .map((outcome) => ({
      matchId: input.matchId,
      seed: input.seed,
      sourceActionId: outcome.actionId,
      sourceOutcome: outcome.ballOutcome,
      reboundType: outcome.reboundResolution.reboundType,
      reboundZone: outcome.reboundResolution.reboundZone,
      attackingTeamName: outcome.shootingTeamName,
      defendingTeamName: outcome.defendingTeamName,
      attackingTeamId: outcome.shootingTeamId,
      defendingTeamId: outcome.defendingTeamId,
      controlStyleVariant: input.scenario.controlStyleVariant,
      blitzStyleVariant: input.scenario.blitzStyleVariant,
      pressureProfile: input.scenario.pressureProfile,
      nearestAttackers: outcome.reboundContinuationContext.nearestAttackers
        .map((player) => `${player.roleInitials}@${player.zone}`)
        .join(", "),
      nearestDefenders: outcome.reboundContinuationContext.nearestDefenders
        .map((player) => `${player.roleInitials}@${player.zone}`)
        .join(", "),
      goalkeeperRecoveryScore: outcome.reboundContinuationContext.goalkeeperRecoveryScore,
      attackerReactionScore: outcome.reboundContinuationContext.attackerReactionScore,
      defenderReactionScore: outcome.reboundContinuationContext.defenderReactionScore,
      reboundWinner: outcome.reboundContinuation.reboundWinner,
      winningPlayer: outcome.reboundContinuation.winningPlayerInitials ?? "none",
      nextPossession: outcome.reboundContinuation.nextPossession,
      continuationType: outcome.reboundContinuation.continuationType,
      immediateDanger: outcome.reboundContinuation.immediateDanger,
      reason: outcome.reboundContinuation.reason,
    }));
}

function sampleFromMatch(input: {
  readonly index: number;
  readonly seed: string;
  readonly controlName: string;
  readonly blitzName: string;
  readonly reportDirectory: string;
  readonly teamA: PrototypeTeamDefinition;
  readonly teamB: PrototypeTeamDefinition;
}): MatchScoringCalibrationSample {
  const scenario = createCalibrationScenario({
    index: input.index,
    seedLabel: input.seed,
    controlTeamId: input.teamA.id,
    controlTeamName: input.teamA.displayName,
    blitzTeamId: input.teamB.id,
    blitzTeamName: input.teamB.displayName,
  });
  const result = runMiniMatch({ teamA: input.teamA, teamB: input.teamB, numberOfSequences: 6, seed: scenario.seed });
  const snapshots = writeTacticalSnapshots({ result, reportDirectory: input.reportDirectory });
  const baseOutcomes = resolveShotOutcomes({ result, snapshots });
  const outcomes = applyCalibrationScenario({
    outcomes: baseOutcomes,
    scenario,
    controlName: input.controlName,
    blitzName: input.blitzName,
    controlTeamId: input.teamA.id,
    blitzTeamId: input.teamB.id,
  });
  const events = outcomes.map((outcome) => ({
    team: outcome.shootingTeamName,
    shotQuality: outcome.shotQuality,
    goalkeeperChallenge: outcome.goalkeeperChallenge,
    defensiveBlockPressure: outcome.defensiveBlockPressure,
    finishingPressure: outcome.finishingPressure,
    goalkeeperChallengeImpact: outcome.difficultyFactors.goalkeeperChallengeImpact,
    defensiveBlockPressureImpact: outcome.difficultyFactors.defensiveBlockPressureImpact,
    finishingPressureImpact: outcome.difficultyFactors.finishingPressureImpact,
    forcedShotPenalty: outcome.difficultyFactors.forcedShotPenalty,
    cleanWindowBonus: outcome.difficultyFactors.cleanWindowBonus,
    cleanWindow: outcome.difficultyFactors.cleanWindow,
    cleanWindowType: outcome.difficultyFactors.cleanWindowType,
    shotOnTarget: outcome.shotOnTarget,
    goalkeeperEvaluated: outcome.gkShotStopping.goalkeeperEvaluated,
    goalkeeperInvolved: outcome.gkShotStopping.goalkeeperInvolved,
    goalkeeperAction: outcome.goalkeeperAction,
    ballOutcome: outcome.ballOutcome,
    qualityBand: shotQualityBand(outcome.shotQuality),
    forced: outcome.difficultyFactors.forcedShot,
  }));
  const controlEvents = events.filter((event) => event.team === input.controlName);
  const blitzEvents = events.filter((event) => event.team === input.blitzName);
  const lowQualityShots = events.filter((event) => event.qualityBand === "LOW").length;
  const mediumQualityShots = events.filter((event) => event.qualityBand === "MEDIUM").length;
  const goodQualityShots = events.filter((event) => event.qualityBand === "GOOD").length;
  const highQualityShots = events.filter((event) => event.qualityBand === "HIGH").length;
  const eliteQualityShots = events.filter((event) => event.qualityBand === "ELITE").length;
  const goalEvents = events.filter((event) => event.ballOutcome === "GOAL");
  const missEvents = events.filter((event) => event.ballOutcome !== "GOAL");
  const forcedEvents = events.filter((event) => event.forced);
  const cleanWindowEvents = events.filter((event) => event.cleanWindow);
  const controlPoints = outcomes
    .filter((outcome) => outcome.scoringImpact.teamId === input.teamA.id)
    .reduce((sum, outcome) => sum + outcome.scoringImpact.pointsAdded, 0);
  const blitzPoints = outcomes
    .filter((outcome) => outcome.scoringImpact.teamId === input.teamB.id)
    .reduce((sum, outcome) => sum + outcome.scoringImpact.pointsAdded, 0);
  const scoreDifferential = Math.abs(controlPoints - blitzPoints);
  const finalScore = scoreText({
    controlName: input.controlName,
    control: controlPoints,
    blitz: blitzPoints,
    blitzName: input.blitzName,
  });
  const matchId = `match-${String(input.index).padStart(3, "0")}`;
  const reboundEvents = reboundCalibrationEvents({
    outcomes,
    matchId,
    seed: input.seed,
    scenario,
  });

  return {
    matchId,
    seed: input.seed,
    scenario,
    finalScore,
    winner: winner({ control: input.controlName, blitz: input.blitzName, controlPoints, blitzPoints }),
    scoreDifferential,
    totalShots: events.length,
    shotGoals: goalEvents.length,
    conversionRate: percent(goalEvents.length, events.length),
    controlShots: controlEvents.length,
    blitzShots: blitzEvents.length,
    controlShotGoals: controlEvents.filter((event) => event.ballOutcome === "GOAL").length,
    blitzShotGoals: blitzEvents.filter((event) => event.ballOutcome === "GOAL").length,
    controlPoints,
    blitzPoints,
    lowQualityShots,
    mediumQualityShots,
    goodQualityShots,
    highQualityShots,
    eliteQualityShots,
    lowQualityGoals: events.filter((event) => event.ballOutcome === "GOAL" && event.shotQuality < 60).length,
    highQualityMisses: events.filter((event) => event.ballOutcome !== "GOAL" && event.shotQuality >= 75).length,
    forcedShotCount: events.filter((event) => event.forced).length,
    cleanWindowShotCount: cleanWindowEvents.length,
    forcedShotGoalCount: forcedEvents.filter((event) => event.ballOutcome === "GOAL").length,
    cleanWindowGoalCount: cleanWindowEvents.filter((event) => event.ballOutcome === "GOAL").length,
    onTargetShotCount: events.filter((event) => event.shotOnTarget).length,
    goalkeeperEvaluatedCount: events.filter((event) => event.goalkeeperEvaluated).length,
    goalkeeperInvolvedCount: events.filter((event) => event.goalkeeperInvolved).length,
    goalkeeperSaveCatchDeflectCount: events.filter((event) => ["HAND_SAVE", "FOOT_SAVE", "CATCH", "DEFLECTION"].includes(event.goalkeeperAction)).length,
    goalsWithGoalkeeperEvaluated: events.filter((event) => event.ballOutcome === "GOAL" && event.goalkeeperEvaluated).length,
    goalsWithoutGoalkeeperEvaluated: events.filter((event) => event.ballOutcome === "GOAL" && !event.goalkeeperEvaluated).length,
    caughtByGoalkeeperCount: events.filter((event) => event.ballOutcome === "CAUGHT_BY_GK").length,
    savedByGoalkeeperCount: events.filter((event) => event.ballOutcome === "SAVED_BY_GK").length,
    deflectedByGoalkeeperCount: events.filter((event) => event.ballOutcome === "DEFLECTED_BY_GK").length,
    blockedByDefenderCount: events.filter((event) => event.ballOutcome === "BLOCKED_BY_DEFENDER").length,
    missedWideHighCount: events.filter((event) => event.ballOutcome === "MISSED_WIDE" || event.ballOutcome === "MISSED_HIGH").length,
    reboundEvents,
    reboundEventCount: reboundEvents.length,
    contestedReboundCount: reboundEvents.filter((event) => event.reboundType === "CONTESTED").length,
    resolvedReboundCount: reboundEvents.filter((event) => event.reboundWinner !== "CONTESTED_REMAINS").length,
    attackerReboundRecoveryCount: reboundEvents.filter((event) => event.reboundWinner === "ATTACKER").length,
    defenderReboundRecoveryCount: reboundEvents.filter((event) => event.reboundWinner === "DEFENDER").length,
    gkReboundRecoveryCount: reboundEvents.filter((event) => event.reboundWinner === "GOALKEEPER").length,
    secondShotWindowCount: reboundEvents.filter((event) => event.continuationType === "SECOND_SHOT_WINDOW").length,
    scrambleReboundCount: reboundEvents.filter((event) => event.continuationType === "SCRAMBLE").length,
    outOfPlayReboundCount: reboundEvents.filter((event) => event.continuationType === "OUT_OF_PLAY").length,
    unresolvedContestedReboundCount: reboundEvents.filter((event) => event.reboundWinner === "CONTESTED_REMAINS").length,
    contestedCleanWindowCount: cleanWindowEvents.filter((event) => event.cleanWindowType === "PARTIAL").length,
    eliteCleanWindowCount: cleanWindowEvents.filter((event) => event.cleanWindowType === "ELITE").length,
    averageShotQuality: average(events.map((event) => event.shotQuality)),
    averageGoalShotQuality: average(goalEvents.map((event) => event.shotQuality)),
    averageMissShotQuality: average(missEvents.map((event) => event.shotQuality)),
    averageGoalkeeperChallenge: average(events.map((event) => event.goalkeeperChallenge)),
    averageDefensiveBlockPressure: average(events.map((event) => event.defensiveBlockPressure)),
    averageFinishingPressure: average(events.map((event) => event.finishingPressure)),
    averageGoalkeeperChallengeImpact: average(events.map((event) => event.goalkeeperChallengeImpact)),
    averageDefensiveBlockPressureImpact: average(events.map((event) => event.defensiveBlockPressureImpact)),
    averageFinishingPressureImpact: average(events.map((event) => event.finishingPressureImpact)),
    averageForcedShotPenaltyImpact: average(events.map((event) => event.forcedShotPenalty)),
    averageCleanWindowBonusImpact: average(events.map((event) => event.cleanWindowBonus)),
    shotOutcomePattern: outcomes.map((outcome) => `${outcome.actionId}:${outcome.ballOutcome}`).join(">"),
    actionOrderSignature: result.state.records.map((record) => `${record.sequenceNumber}:${record.setup.activeZone}`).join(">"),
    blowout: scoreDifferential >= 9,
    notes: `scenario ${scenario.scenarioId}; ${scenario.pressureProfile} pressure; ${scenario.controlStyleVariant} vs ${scenario.blitzStyleVariant}`,
  };
}

function teamProfile(input: {
  readonly teamName: string;
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly shots: readonly number[];
  readonly goals: readonly number[];
  readonly points: readonly number[];
  readonly forcedShots: readonly number[];
}): BatchTeamStyleProfile {
  const shotTotal = input.shots.reduce((sum, value) => sum + value, 0);
  const goalTotal = input.goals.reduce((sum, value) => sum + value, 0);
  const forcedTotal = input.forcedShots.reduce((sum, value) => sum + value, 0);

  return {
    teamName: input.teamName,
    averageShots: average(input.shots),
    averageGoals: average(input.goals),
    averagePoints: average(input.points),
    conversionRate: percent(goalTotal, shotTotal),
    forcedShotRate: percent(forcedTotal, shotTotal),
    averageShotQuality: average(input.samples.map((sample) => sample.averageShotQuality)),
    tacticalRead:
      shotTotal === 0
        ? "No shots in batch."
        : percent(forcedTotal, shotTotal) > 40
          ? "Batch suggests a forced-shot tendency; review shot selection before changing scoring value."
          : "Batch shot profile is plausible for current V1 monitoring.",
  };
}

function styleBalanceStatus(input: {
  readonly controlWinRate: number;
  readonly blitzWinRate: number;
  readonly drawRate: number;
  readonly styleProfiles: readonly BatchStyleBalanceProfile[];
}): StyleBalanceStatus {
  const conversions = input.styleProfiles.map((profile) => profile.conversionRate);
  const conversionSpread = Math.max(...conversions) - Math.min(...conversions);

  if (input.controlWinRate < 20 || input.blitzWinRate > 60 || input.drawRate > 55 || conversionSpread > 45) {
    return "IMBALANCED";
  }

  if (input.controlWinRate < 25 || input.blitzWinRate > 50 || input.drawRate > 45 || conversionSpread > 30) {
    return "WATCH";
  }

  return "BALANCED";
}

function styleProfile(input: {
  readonly styleVariant: string;
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly teamName: string;
  readonly teamIsControl: boolean;
}): BatchStyleBalanceProfile {
  const samples = input.samples.filter((sample) =>
    input.teamIsControl ? sample.scenario.controlStyleVariant === input.styleVariant : sample.scenario.blitzStyleVariant === input.styleVariant,
  );
  const shots = samples.reduce((sum, sample) => sum + (input.teamIsControl ? sample.controlShots : sample.blitzShots), 0);
  const goals = samples.reduce((sum, sample) => sum + (input.teamIsControl ? sample.controlShotGoals : sample.blitzShotGoals), 0);
  const points = samples.reduce((sum, sample) => sum + (input.teamIsControl ? sample.controlPoints : sample.blitzPoints), 0);
  const forcedShots = samples.reduce(
    (sum, sample) => sum + Math.round((sample.forcedShotCount * (input.teamIsControl ? sample.controlShots : sample.blitzShots)) / Math.max(1, sample.totalShots)),
    0,
  );
  const cleanWindowShots = samples.reduce((sum, sample) => sum + sample.cleanWindowShotCount, 0);
  const cleanWindowGoals = samples.reduce((sum, sample) => sum + sample.cleanWindowGoalCount, 0);
  const wins = samples.filter((sample) => sample.winner === input.teamName).length;
  const draws = samples.filter((sample) => sample.winner === "DRAW").length;
  const losses = samples.length - wins - draws;

  return {
    styleVariant: input.styleVariant,
    matches: samples.length,
    shots,
    shotGoals: goals,
    conversionRate: percent(goals, shots),
    pointsPerMatch: average(samples.map((sample) => (input.teamIsControl ? sample.controlPoints : sample.blitzPoints))),
    forcedShotRate: percent(forcedShots, shots),
    cleanWindowConversionRate: percent(cleanWindowGoals, Math.max(1, cleanWindowShots)),
    winContribution: percent(wins, Math.max(1, samples.length)),
    drawContribution: percent(draws, Math.max(1, samples.length)),
    lossContribution: percent(losses, Math.max(1, samples.length)),
  };
}

function recommendation(input: {
  readonly variation: BatchVariationStatus;
  readonly conversionRate: number;
  readonly lowQualityGoalRate: number;
  readonly blowoutRate: number;
  readonly averageShotsPerMatch: number;
  readonly cleanWindowConversionRate: number;
  readonly styleBalanceStatus: StyleBalanceStatus;
}): "KEEP_RULE_BUT_MONITOR" | "ADJUST_STYLE_BALANCE" | "LOWER_SHOT_DIFFICULTY" | "RAISE_SHOT_DIFFICULTY_MORE" | "REDUCE_SHOT_FREQUENCY" | "NEEDS_MORE_SAMPLE" {
  if (input.variation === "IDENTICAL_OUTPUT_WARNING") {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.averageShotsPerMatch >= 9) {
    return "REDUCE_SHOT_FREQUENCY";
  }

  if (input.styleBalanceStatus === "IMBALANCED") {
    return "ADJUST_STYLE_BALANCE";
  }

  if (input.conversionRate < 25) {
    return "LOWER_SHOT_DIFFICULTY";
  }

  if (input.lowQualityGoalRate > 5 || input.conversionRate > 40 || input.cleanWindowConversionRate > 75) {
    return "RAISE_SHOT_DIFFICULTY_MORE";
  }

  if (input.blowoutRate > 15) {
    return "RAISE_SHOT_DIFFICULTY_MORE";
  }

  return "KEEP_RULE_BUT_MONITOR";
}

export function resolveBatchScoringCalibration(input: {
  readonly reportDirectory: string;
  readonly teamA: PrototypeTeamDefinition;
  readonly teamB: PrototypeTeamDefinition;
  readonly matchCountOverride?: number;
}): BatchScoringCalibrationSummary {
  const matchCount = Math.max(
    MINIMUM_BATCH_MATCHES,
    input.matchCountOverride ?? parseBatchSize(process.env.BATCH_SCORING_CALIBRATION_MATCHES),
  );
  const batchWorkspace = join(input.reportDirectory, "batch-scoring-calibration-work");

  if (!existsSync(batchWorkspace)) {
    mkdirSync(batchWorkspace, { recursive: true });
  }

  const samples = Array.from({ length: matchCount }, (_, index) =>
    sampleFromMatch({
      index: index + 1,
      seed: `batch-${String(index + 1).padStart(3, "0")}`,
      controlName: input.teamA.displayName,
      blitzName: input.teamB.displayName,
      reportDirectory: batchWorkspace,
      teamA: input.teamA,
      teamB: input.teamB,
    }),
  );
  const totalShots = samples.reduce((sum, sample) => sum + sample.totalShots, 0);
  const totalGoals = samples.reduce((sum, sample) => sum + sample.shotGoals, 0);
  const lowQualityGoals = samples.reduce((sum, sample) => sum + sample.lowQualityGoals, 0);
  const lowQualityShots = samples.reduce((sum, sample) => sum + sample.lowQualityShots, 0);
  const highQualityShots = samples.reduce((sum, sample) => sum + sample.highQualityShots + sample.eliteQualityShots, 0);
  const highQualityMisses = samples.reduce((sum, sample) => sum + sample.highQualityMisses, 0);
  const forcedShotCount = samples.reduce((sum, sample) => sum + sample.forcedShotCount, 0);
  const forcedShotGoalCount = samples.reduce((sum, sample) => sum + sample.forcedShotGoalCount, 0);
  const cleanWindowShotCount = samples.reduce((sum, sample) => sum + sample.cleanWindowShotCount, 0);
  const cleanWindowGoalCount = samples.reduce((sum, sample) => sum + sample.cleanWindowGoalCount, 0);
  const onTargetShotCount = samples.reduce((sum, sample) => sum + sample.onTargetShotCount, 0);
  const goalkeeperEvaluatedCount = samples.reduce((sum, sample) => sum + sample.goalkeeperEvaluatedCount, 0);
  const goalkeeperInvolvedCount = samples.reduce((sum, sample) => sum + sample.goalkeeperInvolvedCount, 0);
  const goalkeeperSaveCatchDeflectCount = samples.reduce((sum, sample) => sum + sample.goalkeeperSaveCatchDeflectCount, 0);
  const goalsWithGoalkeeperEvaluated = samples.reduce((sum, sample) => sum + sample.goalsWithGoalkeeperEvaluated, 0);
  const goalsWithoutGoalkeeperEvaluated = samples.reduce((sum, sample) => sum + sample.goalsWithoutGoalkeeperEvaluated, 0);
  const caughtByGoalkeeperCount = samples.reduce((sum, sample) => sum + sample.caughtByGoalkeeperCount, 0);
  const savedByGoalkeeperCount = samples.reduce((sum, sample) => sum + sample.savedByGoalkeeperCount, 0);
  const deflectedByGoalkeeperCount = samples.reduce((sum, sample) => sum + sample.deflectedByGoalkeeperCount, 0);
  const blockedByDefenderCount = samples.reduce((sum, sample) => sum + sample.blockedByDefenderCount, 0);
  const missedWideHighCount = samples.reduce((sum, sample) => sum + sample.missedWideHighCount, 0);
  const contestedCleanWindowCount = samples.reduce((sum, sample) => sum + sample.contestedCleanWindowCount, 0);
  const eliteCleanWindowCount = samples.reduce((sum, sample) => sum + sample.eliteCleanWindowCount, 0);
  const blowouts = samples.filter((sample) => sample.blowout).length;
  const scenarioVariation = diagnoseSeedVariation(
    samples.map(
      (sample): SeedVariationSample => ({
        scenario: sample.scenario,
        finalScore: sample.finalScore,
        winner: sample.winner,
        totalShots: sample.totalShots,
        shotOutcomePattern: sample.shotOutcomePattern,
        actionOrderSignature: sample.actionOrderSignature,
      }),
    ),
  );
  const variation = scenarioVariation.scenarioDiversityStatus === "SEED_NOT_CONNECTED_TO_SIMULATION"
    ? "SEED_NOT_CONNECTED_TO_SIMULATION"
    : variationStatus(samples);
  const averageShotsPerMatch = average(samples.map((sample) => sample.totalShots));
  const averageConversionRate = percent(totalGoals, totalShots);
  const blowoutRate = percent(blowouts, samples.length);
  const controlWinRate = percent(samples.filter((sample) => sample.winner === input.teamA.displayName).length, samples.length);
  const blitzWinRate = percent(samples.filter((sample) => sample.winner === input.teamB.displayName).length, samples.length);
  const drawRate = percent(samples.filter((sample) => sample.winner === "DRAW").length, samples.length);
  const styleBalanceProfiles = [
    ...CONTROL_STYLE_VARIANTS.map((variant) =>
      styleProfile({ styleVariant: variant, samples, teamName: input.teamA.displayName, teamIsControl: true }),
    ),
    ...BLITZ_STYLE_VARIANTS.map((variant) =>
      styleProfile({ styleVariant: variant, samples, teamName: input.teamB.displayName, teamIsControl: false }),
    ),
  ];
  const styleStatus = styleBalanceStatus({ controlWinRate, blitzWinRate, drawRate, styleProfiles: styleBalanceProfiles });
  const rec = recommendation({
    variation,
    conversionRate: averageConversionRate,
    lowQualityGoalRate: percent(lowQualityGoals, Math.max(1, lowQualityShots)),
    blowoutRate,
    averageShotsPerMatch,
    styleBalanceStatus: styleStatus,
    cleanWindowConversionRate: percent(cleanWindowGoalCount, Math.max(1, cleanWindowShotCount)),
  });

  return {
    scoringVersion: SCORING_VERSION,
    scoringRule: scoringRuleLabel("SHOT_GOAL"),
    scoreUnit: "POINTS",
    matchesSimulated: samples.length,
    seedsUsed: samples.map((sample) => sample.seed),
    variationStatus: variation,
    scenarioVariation,
    shotDifficultyCalibrationApplied: true,
    cleanWindowCalibrationApplied: true,
    conversionTargetRange: "25% to 40%",
    cleanWindowConversionTargetRange: "60% to 75%",
    styleBalanceStatus: styleStatus,
    recommendation: rec,
    scorelinePlausibility: variation === "IDENTICAL_OUTPUT_WARNING" ? "NEEDS_MORE_SAMPLE" : "PLAUSIBLE",
    averageTotalPointsPerMatch: average(samples.map((sample) => sample.controlPoints + sample.blitzPoints)),
    averageScoreDifferential: average(samples.map((sample) => sample.scoreDifferential)),
    medianScoreDifferential: median(samples.map((sample) => sample.scoreDifferential)),
    blowoutRate,
    controlWinRate,
    blitzWinRate,
    drawRate,
    averageShotsPerMatch,
    averageShotGoalsPerMatch: average(samples.map((sample) => sample.shotGoals)),
    averageConversionRate,
    averageControlShots: average(samples.map((sample) => sample.controlShots)),
    averageBlitzShots: average(samples.map((sample) => sample.blitzShots)),
    averageControlPoints: average(samples.map((sample) => sample.controlPoints)),
    averageBlitzPoints: average(samples.map((sample) => sample.blitzPoints)),
    averageShotQuality: average(samples.map((sample) => sample.averageShotQuality)),
    averageGoalShotQuality: average(samples.map((sample) => sample.averageGoalShotQuality)),
    averageMissShotQuality: average(samples.map((sample) => sample.averageMissShotQuality)),
    lowQualityShots,
    lowQualityGoals,
    lowQualityGoalRate: percent(lowQualityGoals, Math.max(1, lowQualityShots)),
    highQualityShots,
    highQualityMisses,
    highQualityMissRate: percent(highQualityMisses, Math.max(1, highQualityShots)),
    forcedShotCount,
    forcedShotRate: percent(forcedShotCount, totalShots),
    forcedShotConversionRate: percent(forcedShotGoalCount, Math.max(1, forcedShotCount)),
    cleanWindowConversionRate: percent(cleanWindowGoalCount, Math.max(1, cleanWindowShotCount)),
    onTargetShotCount,
    goalkeeperEvaluatedCount,
    goalkeeperInvolvedCount,
    goalkeeperSaveCatchDeflectCount,
    goalsWithGoalkeeperEvaluated,
    goalsWithoutGoalkeeperEvaluated,
    caughtByGoalkeeperCount,
    savedByGoalkeeperCount,
    deflectedByGoalkeeperCount,
    blockedByDefenderCount,
    missedWideHighCount,
    averageGoalkeeperChallengeImpact: average(samples.map((sample) => sample.averageGoalkeeperChallengeImpact)),
    averageDefensiveBlockPressureImpact: average(samples.map((sample) => sample.averageDefensiveBlockPressureImpact)),
    averageFinishingPressureImpact: average(samples.map((sample) => sample.averageFinishingPressureImpact)),
    averageForcedShotPenaltyImpact: average(samples.map((sample) => sample.averageForcedShotPenaltyImpact)),
    averageCleanWindowBonusImpact: average(samples.map((sample) => sample.averageCleanWindowBonusImpact)),
    contestedCleanWindowCount,
    eliteCleanWindowCount,
    styleBalanceProfiles,
    samples,
    teamProfiles: [
      teamProfile({
        teamName: input.teamA.displayName,
        samples,
        shots: samples.map((sample) => sample.controlShots),
        goals: samples.map((sample) => sample.controlShotGoals),
        points: samples.map((sample) => sample.controlPoints),
        forcedShots: samples.map((sample) => Math.round((sample.forcedShotCount * sample.controlShots) / Math.max(1, sample.totalShots))),
      }),
      teamProfile({
        teamName: input.teamB.displayName,
        samples,
        shots: samples.map((sample) => sample.blitzShots),
        goals: samples.map((sample) => sample.blitzShotGoals),
        points: samples.map((sample) => sample.blitzPoints),
        forcedShots: samples.map((sample) => Math.round((sample.forcedShotCount * sample.blitzShots) / Math.max(1, sample.totalShots))),
      }),
    ],
    warnings: [
      ...(variation === "IDENTICAL_OUTPUT_WARNING" ? ["batch lacks variation; calibration sample may not be meaningful"] : []),
      ...(scenarioVariation.seedImpactStatus === "SEED_NOT_CONNECTED_TO_SIMULATION" ? ["seed is not connected to scenario inputs"] : []),
    ],
  };
}

export function createBatchScoringCalibrationReport(summary: BatchScoringCalibrationSummary): string {
  const drawMonitoring = summarizeDrawRateStyleOutcomeMonitoring(summary);

  return [
    "# Scoring V1 Batch Calibration",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    `- scoring rule: ${summary.scoringRule}`,
    `- score unit: ${summary.scoreUnit}`,
    `- matches simulated: ${summary.matchesSimulated}`,
    `- seeds used: ${summary.seedsUsed.join(", ")}`,
    `- batch variation status: ${summary.variationStatus}`,
    `- shot difficulty calibration applied: ${summary.shotDifficultyCalibrationApplied ? "YES" : "NO"}`,
    `- clean-window calibration applied: ${summary.cleanWindowCalibrationApplied ? "YES" : "NO"}`,
    `- conversion target range: ${summary.conversionTargetRange}`,
    `- clean-window conversion: ${formatPercent(summary.cleanWindowConversionRate)}`,
    `- style balance status: ${summary.styleBalanceStatus}`,
    `- actual conversion rate: ${formatPercent(summary.averageConversionRate)}`,
    "- draw monitoring available: YES",
    `- draw rate type summary: 0-0 ${drawMonitoring.nilNilDrawRate}%; scoring draws ${drawMonitoring.scoringDrawRate}%`,
    `- draw recommendation: ${drawMonitoring.recommendation}`,
    `- recommendation after calibration: ${summary.recommendation}`,
    `- recommendation: ${summary.recommendation}`,
    ...summary.warnings.map((warning) => `- WARNING: ${warning}`),
    "",
    "## Aggregate Scoring Metrics",
    `- average total points per match: ${summary.averageTotalPointsPerMatch}`,
    `- average score differential: ${summary.averageScoreDifferential}`,
    `- median score differential: ${summary.medianScoreDifferential}`,
    `- blowout rate: ${formatPercent(summary.blowoutRate)}`,
    `- CONTROL win rate: ${formatPercent(summary.controlWinRate)}`,
    `- BLITZ win rate: ${formatPercent(summary.blitzWinRate)}`,
    `- draw rate: ${formatPercent(summary.drawRate)}`,
    `- average shots per match: ${summary.averageShotsPerMatch}`,
    `- average SHOT_GOAL per match: ${summary.averageShotGoalsPerMatch}`,
    `- average conversion rate: ${formatPercent(summary.averageConversionRate)}`,
    `- average CONTROL shots: ${summary.averageControlShots}`,
    `- average BLITZ shots: ${summary.averageBlitzShots}`,
    `- average CONTROL points: ${summary.averageControlPoints}`,
    `- average BLITZ points: ${summary.averageBlitzPoints}`,
    "",
    "## Shot Quality Metrics",
    `- average shot quality: ${summary.averageShotQuality}/100`,
    `- average shot quality for goals: ${summary.averageGoalShotQuality}/100`,
    `- average shot quality for misses: ${summary.averageMissShotQuality}/100`,
    `- low-quality shots: ${summary.lowQualityShots}`,
    `- low-quality goals: ${summary.lowQualityGoals}`,
    `- low-quality goal rate: ${formatPercent(summary.lowQualityGoalRate)}`,
    `- high-quality shots: ${summary.highQualityShots}`,
    `- high-quality misses: ${summary.highQualityMisses}`,
    `- high-quality miss rate: ${formatPercent(summary.highQualityMissRate)}`,
    `- forced shot count: ${summary.forcedShotCount}`,
    `- forced shot rate: ${formatPercent(summary.forcedShotRate)}`,
    `- forced shot conversion rate: ${formatPercent(summary.forcedShotConversionRate)}`,
    `- clean-window conversion rate: ${formatPercent(summary.cleanWindowConversionRate)}`,
    "",
    "## Shot Difficulty Factors",
    `- average goalkeeper challenge impact: ${summary.averageGoalkeeperChallengeImpact}`,
    `- average block pressure impact: ${summary.averageDefensiveBlockPressureImpact}`,
    `- average finishing pressure impact: ${summary.averageFinishingPressureImpact}`,
    `- average forced-shot penalty impact: ${summary.averageForcedShotPenaltyImpact}`,
    `- average clean-window bonus impact: ${summary.averageCleanWindowBonusImpact}`,
    "",
    "## Goalkeeper Diagnostics",
    "- goalkeeper model active: YES",
    `- on-target shots checked: ${summary.onTargetShotCount}`,
    `- goalkeeper evaluated count: ${summary.goalkeeperEvaluatedCount}`,
    `- goalkeeper save/catch/deflect count: ${summary.goalkeeperSaveCatchDeflectCount}`,
    `- goals with GK evaluated: ${summary.goalsWithGoalkeeperEvaluated}`,
    `- goals without GK evaluated: ${summary.goalsWithoutGoalkeeperEvaluated}`,
    `- non-goal shot outcome distribution: caught ${summary.caughtByGoalkeeperCount}, saved ${summary.savedByGoalkeeperCount}, deflected ${summary.deflectedByGoalkeeperCount}, blocked ${summary.blockedByDefenderCount}, missed wide/high ${summary.missedWideHighCount}`,
    "",
    "## Scenario Variation Summary",
    `- unique final scores: ${summary.scenarioVariation.uniqueFinalScores}`,
    `- unique winners: ${summary.scenarioVariation.uniqueWinners}`,
    `- unique shot counts: ${summary.scenarioVariation.uniqueShotCounts}`,
    `- unique shot outcomes patterns: ${summary.scenarioVariation.uniqueShotOutcomePatterns}`,
    `- unique initial scenarios: ${summary.scenarioVariation.uniqueInitialScenarios}`,
    `- seed impact status: ${summary.scenarioVariation.seedImpactStatus}`,
    `- scenario diversity status: ${summary.scenarioVariation.scenarioDiversityStatus}`,
    `- connected simulation inputs: ${summary.scenarioVariation.connectedSimulationInputCount}`,
    "",
    "## Team / Style Profile",
    "",
    ...summary.teamProfiles.flatMap((profile) => [
      `### ${profile.teamName}`,
      `- average shots: ${profile.averageShots}`,
      `- average goals: ${profile.averageGoals}`,
      `- average points: ${profile.averagePoints}`,
      `- conversion rate: ${formatPercent(profile.conversionRate)}`,
      `- forced shot rate: ${formatPercent(profile.forcedShotRate)}`,
      `- average shot quality: ${profile.averageShotQuality}/100`,
      `- tactical read: ${profile.tacticalRead}`,
      "",
    ]),
    "## Style Balance Profile",
    "",
    "| style | matches | shots | shot goals | conversion rate | points per match | forced-shot rate | clean-window conversion | win | draw | loss |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...summary.styleBalanceProfiles.map(
      (profile) =>
        `| ${profile.styleVariant} | ${profile.matches} | ${profile.shots} | ${profile.shotGoals} | ${formatPercent(profile.conversionRate)} | ${profile.pointsPerMatch} | ${formatPercent(profile.forcedShotRate)} | ${formatPercent(profile.cleanWindowConversionRate)} | ${formatPercent(profile.winContribution)} | ${formatPercent(profile.drawContribution)} | ${formatPercent(profile.lossContribution)} |`,
    ),
    "",
    "## Match Sample Table",
    "",
    "| matchId | seed | scenario | initial zone | pressure | styles | final score | winner | shots | shot goals | conversion rate | score differential | notes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...summary.samples.map(
      (sample) =>
        `| ${sample.matchId} | ${sample.seed} | ${sample.scenario.scenarioId} | ${sample.scenario.initialBallZone} | ${sample.scenario.pressureProfile} | ${sample.scenario.controlStyleVariant}/${sample.scenario.blitzStyleVariant} | ${sample.finalScore} | ${sample.winner} | ${sample.totalShots} | ${sample.shotGoals} | ${formatPercent(sample.conversionRate)} | ${sample.scoreDifferential} | ${sample.notes} |`,
    ),
    "",
    "## Calibration Interpretation",
    `- Is SHOT_GOAL = 3 creating plausible scorelines? ${summary.variationStatus === "IDENTICAL_OUTPUT_WARNING" ? "Cannot conclude yet because batch outputs are identical." : "Current aggregate scoreline shape is plausible."}`,
    `- Are teams shooting too often? Average shots per match is ${summary.averageShotsPerMatch}, which is ${summary.averageShotsPerMatch >= 9 ? "high" : summary.averageShotsPerMatch <= 2 ? "too low" : "plausible"}.`,
    `- Are low-quality shots scoring? Low-quality goals: ${summary.lowQualityGoals}.`,
    `- Are high-quality shots missing too often? High-quality miss rate: ${formatPercent(summary.highQualityMissRate)}.`,
    `- Are blowouts too frequent? Blowout rate: ${formatPercent(summary.blowoutRate)}.`,
    `- Does CONTROL or BLITZ have a systematic scoring bias? CONTROL win rate is ${formatPercent(summary.controlWinRate)}; variation must improve before attributing style imbalance.`,
    `- Does batch variation look meaningful? ${summary.variationStatus}.`,
    "",
    "## Recommendation",
    `- recommendation: ${summary.recommendation}`,
    `- rationale: ${summary.variationStatus === "IDENTICAL_OUTPUT_WARNING" ? "batch outputs are repetitive, so keep V1 unchanged and improve sample variation before rebalancing." : summary.averageConversionRate > 40 ? "conversion remains above the target range, so difficulty may still need another small increase." : summary.averageConversionRate < 25 ? "conversion has fallen below target range, so difficulty may need easing." : "conversion is inside the target range while SHOT_GOAL remains unchanged."}`,
    "",
  ].join("\n");
}

export function createShotDifficultyCalibrationReport(summary: BatchScoringCalibrationSummary): string {
  const previousConversionRate = 65;
  const previousHighQualityMissRate = 1;
  const previousShotGoalsPerMatch = 4;

  return [
    "# Shot Difficulty Calibration",
    "",
    "## Summary",
    `- previous batch conversion rate: ${previousConversionRate}%`,
    `- new batch conversion rate: ${summary.averageConversionRate}%`,
    `- previous high-quality miss rate: ${previousHighQualityMissRate}%`,
    `- new high-quality miss rate: ${summary.highQualityMissRate}%`,
    `- previous average SHOT_GOAL per match: ${previousShotGoalsPerMatch}`,
    `- new average SHOT_GOAL per match: ${summary.averageShotGoalsPerMatch}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## New Batch Metrics",
    `- matches simulated: ${summary.matchesSimulated}`,
    `- average shots per match: ${summary.averageShotsPerMatch}`,
    `- average SHOT_GOAL per match: ${summary.averageShotGoalsPerMatch}`,
    `- conversion rate: ${summary.averageConversionRate}%`,
    `- high-quality miss rate: ${summary.highQualityMissRate}%`,
    `- low-quality goal rate: ${summary.lowQualityGoalRate}%`,
    `- forced shot conversion rate: ${summary.forcedShotConversionRate}%`,
    `- clean-window conversion rate: ${summary.cleanWindowConversionRate}%`,
    `- blowout rate: ${summary.blowoutRate}%`,
    `- CONTROL win rate: ${summary.controlWinRate}%`,
    `- BLITZ win rate: ${summary.blitzWinRate}%`,
    `- draw rate: ${summary.drawRate}%`,
    "",
    "## Shot Difficulty Factors",
    `- average goalkeeper challenge impact: ${summary.averageGoalkeeperChallengeImpact}`,
    `- average block pressure impact: ${summary.averageDefensiveBlockPressureImpact}`,
    `- average finishing pressure impact: ${summary.averageFinishingPressureImpact}`,
    `- forced-shot penalty impact: ${summary.averageForcedShotPenaltyImpact}`,
    `- clean-window bonus impact: ${summary.averageCleanWindowBonusImpact}`,
    "",
    "## Goalkeeper Diagnostics",
    "- goalkeeper model active: YES",
    `- on-target shots checked: ${summary.onTargetShotCount}`,
    `- goalkeeper evaluated count: ${summary.goalkeeperEvaluatedCount}`,
    `- goalkeeper save/catch/deflect count: ${summary.goalkeeperSaveCatchDeflectCount}`,
    `- goals with GK evaluated: ${summary.goalsWithGoalkeeperEvaluated}`,
    `- goals without GK evaluated: ${summary.goalsWithoutGoalkeeperEvaluated}`,
    `- non-goal shot outcome distribution: caught ${summary.caughtByGoalkeeperCount}, saved ${summary.savedByGoalkeeperCount}, deflected ${summary.deflectedByGoalkeeperCount}, blocked ${summary.blockedByDefenderCount}, missed wide/high ${summary.missedWideHighCount}`,
    "",
    "## Clean Window Calibration",
    "- previous clean-window conversion: 95%",
    `- new clean-window conversion: ${summary.cleanWindowConversionRate}%`,
    "- target range: 60%-75%",
    "- clean-window bonus cap: 4",
    `- contested clean-window count: ${summary.contestedCleanWindowCount}`,
    `- elite clean-window count: ${summary.eliteCleanWindowCount}`,
    "",
    "## Style Balance Impact",
    `- CONTROL win rate: ${summary.controlWinRate}%`,
    `- BLITZ win rate: ${summary.blitzWinRate}%`,
    `- draw rate: ${summary.drawRate}%`,
    `- style with highest conversion: ${[...summary.styleBalanceProfiles].sort((left, right) => right.conversionRate - left.conversionRate)[0]?.styleVariant ?? "none"}`,
    `- style with lowest conversion: ${[...summary.styleBalanceProfiles].sort((left, right) => left.conversionRate - right.conversionRate)[0]?.styleVariant ?? "none"}`,
    `- imbalance warning: ${summary.styleBalanceStatus === "BALANCED" ? "none" : summary.styleBalanceStatus}`,
    "",
    "## Interpretation",
    `- Did conversion enter target range? ${summary.averageConversionRate >= 25 && summary.averageConversionRate <= 40 ? "YES" : "NO"}.`,
    `- Are high-quality shots still valuable but not automatic? ${summary.highQualityMissRate >= 15 && summary.highQualityMissRate <= 35 ? "YES" : "PARTIAL"}.`,
    `- Are forced shots punished enough? ${summary.forcedShotConversionRate <= summary.averageConversionRate ? "YES" : "REVIEW"}.`,
    `- Did scorelines remain plausible? ${summary.blowoutRate <= 15 ? "YES" : "REVIEW"}.`,
    `- Did team/style balance stay healthy? CONTROL win rate ${summary.controlWinRate}%, BLITZ win rate ${summary.blitzWinRate}%, draw rate ${summary.drawRate}%.`,
    "",
  ].join("\n");
}

export function createCleanWindowStyleBalanceReport(summary: BatchScoringCalibrationSummary): string {
  return [
    "# Clean Window & Style Balance",
    "",
    "## Clean Window Calibration",
    "- previous clean-window conversion: 95%",
    `- new clean-window conversion: ${summary.cleanWindowConversionRate}%`,
    "- target range: 60%-75%",
    "- clean-window bonus cap: 4",
    `- contested clean-window count: ${summary.contestedCleanWindowCount}`,
    `- elite clean-window count: ${summary.eliteCleanWindowCount}`,
    "",
    "## Style Balance Impact",
    `- CONTROL win rate: ${summary.controlWinRate}%`,
    `- BLITZ win rate: ${summary.blitzWinRate}%`,
    `- draw rate: ${summary.drawRate}%`,
    `- style balance status: ${summary.styleBalanceStatus}`,
    `- style with highest conversion: ${[...summary.styleBalanceProfiles].sort((left, right) => right.conversionRate - left.conversionRate)[0]?.styleVariant ?? "none"}`,
    `- style with lowest conversion: ${[...summary.styleBalanceProfiles].sort((left, right) => left.conversionRate - right.conversionRate)[0]?.styleVariant ?? "none"}`,
    `- imbalance warning: ${summary.styleBalanceStatus === "BALANCED" ? "none" : summary.styleBalanceStatus}`,
    "",
    "## Style Diagnostics",
    "",
    "| style | matches | shots | shot goals | conversion rate | points per match | forced-shot rate | clean-window conversion | win | draw | loss |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...summary.styleBalanceProfiles.map(
      (profile) =>
        `| ${profile.styleVariant} | ${profile.matches} | ${profile.shots} | ${profile.shotGoals} | ${profile.conversionRate}% | ${profile.pointsPerMatch} | ${profile.forcedShotRate}% | ${profile.cleanWindowConversionRate}% | ${profile.winContribution}% | ${profile.drawContribution}% | ${profile.lossContribution}% |`,
    ),
    "",
    "## Recommendation",
    `- recommendation: ${summary.recommendation}`,
    `- rationale: ${summary.styleBalanceStatus === "IMBALANCED" ? "style balance needs adjustment before judging point value." : summary.cleanWindowConversionRate > 75 ? "clean windows are still converting above target and should be watched." : "clean-window conversion is inside or near target."}`,
    "",
  ].join("\n");
}
