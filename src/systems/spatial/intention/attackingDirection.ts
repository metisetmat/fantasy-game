import type { TeamId } from "../../../core/ids";
import { LongitudinalZone } from "../../../core/zones";
import { getLongitudinalIndex } from "../utils";
import { AttackingDirection, type TeamDirectionAssignment } from "./types";

export function assignMiniMatchAttackingDirections(input: {
  readonly teamAId: TeamId;
  readonly teamBId: TeamId;
}): readonly TeamDirectionAssignment[] {
  return [
    { teamId: input.teamAId, attackingDirection: AttackingDirection.Z1ToZ7 },
    { teamId: input.teamBId, attackingDirection: AttackingDirection.Z7ToZ1 },
  ];
}

export function getTeamAttackingDirection(
  teamId: TeamId,
  assignments: readonly TeamDirectionAssignment[],
): AttackingDirection {
  const assignment = assignments.find((item) => item.teamId === teamId);

  return assignment?.attackingDirection ?? AttackingDirection.Z1ToZ7;
}

export function getDirectionalStep(direction: AttackingDirection): number {
  return direction === AttackingDirection.Z1ToZ7 ? 1 : -1;
}

export function invertAttackingDirection(direction: AttackingDirection): AttackingDirection {
  return direction === AttackingDirection.Z1ToZ7
    ? AttackingDirection.Z7ToZ1
    : AttackingDirection.Z1ToZ7;
}

export function describeAttackingDirection(direction: AttackingDirection): string {
  return direction === AttackingDirection.Z1ToZ7 ? "Z1 to Z7" : "Z7 to Z1";
}

export function getDirectionalDistance(
  from: LongitudinalZone,
  to: LongitudinalZone,
  direction: AttackingDirection,
): number {
  const rawDistance = getLongitudinalIndex(to) - getLongitudinalIndex(from);

  return rawDistance * getDirectionalStep(direction);
}
