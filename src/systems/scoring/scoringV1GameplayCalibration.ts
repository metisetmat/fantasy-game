import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../actions";
import { pointValueForScoringActionType, scoringActionTypeForShotOutcome, scoringRuleLabel, SCORING_VERSION } from "./scoringRules";

export type ShotQualityBand = "LOW" | "MEDIUM" | "GOOD" | "HIGH" | "ELITE";
export type ScorelinePlausibilityStatus = "PLAUSIBLE" | "QUESTIONABLE" | "UNSTABLE" | "NEEDS_MORE_SAMPLE";
export type ScoringCalibrationRecommendation =
  | "KEEP_V1_RULE"
  | "KEEP_RULE_BUT_MONITOR"
  | "ADJUST_STYLE_BALANCE"
  | "LOWER_SHOT_GOAL_VALUE"
  | "LOWER_SHOT_DIFFICULTY"
  | "RAISE_SHOT_DIFFICULTY"
  | "RAISE_SHOT_DIFFICULTY_MORE"
  | "REDUCE_SHOT_FREQUENCY"
  | "NEEDS_MORE_SAMPLE";

export interface TeamShotProfile {
  readonly teamName: string;
  readonly shots: number;
  readonly shotGoals: number;
  readonly pointsFromShots: number;
  readonly conversionRate: number;
  readonly averageShotQuality: number;
  readonly averageShotPressure: number;
  readonly bestShot: string;
  readonly worstShot: string;
  readonly forcedShotCount: number;
  readonly tacticalRead: string;
}

export interface ShotCalibrationEvent {
  readonly label: string;
  readonly team: string;
  readonly shooter: string;
  readonly originZone: string;
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly ballOutcome: string;
  readonly scoringAction: string;
  readonly pointValue: number;
  readonly scoreAfterShot: string;
  readonly qualityBand: ShotQualityBand;
  readonly tacticalJustification: string;
  readonly forced: boolean;
}

export interface ScoringV1GameplayCalibration {
  readonly scoringVersion: string;
  readonly scoringRule: string;
  readonly scoreUnit: "POINTS";
  readonly finalScore: string;
  readonly totalShots: number;
  readonly shotGoals: number;
  readonly conversionRate: number;
  readonly averageShotQuality: number;
  readonly averageGoalkeeperChallenge: number;
  readonly averageDefensiveBlockPressure: number;
  readonly averageFinishingPressure: number;
  readonly forcedLowQualityShots: number;
  readonly highQualityMisses: number;
  readonly lowQualityGoals: number;
  readonly events: readonly ShotCalibrationEvent[];
  readonly teamProfiles: readonly TeamShotProfile[];
  readonly scorelinePlausibility: ScorelinePlausibilityStatus;
  readonly recommendation: ScoringCalibrationRecommendation;
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

export function shotQualityBand(quality: number): ShotQualityBand {
  if (quality <= 39) {
    return "LOW";
  }

  if (quality <= 59) {
    return "MEDIUM";
  }

  if (quality <= 74) {
    return "GOOD";
  }

  if (quality <= 89) {
    return "HIGH";
  }

  return "ELITE";
}

function actionLabel(actionId: string): string {
  const match = /^dt-s(\d+)-a(\d+)$/.exec(actionId);
  return match === null ? actionId : `Sequence ${match[1]} Action ${match[2]}`;
}

function isForcedShot(outcome: ShotOutcomeContract): boolean {
  return (
    outcome.shotQuality < 60 ||
    outcome.goalkeeperChallenge >= outcome.shotQuality ||
    outcome.defensiveBlockPressure >= 70 ||
    (outcome.ballOutcome !== "GOAL" && outcome.finishingPressure >= 78)
  );
}

function tacticalJustification(outcome: ShotOutcomeContract): string {
  if (outcome.ballOutcome === "GOAL") {
    return "Scoring shot converts the available finishing window; quality beats the goalkeeper challenge.";
  }

  if (isForcedShot(outcome)) {
    return "Non-scoring shot carries forced-shot indicators; monitor whether pressure is encouraging early attempts.";
  }

  return "Non-scoring shot is acceptable in the current sample, but needs broader batch evidence.";
}

function teamProfile(input: { readonly teamName: string; readonly events: readonly ShotCalibrationEvent[] }): TeamShotProfile {
  const goals = input.events.filter((event) => event.ballOutcome === "GOAL").length;
  const points = input.events.reduce((sum, event) => sum + event.pointValue, 0);
  const sorted = [...input.events].sort((left, right) => right.shotQuality - left.shotQuality);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const forcedShotCount = input.events.filter((event) => event.forced).length;

  return {
    teamName: input.teamName,
    shots: input.events.length,
    shotGoals: goals,
    pointsFromShots: points,
    conversionRate: percent(goals, input.events.length),
    averageShotQuality: average(input.events.map((event) => event.shotQuality)),
    averageShotPressure: average(input.events.map((event) => event.finishingPressure)),
    bestShot: best === undefined ? "none" : `${best.label} ${best.shooter} ${best.shotQuality}/100 ${best.ballOutcome}`,
    worstShot: worst === undefined ? "none" : `${worst.label} ${worst.shooter} ${worst.shotQuality}/100 ${worst.ballOutcome}`,
    forcedShotCount,
    tacticalRead:
      input.events.length === 0
        ? "No shot profile in this sample."
        : forcedShotCount > input.events.length / 2
          ? "Shot profile leans forced; monitor selection quality."
          : goals > 0
            ? "Shot profile includes one decisive conversion from a good window."
            : "Shot profile creates attempts without converting; broader sample needed.",
  };
}

export function summarizeScoringV1GameplayCalibration(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
}): ScoringV1GameplayCalibration {
  const control = input.result.state.context.teamA.displayName;
  const blitz = input.result.state.context.teamB.displayName;
  const finalScore = `${control} ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} ${blitz}`;
  const events = input.outcomes.map((outcome): ShotCalibrationEvent => {
    const scoringAction = scoringActionTypeForShotOutcome(outcome.ballOutcome);

    return {
      label: actionLabel(outcome.actionId),
      team: outcome.shootingTeamName,
      shooter: outcome.shooterInitials,
      originZone: outcome.shotOriginZone,
      shotQuality: outcome.shotQuality,
      goalkeeperChallenge: outcome.goalkeeperChallenge,
      defensiveBlockPressure: outcome.defensiveBlockPressure,
      finishingPressure: outcome.finishingPressure,
      ballOutcome: outcome.ballOutcome,
      scoringAction,
      pointValue: outcome.scoringImpact.pointsAdded || pointValueForScoringActionType(scoringAction),
      scoreAfterShot: outcome.scoringImpact.scoreAfter,
      qualityBand: shotQualityBand(outcome.shotQuality),
      tacticalJustification: tacticalJustification(outcome),
      forced: isForcedShot(outcome),
    };
  });
  const shotGoals = events.filter((event) => event.ballOutcome === "GOAL").length;
  const lowQualityGoals = events.filter((event) => event.ballOutcome === "GOAL" && event.shotQuality < 60).length;
  const highQualityMisses = events.filter((event) => event.ballOutcome !== "GOAL" && event.shotQuality >= 75).length;
  const forcedLowQualityShots = events.filter((event) => event.forced).length;
  const recommendation: ScoringCalibrationRecommendation = events.length < 20 ? "NEEDS_MORE_SAMPLE" : "KEEP_RULE_BUT_MONITOR";

  return {
    scoringVersion: SCORING_VERSION,
    scoringRule: scoringRuleLabel("SHOT_GOAL"),
    scoreUnit: "POINTS",
    finalScore,
    totalShots: events.length,
    shotGoals,
    conversionRate: percent(shotGoals, events.length),
    averageShotQuality: average(events.map((event) => event.shotQuality)),
    averageGoalkeeperChallenge: average(events.map((event) => event.goalkeeperChallenge)),
    averageDefensiveBlockPressure: average(events.map((event) => event.defensiveBlockPressure)),
    averageFinishingPressure: average(events.map((event) => event.finishingPressure)),
    forcedLowQualityShots,
    highQualityMisses,
    lowQualityGoals,
    events,
    teamProfiles: [control, blitz].map((teamName) => teamProfile({ teamName, events: events.filter((event) => event.team === teamName) })),
    scorelinePlausibility: events.length < 20 ? "NEEDS_MORE_SAMPLE" : lowQualityGoals > 0 ? "QUESTIONABLE" : "PLAUSIBLE",
    recommendation,
  };
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
