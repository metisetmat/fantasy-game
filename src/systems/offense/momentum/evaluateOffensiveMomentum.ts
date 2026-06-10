import type { TeamId } from "../../../core/ids";
import { OffensiveMomentumLevel, type OffensiveMomentumState } from "./types";

function levelFromScore(score: number): OffensiveMomentumLevel {
  if (score >= 78) {
    return OffensiveMomentumLevel.Surging;
  }

  if (score >= 62) {
    return OffensiveMomentumLevel.High;
  }

  if (score >= 38) {
    return OffensiveMomentumLevel.Medium;
  }

  return OffensiveMomentumLevel.Low;
}

export function createInitialOffensiveMomentum(teamId: TeamId): OffensiveMomentumState {
  return {
    teamId,
    score: 34,
    level: OffensiveMomentumLevel.Low,
    reasons: ["initial attacking rhythm"],
  };
}

export function evaluateOffensiveMomentum(input: {
  readonly teamId: TeamId;
  readonly score: number;
  readonly reasons: readonly string[];
}): OffensiveMomentumState {
  const score = Math.max(0, Math.min(100, Math.round(input.score)));

  return {
    teamId: input.teamId,
    score,
    level: levelFromScore(score),
    reasons: input.reasons,
  };
}
