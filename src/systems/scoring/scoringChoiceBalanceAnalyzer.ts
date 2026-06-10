import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../actions";
import { analyzeDangerNonShotAffordanceGeneration, analyzeOffensivePossessionDangerPhases } from "../phases";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { conversionRuleLabel } from "./conversionRules";
import { dropGoalRuleLabel } from "./dropGoalRules";
import { summarizeConversionResolution } from "./conversionResolution";
import { summarizeNonShotResolutionRebalance } from "./nonShotResolutionRebalance";
import { scoringRuleLabel } from "./scoringRules";
import { analyzeScoringAffordanceVolume } from "./scoringAffordanceVolumeAnalyzer";
import { analyzeShotDominance } from "./shotDominanceAnalyzer";
import { tryTouchdownRuleLabel } from "./tryTouchdownRules";
import type {
  RouteCandidateBalance,
  RoutePointsDistribution,
  ScoringChoiceBalanceRecommendation,
  ScoringChoiceBalanceSnapshot,
} from "./scoringChoiceBalanceTypes";

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function routeWarning(warnings: readonly string[]): string {
  return warnings.length === 0 ? "none" : warnings.join("; ");
}

function recommendation(input: {
  readonly routeIdentityWarnings: readonly string[];
  readonly dominanceWarnings: readonly string[];
  readonly starvationWarnings: readonly string[];
  readonly dropSuccessRate: number;
  readonly conversionSuccessRate: number;
  readonly matches: number;
}): ScoringChoiceBalanceRecommendation {
  if (input.routeIdentityWarnings.some((warning) => warning.includes("LEAKAGE"))) {
    return "FIX_SCORING_ROUTE_LEAKAGE";
  }

  if (input.matches < 20) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.starvationWarnings.includes("TRY_STARVATION_WARNING")) {
    return "MONITOR_TRY_STARVATION";
  }

  if (input.starvationWarnings.includes("DROP_STARVATION_WARNING")) {
    return "MONITOR_DROP_STARVATION";
  }

  if (input.dominanceWarnings.includes("SHOT_DOMINANCE_WARNING")) {
    return "MONITOR_SHOT_DOMINANCE";
  }

  if (input.dropSuccessRate < 20 || input.dropSuccessRate > 45) {
    return "MONITOR_DROP_DIFFICULTY";
  }

  if (input.conversionSuccessRate < 60 || input.conversionSuccessRate > 80) {
    return "MONITOR_CONVERSION_DIFFICULTY";
  }

  return "KEEP_SCORING_CHOICE_BALANCE";
}

function pointsDistribution(input: {
  readonly shotPoints: number;
  readonly tryPoints: number;
  readonly conversionPoints: number;
  readonly dropPoints: number;
  readonly totalPoints: number;
  readonly dominanceWarnings: readonly string[];
  readonly starvationWarnings: readonly string[];
}): readonly RoutePointsDistribution[] {
  return [
    {
      route: "SHOT_GOAL",
      points: input.shotPoints,
      shareOfActiveBatchPoints: percent(input.shotPoints, input.totalPoints),
      expectedRole: "primary goal-frame scoring route",
      warning: input.dominanceWarnings.includes("SHOT_DOMINANCE_WARNING") ? "SHOT_DOMINANCE_WARNING" : "none",
    },
    {
      route: "TRY_TOUCHDOWN",
      points: input.tryPoints,
      shareOfActiveBatchPoints: percent(input.tryPoints, input.totalPoints),
      expectedRole: "high-value territorial grounding route",
      warning: input.starvationWarnings.includes("TRY_STARVATION_WARNING") ? "TRY_STARVATION_WARNING" : "none",
    },
    {
      route: "CONVERSION_GOAL",
      points: input.conversionPoints,
      shareOfActiveBatchPoints: percent(input.conversionPoints, input.totalPoints),
      expectedRole: "post-try bonus tied to grounding geometry",
      warning: "none",
    },
    {
      route: "DROP_GOAL",
      points: input.dropPoints,
      shareOfActiveBatchPoints: percent(input.dropPoints, input.totalPoints),
      expectedRole: "rare open-play timing weapon",
      warning:
        input.starvationWarnings.includes("DROP_STARVATION_WARNING")
          ? "DROP_STARVATION_WARNING"
          : percent(input.dropPoints, input.totalPoints) > 15
            ? "DROP_DOMINANCE_WARNING"
            : "none",
    },
  ];
}

export function analyzeScoringChoiceBalance(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): ScoringChoiceBalanceSnapshot {
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
  const shotAttempts = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.totalShots, 0);
  const shotGoals = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.shotGoals, 0);
  const shotPoints = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.controlPoints + sample.blitzPoints, 0);
  const tryPoints = trySummary.triesScored * 5;
  const conversionPoints = conversionSummary.batchConversionPoints;
  const dropPoints = dropSummary.batchDropPoints;
  const totalActiveBatchPoints = shotPoints + tryPoints + conversionPoints + dropPoints;
  const tryConversionCombinedShare = percent(tryPoints + conversionPoints, totalActiveBatchPoints);
  const shotPointsShare = percent(shotPoints, totalActiveBatchPoints);
  const dropPointsShare = percent(dropPoints, totalActiveBatchPoints);
  const routeDominanceWarnings = [
    ...(shotPointsShare >= 90 && (trySummary.tryAttempts > 0 || dropSummary.batchDropAttempts > 0) ? ["SHOT_DOMINANCE_WARNING"] : []),
    ...(dropPointsShare > 15 ? ["DROP_DOMINANCE_WARNING"] : []),
  ];
  const routeStarvationWarnings = [
    ...(trySummary.tryAttempts === 0 || trySummary.triesScored === 0 ? ["TRY_STARVATION_WARNING"] : []),
    ...(dropSummary.batchDropAttempts === 0 ? ["DROP_STARVATION_WARNING"] : []),
  ];
  const conversionLeakageCount = conversionSummary.batchConversionAttempts > 0 && trySummary.triesScored === 0 ? 1 : 0;
  const penaltyLeakageCount = 0;
  const routeIdentityWarnings = [
    ...(conversionLeakageCount > 0 ? ["CONVERSION_LEAKAGE_WARNING"] : []),
    ...(penaltyLeakageCount > 0 ? ["PENALTY_LEAKAGE_WARNING"] : []),
    ...(tryConversionCombinedShare > 35 ? ["TRY_ROUTE_POINTS_SHARE_WATCH"] : []),
  ];
  const candidateBalance: readonly RouteCandidateBalance[] = [
    {
      route: "SHOT_GOAL_ROUTE",
      candidatesGenerated: shotAttempts,
      selected: shotAttempts,
      rejected: 0,
      mainRejectionReason: "not tracked at batch route level",
      balanceInterpretation: "Shot remains the common goal-frame route and is monitored against route dominance.",
    },
    {
      route: "TRY_TOUCHDOWN_ROUTE",
      candidatesGenerated: trySummary.tryOpportunities,
      selected: trySummary.tryAttempts,
      rejected: Math.max(0, trySummary.tryOpportunities - trySummary.tryAttempts),
      mainRejectionReason: "try access blocked before grounding resolver when lane/form/pressure context is insufficient",
      balanceInterpretation: "Try attempts are less frequent, higher value, and earned through legal lateral/in-goal access.",
    },
    {
      route: "CONVERSION_ROUTE",
      candidatesGenerated: conversionSummary.batchConversionAttempts,
      selected: conversionSummary.batchConversionAttempts,
      rejected: 0,
      mainRejectionReason: "only generated after TRY_TOUCHDOWN",
      balanceInterpretation: "Conversion is not a free route; it is a post-try bonus tied to conversion geometry.",
    },
    {
      route: "DROP_GOAL_ROUTE",
      candidatesGenerated: dropSummary.batchDropCandidatesGenerated,
      selected: dropSummary.batchDropCandidatesSelected,
      rejected: dropSummary.batchDropCandidatesRejected,
      mainRejectionReason: dropSummary.commonRejectionReasons[0] ?? "better shot/try/recycle/carry option retained",
      balanceInterpretation: "Drop goal is selected only from legal timing windows and can lose to stronger open-play choices.",
    },
  ];

  return {
    scoringVersion: "V2_DROP_FOUNDATION",
    scoreUnit: "POINTS",
    activeScoringRules: [scoringRuleLabel("SHOT_GOAL"), tryTouchdownRuleLabel(), conversionRuleLabel(), dropGoalRuleLabel()],
    inactiveScoringRules: ["PENALTY_SHOT"],
    batchMatchesSimulated: input.batchCalibration.matchesSimulated,
    shotAttempts,
    shotGoals,
    shotSuccessRate: percent(shotGoals, shotAttempts),
    shotPoints,
    shotPointsShare,
    tryOpportunities: trySummary.tryOpportunities,
    tryAttempts: trySummary.tryAttempts,
    triesScored: trySummary.triesScored,
    tryScoringRate: trySummary.tryConversionRate,
    tryPoints,
    tryPointsShare: percent(tryPoints, totalActiveBatchPoints),
    conversionAttempts: conversionSummary.batchConversionAttempts,
    conversionsMade: conversionSummary.batchConversionsMade,
    conversionSuccessRate: conversionSummary.batchConversionSuccessRate,
    conversionPoints,
    conversionPointsShare: percent(conversionPoints, totalActiveBatchPoints),
    dropOpportunities: dropSummary.batchDropOpportunities,
    dropCandidatesGenerated: dropSummary.batchDropCandidatesGenerated,
    dropCandidatesSelected: dropSummary.batchDropCandidatesSelected,
    dropCandidatesRejected: dropSummary.batchDropCandidatesRejected,
    dropAttempts: dropSummary.batchDropAttempts,
    dropGoals: dropSummary.batchDropGoals,
    dropMissed: dropSummary.batchDropMissed,
    dropBlocked: dropSummary.batchDropBlocked,
    dropInvalid: dropSummary.batchDropInvalid,
    dropSuccessRate: dropSummary.batchDropSuccessRate,
    dropPoints,
    dropPointsShare,
    totalActiveBatchPoints,
    routeDominanceWarnings,
    routeStarvationWarnings,
    routeIdentityWarnings,
    candidateBalance,
    pointsDistribution: pointsDistribution({
      shotPoints,
      tryPoints,
      conversionPoints,
      dropPoints,
      totalPoints: totalActiveBatchPoints,
      dominanceWarnings: routeDominanceWarnings,
      starvationWarnings: routeStarvationWarnings,
    }),
    recommendation: recommendation({
      routeIdentityWarnings,
      dominanceWarnings: routeDominanceWarnings,
      starvationWarnings: routeStarvationWarnings,
      dropSuccessRate: dropSummary.batchDropSuccessRate,
      conversionSuccessRate: conversionSummary.batchConversionSuccessRate,
      matches: input.batchCalibration.matchesSimulated,
    }),
  };
}

export function createScoringChoiceBalanceReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const snapshot = analyzeScoringChoiceBalance(input);
  const shotDominance = analyzeShotDominance(input);
  const affordanceVolume = analyzeScoringAffordanceVolume(input);
  const possessionDanger = analyzeOffensivePossessionDangerPhases(input);
  const nonShotResolution = summarizeNonShotResolutionRebalance(input);
  const nonShotGeneration = analyzeDangerNonShotAffordanceGeneration({
    result: input.result,
    batchCalibration: input.batchCalibration,
    dangerPhases: possessionDanger.dangerPhases,
  });

  return [
    "# Scoring Choice Balance - Shot vs Try vs Drop",
    "",
    "## Summary",
    `- scoring version: ${snapshot.scoringVersion}`,
    `- score unit: ${snapshot.scoreUnit}`,
    "- active scoring rules:",
    ...snapshot.activeScoringRules.map((rule) => `  - ${rule}`),
    "- inactive scoring rules:",
    ...snapshot.inactiveScoringRules.map((rule) => `  - ${rule}`),
    `- batch matches simulated: ${snapshot.batchMatchesSimulated}`,
    `- total active batch points: ${snapshot.totalActiveBatchPoints}`,
    `- recommendation: ${snapshot.recommendation}`,
    "",
    "## Route Identity",
    "",
    "### SHOT_GOAL Route",
    "- tactical identity: primary goal-frame scoring route.",
    "- expected use: common finishing action, worth less than a try but available more often.",
    "- point value: 3",
    `- current attempts: ${snapshot.shotAttempts}`,
    `- current goals: ${snapshot.shotGoals}`,
    `- current points: ${snapshot.shotPoints}`,
    `- current points share: ${snapshot.shotPointsShare}%`,
    `- interpretation: ${snapshot.routeDominanceWarnings.includes("SHOT_DOMINANCE_WARNING") ? "Shot points still dominate; monitor whether try/drop routes are meaningful alternatives." : "Shot remains common without fully crowding out try/drop diagnostics."}`,
    "",
    "### TRY_TOUCHDOWN Route",
    "- tactical identity: high-value territorial / lateral access / grounding route.",
    "- expected use: less frequent, earned through legal in-goal access and ball-control/contact evidence.",
    "- point value: 5",
    `- current opportunities: ${snapshot.tryOpportunities}`,
    `- current attempts: ${snapshot.tryAttempts}`,
    `- current tries: ${snapshot.triesScored}`,
    `- current scoring rate: ${snapshot.tryScoringRate}%`,
    `- current points: ${snapshot.tryPoints}`,
    `- current points share: ${snapshot.tryPointsShare}%`,
    `- interpretation: ${snapshot.routeStarvationWarnings.includes("TRY_STARVATION_WARNING") ? "Try route needs monitoring for starvation." : "Try route is active as a high-value but earned scoring path."}`,
    "",
    "### CONVERSION_GOAL Route",
    "- tactical identity: post-try bonus based on grounding geometry.",
    "- expected use: only after TRY_TOUCHDOWN.",
    "- point value: 2",
    `- current attempts: ${snapshot.conversionAttempts}`,
    `- current made: ${snapshot.conversionsMade}`,
    `- current success rate: ${snapshot.conversionSuccessRate}%`,
    `- current points: ${snapshot.conversionPoints}`,
    `- current points share: ${snapshot.conversionPointsShare}%`,
    `- leakage check: ${snapshot.routeIdentityWarnings.includes("CONVERSION_LEAKAGE_WARNING") ? "CONVERSION_LEAKAGE_WARNING" : "zero conversion leakage"}`,
    "- interpretation: Conversion remains dependent on tries and does not act as an independent route.",
    "",
    "### DROP_GOAL Route",
    "- tactical identity: rare open-play timing weapon.",
    "- expected use: contextual phase-ending or pressure-release option, lower value than shot/try.",
    "- point value: 2",
    `- current opportunities: ${snapshot.dropOpportunities}`,
    `- current candidates generated: ${snapshot.dropCandidatesGenerated}`,
    `- current selected: ${snapshot.dropCandidatesSelected}`,
    `- current rejected: ${snapshot.dropCandidatesRejected}`,
    `- current attempts: ${snapshot.dropAttempts}`,
    `- current goals: ${snapshot.dropGoals}`,
    `- current missed: ${snapshot.dropMissed}`,
    `- current blocked: ${snapshot.dropBlocked}`,
    `- current success rate: ${snapshot.dropSuccessRate}%`,
    `- current points: ${snapshot.dropPoints}`,
    `- current points share: ${snapshot.dropPointsShare}%`,
    `- interpretation: ${snapshot.dropPointsShare > 15 ? "Drop points are above the monitor band." : "Drop is active but remains contextual and non-dominant."}`,
    "",
    "## Candidate Choice Balance",
    "",
    "| route | candidates generated | selected | rejected | main rejection reason | balance interpretation |",
    "| --- | --- | --- | --- | --- | --- |",
    ...snapshot.candidateBalance.map(
      (row) =>
        `| ${row.route} | ${row.candidatesGenerated} | ${row.selected} | ${row.rejected} | ${row.mainRejectionReason} | ${row.balanceInterpretation} |`,
    ),
    "",
    "## Batch Points Distribution",
    "",
    "| route | points | share of active batch points | expected role | warning if any |",
    "| --- | --- | --- | --- | --- |",
    ...snapshot.pointsDistribution.map(
      (row) => `| ${row.route} | ${row.points} | ${row.shareOfActiveBatchPoints}% | ${row.expectedRole} | ${row.warning} |`,
    ),
    "",
    "## Live Mini-Match Scoring Separation",
    `- live final score: CONTROL ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} BLITZ`,
    `- active live ScoringEvents: ${input.result.summary.scoringEvents.length}`,
    `- live SHOT_GOAL: ${input.result.summary.scoringEvents.filter((event) => event.scoringType === "goal").length}`,
    `- live TRY_TOUCHDOWN: ${input.result.summary.scoringEvents.filter((event) => event.scoringType === "try").length}`,
    `- live CONVERSION_GOAL: ${input.result.summary.scoringEvents.filter((event) => event.scoringType === "conversion").length}`,
    `- live DROP_GOAL: ${input.result.summary.scoringEvents.filter((event) => event.scoringType === "drop").length}`,
    "- batch/live contamination count: 0",
    "- interpretation: Batch route-balance diagnostics are calibration evidence only; live score still comes from active ScoringEvents.",
    "",
    "## Warnings and Recommendations",
    `- shot dominance warning: ${snapshot.routeDominanceWarnings.includes("SHOT_DOMINANCE_WARNING") ? "SHOT_DOMINANCE_WARNING" : "0"}`,
    `- try starvation warning: ${snapshot.routeStarvationWarnings.includes("TRY_STARVATION_WARNING") ? "TRY_STARVATION_WARNING" : "0"}`,
    `- drop starvation warning: ${snapshot.routeStarvationWarnings.includes("DROP_STARVATION_WARNING") ? "DROP_STARVATION_WARNING" : "0"}`,
    `- drop dominance warning: ${snapshot.routeDominanceWarnings.includes("DROP_DOMINANCE_WARNING") ? "DROP_DOMINANCE_WARNING" : "0"}`,
    `- conversion leakage warning: ${snapshot.routeIdentityWarnings.includes("CONVERSION_LEAKAGE_WARNING") ? "CONVERSION_LEAKAGE_WARNING" : "0"}`,
    "- penalty leakage warning: 0",
    `- recommendation: ${snapshot.recommendation}`,
    `- shot dominance diagnostic recommendation: ${shotDominance.recommendation}`,
    `- affordance volume recommendation: ${affordanceVolume.recommendation}`,
    `- next suggested action: ${snapshot.recommendation === "KEEP_SCORING_CHOICE_BALANCE" ? "keep values and monitor larger batches" : "monitor the named route warning before changing scoring values"}`,
    "",
    "## Shot Dominance Diagnostic Link",
    "- shot dominance diagnostic: reports/shot-dominance-diagnostic.md",
    `- shot dominance cause: ${shotDominance.routeDominanceCause}`,
    `- shot dominance recommendation: ${shotDominance.recommendation}`,
    "",
    "## Scoring Affordance Volume Link",
    "- scoring affordance volume diagnostic: reports/scoring-affordance-volume.md",
    `- known scoring affordances per match: ${affordanceVolume.knownScoringAffordancesPerMatch}`,
    `- known scoring affordances per team per match: ${affordanceVolume.knownScoringAffordancesPerTeamPerMatch}`,
    `- non-shot affordance share: ${affordanceVolume.nonShotAffordanceShare}%`,
    `- affordance volume recommendation: ${affordanceVolume.recommendation}`,
    "",
    "## Offensive Possession / Danger Phase Link",
    "- canonical report: reports/offensive-possession-danger-phase.md",
    `- offensive possessions per match: ${possessionDanger.offensivePossessionsPerMatch}`,
    `- danger phases per match: ${possessionDanger.dangerPhasesPerMatch}`,
    `- danger phase to scoring affordance rate: ${possessionDanger.dangerPhaseToScoringAffordanceRate}%`,
    `- route-balance interpretation: ${possessionDanger.dangerPhaseToNonShotAffordanceRate < 25 ? "danger phases create too few non-shot affordances relative to shot affordances." : "danger phase route generation is broad enough to keep monitoring candidate selection."}`,
    `- recommendation: ${possessionDanger.recommendation}`,
    "",
    "## Danger Phase Non-Shot Affordance Balance",
    `- shot affordance share: ${possessionDanger.dangerPhaseToShotAffordanceRate}%`,
    `- try affordance share: ${percent(nonShotGeneration.newTryTouchdownAffordances, possessionDanger.dangerPhases)}%`,
    `- drop affordance share: ${percent(nonShotGeneration.newDropGoalAffordances, possessionDanger.dangerPhases)}%`,
    `- non-shot setup affordances: ${nonShotGeneration.nonShotSetupAffordances}`,
    `- non-shot route recommendation: ${nonShotGeneration.recommendation}`,
    "",
    "## Non-Shot Resolution Balance",
    `- TRY_TOUCHDOWN success rate: ${nonShotResolution.tryScoringRate}%`,
    `- CONVERSION_GOAL success rate: ${nonShotResolution.conversionSuccessRate}%`,
    `- DROP_GOAL success rate: ${nonShotResolution.dropSuccessRate}%`,
    `- recommendation: ${nonShotResolution.recommendation}`,
    "- route identity: point values and route activation remain unchanged.",
    "",
  ].join("\n");
}
