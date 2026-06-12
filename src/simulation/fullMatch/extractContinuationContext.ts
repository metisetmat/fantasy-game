import type { MatchInput } from "../../contracts/engineToCoach";

function bounded(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeTargetZone(targetZone: string | undefined): string {
  if (targetZone === undefined) {
    return "Z3-C";
  }

  if (targetZone.includes("HSR")) {
    return "Z3-HSR";
  }

  if (targetZone.includes("HSL")) {
    return "Z3-HSL";
  }

  return "Z3-C";
}

function fallbackGoalkeeperTeamActor(input: MatchInput, goalkeeperId: string | undefined): string | undefined {
  if (goalkeeperId !== undefined) {
    return goalkeeperId;
  }

  return input.awayTeam.goalkeeperId ?? input.awayTeam.roster[0]?.playerId;
}

export function extractContinuationContext(input: {
  readonly matchInput: MatchInput;
  readonly shooterId?: string;
  readonly goalkeeperId?: string;
  readonly targetZone?: string;
  readonly recoveryTeamCandidate?: string;
}): {
  readonly continuationActorCandidate?: string;
  readonly continuationTargetZoneCandidate?: string;
  readonly pressureAfterRebound: number;
  readonly transitionRisk: number;
  readonly possessionSecurityScore: number;
  readonly warnings: readonly string[];
} {
  const goalkeeperTeamRecovery = input.recoveryTeamCandidate === "goalkeeper_team";
  const attackingRecovery = input.recoveryTeamCandidate === "attacking_team";
  const actor = goalkeeperTeamRecovery
    ? fallbackGoalkeeperTeamActor(input.matchInput, input.goalkeeperId)
    : attackingRecovery
      ? input.shooterId
      : undefined;
  const targetZone = goalkeeperTeamRecovery ? safeTargetZone(input.targetZone) : input.targetZone;

  return {
    ...(actor === undefined ? {} : { continuationActorCandidate: actor }),
    ...(targetZone === undefined ? {} : { continuationTargetZoneCandidate: targetZone }),
    pressureAfterRebound: bounded(goalkeeperTeamRecovery ? 24 : attackingRecovery ? 72 : 54),
    transitionRisk: bounded(goalkeeperTeamRecovery ? 18 : attackingRecovery ? 68 : 52),
    possessionSecurityScore: bounded(goalkeeperTeamRecovery ? 82 : attackingRecovery ? 42 : 50),
    warnings: [
      "CONTINUATION_CONTEXT_SPATIAL_FALLBACK_USED",
      "CONTINUATION_CONTEXT_DOES_NOT_CREATE_OFFICIAL_POSSESSION",
      "CONTINUATION_CONTEXT_DOES_NOT_CREATE_OFFICIAL_MATCH_EVENT",
      "CONTINUATION_CONTEXT_DOES_NOT_CREATE_OFFICIAL_SCORING_EVENT",
    ],
  };
}
