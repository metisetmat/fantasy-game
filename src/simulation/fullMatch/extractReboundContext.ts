import type { MatchInput } from "../../contracts/engineToCoach";

function bounded(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function zoneDanger(targetZone: string | undefined): number {
  if (targetZone === undefined) {
    return 45;
  }

  if (targetZone.includes("Z5")) {
    return 72;
  }

  if (targetZone.includes("Z4")) {
    return 58;
  }

  if (targetZone.includes("Z3")) {
    return 44;
  }

  return 38;
}

function teamSupportScore(input: MatchInput, teamId: string): number {
  const team = input.homeTeam.teamId === teamId ? input.homeTeam : input.awayTeam;
  const averageCondition = team.roster.length === 0
    ? 65
    : team.roster.reduce((sum, player) => sum + player.currentCondition, 0) / team.roster.length;
  const averageMental = team.roster.length === 0
    ? 65
    : team.roster.reduce((sum, player) => sum + player.mentalFreshness, 0) / team.roster.length;

  return bounded(averageCondition * 0.45 + averageMental * 0.35 + 12);
}

export function extractReboundContext(input: {
  readonly matchInput: MatchInput;
  readonly shooterId?: string;
  readonly goalkeeperId?: string;
  readonly targetZone?: string;
}): {
  readonly attackingProximityScore: number;
  readonly defensiveRecoveryScore: number;
  readonly warnings: readonly string[];
} {
  const shooterTeam = input.matchInput.homeTeam.roster.some((player) => player.playerId === input.shooterId)
    ? input.matchInput.homeTeam.teamId
    : input.matchInput.awayTeam.roster.some((player) => player.playerId === input.shooterId)
      ? input.matchInput.awayTeam.teamId
      : input.matchInput.homeTeam.teamId;
  const goalkeeperTeam = input.matchInput.homeTeam.roster.some((player) => player.playerId === input.goalkeeperId)
    ? input.matchInput.homeTeam.teamId
    : input.matchInput.awayTeam.roster.some((player) => player.playerId === input.goalkeeperId)
      ? input.matchInput.awayTeam.teamId
      : input.matchInput.awayTeam.teamId;
  const danger = zoneDanger(input.targetZone);
  const attackingSupport = teamSupportScore(input.matchInput, shooterTeam);
  const defensiveSupport = teamSupportScore(input.matchInput, goalkeeperTeam);

  return {
    attackingProximityScore: bounded(danger * 0.6 + attackingSupport * 0.25 + 4),
    defensiveRecoveryScore: bounded(defensiveSupport * 0.55 + danger * 0.2 + 16),
    warnings: [
      "REBOUND_CONTEXT_SPATIAL_FALLBACK_USED",
      "REBOUND_CONTEXT_DOES_NOT_CREATE_OFFICIAL_POSSESSION",
      "REBOUND_CONTEXT_DOES_NOT_CREATE_OFFICIAL_SCORING_EVENT",
    ],
  };
}
