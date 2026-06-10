import { ChaosAdvantage } from "../chaos";
import type { DangerMetricsEvaluation } from "../danger";
import { FinishingDangerLevel, type FinishingTriggerEvaluation } from "../interactions/finishing";
import { SpatialMoveType } from "../spatial/intention";
import type { DefensiveParticipationEvaluation, OffensiveParticipationEvaluation } from "../structure";
import { evaluateNumericalPressure } from "../structure/numericalPressure";
import {
  TacticalPhaseState,
  type TacticalPhaseEvaluation,
} from "./types";

export function evaluateTransitionTacticalPhase(input: {
  readonly moveType: SpatialMoveType;
  readonly chaosAdvantage: ChaosAdvantage;
  readonly finishingTrigger: FinishingTriggerEvaluation | null;
  readonly weakSideExposure: number;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
  readonly offensiveParticipation: OffensiveParticipationEvaluation;
  readonly supportQuality: number;
  readonly cleanReception: boolean;
  readonly dangerMetrics?: DangerMetricsEvaluation;
}): TacticalPhaseEvaluation {
  if (
    input.finishingTrigger?.triggered === true &&
    input.finishingTrigger.scoringDanger === FinishingDangerLevel.High &&
    (input.dangerMetrics?.dangerPhaseAllowed ?? true)
  ) {
    return {
      phase: TacticalPhaseState.DangerPhase,
      reasons: [
        "valid scoring trigger reached",
        `scoring danger ${input.finishingTrigger.scoringDanger}`,
        "offensive urgency must resolve before sequence ends",
      ],
      effects: [
        "finishing is forced before stable circulation",
        "danger cannot close without a visible finishing or defensive outcome",
      ],
    };
  }

  const numericalPressure = evaluateNumericalPressure({
    offensiveParticipation: input.offensiveParticipation,
    defensiveParticipation: input.defensiveParticipation,
  });
  const lateDefenders =
    input.defensiveParticipation.delayedDefenders + input.defensiveParticipation.eliminatedDefenders;
  const lineBreakingMove =
    input.moveType === SpatialMoveType.DirectVerticalAttack ||
    input.moveType === SpatialMoveType.Progression;
  const chaoticAdvantage =
    lineBreakingMove &&
    input.cleanReception &&
    input.chaosAdvantage === ChaosAdvantage.AttackingAdvantage &&
    input.weakSideExposure >= 65 &&
    (lateDefenders >= 2 || numericalPressure.attackersNearBall >= numericalPressure.defendersGoalSide) &&
    (input.dangerMetrics === undefined ||
      input.dangerMetrics.hasRealNumericalAdvantage ||
      input.dangerMetrics.hasViableFinishing);

  if (chaoticAdvantage) {
    return {
      phase: TacticalPhaseState.ChaoticAttackingAdvantage,
      reasons: [
        "clean long-play reception",
        `${numericalPressure.attackersNearBall}v${numericalPressure.defendersGoalSide} attacking pressure`,
        "weak side exposed",
        `${lateDefenders} defenders delayed or eliminated`,
        "chaos favors attack",
        ...(input.dangerMetrics === undefined
          ? []
          : [`final danger ${input.dangerMetrics.finalDanger} / 100`]),
      ],
      effects: [
        "immediate clean turnover suppressed",
        "forced finishing probability increased",
        "defensive recovery difficulty increased",
        "attacking territorial advantage retained",
      ],
    };
  }

  if (
    input.chaosAdvantage === ChaosAdvantage.AttackingAdvantage &&
    input.dangerMetrics !== undefined &&
    input.dangerMetrics.warnings.length > 0
  ) {
    return {
      phase: TacticalPhaseState.FragileAttackingControl,
      reasons: [
        "chaos favors the attack but player-derived numbers do not create clean danger",
        ...input.dangerMetrics.warnings,
      ],
      effects: [
        "chaos remains disorder rather than automatic scoring danger",
        "finishing is not forced without lane access or numerical advantage",
      ],
    };
  }

  if (lateDefenders >= 2) {
    return {
      phase: TacticalPhaseState.DefensiveEmergency,
      reasons: [`${lateDefenders} defenders recovering or delayed`],
      effects: ["defensive recovery remains under stress"],
    };
  }

  return {
    phase: TacticalPhaseState.StructuredAttackingControl,
    reasons: ["attack keeps the next action available"],
    effects: ["possession may enter construction if scoring is not forced"],
  };
}
