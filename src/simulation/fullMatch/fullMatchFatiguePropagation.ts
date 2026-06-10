import type { MatchEvent, MatchInput, TacticalPlan } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ScoreState } from "../../models/match";
import {
  type FullMatchSegmentState,
  type FullMatchTeamSegmentState,
} from "./fullMatchSegmentState";

export interface FullMatchTeamFatigueUpdate {
  readonly teamId: TeamId;
  readonly conditionStart: Rating;
  readonly conditionEnd: Rating;
  readonly mentalFreshnessStart: Rating;
  readonly mentalFreshnessEnd: Rating;
  readonly highIntensityLoad: Rating;
  readonly defensiveStress: Rating;
  readonly momentum: Rating;
}

export interface FullMatchFatiguePropagationResult {
  readonly segmentIndex: number;
  readonly minute: number;
  readonly home: FullMatchTeamFatigueUpdate;
  readonly away: FullMatchTeamFatigueUpdate;
  readonly stateAfterSegment: FullMatchSegmentState;
}

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoringPointsForTeam(events: readonly MatchEvent[], teamId: TeamId): number {
  return events
    .filter((event) => event.teamId === teamId)
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function pressureEventsForTeam(events: readonly MatchEvent[], teamId: TeamId): number {
  return events.filter(
    (event) =>
      event.teamId === teamId &&
      (event.tags.includes("pressure_high") ||
        event.tags.includes("territorial_pressure_high") ||
        event.tags.includes("chaos_high")),
  ).length;
}

function planRiskLoad(plan: TacticalPlan): number {
  switch (plan.riskLevel) {
    case "low":
      return 0.4;
    case "medium":
      return 0.8;
    case "high":
      return 1.25;
  }
}

function updateTeam(input: {
  readonly teamState: FullMatchTeamSegmentState;
  readonly ownPlan: TacticalPlan;
  readonly ownPoints: number;
  readonly concededPoints: number;
  readonly pressureEvents: number;
  readonly secondHalf: boolean;
}): FullMatchTeamFatigueUpdate {
  const pressingLoad = input.ownPlan.pressingIntensity / 100;
  const secondHalfMultiplier = input.secondHalf ? 1.25 : 1;
  const conditionDrop =
    (0.28 + pressingLoad * 0.82 + input.pressureEvents * 0.04 + input.concededPoints * 0.025 + planRiskLoad(input.ownPlan) * 0.16) *
    secondHalfMultiplier;
  const mentalDrop =
    (0.2 + planRiskLoad(input.ownPlan) * 0.4 + input.concededPoints * 0.1 + input.pressureEvents * 0.035) *
    secondHalfMultiplier;
  const conditionEnd = clampRating(input.teamState.condition - conditionDrop);
  const mentalFreshnessEnd = clampRating(input.teamState.mentalFreshness - mentalDrop);
  const momentum = clampRating(input.teamState.momentum + input.ownPoints * 1.7 - input.concededPoints * 1.2);
  const defensiveStress = clampRating(input.teamState.defensiveStress + input.concededPoints * 1.8 + input.pressureEvents * 0.5);
  const pressureLoadIncrease =
    input.ownPlan.pressingIntensity * 0.055 +
    input.pressureEvents * 0.22 +
    input.concededPoints * 0.14 +
    planRiskLoad(input.ownPlan) * 0.35 +
    (input.secondHalf ? 1.1 : 0.4);
  const highIntensityLoad = clampRating(input.teamState.pressureLoad + pressureLoadIncrease);

  return {
    teamId: input.teamState.teamId,
    conditionStart: input.teamState.condition,
    conditionEnd,
    mentalFreshnessStart: input.teamState.mentalFreshness,
    mentalFreshnessEnd,
    highIntensityLoad,
    defensiveStress,
    momentum,
  };
}

function nextTeamState(update: FullMatchTeamFatigueUpdate): FullMatchTeamSegmentState {
  return {
    teamId: update.teamId,
    condition: update.conditionEnd,
    mentalFreshness: update.mentalFreshnessEnd,
    momentum: update.momentum,
    pressureLoad: update.highIntensityLoad,
    scoringConfidence: clampRating(35 + update.momentum * 0.45),
    defensiveStress: update.defensiveStress,
  };
}

function previousScoringTeam(events: readonly MatchEvent[]): TeamId | undefined {
  return [...events]
    .reverse()
    .find((event) => event.eventType === "scoring")?.teamId;
}

export function propagateFullMatchFatigue(input: {
  readonly matchInput: MatchInput;
  readonly previousState: FullMatchSegmentState;
  readonly segmentEvents: readonly MatchEvent[];
  readonly segmentIndex: number;
  readonly minute: number;
  readonly scoreAfterSegment: ScoreState;
  readonly repeatedPatternCount: number;
}): FullMatchFatiguePropagationResult {
  const secondHalf = input.minute >= 40;
  const homePoints = scoringPointsForTeam(input.segmentEvents, input.matchInput.homeTeam.teamId);
  const awayPoints = scoringPointsForTeam(input.segmentEvents, input.matchInput.awayTeam.teamId);
  const home = updateTeam({
    teamState: input.previousState.home,
    ownPlan: input.matchInput.homePlan,
    ownPoints: homePoints,
    concededPoints: awayPoints,
    pressureEvents: pressureEventsForTeam(input.segmentEvents, input.matchInput.homeTeam.teamId),
    secondHalf,
  });
  const away = updateTeam({
    teamState: input.previousState.away,
    ownPlan: input.matchInput.awayPlan,
    ownPoints: awayPoints,
    concededPoints: homePoints,
    pressureEvents: pressureEventsForTeam(input.segmentEvents, input.matchInput.awayTeam.teamId),
    secondHalf,
  });
  const scoringTeamId = previousScoringTeam(input.segmentEvents) ?? input.previousState.previousScoringTeamId;
  const stateAfterSegment: FullMatchSegmentState = {
    segmentIndex: input.segmentIndex + 1,
    minute: input.minute,
    score: input.scoreAfterSegment,
    home: nextTeamState(home),
    away: nextTeamState(away),
    ...(scoringTeamId === undefined ? {} : { previousScoringTeamId: scoringTeamId }),
    repeatedPatternCount: input.repeatedPatternCount,
  };

  return {
    segmentIndex: input.segmentIndex,
    minute: input.minute,
    home,
    away,
    stateAfterSegment,
  };
}

export function applySegmentFatigueToEvents(input: {
  readonly events: readonly MatchEvent[];
  readonly stateBeforeSegment: FullMatchSegmentState;
  readonly stateAfterSegment: FullMatchSegmentState;
}): readonly MatchEvent[] {
  const denominator = Math.max(1, input.events.length - 1);

  return input.events.map((event, index) => {
    const beforeTeamState = input.stateBeforeSegment.home.teamId === event.teamId
      ? input.stateBeforeSegment.home
      : input.stateBeforeSegment.away;
    const afterTeamState = input.stateAfterSegment.home.teamId === event.teamId
      ? input.stateAfterSegment.home
      : input.stateAfterSegment.away;
    const ratio = index / denominator;
    const teamCondition = clampRating(beforeTeamState.condition + (afterTeamState.condition - beforeTeamState.condition) * ratio);
    const mentalFreshness = clampRating(
      beforeTeamState.mentalFreshness + (afterTeamState.mentalFreshness - beforeTeamState.mentalFreshness) * ratio,
    );
    const pressureLoad = clampRating(beforeTeamState.pressureLoad + (afterTeamState.pressureLoad - beforeTeamState.pressureLoad) * ratio);

    return {
      ...event,
      fatigueContext: {
        ...event.fatigueContext,
        teamCondition,
        primaryPlayerCondition: teamCondition,
        primaryPlayerMentalFreshness: mentalFreshness,
        fatiguePressure: Math.max(event.fatigueContext.fatiguePressure ?? 0, pressureLoad),
      },
    };
  });
}
