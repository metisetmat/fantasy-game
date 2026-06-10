import { summarizeDropGoalFoundation } from "../actions/dropGoalAttemptResolver";
import { summarizeTryOpportunityGeneration } from "../actions/tryOpportunityDetector";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeConversionResolution } from "./conversionResolution";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import {
  summarizeNonShotCandidateRankingCalibration,
  type NonShotCandidateRow,
  type NonShotCandidateType,
} from "./nonShotCandidateRankingCalibration";

export type RouteFamily = "SHOT" | "TRY_TOUCHDOWN" | "DROP_GOAL" | "ADVANCE_CONTINUATION" | "SAFE_CONTINUITY" | "CONVERSION";

export type RouteBalanceMetaRisk =
  | "SHOT_DOMINANCE"
  | "TRY_DOMINANCE"
  | "DROP_DOMINANCE"
  | "RECYCLE_STALLING"
  | "LOW_SCORING_LOCKUP"
  | "TOO_MANY_0_0_DRAWS"
  | "TOO_MANY_TRY_ATTEMPTS"
  | "TOO_FEW_DROPS"
  | "TOO_FEW_SHOTS";

export type RouteBalanceRecommendation =
  | "KEEP_SCORING_VALUES"
  | "KEEP_RANKING_CALIBRATION"
  | "MONITOR_ROUTE_BALANCE"
  | "REVIEW_TRY_SELECTION_VOLUME"
  | "REVIEW_DROP_VISIBILITY"
  | "REVIEW_SHOT_SELECTION_IF_TOO_LOW"
  | "REVIEW_ROUTE_SUCCESS_RATES"
  | "ONLY_REBALANCE_SCORING_AFTER_ROUTE_MONITORING";

export interface RouteSelectionBalanceRow {
  readonly routeFamily: RouteFamily;
  readonly selectedCount: number;
  readonly selectedShare: number;
  readonly tacticalRead: string;
}

export interface RouteScoringBalanceRow {
  readonly routeFamily: RouteFamily;
  readonly points: number;
  readonly pointsShare: number;
  readonly scoringEvents: number;
  readonly tacticalRead: string;
}

export interface RouteSuccessRateRow {
  readonly route: string;
  readonly attempts: number;
  readonly successes: number;
  readonly successRate: number;
  readonly tacticalRead: string;
}

export interface RouteStyleImpactRow {
  readonly styleProfile: string;
  readonly selectedShotCount: number;
  readonly selectedTryCount: number;
  readonly selectedDropCount: number;
  readonly selectedContinuationCount: number;
  readonly selectedSafeContinuityCount: number;
  readonly routeIdentityRead: string;
}

export interface RouteCoachReadabilityRow {
  readonly routeFamily: RouteFamily;
  readonly whyChosen: string;
  readonly teamIdentityFit: string;
}

export interface RouteBalancePostRankingMonitoringSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly candidateRowsPersisted: number;
  readonly tieBreakingActive: boolean;
  readonly strongerScoreWordingOnEqualScoreCount: number;
  readonly selectedShotActions: number;
  readonly selectedTryAttempts: number;
  readonly selectedDropAttempts: number;
  readonly selectedAdvanceContinuationActions: number;
  readonly selectedSafeContinuityActions: number;
  readonly shotToTryDropSelectedRatio: number;
  readonly routeSelectionBalance: readonly RouteSelectionBalanceRow[];
  readonly routeScoringBalance: readonly RouteScoringBalanceRow[];
  readonly routeSuccessRates: readonly RouteSuccessRateRow[];
  readonly styleImpact: readonly RouteStyleImpactRow[];
  readonly coachReadability: readonly RouteCoachReadabilityRow[];
  readonly metaRisks: readonly RouteBalanceMetaRisk[];
  readonly recommendation: RouteBalanceRecommendation;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function selectedRows(rows: readonly NonShotCandidateRow[], candidateTypes: readonly NonShotCandidateType[]): readonly NonShotCandidateRow[] {
  return rows.filter((row) => row.selected === "YES" && candidateTypes.includes(row.candidateType));
}

function selectionRead(routeFamily: RouteFamily, selectedShare: number): string {
  switch (routeFamily) {
    case "SHOT":
      return selectedShare < 20 ? "shots are no longer dominant, but visibility should be monitored." : "shots remain available without overwhelming other routes.";
    case "TRY_TOUCHDOWN":
      return selectedShare > 40 ? "try access is now a major route and should be watched for volume." : "try access competes when legal rather than disappearing behind shots.";
    case "DROP_GOAL":
      return selectedShare < 8 ? "drop remains a rare timing weapon; visibility is low but intentional." : "drop appears as a contextual weapon without becoming dominant.";
    case "ADVANCE_CONTINUATION":
      return "carry/progression/switch routes preserve next-action value when direct scoring is not clearly best.";
    case "SAFE_CONTINUITY":
      return "safe continuity remains a pressure-management route rather than a scoring route.";
    case "CONVERSION":
      return "conversion is post-try scoring and is monitored separately from route selection.";
  }
}

function scoringRead(routeFamily: RouteFamily, pointsShare: number): string {
  if (pointsShare > 65) {
    return `${routeFamily} is the main point source in this batch and needs monitoring.`;
  }

  if (pointsShare === 0) {
    return `${routeFamily} produces no points in this batch sample.`;
  }

  return `${routeFamily} contributes points without taking over the scoring economy.`;
}

function routeSelectionBalanceRows(input: {
  readonly selectedShotActions: number;
  readonly selectedTryAttempts: number;
  readonly selectedDropAttempts: number;
  readonly selectedAdvanceContinuationActions: number;
  readonly selectedSafeContinuityActions: number;
}): readonly RouteSelectionBalanceRow[] {
  const total =
    input.selectedShotActions +
    input.selectedTryAttempts +
    input.selectedDropAttempts +
    input.selectedAdvanceContinuationActions +
    input.selectedSafeContinuityActions;
  const rows: readonly Omit<RouteSelectionBalanceRow, "selectedShare" | "tacticalRead">[] = [
    { routeFamily: "SHOT", selectedCount: input.selectedShotActions },
    { routeFamily: "TRY_TOUCHDOWN", selectedCount: input.selectedTryAttempts },
    { routeFamily: "DROP_GOAL", selectedCount: input.selectedDropAttempts },
    { routeFamily: "ADVANCE_CONTINUATION", selectedCount: input.selectedAdvanceContinuationActions },
    { routeFamily: "SAFE_CONTINUITY", selectedCount: input.selectedSafeContinuityActions },
  ];

  return rows.map((row) => {
    const selectedShare = percent(row.selectedCount, total);

    return {
      ...row,
      selectedShare,
      tacticalRead: selectionRead(row.routeFamily, selectedShare),
    };
  });
}

function routeScoringBalanceRows(input: {
  readonly shotPoints: number;
  readonly shotGoals: number;
  readonly tryPoints: number;
  readonly triesScored: number;
  readonly conversionPoints: number;
  readonly conversionsMade: number;
  readonly dropPoints: number;
  readonly dropGoals: number;
}): readonly RouteScoringBalanceRow[] {
  const totalPoints = input.shotPoints + input.tryPoints + input.conversionPoints + input.dropPoints;
  const rows: readonly Omit<RouteScoringBalanceRow, "pointsShare" | "tacticalRead">[] = [
    { routeFamily: "SHOT", points: input.shotPoints, scoringEvents: input.shotGoals },
    { routeFamily: "TRY_TOUCHDOWN", points: input.tryPoints, scoringEvents: input.triesScored },
    { routeFamily: "CONVERSION", points: input.conversionPoints, scoringEvents: input.conversionsMade },
    { routeFamily: "DROP_GOAL", points: input.dropPoints, scoringEvents: input.dropGoals },
    { routeFamily: "ADVANCE_CONTINUATION", points: 0, scoringEvents: 0 },
    { routeFamily: "SAFE_CONTINUITY", points: 0, scoringEvents: 0 },
  ];

  return rows.map((row) => {
    const pointsShare = percent(row.points, totalPoints);

    return {
      ...row,
      pointsShare,
      tacticalRead: scoringRead(row.routeFamily, pointsShare),
    };
  });
}

function routeSuccessRateRows(input: {
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly conversionAttempts: number;
  readonly conversionsMade: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dropBlocked: number;
}): readonly RouteSuccessRateRow[] {
  const forcedShotRate = input.batchCalibration.forcedShotConversionRate;
  const cleanShotRate = input.batchCalibration.cleanWindowConversionRate;
  const contestedTryAttempts = input.tryAttempts;
  const contestedTrySuccesses = input.triesScored;

  return [
    {
      route: "SHOT",
      attempts: input.batchCalibration.samples.reduce((sum, sample) => sum + sample.totalShots, 0),
      successes: input.batchCalibration.samples.reduce((sum, sample) => sum + sample.shotGoals, 0),
      successRate: Math.round(input.batchCalibration.averageConversionRate),
      tacticalRead: "shot success remains a resolution metric, not a changed scoring value.",
    },
    {
      route: "TRY_TOUCHDOWN",
      attempts: input.tryAttempts,
      successes: input.triesScored,
      successRate: percent(input.triesScored, input.tryAttempts),
      tacticalRead: "try success is monitored separately from try selection volume.",
    },
    {
      route: "CONVERSION_GOAL",
      attempts: input.conversionAttempts,
      successes: input.conversionsMade,
      successRate: percent(input.conversionsMade, input.conversionAttempts),
      tacticalRead: "conversion only follows scored tries.",
    },
    {
      route: "DROP_GOAL",
      attempts: input.dropAttempts,
      successes: input.dropGoals,
      successRate: percent(input.dropGoals, input.dropAttempts),
      tacticalRead: "drop stays a contextual route and should not dominate volume.",
    },
    {
      route: "FORCED_SHOT",
      attempts: input.batchCalibration.forcedShotCount,
      successes: Math.round((input.batchCalibration.forcedShotCount * forcedShotRate) / 100),
      successRate: forcedShotRate,
      tacticalRead: "forced shots remain hard to convert.",
    },
    {
      route: "CLEAN_SHOT",
      attempts: input.batchCalibration.samples.reduce((sum, sample) => sum + sample.cleanWindowShotCount, 0),
      successes: input.batchCalibration.samples.reduce((sum, sample) => sum + sample.cleanWindowGoalCount, 0),
      successRate: cleanShotRate,
      tacticalRead: "clean shots stay valuable but are no longer automatic.",
    },
    {
      route: "CONTESTED_TRY",
      attempts: contestedTryAttempts,
      successes: contestedTrySuccesses,
      successRate: percent(contestedTrySuccesses, contestedTryAttempts),
      tacticalRead: "contested try success remains bounded by access and grounding pressure.",
    },
    {
      route: "BLOCKED_DROP",
      attempts: input.dropAttempts,
      successes: input.dropBlocked,
      successRate: percent(input.dropBlocked, input.dropAttempts),
      tacticalRead: "blocked drop rate monitors whether drop windows are being over-invited.",
    },
  ];
}

function styleKey(row: NonShotCandidateRow): string {
  return `${row.team}-${row.actor}`;
}

function routeStyleImpactRows(rows: readonly NonShotCandidateRow[]): readonly RouteStyleImpactRow[] {
  const selected = rows.filter((row) => row.selected === "YES");
  const keys = [...new Set(selected.map(styleKey))].sort();

  return keys.map((key) => {
    const scoped = selected.filter((row) => styleKey(row) === key);
    const selectedShotCount = scoped.filter((row) => row.candidateType === "SHOT").length;
    const selectedTryCount = scoped.filter((row) => row.candidateType === "TRY_TOUCHDOWN_ATTEMPT").length;
    const selectedDropCount = scoped.filter((row) => row.candidateType === "DROP_GOAL_ATTEMPT").length;
    const selectedContinuationCount = scoped.filter((row) =>
      ["CARRY_OR_HOLD", "FORWARD_PROGRESS", "WEAK_SIDE_SWITCH"].includes(row.candidateType),
    ).length;
    const selectedSafeContinuityCount = scoped.filter((row) =>
      ["SAFE_RECYCLE", "CENTRAL_REBUILD", "SUPPORT_CLUSTER_RECYCLE"].includes(row.candidateType),
    ).length;
    const routeIdentityRead =
      selectedTryCount >= selectedShotCount
        ? "team identity is leaning toward territorial try pressure after ranking."
        : selectedShotCount > selectedTryCount + selectedDropCount
          ? "team identity still favors immediate scoring windows."
          : "route mix is spread across scoring and continuation choices.";

    return {
      styleProfile: key,
      selectedShotCount,
      selectedTryCount,
      selectedDropCount,
      selectedContinuationCount,
      selectedSafeContinuityCount,
      routeIdentityRead,
    };
  });
}

function coachReadabilityRows(): readonly RouteCoachReadabilityRow[] {
  return [
    {
      routeFamily: "SHOT",
      whyChosen: "chosen when direct scoring probability and legal frame access beat the best non-shot route.",
      teamIdentityFit: "fits direct or risk-tolerant identities when the window is clean enough.",
    },
    {
      routeFamily: "TRY_TOUCHDOWN",
      whyChosen: "chosen when legal lateral/in-goal access, grounding support, and team identity beat immediate shot value.",
      teamIdentityFit: "fits power/direct or territorial identities without allowing central/frontal try access.",
    },
    {
      routeFamily: "DROP_GOAL",
      whyChosen: "chosen only as a rare timing weapon when legality is contextual and phase timing is credible.",
      teamIdentityFit: "fits patient or balanced teams that value controlled phase-ending points.",
    },
    {
      routeFamily: "ADVANCE_CONTINUATION",
      whyChosen: "chosen when carry, switch, or progression creates better next-action value than a low-upside shot.",
      teamIdentityFit: "fits teams that can move pressure before forcing a score.",
    },
    {
      routeFamily: "SAFE_CONTINUITY",
      whyChosen: "chosen when pressure and loss-channel risk make continuity the best route.",
      teamIdentityFit: "fits patient structure-preserving teams.",
    },
  ];
}

function metaRisks(input: {
  readonly routeSelection: readonly RouteSelectionBalanceRow[];
  readonly routeScoring: readonly RouteScoringBalanceRow[];
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): readonly RouteBalanceMetaRisk[] {
  const risks: RouteBalanceMetaRisk[] = [];
  const selectionShare = (routeFamily: RouteFamily): number =>
    input.routeSelection.find((row) => row.routeFamily === routeFamily)?.selectedShare ?? 0;
  const pointsShare = (routeFamily: RouteFamily): number =>
    input.routeScoring.find((row) => row.routeFamily === routeFamily)?.pointsShare ?? 0;

  if (selectionShare("SHOT") > 45 || pointsShare("SHOT") > 65) {
    risks.push("SHOT_DOMINANCE");
  }

  if (selectionShare("TRY_TOUCHDOWN") > 42 || pointsShare("TRY_TOUCHDOWN") > 65) {
    risks.push("TRY_DOMINANCE");
  }

  if (selectionShare("DROP_GOAL") > 20 || pointsShare("DROP_GOAL") > 35) {
    risks.push("DROP_DOMINANCE");
  }

  if (selectionShare("SAFE_CONTINUITY") > 38) {
    risks.push("RECYCLE_STALLING");
  }

  if (input.batchCalibration.averageTotalPointsPerMatch < 2) {
    risks.push("LOW_SCORING_LOCKUP");
  }

  if (input.batchCalibration.drawRate > 55 && input.batchCalibration.averageTotalPointsPerMatch <= 3) {
    risks.push("TOO_MANY_0_0_DRAWS");
  }

  if (selectionShare("TRY_TOUCHDOWN") > 36) {
    risks.push("TOO_MANY_TRY_ATTEMPTS");
  }

  if (selectionShare("DROP_GOAL") < 5) {
    risks.push("TOO_FEW_DROPS");
  }

  if (selectionShare("SHOT") < 18) {
    risks.push("TOO_FEW_SHOTS");
  }

  return risks;
}

function recommendation(risks: readonly RouteBalanceMetaRisk[]): RouteBalanceRecommendation {
  if (risks.includes("TOO_FEW_SHOTS")) {
    return "REVIEW_SHOT_SELECTION_IF_TOO_LOW";
  }

  if (risks.includes("TOO_MANY_TRY_ATTEMPTS") || risks.includes("TRY_DOMINANCE")) {
    return "REVIEW_TRY_SELECTION_VOLUME";
  }

  if (risks.includes("TOO_FEW_DROPS")) {
    return "REVIEW_DROP_VISIBILITY";
  }

  if (risks.includes("LOW_SCORING_LOCKUP") || risks.includes("DROP_DOMINANCE") || risks.includes("SHOT_DOMINANCE")) {
    return "REVIEW_ROUTE_SUCCESS_RATES";
  }

  return "MONITOR_ROUTE_BALANCE";
}

export function summarizeRouteBalancePostRankingMonitoring(
  input: {
    readonly result: MiniMatchResult;
    readonly batchCalibration: BatchScoringCalibrationSummary;
  },
): RouteBalancePostRankingMonitoringSummary {
  const batchCalibration = input.batchCalibration;
  const ranking = summarizeNonShotCandidateRankingCalibration(batchCalibration);
  const selectedShot = selectedRows(ranking.rows, ["SHOT"]);
  const selectedTry = selectedRows(ranking.rows, ["TRY_TOUCHDOWN_ATTEMPT"]);
  const selectedDrop = selectedRows(ranking.rows, ["DROP_GOAL_ATTEMPT"]);
  const selectedAdvanceContinuation = selectedRows(ranking.rows, ["CARRY_OR_HOLD", "FORWARD_PROGRESS", "WEAK_SIDE_SWITCH"]);
  const selectedSafeContinuity = selectedRows(ranking.rows, ["SAFE_RECYCLE", "SUPPORT_CLUSTER_RECYCLE", "CENTRAL_REBUILD"]);
  const trySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration.matchesSimulated,
    samples: batchCalibration.samples.map((sample) => ({
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
    batchCalibration,
  });
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const conversionAttempts = conversionSummary.batchConversionAttempts;
  const conversionsMade = conversionSummary.batchConversionsMade;
  const shotGoals = batchCalibration.samples.reduce((sum, sample) => sum + sample.shotGoals, 0);
  const shotPoints = shotGoals * 3;
  const tryPoints = trySummary.triesScored * TRY_TOUCHDOWN_POINT_VALUE;
  const conversionPoints = conversionSummary.batchConversionPoints;
  const dropPoints = dropSummary.batchDropPoints;
  const tryDrop = selectedTry.length + selectedDrop.length;
  const shotToTryDropSelectedRatio = tryDrop === 0 ? selectedShot.length : Math.round((selectedShot.length / tryDrop) * 10) / 10;
  const routeSelection = routeSelectionBalanceRows({
    selectedShotActions: selectedShot.length,
    selectedTryAttempts: selectedTry.length,
    selectedDropAttempts: selectedDrop.length,
    selectedAdvanceContinuationActions: selectedAdvanceContinuation.length,
    selectedSafeContinuityActions: selectedSafeContinuity.length,
  });
  const routeScoring = routeScoringBalanceRows({
    shotPoints,
    shotGoals,
    tryPoints,
    triesScored: trySummary.triesScored,
    conversionPoints,
    conversionsMade,
    dropPoints,
    dropGoals: dropSummary.batchDropGoals,
  });
  const risks = metaRisks({
    routeSelection,
    routeScoring,
    batchCalibration,
  });

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    candidateRowsPersisted: ranking.candidateRowsPersisted,
    tieBreakingActive: ranking.equalOrNearTieDecisionCount > 0,
    strongerScoreWordingOnEqualScoreCount: ranking.strongerScoreWordingOnEqualScoreCount,
    selectedShotActions: selectedShot.length,
    selectedTryAttempts: selectedTry.length,
    selectedDropAttempts: selectedDrop.length,
    selectedAdvanceContinuationActions: selectedAdvanceContinuation.length,
    selectedSafeContinuityActions: selectedSafeContinuity.length,
    shotToTryDropSelectedRatio,
    routeSelectionBalance: routeSelection,
    routeScoringBalance: routeScoring,
    routeSuccessRates: routeSuccessRateRows({
      batchCalibration,
      tryAttempts: trySummary.tryAttempts,
      triesScored: trySummary.triesScored,
      conversionAttempts,
      conversionsMade,
      dropAttempts: dropSummary.batchDropAttempts,
      dropGoals: dropSummary.batchDropGoals,
      dropBlocked: dropSummary.batchDropBlocked,
    }),
    styleImpact: routeStyleImpactRows(ranking.rows),
    coachReadability: coachReadabilityRows(),
    metaRisks: risks,
    recommendation: recommendation(risks),
  };
}

function routeSelectionRows(summary: RouteBalancePostRankingMonitoringSummary): readonly string[] {
  return summary.routeSelectionBalance.map(
    (row) => `| ${row.routeFamily} | ${row.selectedCount} | ${row.selectedShare}% | ${row.tacticalRead} |`,
  );
}

function routeScoringRows(summary: RouteBalancePostRankingMonitoringSummary): readonly string[] {
  return summary.routeScoringBalance.map(
    (row) => `| ${row.routeFamily} | ${row.points} | ${row.pointsShare}% | ${row.scoringEvents} | ${row.tacticalRead} |`,
  );
}

function routeSuccessRows(summary: RouteBalancePostRankingMonitoringSummary): readonly string[] {
  return summary.routeSuccessRates.map(
    (row) => `| ${row.route} | ${row.attempts} | ${row.successes} | ${row.successRate}% | ${row.tacticalRead} |`,
  );
}

function styleImpactRows(summary: RouteBalancePostRankingMonitoringSummary): readonly string[] {
  return summary.styleImpact.map(
    (row) =>
      `| ${row.styleProfile} | ${row.selectedShotCount} | ${row.selectedTryCount} | ${row.selectedDropCount} | ${row.selectedContinuationCount} | ${row.selectedSafeContinuityCount} | ${row.routeIdentityRead} |`,
  );
}

function coachReadabilityRowsForReport(summary: RouteBalancePostRankingMonitoringSummary): readonly string[] {
  return summary.coachReadability.map((row) => `| ${row.routeFamily} | ${row.whyChosen} | ${row.teamIdentityFit} |`);
}

export function createRouteBalancePostRankingMonitoringReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeRouteBalancePostRankingMonitoring(input);

  return [
    "# Route Balance Post-Ranking Monitoring",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    `- candidate rows persisted: ${summary.candidateRowsPersisted}`,
    `- tie-breaking active: ${summary.tieBreakingActive ? "YES" : "NO"}`,
    `- equal-score stronger-score wording: ${summary.strongerScoreWordingOnEqualScoreCount}`,
    `- selected SHOT actions: ${summary.selectedShotActions}`,
    `- selected TRY_TOUCHDOWN_ATTEMPT actions: ${summary.selectedTryAttempts}`,
    `- selected DROP_GOAL_ATTEMPT actions: ${summary.selectedDropAttempts}`,
    `- selected carry/switch/progression actions: ${summary.selectedAdvanceContinuationActions}`,
    `- selected safe continuity actions: ${summary.selectedSafeContinuityActions}`,
    `- shot-to-try/drop selected ratio: ${summary.shotToTryDropSelectedRatio}:1`,
    `- meta-risk flags: ${summary.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${summary.recommendation}`,
    "- route success calibration: active in route-success-rate-calibration.md; success-rate decomposition should be reviewed before any scoring-value rebalance.",
    "- goalkeeper impact calibration: active in goalkeeper-shot-stopping-impact-calibration.md; route economy projection keeps scoring values unchanged.",
    "",
    "## Route Selection Balance",
    "",
    "| route family | selected count | selected share | tactical read |",
    "| --- | --- | --- | --- |",
    ...routeSelectionRows(summary),
    "",
    "## Route Scoring Balance",
    "",
    "| route family | points | points share | scoring events | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...routeScoringRows(summary),
    "",
    "## Route Success Rates",
    "",
    "| route | attempts | successes | success rate | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...routeSuccessRows(summary),
    "",
    "## Meta-Risk Detection",
    "",
    "- monitored risks: SHOT_DOMINANCE, TRY_DOMINANCE, DROP_DOMINANCE, RECYCLE_STALLING, LOW_SCORING_LOCKUP, TOO_MANY_0_0_DRAWS, TOO_MANY_TRY_ATTEMPTS, TOO_FEW_DROPS, TOO_FEW_SHOTS.",
    `- detected risks: ${summary.metaRisks.join(", ") || "none"}`,
    "- interpretation: risk flags trigger monitoring or review only; they do not change scoring values.",
    "",
    "## Style Impact",
    "",
    "| style profile | selected shots | selected tries | selected drops | selected carry/switch/progression | selected safe continuity | route identity read |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...styleImpactRows(summary),
    "",
    "## Coach Readability",
    "",
    "| route family | why chosen | team identity fit |",
    "| --- | --- | --- |",
    ...coachReadabilityRowsForReport(summary),
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score from active ScoringEvents only.",
    "- batch/live separation preserved.",
    "- candidate rows remain persisted.",
    "- tie-break explanations remain present.",
    "- equal-score stronger-score wording remains 0.",
    "- Team Shape Intent remains active.",
    "- shot, try, drop, and conversion subsystem validations remain separate.",
    "",
    "## Recommendation",
    `- recommendation: ${summary.recommendation}`,
    "- companion recommendations: KEEP_SCORING_VALUES; KEEP_RANKING_CALIBRATION; ONLY_REBALANCE_SCORING_AFTER_ROUTE_MONITORING.",
    "- interpretation: route balance is now a monitoring problem after ranking and tie-breaking, not a scoring-value change request.",
    "",
  ].join("\n");
}
