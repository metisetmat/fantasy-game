import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";

export interface FunctionalOccupationContext {
  readonly players: readonly PlayerMatchState[];
  readonly possessionTeamId: TeamId;
  readonly ballCarrierId: string | null;
  readonly ballZone: ZoneId;
  readonly attackingDirection: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT";
  readonly phaseState: string;
  readonly teamStyles: Readonly<Record<string, "CONTROL" | "BLITZ">>;
}

export function zoneColumn(zone: string): number {
  const match = /^Z([0-8])-/.exec(zone);
  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

export function isAheadOfBall(input: {
  readonly playerZone: string;
  readonly ballZone: string;
  readonly attackingDirection: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT";
}): boolean {
  const playerColumn = zoneColumn(input.playerZone);
  const ballColumn = zoneColumn(input.ballZone);

  return input.attackingDirection === "LEFT_TO_RIGHT" ? playerColumn > ballColumn : playerColumn < ballColumn;
}

export function isBehindBall(input: {
  readonly playerZone: string;
  readonly ballZone: string;
  readonly attackingDirection: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT";
}): boolean {
  const playerColumn = zoneColumn(input.playerZone);
  const ballColumn = zoneColumn(input.ballZone);

  return input.attackingDirection === "LEFT_TO_RIGHT" ? playerColumn < ballColumn : playerColumn > ballColumn;
}
