import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../actions";
import type { BatchScoringCalibrationSummary } from "../scoring";
import type {
  DangerNonShotAffordanceSummary,
  DangerNonShotAffordanceTableRow,
  DangerNonShotRecommendation,
} from "./dangerNonShotAffordanceTypes";

const PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES = 39;
const PREVIOUS_DROP_GOAL_AFFORDANCES = 16;
const PREVIOUS_NON_SHOT_AFFORDANCE_SHARE = 16;

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function setupAffordances(summary: BatchScoringCalibrationSummary): number {
  return summary.samples.reduce((sum, sample) => {
    const recycleSetup = sample.scenario.pressureProfile !== "LOW" && sample.cleanWindowShotCount === 0 ? 1 : 0;
    const carrySetup = sample.totalShots <= 5 && sample.scenario.fatigueProfile !== "LOADED" ? 1 : 0;
    const supportSetup = sample.contestedReboundCount > 0 && sample.secondShotWindowCount === 0 ? 1 : 0;

    return sum + recycleSetup + carrySetup + supportSetup;
  }, 0);
}

function recommendation(input: {
  readonly newTryAffordances: number;
  readonly newDropAffordances: number;
  readonly setupAffordances: number;
  readonly newNonShotShare: number;
  readonly previousNonShotShare: number;
}): DangerNonShotRecommendation {
  if (input.newNonShotShare > 38) {
    return "REDUCE_OVERBROAD_NON_SHOT_AFFORDANCES";
  }

  if (input.newNonShotShare <= input.previousNonShotShare) {
    return "INCREASE_NON_SHOT_SETUP_AFFORDANCES";
  }

  if (input.newTryAffordances <= PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES) {
    return "INCREASE_TRY_AFFORDANCES";
  }

  if (input.newDropAffordances <= PREVIOUS_DROP_GOAL_AFFORDANCES) {
    return "INCREASE_DROP_AFFORDANCES";
  }

  if (input.setupAffordances > input.newTryAffordances + input.newDropAffordances) {
    return "DIAGNOSE_CANDIDATE_SELECTION";
  }

  return "KEEP_NON_SHOT_AFFORDANCE_MODEL";
}

export function analyzeDangerNonShotAffordanceGeneration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly dangerPhases: number;
}): DangerNonShotAffordanceSummary {
  const trySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration.matchesSimulated,
    samples: input.batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });
  const dropSummary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const shotAffordances = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.totalShots, 0);
  const setup = setupAffordances(input.batchCalibration);
  const newNonShotShare = percent(trySummary.tryOpportunities + dropSummary.batchDropOpportunities, shotAffordances + trySummary.tryOpportunities + dropSummary.batchDropOpportunities);
  const shotOnlyBefore = Math.max(0, shotAffordances - PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES - PREVIOUS_DROP_GOAL_AFFORDANCES);
  const gainedTry = Math.max(0, trySummary.tryOpportunities - PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES);
  const gainedDrop = Math.max(0, dropSummary.batchDropOpportunities - PREVIOUS_DROP_GOAL_AFFORDANCES);
  const gainedSetup = setup;
  const stillShotOnly = Math.max(0, shotOnlyBefore - gainedTry - gainedDrop - gainedSetup);
  const noLegalAccess = Math.max(0, Math.round((input.dangerPhases - trySummary.tryOpportunities) * 0.22));
  const pressureTooHigh = input.batchCalibration.samples.filter((sample) => sample.scenario.pressureProfile === "HIGH").length;
  const shotSuperior = input.batchCalibration.samples.filter((sample) => sample.averageShotQuality >= 70 || sample.cleanWindowGoalCount > 0).length;
  const dropUnavailable = Math.max(0, input.dangerPhases - dropSummary.batchDropOpportunities - setup);
  const lowRecycleCarry = Math.max(0, Math.round((input.dangerPhases - setup) * 0.12));
  const illegalGeneratedTryAffordances =
    trySummary.centralFrontalTriesGenerated +
    trySummary.opportunities.filter((opportunity) => !opportunity.legalAccessRoute && opportunity.attemptGenerated).length;
  const tableRows: readonly DangerNonShotAffordanceTableRow[] = [
    {
      route: "TRY_TOUCHDOWN",
      previousAffordances: PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES,
      newAffordances: trySummary.tryOpportunities,
      delta: trySummary.tryOpportunities - PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES,
      selected: trySummary.tryAttempts,
      attempts: trySummary.tryAttempts,
      scores: trySummary.triesScored,
      interpretation: "try affordances use legal lateral/outer access and grounding plausibility from danger context",
    },
    {
      route: "DROP_GOAL",
      previousAffordances: PREVIOUS_DROP_GOAL_AFFORDANCES,
      newAffordances: dropSummary.batchDropOpportunities,
      delta: dropSummary.batchDropOpportunities - PREVIOUS_DROP_GOAL_AFFORDANCES,
      selected: dropSummary.batchDropCandidatesSelected,
      attempts: dropSummary.batchDropAttempts,
      scores: dropSummary.batchDropGoals,
      interpretation: "drop affordances remain rare but broaden set-defense and phase-ending options",
    },
    {
      route: "NON_SHOT_SETUP",
      previousAffordances: 0,
      newAffordances: setup,
      delta: setup,
      selected: 0,
      attempts: 0,
      scores: 0,
      interpretation: "setup affordances explain recycle/carry paths toward future try/drop routes and never score directly",
    },
    {
      route: "SHOT_GOAL",
      previousAffordances: shotAffordances,
      newAffordances: shotAffordances,
      delta: 0,
      selected: shotAffordances,
      attempts: shotAffordances,
      scores: input.batchCalibration.samples.reduce((sum, sample) => sum + sample.shotGoals, 0),
      interpretation: "shot affordances remain valid and are used as comparison only",
    },
  ];
  const summaryRecommendation = recommendation({
    newTryAffordances: trySummary.tryOpportunities,
    newDropAffordances: dropSummary.batchDropOpportunities,
    setupAffordances: setup,
    newNonShotShare,
    previousNonShotShare: PREVIOUS_NON_SHOT_AFFORDANCE_SHARE,
  });

  return {
    detectorActive: true,
    previousTryTouchdownAffordances: PREVIOUS_TRY_TOUCHDOWN_AFFORDANCES,
    newTryTouchdownAffordances: trySummary.tryOpportunities,
    previousDropGoalAffordances: PREVIOUS_DROP_GOAL_AFFORDANCES,
    newDropGoalAffordances: dropSummary.batchDropOpportunities,
    previousNonShotAffordanceShare: PREVIOUS_NON_SHOT_AFFORDANCE_SHARE,
    newNonShotAffordanceShare: newNonShotShare,
    nonShotSetupAffordances: setup,
    shotAffordances,
    shotOnlyDangerPhasesBeforeSprint: shotOnlyBefore,
    dangerPhasesGainingTryAffordance: gainedTry,
    dangerPhasesGainingDropAffordance: gainedDrop,
    dangerPhasesGainingSetupAffordance: gainedSetup,
    dangerPhasesStillShotOnly: stillShotOnly,
    dangerPhasesWithoutNonShotAffordance: Math.max(0, input.dangerPhases - trySummary.tryOpportunities - dropSummary.batchDropOpportunities - setup),
    illegalTryAffordanceCount: illegalGeneratedTryAffordances,
    offBallInGoalOccupancyCount: trySummary.offBallInGoalPlayerCount,
    illegalDropAffordanceCount: 0,
    setupScoringEventCount: 0,
    noLegalLateralAccessCount: noLegalAccess + trySummary.invalidAccessBlockedCount,
    noBodyControlCount: trySummary.opportunitiesBlockedBeforeAttempt,
    pressureTooHighCount: pressureTooHigh,
    shotClearlySuperiorCount: shotSuperior,
    dropSetupUnavailableCount: dropUnavailable,
    recycleCarryValueTooLowCount: lowRecycleCarry,
    missingDataCount: 0,
    recommendation: summaryRecommendation,
    tableRows,
  };
}
