import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { SCORING_POINTS, ScoringType } from "../../../models/scoring";
import type { CompactnessEvaluation, DensityEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import type { BallContext } from "../../spatial/intention";
import { InteractionType } from "../types";
import { clampInteractionRating } from "../shared/ratings";
import { evaluateDefensiveProtection } from "./evaluateDefensiveProtection";
import { evaluateFinishingCapability } from "./evaluateFinishingCapability";
import { evaluateFinishingChoice } from "./evaluateFinishingChoice";
import { evaluateFinishingLegality } from "./evaluateFinishingLegality";
import { evaluateGoalkeeperResponse } from "./evaluateGoalkeeperResponse";
import { evaluateReboundRisk } from "./evaluateReboundRisk";
import { createFinishingLogs } from "./logging";
import { evaluateConversionQuality } from "../../finishing/conversion";
import {
  FinishingDangerLevel,
  FinishingDecision,
  FinishingOutcome,
  type FinishingInteractionEvent,
  type FinishingInteractionResult,
  type FinishingScoreUpdate,
} from "./types";

export interface ResolveFinishingInput {
  readonly tick: TacticalTick;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly dangerLevel: FinishingDangerLevel;
  readonly territorialPressure: number;
  readonly chaosLevel: number;
  readonly weakSide: WeakSideEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly density: DensityEvaluation;
  readonly ballContext: BallContext;
  readonly allowedScoringTypes?: readonly ScoringType[];
}

function chooseOutcome(input: {
  readonly scoringType: ScoringType;
  readonly finishingScore: number;
  readonly defensiveScore: number;
  readonly responseScore: number;
  readonly conversionQuality: number;
  readonly messyDanger: number;
  readonly styleVariance: number;
  readonly reboundLive: boolean;
}): FinishingOutcome {
  const conversionEdge = input.conversionQuality - input.defensiveScore;
  const margin = input.finishingScore - input.defensiveScore;

  if (conversionEdge >= 14 || margin >= 18) {
    if (input.scoringType === ScoringType.Try) {
      return FinishingOutcome.TryScored;
    }

    if (input.scoringType === ScoringType.Drop) {
      return FinishingOutcome.DropScored;
    }

    return FinishingOutcome.GoalScored;
  }

  if (input.messyDanger + input.styleVariance >= 78 && conversionEdge >= -4 && input.responseScore < 74) {
    return FinishingOutcome.ScrambleFinish;
  }

  if ((margin >= 4 || conversionEdge >= 4) && input.responseScore < 58) {
    return input.scoringType === ScoringType.Drop
      ? FinishingOutcome.DropScored
      : input.scoringType === ScoringType.Try
        ? FinishingOutcome.TryScored
        : FinishingOutcome.GoalScored;
  }

  if (input.messyDanger >= 64 && input.reboundLive) {
    return FinishingOutcome.SecondChance;
  }

  if (input.messyDanger + input.styleVariance >= 66) {
    return FinishingOutcome.SecondChance;
  }

  if (input.reboundLive) {
    return FinishingOutcome.LiveRebound;
  }

  if (input.responseScore >= 82) {
    return input.scoringType === ScoringType.Try ? FinishingOutcome.LastDefenderSave : FinishingOutcome.SavedAttempt;
  }

  if (input.responseScore >= 70) {
    return input.scoringType === ScoringType.Try ? FinishingOutcome.LastDefenderSave : FinishingOutcome.SavedAttempt;
  }

  if (input.defensiveScore >= input.finishingScore + 10) {
    return FinishingOutcome.BlockedAttempt;
  }

  if (input.defensiveScore >= input.finishingScore + 4) {
    return FinishingOutcome.EmergencyClearance;
  }

  return FinishingOutcome.MissedAttempt;
}

function createScoreUpdate(
  offensiveTeam: SpatialTeamContext,
  scoringType: ScoringType,
  outcome: FinishingOutcome,
): FinishingScoreUpdate | null {
  const scored =
    outcome === FinishingOutcome.GoalScored ||
    outcome === FinishingOutcome.TryScored ||
    outcome === FinishingOutcome.DropScored ||
    outcome === FinishingOutcome.ScrambleFinish;

  if (!scored) {
    return null;
  }

  return {
    scoringTeamId: offensiveTeam.teamId,
    scoringType,
    points: SCORING_POINTS[scoringType],
  };
}

function describeSummary(outcome: FinishingOutcome): string {
  switch (outcome) {
    case FinishingOutcome.GoalScored:
      return "Goal scored from the finishing phase.";
    case FinishingOutcome.TryScored:
      return "Try scored after exploiting the spatial advantage.";
    case FinishingOutcome.DropScored:
      return "Drop scored before the defensive block can close.";
    case FinishingOutcome.ScrambleFinish:
      return "Scramble finish converts messy danger before recovery can reset.";
    case FinishingOutcome.SavedAttempt:
      return "Goalkeeper saves the goal-frame attempt.";
    case FinishingOutcome.MissedAttempt:
      return "Attempt misses the target.";
    case FinishingOutcome.BlockedAttempt:
      return "Defensive protection blocks the attempt.";
    case FinishingOutcome.LiveRebound:
      return "Live rebound remains dangerous, pending future support.";
    case FinishingOutcome.SecondChance:
      return "Second-chance rebound keeps the scoring threat alive.";
    case FinishingOutcome.EmergencyClearance:
      return "Emergency clearance prevents the second action.";
    case FinishingOutcome.LastDefenderSave:
      return "Last defender save stops the finish at the edge of danger.";
    case FinishingOutcome.DefensiveRecovery:
      return "Defensive recovery ends the chance.";
  }
}

export function resolveFinishing(input: ResolveFinishingInput): FinishingInteractionResult {
  const choice = evaluateFinishingChoice({
    offensiveTeam: input.offensiveTeam,
    activeZone: input.activeZone,
    dangerLevel: input.dangerLevel,
    territorialPressure: input.territorialPressure,
    weakSide: input.weakSide,
    attackingDirection: input.ballContext.attackingDirection,
    ...(input.allowedScoringTypes === undefined ? {} : { allowedScoringTypes: input.allowedScoringTypes }),
  });
  const capability = evaluateFinishingCapability({
    offensiveTeam: input.offensiveTeam,
    choice,
  });
  const defensiveProtection = evaluateDefensiveProtection({
    defensiveTeam: input.defensiveTeam,
    defensiveCompactness: input.defensiveCompactness,
    density: input.density,
    activeZone: input.activeZone,
    weakSide: input.weakSide,
  });
  const goalkeeperResponse = evaluateGoalkeeperResponse({
    defensiveTeam: input.defensiveTeam,
    defensiveProtection,
  });
  const reboundRisk = evaluateReboundRisk({
    finishingCapability: capability,
    defensiveProtection,
    chaosLevel: input.chaosLevel,
  });
  const legality = evaluateFinishingLegality({
    decision: choice.decision,
    activeZone: input.activeZone,
    dangerLevel: input.dangerLevel,
    territorialPressure: input.territorialPressure,
    attackingDirection: input.ballContext.attackingDirection,
  });
  const finishingScore = clampInteractionRating(
    capability.finishingCapability * 0.55 +
      choice.choiceConfidence * 0.18 +
      input.territorialPressure * 0.17 +
      input.weakSide.exposure * 0.1,
  );
  const defensiveScore = clampInteractionRating(
    defensiveProtection.protectionQuality * 0.62 +
      goalkeeperResponse.responseQuality * 0.28 +
      (100 - input.weakSide.exposure) * 0.1,
  );
  const conversion = evaluateConversionQuality({
    offensiveTeam: input.offensiveTeam,
    defensiveTeam: input.defensiveTeam,
    choice,
    capability,
    dangerLevel: input.dangerLevel,
    territorialPressure: input.territorialPressure,
    chaosLevel: input.chaosLevel,
    weakSide: input.weakSide,
    defensiveScore,
    goalkeeperResponse: goalkeeperResponse.responseQuality,
  });
  const outcome = legality.legal
    ? chooseOutcome({
        scoringType: choice.scoringType,
        finishingScore,
        defensiveScore,
        responseScore: goalkeeperResponse.responseQuality,
        conversionQuality: conversion.quality.conversionQuality,
        messyDanger: conversion.quality.messyDanger,
        styleVariance: conversion.style.varianceModifier,
        reboundLive: reboundRisk.remainsLive,
      })
    : FinishingOutcome.DefensiveRecovery;
  const scoreUpdate = createScoreUpdate(input.offensiveTeam, choice.scoringType, outcome);
  const event: FinishingInteractionEvent = {
    tick: input.tick,
    type: InteractionType.Finishing,
    offensiveTeamId: input.offensiveTeam.teamId,
    defensiveTeamId: input.defensiveTeam.teamId,
    activeZone: input.activeZone,
    involvedRoles: [capability.actorRole, goalkeeperResponse.responderRole],
    decision: choice.decision,
    outcome,
    scoreUpdate,
    summary: describeSummary(outcome),
  };
  const resultWithoutLogs = {
    outcome,
    decision: choice.decision,
    scoringType: choice.scoringType,
    terminal: true as const,
    dangerLevel: input.dangerLevel,
    territorialPressure: clampInteractionRating(input.territorialPressure),
    finishingScore,
    defensiveScore,
    choice,
    capability,
    defensiveProtection,
    goalkeeperResponse,
    reboundRisk,
    finishingStyle: conversion.style,
    conversionContext: conversion.context,
    conversionQuality: conversion.quality,
    legality,
    scoreUpdate,
    event,
  };

  return {
    ...resultWithoutLogs,
    logs: createFinishingLogs({
      result: resultWithoutLogs,
      offensiveTeamName: input.offensiveTeam.teamName,
      defensiveTeamName: input.defensiveTeam.teamName,
      ballContext: input.ballContext,
      defensiveRecoverySaturation: input.defensiveTeam.recoverySaturation,
    }),
  };
}
