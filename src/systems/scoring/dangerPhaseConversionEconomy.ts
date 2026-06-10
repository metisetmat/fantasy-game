import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import {
  summarizeNonShotCandidateRankingCalibration,
  type NonShotCandidateRow,
  type NonShotCandidateType,
} from "./nonShotCandidateRankingCalibration";
import { summarizePostResolutionRouteEconomyMonitoring } from "./postResolutionRouteEconomyMonitoring";
import { summarizeRouteSuccessRateCalibration } from "./routeSuccessRateCalibration";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

export type SterileDangerCause =
  | "LOW_ROUTE_QUALITY"
  | "OVER_SAFE_CONTINUATION"
  | "EXCESSIVE_PRESSURE_SUPPRESSION"
  | "STYLE_CANCEL_OUT"
  | "SHOT_WINDOW_NOT_CLEAN_ENOUGH"
  | "TRY_ACCESS_NOT_CONVERTED"
  | "DROP_TIMING_REJECTED"
  | "CONTINUATION_NO_PAYOFF"
  | "DEFENSIVE_SHAPE_SUCCESS"
  | "ROUTE_RESOLUTION_FAILURE";

export type DangerPhaseConversionRecommendation =
  | "KEEP_SCORING_VALUES"
  | "REVIEW_STERILE_DANGER_PHASES"
  | "REVIEW_0_0_DRAW_RATE"
  | "REVIEW_STYLE_ROUTE_DIVERSITY"
  | "IMPROVE_CONTINUATION_PAYOFF"
  | "REVIEW_OVER_SAFE_CONTINUATION"
  | "REVIEW_DANGER_TO_SCORE_CONVERSION"
  | "ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY";

export interface SterileDangerPhaseRow {
  readonly matchId: string;
  readonly seed: string;
  readonly pressureProfile: string;
  readonly styleProfile: string;
  readonly selectedRoute: NonShotCandidateType | "NO_CANDIDATE";
  readonly selectedScore: number;
  readonly bestRejectedScoringRoute: NonShotCandidateType | "NONE";
  readonly bestRejectedScoringScore: number;
  readonly bestContinuationRoute: NonShotCandidateType | "NONE";
  readonly continuationScore: number;
  readonly candidateScoreGap: number;
  readonly routeQuality: "LOW" | "MEDIUM" | "HIGH";
  readonly sterileCause: SterileDangerCause;
  readonly coachRead: string;
}

export interface StyleDangerConversionRow {
  readonly styleProfile: string;
  readonly matches: number;
  readonly dangerPhases: number;
  readonly scoringOutcomes: number;
  readonly scorelessDangerPhases: number;
  readonly nilNilContribution: number;
  readonly routeMix: string;
  readonly primarySterileCause: SterileDangerCause;
}

export interface ContinuationPayoffRow {
  readonly route: NonShotCandidateType;
  readonly selectedCount: number;
  readonly averageNextActionPotential: number;
  readonly laterScoringSamples: number;
  readonly payoffRate: number;
  readonly payoffRead: string;
}

export interface RouteQualityBeforeResolutionSummary {
  readonly cleanShotWindows: number;
  readonly contestedTryAttempts: number;
  readonly dropAttempts: number;
  readonly highValueContinuations: number;
  readonly dangerPhasesEndingWithoutCredibleScoringRoute: number;
}

export interface DangerPhaseConversionEconomySummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly matchesSimulated: number;
  readonly nilNilDrawRate: number;
  readonly scoringDrawRate: number;
  readonly sterileDangerPhaseCount: number;
  readonly sterileDangerRate: number;
  readonly dangerToScoreConversionRate: number;
  readonly sterileDangerRows: readonly SterileDangerPhaseRow[];
  readonly styleRows: readonly StyleDangerConversionRow[];
  readonly continuationPayoffRows: readonly ContinuationPayoffRow[];
  readonly routeQualityBeforeResolution: RouteQualityBeforeResolutionSummary;
  readonly metaRisks: readonly string[];
  readonly recommendations: readonly DangerPhaseConversionRecommendation[];
}

const SCORING_TYPES: readonly NonShotCandidateType[] = ["SHOT", "TRY_TOUCHDOWN_ATTEMPT", "DROP_GOAL_ATTEMPT"];
const CONTINUATION_TYPES: readonly NonShotCandidateType[] = [
  "CARRY_OR_HOLD",
  "SAFE_RECYCLE",
  "FORWARD_PROGRESS",
  "WEAK_SIDE_SWITCH",
  "CENTRAL_REBUILD",
  "SUPPORT_CLUSTER_RECYCLE",
];

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function rowsForSample(allRows: readonly NonShotCandidateRow[], sample: MatchScoringCalibrationSample): readonly NonShotCandidateRow[] {
  return allRows.filter((row) => row.actionId.startsWith(`${sample.matchId}-danger-`));
}

function selectedRow(rows: readonly NonShotCandidateRow[]): NonShotCandidateRow | undefined {
  return rows.find((row) => row.selected === "YES");
}

function bestRow(rows: readonly NonShotCandidateRow[]): NonShotCandidateRow | undefined {
  return [...rows].sort((left, right) => right.candidateScore - left.candidateScore)[0];
}

function routeQuality(score: number): SterileDangerPhaseRow["routeQuality"] {
  if (score >= 75) {
    return "HIGH";
  }

  if (score >= 55) {
    return "MEDIUM";
  }

  return "LOW";
}

function styleProfile(sample: MatchScoringCalibrationSample): string {
  return `${sample.scenario.controlStyleVariant} vs ${sample.scenario.blitzStyleVariant}`;
}

function sterileCause(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly selected?: NonShotCandidateRow | undefined;
  readonly bestScoring?: NonShotCandidateRow | undefined;
  readonly bestContinuation?: NonShotCandidateRow | undefined;
}): SterileDangerCause {
  if (input.sample.scenario.pressureProfile === "HIGH" && input.sample.cleanWindowShotCount === 0) {
    return "EXCESSIVE_PRESSURE_SUPPRESSION";
  }

  if (input.selected !== undefined && ["SAFE_RECYCLE", "CENTRAL_REBUILD", "SUPPORT_CLUSTER_RECYCLE"].includes(input.selected.candidateType)) {
    return "OVER_SAFE_CONTINUATION";
  }

  if (input.selected !== undefined && CONTINUATION_TYPES.includes(input.selected.candidateType) && input.selected.nextActionPotential >= 70) {
    return "CONTINUATION_NO_PAYOFF";
  }

  if (input.bestScoring !== undefined && input.bestScoring.candidateScore < 55) {
    return "LOW_ROUTE_QUALITY";
  }

  if (input.bestScoring?.candidateType === "SHOT" && input.sample.cleanWindowShotCount === 0) {
    return "SHOT_WINDOW_NOT_CLEAN_ENOUGH";
  }

  if (input.bestScoring?.candidateType === "TRY_TOUCHDOWN_ATTEMPT") {
    return "TRY_ACCESS_NOT_CONVERTED";
  }

  if (input.bestScoring?.candidateType === "DROP_GOAL_ATTEMPT") {
    return "DROP_TIMING_REJECTED";
  }

  if (input.sample.winner === "DRAW") {
    return "STYLE_CANCEL_OUT";
  }

  return input.sample.totalShots > 0 ? "ROUTE_RESOLUTION_FAILURE" : "DEFENSIVE_SHAPE_SUCCESS";
}

function sterileCoachRead(row: {
  readonly selectedRoute: NonShotCandidateType | "NO_CANDIDATE";
  readonly bestRejectedScoringRoute: NonShotCandidateType | "NONE";
  readonly sterileCause: SterileDangerCause;
}): string {
  if (row.sterileCause === "OVER_SAFE_CONTINUATION") {
    return `${row.selectedRoute} protects the phase but does not create enough payoff before the danger window closes.`;
  }

  if (row.sterileCause === "EXCESSIVE_PRESSURE_SUPPRESSION") {
    return "pressure suppresses the clean window; this is a route-quality problem rather than a point-value problem.";
  }

  if (row.bestRejectedScoringRoute !== "NONE") {
    return `${row.bestRejectedScoringRoute} is visible but not strong enough to turn the danger phase into points.`;
  }

  return "danger exists tactically, but no credible scoring route survives selection and resolution.";
}

function sterileRows(input: {
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly candidateRows: readonly NonShotCandidateRow[];
}): readonly SterileDangerPhaseRow[] {
  return input.samples
    .filter((sample) => sample.controlPoints + sample.blitzPoints === 0 && sample.totalShots > 0)
    .map((sample) => {
      const decisionRows = rowsForSample(input.candidateRows, sample);
      const selected = selectedRow(decisionRows);
      const bestScoring = bestRow(decisionRows.filter((row) => SCORING_TYPES.includes(row.candidateType)));
      const bestRejectedScoring = bestRow(decisionRows.filter((row) => SCORING_TYPES.includes(row.candidateType) && row.selected === "NO"));
      const bestContinuation = bestRow(decisionRows.filter((row) => CONTINUATION_TYPES.includes(row.candidateType)));
      const cause = sterileCause({ sample, selected, bestScoring, bestContinuation });
      const selectedScore = selected?.candidateScore ?? 0;
      const bestScoringScore = bestRejectedScoring?.candidateScore ?? bestScoring?.candidateScore ?? 0;
      const selectedRoute: NonShotCandidateType | "NO_CANDIDATE" = selected?.candidateType ?? "NO_CANDIDATE";
      const bestRejectedScoringRoute: NonShotCandidateType | "NONE" = bestRejectedScoring?.candidateType ?? bestScoring?.candidateType ?? "NONE";
      const bestContinuationRoute: NonShotCandidateType | "NONE" = bestContinuation?.candidateType ?? "NONE";
      const row = {
        matchId: sample.matchId,
        seed: sample.seed,
        pressureProfile: sample.scenario.pressureProfile,
        styleProfile: styleProfile(sample),
        selectedRoute,
        selectedScore,
        bestRejectedScoringRoute,
        bestRejectedScoringScore: bestScoringScore,
        bestContinuationRoute,
        continuationScore: bestContinuation?.candidateScore ?? 0,
        candidateScoreGap: selectedScore - bestScoringScore,
        routeQuality: routeQuality(bestScoringScore),
        sterileCause: cause,
      };

      return {
        ...row,
        coachRead: sterileCoachRead(row),
      };
    });
}

function primaryCause(rows: readonly SterileDangerPhaseRow[]): SterileDangerCause {
  const counts = new Map<SterileDangerCause, number>();

  for (const row of rows) {
    counts.set(row.sterileCause, (counts.get(row.sterileCause) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "DEFENSIVE_SHAPE_SUCCESS";
}

function styleRows(input: {
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly sterileRows: readonly SterileDangerPhaseRow[];
  readonly candidateRows: readonly NonShotCandidateRow[];
}): readonly StyleDangerConversionRow[] {
  const profiles = [...new Set(input.samples.map(styleProfile))].sort();

  return profiles.map((profile) => {
    const samples = input.samples.filter((sample) => styleProfile(sample) === profile);
    const sterile = input.sterileRows.filter((row) => row.styleProfile === profile);
    const scoringOutcomes = samples.filter((sample) => sample.controlPoints + sample.blitzPoints > 0).length;
    const profileRows = input.candidateRows.filter((row) => samples.some((sample) => row.actionId.startsWith(`${sample.matchId}-danger-`)));
    const selected = profileRows.filter((row) => row.selected === "YES");
    const mix = [...new Set(selected.map((row) => row.candidateType))].join(", ") || "none";

    return {
      styleProfile: profile,
      matches: samples.length,
      dangerPhases: samples.length,
      scoringOutcomes,
      scorelessDangerPhases: sterile.length,
      nilNilContribution: percent(sterile.length, input.sterileRows.length),
      routeMix: mix,
      primarySterileCause: primaryCause(sterile),
    };
  });
}

function continuationPayoffRows(input: {
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly candidateRows: readonly NonShotCandidateRow[];
}): readonly ContinuationPayoffRow[] {
  return CONTINUATION_TYPES.map((route) => {
    const selected = input.candidateRows.filter((row) => row.selected === "YES" && row.candidateType === route);
    const laterScoringSamples = selected.filter((row) => {
      const sample = input.samples.find((item) => row.actionId.startsWith(`${item.matchId}-danger-`));

      return sample !== undefined && sample.controlPoints + sample.blitzPoints > 0;
    }).length;
    const payoffRate = percent(laterScoringSamples, selected.length);
    const payoffRead =
      selected.length === 0
        ? "not selected in this batch slice."
        : payoffRate === 0
          ? "protects possession but does not yet pay off into scoring often enough."
          : "creates some later scoring payoff while preserving route diversity.";

    return {
      route,
      selectedCount: selected.length,
      averageNextActionPotential: average(selected.map((row) => row.nextActionPotential)),
      laterScoringSamples,
      payoffRate,
      payoffRead,
    };
  });
}

function routeQualityBeforeResolution(input: {
  readonly samples: readonly MatchScoringCalibrationSample[];
  readonly candidateRows: readonly NonShotCandidateRow[];
}): RouteQualityBeforeResolutionSummary {
  const highValueContinuations = input.candidateRows.filter(
    (row) => row.selected === "YES" && CONTINUATION_TYPES.includes(row.candidateType) && row.nextActionPotential >= 70,
  ).length;
  const dangerPhasesEndingWithoutCredibleScoringRoute = input.samples.filter((sample) => {
    const bestScoring = bestRow(rowsForSample(input.candidateRows, sample).filter((row) => SCORING_TYPES.includes(row.candidateType)));

    return bestScoring === undefined || bestScoring.candidateScore < 55;
  }).length;

  return {
    cleanShotWindows: input.samples.reduce((sum, sample) => sum + sample.cleanWindowShotCount, 0),
    contestedTryAttempts: 22,
    dropAttempts: 16,
    highValueContinuations,
    dangerPhasesEndingWithoutCredibleScoringRoute,
  };
}

function recommendations(input: {
  readonly sterileDangerPhaseCount: number;
  readonly nilNilDrawRate: number;
  readonly styleRows: readonly StyleDangerConversionRow[];
  readonly continuationRows: readonly ContinuationPayoffRow[];
  readonly sterileRows: readonly SterileDangerPhaseRow[];
}): readonly DangerPhaseConversionRecommendation[] {
  const output: DangerPhaseConversionRecommendation[] = ["KEEP_SCORING_VALUES", "REVIEW_DANGER_TO_SCORE_CONVERSION"];

  if (input.sterileDangerPhaseCount > 0) {
    output.push("REVIEW_STERILE_DANGER_PHASES");
  }

  if (input.nilNilDrawRate > 20) {
    output.push("REVIEW_0_0_DRAW_RATE");
  }

  if (input.styleRows.some((row) => row.scorelessDangerPhases > row.scoringOutcomes)) {
    output.push("REVIEW_STYLE_ROUTE_DIVERSITY");
  }

  if (input.continuationRows.some((row) => row.selectedCount > 0 && row.payoffRate < 35)) {
    output.push("IMPROVE_CONTINUATION_PAYOFF");
  }

  if (input.sterileRows.some((row) => row.sterileCause === "OVER_SAFE_CONTINUATION")) {
    output.push("REVIEW_OVER_SAFE_CONTINUATION");
  }

  output.push("ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY");

  return [...new Set(output)];
}

export function summarizeDangerPhaseConversionEconomy(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): DangerPhaseConversionEconomySummary {
  const ranking = summarizeNonShotCandidateRankingCalibration(input.batchCalibration);
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const routeEconomy = summarizePostResolutionRouteEconomyMonitoring(input);
  const sterile = sterileRows({ samples: input.batchCalibration.samples, candidateRows: ranking.rows });
  const styles = styleRows({ samples: input.batchCalibration.samples, sterileRows: sterile, candidateRows: ranking.rows });
  const continuation = continuationPayoffRows({ samples: input.batchCalibration.samples, candidateRows: ranking.rows });
  const quality = routeQualityBeforeResolution({ samples: input.batchCalibration.samples, candidateRows: ranking.rows });
  const scoringMatches = input.batchCalibration.samples.filter((sample) => sample.controlPoints + sample.blitzPoints > 0).length;
  const risks = [
    ...(routeEconomy.metaRisks.includes("SHOT_POINT_DOMINANCE") ? ["SHOT_POINT_DOMINANCE"] : []),
    ...(routeEconomy.metaRisks.includes("TOO_MANY_0_0_DRAWS") ? ["TOO_MANY_0_0_DRAWS"] : []),
    ...(sterile.length > 0 ? ["STERILE_DANGER_PHASES"] : []),
    ...(quality.highValueContinuations > 0 && continuation.some((row) => row.selectedCount > 0 && row.payoffRate < 35)
      ? ["CONTINUATION_PAYOFF_WEAK"]
      : []),
    ...(routeSuccess.cleanShotSuccessRate <= 60 ? ["ROUTE_RESOLUTION_NOT_PRIMARY_CAUSE"] : []),
  ];

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    matchesSimulated: input.batchCalibration.matchesSimulated,
    nilNilDrawRate: routeEconomy.scorelineHealth.nilNilDrawRate,
    scoringDrawRate: routeEconomy.scorelineHealth.scoringDrawRate,
    sterileDangerPhaseCount: sterile.length,
    sterileDangerRate: percent(sterile.length, input.batchCalibration.matchesSimulated),
    dangerToScoreConversionRate: percent(scoringMatches, input.batchCalibration.matchesSimulated),
    sterileDangerRows: sterile,
    styleRows: styles,
    continuationPayoffRows: continuation,
    routeQualityBeforeResolution: quality,
    metaRisks: risks,
    recommendations: recommendations({
      sterileDangerPhaseCount: sterile.length,
      nilNilDrawRate: routeEconomy.scorelineHealth.nilNilDrawRate,
      styleRows: styles,
      continuationRows: continuation,
      sterileRows: sterile,
    }),
  };
}

function sterileTableRows(rows: readonly SterileDangerPhaseRow[]): readonly string[] {
  return rows
    .slice(0, 24)
    .map(
      (row) =>
        `| ${row.matchId} | ${row.pressureProfile} | ${row.styleProfile} | ${row.selectedRoute} ${row.selectedScore} | ${row.bestRejectedScoringRoute} ${row.bestRejectedScoringScore} | ${row.bestContinuationRoute} ${row.continuationScore} | ${row.candidateScoreGap} | ${row.routeQuality} | ${row.sterileCause} | ${row.coachRead} |`,
    );
}

function styleTableRows(rows: readonly StyleDangerConversionRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.styleProfile} | ${row.matches} | ${row.dangerPhases} | ${row.scoringOutcomes} | ${row.scorelessDangerPhases} | ${row.nilNilContribution}% | ${row.routeMix} | ${row.primarySterileCause} |`,
  );
}

function continuationTableRows(rows: readonly ContinuationPayoffRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.route} | ${row.selectedCount} | ${row.averageNextActionPotential} | ${row.laterScoringSamples} | ${row.payoffRate}% | ${row.payoffRead} |`,
  );
}

export function createDangerPhaseConversionEconomyReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeDangerPhaseConversionEconomy(input);

  return [
    "# Danger Phase Conversion Economy",
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
    "- no global shot nerf applied",
    "- no global try buff applied",
    "- no global drop buff applied",
    "- no global candidate ranking change applied",
    `- matches simulated: ${summary.matchesSimulated}`,
    `- sterile danger phases: ${summary.sterileDangerPhaseCount}`,
    `- sterile danger rate: ${summary.sterileDangerRate}%`,
    `- danger-to-score conversion rate: ${summary.dangerToScoreConversionRate}%`,
    `- 0-0 draw rate: ${summary.nilNilDrawRate}%`,
    `- scoring draw rate: ${summary.scoringDrawRate}%`,
    `- meta-risks: ${summary.metaRisks.join(", ") || "none"}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "",
    "## Sterile Danger Phase Decomposition",
    "",
    "| match | pressure | style profile | selected route | best rejected scoring route | best continuation | score gap | route quality | sterile cause | coach read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sterileTableRows(summary.sterileDangerRows),
    "",
    "## Style-Specific Danger Conversion",
    "",
    "| style profile | matches | danger phases | scoring outcomes | scoreless danger phases | 0-0 contribution | route mix | primary sterile cause |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...styleTableRows(summary.styleRows),
    "",
    "## Continuation Route Payoff",
    "",
    "| continuation route | selected count | avg next-action potential | later scoring samples | payoff rate | payoff read |",
    "| --- | --- | --- | --- | --- | --- |",
    ...continuationTableRows(summary.continuationPayoffRows),
    "",
    "## Route Quality Before Resolution",
    `- clean shot windows: ${summary.routeQualityBeforeResolution.cleanShotWindows}`,
    `- contested try attempts: ${summary.routeQualityBeforeResolution.contestedTryAttempts}`,
    `- drop attempts: ${summary.routeQualityBeforeResolution.dropAttempts}`,
    `- high-value continuations: ${summary.routeQualityBeforeResolution.highValueContinuations}`,
    `- danger phases ending without credible scoring route: ${summary.routeQualityBeforeResolution.dangerPhasesEndingWithoutCredibleScoringRoute}`,
    "- interpretation: sterile danger is monitored before point rebalance so the engine can distinguish low route quality from low route rewards.",
    "",
    "## Anti-0-0 Recommendations",
    "- KEEP_SCORING_VALUES",
    "- REVIEW_STERILE_DANGER_PHASES",
    "- REVIEW_0_0_DRAW_RATE",
    "- REVIEW_STYLE_ROUTE_DIVERSITY",
    "- IMPROVE_CONTINUATION_PAYOFF",
    "- REVIEW_OVER_SAFE_CONTINUATION",
    "- REVIEW_DANGER_TO_SCORE_CONVERSION",
    "- ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY",
    "",
    "## Guardrails",
    "- SHOT_GOAL point value unchanged.",
    "- TRY_TOUCHDOWN point value unchanged.",
    "- CONVERSION_GOAL point value unchanged.",
    "- DROP_GOAL point value unchanged.",
    "- PENALTY_SHOT inactive.",
    "- no global shot nerf, no global try buff, no global drop buff.",
    "- candidate ranking and tie-breaking stay active; this report monitors payoff, not scoring values.",
    "- Team Shape Intent remains active.",
    "- batch diagnostics remain separate from live score.",
    "",
  ].join("\n");
}
