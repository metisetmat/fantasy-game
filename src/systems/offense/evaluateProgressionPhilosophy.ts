import { PressureLevel } from "../../models/match";
import { OffensiveProgressionPhilosophy } from "../../models/tactics";
import { SpatialMoveType, ThreatLevel } from "../spatial/intention";
import { evaluateCollectiveProgression } from "./evaluateCollectiveProgression";
import { evaluateIndividualRupture } from "./rupture/evaluateIndividualRupture";
import { evaluateLongPlayProgression } from "./longPlay/evaluateLongPlay";
import {
  ProgressionMechanism,
  type OffensivePhilosophyEvaluation,
  type OffensivePhilosophyEvaluationInput,
} from "./types";

function getMechanism(input: OffensivePhilosophyEvaluationInput): ProgressionMechanism {
  const philosophy = input.offensivePhilosophy;

  if (philosophy === OffensiveProgressionPhilosophy.IndividualRupture) {
    return ProgressionMechanism.IndividualRupture;
  }

  if (philosophy === OffensiveProgressionPhilosophy.LongPlayLineBreaking) {
    return ProgressionMechanism.LineBreakingLongPlay;
  }

  if (philosophy === OffensiveProgressionPhilosophy.TerritorialSurvival) {
    return ProgressionMechanism.TerritorialSurvival;
  }

  return ProgressionMechanism.StructuredProgression;
}

function describeReasons(input: {
  readonly evaluationInput: OffensivePhilosophyEvaluationInput;
  readonly philosophy: OffensiveProgressionPhilosophy;
  readonly modifier: number;
}): readonly string[] {
  const reasons: string[] = [];
  const data = input.evaluationInput;

  if (input.philosophy === OffensiveProgressionPhilosophy.CollectiveStructuredProgression) {
    if (data.moveType === SpatialMoveType.Progression && data.forwardDistance === 1) {
      reasons.push("structured zone-by-zone progression");
    }
    if (data.moveType === SpatialMoveType.LateralCirculation && data.territorialPressure >= 70) {
      reasons.push("circulation loses value once pressure is established");
    }
  }

  if (input.philosophy === OffensiveProgressionPhilosophy.LongPlayLineBreaking) {
    if (data.forwardDistance >= 2) {
      reasons.push("line-breaking long play seeks fast territorial gain");
    }
    if (data.moveType === SpatialMoveType.LateralCirculation) {
      reasons.push("lateral delay conflicts with line-breaking identity");
    }
  }

  if (input.philosophy === OffensiveProgressionPhilosophy.IndividualRupture) {
    reasons.push("individual rupture seeks unstable defensive lanes");
  }

  if (input.philosophy === OffensiveProgressionPhilosophy.TerritorialSurvival) {
    reasons.push("territorial survival prioritizes field position and safety");
  }

  if (data.scoringThreat === ThreatLevel.High) {
    reasons.push("red-zone context increases conversion bias");
  }

  if (data.pressure === PressureLevel.High && data.supportScore < 60) {
    reasons.push("pressure and low support increase execution cost");
  }

  if (reasons.length === 0) {
    reasons.push(input.modifier >= 0 ? "matches offensive philosophy" : "does not match offensive philosophy");
  }

  return reasons;
}

export function evaluateProgressionPhilosophy(
  input: OffensivePhilosophyEvaluationInput,
): OffensivePhilosophyEvaluation {
  const philosophy = input.offensivePhilosophy;
  const mechanism = getMechanism(input);
  const modifier =
    philosophy === OffensiveProgressionPhilosophy.CollectiveStructuredProgression
      ? evaluateCollectiveProgression(input)
      : philosophy === OffensiveProgressionPhilosophy.LongPlayLineBreaking
        ? evaluateLongPlayProgression(input)
        : philosophy === OffensiveProgressionPhilosophy.IndividualRupture
          ? evaluateIndividualRupture(input).modifier
          : input.moveType === SpatialMoveType.BackwardRecycle || input.moveType === SpatialMoveType.SafetyClearance
            ? 18
            : input.moveType === SpatialMoveType.DirectVerticalAttack
              ? -22
              : input.moveType === SpatialMoveType.LateralCirculation
                ? 8
                : -4;

  return {
    philosophy,
    mechanism,
    modifier: Math.max(-28, Math.min(28, Math.round(modifier))),
    reasons: describeReasons({ evaluationInput: input, philosophy, modifier }),
  };
}
