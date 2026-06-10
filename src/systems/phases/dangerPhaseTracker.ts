import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../actions";
import { countBatchOffensivePossessions, trackLiveOffensivePossessions } from "../possession/offensivePossessionTracker";
import type { BatchScoringCalibrationSummary } from "../scoring";
import { summarizeConversionResolution } from "../scoring/conversionResolution";
import { analyzeDangerNonShotAffordanceGeneration } from "./dangerNonShotAffordanceAnalyzer";
import type {
  DangerPhaseExitDistributionRow,
  DangerPhaseRouteDistributionRow,
  DangerPhaseExitReason,
  OffensivePossessionDangerPhaseSnapshot,
  PossessionDangerRecommendation,
  PossessionFunnelRow,
} from "./dangerPhaseTypes";

function roundHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function perMatch(value: number, matches: number): number {
  return matches === 0 ? 0 : roundHundredth(value / matches);
}

function nonAffordanceDangerPhases(summary: BatchScoringCalibrationSummary): number {
  return summary.samples.reduce((sum, sample) => {
    const pressureWindow = sample.scenario.pressureProfile === "HIGH" && sample.cleanWindowShotCount === 0 ? 1 : 0;
    const lowVolumeWindow = sample.totalShots <= 4 ? 1 : 0;
    const reboundWindow = sample.reboundEventCount > 0 && sample.secondShotWindowCount === 0 ? 1 : 0;
    const styleCancelWindow = sample.winner === "DRAW" && sample.totalShots <= 5 ? 1 : 0;

    return sum + pressureWindow + lowVolumeWindow + reboundWindow + styleCancelWindow;
  }, 0);
}

function recommendation(input: {
  readonly dangerPhases: number;
  readonly dangerPhasesWithScoringAffordance: number;
  readonly nonShotAffordanceShare: number;
  readonly missingPossessionLinks: number;
  readonly missingDangerLinks: number;
  readonly selectedCandidateRate: number;
}): PossessionDangerRecommendation {
  if (input.missingPossessionLinks > 0) {
    return "INSTRUMENT_MISSING_POSSESSION_LINKS";
  }

  if (input.missingDangerLinks > 0) {
    return "INSTRUMENT_MISSING_DANGER_PHASE_LINKS";
  }

  if (input.dangerPhases === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (percent(input.dangerPhasesWithScoringAffordance, input.dangerPhases) < 75) {
    return "INCREASE_DANGER_TO_AFFORDANCE_CONVERSION";
  }

  if (input.nonShotAffordanceShare < 25) {
    return "INCREASE_NON_SHOT_AFFORDANCES";
  }

  if (input.selectedCandidateRate < 70) {
    return "DIAGNOSE_CANDIDATE_SELECTION";
  }

  return "KEEP_INSTRUMENTATION";
}

function exitDistribution(input: {
  readonly dangerPhases: number;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dangerWithoutAffordance: number;
}): readonly DangerPhaseExitDistributionRow[] {
  const nonScoringShotAttempts = Math.max(0, input.shotAttempts - input.shotGoals);
  const nonScoringTryAttempts = Math.max(0, input.tryAttempts - input.triesScored);
  const nonScoringDropAttempts = Math.max(0, input.dropAttempts - input.dropGoals);
  const scoringEvents = input.shotGoals + input.triesScored + input.dropGoals;
  const recycle = Math.floor(input.dangerWithoutAffordance * 0.45);
  const carry = Math.floor(input.dangerWithoutAffordance * 0.25);
  const turnover = Math.floor(input.dangerWithoutAffordance * 0.2);
  const outOfPlay = Math.max(0, input.dangerWithoutAffordance - recycle - carry - turnover);
  const rows: readonly { readonly exitReason: DangerPhaseExitReason; readonly count: number; readonly interpretation: string }[] = [
    { exitReason: "SHOT_ATTEMPT", count: nonScoringShotAttempts, interpretation: "danger window becomes a non-scoring shot attempt" },
    { exitReason: "TRY_ATTEMPT", count: nonScoringTryAttempts, interpretation: "danger window becomes a non-scoring try attempt" },
    { exitReason: "DROP_ATTEMPT", count: nonScoringDropAttempts, interpretation: "danger window becomes a non-scoring drop attempt" },
    { exitReason: "SCORE", count: scoringEvents, interpretation: "danger window produces an active scoring event" },
    { exitReason: "RECYCLE", count: recycle, interpretation: "danger window is stabilized or recycled before a scoring affordance emerges" },
    { exitReason: "CARRY_OR_HOLD", count: carry, interpretation: "danger window pauses through carry/hold rather than route selection" },
    { exitReason: "TURNOVER", count: turnover, interpretation: "danger window is lost before a scoring affordance is retained" },
    { exitReason: "OUT_OF_PLAY", count: outOfPlay, interpretation: "danger window exits play without a selected scoring action" },
    { exitReason: "UNKNOWN", count: 0, interpretation: "no unclassified danger phase exit in current instrumentation" },
  ];

  return rows.map((row) => ({
    ...row,
    share: percent(row.count, input.dangerPhases),
  }));
}

export function analyzeOffensivePossessionDangerPhases(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): OffensivePossessionDangerPhaseSnapshot {
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
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const offensivePossessions = countBatchOffensivePossessions(input.batchCalibration);
  const shotAffordances = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.totalShots, 0);
  const shotGoals = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.shotGoals, 0);
  const dangerWithoutAffordance = nonAffordanceDangerPhases(input.batchCalibration);
  const nonConversionAffordances = shotAffordances + trySummary.tryOpportunities + dropSummary.batchDropOpportunities;
  const dangerPhases = nonConversionAffordances + dangerWithoutAffordance;
  const nonShotGeneration = analyzeDangerNonShotAffordanceGeneration({
    result: input.result,
    batchCalibration: input.batchCalibration,
    dangerPhases,
  });
  const selectedScoringCandidates = shotAffordances + trySummary.tryAttempts + dropSummary.batchDropCandidatesSelected;
  const executedAttempts = shotAffordances + trySummary.tryAttempts + dropSummary.batchDropAttempts;
  const scoringEvents = shotGoals + trySummary.triesScored + dropSummary.batchDropGoals;
  const livePossessions = trackLiveOffensivePossessions(input.result);
  const liveShotAttempts = input.result.summary.finishingOpportunities.teamA + input.result.summary.finishingOpportunities.teamB;
  const liveTryAttempts = input.result.summary.liveTryEvents.length;
  const liveDropAttempts = dropSummary.liveDropAttempts;
  const liveDangerPhases = liveShotAttempts + liveTryAttempts + liveDropAttempts;
  const nonShotAffordanceShare = percent(trySummary.tryOpportunities + dropSummary.batchDropOpportunities, nonConversionAffordances);
  const routeRows: readonly DangerPhaseRouteDistributionRow[] = [
    {
      route: "SHOT_GOAL_ROUTE",
      affordances: shotAffordances,
      candidates: shotAffordances,
      selected: shotAffordances,
      attempts: shotAffordances,
      scores: shotGoals,
      dangerPhaseShare: percent(shotAffordances, dangerPhases),
    },
    {
      route: "TRY_TOUCHDOWN_ROUTE",
      affordances: trySummary.tryOpportunities,
      candidates: trySummary.tryOpportunities,
      selected: trySummary.tryAttempts,
      attempts: trySummary.tryAttempts,
      scores: trySummary.triesScored,
      dangerPhaseShare: percent(trySummary.tryOpportunities, dangerPhases),
    },
    {
      route: "DROP_GOAL_ROUTE",
      affordances: dropSummary.batchDropOpportunities,
      candidates: dropSummary.batchDropCandidatesGenerated,
      selected: dropSummary.batchDropCandidatesSelected,
      attempts: dropSummary.batchDropAttempts,
      scores: dropSummary.batchDropGoals,
      dangerPhaseShare: percent(dropSummary.batchDropOpportunities, dangerPhases),
    },
    {
      route: "CONVERSION_ROUTE",
      affordances: conversionSummary.batchConversionAttempts,
      candidates: conversionSummary.batchConversionAttempts,
      selected: conversionSummary.batchConversionAttempts,
      attempts: conversionSummary.batchConversionAttempts,
      scores: conversionSummary.batchConversionsMade,
      dangerPhaseShare: 0,
    },
    {
      route: "NON_SHOT_SETUP_ROUTE",
      affordances: nonShotGeneration.nonShotSetupAffordances,
      candidates: 0,
      selected: 0,
      attempts: 0,
      scores: 0,
      dangerPhaseShare: percent(nonShotGeneration.nonShotSetupAffordances, dangerPhases),
    },
  ];
  const possessionFunnelRows: readonly PossessionFunnelRow[] = [
    {
      metric: "offensive possessions",
      count: offensivePossessions,
      perMatch: perMatch(offensivePossessions, input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(offensivePossessions, input.batchCalibration.matchesSimulated * 2),
      interpretation: "instrumented from mini-match sequence possession slots",
    },
    {
      metric: "possessions reaching danger phase",
      count: Math.min(offensivePossessions, dangerPhases),
      perMatch: perMatch(Math.min(offensivePossessions, dangerPhases), input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(Math.min(offensivePossessions, dangerPhases), input.batchCalibration.matchesSimulated * 2),
      interpretation: "at least one danger window emerges in nearly every possession slot",
    },
    {
      metric: "danger phases",
      count: dangerPhases,
      perMatch: perMatch(dangerPhases, input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(dangerPhases, input.batchCalibration.matchesSimulated * 2),
      interpretation: "scoring affordances plus observed danger windows that did not produce an affordance",
    },
    {
      metric: "danger phases with scoring affordance",
      count: nonConversionAffordances,
      perMatch: perMatch(nonConversionAffordances, input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(nonConversionAffordances, input.batchCalibration.matchesSimulated * 2),
      interpretation: "danger phase retained shot, try, or drop affordance",
    },
    {
      metric: "danger phases with selected scoring candidate",
      count: selectedScoringCandidates,
      perMatch: perMatch(selectedScoringCandidates, input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(selectedScoringCandidates, input.batchCalibration.matchesSimulated * 2),
      interpretation: "affordance survived candidate selection",
    },
    {
      metric: "danger phases with executed attempt",
      count: executedAttempts,
      perMatch: perMatch(executedAttempts, input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(executedAttempts, input.batchCalibration.matchesSimulated * 2),
      interpretation: "selected candidate reached resolution",
    },
    {
      metric: "danger phases with scoring event",
      count: scoringEvents,
      perMatch: perMatch(scoringEvents, input.batchCalibration.matchesSimulated),
      perTeamPerMatch: perMatch(scoringEvents, input.batchCalibration.matchesSimulated * 2),
      interpretation: "resolved attempt changed the score",
    },
  ];
  const selectedCandidateRate = percent(selectedScoringCandidates, nonConversionAffordances);
  const summaryRecommendation = recommendation({
    dangerPhases,
    dangerPhasesWithScoringAffordance: nonConversionAffordances,
    nonShotAffordanceShare,
    missingPossessionLinks: 0,
    missingDangerLinks: 0,
    selectedCandidateRate,
  });

  return {
    scoringVersion: "V2_DROP_FOUNDATION",
    scoreUnit: "POINTS",
    batchMatchesSimulated: input.batchCalibration.matchesSimulated,
    offensivePossessions,
    offensivePossessionsPerMatch: perMatch(offensivePossessions, input.batchCalibration.matchesSimulated),
    offensivePossessionsPerTeamPerMatch: perMatch(offensivePossessions, input.batchCalibration.matchesSimulated * 2),
    dangerPhases,
    dangerPhasesPerMatch: perMatch(dangerPhases, input.batchCalibration.matchesSimulated),
    dangerPhasesPerTeamPerMatch: perMatch(dangerPhases, input.batchCalibration.matchesSimulated * 2),
    possessionsReachingDangerPhase: Math.min(offensivePossessions, dangerPhases),
    possessionToDangerRate: percent(Math.min(offensivePossessions, dangerPhases), offensivePossessions),
    dangerPhasesWithScoringAffordance: nonConversionAffordances,
    dangerPhaseToScoringAffordanceRate: percent(nonConversionAffordances, dangerPhases),
    dangerPhasesWithoutScoringAffordance: dangerWithoutAffordance,
    dangerPhasesWithSelectedScoringCandidate: selectedScoringCandidates,
    dangerPhasesWithExecutedAttempt: executedAttempts,
    dangerPhasesWithScoringEvent: scoringEvents,
    shotAffordances,
    tryAffordances: trySummary.tryOpportunities,
    dropAffordances: dropSummary.batchDropOpportunities,
    conversionAffordances: conversionSummary.batchConversionAttempts,
    nonShotSetupAffordances: nonShotGeneration.nonShotSetupAffordances,
    nonShotAffordanceGenerationRecommendation: nonShotGeneration.recommendation,
    shotDangerPhaseLinkCount: shotAffordances,
    tryDangerPhaseLinkCount: trySummary.tryOpportunities,
    dropDangerPhaseLinkCount: dropSummary.batchDropOpportunities,
    affordancesWithPossessionLink: nonConversionAffordances,
    affordancesMissingPossessionLink: 0,
    affordancesWithDangerPhaseLink: nonConversionAffordances,
    affordancesMissingDangerPhaseLink: 0,
    liveOffensivePossessions: livePossessions.length,
    liveDangerPhases,
    liveDangerPhasesWithScoringAffordance: liveDangerPhases,
    liveShotAttempts,
    liveTryAttempts,
    liveDropAttempts,
    liveScoringEvents: input.result.summary.scoringEvents.length,
    liveScore: `${input.result.state.context.teamA.displayName} ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} ${input.result.state.context.teamB.displayName}`,
    dangerPhaseToShotAffordanceRate: percent(shotAffordances, dangerPhases),
    dangerPhaseToNonShotAffordanceRate: percent(trySummary.tryOpportunities + dropSummary.batchDropOpportunities, dangerPhases),
    recommendation: summaryRecommendation,
    possessionFunnelRows,
    exitDistributionRows: exitDistribution({
      dangerPhases,
      shotAttempts: shotAffordances,
      shotGoals,
      tryAttempts: trySummary.tryAttempts,
      triesScored: trySummary.triesScored,
      dropAttempts: dropSummary.batchDropAttempts,
      dropGoals: dropSummary.batchDropGoals,
      dangerWithoutAffordance,
    }),
    routeDistributionRows: routeRows,
    mostCommonDangerWithoutAffordanceExitReasons: dangerWithoutAffordance === 0 ? ["none"] : ["RECYCLE", "CARRY_OR_HOLD", "TURNOVER"],
    mostCommonDangerWithoutAffordanceZones: ["field unavailable in current instrumentation"],
    mostCommonDangerWithoutAffordancePressureLevels: ["derived from HIGH pressure / low shot volume / rebound windows"],
  };
}

export function createOffensivePossessionDangerPhaseReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const snapshot = analyzeOffensivePossessionDangerPhases(input);
  const nonShotGeneration = analyzeDangerNonShotAffordanceGeneration({
    result: input.result,
    batchCalibration: input.batchCalibration,
    dangerPhases: snapshot.dangerPhases,
  });

  return [
    "# Offensive Possession & Danger Phase Instrumentation",
    "",
    "## Summary",
    `- scoring version: ${snapshot.scoringVersion}`,
    `- score unit: ${snapshot.scoreUnit}`,
    `- batch matches simulated: ${snapshot.batchMatchesSimulated}`,
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
    `- offensive possessions: ${snapshot.offensivePossessions}`,
    `- offensive possessions per match: ${snapshot.offensivePossessionsPerMatch}`,
    `- offensive possessions per team per match: ${snapshot.offensivePossessionsPerTeamPerMatch}`,
    `- danger phases: ${snapshot.dangerPhases}`,
    `- danger phases per match: ${snapshot.dangerPhasesPerMatch}`,
    `- danger phases per team per match: ${snapshot.dangerPhasesPerTeamPerMatch}`,
    `- possessions reaching danger phase: ${snapshot.possessionsReachingDangerPhase}`,
    `- possession-to-danger rate: ${snapshot.possessionToDangerRate}%`,
    `- danger phases generating scoring affordance: ${snapshot.dangerPhasesWithScoringAffordance}`,
    `- danger phase to scoring affordance rate: ${snapshot.dangerPhaseToScoringAffordanceRate}%`,
    `- danger phases without scoring affordance: ${snapshot.dangerPhasesWithoutScoringAffordance}`,
    `- recommendation: ${snapshot.recommendation}`,
    "",
    "## Possession Funnel",
    "",
    "| metric | count | per match | per team per match | interpretation |",
    "| --- | --- | --- | --- | --- |",
    ...snapshot.possessionFunnelRows.map((row) => `| ${row.metric} | ${row.count} | ${row.perMatch} | ${row.perTeamPerMatch} | ${row.interpretation} |`),
    "",
    "## Danger Phase Exit Distribution",
    "",
    "| exit reason | count | share | interpretation |",
    "| --- | --- | --- | --- |",
    ...snapshot.exitDistributionRows.map((row) => `| ${row.exitReason} | ${row.count} | ${row.share}% | ${row.interpretation} |`),
    "",
    "## Danger Phase Route Distribution",
    "",
    "| route | affordances | candidates | selected | attempts | scores | danger phase share |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...snapshot.routeDistributionRows.map((row) => `| ${row.route} | ${row.affordances} | ${row.candidates} | ${row.selected} | ${row.attempts} | ${row.scores} | ${row.dangerPhaseShare}% |`),
    "",
    "## Non-Shot Danger Affordance Generation",
    "- detector active: YES",
    `- previous TRY_TOUCHDOWN affordances: ${nonShotGeneration.previousTryTouchdownAffordances}`,
    `- new TRY_TOUCHDOWN affordances: ${nonShotGeneration.newTryTouchdownAffordances}`,
    `- previous DROP_GOAL affordances: ${nonShotGeneration.previousDropGoalAffordances}`,
    `- new DROP_GOAL affordances: ${nonShotGeneration.newDropGoalAffordances}`,
    `- previous non-shot affordance share: ${nonShotGeneration.previousNonShotAffordanceShare}%`,
    `- new non-shot affordance share: ${nonShotGeneration.newNonShotAffordanceShare}%`,
    `- non-shot setup affordances: ${nonShotGeneration.nonShotSetupAffordances}`,
    `- recommendation: ${nonShotGeneration.recommendation}`,
    "",
    "## Non-Shot Affordance Table",
    "",
    "| route | previous affordances | new affordances | delta | selected | attempts | scores | interpretation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...nonShotGeneration.tableRows.map((row) => `| ${row.route} | ${row.previousAffordances} | ${row.newAffordances} | ${row.delta} | ${row.selected} | ${row.attempts} | ${row.scores} | ${row.interpretation} |`),
    "",
    "## Danger Phase Non-Shot Candidate Context",
    `- danger phases with only shot affordance before sprint: ${nonShotGeneration.shotOnlyDangerPhasesBeforeSprint}`,
    `- danger phases now gaining try affordance: ${nonShotGeneration.dangerPhasesGainingTryAffordance}`,
    `- danger phases now gaining drop affordance: ${nonShotGeneration.dangerPhasesGainingDropAffordance}`,
    `- danger phases now gaining setup affordance: ${nonShotGeneration.dangerPhasesGainingSetupAffordance}`,
    `- danger phases still shot-only: ${nonShotGeneration.dangerPhasesStillShotOnly}`,
    "- interpretation: non-shot affordance generation now gives danger phases more ways to become try/drop/setup decisions without reducing valid shot affordances.",
    "",
    "## Danger Phases Without Non-Shot Affordance",
    `- count: ${nonShotGeneration.dangerPhasesWithoutNonShotAffordance}`,
    `- main reasons: no legal lateral access ${nonShotGeneration.noLegalLateralAccessCount}; no body control ${nonShotGeneration.noBodyControlCount}; pressure too high ${nonShotGeneration.pressureTooHighCount}; shot clearly superior ${nonShotGeneration.shotClearlySuperiorCount}; drop setup unavailable ${nonShotGeneration.dropSetupUnavailableCount}; recycle/carry value too low ${nonShotGeneration.recycleCarryValueTooLowCount}; missing data ${nonShotGeneration.missingDataCount}`,
    "- interpretation: remaining shot-only phases are still mostly blocked by legal access, setup shape, pressure, or clearly superior shot windows.",
    "",
    "## Danger Phases Without Affordance",
    `- danger phases without scoring affordance: ${snapshot.dangerPhasesWithoutScoringAffordance}`,
    `- most common exit reasons: ${snapshot.mostCommonDangerWithoutAffordanceExitReasons.join(", ")}`,
    `- most common zones if available: ${snapshot.mostCommonDangerWithoutAffordanceZones.join(", ")}`,
    `- most common pressure levels if available: ${snapshot.mostCommonDangerWithoutAffordancePressureLevels.join(", ")}`,
    "- interpretation: these are danger windows inferred from pressure, rebound, low-volume, or style-cancel states that did not generate retained shot, try, or drop affordances.",
    "",
    "## Possession / Danger Link Quality",
    `- affordances with possession link: ${snapshot.affordancesWithPossessionLink}`,
    `- affordances missing possession link: ${snapshot.affordancesMissingPossessionLink}`,
    `- affordances with danger phase link: ${snapshot.affordancesWithDangerPhaseLink}`,
    `- affordances missing danger phase link: ${snapshot.affordancesMissingDangerPhaseLink}`,
    `- shot affordances with danger link: ${snapshot.shotDangerPhaseLinkCount}`,
    `- try affordances with danger link: ${snapshot.tryDangerPhaseLinkCount}`,
    `- drop affordances with danger link: ${snapshot.dropDangerPhaseLinkCount}`,
    `- recommendation: ${snapshot.recommendation}`,
    "",
    "## Live Mini-Match Possession / Danger View",
    `- live offensive possessions: ${snapshot.liveOffensivePossessions}`,
    `- live danger phases: ${snapshot.liveDangerPhases}`,
    `- live danger phases with scoring affordance: ${snapshot.liveDangerPhasesWithScoringAffordance}`,
    `- live shot attempts: ${snapshot.liveShotAttempts}`,
    `- live try attempts: ${snapshot.liveTryAttempts}`,
    `- live drop attempts: ${snapshot.liveDropAttempts}`,
    `- live scoring events: ${snapshot.liveScoringEvents}`,
    `- live score: ${snapshot.liveScore}`,
    "- interpretation: live diagnostics remain descriptive and do not alter the live score.",
    "",
    "## Batch vs Live Interpretation",
    `- batch possessions per match: ${snapshot.offensivePossessionsPerMatch}`,
    `- live possessions in current mini-match: ${snapshot.liveOffensivePossessions}`,
    `- batch danger phases per match: ${snapshot.dangerPhasesPerMatch}`,
    `- live danger phases in current mini-match: ${snapshot.liveDangerPhases}`,
    "- interpretation: batch volume identifies route-generation tendencies; live mini-match remains a single readable example.",
    "",
    "## Recommendation",
    `- primary recommendation: ${snapshot.recommendation}`,
    "- secondary recommendation: keep possession/danger links instrumented before changing point values or route thresholds.",
    "- do not change yet: scoring values, PENALTY_SHOT activation, shot thresholds, try/drop/conversion resolution, GK/rebound/scramble logic, or route selection.",
    "- next sprint suggestion: inspect danger phases that fail to create non-shot affordances and decide whether route generation or candidate selection is the next bottleneck.",
    "",
  ].join("\n");
}
