import { PressureLevel } from "../../models/match";
import { ContactDominance, TacticalEventKind, type ResolveTacticalEventChainInput, type TacticalEvent } from "./types";
import { formatEventParticipant, formatEventRole } from "./formatting";

function contactDominance(input: ResolveTacticalEventChainInput): ContactDominance {
  if (input.outcomeLabel.includes("TURNOVER") || input.outcomeLabel.includes("INTERCEPTION")) {
    return ContactDominance.Losing;
  }

  if (input.supportQuality >= 68 && input.pressureLevel !== PressureLevel.High) {
    return ContactDominance.Dominant;
  }

  if (input.supportQuality < 42 || input.chaosLevel >= 76) {
    return ContactDominance.Losing;
  }

  return ContactDominance.Neutral;
}

export function resolveContactEvent(input: ResolveTacticalEventChainInput): TacticalEvent {
  const receiver = input.actorModel?.receiverRole === undefined || input.actorModel.receiverRole === null
    ? formatEventRole(input.receiverRole)
    : formatEventParticipant({
        initials: input.actorModel.receiverInitials,
        role: input.actorModel.receiverRole,
      });
  const defender = formatEventRole(input.defenderRole);
  const dominance = contactDominance(input);
  const description =
    dominance === ContactDominance.Dominant
      ? `${receiver} wins post-contact gain with support secured.`
      : dominance === ContactDominance.Neutral
        ? `${defender} meets the receiver and creates neutral contact.`
        : `${defender} drives the receiver backward before support can secure the ball.`;

  return {
    kind: TacticalEventKind.Contact,
    label: dominance,
    description,
  };
}
