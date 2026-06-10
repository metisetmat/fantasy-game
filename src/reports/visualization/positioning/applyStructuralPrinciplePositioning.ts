import { LateralCorridor } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import { StructuralLawIntensity, type StructuralPrincipleLawProfile } from "../../../systems/principles";
import { directionShift, getLane, getNearbyLane, getOppositeLane, oppositeDirectionShift, shiftZone } from "./applyRolePlacementRules";
import type { RoleZoneAssignment, TeamSpatialLayoutInput } from "./types";

function high(value: StructuralLawIntensity): boolean {
  return value === StructuralLawIntensity.High;
}

export function applyStructuralPrinciplePositioning(input: {
  readonly assignments: readonly RoleZoneAssignment[];
  readonly layoutInput: TeamSpatialLayoutInput;
  readonly laws: StructuralPrincipleLawProfile;
}): readonly RoleZoneAssignment[] {
  const ballZone = input.layoutInput.after && input.layoutInput.selectedTargetZone !== null
    ? input.layoutInput.selectedTargetZone
    : input.layoutInput.ballZone;
  const ballLane = getLane(ballZone);
  const aheadOne = directionShift(input.layoutInput.attackingDirection, 1);
  const aheadTwo = directionShift(input.layoutInput.attackingDirection, 2);
  const behindOne = oppositeDirectionShift(input.layoutInput.attackingDirection, 1);
  const behindTwo = oppositeDirectionShift(input.layoutInput.attackingDirection, 2);

  return input.assignments.map((assignment): RoleZoneAssignment => {
    if (input.layoutInput.isPossessionTeam) {
      if (input.laws.restDefenseSlots >= 3 && assignment.role === PlayerRole.FreeSafety) {
        return { ...assignment, zone: shiftZone(ballZone, behindTwo, LateralCorridor.CentralAxis), state: "covering" };
      }

      if (input.laws.restDefenseSlots >= 2 && assignment.role === PlayerRole.MobileLock) {
        return { ...assignment, zone: shiftZone(ballZone, behindOne, LateralCorridor.CentralAxis), state: "covering" };
      }

      if (high(input.laws.supportTriangle) && assignment.role === PlayerRole.TempoHalf) {
        return { ...assignment, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, -1)) };
      }

      if (high(input.laws.supportTriangle) && assignment.role === PlayerRole.Playmaker) {
        return { ...assignment, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, 1)) };
      }

      if (high(input.laws.podSupport) && assignment.role === PlayerRole.ForwardLeader) {
        return { ...assignment, zone: shiftZone(ballZone, aheadOne, LateralCorridor.CentralAxis) };
      }

      if (input.laws.depthRunnerCount >= 2 && assignment.role === PlayerRole.SpaceHunter) {
        return { ...assignment, zone: shiftZone(ballZone, aheadTwo, getOppositeLane(ballLane)), state: "target" };
      }

      if (input.laws.depthRunnerCount >= 3 && assignment.role === PlayerRole.PowerRunner) {
        return { ...assignment, zone: shiftZone(ballZone, aheadTwo, getNearbyLane(ballLane, 1)) };
      }
    }

    if (!input.layoutInput.isPossessionTeam) {
      if (high(input.laws.coverShadow) && assignment.role === PlayerRole.ForwardLeader) {
        return { ...assignment, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, 0)), state: "covering" };
      }

      if (high(input.laws.pressingTrap) && assignment.role === PlayerRole.SpaceHunter) {
        return { ...assignment, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, 1)) };
      }

      if (high(input.laws.pressingTrap) && assignment.role === PlayerRole.PowerRunner) {
        return { ...assignment, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, -1)) };
      }

      if (input.laws.defensiveCorridorTarget <= 3 && assignment.role === PlayerRole.LeftAnchor) {
        return { ...assignment, zone: shiftZone(ballZone, aheadOne, getNearbyLane(ballLane, -1)) };
      }

      if (input.laws.defensiveCorridorTarget <= 3 && assignment.role === PlayerRole.RightAnchor) {
        return { ...assignment, zone: shiftZone(ballZone, aheadOne, getNearbyLane(ballLane, 1)) };
      }

      if (assignment.role === PlayerRole.FreeSafety) {
        return { ...assignment, zone: shiftZone(ballZone, aheadTwo, LateralCorridor.CentralAxis), state: "covering" };
      }
    }

    return assignment;
  });
}
