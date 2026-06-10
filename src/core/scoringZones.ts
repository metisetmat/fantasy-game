import { LateralCorridor, LongitudinalZone, type ZoneId } from "./zones";
import { AttackingDirection } from "../systems/spatial/intention/types";

export enum ScoringEndZone {
  LeftInGoal = "Z0",
  RightInGoal = "Z8",
}

export type ScoringZoneId = `${ScoringEndZone}-${LateralCorridor}`;

export function createScoringZoneId(
  scoringZone: ScoringEndZone,
  lateralCorridor: LateralCorridor,
): ScoringZoneId {
  return `${scoringZone}-${lateralCorridor}`;
}

export function getGroundingZoneForDirection(input: {
  readonly attackingDirection: AttackingDirection;
  readonly sourceZone: ZoneId;
}): ScoringZoneId {
  const lateralCorridor = input.sourceZone.split("-")[1] as LateralCorridor;
  const scoringZone =
    input.attackingDirection === AttackingDirection.Z1ToZ7
      ? ScoringEndZone.RightInGoal
      : ScoringEndZone.LeftInGoal;

  return createScoringZoneId(scoringZone, lateralCorridor);
}

export function getImmediateScoringPressureZone(
  attackingDirection: AttackingDirection,
): LongitudinalZone {
  return attackingDirection === AttackingDirection.Z1ToZ7
    ? LongitudinalZone.OffensiveTryZone
    : LongitudinalZone.DefensiveTryZone;
}
