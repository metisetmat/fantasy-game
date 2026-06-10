import type { TeamId } from "../../../core/ids";
import { RecoverySaturationLevel, type RecoverySaturationState } from "./types";

export function getRecoverySaturationLevel(score: number): RecoverySaturationLevel {
  if (score >= 78) {
    return RecoverySaturationLevel.Critical;
  }

  if (score >= 56) {
    return RecoverySaturationLevel.High;
  }

  if (score >= 30) {
    return RecoverySaturationLevel.Medium;
  }

  return RecoverySaturationLevel.Low;
}

export function evaluateRecoverySaturation(input: {
  readonly teamId: TeamId;
  readonly score: number;
  readonly reasons?: readonly string[];
}): RecoverySaturationState {
  const score = Math.max(0, Math.min(100, Math.round(input.score)));

  return {
    teamId: input.teamId,
    score,
    level: getRecoverySaturationLevel(score),
    reasons: input.reasons ?? [],
  };
}
