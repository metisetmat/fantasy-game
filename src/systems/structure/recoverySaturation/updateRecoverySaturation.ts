import type { TeamId } from "../../../core/ids";
import { evaluateRecoverySaturation } from "./evaluateRecoverySaturation";
import type { RecoverySaturationState } from "./types";

export function updateRecoverySaturation(input: {
  readonly current: RecoverySaturationState;
  readonly delta: number;
  readonly reasons: readonly string[];
}): RecoverySaturationState {
  const nextScore = Math.max(0, Math.min(100, input.current.score + input.delta));
  const nextReasons =
    input.delta <= 0
      ? input.current.reasons.length === 0
        ? input.reasons
        : input.current.reasons.slice(-4)
      : [...input.current.reasons, ...input.reasons].slice(-4);

  return evaluateRecoverySaturation({
    teamId: input.current.teamId,
    score: nextScore,
    reasons: nextReasons,
  });
}

export function createInitialRecoverySaturation(teamId: TeamId): RecoverySaturationState {
  return evaluateRecoverySaturation({
    teamId,
    score: 0,
    reasons: [],
  });
}
