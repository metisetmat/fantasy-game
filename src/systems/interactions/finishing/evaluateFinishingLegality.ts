import { type LongitudinalZone, type ZoneId } from "../../../core/zones";
import { getGroundingZoneForDirection } from "../../../core/scoringZones";
import { ScoringType } from "../../../models/scoring";
import { AttackingDirection } from "../../spatial/intention";
import { getZoneParts } from "../../spatial/utils";
import { FinishingDangerLevel, FinishingDecision, type FinishingLegalityEvaluation } from "./types";

function getRelativeDepth(zone: LongitudinalZone, attackingDirection: AttackingDirection): number {
  const numericZone = Number(zone.slice(1));

  return attackingDirection === AttackingDirection.Z1ToZ7 ? numericZone : 8 - numericZone;
}

export function getRelativeFinishingDepth(
  activeZone: ZoneId,
  attackingDirection: AttackingDirection,
): number {
  return getRelativeDepth(getZoneParts(activeZone).longitudinalZone, attackingDirection);
}

export function evaluateFinishingLegality(input: {
  readonly decision: FinishingDecision;
  readonly activeZone: ZoneId;
  readonly dangerLevel: FinishingDangerLevel;
  readonly territorialPressure: number;
  readonly attackingDirection: AttackingDirection;
}): FinishingLegalityEvaluation {
  const relativeDepth = getRelativeFinishingDepth(input.activeZone, input.attackingDirection);

  if (input.decision === FinishingDecision.TryAttempt) {
    const legal = relativeDepth >= 7;
    const groundingZone = getGroundingZoneForDirection({
      attackingDirection: input.attackingDirection,
      sourceZone: input.activeZone,
    });

    return {
      legal,
      reason: legal
        ? `Try attempt is legal from ${input.activeZone} with projection into ${groundingZone}.`
        : `Try cannot be attempted from ${input.activeZone}.`,
    };
  }

  if (input.decision === FinishingDecision.GoalAttempt) {
    const legal =
      relativeDepth === 5 ||
      relativeDepth === 6 ||
      (relativeDepth === 4 &&
        input.dangerLevel === FinishingDangerLevel.High &&
        input.territorialPressure >= 75);

    return {
      legal,
      reason: legal
        ? "Goal attempt is supported by zone and pressure context."
        : `Goal attempt is not viable from ${input.activeZone}.`,
    };
  }

  const dropLegal = relativeDepth >= 4 && relativeDepth <= 7;

  return {
    legal: dropLegal,
    reason: dropLegal ? "Drop attempt is viable from this zone." : `Drop cannot be attempted from ${input.activeZone}.`,
  };
}

export function decisionForScoringType(scoringType: ScoringType): FinishingDecision | null {
  switch (scoringType) {
    case ScoringType.Try:
      return FinishingDecision.TryAttempt;
    case ScoringType.Goal:
      return FinishingDecision.GoalAttempt;
    case ScoringType.Drop:
      return FinishingDecision.DropAttempt;
    case ScoringType.Penalty:
    case ScoringType.Conversion:
      return null;
  }
}
