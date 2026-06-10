import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { summarizeDangerPhaseConversionEconomy } from "./dangerPhaseConversionEconomy";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import {
  summarizeNonShotCandidateRankingCalibration,
  type NonShotCandidateRow,
  type NonShotCandidateType,
} from "./nonShotCandidateRankingCalibration";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

export type ContinuationRouteTaxonomy =
  | "PRESSURE_ESCAPE_RECYCLE"
  | "SAFE_RESET"
  | "STRUCTURE_ADVANCEMENT"
  | "CENTRAL_REBUILD"
  | "WEAK_SIDE_PREPARATION"
  | "CONTACT_PLATFORM"
  | "CARRY_TO_FIX_DEFENDER"
  | "THIRD_MAN_PREPARATION";

export type ContinuationPayoffRecommendation =
  | "KEEP_SCORING_VALUES"
  | "IMPROVE_CONTINUATION_PAYOFF"
  | "REVIEW_OVER_SAFE_CONTINUATION"
  | "REVIEW_STYLE_ROUTE_DIVERSITY"
  | "REVIEW_0_0_DRAW_RATE"
  | "MONITOR_DANGER_TO_SCORE_CONVERSION"
  | "ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF";

export interface ContinuationChainTrackingRow {
  readonly matchId: string;
  readonly team: string;
  readonly styleProfile: string;
  readonly continuationType: NonShotCandidateType;
  readonly taxonomy: ContinuationRouteTaxonomy;
  readonly initialDangerPhaseContext: string;
  readonly pressureLevel: string;
  readonly ballZone: string;
  readonly teamShapeScore: number;
  readonly restDefenseStatus: string;
  readonly nextActionPotentialBefore: number;
  readonly nextActionPotentialAfter: number;
  readonly nextSelectedRoute: NonShotCandidateType | "SHOT" | "TRY_TOUCHDOWN_ATTEMPT" | "DROP_GOAL_ATTEMPT";
  readonly scoringRouteCreatedWithinOneAction: "YES" | "NO";
  readonly scoringRouteCreatedWithinTwoActions: "YES" | "NO";
  readonly eventualPointOutcome: number;
  readonly payoffReason: string;
}

export interface ContinuationTaxonomyRow {
  readonly continuationType: NonShotCandidateType;
  readonly taxonomy: ContinuationRouteTaxonomy;
  readonly selectedCount: number;
  readonly calibratedPayoffCount: number;
  readonly calibratedPayoffRate: number;
  readonly tacticalRead: string;
}

export interface StyleContinuationAdjustmentRow {
  readonly styleVariant: string;
  readonly selectedContinuations: number;
  readonly averageBeforePotential: number;
  readonly averageAfterPotential: number;
  readonly recommendedAdjustment: string;
}

export interface ContinuationPayoffCalibrationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly matchesSimulated: number;
  readonly chainRows: readonly ContinuationChainTrackingRow[];
  readonly taxonomyRows: readonly ContinuationTaxonomyRow[];
  readonly styleRows: readonly StyleContinuationAdjustmentRow[];
  readonly currentSterileDangerPhases: number;
  readonly projectedSterileDangerPhases: number;
  readonly currentSterileDangerRate: number;
  readonly projectedSterileDangerRate: number;
  readonly currentNilNilDrawRate: number;
  readonly projectedNilNilDrawRate: number;
  readonly currentDangerToScoreConversionRate: number;
  readonly projectedDangerToThreatConversionRate: number;
  readonly supportClusterRecyclePayoffRate: number;
  readonly forwardProgressPayoffRate: number;
  readonly weakSideSwitchPayoffRate: number;
  readonly recommendations: readonly ContinuationPayoffRecommendation[];
}

const CONTINUATION_TYPES: readonly NonShotCandidateType[] = [
  "SUPPORT_CLUSTER_RECYCLE",
  "FORWARD_PROGRESS",
  "WEAK_SIDE_SWITCH",
  "CARRY_OR_HOLD",
  "SAFE_RECYCLE",
  "CENTRAL_REBUILD",
];

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function selectedContinuationRows(rows: readonly NonShotCandidateRow[]): readonly NonShotCandidateRow[] {
  return rows.filter((row) => row.selected === "YES" && CONTINUATION_TYPES.includes(row.candidateType));
}

function sampleForRow(samples: readonly MatchScoringCalibrationSample[], row: NonShotCandidateRow): MatchScoringCalibrationSample | undefined {
  return samples.find((sample) => row.actionId.startsWith(`${sample.matchId}-danger-`));
}

function styleProfile(sample: MatchScoringCalibrationSample): string {
  return `${sample.scenario.controlStyleVariant} vs ${sample.scenario.blitzStyleVariant}`;
}

function taxonomyFor(row: NonShotCandidateRow): ContinuationRouteTaxonomy {
  switch (row.candidateType) {
    case "SUPPORT_CLUSTER_RECYCLE":
      return "PRESSURE_ESCAPE_RECYCLE";
    case "SAFE_RECYCLE":
      return "SAFE_RESET";
    case "FORWARD_PROGRESS":
      return "STRUCTURE_ADVANCEMENT";
    case "CENTRAL_REBUILD":
      return "CENTRAL_REBUILD";
    case "WEAK_SIDE_SWITCH":
      return "WEAK_SIDE_PREPARATION";
    case "CARRY_OR_HOLD":
      return "CARRY_TO_FIX_DEFENDER";
    case "SHOT":
    case "TRY_TOUCHDOWN_ATTEMPT":
    case "DROP_GOAL_ATTEMPT":
      return "CONTACT_PLATFORM";
  }
}

function payoffBoost(row: NonShotCandidateRow, sample: MatchScoringCalibrationSample): number {
  const pressureBoost = sample.scenario.pressureProfile === "HIGH" ? 24 : sample.scenario.pressureProfile === "MEDIUM" ? 16 : 8;
  const restDefenseBoost = row.restDefenseCost <= 4 ? 10 : 4;
  const styleBoost =
    sample.scenario.controlStyleVariant === "CONTROL_DIRECT" || sample.scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE"
      ? 12
      : sample.scenario.controlStyleVariant === "CONTROL_PATIENT"
        ? 8
        : 10;

  switch (row.candidateType) {
    case "SUPPORT_CLUSTER_RECYCLE":
      return pressureBoost + restDefenseBoost + styleBoost;
    case "FORWARD_PROGRESS":
      return 22 + restDefenseBoost + (sample.scenario.pressureProfile === "LOW" ? 6 : 0);
    case "WEAK_SIDE_SWITCH":
      return 12 + pressureBoost;
    case "CENTRAL_REBUILD":
      return 18 + restDefenseBoost;
    case "CARRY_OR_HOLD":
      return 16 + styleBoost;
    case "SAFE_RECYCLE":
      return sample.scenario.controlStyleVariant === "CONTROL_DIRECT" ? 6 : 14;
    case "SHOT":
    case "TRY_TOUCHDOWN_ATTEMPT":
    case "DROP_GOAL_ATTEMPT":
      return 0;
  }
}

function nextRoute(row: NonShotCandidateRow, sample: MatchScoringCalibrationSample): ContinuationChainTrackingRow["nextSelectedRoute"] {
  if (row.candidateType === "WEAK_SIDE_SWITCH") {
    return sample.scenario.pressureProfile === "HIGH" ? "TRY_TOUCHDOWN_ATTEMPT" : "SHOT";
  }

  if (row.candidateType === "FORWARD_PROGRESS") {
    return sample.scenario.controlStyleVariant === "CONTROL_DIRECT" ? "TRY_TOUCHDOWN_ATTEMPT" : "SHOT";
  }

  if (row.candidateType === "SUPPORT_CLUSTER_RECYCLE") {
    return sample.scenario.pressureProfile === "HIGH" ? "FORWARD_PROGRESS" : "WEAK_SIDE_SWITCH";
  }

  if (row.candidateType === "CENTRAL_REBUILD") {
    return "FORWARD_PROGRESS";
  }

  if (row.candidateType === "CARRY_OR_HOLD") {
    return "DROP_GOAL_ATTEMPT";
  }

  return sample.scenario.controlStyleVariant === "CONTROL_DIRECT" ? "FORWARD_PROGRESS" : "SUPPORT_CLUSTER_RECYCLE";
}

function restDefenseStatus(row: NonShotCandidateRow): string {
  if (row.restDefenseCost <= 4) {
    return "INTACT";
  }

  if (row.restDefenseCost <= 8) {
    return "STRETCHED_BUT_CONNECTED";
  }

  return "EXPOSED";
}

function matchNumber(sample: MatchScoringCalibrationSample): number {
  const match = /^match-(\d+)$/.exec(sample.matchId);

  return match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
}

function continuationPayoffGate(row: NonShotCandidateRow, sample: MatchScoringCalibrationSample): boolean {
  const index = matchNumber(sample);

  switch (row.candidateType) {
    case "SUPPORT_CLUSTER_RECYCLE":
      return index % 5 !== 0;
    case "FORWARD_PROGRESS":
      return index % 5 !== 0 && row.restDefenseCost <= 8;
    case "WEAK_SIDE_SWITCH":
      return sample.scenario.pressureProfile !== "LOW" && row.restDefenseCost <= 8;
    case "CENTRAL_REBUILD":
      return row.teamShapeFit >= 16 && row.restDefenseCost <= 6;
    case "CARRY_OR_HOLD":
      return row.riskScore <= 12 && row.pressureImpact <= 12;
    case "SAFE_RECYCLE":
      return sample.scenario.pressureProfile === "HIGH" && row.nextActionPotential >= 45;
    case "SHOT":
    case "TRY_TOUCHDOWN_ATTEMPT":
    case "DROP_GOAL_ATTEMPT":
      return false;
  }
}

function continuationPayoffReason(input: {
  readonly row: NonShotCandidateRow;
  readonly before: number;
  readonly after: number;
  readonly thresholdEligible: boolean;
  readonly gateEligible: boolean;
}): string {
  if (input.thresholdEligible && input.gateEligible) {
    return `${input.row.candidateType} improves the next-action potential from ${input.before} to ${input.after}; it creates a credible future route without adding points by itself.`;
  }

  if (input.thresholdEligible && !input.gateEligible) {
    return `${input.row.candidateType} improves the next-action potential from ${input.before} to ${input.after}, but pressure, rest-defense cost, or route timing prevent an automatic future threat.`;
  }

  return `${input.row.candidateType} remains safe but does not yet lift the next-action route quality enough to break sterility.`;
}

function chainRow(row: NonShotCandidateRow, sample: MatchScoringCalibrationSample): ContinuationChainTrackingRow {
  const after = Math.min(100, row.nextActionPotential + payoffBoost(row, sample));
  const thresholdEligible = after >= 62;
  const gateEligible = continuationPayoffGate(row, sample);
  const withinOne = after >= 80 && gateEligible;
  const withinTwo = thresholdEligible && gateEligible;
  const eventualPointOutcome = sample.controlPoints + sample.blitzPoints;
  const reason = continuationPayoffReason({
    row,
    before: row.nextActionPotential,
    after,
    thresholdEligible,
    gateEligible,
  });

  return {
    matchId: sample.matchId,
    team: row.team,
    styleProfile: styleProfile(sample),
    continuationType: row.candidateType,
    taxonomy: taxonomyFor(row),
    initialDangerPhaseContext: sample.controlPoints + sample.blitzPoints === 0 ? "STERILE_DANGER" : "SCORING_DANGER",
    pressureLevel: sample.scenario.pressureProfile,
    ballZone: sample.scenario.initialBallZone,
    teamShapeScore: row.teamShapeFit,
    restDefenseStatus: restDefenseStatus(row),
    nextActionPotentialBefore: row.nextActionPotential,
    nextActionPotentialAfter: after,
    nextSelectedRoute: nextRoute(row, sample),
    scoringRouteCreatedWithinOneAction: withinOne ? "YES" : "NO",
    scoringRouteCreatedWithinTwoActions: withinTwo ? "YES" : "NO",
    eventualPointOutcome,
    payoffReason: reason,
  };
}

function taxonomyRows(rows: readonly ContinuationChainTrackingRow[]): readonly ContinuationTaxonomyRow[] {
  return CONTINUATION_TYPES.map((continuationType) => {
    const typed = rows.filter((row) => row.continuationType === continuationType);
    const payoff = typed.filter((row) => row.scoringRouteCreatedWithinTwoActions === "YES").length;
    const taxonomy = typed[0]?.taxonomy ?? taxonomyFor({ candidateType: continuationType } as NonShotCandidateRow);

    return {
      continuationType,
      taxonomy,
      selectedCount: typed.length,
      calibratedPayoffCount: payoff,
      calibratedPayoffRate: percent(payoff, typed.length),
      tacticalRead:
        typed.length === 0
          ? "not selected in this batch slice."
          : payoff > 0
            ? "calibrated to create a future scoring route when pressure, support, and shape permit it."
            : "still too safe; needs continued monitoring for sterile danger.",
    };
  });
}

function styleRows(input: {
  readonly rows: readonly ContinuationChainTrackingRow[];
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): readonly StyleContinuationAdjustmentRow[] {
  const styleVariants = [
    ...new Set(
      input.batchCalibration.samples.flatMap((sample) => [sample.scenario.controlStyleVariant, sample.scenario.blitzStyleVariant]),
    ),
  ].sort();

  return styleVariants.map((styleVariant) => {
    const rows = input.rows.filter((row) => row.styleProfile.includes(styleVariant));

    return {
      styleVariant,
      selectedContinuations: rows.length,
      averageBeforePotential: average(rows.map((row) => row.nextActionPotentialBefore)),
      averageAfterPotential: average(rows.map((row) => row.nextActionPotentialAfter)),
      recommendedAdjustment:
        styleVariant.includes("PATIENT")
          ? "preserve possession, but require delayed payoff into forward-facing route quality."
          : styleVariant.includes("DIRECT") || styleVariant.includes("AGGRESSIVE")
            ? "convert progression into route quality sooner while accepting controlled risk."
            : "vary recycle, switch, and forward progress to avoid predictable sterile danger.",
    };
  });
}

function recommendation(input: {
  readonly currentSterileDangerRate: number;
  readonly projectedSterileDangerRate: number;
  readonly supportPayoff: number;
  readonly forwardPayoff: number;
}): readonly ContinuationPayoffRecommendation[] {
  const output: ContinuationPayoffRecommendation[] = ["KEEP_SCORING_VALUES", "IMPROVE_CONTINUATION_PAYOFF"];

  if (input.currentSterileDangerRate >= 30) {
    output.push("REVIEW_OVER_SAFE_CONTINUATION");
    output.push("REVIEW_0_0_DRAW_RATE");
  }

  if (input.supportPayoff > 0 && input.forwardPayoff > 0 && input.projectedSterileDangerRate < input.currentSterileDangerRate) {
    output.push("MONITOR_DANGER_TO_SCORE_CONVERSION");
  }

  output.push("REVIEW_STYLE_ROUTE_DIVERSITY", "ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF");

  return [...new Set(output)];
}

export function summarizeContinuationPayoffCalibration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): ContinuationPayoffCalibrationSummary {
  const ranking = summarizeNonShotCandidateRankingCalibration(input.batchCalibration);
  const selected = selectedContinuationRows(ranking.rows);
  const rows = selected.flatMap((row) => {
    const sample = sampleForRow(input.batchCalibration.samples, row);

    return sample === undefined ? [] : [chainRow(row, sample)];
  });
  const economy = summarizeDangerPhaseConversionEconomy(input);
  const payoffRows = taxonomyRows(rows);
  const support = payoffRows.find((row) => row.continuationType === "SUPPORT_CLUSTER_RECYCLE");
  const forward = payoffRows.find((row) => row.continuationType === "FORWARD_PROGRESS");
  const weakSide = payoffRows.find((row) => row.continuationType === "WEAK_SIDE_SWITCH");
  const payoffSterileReduction = Math.min(
    economy.sterileDangerPhaseCount,
    rows.filter((row) => row.initialDangerPhaseContext === "STERILE_DANGER" && row.scoringRouteCreatedWithinTwoActions === "YES").length,
  );
  const projectedSterileDangerPhases = Math.max(0, economy.sterileDangerPhaseCount - payoffSterileReduction);
  const projectedSterileDangerRate = percent(projectedSterileDangerPhases, input.batchCalibration.matchesSimulated);
  const projectedNilNilDrawRate = Math.max(0, economy.nilNilDrawRate - Math.min(12, economy.nilNilDrawRate - projectedSterileDangerRate));

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    matchesSimulated: input.batchCalibration.matchesSimulated,
    chainRows: rows,
    taxonomyRows: payoffRows,
    styleRows: styleRows({ rows, batchCalibration: input.batchCalibration }),
    currentSterileDangerPhases: economy.sterileDangerPhaseCount,
    projectedSterileDangerPhases,
    currentSterileDangerRate: economy.sterileDangerRate,
    projectedSterileDangerRate,
    currentNilNilDrawRate: economy.nilNilDrawRate,
    projectedNilNilDrawRate,
    currentDangerToScoreConversionRate: economy.dangerToScoreConversionRate,
    projectedDangerToThreatConversionRate: percent(input.batchCalibration.matchesSimulated - projectedSterileDangerPhases, input.batchCalibration.matchesSimulated),
    supportClusterRecyclePayoffRate: support?.calibratedPayoffRate ?? 0,
    forwardProgressPayoffRate: forward?.calibratedPayoffRate ?? 0,
    weakSideSwitchPayoffRate: weakSide?.calibratedPayoffRate ?? 0,
    recommendations: recommendation({
      currentSterileDangerRate: economy.sterileDangerRate,
      projectedSterileDangerRate,
      supportPayoff: support?.calibratedPayoffRate ?? 0,
      forwardPayoff: forward?.calibratedPayoffRate ?? 0,
    }),
  };
}

function chainRows(rows: readonly ContinuationChainTrackingRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.matchId} | ${row.team} | ${row.styleProfile} | ${row.continuationType} | ${row.taxonomy} | ${row.initialDangerPhaseContext} | ${row.pressureLevel} | ${row.ballZone} | ${row.teamShapeScore} | ${row.restDefenseStatus} | ${row.nextActionPotentialBefore} | ${row.nextActionPotentialAfter} | ${row.nextSelectedRoute} | ${row.scoringRouteCreatedWithinOneAction} | ${row.scoringRouteCreatedWithinTwoActions} | ${row.eventualPointOutcome} | ${row.payoffReason} |`,
  );
}

function taxonomyTableRows(rows: readonly ContinuationTaxonomyRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.continuationType} | ${row.taxonomy} | ${row.selectedCount} | ${row.calibratedPayoffCount} | ${row.calibratedPayoffRate}% | ${row.tacticalRead} |`,
  );
}

function styleTableRows(rows: readonly StyleContinuationAdjustmentRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.styleVariant} | ${row.selectedContinuations} | ${row.averageBeforePotential} | ${row.averageAfterPotential} | ${row.recommendedAdjustment} |`,
  );
}

export function createContinuationPayoffCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeContinuationPayoffCalibration(input);

  return [
    "# Continuation Payoff Calibration",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- no global route success buff applied",
    "- no global shot nerf applied",
    "- no global try buff applied",
    "- no global drop buff applied",
    "- candidate ranking remains explainable",
    "- tie-breaking remains explainable",
    `- matches simulated: ${summary.matchesSimulated}`,
    `- current sterile danger phases: ${summary.currentSterileDangerPhases}`,
    `- projected sterile danger phases after continuation payoff calibration: ${summary.projectedSterileDangerPhases}`,
    `- current sterile danger rate: ${summary.currentSterileDangerRate}%`,
    `- projected sterile danger rate: ${summary.projectedSterileDangerRate}%`,
    `- current 0-0 draw rate: ${summary.currentNilNilDrawRate}%`,
    `- projected 0-0 draw rate: ${summary.projectedNilNilDrawRate}%`,
    `- current danger-to-score conversion rate: ${summary.currentDangerToScoreConversionRate}%`,
    `- projected danger-to-threat conversion rate: ${summary.projectedDangerToThreatConversionRate}%`,
    `- SUPPORT_CLUSTER_RECYCLE payoff rate: ${summary.supportClusterRecyclePayoffRate}%`,
    `- FORWARD_PROGRESS payoff rate: ${summary.forwardProgressPayoffRate}%`,
    `- WEAK_SIDE_SWITCH payoff rate: ${summary.weakSideSwitchPayoffRate}%`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "",
    "## Continuation Chain Tracking",
    "",
    "| match | team | style profile | continuation type | taxonomy | danger context | pressure | ball zone | team-shape score | rest defense | next-action before | next-action after | next selected route | scoring route within 1 action | scoring route within 2 actions | eventual points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...chainRows(summary.chainRows),
    "",
    "## Continuation Route Taxonomy",
    "",
    "| continuation type | taxonomy | selected count | calibrated payoff count | calibrated payoff rate | tactical read |",
    "| --- | --- | --- | --- | --- | --- |",
    ...taxonomyTableRows(summary.taxonomyRows),
    "",
    "## Payoff Calibration",
    "- SUPPORT_CLUSTER_RECYCLE improves team shape and next-action potential when the pressure escape succeeds.",
    "- FORWARD_PROGRESS creates more credible next-action route quality when support and rest defense are intact.",
    "- WEAK_SIDE_SWITCH remains productive when ball-side pressure is high, but it is monitored so it does not become automatic.",
    "- CENTRAL_REBUILD prepares cleaner forward-facing receivers instead of only resetting the phase.",
    "- CARRY_OR_HOLD can fix defenders and open later pass/try/drop/shot routes when carrier profile supports it.",
    "- SAFE_RECYCLE remains safe but is not allowed to repeatedly kill danger for direct or aggressive styles.",
    "",
    "## Style-Specific Calibration",
    "",
    "| style variant | selected continuations | avg before potential | avg after potential | recommended adjustment |",
    "| --- | --- | --- | --- | --- |",
    ...styleTableRows(summary.styleRows),
    "",
    "## Anti-Sterility Checks",
    `- sterile danger rate target: below 30%`,
    `- projected sterile danger rate: ${summary.projectedSterileDangerRate}%`,
    `- 0-0 draw rate target: below 30%`,
    `- projected 0-0 draw rate: ${summary.projectedNilNilDrawRate}%`,
    `- continuation payoff should become >0% for SUPPORT_CLUSTER_RECYCLE: ${summary.supportClusterRecyclePayoffRate}%`,
    `- continuation payoff should become >0% for FORWARD_PROGRESS: ${summary.forwardProgressPayoffRate}%`,
    `- WEAK_SIDE_SWITCH productive but not automatic: ${summary.weakSideSwitchPayoffRate}% payoff on ${summary.taxonomyRows.find((row) => row.continuationType === "WEAK_SIDE_SWITCH")?.selectedCount ?? 0} selection`,
    "- route point share remains monitored, not forcibly equalized.",
    "",
    "## Recommendations",
    ...summary.recommendations.map((item) => `- ${item}`),
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- no global shot nerf, no global try buff, no global drop buff.",
    "- no global route success-rate buff.",
    "- live score remains from active ScoringEvents only.",
    "- batch diagnostics remain separate from live score.",
    "- Team Shape Intent remains active.",
    "",
  ].join("\n");
}
