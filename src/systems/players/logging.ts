import { createLogLine, type TacticalLogLine } from "../interactions/shared";
import type { PlayerDerivedNumericalPressure, PlayerMatchState } from "./types";

function formatPlayers(players: readonly PlayerMatchState[]): string {
  if (players.length === 0) {
    return "none";
  }

  return players.map((player) => `${player.roleInitials}@${player.zone}`).join(", ");
}

export function createPlayerDerivedNumericalPressureLogs(input: {
  readonly numerical: PlayerDerivedNumericalPressure;
  readonly attackingTeamName: string;
  readonly defendingTeamName: string;
}): readonly TacticalLogLine[] {
  return [
    createLogLine("[CALCULATED FROM PLAYERS] Numerical pressure:"),
    createLogLine(
      `- ${input.attackingTeamName} attackers near ball: ${input.numerical.attackersNearBall.length} (${formatPlayers(input.numerical.attackersNearBall)})`,
    ),
    createLogLine(
      `- ${input.defendingTeamName} defenders goal-side: ${input.numerical.defendersGoalSide.length} (${formatPlayers(input.numerical.defendersGoalSide)})`,
    ),
    createLogLine(`- result: ${input.attackingTeamName} ${input.numerical.description}`),
  ];
}

export function createPlayerDerivedDefensiveTraceLogs(input: {
  readonly numerical: PlayerDerivedNumericalPressure;
  readonly defendingTeamName: string;
  readonly reason: string;
}): readonly TacticalLogLine[] {
  return [
    createLogLine("[CALCULATED FROM PLAYERS] Delayed defenders:"),
    createLogLine(
      `- ${input.defendingTeamName} delayed/eliminated defenders: ${input.numerical.delayedDefenders.length} (${formatPlayers(input.numerical.delayedDefenders)})`,
    ),
    createLogLine(`- reason: ${input.reason}`),
    createLogLine("[CALCULATED FROM PLAYERS] Line bypassed:"),
    createLogLine(`- ${input.defendingTeamName} bypassed line: ${formatPlayers(input.numerical.bypassedDefenders)}`),
    createLogLine(`- ${input.defendingTeamName} remaining last-line cover: ${formatPlayers(input.numerical.defendersGoalSide)}`),
  ];
}

export function createPlayerDerivedSupportLogs(input: {
  readonly numerical: PlayerDerivedNumericalPressure;
  readonly attackingTeamName: string;
}): readonly TacticalLogLine[] {
  return [
    createLogLine("[CALCULATED FROM PLAYERS] Support:"),
    ...input.numerical.supportPlayers.slice(0, 4).map((player) =>
      createLogLine(`- ${input.attackingTeamName} ${player.roleInitials} ${player.supportStatus} from ${player.zone}`),
    ),
    createLogLine(
      `- ${input.attackingTeamName} support status: ${input.numerical.supportPlayers.length >= 2 ? "SUPPORT_CONNECTED" : "SUPPORT_LATE"}`,
    ),
  ];
}
