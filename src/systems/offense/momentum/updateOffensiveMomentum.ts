import { evaluateOffensiveMomentum } from "./evaluateOffensiveMomentum";
import type { OffensiveMomentumState } from "./types";

export function updateOffensiveMomentum(input: {
  readonly current: OffensiveMomentumState;
  readonly delta: number;
  readonly reasons: readonly string[];
}): OffensiveMomentumState {
  return evaluateOffensiveMomentum({
    teamId: input.current.teamId,
    score: input.current.score + input.delta,
    reasons: input.reasons.length === 0 ? input.current.reasons : input.reasons,
  });
}
