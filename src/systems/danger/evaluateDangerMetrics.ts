import { clampInteractionRating } from "../interactions/shared/ratings";
import { FinishingDangerLevel, type FinishingTriggerEvaluation } from "../interactions/finishing";
import type { PlayerDerivedNumericalPressure, PlayerMatchState } from "../players";
import { DangerMetricLevel, type DangerMetricsEvaluation } from "./types";

function levelFromRating(value: number): DangerMetricLevel {
  if (value >= 85) {
    return DangerMetricLevel.Critical;
  }

  if (value >= 67) {
    return DangerMetricLevel.High;
  }

  if (value >= 40) {
    return DangerMetricLevel.Medium;
  }

  return DangerMetricLevel.Low;
}

function averagePlayerCapability(players: readonly PlayerMatchState[]): number {
  const relevant = players.filter((player) => player.hasBall || player.isAvailableReceiver || player.isRelevantToBall);

  if (relevant.length === 0) {
    return 50;
  }

  const total = relevant.reduce((sum, player) => {
    const derived = player.derivedAttributes;
    const visible = player.visibleAttributes;
    const derivedScore =
      derived === undefined
        ? 0
        : derived.finishingComposure * 0.38 +
          derived.ballSecurity * 0.24 +
          derived.scrambleAbility * 0.18 +
          derived.supportTiming * 0.2;
    const visibleScore =
      visible === undefined
        ? 50
        : visible.composure * 0.32 +
          visible.handPlay * 0.22 +
          visible.footPlay * 0.2 +
          visible.ballCarrying * 0.16 +
          visible.vision * 0.1;

    return sum + (derived === undefined ? visibleScore : derivedScore);
  }, 0);

  return total / relevant.length;
}

function calculateNumericalAdvantage(input: PlayerDerivedNumericalPressure): {
  readonly score: number;
  readonly margin: number;
} {
  const margin = input.attackersNearBall.length - input.defendersGoalSide.length;
  const score = margin > 0 ? 55 + margin * 10 : margin === 0 ? 48 : 42 + margin * 8;

  return {
    score: clampInteractionRating(score),
    margin,
  };
}

export function evaluateDangerMetrics(input: {
  readonly chaosLevel: number;
  readonly territorialPressure: number;
  readonly structuralBreak: number;
  readonly laneAccess: number;
  readonly supportQuality: number;
  readonly goalkeeperExposure: number;
  readonly finishingTrigger: FinishingTriggerEvaluation | null;
  readonly attackingPlayers: readonly PlayerMatchState[];
  readonly playerDerivedNumericalPressure: PlayerDerivedNumericalPressure;
}): DangerMetricsEvaluation {
  const numerical = calculateNumericalAdvantage(input.playerDerivedNumericalPressure);
  const hasRealNumericalAdvantage = numerical.margin > 0;
  const hasLegalScoringOption =
    input.finishingTrigger?.triggered === true &&
    input.finishingTrigger.possibleScoringTypes.length > 0;
  const actorCapability = clampInteractionRating(averagePlayerCapability(input.attackingPlayers));
  const scoringDangerBonus =
    input.finishingTrigger?.scoringDanger === FinishingDangerLevel.High
      ? 14
      : input.finishingTrigger?.scoringDanger === FinishingDangerLevel.Medium
        ? 6
        : 0;
  const rawFinishingViability = hasLegalScoringOption
    ? clampInteractionRating(
        input.laneAccess * 0.24 +
          actorCapability * 0.22 +
          input.supportQuality * 0.18 +
          input.goalkeeperExposure * 0.14 +
          input.territorialPressure * 0.12 +
          numerical.score * 0.1 +
          scoringDangerBonus,
      )
    : 0;
  const finishingViability =
    numerical.margin < 0 && input.laneAccess < 74 && input.goalkeeperExposure < 62
      ? Math.min(rawFinishingViability, 58)
      : rawFinishingViability;
  const hasUsableScoringLane =
    input.laneAccess >= 62 &&
    (numerical.margin >= -1 || input.goalkeeperExposure >= 62 || finishingViability >= 67);
  const territorialLaneDanger =
    input.territorialPressure >= 70 && hasUsableScoringLane
      ? clampInteractionRating(input.territorialPressure * 0.55 + input.laneAccess * 0.45)
      : 0;
  const groundedThreat = Math.max(
    finishingViability,
    territorialLaneDanger,
    hasRealNumericalAdvantage ? numerical.score : 0,
  );
  const chaosContribution = groundedThreat >= 45 ? input.chaosLevel * 0.08 : 0;
  const finalDanger = clampInteractionRating(
    groundedThreat * 0.78 + input.structuralBreak * 0.14 + chaosContribution,
  );
  const dangerPhaseAllowed =
    finishingViability >= 67 ||
    territorialLaneDanger >= 70 ||
    (hasRealNumericalAdvantage && finalDanger >= 60);
  const conversionProbability = clampInteractionRating(
    finishingViability * 0.58 +
      actorCapability * 0.18 +
      input.goalkeeperExposure * 0.14 +
      Math.max(0, numerical.margin) * 4 -
      (numerical.margin < 0 ? Math.abs(numerical.margin) * 3 : 0),
  );
  const warnings =
    input.chaosLevel >= 67 && numerical.margin < 0 && finishingViability < 67
      ? ["Chaos exists, but no clean attacking advantage."]
      : [];
  const reasons = [
    `player-derived numbers: ${input.playerDerivedNumericalPressure.description}`,
    hasLegalScoringOption ? "legal scoring option exists" : "no legal scoring option currently forces finishing",
    hasUsableScoringLane ? "usable scoring lane present" : "scoring lane not clean enough",
    hasRealNumericalAdvantage ? "attacking numbers are real" : "attacking numbers do not beat defensive hold",
  ];

  return {
    chaosLevel: clampInteractionRating(input.chaosLevel),
    territorialPressure: clampInteractionRating(input.territorialPressure),
    structuralBreak: clampInteractionRating(input.structuralBreak),
    numericalAdvantage: numerical.score,
    laneAccess: clampInteractionRating(input.laneAccess),
    supportQuality: clampInteractionRating(input.supportQuality),
    goalkeeperExposure: clampInteractionRating(input.goalkeeperExposure),
    finishingViability,
    conversionProbability,
    finalDanger,
    finalDangerLevel: levelFromRating(finalDanger),
    attackingNumericalMargin: numerical.margin,
    hasRealNumericalAdvantage,
    hasUsableScoringLane,
    hasViableFinishing: finishingViability >= 67,
    dangerPhaseAllowed,
    reasons,
    warnings,
  };
}
