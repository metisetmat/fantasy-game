import { resolveContactEvent } from "./resolveContactEvent";
import { resolveInterceptionEvent } from "./resolveInterceptionEvent";
import { resolveLooseBallEvent } from "./resolveLooseBallEvent";
import { resolvePassEvent } from "./resolvePassEvent";
import { resolveReceptionEvent } from "./resolveReceptionEvent";
import { resolveSupportArrival } from "./resolveSupportArrival";
import type { ResolveTacticalEventChainInput, TacticalEventChain } from "./types";

export function resolveTacticalEventChain(input: ResolveTacticalEventChainInput): TacticalEventChain {
  const optionalEvents = [
    resolveInterceptionEvent(input),
    resolveLooseBallEvent(input),
  ];
  const events = [
    resolvePassEvent(input),
    resolveSupportArrival(input),
    resolveReceptionEvent(input),
    resolveContactEvent(input),
    ...optionalEvents.filter((event) => event !== null),
  ];

  return {
    events,
    summary: `${input.attackingTeamName} event chain: ${events.map((event) => event.label).join(" -> ")}`,
  };
}
