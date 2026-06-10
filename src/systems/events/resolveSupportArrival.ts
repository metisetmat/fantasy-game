import { TacticalEventKind, SupportArrivalTiming, type ResolveTacticalEventChainInput, type TacticalEvent } from "./types";
import { formatEventRole } from "./formatting";

function timing(input: ResolveTacticalEventChainInput): SupportArrivalTiming {
  if (input.supportQuality >= 76) {
    return SupportArrivalTiming.Early;
  }

  if (input.supportQuality >= 55) {
    return SupportArrivalTiming.Connected;
  }

  if (input.supportQuality >= 35) {
    return SupportArrivalTiming.Late;
  }

  return SupportArrivalTiming.Absent;
}

export function resolveSupportArrival(input: ResolveTacticalEventChainInput): TacticalEvent {
  const support = formatEventRole(input.supportRole);
  const arrival = timing(input);
  const description =
    arrival === SupportArrivalTiming.Early
      ? `${support} arrives early and screens the nearest pressure lane.`
      : arrival === SupportArrivalTiming.Connected
        ? `${support} connects as third-man support around the receiver.`
        : arrival === SupportArrivalTiming.Late
          ? `${support} arrives late, leaving the receiver to absorb first contact.`
          : `No inside support arrives before the pressure collapses.`;

  return {
    kind: TacticalEventKind.SupportArrival,
    label: arrival,
    description,
  };
}
