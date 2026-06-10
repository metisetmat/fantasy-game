import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../actions";
import { analyzeDangerNonShotAffordanceGeneration, analyzeOffensivePossessionDangerPhases } from "../phases";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeConversionResolution } from "./conversionResolution";
import { summarizeNonShotResolutionRebalance } from "./nonShotResolutionRebalance";
import type {
  ScoringAffordanceFunnelRow,
  ScoringAffordanceVolumeRecommendation,
  ScoringAffordanceVolumeSnapshot,
} from "./scoringAffordanceTypes";

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function perMatch(value: number, matches: number): number {
  return matches === 0 ? 0 : Math.round((value / matches) * 100) / 100;
}

function recommendation(input: {
  readonly knownAffordancesPerMatch: number;
  readonly nonShotShare: number;
  readonly liveTryAttempts: number;
  readonly liveDropAttempts: number;
  readonly tryAffordances: number;
  readonly dropAffordances: number;
}): ScoringAffordanceVolumeRecommendation {
  if (input.knownAffordancesPerMatch < 6) {
    return "INCREASE_SCORING_AFFORDANCE_VOLUME";
  }

  if (input.nonShotShare < 25) {
    return "INCREASE_NON_SHOT_AFFORDANCES";
  }

  if ((input.tryAffordances > 0 || input.dropAffordances > 0) && input.liveTryAttempts + input.liveDropAttempts === 0) {
    return "DIAGNOSE_LIVE_VS_BATCH_GAP";
  }

  return "INSTRUMENT_DANGER_PHASES";
}

export function analyzeScoringAffordanceVolume(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): ScoringAffordanceVolumeSnapshot {
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
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const dropSummary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const possessionDanger = analyzeOffensivePossessionDangerPhases(input);
  const nonShotGeneration = analyzeDangerNonShotAffordanceGeneration({
    result: input.result,
    batchCalibration: input.batchCalibration,
    dangerPhases: possessionDanger.dangerPhases,
  });
  const shotAttempts = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.totalShots, 0);
  const shotGoals = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.shotGoals, 0);
  const totalKnownScoringAffordances = shotAttempts + trySummary.tryOpportunities + dropSummary.batchDropOpportunities;
  const totalKnownScoringAffordancesIncludingConversion = totalKnownScoringAffordances + conversionSummary.batchConversionAttempts;
  const nonShotAffordances = trySummary.tryOpportunities + dropSummary.batchDropOpportunities;
  const selectedCandidates = shotAttempts + trySummary.tryAttempts + dropSummary.batchDropCandidatesSelected + conversionSummary.batchConversionAttempts;
  const generatedCandidates = shotAttempts + trySummary.tryOpportunities + dropSummary.batchDropCandidatesGenerated + conversionSummary.batchConversionAttempts;
  const attempts = shotAttempts + trySummary.tryAttempts + dropSummary.batchDropAttempts + conversionSummary.batchConversionAttempts;
  const scores = shotGoals + trySummary.triesScored + dropSummary.batchDropGoals + conversionSummary.batchConversionsMade;
  const liveDropAttempts = dropSummary.liveDropAttempts;
  const liveTryAttempts = input.result.summary.liveTryEvents.length;
  const liveConversions = conversionSummary.liveConversionAttempts;
  const knownScoringAffordancesPerMatch = perMatch(totalKnownScoringAffordances, input.batchCalibration.matchesSimulated);
  const nonShotAffordanceShare = percent(nonShotAffordances, totalKnownScoringAffordances);
  const scoringAffordanceStarvationWarning =
    knownScoringAffordancesPerMatch < 6
      ? "STRONG_AFFORDANCE_STARVATION_WARNING"
      : knownScoringAffordancesPerMatch < 8
        ? "AFFORDANCE_STARVATION_WARNING"
        : "none";
  const nonShotAffordanceStarvationWarning = nonShotAffordanceShare < 25 ? "NON_SHOT_AFFORDANCE_STARVATION_WARNING" : "none";
  const liveAffordanceStarvationWarning =
    nonShotAffordances > 0 && liveTryAttempts + liveDropAttempts + liveConversions === 0 ? "LIVE_AFFORDANCE_STARVATION_WARNING" : "none";
  const funnelRows: readonly ScoringAffordanceFunnelRow[] = [
    {
      route: "SHOT_AFFORDANCE",
      affordances: shotAttempts,
      candidates: shotAttempts,
      selectedCandidates: shotAttempts,
      attempts: shotAttempts,
      scores: shotGoals,
      conversionRateNotes: `${percent(shotGoals, shotAttempts)}% shot goal rate; shot affordances currently equated to persisted shot candidates/attempts`,
    },
    {
      route: "TRY_TOUCHDOWN_AFFORDANCE",
      affordances: trySummary.tryOpportunities,
      candidates: trySummary.tryOpportunities,
      selectedCandidates: trySummary.tryAttempts,
      attempts: trySummary.tryAttempts,
      scores: trySummary.triesScored,
      conversionRateNotes: `${percent(trySummary.triesScored, trySummary.tryAttempts)}% try scoring rate`,
    },
    {
      route: "DROP_GOAL_AFFORDANCE",
      affordances: dropSummary.batchDropOpportunities,
      candidates: dropSummary.batchDropCandidatesGenerated,
      selectedCandidates: dropSummary.batchDropCandidatesSelected,
      attempts: dropSummary.batchDropAttempts,
      scores: dropSummary.batchDropGoals,
      conversionRateNotes: `${percent(dropSummary.batchDropGoals, dropSummary.batchDropAttempts)}% drop success rate`,
    },
    {
      route: "CONVERSION_AFFORDANCE",
      affordances: conversionSummary.batchConversionAttempts,
      candidates: conversionSummary.batchConversionAttempts,
      selectedCandidates: conversionSummary.batchConversionAttempts,
      attempts: conversionSummary.batchConversionAttempts,
      scores: conversionSummary.batchConversionsMade,
      conversionRateNotes: `${percent(conversionSummary.batchConversionsMade, conversionSummary.batchConversionAttempts)}% conversion success rate; dependent post-try affordance`,
    },
  ];

  return {
    scoringVersion: "V2_DROP_FOUNDATION",
    scoreUnit: "POINTS",
    batchMatchesSimulated: input.batchCalibration.matchesSimulated,
    offensivePossessions: possessionDanger.offensivePossessions,
    offensivePossessionsPerMatch: possessionDanger.offensivePossessionsPerMatch,
    offensivePossessionsPerTeamPerMatch: possessionDanger.offensivePossessionsPerTeamPerMatch,
    dangerPhases: possessionDanger.dangerPhases,
    dangerPhasesPerMatch: possessionDanger.dangerPhasesPerMatch,
    dangerPhasesPerTeamPerMatch: possessionDanger.dangerPhasesPerTeamPerMatch,
    dangerPhaseToScoringAffordanceRate: possessionDanger.dangerPhaseToScoringAffordanceRate,
    possessionLinkCoverage: percent(possessionDanger.affordancesWithPossessionLink, possessionDanger.affordancesWithPossessionLink + possessionDanger.affordancesMissingPossessionLink),
    dangerPhaseLinkCoverage: percent(possessionDanger.affordancesWithDangerPhaseLink, possessionDanger.affordancesWithDangerPhaseLink + possessionDanger.affordancesMissingDangerPhaseLink),
    possessionDangerRecommendation: possessionDanger.recommendation,
    totalKnownScoringAffordances,
    totalKnownScoringAffordancesIncludingConversion,
    knownScoringAffordancesPerMatch,
    knownScoringAffordancesPerTeamPerMatch: Math.round((knownScoringAffordancesPerMatch / 2) * 100) / 100,
    knownScoringAffordancesIncludingConversionPerMatch: perMatch(totalKnownScoringAffordancesIncludingConversion, input.batchCalibration.matchesSimulated),
    shotAffordances: shotAttempts,
    shotCandidates: shotAttempts,
    shotSelected: shotAttempts,
    shotAttempts,
    shotGoals,
    tryAffordances: trySummary.tryOpportunities,
    tryCandidates: trySummary.tryOpportunities,
    trySelected: trySummary.tryAttempts,
    tryAttempts: trySummary.tryAttempts,
    triesScored: trySummary.triesScored,
    dropAffordances: dropSummary.batchDropOpportunities,
    dropCandidates: dropSummary.batchDropCandidatesGenerated,
    dropSelected: dropSummary.batchDropCandidatesSelected,
    dropAttempts: dropSummary.batchDropAttempts,
    dropGoals: dropSummary.batchDropGoals,
    conversionAffordances: conversionSummary.batchConversionAttempts,
    conversionCandidates: conversionSummary.batchConversionAttempts,
    conversionAttempts: conversionSummary.batchConversionAttempts,
    conversionsMade: conversionSummary.batchConversionsMade,
    candidateSelectionCoverage: percent(selectedCandidates, generatedCandidates),
    affordanceToCandidateConversionRate: percent(generatedCandidates, totalKnownScoringAffordancesIncludingConversion),
    candidateToAttemptRate: percent(attempts, generatedCandidates),
    attemptToScoreRate: percent(scores, attempts),
    nonShotAffordanceShare,
    previousNonShotAffordanceShare: nonShotGeneration.previousNonShotAffordanceShare,
    nonShotSetupAffordances: nonShotGeneration.nonShotSetupAffordances,
    shotOnlyDangerPhases: nonShotGeneration.dangerPhasesStillShotOnly,
    nonShotAffordanceGenerationRecommendation: nonShotGeneration.recommendation,
    liveShotAttempts: input.result.summary.finishingOpportunities.teamA + input.result.summary.finishingOpportunities.teamB,
    liveTryAttempts,
    liveDropAttempts,
    liveConversions,
    liveActiveScoringEvents: input.result.summary.scoringEvents.length,
    scoringAffordanceStarvationWarning,
    dangerPhaseStarvationWarning: "DANGER_PHASE_INSTRUMENTATION_WARNING",
    nonShotAffordanceStarvationWarning,
    liveAffordanceStarvationWarning,
    recommendation: recommendation({
      knownAffordancesPerMatch: knownScoringAffordancesPerMatch,
      nonShotShare: nonShotAffordanceShare,
      liveTryAttempts,
      liveDropAttempts,
      tryAffordances: trySummary.tryOpportunities,
      dropAffordances: dropSummary.batchDropOpportunities,
    }),
    funnelRows,
  };
}

function value(value: number | string): string {
  return typeof value === "number" ? `${value}` : value;
}

export function createScoringAffordanceVolumeReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const snapshot = analyzeScoringAffordanceVolume(input);
  const nonShotResolution = summarizeNonShotResolutionRebalance(input);

  return [
    "# Scoring Affordance Volume Diagnostic",
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
    `- known total scoring affordances: ${snapshot.totalKnownScoringAffordances}`,
    `- known scoring affordances per match: ${snapshot.knownScoringAffordancesPerMatch}`,
    `- known scoring affordances per team per match: ${snapshot.knownScoringAffordancesPerTeamPerMatch}`,
    `- shot affordances: ${snapshot.shotAffordances}`,
    `- try affordances: ${snapshot.tryAffordances}`,
    `- drop affordances: ${snapshot.dropAffordances}`,
    `- conversion affordances: ${snapshot.conversionAffordances}`,
    `- recommendation: ${snapshot.recommendation}`,
    "",
    "## Terminology Contract",
    "- offensive possession: a possession sequence or phase where one team controls the ball and can progress toward scoring.",
    "- danger phase: a possession phase that reaches a tactically dangerous zone, pressure state, or field position where scoring becomes plausible.",
    "- scoring affordance: a situation where a scoring route is possible or nearly possible; it may or may not become a candidate, selection, attempt, or score.",
    "- scoring candidate: a concrete candidate action available to the decision engine, such as SHOT, TRY_TOUCHDOWN_ATTEMPT, or DROP_GOAL_ATTEMPT.",
    "- selected candidate: the candidate chosen by the decision engine.",
    "- executed attempt: a selected scoring action that is actually resolved.",
    "- scoring event: an active event that changes the score: SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, or DROP_GOAL.",
    "",
    "## Known Scoring Affordance Volume",
    `- shot candidates / attempts: ${snapshot.shotAttempts}`,
    `- try opportunities: ${snapshot.tryAffordances}`,
    `- drop opportunities: ${snapshot.dropAffordances}`,
    `- conversion opportunities: ${snapshot.conversionAffordances}`,
    `- known scoring affordances excluding conversion: ${snapshot.totalKnownScoringAffordances}`,
    `- known scoring affordances including conversion: ${snapshot.totalKnownScoringAffordancesIncludingConversion}`,
    `- known scoring affordances per match excluding conversion: ${snapshot.knownScoringAffordancesPerMatch}`,
    `- known scoring affordances per team per match excluding conversion: ${snapshot.knownScoringAffordancesPerTeamPerMatch}`,
    `- interpretation: ${snapshot.knownScoringAffordancesPerMatch < 8 ? "known scoring affordance volume is below the initial monitor range, so shot dominance should not be read as too many shots alone." : "known affordance volume is in monitor range; route competition remains the sharper question."}`,
    "",
    "## Affordance Funnel",
    "",
    "| route | affordances | candidates | selected candidates | attempts | scores | conversion rate notes |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...snapshot.funnelRows.map(
      (row) =>
        `| ${row.route} | ${value(row.affordances)} | ${value(row.candidates)} | ${value(row.selectedCandidates)} | ${value(row.attempts)} | ${value(row.scores)} | ${row.conversionRateNotes} |`,
    ),
    "",
    "## Offensive Possession / Danger Phase Volume",
    `- offensive possessions: ${snapshot.offensivePossessions}`,
    `- offensive possessions per match: ${snapshot.offensivePossessionsPerMatch}`,
    `- offensive possessions per team per match: ${snapshot.offensivePossessionsPerTeamPerMatch}`,
    `- danger phases: ${snapshot.dangerPhases}`,
    `- danger phases per match: ${snapshot.dangerPhasesPerMatch}`,
    `- danger phases per team per match: ${snapshot.dangerPhasesPerTeamPerMatch}`,
    `- danger phase to scoring affordance rate: ${snapshot.dangerPhaseToScoringAffordanceRate}%`,
    "- interpretation: offensive possession and danger phase volume are now instrumented as diagnostic counters; they do not alter scoring or route selection.",
    "",
    "## Possession/Danger Instrumentation Link",
    "- canonical report: reports/offensive-possession-danger-phase.md",
    `- possession link coverage: ${snapshot.possessionLinkCoverage}%`,
    `- danger phase link coverage: ${snapshot.dangerPhaseLinkCoverage}%`,
    `- recommendation: ${snapshot.possessionDangerRecommendation}`,
    "- fields still unavailable: exact per-possession low-level tactical zones for danger phases without affordance.",
    "",
    "## Live vs Batch Affordance Gap",
    `- live scoring affordances: ${snapshot.liveShotAttempts + snapshot.liveTryAttempts + snapshot.liveDropAttempts + snapshot.liveConversions}`,
    `- live shot attempts: ${snapshot.liveShotAttempts}`,
    `- live try attempts: ${snapshot.liveTryAttempts}`,
    `- live drop attempts: ${snapshot.liveDropAttempts}`,
    `- live conversions: ${snapshot.liveConversions}`,
    `- live active scoring events: ${snapshot.liveActiveScoringEvents}`,
    `- batch scoring affordances: ${snapshot.totalKnownScoringAffordances}`,
    `- batch/live gap: ${snapshot.totalKnownScoringAffordances} batch known affordances versus ${snapshot.liveShotAttempts + snapshot.liveTryAttempts + snapshot.liveDropAttempts + snapshot.liveConversions} current mini-match affordances`,
    "- interpretation: batch diagnostics and current mini-match live scoring remain separate; the live sample is not broad enough to judge route balance alone.",
    "",
    "## Non-Shot Affordance Volume",
    `- try + drop affordances: ${snapshot.tryAffordances + snapshot.dropAffordances}`,
    `- try + drop affordance share: ${snapshot.nonShotAffordanceShare}%`,
    `- try + drop attempts: ${snapshot.tryAttempts + snapshot.dropAttempts}`,
    `- try + drop successful scores: ${snapshot.triesScored + snapshot.dropGoals}`,
    "- interpretation: non-shot affordances are active but under 25% of known scoring affordances, so non-shot route volume is a stronger concern than raw shot count.",
    "",
    "## Non-Shot Affordance Generation Snapshot",
    `- previous non-shot affordance share: ${snapshot.previousNonShotAffordanceShare}%`,
    `- new non-shot affordance share: ${snapshot.nonShotAffordanceShare}%`,
    `- try affordances: ${snapshot.tryAffordances}`,
    `- drop affordances: ${snapshot.dropAffordances}`,
    `- non-shot setup affordances: ${snapshot.nonShotSetupAffordances}`,
    `- shot-only danger phases: ${snapshot.shotOnlyDangerPhases}`,
    `- recommendation: ${snapshot.nonShotAffordanceGenerationRecommendation}`,
    "- note: NON_SHOT_SETUP_AFFORDANCE is reported separately and is not included in scoring affordance totals.",
    "",
    "## Non-Shot Resolution Rebalance Snapshot",
    `- non-shot affordance share: ${snapshot.nonShotAffordanceShare}%`,
    `- try attempts / tries / success rate: ${nonShotResolution.tryAttempts}/${nonShotResolution.triesScored}/${nonShotResolution.tryScoringRate}%`,
    `- conversion attempts / made / success rate: ${nonShotResolution.conversionAttempts}/${nonShotResolution.conversionsMade}/${nonShotResolution.conversionSuccessRate}%`,
    `- drop attempts / goals / success rate: ${nonShotResolution.dropAttempts}/${nonShotResolution.dropGoals}/${nonShotResolution.dropSuccessRate}%`,
    `- recommendation: ${nonShotResolution.recommendation}`,
    "- note: NON_SHOT_SETUP remains diagnostic only and is not counted as a scoring affordance.",
    "",
    "## Affordance Starvation Warnings",
    `- total affordance starvation: ${snapshot.scoringAffordanceStarvationWarning}`,
    `- non-shot affordance starvation: ${snapshot.nonShotAffordanceStarvationWarning}`,
    `- danger phase instrumentation warning: ${snapshot.dangerPhaseStarvationWarning}`,
    `- live/batch affordance gap warning: ${snapshot.liveAffordanceStarvationWarning}`,
    `- recommendation: ${snapshot.recommendation}`,
    "",
    "## Recommendation",
    `- primary recommendation: ${snapshot.recommendation}`,
    "- secondary recommendation: INSTRUMENT_DANGER_PHASES",
    "- do not change yet: scoring values, shot thresholds, candidate selection, generation frequency, GK logic, rebound logic, try/drop resolution, or PENALTY_SHOT activation.",
    "- next sprint suggestion: instrument offensive possessions and danger phases, then compare how often each route becomes an affordance, candidate, selected candidate, executed attempt, and scoring event.",
    "",
  ].join("\n");
}
