import { LateralCorridor } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import { SequenceInteractionKind, SequenceLevel } from "../../../systems/sequences";
import { directionShift, getLane, getNearbyLane, oppositeDirectionShift, shiftZone } from "./applyRolePlacementRules";
import type { RoleZoneAssignment, TeamSpatialLayoutInput } from "./types";

function structuralState(input: {
  readonly role: PlayerRole;
  readonly after: boolean;
  readonly interaction: SequenceInteractionKind;
  readonly danger: SequenceLevel;
}): "normal" | "recovering" | "delayed" | "eliminated" | "covering" {
  if (!input.after) {
    return input.role === PlayerRole.MobileLock || input.role === PlayerRole.FreeSafety || input.role === PlayerRole.GoalkeeperFreeSafety ? "covering" : "normal";
  }

  if (input.interaction === SequenceInteractionKind.OffensiveTransition) {
    if (input.role === PlayerRole.PowerRunner || input.role === PlayerRole.SpaceHunter) {
      return "delayed";
    }

    if (input.role === PlayerRole.LeftAnchor || input.role === PlayerRole.RightAnchor || input.role === PlayerRole.LeftPiston || input.role === PlayerRole.RightPiston) {
      return "recovering";
    }
  }

  if (input.role === PlayerRole.MobileLock || input.role === PlayerRole.FreeSafety || input.role === PlayerRole.GoalkeeperFreeSafety) {
    return "covering";
  }

  return "normal";
}

export function applyDefensiveShapeRules(input: TeamSpatialLayoutInput): readonly RoleZoneAssignment[] {
  const ballZone = input.after && input.selectedTargetZone !== null ? input.selectedTargetZone : input.ballZone;
  const ballLane = getLane(ballZone);
  const goalSideOne = directionShift(input.attackingDirection, 1);
  const goalSideTwo = directionShift(input.attackingDirection, 2);
  const behindPress = oppositeDirectionShift(input.attackingDirection, 1);
  const isBlitz = input.team.tacticalStyle === TacticalStyle.Blitz;

  return input.team.players.map((player): RoleZoneAssignment => {
    const state = structuralState({
      role: player.role,
      after: input.after,
      interaction: input.interaction,
      danger: input.context.currentDanger,
    });

    if (state === "delayed") {
      return { role: player.role, zone: shiftZone(ballZone, behindPress, getNearbyLane(ballLane, player.role === PlayerRole.SpaceHunter ? 1 : -1)), state };
    }

    if (state === "recovering") {
      return { role: player.role, zone: shiftZone(ballZone, 0, getNearbyLane(ballLane, player.role === PlayerRole.LeftAnchor ? -1 : 1)), state };
    }

    switch (player.role) {
      case PlayerRole.MobileLock:
        return { role: player.role, zone: shiftZone(ballZone, goalSideOne, LateralCorridor.CentralAxis), state: "covering" };
      case PlayerRole.FreeSafety:
      case PlayerRole.GoalkeeperFreeSafety:
        return { role: player.role, zone: shiftZone(ballZone, goalSideTwo, LateralCorridor.CentralAxis), state: "covering" };
      case PlayerRole.LeftAnchor:
      case PlayerRole.LeftPiston:
        return { role: player.role, zone: shiftZone(ballZone, goalSideOne, LateralCorridor.LeftHalfSpace), state };
      case PlayerRole.RightAnchor:
      case PlayerRole.RightPiston:
        return { role: player.role, zone: shiftZone(ballZone, goalSideOne, LateralCorridor.RightHalfSpace), state };
      case PlayerRole.SpaceHunter:
        return { role: player.role, zone: shiftZone(ballZone, isBlitz ? 0 : goalSideOne, getNearbyLane(ballLane, 1)), state };
      case PlayerRole.PowerRunner:
        return { role: player.role, zone: shiftZone(ballZone, isBlitz ? 0 : goalSideOne, getNearbyLane(ballLane, -1)), state };
      case PlayerRole.ForwardLeader:
        return { role: player.role, zone: shiftZone(ballZone, 0, LateralCorridor.CentralAxis), state };
      case PlayerRole.TempoHalf:
      case PlayerRole.HookLink:
      case PlayerRole.Playmaker:
      case PlayerRole.Pivot:
        return { role: player.role, zone: shiftZone(ballZone, goalSideOne, getNearbyLane(ballLane, 0)), state };
    }
  });
}
