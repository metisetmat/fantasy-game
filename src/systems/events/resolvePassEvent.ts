import { PressureLevel } from "../../models/match";
import { SpatialMoveType } from "../spatial/intention";
import { BallMovementEventType, TacticalEventKind, type ResolveTacticalEventChainInput, type TacticalEvent } from "./types";
import { formatEventParticipant, formatEventRole } from "./formatting";

function movementType(input: ResolveTacticalEventChainInput): BallMovementEventType {
  if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
    return BallMovementEventType.LongPlay;
  }

  if (input.moveType === SpatialMoveType.WeakSideSwitch) {
    return BallMovementEventType.SwitchPlay;
  }

  if (input.moveType === SpatialMoveType.SafetyClearance) {
    return BallMovementEventType.Clearance;
  }

  if (input.moveType === SpatialMoveType.BackwardRecycle) {
    return BallMovementEventType.ShortPass;
  }

  if (input.pressureLevel === PressureLevel.High || input.targetSelection.reason.includes("diagonal")) {
    return BallMovementEventType.DiagonalPass;
  }

  return BallMovementEventType.ShortPass;
}

export function resolvePassEvent(input: ResolveTacticalEventChainInput): TacticalEvent {
  if (input.moveType === SpatialMoveType.Finishing) {
    const actor = formatEventRole(input.actorRole);
    const target = input.targetSelection.selectedLabel ?? input.targetSelection.selectedZone;

    return {
      kind: TacticalEventKind.BallMovement,
      label: "FINISHING_RELEASE",
      description: `${actor} sets the ball for ${target} from ${input.fromZone}.`,
    };
  }

  const type = movementType(input);
  const actor = input.actorModel === undefined
    ? formatEventRole(input.actorRole)
    : formatEventParticipant({
        initials: input.actorModel.primaryActorInitials,
        role: input.actorModel.primaryActorRole,
      });
  const receiver = input.actorModel === undefined
    ? formatEventRole(input.receiverRole)
    : input.actorModel.receiverRole === null
      ? "support outlet"
      : formatEventParticipant({
        initials: input.actorModel.receiverInitials,
        role: input.actorModel.receiverRole,
      });
  const target = input.targetSelection.selectedLabel ?? input.targetSelection.selectedZone;
  const description =
    type === BallMovementEventType.LongPlay
      ? `${actor} launches a line-breaking release toward ${receiver} in ${target}.`
      : type === BallMovementEventType.SwitchPlay
        ? `${actor} switches play toward ${receiver} in ${target}.`
        : type === BallMovementEventType.Clearance
          ? `${actor} clears toward ${target} to escape pressure.`
          : type === BallMovementEventType.DiagonalPass
            ? `${actor} releases a fast diagonal pass toward ${receiver} in ${target}.`
            : `${actor} plays a short support pass toward ${receiver} in ${target}.`;

  return {
    kind: TacticalEventKind.BallMovement,
    label: type,
    description,
  };
}
