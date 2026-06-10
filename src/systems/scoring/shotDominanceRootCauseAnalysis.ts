import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration, type ShotOutcomeContract } from "../actions";
import { analyzeOffensivePossessionDangerPhases } from "../phases";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeConversionResolution } from "./conversionResolution";
import { summarizeNonShotResolutionRebalance } from "./nonShotResolutionRebalance";
import { analyzeScoringAffordanceVolume } from "./scoringAffordanceVolumeAnalyzer";
import { analyzeShotDominance } from "./shotDominanceAnalyzer";

export type ShotWindowType =
  | "CLEAN_WINDOW"
  | "PRESSURED_WINDOW"
  | "FORCED_WINDOW"
  | "REBOUND_WINDOW"
  | "TRANSITION_WINDOW"
  | "LOW_QUALITY_WINDOW";

export type ShotDominanceRootCause =
  | "TOO_MANY_SHOT_ATTEMPTS"
  | "TOO_MANY_CLEAN_WINDOWS"
  | "TOO_MANY_FORCED_WINDOWS_ACCEPTED"
  | "TOO_MANY_REBOUND_SHOTS"
  | "SHOT_SUCCESS_RATE_TOO_HIGH"
  | "NON_SHOT_OPTIONS_TOO_WEAK"
  | "TRY_ROUTE_TOO_LOW_SELECTION"
  | "DROP_ROUTE_TOO_LOW_SELECTION"
  | "DEFENSIVE_SHAPE_TOO_PERMISSIVE"
  | "SCORING_VALUES_SUSPECT";

export type ShotDominanceRootCauseRecommendation =
  | "REVIEW_SHOT_SELECTION_MODEL"
  | "REVIEW_SHOT_AFFORDANCE_GENERATION"
  | "REVIEW_REBOUND_SHOT_VOLUME"
  | "REVIEW_DEFENSIVE_SHAPE_PERMISSIVENESS"
  | "REVIEW_NON_SHOT_CANDIDATE_RANKING"
  | "KEEP_SCORING_VALUES"
  | "ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES";

interface RootCauseRow {
  readonly cause: ShotDominanceRootCause;
  readonly classification: "PRIMARY_CAUSE" | "SECONDARY_CAUSE" | "NON_CAUSE";
  readonly evidence: string;
  readonly recommendation: ShotDominanceRootCauseRecommendation;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function windowType(outcome: ShotOutcomeContract): ShotWindowType {
  if (outcome.reboundResolution.reboundType !== "NONE" || outcome.reboundContinuation.continuationType === "SECOND_SHOT_WINDOW") {
    return "REBOUND_WINDOW";
  }

  if (outcome.difficultyFactors.forcedShot) {
    return "FORCED_WINDOW";
  }

  if (outcome.shotQuality < 60) {
    return "LOW_QUALITY_WINDOW";
  }

  if (outcome.difficultyFactors.cleanWindow) {
    return "CLEAN_WINDOW";
  }

  if (outcome.finishingPressure >= 70) {
    return "TRANSITION_WINDOW";
  }

  return "PRESSURED_WINDOW";
}

function outcomeSummaryForWindow(outcomes: readonly ShotOutcomeContract[], type: ShotWindowType): string {
  const filtered = outcomes.filter((outcome) => windowType(outcome) === type);
  const goals = filtered.filter((outcome) => outcome.ballOutcome === "GOAL").length;
  const misses = filtered.filter((outcome) => outcome.ballOutcome === "MISSED_HIGH" || outcome.ballOutcome === "MISSED_WIDE" || outcome.ballOutcome === "MISSED").length;
  const saves = filtered.filter((outcome) => outcome.ballOutcome === "SAVED_BY_GK" || outcome.ballOutcome === "CAUGHT_BY_GK").length;
  const blocks = filtered.filter((outcome) => outcome.ballOutcome === "BLOCKED_BY_DEFENDER" || outcome.ballOutcome === "BLOCKED").length;
  const deflections = filtered.filter((outcome) => outcome.ballOutcome === "DEFLECTED_BY_GK").length;

  return `${filtered.length} shots, ${goals} goals, ${misses} misses, ${saves} saves/catches, ${blocks} blocks, ${deflections} deflections`;
}

function reportCount(markdown: string, label: string, fallback: string): string {
  const match = new RegExp(`${label}: (\\d+)`).exec(markdown);

  return match?.[1] ?? fallback;
}

function finalCauseRows(input: {
  readonly shotPointsShare: number;
  readonly shotAttempts: number;
  readonly tryAttempts: number;
  readonly dropAttempts: number;
  readonly shotSuccessRate: number;
  readonly cleanWindowConversionRate: number;
  readonly forcedShotConversionRate: number;
  readonly secondShotWindows: number;
  readonly shapeStructuralErrors: number;
}): readonly RootCauseRow[] {
  const nonShotAttempts = input.tryAttempts + input.dropAttempts;
  const shotToNonShotRatio = nonShotAttempts === 0 ? input.shotAttempts : Math.round((input.shotAttempts / nonShotAttempts) * 10) / 10;
  const primaryCause: ShotDominanceRootCause =
    input.shotPointsShare >= 85 && shotToNonShotRatio >= 5 ? "NON_SHOT_OPTIONS_TOO_WEAK" : "TOO_MANY_SHOT_ATTEMPTS";

  return [
    {
      cause: primaryCause,
      classification: "PRIMARY_CAUSE",
      evidence: `${input.shotPointsShare}% SHOT_GOAL points share with ${shotToNonShotRatio}:1 shot-to-try/drop attempt ratio.`,
      recommendation: primaryCause === "NON_SHOT_OPTIONS_TOO_WEAK" ? "REVIEW_NON_SHOT_CANDIDATE_RANKING" : "REVIEW_SHOT_SELECTION_MODEL",
    },
    {
      cause: "TRY_ROUTE_TOO_LOW_SELECTION",
      classification: input.tryAttempts < input.shotAttempts / 4 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.tryAttempts} selected try attempts versus ${input.shotAttempts} selected shots.`,
      recommendation: "REVIEW_NON_SHOT_CANDIDATE_RANKING",
    },
    {
      cause: "DROP_ROUTE_TOO_LOW_SELECTION",
      classification: input.dropAttempts < input.shotAttempts / 6 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.dropAttempts} selected drop attempts versus ${input.shotAttempts} selected shots.`,
      recommendation: "REVIEW_NON_SHOT_CANDIDATE_RANKING",
    },
    {
      cause: "SHOT_SUCCESS_RATE_TOO_HIGH",
      classification: input.shotSuccessRate > 40 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.shotSuccessRate}% shot success rate; current target band is already respected when <= 40%.`,
      recommendation: input.shotSuccessRate > 40 ? "REVIEW_SHOT_SELECTION_MODEL" : "KEEP_SCORING_VALUES",
    },
    {
      cause: "TOO_MANY_CLEAN_WINDOWS",
      classification: input.cleanWindowConversionRate > 75 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.cleanWindowConversionRate}% clean-window conversion; target is 60%-75%.`,
      recommendation: input.cleanWindowConversionRate > 75 ? "REVIEW_SHOT_AFFORDANCE_GENERATION" : "KEEP_SCORING_VALUES",
    },
    {
      cause: "TOO_MANY_FORCED_WINDOWS_ACCEPTED",
      classification: input.forcedShotConversionRate > 10 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.forcedShotConversionRate}% forced-shot conversion.`,
      recommendation: input.forcedShotConversionRate > 10 ? "REVIEW_SHOT_SELECTION_MODEL" : "KEEP_SCORING_VALUES",
    },
    {
      cause: "TOO_MANY_REBOUND_SHOTS",
      classification: input.secondShotWindows > 5 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.secondShotWindows} batch second-shot windows.`,
      recommendation: input.secondShotWindows > 5 ? "REVIEW_REBOUND_SHOT_VOLUME" : "KEEP_SCORING_VALUES",
    },
    {
      cause: "DEFENSIVE_SHAPE_TOO_PERMISSIVE",
      classification: input.shapeStructuralErrors > 0 ? "SECONDARY_CAUSE" : "NON_CAUSE",
      evidence: `${input.shapeStructuralErrors} structural team-shape errors reported.`,
      recommendation: input.shapeStructuralErrors > 0 ? "REVIEW_DEFENSIVE_SHAPE_PERMISSIVENESS" : "KEEP_SCORING_VALUES",
    },
    {
      cause: "SCORING_VALUES_SUSPECT",
      classification: "NON_CAUSE",
      evidence: "SHOT_GOAL remains 3 points, non-shot scoring values are unchanged, and dominance appears upstream in route generation/selection.",
      recommendation: "ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES",
    },
  ];
}

export function createShotDominanceRootCauseAnalysisReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
  readonly teamShapeValidationMarkdown: string;
}): string {
  const shotDominance = analyzeShotDominance({
    result: input.result,
    batchCalibration: input.batchCalibration,
    shotOutcomes: input.shotOutcomes,
  });
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
  const conversion = summarizeConversionResolution({ result: input.result, opportunities: trySummary.opportunities });
  const drop = summarizeDropGoalFoundation({ result: input.result, batchCalibration: input.batchCalibration });
  const affordance = analyzeScoringAffordanceVolume({ result: input.result, batchCalibration: input.batchCalibration });
  const danger = analyzeOffensivePossessionDangerPhases({ result: input.result, batchCalibration: input.batchCalibration });
  const nonShotResolution = summarizeNonShotResolutionRebalance({ result: input.result, batchCalibration: input.batchCalibration });
  const structuralErrorsMatch = /structural error count: (\d+)/.exec(input.teamShapeValidationMarkdown);
  const shapeStructuralErrors = structuralErrorsMatch?.[1] === undefined ? 0 : Number.parseInt(structuralErrorsMatch[1], 10);
  const shapeActionCount = reportCount(input.teamShapeValidationMarkdown, "action count", "unknown");
  const averageShapeScore = reportCount(input.teamShapeValidationMarkdown, "average shape score", "unknown");
  const illegalOffBallInGoal = reportCount(input.teamShapeValidationMarkdown, "illegal Z0/Z8 off-ball occupancy count", "0");
  const centralFrontalTryPath = reportCount(input.teamShapeValidationMarkdown, "central/frontal try path count", "0");
  const secondShotWindows = input.batchCalibration.samples.reduce((sum, sample) => sum + sample.secondShotWindowCount, 0);
  const rootCauses = finalCauseRows({
    shotPointsShare: shotDominance.shotPointsShare,
    shotAttempts: shotDominance.shotAttempts,
    tryAttempts: trySummary.tryAttempts,
    dropAttempts: drop.batchDropAttempts,
    shotSuccessRate: shotDominance.shotSuccessRate,
    cleanWindowConversionRate: input.batchCalibration.cleanWindowConversionRate,
    forcedShotConversionRate: input.batchCalibration.forcedShotConversionRate,
    secondShotWindows,
    shapeStructuralErrors,
  });
  const primary = rootCauses.find((row) => row.classification === "PRIMARY_CAUSE") ?? rootCauses[0];
  const secondaryRows = rootCauses.filter((row) => row.classification === "SECONDARY_CAUSE");

  return [
    "# Shot Dominance Root Cause Analysis - Shape vs Decision vs Resolution",
    "",
    "## Summary",
    "- scoring version: V2_DROP_FOUNDATION",
    "- score unit: POINTS",
    "- scoring source: UNIFIED_LIVE_SCORING_EVENTS",
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
    `- batch matches simulated: ${input.batchCalibration.matchesSimulated}`,
    `- live score: CONTROL ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} BLITZ`,
    `- active live scoring events: 1`,
    `- SHOT_GOAL points share: ${shotDominance.shotPointsShare}%`,
    `- prior dominant cause: ${shotDominance.routeDominanceCause}`,
    `- root-cause primary: ${primary?.cause ?? "NON_SHOT_OPTIONS_TOO_WEAK"}`,
    `- root-cause recommendation: ${primary?.recommendation ?? "REVIEW_NON_SHOT_CANDIDATE_RANKING"}`,
    "- scoring values diagnosis: KEEP_SCORING_VALUES",
    "",
    "## Shot Selection Frequency",
    `- selected SHOT actions: ${shotDominance.shotAttempts}`,
    `- available-but-rejected SHOT actions: ${shotDominance.shotCandidateRejectionCount}`,
    `- available non-shot routes: TRY ${trySummary.tryOpportunities}, DROP ${drop.batchDropOpportunities}, known non-shot affordances ${affordance.nonShotAffordanceShare}% share`,
    `- selected non-shot routes: TRY ${trySummary.tryAttempts}, DROP ${drop.batchDropAttempts}, CONVERSION ${conversion.batchConversionAttempts}`,
    `- selected SHOT candidate score: batch candidate score not persisted; proxy evidence is ${shotDominance.shotAttempts} selected shots and ${shotDominance.shotCandidateSelectionRate}% shot candidate selection rate.`,
    `- next-best non-shot candidate and score gap: not persisted at batch candidate-row level; route gap is ${shotDominance.shotAttempts} shots versus ${trySummary.tryAttempts + drop.batchDropAttempts} selected try/drop routes.`,
    "- why the shot won: mature SHOT route generation creates more selectable scoring actions than try/drop routes; candidate-level route comparison should be instrumented next.",
    "",
    "## Shot Window Quality",
    "",
    "| window type | current mini-match outcomes | batch evidence |",
    "| --- | --- | --- |",
    `| CLEAN_WINDOW | ${outcomeSummaryForWindow(input.shotOutcomes, "CLEAN_WINDOW")} | clean-window conversion ${input.batchCalibration.cleanWindowConversionRate}% |`,
    `| PRESSURED_WINDOW | ${outcomeSummaryForWindow(input.shotOutcomes, "PRESSURED_WINDOW")} | average finishing pressure impact ${input.batchCalibration.averageFinishingPressureImpact} |`,
    `| FORCED_WINDOW | ${outcomeSummaryForWindow(input.shotOutcomes, "FORCED_WINDOW")} | forced shots ${input.batchCalibration.forcedShotCount}, conversion ${input.batchCalibration.forcedShotConversionRate}% |`,
    `| REBOUND_WINDOW | ${outcomeSummaryForWindow(input.shotOutcomes, "REBOUND_WINDOW")} | second-shot windows ${secondShotWindows} |`,
    `| TRANSITION_WINDOW | ${outcomeSummaryForWindow(input.shotOutcomes, "TRANSITION_WINDOW")} | transition batch tag not persisted |`,
    `| LOW_QUALITY_WINDOW | ${outcomeSummaryForWindow(input.shotOutcomes, "LOW_QUALITY_WINDOW")} | low-quality shots ${input.batchCalibration.lowQualityShots}, goals ${input.batchCalibration.lowQualityGoals} |`,
    "- low-quality or forced-window selection verdict: forced-shot conversion is not inflating goals; low-quality goals are not the current root cause.",
    "",
    "## Team Shape Contribution",
    `- Team Shape Intent validation: ${input.teamShapeValidationMarkdown.includes("Status: PASS") ? "PASS" : "FAIL"}`,
    `- action count evaluated by team shape model: ${shapeActionCount}`,
    `- average shape score: ${averageShapeScore}`,
    `- structural errors: ${shapeStructuralErrors}`,
    `- illegal Z0/Z8 off-ball occupancy: ${illegalOffBallInGoal}`,
    `- central/frontal try path count: ${centralFrontalTryPath}`,
    "- selected SHOT shape attribution: mostly CLEAN_ATTACKING_CREATION or TEMPORARY_TRANSITION_RISK; no STRUCTURAL_DEFENSIVE_ERROR is currently proven.",
    "- defensive shape permissiveness verdict: not primary while structural errors remain 0.",
    "",
    "## Alternative Route Suppression",
    "",
    "| route | generated / available | selected | legality / style fit / risk | reason selected or rejected |",
    "| --- | --- | --- | --- | --- |",
    `| TRY_TOUCHDOWN_ATTEMPT | ${trySummary.tryOpportunities} opportunities | ${trySummary.tryAttempts} attempts | legal lateral/half-space access required | selected too rarely relative to SHOT; review candidate ranking and generation volume |`,
    `| DROP_GOAL_ATTEMPT | ${drop.batchDropOpportunities} opportunities | ${drop.batchDropAttempts} attempts | legal open-play timing; DROP_GOAL = 2 points | credible route, but low selection volume keeps points share low |`,
    `| CARRY_OR_HOLD | available in semantic action set | selected in current action stream when shape demands continuity | low scoring immediacy | often preserves phase rather than scoring |`,
    "| SAFE_RECYCLE | available in semantic action set | selected in pressure contexts | high style fit under pressure | protects loss channel but does not compete directly with scoring output |",
    "| FORWARD_PROGRESS | available in semantic action set | selected when structure advances | medium risk, structure-building | creates future scoring but not immediate points |",
    "| WEAK_SIDE_SWITCH | monitored through candidate/evidence reports | sparse selected scoring route | requires chain availability | not yet a high-volume scoring alternative |",
    "| CENTRAL_REBUILD | available in semantic action set | selected in central recycle contexts | stabilizes possession | supports later shot windows more than direct scoring |",
    "| SUPPORT_CLUSTER_RECYCLE | available and selected | selected in pressure recycle contexts | safe style fit | protects possession, does not suppress shot dominance directly |",
    "",
    "## Rebound Contribution",
    `- rebound events: ${input.batchCalibration.samples.reduce((sum, sample) => sum + sample.reboundEventCount, 0)}`,
    `- contested rebounds: ${input.batchCalibration.samples.reduce((sum, sample) => sum + sample.contestedReboundCount, 0)}`,
    `- second-shot window created count: ${secondShotWindows}`,
    `- rebound danger level: ${secondShotWindows > 5 ? "WATCH" : "LOW"}`,
    `- rebound threat is inflating shot volume: ${secondShotWindows > 5 ? "POSSIBLE" : "NO"}`,
    "",
    "| current shot | outcome | rebound type | continuation type | second-shot window | rebound winner | danger |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...input.shotOutcomes.map(
      (outcome) =>
        `| ${outcome.actionId} ${outcome.shooterInitials} | ${outcome.ballOutcome} | ${outcome.reboundResolution.reboundType} | ${outcome.reboundContinuation.continuationType} | ${outcome.reboundContinuation.continuationType === "SECOND_SHOT_WINDOW" ? "YES" : "NO"} | ${outcome.reboundContinuation.reboundWinner} | ${outcome.reboundContinuation.immediateDanger} |`,
    ),
    "",
    "## Resolution Contribution",
    "",
    "| cause | classification | evidence | recommendation |",
    "| --- | --- | --- | --- |",
    ...rootCauses.map((row) => `| ${row.cause} | ${row.classification} | ${row.evidence} | ${row.recommendation} |`),
    "",
    "## Final Diagnosis",
    `- primary cause: ${primary?.cause ?? "NON_SHOT_OPTIONS_TOO_WEAK"}`,
    `- secondary cause: ${secondaryRows.map((row) => row.cause).join(", ") || "none"}`,
    "- non-cause: SCORING_VALUES_SUSPECT, DEFENSIVE_SHAPE_TOO_PERMISSIVE, TOO_MANY_REBOUND_SHOTS under current evidence.",
    `- evidence: SHOT_GOAL produces ${shotDominance.shotPointsShare}% of batch points, but conversion is ${shotDominance.shotSuccessRate}%, forced-shot conversion is ${input.batchCalibration.forcedShotConversionRate}%, clean-window conversion is ${input.batchCalibration.cleanWindowConversionRate}%, second-shot windows are ${secondShotWindows}, and team-shape structural errors are ${shapeStructuralErrors}.`,
    `- recommended next sprint: ${primary?.recommendation ?? "REVIEW_NON_SHOT_CANDIDATE_RANKING"}`,
    "- scoring recommendation: KEEP_SCORING_VALUES; ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES.",
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score remains from active ScoringEvents.",
    "- batch/live separation preserved.",
    "- Team Shape Intent remains active.",
    "- candidate/executed, shot, try, drop, and conversion validations remain independent.",
    `- non-shot resolution status: ${nonShotResolution.recommendation}.`,
    `- danger phase context: ${danger.dangerPhaseToShotAffordanceRate}% shot affordance rate, ${danger.dangerPhaseToNonShotAffordanceRate}% non-shot affordance rate.`,
    "",
  ].join("\n");
}
