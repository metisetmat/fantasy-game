import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeRouteSuccessRateCalibration, type ShotSuccessDecompositionRow } from "./routeSuccessRateCalibration";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";
import { summarizeCleanShotSuccessCalibration } from "./cleanShotSuccessCalibration";
import { resolveGoalkeeperFatigueProfile } from "../actions/goalkeeperFatigueResolver";
import type { GoalkeeperFatigueProfile, GoalkeeperReadinessState } from "../actions/goalkeeperFatigueTypes";

export type GKShotWindowType = "CLEAN" | "PRESSED" | "FORCED" | "REBOUND" | "TRANSITION";
export type GKImpactBucket = "LOW_GK_IMPACT" | "AVERAGE_GK_IMPACT" | "STRONG_GK_IMPACT" | "ELITE_GK_IMPACT";
export type GKGoalClass =
  | "CLEAN_DESERVED_GOAL"
  | "KEEPER_BEATEN_FAIRLY"
  | "THRESHOLD_EDGE_CASE"
  | "GK_UNDERWEIGHTED"
  | "LOW_QUALITY_OVERREWARDED"
  | "DEFENSIVE_SHAPE_FAILURE";

export type GKCalibrationRecommendation =
  | "KEEP_GK_MODEL"
  | "REVIEW_GK_IMPACT_ON_CLEAN_SHOTS"
  | "REVIEW_FAILED_SAVE_THRESHOLDS"
  | "REVIEW_THRESHOLD_EDGE_GOALS"
  | "INCREASE_STRONG_GK_SAVE_WEIGHT"
  | "KEEP_SHOT_SUCCESS_GLOBAL_BUT_REBALANCE_GK_EFFECT"
  | "ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION"
  | "NEXT_REVIEW_TRY_GROUNDING_PRESSURE";

export interface GKShotImpactRow {
  readonly actionId: string;
  readonly shotWindow: GKShotWindowType;
  readonly shotQuality: number;
  readonly shotPower: number;
  readonly shotPlacement: number;
  readonly angleDifficulty: number;
  readonly goalkeeperChallenge: number;
  readonly goalkeeperSetPosition: number;
  readonly goalkeeperReaction: number;
  readonly goalkeeperReach: number;
  readonly goalkeeperHandling: number;
  readonly goalkeeperPhysicalFatigue: number;
  readonly goalkeeperMentalFatigue: number;
  readonly goalkeeperReadinessState: GoalkeeperReadinessState;
  readonly concentrationLoad: number;
  readonly shotsFacedRecently: number;
  readonly timeSinceLastAction: number;
  readonly pressureContext: string;
  readonly defensiveOrganizationInFront: number;
  readonly previousErrorFlag: string;
  readonly reboundControlScore: number;
  readonly secondSaveRecoveryScore: number;
  readonly goalkeeperZone: string;
  readonly insideGoalArea: "YES" | "NO";
  readonly legalHandUse: "YES" | "NO";
  readonly defensiveBlockPressure: number;
  readonly finalShotSuccessScore: number;
  readonly outcome: string;
  readonly goalkeeperAction: string;
  readonly goalClass: GKGoalClass | "NON_GOAL";
  readonly impactBucket: GKImpactBucket;
  readonly thresholdEdge: "YES" | "NO";
  readonly projectedOutcomeAfterGkCalibration: string;
}

export interface GKWindowSummaryRow {
  readonly shotWindow: GKShotWindowType;
  readonly attempts: number;
  readonly onTargetShots: number;
  readonly goals: number;
  readonly saves: number;
  readonly catches: number;
  readonly deflections: number;
  readonly trackedMisses: number;
  readonly failedSaves: number;
  readonly saveRate: number;
  readonly goalRate: number;
  readonly reboundConcededRate: number;
}

export interface GKQualitySummaryRow {
  readonly impactBucket: GKImpactBucket;
  readonly shotsFaced: number;
  readonly goalsConceded: number;
  readonly saves: number;
  readonly catches: number;
  readonly deflections: number;
  readonly failedSaveRate: number;
  readonly reboundQualityConceded: string;
}

export interface GoalkeeperShotStoppingImpactCalibrationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly shotRowsChecked: number;
  readonly failedSaveCount: number;
  readonly thresholdEdgeGoalCount: number;
  readonly gkUnderweightedGoalCount: number;
  readonly projectedShotGoalsAfterGkCalibration: number;
  readonly projectedShotSuccessRateAfterGkCalibration: number;
  readonly projectedCleanShotSuccessRateAfterGkCalibration: number;
  readonly projectedReboundConcessionDelta: number;
  readonly windowSummaries: readonly GKWindowSummaryRow[];
  readonly qualitySummaries: readonly GKQualitySummaryRow[];
  readonly failedSaveRows: readonly GKShotImpactRow[];
  readonly thresholdEdgeRows: readonly GKShotImpactRow[];
  readonly allRows: readonly GKShotImpactRow[];
  readonly recommendations: readonly GKCalibrationRecommendation[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function shotWindow(row: ShotSuccessDecompositionRow): GKShotWindowType {
  return row.windowType;
}

function gkSet(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.angleDifficulty > 50 ? -5 : 8));
}

function gkReaction(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.windowType === "CLEAN" ? -4 : 6));
}

function gkReach(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.placement > 72 ? -8 : 5));
}

function gkHandling(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.power > 74 ? -10 : 6));
}

function sequenceNumber(actionId: string): number {
  const match = /s(\d+)-a/.exec(actionId);

  return match?.[1] === undefined ? 1 : Number.parseInt(match[1], 10);
}

function actionNumber(actionId: string): number {
  const match = /a(\d+)$/.exec(actionId);

  return match?.[1] === undefined ? 1 : Number.parseInt(match[1], 10);
}

function fatigueProfileForRow(row: ShotSuccessDecompositionRow, index: number): GoalkeeperFatigueProfile {
  const setPosition = gkSet(row);
  const handling = gkHandling(row);

  return resolveGoalkeeperFatigueProfile({
    shotActionId: row.actionId,
    shotIndex: index,
    sequenceNumber: sequenceNumber(row.actionId),
    actionNumber: actionNumber(row.actionId),
    goalkeeperId: `${row.actionId}-gk`,
    defendingTeamId: "blitz",
    goalkeeperZone: "Z1-C",
    goalkeeperInsideGoalArea: true,
    baseAccumulatedFatigue: row.windowType === "FORCED" ? 28 : row.windowType === "REBOUND" ? 34 : 18,
    composure: clamp(setPosition + 10),
    vision: clamp(row.goalkeeperChallenge + 4),
    handling,
    speed: gkReaction(row),
    shotOnTarget: row.outcome === "GOAL" || row.goalkeeperAction !== "TRACKED_MISS",
    defensiveBlockPressure: row.defensiveBlockPressure,
    finishingPressure: clamp(54 + row.angleDifficulty * 0.26 + (row.windowType === "REBOUND" ? 14 : 0)),
    cleanWindowType:
      row.windowType === "CLEAN"
        ? "CLEAN"
        : row.windowType === "FORCED"
          ? "NONE"
          : row.windowType === "REBOUND"
            ? "PARTIAL"
            : "PARTIAL",
    previousErrorFlag:
      row.goalkeeperAction === "FAILED_SAVE"
        ? "RECENT_FAILED_SAVE"
        : row.goalkeeperAction === "DEFLECTION"
          ? "RECENT_SPILL"
          : "NONE",
  });
}

function impactBucket(row: ShotSuccessDecompositionRow): GKImpactBucket {
  const score = Math.round((gkSet(row) + gkReaction(row) + gkReach(row) + gkHandling(row) + row.goalkeeperChallenge) / 5);

  if (score >= 78) {
    return "ELITE_GK_IMPACT";
  }

  if (score >= 66) {
    return "STRONG_GK_IMPACT";
  }

  if (score >= 50) {
    return "AVERAGE_GK_IMPACT";
  }

  return "LOW_GK_IMPACT";
}

function goalClass(row: ShotSuccessDecompositionRow): GKGoalClass | "NON_GOAL" {
  if (row.outcome !== "GOAL") {
    return "NON_GOAL";
  }

  if (row.shotQuality < 55) {
    return "LOW_QUALITY_OVERREWARDED";
  }

  if (row.goalClass === "DEFENSIVE_SHAPE_FAILURE") {
    return "DEFENSIVE_SHAPE_FAILURE";
  }

  if (row.goalClass === "THRESHOLD_EDGE_CASE") {
    return impactBucket(row) === "STRONG_GK_IMPACT" || impactBucket(row) === "ELITE_GK_IMPACT" ? "GK_UNDERWEIGHTED" : "THRESHOLD_EDGE_CASE";
  }

  if (row.windowType === "CLEAN" && row.shotQuality >= 74 && row.finalShotSuccessScore >= 58) {
    return "CLEAN_DESERVED_GOAL";
  }

  return "KEEPER_BEATEN_FAIRLY";
}

function projectedOutcome(row: GKShotImpactRow): string {
  if (row.outcome !== "GOAL") {
    return row.outcome;
  }

  if (
    (row.goalClass === "GK_UNDERWEIGHTED" || row.goalClass === "THRESHOLD_EDGE_CASE") &&
    (row.impactBucket === "STRONG_GK_IMPACT" || row.impactBucket === "ELITE_GK_IMPACT") &&
    (row.shotWindow === "CLEAN" || row.shotWindow === "PRESSED")
  ) {
    return row.goalkeeperHandling >= 70 && row.legalHandUse === "YES" ? "CAUGHT_BY_GK_PROJECTED" : "SAVED_BY_GK_PROJECTED";
  }

  return "GOAL";
}

function toImpactRows(rows: readonly ShotSuccessDecompositionRow[]): readonly GKShotImpactRow[] {
  return rows.map((row, index) => {
    const bucket = impactBucket(row);
    const classifiedGoal = goalClass(row);
    const fatigue = fatigueProfileForRow(row, index);
    const thresholdEdge =
      classifiedGoal === "THRESHOLD_EDGE_CASE" || classifiedGoal === "GK_UNDERWEIGHTED" || row.finalShotSuccessScore <= 54 ? "YES" : "NO";
    const impactRow: GKShotImpactRow = {
      actionId: row.actionId,
      shotWindow: shotWindow(row),
      shotQuality: row.shotQuality,
      shotPower: row.power,
      shotPlacement: row.placement,
      angleDifficulty: row.angleDifficulty,
      goalkeeperChallenge: row.goalkeeperChallenge,
      goalkeeperSetPosition: gkSet(row),
      goalkeeperReaction: gkReaction(row),
      goalkeeperReach: gkReach(row),
      goalkeeperHandling: gkHandling(row),
      goalkeeperPhysicalFatigue: fatigue.goalkeeperPhysicalFatigue,
      goalkeeperMentalFatigue: fatigue.goalkeeperMentalFatigue,
      goalkeeperReadinessState: fatigue.goalkeeperReadinessState,
      concentrationLoad: fatigue.concentrationLoad,
      shotsFacedRecently: fatigue.shotsFacedRecently,
      timeSinceLastAction: fatigue.timeSinceLastAction,
      pressureContext: fatigue.pressureContext,
      defensiveOrganizationInFront: fatigue.defensiveOrganizationInFront,
      previousErrorFlag: fatigue.previousErrorFlag,
      reboundControlScore: fatigue.reboundControlScore,
      secondSaveRecoveryScore: fatigue.secondSaveRecoveryScore,
      goalkeeperZone: "Z1-C",
      insideGoalArea: "YES",
      legalHandUse: "YES",
      defensiveBlockPressure: row.defensiveBlockPressure,
      finalShotSuccessScore: row.finalShotSuccessScore,
      outcome: row.outcome,
      goalkeeperAction: row.goalkeeperAction,
      goalClass: classifiedGoal,
      impactBucket: bucket,
      thresholdEdge,
      projectedOutcomeAfterGkCalibration: row.outcome,
    };

    return {
      ...impactRow,
      projectedOutcomeAfterGkCalibration: projectedOutcome(impactRow),
    };
  });
}

function actionCount(rows: readonly GKShotImpactRow[], predicate: (row: GKShotImpactRow) => boolean): number {
  return rows.filter(predicate).length;
}

function windowSummary(window: GKShotWindowType, rows: readonly GKShotImpactRow[]): GKWindowSummaryRow {
  const scoped = rows.filter((row) => row.shotWindow === window);
  const goals = actionCount(scoped, (row) => row.outcome === "GOAL");
  const saves = actionCount(scoped, (row) => row.goalkeeperAction.includes("SAVE") && row.outcome !== "GOAL");
  const catches = actionCount(scoped, (row) => row.goalkeeperAction === "CATCH");
  const deflections = actionCount(scoped, (row) => row.goalkeeperAction.includes("DEFLECTION"));
  const trackedMisses = actionCount(scoped, (row) => row.goalkeeperAction === "TRACKED_MISS");
  const failedSaves = actionCount(scoped, (row) => row.goalkeeperAction === "FAILED_SAVE");
  const onTargetShots = goals + saves + catches + deflections + failedSaves;

  return {
    shotWindow: window,
    attempts: scoped.length,
    onTargetShots,
    goals,
    saves,
    catches,
    deflections,
    trackedMisses,
    failedSaves,
    saveRate: percent(saves + catches + deflections, onTargetShots),
    goalRate: percent(goals, scoped.length),
    reboundConcededRate: percent(deflections, scoped.length),
  };
}

function qualitySummary(bucket: GKImpactBucket, rows: readonly GKShotImpactRow[]): GKQualitySummaryRow {
  const scoped = rows.filter((row) => row.impactBucket === bucket);
  const goalsConceded = actionCount(scoped, (row) => row.outcome === "GOAL");
  const saves = actionCount(scoped, (row) => row.goalkeeperAction.includes("SAVE") && row.outcome !== "GOAL");
  const catches = actionCount(scoped, (row) => row.goalkeeperAction === "CATCH");
  const deflections = actionCount(scoped, (row) => row.goalkeeperAction.includes("DEFLECTION"));
  const failedSaves = actionCount(scoped, (row) => row.goalkeeperAction === "FAILED_SAVE");
  const projectedDeflections = actionCount(scoped, (row) => row.projectedOutcomeAfterGkCalibration.includes("SAVED_BY_GK"));

  return {
    impactBucket: bucket,
    shotsFaced: scoped.length,
    goalsConceded,
    saves,
    catches,
    deflections,
    failedSaveRate: percent(failedSaves, scoped.length),
    reboundQualityConceded: projectedDeflections > deflections ? "WATCH_CONTROLLED_SAVE_VS_REBOUND" : "STABLE",
  };
}

function recommendations(summary: Omit<GoalkeeperShotStoppingImpactCalibrationSummary, "recommendations">): readonly GKCalibrationRecommendation[] {
  const output: GKCalibrationRecommendation[] = [];

  if (summary.projectedCleanShotSuccessRateAfterGkCalibration < 64 || summary.gkUnderweightedGoalCount > 0) {
    output.push("REVIEW_GK_IMPACT_ON_CLEAN_SHOTS");
  }

  if (summary.failedSaveCount > 0) {
    output.push("REVIEW_FAILED_SAVE_THRESHOLDS");
  }

  if (summary.thresholdEdgeGoalCount > 0) {
    output.push("REVIEW_THRESHOLD_EDGE_GOALS");
  }

  if (summary.gkUnderweightedGoalCount > 0) {
    output.push("INCREASE_STRONG_GK_SAVE_WEIGHT");
  }

  if (output.length === 0) {
    output.push("KEEP_GK_MODEL");
  } else {
    output.push("KEEP_SHOT_SUCCESS_GLOBAL_BUT_REBALANCE_GK_EFFECT");
  }

  return [...output, "ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION", "NEXT_REVIEW_TRY_GROUNDING_PRESSURE"];
}

export function summarizeGoalkeeperShotStoppingImpactCalibration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): GoalkeeperShotStoppingImpactCalibrationSummary {
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const rows = toImpactRows(routeSuccess.shotRows);
  const projectedGoals = actionCount(rows, (row) => row.projectedOutcomeAfterGkCalibration === "GOAL");
  const projectedCleanGoals = actionCount(rows, (row) => row.shotWindow === "CLEAN" && row.projectedOutcomeAfterGkCalibration === "GOAL");
  const cleanAttempts = actionCount(rows, (row) => row.shotWindow === "CLEAN");
  const projectedSaveOrCatch = actionCount(rows, (row) => row.projectedOutcomeAfterGkCalibration.includes("GK_PROJECTED"));
  const summaryWithoutRecommendation = {
    scoringVersion: "V2_DROP_FOUNDATION" as const,
    shotRowsChecked: rows.length,
    failedSaveCount: actionCount(rows, (row) => row.goalkeeperAction === "FAILED_SAVE"),
    thresholdEdgeGoalCount: actionCount(rows, (row) => row.goalClass === "THRESHOLD_EDGE_CASE"),
    gkUnderweightedGoalCount: actionCount(rows, (row) => row.goalClass === "GK_UNDERWEIGHTED"),
    projectedShotGoalsAfterGkCalibration: projectedGoals,
    projectedShotSuccessRateAfterGkCalibration: percent(projectedGoals, rows.length),
    projectedCleanShotSuccessRateAfterGkCalibration: percent(projectedCleanGoals, cleanAttempts),
    projectedReboundConcessionDelta: 0 - projectedSaveOrCatch,
    windowSummaries: (["CLEAN", "PRESSED", "FORCED", "REBOUND", "TRANSITION"] as const).map((window) => windowSummary(window, rows)),
    qualitySummaries: (["LOW_GK_IMPACT", "AVERAGE_GK_IMPACT", "STRONG_GK_IMPACT", "ELITE_GK_IMPACT"] as const).map((bucket) =>
      qualitySummary(bucket, rows),
    ),
    failedSaveRows: rows.filter((row) => row.goalkeeperAction === "FAILED_SAVE"),
    thresholdEdgeRows: rows.filter((row) => row.thresholdEdge === "YES" && row.outcome === "GOAL"),
    allRows: rows,
  };

  return {
    ...summaryWithoutRecommendation,
    recommendations: recommendations(summaryWithoutRecommendation),
  };
}

function windowRows(summary: GoalkeeperShotStoppingImpactCalibrationSummary): readonly string[] {
  return summary.windowSummaries.map(
    (row) =>
      `| ${row.shotWindow} | ${row.attempts} | ${row.onTargetShots} | ${row.goals} | ${row.saves} | ${row.catches} | ${row.deflections} | ${row.trackedMisses} | ${row.failedSaves} | ${row.saveRate}% | ${row.goalRate}% | ${row.reboundConcededRate}% |`,
  );
}

function qualityRows(summary: GoalkeeperShotStoppingImpactCalibrationSummary): readonly string[] {
  return summary.qualitySummaries.map(
    (row) =>
      `| ${row.impactBucket} | ${row.shotsFaced} | ${row.goalsConceded} | ${row.saves} | ${row.catches} | ${row.deflections} | ${row.failedSaveRate}% | ${row.reboundQualityConceded} |`,
  );
}

function failedSaveRows(summary: GoalkeeperShotStoppingImpactCalibrationSummary): readonly string[] {
  return summary.failedSaveRows.map(
    (row) =>
      `| ${row.actionId} | ${row.shotWindow} | ${row.shotQuality} | ${row.shotPower} | ${row.shotPlacement} | ${row.angleDifficulty} | ${row.goalkeeperChallenge} | ${row.goalkeeperSetPosition} | ${row.goalkeeperReaction} | ${row.goalkeeperReach} | ${row.goalkeeperHandling} | ${row.defensiveBlockPressure} | ${row.finalShotSuccessScore} | ${row.goalClass} | ${row.projectedOutcomeAfterGkCalibration} |`,
  );
}

function thresholdRows(summary: GoalkeeperShotStoppingImpactCalibrationSummary): readonly string[] {
  return summary.thresholdEdgeRows.map(
    (row) =>
      `| ${row.actionId} | ${row.shotWindow} | ${row.impactBucket} | ${row.finalShotSuccessScore} | ${row.goalkeeperChallenge} | ${row.goalClass} | ${row.projectedOutcomeAfterGkCalibration} | ${row.projectedOutcomeAfterGkCalibration === "GOAL" ? "goal remains plausible" : "GK should have more influence"} |`,
  );
}

function fatigueRows(summary: GoalkeeperShotStoppingImpactCalibrationSummary): readonly string[] {
  return summary.allRows.slice(0, 16).map(
    (row) =>
      `| ${row.actionId} | ${row.shotWindow} | ${row.goalkeeperPhysicalFatigue} | ${row.goalkeeperMentalFatigue} | ${row.goalkeeperReadinessState} | ${row.concentrationLoad} | ${row.shotsFacedRecently} | ${row.timeSinceLastAction} | ${row.pressureContext} | ${row.defensiveOrganizationInFront} | ${row.previousErrorFlag} | ${row.reboundControlScore} | ${row.secondSaveRecoveryScore} | ${row.goalkeeperAction} | ${row.projectedOutcomeAfterGkCalibration} |`,
  );
}

export function createGoalkeeperShotStoppingImpactCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeGoalkeeperShotStoppingImpactCalibration(input);
  const cleanShot = summarizeCleanShotSuccessCalibration(input);

  return [
    "# Goalkeeper Shot-Stopping Impact Calibration",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- try grounding resolution unchanged; TRY_TOUCHDOWN remains monitoring only in this sprint.",
    `- shot rows checked: ${summary.shotRowsChecked}`,
    `- failed save count: ${summary.failedSaveCount}`,
    `- threshold-edge goal count: ${summary.thresholdEdgeGoalCount}`,
    `- GK underweighted goal count: ${summary.gkUnderweightedGoalCount}`,
    `- projected SHOT goals after GK calibration: ${summary.projectedShotGoalsAfterGkCalibration}`,
    `- projected SHOT success after GK calibration: ${summary.projectedShotSuccessRateAfterGkCalibration}%`,
    `- projected CLEAN_SHOT success after GK calibration: ${summary.projectedCleanShotSuccessRateAfterGkCalibration}%`,
    `- clean shot success calibration: active; calibrated CLEAN_SHOT success ${cleanShot.cleanShotSuccessRate}%, threshold-edge clean goals reduced ${cleanShot.thresholdEdgeCleanGoalsReduced}`,
    `- projected rebound concession delta: ${summary.projectedReboundConcessionDelta}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "- goalkeeper fatigue specialization: active; physical fatigue, mental fatigue, readiness, concentration load, rebound control, and second-save recovery are separated from outfield fatigue.",
    "",
    "## Goalkeeper Impact By Shot Window",
    "",
    "| shot window | attempts | on-target shots | goals | saves | catches | deflections | tracked misses | failed saves | save rate | goal rate | rebound conceded rate |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...windowRows(summary),
    "",
    "## Goalkeeper Impact By Goalkeeper Quality",
    "",
    "| GK impact bucket | shots faced | goals conceded | saves | catches | deflections | failed save rate | rebound quality conceded |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...qualityRows(summary),
    "",
    "## Goalkeeper Fatigue Specialization",
    "",
    "- physical fatigue rises slower than outfield load and mostly affects reach, foot/body intervention, spill risk, and second-save recovery.",
    "- mental fatigue rises through inactivity, repeated danger phases, shots faced, rebounds/scrambles, late pressure, defensive disorganization, and previous handling errors.",
    "- readiness states: SET, ALERT, COLD, UNDER_PRESSURE, OVERLOADED.",
    "- strong goalkeeper attributes mitigate mental fatigue but do not erase it.",
    "",
    "| action id | shot window | physical fatigue | mental fatigue | readiness | concentration load | shots faced recently | time since last action | pressure context | defensive organization | previous error | rebound control | second-save recovery | goalkeeper action | projected outcome |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...fatigueRows(summary),
    "",
    "## Failed-Save Decomposition",
    "",
    "| action id | shot window | shot quality | shot power | shot placement | angle difficulty | goalkeeper challenge | GK set position | GK reaction | GK reach | GK handling | defensive block pressure | final shot success score | goal class | projected outcome |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...failedSaveRows(summary),
    "",
    "## Threshold-Edge Analysis",
    "",
    "| action id | shot window | GK impact bucket | final shot success score | goalkeeper challenge | goal class | projected outcome | interpretation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...thresholdRows(summary),
    "",
    "## Calibration Proposal",
    "- increase GK impact only against CLEAN and high-quality PRESSED shots where GK context is STRONG_GK_IMPACT or ELITE_GK_IMPACT.",
    "- preserve CLEAN_DESERVED_GOAL outcomes when shot quality and placement clearly beat the goalkeeper.",
    "- review FAILED_SAVE thresholds so high goalkeeper challenge can become HAND_SAVE, CATCH, or controlled deflection.",
    "- do not make FORCED shots weaker; forced-shot success is already 0%.",
    "- avoid rebound explosion by preferring CATCH or HAND_SAVE when handling and legal hand-use are strong.",
    "- no scoring value changes are recommended before GK calibration is understood.",
    "- next sprint should review try grounding pressure after GK impact is separated from shot success.",
    "",
    "## Route Economy Impact After GK Calibration",
    `- projected SHOT success rate: ${summary.projectedShotSuccessRateAfterGkCalibration}%`,
    `- projected CLEAN_SHOT success rate: ${summary.projectedCleanShotSuccessRateAfterGkCalibration}%`,
    "- TRY_TOUCHDOWN success rate: unchanged; monitoring only.",
    "- DROP_GOAL success rate: unchanged.",
    "- route-balance implication: any shot reduction comes from GK resolution, not scoring values.",
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score from active ScoringEvents only.",
    "- batch/live separation preserved.",
    "- candidate ranking unchanged.",
    "- tie-breaking unchanged.",
    "- Team Shape Intent remains active.",
    "- Sequence 1 Action 1 unchanged.",
    "",
  ].join("\n");
}
