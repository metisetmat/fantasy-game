import { PlayerRole } from "../../../models/player";
import { SequenceInteractionKind } from "../../sequences";
import { directionShift, getLane, getNearbyLane, oppositeDirectionShift, shiftZone } from "../../../reports/visualization/positioning/applyRolePlacementRules";
import type { TeamSpatialLayoutInput, RoleZoneAssignment } from "../../../reports/visualization/positioning/types";
import { StructuralDistortionLevel, type StructuralDistortionEvaluation } from "./types";

function shouldDeform(level: StructuralDistortionLevel): boolean {
  return level === StructuralDistortionLevel.High || level === StructuralDistortionLevel.Critical;
}

export function applyStructuralDistortion(input: {
  readonly assignments: readonly RoleZoneAssignment[];
  readonly layoutInput: TeamSpatialLayoutInput;
  readonly distortion: StructuralDistortionEvaluation;
}): readonly RoleZoneAssignment[] {
  if (!shouldDeform(input.distortion.level)) {
    return input.assignments;
  }

  const lag = input.distortion.profile.transitionLag;
  const behind = oppositeDirectionShift(input.layoutInput.attackingDirection, Math.max(1, lag));
  const ahead = directionShift(input.layoutInput.attackingDirection, Math.max(1, lag));
  const ballLane = getLane(input.layoutInput.ballZone);

  return input.assignments.map((assignment): RoleZoneAssignment => {
    if (!input.layoutInput.isPossessionTeam) {
      if (assignment.role === PlayerRole.SpaceHunter || assignment.role === PlayerRole.PowerRunner) {
        return {
          ...assignment,
          zone: shiftZone(input.layoutInput.ballZone, behind, getNearbyLane(ballLane, assignment.role === PlayerRole.SpaceHunter ? 1 : -1)),
          state: input.distortion.level === StructuralDistortionLevel.Critical ? "eliminated" : "delayed",
        };
      }

      if (assignment.role === PlayerRole.LeftAnchor || assignment.role === PlayerRole.RightAnchor) {
        return {
          ...assignment,
          zone: shiftZone(input.layoutInput.ballZone, Math.round(behind / 2), getNearbyLane(ballLane, assignment.role === PlayerRole.LeftAnchor ? -1 : 1)),
          state: "recovering",
        };
      }

      if (
        input.layoutInput.interaction === SequenceInteractionKind.OffensiveTransition &&
        assignment.role === PlayerRole.ForwardLeader
      ) {
        return {
          ...assignment,
          zone: shiftZone(input.layoutInput.ballZone, behind, ballLane),
          state: "recovering",
        };
      }
    }

    if (input.layoutInput.isPossessionTeam) {
      if (assignment.role === PlayerRole.SpaceHunter) {
        return {
          ...assignment,
          zone: shiftZone(input.layoutInput.ballZone, ahead, getNearbyLane(ballLane, 2)),
          state: "target",
        };
      }

      if (assignment.role === PlayerRole.ForwardLeader || assignment.role === PlayerRole.PowerRunner) {
        return {
          ...assignment,
          zone: shiftZone(input.layoutInput.ballZone, ahead, getNearbyLane(ballLane, assignment.role === PlayerRole.ForwardLeader ? 0 : 1)),
          state: "normal",
        };
      }

      if (assignment.role === PlayerRole.FreeSafety || assignment.role === PlayerRole.MobileLock) {
        return {
          ...assignment,
          state: "covering",
        };
      }
    }

    return assignment;
  });
}
