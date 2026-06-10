import { ChaosEventType, TacticalEventKind, type ResolveTacticalEventChainInput, type TacticalEvent } from "./types";
import { formatEventRole } from "./formatting";

export function resolveLooseBallEvent(input: ResolveTacticalEventChainInput): TacticalEvent | null {
  const turnoverLike =
    input.outcomeLabel.includes("TURNOVER") ||
    input.outcomeLabel.includes("COLLAPSE") ||
    input.outcomeLabel.includes("INTERCEPTION") ||
    input.outcomeLabel.includes("REBOUND") ||
    input.outcomeLabel.includes("SECOND");

  if (!turnoverLike && input.chaosLevel < 72) {
    return null;
  }

  const support = formatEventRole(input.supportRole);
  const type = input.outcomeLabel.includes("SECOND") ? ChaosEventType.SecondPhase : input.outcomeLabel.includes("REBOUND") ? ChaosEventType.LiveBall : ChaosEventType.LooseBall;

  return {
    kind: TacticalEventKind.LooseBall,
    label: type,
    description:
      type === ChaosEventType.SecondPhase
        ? `${support} reacts to the second phase as the ball remains playable.`
        : type === ChaosEventType.LiveBall
          ? `The ball spills live and creates a loose-ball contest.`
          : `The ball breaks loose under pressure and both teams contest the recovery.`,
  };
}
