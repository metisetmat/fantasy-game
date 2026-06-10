import type { PlayerMatchState } from "../players";

export interface StructureRationalityWarning {
  readonly code: string;
  readonly playerIds: readonly string[];
  readonly message: string;
  readonly suggestedAdjustment: string;
  readonly applied: boolean;
}

export interface StructureRationalityEvaluation {
  readonly teamId: string;
  readonly teamName: string;
  readonly score: number;
  readonly warnings: readonly StructureRationalityWarning[];
}

function zoneColumnIndex(zone: string): number {
  const match = /^Z([0-8])-/.exec(zone);
  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

function groupByZone(players: readonly PlayerMatchState[]): Map<string, PlayerMatchState[]> {
  const groups = new Map<string, PlayerMatchState[]>();

  for (const player of players) {
    const existing = groups.get(player.zone) ?? [];
    groups.set(player.zone, [...existing, player]);
  }

  return groups;
}

export function evaluateStructureRationality(input: {
  readonly teamId: string;
  readonly teamName: string;
  readonly players: readonly PlayerMatchState[];
  readonly style: "CONTROL" | "BLITZ";
}): StructureRationalityEvaluation {
  const warnings: StructureRationalityWarning[] = [];
  const teamPlayers = input.players.filter((player) => player.teamId === input.teamId);
  const goalkeeper = teamPlayers.find((player) => player.roleInitials === "GK");
  const maxGoalkeeperColumn = input.style === "CONTROL" ? 2 : 3;

  if (goalkeeper !== undefined && zoneColumnIndex(goalkeeper.zone) > maxGoalkeeperColumn) {
    warnings.push({
      code: "GOALKEEPER_TOO_HIGH",
      playerIds: [goalkeeper.playerId],
      message: `${input.teamName} GK is higher than the settled-possession guardrail at ${goalkeeper.zone}.`,
      suggestedAdjustment: input.style === "CONTROL" ? "Keep CONTROL GK around Z2-C or upper Z1-C." : "Allow BLITZ GK to sweep, but keep a frame recovery route.",
      applied: false,
    });
  }

  const grouped = groupByZone(teamPlayers);
  for (const [zone, occupants] of grouped.entries()) {
    if (occupants.length >= 3) {
      warnings.push({
        code: "SAME_ZONE_STACK",
        playerIds: occupants.map((player) => player.playerId),
        message: `${input.teamName} stacks ${occupants.map((player) => player.roleInitials).join(", ")} in ${zone}.`,
        suggestedAdjustment: "Separate one support player into the adjacent half-space to create a usable triangle.",
        applied: false,
      });
    }
  }

  const mobileLock = teamPlayers.find((player) => player.roleInitials === "ML");
  const pivot = teamPlayers.find((player) => player.roleInitials === "PV");
  if (mobileLock !== undefined && pivot !== undefined && mobileLock.zone === pivot.zone) {
    warnings.push({
      code: "REST_DEFENSE_DUPLICATION",
      playerIds: [mobileLock.playerId, pivot.playerId],
      message: `${input.teamName} ML and PV occupy the same functional support lane at ${mobileLock.zone}.`,
      suggestedAdjustment: "Use ML as a half-space recovery player and PV as the central rest-defense anchor.",
      applied: false,
    });
  }

  const occupiedCorridors = new Set(teamPlayers.map((player) => player.lane)).size;
  if (occupiedCorridors < 4) {
    warnings.push({
      code: "NARROW_CORRIDOR_OCCUPATION",
      playerIds: teamPlayers.map((player) => player.playerId),
      message: `${input.teamName} occupies only ${occupiedCorridors}/5 corridors.`,
      suggestedAdjustment: "Keep at least one piston or runner in the far-side corridor.",
      applied: false,
    });
  }

  return {
    teamId: input.teamId,
    teamName: input.teamName,
    score: Math.max(0, 100 - warnings.length * 14),
    warnings,
  };
}
