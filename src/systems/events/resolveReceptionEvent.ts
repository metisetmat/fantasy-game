import { PressureLevel } from "../../models/match";
import { SpatialMoveType } from "../spatial/intention";
import { ReceptionEventType, TacticalEventKind, type ResolveTacticalEventChainInput, type TacticalEvent } from "./types";
import { formatEventParticipant, formatEventRole } from "./formatting";

function receptionType(input: ResolveTacticalEventChainInput): ReceptionEventType {
  if (input.outcomeLabel.includes("TURNOVER") || input.outcomeLabel.includes("INTERCEPTION")) {
    return ReceptionEventType.Intercepted;
  }

  if (input.supportQuality < 38 || input.chaosLevel >= 78) {
    return ReceptionEventType.LooseReception;
  }

  if (input.pressureLevel === PressureLevel.High || input.supportQuality < 58) {
    return ReceptionEventType.ContestedReception;
  }

  return ReceptionEventType.CleanReception;
}

export function resolveReceptionEvent(input: ResolveTacticalEventChainInput): TacticalEvent {
  const receiver = input.actorModel?.receiverRole === undefined || input.actorModel.receiverRole === null
    ? formatEventRole(input.receiverRole)
    : formatEventParticipant({
        initials: input.actorModel.receiverInitials,
        role: input.actorModel.receiverRole,
      });

  if (input.moveType === SpatialMoveType.Finishing) {
    return {
      kind: TacticalEventKind.Reception,
      label: ReceptionEventType.CleanReception,
      description: `${receiver} gathers the release as the finishing window opens.`,
    };
  }

  const type = receptionType(input);
  const description =
    type === ReceptionEventType.CleanReception
      ? `${receiver} receives cleanly and can face forward.`
      : type === ReceptionEventType.ContestedReception
        ? `${receiver} receives under contact pressure.`
        : type === ReceptionEventType.LooseReception
          ? `${receiver} cannot fully secure the ball; it stays loose around the target zone.`
          : `${receiver} cannot secure the pass as the lane is attacked.`;

  return {
    kind: TacticalEventKind.Reception,
    label: type,
    description,
  };
}
