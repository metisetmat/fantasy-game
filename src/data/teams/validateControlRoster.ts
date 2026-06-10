import { PlayerRole } from "../../models/player";
import { CONTROL_RAW_VISIBLE_ATTRIBUTE_TOTAL, CONTROL_ROSTER } from "./controlRoster";

export interface ControlRosterValidationResult {
  readonly valid: boolean;
  readonly warnings: readonly string[];
}

export function validateControlRoster(): ControlRosterValidationResult {
  const warnings = [
    ...(CONTROL_ROSTER.length === 10 ? [] : [`CONTROL roster has ${CONTROL_ROSTER.length} players instead of 10`]),
    ...(CONTROL_ROSTER.filter((player) => player.role === PlayerRole.GoalkeeperFreeSafety && player.isGoalkeeper).length === 1
      ? []
      : ["CONTROL roster must have exactly one Goalkeeper / Free Safety"]),
    ...(CONTROL_RAW_VISIBLE_ATTRIBUTE_TOTAL === 6594
      ? []
      : [`CONTROL raw visible attribute total is ${CONTROL_RAW_VISIBLE_ATTRIBUTE_TOTAL}, expected 6594`]),
    ...CONTROL_ROSTER.flatMap((player) =>
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
