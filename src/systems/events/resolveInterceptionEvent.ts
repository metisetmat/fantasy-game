import { TacticalEventKind, type ResolveTacticalEventChainInput, type TacticalEvent } from "./types";
import { formatEventParticipant, formatEventRole } from "./formatting";

export function resolveInterceptionEvent(input: ResolveTacticalEventChainInput): TacticalEvent | null {
  if (!input.outcomeLabel.includes("TURNOVER") && !input.outcomeLabel.includes("INTERCEPTION")) {
    return null;
  }

  const defender = formatEventRole(input.defenderRole);
  const receiver = input.actorModel?.receiverRole === undefined || input.actorModel.receiverRole === null
    ? formatEventRole(input.receiverRole)
    : formatEventParticipant({
        initials: input.actorModel.receiverInitials,
        role: input.actorModel.receiverRole,
      });

  return {
    kind: TacticalEventKind.Interception,
    label: "PRESSURE_RECOVERY",
    description: `${input.defendingTeamName} ${defender} attacks the passing lane before ${receiver} can secure the ball and recovers near ${input.targetSelection.selectedZone}.`,
  };
}
