import { LateralCorridor, type ZoneId } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import { getZoneParts } from "../../../systems/spatial/utils";
import { directionShift, getLane, getNearbyLane, getOppositeLane, getRolePriorityLane, oppositeDirectionShift, shiftZone } from "./applyRolePlacementRules";
import type { RoleZoneAssignment, TeamSpatialLayoutInput } from "./types";

export function applyAttackingShapeRules(input: TeamSpatialLayoutInput): readonly RoleZoneAssignment[] {
  const ballLane = getLane(input.ballZone);
  const style = input.team.tacticalStyle;
  const targetZone = input.after && input.selectedTargetZone !== null ? input.selectedTargetZone : input.ballZone;
  const ballZone = input.after ? targetZone : input.ballZone;
  const aheadOne = directionShift(input.attackingDirection, 1);
  const aheadTwo = directionShift(input.attackingDirection, style === TacticalStyle.Blitz ? 2 : 1);
  const behindOne = oppositeDirectionShift(input.attackingDirection, 1);
  const behindTwo = oppositeDirectionShift(input.attackingDirection, 2);

  return input.team.players.map((player): RoleZoneAssignment => {
    if (player.role === input.ballCarrierRole) {
      return {
        role: player.role,
        zone: ballZone,
        state: "target",
      };
    }

    if (style === TacticalStyle.Control) {
      switch (player.role) {
        case PlayerRole.FreeSafety:
        case PlayerRole.GoalkeeperFreeSafety:
          return { role: player.role, zone: shiftZone(ballZone, behindTwo, LateralCorridor.CentralAxis), state: "normal" };
        case PlayerRole.LeftAnchor:
        case PlayerRole.LeftPiston:
          return { role: player.role, zone: shiftZone(ballZone, behindOne, LateralCorridor.LeftCorridor), state: "normal" };
        case PlayerRole.RightAnchor:
        case PlayerRole.RightPiston:
          return { role: player.role, zone: shiftZone(ballZone, behindOne, LateralCorridor.RightCorridor), state: "normal" };
        case PlayerRole.TempoHalf:
          return { role: player.role, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, -1)), state: "normal" };
        case PlayerRole.HookLink:
          return { role: player.role, zone: shiftZone(ballZone, behindOne, ballLane), state: "normal" };
        case PlayerRole.Playmaker:
          return { role: player.role, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, 1)), state: "normal" };
        case PlayerRole.ForwardLeader:
          return { role: player.role, zone: shiftZone(ballZone, aheadOne, LateralCorridor.CentralAxis), state: "normal" };
        case PlayerRole.PowerRunner:
        case PlayerRole.Pivot:
          return { role: player.role, zone: shiftZone(ballZone, 0, LateralCorridor.CentralAxis), state: "normal" };
        case PlayerRole.SpaceHunter:
          return { role: player.role, zone: shiftZone(ballZone, aheadOne, getOppositeLane(ballLane)), state: "normal" };
        case PlayerRole.MobileLock:
          return { role: player.role, zone: shiftZone(ballZone, behindOne, LateralCorridor.CentralAxis), state: "covering" };
      }
    }

    switch (player.role) {
      case PlayerRole.FreeSafety:
      case PlayerRole.GoalkeeperFreeSafety:
        return { role: player.role, zone: shiftZone(ballZone, behindTwo, LateralCorridor.CentralAxis), state: "normal" };
      case PlayerRole.LeftAnchor:
      case PlayerRole.LeftPiston:
        return { role: player.role, zone: shiftZone(ballZone, behindOne, LateralCorridor.LeftCorridor), state: "normal" };
      case PlayerRole.RightAnchor:
      case PlayerRole.RightPiston:
        return { role: player.role, zone: shiftZone(ballZone, behindOne, LateralCorridor.RightCorridor), state: "normal" };
      case PlayerRole.SpaceHunter:
        return { role: player.role, zone: shiftZone(ballZone, aheadTwo, getRolePriorityLane(player.role, ballLane, style)), state: "normal" };
      case PlayerRole.ForwardLeader:
        return { role: player.role, zone: shiftZone(ballZone, aheadOne, LateralCorridor.CentralAxis), state: "normal" };
      case PlayerRole.PowerRunner:
      case PlayerRole.Pivot:
        return { role: player.role, zone: shiftZone(ballZone, aheadOne, getNearbyLane(ballLane, 1)), state: "normal" };
      case PlayerRole.Playmaker:
        return { role: player.role, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, -1)), state: "normal" };
      case PlayerRole.TempoHalf:
      case PlayerRole.HookLink:
        return { role: player.role, zone: shiftZone(ballZone, behindOne, getZoneParts(ballZone).lateralCorridor), state: "normal" };
      case PlayerRole.MobileLock:
        return { role: player.role, zone: shiftZone(ballZone, 0, LateralCorridor.CentralAxis), state: "covering" };
    }
  });
}
