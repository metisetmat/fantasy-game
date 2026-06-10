import type { SpatialMoveType } from "../spatial/intention";
import type { DefensiveParticipationEvaluation } from "../structure";
import { ChaosAdvantage, type ChaosAdvantageEvaluation } from "./types";

export function evaluateChaosAdvantage(input: {
  readonly weakSideExposure: number;
  readonly transitionDanger: string;
  readonly moveType: SpatialMoveType;
  readonly supportQuality: number;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
  readonly projectionQuality: number;
}): ChaosAdvantageEvaluation {
  const lateDefenders = input.defensiveParticipation.delayedDefenders + input.defensiveParticipation.eliminatedDefenders;
  const attackingScore =
    (input.transitionDanger === "HIGH" ? 24 : input.transitionDanger === "MEDIUM" ? 10 : 0) +
    (input.weakSideExposure >= 65 ? 18 : 0) +
    (lateDefenders >= 3 ? 18 : lateDefenders * 4) +
    (input.projectionQuality >= 70 ? 12 : 0) +
    (input.moveType === "DIRECT_VERTICAL_ATTACK" || input.moveType === "PROGRESSION" ? 10 : 0);
  const defensiveScore =
    (input.supportQuality < 45 ? 18 : 0) +
    (input.defensiveParticipation.coveringDefenders >= 2 ? 14 : 0) +
    (input.moveType === "LATERAL_CIRCULATION" || input.moveType === "BACKWARD_RECYCLE" ? 10 : 0);
  const score = Math.max(0, Math.min(100, Math.round(50 + attackingScore - defensiveScore)));
  const advantage =
    score >= 62 ? ChaosAdvantage.AttackingAdvantage : score <= 42 ? ChaosAdvantage.DefensiveAdvantage : ChaosAdvantage.Neutral;

  return {
    advantage,
    score,
    reasons: [
      ...(input.transitionDanger === "HIGH" ? ["transition danger HIGH"] : []),
      ...(input.weakSideExposure >= 65 ? ["weak side exposed"] : []),
      ...(lateDefenders > 0 ? [`${lateDefenders} defenders late or eliminated`] : []),
      ...(input.supportQuality < 45 ? ["carrier support weak"] : []),
      ...(input.defensiveParticipation.coveringDefenders >= 2 ? ["covering defenders present"] : []),
    ],
  };
}
