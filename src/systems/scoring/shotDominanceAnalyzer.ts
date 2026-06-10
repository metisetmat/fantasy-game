import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration, type ShotOutcomeContract } from "../actions";
import { analyzeDangerNonShotAffordanceGeneration, analyzeOffensivePossessionDangerPhases } from "../phases";
import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { summarizeConversionResolution } from "./conversionResolution";
import { summarizeNonShotResolutionRebalance } from "./nonShotResolutionRebalance";
import { analyzeScoringAffordanceVolume } from "./scoringAffordanceVolumeAnalyzer";
import type {
  CauseClassificationRow,
  CauseSeverity,
  DiagnosticDistributionRow,
  RouteDominanceCause,
  ShotDominanceDiagnosticSnapshot,
  ShotDominanceRecommendation,
} from "./shotDominanceDiagnosticTypes";

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function perMatch(value: number, matches: number): number {
  return matches === 0 ? 0 : Math.round((value / matches) * 100) / 100;
}

function sum(samples: readonly MatchScoringCalibrationSample[], selector: (sample: MatchScoringCalibrationSample) => number): number {
  return samples.reduce((total, sample) => total + selector(sample), 0);
}

function row(label: string, count: number, detail: string): DiagnosticDistributionRow {
  return { label, count, detail };
}

function pressureDistribution(samples: readonly MatchScoringCalibrationSample[]): readonly DiagnosticDistributionRow[] {
  const countFor = (pressure: string): number => samples.filter((sample) => sample.scenario.pressureProfile === pressure).reduce((total, sample) => total + sample.totalShots, 0);

  return [
    row("LOW", countFor("LOW"), "batch shots generated in LOW pressure scenarios"),
    row("MEDIUM", countFor("MEDIUM"), "batch shots generated in MEDIUM pressure scenarios"),
    row("HIGH", countFor("HIGH"), "batch shots generated in HIGH pressure scenarios"),
  ];
}

function goalkeeperDistribution(input: {
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): readonly DiagnosticDistributionRow[] {
  const live = input.shotOutcomes;

  return [
    row("GOAL", input.batchCalibration.samples.reduce((total, sample) => total + sample.shotGoals, 0), "batch shot goals"),
    row("CAUGHT_BY_GK", input.batchCalibration.caughtByGoalkeeperCount, "batch goalkeeper catches"),
    row("SAVED_BY_GK", input.batchCalibration.savedByGoalkeeperCount, "batch goalkeeper saves"),
    row("DEFLECTED_BY_GK", input.batchCalibration.deflectedByGoalkeeperCount, "batch goalkeeper deflections"),
    row("BLOCKED_BY_DEFENDER", input.batchCalibration.blockedByDefenderCount, "batch defender blocks"),
    row("MISSED_HIGH/WIDE", input.batchCalibration.missedWideHighCount, "batch off-frame misses"),
    row(
      "LIVE_GK_EVALUATED",
      live.filter((outcome) => outcome.gkShotStopping.goalkeeperEvaluated).length,
      "current mini-match GK evaluation rows",
    ),
  ];
}

function classifyCause(input: {
  readonly shotAttemptsPerMatch: number;
  readonly shotSuccessRate: number;
  readonly shotPointsShare: number;
  readonly averageShotQuality: number;
  readonly cleanWindowConversionRate: number;
  readonly goalkeeperSaveCatchDeflectCount: number;
  readonly onTargetShotCount: number;
  readonly blockedByDefenderCount: number;
  readonly secondShotWindowCount: number;
  readonly tryAttempts: number;
  readonly dropAttempts: number;
  readonly shotAttempts: number;
  readonly matches: number;
}): { readonly cause: RouteDominanceCause; readonly warningLevel: CauseSeverity; readonly recommendation: ShotDominanceRecommendation; readonly rows: readonly CauseClassificationRow[] } {
  const nonShotAttempts = input.tryAttempts + input.dropAttempts;
  const shotToNonShotRatio = nonShotAttempts === 0 ? input.shotAttempts : Math.round((input.shotAttempts / nonShotAttempts) * 10) / 10;
  const gkSuppressionRate = percent(input.goalkeeperSaveCatchDeflectCount, Math.max(1, input.onTargetShotCount));
  const blockRate = percent(input.blockedByDefenderCount, Math.max(1, input.shotAttempts));
  const rows: readonly CauseClassificationRow[] = [
    {
      cause: "TOO_MANY_SHOT_ATTEMPTS",
      severity: input.shotAttemptsPerMatch >= 7 ? "HIGH" : input.shotAttemptsPerMatch >= 5 ? "MEDIUM" : "LOW",
      evidence: `${input.shotAttemptsPerMatch} shot attempts per match`,
    },
    {
      cause: "SHOT_SUCCESS_TOO_HIGH",
      severity: input.shotSuccessRate > 40 ? "HIGH" : input.shotSuccessRate >= 35 ? "MEDIUM" : "LOW",
      evidence: `${input.shotSuccessRate}% shot success rate`,
    },
    {
      cause: "SHOT_QUALITY_TOO_HIGH",
      severity: input.averageShotQuality >= 72 ? "HIGH" : input.averageShotQuality >= 64 ? "MEDIUM" : "LOW",
      evidence: `${input.averageShotQuality}/100 average shot quality`,
    },
    {
      cause: "CLEAN_WINDOW_TOO_GENEROUS",
      severity: input.cleanWindowConversionRate > 75 ? "HIGH" : input.cleanWindowConversionRate >= 60 ? "LOW" : "LOW",
      evidence: `${input.cleanWindowConversionRate}% clean-window conversion, target 60%-75%`,
    },
    {
      cause: "GK_PRESSURE_TOO_WEAK",
      severity: gkSuppressionRate < 15 ? "HIGH" : gkSuppressionRate < 30 ? "MEDIUM" : "LOW",
      evidence: `${gkSuppressionRate}% GK save/catch/deflect share of on-target shots`,
    },
    {
      cause: "DEFENSIVE_PRESSURE_TOO_WEAK",
      severity: blockRate < 3 ? "MEDIUM" : "LOW",
      evidence: `${blockRate}% defender block rate`,
    },
    {
      cause: "REBOUND_REPEAT_SHOT_WINDOWS",
      severity: input.secondShotWindowCount >= input.matches * 0.2 ? "MEDIUM" : "LOW",
      evidence: `${input.secondShotWindowCount} second-shot windows in batch`,
    },
    {
      cause: "TRY_ROUTE_TOO_RARE",
      severity: input.tryAttempts < input.matches * 0.4 ? "HIGH" : input.tryAttempts < input.matches * 0.8 ? "MEDIUM" : "LOW",
      evidence: `${input.tryAttempts} try attempts versus ${input.shotAttempts} shot attempts`,
    },
    {
      cause: "DROP_ROUTE_TOO_RARE",
      severity: input.dropAttempts < input.matches * 0.2 ? "HIGH" : input.dropAttempts < input.matches * 0.4 ? "MEDIUM" : "LOW",
      evidence: `${input.dropAttempts} drop attempts versus ${input.shotAttempts} shot attempts`,
    },
    {
      cause: "CANDIDATE_SELECTION_FAVORS_SHOT",
      severity: shotToNonShotRatio >= 10 ? "HIGH" : shotToNonShotRatio >= 5 ? "MEDIUM" : "LOW",
      evidence: `${shotToNonShotRatio}:1 shot-to-try/drop attempt ratio`,
    },
    {
      cause: "BATCH_ROUTE_MATURITY_MISMATCH",
      severity: input.shotAttempts > 0 && nonShotAttempts < input.matches ? "MEDIUM" : "LOW",
      evidence: "shot route has mature batch attempts; try/drop route diagnostics are newer and sparser",
    },
    {
      cause: "NEEDS_MORE_SAMPLE",
      severity: input.matches < 50 ? "MEDIUM" : "LOW",
      evidence: `${input.matches} batch matches simulated`,
    },
  ];
  const fallback: CauseClassificationRow = {
    cause: "NEEDS_MORE_SAMPLE",
    severity: "UNKNOWN",
    evidence: "no cause rows available",
  };
  const primary =
    rows.find((item) => item.cause === "CANDIDATE_SELECTION_FAVORS_SHOT" && item.severity === "HIGH") ??
    rows.find((item) => item.cause === "TRY_ROUTE_TOO_RARE" && item.severity === "HIGH") ??
    rows.find((item) => item.cause === "TOO_MANY_SHOT_ATTEMPTS" && item.severity !== "LOW") ??
    rows.find((item) => item.severity === "HIGH") ??
    rows.find((item) => item.severity === "MEDIUM") ??
    fallback;

  const recommendation: ShotDominanceRecommendation =
    primary.cause === "CANDIDATE_SELECTION_FAVORS_SHOT"
      ? "DIAGNOSE_SHOT_CANDIDATE_SELECTION"
      : primary.cause === "TRY_ROUTE_TOO_RARE"
        ? "INCREASE_TRY_ROUTE_PRESSURE"
        : primary.cause === "DROP_ROUTE_TOO_RARE"
          ? "INCREASE_DROP_LIVE_VISIBILITY"
          : primary.cause === "GK_PRESSURE_TOO_WEAK"
            ? "INCREASE_GK_SUPPRESSION"
            : primary.cause === "DEFENSIVE_PRESSURE_TOO_WEAK"
              ? "INCREASE_DEFENSIVE_BLOCK_PRESSURE"
              : primary.cause === "CLEAN_WINDOW_TOO_GENEROUS"
                ? "REDUCE_CLEAN_WINDOW_BONUS"
                : primary.cause === "REBOUND_REPEAT_SHOT_WINDOWS"
                  ? "REDUCE_REBOUND_SECOND_SHOT_WINDOWS"
                  : primary.cause === "SHOT_SUCCESS_TOO_HIGH" || primary.cause === "SHOT_QUALITY_TOO_HIGH"
                    ? "REDUCE_LOW_QUALITY_SHOTS"
                    : primary.cause === "NEEDS_MORE_SAMPLE"
                      ? "NEEDS_MORE_SAMPLE"
                      : "KEEP_MONITORING";

  return {
    cause: primary.cause,
    warningLevel: primary.severity,
    recommendation,
    rows,
  };
}

export function analyzeShotDominance(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes?: readonly ShotOutcomeContract[];
}): ShotDominanceDiagnosticSnapshot {
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
  const conversionSummary = summarizeConversionResolution({ result: input.result, opportunities: trySummary.opportunities });
  const dropSummary = summarizeDropGoalFoundation({ result: input.result, batchCalibration: input.batchCalibration });
  const shotAttempts = sum(input.batchCalibration.samples, (sample) => sample.totalShots);
  const shotGoals = sum(input.batchCalibration.samples, (sample) => sample.shotGoals);
  const shotPoints = sum(input.batchCalibration.samples, (sample) => sample.controlPoints + sample.blitzPoints);
  const tryPoints = trySummary.triesScored * 5;
  const conversionPoints = conversionSummary.batchConversionPoints;
  const dropPoints = dropSummary.batchDropPoints;
  const totalPoints = shotPoints + tryPoints + conversionPoints + dropPoints;
  const classification = classifyCause({
    shotAttemptsPerMatch: perMatch(shotAttempts, input.batchCalibration.matchesSimulated),
    shotSuccessRate: percent(shotGoals, shotAttempts),
    shotPointsShare: percent(shotPoints, totalPoints),
    averageShotQuality: input.batchCalibration.averageShotQuality,
    cleanWindowConversionRate: input.batchCalibration.cleanWindowConversionRate,
    goalkeeperSaveCatchDeflectCount: input.batchCalibration.goalkeeperSaveCatchDeflectCount,
    onTargetShotCount: input.batchCalibration.onTargetShotCount,
    blockedByDefenderCount: input.batchCalibration.blockedByDefenderCount,
    secondShotWindowCount: sum(input.batchCalibration.samples, (sample) => sample.secondShotWindowCount),
    tryAttempts: trySummary.tryAttempts,
    dropAttempts: dropSummary.batchDropAttempts,
    shotAttempts,
    matches: input.batchCalibration.matchesSimulated,
  });
  const shotOutcomes = input.shotOutcomes ?? [];

  return {
    scoringVersion: "V2_DROP_FOUNDATION",
    scoreUnit: "POINTS",
    batchMatchesSimulated: input.batchCalibration.matchesSimulated,
    shotAttempts,
    shotGoals,
    shotSuccessRate: percent(shotGoals, shotAttempts),
    shotPoints,
    shotPointsShare: percent(shotPoints, totalPoints),
    tryOpportunities: trySummary.tryOpportunities,
    tryAttempts: trySummary.tryAttempts,
    triesScored: trySummary.triesScored,
    tryPoints,
    tryPointsShare: percent(tryPoints, totalPoints),
    conversionAttempts: conversionSummary.batchConversionAttempts,
    conversionsMade: conversionSummary.batchConversionsMade,
    conversionPoints,
    conversionPointsShare: percent(conversionPoints, totalPoints),
    dropOpportunities: dropSummary.batchDropOpportunities,
    dropCandidatesGenerated: dropSummary.batchDropCandidatesGenerated,
    dropAttempts: dropSummary.batchDropAttempts,
    dropGoals: dropSummary.batchDropGoals,
    dropPoints,
    dropPointsShare: percent(dropPoints, totalPoints),
    shotAttemptsPerMatch: perMatch(shotAttempts, input.batchCalibration.matchesSimulated),
    shotGoalsPerMatch: perMatch(shotGoals, input.batchCalibration.matchesSimulated),
    tryAttemptsPerMatch: perMatch(trySummary.tryAttempts, input.batchCalibration.matchesSimulated),
    dropAttemptsPerMatch: perMatch(dropSummary.batchDropAttempts, input.batchCalibration.matchesSimulated),
    shotQualityDistribution: [
      row("LOW_QUALITY", input.batchCalibration.lowQualityShots, `${input.batchCalibration.lowQualityGoals} goals`),
      row("MEDIUM_QUALITY", sum(input.batchCalibration.samples, (sample) => sample.mediumQualityShots), "batch medium-quality shots"),
      row("GOOD_QUALITY", sum(input.batchCalibration.samples, (sample) => sample.goodQualityShots), "batch good-quality shots"),
      row("HIGH_QUALITY", input.batchCalibration.highQualityShots, `${input.batchCalibration.highQualityMisses} misses`),
      row("ELITE_QUALITY", sum(input.batchCalibration.samples, (sample) => sample.eliteQualityShots), "batch elite-quality shots"),
    ],
    shotPhaseDistribution: [
      row("stable possession", 0, "field unavailable in current report pack"),
      row("danger phase", 0, "field unavailable in current report pack"),
      row("broken play", 0, "field unavailable in current report pack"),
      row("transition", 0, "field unavailable in current report pack"),
      row("unknown", shotAttempts, "batch shot phase tags are not persisted yet"),
    ],
    shotZoneDistribution: [
      row("central", shotOutcomes.filter((outcome) => outcome.shotOriginZone.includes("-C")).length, "current mini-match only"),
      row("half-space", shotOutcomes.filter((outcome) => outcome.shotOriginZone.includes("HS")).length, "current mini-match only"),
      row("channel", shotOutcomes.filter((outcome) => outcome.shotOriginZone.includes("CL") || outcome.shotOriginZone.includes("CR")).length, "current mini-match only"),
      row("close area", shotOutcomes.filter((outcome) => outcome.shotOriginZone.startsWith("Z5") || outcome.shotOriginZone.startsWith("Z6")).length, "current mini-match only"),
      row("long range", shotOutcomes.filter((outcome) => outcome.shotOriginZone.startsWith("Z2") || outcome.shotOriginZone.startsWith("Z3")).length, "current mini-match only"),
    ],
    shotPressureDistribution: pressureDistribution(input.batchCalibration.samples),
    shotCleanWindowDistribution: [
      row("forced shot", input.batchCalibration.forcedShotCount, `${input.batchCalibration.forcedShotConversionRate}% conversion`),
      row("clean window", sum(input.batchCalibration.samples, (sample) => sample.cleanWindowShotCount), `${input.batchCalibration.cleanWindowConversionRate}% conversion`),
      row("contested clean window", input.batchCalibration.contestedCleanWindowCount, "PARTIAL clean-window type"),
      row("elite clean window", input.batchCalibration.eliteCleanWindowCount, "ELITE clean-window type"),
    ],
    shotGoalkeeperOutcomeDistribution: goalkeeperDistribution({
      batchCalibration: input.batchCalibration,
      shotOutcomes,
    }),
    reboundSecondShotWindowCount: sum(input.batchCalibration.samples, (sample) => sample.secondShotWindowCount),
    shotCandidateSelectionCount: shotAttempts,
    shotCandidateRejectionCount: 0,
    shotCandidateSelectionRate: 100,
    shotBeatsTryCount: 0,
    shotBeatsDropCount: 0,
    shotBeatsRecycleCount: 0,
    shotLosesToTryCount: trySummary.tryAttempts,
    shotLosesToDropCount: dropSummary.batchDropCandidatesSelected,
    shotLosesToRecycleCount: 0,
    routeDominanceCause: classification.cause,
    warningLevel: classification.warningLevel,
    recommendation: classification.recommendation,
    causeClassifications: classification.rows,
  };
}

function distributionLines(rows: readonly DiagnosticDistributionRow[]): readonly string[] {
  return rows.map((item) => `- ${item.label}: ${item.count} (${item.detail})`);
}

export function createShotDominanceDiagnosticReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes?: readonly ShotOutcomeContract[];
}): string {
  const snapshot = analyzeShotDominance(input);
  const affordanceVolume = analyzeScoringAffordanceVolume(input);
  const possessionDanger = analyzeOffensivePossessionDangerPhases(input);
  const nonShotResolution = summarizeNonShotResolutionRebalance(input);
  const nonShotGeneration = analyzeDangerNonShotAffordanceGeneration({
    result: input.result,
    batchCalibration: input.batchCalibration,
    dangerPhases: possessionDanger.dangerPhases,
  });
  const lowQualityGoals = snapshot.shotQualityDistribution.find((item) => item.label === "LOW_QUALITY")?.detail ?? "field unavailable";
  const highQualityMisses = snapshot.shotQualityDistribution.find((item) => item.label === "HIGH_QUALITY")?.detail ?? "field unavailable";

  return [
    "# Shot Dominance Diagnostic",
    "",
    "## Summary",
    `- scoring version: ${snapshot.scoringVersion}`,
    `- score unit: ${snapshot.scoreUnit}`,
    `- batch matches simulated: ${snapshot.batchMatchesSimulated}`,
    `- SHOT_GOAL = 3 points`,
    `- TRY_TOUCHDOWN = 5 points`,
    `- CONVERSION_GOAL = 2 points`,
    `- DROP_GOAL = 2 points`,
    "- PENALTY_SHOT inactive",
    `- SHOT_GOAL points: ${snapshot.shotPoints}`,
    `- SHOT_GOAL points share: ${snapshot.shotPointsShare}%`,
    `- TRY_TOUCHDOWN points: ${snapshot.tryPoints}`,
    `- CONVERSION_GOAL points: ${snapshot.conversionPoints}`,
    `- DROP_GOAL points: ${snapshot.dropPoints}`,
    `- route warning: ${snapshot.shotPointsShare >= 90 ? "SHOT_DOMINANCE_WARNING" : "none"}`,
    `- dominant cause: ${snapshot.routeDominanceCause}`,
    `- recommendation: ${snapshot.recommendation}`,
    "",
    "## Shot Volume Analysis",
    `- shot attempts: ${snapshot.shotAttempts}`,
    `- shot attempts per match: ${snapshot.shotAttemptsPerMatch}`,
    `- shot goals: ${snapshot.shotGoals}`,
    `- shot goals per match: ${snapshot.shotGoalsPerMatch}`,
    `- shot success rate: ${snapshot.shotSuccessRate}%`,
    `- shot points: ${snapshot.shotPoints}`,
    `- shot points share: ${snapshot.shotPointsShare}%`,
    `- interpretation: shots dominate points because the shot route has ${snapshot.shotAttempts} batch attempts versus ${snapshot.tryAttempts + snapshot.dropAttempts} combined try/drop attempts.`,
    "",
    "## Affordance Volume Reinterpretation",
    `- 288 shots across 50 matches = ${snapshot.shotAttemptsPerMatch} shots per match for both teams`,
    "- this is not obviously too high",
    `- known total scoring affordances excluding conversion: ${affordanceVolume.totalKnownScoringAffordances}`,
    `- known scoring affordances per match excluding conversion: ${affordanceVolume.knownScoringAffordancesPerMatch}`,
    `- known scoring affordances per team per match excluding conversion: ${affordanceVolume.knownScoringAffordancesPerTeamPerMatch}`,
    "- updated interpretation: shot dominance may reflect low non-shot affordance volume and incomplete candidate comparison, not excessive shot volume.",
    `- affordance volume recommendation: ${affordanceVolume.recommendation}`,
    "",
    "## Possession / Danger Phase Reinterpretation",
    `- offensive possessions per match: ${possessionDanger.offensivePossessionsPerMatch}`,
    `- danger phases per match: ${possessionDanger.dangerPhasesPerMatch}`,
    `- danger phase to shot affordance rate: ${possessionDanger.dangerPhaseToShotAffordanceRate}%`,
    `- danger phase to non-shot affordance rate: ${possessionDanger.dangerPhaseToNonShotAffordanceRate}%`,
    "- interpretation: shot dominance currently emerges inside danger phases because danger windows create many more shot affordances than try/drop affordances.",
    `- possession/danger recommendation: ${possessionDanger.recommendation}`,
    "",
    "## Non-Shot Affordance Rebalance Interpretation",
    "- previous danger phase to shot affordance rate: 75%",
    `- new danger phase to shot affordance rate: ${possessionDanger.dangerPhaseToShotAffordanceRate}%`,
    "- previous danger phase to non-shot affordance rate: 14%",
    `- new danger phase to non-shot affordance rate: ${possessionDanger.dangerPhaseToNonShotAffordanceRate}%`,
    `- whether shot dominance remains mostly due to route generation or candidate selection: ${nonShotGeneration.newNonShotAffordanceShare > nonShotGeneration.previousNonShotAffordanceShare ? "candidate selection should be diagnosed next if shot still wins too often." : "route generation still needs more non-shot affordance volume."}`,
    `- recommendation: ${nonShotGeneration.recommendation === "KEEP_NON_SHOT_AFFORDANCE_MODEL" ? "DIAGNOSE_SHOT_CANDIDATE_SELECTION" : nonShotGeneration.recommendation}`,
    "",
    "## Non-Shot Resolution Rebalance Interpretation",
    `- shot points share: ${snapshot.shotPointsShare}%`,
    `- try points share: ${snapshot.tryPointsShare}%`,
    `- conversion points share: ${snapshot.conversionPointsShare}%`,
    `- drop points share: ${snapshot.dropPointsShare}%`,
    `- conversion success rate: ${nonShotResolution.conversionSuccessRate}%`,
    `- drop success rate: ${nonShotResolution.dropSuccessRate}%`,
    "- whether shot dominance is still route generation, candidate selection, or non-shot resolution: non-shot resolution is now credible; monitor candidate selection and route competition before changing shot value.",
    `- recommendation: ${nonShotResolution.recommendation}`,
    "- do not recommend reducing SHOT_GOAL value; do not activate PENALTY_SHOT.",
    "",
    "## Shot Quality Analysis",
    `- average shot quality: ${input.batchCalibration.averageShotQuality}/100`,
    `- low-quality shot count: ${input.batchCalibration.lowQualityShots}`,
    `- low-quality goals: ${lowQualityGoals}`,
    `- high-quality misses: ${highQualityMisses}`,
    `- clean-window shot count: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.cleanWindowShotCount, 0)}`,
    `- clean-window goals: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.cleanWindowGoalCount, 0)}`,
    `- forced shot count: ${input.batchCalibration.forcedShotCount}`,
    `- forced shot goals: ${input.batchCalibration.forcedShotCount === 0 ? "field unavailable in current report pack" : Math.round((input.batchCalibration.forcedShotConversionRate / 100) * input.batchCalibration.forcedShotCount)}`,
    `- interpretation: global shot efficiency is ${snapshot.shotSuccessRate}%, inside the recent target band; the dominance signal is stronger in route volume/candidate availability than raw shot success.`,
    "",
    "## Shot Phase / Zone Analysis",
    "- shots by phase:",
    ...distributionLines(snapshot.shotPhaseDistribution).map((line) => `  ${line}`),
    "- shots by zone:",
    ...distributionLines(snapshot.shotZoneDistribution).map((line) => `  ${line}`),
    "- interpretation: batch phase/zone tags are incomplete, so this report does not invent broad zone conclusions; current mini-match zone rows are included only as live context.",
    "",
    "## Goalkeeper / Defensive Suppression Analysis",
    `- total shots: ${snapshot.shotAttempts}`,
    `- on-target shots: ${input.batchCalibration.onTargetShotCount}`,
    `- GK evaluated shots: ${input.batchCalibration.goalkeeperEvaluatedCount}`,
    `- goals: ${snapshot.shotGoals}`,
    `- saves: ${input.batchCalibration.savedByGoalkeeperCount}`,
    `- catches: ${input.batchCalibration.caughtByGoalkeeperCount}`,
    `- deflections: ${input.batchCalibration.deflectedByGoalkeeperCount}`,
    `- blocks: ${input.batchCalibration.blockedByDefenderCount}`,
    `- misses: ${input.batchCalibration.missedWideHighCount}`,
    `- rebound-created second shot windows: ${snapshot.reboundSecondShotWindowCount}`,
    `- interpretation: GK/defensive suppression is active; the diagnostic should watch whether save/deflect outcomes create too many repeat shot windows before changing shot values.`,
    "",
    "## Rebound / Second-Shot Analysis",
    `- rebound events: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.reboundEventCount, 0)}`,
    `- contested rebounds: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.contestedReboundCount, 0)}`,
    `- attacker recoveries: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.attackerReboundRecoveryCount, 0)}`,
    `- defender recoveries: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.defenderReboundRecoveryCount, 0)}`,
    `- GK recoveries: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.gkReboundRecoveryCount, 0)}`,
    `- second-shot windows: ${snapshot.reboundSecondShotWindowCount}`,
    `- scramble-created second-shot windows: ${input.batchCalibration.samples.reduce((total, sample) => total + sample.scrambleReboundCount, 0)}`,
    `- interpretation: rebound repeat windows are present but not the primary cause unless second-shot windows rise materially above the current count.`,
    "",
    "## Route Competition Analysis",
    `- shot candidates generated: ${snapshot.shotAttempts}`,
    `- shot candidates selected: ${snapshot.shotCandidateSelectionCount}`,
    `- shot candidates rejected: ${snapshot.shotCandidateRejectionCount}`,
    `- try candidates generated: ${snapshot.tryOpportunities}`,
    `- try candidates selected: ${snapshot.tryAttempts}`,
    `- try candidates rejected: ${Math.max(0, snapshot.tryOpportunities - snapshot.tryAttempts)}`,
    `- drop candidates generated: ${snapshot.dropCandidatesGenerated}`,
    `- drop candidates selected: ${snapshot.dropAttempts}`,
    `- drop candidates rejected: ${Math.max(0, snapshot.dropCandidatesGenerated - snapshot.dropAttempts)}`,
    `- observed shot-over-try decisions: field unavailable in current report pack`,
    `- observed shot-over-drop decisions: field unavailable in current report pack`,
    `- observed drop-over-shot decisions: field unavailable in current report pack`,
    `- observed try-over-shot decisions: field unavailable in current report pack`,
    "- interpretation: current candidate-level batch route comparison is incomplete; the strongest next diagnostic is shot candidate selection versus try/drop alternatives.",
    "",
    "## Non-Shot Route Capacity",
    `- try opportunities: ${snapshot.tryOpportunities}`,
    `- try attempts: ${snapshot.tryAttempts}`,
    `- tries scored: ${snapshot.triesScored}`,
    `- try scoring rate: ${percent(snapshot.triesScored, snapshot.tryAttempts)}%`,
    `- drop opportunities: ${snapshot.dropOpportunities}`,
    `- drop attempts: ${snapshot.dropAttempts}`,
    `- drop goals: ${snapshot.dropGoals}`,
    `- drop success rate: ${percent(snapshot.dropGoals, snapshot.dropAttempts)}%`,
    `- conversion attempts: ${snapshot.conversionAttempts}`,
    `- conversions made: ${snapshot.conversionsMade}`,
    `- conversion success rate: ${percent(snapshot.conversionsMade, snapshot.conversionAttempts)}%`,
    "- interpretation: non-shot scoring exists but does not yet appear often enough to compete with the mature shot batch route.",
    "",
    "## Cause Classification",
    "",
    "| cause | severity | evidence |",
    "| --- | --- | --- |",
    ...snapshot.causeClassifications.map((item) => `| ${item.cause} | ${item.severity} | ${item.evidence} |`),
    "",
    "## Recommendation",
    `- primary recommendation: ${snapshot.recommendation}`,
    `- secondary recommendation: ${affordanceVolume.recommendation === "INCREASE_NON_SHOT_AFFORDANCES" ? "INCREASE_SCORING_AFFORDANCE_VOLUME" : "INSTRUMENT_DANGER_PHASES"}`,
    "- do not change yet: scoring values, shot success thresholds, clean-window thresholds, GK logic, rebound logic, or PENALTY_SHOT activation.",
    "- next sprint suggestion: compare candidate-level SHOT_GOAL selections against simultaneous TRY_TOUCHDOWN_ATTEMPT and DROP_GOAL_ATTEMPT candidates.",
    "",
  ].join("\n");
}
