import { ScoringType } from "../../models/scoring";
import { resolveConversionAttempt, summarizeTryOpportunityGeneration } from "../../systems/actions";
import { createConversionGeometryForTry } from "../../systems/scoring";
import { TRY_TOUCHDOWN_POINT_VALUE } from "../../systems/scoring/tryTouchdownRules";
import type { CalibrationScenario } from "../../systems/simulation";
import type { TryTouchdownOutcome } from "../../systems/scoring/tryTouchdownTypes";
import type { MiniMatchScoringEvent, MiniMatchState, MiniMatchTryCandidate, MiniMatchTryEvent, MiniMatchTryEventType } from "./types";

type LiveTryOutcome = Exclude<TryTouchdownOutcome, "PENDING">;

function scoreDisplay(input: { readonly state: MiniMatchState; readonly teamA: number; readonly teamB: number }): string {
  return `${input.state.context.teamA.displayName} ${input.teamA} - ${input.teamB} ${input.state.context.teamB.displayName}`;
}

function distanceFromPoint(point: string): number {
  const match = /(\d+)m/.exec(point);
  const value = match?.[1];
  return value === undefined ? 22 : Number.parseInt(value, 10);
}

function tryEventType(outcome: MiniMatchTryEvent["outcome"]): MiniMatchTryEventType {
  switch (outcome) {
    case "TRY_SCORED":
      return "TRY_TOUCHDOWN_SCORED";
    case "HELD_UP":
      return "TRY_HELD_UP";
    case "LOST_FORWARD":
      return "TRY_LOST_FORWARD";
    case "TACKLED_SHORT":
      return "TRY_TACKLED_SHORT";
    case "INVALID_GROUNDING":
      return "TRY_INVALID_GROUNDING";
    case "INVALID_ACCESS_ROUTE":
      return "TRY_INVALID_ACCESS_ROUTE";
    case "OUT_OF_PLAY":
      return "TRY_OUT_OF_PLAY";
  }
}

function isLiveTryOutcome(outcome: LiveTryOutcome | "NO_ATTEMPT"): outcome is LiveTryOutcome {
  return outcome !== "NO_ATTEMPT";
}

function liveCalibrationScenario(state: MiniMatchState): CalibrationScenario {
  return {
    seed: state.context.seed + 7,
    seedLabel: `live-mini-match-${state.context.seed}`,
    scenarioId: "live-mini-match-try-access",
    initialPossessionTeam: state.context.teamA.id,
    initialPossessionTeamName: state.context.teamA.displayName,
    initialBallZone: "Z6-HSL",
    attackingDirection: "LEFT_TO_RIGHT",
    controlStyleVariant: "CONTROL_PATIENT",
    blitzStyleVariant: "BLITZ_BALANCED",
    pressureProfile: "LOW",
    playerFormProfile: {
      controlModifier: -5,
      blitzModifier: 0,
      goalkeeperModifier: 0,
      blockModifier: 0,
    },
    fatigueProfile: "NORMAL",
    weatherOrSurfaceProfile: "NORMAL_SURFACE",
  };
}

function tryCandidateScore(input: {
  readonly legalAccessQuality: number;
  readonly groundingScore: number;
  readonly ballControlScore: number;
  readonly carrierMomentumScore: number;
  readonly supportArrivingScore: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
}): number {
  const positive =
    input.legalAccessQuality * 0.18 +
    input.groundingScore * 0.24 +
    input.ballControlScore * 0.2 +
    input.carrierMomentumScore * 0.12 +
    input.supportArrivingScore * 0.1;
  const pressure =
    input.contactPressure * 0.06 +
    input.tacklePressure * 0.05 +
    input.defenderGoalLinePressure * 0.04 +
    input.fatiguePenalty * 0.08;

  return Math.max(0, Math.min(100, Math.round(positive - pressure + 16)));
}

function competingCandidates(tryScore: number, outcome: LiveTryOutcome): readonly MiniMatchTryCandidate[] {
  const shotScore = Math.max(45, tryScore - 8);
  const carryScore = Math.max(44, tryScore - 5);
  const safeRecycleScore = Math.max(42, tryScore - 12);
  const tryReason =
    outcome === "TRY_SCORED"
      ? "Legal in-goal access and grounding quality make the try finish the selected action."
      : "Legal in-goal access makes the try attempt worth selecting, but execution can still fail under contact.";

  return [
    {
      actionType: "TRY_TOUCHDOWN_ATTEMPT",
      score: tryScore,
      status: "SELECTED",
      reason: tryReason,
    },
    {
      actionType: "SHOT",
      score: shotScore,
      status: "REJECTED",
      reason: "Shot candidate is rejected because legal in-goal access offers a higher-value try attempt window.",
    },
    {
      actionType: "CARRY_OR_HOLD",
      score: carryScore,
      status: "REJECTED",
      reason: "Carry/hold keeps control but does not attack the available in-goal grounding lane.",
    },
    {
      actionType: "SAFE_RECYCLE",
      score: safeRecycleScore,
      status: "REJECTED",
      reason: "Safe recycle preserves possession but sacrifices the immediate legal try opportunity.",
    },
  ];
}

function createLiveTryEvents(state: MiniMatchState): readonly MiniMatchTryEvent[] {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: 1,
    samples: [
      {
        matchId: "live-mini-match",
        seed: `live-${state.context.seed}`,
        scenario: liveCalibrationScenario(state),
        totalShots: state.finishingOpportunities.teamA + state.finishingOpportunities.teamB,
        reboundEventCount: state.secondChanceCount.teamA + state.secondChanceCount.teamB,
        contestedReboundCount: 0,
        scrambleReboundCount: 0,
      },
    ],
  });
  const sequenceNumber = state.records.length;

  return summary.opportunities
    .filter((opportunity): opportunity is typeof opportunity & { readonly outcome: LiveTryOutcome } => opportunity.attemptGenerated && isLiveTryOutcome(opportunity.outcome))
    .slice(0, 1)
    .map((opportunity, index) => {
      const actionId = `live-try-s${sequenceNumber}-a${index + 1}`;
      const scoreBefore = scoreDisplay({ state, teamA: state.score.teamA, teamB: state.score.teamB });
      const teamAScoreAfter =
        opportunity.outcome === "TRY_SCORED" && opportunity.teamId === state.context.teamA.id
          ? state.score.teamA + TRY_TOUCHDOWN_POINT_VALUE
          : state.score.teamA;
      const teamBScoreAfter =
        opportunity.outcome === "TRY_SCORED" && opportunity.teamId === state.context.teamB.id
          ? state.score.teamB + TRY_TOUCHDOWN_POINT_VALUE
          : state.score.teamB;
      const scoreAfter = scoreDisplay({ state, teamA: teamAScoreAfter, teamB: teamBScoreAfter });
      const conversionGeometry =
        opportunity.outcome === "TRY_SCORED"
          ? createConversionGeometryForTry(opportunity.groundingZone, {
              sourceMatchId: "live-mini-match",
              sourceActionId: actionId,
              scoringTeamId: opportunity.teamId,
              scoringTeamName: opportunity.teamName,
              groundingPlayerId: `${opportunity.teamId}-try-runner`,
              groundingRouteType: opportunity.accessRouteType,
              reason: `${opportunity.teamName} scored a live TRY_TOUCHDOWN; conversion geometry is stored for active conversion scoring.`,
            })
          : undefined;
      const candidateScore = tryCandidateScore({
        legalAccessQuality: opportunity.legalAccessQuality,
        groundingScore: opportunity.groundingScore,
        ballControlScore: opportunity.ballControlScore,
        carrierMomentumScore: opportunity.carrierMomentumScore,
        supportArrivingScore: opportunity.supportArrivingScore,
        contactPressure: opportunity.contactPressure,
        tacklePressure: opportunity.tacklePressure,
        defenderGoalLinePressure: opportunity.defenderGoalLinePressure,
        fatiguePenalty: opportunity.fatiguePenalty,
      });
      const candidates = competingCandidates(candidateScore, opportunity.outcome);

      return {
        sequenceNumber,
        actionId,
        eventType: tryEventType(opportunity.outcome),
        teamId: opportunity.teamId,
        teamName: opportunity.teamName,
        carrierId: `${opportunity.teamId}-try-runner`,
        carrierRole: opportunity.opportunityType.includes("REBOUND") ? "rebound carrier" : "wide carrier",
        previousZone: opportunity.previousZone,
        currentZone: opportunity.groundingZone,
        accessRoute: opportunity.accessRouteType,
        legalAccess: opportunity.legalAccessRoute,
        opportunityType: opportunity.opportunityType,
        candidateScore,
        selectedCandidateAction: "TRY_TOUCHDOWN_ATTEMPT",
        normalizedSelectedCandidateActionType: "TRY_TOUCHDOWN_ATTEMPT",
        candidateSelectionReason: candidates[0]?.reason ?? "Legal try candidate selected from ranked action candidates.",
        competingCandidates: candidates,
        targetInGoalZone: [opportunity.groundingZone],
        groundingLane: opportunity.groundingZone.split("-")[1] ?? "C",
        groundingPoint: `${opportunity.groundingZone} grounding mark`,
        ballControlScore: opportunity.ballControlScore,
        groundingScore: opportunity.groundingScore,
        bodyControlScore: opportunity.bodyControlScore,
        carrierMomentumScore: opportunity.carrierMomentumScore,
        supportArrivingScore: opportunity.supportArrivingScore,
        contactPressure: opportunity.contactPressure,
        tacklePressure: opportunity.tacklePressure,
        defenderGoalLinePressure: opportunity.defenderGoalLinePressure,
        fatiguePenalty: opportunity.fatiguePenalty,
        outcome: opportunity.outcome,
        scoringAction: opportunity.outcome === "TRY_SCORED" ? "TRY_TOUCHDOWN" : "NONE",
        pointValue: opportunity.outcome === "TRY_SCORED" ? TRY_TOUCHDOWN_POINT_VALUE : 0,
        scoringImpact:
          opportunity.outcome === "TRY_SCORED" ? `${opportunity.teamName} +${TRY_TOUCHDOWN_POINT_VALUE} points` : "none",
        scoreBefore,
        scoreAfter,
        conversionGeometryStored: conversionGeometry !== undefined,
        ...(conversionGeometry === undefined ? {} : { conversionGeometry }),
        conversionActive: true,
        reason: opportunity.reason,
      };
    });
}

function scoringEventsForLiveTries(state: MiniMatchState, liveTryEvents: readonly MiniMatchTryEvent[]): readonly MiniMatchScoringEvent[] {
  return liveTryEvents
    .filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED")
    .map((event) => ({
      sequenceNumber: event.sequenceNumber,
      teamId: event.teamId,
      teamName: event.teamName,
      scoringType: ScoringType.Try,
      points: event.pointValue,
    }));
}

function scoringEventsForLiveConversions(state: MiniMatchState, liveTryEvents: readonly MiniMatchTryEvent[]): readonly MiniMatchScoringEvent[] {
  const scoreAfterTries = addLiveTryPoints(state, scoringEventsForLiveTries(state, liveTryEvents));

  return liveTryEvents
    .filter((event): event is MiniMatchTryEvent & { readonly conversionGeometry: NonNullable<MiniMatchTryEvent["conversionGeometry"]> } =>
      event.eventType === "TRY_TOUCHDOWN_SCORED" && event.conversionGeometry !== undefined,
    )
    .map((event) => {
      const teamAAfterGoal =
        event.teamId === state.context.teamA.id ? scoreAfterTries.teamA + 2 : scoreAfterTries.teamA;
      const teamBAfterGoal =
        event.teamId === state.context.teamB.id ? scoreAfterTries.teamB + 2 : scoreAfterTries.teamB;
      const conversion = resolveConversionAttempt({
        sourceTryActionId: event.actionId,
        scoringTeamId: event.teamId,
        scoringTeamName: event.teamName,
        defendingTeamId: event.teamId === state.context.teamA.id ? state.context.teamB.id : state.context.teamA.id,
        kickerId: `${event.teamId}-conversion-kicker`,
        kickerRole: `${event.teamName} conversion kicker`,
        groundingZone: event.conversionGeometry.groundingZone,
        groundingLane: event.conversionGeometry.groundingLane,
        groundingPoint: event.conversionGeometry.groundingPoint,
        conversionLine: event.conversionGeometry.conversionLine,
        selectedConversionPoint: event.conversionGeometry.recommendedConversionPoint,
        distanceFromGoalLine: distanceFromPoint(event.conversionGeometry.recommendedConversionPoint),
        angleDifficulty: event.conversionGeometry.conversionAngleDifficulty,
        kickerAccuracy: event.teamId === state.context.teamA.id ? 78 : 74,
        kickerPower: event.teamId === state.context.teamA.id ? 75 : 77,
        kickerComposure: event.teamId === state.context.teamA.id ? 77 : 71,
        fatiguePenalty: Math.round(event.fatiguePenalty / 4),
        pressurePenalty: Math.round((event.contactPressure + event.tacklePressure) / 32),
        defenderChargePressure: Math.round(event.defenderGoalLinePressure * 0.45 + event.tacklePressure * 0.35 + event.contactPressure * 0.2),
        defendingTeamBehindGoalLine: event.conversionGeometry.defendingTeamBehindGoalLine,
        scoreBefore: event.scoreAfter,
        scoreAfterIfGoal: scoreDisplay({ state, teamA: teamAAfterGoal, teamB: teamBAfterGoal }),
        scoreAfterIfNoScore: event.scoreAfter,
      });

      return {
        sequenceNumber: event.sequenceNumber,
        teamId: event.teamId,
        teamName: event.teamName,
        scoringType: ScoringType.Conversion,
        points: conversion.pointValue,
      };
    })
    .filter((event) => event.points > 0);
}

function addLiveTryPoints(state: MiniMatchState, scoringEvents: readonly MiniMatchScoringEvent[]): MiniMatchState["score"] {
  return scoringEvents.reduce(
    (score, event) =>
      event.teamId === state.context.teamA.id
        ? { teamA: score.teamA + event.points, teamB: score.teamB }
        : { teamA: score.teamA, teamB: score.teamB + event.points },
    state.score,
  );
}

export function integrateLiveTryEvents(state: MiniMatchState): MiniMatchState {
  const liveTryEvents = createLiveTryEvents(state);
  const liveTryScoringEvents = scoringEventsForLiveTries(state, liveTryEvents);
  const liveConversionScoringEvents = scoringEventsForLiveConversions(state, liveTryEvents);

  return {
    ...state,
    score: addLiveTryPoints(
      {
        ...state,
        score: addLiveTryPoints(state, liveTryScoringEvents),
      },
      liveConversionScoringEvents,
    ),
    scoringEvents: [...state.scoringEvents, ...liveTryScoringEvents, ...liveConversionScoringEvents],
    liveTryEvents,
  };
}
