import { PlayerRole } from "../../models/player";
import { BLITZ_RAW_VISIBLE_ATTRIBUTE_TOTAL, BLITZ_ROSTER } from "./blitzRoster";

export interface BlitzRosterValidationResult {
  readonly valid: boolean;
  readonly warnings: readonly string[];
}

export function validateBlitzRoster(): BlitzRosterValidationResult {
  const warnings = [
    ...(BLITZ_ROSTER.length === 10 ? [] : [`BLITZ roster has ${BLITZ_ROSTER.length} players instead of 10`]),
    ...(BLITZ_ROSTER.filter((player) => player.role === PlayerRole.GoalkeeperFreeSafety && player.isGoalkeeper).length === 1
      ? []
      : ["BLITZ roster must have exactly one Goalkeeper / Free Safety"]),
    ...(BLITZ_RAW_VISIBLE_ATTRIBUTE_TOTAL === 6610
      ? []
      : [`BLITZ raw visible attribute total is ${BLITZ_RAW_VISIBLE_ATTRIBUTE_TOTAL}, expected 6610`]),
    ...BLITZ_ROSTER.flatMap((player) =>
      Object.entries(player.visibleAttributes).flatMap(([key, value]) =>
        value < 0 || value > 100 ? [`${player.initials} ${key} is outside 0-100`] : [],
      ),
    ),
  ];

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
